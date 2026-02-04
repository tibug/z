// Event Detail Page JavaScript

document.addEventListener('DOMContentLoaded', async () => {
    const pathParts = window.location.pathname.split('/');
    const slug = pathParts[pathParts.length - 1];
    
    // Extract ID from slug (format: permalink-id or just id)
    let eventId = null;
    let permalink = null;
    
    const lastDashIndex = slug.lastIndexOf('-');
    if (lastDashIndex > 0) {
        const possibleId = slug.substring(lastDashIndex + 1);
        if (/^\d+$/.test(possibleId)) {
            eventId = parseInt(possibleId);
            permalink = slug.substring(0, lastDashIndex);
        }
    }
    
    if (!eventId && /^\d+$/.test(slug)) {
        eventId = parseInt(slug);
    }
    
    if (!eventId && slug) {
        permalink = slug;
    }
    
    try {
        let data;
        if (eventId) {
            const response = await fetch(`/api/events/${eventId}`);
            if (!response.ok) throw new Error('Not found');
            data = await response.json();
        } else if (permalink) {
            const response = await fetch(`/api/events/by-permalink/${permalink}`);
            if (!response.ok) throw new Error('Not found');
            data = await response.json();
        } else {
            throw new Error('Invalid URL');
        }
        
        renderEvent(data);
    } catch (error) {
        console.error('Error loading event:', error);
        showError();
    }
});

function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'flex';
}

function renderEvent(data) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    
    // Update page title
    document.title = `${data.eventName || 'Event'} - Crunchbase Explorer`;
    
    // Render header
    renderHeader(data);
    
    // Render stats grid
    renderStatsGrid(data);
    
    // Render about section
    if (data.description || data.shortDescription) {
        document.getElementById('aboutSection').style.display = 'block';
        document.getElementById('description').textContent = data.description || data.shortDescription;
    }
    
    // Render participants
    renderParticipants('speakers', data.speakers || []);
    renderParticipants('sponsors', data.sponsors || []);
    renderParticipants('contestants', data.contestants || []);
    renderParticipants('organizers', data.organizers || []);
    renderParticipants('exhibitors', data.exhibitors || []);
    
    // Render press references
    renderPress(data.pressReferences || []);
    
    // Render sidebar details
    renderEventDetails(data);
    renderLocation(data);
    renderLinks(data);
    renderRankingTrends(data);
    renderAliases(data.permalinkAliases || []);
}

function renderHeader(data) {
    // Event name
    document.getElementById('eventName').textContent = data.eventName || 'Event';
    
    // Subtitle with dates
    const subtitle = [];
    if (data.startsOn) {
        const startDate = formatDate(data.startsOn);
        const endDate = data.endsOn ? formatDate(data.endsOn) : null;
        if (endDate && endDate !== startDate) {
            subtitle.push(`${startDate} - ${endDate}`);
        } else {
            subtitle.push(startDate);
        }
    }
    if (data.venueName) subtitle.push(data.venueName);
    document.getElementById('eventSubtitle').textContent = subtitle.join(' • ');
    
    // Badges
    const badges = [];
    if (data.eventType) badges.push({ text: data.eventType, class: 'badge-type' });
    if (data.eventFormat) badges.push({ text: data.eventFormat, class: 'badge-format' });
    if (data.eventStatus) badges.push({ text: data.eventStatus, class: `badge-status-${data.eventStatus.toLowerCase()}` });
    
    document.getElementById('headerBadges').innerHTML = badges.map(b => 
        `<span class="badge ${b.class}">${b.text}</span>`
    ).join('');
    
    // Meta info
    const meta = [];
    if (data.city && data.country) {
        meta.push(`${data.city}, ${data.country}`);
    } else if (data.city) {
        meta.push(data.city);
    } else if (data.country) {
        meta.push(data.country);
    }
    
    document.getElementById('headerMeta').innerHTML = meta.map(m => 
        `<span class="meta-item">${m}</span>`
    ).join('<span class="meta-separator">•</span>');
    
    // Rank card
    if (data.rankEvent) {
        document.getElementById('rankCard').style.display = 'flex';
        document.getElementById('rankValue').textContent = `#${Math.round(data.rankEvent).toLocaleString()}`;
        
        // Rank delta
        if (data.rankDeltaD7) {
            const isPositive = data.rankDeltaD7 < 0; // Lower rank = better
            const deltaClass = isPositive ? 'rank-up' : 'rank-down';
            const arrow = isPositive ? '↑' : '↓';
            document.getElementById('rankDelta').innerHTML = 
                `<span class="${deltaClass}">${arrow} ${Math.abs(Math.round(data.rankDeltaD7))} (7d)</span>`;
        }
    }
    
    // Avatar with event image
    if (data.imageUrl) {
        document.getElementById('eventAvatar').innerHTML = 
            `<img src="${data.imageUrl}" alt="Event" onerror="this.parentElement.innerHTML='<svg width=32 height=32 viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><rect x=\\'3\\' y=\\'4\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\' ry=\\'2\\'/><line x1=\\'16\\' y1=\\'2\\' x2=\\'16\\' y2=\\'6\\'/><line x1=\\'8\\' y1=\\'2\\' x2=\\'8\\' y2=\\'6\\'/><line x1=\\'3\\' y1=\\'10\\' x2=\\'21\\' y2=\\'10\\'/></svg>'">`;
    }
}

