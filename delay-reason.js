// /api/delay-reason.js
// Server-side call to Claude (Haiku) — the API key never reaches the browser.
// Triggered manually by the "Ask AI why" button on prototype-b-delay-light.html,
// so YOU control exactly when it runs and what it costs.

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' });
    return;
  }

  const { lateMinutes, hour, dayOfWeek, route } = req.body || {};

  if (typeof lateMinutes !== 'number') {
    res.status(400).json({ error: 'Missing lateMinutes (number)' });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set on the server' });
    return;
  }

  // --- This is the exact system prompt to test in the Claude Playground first ---
  const systemPrompt =
    "You infer the single most likely reason a city bus is running late, " +
    "given how late it is and the time context. Reply with ONE short phrase, " +
    "6 words or fewer, no ending punctuation, no explanation. " +
    "Ground it in the context you're given (rush hour, weekend, late night, " +
    "school dismissal, weather-adjacent guesses, etc.) rather than always " +
    "defaulting to 'traffic'.";

  const userMessage =
    `Bus route ${route || 'unknown'} is running ${lateMinutes} minutes late. ` +
    `Local time: ${hour}:00, ${dayOfWeek || 'unknown day'}.`;

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 30,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      res.status(upstream.status).json({ error: 'Claude API error', details: errText });
      return;
    }

    const data = await upstream.json();
    const reason = (data.content && data.content[0] && data.content[0].text || '').trim() || 'Reason unclear right now';

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ reason });
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach Claude', details: String(err) });
  }
};
