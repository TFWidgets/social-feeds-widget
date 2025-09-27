(function() {
    'use strict';

    // Базовые CSS стили
    const inlineCSS = `
        .bhw-container {
            font-family: var(--bhw-font, 'Inter', system-ui, sans-serif);
            max-width: var(--bhw-max-width, 1200px);
            margin: var(--bhw-margin, 20px auto);
            width: 100%;
        }
        .bhw-widget {
            background: var(--bhw-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
            border-radius: var(--bhw-widget-radius, 20px);
            padding: var(--bhw-padding, 30px);
            color: var(--bhw-text-color, white);
            box-shadow: var(--bhw-shadow, 0 20px 60px rgba(0,0,0,0.25));
            position: relative;
            overflow: hidden;
        }
        .bhw-widget::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 25% 20%, rgba(255,255,255,0.18) 0%, transparent 55%);
            pointer-events: none;
        }
        .bhw-title {
            text-align: center;
            margin: 0 0 var(--bhw-title-margin, 24px) 0;
            font-size: var(--bhw-title-size, 1.9em);
            font-weight: var(--bhw-title-weight, 800);
            text-shadow: var(--bhw-text-shadow, 0 2px 8px rgba(0,0,0,0.35));
        }
        .bhw-grid {
            display: grid;
            gap: var(--bhw-gap, 18px);
            grid-template-columns: repeat(auto-fill, minmax(var(--bhw-card-width, 280px), 1fr));
        }
        .bhw-card {
            background: var(--bhw-block-bg, rgba(255,255,255,0.14));
            border: var(--bhw-block-border, 1px solid rgba(255,255,255,0.28));
            border-radius: var(--bhw-block-radius, 16px);
            padding: var(--bhw-block-padding, 18px);
            backdrop-filter: blur(14px);
            transition: all 0.25s ease;
            position: relative;
        }
        .bhw-card:hover {
            transform: translateY(-4px);
            background: var(--bhw-block-bg-hover, rgba(255,255,255,0.20));
            box-shadow: var(--bhw-card-shadow, 0 14px 36px rgba(0,0,0,0.25));
        }
        .bhw-accent {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            border-radius: 16px 0 0 16px;
        }
        .bhw-head {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }
        .bhw-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.75);
            object-fit: cover;
        }
        .bhw-meta {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .bhw-author {
            font-weight: 700;
            font-size: 14px;
        }
        .bhw-time {
            font-size: 12px;
            opacity: 0.85;
        }
        .bhw-content {
            font-size: 14px;
            line-height: 1.55;
            margin-top: 6px;
        }
        .bhw-actions {
            display: flex;
            gap: 10px;
            margin-top: 12px;
            flex-wrap: wrap;
        }
        .bhw-chip {
            background: rgba(255,255,255,0.18);
            border: 1px solid rgba(255,255,255,0.32);
            padding: 5px 9px;
            border-radius: 9px;
            font-size: 12px;
            display: inline-flex;
            gap: 6px;
            align-items: center;
        }
        .bhw-loading {
            text-align: center;
            padding: var(--bhw-loading-padding, 40px);
            color: var(--bhw-loading-color, white);
        }
        .bhw-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: bhw-spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        @keyframes bhw-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
            .bhw-widget { padding: var(--bhw-padding-mobile, 22px); }
            .bhw-title { font-size: var(--bhw-title-size-mobile, 1.6em); }
            .bhw-grid { grid-template-columns: 1fr; }
        }
    `;

    const PLATFORM_COLORS = {
        instagram: "#E4405F",
        facebook: "#1877F2",
        tiktok: "#FF0050",
        linkedin: "#0A66C2",
        whatsapp: "#25D366",
        default: "#ffffff"
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

        // Защита от повторного выполнения
        if (currentScript.dataset.bhwMounted === '1') return;
        currentScript.dataset.bhwMounted = '1';

        console.log(`[BusinessHoursSocialFeedsWidget] 🚀 Инициализация виджета "${clientId}"`);

        // Уникальный ID стилей для social feeds виджета
        if (!document.querySelector('#business-hours-social-feeds-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'business-hours-social-feeds-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }

        const baseUrl = getBasePath(currentScript.src);
        const uniqueClass = `bhw-social-${clientId}-${Date.now()}`;
        const container = createContainer(currentScript, clientId, uniqueClass);
        
        // Показываем загрузку
        showLoading(container);

        // Загружаем конфигурацию
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
            title: "Our Social",
            platforms: ["facebook", "instagram", "tiktok", "linkedin"],
            maxPosts: 8,
            layout: "grid",
            showAvatars: true,
            showTimestamp: true,
            style: {
                fontFamily: "'Inter', system-ui, sans-serif",
                valueFontFamily: "'Inter', system-ui, sans-serif",
                colors: {
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    text: "white",
                    blockBackground: "rgba(255,255,255,0.14)",
                    blockBorder: "rgba(255,255,255,0.28)",
                    blockHover: "rgba(255,255,255,0.20)"
                },
                borderRadius: { widget: 20, blocks: 16 },
                sizes: { 
                    fontSize: 1.0, 
                    padding: 30, 
                    blockPadding: 18, 
                    gap: 18,
                    cardWidth: 280
                },
                shadow: { 
                    widget: "0 20px 60px rgba(0,0,0,0.25)",
                    text: "0 2px 8px rgba(0,0,0,0.35)",
                    cardHover: "0 14px 36px rgba(0,0,0,0.25)"
                }
            }
        };
    }

    function mergeDeep(base, override) {
        const result = { ...base, ...override };
        
        // Сливаем объекты первого уровня
        for (const key of ['style']) {
            if (base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
                result[key] = { ...(base[key] || {}), ...(override[key] || {}) };
            }
        }

        // Сливаем объекты второго уровня в style
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
        // Локальный конфиг
        if (clientId === 'local') {
            const localScript = document.querySelector('#bhw-social-local-config');
            if (!localScript) {
                throw new Error('Локальный конфиг не найден (#bhw-social-local-config)');
            }
            try {
                const config = JSON.parse(localScript.textContent);
                console.log(`[BusinessHoursSocialFeedsWidget] 📄 Локальный конфиг загружен`);
                return config;
            } catch (err) {
                throw new Error('Ошибка JSON: ' + err.message);
            }
        }

        // Загрузка с сервера
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
                --bhw-font: ${s.fontFamily || "'Inter', system-ui, sans-serif"};
                --bhw-value-font: ${s.valueFontFamily || "'Inter', system-ui, sans-serif"};
                --bhw-max-width: ${Math.round(1200 * fs)}px;
                --bhw-bg: ${colors.background || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};
                --bhw-widget-radius: ${borderRadius.widget || 20}px;
                --bhw-padding: ${sizes.padding || 30}px;
                --bhw-padding-mobile: ${Math.round((sizes.padding || 30) * 0.73)}px;
                --bhw-text-color: ${colors.text || "white"};
                --bhw-shadow: ${shadow.widget || "0 20px 60px rgba(0,0,0,0.25)"};
                --bhw-text-shadow: ${shadow.text || "0 2px 8px rgba(0,0,0,0.35)"};
                --bhw-title-size: ${1.9 * fs}em;
                --bhw-title-size-mobile: ${1.6 * fs}em;
                --bhw-title-weight: 800;
                --bhw-title-margin: ${24 * fs}px;
                --bhw-gap: ${sizes.gap || 18}px;
                --bhw-card-width: ${sizes.cardWidth || 280}px;
                --bhw-block-bg: ${colors.blockBackground || "rgba(255,255,255,0.14)"};
                --bhw-block-border: 1px solid ${colors.blockBorder || "rgba(255,255,255,0.28)"};
                --bhw-block-radius: ${borderRadius.blocks || 16}px;
                --bhw-block-padding: ${sizes.blockPadding || 18}px;
                --bhw-block-bg-hover: ${colors.blockHover || "rgba(255,255,255,0.20)"};
                --bhw-card-shadow: ${shadow.cardHover || "0 14px 36px rgba(0,0,0,0.25)"};
                --bhw-loading-padding: 40px;
                --bhw-loading-color: white;
            }
        `;
        document.head.appendChild(styleElement);
    }

    function createWidget(container, config) {
        const feeds = generateMockFeeds(config);
        
        const gridClass = config.layout === 'list' ? 'bhw-grid list' : 'bhw-grid';
        const cards = feeds.slice(0, config.maxPosts || 8).map(feed => createCard(feed, config)).join('');

        container.innerHTML = `
            <div class="bhw-widget">
                ${config.title ? `<div class="bhw-title">${escapeHtml(config.title)}</div>` : ''}
                <div class="${gridClass}">
                    ${cards}
                </div>
            </div>
        `;
    }

    function createCard(feed, config) {
        const accent = PLATFORM_COLORS[feed.platform] || PLATFORM_COLORS.default;
        
        return `
            <div class="bhw-card">
                <span class="bhw-accent" style="background: ${accent}"></span>
                ${config.showAvatars !== false ? `
                    <div class="bhw-head">
                        <img class="bhw-avatar" src="${escapeAttr(feed.avatar)}" alt="${escapeAttr(feed.author)}" loading="lazy"/>
                        <div class="bhw-meta">
                            <div class="bhw-author">${escapeHtml(feed.author)}</div>
                            ${config.showTimestamp !== false ? `<div class="bhw-time">${timeAgo(feed.timestamp)}</div>` : ''}
                        </div>
                    </div>
                ` : ''}
                <div class="bhw-content">${escapeHtml(feed.content)}</div>
                <div class="bhw-actions">
                    ${feed.likes ? `<span class="bhw-chip">❤️ ${feed.likes}</span>` : ''}
                    ${feed.comments ? `<span class="bhw-chip">💬 ${feed.comments}</span>` : ''}
                    ${feed.shares ? `<span class="bhw-chip">↗️ ${feed.shares}</span>` : ''}
                </div>
            </div>
        `;
    }

    function generateMockFeeds(config) {
        const platforms = config.platforms || ['facebook', 'instagram'];
        const feeds = [];
        
        platforms.forEach(platform => {
            for (let i = 0; i < 2; i++) {
                feeds.push(createMockFeed(platform));
            }
        });
        
        return feeds.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    function createMockFeed(platform) {
        const now = Date.now();
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const timestamp = new Date(now - rand(10, 60 * 60 * 24) * 60 * 1000).toISOString();

        const data = {
            instagram: {
                author: 'Instagram User',
                avatar: 'https://via.placeholder.com/40x40/E4405F/ffffff?text=IG',
                content: 'Amazing photo! 📸 #photography #sunset',
                likes: rand(50, 1200),
                comments: rand(3, 150)
            },
            facebook: {
                author: 'Facebook Page',
                avatar: 'https://via.placeholder.com/40x40/1877F2/ffffff?text=FB',
                content: 'Company news and updates. Follow us! 👥',
                likes: rand(20, 600),
                comments: rand(1, 90),
                shares: rand(5, 120)
            },
            tiktok: {
                author: 'TikTok Creator',
                avatar: 'https://via.placeholder.com/40x40/FF0050/ffffff?text=TK',
                content: 'New trend! 🎵 #viral #trending',
                likes: rand(100, 2500),
                comments: rand(10, 300)
            },
            linkedin: {
                author: 'Professional',
                avatar: 'https://via.placeholder.com/40x40/0A66C2/ffffff?text=LI',
                content: 'Career insights and tips 💼',
                likes: rand(10, 350),
                comments: rand(1, 40)
            },
            whatsapp: {
                author: 'WhatsApp Status',
                avatar: 'https://via.placeholder.com/40x40/25D366/ffffff?text=WA',
                content: 'Status update! 💚',
                likes: rand(5, 200),
                comments: rand(1, 25)
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
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'just now';
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
