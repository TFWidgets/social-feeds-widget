/**
 * TF Widgets — Social Feed: данные поста по ссылке, без ключей и платных API (Cloudflare Pages Function)
 *
 *   GET /api/post?url=<ссылка на пост>          → { platform, id, url, caption, author, thumb, embed, ratio }
 *   GET /api/post?url=<ссылка>&img=1            → сама картинка-превью поста (прокси, чтобы ссылки соцсетей не протухали)
 *
 * Поддерживается: Instagram (посты и Reels), TikTok, YouTube (видео и Shorts), Facebook, X (Twitter).
 * Всё кэшируется на краю Cloudflare (данные 6 часов, картинки 1 день) — соцсети дёргаются редко,
 * бесплатного лимита Pages Functions (100 000 запросов в день) хватает с запасом.
 */

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Accept' };
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BOT_UA = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const postUrl = (url.searchParams.get('url') || '').trim();
  const wantImg = url.searchParams.get('img') === '1';

  const cache = caches.default;
  const cacheKey = new Request(url.origin + url.pathname + '?img=' + (wantImg ? 1 : 0) + '&url=' + encodeURIComponent(postUrl));
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const p = parsePost(postUrl);
  if (!p) return json({ error: 'unsupported link' }, 400, 300);

  let res;
  try {
    const info = await postInfo(p);
    if (wantImg) {
      if (!info.thumb) return json({ error: 'no image' }, 404, 3600);
      const img = await fetch(info.thumb, { headers: { 'User-Agent': BROWSER_UA, 'Referer': 'https://www.' + p.platform + '.com/' }, cf: { cacheTtl: 86400 } });
      const type = img.headers.get('Content-Type') || '';
      if (!img.ok || !/^image\//.test(type)) return json({ error: 'image HTTP ' + img.status }, 404, 1800);
      res = new Response(img.body, { headers: { ...CORS, 'Content-Type': type, 'Cache-Control': 'public, max-age=86400' } });
    } else {
      res = json(info, 200, 21600);
    }
  } catch (e) {
    return json({ error: String(e && e.message || e) }, 502, 300);
  }
  context.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

function json(obj, status, ttl) {
  return new Response(JSON.stringify(obj), { status, headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=' + (ttl || 60) } });
}

/* ---------- ссылка → платформа и ID ---------- */
function parsePost(raw) {
  let u;
  try { u = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw); } catch (e) { return null; }
  const h = u.hostname.replace(/^(www\.|m\.|mobile\.)/, '').toLowerCase(), path = u.pathname;
  let m;
  if (h === 'instagram.com' && (m = path.match(/^\/(?:[\w.]+\/)?(p|reel|reels|tv)\/([\w-]{5,40})/))) {
    const kind = m[1] === 'p' ? 'p' : m[1] === 'tv' ? 'tv' : 'reel';
    return { platform: 'instagram', id: m[2], kind, url: 'https://www.instagram.com/' + kind + '/' + m[2] + '/' };
  }
  if (h === 'tiktok.com' && (m = path.match(/\/video\/(\d{8,25})/))) return { platform: 'tiktok', id: m[1], url: 'https://www.tiktok.com' + path.replace(/\/$/, '') };
  if (/(^|\.)tiktok\.com$/.test(h) && /^(vm|vt)\./.test(u.hostname)) return { platform: 'tiktok', id: '', url: u.href };
  if (h === 'youtu.be' && (m = path.match(/^\/([\w-]{11})/))) return { platform: 'youtube', id: m[1], url: 'https://www.youtube.com/watch?v=' + m[1] };
  if (h === 'youtube.com') {
    const v = u.searchParams.get('v') || (path.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/) || [])[1];
    if (v && /^[\w-]{11}$/.test(v)) { const short = /^\/shorts\//.test(path); return { platform: 'youtube', id: v, short, url: short ? 'https://www.youtube.com/shorts/' + v : 'https://www.youtube.com/watch?v=' + v }; }
  }
  if ((h === 'x.com' || h === 'twitter.com') && (m = path.match(/^\/([\w]{1,30})\/status\/(\d{5,25})/))) return { platform: 'x', id: m[2], author: '@' + m[1], url: 'https://x.com/' + m[1] + '/status/' + m[2] };
  if (h === 'facebook.com' || h === 'fb.watch') return { platform: 'facebook', id: '', url: u.href.split('#')[0] };
  return null;
}

/* ---------- данные поста ---------- */
async function postInfo(p) {
  const out = { platform: p.platform, id: p.id, url: p.url, caption: '', author: p.author || '', thumb: '', ratio: 1 };
  if (p.platform === 'youtube') {
    out.thumb = 'https://i.ytimg.com/vi/' + p.id + '/hqdefault.jpg';
    out.embed = 'https://www.youtube-nocookie.com/embed/' + p.id + '?autoplay=1&rel=0&playsinline=1';
    out.ratio = p.short ? 9 / 16 : 16 / 9;
    const o = await getJson('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(p.url));
    if (o) { out.caption = o.title || ''; out.author = o.author_name || ''; }
    return out;
  }
  if (p.platform === 'tiktok') {
    const o = await getJson('https://www.tiktok.com/oembed?url=' + encodeURIComponent(p.url));
    if (o) {
      out.caption = o.title || ''; out.author = o.author_unique_id ? '@' + o.author_unique_id : (o.author_name || '');
      out.thumb = o.thumbnail_url || ''; out.id = o.embed_product_id || p.id;
    }
    if (out.id) out.embed = 'https://www.tiktok.com/embed/v2/' + out.id;
    out.ratio = 9 / 16;
    return out;
  }
  if (p.platform === 'instagram') {
    out.embed = 'https://www.instagram.com/' + (p.kind === 'p' ? 'p' : 'reel') + '/' + p.id + '/embed/captioned/';
    out.ratio = p.kind === 'p' ? 4 / 5 : 9 / 16;
    // публичная страница встраивания содержит картинку, автора и подпись
    const html = await getText(out.embed, BROWSER_UA);
    if (html) {
      out.thumb = decode(pick(html, /class="EmbeddedMediaImage"[^>]*?src="([^"]+)"/) || pick(html, /"display_url"\s*:\s*"([^"]+)"/) || pick(html, /<img[^>]+class="[^"]*EmbeddedMediaImage[^"]*"[^>]+src="([^"]+)"/));
      out.author = out.author || decode(pick(html, /class="UsernameText"[^>]*>([^<]+)</) || pick(html, /"username"\s*:\s*"([\w.]+)"/));
      if (out.author && out.author[0] !== '@') out.author = '@' + out.author;
      out.caption = stripTags(decode(pick(html, /class="Caption"[^>]*>([\s\S]*?)<div class="CaptionComments"/) || '')).replace(/^@?[\w.]+\s*/, '');
    }
    if (!out.thumb) {
      const page = await getText(p.url, BOT_UA);
      if (page) { out.thumb = decode(meta(page, 'og:image')); out.caption = out.caption || decode(meta(page, 'og:description')); }
    }
    return out;
  }
  if (p.platform === 'facebook') {
    const video = /\/videos?\/|\/watch|\/reel|fb\.watch/.test(p.url);
    out.embed = 'https://www.facebook.com/plugins/' + (video ? 'video' : 'post') + '.php?href=' + encodeURIComponent(p.url) + '&show_text=true&width=500';
    out.ratio = video ? 16 / 9 : 1;
    const page = await getText(p.url, BOT_UA);
    if (page) { out.thumb = decode(meta(page, 'og:image')); out.caption = decode(meta(page, 'og:description') || meta(page, 'og:title')); }
    return out;
  }
  if (p.platform === 'x') {
    out.embed = 'https://platform.twitter.com/embed/Tweet.html?id=' + p.id + '&dnt=true';
    const o = await getJson('https://publish.twitter.com/oembed?omit_script=1&dnt=true&url=' + encodeURIComponent(p.url));
    if (o) { out.caption = stripTags(decode(pick(o.html || '', /<p[^>]*>([\s\S]*?)<\/p>/))).replace(/\s*pic\.twitter\.com\/\w+\s*$/, ''); out.author = out.author || o.author_name || ''; }
    return out;   // у постов X превью — карточка с текстом
  }
  return out;
}

async function getJson(u) {
  try { const r = await fetch(u, { headers: { 'User-Agent': BROWSER_UA, 'Accept': 'application/json' }, cf: { cacheTtl: 21600 } }); return r.ok ? await r.json() : null; } catch (e) { return null; }
}
async function getText(u, ua) {
  try { const r = await fetch(u, { headers: { 'User-Agent': ua, 'Accept-Language': 'en' }, redirect: 'follow', cf: { cacheTtl: 21600 } }); return r.ok ? await r.text() : ''; } catch (e) { return ''; }
}
function pick(s, re) { const m = String(s || '').match(re); return m ? m[1] : ''; }
function meta(html, prop) {
  return pick(html, new RegExp('<meta[^>]+(?:property|name)="' + prop + '"[^>]+content="([^"]*)"', 'i')) ||
         pick(html, new RegExp('<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="' + prop + '"', 'i'));
}
function stripTags(s) { return String(s || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim(); }
function decode(s) {
  return String(s || '').replace(/\\u0026/g, '&').replace(/\\\//g, '/')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16))).trim();
}
