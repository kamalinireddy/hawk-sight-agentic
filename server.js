//setup and imports
require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); // serves index.html, app.js, style.css from this folder

//Groq API setup
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Updated Groq model
const MODEL = 'openai/gpt-oss-20b';
if (!GROQ_API_KEY) {
  console.warn('\n⚠️ GROQ_API_KEY is not set. Copy .env.example to .env and add your API key.\n');
}

// Tools the LLM is allowed to use. Two kinds:
//  - "action" tools change the actual webpage (navigate, SOS, call, draw on map, update the
//    risk gauge, file a report) -> must run in the browser, so the server hands these back
//  - "data" tools just fetch/compute info -> can run right here on the server
const ACTION_TOOLS = new Set([
  'navigate_section',
  'trigger_sos',
  'call_number',
  'update_risk_assessment',
  'file_incident_report',
  'draw_evacuation_route'
]);

const tools = [
  // ---- core navigation / emergency tools ----
  {
    type: 'function',
    function: {
      name: 'navigate_section',
      description: 'Switch the dashboard to a different section of Hawk Sight.',
      parameters: {
        type: 'object',
        properties: {
          section: {
            type: 'string',
            enum: ['dashboard', 'alerts', 'family', 'mapping', 'preparedness', 'resources', 'ndrf']
          }
        },
        required: ['section']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'trigger_sos',
      description: 'Open the emergency SOS countdown modal. Call this whenever the user is in danger, describes an emergency, or uses distress language (trapped, can\'t breathe, bleeding, drowning, help me, etc.) - even if they did not explicitly ask for SOS.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'call_number',
      description: 'Initiate a phone call to an emergency number (Police 100, Fire 101, Ambulance 102, Unified 112, or NDRF 9711077372).',
      parameters: {
        type: 'object',
        properties: { number: { type: 'string' } },
        required: ['number']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_active_alerts',
      description: 'Get the current list of active disaster alerts (floods, cyclones, earthquakes, heat waves) shown on the dashboard.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'check_family_status',
      description: "Get the current safety status of the user's family members.",
      parameters: { type: 'object', properties: {} }
    }
  },

  // ---- Risk Assessment Agent ----
  {
    type: 'function',
    function: {
      name: 'update_risk_assessment',
      description: "Recompute and update the dashboard's live AI Risk Assessment gauge for the user's area, based on active alerts, season, and any situation they describe. Always call this if the user asks about risk, safety level, or 'how dangerous is it'.",
      parameters: {
        type: 'object',
        properties: {
          risk_level: { type: 'string', enum: ['Low', 'Moderate', 'Moderate-High', 'High', 'Severe'] },
          percent: { type: 'integer', description: '0-100, how far around the gauge the needle should point' },
          reason: { type: 'string', description: 'One short sentence explaining the assessment' }
        },
        required: ['risk_level', 'percent', 'reason']
      }
    }
  },

  // ---- Incident Report Agent ----
  {
    type: 'function',
    function: {
      name: 'file_incident_report',
      description: 'File a structured incident report from a free-text description the user gives (e.g. "water rising fast near Sector 5, two families stuck"). Extract the fields yourself from what they said.',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' },
          incident_type: { type: 'string', enum: ['flood', 'fire', 'earthquake', 'medical', 'structural', 'other'] },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          people_affected: { type: 'integer', description: 'Estimated number of people affected, 0 if unknown' },
          description: { type: 'string' }
        },
        required: ['location', 'incident_type', 'severity', 'description']
      }
    }
  },

  // ---- Evacuation Route Agent ----
  {
    type: 'function',
    function: {
      name: 'draw_evacuation_route',
      description: "Draw the safest evacuation route from the user's current location to a safe destination on the live map. Switches to the map view automatically.",
      parameters: {
        type: 'object',
        properties: {
          destination: { type: 'string', enum: ['nearest_shelter', 'nearest_hospital', 'safe_zone'] }
        },
        required: ['destination']
      }
    }
  },

  // ---- Resource Matching Agent ----
  {
    type: 'function',
    function: {
      name: 'find_resources',
      description: 'Find nearby emergency resources (shelters, medical, food, water) that match what the user needs, optionally for a given number of people.',
      parameters: {
        type: 'object',
        properties: {
          resource_type: { type: 'string', enum: ['shelter', 'medical', 'food', 'water'] },
          people_count: { type: 'integer', description: 'Number of people needing the resource, 0 if not mentioned' }
        },
        required: ['resource_type']
      }
    }
  },

  // ---- Preparedness Coach Agent ----
  {
    type: 'function',
    function: {
      name: 'get_preparedness_checklist',
      description: 'Generate a personalized disaster-preparedness checklist for the user based on their region and/or the current season/risk.',
      parameters: {
        type: 'object',
        properties: {
          region: { type: 'string', description: 'e.g. Delhi, Kerala coast, Himalayan foothills - use what the user mentioned or a sensible default' },
          focus: { type: 'string', enum: ['flood', 'earthquake', 'cyclone', 'heatwave', 'general'] }
        },
        required: ['focus']
      }
    }
  }
];

const SYSTEM_PROMPT = `You are the Hawk Sight emergency assistant for a disaster management dashboard in India.
Be calm, concise, and practical.

Safety rule: if the user's message contains ANY sign of real distress or danger (trapped, injured,
flooding around them, can't breathe, fire nearby, "help me", etc.), call trigger_sos immediately,
even if they didn't explicitly ask for it - you can always let them cancel it.

Use tools to actually act on the dashboard rather than just describing what to do. Prefer taking
action (updating the risk gauge, filing a report, drawing a route, finding resources) over long
explanations.`;

