// ===== State Management =====
const state = {
    currentEntity: 'organizations',
    page: 1,
    pageSize: 25,
    sortColumn: '',  // Empty string means no sorting
    sortDirection: 'Descending',
    filters: {},
    data: [],
    totalCount: 0,
    isLoading: false,
    columnVisibility: {},
    filtersVisible: true,
    expandedFilterSections: ['quickSearch', 'location', 'companyProfile']
};

// ===== API Configuration =====
const API_BASE_URL = '/api';

// ===== Entity Configurations =====
// Column keys must match the database column names expected by the backend
const entities = {
    organizations: {
        title: 'Organizations',
        subtitle: 'Discover and track companies',
        apiEndpoint: '/organizations',
        idField: 'organizationId',
        columns: [
            { key: 'displayName', label: 'Name', width: '250px', sortable: false, clickable: true, type: 'avatar' },
            { key: 'location', label: 'Location', width: '150px', sortable: false },
            { key: 'companyType', label: 'Type', width: '120px', sortable: false, type: 'badge' },
            { key: 'operatingStatus', label: 'Status', width: '120px', sortable: false, type: 'badge' },
            { key: 'fundingStage', label: 'Stage', width: '130px', sortable: false, type: 'badge' },
            { key: 'fundingTotalUsd', label: 'Total Funding', width: '140px', sortable: false, type: 'currency' },
            { key: 'numEmployeesEnum', label: 'Employees', width: '120px', sortable: false },
            { key: 'rank', label: 'Rank', width: '100px', sortable: false }
        ],
        hiddenColumns: [
            { key: 'ipoStatus', label: 'IPO Status' },
            { key: 'lastFundingAt', label: 'Last Funding Date', type: 'date' },
            { key: 'revenueRangeCode', label: 'Revenue Range' }
        ],
        filters: [
            {
                id: 'quickSearch',
                label: 'Quick Search',
                type: 'text',
                placeholder: 'Search name, description...',
                paramName: 'searchText'
            },
            {
                id: 'location',
                label: 'Location',
                type: 'section',
                fields: [
                    { label: 'Country Code', type: 'text', paramName: 'countryCode', placeholder: 'e.g. USA' },
                    { label: 'City', type: 'text', paramName: 'city', placeholder: 'e.g. San Francisco' }
                ]
            },
            {
                id: 'companyProfile',
                label: 'Company Profile',
                type: 'section',
                fields: [
                    { label: 'Company Type', type: 'select', paramName: 'companyType', options: ['for_profit', 'non_profit', 'investor', 'school'] },
                    { label: 'Operating Status', type: 'select', paramName: 'operatingStatus', options: ['active', 'closed', 'acquired', 'ipo'] }
                ]
            }
        ]
    },
    people: {
        title: 'People',
        subtitle: 'Discover key people in the ecosystem',
        apiEndpoint: '/people',
        idField: 'personId',
        columns: [
            { key: 'displayName', label: 'Name', width: '200px', sortable: false, clickable: true, type: 'avatar' },
            { key: 'primaryOrganizationName', label: 'Primary Organization', width: '200px', sortable: false, clickable: true },
            { key: 'primaryJobTitle', label: 'Title', width: '200px', sortable: false },
            { key: 'location', label: 'Location', width: '150px', sortable: false },
            { key: 'isInvestor', label: 'Is Investor', width: '100px', sortable: false, type: 'boolean' },
            { key: 'numInvestments', label: '# Investments', width: '120px', sortable: false },
            { key: 'numFoundedOrganizations', label: '# Founded Orgs', width: '130px', sortable: false },
            { key: 'rankPerson', label: 'Rank', width: '100px', sortable: false }
        ],
        hiddenColumns: [
            { key: 'gender', label: 'Gender' }
        ],
        filters: [
            {
                id: 'quickSearch',
                label: 'Quick Search',
                type: 'text',
                placeholder: 'Search name...',
                paramName: 'searchText'
            },
            {
                id: 'profile',
                label: 'Profile',
                type: 'section',
                fields: [
                    { label: 'Gender', type: 'select', paramName: 'gender', options: ['male', 'female', 'other'] }
                ]
            }
        ]
    },
    'funding-rounds': {
        title: 'Funding Rounds',
        subtitle: 'Track investment rounds',
        apiEndpoint: '/fundingrounds',
        idField: 'fundingRoundId',
        columns: [
            { key: 'roundName', label: 'Round Name', width: '200px', sortable: false, clickable: true },
            { key: 'organizationName', label: 'Organization', width: '200px', sortable: false, clickable: true },
            { key: 'announcedOn', label: 'Announced Date', width: '140px', sortable: false, type: 'date' },
            { key: 'investmentType', label: 'Investment Type', width: '150px', sortable: false, type: 'badge' },
            { key: 'moneyRaisedUsd', label: 'Money Raised', width: '140px', sortable: false, type: 'currency' },
            { key: 'numInvestors', label: '# Investors', width: '110px', sortable: false }
        ],
        hiddenColumns: [
            { key: 'fundingStage', label: 'Funding Stage' },
            { key: 'isEquity', label: 'Is Equity', type: 'boolean' }
        ],
        filters: [
            {
                id: 'dates',
                label: 'Dates',
                type: 'section',
                fields: [
                    { label: 'From Date', type: 'date', paramName: 'fromDate' },
                    { label: 'To Date', type: 'date', paramName: 'toDate' }
                ]
            },
            {
                id: 'investment',
                label: 'Investment',
                type: 'section',
                fields: [
                    { label: 'Investment Type', type: 'select', paramName: 'investmentType', options: ['seed', 'series_a', 'series_b', 'series_c', 'venture', 'angel'] }
                ]
            }
        ]
    },
    investments: {
        title: 'Investments',
        subtitle: 'Track investor activity',
        apiEndpoint: '/investments',
        idField: 'investmentId',
        columns: [
            { key: 'investorName', label: 'Investor', width: '200px', sortable: false, clickable: true },
            { key: 'investorType', label: 'Investor Type', width: '120px', sortable: false, type: 'badge' },
            { key: 'fundedOrgName', label: 'Funded Organization', width: '200px', sortable: false, clickable: true },
            { key: 'fundingRoundName', label: 'Funding Round', width: '200px', sortable: false },
            { key: 'announcedOn', label: 'Investment Date', width: '140px', sortable: false, type: 'date' },
            { key: 'amount', label: 'Amount', width: '140px', sortable: false, type: 'currency' }
        ],
        hiddenColumns: [
            { key: 'isLeadInvestor', label: 'Is Lead Investor', type: 'boolean' }
        ],
        filters: [
            {
                id: 'dates',
                label: 'Dates',
                type: 'section',
                fields: [
                    { label: 'From Date', type: 'date', paramName: 'fromDate' },
                    { label: 'To Date', type: 'date', paramName: 'toDate' }
                ]
            }
        ]
    },
    acquisitions: {
        title: 'Acquisitions',
        subtitle: 'Track M&A activity',
        apiEndpoint: '/acquisitions',
        idField: 'acquisitionId',
        columns: [
            { key: 'acquireeName', label: 'Acquiree', width: '200px', sortable: false, clickable: true },
            { key: 'acquirerName', label: 'Acquirer', width: '200px', sortable: false, clickable: true },
            { key: 'announcedOn', label: 'Announced Date', width: '140px', sortable: false, type: 'date' },
            { key: 'completedOn', label: 'Completed Date', width: '140px', sortable: false, type: 'date' },
            { key: 'price', label: 'Price', width: '140px', sortable: false, type: 'currency' },
            { key: 'status', label: 'Status', width: '120px', sortable: false, type: 'badge' }
        ],
        filters: [
            {
                id: 'dates',
                label: 'Dates',
                type: 'section',
                fields: [
                    { label: 'From Date', type: 'date', paramName: 'fromDate' },
                    { label: 'To Date', type: 'date', paramName: 'toDate' }
                ]
            },
            {
                id: 'status',
                label: 'Status',
                type: 'section',
                fields: [
                    { label: 'Status', type: 'select', paramName: 'acquisitionStatus', options: ['complete', 'pending', 'cancelled'] }
                ]
            }
        ]
    },
    events: {
        title: 'Events',
        subtitle: 'Discover industry events',
        apiEndpoint: '/events',
        idField: 'eventId',
        columns: [
            { key: 'displayName', label: 'Event Name', width: '250px', sortable: false, clickable: true },
            { key: 'startsOn', label: 'Start Date', width: '130px', sortable: false, type: 'date' },
            { key: 'endsOn', label: 'End Date', width: '130px', sortable: false, type: 'date' },
            { key: 'location', label: 'Location', width: '180px', sortable: false },
            { key: 'eventType', label: 'Type', width: '130px', sortable: false, type: 'badge' },
            { key: 'numSpeakers', label: '# Speakers', width: '110px', sortable: false },
            { key: 'numSponsors', label: '# Sponsors', width: '110px', sortable: false }
        ],
        hiddenColumns: [
            { key: 'numExhibitors', label: '# Exhibitors' }
        ],
        filters: [
            {
                id: 'dates',
                label: 'Dates',
                type: 'section',
                fields: [
                    { label: 'From Date', type: 'date', paramName: 'fromDate' },
                    { label: 'To Date', type: 'date', paramName: 'toDate' }
                ]
            }
        ]
    }
};

