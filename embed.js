/*!
 * TF Widgets — Social Feed v2
 * Встраивание: <script src=".../embed.js" data-id="CLIENT_ID"></script>
 * Конфиг клиента: configs/CLIENT_ID.json (формат v1 с customPosts поддерживается)
 * Клиент выбирает свои НАСТОЯЩИЕ посты (Instagram, TikTok, YouTube, Facebook, X) — виджет показывает их
 * красивой сеткой, а по клику открывает сам пост (официальное встраивание соцсети) во всплывающем окне.
 * Картинки-превью подтягиваются бесплатно через /api/post этого же сайта.
 * Классы и CSS-переменные: префикс bhw- (общий для всех виджетов TF Widgets), всё ограничено классом .bhw-sf.
 */
(function () {
    'use strict';
    var VERSION = '2.0.0';
    var LOG = '[TFW Social]';
    // Где работает живое превью BHWSocialFeed.render() (конфигуратор на сайте)
    var PREVIEW_DOMAINS = ['tf-widgets.com', '*.tf-widgets.com', '9ac5za-h1.myshopify.com'];

    var PLATFORMS = {
        instagram: { name: 'Instagram', color: '#d62976' },
        tiktok:    { name: 'TikTok',    color: '#111111' },
        youtube:   { name: 'YouTube',   color: '#ff0033' },
        facebook:  { name: 'Facebook',  color: '#1877f2' },
        x:         { name: 'X',         color: '#111111' }
    };
    var I18N = {
        en: { follow: 'Follow us', view: 'View on {p}', close: 'Close', prev: 'Previous', next: 'Next', open: 'Open post' },
        es: { follow: 'Síguenos', view: 'Ver en {p}', close: 'Cerrar', prev: 'Anterior', next: 'Siguiente', open: 'Abrir publicación' },
        fr: { follow: 'Suivez-nous', view: 'Voir sur {p}', close: 'Fermer', prev: 'Précédent', next: 'Suivant', open: 'Ouvrir la publication' },
        de: { follow: 'Folge uns', view: 'Auf {p} ansehen', close: 'Schließen', prev: 'Zurück', next: 'Weiter', open: 'Beitrag öffnen' },
        it: { follow: 'Seguici', view: 'Vedi su {p}', close: 'Chiudi', prev: 'Precedente', next: 'Successivo', open: 'Apri il post' },
        nl: { follow: 'Volg ons', view: 'Bekijk op {p}', close: 'Sluiten', prev: 'Vorige', next: 'Volgende', open: 'Bericht openen' },
        pt: { follow: 'Siga-nos', view: 'Ver no {p}', close: 'Fechar', prev: 'Anterior', next: 'Seguinte', open: 'Abrir publicação' },
        pl: { follow: 'Obserwuj nas', view: 'Zobacz na {p}', close: 'Zamknij', prev: 'Poprzedni', next: 'Następny', open: 'Otwórz post' },
        cs: { follow: 'Sledujte nás', view: 'Zobrazit na {p}', close: 'Zavřít', prev: 'Předchozí', next: 'Další', open: 'Otevřít příspěvek' },
        sk: { follow: 'Sledujte nás', view: 'Zobraziť na {p}', close: 'Zavrieť', prev: 'Predchádzajúci', next: 'Ďalší', open: 'Otvoriť príspevok' }
    };

    /* нейтральные значки (не логотипы соцсетей) */
    var ICON = {
        instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 4 7.2 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.2L15 4zm3 4.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/></svg>',
        tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.6A3.5 3.5 0 1 0 14 16.8V8.3a6 6 0 0 0 5 2.2V8a4 4 0 0 1-4-4V3z"/></svg>',
        youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l11-6.5z"/></svg>',
        facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M2 10h4v11H2zm6 11h9.3a2 2 0 0 0 2-1.6l1.5-7A2 2 0 0 0 18.9 10H14l.9-4.3a1.6 1.6 0 0 0-2.8-1.3L8 9.5z"/></svg>',
        x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-5 4V5a2 2 0 0 1 2-2z" transform="translate(-1 0)"/></svg>',
        play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l11-6.5z"/></svg>',
        left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.4 5.4 8.8 12l6.6 6.6-1.4 1.4-8-8 8-8z"/></svg>',
        right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m8.6 18.6 6.6-6.6-6.6-6.6L10 4l8 8-8 8z"/></svg>',
        close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z"/></svg>',
        ext: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14zM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/></svg>'
    };

    var inlineCSS = `
        .bhw-sf { font-family: var(--bhw-font, 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif); -webkit-font-smoothing: antialiased; box-sizing: border-box; font-size: var(--bhw-font-size, 15px); line-height: 1.45; }
        .bhw-sf *, .bhw-sf *::before, .bhw-sf *::after { box-sizing: border-box; }
        .bhw-sf.bhw-container { width: 100%; max-width: var(--bhw-max-width, 1140px); margin: var(--bhw-margin, 24px auto); }
        .bhw-sf .bhw-widget {
            position: relative; overflow: hidden; isolation: isolate;
            background: var(--bhw-bg, #ffffff); color: var(--bhw-text-color, #111111);
            border: 1px solid var(--bhw-widget-border, rgba(0,0,0,.07)); border-radius: var(--bhw-widget-radius, 22px);
            padding: var(--bhw-padding, 28px); box-shadow: var(--bhw-shadow, 0 24px 60px -28px rgba(0,0,0,.28));
        }
        .bhw-sf.bhw-flat .bhw-widget { background: transparent; border: 0; box-shadow: none; padding: 0; }

        .bhw-sf .bhw-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px 24px; margin: 0 0 22px; }
        .bhw-sf .bhw-head-txt { display: grid; gap: 4px; min-width: 0; }
        .bhw-sf .bhw-title { margin: 0; padding: 0; font-family: inherit; font-size: var(--bhw-title-size, 1.45em); font-weight: 800; line-height: 1.2; letter-spacing: -.02em; }
        .bhw-sf .bhw-subtitle { margin: 0; font-size: .93em; opacity: .66; }
        .bhw-sf .bhw-follow { display: flex; flex-wrap: wrap; gap: 8px; }
        .bhw-sf .bhw-fbtn {
            display: inline-flex; align-items: center; gap: 8px; margin: 0; padding: 10px 15px 10px 12px; min-height: 0; border-radius: 999px;
            font: inherit; font-size: .88em; font-weight: 700; line-height: 1.2; text-decoration: none !important; white-space: nowrap;
            background: var(--bhw-accent, #111); color: var(--bhw-accent-text, #fff); transition: transform .2s, filter .2s;
        }
        .bhw-sf .bhw-fbtn:hover { transform: translateY(-1px); filter: brightness(1.1); }
        .bhw-sf .bhw-fbtn + .bhw-fbtn { background: transparent; color: inherit; box-shadow: inset 0 0 0 1px var(--bhw-line, rgba(0,0,0,.14)); }
        .bhw-sf .bhw-fbtn svg { width: 17px; height: 17px; flex: none; }

        .bhw-sf .bhw-grid { display: grid; grid-template-columns: repeat(var(--bhw-cols, 3), minmax(0, 1fr)); gap: var(--bhw-gap, 12px); margin: 0; padding: 0; list-style: none; }
        .bhw-sf .bhw-post { margin: 0; min-width: 0; }
        .bhw-sf .bhw-tile { position: relative; display: block; width: 100%; margin: 0; padding: 0; min-height: 0; border: 0; border-radius: var(--bhw-block-radius, 14px); overflow: hidden; background: var(--bhw-tile-bg, #f1f1f3); color: inherit; font: inherit; text-align: left; cursor: pointer; aspect-ratio: var(--bhw-ratio, 1 / 1); box-shadow: none; text-decoration: none !important; }
        .bhw-sf .bhw-tile img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; border: 0 !important; margin: 0; padding: 0; max-width: none; transition: transform .5s cubic-bezier(.2,.8,.2,1); }
        .bhw-sf .bhw-tile:hover img { transform: scale(1.05); }
        .bhw-sf .bhw-ph { position: absolute; inset: 0; display: grid; place-items: center; background: linear-gradient(135deg, var(--bhw-ph1, #e9e6ef), var(--bhw-ph2, #f6f3ee)); }
        .bhw-sf .bhw-ph svg { width: 34%; max-width: 64px; height: auto; opacity: .22; color: var(--bhw-text-color, #111); }
        .bhw-sf .bhw-quote-card { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; padding: 16px; background: var(--bhw-accent, #111); color: var(--bhw-accent-text, #fff); }
        .bhw-sf .bhw-quote-card p { margin: 0; font-size: .95em; font-weight: 600; line-height: 1.4; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 7; overflow: hidden; }
        .bhw-sf .bhw-quote-card span { font-size: .78em; opacity: .75; }
        .bhw-sf .bhw-badge { position: absolute; top: 10px; right: 10px; z-index: 2; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,.92); color: #111; box-shadow: 0 4px 10px rgba(0,0,0,.15); }
        .bhw-sf .bhw-badge svg { width: 16px; height: 16px; }
        .bhw-sf .bhw-playbtn { position: absolute; left: 50%; top: 50%; z-index: 2; display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,.45); color: #fff; -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); transition: transform .25s, background .25s; }
        .bhw-sf .bhw-playbtn svg { width: 22px; height: 22px; margin-left: 3px; }
        .bhw-sf .bhw-tile:hover .bhw-playbtn { transform: translate(-50%, -50%) scale(1.08); background: rgba(0,0,0,.6); }
        .bhw-sf .bhw-over { position: absolute; inset: 0; z-index: 1; display: flex; align-items: flex-end; padding: 14px; background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,.72)); color: #fff; opacity: 0; transition: opacity .3s; }
        .bhw-sf .bhw-over p { margin: 0; font-size: .86em; line-height: 1.4; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
        .bhw-sf .bhw-tile:hover .bhw-over, .bhw-sf .bhw-tile:focus-visible .bhw-over { opacity: 1; }
        @media (hover: none) { .bhw-sf .bhw-over { display: none; } }
        .bhw-sf .bhw-cap { margin: 10px 2px 0; display: grid; gap: 3px; }
        .bhw-sf .bhw-cap-author { font-size: .82em; font-weight: 700; }
        .bhw-sf .bhw-cap-text { margin: 0; font-size: .88em; opacity: .78; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }

        /* слайдер */
        .bhw-sf.bhw-carousel .bhw-grid { grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: calc((100% - (var(--bhw-cols, 4) - 1) * var(--bhw-gap, 12px)) / var(--bhw-cols, 4)); overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; scrollbar-width: none; }
        .bhw-sf.bhw-carousel .bhw-grid::-webkit-scrollbar { display: none; }
        .bhw-sf.bhw-carousel .bhw-post { scroll-snap-align: start; }
        .bhw-sf.bhw-carousel.bhw-w-sm .bhw-grid { grid-auto-columns: 72%; }
        .bhw-sf .bhw-car-foot { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin: 14px 0 0; }
        .bhw-sf .bhw-arrow { display: grid; place-items: center; width: 40px; height: 40px; margin: 0; padding: 0; min-height: 0; border-radius: 50%; border: 1px solid var(--bhw-line, rgba(0,0,0,.14)); background: var(--bhw-bg, #fff); color: inherit; box-shadow: none; cursor: pointer; }
        .bhw-sf .bhw-arrow svg { width: 20px; height: 20px; }
        .bhw-sf .bhw-arrow[disabled] { opacity: .35; cursor: default; }

        /* всплывающий пост */
        .bhw-sf-modal { position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center; padding: 56px 64px; background: rgba(0,0,0,.84); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); animation: bhw-sf-fade .2s ease; }
        .bhw-sf-modal .bhw-sf-frame { position: relative; overflow: hidden; border-radius: 14px; background: #fff; box-shadow: 0 30px 80px rgba(0,0,0,.6); max-width: 100%; max-height: calc(100vh - 112px); }
        .bhw-sf-modal .bhw-sf-frame.bhw-dark { background: #000; }
        .bhw-sf-modal iframe { display: block; width: 100%; height: 100%; border: 0; }
        .bhw-sf-modal button { position: absolute; display: grid; place-items: center; margin: 0; padding: 0; border: 0; border-radius: 50%; background: rgba(255,255,255,.14); color: #fff !important; cursor: pointer; }
        .bhw-sf-modal button svg { width: 22px; height: 22px; }
        .bhw-sf-modal .bhw-sf-x { top: 12px; right: 12px; width: 42px; height: 42px; }
        .bhw-sf-modal .bhw-sf-prev, .bhw-sf-modal .bhw-sf-next { top: 50%; width: 46px; height: 46px; transform: translateY(-50%); }
        .bhw-sf-modal .bhw-sf-prev { left: 10px; } .bhw-sf-modal .bhw-sf-next { right: 10px; }
        .bhw-sf-modal .bhw-sf-ext { position: absolute; left: 50%; bottom: 16px; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 6px; color: #fff !important; font: 600 13px/1 system-ui, sans-serif; opacity: .85; text-decoration: none !important; white-space: nowrap; }
        .bhw-sf-modal .bhw-sf-ext svg { width: 14px; height: 14px; }
        @media (max-width: 600px) { .bhw-sf-modal { padding: 56px 8px; } .bhw-sf-modal .bhw-sf-prev, .bhw-sf-modal .bhw-sf-next { top: auto; bottom: 8px; transform: none; } }
        @keyframes bhw-sf-fade { from { opacity: 0; } to { opacity: 1; } }

        .bhw-sf .bhw-tile:focus-visible, .bhw-sf .bhw-fbtn:focus-visible, .bhw-sf .bhw-arrow:focus-visible { outline: 2px solid var(--bhw-accent, #111); outline-offset: 3px; }
        @media (max-width: 560px) { .bhw-sf .bhw-widget { padding: var(--bhw-padding-mobile, 18px); } .bhw-sf.bhw-flat .bhw-widget { padding: 0; } }
        @media (prefers-reduced-motion: reduce) { .bhw-sf *, .bhw-sf-modal { animation: none !important; transition: none !important; scroll-behavior: auto !important; } }

        /* защита от тем сайта, которые красят весь текст через color: ... !important */
        .bhw-sf .bhw-widget { color: var(--bhw-text-color, #111) !important; }
        .bhw-sf .bhw-widget :where(*) { color: inherit !important; }
        .bhw-sf .bhw-widget .bhw-fbtn:first-child, .bhw-sf .bhw-widget .bhw-fbtn:first-child *, .bhw-sf .bhw-widget .bhw-quote-card, .bhw-sf .bhw-widget .bhw-quote-card * { color: var(--bhw-accent-text, #fff) !important; }
        .bhw-sf .bhw-widget .bhw-over, .bhw-sf .bhw-widget .bhw-over *, .bhw-sf .bhw-widget .bhw-playbtn { color: #fff !important; }
        .bhw-sf .bhw-widget .bhw-badge { color: #111 !important; }
        .bhw-sf img { border: 0 !important; }
    `;

    /* =========================================================
       ПУБЛИЧНЫЕ API
       ========================================================= */
    window.BusinessHoursWidgets = window.BusinessHoursWidgets || {};
    window.BusinessHoursWidgets.social = window.BusinessHoursWidgets.social || {};

    var currentScript = document.currentScript || (function () {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();
    var BASE = getBasePath(currentScript && currentScript.src);

    // Живое превью для конфигуратора: BHWSocialFeed.render(container, config) -> { update, setState, destroy }
    var api = window.BHWSocialFeed = window.BHWSocialFeed || {};
    api.version = VERSION;
    api.base = BASE;
    api.defaults = getDefaultConfig;
    api.checkAccess = bhwCheckAccess;
    api.parsePost = parsePost;
    api.fetchPost = function (url) {
        return fetch(BASE + 'api/post?url=' + encodeURIComponent(url), { headers: { 'Accept': 'application/json' } })
            .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status)); return j; }); });
    };
    api.render = function (container, config) {
        var noop = { destroy: function () {}, update: function () {}, setState: function () {} };
        if (!bhwCheckAccess({ domains: PREVIEW_DOMAINS }).ok) { console.warn(LOG, 'preview is only available on tf-widgets.com'); return noop; }
        injectBaseStyles();
        if (container._bhwSfDestroy) container._bhwSfDestroy();
        var cls = container.__bhwSfClass || (container.__bhwSfClass = 'bhw-sf-preview-' + Math.random().toString(36).slice(2, 8));
        var widget = null;
        function build(cfg) {
            if (widget) widget.destroy();
            widget = mountWidget(normalizeConfig(cfg || {}), cls, 'preview', { inline: container, preview: true });
        }
        build(config);
        var ctrl = {
            update: function (cfg) { build(cfg); },
            setState: function () {},
            destroy: function () { if (widget) widget.destroy(); widget = null; container._bhwSfDestroy = null; }
        };
        container._bhwSfDestroy = ctrl.destroy;
        return ctrl;
    };

    /* =========================================================
       АВТОЗАПУСК ПО <script data-id="..."> (только свой тег)
       ========================================================= */
    try {
        if (currentScript && currentScript.dataset && currentScript.dataset.id && currentScript.dataset.bhwMounted !== '1') {
            currentScript.dataset.bhwMounted = '1';
            var debug = currentScript.dataset.debug === '1';
            var clientId = normalizeId(currentScript.dataset.id);
            loadConfig(clientId, BASE)
                .then(function (fetched) {
                    var access = bhwCheckAccess(fetched);
                    if (!access.ok) {
                        console.warn(LOG, 'widget "' + clientId + '" is not active on ' + (location.hostname || 'this page') + ': ' + access.reason);
                        return;
                    }
                    var cfg = normalizeConfig(fetched);
                    if (!cfg.posts.length) { console.warn(LOG, 'no posts in config'); return; }
                    injectBaseStyles();
                    if (debug) console.log(LOG, 'config "' + clientId + '":', cfg);
                    var mount = function () {
                        var w = mountWidget(cfg, 'bhw-sf-' + clientId.replace(/[^a-z0-9_-]/gi, '') + '-' + Date.now(), clientId, { anchor: currentScript });
                        window.BusinessHoursWidgets.social[clientId] = w;
                    };
                    if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
                })
                .catch(function (error) {
                    // Нет конфига = нет виджета
                    console.warn(LOG, 'config "' + clientId + '" not loaded:', error.message);
                });
        }
    } catch (error) {
        console.error(LOG, 'critical error:', error);
    }

    /* =========================================================
       ФУНКЦИИ
       ========================================================= */
    function injectBaseStyles() {
        if (!document.getElementById('social-widget-styles-v2')) {
            var style = document.createElement('style');
            style.id = 'social-widget-styles-v2';
            style.textContent = inlineCSS;
            (document.head || document.documentElement).appendChild(style);
        }
    }

    /* ---------------------------------------------------------
       ДОСТУП (общий блок для всех виджетов TF Widgets — копировать без изменений)
       В конфиге клиента:
         "active": true,                       // false = виджет выключен (например, подписка отменена)
         "domains": ["client.com", "client-shop.myshopify.com", "*.client.com"]
       "client.com" разрешает client.com и www.client.com,
       "*.client.com" — любые поддомены (shop.client.com и т.д.).
       Без списка domains виджет не запускается.
       На localhost и при открытии файла с компьютера работает всегда (для тестов).
       --------------------------------------------------------- */
    function bhwCheckAccess(config) {
        config = config || {};
        if (config.active === false) return { ok: false, reason: 'widget is switched off ("active": false)' };
        var host = String(location.hostname || '').toLowerCase().replace(/^www\./, '');
        if (!host || host === 'localhost' || host === '127.0.0.1' || location.protocol === 'file:') return { ok: true };
        var list = config.domains;
        if (typeof list === 'string') list = list.split(/[\s,]+/);
        if (!Array.isArray(list) || !list.length) return { ok: false, reason: 'no "domains" in config' };
        for (var i = 0; i < list.length; i++) {
            var d = String(list[i] || '').trim().toLowerCase()
                .replace(/^[a-z]+:\/\//, '').replace(/[\/:].*$/, '').replace(/^www\./, '');
            if (!d) continue;
            if (d.indexOf('*.') === 0) {
                var base = d.slice(2);
                if (host === base || host.slice(-(base.length + 1)) === '.' + base) return { ok: true };
            } else if (host === d) {
                return { ok: true };
            }
        }
        return { ok: false, reason: 'domain is not in "domains"' };
    }

    function normalizeId(id) { return String(id || 'demo').replace(/\.(json|js)$/i, ''); }
    function getBasePath(src) {
        if (!src) return './';
        try { var url = new URL(src, location.href); return url.origin + url.pathname.replace(/\/[^\/]*$/, '/'); }
        catch (error) { return './'; }
    }
    function loadConfig(clientId, baseUrl) {
        if (clientId === 'local') {
            var el = document.querySelector('#instagram-local-config') || document.querySelector('#bhw-local-config');
            if (!el) return Promise.reject(new Error('#bhw-local-config not found'));
            try { return Promise.resolve(JSON.parse(el.textContent)); } catch (e) { return Promise.reject(e); }
        }
        var url = baseUrl + 'configs/' + encodeURIComponent(clientId) + '.json?v=' + Date.now();
        return fetch(url, { cache: 'no-store', headers: { 'Accept': 'application/json' } })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    }

    function getDefaultConfig() {
        return {
            layout: 'grid',                 // grid — плитка; cards — плитка с подписью снизу; carousel — слайдер
            shape: 'square',                // square | portrait (4:5) | story (9:16)
            columns: 3,
            title: 'Follow our story',
            subtitle: '',
            profiles: [],                   // [{ platform: 'instagram', url: 'https://instagram.com/yourshop' }]
            posts: [],                      // [{ url, platform, id, caption, author, image }]
            showCaptions: true,
            openIn: 'popup',                // popup — пост поверх сайта; tab — открыть соцсеть
            locale: 'en',
            style: {
                fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
                transparent: false,
                colors: {
                    background: '#ffffff',
                    text: '#111111',
                    accent: '#111111',
                    accentText: '#ffffff',
                    tile: '#f1f1f3',
                    widgetBorder: 'rgba(0, 0, 0, 0.07)',
                    line: 'rgba(0, 0, 0, 0.14)'
                },
                borderRadius: { widget: 22, blocks: 14 },
                sizes: { fontSize: 1, padding: 28, gap: 12, width: 1140 },
                shadow: { widget: '0 24px 60px -28px rgba(0, 0, 0, 0.28)' }
            }
        };
    }

    /* ссылка → платформа и ID (то же, что делает сервер) */
    function parsePost(raw) {
        var u; try { u = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw); } catch (e) { return null; }
        var h = u.hostname.replace(/^(www\.|m\.|mobile\.)/, '').toLowerCase(), path = u.pathname, m;
        if (h === 'instagram.com' && (m = path.match(/^\/(?:[\w.]+\/)?(p|reel|reels|tv)\/([\w-]{5,40})/))) { var kind = m[1] === 'p' ? 'p' : m[1] === 'tv' ? 'tv' : 'reel'; return { platform: 'instagram', id: m[2], kind: kind, url: 'https://www.instagram.com/' + kind + '/' + m[2] + '/' }; }
        if (h === 'tiktok.com' && (m = path.match(/\/video\/(\d{8,25})/))) return { platform: 'tiktok', id: m[1], url: 'https://www.tiktok.com' + path.replace(/\/$/, '') };
        if (/(^|\.)tiktok\.com$/.test(h) && /^(vm|vt)\./.test(u.hostname)) return { platform: 'tiktok', id: '', url: u.href };
        if (h === 'youtu.be' && (m = path.match(/^\/([\w-]{11})/))) return { platform: 'youtube', id: m[1], url: 'https://www.youtube.com/watch?v=' + m[1] };
        if (h === 'youtube.com') { var v = u.searchParams.get('v') || (path.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/) || [])[1]; if (v && /^[\w-]{11}$/.test(v)) { var sh = /^\/shorts\//.test(path); return { platform: 'youtube', id: v, short: sh, url: sh ? 'https://www.youtube.com/shorts/' + v : 'https://www.youtube.com/watch?v=' + v }; } }
        if ((h === 'x.com' || h === 'twitter.com') && (m = path.match(/^\/([\w]{1,30})\/status\/(\d{5,25})/))) return { platform: 'x', id: m[2], url: 'https://x.com/' + m[1] + '/status/' + m[2] };
        if (h === 'facebook.com' || h === 'fb.watch') return { platform: 'facebook', id: '', url: u.href.split('#')[0] };
        return null;
    }

    /* v1: { widgetTitle, widgetDescription, maxPosts, customPosts: [{ url, author, content, imageUrl }] } */
    function normalizeConfig(raw) {
        raw = raw || {};
        var base = getDefaultConfig();
        var legacy = !raw.layout && (raw.customPosts || raw.widgetTitle);
        if (legacy) {
            raw = {
                layout: 'cards', title: raw.widgetTitle || '', subtitle: raw.widgetDescription || '',
                posts: (raw.customPosts || []).slice(0, raw.maxPosts || 12).map(function (p) { return { url: p.url, caption: p.content || '', author: p.author ? '@' + String(p.author).replace(/^@/, '') : '', image: p.imageUrl || '' }; })
            };
        }
        var cfg = mergeDeep(base, raw);
        cfg.posts = (Array.isArray(raw.posts) ? raw.posts : []).map(function (p) {
            if (typeof p === 'string') p = { url: p };
            var parsed = parsePost(p && p.url || '');
            if (!parsed) return null;
            return { url: parsed.url, platform: parsed.platform, kind: parsed.kind || '', short: !!parsed.short, id: String(p.id || parsed.id || ''), caption: String(p.caption || ''), author: String(p.author || ''), image: safeUrl(p.image || ''), sample: !!p.sample, thumb: /^data:image\//.test(p.thumb || '') ? p.thumb : '' };
        }).filter(Boolean).slice(0, 24);
        cfg.profiles = (Array.isArray(raw.profiles) ? raw.profiles : []).filter(function (p) { return p && PLATFORMS[p.platform] && safeUrl(p.url); }).slice(0, 5);
        cfg._t = mergeDeep(I18N[I18N[cfg.locale] ? cfg.locale : 'en'], {});
        cfg._legacy = !!legacy;
        return cfg;
    }

    function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
    function mergeDeep(base, over) {
        var out = {};
        Object.keys(base || {}).forEach(function (k) { out[k] = isObj(base[k]) ? mergeDeep(base[k], {}) : base[k]; });
        Object.keys(over || {}).forEach(function (k) {
            var v = over[k];
            if (isObj(v) && isObj(out[k])) out[k] = mergeDeep(out[k], v);
            else if (v !== undefined) out[k] = v;
        });
        return out;
    }
    function cssValue(v, fallback) { if (v === undefined || v === null || v === '') return fallback; return String(v).replace(/[;{}<>]/g, ''); }
    function num(v, fallback) { var n = Number(v); return isFinite(n) && v !== '' && v !== null ? n : fallback; }
    function safeUrl(url) {
        var u = String(url || '').trim();
        if (!u) return '';
        if (/^https?:\/\//i.test(u)) return u;
        if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) return 'https://' + u;
        return '';
    }
    function escapeHtml(text) {
        return String(text == null ? '' : text).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function thumbSrc(p) {
        if (p.thumb) return p.thumb;
        if (p.image) return p.image;
        if (p.platform === 'youtube') return 'https://i.ytimg.com/vi/' + p.id + '/hqdefault.jpg';
        if (p.platform === 'x' || p.sample) return '';
        return BASE + 'api/post?img=1&url=' + encodeURIComponent(p.url);
    }
    function embedOf(p) {
        if (p.platform === 'instagram') return { src: 'https://www.instagram.com/' + (p.kind === 'p' ? 'p' : 'reel') + '/' + p.id + '/embed/captioned/', w: 440, h: 760 };
        if (p.platform === 'tiktok' && p.id) return { src: 'https://www.tiktok.com/embed/v2/' + p.id, w: 340, h: 740, dark: false };
        if (p.platform === 'youtube') return p.short ? { src: 'https://www.youtube-nocookie.com/embed/' + p.id + '?autoplay=1&rel=0&playsinline=1', w: 405, h: 720, dark: true } : { src: 'https://www.youtube-nocookie.com/embed/' + p.id + '?autoplay=1&rel=0&playsinline=1', w: 1000, h: 563, dark: true, video: true };
        if (p.platform === 'facebook') { var vid = /\/videos?\/|\/watch|\/reel|fb\.watch/.test(p.url); return { src: 'https://www.facebook.com/plugins/' + (vid ? 'video' : 'post') + '.php?href=' + encodeURIComponent(p.url) + '&show_text=true&width=500', w: 500, h: vid ? 560 : 700 }; }
        if (p.platform === 'x') return { src: 'https://platform.twitter.com/embed/Tweet.html?id=' + p.id + '&dnt=true&theme=light', w: 550, h: 680 };
        return null;
    }
    var isVideo = function (p) { return p.platform === 'tiktok' || p.platform === 'youtube' || (p.platform === 'instagram' && p.kind !== 'p') || (p.platform === 'facebook' && /\/videos?\/|\/watch|\/reel|fb\.watch/.test(p.url)); };

    function applyCustomStyles(uniqueClass, cfg) {
        var id = 'bhw-sf-style-' + uniqueClass;
        var el = document.getElementById(id);
        if (!el) { el = document.createElement('style'); el.id = id; (document.head || document.documentElement).appendChild(el); }
        var s = cfg.style || {}, c = s.colors || {}, z = s.sizes || {}, r = s.borderRadius || {}, sh = s.shadow || {};
        var fs = num(z.fontSize, 1), pad = num(z.padding, 28), cols = Math.max(2, Math.min(6, Math.round(num(cfg.columns, 3))));
        var ratio = cfg.shape === 'portrait' ? '4 / 5' : cfg.shape === 'story' ? '9 / 16' : '1 / 1';
        el.textContent = '.' + uniqueClass + '{' +
            '--bhw-font:' + cssValue(s.fontFamily, "'Inter', system-ui, sans-serif") + ';' +
            '--bhw-font-size:' + (15 * fs).toFixed(2) + 'px;' +
            '--bhw-max-width:' + Math.round(num(z.width, 1140)) + 'px;' +
            
            '--bhw-ratio:' + ratio + ';' +
            '--bhw-bg:' + cssValue(c.background, '#ffffff') + ';' +
            '--bhw-text-color:' + cssValue(c.text, '#111111') + ';' +
            '--bhw-accent:' + cssValue(c.accent, '#111111') + ';' +
            '--bhw-accent-text:' + cssValue(c.accentText, '#ffffff') + ';' +
            '--bhw-tile-bg:' + cssValue(c.tile, '#f1f1f3') + ';' +
            '--bhw-widget-border:' + cssValue(c.widgetBorder, 'rgba(0,0,0,0.07)') + ';' +
            '--bhw-line:' + cssValue(c.line, 'rgba(0,0,0,0.14)') + ';' +
            '--bhw-widget-radius:' + num(r.widget, 22) + 'px;' +
            '--bhw-block-radius:' + num(r.blocks, 14) + 'px;' +
            '--bhw-padding:' + pad + 'px;' +
            '--bhw-padding-mobile:' + Math.round(pad * .65) + 'px;' +
            '--bhw-gap:' + num(z.gap, 12) + 'px;' +
            '--bhw-shadow:' + cssValue(sh.widget, '0 24px 60px -28px rgba(0,0,0,0.28)') + ';' +
            '}';
        return id;
    }

    function tileHtml(p, i, cfg) {
        var T = cfg._t, pf = PLATFORMS[p.platform], src = thumbSrc(p);
        var label = escapeHtml(T.open + ' — ' + pf.name + (p.caption ? ': ' + p.caption.slice(0, 80) : ''));
        var media = p.platform === 'x' && !p.image
            ? '<span class="bhw-quote-card"><p>' + escapeHtml(p.caption || 'Post on X') + '</p><span>' + escapeHtml(p.author || 'X') + '</span></span>'
            : '<span class="bhw-ph" aria-hidden="true">' + ICON[p.platform] + '</span>' + (src ? '<img src="' + escapeHtml(src) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '');
        var over = cfg.layout === 'grid' && cfg.showCaptions && p.caption && p.platform !== 'x' ? '<span class="bhw-over"><p>' + escapeHtml(p.caption) + '</p></span>' : '';
        var inner = media + over + (isVideo(p) ? '<span class="bhw-playbtn" aria-hidden="true">' + ICON.play + '</span>' : '') + '<span class="bhw-badge" aria-hidden="true">' + ICON[p.platform] + '</span>';
        var tile = cfg.openIn === 'tab' || p.sample
            ? '<a class="bhw-tile" href="' + escapeHtml(p.sample ? '#' : p.url) + '"' + (p.sample ? '' : ' target="_blank" rel="noopener"') + ' aria-label="' + label + '">' + inner + '</a>'
            : '<button class="bhw-tile" type="button" data-i="' + i + '" aria-label="' + label + '">' + inner + '</button>';
        var cap = cfg.layout !== 'grid' && cfg.showCaptions && (p.caption || p.author) ? '<span class="bhw-cap">' + (p.author ? '<span class="bhw-cap-author">' + escapeHtml(p.author) + '</span>' : '') + (p.caption && p.platform !== 'x' ? '<span class="bhw-cap-text">' + escapeHtml(p.caption) + '</span>' : '') + '</span>' : '';
        return '<li class="bhw-post">' + tile + cap + '</li>';
    }

    function openModal(posts, index, cfg) {
        var old = document.querySelector('.bhw-sf-modal'); if (old) old.remove();
        var prevFocus = document.activeElement, html = document.documentElement, overflow = html.style.overflow, T = cfg._t, i = index;
        var m = document.createElement('div');
        m.className = 'bhw-sf-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
        function show() {
            var p = posts[i], e = embedOf(p);
            if (!e) { window.open(p.url, '_blank', 'noopener'); return close(); }
            var maxW = Math.min(window.innerWidth - (window.innerWidth < 600 ? 16 : 128), e.w), maxH = window.innerHeight - 112;
            var w = maxW, h = e.video ? Math.round(w * 9 / 16) : Math.min(e.h, maxH);
            if (e.video && h > maxH) { h = maxH; w = Math.round(h * 16 / 9); }
            m.innerHTML = '<div class="bhw-sf-frame' + (e.dark ? ' bhw-dark' : '') + '" style="width:' + w + 'px;height:' + h + 'px"><iframe src="' + escapeHtml(e.src) + '" title="' + escapeHtml(PLATFORMS[p.platform].name) + ' post" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write" allowfullscreen scrolling="' + (e.video ? 'no' : 'yes') + '"></iframe></div>' +
                '<button class="bhw-sf-x" type="button" aria-label="' + escapeHtml(T.close) + '">' + ICON.close + '</button>' +
                (posts.length > 1 ? '<button class="bhw-sf-prev" type="button" aria-label="' + escapeHtml(T.prev) + '">' + ICON.left + '</button><button class="bhw-sf-next" type="button" aria-label="' + escapeHtml(T.next) + '">' + ICON.right + '</button>' : '') +
                '<a class="bhw-sf-ext" href="' + escapeHtml(p.url) + '" target="_blank" rel="noopener">' + escapeHtml(T.view.replace('{p}', PLATFORMS[p.platform].name)) + ICON.ext + '</a>';
            m.querySelector('.bhw-sf-x').focus();
        }
        function go(d) { i = (i + d + posts.length) % posts.length; show(); }
        function close() { m.remove(); html.style.overflow = overflow; document.removeEventListener('keydown', key); if (prevFocus && prevFocus.focus) prevFocus.focus(); }
        function key(e) {
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowLeft' && posts.length > 1) go(-1);
            else if (e.key === 'ArrowRight' && posts.length > 1) go(1);
            else if (e.key === 'Tab') { var f = [].slice.call(m.querySelectorAll('button, a')); var k = f.indexOf(document.activeElement); e.preventDefault(); (f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length] || f[0]).focus(); }
        }
        m.addEventListener('click', function (e) {
            if (e.target === m || e.target.closest('.bhw-sf-x')) close();
            else if (e.target.closest('.bhw-sf-prev')) go(-1);
            else if (e.target.closest('.bhw-sf-next')) go(1);
        });
        document.addEventListener('keydown', key);
        html.style.overflow = 'hidden';
        document.body.appendChild(m);
        show();
    }

    function mountWidget(cfg, uniqueClass, id, opts) {
        opts = opts || {};
        var styleId = applyCustomStyles(uniqueClass, cfg);
        var layout = ['grid', 'cards', 'carousel'].indexOf(cfg.layout) >= 0 ? cfg.layout : 'grid';
        var root = document.createElement('div');
        root.id = 'social-widget-' + id;
        root.className = 'bhw-sf bhw-container ' + uniqueClass + ' bhw-' + layout + (cfg.style && cfg.style.transparent ? ' bhw-flat' : '');
        var T = cfg._t, posts = cfg.posts;
        var follow = cfg.profiles.map(function (p) {
            return '<a class="bhw-fbtn" href="' + escapeHtml(safeUrl(p.url)) + '" target="_blank" rel="noopener">' + ICON[p.platform] + '<span>' + escapeHtml(PLATFORMS[p.platform].name) + '</span></a>';
        }).join('');
        var head = cfg.title || cfg.subtitle || follow ? '<div class="bhw-head"><div class="bhw-head-txt">' + (cfg.title ? '<h3 class="bhw-title">' + escapeHtml(cfg.title) + '</h3>' : '') +
            (cfg.subtitle ? '<p class="bhw-subtitle">' + escapeHtml(cfg.subtitle) + '</p>' : '') + '</div>' + (follow ? '<div class="bhw-follow" aria-label="' + escapeHtml(T.follow) + '">' + follow + '</div>' : '') + '</div>' : '';
        root.innerHTML = '<div class="bhw-widget">' + head + '<ul class="bhw-grid">' + posts.map(function (p, i) { return tileHtml(p, i, cfg); }).join('') + '</ul>' +
            (layout === 'carousel' ? '<div class="bhw-car-foot"><button class="bhw-arrow bhw-prev" type="button" aria-label="' + escapeHtml(T.prev) + '">' + ICON.left + '</button><button class="bhw-arrow bhw-next" type="button" aria-label="' + escapeHtml(T.next) + '">' + ICON.right + '</button></div>' : '') + '</div>';

        if (opts.inline) opts.inline.appendChild(root);
        else if (opts.anchor && opts.anchor.parentNode) opts.anchor.parentNode.insertBefore(root, opts.anchor.nextSibling);
        else document.body.appendChild(root);

        var cleanups = [];
        function on(t, e, h, o) { if (!t) return; t.addEventListener(e, h, o); cleanups.push(function () { t.removeEventListener(e, h, o); }); }
        on(root, 'click', function (e) {
            var a = e.target.closest('a.bhw-tile[href="#"]'); if (a) { e.preventDefault(); return; }
            var b = e.target.closest('button.bhw-tile'); if (!b) return;
            var i = Number(b.getAttribute('data-i')); if (posts[i] && !posts[i].sample) openModal(posts.filter(function (p) { return !p.sample; }), posts.filter(function (p) { return !p.sample; }).indexOf(posts[i]), cfg);
        });
        /* если картинка не загрузилась — остаётся аккуратная заглушка со значком */
        root.querySelectorAll('.bhw-tile img').forEach(function (img) { on(img, 'error', function () { img.remove(); }); });
        /* слайдер */
        var track = layout === 'carousel' ? root.querySelector('.bhw-grid') : null;
        function updateNav() {
            if (!track) return;
            var max = track.scrollWidth - track.clientWidth;
            root.querySelector('.bhw-prev').disabled = track.scrollLeft <= 2; root.querySelector('.bhw-next').disabled = track.scrollLeft >= max - 2;
            root.querySelector('.bhw-car-foot').style.visibility = max > 2 ? '' : 'hidden';
        }
        if (track) {
            var go = function (d) { var c = track.querySelector('.bhw-post'); if (c) track.scrollBy({ left: d * (c.offsetWidth + 12) * 2, behavior: 'smooth' }); };
            on(root.querySelector('.bhw-prev'), 'click', function () { go(-1); });
            on(root.querySelector('.bhw-next'), 'click', function () { go(1); });
            on(track, 'scroll', function () { cancelAnimationFrame(updateNav._r); updateNav._r = requestAnimationFrame(updateNav); }, { passive: true });
        }
        function sizeClass() {
            // в превью ширина берётся у области превью: масштаб (zoom) не должен менять раскладку
            var w = opts.inline ? Math.max(0, opts.inline.clientWidth - 32) : (root.clientWidth || 0);
            root.classList.toggle('bhw-w-md', w > 0 && w < 760 && w >= 480);
            root.classList.toggle('bhw-w-sm', w > 0 && w < 480);
            var cols = Math.max(2, Math.min(6, Math.round(num(cfg.columns, 3))));
            root.style.setProperty('--bhw-cols', String(w > 0 && w < 480 ? 2 : w > 0 && w < 760 ? Math.min(cols, 3) : cols));
            updateNav();
        }
        if (window.ResizeObserver) { var ro = new ResizeObserver(sizeClass); ro.observe(opts.inline || root); cleanups.push(function () { ro.disconnect(); }); }
        else on(window, 'resize', sizeClass);
        sizeClass(); requestAnimationFrame(sizeClass);

        return {
            root: root, config: cfg, id: id,
            destroy: function () { cleanups.forEach(function (f) { try { f(); } catch (e) {} }); root.remove(); var s = document.getElementById(styleId); if (s) s.remove(); }
        };
    }
})();
