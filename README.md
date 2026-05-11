# Deepseek-Tui-web

Version: **0.3.4**

Deepseek-Tui-web is a local browser interface for the installed `deepseek-tui`.
The project keeps the real TUI process running locally, then layers a structured
WebUI around sessions, messages, plans, tasks, settings, logs, and debugging
output.

## Vision

The goal is not to replace DeepSeek TUI with a generic chat page. The goal is to
bring the TUI into a browser-native workbench:

- keep compatibility with the real local `deepseek-tui` runtime;
- make sessions, plans, tasks, settings, and logs easier to inspect;
- preserve terminal-level access as a fallback/debug view;
- evolve toward a Hermes-inspired local agent dashboard for daily work.

## Current Status

This is an active prototype. Version `0.3.4` focuses on the transition from a
raw xterm-only wrapper to a structured WebUI.

Working:

- local HTTP server on `127.0.0.1:8791`;
- WebSocket bridge to a Python PTY running `deepseek-tui`;
- session list from `deepseek-tui sessions`;
- resume/fresh session launch;
- structured reading of `~/.deepseek/sessions/*.json`;
- chat-style message rendering for text content;
- right-side panels for thinking, plans, and tool tasks;
- left app rail for chat, tasks, skills, config, stats, logs, and settings;
- light/dark themes;
- Orbit logo identity;
- raw TUI debug panel kept available but hidden by default.

Known issues:

- the structured WebUI still depends on session-file refresh timing after user
  input;
- some DeepSeek internal messages are tool-only and should remain outside the
  main conversation stream;
- the main output visual language is still being refined;
- direct app-server/stdin integration is not complete yet.

## Architecture

```text
Browser WebUI
  |
  | HTTP static assets + WebSocket
  v
Node server.js
  |
  | JSON-over-stdio
  v
Python PTY bridge
  |
  | real pseudo-terminal
  v
deepseek-tui
```

Key files:

- `server.js` — local HTTP API, static file server, WebSocket PTY launcher;
- `scripts/tui_bridge.py` — PTY bridge for input, output, and resize events;
- `public/index.html` — application shell;
- `public/app.js` — session loading, rendering, i18n, settings, WebSocket flow;
- `public/style.css` — layout, light/dark themes, panels, message styling.

## Run Locally

Requirements:

- Node.js 20+
- Python 3
- installed `deepseek` and `deepseek-tui` binaries

Install dependencies:

```sh
npm install
```

Start:

```sh
npm start
```

Open:

```text
http://127.0.0.1:8791/
```

Optional environment variables:

```sh
DEEPSEEK_TUI_BIN=/path/to/deepseek-tui
PYTHON_BIN=/path/to/python3
HOST=127.0.0.1
PORT=8791
```

## Project Direction

Near-term:

- stabilize message rendering and eliminate empty/internal-only bubbles;
- improve the main conversation visual system;
- move sending from PTY-only input toward DeepSeek app-server APIs where
  reliable;
- make session rename, pin, archive, task, skill, config, stats, and logs feel
  production-grade;
- keep Hermes WebUI as a reference for layout and workflow density.

Mid-term:

- create a full browser-native session manager;
- provide better task and plan synchronization;
- add workspace/project switching when it can be done without breaking local
  DeepSeek assumptions;
- package the app for simpler local installation.

## Version

Current version: **0.3.4**

See [CHANGELOG.md](CHANGELOG.md) for release notes.