// ===== API Functions =====
async function fetchData(entityKey) {
    const entity = entities[entityKey];
    const params = new URLSearchParams();
    
    // Pagination - REQUIRED parameters
    params.set('pageNumber', state.page);
    params.set('pageSize', state.pageSize);
    
    // Sorting - ONLY add if column is explicitly set and not empty
    if (state.sortColumn && state.sortColumn !== '' && state.sortColumn !== null && state.sortColumn !== undefined) {
        params.set('sortColumn', state.sortColumn);
        params.set('sortDirection', state.sortDirection);
    }
    
    // Filters
    Object.entries(state.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, value);
        }
    });
    
    const url = `${API_BASE_URL}${entity.apiEndpoint}?${params.toString()}`;
    
    console.log('Fetching URL:', url);  // Debug logging
    
    try {
        showLoading(true);
        hideEmptyState();
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);  // Debug logging
        
        state.data = result.items || [];
        state.totalCount = result.totalCount || 0;
        
        renderTable();
        renderPagination();
    } catch (error) {
        console.error('Error fetching data:', error);
        showEmptyState(true);
        state.data = [];
        state.totalCount = 0;
        renderTable();
    } finally {
        showLoading(false);
    }
}

async function fetchDetail(entityKey, id) {
    const entity = entities[entityKey];
    const url = `${API_BASE_URL}${entity.apiEndpoint}/${id}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching detail:', error);
        return null;
    }
}

// ===== Rendering Functions =====
function renderTable() {
    const entity = entities[state.currentEntity];
    const thead = document.getElementById('tableHead');
    const tbody = document.getElementById('tableBody');
    
    if (!thead || !tbody) return;
    
    // Render headers - NO sorting enabled (sortable: false for all)
    thead.innerHTML = `
        <tr>
            ${entity.columns.map(col => {
                return `
                    <th style="width: ${col.width || 'auto'}">
                        <div class="th-content">
                            ${col.label}
                        </div>
                    </th>
                `;
            }).join('')}
        </tr>
    `;
    
    // Render rows
    if (state.data.length === 0) {
        showEmptyState(true);
        tbody.innerHTML = '';
    } else {
        showEmptyState(false);
        tbody.innerHTML = state.data.map(row => `
            <tr class="clickable" data-id="${row[entity.idField]}">
                ${entity.columns.map(col => `
                    <td>${renderCell(row, col)}</td>
                `).join('')}
            </tr>
        `).join('');
    }
    
    // Attach row click handlers
    tbody.querySelectorAll('tr.clickable').forEach(tr => {
        tr.addEventListener('click', () => {
            const id = tr.dataset.id;
            const row = state.data.find(r => r[entity.idField] == id);
            navigateToDetailPage(row, entity);
        });
    });
}

// Navigate to detail page based on entity type
function navigateToDetailPage(row, entity) {
    if (!row) return;
    
    const id = row[entity.idField];
    const permalink = row.permalink || '';
    
    let path = '';
    
    switch (state.currentEntity) {
        case 'organizations':
            path = `/app/organization/${permalink}-${id}`;
            break;
        case 'people':
            path = `/app/person/${permalink}-${id}`;
            break;
        case 'funding-rounds':
            path = `/app/funding/${permalink}-${id}`;
            break;
        case 'investments':
            // Navigate to investor if it's an organization
            if (row.investorEntityId && row.investorPermalink) {
                path = `/app/organization/${row.investorPermalink}-${row.investorEntityId}`;
            } else {
                openDetailModal(id);
                return;
            }
            break;
        case 'acquisitions':
            // Navigate to acquirer organization
            if (row.acquirerOrganizationId && row.acquirerPermalink) {
                path = `/app/organization/${row.acquirerPermalink}-${row.acquirerOrganizationId}`;
            } else {
                openDetailModal(id);
                return;
            }
            break;
        case 'events':
            path = `/app/event/${permalink}-${id}`;
            break;
        default:
            openDetailModal(id);
            return;
    }
    
    window.location.href = path;
}

function renderCell(row, col) {
    const value = row[col.key];
    
    if (col.type === 'avatar') {
        const initials = (value || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const avatarColor = getAvatarColor(row[entities[state.currentEntity].idField] || value);
        return `
            <div class="cell-avatar">
                <div class="avatar" style="background: ${avatarColor}; color: white;">${initials}</div>
                <div class="avatar-info">
                    <strong>${col.clickable ? `<span class="cell-link">${value || '-'}</span>` : value || '-'}</strong>
                    ${row.permalink ? `<span>${row.permalink}</span>` : ''}
                </div>
            </div>
        `;
    }
    
    if (col.type === 'badge') {
        let badgeClass = '';
        const val = (value || '').toLowerCase().replace(/[_\s]/g, '-');
        if (col.key === 'companyType' || col.key === 'investorType') {
            badgeClass = `badge-${val}`;
        } else if (col.key === 'operatingStatus' || col.key === 'status') {
            badgeClass = `badge-${val}`;
        }
        return `<span class="cell-badge ${badgeClass}">${value || '-'}</span>`;
    }
    
    if (col.type === 'currency') {
        return `<span class="cell-currency">${formatCurrency(value)}</span>`;
    }
    
    if (col.type === 'date') {
        return `<span class="cell-date">${formatDate(value)}</span>`;
    }
    
    if (col.type === 'boolean') {
        return value 
            ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' 
            : '-';
    }
    
    if (col.clickable && !col.type) {
        return `<span class="cell-link">${value || '-'}</span>`;
    }
    
    return value || '-';
}

function renderPagination() {
    const totalPages = Math.ceil(state.totalCount / state.pageSize);
    const startRange = state.totalCount > 0 ? (state.page - 1) * state.pageSize + 1 : 0;
    const endRange = Math.min(state.page * state.pageSize, state.totalCount);
    
    const startRangeEl = document.getElementById('startRange');
    const endRangeEl = document.getElementById('endRange');
    const totalCountEl = document.getElementById('totalCount');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    if (startRangeEl) startRangeEl.textContent = startRange;
    if (endRangeEl) endRangeEl.textContent = endRange;
    if (totalCountEl) totalCountEl.textContent = state.totalCount.toLocaleString();
    
    if (prevBtn) prevBtn.disabled = state.page <= 1;
    if (nextBtn) nextBtn.disabled = state.page >= totalPages || totalPages === 0;
    
    // Page numbers
    const pageNumbers = document.getElementById('pageNumbers');
    if (!pageNumbers) return;
    
    let pages = [];
    
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (state.page <= 4) {
        pages = [1, 2, 3, 4, 5, '...', totalPages];
    } else if (state.page >= totalPages - 3) {
        pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
        pages = [1, '...', state.page - 1, state.page, state.page + 1, '...', totalPages];
    }
    
    pageNumbers.innerHTML = pages.map(p => {
        if (p === '...') return '<span class="page-ellipsis">...</span>';
        return `<button class="page-number ${p === state.page ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }).join('');
    
    // Attach handlers
    pageNumbers.querySelectorAll('.page-number').forEach(btn => {
        btn.addEventListener('click', () => {
            state.page = parseInt(btn.dataset.page);
            fetchData(state.currentEntity);
        });
    });
}

