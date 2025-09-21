(() => {
  'use strict';

  const scripts = Array.from(document.querySelectorAll('script[src*="embed.js"]'));
  if (!scripts.length) return;

  // Красивый дефолт, минимум настроек, все эффекты встроены
  const defaultConfig = {
    title: "Our social",
    platforms: ["facebook", "instagram", "tiktok", "linkedin", "whatsapp"],
    maxPosts: 8,
    layout: "grid",               // grid | list
    showAvatars: true,
    showTimestamp: true,
    refreshInterval: 0,           // ms; 0 = без автообновления
    theme: {
      backgroundColor: null,      // если null — возьмем градиент из primary/secondary
      primaryColor: "#667eea",
      secondaryColor: "#764ba2",
      textColor: "white",
      borderRadius: 20
    },
    fontFamily: "'Inter', system-ui, sans-serif",
    filters: null                 // { minLikes, includeHashtags:[], excludeWords:[] }
  };

  const PLATFORM_ACCENTS = {
    tiktok:  "#FF0050",
    instagram:"#E4405F",
    facebook:"#1877F2",
    linkedin:"#0A66C2",
    whatsapp:"#25D366",
    default: "#ffffff"
  };

  scripts.forEach(async (script) => {
    // защита от повторной инициализации
    if (script.dataset.sfwMounted === '1') return;
    script.dataset.sfwMounted = '1';

    const id = (script.dataset.id || 'demo').replace(/\.(json|js)$/,'');
    const basePath = getBasePath(script.src);
    const cfg = await loadConfig(id, basePath);

    mountWidget(script, cfg, id);
  });

  function mountWidget(host, cfg, id) {
    const config = mergeDeep(defaultConfig, cfg || {});
    const unique = `sfw-${id}-${Date.now()}`;

    const container = document.createElement('div');
    container.className = `sfw-container ${unique}`;
    host.parentNode.insertBefore(container, host);

    const themeBg = config.theme.backgroundColor ||
      `linear-gradient(135deg, ${config.theme.primaryColor} 0%, ${config.theme.secondaryColor} 100%)`;

    // Стили изолированы уникальным классом
    const style = document.createElement('style');
    style.textContent = `
      .${unique} { font-family:${config.fontFamily}; max-width:1200px; margin:20px auto; }
      .${unique} .sfw-widget {
        background: ${themeBg};
        border-radius:${config.theme.borderRadius}px;
        padding: 30px;
        color:${config.theme.textColor};
        box-shadow: 0 20px 60px rgba(0,0,0,.25);
        position: relative; overflow: hidden;
      }
      .${unique} .sfw-widget::before{
        content:''; position:absolute; inset:0;
        background: radial-gradient(circle at 25% 20%, rgba(255,255,255,.18) 0%, transparent 55%);
        pointer-events:none;
      }
      .${unique} .sfw-title{
        text-align:center; margin:0 0 24px 0; font-size:1.9em; font-weight:800;
        letter-spacing:.2px; text-shadow:0 2px 8px rgba(0,0,0,.35);
      }
      .${unique} .sfw-grid{
        display:grid; gap:18px;
        grid-template-columns: repeat(auto-fill, minmax(280px,1fr));
      }
      .${unique} .sfw-grid.list { grid-template-columns: 1fr; }
      .${unique} .sfw-card{
        background: rgba(255,255,255,.14);
        border: 1px solid rgba(255,255,255,.28);
        border-radius:16px; padding:18px;
        backdrop-filter: blur(14px);
        transition: transform .25s ease, box-shadow .25s ease, background .25s ease;
        position:relative; overflow:hidden;
      }
      .${unique} .sfw-card::after{
        content:''; position:absolute; inset:0;
        background: linear-gradient(180deg, rgba(255,255,255,.06), transparent 60%);
        pointer-events:none;
      }
      .${unique} .sfw-card:hover{
        transform: translateY(-4px);
        background: rgba(255,255,255,.20);
        box-shadow: 0 14px 36px rgba(0,0,0,.25);
      }
      .${unique} .sfw-accent{
        content:''; position:absolute; left:0; top:0; bottom:0; width:4px; border-radius:16px 0 0 16px;
      }
      .${unique} .sfw-head{ display:flex; align-items:center; gap:12px; margin-bottom:12px; }
      .${unique} .sfw-avatar{ width:40px; height:40px; border-radius:50%; border:2px solid rgba(255,255,255,.75); object-fit:cover; }
      .${unique} .sfw-meta{ display:flex; flex-direction:column; gap:2px; }
      .${unique} .sfw-author{ font-weight:700; font-size:14px; }
      .${unique} .sfw-time{ font-size:12px; opacity:.85; }
      .${unique} .sfw-content{ font-size:14px; line-height:1.55; margin-top:6px; }
      .${unique} .sfw-actions{ display:flex; gap:10px; margin-top:12px; flex-wrap:wrap; }
      .${unique} .sfw-chip{
        background: rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.32);
        padding:5px 9px; border-radius:9px; font-size:12px; display:inline-flex; gap:6px; align-items:center;
      }
      @media (max-width: 768px){ .${unique} .sfw-widget{ padding:22px; } .${unique} .sfw-title{ font-size:1.6em; } }
    `;
    document.head.appendChild(style);

    // Загрузка/рендер
    container.innerHTML = loadingHTML(unique);
    renderFeeds(container, config, unique);
    if (config.refreshInterval && config.refreshInterval > 0) {
      setInterval(() => renderFeeds(container, config, unique), config.refreshInterval);
    }
  }

  function loadingHTML(unique){
    return `
      <div class="sfw-widget">
        <div class="sfw-title">Загрузка…</div>
        <div class="sfw-grid ${unique}-grid">
          <div class="sfw-card"><div class="sfw-content" style="opacity:.7">Подготавливаем ленту…</div></div>
        </div>
      </div>
    `;
  }

  async function renderFeeds(container, config, unique) {
    const feeds = await collectFeeds(config);
    if (!feeds.length) {
      container.innerHTML = `
        <div class="sfw-widget">
          ${config.title ? `<div class="sfw-title">${escapeHtml(config.title)}</div>`:''}
          <div class="sfw-grid"><div class="sfw-card"><div class="sfw-content">📭 Нет постов</div></div></div>
        </div>
      `;
      return;
    }

    const gridClass = config.layout === 'list' ? 'sfw-grid list' : 'sfw-grid';
    const cards = feeds
      .slice(0, config.maxPosts || 8)
      .map(f => cardHTML(f, unique, config))
      .join('');

    container.innerHTML = `
      <div class="sfw-widget">
        ${config.title ? `<div class="sfw-title">${escapeHtml(config.title)}</div>`:''}
        <div class="${gridClass}">
          ${cards}
        </div>
      </div>
    `;
  }

  function cardHTML(feed, unique, config){
    const accent = PLATFORM_ACCENTS[feed.platform] || PLATFORM_ACCENTS.default;
    return `
      <div class="sfw-card">
        <span class="sfw-accent" style="background:${accent}"></span>
        ${config.showAvatars !== false ? `
          <div class="sfw-head">
            <img class="sfw-avatar" src="${escapeAttr(feed.avatar)}" alt="${escapeAttr(feed.author)}" loading="lazy"/>
            <div class="sfw-meta">
              <div class="sfw-author">${escapeHtml(feed.author)}</div>
              ${config.showTimestamp !== false ? `<div class="sfw-time">${timeAgo(feed.timestamp)}</div>`:''}
            </div>
          </div>
        `:''}
        <div class="sfw-content">${escapeHtml(feed.content)}</div>
        <div class="sfw-actions">
          ${feed.likes ? `<span class="sfw-chip">❤️ ${feed.likes}</span>`:''}
          ${feed.comments ? `<span class="sfw-chip">💬 ${feed.comments}</span>`:''}
          ${feed.shares ? `<span class="sfw-chip">↗️ ${feed.shares}</span>`:''}
        </div>
      </div>
    `;
  }

  async function collectFeeds(config){
    const platforms = (config.platforms || []).map(p => String(p).toLowerCase());
    let all = [];
    for (const p of platforms){
      const arr = await mockFetch(p); // демо-данные
      all = all.concat(arr);
    }
    all = applyFilters(all, config.filters);
    all.sort((a,b)=> new Date(b.timestamp) - new Date(a.timestamp));
    return all;
  }

  // ФИЛЬТРЫ
  function applyFilters(feeds, filters){
    if (!filters) return feeds;
    let res = feeds.slice();
    if (filters.minLikes) res = res.filter(f => (f.likes||0) >= filters.minLikes);
    if (filters.excludeWords?.length){
      const re = new RegExp(filters.excludeWords.join('|'), 'i');
      res = res.filter(f => !re.test(f.content));
    }
    if (filters.includeHashtags?.length){
      const re = new RegExp(filters.includeHashtags.map(h => `#${h}`).join('|'), 'i');
      res = res.filter(f => re.test(f.content));
    }
    return res;
  }

  // DEMO источники (на реальном проекте здесь API)
  async function mockFetch(platform){
    const now = Date.now();
    const rand = (min, max) => Math.floor(Math.random()*(max-min+1))+min;
    const ts = () => new Date(now - rand(10, 60*60*24)*60*1000).toISOString();

    const byP = {
      instagram: () => ({
        id: 'ig'+rand(1,9999), platform:'instagram',
        author:'Instagram User',
        avatar:'https://via.placeholder.com/40x40/E4405F/ffffff?text=IG',
        content:'Amazing photo! 📸 #photography #sunset',
        timestamp: ts(), likes: rand(50, 1200), comments: rand(3,150)
      }),
      facebook: () => ({
        id:'fb'+rand(1,9999), platform:'facebook',
        author:'Facebook Page',
        avatar:'https://via.placeholder.com/40x40/1877F2/ffffff?text=FB',
        content:'Company news and updates. Follow us! 👥',
        timestamp: ts(), likes: rand(20,600), comments: rand(1,90), shares: rand(5,120)
      }),
      tiktok: () => ({
        id:'tk'+rand(1,9999), platform:'tiktok',
        author:'TikTok Creator',
        avatar:'https://via.placeholder.com/40x40/FF0050/ffffff?text=TK',
        content:'New trend 🎵 #viral #trending',
        timestamp: ts(), likes: rand(100,2500), comments: rand(10,300), shares: rand(20,600)
      }),
      linkedin: () => ({
        id:'li'+rand(1,9999), platform:'linkedin',
        author:'Professional Network',
        avatar:'https://via.placeholder.com/40x40/0A66C2/ffffff?text=LI',
        content:'Career insights and tips. Let’s grow together! 💼',
        timestamp: ts(), likes: rand(10,350), comments: rand(1,40)
      }),
      whatsapp: () => ({
        id:'wa'+rand(1,9999), platform:'whatsapp',
        author:'WhatsApp Status',
        avatar:'https://via.placeholder.com/40x40/25D366/ffffff?text=WA',
        content:'Status of the day: productivity and positivity ✨',
        timestamp: ts()
      })
    };

    const make = byP[platform] || byP.instagram;
    // по 2 карточки каждого выбраного источника
    return [make(), make()];
  }

  // Вспомогательные
  function timeAgo(ts){
    const d = new Date(ts), now = new Date();
    const diff = (now - d);
    const m = Math.floor(diff/60000);
    const h = Math.floor(diff/3600000);
    const day = Math.floor(diff/86400000);
    if (day>0) return `${day}d before`;
    if (h>0) return `${h}h before`;
    if (m>0) return `${m}m before`;
    return 'только что';
  }

  async function loadConfig(id, basePath){
    const url = `${basePath}configs/${id}.json`;
    try {
      const r = await fetch(url, { cache:'no-store' });
      if (!r.ok) return defaultConfig;
      const cfg = await r.json();
      return mergeDeep(defaultConfig, cfg);
    } catch {
      return defaultConfig;
    }
  }

  function getBasePath(src){
    try {
      const u = new URL(src, location.href);
      return u.pathname.replace(/\/[^\/]*$/, '/') ;
    } catch { return './'; }
  }

  function mergeDeep(t, s){
    const o = Array.isArray(t) ? t.slice() : { ...t };
    for (const k in s){
      if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k])){
        o[k] = mergeDeep(t[k] || {}, s[k]);
      } else {
        o[k] = s[k];
      }
    }
    return o;
  }

  function escapeHtml(str){ const d=document.createElement('div'); d.textContent = str ?? ''; return d.innerHTML; }
  function escapeAttr(str){ return (str ?? '').replace(/"/g,'&quot;'); }

})();
