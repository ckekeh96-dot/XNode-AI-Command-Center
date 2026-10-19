# XNode AI Command Center - Demo Video Script

**Duration:** ~2:45 minutes
**Tool:** OBS Studio, Loom, or any screen recorder

---

## 0:00-0:20 — Introduction
- Show the landing page with hero section
- Narrate: "XNode AI Command Center brings Alexa+ intelligence to your daily workflow with human-first approval controls and a simulated smart-home mesh"

## 0:20-0:45 — AI Assistant Demo
- Click "AI Assistant" in sidebar
- Type command: "Prepare visitor follow-up"
- Show the assistant response proposing a follow-up
- Narrate: "XNode coordinates tasks through natural language via a self-hosted MCP server"

## 0:45-1:05 — Approval Flow
- Click "Approval Center" in sidebar
- Show the pending approval from the previous step
- Click "Approve" on the approval
- Narrate: "Every sensitive action requires explicit human approval"
- Show the approval status change to "approved"

## 1:05-1:20 — Task Board
- Click "Task Board" in sidebar
- Show the newly created task from the approval
- Mark the task as complete
- Narrate: "Approved actions create local tasks you can track"

## 1:20-1:40 — Mesh Network
- Click "Smart Hub" in sidebar
- Show the XNode-Mesh network strip with 10 devices online
- Type command: "drop front camera"
- Show the card go offline and the strip drop to 9/10 with the warning tag
- Click "Reconnect" on the card; show it come back online
- Narrate: "A simulated WiFi mesh tracks signal, latency, and connectivity — all clearly marked simulated"

## 1:40-2:00 — Security Events
- Click "Security Events" in sidebar
- Show the simulated doorbell event
- Narrate: "Security context is clearly marked as simulated — no real device access"

## 2:00-2:15 — Activity Log
- Click "Activity Log" in sidebar
- Show the audit trail of all actions
- Narrate: "Complete transparency with a full activity log"

## 2:15-2:40 — Nova Act Agent (optional)
- Open a terminal and run: `npm run nova`
- Show the Nova Act browser window opening the XNode app
- Show the agent reading the mesh status and triggering a simulated event
- Narrate: "A real Amazon Nova Act agent drives the local UI end-to-end"

## 2:40-2:45 — Workflow Studio (optional, if time)
- Click "Workflow Studio" in sidebar
- Show the visual workflow builder
- Narrate: "Build repeatable automations with the visual workflow studio"

---

## Key Points to Emphasize
1. **Human approval required** before any sensitive action
2. **Simulated events** clearly marked (not real Ring/device data)
3. **Local-only actions** (no external API calls without disclosure)
4. **Transparent audit trail** of all tool executions
5. **Multi-provider AI** (Gemini live, Bedrock configured)
6. **Self-hosted MCP server** (spec 2025-11-25, Streamable HTTP stateless)
7. **Nova Act SDK integration** (runnable agent script)

## Technical Highlights to Mention
- MCP protocol 2025-11-25, 16 tools, Streamable HTTP stateless transport
- Simulated mesh network with signal drift and connectivity enforcement
- Persistent state across restarts (JSON file)
- Exponential backoff retry for AI providers
- Works offline when no AI credentials configured
- Nova Act SDK run against the local web app