function renderFilters() {
    const entity = entities[state.currentEntity];
    const container = document.getElementById('filtersContainer');
    if (!container) return;
    
    container.innerHTML = entity.filters.map(filter => {
        if (filter.type === 'section') {
            const isExpanded = state.expandedFilterSections.includes(filter.id);
            return `
                <div class="filter-section">
                    <button class="filter-toggle" data-section="${filter.id}" aria-expanded="${isExpanded}">
                        ${filter.label}
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </button>
                    <div class="filter-content ${isExpanded ? '' : 'collapsed'}">
                        ${filter.fields.map(field => renderFilterField(field)).join('')}
                    </div>
                </div>
            `;
        } else {
            return renderFilterField(filter);
        }
    }).join('');
    
    // Attach handlers
    container.querySelectorAll('.filter-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            const content = btn.nextElementSibling;
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            
            btn.setAttribute('aria-expanded', !isExpanded);
            content.classList.toggle('collapsed');
            
            if (isExpanded) {
                state.expandedFilterSections = state.expandedFilterSections.filter(s => s !== section);
            } else {
                state.expandedFilterSections.push(section);
            }
        });
    });
    
    // Attach filter input handlers
    container.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('change', () => {
            const paramName = input.dataset.param;
            const value = input.type === 'checkbox' ? input.checked : input.value;
            
            if (value) {
                state.filters[paramName] = value;
            } else {
                delete state.filters[paramName];
            }
            
            state.page = 1;
            fetchData(state.currentEntity);
            updateFilterTags();
        });
    });
}

