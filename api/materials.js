export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=60');
  try {
    const r = await fetch('https://tech-elite-telegram-bot.husseinthebetter.workers.dev/api/materials', {
      headers: { 'User-Agent': 'TechElite-Vercel-Bridge/1.0' }
    });
    if (!r.ok) {
      return res.status(200).json({ ok: false, status: r.status, materials: {}, hidden: [] });
    }
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(200).json({ ok: false, error: String(err), materials: {}, hidden: [] });
  }
}
