/**
 * AI Limit Tracker - Popup Script
 * Fetches usage limits from localhost and renders dynamic UI
 */

const DEFAULT_API_URL = 'http://localhost:8080/account-limits';
const API_TIMEOUT_MS = 3000; // 3 seconds timeout

/**
 * Get the current API endpoint from storage or use default
 */
async function getApiEndpoint() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['customApiUrl'], (result) => {
            resolve(result.customApiUrl || DEFAULT_API_URL);
        });
    });
}

/**
 * Save custom API URL to storage
 */
function saveApiUrl(url) {
    chrome.storage.local.set({ customApiUrl: url });
}

// Model Group Definitions
const MODEL_GROUPS = [
    { id: 'claude-opus', name: 'Claude Opus', pattern: /claude.*opus/i },
    { id: 'claude-sonnet', name: 'Claude Sonnet', pattern: /claude.*sonnet/i },
    { id: 'claude-haiku', name: 'Claude Haiku', pattern: /claude.*haiku/i },
    { id: 'gemini-2-5', name: 'Gemini 2.5', pattern: /gemini.*2[\.-]5/i },
    { id: 'gemini-3-5', name: 'Gemini 3.5', pattern: /gemini.*3[\.-]5/i },
    { id: 'gemini-3', name: 'Gemini 3', pattern: /gemini.*3/i },
    { id: 'gpt-4', name: 'GPT-4', pattern: /gpt-4/i },
    { id: 'gpt-3-5', name: 'GPT-3.5', pattern: /gpt-3/i }
];

// Avatar color classes for account cards
const AVATAR_CLASSES = ['primary', 'purple', 'blue', 'orange'];

// State
let currentData = null;
let availableGroups = new Set(); // Stores group IDs (e.g., 'claude-3-opus')
let selectedGroups = new Set();  // Stores selected group IDs
let knownRawModels = new Set();  // Stores all raw model IDs seen (e.g., 'claude-3-opus-20240229')
let expandedGroups = new Set();  // Stores IDs of expanded filter groups
let isFilterPanelOpen = false;
let isSettingsPanelOpen = false;
let currentSortOption = 'id-asc'; // Default sort option
let supportCardDismissed = false; // Track if support card is dismissed
let hideDisabledAccounts = false; // Track if disabled accounts should be hidden
let blurEmails = false; // Track if emails should be blurred

/**
 * Get the group ID for a given raw model string
 */
function getModelGroup(rawModelId) {
    for (const group of MODEL_GROUPS) {
        if (group.pattern.test(rawModelId)) {
            return group;
        }
    }
    // Fallback: Create a generic group
    return {
        id: rawModelId,
        name: rawModelId
    };
}

// DOM Elements
const accountsContainer = document.getElementById('accountsContainer');
const totalAccountsEl = document.getElementById('totalAccounts');
const lastUpdatedEl = document.getElementById('lastUpdated');
const syncButton = document.getElementById('syncButton');
const preloader = document.getElementById('preloader');

// Filter Elements
const filterButton = document.getElementById('filterButton');
const filterPanel = document.getElementById('filterPanel');
const filterOptions = document.getElementById('filterOptions');
const selectAllBtn = document.getElementById('selectAllBtn');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const filterBadgeDot = document.getElementById('filterBadgeDot');

