# Street Interface — Week 3 (AI-enhanced Delay Light)

```
week3-project/
  api/
    septa.js            <- unchanged from Week 2
    delay-reason.js     <- NEW: calls Claude (Haiku) server-side
  index.html
  prototype-a-heartbeat-bench.html   <- unchanged, kept for reference
  prototype-b-delay-light.html       <- UPGRADED: has the "Ask AI why" button
  prototype-c-weather-advisor.html   <- unchanged, kept for reference
```

This is a **separate copy** of the Week 2 project (per Step 1 of the AI
integration guide) so nothing here can break the working Week 2 site. The
purple ribbon at the top of every page is the visual marker that you're
looking at the Week 3 version.

## The plan (Step 3)

- **What the AI does:** given how late the bus is + the time of day/week,
  infer ONE short, plausible reason for the delay (e.g. "Rush hour
  congestion", "Weekend service gaps"). Output: a short phrase, 6 words or
  fewer.
- **Model:** `claude-haiku-4-5-20251001` — cheapest, fastest, plenty for a
  one-line reply.
- **Trigger:** manual. A button reading **"Ask AI why ✦"** only appears when
  the bus is actually delayed (≥3 min late). Nothing calls the AI on its own
  — you control exactly when it runs, and what it costs.

## Step 4 — Test the prompt yourself in the Playground first

Before trusting the code, go confirm the prompt actually produces good
output:

1. console.anthropic.com → Settings → Billing → add ~$5 credit.
2. Go to the [Claude Playground](https://platform.claude.com/playground).
3. Model: **Haiku** (cheapest).
4. System Prompt — paste exactly this:
   ```
   You infer the single most likely reason a city bus is running late,
   given how late it is and the time context. Reply with ONE short phrase,
   6 words or fewer, no ending punctuation, no explanation. Ground it in
   the context you're given (rush hour, weekend, late night, school
   dismissal, weather-adjacent guesses, etc.) rather than always
   defaulting to 'traffic'.
   ```
5. User message — try a few, e.g.:
   ```
   Bus route 42 is running 6 minutes late. Local time: 8:00, Monday.
   ```
   ```
   Bus route 42 is running 4 minutes late. Local time: 23:00, Saturday.
   ```
6. Click Run. Keep tweaking the system prompt until you're happy with the
   shape and tone of the answers. `api/delay-reason.js` already uses this
   exact prompt — if you change it in the Playground, copy your final
   version back into that file.

## Step 5 — The code (already written)

- **Before the call:** the button click reads `lastLateMin`, the current
  hour, and day of week from the browser, and POSTs them to
  `/api/delay-reason`.
- **The call itself:** `api/delay-reason.js` runs server-side, calls
  `https://api.anthropic.com/v1/messages` with your key from the
  environment (never from the browser), and returns just the phrase.
- **After the call:** the frontend drops the returned phrase into the `.sub`
  line under the headline, styled with a small ✦ marker so it's visually
  distinct from the rule-based text it replaces.

## Step 6 — Get your key and deploy

1. Push this **whole folder** to a **new** GitHub repo (don't overwrite the
   Week 2 repo — this should be its own project, so you can compare the two
   side by side).
2. Import it into Vercel as a new project (same zero-config "Other" preset
   as before) → Deploy once first, *without* the key, just to confirm the
   site loads and the SEPTA badge still goes live. This is your Step 2
   sanity check.
3. Create your key: console.anthropic.com → Settings → API Keys → Create Key.
4. In your terminal, inside this project folder:
   ```bash
   vercel env add ANTHROPIC_API_KEY production
   ```
   - **Type?** → choose **Secret**.
   - **Value?** → paste your actual key here, in the terminal, and hit enter.
   Never paste the key into this chat or into any AI assistant's chat window.
5. Redeploy (same "..." → Redeploy on the latest deployment) so the function
   picks up the new environment variable.
6. Open the live site, wait for the badge to say "Live SEPTA data," find a
   moment when the bus shows a delay (or use the demo fallback, which also
   works), and press **"Ask AI why."** You should see a short AI-generated
   phrase appear where the fixed text used to be.

## If the button says "Could not reach AI"

- Open the browser console (F12) and check the response from
  `/api/delay-reason` — it will say if the key is missing or if Claude
  returned an error.
- Confirm you added the env var to the **same** Vercel project you're
  visiting, and that you redeployed after adding it (adding an env var does
  not retroactively apply to an already-running deployment).
