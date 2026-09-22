// /api/septa.js
// Vercel serverless function — runs on the server, so it is NOT subject to
// browser CORS rules. The frontend calls /api/septa?route=42 instead of
// hitting SEPTA directly, and this function fetches SEPTA on its behalf.

module.exports = async (req, res) => {
  const { route } = req.query;

  if (!route) {
    res.status(400).json({ error: 'Missing required query param: route' });
    return;
  }

  try {
    const upstream = await fetch(
      `https://www3.septa.org/api/TransitView/index.php?route=${encodeURIComponent(route)}`
    );

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `SEPTA responded with ${upstream.status}` });
      return;
    }

    const data = await upstream.text();

    // Allow the frontend (any origin, fine for a class prototype) to read this.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    // Don't cache stale bus positions.
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach SEPTA', details: String(err) });
  }
};
