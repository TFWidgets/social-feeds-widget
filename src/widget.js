(function () {
  if (window.SocialWidget) return;

  const ICONS = {
    tiktok: '🎵',
    instagram: '📷',
    facebook: '📘',
    linkedin: '💼',
    whatsapp: '💬'
  };

  function el(tag, attrs = {}, html = '') {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (html) node.innerHTML = html;
    return node;
  }

  function bySel(sel, root = document) { return root.querySelector(sel); }

  function makeCard(n) {
    const isWA = n.type === 'whatsapp';
    const a = el('a', {
      class: 'sf-card',
      href: isWA
        ? `https://wa.me/${String(n.phone || '').replace(/\D/g,'')}?text=${encodeURIComponent(n.message || 'Здравствуйте!')}`
        : n.url,
      target: '_blank',
      rel: 'noopener'
    });

    a.innerHTML = `
      <div class="sf-card__head">
        <span class="sf-ico" aria-hidden="true">${ICONS[n.type] || '🌐'}</span>
        <div class="sf-title">
          <strong>${n.name || n.type}</strong>
          <small>${isWA ? 'Быстрый чат' : 'Официальная страница'}</small>
        </div>
      </div>

      <div class="sf-card__feed">
        ${isWA ? `
          <div class="sf-chat">
            <div class="sf-chat__line">👋 Напишите нам в WhatsApp</div>
            <div class="sf-chat__btn">Открыть чат</div>
          </div>
        ` : `
          <div class="sf-post">
            <div class="sf-post__thumb"></div>
            <div class="sf-post__text">
              <div class="sf-post__title">Последние публикации</div>
              <div class="sf-post__muted">Для реальной ленты нужен API — подключим позже.</div>
            </div>
          </div>
        `}
      </div>
    `;
    return a;
  }

  function renderTabs(root, networks, activeIdx, onChange) {
    const tabs = el('div', { class: 'sf-tabs' });
    networks.forEach((n, i) => {
      const b = el('button', {
        class: 'sf-tab' + (i === activeIdx ? ' is-active' : ''),
        'data-idx': String(i)
      }, `${ICONS[n.type] || '🌐'} ${n.name}`);
      b.addEventListener('click', () => onChange(i));
      tabs.appendChild(b);
    });
    root.appendChild(tabs);
  }

  function renderGrid(root, networks, startIdx, count) {
    const grid = el('div', { class: 'sf-grid' });
    const slice = [];
    for (let i = 0; i < count; i++) {
      slice.push(networks[(startIdx + i) % networks.length]);
    }
    slice.forEach(n => grid.appendChild(makeCard(n)));
    root.appendChild(grid);
  }

  const SocialWidget = {
    /**
     * options:
     *  - selector: '#container' | HTMLElement
     *  - networks: [{type:'instagram'|'tiktok'|'facebook'|'linkedin'|'whatsapp', name:'...', url:'...', phone?, message?}]
     *  - show: 2  // сколько карточек показывать одновременно
     *  - title: 'Мы в соцсетях'
     */
    init(options) {
      const {
        selector,
        networks = [],
        show = 2,
        title = 'Мы в соцсетях'
      } = options;

      const root = typeof selector === 'string' ? bySel(selector) : selector;
      if (!root) return console.error('SocialWidget: контейнер не найден');

      root.classList.add('sf-wrap');
      root.innerHTML = `
        <div class="sf-header">
          <h3 class="sf-h3">${title}</h3>
        </div>
      `;

      const header = root.querySelector('.sf-header');

      let activeIdx = 0; // с какого индекса показываем 2 карточки

      const content = el('div', { class: 'sf-content' });
      root.appendChild(content);

      const rerender = () => {
        content.innerHTML = '';
        renderTabs(content, networks, activeIdx, (i) => {
          activeIdx = i;
          rerender();
        });
        renderGrid(content, networks, activeIdx, Math.max(1, Math.min(show, 2)));
      };

      // первый рендер
      rerender();

      return { root, rerender };
    }
  };

  // экспорт
  window.SocialWidget = SocialWidget;
})();