function renderStatsGrid(data) {
    const stats = [];
    
    if (data.numSpeakers) stats.push({ label: 'Speakers', value: data.numSpeakers.toLocaleString() });
    if (data.numSponsors) stats.push({ label: 'Sponsors', value: data.numSponsors.toLocaleString() });
    if (data.numOrganizers) stats.push({ label: 'Organizers', value: data.numOrganizers.toLocaleString() });
    if (data.numExhibitors) stats.push({ label: 'Exhibitors', value: data.numExhibitors.toLocaleString() });
    if (data.numContestants) stats.push({ label: 'Contestants', value: data.numContestants.toLocaleString() });
    
    document.getElementById('statsGrid').innerHTML = stats.map(s => `
        <div class="stat-card">
            <span class="stat-value">${s.value}</span>
            <span class="stat-label">${s.label}</span>
        </div>
    `).join('');
}

function renderParticipants(type, participants) {
    if (participants.length === 0) return;
    
    const sectionId = `${type}Section`;
    const gridId = `${type}Grid`;
    
    document.getElementById(sectionId).style.display = 'block';
    
    document.getElementById(gridId).innerHTML = participants.map(p => {
        const initials = (p.participantName || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const avatarColor = getAvatarColor(p.participantEntityId || p.participantName);
        const isPerson = p.participantType === 'person';
        
        let imageHtml = p.participantImageUrl
            ? `<img src="${p.participantImageUrl}" alt="${p.participantName}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="participant-avatar-fallback" style="display:none;background:${avatarColor}">${initials}</div>`
            : `<div class="participant-avatar-fallback" style="background:${avatarColor}">${initials}</div>`;
        
        const link = isPerson 
            ? `/app/person/${p.participantPermalink || ''}-${p.participantEntityId}`
            : `/app/organization/${p.participantPermalink || ''}-${p.participantEntityId}`;
        
        // For speakers, show their organization
        let subtitle = '';
        if (isPerson && p.primaryOrganizationName) {
            subtitle = `<span class="participant-org">${p.title ? p.title + ' at ' : ''}${p.primaryOrganizationName}</span>`;
        } else if (p.title) {
            subtitle = `<span class="participant-title">${p.title}</span>`;
        } else if (p.role) {
            subtitle = `<span class="participant-role">${p.role}</span>`;
        }
        
        return `
            <a href="${link}" class="participant-card">
                <div class="participant-avatar">${imageHtml}</div>
                <div class="participant-info">
                    <h4>${p.participantName || 'Unknown'}</h4>
                    ${subtitle}
                </div>
            </a>
        `;
    }).join('');
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

function renderEventDetails(data) {
    const details = [];
    
    if (data.eventType) details.push({ label: 'Event Type', value: data.eventType });
    if (data.eventFormat) details.push({ label: 'Format', value: data.eventFormat });
    if (data.eventStatus) details.push({ label: 'Status', value: data.eventStatus });
    if (data.startsOn) details.push({ label: 'Start Date', value: formatDate(data.startsOn) });
    if (data.endsOn) details.push({ label: 'End Date', value: formatDate(data.endsOn) });
    if (data.permalink) details.push({ label: 'Permalink', value: data.permalink });
    if (data.createdAt) details.push({ label: 'Record Created', value: formatDate(data.createdAt) });
    if (data.updatedAt) details.push({ label: 'Last Updated', value: formatDate(data.updatedAt) });
    
    document.getElementById('eventDetails').innerHTML = details.map(d => `
        <div class="detail-row">
            <dt>${d.label}</dt>
            <dd>${d.value}</dd>
        </div>
    `).join('');
}

function renderLocation(data) {
    if (!data.venueName && !data.city && !data.country) return;
    
    document.getElementById('locationSection').style.display = 'block';
    
    let html = '';
    
    if (data.venueName) {
        html += `<div class="location-venue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>${data.venueName}</span>
        </div>`;
    }
    
    const location = [data.city, data.region, data.country].filter(Boolean).join(', ');
    if (location) {
        html += `<div class="location-address">${location}</div>`;
    }
    
    document.getElementById('locationInfo').innerHTML = html;
}

function renderLinks(data) {
    const links = [];
    
    if (data.eventUrl) {
        links.push({ label: 'Event Website', url: data.eventUrl, icon: 'globe' });
    }
    if (data.registrationUrl) {
        links.push({ label: 'Registration', url: data.registrationUrl, icon: 'ticket' });
    }
    
    if (links.length === 0) return;
    
    document.getElementById('linksSection').style.display = 'block';
    
    document.getElementById('linksList').innerHTML = links.map(link => `
        <a href="${link.url}" target="_blank" rel="noopener" class="link-item">
            ${getLinkIcon(link.icon)}
            <span>${link.label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
        </a>
    `).join('');
}

function getLinkIcon(type) {
    const icons = {
        globe: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        ticket: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>'
    };
    return icons[type] || icons.globe;
}

function renderRankingTrends(data) {
    if (!data.rankDeltaD7 && !data.rankDeltaD30 && !data.rankDeltaD90) return;
    
    document.getElementById('rankingSection').style.display = 'block';
    
    const trends = [];
    if (data.rankDeltaD7 !== null && data.rankDeltaD7 !== undefined) {
        trends.push({ period: '7 days', delta: data.rankDeltaD7 });
    }
    if (data.rankDeltaD30 !== null && data.rankDeltaD30 !== undefined) {
        trends.push({ period: '30 days', delta: data.rankDeltaD30 });
    }
    if (data.rankDeltaD90 !== null && data.rankDeltaD90 !== undefined) {
        trends.push({ period: '90 days', delta: data.rankDeltaD90 });
    }
    
    document.getElementById('rankTrends').innerHTML = trends.map(t => {
        const isPositive = t.delta < 0; // Lower rank = better
        const colorClass = isPositive ? 'trend-positive' : t.delta > 0 ? 'trend-negative' : 'trend-neutral';
        const arrow = isPositive ? '↑' : t.delta > 0 ? '↓' : '→';
        return `
            <div class="rank-trend-item ${colorClass}">
                <span class="trend-period">${t.period}</span>
                <span class="trend-value">${arrow} ${Math.abs(Math.round(t.delta))}</span>
            </div>
        `;
    }).join('');
}

function renderAliases(aliases) {
    if (aliases.length === 0) return;
    
    document.getElementById('aliasesSection').style.display = 'block';
    document.getElementById('aliasesList').innerHTML = aliases.map(a => 
        `<span class="alias-tag">${a}</span>`
    ).join('');
}

// Utility functions
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