// ---- Mock data the read-only agents work from ----
const RESOURCES = [
  { type: 'shelter', name: 'Modern School Relief Camp', location: 'Connaught Place, New Delhi', capacity: 150, available: 42 },
  { type: 'shelter', name: 'Community Hall Shelter', location: 'Dwarka Sector 12, New Delhi', capacity: 80, available: 5 },
  { type: 'medical', name: 'AIIMS Emergency', location: '2.3 km away', status: 'Available now' },
  { type: 'medical', name: 'Safdarjung Hospital Relief Camp', location: 'Safdarjung, New Delhi', status: 'Available now' },
  { type: 'food', name: 'NDRF Relief Kitchen', location: 'Sector 5 Community Center', status: 'Serving 12pm-8pm daily' },
  { type: 'water', name: 'Municipal Water Tanker Point', location: 'Sector 5 Main Road', status: 'Active, refills every 4 hrs' }
];

const PREPAREDNESS_ITEMS = {
  flood: ['Move valuables and electronics to higher shelves', 'Keep a battery radio and power bank charged', 'Know your building\'s evacuation route to higher ground', 'Store 3 days of drinking water in sealed containers', 'Keep important documents in a waterproof pouch'],
  earthquake: ['Secure heavy furniture and shelving to walls', 'Identify "drop, cover, hold" spots in each room', 'Keep sturdy shoes near your bed', 'Know how to shut off gas and water mains', 'Keep a whistle in your emergency kit to signal for help'],
  cyclone: ['Reinforce windows and secure loose outdoor items', 'Charge all phones and power banks before landfall', 'Keep 3-5 days of non-perishable food ready', 'Know your nearest cyclone shelter location', 'Avoid coastal areas and low bridges during warnings'],
  heatwave: ['Keep ORS/electrolyte packets at home', 'Avoid outdoor activity between 12pm-4pm', 'Keep curtains closed during peak sun hours', 'Check on elderly neighbours daily', 'Keep a light, loose cotton outfit ready for outdoor trips'],
  general: ['Keep a 72-hour emergency kit (water, food, torch, first aid)', 'Save NDRF, police, ambulance numbers in your phone', 'Agree on a family meeting point in advance', 'Keep copies of ID and medical documents ready', 'Know the two nearest evacuation routes from home']
};

// Data tools are answered directly on the server - no browser round trip needed.
function runDataTool(name, args) {
  switch (name) {
    case 'get_active_alerts':
      return {
        floods: '12 active - Kerala, Assam, Bihar, UP',
        cyclones: '3 monitoring - Odisha, AP, TN, WB',
        earthquakes: '5 recent - J&K, HP, Uttarakhand',
        heatwaves: '0 active - Rajasthan, MP, UP'
      };
    case 'check_family_status':
      return { members: 'Raj (safe, New Delhi), Priya (safe, office), Arya (safe, school)' };
    case 'find_resources': {
      const matches = RESOURCES.filter((r) => r.type === args.resource_type);
      if (args.people_count && args.resource_type === 'shelter') {
        matches.sort((a, b) => (b.available || 0) - (a.available || 0));
      }
      return { matches: matches.slice(0, 3) };
    }
    case 'get_preparedness_checklist': {
      const items = PREPAREDNESS_ITEMS[args.focus] || PREPAREDNESS_ITEMS.general;
      return { region: args.region || 'your area', focus: args.focus, checklist: items };
    }
    default:
      return { error: 'unknown tool' };
  }
}

app.post('/api/agent', async (req, res) => {
  try {
    const { message, history = [], toolResult } = req.body;
    let messages = [...history];

    if (toolResult) {
      // Browser just executed an action tool (navigate/SOS/call/map/report/gauge) - feed the result back
      messages.push({ role: 'tool', tool_call_id: toolResult.tool_call_id, content: JSON.stringify(toolResult.result) });
    } else if (message) {
      messages.push({ role: 'user', content: message });
    }

    // Loop up to 5 times so the model can chain read-only tool calls on its own
    for (let i = 0; i < 5; i++) {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
          tools,
          tool_choice: 'auto',
          max_tokens: 1024
        })
      });

      const data = await response.json();
      if (data.error) {
        console.error('Groq API error:', data.error);
        return res.status(500).json({ error: data.error.message || 'Groq API error' });
      }

      const msg = data.choices[0].message;
      messages.push(msg);

      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        // Final answer - nothing more to do
        return res.json({ done: true, text: msg.content, messagesSoFar: messages });
      }

      // If any tool call needs the browser (navigate/SOS/call/gauge/report/route), hand it back to the client
      const actionCall = msg.tool_calls.find((tc) => ACTION_TOOLS.has(tc.function.name));
      if (actionCall) {
        return res.json({
          done: false,
          text: msg.content || null,
          action: {
            tool_call_id: actionCall.id,
            name: actionCall.function.name,
            arguments: JSON.parse(actionCall.function.arguments || '{}')
          },
          messagesSoFar: messages
        });
      }

      // Otherwise every call is a data tool - answer them here and loop again
      for (const tc of msg.tool_calls) {
        const args = JSON.parse(tc.function.arguments || '{}');
        const result = runDataTool(tc.function.name, args);
        messages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
      }
    }

    res.json({ done: true, text: "Sorry, I'm having trouble completing that right now.", messagesSoFar: messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Agent request failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🦅 Hawk Sight (with 6 AI agents) running at http://127.0.0.1:${PORT}/index.html\n`);
});
