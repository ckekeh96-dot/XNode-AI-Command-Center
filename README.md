# XNode AI Command Center

A local-first, approval-first AI command center built for the **Amazon Developer Hackathon 2026**.
Primary track: **Alexa+ simulated experience**. Mini challenges: **AWS Builder** + **Open Source**.

## What it is

A browser-based command center that simulates an Alexa+ experience: a self-hosted MCP server
(spec 2025-11-25, Streamable HTTP stateless transport) exposes 16 tools for tasks, approvals,
security events, device control, and mesh-network inspection. A natural-language assistant
dispatches commands to those tools. A simulated WiFi mesh connects the hub to 10 smart devices
with realistic signal drift, latency jitter, and connectivity enforcement. An optional
Amazon Nova Act agent drives the local UI end-to-end.

**Nothing here controls real Ring devices or calls real Alexa+ services.** All device data is
synthetic and labeled `SIMULATED`. Sensitive actions require explicit human approval.

## Run

```bash
npm install
npm start
```

Open http://127.0.0.1:8787. Tests: `npm test`.

## MCP server

`POST http://127.0.0.1:8787/mcp` — JSON-RPC 2.0, Streamable HTTP stateless transport:

- Single endpoint `/mcp`, POST only (GET returns 405 per spec for servers without server-initiated streams)
- Client sends `Accept: application/json, text/event-stream`; server returns JSON
- Notifications return HTTP 202 with no body
- `Mcp-Session-Id` is not assigned (stateless server)
- Origin validation rejects cross-origin requests
- Protocol version `2025-11-25` negotiated on `initialize`

```bash
curl -X POST http://127.0.0.1:8787/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

### 16 tools

| Tool | Purpose |
|---|---|
| `list_tasks` | List local tasks |
| `add_task` | Create a local task |
| `complete_task` | Toggle a task done state |
| `list_approvals` | List pending and decided approvals |
| `propose_visitor_followup` | Prepare a visitor follow-up requiring human approval |
| `decide_followup` | Approve or reject a prepared follow-up |
| `security_events` | Read simulated security events (front/back location filter) |
| `simulate_event` | Trigger a simulated security event |
| `dismiss_event` | Dismiss a simulated security event |
| `list_devices` | List simulated smart home devices |
| `toggle_device` | Toggle a simulated device state (lock, light, climate) |
| `network_status` | Show simulated mesh network status and device connectivity |
| `pair_device` | Pair or reconnect a device on the simulated mesh |
| `simulate_dropout` | Drop a device from the simulated mesh |
| `activity_log` | Show local tool activity audit trail |
| `business_summary` | Summarize local demo activity |

## Simulated mesh network

`server/network.js` models a local mesh: SSID **XNode-Mesh**, hub `192.168.10.1`, device IPs
`192.168.10.11+`, RSSI `-38..-82 dBm` drift, latency jitter, `wifi` vs `zigbee` by device type.
Offline devices cannot be toggled until re-paired. The UI shows a live network strip with
signal bars and an orange warning tag when a device is offline.

## Nova Act integration

`nova/nova_demo.py` runs a real Amazon Nova Act browser-automation agent against the local
XNode web app. The agent refreshes the dashboard, reads the mesh status, and triggers a
simulated security event through the UI.

```bash
pip install nova-act
python -m playwright install chromium
set NOVA_ACT_API_KEY=<key from https://nova.amazon.com>
npm run nova
```

The script fails fast with clear instructions if the SDK, Chromium, or API key is missing.

## Alexa+ integration path

This project ships the **exact integration surface Alexa+ consumes**: a self-hosted MCP server
with spec 2025-11-25, Streamable HTTP transport, and Origin validation. To connect live Alexa+:

1. Deploy the server on a public HTTPS endpoint (e.g. Cloudflare Tunnel free tier)
2. Enroll in the Alexa+ Preview program at https://developer.amazon.com
3. Register the MCP server URL in the Alexa+ AG Console
4. Configure OAuth account linking (or skip for personal use)

Without Preview enrollment, the simulated-experience path is the track's supported option.

## Architecture

- `web/` — browser UI (HTML/CSS/JS, no framework)
- `server/core.js` — deterministic tool actions, in-memory data with JSON-file persistence
- `server/network.js` — simulated mesh network module
- `server/index.js` — HTTP + MCP routes, JSON-RPC dispatcher
- `server/agent.js` — natural-language command dispatcher
- `server/persistence.js` — JSON-file state with in-place mutation
- `tests/` — 15 tests (core, persistence, http)

Multi-provider AI dispatch via `AI_PROVIDER` env var (`gemini` / `bedrock` / `offline`).
`resetState()` mutates cached state in-place to keep the module-level export in sync.

## Hackathon submission checklist

- [x] Runnable web app + demo commands
- [x] Self-hosted MCP server, spec 2025-11-25, Streamable HTTP stateless transport
- [x] 16 tools with input schemas
- [x] Simulated mesh network with connectivity enforcement
- [x] Nova Act SDK integration (runnable agent script)
- [x] MIT license
- [x] 15 tests passing
- [x] Persistent state (survives restart)
- [ ] Publish GitHub repo (public + license, or private + collaborators)
- [ ] Add Amazon collaborators at submission time (see below)
- [ ] Upload <3-min demo video (public YouTube/Vimeo)
- [ ] Complete Devpost submission fields (description, product feedback, track selection)

## Collaborators (add at submission time)

Private repo: Settings → Collaborators → Add people:
`chris-trag`, `knmeiss`, `giolaq`, `anishamalde`, `mosesroth`, `emersonsklar`

Invitations expire after 7 days — add them when you submit, not weeks in advance.
