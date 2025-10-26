// Замените функцию createWidget на эту версию
function createWidget(container, config) {
    const feeds = generateInstagramFeeds(config);
    const cards = feeds.slice(0, config.maxPosts || 6).map(feed => createCard(feed, config)).join('');

    container.innerHTML = `
        <div class="bhw-widget">
            <div class="bhw-header">
                <div class="bhw-logo-icon">📷</div>
                <div class="bhw-branding-text">
                    <h2>${escapeHtml(config.widgetTitle || "Instagram Feed")}</h2>
                    <p>${escapeHtml(config.widgetDescription || "Latest posts from our Instagram")}</p>
                </div>
            </div>
            <div class="bhw-grid">
                ${cards}
            </div>
        </div>
    `;
}

// Добавьте эту новую функцию
function generateInstagramFeeds(config) {
    let feeds = [];
    
    // Если есть кастомные посты, используем их
    if (config.customPosts && config.customPosts.length > 0) {
        feeds = config.customPosts.map(post => ({
            id: post.id,
            platform: 'instagram',
            author: post.author,
            avatar: post.avatar,
            content: post.content,
            imageUrl: post.imageUrl,
            timestamp: post.timestamp,
            likes: post.likes,
            comments: post.comments,
            url: post.url
        }));
        
        // Дополняем моками если нужно больше постов
        const mockCount = Math.max(0, (config.maxPosts || 6) - feeds.length);
        for (let i = 0; i < mockCount; i++) {
            feeds.push(createMockInstagramFeed());
        }
    } else {
        // Используем только моки
        const maxPosts = config.maxPosts || 6;
        for (let i = 0; i < maxPosts; i++) {
            feeds.push(createMockInstagramFeed());
        }
    }
    
    return feeds.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Обновите функцию createCard (добавить клик на пост)
function createCard(feed, config) {
    return `
        <div class="bhw-card" ${feed.url ? `onclick="window.open('${escapeAttr(feed.url)}', '_blank')" style="cursor: pointer;"` : ''}>
            <div class="bhw-card-content">
                ${config.showAvatars !== false ? `
                    <div class="bhw-card-header">
                        <img class="bhw-avatar" src="${escapeAttr(feed.avatar)}" alt="${escapeAttr(feed.author)}" loading="lazy"/>
                        <div class="bhw-user-info">
                            <div class="bhw-author">${escapeHtml(feed.author)}</div>
                            ${config.showTimestamp !== false ? `<div class="bhw-time">${timeAgo(feed.timestamp)}</div>` : ''}
                        </div>
                        <div class="bhw-platform-badge">📷</div>
                    </div>
                ` : ''}
                <div class="bhw-content">${escapeHtml(feed.content)}</div>
                ${config.showMedia !== false && feed.imageUrl ? `
                    <div class="bhw-media">
                        <img src="${escapeAttr(feed.imageUrl)}" alt="Instagram post" loading="lazy"/>
                    </div>
                ` : ''}
                <div class="bhw-actions">
                    ${feed.likes ? `<div class="bhw-action">❤️ ${formatNumber(feed.likes)}</div>` : ''}
                    ${feed.comments ? `<div class="bhw-action">💬 ${formatNumber(feed.comments)}</div>` : ''}
                    ${feed.url ? `<div class="bhw-action">👁️ View Post</div>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Замените вызов generateMockInstagramFeeds на generateInstagramFeeds в вашем коде
