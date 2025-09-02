/**
 * Social Media Feeds Widget
 * Полностью самодостаточный виджет для отображения фидов из социальных сетей
 */
(function() {
    'use strict';
    
    // Встроенные стили (полный CSS внутри JS)
    const inlineCSS = `
        .sfw-container {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 20px auto;
        }
        .sfw-widget {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(102,126,234,0.4);
            color: white;
            position: relative;
            overflow: hidden;
        }
        .sfw-widget::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%);
            pointer-events: none;
        }
        .sfw-title {
            font-size: 1.8em;
            font-weight: 700;
            margin: 0 0 25px 0;
            text-shadow: 0 2px 8px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
            text-align: center;
        }
        .sfw-feeds {
            display: grid;
            gap: 20px;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            position: relative;
            z-index: 1;
        }
        .sfw-feeds.list-layout {
            grid-template-columns: 1fr;
        }
        .sfw-item {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 16px;
            padding: 20px;
            transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
            position: relative;
        }
        .sfw-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            background: rgba(255,255,255,0.25);
        }
        .sfw-item.tiktok { border-left: 4px solid #FF0050; }
        .sfw-item.instagram { border-left: 4px solid #E4405F; }
        .sfw-item.facebook { border-left: 4px solid #1877F2; }
        .sfw-item.linkedin { border-left: 4px solid #0A66C2; }
        .sfw-item.whatsapp { border-left: 4px solid #25D366; }
        .sfw-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .sfw-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 12px;
            border: 2px solid rgba(255,255,255,0.7);
        }
        .sfw-meta {
            flex: 1;
        }
        .sfw-author {
            font-weight: 600;
            font-size: 14px;
            margin: 0 0 4px 0;
        }
        .sfw-time {
            font-size: 12px;
            opacity: 0.8;
        }
        .sfw-platform-icon {
            font-size: 18px;
            margin-left: auto;
        }
        .sfw-content {
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 15px;
        }
        .sfw-actions {
            display: flex;
            gap: 15px;
            font-size: 12px;
        }
        .sfw-action {
            background: rgba(255,255,255,0.2);
            padding: 4px 8px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .sfw-loading {
            text-align: center;
            padding: 60px 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
            backdrop-filter: blur(10px);
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
        .sfw-error {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            padding: 30px;
            border-radius: 16px;
            text-align: center;
            color: white;
            box-shadow: 0 15px 40px rgba(255,107,107,0.4);
        }
        @keyframes sfw-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes sfw-fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .sfw-item.animated {
            animation: sfw-fadeInUp 0.6s ease-out forwards;
        }
        @media (max-width: 768px) {
            .sfw-feeds {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            .sfw-widget {
                padding: 20px;
            }
            .sfw-title {
                font-size: 1.5em;
            }
        }
    `;
    
    // Добавляем стили один раз на страницу
    if (!document.getElementById('sfw-styles')) {
        const style = document.createElement('style');
        style.id = 'sfw-styles';
        style.textContent = inlineCSS;
        document.head.appendChild(style);
    }
    
    // Определяем текущий script тег
    const currentScript = document.currentScript || 
        (function() {
            const scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();
    
    const clientId = currentScript.dataset.id;
    if (!clientId) {
        console.error('[SocialFeedsWidget] data-id обязателен');
        return;
    }
    
    // Определяем базовый URL (откуда загружен embed.js)
    const baseUrl = currentScript.src.replace(/\/[^\/]+$/, '');
    const configUrl = `${baseUrl}/configs/${encodeURIComponent(clientId)}.json`;
    
    // Создаем контейнер
    const container = document.createElement('div');
    container.id = `sfw-${clientId}`;
    container.className = 'sfw-container';
    currentScript.parentNode.insertBefore(container, currentScript.nextSibling);
    
    // Класс виджета
    class SocialFeedsWidget {
        constructor(containerEl, configUrl) {
            this.container = containerEl;
            this.configUrl = configUrl;
            this.config = {};
            this.cache = new Map();
            this.refreshTimer = null;
            this.init();
        }
        
        async init() {
            try {
                this.showLoading();
                await this.loadConfig();
                await this.render();
                this.startAutoRefresh();
                console.log(`[SocialFeedsWidget] Виджет ${clientId} успешно инициализирован`);
            } catch (error) {
                this.showError('Ошибка инициализации', error);
            }
        }
        
        showLoading() {
            this.container.innerHTML = `
                <div class="sfw-widget">
                    <div class="sfw-loading">
                        <div class="sfw-spinner"></div>
                        <div>Загрузка социальных фидов...</div>
                    </div>
                </div>
            `;
        }
        
        async loadConfig() {
            const response = await fetch(this.configUrl, {
                cache: 'no-cache',
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`Конфигурация не найдена (${response.status})`);
            }
            
            this.config = await response.json();
        }
        
        async render() {
            const feeds = await this.loadFeeds();
            const layout = this.config.layout === 'list' ? 'list-layout' : '';
            
            if (feeds.length === 0) {
                this.container.innerHTML = `
                    <div class="sfw-widget">
                        <div class="sfw-loading">📭 Нет доступных фидов</div>
                    </div>
                `;
                return;
            }
            
            const feedsHTML = feeds.map((feed, index) => `
                <div class="sfw-item ${feed.platform} ${this.config.animation ? 'animated' : ''}" 
                     style="animation-delay: ${index * 0.1}s">
                    ${this.config.showAvatars !== false ? `
                        <div class="sfw-header">
                            <img class="sfw-avatar" src="${feed.avatar}" alt="${feed.author}" loading="lazy">
                            <div class="sfw-meta">
                                <div class="sfw-author">${this.escapeHtml(feed.author)}</div>
                                ${this.config.showTimestamp !== false ? `
                                    <div class="sfw-time">${this.formatTime(feed.timestamp)}</div>
                                ` : ''}
                            </div>
                            <div class="sfw-platform-icon">${this.getPlatformIcon(feed.platform)}</div>
                        </div>
                    ` : ''}
                    <div class="sfw-content">${this.escapeHtml(feed.content)}</div>
                    <div class="sfw-actions">
                        ${feed.likes ? `<div class="sfw-action">❤️ ${feed.likes}</div>` : ''}
                        ${feed.comments ? `<div class="sfw-action">💬 ${feed.comments}</div>` : ''}
                        ${feed.shares ? `<div class="sfw-action">↗️ ${feed.shares}</div>` : ''}
                    </div>
                </div>
            `).join('');
            
            this.container.innerHTML = `
                <div class="sfw-widget">
                    ${this.config.title ? `<h2 class="sfw-title">${this.escapeHtml(this.config.title)}</h2>` : ''}
                    <div class="sfw-feeds ${layout}">
                        ${feedsHTML}
                    </div>
                </div>
            `;
        }
        
        async loadFeeds() {
            const platforms = this.config.platforms || [];
            const maxPosts = this.config.maxPosts || 10;
            let allFeeds = [];
            
            for (const platform of platforms) {
                try {
                    const feeds = await this.fetchPlatformFeeds(platform);
                    allFeeds.push(...feeds);
                } catch (error) {
                    console.warn(`Ошибка загрузки ${platform}:`, error);
                }
            }
            
            // Применяем фильтры
            allFeeds = this.applyFilters(allFeeds);
            
            // Сортируем по времени и ограничиваем количество
            return allFeeds
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, maxPosts);
        }
        
        async fetchPlatformFeeds(platform) {
            // Проверяем кэш (5 минут)
            const cacheKey = `feeds_${platform}`;
            const cached = this.cache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < 300000) {
                return cached.data;
            }
            
            // Демонстрационные данные (в реальном проекте здесь будут API вызовы)
            const mockData = {
                tiktok: [
                    {
                        id: 'tk1',
                        platform: 'tiktok',
                        author: 'TikTok Creator',
                        avatar: 'https://via.placeholder.com/40x40/FF0050/white?text=TK',
                        content: 'Крутой TikTok контент! 🎵 Новый тренд набирает обороты #viral #trending',
                        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                        likes: Math.floor(Math.random() * 2000) + 100,
                        comments: Math.floor(Math.random() * 200) + 10,
                        shares: Math.floor(Math.random() * 500) + 20
                    }
                ],
                instagram: [
                    {
                        id: 'ig1',
                        platform: 'instagram',
                        author: 'Instagram User',
                        avatar: 'https://via.placeholder.com/40x40/E4405F/white?text=IG',
                        content: 'Потрясающее фото дня! 📸 Закат над городом просто невероятный #photography #sunset',
                        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                        likes: Math.floor(Math.random() * 1000) + 50,
                        comments: Math.floor(Math.random() * 100) + 5
                    }
                ],
                facebook: [
                    {
                        id: 'fb1',
                        platform: 'facebook',
                        author: 'Facebook Page',
                        avatar: 'https://via.placeholder.com/40x40/1877F2/white?text=FB',
                        content: 'Делимся важными новостями и обновлениями. Следите за нашими постами! 👥',
                        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                        likes: Math.floor(Math.random() * 500) + 25,
                        comments: Math.floor(Math.random() * 50) + 3,
                        shares: Math.floor(Math.random() * 100) + 5
                    }
                ],
                linkedin: [
                    {
                        id: 'li1',
                        platform: 'linkedin',
                        author: 'Professional Network',
                        avatar: 'https://via.placeholder.com/40x40/0A66C2/white?text=LI',
                        content: 'Профессиональные инсайты и карьерные советы. Развивайтесь вместе с нами! 💼',
                        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                        likes: Math.floor(Math.random() * 300) + 15,
                        comments: Math.floor(Math.random() * 30) + 2
                    }
                ],
                whatsapp: [
                    {
                        id: 'wa1',
                        platform: 'whatsapp',
                        author: 'WhatsApp Status',
                        avatar: 'https://via.placeholder.com/40x40/25D366/white?text=WA',
                        content: 'Статус дня: Позитивное настроение и продуктивность! ✨ Отличный день впереди',
                        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
                    }
                ]
            };
            
            const feeds = mockData[platform] || [];
            this.cache.set(cacheKey, { data: feeds, timestamp: Date.now() });
            return feeds;
        }
        
        applyFilters(feeds) {
            const filters = this.config.filters || {};
            
            if (filters.minLikes) {
                feeds = feeds.filter(feed => (feed.likes || 0) >= filters.minLikes);
            }
            
            if (filters.excludeWords && filters.excludeWords.length) {
                const excludeRegex = new RegExp(filters.excludeWords.join('|'), 'i');
                feeds = feeds.filter(feed => !excludeRegex.test(feed.content));
            }
            
            if (filters.includeHashtags && filters.includeHashtags.length) {
                const hashtagRegex = new RegExp(filters.includeHashtags.map(tag => `#${tag}`).join('|'), 'i');
                feeds = feeds.filter(feed => hashtagRegex.test(feed.content));
            }
            
            return feeds;
        }
        
        getPlatformIcon(platform) {
            const icons = {
                tiktok: '🎵',
                instagram: '📸',
                facebook: '👥',
                linkedin: '💼',
                whatsapp: '💬'
            };
            return icons[platform] || '📱';
        }
        
        formatTime(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diff = now - date;
            
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);
            
            if (days > 0) return `${days}д назад`;
            if (hours > 0) return `${hours}ч назад`;
            if (minutes > 0) return `${minutes}м назад`;
            return 'Только что';
        }
        
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        startAutoRefresh() {
            const interval = this.config.refreshInterval;
            if (interval && interval > 0) {
                this.refreshTimer = setInterval(() => {
                    this.render().catch(console.error);
                }, interval);
            }
        }
        
        showError(title, error) {
            console.error('[SocialFeedsWidget]', title, error);
            this.container.innerHTML = `
                <div class="sfw-error">
                    <h3 style="margin: 0 0 15px 0;">⚠️ ${title}</h3>
                    <p style="margin: 0; opacity: 0.9;">ID: ${clientId}</p>
                    <details style="margin-top: 15px;">
                        <summary style="cursor: pointer;">Подробности</summary>
                        <p style="margin: 10px 0 0 0; font-size: 0.9em;">${error.message}</p>
                    </details>
                </div>
            `;
        }
        
        destroy() {
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
            }
            this.cache.clear();
        }
    }
    
    // Автоинициализация
    try {
        const widget = new SocialFeedsWidget(container, configUrl);
        container.__socialFeedsWidget = widget;
        window.SocialFeedsWidget = SocialFeedsWidget;
    } catch (error) {
        console.error('[SocialFeedsWidget] Критическая ошибка:', error);
        container.innerHTML = `
            <div class="sfw-error">
                <strong>⛔ Ошибка загрузки виджета</strong><br>
                <small>${error.message}</small>
            </div>
        `;
    }
})();