function renderFilterField(field) {
    const value = state.filters[field.paramName] || '';
    
    switch (field.type) {
        case 'text':
            return `
                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-size: 12px; font-weight: 500; color: var(--gray-600); margin-bottom: 4px;">${field.label}</label>
                    <input type="text" class="filter-input" data-param="${field.paramName}" placeholder="${field.placeholder || ''}" value="${value}">
                </div>
            `;
        
        case 'select':
            return `
                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-size: 12px; font-weight: 500; color: var(--gray-600); margin-bottom: 4px;">${field.label}</label>
                    <select class="filter-select" data-param="${field.paramName}">
                        <option value="">Any</option>
                        ${field.options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>
                </div>
            `;
        
        case 'number':
            return `
                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-size: 12px; font-weight: 500; color: var(--gray-600); margin-bottom: 4px;">${field.label}</label>
                    <input type="number" class="filter-input" data-param="${field.paramName}" placeholder="${field.placeholder || ''}" value="${value}">
                </div>
            `;
        
        case 'date':
            return `
                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-size: 12px; font-weight: 500; color: var(--gray-600); margin-bottom: 4px;">${field.label}</label>
                    <input type="date" class="filter-input" data-param="${field.paramName}" value="${value}">
                </div>
            `;
        
        case 'checkbox':
            return `
                <label class="checkbox-label">
                    <input type="checkbox" data-param="${field.paramName}" ${value ? 'checked' : ''}>
                    ${field.label}
                </label>
            `;
        
        default:
            return '';
    }
}

