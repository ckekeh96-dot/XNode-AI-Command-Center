# XNode AI Command Center — Alexa+ Hackathon Prototype

A functional **local simulation** of a command center with a browser interface and a small MCP-compatible JSON-RPC server. **Not an Alexa+ integration**, **not a Ring integration**, and **not an AWS Builder qualifying implementation** yet.

## Run

Install Node.js 20 or later, then:

```bash
npm start
```

Open http://127.0.0.1:8787. No dependencies or credentials required. Windows PowerShell and macOS/Linux shells are supported. To run tests: `npm test`.

## Demo

- `add task Prepare hackathon demo`
- `show tasks`
- `security events` (clearly labeled synthetic data)
- `business summary`

## MCP endpoint

`POST http://127.0.0.1:8787/mcp` with JSON-RPC 2.0. Implements `initialize`, `ping`, `tools/list`, and `tools/call`, plus initialized notification acknowledgement. Example:

```bash
curl -X POST http://127.0.0.1:8787/mcp -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

This is a **minimal prototype**, not fully verified MCP spec conformance. No SSE, authentication, OAuth, session lifecycle, or remote deployment. Localhost binding and same-origin checks intentionally restrict access.

## Architecture

`web/` browser UI; `server/core.js` deterministic tool actions and in-memory data; `server/index.js` HTTP/MCP routes; `tests/` unit tests. Data resets on server restart.

## Hackathon completion checklist

- [x] Runnable web simulation and demo commands
- [x] Source, MIT license, basic tests, CI
- [ ] Verify latest official Alexa+ simulated-experience track rules and submission eligibility
- [ ] Add real Alexa+ partner integration **or** confirm simulated path qualifies and document its agent behavior
- [ ] Validate MCP spec 2025-11-25 with official inspector and compliance tests
- [ ] Integrate AWS Bedrock with credentials and usage controls if entering AWS Builder
- [ ] Make a separate new open-source project or qualifying contribution for Open Source mini challenge
- [ ] Capture actual product feedback and friction logs from tools used
- [ ] Record and publish English demo video under 3 minutes
- [ ] Publish GitHub repo, check deadlines, submit Devpost entry

## Security

Never commit API keys. The app has no user authentication; do not expose it to the internet as-is. It does not control physical locks, cameras, or real devices.

## Suggested 2:30 demo script

0:00–0:20 problem and concept; 0:20–0:55 create task; 0:55–1:20 list tasks; 1:20–1:45 simulated doorbell feed; 1:45–2:05 summary; 2:05–2:25 demonstrate MCP tools/list; 2:25–2:30 state what is real and what is simulated.

## v1.1: Optional Amazon Bedrock agent

The app now has an **optional** Bedrock Converse API agent loop that invokes real local task/security-summary tools via model tool use. Offline mode remains the default. AWS calls have **not been verified against a live AWS account** in this package; do not claim AWS Builder qualification until you demonstrate a successful live request.

```powershell
npm install
$env:ENABLE_BEDROCK="true"
$env:AWS_REGION="us-east-1"
$env:BEDROCK_MODEL_ID="YOUR_ENABLED_BEDROCK_MODEL_ID"
# Configure credentials using your own AWS CLI/profile or IAM role; never place keys in code.
npm start
```

Choose a Bedrock model supporting Converse tool use and verify model access, region, IAM permission (`bedrock:InvokeModel`), and usage charges. Keep `ENABLE_BEDROCK` unset for fully offline demonstrations. Tool calls only modify in-memory demo tasks. The system does not control Ring devices or connect to Alexa+ production services.

### MCP notes

The local stateless `/mcp` endpoint uses JSON-RPC and `2025-11-25` initialization, supports POST, and explicitly declines GET/SSE. This is **not a claim of full MCP conformance**. Before submission, test against the official MCP Inspector and validate protocol headers, content negotiation, error behavior, and any required authorization for remote deployment. Never expose this unauthenticated demo server publicly.

### Suggested AWS Builder evidence

Capture a screen recording of an actual Bedrock-enabled command invoking a tool; include the exact AWS service, SDK, region, IAM permission scope, and cost controls in the submission. If you do not execute and verify that call, submit as an offline Alexa+ simulation only.

## v1.2 verification update

Added real HTTP integration tests covering MCP initialization (protocol version 2025-11-25), tools listing and invocation, initialized notification acknowledgment, invalid protocol version rejection, and offline command routing. Run `npm test` (13 tests). This verifies the listed local HTTP flows, **not** official MCP inspector certification or Alexa+ compatibility. The MCP endpoint remains localhost-only and does not implement authentication or SSE streaming. Do not deploy it publicly without adding authentication, transport hardening, rate limits, and an official compatibility test.

### Live AWS verification (must be completed by the project owner)

1. Run `npm install` and configure AWS credentials locally via the standard AWS SDK credential provider chain (do not commit credentials).
2. Set `ENABLE_BEDROCK=true`, `AWS_REGION` and `BEDROCK_MODEL_ID` to a model enabled for your account.
3. Start the server and use the dashboard to submit a task command. Confirm the response reports `aws-bedrock` rather than `aws-error` or `offline-simulation`.
4. Capture the sanitized successful response for your submission evidence. Monitor Bedrock usage charges.

The supplied package contains no AWS credentials and no verified live Bedrock request.
