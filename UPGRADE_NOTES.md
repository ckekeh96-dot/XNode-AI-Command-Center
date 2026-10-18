# XNode AI Command Center v1.3 — differentiation upgrade

## New
- Official XNode logo applied to branded dashboard (original generated artwork).
- Guided visitor-to-action demo: synthetic doorbell context → follow-up proposal → explicit human approval → local task.
- Approval queue, task board, security context and action audit trail.
- Browser speech recognition where supported (optional; browser feature, not Alexa voice API).
- MCP workflow tools and dashboard state API; offline mode remains available.
- Optional Bedrock Converse support from v1.2 (requires account, credentials, model, real testing).

## Important limits
- Alexa+ interface is a self-built simulation; there is no direct Alexa+ integration.
- Doorbell events are synthetic; no Ring API is called.
- Approval only creates a local task; no real-world side effects.
- Local demo state is in memory and resets on server restart.
- MCP implementation is a custom minimal HTTP JSON-RPC implementation, not yet officially conformance-tested.
- Bedrock has not been live verified in this environment.

## Suggested 2:30 demo
0:00–0:20 Brand and problem; 0:20–1:05 visitor alert and workflow proposal; 1:05–1:35 approval and task board; 1:35–2:00 voice command and audit; 2:00–2:25 MCP tools and optional Bedrock evidence; 2:25–2:30 impact.

## Hackathon differentiators to build next
- Persisted encrypted or privacy-aware context and user profiles.
- Multi-step planning with a visual action plan, and approvals for each external action.
- Actual hosted MCP endpoint with SDK transport conformance tests and access control.
- Live Bedrock model execution and documented usage for AWS Builder.
- Usability and accessibility evaluation with friction log.
