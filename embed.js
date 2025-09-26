(function() {
    'use strict';

    // Базовые CSS стили
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
            background: radial-gradient(circle at 25% 20%, rgba(255,255,255,0.18) 0%, transparent 55%);
            pointer-events: none;
        }
        .sfw-title {
            text-align: center;
            margin: 0 0 var(--sfw-title-margin, 24px) 0;
            font-size: var(--sfw-title-size, 1.9em);
            font-weight: var(--sfw-title-weight, 800);
            text-shadow: var(--sfw-text-shadow, 0 2px 8px rgba(0,0,0,0.35));
        }
        .sfw-grid {
            display: grid;
            gap: var(--sfw-gap, 18px);
            grid-template-columns: repeat(auto-fill, minmax(var(--sfw-card-width, 280px), 1fr));
        }
        .sfw-card {
            background: var(--sfw-block-bg, rgba(255,255,255,0.14));
            border: var(--sfw-block-border, 1px solid rgba(255,255,255,0.28));
            border-radius: var(--sfw-block-radius, 16px);
            padding: var(--sfw-block-padding, 18px);
            backdrop-filter: blur(14px);
            transition: all 0.25s ease;
            position: relative;
        }
        .sfw-card:hover {
            transform: translateY(-4px);
            background: var(--sfw-block-bg-hover, rgba(255,255,255,0.20));
            box-shadow: var(--sfw-card-shadow, 0 14px 36px rgba(0,0,0,0.25));
        }
        .sfw-accent {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            border-radius: 16px 0 0 16px;
        }
        .sfw-head {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }
        .sfw-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.75);
            object-fit: cover;
        }
        .sfw-meta {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .sfw-author {
            font-weight: 700;
            font-size: 14px;
        }
        .sfw-time {
            font-size: 12px;
            opacity: 0.85;
        }
        .sfw-content {
            font-size: 14px;
            line-height: 1.55;
            margin-top: 6px;
        }
        .sfw-actions {
            display: flex;
            gap: 10px;
            margin-top: 12px;
            flex-wrap: wrap;
        }
        .sfw-chip {
            background: rgba(255,255,255,0.18);
            border: 1px solid rgba(255,255,255,0.32);
            padding: 5px 9px;
            border-radius: 9px;
            font-size: 12px;
            display: inline-flex;
            gap: 6px;
            align-items: center;
        }
        @media (max-width: 768px) {
            .sfw-widget { padding: 22px; }
            .sfw-title { font-size: 1.6em; }
            .sfw-grid { grid-template-columns: 1fr; }
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

        if (currentScript.dataset.sfwMounted === '1') return;
        currentScript.dataset.sfwMounted = '1';

        console.log(`[SocialFeedsWidget] 🚀 Инициализация виджета "${clientId}"`);

        // Добавляем базовые стили
        if (!document.querySelector('#social-feeds-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'social-feeds-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }

        const baseUrl = getBasePath(currentScript.src);
        const uniqueClass = `sfw-${clientId}-${Date.now()}`;
        const container = createContainer(currentScript, clientId, uniqueClass);
        
        // Загружаем конфигурацию
        loadConfig(clientId, baseUrl)
            .then(fetchedConfig => {
                const finalConfig = mergeDeep(getDefaultConfig(), fetchedConfig);
                console.log(`[SocialFeedsWidget] ✅ Конфиг загружен:`, finalConfig);
                
                applyCustomStyles(uniqueClass, finalConfig.style || {});
                createWidget(container, finalConfig);
                console.log(`[SocialFeedsWidget] ✅ Виджет "${clientId}" готов`);
            })
            .catch(error => {
                console.warn(`[SocialFeedsWidget] ⚠️ Используем дефолт для "${clientId}":`, error.message);
                const defaultConfig = getDefaultConfig();
                applyCustomStyles(uniqueClass, defaultConfig.style);
                createWidget(container, defaultConfig);
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
            console.warn('[SocialFeedsWidget] Ошибка basePath:', error);
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
                colors: {
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    text: "white",
                    blockBackground: "rgba(255,255,255,0.14)",
                    blockBorder: "rgba(255,255,255,0.28)",
                    blockHover: "rgba(255,255,255,0.20)"
                },
                borderRadius: { widget: 20, blocks: 16 },
                sizes: { fontSize: 1.0, padding: 30, blockPadding: 18, gap: 18 },
                shadow: { widget: "0 20px 60px rgba(0,0,0,0.25)" }
            }
        };
    }

    function mergeDeep(base, override) {
        const result = { ...base, ...override };
        
        if (base.style && override.style) {
            result.style = { ...base.style, ...override.style };
            
            ['colors', 'borderRadius', 'sizes', 'shadow'].forEach(key => {
                if (base.style[key] && override.style[key]) {
                    result.style[key] = { ...base.style[key], ...override.style[key] };
                }
            });
        }
        
        return result;
    }

    async function loadConfig(clientId, baseUrl) {
        // Локальный конфиг
        if (clientId === 'local') {
            const localScript = document.querySelector('#sfw-local-config');
            if (!localScript) {
                throw new Error('Локальный конфиг не найден (#sfw-local-config)');
            }
            try {
                const config = JSON.parse(localScript.textContent);
                console.log(`[SocialFeedsWidget] 📄 Локальный конфиг загружен`);
                return config;
            } catch (err) {
                throw new Error('Ошибка JSON: ' + err.message);
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
        console.log(`[SocialFeedsWidget] ✅ Серверный конфиг загружен`);
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
        styleElement.textContent = `
            .${uniqueClass} {
                --sfw-font: ${s.fontFamily || "'Inter', system-ui, sans-serif"};
                --sfw-max-width: ${Math.round(1200 * fs)}px;
                --sfw-bg: ${colors.background || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};
                --sfw-widget-radius: ${borderRadius.widget || 20}px;
                --sfw-padding: ${sizes.padding || 30}px;
                --sfw-text-color: ${colors.text || "white"};
                --sfw-shadow: ${shadow.widget || "0 20px 60px rgba(0,0,0,0.25)"};
                --sfw-text-shadow: ${shadow.text || "0 2px 8px rgba(0,0,0,0.35)"};
                --sfw-title-size: ${1.9 * fs}em;
                --sfw-title-weight: 800;
                --sfw-title-margin: ${24 * fs}px;
                --sfw-gap: ${sizes.gap || 18}px;
                --sfw-card-width: ${sizes.cardWidth || 280}px;
                --sfw-block-bg: ${colors.blockBackground || "rgba(255,255,255,0.14)"};
                --sfw-block-border: 1px solid ${colors.blockBorder || "rgba(255,255,255,0.28)"};
                --sfw-block-radius: ${borderRadius.blocks || 16}px;
                --sfw-block-padding: ${sizes.blockPadding || 18}px;
                --sfw-block-bg-hover: ${colors.blockHover || "rgba(255,255,255,0.20)"};
                --sfw-card-shadow: ${shadow.cardHover || "0 14px 36px rgba(0,0,0,0.25)"};
            }
        `;
        document.head.appendChild(styleElement);
    }

    function createWidget(container, config) {
        const feeds = generateMockFeeds(config);
        
        const gridClass = config.layout === 'list' ? 'sfw-grid list' : 'sfw-grid';
        const cards = feeds.slice(0, config.maxPosts || 8).map(feed => createCard(feed, config)).join('');

        container.innerHTML = `
            <div class="sfw-widget">
                ${config.title ? `<div class="sfw-title">${escapeHtml(config.title)}</div>` : ''}
                <div class="${gridClass}">
                    ${cards}
                </div>
            </div>
        `;
    }

    function createCard(feed, config) {
        const accent = PLATFORM_COLORS[feed.platform] || PLATFORM_COLORS.default;
        
        return `
            <div class="sfw-card">
                <span class="sfw-accent" style="background: ${accent}"></span>
                ${config.showAvatars !== false ? `
                    <div class="sfw-head">
                        <img class="sfw-avatar" src="${escapeAttr(feed.avatar)}" alt="${escapeAttr(feed.author)}" loading="lazy"/>
                        <div class="sfw-meta">
                            <div class="sfw-author">${escapeHtml(feed.author)}</div>
                            ${config.showTimestamp !== false ? `<div class="sfw-time">${timeAgo(feed.timestamp)}</div>` : ''}
                        </div>
                    </div>
                ` : ''}
                <div class="sfw-content">${escapeHtml(feed.content)}</div>
                <div class="sfw-actions">
                    ${feed.likes ? `<span class="sfw-chip">❤️ ${feed.likes}</span>` : ''}
                    ${feed.comments ? `<span class="sfw-chip">💬 ${feed.comments}</span>` : ''}
                    ${feed.shares ? `<span class="sfw-chip">↗️ ${feed.shares}</span>` : ''}
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
