// ===== State Management =====
const state = {
    currentEntity: 'organizations',
    page: 1,
    pageSize: 25,
    sortColumn: 'Rank',
    sortDirection: 'desc',
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

// ===== Entity Configurations with Database Column Mapping =====
const entities = {
    organizations: {
        title: 'Organizations',
        subtitle: 'Discover and track companies',
        apiEndpoint: '/organizations',
        idField: 'OrganizationId',
        columns: [
            { key: 'DisplayName', label: 'Name', width: '250px', sortable: true, clickable: true, type: 'avatar' },
            { key: 'Location', label: 'Location', width: '150px', sortable: true },
            { key: 'CompanyType', label: 'Type', width: '120px', sortable: true, type: 'badge' },
            { key: 'OperatingStatus', label: 'Status', width: '120px', sortable: true, type: 'badge' },
            { key: 'FundingStage', label: 'Stage', width: '130px', sortable: true, type: 'badge' },
            { key: 'FundingTotalUsd', label: 'Total Funding', width: '140px', sortable: true, type: 'currency' },
            { key: 'NumEmployeesEnum', label: 'Employees', width: '120px', sortable: true },
            { key: 'Rank', label: 'Rank', width: '100px', sortable: true }
        ],
        hiddenColumns: [
            { key: 'IpoStatus', label: 'IPO Status' },
            { key: 'LastFundingAt', label: 'Last Funding Date', type: 'date' },
            { key: 'FoundedOn', label: 'Founded Date', type: 'date' },
            { key: 'RevenueRangeCode', label: 'Revenue Range' }
        ],
        filters: [
            {
                id: 'quickSearch',
                label: 'Quick Search',
                type: 'text',
                placeholder: 'Search name, description...',
                paramName: 'search'
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
                    { label: 'Company Type', type: 'select', paramName: 'companyType', options: ['Company', 'Investor', 'School', 'Group'] },
                    { label: 'Operating Status', type: 'select', paramName: 'operatingStatus', options: ['Operating', 'Closed', 'Acquired', 'IPO'] },
                    { label: 'IPO Status', type: 'select', paramName: 'ipoStatus', options: ['Private', 'Public', 'Delisted'] }
                ]
            },
            {
                id: 'funding',
                label: 'Funding',
                type: 'section',
                fields: [
                    { label: 'Funding Stage', type: 'select', paramName: 'fundingStage', options: ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'IPO'] },
                    { label: 'Min Funding', type: 'number', paramName: 'minFunding', placeholder: 'USD' },
                    { label: 'Max Funding', type: 'number', paramName: 'maxFunding', placeholder: 'USD' }
                ]
            },
            {
                id: 'metrics',
                label: 'Size & Metrics',
                type: 'section',
                fields: [
                    { label: 'Founded After', type: 'date', paramName: 'foundedAfter' },
                    { label: 'Founded Before', type: 'date', paramName: 'foundedBefore' },
                    { label: 'Has Website', type: 'checkbox', paramName: 'hasWebsite' }
                ]
            }
        ]
    },
    people: {
        title: 'People',
        subtitle: 'Discover key people in the ecosystem',
        apiEndpoint: '/people',
        idField: 'PersonId',
        columns: [
            { key: 'DisplayName', label: 'Name', width: '200px', sortable: true, clickable: true, type: 'avatar' },
            { key: 'PrimaryOrganizationName', label: 'Primary Organization', width: '200px', sortable: true, clickable: true },
            { key: 'PrimaryJobTitle', label: 'Title', width: '200px', sortable: true },
            { key: 'Location', label: 'Location', width: '150px', sortable: true },
            { key: 'IsInvestor', label: 'Is Investor', width: '100px', sortable: true, type: 'boolean' },
            { key: 'NumInvestments', label: '# Investments', width: '120px', sortable: true },
            { key: 'NumFoundedOrganizations', label: '# Founded Orgs', width: '130px', sortable: true },
            { key: 'RankPerson', label: 'Rank', width: '100px', sortable: true }
        ],
        hiddenColumns: [
            { key: 'Gender', label: 'Gender' },
            { key: 'NumCurrentJobs', label: '# Current Jobs' },
            { key: 'NumEventAppearances', label: '# Event Appearances' }
        ],
        filters: [
            {
                id: 'quickSearch',
                label: 'Quick Search',
                type: 'text',
                placeholder: 'Search name...',
                paramName: 'search'
            },
            {
                id: 'profile',
                label: 'Profile',
                type: 'section',
                fields: [
                    { label: 'Gender', type: 'select', paramName: 'gender', options: ['Male', 'Female', 'Other'] },
                    { label: 'Has Photo', type: 'checkbox', paramName: 'hasPhoto' }
                ]
            },
            {
                id: 'organizations',
                label: 'Organizations',
                type: 'section',
                fields: [
                    { label: 'Has Primary Organization', type: 'checkbox', paramName: 'hasPrimaryOrg' },
                    { label: 'Is Investor', type: 'checkbox', paramName: 'isInvestor' },
                    { label: 'Min Investments', type: 'number', paramName: 'minInvestments' },
                    { label: 'Min Founded Orgs', type: 'number', paramName: 'minFoundedOrgs' }
                ]
            }
        ]
    },
    'funding-rounds': {
        title: 'Funding Rounds',
        subtitle: 'Track investment rounds',
        apiEndpoint: '/fundingrounds',
        idField: 'FundingRoundId',
        columns: [
            { key: 'RoundName', label: 'Round Name', width: '200px', sortable: true, clickable: true },
            { key: 'OrganizationName', label: 'Organization', width: '200px', sortable: true, clickable: true },
            { key: 'AnnouncedOn', label: 'Announced Date', width: '140px', sortable: true, type: 'date' },
            { key: 'InvestmentType', label: 'Investment Type', width: '150px', sortable: true, type: 'badge' },
            { key: 'MoneyRaisedUsd', label: 'Money Raised', width: '140px', sortable: true, type: 'currency' },
            { key: 'NumInvestors', label: '# Investors', width: '110px', sortable: true }
        ],
        hiddenColumns: [
            { key: 'ClosedOn', label: 'Closed Date', type: 'date' },
            { key: 'IsEquity', label: 'Is Equity', type: 'boolean' },
            { key: 'PreMoneyValuationUsd', label: 'Pre-money Valuation', type: 'currency' },
            { key: 'PostMoneyValuationUsd', label: 'Post-money Valuation', type: 'currency' }
        ],
        filters: [
            {
                id: 'dates',
                label: 'Dates',
                type: 'section',
                fields: [
                    { label: 'Announced After', type: 'date', paramName: 'announcedAfter' },
                    { label: 'Announced Before', type: 'date', paramName: 'announcedBefore' }
                ]
            },
            {
                id: 'investment',
                label: 'Investment Details',
                type: 'section',
                fields: [
                    { label: 'Investment Type', type: 'select', paramName: 'investmentType', options: ['Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'Venture', 'Angel', 'Private Equity'] },
                    { label: 'Is Equity', type: 'checkbox', paramName: 'isEquity' },
                    { label: 'Min Amount', type: 'number', paramName: 'minAmount', placeholder: 'USD' },
                    { label: 'Max Amount', type: 'number', paramName: 'maxAmount', placeholder: 'USD' }
                ]
            }
        ]
    },
    investments: {
        title: 'Investments',
        subtitle: 'Track investor activity',
        apiEndpoint: '/investments',
        idField: 'InvestmentId',
        columns: [
            { key: 'InvestorName', label: 'Investor', width: '200px', sortable: true, clickable: true },
            { key: 'InvestorType', label: 'Investor Type', width: '120px', sortable: true, type: 'badge' },
            { key: 'FundedOrgName', label: 'Funded Organization', width: '200px', sortable: true, clickable: true },
            { key: 'FundingRoundName', label: 'Funding Round', width: '200px', sortable: true, clickable: true },
            { key: 'AnnouncedOn', label: 'Investment Date', width: '140px', sortable: true, type: 'date' },
            { key: 'Amount', label: 'Amount', width: '140px', sortable: true, type: 'currency' }
        ],
        hiddenColumns: [
            { key: 'IsLeadInvestor', label: 'Is Lead Investor', type: 'boolean' }
        ],
        filters: [
            {
                id: 'investor',
                label: 'Investor',
                type: 'section',
                fields: [
                    { label: 'Investor Type', type: 'select', paramName: 'investorType', options: ['Organization', 'Person', 'Both'] },
                    { label: 'Is Lead Investor', type: 'checkbox', paramName: 'isLeadInvestor' }
                ]
            },
            {
                id: 'dates',
                label: 'Dates',
                type: 'section',
                fields: [
                    { label: 'Date After', type: 'date', paramName: 'dateAfter' },
                    { label: 'Date Before', type: 'date', paramName: 'dateBefore' }
                ]
            }
        ]
    },
    acquisitions: {
        title: 'Acquisitions',
        subtitle: 'Track M&A activity',
        apiEndpoint: '/acquisitions',
        idField: 'AcquisitionId',
        columns: [
            { key: 'AcquireeName', label: 'Acquiree', width: '200px', sortable: true, clickable: true },
            { key: 'AcquirerName', label: 'Acquirer', width: '200px', sortable: true, clickable: true },
            { key: 'AnnouncedOn', label: 'Announced Date', width: '140px', sortable: true, type: 'date' },
            { key: 'CompletedOn', label: 'Completed Date', width: '140px', sortable: true, type: 'date' },
            { key: 'PriceUsd', label: 'Price', width: '140px', sortable: true, type: 'currency' },
            { key: 'Status', label: 'Status', width: '120px', sortable: true, type: 'badge' }
        ],
        filters: [
            {
                id: 'companies',
                label: 'Companies',
                type: 'section',
                fields: [
                    { label: 'Acquiree Name', type: 'text', paramName: 'acquireeName' },
                    { label: 'Acquirer Name', type: 'text', paramName: 'acquirerName' }
                ]
            },
            {
                id: 'dates',
                label: 'Dates',
                type: 'section',
                fields: [
                    { label: 'Announced After', type: 'date', paramName: 'announcedAfter' },
                    { label: 'Announced Before', type: 'date', paramName: 'announcedBefore' }
                ]
            },
            {
                id: 'status',
                label: 'Status',
                type: 'section',
                fields: [
                    { label: 'Status', type: 'select', paramName: 'status', options: ['Completed', 'Pending', 'Cancelled'] }
                ]
            }
        ]
    },
    events: {
        title: 'Events',
        subtitle: 'Discover industry events',
        apiEndpoint: '/events',
        idField: 'EventId',
        columns: [
            { key: 'DisplayName', label: 'Event Name', width: '250px', sortable: true, clickable: true },
            { key: 'StartsOn', label: 'Start Date', width: '130px', sortable: true, type: 'date' },
            { key: 'EndsOn', label: 'End Date', width: '130px', sortable: true, type: 'date' },
            { key: 'Location', label: 'Location', width: '180px', sortable: true },
            { key: 'EventType', label: 'Type', width: '130px', sortable: true, type: 'badge' },
            { key: 'NumSpeakers', label: '# Speakers', width: '110px', sortable: true },
            { key: 'NumSponsors', label: '# Sponsors', width: '110px', sortable: true }
        ],
        hiddenColumns: [
            { key: 'NumExhibitors', label: '# Exhibitors' },
            { key: 'NumAttendees', label: '# Attendees' }
        ],
        filters: [
            {
                id: 'quickSearch',
                label: 'Quick Search',
                type: 'text',
                placeholder: 'Search event name...',
                paramName: 'search'
            },
            {
                id: 'dates',
                label: 'Dates',
                type: 'section',
                fields: [
                    { label: 'Starts After', type: 'date', paramName: 'startsAfter' },
                    { label: 'Starts Before', type: 'date', paramName: 'startsBefore' }
                ]
            },
            {
                id: 'details',
                label: 'Event Details',
                type: 'section',
                fields: [
                    { label: 'Event Type', type: 'select', paramName: 'eventType', options: ['Conference', 'Meetup', 'Workshop', 'Webinar', 'Summit'] },
                    { label: 'Is Virtual', type: 'checkbox', paramName: 'isVirtual' },
                    { label: 'Is Hybrid', type: 'checkbox', paramName: 'isHybrid' }
                ]
            }
        ]
    }
};

// ===== API Functions =====
async function fetchData(entityKey) {
    const entity = entities[entityKey];
    const params = new URLSearchParams();
    
    // Pagination
    params.set('page', state.page);
    params.set('pageSize', state.pageSize);
    
    // Sorting
    if (state.sortColumn) {
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
    
    try {
        showLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        
        state.data = result.items || [];
        state.totalCount = result.totalCount || 0;
        
        renderTable();
        renderPagination();
    } catch (error) {
        console.error('Error fetching data:', error);
        showEmptyState(true);
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
    
    // Render headers
    thead.innerHTML = `
        <tr>
            ${entity.columns.map(col => {
                const isSorted = state.sortColumn === col.key;
                const sortIcon = isSorted 
                    ? state.sortDirection === 'asc' 
                        ? '<svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>'
                        : '<svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>'
                    : '<svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/><polyline points="6 9 12 15 18 9"/></svg>';
                
                return `
                    <th 
                        style="width: ${col.width || 'auto'}"
                        ${col.sortable ? 'class="sortable" data-column="' + col.key + '"' : ''}
                        ${isSorted ? 'class="sorted sortable" data-column="' + col.key + '"' : ''}
                    >
                        <div class="th-content">
                            ${col.label}
                            ${col.sortable ? sortIcon : ''}
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
    
    // Attach sort handlers
    thead.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.column;
            handleSort(column);
        });
    });
    
    // Attach row click handlers
    tbody.querySelectorAll('tr.clickable').forEach(tr => {
        tr.addEventListener('click', () => {
            const id = tr.dataset.id;
            openDetailModal(id);
        });
    });
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
                    ${row.Permalink ? `<span>${row.Permalink}</span>` : ''}
                </div>
            </div>
        `;
    }
    
    if (col.type === 'badge') {
        let badgeClass = '';
        if (col.key === 'CompanyType' || col.key === 'InvestorType') {
            badgeClass = `badge-${(value || '').toLowerCase().replace(' ', '-')}`;
        } else if (col.key === 'OperatingStatus' || col.key === 'Status') {
            badgeClass = `badge-${(value || '').toLowerCase().replace(' ', '-')}`;
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
    
    document.getElementById('startRange').textContent = startRange;
    document.getElementById('endRange').textContent = endRange;
    document.getElementById('totalCount').textContent = state.totalCount.toLocaleString();
    
    document.getElementById('prevPageBtn').disabled = state.page <= 1;
    document.getElementById('nextPageBtn').disabled = state.page >= totalPages;
    
    // Page numbers
    const pageNumbers = document.getElementById('pageNumbers');
    let pages = [];
    
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (state.page <= 4) {
            pages = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (state.page >= totalPages - 3) {
            pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', state.page - 1, state.page, state.page + 1, '...', totalPages];
        }
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
    document.getElementById('pageTitle').textContent = entity.title;
    document.getElementById('pageSubtitle').textContent = entity.subtitle;
    
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
    
    // Build modal content based on entity type
    body.innerHTML = buildDetailContent(detail);
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function buildDetailContent(detail) {
    const entity = entities[state.currentEntity];
    
    // Get display name
    let displayName = detail.DisplayName || detail.RoundName || detail.EventName || 'Unknown';
    let subtitle = detail.CompanyType ? `${detail.CompanyType} • ${detail.Location || 'Unknown location'}` : 
                   detail.PrimaryJobTitle ? `${detail.PrimaryJobTitle} @ ${detail.PrimaryOrganizationName || 'Unknown'}` :
                   detail.InvestmentType || '';
    
    // Build metrics
    let metrics = [];
    if (detail.Rank) metrics.push({ label: 'Rank', value: `#${Math.round(detail.Rank)}` });
    if (detail.FundingTotalUsd) metrics.push({ label: 'Total Funding', value: formatCurrency(detail.FundingTotalUsd) });
    if (detail.NumEmployeesEnum) metrics.push({ label: 'Employees', value: detail.NumEmployeesEnum });
    
    const metricsHtml = metrics.length > 0 
        ? `<div class="modal-hero-meta">${metrics.map(m => `<span><strong>${m.label}:</strong> ${m.value}</span>`).join(' • ')}</div>` 
        : '';
    
    // Build sections based on available data
    let sections = '';
    
    if (detail.Description) {
        sections += `
            <div class="detail-section">
                <h4>About</h4>
                <p>${detail.Description}</p>
            </div>
        `;
    }
    
    // Add key info section
    const infoItems = [];
    if (detail.FoundedOn) infoItems.push({ label: 'Founded', value: formatDate(detail.FoundedOn) });
    if (detail.LastFundingAt) infoItems.push({ label: 'Last Funding', value: formatDate(detail.LastFundingAt) });
    if (detail.FundingStage) infoItems.push({ label: 'Funding Stage', value: detail.FundingStage });
    if (detail.IpoStatus) infoItems.push({ label: 'IPO Status', value: detail.IpoStatus });
    if (detail.RevenueRangeCode) infoItems.push({ label: 'Revenue Range', value: detail.RevenueRangeCode });
    if (detail.Email) infoItems.push({ label: 'Email', value: detail.Email });
    if (detail.Phone) infoItems.push({ label: 'Phone', value: detail.Phone });
    if (detail.NumInvestments !== undefined) infoItems.push({ label: 'Investments', value: detail.NumInvestments });
    if (detail.NumFoundedOrganizations !== undefined) infoItems.push({ label: 'Founded Orgs', value: detail.NumFoundedOrganizations });
    
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
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Column Chooser =====
function renderColumnChooser() {
    const entity = entities[state.currentEntity];
    const list = document.getElementById('columnList');
    const dropdown = document.getElementById('columnDropdown');
    const btn = document.getElementById('columnsBtn');
    
    const allColumns = [...entity.columns, ...(entity.hiddenColumns || [])];
    
    list.innerHTML = allColumns.map(col => `
        <div class="dropdown-item" data-column="${col.key}">
            <input type="checkbox" ${state.columnVisibility[col.key] !== false ? 'checked' : ''}>
            <span>${col.label}</span>
        </div>
    `).join('');
    
    // Position dropdown
    const rect = btn.getBoundingClientRect();
    dropdown.style.top = rect.bottom + 8 + 'px';
    dropdown.style.right = window.innerWidth - rect.right + 'px';
    dropdown.style.display = 'block';
    
    // Attach handlers
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
    if (!dropdown.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        dropdown.style.display = 'none';
    }
}

