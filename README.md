# Hawk Sight — with 6 AI Agents (100% free LLM)

Your original dashboard (`index.html`, `app.js`, `style.css`) is unchanged
except for the widget hooks appended to the end of each file. It's powered
by **Groq's free LLM API** (Llama 3.3 70B) — no payment required, ever, for
this use case.

## The agents

All of these are one assistant (one chat window), but it has 10 distinct
tools grouped into 6 capabilities — the LLM decides which to use based on
what the person types.

1. **Navigation & Emergency Agent** — switches dashboard sections, opens the
   SOS modal, dials emergency numbers.
2. **Risk Assessment Agent** — recomputes and redraws the "AI Risk
   Assessment" gauge on your dashboard live, with a reason, instead of it
   being a static "Moderate-High."
3. **Incident Report Agent** — takes a messy free-text description
   ("water's rising near Sector 5, two families stuck") and extracts it
   into a structured report (location, type, severity, people affected)
   with a generated report ID.
4. **Evacuation Route Agent** — draws an actual route on your live Leaflet
   map from the user's location to the nearest shelter, hospital, or safe
   zone, switching to the Map view automatically if needed.
5. **Resource Matching Agent** — matches stated needs ("shelter for 4
   people") against a small resource database (shelters, medical, food,
   water) and returns the best options.
6. **Preparedness Coach Agent** — generates a personalized checklist based
   on region and disaster type (flood/earthquake/cyclone/heatwave).

Plus a **Proactive Distress Detection** safety net: a fast, local keyword
check runs on every message the instant it's sent (before the LLM even
responds) and offers a one-tap SOS button if it spots distress language.
This doesn't replace the LLM's own judgment (it's told to call `trigger_sos`
proactively too) — it's a backup so a slow or failed API call never delays
an SOS offer.

## Run it (5 minutes, no credit card)

1. Get a free key: go to **console.groq.com**, sign in with Google (no card
   needed), click **API Keys** → **Create API Key**, copy it.
2. Double-click to run the setup script for your OS:
   - **Mac/Linux:** double-click `start.sh` (or run `./start.sh` in a terminal)
   - **Windows:** double-click `start.bat`
3. The first time, it'll create a `.env` file for you and stop, asking you
   to paste your key into it. Open `.env` in any text editor, replace
   `your-free-groq-key-here` with your real key, save.
4. Run the script again (`start.sh` / `start.bat`) — this time it installs
   dependencies automatically and starts the server.
5. Open **http://127.0.0.1:3000/index.html**.

(If you'd rather do it manually: `npm install`, then `cp .env.example .env`
and edit it, then `npm start`.)

Don't open `index.html` directly or via Live Server (port 5500) — the agent
needs `/api/agent`, which only exists when `server.js` is running.

## Try each agent

- "How risky is it right now?" → **Risk Assessment Agent** updates the gauge
- "I'm trapped, help!" → **Proactive Distress + SOS**
- "There's a fire near Karol Bagh, maybe 10 people affected" → **Incident Report Agent**
- "Show me the way to the nearest shelter" → **Evacuation Route Agent** (switches to map, draws route)
- "I need medical help for 2 people" → **Resource Matching Agent**
- "What should I prepare for monsoon season?" → **Preparedness Coach Agent**
- "What alerts are active?" / "Is my family safe?" → original alert/family tools

## Files

- `index.html` / `app.js` / `style.css` — your original site, with the AI
  widget markup/styles/logic appended at the end (search for
  `AI AGENT WIDGET` / `AI Agent Widget`).
- `server.js` — Express server. Serves the static site, holds all 10 tool
  definitions, and proxies chat to Groq, keeping the API key server-side.
- `.env` — your API key (gitignored).

## Adding more agents later

1. Add a `tool` entry in `server.js`'s `tools` array.
2. If it just needs to look something up, add a case to `runDataTool()`.
3. If it needs to touch the page (like the risk gauge or the map), add its
   name to `ACTION_TOOLS` in `server.js` **and** add a matching case in
   `executeAgentTool()` at the bottom of `app.js`.

## Free tier limits (Groq)

Roughly 30 requests/minute and 14,400/day on Llama 3.3 70B — far more than
a demo or hackathon needs. No card, no bill.
