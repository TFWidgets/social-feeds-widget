(function() {
    'use strict';

    class SocialFeedsWidget {
        constructor(containerId, configPath) {
            this.container = document.getElementById(containerId);
            this.configPath = configPath;
            this.config = {};
            this.cache = new Map();
            this.refreshTimer = null;
            
            this.init();
        }

        async init() {
            try {
                await this.loadConfig();
                this.createStyles();
                this.render();
                this.startAutoRefresh();
            } catch (error) {
                this.handleError('Initialization failed', error);
            }
        }

        async loadConfig() {
            const response = await fetch(this.configPath);
            if (!response.ok) throw new Error(`Config load failed: ${response.status}`);
            this.config = await response.json();
        }

        createStyles() {
            if (document.getElementById('social-feeds-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'social-feeds-styles';
            style.textContent = `
                .social-feeds-widget {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    max-width: 100%;
                    margin: 0 auto;
                }
                
                .feeds-container {
                    display: grid;
                    gap: 20px;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                }
                
                .feed-item {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    transition: transform 0.2s, box-shadow 0.2s;
                    border-left: 4px solid;
                }
                
                .feed-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                }
                
                .feed-item.tiktok { border-left-color: #FF0050; }
                .feed-item.instagram { border-left-color: #E4405F; }
                .feed-item.facebook { border-left-color: #1877F2; }
                .feed-item.linkedin { border-left-color: #0A66C2; }
                .feed-item.whatsapp { border-left-color: #25D366; }
                
                .feed-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .feed-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-right: 12px;
                }
                
                .feed-meta {
                    flex: 1;
                }
                
                .feed-author {
                    font-weight: 600;
                    font-size: 14px;
                    margin-bottom: 4px;
                }
                
                .feed-time {
                    font-size: 12px;
                    color: #666;
                }
                
                .feed-content {
                    font-size: 14px;
                    line-height: 1.5;
                    margin-bottom: 15px;
                }
                
                .feed-actions {
                    display: flex;
                    gap: 15px;
                    font-size: 12px;
                    color: #666;
                }
                
                .platform-icon {
                    width: 20px;
                    height: 20px;
                    margin-left: auto;
                }
                
                .loading {
                    text-align: center;
                    padding: 40px;
                    color: #666;
                }
                
                .error {
                    background: #fee;
                    border: 1px solid #fcc;
                    padding: 15px;
                    border-radius: 8px;
                    color: #c33;
                    text-align: center;
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .feed-item.animated {
                    animation: fadeInUp 0.5s ease-out;
                }
                
                @media (max-width: 768px) {
                    .feeds-container {
                        grid-template-columns: 1fr;
                        gap: 15px;
                    }
                    
                    .feed-item {
                        padding: 15px;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        async render() {
            this.container.innerHTML = `
                

                    

                         Загрузка фидов...
                    

                

            `;

            try {
                const feeds = await this.loadFeeds();
                this.renderFeeds(feeds);
            } catch (error) {
                this.handleError('Failed to load feeds', error);
            }
        }

        async loadFeeds() {
            const feeds = [];
            const platforms = this.config.platforms || [];

            for (const platform of platforms) {
                const cached = this.cache.get(platform);
                if (cached && Date.now() - cached.timestamp < 300000) {
                    feeds.push(...cached.data);
                    continue;
                }

                try {
                    const platformFeeds = await this.fetchPlatformFeeds(platform);
                    this.cache.set(platform, {
                        data: platformFeeds,
                        timestamp: Date.now()
                    });
                    feeds.push(...platformFeeds);
                } catch (error) {
                    console.warn(`Failed to load ${platform} feeds:`, error);
                }
            }

            return feeds
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, this.config.maxPosts || 10);
        }

        async fetchPlatformFeeds(platform) {
            // Mock data for demonstration
            const mockFeeds = {
                tiktok: [
                    {
                        id: 'tk1',
                        platform: 'tiktok',
                        author: 'user_tiktok',
                        avatar: 'https://via.placeholder.com/40x40/FF0050/white?text=T',
                        content: 'Крутой TikTok контент! 🎵 #trending #viral',
                        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                        likes: Math.floor(Math.random() * 1000),
                        shares: Math.floor(Math.random() * 100)
                    }
                ],
                instagram: [
                    {
                        id: 'ig1',
                        platform: 'instagram',
                        author: 'user_instagram',
                        avatar: 'https://via.placeholder.com/40x40/E4405F/white?text=I',
                        content: 'Красивое фото из Instagram! 📸 #photo #lifestyle',
                        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                        likes: Math.floor(Math.random() * 500),
                        comments: Math.floor(Math.random() * 50)
                    }
                ],
                facebook: [
                    {
                        id: 'fb1',
                        platform: 'facebook',
                        author: 'User Facebook',
                        avatar: 'https://via.placeholder.com/40x40/1877F2/white?text=F',
                        content: 'Интересный пост в Facebook. Делимся мыслями и новостями!',
                        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                        likes: Math.floor(Math.random() * 200),
                        comments: Math.floor(Math.random() * 30)
                    }
                ],
                linkedin: [
                    {
                        id: 'li1',
                        platform: 'linkedin',
                        author: 'Professional User',
                        avatar: 'https://via.placeholder.com/40x40/0A66C2/white?text=L',
                        content: 'Профессиональные инсайты и карьерные советы в LinkedIn 💼',
                        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                        likes: Math.floor(Math.random() * 150),
                        comments: Math.floor(Math.random() * 20)
                    }
                ],
                whatsapp: [
                    {
                        id: 'wa1',
                        platform: 'whatsapp',
                        author: 'WhatsApp Status',
                        avatar: 'https://via.placeholder.com/40x40/25D366/white?text=W',
                        content: 'Статус в WhatsApp: Отличное настроение! ✨',
                        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
                    }
                ]
            };

            return mockFeeds[platform] || [];
        }

        renderFeeds(feeds) {
            if (feeds.length === 0) {
                this.container.innerHTML = `
                    

                        

                            Нет доступных фидов для отображения
                        

                    

                `;
                return;
            }

            const feedsHTML = feeds.map((feed, index) => `
                

                    ${this.config.showAvatars ? `
                        

                            ${feed.author}
                            

                                
${feed.author}

                                ${this.config.showTimestamp ? `
                                    
${this.formatTime(feed.timestamp)}

                                ` : ''}
                            

                            

                                ${this.getPlatformIcon(feed.platform)}
                            

                        

                    ` : ''}
                    
                    
${feed.content}

                    
                    

                        ${feed.likes ? ` ${feed.likes}` : ''}
                        ${feed.comments ? ` ${feed.comments}` : ''}
                        ${feed.shares ? ` ${feed.shares}` : ''}
                    

                

            `).join('');

            this.container.innerHTML = `
                

                    

                        ${feedsHTML}
                    

                

            `;
        }

        getPlatformIcon(platform) {
            const icons = {
                tiktok: '',
                instagram: '',
                facebook: '',
                linkedin: '',
                whatsapp: ''
            };
            return icons[platform] || '';
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

        startAutoRefresh() {
            if (this.config.refreshInterval && this.config.refreshInterval > 0) {
                this.refreshTimer = setInterval(() => {
                    this.render();
                }, this.config.refreshInterval);
            }
        }

        handleError(message, error) {
            console.error(message, error);
            this.container.innerHTML = `
                

                    

                        
                        ${message}: ${error.message}
                    

                

            `;
        }

        destroy() {
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
            }
            this.cache.clear();
        }
    }

    // Auto-initialization
    document.addEventListener('DOMContentLoaded', function() {
        const scripts = document.querySelectorAll('script[data-config]');
        scripts.forEach(script => {
            const configPath = script.getAttribute('data-config');
            const containerId = script.getAttribute('data-container') || 'social-feeds-widget';
            
            // Create container if doesn't exist
            if (!document.getElementById(containerId)) {
                const container = document.createElement('div');
                container.id = containerId;
                script.parentNode.insertBefore(container, script);
            }
            
            new SocialFeedsWidget(containerId, configPath);
        });
    });

    // Global API
    window.SocialFeedsWidget = SocialFeedsWidget;
})();
