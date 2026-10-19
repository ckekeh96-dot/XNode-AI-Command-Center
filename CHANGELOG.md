# Changelog

All notable changes to XNode AI Command Center will be documented in this file.

## [v1.3] - 2026-10-19

### Added
- System Status card with real-time overview (events by location, devices online, tasks done, pending approvals)
- Quick Actions card with common commands (Simulate Doorbell, Show Tasks, Security Events, Business Summary, Smart Devices, Activity Log)
- Left/Right side toggle in single Side View card (switches between left and right security events)
- Left and right side motion sensors to Smart Home Hub (12 total devices)
- Quick Notes section alongside Approvals in grid layout

### Changed
- Merged Left Side and Right Side sections into single toggleable Side View card
- Removed Right Side nav button (replaced with "Side View")
- Removed Analytics section (Completion rate, Avg approval time, Total actions, Active days, Animated Activity heatmap)
- Removed scrollbar from sidebar menu
- Updated mode button handlers to toggle active state and update status pill

### Fixed
- Menu button now hidden on desktop (>1024px) and visible on mobile/tablet
- Mode selector buttons (Home/Away/Night) now responsive with click handlers
- Screen fit issues with overflow handling on sidebar, main content, and topbar
- Duplicate HTML IDs (tasks/approvals) renamed to task-list/approval-list

## [v1.2] - 2026-10-19

### Added
- Left/right side synthetic events (8 new event types: left_doorbell, left_motion, left_package, left_loitering, right_doorbell, right_motion, right_package, right_loitering)
- Animated Activity heatmap with pulse animation on active cells
- Left Side and Right Side nav buttons with event sections

## [v1.1] - 2026-10-19

### Added
- UI redesign to Alexa/Echo Show dark navy aesthetic
- Icon sidebar navigation (80px column)
- Mode selector (Home/Away/Night)
- Card-based grid layout with auto-fit columns
- Dark navy color palette (--bg-primary: #0a1628, --bg-card: #1a2744)

## [v1.0] - 2026-10-18

### Added
- Initial XNode AI Command Center
- AI Assistant with text + voice input
- Front Door security events (5 event types: doorbell, motion, package, loitering, visitor)
- Back Door security events (5 event types: back_doorbell, backyard_motion, back_package, gate_open, back_loitering)
- Smart Home Hub with 10 simulated devices
- Task management (add, complete, list)
- Approval workflow (propose, approve, reject visitor follow-ups)
- Workflow Studio with drag-and-drop steps
- Activity Log with audit trail
- Judge Showcase for hackathon demo
- Persistent state storage (data/state.json)
- MCP protocol 2025-11-25 conformance
- AWS Bedrock and Gemini AI provider support
- Simulated WiFi mesh network (SSID: XNode-Mesh, Hub: 192.168.10.1)
- 15 passing tests
