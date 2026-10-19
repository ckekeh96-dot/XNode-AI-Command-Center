"""Real Amazon Nova Act browser-automation run against the local XNode AI Command Center.

Nova Act is Amazon's agentic browser-automation SDK. This script demonstrates a live
Nova Act deployment that drives the XNode web app like a real user would: it reads
the simulated mesh network status and triggers a security event through the UI.

Setup (one time):
    pip install nova-act
    python -m playwright install chromium
    set NOVA_ACT_API_KEY=<key from https://nova.amazon.com>

Run (with the XNode server already running, e.g. `npm start`):
    python nova/nova_demo.py

No device control is performed. The browser agent only interacts with the local
XNode web UI; all XNode data is clearly marked SIMULATED.
"""
import json
import os
import sys
import urllib.request

APP_URL = os.environ.get("XNODE_URL", "http://127.0.0.1:8787")


def server_up():
    try:
        with urllib.request.urlopen(f"{APP_URL}/health", timeout=5) as r:
            return json.loads(r.read()).get("ok") is True
    except Exception:
        return False


def main():
    if not server_up():
        print(f"XNode server not reachable at {APP_URL}. Start it first: npm start")
        sys.exit(1)

    api_key = os.environ.get("NOVA_ACT_API_KEY")
    if not api_key:
        print("NOVA_ACT_API_KEY is not set.")
        print("Create a free key at https://nova.amazon.com then: set NOVA_ACT_API_KEY=<your key>")
        sys.exit(2)

    try:
        from nova_act import NovaAct
    except ImportError:
        print("nova-act is not installed. Run: pip install nova-act && python -m playwright install chromium")
        sys.exit(2)

    print(f"Starting Nova Act agent at {APP_URL} ...")
    with NovaAct(starting_page=APP_URL, nova_act_api_key=api_key) as nova:
        act1 = nova.act(
            "Click the circular Refresh button in the top right of the header, "
            "then wait a moment for the dashboard to update."
        )
        print("Step 1 (refresh dashboard):", act1.response)

        act2 = nova.act(
            "Find the Smart Home Hub panel's network strip that shows the mesh name. "
            "Return JSON with keys: ssid, devices_online, devices_total, avg_signal_dbm."
        )
        print("Step 2 (read mesh status):", act2.response)
        try:
            print("Step 2 parsed:", act2.parsed_response)
        except Exception:
            pass

        act3 = nova.act(
            "Type 'simulate package' into the command input at the bottom of the AI Assistant "
            "panel, then click the send button."
        )
        print("Step 3 (trigger event via UI):", act3.response)

        act4 = nova.act(
            "Look at the Front door intelligence panel and return JSON with key events_visible "
            "set to the number of event entries currently listed."
        )
        print("Step 4 (verify event appears):", act4.parsed_response if act4.parsed_response else act4.response)

    print("Nova Act run complete. All actions were local UI automation on the simulated app.")


if __name__ == "__main__":
    main()
