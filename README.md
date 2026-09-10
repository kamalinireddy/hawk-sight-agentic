# Hawk Sight India

Hawk Sight is a disaster management dashboard built for the Indian context — floods,
cyclones, earthquakes, and heatwaves are recurring problems, and during an actual
emergency people often don't know who to call, where the nearest shelter is, or how
to get help fast. This project puts all of that in one place: live alert monitoring,
one-tap emergency contacts, an interactive map of nearby disasters and services, a
family safety check-in system, and an SOS button that sends out a location-tagged
alert on a countdown.

On top of the dashboard, we added an AI assistant that doesn't just answer questions
in a chat window — it can actually control the dashboard for you. Ask it "how risky
is it right now" and it redraws the live risk gauge. Say "there's a fire near me,
help" and it opens the SOS modal on its own. Describe an incident in plain words and
it fills out a structured report. This works using LLM tool/function calling: the
model is given a list of things it's allowed to do, and it decides which one to call
based on what you type.

## What it does

- **Live dashboard** — active incident counts, weather/alert banner, an interactive
  Leaflet map of ongoing disasters and nearby emergency services, and NDRF team
  status.
- **Emergency SOS** — a floating SOS button that starts a 10-second countdown,
  grabs your GPS location, and sends an emergency alert message.
- **Family Safety Network** — track the check-in status and last known location of
  family members.
- **Alert Center** — categorized monitoring for floods, cyclones, earthquakes, and
  heatwaves by season and affected states.
- **Preparedness Center** and **Resources Hub** — checklists and nearby
  shelter/medical/food resources.
- **AI Assistant** — a chat widget that can navigate the dashboard, trigger SOS,
  place emergency calls, update the risk gauge, file incident reports from free
  text, draw evacuation routes on the map, match resource requests, and generate
  preparedness checklists — all through natural conversation.

## How the AI assistant works

The assistant is a single LLM (served for free through Groq) that has access to
10 tools, grouped into 6 capabilities:

| Capability | What it does |
|---|---|
| Navigation & Emergency | switch dashboard tabs, open the SOS modal, dial emergency numbers |
| Risk Assessment | recompute and redraw the AI risk gauge live, with a reason |
| Incident Reporting | turn a free-text description into a structured report (location, type, severity, people affected) |
| Evacuation Routing | draw a route on the live map to the nearest shelter, hospital, or safe zone |
| Resource Matching | match a stated need (e.g. "shelter for 4 people") against available resources |
| Preparedness Coaching | generate a checklist based on region and disaster type |

Under the hood, tools are split into two kinds:

- **Action tools** (navigate, SOS, call, update gauge, file report, draw route)
  have to run in the browser, since they change what's actually on screen — the
  server hands these back to the frontend to execute.
- **Data tools** (check alerts, check family status, find resources, get a
  checklist) are simple lookups the server can answer directly, without a round
  trip to the browser.

There's also a small safety net: before the AI even replies, the frontend runs a
quick local keyword check for distress language ("trapped", "help me", "drowning",
etc.) and immediately offers a one-tap SOS button — so a slow or failed API call
never delays help being offered.

## Tech stack

- **Frontend:** HTML, CSS, JavaScript, Leaflet.js (interactive maps), Canvas API
  (risk gauge)
- **Backend:** Node.js + Express (serves the site and proxies AI requests so the
  API key stays server-side)
- **AI:** Groq's hosted LLM API (OpenAI-compatible chat completions with function
  calling) — free tier, no card required

## Running it locally

1. Get a free Groq API key at [console.groq.com](https://console.groq.com) →
   API Keys → Create API Key.
2. Copy `.env.example` to `.env` and paste your key in.
3. Install dependencies and start the server: