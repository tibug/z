// Funding Round Detail Page JavaScript

document.addEventListener('DOMContentLoaded', async () => {
    const pathParts = window.location.pathname.split('/');
    const slug = pathParts[pathParts.length - 1];
    
    // Extract ID from slug (format: permalink-id or just id)
    let fundingId = null;
    let permalink = null;
    
    const lastDashIndex = slug.lastIndexOf('-');
    if (lastDashIndex > 0) {
        const possibleId = slug.substring(lastDashIndex + 1);
        if (/^\d+$/.test(possibleId)) {
            fundingId = parseInt(possibleId);
            permalink = slug.substring(0, lastDashIndex);
        }
    }
    
    if (!fundingId && /^\d+$/.test(slug)) {
        fundingId = parseInt(slug);
    }
    
    if (!fundingId && slug) {
        permalink = slug;
    }
    
    try {
        let data;
        if (fundingId) {
            const response = await fetch(`/api/fundingrounds/${fundingId}`);
            if (!response.ok) throw new Error('Not found');
            data = await response.json();
        } else if (permalink) {
            const response = await fetch(`/api/fundingrounds/by-permalink/${permalink}`);
            if (!response.ok) throw new Error('Not found');
            data = await response.json();
        } else {
            throw new Error('Invalid URL');
        }
        
        renderFundingRound(data);
    } catch (error) {
        console.error('Error loading funding round:', error);
        showError();
    }
});

function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'flex';
}

function renderFundingRound(data) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    
    // Update page title
    document.title = `${data.roundName || 'Funding Round'} - Crunchbase Explorer`;
    
    // Render header
    renderHeader(data);
    
    // Render stats grid
    renderStatsGrid(data);
    
    // Render about section
    if (data.description || data.shortDescription) {
        document.getElementById('aboutSection').style.display = 'block';
        document.getElementById('description').textContent = data.description || data.shortDescription;
    }
    
    // Render funded organization
    renderFundedOrg(data);
    
    // Render investors
    renderInvestors(data.investors || []);
    
    // Render categories
    renderCategories(data.categories || [], data.categoryGroups || []);
    
    // Render press references
    renderPress(data.pressReferences || []);
    
    // Render sidebar details
    renderRoundDetails(data);
    renderValuationDetails(data);
    renderDateDetails(data);
}

function renderHeader(data) {
    // Round name
    document.getElementById('roundName').textContent = data.roundName || 'Funding Round';
    
    // Funded org link
    if (data.fundedOrganizationName) {
        const orgLink = document.getElementById('fundedOrgLink');
        if (data.fundedOrganizationId) {
            orgLink.innerHTML = `Investment in <a href="/app/organization/${data.fundedOrganizationPermalink || ''}-${data.fundedOrganizationId}">${data.fundedOrganizationName}</a>`;
        } else {
            orgLink.textContent = `Investment in ${data.fundedOrganizationName}`;
        }
    }
    
    // Badges
    const badges = [];
    if (data.investmentType) badges.push({ text: data.investmentType, class: 'badge-type' });
    if (data.investmentStage) badges.push({ text: data.investmentStage, class: 'badge-stage' });
    if (data.isEquity) badges.push({ text: 'Equity', class: 'badge-equity' });
    
    document.getElementById('headerBadges').innerHTML = badges.map(b => 
        `<span class="badge ${b.class}">${b.text}</span>`
    ).join('');
    
    // Meta info
    const meta = [];
    if (data.announcedOn) meta.push(`Announced ${formatDate(data.announcedOn)}`);
    if (data.fundingStage) meta.push(data.fundingStage);
    
    document.getElementById('headerMeta').innerHTML = meta.map(m => 
        `<span class="meta-item">${m}</span>`
    ).join('<span class="meta-separator">•</span>');
    
    // Rank card
    if (data.rankFundingRound) {
        document.getElementById('rankCard').style.display = 'flex';
        document.getElementById('rankValue').textContent = `#${Math.round(data.rankFundingRound).toLocaleString()}`;
    }
    
    // Avatar with org image
    if (data.fundedOrganizationImageUrl || data.imageUrl) {
        document.getElementById('fundingAvatar').innerHTML = 
            `<img src="${data.fundedOrganizationImageUrl || data.imageUrl}" alt="Logo" onerror="this.parentElement.innerHTML='<svg width=32 height=32 viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><line x1=\\'12\\' y1=\\'1\\' x2=\\'12\\' y2=\\'23\\'/><path d=\\'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\\'/></svg>'">`;
    }
}

function renderStatsGrid(data) {
    const stats = [];
    
    if (data.moneyRaisedUsd) {
        stats.push({ label: 'Money Raised', value: formatCurrency(data.moneyRaisedUsd) });
    }
    if (data.targetMoneyRaisedUsd) {
        stats.push({ label: 'Target Amount', value: formatCurrency(data.targetMoneyRaisedUsd) });
    }
    if (data.numInvestors) {
        stats.push({ label: 'Investors', value: data.numInvestors.toLocaleString() });
    }
    if (data.numLeadInvestors) {
        stats.push({ label: 'Lead Investors', value: data.numLeadInvestors.toLocaleString() });
    }
    if (data.numPartners) {
        stats.push({ label: 'Partners', value: data.numPartners.toLocaleString() });
    }
    if (data.preMoneyValuationUsd) {
        stats.push({ label: 'Pre-Money Valuation', value: formatCurrency(data.preMoneyValuationUsd) });
    }
    
    document.getElementById('statsGrid').innerHTML = stats.map(s => `
        <div class="stat-card">
            <span class="stat-value">${s.value}</span>
            <span class="stat-label">${s.label}</span>
        </div>
    `).join('');
}

function renderFundedOrg(data) {
    if (!data.fundedOrganizationName) return;
    
    document.getElementById('fundedOrgSection').style.display = 'block';
    
    const initials = (data.fundedOrganizationName || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const avatarColor = getAvatarColor(data.fundedOrganizationId || data.fundedOrganizationName);
    
    let imageHtml = data.fundedOrganizationImageUrl
        ? `<img src="${data.fundedOrganizationImageUrl}" alt="${data.fundedOrganizationName}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="org-avatar-fallback" style="display:none;background:${avatarColor}">${initials}</div>`
        : `<div class="org-avatar-fallback" style="background:${avatarColor}">${initials}</div>`;
    
    const details = [];
    if (data.fundedOrganizationStage) details.push(`Stage: ${data.fundedOrganizationStage}`);
    if (data.fundedOrganizationFundingTotalUsd) details.push(`Total Funding: ${formatCurrency(data.fundedOrganizationFundingTotalUsd)}`);
    if (data.fundedOrganizationRevenueRange) details.push(`Revenue: ${data.fundedOrganizationRevenueRange}`);
    
    document.getElementById('fundedOrgCard').innerHTML = `
        <a href="/app/organization/${data.fundedOrganizationPermalink || ''}-${data.fundedOrganizationId}" class="funded-org-link">
            <div class="funded-org-avatar">${imageHtml}</div>
            <div class="funded-org-info">
                <h4>${data.fundedOrganizationName}</h4>
                ${details.length > 0 ? `<p class="funded-org-details">${details.join(' • ')}</p>` : ''}
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
            </svg>
        </a>
    `;
}

function renderInvestors(investors) {
    if (investors.length === 0) return;
    
    document.getElementById('investorsSection').style.display = 'block';
    
    // Sort: lead investors first
    investors.sort((a, b) => (b.isLeadInvestor ? 1 : 0) - (a.isLeadInvestor ? 1 : 0));
    
    document.getElementById('investorsGrid').innerHTML = investors.map(inv => {
        const initials = (inv.investorName || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const avatarColor = getAvatarColor(inv.investorEntityId || inv.investorName);
        const isOrg = inv.investorType === 'organization';
        
        let imageHtml = inv.investorImageUrl
            ? `<img src="${inv.investorImageUrl}" alt="${inv.investorName}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="investor-avatar-fallback" style="display:none;background:${avatarColor}">${initials}</div>`
            : `<div class="investor-avatar-fallback" style="background:${avatarColor}">${initials}</div>`;
        
        const link = isOrg 
            ? `/app/organization/${inv.investorPermalink || ''}-${inv.investorEntityId}`
            : `/app/person/${inv.investorPermalink || ''}-${inv.investorEntityId}`;
        
        return `
            <a href="${link}" class="investor-card ${inv.isLeadInvestor ? 'lead-investor' : ''}">
                <div class="investor-avatar">${imageHtml}</div>
                <div class="investor-info">
                    <h4>${inv.investorName || 'Unknown'}</h4>
                    <div class="investor-meta">
                        ${inv.isLeadInvestor ? '<span class="lead-badge">Lead</span>' : ''}
                        ${inv.amountUsd ? `<span class="amount">${formatCurrency(inv.amountUsd)}</span>` : ''}
                    </div>
                </div>
            </a>
        `;
    }).join('');
}

function renderCategories(categories, categoryGroups) {
    if (categories.length === 0 && categoryGroups.length === 0) return;
    
    document.getElementById('categoriesSection').style.display = 'block';
    
    let html = '';
    
    if (categoryGroups.length > 0) {
        html += '<div class="category-group"><h4>Category Groups</h4><div class="tags-list">';
        html += categoryGroups.map(cg => `<span class="tag tag-group">${cg.name}</span>`).join('');
        html += '</div></div>';
    }
    
    if (categories.length > 0) {
        html += '<div class="category-group"><h4>Categories</h4><div class="tags-list">';
        html += categories.map(c => `<span class="tag ${c.isPrimary ? 'tag-primary' : ''}">${c.name}</span>`).join('');
        html += '</div></div>';
    }
    
    document.getElementById('categoriesList').innerHTML = html;
}

function renderPress(pressReferences) {
    if (pressReferences.length === 0) return;
    
    document.getElementById('pressSection').style.display = 'block';
    
    document.getElementById('pressList').innerHTML = pressReferences.map(pr => `
        <a href="${pr.url}" target="_blank" rel="noopener" class="press-item">
            <div class="press-info">
                <h4>${pr.title || 'News Article'}</h4>
                <p class="press-meta">
                    ${pr.publisher ? `<span>${pr.publisher}</span>` : ''}
                    ${pr.publishedOn ? `<span>${formatDate(pr.publishedOn)}</span>` : ''}
                </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
        </a>
    `).join('');
}

function renderRoundDetails(data) {
    const details = [];
    
    if (data.investmentType) details.push({ label: 'Investment Type', value: data.investmentType });
    if (data.investmentStage) details.push({ label: 'Investment Stage', value: data.investmentStage });
    if (data.fundingStage) details.push({ label: 'Funding Stage', value: data.fundingStage });
    if (data.isEquity !== null && data.isEquity !== undefined) {
        details.push({ label: 'Is Equity', value: data.isEquity ? 'Yes' : 'No' });
    }
    if (data.moneyRaisedUsd) details.push({ label: 'Money Raised', value: formatCurrency(data.moneyRaisedUsd) });
    if (data.targetMoneyRaisedUsd) details.push({ label: 'Target Amount', value: formatCurrency(data.targetMoneyRaisedUsd) });
    if (data.permalink) details.push({ label: 'Permalink', value: data.permalink });
    
    document.getElementById('roundDetails').innerHTML = details.map(d => `
        <div class="detail-row">
            <dt>${d.label}</dt>
            <dd>${d.value}</dd>
        </div>
    `).join('');
}

function renderValuationDetails(data) {
    if (!data.preMoneyValuationUsd && !data.postMoneyValuationUsd) return;
    
    document.getElementById('valuationSection').style.display = 'block';
    
    const details = [];
    if (data.preMoneyValuationUsd) details.push({ label: 'Pre-Money Valuation', value: formatCurrency(data.preMoneyValuationUsd) });
    if (data.postMoneyValuationUsd) details.push({ label: 'Post-Money Valuation', value: formatCurrency(data.postMoneyValuationUsd) });
    
    document.getElementById('valuationDetails').innerHTML = details.map(d => `
        <div class="detail-row">
            <dt>${d.label}</dt>
            <dd>${d.value}</dd>
        </div>
    `).join('');
}

function renderDateDetails(data) {
    const details = [];
    
    if (data.announcedOn) details.push({ label: 'Announced', value: formatDate(data.announcedOn) });
    if (data.closedOn) details.push({ label: 'Closed', value: formatDate(data.closedOn) });
    if (data.createdAt) details.push({ label: 'Record Created', value: formatDate(data.createdAt) });
    if (data.updatedAt) details.push({ label: 'Last Updated', value: formatDate(data.updatedAt) });
    
    document.getElementById('dateDetails').innerHTML = details.map(d => `
        <div class="detail-row">
            <dt>${d.label}</dt>
            <dd>${d.value}</dd>
        </div>
    `).join('');
}

// Utility functions
function formatCurrency(amount) {
    if (!amount) return '-';
    const num = Number(amount);
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getAvatarColor(seed) {
    const colors = [
        '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
        '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
        '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
        '#0ea5e9', '#3b82f6', '#6366f1'
    ];
    const hash = String(seed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}
