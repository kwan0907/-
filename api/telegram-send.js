import {timingSafeEqual} from 'node:crypto';

const clean = (value, limit) => String(value ?? '').slice(0, limit);
const safeEq = (a, b) => {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
};

const validChat = (id) => /^-?[0-9]{1,20}$/.test(id) || /^@[a-zA-Z0-9_]{5,32}$/.test(id);

function destinations() {
  // JSON array: [{"id":"123456","label":"私人"},{"id":"-100...","label":"群組"},{"id":"@channel","label":"頻道"}]
  // Legacy TELEGRAM_CHAT_ID continues to work when TELEGRAM_CHAT_IDS is not set.
  const multiple = process.env.TELEGRAM_CHAT_IDS?.trim();
  const legacy = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!multiple && !legacy) return {error: '尚未設定 TELEGRAM_CHAT_IDS / TELEGRAM_CHAT_ID'};
  let items;
  if (multiple) {
    try {
      const parsed = JSON.parse(multiple);
      if (!Array.isArray(parsed)) throw new Error('expected JSON array');
      items = parsed;
    } catch {
      return {error: 'TELEGRAM_CHAT_IDS 格式錯誤：請使用 JSON 陣列'};
    }
  } else {
    items = [{id: legacy, label: '預設目的地'}];
  }
  if (!items.length || items.length > 10) return {error: '請設定 1–10 個 Telegram 目的地'};
  const usedIds = new Set(), usedLabels = new Set(), out = [];
  for (const item of items) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return {error: '目的地設定格式不正確'};
    if (item.enabled === false) continue;
    const id = clean(item.id, 80).trim();
    const label = clean(item.label || item.name || '', 50).trim();
    if (!validChat(id) || !label || usedIds.has(id) || usedLabels.has(label))
      return {error: '目的地 ID / 名稱無效或重複'};
    usedIds.add(id); usedLabels.add(label);
    out.push({id, label});
  }
  if (!out.length) return {error: '未有啟用的 TG 目的地'};
  return {items: out};
}

async function sendOne(token, destination, photo, caption) {
  const fd = new FormData();
  fd.set('chat_id', destination.id);
  fd.set('caption', caption);
  fd.set('photo', new Blob([photo], {type: 'image/png'}), 'smartbet-chart.png');
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 12000);
  try {
    const r = await fetch('https://api.telegram.org/bot' + token + '/sendPhoto', {
      method: 'POST', body: fd, signal: ctl.signal
    });
    const reply = await r.json().catch(() => ({}));
    if (!r.ok || !reply.ok) {
      // Do not expose Telegram chat IDs, tokens, or API-returned freeform text.
      return {label: destination.label, ok: false, error: 'TG 回覆錯誤 (' + r.status + ')，請檢查 Bot 權限及 Chat ID'};
    }
    return {label: destination.label, ok: true, messageId: reply.result?.message_id ?? null};
  } catch (e) {
    return {label: destination.label, ok: false, error: e.name === 'AbortError' ? 'Telegram 連線逾時' : 'Telegram 網絡錯誤'};
  } finally { clearTimeout(timer); }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') return res.status(405).json({ok: false, error: 'POST only'});
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const key = process.env.TELEGRAM_SEND_KEY;
  if (!token || !key) return res.status(503).json({ok: false, error: 'Telegram Bot Token / 密鑰尚未設定'});
  const origin = req.headers.origin;
  if (origin) {
    try {
      const u = new URL(origin);
      if (u.protocol !== 'https:' || u.host !== req.headers.host)
        return res.status(403).json({ok: false, error: 'Origin not allowed'});
    } catch { return res.status(403).json({ok: false, error: 'Origin not allowed'}); }
  }
  if (!safeEq(req.headers['x-smartbet-key'], key))
    return res.status(401).json({ok: false, error: 'TG 傳送密鑰不正確'});
  const configured = destinations();
  if (configured.error) return res.status(503).json({ok: false, error: configured.error});
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return res.status(400).json({ok: false, error: 'Invalid JSON'});
  const raceKey = clean(body.raceKey, 40);
  if (!/^20\d{2}-\d{2}-\d{2}:(HV|ST):(?:[1-9]|1[0-2])$/.test(raceKey))
    return res.status(400).json({ok: false, error: 'Invalid race'});
  const png = typeof body.png === 'string' && body.png.match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
  if (!png || png[1].length > 3_900_000)
    return res.status(413).json({ok: false, error: 'PNG too large or invalid'});
  const bytes = Buffer.from(png[1], 'base64');
  if (bytes.length > 2_900_000 || bytes.length < 100 ||
      bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a')
    return res.status(400).json({ok: false, error: 'Invalid PNG bytes'});
  const caption = clean(body.caption, 1024);
  let targets = configured.items;
  if (body.onlyLabels !== undefined) {
    if (!Array.isArray(body.onlyLabels) || !body.onlyLabels.length ||
        body.onlyLabels.length > 10 ||
        body.onlyLabels.some(x => typeof x !== 'string'))
      return res.status(400).json({ok: false, error: 'Invalid retry destinations'});
    const labels = new Set(body.onlyLabels);
    if (labels.size !== body.onlyLabels.length ||
        [...labels].some(x => !targets.some(t => t.label === x)))
      return res.status(400).json({ok: false, error: 'Retry destination not permitted'});
    targets = targets.filter(t => labels.has(t.label));
  }
  // Only destinations configured on the server can receive pictures.
  // Limit in-flight sends so a single sendPhoto failure does not block other chats.
  const results = [];
  for (let i = 0; i < targets.length; i += 3) {
    const batch = await Promise.all(targets.slice(i, i + 3).map(t => sendOne(token, t, bytes, caption)));
    results.push(...batch);
  }
  const sentCount = results.filter(x => x.ok).length;
  const failedCount = results.length - sentCount;
  return res.status(failedCount === 0 ? 200 : sentCount > 0 ? 207 : 502).json({
    ok: failedCount === 0,
    partial: sentCount > 0 && failedCount > 0,
    sentCount, failedCount, total: results.length, results
  });
}
