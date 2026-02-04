// Organization Detail Page JavaScript
const API_BASE = '/api';

// Get organization identifier from URL
function getOrgIdentifier() {
    const path = window.location.pathname;
    const match = path.match(/\/app\/organization\/(.+)/);
    if (match) {
        // Check if it's permalink-id format or just id
        const identifier = match[1];
        const idMatch = identifier.match(/-(\d+)$/);
        if (idMatch) {
            return { type: 'id', value: idMatch[1] };
        }
        // Try parsing as pure number
        if (/^\d+$/.test(identifier)) {
            return { type: 'id', value: identifier };
        }
        // Otherwise treat as permalink
        return { type: 'permalink', value: identifier };
    }
    return null;
}

// Fetch organization data
async function fetchOrganization() {
    const identifier = getOrgIdentifier();
    if (!identifier) {
        showError();
        return;
    }

    try {
        let url;
        if (identifier.type === 'id') {
            url = `${API_BASE}/organizations/${identifier.value}`;
        } else {
            url = `${API_BASE}/organizations/by-permalink/${identifier.value}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Not found');
        }

        const data = await response.json();
        renderOrganization(data);
    } catch (error) {
        console.error('Error fetching organization:', error);
        showError();
    }
}

// Show error state
function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'flex';
}

// Render organization data
function renderOrganization(org) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('contentState').style.display = 'block';

    // Update page title and breadcrumb
    document.title = `${org.displayName} - Crunchbase Explorer`;
    document.getElementById('breadcrumbName').textContent = org.displayName;

    // Avatar/Logo
    if (org.imageUrl) {
        document.getElementById('orgLogo').src = org.imageUrl;
        document.getElementById('orgLogo').style.display = 'block';
        document.getElementById('orgInitial').style.display = 'none';
    } else {
        document.getElementById('orgInitial').textContent = org.displayName.charAt(0).toUpperCase();
    }

    // Badges
    if (org.companyType) {
        document.getElementById('companyType').textContent = org.companyType;
        document.getElementById('companyType').style.display = 'inline-flex';
    } else {
        document.getElementById('companyType').style.display = 'none';
    }

    if (org.operatingStatus) {
        const statusEl = document.getElementById('operatingStatus');
        statusEl.textContent = org.operatingStatus;
        statusEl.style.display = 'inline-flex';
        if (org.operatingStatus.toLowerCase() === 'closed') {
            statusEl.style.background = 'rgba(239, 68, 68, 0.2)';
            statusEl.style.color = '#fca5a5';
        }
    } else {
        document.getElementById('operatingStatus').style.display = 'none';
    }

    if (org.ipoStatus) {
        document.getElementById('ipoStatus').textContent = org.ipoStatus;
        document.getElementById('ipoStatus').style.display = 'inline-flex';
    } else {
        document.getElementById('ipoStatus').style.display = 'none';
    }

    // Name and descriptions
    document.getElementById('orgName').textContent = org.displayName;
    
    if (org.legalName && org.legalName !== org.displayName) {
        document.getElementById('legalName').textContent = `Legal Name: ${org.legalName}`;
        document.getElementById('legalName').style.display = 'block';
    } else {
        document.getElementById('legalName').style.display = 'none';
    }

    if (org.shortDescription) {
        document.getElementById('shortDescription').textContent = org.shortDescription;
    }

    // Header meta
    const location = [org.headquartersCity, org.headquartersRegion, org.headquartersCountry]
        .filter(Boolean).join(', ');
    if (location) {
        document.getElementById('headquartersLocation').innerHTML = 
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${location}`;
    } else {
        document.getElementById('headquartersLocation').style.display = 'none';
    }

    if (org.foundedOn) {
        document.getElementById('foundedDate').innerHTML = 
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Founded ${formatDate(org.foundedOn)}`;
    } else {
        document.getElementById('foundedDate').style.display = 'none';
    }

    if (org.employeeCountRange) {
        document.getElementById('employeeCount').innerHTML = 
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> ${org.employeeCountRange} employees`;
    } else {
        document.getElementById('employeeCount').style.display = 'none';
    }

    // Rank
    document.getElementById('rank').textContent = org.rank ? Math.round(org.rank).toLocaleString() : '-';
    
    if (org.rankDeltaD7) {
        const delta = org.rankDeltaD7;
        const deltaEl = document.getElementById('rankDelta');
        deltaEl.textContent = delta > 0 ? `↓ ${Math.abs(delta)}` : `↑ ${Math.abs(delta)}`;
        deltaEl.className = 'rank-delta ' + (delta > 0 ? 'negative' : 'positive');
    }

    // Stats
    document.getElementById('totalFunding').textContent = formatCurrency(org.totalFundingUsd);
    document.getElementById('numFundingRounds').textContent = org.numFundingRounds || 0;
    document.getElementById('numInvestments').textContent = org.numInvestments || 0;
    document.getElementById('numAcquisitions').textContent = org.numAcquisitions || 0;
    document.getElementById('numExits').textContent = org.numExits || 0;
    document.getElementById('numArticles').textContent = org.numArticles || 0;

    // About section
    if (org.description) {
        document.getElementById('description').textContent = org.description;
    } else if (org.shortDescription) {
        document.getElementById('description').textContent = org.shortDescription;
    } else {
        document.getElementById('aboutSection').style.display = 'none';
    }

    // Categories
    if (org.categories && org.categories.length > 0) {
        document.getElementById('categoriesSection').style.display = 'block';
        const categoriesHtml = org.categories.map(cat => 
            `<span class="tag ${cat.isPrimary ? 'primary' : ''}">${cat.name}</span>`
        ).join('');
        document.getElementById('categoriesList').innerHTML = categoriesHtml;
    }

    // Founders
    if (org.founders && org.founders.length > 0) {
        document.getElementById('foundersSection').style.display = 'block';
        const foundersHtml = org.founders.map(founder => `
            <a href="/app/person/${founder.permalink}-${founder.personId}" class="person-card">
                <div class="avatar">
                    ${founder.imageUrl ? `<img src="${founder.imageUrl}" alt="${founder.displayName}">` : founder.displayName.charAt(0)}
                </div>
                <div class="info">
                    <div class="name">${founder.displayName}</div>
                    <div class="title">${founder.title || 'Founder'}</div>
                </div>
            </a>
        `).join('');
        document.getElementById('foundersList').innerHTML = foundersHtml;
    }

    // Funding Rounds
    if (org.fundingRounds && org.fundingRounds.length > 0) {
        document.getElementById('fundingRoundsSection').style.display = 'block';
        const roundsHtml = org.fundingRounds.map(round => `
            <div class="timeline-item">
                <div class="timeline-date">${formatDate(round.announcedOn)}</div>
                <div class="timeline-content">
                    <div class="timeline-title">${round.investmentType || round.fundingStage || 'Funding Round'}</div>
                    <div class="timeline-meta">
                        ${round.moneyRaisedUsd ? `<span class="amount">${formatCurrency(round.moneyRaisedUsd)}</span>` : ''}
                        ${round.numInvestors ? `<span>${round.numInvestors} investors</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        document.getElementById('fundingRoundsList').innerHTML = roundsHtml;
    }

    // Investments Made
    if (org.investmentsMade && org.investmentsMade.length > 0) {
        document.getElementById('investmentsSection').style.display = 'block';
        const investmentsHtml = org.investmentsMade.slice(0, 10).map(inv => `
            <a href="/app/organization/${inv.fundedOrgPermalink}-${inv.fundedOrgId}" class="timeline-item">
                <div class="timeline-date">${formatDate(inv.announcedOn)}</div>
                <div class="timeline-content">
                    <div class="timeline-title">${inv.fundedOrgName}</div>
                    <div class="timeline-meta">
                        ${inv.amountUsd ? `<span class="amount">${formatCurrency(inv.amountUsd)}</span>` : ''}
                        ${inv.isLeadInvestor ? '<span class="lead">Lead Investor</span>' : ''}
                    </div>
                </div>
            </a>
        `).join('');
        document.getElementById('investmentsList').innerHTML = investmentsHtml;
    }

    // Acquisitions
    const acquisitions = [...(org.acquisitionsMade || []), ...(org.wasAcquiredIn || [])];
    if (acquisitions.length > 0) {
        document.getElementById('acquisitionsSection').style.display = 'block';
        const acqHtml = acquisitions.map(acq => `
            <a href="/app/organization/${acq.otherOrgPermalink}-${acq.otherOrgId}" class="timeline-item">
                <div class="timeline-date">${formatDate(acq.announcedOn)}</div>
                <div class="timeline-content">
                    <div class="timeline-title">${acq.isAcquirer ? 'Acquired' : 'Acquired by'} ${acq.otherOrgName}</div>
                    <div class="timeline-meta">
                        ${acq.priceUsd ? `<span class="amount">${formatCurrency(acq.priceUsd)}</span>` : ''}
                        ${acq.acquisitionStatus ? `<span>${acq.acquisitionStatus}</span>` : ''}
                    </div>
                </div>
            </a>
        `).join('');
        document.getElementById('acquisitionsList').innerHTML = acqHtml;
    }

    // Sidebar Details
    if (org.fundingStage) {
        document.getElementById('detailFundingStage').querySelector('.detail-value').textContent = org.fundingStage;
    } else {
        document.getElementById('detailFundingStage').style.display = 'none';
    }

    if (org.lastFundingDate) {
        document.getElementById('detailLastFunding').querySelector('.detail-value').textContent = 
            `${org.lastFundingType || ''} ${formatDate(org.lastFundingDate)}`.trim();
    } else {
        document.getElementById('detailLastFunding').style.display = 'none';
    }

    if (org.revenueRange) {
        document.getElementById('detailRevenue').querySelector('.detail-value').textContent = org.revenueRange;
    } else {
        document.getElementById('detailRevenue').style.display = 'none';
    }

    if (org.stockSymbol) {
        document.getElementById('detailStock').querySelector('.detail-value').textContent = 
            org.stockExchangeSymbol ? `${org.stockExchangeSymbol}: ${org.stockSymbol}` : org.stockSymbol;
    } else {
        document.getElementById('detailStock').style.display = 'none';
    }

    // Contact links
    if (org.websiteUrl) {
        document.getElementById('websiteLink').href = org.websiteUrl;
        document.getElementById('websiteLink').style.display = 'flex';
    }
    if (org.linkedinUrl) {
        document.getElementById('linkedinLink').href = org.linkedinUrl;
        document.getElementById('linkedinLink').style.display = 'flex';
    }
    if (org.twitterUrl) {
        document.getElementById('twitterLink').href = org.twitterUrl;
        document.getElementById('twitterLink').style.display = 'flex';
    }
    if (org.facebookUrl) {
        document.getElementById('facebookLink').href = org.facebookUrl;
        document.getElementById('facebookLink').style.display = 'flex';
    }
    if (org.contactEmail) {
        document.getElementById('emailValue').textContent = org.contactEmail;
        document.getElementById('emailItem').style.display = 'flex';
    }
    if (org.phoneNumber) {
        document.getElementById('phoneValue').textContent = org.phoneNumber;
        document.getElementById('phoneItem').style.display = 'flex';
    }

    // Rank trends
    renderTrend('rankDelta7', org.rankDeltaD7);
    renderTrend('rankDelta30', org.rankDeltaD30);
    renderTrend('rankDelta90', org.rankDeltaD90);

    // Aliases
    if (org.aliases && org.aliases.length > 0) {
        document.getElementById('aliasesSection').style.display = 'block';
        const aliasesHtml = org.aliases.map(alias => `<span class="alias">${alias}</span>`).join('');
        document.getElementById('aliasesList').innerHTML = aliasesHtml;
    }
}

function renderTrend(elementId, value) {
    const el = document.getElementById(elementId);
    if (value === null || value === undefined || value === 0) {
        el.textContent = '-';
        el.className = 'trend-value neutral';
    } else if (value > 0) {
        el.textContent = `↓ ${Math.abs(value)}`;
        el.className = 'trend-value negative';
    } else {
        el.textContent = `↑ ${Math.abs(value)}`;
        el.className = 'trend-value positive';
    }
}

function formatCurrency(value) {
    if (!value) return '-';
    if (value >= 1e12) return '$' + (value / 1e12).toFixed(1) + 'T';
    if (value >= 1e9) return '$' + (value / 1e9).toFixed(1) + 'B';
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M';
    if (value >= 1e3) return '$' + (value / 1e3).toFixed(1) + 'K';
    return '$' + value.toLocaleString();
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchOrganization);
