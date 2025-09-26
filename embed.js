(function() {
    'use strict';

    const inlineCSS = `
        .sfw-container {
            font-family: var(--sfw-font, 'Inter', system-ui, sans-serif);
            max-width: var(--sfw-max-width, 1200px);
            margin: var(--sfw-margin, 20px auto);
            width: 100%;
        }
        
        .sfw-widget {
            background: var(--sfw-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
            border-radius: var(--sfw-widget-radius, 20px);
            padding: var(--sfw-padding, 30px);
            color: var(--sfw-text-color, white);
            box-shadow: var(--sfw-shadow, 0 20px 60px rgba(0,0,0,0.25));
            position: relative;
            overflow: hidden;
        }
        
        .sfw-widget::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--sfw-overlay, 
                radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
            );
            pointer-events: none;
        }
        
        .sfw-title {
            text-align: center;
            margin: 0 0 var(--sfw-title-margin-bottom, 24px) 0;
            font-size: var(--sfw-title-size, 1.9em);
            font-weight: var(--sfw-title-weight, 800);
            letter-spacing: var(--sfw-title-spacing, 0.2px);
            text-shadow: var(--sfw-text-shadow, 0 2px 8px rgba(0,0,0,0.35));
            color: var(--sfw-title-color, inherit);
        }
        
        .sfw-grid {
            display: grid;
            gap: var(--sfw-gap, 18px);
            grid-template-columns: repeat(auto-fill, minmax(var(--sfw-card-min-width, 280px), 1fr));
        }
        
        .sfw-grid.list {
            grid-template-columns: 1fr;
        }
        
        .sfw-card {
            background: var(--sfw-block-bg, rgba(255,255,255,0.14));
            border: var(--sfw-block-border, 1px solid rgba(255,255,255,0.28));
            border-radius: var(--sfw-block-radius, 16px);
            padding: var(--sfw-block-padding, 18px);
            backdrop-filter: blur(14px);
            transition: all 0.25s ease;
            position: relative;
            overflow: hidden;
        }
        
        .sfw-card::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(255,255,255,0.06), transparent 60%);
            pointer-events: none;
        }
        
        .sfw-card:hover {
            transform: translateY(-4px);
            background: var(--sfw-block-bg-hover, rgba(255,255,255,0.20));
            box-shadow: var(--sfw-card-shadow-hover, 0 14px 36px rgba(0,0,0,0.25));
        }
        
        .sfw-accent {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: var(--sfw-accent-width, 4px);
            border-radius: var(--sfw-accent-radius, 16px 0 0 16px);
        }
        
        .sfw-head {
            display: flex;
            align-items: center;
            gap: var(--sfw-head-gap, 12px);
            margin-bottom: var(--sfw-head-margin, 12px);
        }
        
        .sfw-avatar {
            width: var(--sfw-avatar-size, 40px);
            height: var(--sfw-avatar-size, 40px);
            border-radius: 50%;
            border: var(--sfw-avatar-border, 2px solid rgba(255,255,255,0.75));
            object-fit: cover;
        }
        
        .sfw-meta {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        
        .sfw-author {
            font-weight: var(--sfw-author-weight, 700);
            font-size: var(--sfw-author-size, 14px);
            color: var(--sfw-author-color, inherit);
        }
        
        .sfw-time {
            font-size: var(--sfw-time-size, 12px);
            opacity: var(--sfw-time-opacity, 0.85);
            color: var(--sfw-time-color, inherit);
        }
        
        .sfw-content {
            font-size: var(--sfw-content-size, 14px);
            line-height: var(--sfw-content-line-height, 1.55);
            margin-top: 6px;
            color: var(--sfw-content-color, inherit);
        }
        
        .sfw-actions {
            display: flex;
            gap: var(--sfw-actions-gap, 10px);
            margin-top: var(--sfw-actions-margin, 12px);
            flex-wrap: wrap;
        }
        
        .sfw-chip {
            background: var(--sfw-chip-bg, rgba(255,255,255,0.18));
            border: var(--sfw-chip-border, 1px solid rgba(255,255,255,0.32));
            padding: var(--sfw-chip-padding, 5px 9px);
            border-radius: var(--sfw-chip-radius, 9px);
            font-size: var(--sfw-chip-size, 12px);
            display: inline-flex;
            gap: 6px;
            align-items: center;
            color: var(--sfw-chip-color, inherit);
        }
        
        .sfw-loading {
            text-align: center;
            padding: var(--sfw-loading-padding, 40px);
            color: var(--sfw-loading-color, white);
        }
        
        .sfw-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: sfw-spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes sfw-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
            .sfw-widget {
                padding: var(--sfw-padding-mobile, 22px);
            }
            .sfw-title {
                font-size: var(--sfw-title-size-mobile, 1.6em);
            }
            .sfw-grid {
                grid-template-columns: 1fr;
                gap: var(--sfw-gap-mobile, 15px);
            }
        }
    `;

    // Accent цвета для платформ
    const PLATFORM_ACCENTS = {
        tiktok: "#FF0050",
        instagram: "#E4405F",
        facebook: "#1877F2",
        linkedin: "#0A66C2",
        whatsapp: "#25D366",
        twitter: "#1DA1F2",
        youtube: "#FF0000",
        default: "#ffffff"
    };

    try {
        const currentScript = document.currentScript || (function() {
            const scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        let clientId = currentScript.dataset.id;
        if (!clientId) {
            console.error('[SocialFeedsWidget] data-id обязателен');
            return;
        }

        clientId = normalizeId(clientId);

        // Защита от повторного выполнения
        if (currentScript.dataset.sfwMounted === '1') return;
        currentScript.dataset.sfwMounted = '1';

        console.log(`[SocialFeedsWidget] 🚀 Инициализация виджета "${clientId}"`);

        // Добавляем базовые стили один раз в head
        if (!document.querySelector('#social-feeds-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'social-feeds-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }

        const baseUrl = getBasePath(currentScript.src);
        const uniqueClass = `sfw-${clientId}-${Date.now()}`;
        const container = createContainer(currentScript, clientId, uniqueClass);
        
        showLoading(container);

        // Загружаем конфигурацию
        loadConfig(clientId, baseUrl)
            .then(fetchedConfig => {
                const finalConfig = mergeDeep(getDefaultConfig(), fetchedConfig);
                console.log(`[SocialFeedsWidget] 📋 Финальный конфиг для "${clientId}":`, finalConfig);
                
                applyCustomStyles(uniqueClass, finalConfig.style);
                createSocialFeedsWidget(container, finalConfig);
                
                // Настройка автообновления
                if (finalConfig.refreshInterval && finalConfig.refreshInterval > 0) {
                    setInterval(() => {
                        createSocialFeedsWidget(container, finalConfig);
                    }, finalConfig.refreshInterval);
                }
                
                console.log(`[SocialFeedsWidget] ✅ Виджет "${clientId}" успешно создан`);
            })
            .catch(error => {
                console.warn(`[SocialFeedsWidget] ⚠️ Ошибка загрузки "${clientId}":`, error.message);
                const defaultConfig = getDefaultConfig();
                applyCustomStyles(uniqueClass, defaultConfig.style);
                createSocialFeedsWidget(container, defaultConfig);
            });

    } catch (error) {
        console.error('[SocialFeedsWidget] 💥 Критическая ошибка:', error);
    }

    function normalizeId(id) {
        return (id || 'demo').replace(/\.(json|js)$/i, '');
    }

    function getBasePath(src) {
        if (!src) return './';
        try {
            const url = new URL(src, location.href);
            return url.origin + url.pathname.replace(/\/[^\/]*$/, '/');
        } catch (error) {
            return './';
        }
    }

    function createContainer(scriptElement, clientId, uniqueClass) {
        const container = document.createElement('div');
        container.id = `social-feeds-widget-${clientId}`;
        container.className = `sfw-container ${uniqueClass}`;
        scriptElement.parentNode.insertBefore(container, scriptElement.nextSibling);
        return container;
    }

    function showLoading(container) {
        container.innerHTML = `
            <div class="sfw-widget">
                <div class="sfw-loading">
                    <div class="sfw-spinner"></div>
                    <div>Loading social feeds...</div>
                </div>
            </div>
        `;
    }

    function getDefaultConfig() {
        return {
            title: "Our Social",
            platforms: ["facebook", "instagram", "tiktok", "linkedin", "whatsapp"],
            maxPosts: 8,
            layout: "grid", // grid | list
            showAvatars: true,
            showTimestamp: true,
            refreshInterval: 0, // ms; 0 = без автообновления
            filters: null, // { minLikes, includeHashtags:[], excludeWords:[] }
            icon: "",
            iconHtml: "&#128248;", // 📱 как HTML entity
            style: {
                fontFamily: "'Inter', system-ui, sans-serif",
                valueFontFamily: "'Inter', system-ui, sans-serif",
                colors: {
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    text: "white",
                    blockBackground: "rgba(255,255,255,0.14)",
                    blockBorder: "rgba(255,255,255,0.28)",
                    blockHover: "rgba(255,255,255,0.20)",
                    borderHover: "rgba(255,255,255,0.40)",
                    chipBackground: "rgba(255,255,255,0.18)",
                    chipBorder: "rgba(255,255,255,0.32)",
                    avatarBorder: "rgba(255,255,255,0.75)"
                },
                borderRadius: {
                    widget: 20,
                    blocks: 16
                },
                sizes: {
                    fontSize: 1.0,
                    padding: 30,
                    blockPadding: 18,
                    gap: 18,
                    cardMinWidth: 280,
                    avatarSize: 40,
                    accentWidth: 4
                },
                shadow: {
                    widget: "0 20px 60px rgba(0,0,0,0.25)",
                    widgetHover: "0 30px 80px rgba(0,0,0,0.35)",
                    text: "0 2px 8px rgba(0,0,0,0.35)",
                    cardHover: "0 14px 36px rgba(0,0,0,0.25)"
                }
            }
        };
    }

    function mergeDeep(base, override) {
        const result = { ...base, ...override };

        // Сливаем объекты первого уровня
        for (const key of ['style', 'filters']) {
            if (base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
                result[key] = { ...(base[key] || {}), ...(override[key] || {}) };
            }
        }

        // Сливаем объекты второго уровня в style (как у других виджетов)
        if (result.style) {
            for (const subKey of ['colors', 'borderRadius', 'sizes', 'shadow']) {
                if (base.style[subKey] && typeof base.style[subKey] === 'object' && !Array.isArray(base.style[subKey])) {
                    result.style[subKey] = { ...(base.style[subKey] || {}), ...(override.style?.[subKey] || {}) };
                }
            }
        }

        // Поддержка старого формата theme для обратной совместимости
        if (override?.theme) {
            const theme = override.theme;
            if (theme.backgroundColor) {
                result.style.colors.background = theme.backgroundColor;
            } else if (theme.primaryColor && theme.secondaryColor) {
                result.style.colors.background = `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`;
            }
            result.style.colors.text = theme.textColor || result.style.colors.text;
            result.style.borderRadius.widget = theme.borderRadius || result.style.borderRadius.widget;
        }

        // Для массивов заменяем полностью
        if (Array.isArray(override?.platforms)) {
            result.platforms = override.platforms;
        }
        
        return result;
    }

    async function loadConfig(clientId, baseUrl) {
        // Локальный конфиг для разработки
        if (clientId === 'local') {
            const localScript = document.querySelector('#sfw-local-config');
            if (!localScript) {
                throw new Error('Локальный конфиг не найден (#sfw-local-config)');
            }
            try {
                const config = JSON.parse(localScript.textContent);
                console.log(`[SocialFeedsWidget] 📄 Локальный конфиг загружен:`, config);
                return config;
            } catch (err) {
                throw new Error('Ошибка парсинга локального JSON: ' + err.message);
            }
        }

        // Загрузка с сервера
        const configUrl = `${baseUrl}configs/${encodeURIComponent(clientId)}.json?v=${Date.now()}`;
        console.log(`[SocialFeedsWidget] 🌐 Загружаем конфиг: ${configUrl}`);
        
        const response = await fetch(configUrl, { 
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const config = await response.json();
        console.log(`[SocialFeedsWidget] ✅ Серверный конфиг загружен:`, config);
        return config;
    }

    function applyCustomStyles(uniqueClass, style) {
        const styleId = `sfw-style-${uniqueClass}`;
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        
        styleElement.textContent = generateUniqueStyles(uniqueClass, style);
    }

    function generateUniqueStyles(uniqueClass, style) {
        const s = style;
        const colors = s.colors || {};
        const sizes = s.sizes || {};
        const borderRadius = s.borderRadius || {};
        const shadow = s.shadow || {};
        const fs = sizes.fontSize || 1;

        return `
            .${uniqueClass} {
                --sfw-font: ${s.fontFamily || "'Inter', system-ui, sans-serif"};
                --sfw-value-font: ${s.valueFontFamily || "'Inter', system-ui, sans-serif"};
                --sfw-max-width: ${Math.round(1200 * fs)}px;
                --sfw-bg: ${colors.background || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};
                --sfw-widget-radius: ${borderRadius.widget || 20}px;
                --sfw-padding: ${sizes.padding || 30}px;
                --sfw-padding-mobile: ${Math.round((sizes.padding || 30) * 0.73)}px;
                --sfw-text-color: ${colors.text || "white"};
                --sfw-shadow: ${shadow.widget || "0 20px 60px rgba(0,0,0,0.25)"};
                --sfw-shadow-hover: ${shadow.widgetHover || "0 30px 80px rgba(0,0,0,0.35)"};
                --sfw-text-shadow: ${shadow.text || "0 2px 8px rgba(0,0,0,0.35)"};
                --sfw-title-size: ${1.9 * fs}em;
                --sfw-title-size-mobile: ${1.6 * fs}em;
                --sfw-title-weight: 800;
                --sfw-title-spacing: 0.2px;
                --sfw-title-margin-bottom: ${24 * fs}px;
                --sfw-title-color: ${colors.title || colors.text || "white"};
                --sfw-gap: ${sizes.gap || 18}px;
                --sfw-gap-mobile: ${Math.round((sizes.gap || 18) * 0.83)}px;
                --sfw-card-min-width: ${sizes.cardMinWidth || 280}px;
                --sfw-block-bg: ${colors.blockBackground || "rgba(255,255,255,0.14)"};
                --sfw-block-border: 1px solid ${colors.blockBorder || "rgba(255,255,255,0.28)"};
                --sfw-block-radius: ${borderRadius.blocks || 16}px;
                --sfw-block-padding: ${sizes.blockPadding || 18}px;
                --sfw-block-bg-hover: ${colors.blockHover || "rgba(255,255,255,0.20)"};
                --sfw-card-shadow-hover: ${shadow.cardHover || "0 14px 36px rgba(0,0,0,0.25)"};
                --sfw-accent-width: ${sizes.accentWidth || 4}px;
                --sfw-accent-radius: ${borderRadius.blocks || 16}px 0 0 ${borderRadius.blocks || 16}px;
                --sfw-head-gap: 12px;
                --sfw-head-margin: 12px;
                --sfw-avatar-size: ${sizes.avatarSize || 40}px;
                --sfw-avatar-border: 2px solid ${colors.avatarBorder || "rgba(255,255,255,0.75)"};
                --sfw-author-weight: 700;
                --sfw-author-size: ${14 * fs}px;
                --sfw-author-color: ${colors.author || colors.text || "white"};
                --sfw-time-size: ${12 * fs}px;
                --sfw-time-opacity: 0.85;
                --sfw-time-color: ${colors.time || colors.text || "white"};
                --sfw-content-size: ${14 * fs}px;
                --sfw-content-line-height: 1.55;
                --sfw-content-color: ${colors.content || colors.text || "white"};
                --sfw-actions-gap: 10px;
                --sfw-actions-margin: 12px;
                --sfw-chip-bg: ${colors.chipBackground || "rgba(255,255,255,0.18)"};
                --sfw-chip-border: 1px solid ${colors.chipBorder || "rgba(255,255,255,0.32)"};
                --sfw-chip-padding: 5px 9px;
                --sfw-chip-radius: 9px;
                --sfw-chip-size: ${12 * fs}px;
                --sfw-chip-color: ${colors.chip || colors.text || "white"};
            }
        `;
    }

    async function createSocialFeedsWidget(container, config) {
        const feeds = await collectFeeds(config);
        
        if (!feeds.length) {
            container.innerHTML = `
                <div class="sfw-widget">
                    ${config.title ? `<div class="sfw-title">${escapeHtml(config.title)}</div>` : ''}
                    <div class="sfw-grid">
                        <div class="sfw-card">
                            <div class="sfw-content">📭 No posts available</div>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        const gridClass = config.layout === 'list' ? 'sfw-grid list' : 'sfw-grid';
        const cards = feeds
            .slice(0, config.maxPosts || 8)
            .map(feed => cardHTML(feed, config))
            .join('');

        container.innerHTML = `
            <div class="sfw-widget">
                ${config.title ? `<div class="sfw-title">${escapeHtml(config.title)}</div>` : ''}
                <div class="${gridClass}">
                    ${cards}
                </div>
            </div>
        `;
    }

    function cardHTML(feed, config) {
        const accent = PLATFORM_ACCENTS[feed.platform] || PLATFORM_ACCENTS.default;
        
        return `
            <div class="sfw-card">
                <span class="sfw-accent" style="background: ${accent}"></span>
                ${config.showAvatars !== false ? `
                    <div class="sfw-head">
                        <img class="sfw-avatar" 
                             src="${escapeAttr(feed.avatar)}" 
                             alt="${escapeAttr(feed.author)}" 
                             loading="lazy"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzk5OTk5OSIvPjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+PC9zdmc+'"/>
                        <div class="sfw-meta">
                            <div class="sfw-author">${escapeHtml(feed.author)}</div>
                            ${config.showTimestamp !== false ? `<div class="sfw-time">${timeAgo(feed.timestamp)}</div>` : ''}
                        </div>
                    </div>
                ` : ''}
                <div class="sfw-content">${escapeHtml(feed.content)}</div>
                <div class="sfw-actions">
                    ${feed.likes ? `<span class="sfw-chip">❤️ ${formatNumber(feed.likes)}</span>` : ''}
                    ${feed.comments ? `<span class="sfw-chip">💬 ${formatNumber(feed.comments)}</span>` : ''}
                    ${feed.shares ? `<span class="sfw-chip">↗️ ${formatNumber(feed.shares)}</span>` : ''}
                </div>
            </div>
        `;
    }

    async function collectFeeds(config) {
        const platforms = (config.platforms || []).map(p => String(p).toLowerCase());
        let allFeeds = [];
        
        for (const platform of platforms) {
            const feeds = await mockFetch(platform);
            allFeeds = allFeeds.concat(feeds);
        }
        
        allFeeds = applyFilters(allFeeds, config.filters);
        allFeeds.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return allFeeds;
    }

    function applyFilters(feeds, filters) {
        if (!filters) return feeds;
        
        let result = feeds.slice();
        
        if (filters.minLikes) {
            result = result.filter(feed => (feed.likes || 0) >= filters.minLikes);
        }
        
        if (filters.excludeWords?.length) {
            const excludeRegex = new RegExp(filters.excludeWords.join('|'), 'i');
            result = result.filter(feed => !excludeRegex.test(feed.content));
        }
        
        if (filters.includeHashtags?.length) {
            const includeRegex = new RegExp(filters.includeHashtags.map(h => `#${h}`).join('|'), 'i');
            result = result.filter(feed => includeRegex.test(feed.content));
        }
        
        return result;
    }

    // DEMO источники (на реальном проекте здесь API)
    async function mockFetch(platform) {
        const now = Date.now();
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const timestamp = () => new Date(now - rand(10, 60 * 60 * 24) * 60 * 1000).toISOString();

        const platformData = {
            instagram: () => ({
                id: 'ig' + rand(1, 9999),
                platform: 'instagram',
                author: 'Instagram User',
                avatar: `https://via.placeholder.com/40x40/E4405F/ffffff?text=IG`,
                content: 'Amazing photo! 📸 #photography #sunset #nature',
                timestamp: timestamp(),
                likes: rand(50, 1200),
                comments: rand(3, 150)
            }),
            facebook: () => ({
                id: 'fb' + rand(1, 9999),
                platform: 'facebook',
                author: 'Facebook Page',
                avatar: `https://via.placeholder.com/40x40/1877F2/ffffff?text=FB`,
                content: 'Company news and updates. Follow us for more! 👥',
                timestamp: timestamp(),
                likes: rand(20, 600),
                comments: rand(1, 90),
                shares: rand(5, 120)
            }),
            tiktok: () => ({
                id: 'tk' + rand(1, 9999),
                platform: 'tiktok',
                author: 'TikTok Creator',
                avatar: `https://via.placeholder.com/40x40/FF0050/ffffff?text=TK`,
                content: 'New trend alert! 🎵 #viral #trending #dance',
                timestamp: timestamp(),
                likes: rand(100, 2500),
                comments: rand(10, 300),
                shares: rand(20, 600)
            }),
            linkedin: () => ({
                id: 'li' + rand(1, 9999),
                platform: 'linkedin',
                author: 'Professional Network',
                avatar: `https://via.placeholder.com/40x40/0A66C2/ffffff?text=LI`,
                content: 'Career insights and professional tips. Let\'s grow together! 💼',
                timestamp: timestamp(),
                likes: rand(10, 350),
                comments: rand(1, 40)
            }),
            whatsapp: () => ({
                id: 'wa' + rand(1, 9999),
                platform: 'whatsapp',
                author: 'WhatsApp Status',
                avatar: `https://via.placeholder.com/40x40/25D366/ffffff?text=WA`,
                content: 'Daily motivation: Stay positive and productive! ✨',
                timestamp: timestamp()
            }),
            twitter: () => ({
                id: 'tw' + rand(1, 9999),
                platform: 'twitter',
                author: 'Twitter User',
                avatar: `https://via.placeholder.com/40x40/1DA1F2/ffffff?text=TW`,
                content: 'Quick thoughts and updates from our team! 🐦 #twitter',
                timestamp: timestamp(),
                likes: rand(15, 500),
                comments: rand(2, 80),
                shares: rand(3, 150)
            }),
            youtube: () => ({
                id: 'yt' + rand(1, 9999),
                platform: 'youtube',
                author: 'YouTube Channel',
                avatar: `https://via.placeholder.com/40x40/FF0000/ffffff?text=YT`,
                content: 'New video is live! Don\'t forget to subscribe! 🎬 #youtube',
                timestamp: timestamp(),
                likes: rand(50, 1000),
                comments: rand(5, 200)
            })
        };

        const generator = platformData[platform] || platformData.instagram;
        
        // Генерируем 2 поста для каждой платформы
        return [generator(), generator()];
    }

    function timeAgo(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'just now';
    }

    function formatNumber(num) {
        if (num >= 1000000) return Math.floor(num / 100000) / 10 + 'M';
        if (num >= 1000) return Math.floor(num / 100) / 10 + 'K';
        return num.toString();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function escapeAttr(text) {
        return String(text || '').replace(/"/g, '&quot;');
    }
})();