function updateFilterTags() {
    const container = document.getElementById('activeFilterTags');
    if (!container) return;
    
    const entity = entities[state.currentEntity];
    
    const tags = Object.entries(state.filters).map(([key, value]) => {
        const label = findFilterLabel(key, entity);
        if (!label) return '';
        return `
            <span class="filter-tag">
                ${label}: ${value === true ? 'Yes' : value}
                <button onclick="clearFilter('${key}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </span>
        `;
    }).join('');
    
    container.innerHTML = tags;
}

function findFilterLabel(key, entity) {
    for (const filter of entity.filters) {
        if (filter.paramName === key) return filter.label;
        if (filter.fields) {
            const field = filter.fields.find(f => f.paramName === key);
            if (field) return field.label;
        }
    }
    return key;
}

function updatePageHeader() {
    const entity = entities[state.currentEntity];
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    
    if (pageTitle) pageTitle.textContent = entity.title;
    if (pageSubtitle) pageSubtitle.textContent = entity.subtitle;
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === state.currentEntity);
    });
}

// ===== Detail Modal =====
async function openDetailModal(id) {
    const detail = await fetchDetail(state.currentEntity, id);
    if (!detail) return;
    
    const modal = document.getElementById('detailModal');
    const body = document.getElementById('modalBody');
    
    if (!modal || !body) return;
    
    body.innerHTML = buildDetailContent(detail);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function buildDetailContent(detail) {
    let displayName = detail.displayName || detail.roundName || detail.eventName || 'Unknown';
    let subtitle = detail.companyType ? `${detail.companyType} • ${detail.location || 'Unknown location'}` : 
                   detail.primaryJobTitle ? `${detail.primaryJobTitle} @ ${detail.primaryOrganizationName || 'Unknown'}` :
                   detail.investmentType || '';
    
    let metrics = [];
    if (detail.rank) metrics.push({ label: 'Rank', value: `#${Math.round(detail.rank)}` });
    if (detail.fundingTotalUsd) metrics.push({ label: 'Total Funding', value: formatCurrency(detail.fundingTotalUsd) });
    if (detail.numEmployeesEnum) metrics.push({ label: 'Employees', value: detail.numEmployeesEnum });
    
    const metricsHtml = metrics.length > 0 
        ? `<div class="modal-hero-meta">${metrics.map(m => `<span><strong>${m.label}:</strong> ${m.value}</span>`).join(' • ')}</div>` 
        : '';
    
    let sections = '';
    
    if (detail.description) {
        sections += `
            <div class="detail-section">
                <h4>About</h4>
                <p>${detail.description}</p>
            </div>
        `;
    }
    
    const infoItems = [];
    if (detail.foundedOn) infoItems.push({ label: 'Founded', value: formatDate(detail.foundedOn) });
    if (detail.lastFundingAt) infoItems.push({ label: 'Last Funding', value: formatDate(detail.lastFundingAt) });
    if (detail.fundingStage) infoItems.push({ label: 'Funding Stage', value: detail.fundingStage });
    if (detail.ipoStatus) infoItems.push({ label: 'IPO Status', value: detail.ipoStatus });
    if (detail.revenueRangeCode) infoItems.push({ label: 'Revenue Range', value: detail.revenueRangeCode });
    
    if (infoItems.length > 0) {
        sections += `
            <div class="detail-section">
                <h4>Key Information</h4>
                <div class="detail-list">
                    ${infoItems.map(item => `
                        <div class="detail-item">
                            <span class="detail-item-label">${item.label}</span>
                            <span class="detail-item-value">${item.value || '-'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    return `
        <div class="modal-hero">
            <div class="modal-hero-logo">${displayName.substring(0, 2).toUpperCase()}</div>
            <div class="modal-hero-content">
                <h2 class="modal-hero-title">${displayName}</h2>
                ${subtitle ? `<p class="modal-hero-subtitle">${subtitle}</p>` : ''}
                ${metricsHtml}
            </div>
        </div>
        <div class="detail-grid">
            ${sections}
        </div>
    `;
}

function closeModal() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Column Chooser =====
function renderColumnChooser() {
    const entity = entities[state.currentEntity];
    const list = document.getElementById('columnList');
    const dropdown = document.getElementById('columnDropdown');
    const btn = document.getElementById('columnsBtn');
    
    if (!list || !dropdown || !btn) return;
    
    const allColumns = [...entity.columns, ...(entity.hiddenColumns || [])];
    
    list.innerHTML = allColumns.map(col => `
        <div class="dropdown-item" data-column="${col.key}">
            <input type="checkbox" ${state.columnVisibility[col.key] !== false ? 'checked' : ''}>
            <span>${col.label}</span>
        </div>
    `).join('');
    
    const rect = btn.getBoundingClientRect();
    dropdown.style.top = rect.bottom + 8 + 'px';
    dropdown.style.right = window.innerWidth - rect.right + 'px';
    dropdown.style.display = 'block';
    
    list.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                const checkbox = item.querySelector('input');
                checkbox.checked = !checkbox.checked;
            }
            const colKey = item.dataset.column;
            state.columnVisibility[colKey] = item.querySelector('input').checked;
            renderTable();
        });
    });
}