// ===== Helper Functions =====
function handleSort(column) {
    if (state.sortColumn === column) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        state.sortColumn = column;
        state.sortDirection = 'desc';
    }
    fetchData(state.currentEntity);
}

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
    overlay.classList.toggle('active', show);
}

function showEmptyState(show) {
    const empty = document.getElementById('emptyState');
    empty.classList.toggle('active', show);
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
            if (section !== state.currentEntity) {
                state.currentEntity = section;
                state.page = 1;
                state.filters = {};
                state.sortColumn = 'Rank';
                state.sortDirection = 'desc';
                updatePageHeader();
                renderFilters();
                fetchData(section);
            }
        });
    });
    
    // Filters toggle
    document.getElementById('toggleFilters').addEventListener('click', toggleFilters);
    
    // Clear all filters
    document.getElementById('clearAllBtn').addEventListener('click', clearAllFilters);
    
    // Pagination
    document.getElementById('prevPageBtn').addEventListener('click', () => {
        if (state.page > 1) {
            state.page--;
            fetchData(state.currentEntity);
        }
    });
    
    document.getElementById('nextPageBtn').addEventListener('click', () => {
        const totalPages = Math.ceil(state.totalCount / state.pageSize);
        if (state.page < totalPages) {
            state.page++;
            fetchData(state.currentEntity);
        }
    });
    
    document.getElementById('pageSizeSelect').addEventListener('change', (e) => {
        state.pageSize = parseInt(e.target.value);
        state.page = 1;
        fetchData(state.currentEntity);
    });
    
    // Column chooser
    document.getElementById('columnsBtn').addEventListener('click', renderColumnChooser);
    document.addEventListener('click', hideColumnChooser);
    
    document.getElementById('resetColumnsBtn').addEventListener('click', () => {
        state.columnVisibility = {};
        renderTable();
        renderColumnChooser();
    });
    
    // Modal
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalBackdrop').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    // Global search keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('globalSearchInput').focus();
        }
    });
    
    // Table search
    document.getElementById('tableSearch').addEventListener('input', (e) => {
        state.filters.searchText = e.target.value;
        state.page = 1;
        // Debounce
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => fetchData(state.currentEntity), 300);
    });
}

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    updatePageHeader();
    renderFilters();
    initEventHandlers();
    fetchData(state.currentEntity);
});