// Settings Elements
const settingsButton = document.getElementById('settingsButton');
const settingsPanel = document.getElementById('settingsPanel');
const apiUrlInput = document.getElementById('apiUrlInput');
const sortSelect = document.getElementById('sortSelect');
const resetSettingsBtn = document.getElementById('resetSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const hideDisabledCheckbox = document.getElementById('hideDisabledCheckbox');
const blurEmailsCheckbox = document.getElementById('blurEmailsCheckbox');

/**
 * Save current settings to local storage
 */
function saveSettings() {
    chrome.storage.local.set({
        savedFilters: Array.from(selectedGroups),
        knownGroups: Array.from(availableGroups),
        knownRawModels: Array.from(knownRawModels)
    });
}

/**
 * Wait for fonts to load before showing content
 */
async function waitForFonts() {
    try {
        // Wait for document fonts to be ready
        await document.fonts.ready;

        // Additional check for Material Symbols
        const materialFont = Array.from(document.fonts).find(
            font => font.family.includes('Material Symbols')
        );

        if (materialFont && materialFont.status !== 'loaded') {
            await materialFont.load();
        }

        // Small delay to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 50));

    } catch (error) {
        console.warn('Font loading check failed:', error);
        // Continue anyway after a short delay
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Hide preloader and show content
    preloader.classList.add('hidden');
    document.body.classList.add('ready');
}

/**
 * Format ISO date to relative time (e.g., "4h 20m")
 */
function formatResetTime(isoString) {
    const resetDate = new Date(isoString);
    const now = new Date();
    const diffMs = resetDate - now;

    if (diffMs <= 0) {
        return 'Now';
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;

    if (diffHours > 0) {
        return `${diffHours}h ${remainingMinutes}m`;
    }
    return `${diffMinutes}m`;
}

/**
 * Format timestamp to relative time (e.g., "2m ago", "1h ago")
 */
function formatRelativeTime(isoString) {
    if (!isoString) return 'Never';
    const lastUsedDate = new Date(isoString);
    const now = new Date();
    const diffMs = now - lastUsedDate;

    if (diffMs <= 0) {
        return 'Just now';
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
        return `${diffDays}d ago`;
    }
    if (diffHours > 0) {
        return `${diffHours}h ago`;
    }
    if (diffMinutes > 0) {
        return `${diffMinutes}m ago`;
    }
    return 'Just now';
}

/**
 * Format timestamp to local date string
 */
function formatTimestamp(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Get color class based on remaining fraction
 * >= 0.70: Green (primary)
 * 0.30 - 0.69: Amber
 * < 0.30: Red (rose)
 */
function getColorClass(remainingFraction) {
    if (remainingFraction >= 0.70) {
        return 'green';
    } else if (remainingFraction >= 0.30) {
        return 'amber';
    } else {
        return 'red';
    }
}

/**
 * Create a model item HTML
 */
function createModelItem(modelName, modelData, rateLimitInfo) {
    const isRateLimited = rateLimitInfo && rateLimitInfo.isRateLimited;
    const percentage = Math.round(modelData.remainingFraction * 100);

    let colorClass = getColorClass(modelData.remainingFraction);
    let resetText = `Resets in ${formatResetTime(modelData.resetTime)}`;
    let iconName = 'schedule';
    let isCritical = modelData.remainingFraction < 0.30;

    if (isRateLimited) {
        colorClass = 'purple';
        resetText = `Cooldown: ${formatResetTime(rateLimitInfo.resetTime)}`;
        iconName = 'hourglass_empty';
    }

    let badgeHtml = '';
    if (isRateLimited) {
        badgeHtml = `<span class="rate-limit-badge">Rate Limited</span>`;
    } else if (isCritical) {
        badgeHtml = `<span class="critical-badge">Critical</span>`;
    }

    const resetInfoClass = (isCritical || isRateLimited) ? 'reset-info with-badge' : 'reset-info';
    const resetTimeClass = isRateLimited ? 'reset-time rate-limited' : (isCritical ? 'reset-time critical' : 'reset-time');
    const resetIconClass = isRateLimited ? 'reset-icon rate-limited' : (isCritical ? 'reset-icon critical' : 'reset-icon');

    return `
        <div class="model-item ${isRateLimited ? 'is-rate-limited' : ''}">
            <div class="model-header">
                <span class="model-name">${modelName}</span>
                <span class="model-percentage ${colorClass}">${percentage}%</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar ${colorClass}" style="width: ${percentage}%"></div>
            </div>
            <div class="${resetInfoClass}">
                <div class="reset-info-text">
                    <span class="material-symbols-outlined ${resetIconClass}">${iconName}</span>
                    <span class="${resetTimeClass}">${resetText}</span>
                </div>
                ${badgeHtml}
            </div>
        </div>
    `;
}

/**
 * Get avatar class based on account index
 */
function getAvatarClass(index) {
    return AVATAR_CLASSES[index % AVATAR_CLASSES.length];
}

/**
 * Get avatar icon based on account index
 */
function getAvatarIcon(email) {
    if (!email) return 'person';
    return email.endsWith('@gmail.com') ? 'person' : 'business';
}

/**
 * Determine account plan based on subscription tier or reset time
 * Rule: Check subscription.tier first. Fallback to reset time heuristic.
 */
function getAccountPlan(account) {
    // 1. Check account.subscription.tier first
    if (account.subscription && account.subscription.tier) {
        if (account.subscription.tier === 'pro') {
            return { label: 'Pro Plan', type: 'pro' };
        } else if (account.subscription.tier === 'free') {
            return { label: 'Free Plan', type: 'free' };
        }
    }

    if (!account.limits || Object.keys(account.limits).length === 0) {
        return { label: 'Free Plan', type: 'free' };
    }

    // Get the first available reset time
    const limitData = Object.values(account.limits).find(l => l.resetTime);

    if (!limitData) {
        return { label: 'Free Plan', type: 'free' };
    }

    const resetDate = new Date(limitData.resetTime);
    const now = new Date();
    const diffMs = resetDate - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    // If reset is less than or equal to 5 hours away, it's Pro
    if (diffHours <= 5) {
        return { label: 'Pro Plan', type: 'pro' };
    }

    return { label: 'Free Plan', type: 'free' };
}

/**
 * Create an account card HTML
 */
function createAccountCard(account, index) {
    const isInvalid = account.isInvalid === true;
    const isDisabled = account.enabled === false;
    const isActive = account.status === 'ok' && !isInvalid && !isDisabled;

    let avatarClass = isActive ? getAvatarClass(index) : 'inactive';
    let avatarIcon = isActive ? getAvatarIcon(account.email) : 'person_off';

    if (isInvalid) {
        avatarClass = 'invalid';
        avatarIcon = 'error';
    } else if (isDisabled) {
        avatarClass = 'disabled';
        avatarIcon = 'block';
    }

    // Build model list with filtering
    let modelsHtml = '';

    if (account.limits && Object.keys(account.limits).length > 0) {
        const filteredEntries = Object.entries(account.limits)
            .filter(([modelName]) => {
                const group = getModelGroup(modelName);
                return selectedGroups.has(group.id);
            });

        if (filteredEntries.length > 0) {
            const modelItems = filteredEntries
                .map(([modelName, modelData]) => {
                    const rateLimitInfo = account.modelRateLimits ? account.modelRateLimits[modelName] : null;
                    return createModelItem(modelName, modelData, rateLimitInfo);
                })
                .join('');
            modelsHtml = `<div class="model-list">${modelItems}</div>`;
        } else if (Object.keys(account.limits).length > 0) {
            // Models exist but filtered out
            modelsHtml = `<div class="empty-message">No matching models (check filters).</div>`;
        } else {
            // Should not happen given outer check, but safe fallback
            modelsHtml = `<div class="empty-message">No active sessions.</div>`;
        }
    } else {
        modelsHtml = `<div class="empty-message">No active sessions detected recently.</div>`;
    }

    // Determine plan
    const planInfo = getAccountPlan(account);

    // Last Used
    const lastUsedHtml = `<span class="account-last-used">Used ${formatRelativeTime(account.lastUsed)}</span>`;

    // Status classes
    let statusDotClass = isActive ? 'status-dot active' : 'status-dot offline';
    let statusTextClass = isActive ? 'status-text active' : 'status-text offline';
    let statusLabel = isActive ? 'Active' : 'Offline';
    let cardClass = isActive ? 'account-card' : 'account-card inactive';

    if (isInvalid) {
        statusDotClass = 'status-dot invalid';
        statusTextClass = 'status-text invalid';
        statusLabel = 'Error';
        cardClass = 'account-card invalid';
    } else if (isDisabled) {
        statusDotClass = 'status-dot disabled';
        statusTextClass = 'status-text disabled';
        statusLabel = 'Disabled';
        cardClass = 'account-card disabled';
    }

    const invalidReasonHtml = isInvalid ? `
        <div class="invalid-reason">
            <span class="material-symbols-outlined">warning</span>
            <span>${account.invalidReason || 'Session expired'}</span>
        </div>
    ` : '';

    const emailClass = blurEmails ? 'account-email blurred' : 'account-email';

    return `
        <div class="${cardClass}">
            <!-- Account Header -->
            <div class="account-header">
                <div class="account-info">
                    <div class="account-avatar ${avatarClass}">
                        <span class="material-symbols-outlined">${avatarIcon}</span>
                    </div>
                    <div class="account-details">
                        <span class="${emailClass}">${account.email}</span>
                        <div class="account-meta">
                            ${lastUsedHtml}
                            <span class="account-plan ${planInfo.type}">${planInfo.label}</span>
                        </div>
                    </div>
                </div>
                <div class="account-status">
                    <div class="${statusDotClass}"></div>
                    <span class="${statusTextClass}">${statusLabel}</span>
                </div>
            </div>
            ${invalidReasonHtml}
            <!-- Model List -->
            ${modelsHtml}
        </div>
    `;
}

/**
 * Toggle Filter Panel
 */
function toggleFilterPanel() {
    // Close settings panel if open
    if (isSettingsPanelOpen) {
        toggleSettingsPanel();
    }
    isFilterPanelOpen = !isFilterPanelOpen;
    if (isFilterPanelOpen) {
        filterPanel.classList.add('open');
        filterButton.classList.add('active');
    } else {
        filterPanel.classList.remove('open');
        filterButton.classList.remove('active');
    }
}

/**
 * Toggle Settings Panel
 */
function toggleSettingsPanel() {
    // Close filter panel if open
    if (isFilterPanelOpen) {
        isFilterPanelOpen = false;
        filterPanel.classList.remove('open');
        filterButton.classList.remove('active');
    }
    isSettingsPanelOpen = !isSettingsPanelOpen;
    if (isSettingsPanelOpen) {
        settingsPanel.classList.add('open');
        settingsButton.classList.add('active');
        // Load current settings into inputs
        getApiEndpoint().then(url => {
            apiUrlInput.value = url;
        });
        sortSelect.value = currentSortOption;
        hideDisabledCheckbox.checked = hideDisabledAccounts;
        blurEmailsCheckbox.checked = blurEmails;
    } else {
        settingsPanel.classList.remove('open');
        settingsButton.classList.remove('active');
    }
}

/**
 * Update Filter Badge
 */
function updateFilterBadge() {
    // Show dot if not all models are selected
    if (selectedGroups.size < availableGroups.size && availableGroups.size > 0) {
        filterBadgeDot.classList.add('visible');
    } else {
        filterBadgeDot.classList.remove('visible');
    }
}

/**
 * Render Filter Options
 */
function renderFilterOptions() {
    if (availableGroups.size === 0) {
        filterOptions.innerHTML = '<span class="empty-message" style="padding-left:0">No models found</span>';
        return;
    }

    // Convert group IDs to full group objects for rendering
    const groupsToRender = Array.from(availableGroups).map(groupId => {
        // Try to find in predefined list first, else custom fallback
        const defined = MODEL_GROUPS.find(g => g.id === groupId);
        return defined || { id: groupId, name: groupId };
    });

    // Sort by name
    groupsToRender.sort((a, b) => a.name.localeCompare(b.name));

    // Generate HTML
    filterOptions.innerHTML = groupsToRender.map(group => {
        const isSelected = selectedGroups.has(group.id);
        const isExpanded = expandedGroups.has(group.id);

        // Find raw models belonging to this group
        const groupModels = Array.from(knownRawModels)
            .filter(rawId => getModelGroup(rawId).id === group.id)
            .sort();

        // If no raw models found (shouldn't happen but safe fallback), just show group
        const hasSubItems = groupModels.length > 0;

        const subItemsHtml = hasSubItems ? `
            <div class="filter-group-items">
                ${groupModels.map(rawId => `
                    <div class="filter-sub-item">
                        <span class="material-symbols-outlined sub-item-icon">subdirectory_arrow_right</span>
                        <span class="sub-item-text" title="${rawId}">${rawId}</span>
                    </div>
                `).join('')}
            </div>
        ` : '';

        return `
        <div class="filter-group ${isExpanded ? 'expanded' : ''}" data-group-id="${group.id}">
            <div class="filter-group-header">
                <label class="checkbox-label">
                    <input type="checkbox" class="checkbox-input group-checkbox" value="${group.id}" ${isSelected ? 'checked' : ''}>
                    <span class="checkbox-text" title="${group.name}">${group.name}</span>
                </label>
                ${hasSubItems ? `
                <span class="material-symbols-outlined group-chevron">expand_more</span>
                ` : ''}
            </div>
            ${subItemsHtml}
        </div>
        `;
    }).join('');

    // Add event listeners

    // Checkbox label click - stop propagation to prevent header click
    filterOptions.querySelectorAll('.checkbox-label').forEach(label => {
        label.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Group Header Click (Expand/Collapse)
    filterOptions.querySelectorAll('.filter-group-header').forEach(header => {
        header.addEventListener('click', (e) => {
            // Don't trigger if clicking the checkbox directly (handled by its own listener)
            if (e.target.closest('.checkbox-label')) return;

            const groupEl = header.closest('.filter-group');
            const groupId = groupEl.dataset.groupId;

            if (expandedGroups.has(groupId)) {
                expandedGroups.delete(groupId);
                groupEl.classList.remove('expanded');
            } else {
                expandedGroups.add(groupId);
                groupEl.classList.add('expanded');
            }
        });
    });

    // Checkbox Change
    filterOptions.querySelectorAll('.group-checkbox').forEach(input => {
        input.addEventListener('change', (e) => {
            const groupId = e.target.value;
            if (e.target.checked) {
                selectedGroups.add(groupId);
            } else {
                selectedGroups.delete(groupId);
            }
            updateFilterBadge();
            renderAccounts();
            saveSettings();
        });
    });
}

/**
 * Update available models from data
 */
function updateModelList(data) {
    if (!data.accounts) return;

    const foundGroups = new Set();
    const foundRawModels = new Set();

    data.accounts.forEach(account => {
        if (account.limits) {
            Object.keys(account.limits).forEach(model => {
                foundRawModels.add(model);
                const group = getModelGroup(model);
                foundGroups.add(group.id);
            });
        }
    });

    // Update known raw models
    let rawModelsChanged = false;
    for (const modelId of foundRawModels) {
        if (!knownRawModels.has(modelId)) {
            knownRawModels.add(modelId);
            rawModelsChanged = true;
        }
    }

    // Detect if there are any new groups we've never seen before
    let hasNewGroups = false;
    for (const groupId of foundGroups) {
        if (!availableGroups.has(groupId)) {
            hasNewGroups = true;
            // Add new groups to selection by default
            selectedGroups.add(groupId);
        }
    }

    // Check if the set of groups has changed (added or removed)
    let listChanged = hasNewGroups || rawModelsChanged;
    if (!listChanged && foundGroups.size !== availableGroups.size) {
        listChanged = true;
    } else if (!listChanged) {
        // Double check for removals
        for (const groupId of availableGroups) {
            if (!foundGroups.has(groupId)) {
                listChanged = true;
                break;
            }
        }
    }

    if (listChanged) {
        availableGroups = foundGroups;

        // Clean up selected groups that no longer exist
        for (const groupId of selectedGroups) {
            if (!availableGroups.has(groupId)) {
                selectedGroups.delete(groupId);
            }
        }

        renderFilterOptions();
        updateFilterBadge();
        saveSettings();
    }
}

/**
 * Calculate average remaining fraction for an account
 */
function calculateAverageRemaining(account) {
    if (!account.limits || Object.keys(account.limits).length === 0) {
        return 0;
    }
    const values = Object.values(account.limits);
    const sum = values.reduce((acc, limit) => acc + (limit.remainingFraction || 0), 0);
    return sum / values.length;
}

/**
 * Sort accounts based on current sort option
 */
function sortAccounts(accounts) {
    const sorted = [...accounts];
    const [field, direction] = currentSortOption.split('-');
    const multiplier = direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
        let comparison = 0;
        switch (field) {
            case 'id':
                comparison = (a.email || '').localeCompare(b.email || '');
                break;
            case 'lastUsed':
                const dateA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
                const dateB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
                comparison = dateA - dateB;
                break;
            case 'limit':
                comparison = calculateAverageRemaining(a) - calculateAverageRemaining(b);
                break;
            default:
                comparison = 0;
        }
        return comparison * multiplier;
    });

    return sorted;
}

/**
 * Create support card HTML
 */
function createSupportCard() {
    if (supportCardDismissed) return '';

    return `
        <div class="support-card" id="supportCard">
            <button class="support-card-close" id="dismissSupportCard" title="Dismiss">
                <span class="material-symbols-outlined">close</span>
            </button>
            <div class="support-card-icon">
                <span class="material-symbols-outlined">favorite</span>
            </div>
            <div class="support-card-content">
                <h3 class="support-card-title">Enjoying this extension?</h3>
                <p class="support-card-text">Show your support by starring the project on GitHub!</p>
            </div>
            <a href="https://github.com/YasinKose/antigravity-limit-tracker" target="_blank" class="support-card-button">
                <span class="material-symbols-outlined">star</span>
                <span>Star on GitHub</span>
            </a>
        </div>
    `;
}

/**
 * Dismiss support card permanently
 */
function dismissSupportCard() {
    supportCardDismissed = true;
    chrome.storage.local.set({ supportCardDismissed: true });
    const card = document.getElementById('supportCard');
    if (card) {
        card.classList.add('dismissed');
        setTimeout(() => card.remove(), 300);
    }
}

/**
 * Render Accounts based on current data and filters
 */
function renderAccounts() {
    if (!currentData) return;

    // Update last updated time
    if (currentData.timestamp) {
        lastUpdatedEl.textContent = `Last updated: ${formatTimestamp(currentData.timestamp)}`;
    } else {
        lastUpdatedEl.textContent = `Last updated: ${formatTimestamp(new Date().toISOString())}`;
    }

    // Render account cards
    if (currentData.accounts && currentData.accounts.length > 0) {
        let accountsToRender = currentData.accounts;

        // Filter out disabled accounts if setting is enabled
        if (hideDisabledAccounts) {
            accountsToRender = accountsToRender.filter(account => account.enabled !== false);
        }

        // Update footer with rendered account count
        const accountCount = accountsToRender.length;
        totalAccountsEl.textContent = `${accountCount} account${accountCount !== 1 ? 's' : ''}`;

        const sortedAccounts = sortAccounts(accountsToRender);
        const cardsHtml = sortedAccounts
            .map((account, index) => createAccountCard(account, index))
            .join('');
        const supportCardHtml = createSupportCard();
        accountsContainer.innerHTML = supportCardHtml + cardsHtml;

        // Add dismiss event listener
        const dismissBtn = document.getElementById('dismissSupportCard');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', dismissSupportCard);
        }
    } else {
        showEmpty();
    }
}

/**
 * Show loading state
 */
function showLoading() {
    accountsContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner">
                <span class="material-symbols-outlined">progress_activity</span>
            </div>
            <span class="loading-text">Loading accounts...</span>
        </div>
    `;
}

/**
 * Show proxy not running error
 */
async function showProxyError() {
    const currentUrl = await getApiEndpoint();
    accountsContainer.innerHTML = `
        <div class="error-state">
            <div class="error-icon warning">
                <span class="material-symbols-outlined">power_off</span>
            </div>
            <div class="error-content">
                <h3 class="error-title">Proxy Not Running</h3>
                <p class="error-message">The proxy service is not responding. Please make sure the application is running at: ${currentUrl}</p>
            </div>
            <button class="retry-button" id="retryButton">
                <span class="material-symbols-outlined">refresh</span>
                Try Again
            </button>
        </div>
    `;

    document.getElementById('retryButton').addEventListener('click', fetchAccountLimits);
}

/**
 * Show generic error state with styled message
 */
function showError(message) {
    accountsContainer.innerHTML = `
        <div class="error-state">
            <div class="error-icon">
                <span class="material-symbols-outlined">cloud_off</span>
            </div>
            <div class="error-content">
                <h3 class="error-title">Connection Error</h3>
                <p class="error-message">${message}</p>
            </div>
            <button class="retry-button" id="retryButton">
                <span class="material-symbols-outlined">refresh</span>
                Try Again
            </button>
        </div>
    `;

    document.getElementById('retryButton').addEventListener('click', fetchAccountLimits);
}

/**
 * Show empty state
 */
function showEmpty() {
    accountsContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">
                <span class="material-symbols-outlined">inbox</span>
            </div>
            <div class="error-content">
                <h3 class="error-title">No Accounts Found</h3>
                <p class="error-message">No AI accounts are being tracked.</p>
            </div>
        </div>
    `;
}

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Fetch account limits from the local service
 */
async function fetchAccountLimits() {
    // Only show loading if we don't have data yet to avoid flashing
    if (!currentData) {
        showLoading();
    }

    // Add spinning class to sync button if it exists
    const syncIcon = syncButton.querySelector('.material-symbols-outlined');
    if (syncIcon) syncIcon.classList.add('spin-animation');

    try {
        const apiEndpoint = await getApiEndpoint();
        const response = await fetchWithTimeout(apiEndpoint, API_TIMEOUT_MS);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        currentData = data;
        updateModelList(data);
        renderAccounts();

        // Save to storage
        chrome.storage.local.set({
            lastData: data,
            lastFetch: new Date().toISOString()
        });

    } catch (error) {
        console.error('Failed to fetch account limits:', error);

        if (error.name === 'AbortError') {
            showProxyError();
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showProxyError();
        } else {
            showError(`Failed to load data: ${error.message}`);
        }
    } finally {
        // Remove spinning class
        if (syncIcon) syncIcon.classList.remove('spin-animation');
    }
}

// Event Listeners
syncButton.addEventListener('click', fetchAccountLimits);
filterButton.addEventListener('click', toggleFilterPanel);
settingsButton.addEventListener('click', toggleSettingsPanel);

// Settings panel events
saveSettingsBtn.addEventListener('click', () => {
    const newUrl = apiUrlInput.value.trim();
    const newSort = sortSelect.value;
    const newHideDisabled = hideDisabledCheckbox.checked;
    const newBlurEmails = blurEmailsCheckbox.checked;

    if (newUrl) {
        saveApiUrl(newUrl);
    }
    currentSortOption = newSort;
    hideDisabledAccounts = newHideDisabled;
    blurEmails = newBlurEmails;
    chrome.storage.local.set({
        sortOption: newSort,
        hideDisabledAccounts: newHideDisabled,
        blurEmails: newBlurEmails
    });

    toggleSettingsPanel();
    renderAccounts();

    // Refetch if URL changed
    if (newUrl && newUrl !== DEFAULT_API_URL) {
        fetchAccountLimits();
    }
});

resetSettingsBtn.addEventListener('click', () => {
    apiUrlInput.value = DEFAULT_API_URL;
    sortSelect.value = 'id-asc';
    hideDisabledCheckbox.checked = false;
    blurEmailsCheckbox.checked = false;
    saveApiUrl(DEFAULT_API_URL);
    currentSortOption = 'id-asc';
    hideDisabledAccounts = false;
    blurEmails = false;
    chrome.storage.local.set({
        sortOption: 'id-asc',
        hideDisabledAccounts: false,
        blurEmails: false
    });
    toggleSettingsPanel();
    renderAccounts();
    fetchAccountLimits();
});

selectAllBtn.addEventListener('click', () => {
    selectedGroups = new Set(availableGroups);
    renderFilterOptions(); // Re-render checkboxes
    updateFilterBadge();
    renderAccounts();
    saveSettings();
});

clearFiltersBtn.addEventListener('click', () => {
    selectedGroups.clear();
    renderFilterOptions(); // Re-render checkboxes
    updateFilterBadge();
    renderAccounts();
    saveSettings();
});

// Close panels when clicking outside
document.addEventListener('click', (e) => {
    if (isFilterPanelOpen &&
        !filterPanel.contains(e.target) &&
        !filterButton.contains(e.target)) {
        toggleFilterPanel();
    }
    if (isSettingsPanelOpen &&
        !settingsPanel.contains(e.target) &&
        !settingsButton.contains(e.target)) {
        toggleSettingsPanel();
    }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await waitForFonts();

    // Load settings and data
    chrome.storage.local.get(['lastData', 'savedFilters', 'knownGroups', 'knownRawModels', 'sortOption', 'supportCardDismissed', 'hideDisabledAccounts', 'blurEmails'], (result) => {
        // Restore settings
        if (result.knownGroups) {
            availableGroups = new Set(result.knownGroups);
        }

        if (result.knownRawModels) {
            knownRawModels = new Set(result.knownRawModels);
        }

        if (result.savedFilters) {
            selectedGroups = new Set(result.savedFilters);
        }

        if (result.sortOption) {
            currentSortOption = result.sortOption;
        }

        if (result.supportCardDismissed) {
            supportCardDismissed = true;
        }

        if (result.hideDisabledAccounts) {
            hideDisabledAccounts = true;
        }

        if (result.blurEmails) {
            blurEmails = true;
        }

        // Restore data
        if (result.lastData) {
            currentData = result.lastData;
            // Update model list to handle any potential discrepancies
            updateModelList(currentData);

            // Ensure UI is consistent with restored state
            renderFilterOptions();
            updateFilterBadge();
            renderAccounts();
        }

        // Then fetch fresh data
        fetchAccountLimits();
    });
});
