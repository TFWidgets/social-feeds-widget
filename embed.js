(function() {
    'use strict';

    // Современные CSS стили в стиле скриншота
    const inlineCSS = `
        .bhw-container {
            font-family: var(--bhw-font, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
            max-width: var(--bhw-max-width, 1200px);
            margin: var(--bhw-margin, 20px auto);
            width: 100%;
            padding: 0 16px;
        }
        .bhw-widget {
            background: var(--bhw-bg, #ffffff);
            border-radius: var(--bhw-widget-radius, 24px);
            padding: var(--bhw-padding, 32px);
            color: var(--bhw-text-color, #1a1a1a);
            box-shadow: var(--bhw-shadow, 0 8px 32px rgba(0,0,0,0.08));
            position: relative;
            overflow: hidden;
        }
        
        /* Заголовок виджета */
        .bhw-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: var(--bhw-header-margin, 32px);
            flex-wrap: wrap;
            gap: 20px;
        }
        .bhw-branding {
            display: flex;
            align-items: center;
            gap: 16px;
            flex: 1;
            min-width: 300px;
        }
        .bhw-logo-icon {
            width: 56px;
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bhw-logo-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
            border-radius: 16px;
            font-size: 24px;
            color: white;
            box-shadow: 0 4px 12px rgba(102,126,234,0.3);
            flex-shrink: 0;
        }
        .bhw-branding-text {
            flex: 1;
        }
        .bhw-main-title {
            font-size: var(--bhw-main-title-size, 1.75em);
            font-weight: var(--bhw-main-title-weight, 700);
            line-height: 1.3;
            margin: 0 0 6px 0;
            color: var(--bhw-main-title-color, #1a202c);
        }
        .bhw-main-description {
            font-size: var(--bhw-main-description-size, 0.95em);
            color: var(--bhw-main-description-color, #4a5568);
            line-height: 1.5;
            margin: 0;
        }
        
        /* Иконки платформ в заголовке */
        .bhw-platform-icons {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: flex-end;
        }
        .bhw-platform-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: white;
            font-weight: 600;
            transition: transform 0.2s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .bhw-platform-icon:hover {
            transform: translateY(-2px);
        }
        
        /* Горизонтальная прокрутка */
        .bhw-grid {
            display: flex;
            gap: var(--bhw-gap, 20px);
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 16px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
            scrollbar-color: #e2e8f0 transparent;
        }
        .bhw-grid::-webkit-scrollbar {
            height: 6px;
        }
        .bhw-grid::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
        }
        .bhw-grid::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
        }
        .bhw-grid::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
        
        /* Карточки постов */
        .bhw-card {
            flex: 0 0 var(--bhw-card-width, 340px);
            scroll-snap-align: start;
            background: var(--bhw-card-bg, #ffffff);
            border: var(--bhw-card-border, 1px solid #e5e7eb);
            border-radius: var(--bhw-block-radius, 16px);
            padding: 0;
            transition: all 0.2s ease;
            position: relative;
            display: flex;
            flex-direction: column;
            min-height: var(--bhw-card-min-height, 320px);
            box-shadow: var(--bhw-card-shadow, 0 4px 12px rgba(0,0,0,0.05));
            overflow: hidden;
        }
        .bhw-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--bhw-card-hover-shadow, 0 12px 24px rgba(0,0,0,0.12));
            border-color: var(--bhw-border-hover, #d1d5db);
        }
        
        /* Цветная полоса сверху карточки */
        .bhw-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--bhw-accent-color, #3b82f6);
            z-index: 1;
        }
        
        /* Содержимое карточки */
        .bhw-card-content {
            padding: var(--bhw-block-padding, 20px);
            display: flex;
            flex-direction: column;
            flex: 1;
        }
        
        .bhw-card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }
        .bhw-avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--bhw-avatar-border, #f3f4f6);
        }
        .bhw-user-info {
            flex: 1;
        }
        .bhw-author {
            font-weight: 600;
            font-size: 15px;
            color: var(--bhw-author-color, #111827);
            margin: 0 0 2px 0;
        }
        .bhw-time {
            font-size: 13px;
            color: var(--bhw-time-color, #6b7280);
            margin: 0;
        }
        .bhw-platform-badge {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;
            font-weight: 600;
        }
        
        .bhw-content {
            font-size: 15px;
            line-height: 1.6;
            color: var(--bhw-content-color, #374151);
            margin-bottom: 16px;
            flex: 1;
        }
        
        /* Медиа в карточках */
        .bhw-media {
            width: 100%;
            height: 200px;
            margin: 16px 0;
            border-radius: 12px;
            overflow: hidden;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            position: relative;
        }
        .bhw-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .bhw-media-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: #9ca3af;
        }
        
        /* Действия */
        .bhw-actions {
            display: flex;
            gap: 16px;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid var(--bhw-actions-border, #f3f4f6);
            margin-top: auto;
        }
        .bhw-action {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--bhw-action-color, #6b7280);
            font-size: 14px;
            font-weight: 500;
        }
        .bhw-action-icon {
            font-size: 16px;
        }
        
        /* Загрузка */
        .bhw-loading {
            text-align: center;
            padding: 60px 20px;
            color: var(--bhw-loading-color, #6b7280);
        }
        .bhw-spinner {
            width: 32px;
            height: 32px;
            border: 2px solid #e5e7eb;
            border-top: 2px solid #3b82f6;
            border-radius: 50%;
            animation: bhw-spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        @keyframes bhw-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
            .bhw-container { padding: 0 12px; }
            .bhw-widget { padding: var(--bhw-padding-mobile, 24px); }
            .bhw-main-title { font-size: var(--bhw-title-size-mobile, 1.4em); }
            .bhw-main-description { font-size: 0.85em; }
            .bhw-header { 
                flex-direction: column; 
                gap: 16px; 
                align-items: flex-start; 
            }
            .bhw-branding { min-width: auto; }
            .bhw-platform-icons { justify-content: flex-start; }
            .bhw-card { 
                flex: 0 0 85%;
                min-height: 280px;
            }
        }
    `;

    const PLATFORM_CONFIG = {
        facebook: { color: "#1877F2", icon: "📘", name: "Facebook" },
        instagram: { color: "#E4405F", icon: "📷", name: "Instagram" },
        tiktok: { color: "#FF0050", icon: "🎵", name: "TikTok" },
        linkedin: { color: "#0A66C2", icon: "💼", name: "LinkedIn" },
        twitter: { color: "#1DA1F2", icon: "🐦", name: "Twitter" },
        x: { color: "#000000", icon: "❌", name: "X" },
        youtube: { color: "#FF0000", icon: "📺", name: "YouTube" },
        whatsapp: { color: "#25D366", icon: "💬", name: "WhatsApp" },
        vk: { color: "#4C75A3", icon: "🌐", name: "VK" },
        default: { color: "#6b7280", icon: "📱", name: "Social" }
    };

    window.BusinessHoursWidgets = window.BusinessHoursWidgets || {};
    window.BusinessHoursWidgets.socialFeeds = window.BusinessHoursWidgets.socialFeeds || {};

    try {
        const currentScript = document.currentScript || (function() {
            const scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        let clientId = currentScript.dataset.id;
        if (!clientId) {
            console.error('[BusinessHoursSocialFeedsWidget] data-id обязателен');
            return;
        }

        clientId = normalizeId(clientId);

        if (currentScript.dataset.bhwMounted === '1') return;
        currentScript.dataset.bhwMounted = '1';

        console.log(`[BusinessHoursSocialFeedsWidget] 🚀 Инициализация виджета "${clientId}"`);

        if (!document.querySelector('#business-hours-social-feeds-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'business-hours-social-feeds-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }

        const baseUrl = getBasePath(currentScript.src);
        const uniqueClass = `bhw-social-${clientId}-${Date.now()}`;
        const container = createContainer(currentScript, clientId, uniqueClass);
        
        showLoading(container);

        loadConfig(clientId, baseUrl)
            .then(fetchedConfig => {
                const finalConfig = mergeDeep(getDefaultConfig(), fetchedConfig);
                console.log(`[BusinessHoursSocialFeedsWidget] 📋 Финальный конфиг для "${clientId}":`, finalConfig);
                
                applyCustomStyles(uniqueClass, finalConfig.style || {});
                createWidget(container, finalConfig);
                window.BusinessHoursWidgets.socialFeeds[clientId] = { container, config: finalConfig };
                console.log(`[BusinessHoursSocialFeedsWidget] ✅ Виджет "${clientId}" успешно создан`);
            })
            .catch(error => {
                console.warn(`[BusinessHoursSocialFeedsWidget] ⚠️ Ошибка загрузки "${clientId}":`, error.message);
                const defaultConfig = getDefaultConfig();
                applyCustomStyles(uniqueClass, defaultConfig.style);
                createWidget(container, defaultConfig);
                window.BusinessHoursWidgets.socialFeeds[clientId] = { container, config: defaultConfig };
            });

    } catch (error) {
        console.error('[BusinessHoursSocialFeedsWidget] 💥 Критическая ошибка:', error);
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
            console.warn('[BusinessHoursSocialFeedsWidget] Ошибка basePath:', error);
            return './';
        }
    }

    function createContainer(scriptElement, clientId, uniqueClass) {
        const container = document.createElement('div');
        container.id = `business-hours-social-feeds-widget-${clientId}`;
        container.className = `bhw-container ${uniqueClass}`;
        scriptElement.parentNode.insertBefore(container, scriptElement.nextSibling);
        return container;
    }

    function showLoading(container) {
        container.innerHTML = `
            <div class="bhw-widget">
                <div class="bhw-loading">
                    <div class="bhw-spinner"></div>
                    <div>Loading social feeds...</div>
                </div>
            </div>
        `;
    }

    function getDefaultConfig() {
        return {
            widgetTitle: "Elementor Social Media Feed widget",
            widgetDescription: "Aggregate content from multiple social media platforms into one dynamic feed, giving your visitors fresh and engaging content into your Elementor website effortlessly.",
            showPlatformIcons: true,
            platforms: ["facebook", "instagram", "tiktok", "linkedin", "twitter", "youtube"],
            maxPosts: 6,
            layout: "carousel",
            showAvatars: true,
            showTimestamp: true,
            showMedia: true,
            style: {
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                colors: {
                    background: "#ffffff",
                    text: "#1a1a1a",
                    title: "#1a202c",
                    description: "#4a5568",
                    author: "#111827",
                    time: "#6b7280",
                    content: "#374151",
                    action: "#6b7280",
                    cardBg: "#ffffff",
                    cardBorder: "#e5e7eb",
                    borderHover: "#d1d5db",
                    avatarBorder: "#f3f4f6",
                    actionsBorder: "#f3f4f6",
                    logoBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                },
                borderRadius: { widget: 24, blocks: 16 },
                sizes: { 
                    fontSize: 1.0, 
                    padding: 32, 
                    blockPadding: 20, 
                    gap: 20,
                    cardWidth: 340,
                    cardMinHeight: 320
                },
                shadow: { 
                    widget: "0 8px 32px rgba(0,0,0,0.08)",
                    card: "0 4px 12px rgba(0,0,0,0.05)",
                    cardHover: "0 12px 24px rgba(0,0,0,0.12)"
                }
            }
        };
    }

    function mergeDeep(base, override) {
        const result = { ...base, ...override };
        
        for (const key of ['style']) {
            if (base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
                result[key] = { ...(base[key] || {}), ...(override[key] || {}) };
            }
        }

        if (result.style) {
            for (const subKey of ['colors', 'borderRadius', 'sizes', 'shadow']) {
                if (base.style[subKey] && typeof base.style[subKey] === 'object' && !Array.isArray(base.style[subKey])) {
                    result.style[subKey] = { ...(base.style[subKey] || {}), ...(override.style?.[subKey] || {}) };
                }
            }
        }
        
        return result;
    }

    async function loadConfig(clientId, baseUrl) {
        if (clientId === 'local') {
            // Исправляем ID для совместимости с вашим HTML
            const localScript = document.querySelector('#sfw-local-config') || document.querySelector('#bhw-social-local-config');
            if (!localScript) {
                throw new Error('Локальный конфиг не найден');
            }
            try {
                const config = JSON.parse(localScript.textContent);
                console.log(`[BusinessHoursSocialFeedsWidget] 📄 Локальный конфиг загружен`);
                return config;
            } catch (err) {
                throw new Error('Ошибка JSON: ' + err.message);
            }
        }

        const configUrl = `${baseUrl}configs/${encodeURIComponent(clientId)}.json?v=${Date.now()}`;
        console.log(`[BusinessHoursSocialFeedsWidget] 🌐 Загружаем конфиг: ${configUrl}`);
        
        const response = await fetch(configUrl, { 
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const config = await response.json();
        console.log(`[BusinessHoursSocialFeedsWidget] ✅ Серверный конфиг загружен`);
        return config;
    }

    function applyCustomStyles(uniqueClass, style) {
        const s = style || {};
        const colors = s.colors || {};
        const sizes = s.sizes || {};
        const borderRadius = s.borderRadius || {};
        const shadow = s.shadow || {};
        const fs = sizes.fontSize || 1;

        const styleElement = document.createElement('style');
        styleElement.id = `bhw-social-style-${uniqueClass}`;
        styleElement.textContent = `
            .${uniqueClass} {
                --bhw-font: ${s.fontFamily || "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"};
                --bhw-max-width: ${Math.round(1200 * fs)}px;
                --bhw-bg: ${colors.background || "#ffffff"};
                --bhw-widget-radius: ${borderRadius.widget || 24}px;
                --bhw-padding: ${sizes.padding || 32}px;
                --bhw-padding-mobile: ${Math.round((sizes.padding || 32) * 0.75)}px;
                --bhw-text-color: ${colors.text || "#1a1a1a"};
                --bhw-main-title-color: ${colors.title || "#1a202c"};
                --bhw-main-description-color: ${colors.description || "#4a5568"};
                --bhw-author-color: ${colors.author || "#111827"};
                --bhw-time-color: ${colors.time || "#6b7280"};
                --bhw-content-color: ${colors.content || "#374151"};
                --bhw-action-color: ${colors.action || "#6b7280"};
                --bhw-shadow: ${shadow.widget || "0 8px 32px rgba(0,0,0,0.08)"};
                --bhw-main-title-size: ${1.75 * fs}em;
                --bhw-title-size-mobile: ${1.4 * fs}em;
                --bhw-main-title-weight: 700;
                --bhw-main-description-size: ${0.95 * fs}em;
                --bhw-header-margin: ${32 * fs}px;
                --bhw-gap: ${sizes.gap || 20}px;
                --bhw-card-width: ${sizes.cardWidth || sizes.cardMinWidth || 340}px;
                --bhw-card-min-height: ${sizes.cardMinHeight || 320}px;
                --bhw-card-bg: ${colors.cardBg || "#ffffff"};
                --bhw-card-border: 1px solid ${colors.cardBorder || "#e5e7eb"};
                --bhw-block-radius: ${borderRadius.blocks || 16}px;
                --bhw-block-padding: ${sizes.blockPadding || 20}px;
                --bhw-border-hover: ${colors.borderHover || "#d1d5db"};
                --bhw-card-shadow: ${shadow.card || "0 4px 12px rgba(0,0,0,0.05)"};
                --bhw-card-hover-shadow: ${shadow.cardHover || "0 12px 24px rgba(0,0,0,0.12)"};
                --bhw-avatar-border: ${colors.avatarBorder || "#f3f4f6"};
                --bhw-actions-border: ${colors.actionsBorder || "#f3f4f6"};
                --bhw-logo-bg: ${colors.logoBg || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};
                --bhw-loading-color: #6b7280;
            }
        `;
        document.head.appendChild(styleElement);
    }

    function createWidget(container, config) {
        const feeds = generateMockFeeds(config);
        
        const platformIcons = config.showPlatformIcons ? 
            (config.platforms || []).map(platform => {
                const platformConfig = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.default;
                return `<div class="bhw-platform-icon" style="background: ${platformConfig.color}" title="${platformConfig.name}">${platformConfig.icon}</div>`;
            }).join('') : '';
        
        const cards = feeds.slice(0, config.maxPosts || 6).map(feed => createCard(feed, config)).join('');

        container.innerHTML = `
            <div class="bhw-widget">
                <div class="bhw-header">
                    <div class="bhw-branding">
                        <div class="bhw-logo-icon">📱</div>
                        <div class="bhw-branding-text">
                            <h2 class="bhw-main-title">${escapeHtml(config.widgetTitle || config.title || "Social Feed")}</h2>
                            <p class="bhw-main-description">${escapeHtml(config.widgetDescription || "Latest updates from our social media")}</p>
                        </div>
                    </div>
                    ${config.showPlatformIcons ? `<div class="bhw-platform-icons">${platformIcons}</div>` : ''}
                </div>
                <div class="bhw-grid">
                    ${cards}
                </div>
            </div>
        `;
    }

    function createCard(feed, config) {
        const platformConfig = PLATFORM_CONFIG[feed.platform] || PLATFORM_CONFIG.default;
        
        return `
            <div class="bhw-card" style="--bhw-accent-color: ${platformConfig.color}">
                <div class="bhw-card-content">
                    ${config.showAvatars !== false ? `
                        <div class="bhw-card-header">
                            <img class="bhw-avatar" src="${escapeAttr(feed.avatar)}" alt="${escapeAttr(feed.author)}" loading="lazy"/>
                            <div class="bhw-user-info">
                                <div class="bhw-author">${escapeHtml(feed.author)}</div>
                                ${config.showTimestamp !== false ? `<div class="bhw-time">${timeAgo(feed.timestamp)}</div>` : ''}
                            </div>
                            <div class="bhw-platform-badge" style="background: ${platformConfig.color}">${platformConfig.icon}</div>
                        </div>
                    ` : ''}
                    <div class="bhw-content">${escapeHtml(feed.content)}</div>
                    ${config.showMedia !== false && feed.imageUrl ? `
                        <div class="bhw-media">
                            <img src="${escapeAttr(feed.imageUrl)}" alt="Post media" loading="lazy"/>
                        </div>
                    ` : ''}
                    <div class="bhw-actions">
                        ${feed.likes ? `<div class="bhw-action"><span class="bhw-action-icon">❤️</span> ${formatNumber(feed.likes)}</div>` : ''}
                        ${feed.comments ? `<div class="bhw-action"><span class="bhw-action-icon">💬</span> ${formatNumber(feed.comments)}</div>` : ''}
                        ${feed.shares ? `<div class="bhw-action"><span class="bhw-action-icon">🔄</span> ${formatNumber(feed.shares)}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    function generateMockFeeds(config) {
        const platforms = config.platforms || ['facebook', 'instagram'];
        const feeds = [];
        
        platforms.forEach(platform => {
            feeds.push(createMockFeed(platform));
        });
        
        return feeds.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    function createMockFeed(platform) {
        const now = Date.now();
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const timestamp = new Date(now - rand(10, 60 * 60 * 24 * 3) * 60 * 1000).toISOString();

        const data = {
            instagram: {
                author: 'Esther Howard',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=100&h=100&fit=crop&crop=face',
                content: 'There\'s something magical about that first sip of morning coffee. ☕ The rich aroma, the warmth of the cup in your hands...',
                imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop',
                likes: rand(128, 2459),
                comments: rand(12, 143)
            },
            facebook: {
                author: 'Devon Lane',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                content: '🍳 There\'s nothing quite like the satisfaction of creating a delicious dish from scratch. #HomeCooking #Foodie',
                imageUrl: 'https://images.unsplash.com/photo-1504674900247-087700f9cc28?w=600&h=400&fit=crop',
                likes: rand(588, 1247),
                comments: rand(12, 89),
                shares: rand(15, 67)
            },
            tiktok: {
                author: 'Theresa Webb',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
                content: 'While wandering the streets today, I couldn\'t help but be captivated by the beauty of everyday moments and...',
                imageUrl: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=600&h=400&fit=crop',
                likes: rand(2459, 15600),
                comments: rand(143, 567)
            },
            linkedin: {
                author: 'Professional Network',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                content: 'Career insights and networking tips for professionals. Building meaningful connections in the digital age 💼',
                imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop',
                likes: rand(34, 234),
                comments: rand(8, 45)
            },
            twitter: {
                author: 'Tech Updates',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
                content: 'Breaking: Latest developments in web technology. The future is looking bright! 🚀 #WebDev #Tech',
                likes: rand(156, 890),
                comments: rand(23, 156),
                shares: rand(45, 234)
            },
            youtube: {
                author: 'Creative Studio',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
                content: 'New tutorial series launching next week! Subscribe and hit the bell for notifications 🔔 #YouTube #Tutorial',
                imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop',
                likes: rand(234, 1890),
                comments: rand(34, 156)
            }
        };

        const feedData = data[platform] || data.instagram;
        
        return {
            id: `${platform}_${rand(1, 9999)}`,
            platform: platform,
            timestamp: timestamp,
            ...feedData
        };
    }

    function timeAgo(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days}d`;
        if (hours > 0) return `${hours}h`;
        if (minutes > 0) return `${minutes}m`;
        return 'now';
    }

    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
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
