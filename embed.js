(function() {
    'use strict';

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
        
        .bhw-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: var(--bhw-header-margin, 32px);
        }
        .bhw-logo-icon {
            width: 56px;
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bhw-logo-bg, linear-gradient(135deg, #E4405F 0%, #C13584 100%));
            border-radius: 16px;
            font-size: 24px;
            color: white;
            box-shadow: 0 4px 12px rgba(228,64,95,0.3);
            flex-shrink: 0;
        }
        .bhw-branding-text h2 {
            font-size: var(--bhw-main-title-size, 1.75em);
            font-weight: 700;
            margin: 0 0 6px 0;
            color: var(--bhw-main-title-color, #1a202c);
        }
        .bhw-branding-text p {
            font-size: var(--bhw-main-description-size, 0.95em);
            color: var(--bhw-main-description-color, #4a5568);
            margin: 0;
        }
        
        .bhw-grid {
            display: flex;
            gap: var(--bhw-gap, 20px);
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 16px;
            -webkit-overflow-scrolling: touch;
        }
        .bhw-grid::-webkit-scrollbar {
            height: 6px;
        }
        .bhw-grid::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
        }
        .bhw-grid::-webkit-scrollbar-thumb {
            background: #E4405F;
            border-radius: 3px;
        }
        
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
            box-shadow: var(--bhw-card-hover-shadow, 0 12px 24px rgba(228,64,95,0.15));
        }
        
        .bhw-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: #E4405F;
            z-index: 1;
        }
        
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
            background: #E4405F;
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
        
        .bhw-media {
            width: 100%;
            height: 200px;
            margin: 16px 0;
            border-radius: 12px;
            overflow: hidden;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        }
        .bhw-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
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
        
        .bhw-loading {
            text-align: center;
            padding: 60px 20px;
            color: var(--bhw-loading-color, #6b7280);
        }
        .bhw-spinner {
            width: 32px;
            height: 32px;
            border: 2px solid #e5e7eb;
            border-top: 2px solid #E4405F;
            border-radius: 50%;
            animation: bhw-spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        @keyframes bhw-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
            .bhw-container { padding: 0 12px; }
            .bhw-widget { padding: var(--bhw-padding-mobile, 24px); }
            .bhw-branding-text h2 { font-size: var(--bhw-title-size-mobile, 1.4em); }
            .bhw-card { flex: 0 0 85%; min-height: 280px; }
        }
    `;

    window.BusinessHoursWidgets = window.BusinessHoursWidgets || {};
    window.BusinessHoursWidgets.instagram = window.BusinessHoursWidgets.instagram || {};

    try {
        const currentScript = document.currentScript || (function() {
            const scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        let clientId = currentScript.dataset.id;
        if (!clientId) {
            console.error('[InstagramWidget] data-id обязателен');
            return;
        }

        clientId = normalizeId(clientId);

        if (currentScript.dataset.bhwMounted === '1') return;
        currentScript.dataset.bhwMounted = '1';

        console.log(`[InstagramWidget] 🚀 Инициализация Instagram виджета "${clientId}"`);

        if (!document.querySelector('#instagram-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'instagram-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }

        const baseUrl = getBasePath(currentScript.src);
        const uniqueClass = `bhw-instagram-${clientId}-${Date.now()}`;
        const container = createContainer(currentScript, clientId, uniqueClass);
        
        showLoading(container);

        loadConfig(clientId, baseUrl)
            .then(fetchedConfig => {
                const finalConfig = mergeDeep(getDefaultConfig(), fetchedConfig);
                applyCustomStyles(uniqueClass, finalConfig.style || {});
                createWidget(container, finalConfig);
                window.BusinessHoursWidgets.instagram[clientId] = { container, config: finalConfig };
                console.log(`[InstagramWidget] ✅ Instagram виджет "${clientId}" успешно создан`);
            })
            .catch(error => {
                console.warn(`[InstagramWidget] ⚠️ Ошибка загрузки "${clientId}":`, error.message);
                const defaultConfig = getDefaultConfig();
                applyCustomStyles(uniqueClass, defaultConfig.style);
                createWidget(container, defaultConfig);
                window.BusinessHoursWidgets.instagram[clientId] = { container, config: defaultConfig };
            });

    } catch (error) {
        console.error('[InstagramWidget] 💥 Критическая ошибка:', error);
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
            console.warn('[InstagramWidget] Ошибка basePath:', error);
            return './';
        }
    }

    function createContainer(scriptElement, clientId, uniqueClass) {
        const container = document.createElement('div');
        container.id = `instagram-widget-${clientId}`;
        container.className = `bhw-container ${uniqueClass}`;
        scriptElement.parentNode.insertBefore(container, scriptElement.nextSibling);
        return container;
    }

    function showLoading(container) {
        container.innerHTML = `
            <div class="bhw-widget">
                <div class="bhw-loading">
                    <div class="bhw-spinner"></div>
                    <div>Loading Instagram posts...</div>
                </div>
            </div>
        `;
    }

    function get<span class="cursor">█</span>