function hideColumnChooser(e) {
    const dropdown = document.getElementById('columnDropdown');
    const btn = document.getElementById('columnsBtn');
    if (!dropdown || !btn) return;
    if (!dropdown.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        dropdown.style.display = 'none';
    }
}

// ===== Helper Functions =====
function formatCurrency(value) {
    if (!value) return '-';
    if (value === 'undisclosed' || value === 'Undisclosed') return 'Undisclosed';
    
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return value;
    
    if (num >= 1e12) return '$' + (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(1) + 'K';
    return '$' + num.toLocaleString();
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getAvatarColor(seed) {
    const colors = [
        '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', 
        '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    let hash = 0;
    const str = String(seed || '');
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.toggle('active', show);
}

function showEmptyState(show) {
    const empty = document.getElementById('emptyState');
    if (empty) empty.classList.toggle('active', show);
}

function hideEmptyState() {
    const empty = document.getElementById('emptyState');
    if (empty) empty.classList.remove('active');
}

function clearFilter(key) {
    delete state.filters[key];
    renderFilters();
    updateFilterTags();
    state.page = 1;
    fetchData(state.currentEntity);
}

function clearAllFilters() {
    state.filters = {};
    renderFilters();
    updateFilterTags();
    state.page = 1;
    fetchData(state.currentEntity);
}

function toggleFilters() {
    const panel = document.getElementById('filtersPanel');
    const btn = document.getElementById('toggleFilters');
    
    if (!panel || !btn) return;
    
    state.filtersVisible = !state.filtersVisible;
    panel.classList.toggle('collapsed', !state.filtersVisible);
    btn.classList.toggle('active', state.filtersVisible);
}

// ===== Event Handlers =====
function initEventHandlers() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (section && section !== state.currentEntity) {
                state.currentEntity = section;
                state.page = 1;
                state.filters = {};
                state.sortColumn = '';  // Reset sort
                state.sortDirection = 'Descending';
                updatePageHeader();
                renderFilters();
                fetchData(section);
            }
        });
    });
    
    // Filters toggle
    const toggleFiltersBtn = document.getElementById('toggleFilters');
    if (toggleFiltersBtn) toggleFiltersBtn.addEventListener('click', toggleFilters);
    
    // Clear all filters
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllFilters);
    
    // Pagination
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (state.page > 1) {
                state.page--;
                fetchData(state.currentEntity);
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(state.totalCount / state.pageSize);
            if (state.page < totalPages) {
                state.page++;
                fetchData(state.currentEntity);
            }
        });
    }
    
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', (e) => {
            state.pageSize = parseInt(e.target.value);
            state.page = 1;
            fetchData(state.currentEntity);
        });
    }
    
    // Column chooser
    const columnsBtn = document.getElementById('columnsBtn');
    if (columnsBtn) columnsBtn.addEventListener('click', renderColumnChooser);
    document.addEventListener('click', hideColumnChooser);
    
    const resetColumnsBtn = document.getElementById('resetColumnsBtn');
    if (resetColumnsBtn) {
        resetColumnsBtn.addEventListener('click', () => {
            state.columnVisibility = {};
            renderTable();
            renderColumnChooser();
        });
    }
    
    // Modal
    const modalClose = document.getElementById('modalClose');
    const modalBackdrop = document.getElementById('modalBackdrop');
    
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    // Global search keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            const globalSearchInput = document.getElementById('globalSearchInput');
            if (globalSearchInput) globalSearchInput.focus();
        }
    });
    
    // Table search
    const tableSearch = document.getElementById('tableSearch');
    if (tableSearch) {
        tableSearch.addEventListener('input', (e) => {
            state.filters.searchText = e.target.value;
            state.page = 1;
            clearTimeout(window.searchTimeout);
            window.searchTimeout = setTimeout(() => fetchData(state.currentEntity), 300);
        });
    }
}

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    updatePageHeader();
    renderFilters();
    initEventHandlers();
    fetchData(state.currentEntity);
});
