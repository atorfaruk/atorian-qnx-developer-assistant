# ATORIAN QNX Developer Assistant

A React + Vite frontend prototype for the QNX Global Hackathon 2026.

## Current status

This ZIP contains the **frontend prototype only**. It is not yet connected to Gemini, QNX SDP 8.0, QEMU, a backend, or official live documentation.

The interface includes:
- Overview dashboard
- AI Assistant screen (local message composer; no AI response service)
- Build Error Analyzer (reads a local text log; displayed diagnosis is explicitly illustrative)
- Project Inspector (local folder selection and file listing; no semantic code analysis)
- Build & Test (command review preview only; no commands are executed)
- Documentation screen (sample topic index; no live official document retrieval)
- Settings screen

No credentials or API keys are required to run the frontend.

## Requirements

- Node.js 20 LTS or later recommended
- npm
- VS Code (recommended)

## Run on Windows 11

1. Extract the ZIP.
2. Open the extracted `atorian-qnx-developer-assistant` folder in VS Code.
3. Open Terminal > New Terminal.
4. Run:

   ```powershell
   npm install
   npm run dev
   ```

5. Open the local URL printed by Vite, usually `http://localhost:5173`.

To create a production frontend build:

```powershell
npm run build
```

The output is written to `dist/`.

## Project structure

```text
atorian-qnx-developer-assistant/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

## Next engineering milestones

1. Confirm QNX Everywhere account and licence status.
2. Install QNX Software Center and QNX SDP 8.0.
3. Follow the official QNX SDP 8.0 Quick Start and build/run a real sample on QEMU or another supported target.
4. Create a Python/FastAPI backend.
5. Add official QNX documentation retrieval with source references.
6. Add an AI provider through a backend-only API key (never expose API keys in React/browser code).
7. Connect actual QNX build output to the Build Error Analyzer.
8. Add controlled project inspection and explicit human approval for any command execution.
9. Test and document every claimed feature before hackathon submission.

## Safety and honesty

- The UI does not execute shell commands.
- The UI does not claim QNX is installed or connected.
- The sample diagnosis is illustrative, not an AI-generated diagnosis.
- The documentation entries are placeholders, not verified live QNX documentation.
- Do not put API keys in frontend source code.
- Use QNX only under the applicable QNX Everywhere licence terms.

## Branding

Project: **ATORIAN QNX DEVELOPER ASSISTANT**
Proposed category: **Developer Tooling & Host Tools**
