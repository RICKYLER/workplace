# CV Sales Admin OS

Private operations dashboard for CV Sales Admin work. This repository is prepared as a clean source-code base for future GitHub version control and deployment updates.

## Current status

- Private admin-style workspace
- No public landing page
- Demo/sample records only
- No live Hyundai/customer spreadsheet data committed
- No real password, PIN, API key, or production secret committed
- Login screen is a demo gate; real authentication must be added before using sensitive records

## Main modules

- Dashboard
- Projects & Units
- 17-stage workflow
- Urgent / Today / Upcoming trackers
- Inventory
- Tasks
- Documents
- Follow-ups
- Fabrication & PDI
- Releases
- Incentives
- Caltex cards
- Clients
- Agents
- Reports
- File library
- Commission vault placeholder
- Settings editor

## Settings included

- 3 workspace themes
- Font size: Medium, Large, Extra Large
- Font color editor
- Background color editor
- Table density
- Automatic logout setting

## Development

Requirements:

- Node.js `>=22.13.0`

Common commands:

```bash
npm install
npm run dev
npm run build
```

## Important security note

This version is safe as a demo/source foundation. Before importing real records, add proper database-backed authentication, encrypted credentials, role permissions, audit logs, and secure file storage.
