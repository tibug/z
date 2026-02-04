// Person Detail Page JavaScript
const API_BASE = '/api';

// Get person identifier from URL
function getPersonIdentifier() {
    const path = window.location.pathname;
    const match = path.match(/\/app\/person\/(.+)/);
    if (match) {
        const identifier = match[1];
        const idMatch = identifier.match(/-(\d+)$/);
        if (idMatch) {
            return { type: 'id', value: idMatch[1] };
        }
        if (/^\d+$/.test(identifier)) {
            return { type: 'id', value: identifier };
        }
        return { type: 'permalink', value: identifier };
    }
    return null;
}

// Fetch person data
async function fetchPerson() {
    const identifier = getPersonIdentifier();
    if (!identifier) {
        showError();
        return;
    }

    try {
        let url;
        if (identifier.type === 'id') {
            url = `${API_BASE}/people/${identifier.value}`;
        } else {
            url = `${API_BASE}/people/by-permalink/${identifier.value}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Not found');
        }

        const data = await response.json();
        renderPerson(data);
    } catch (error) {
        console.error('Error fetching person:', error);
        showError();
    }
}

// Show error state
function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'flex';
}

// Render person data
function renderPerson(person) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('contentState').style.display = 'block';

    // Update page title and breadcrumb
    document.title = `${person.displayName} - Crunchbase Explorer`;
    document.getElementById('breadcrumbName').textContent = person.displayName;

    // Avatar/Photo
    if (person.imageUrl) {
        document.getElementById('personPhoto').src = person.imageUrl;
        document.getElementById('personPhoto').style.display = 'block';
        document.getElementById('personInitial').style.display = 'none';
    } else {
        const initial = person.firstName ? person.firstName.charAt(0) : person.displayName.charAt(0);
        document.getElementById('personInitial').textContent = initial.toUpperCase();
    }

    // Badges
    if (person.gender) {
        document.getElementById('genderBadge').textContent = person.gender;
        document.getElementById('genderBadge').style.display = 'inline-flex';
    } else {
        document.getElementById('genderBadge').style.display = 'none';
    }

    if (person.numInvestments > 0 || person.numPartnerInvestments > 0) {
        document.getElementById('investorBadge').style.display = 'inline-flex';
    }

    // Name and descriptions
    document.getElementById('personName').textContent = person.displayName;
    
    if (person.primaryJobTitle && person.primaryOrganizationName) {
        document.getElementById('primaryRole').textContent = 
            `${person.primaryJobTitle} at ${person.primaryOrganizationName}`;
    } else if (person.primaryJobTitle) {
        document.getElementById('primaryRole').textContent = person.primaryJobTitle;
    } else {
        document.getElementById('primaryRole').style.display = 'none';
    }

    if (person.shortDescription) {
        document.getElementById('shortDescription').textContent = person.shortDescription;
    }

    // Header meta
    const location = [person.locationCity, person.locationCountry].filter(Boolean).join(', ');
    if (location) {
        document.getElementById('locationInfo').innerHTML = 
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${location}`;
    } else {
        document.getElementById('locationInfo').style.display = 'none';
    }

    if (person.bornOn) {
        document.getElementById('birthInfo').innerHTML = 
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Born ${formatDate(person.bornOn)}`;
    } else {
        document.getElementById('birthInfo').style.display = 'none';
    }

    // Rank
    document.getElementById('rank').textContent = person.rankPerson ? Math.round(person.rankPerson).toLocaleString() : '-';
    
    if (person.rankDeltaD7) {
        const delta = person.rankDeltaD7;
        const deltaEl = document.getElementById('rankDelta');
        deltaEl.textContent = delta > 0 ? `↓ ${Math.abs(delta)}` : `↑ ${Math.abs(delta)}`;
        deltaEl.className = 'rank-delta ' + (delta > 0 ? 'negative' : 'positive');
    }

    // Stats
    document.getElementById('numCurrentJobs').textContent = person.numCurrentJobs || 0;
    document.getElementById('numFoundedOrgs').textContent = person.numFoundedOrganizations || 0;
    document.getElementById('numInvestments').textContent = person.numInvestments || 0;
    document.getElementById('numExits').textContent = person.numExits || 0;
    document.getElementById('numEventAppearances').textContent = person.numEventAppearances || 0;
    document.getElementById('numArticles').textContent = person.numArticles || 0;

    // About section
    if (person.description) {
        document.getElementById('description').textContent = person.description;
    } else if (person.shortDescription) {
        document.getElementById('description').textContent = person.shortDescription;
    } else {
        document.getElementById('aboutSection').style.display = 'none';
    }

    // Job History
    if (person.jobs && person.jobs.length > 0) {
        document.getElementById('jobHistorySection').style.display = 'block';
        const jobsHtml = person.jobs.map(job => `
            <div class="job-item">
                <div class="job-logo">
                    ${job.organizationName ? job.organizationName.charAt(0).toUpperCase() : '?'}
                </div>
                <div class="job-details">
                    <div class="job-title">
                        ${job.title || 'Unknown Role'}
                        ${job.isCurrent ? '<span class="job-current">Current</span>' : ''}
                    </div>
                    <div class="job-org">
                        ${job.organizationId ? 
                            `<a href="/app/organization/${job.organizationPermalink}-${job.organizationId}">${job.organizationName}</a>` : 
                            (job.organizationName || 'Unknown Company')}
                        ${job.jobType ? ` • ${job.jobType}` : ''}
                    </div>
                    <div class="job-period">
                        ${formatDate(job.startedOn)} - ${job.isCurrent ? 'Present' : formatDate(job.endedOn)}
                    </div>
                    ${job.locationText ? `<div class="job-location">${job.locationText}</div>` : ''}
                </div>
            </div>
        `).join('');
        document.getElementById('jobHistoryList').innerHTML = jobsHtml;
    }

    // Founded Organizations
    if (person.foundedOrganizations && person.foundedOrganizations.length > 0) {
        document.getElementById('foundedOrgsSection').style.display = 'block';
        const orgsHtml = person.foundedOrganizations.map(org => `
            <a href="/app/organization/${org.permalink}-${org.organizationId}" class="org-card">
                <div class="avatar">
                    ${org.imageUrl ? `<img src="${org.imageUrl}" alt="${org.displayName}">` : org.displayName.charAt(0)}
                </div>
                <div class="info">
                    <div class="name">${org.displayName}</div>
                    <div class="title">${org.title || 'Founder'}</div>
                </div>
            </a>
        `).join('');
        document.getElementById('foundedOrgsList').innerHTML = orgsHtml;
    }

    // Education
    if (person.degrees && person.degrees.length > 0) {
        document.getElementById('educationSection').style.display = 'block';
        const eduHtml = person.degrees.map(deg => `
            <div class="education-item">
                <div class="education-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                </div>
                <div class="education-details">
                    <div class="education-school">${deg.schoolName || 'Unknown School'}</div>
                    <div class="education-degree">
                        ${[deg.degreeType, deg.subject].filter(Boolean).join(' in ') || 'Degree'}
                    </div>
                    ${deg.completedOn ? `<div class="education-period">Graduated ${formatDate(deg.completedOn)}</div>` : ''}
                </div>
            </div>
        `).join('');
        document.getElementById('educationList').innerHTML = eduHtml;
    }

    // Investments
    if (person.investments && person.investments.length > 0) {
        document.getElementById('investmentsSection').style.display = 'block';
        const invHtml = person.investments.slice(0, 10).map(inv => `
            <a href="/app/organization/${inv.fundedOrgPermalink}-${inv.fundedOrgId}" class="timeline-item">
                <div class="timeline-date">${formatDate(inv.announcedOn)}</div>
                <div class="timeline-content">
                    <div class="timeline-title">${inv.fundedOrgName}</div>
                    <div class="timeline-subtitle">${inv.investmentType || 'Investment'}</div>
                    <div class="timeline-meta">
                        ${inv.amountUsd ? `<span class="amount">${formatCurrency(inv.amountUsd)}</span>` : ''}
                        ${inv.isLeadInvestor ? '<span class="lead">Lead Investor</span>' : ''}
                    </div>
                </div>
            </a>
        `).join('');
        document.getElementById('investmentsList').innerHTML = invHtml;
    }

    // Sidebar Details
    if (person.fullName || person.displayName) {
        document.getElementById('detailFullName').querySelector('.detail-value').textContent = 
            person.fullName || person.displayName;
    }

    if (person.primaryOrganizationName) {
        const orgLink = person.primaryOrganizationId ? 
            `<a href="/app/organization/${person.primaryOrganizationPermalink}-${person.primaryOrganizationId}" style="color: var(--color-primary); text-decoration: none;">${person.primaryOrganizationName}</a>` :
            person.primaryOrganizationName;
        document.getElementById('detailPrimaryOrg').querySelector('.detail-value').innerHTML = orgLink;
    } else {
        document.getElementById('detailPrimaryOrg').style.display = 'none';
    }

    document.getElementById('detailNumJobs').querySelector('.detail-value').textContent = 
        `${person.numCurrentJobs || 0} current, ${person.numPastJobs || 0} past`;

    const advisorJobs = (person.numCurrentAdvisorJobs || 0) + (person.numPastAdvisorJobs || 0);
    if (advisorJobs > 0) {
        document.getElementById('detailNumAdvisorJobs').querySelector('.detail-value').textContent = advisorJobs;
    } else {
        document.getElementById('detailNumAdvisorJobs').style.display = 'none';
    }

    // Investment Profile
    if (person.numInvestments > 0 || person.numPartnerInvestments > 0) {
        document.getElementById('investmentProfileSection').style.display = 'block';
        document.getElementById('numLeadInvestments').textContent = person.numLeadInvestments || 0;
        document.getElementById('numPartnerInvestments').textContent = person.numPartnerInvestments || 0;
        document.getElementById('numPortfolioOrgs').textContent = person.numPortfolioOrganizations || 0;
        document.getElementById('numExitsIpo').textContent = person.numExitsIpo || 0;
    }

    // Social links
    if (person.linkedinUrl) {
        document.getElementById('linkedinLink').href = person.linkedinUrl;
        document.getElementById('linkedinLink').style.display = 'flex';
    }
    if (person.twitterUrl) {
        document.getElementById('twitterLink').href = person.twitterUrl;
        document.getElementById('twitterLink').style.display = 'flex';
    }
    if (person.facebookUrl) {
        document.getElementById('facebookLink').href = person.facebookUrl;
        document.getElementById('facebookLink').style.display = 'flex';
    }
    if (person.websiteUrl) {
        document.getElementById('websiteLink').href = person.websiteUrl;
        document.getElementById('websiteLink').style.display = 'flex';
    }

    // Rank trends
    renderTrend('rankDelta7', person.rankDeltaD7);
    renderTrend('rankDelta30', person.rankDeltaD30);
    renderTrend('rankDelta90', person.rankDeltaD90);

    // Aliases
    if (person.aliases && person.aliases.length > 0) {
        document.getElementById('aliasesSection').style.display = 'block';
        const aliasesHtml = person.aliases.map(alias => `<span class="alias">${alias}</span>`).join('');
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
document.addEventListener('DOMContentLoaded', fetchPerson);
