# Changelog

## 0.5.3 - 2026-05-12

### Fixed - 2026-05-13

- Composer submissions now render the user's message immediately before the PTY
  session file has finished writing.
- Composer submissions now clear the underlying DeepSeek TUI draft line before
  typing, preventing older prompts from being concatenated with the new one.
- The composer is disabled while a prompt is in flight and the UI exposes
  `sending` / `running` / `done` state instead of looking idle during model
  work.
- Added a temporary live assistant card fed by WebSocket PTY output, then
  replace it with the persisted DeepSeek session answer once the final text is
  available.
- Pending refresh now follows the backend current session while a prompt is in
  flight, so fresh sessions no longer wait for manual refresh to show the final
  answer.
- Live PTY parsing now waits for the current prompt echo before reading output
  and filters terminal chrome, prior conversation text, and compressed internal
  reasoning lines from the visible answer stream.

### Verified - 2026-05-13

- `node --check public/app.js`
- Browser automation on `http://127.0.0.1:8791/`: new session prompt appears
  within 300ms, live answer card appears while waiting, and the persisted final
  `ok` answer replaces the temporary card without page refresh.
- Browser automation on `http://127.0.0.1:8791/`: prompt `请只回复 当前问题-*`
  shows `running` state immediately and final answer matches only the current
  prompt, with no older validation prompts mixed in.
- Browser automation on `http://127.0.0.1:8791/`: live temporary assistant card
  now shows only generation/sync status, and final content comes from
  structured `assistant.text` without PTY raw noise.

### Changed

- Replaced the default middle terminal mirror with a structured conversation
  renderer backed by DeepSeek session files.
- Kept the xterm mirror as a hidden raw debug panel instead of the primary
  reading surface.
- Fresh-session message sending now polls the session list more aggressively and
  selects the current session once DeepSeek writes it.
- Current sessions are no longer hidden by the local archived-session filter.

### Fixed

- Final assistant answers could disappear in new sessions when no session id was
  available at send time.
- Terminal thinking/status output could appear in the main answer area instead
  of a folded thinking/debug surface.

### Verified

- `node --check public/app.js`
- `node --check server.js`
- Browser check on `http://127.0.0.1:8791/`: structured message area visible,
  raw terminal hidden, no page errors.

## 0.3.4 - 2026-05-11

### Added

- Structured WebUI shell with app rail, sessions sidebar, main conversation,
  composer, and right-side inspector.
- Orbit logo identity.
- Light and dark theme support.
- Session actions registry for rename, pin, and archive/delete.
- API endpoints for sessions, session details, config, stats, logs, tasks, and
  skills.
- Markdown rendering for paragraphs, headings, lists, tables, inline code, and
  code blocks.
- Raw TUI debug panel hidden by default.

### Changed

- Main conversation now renders only text blocks from DeepSeek session files.
- Thinking, tool calls, and task activity are moved into inspector panels rather
  than polluting the conversation stream.
- Composer moved from terminal-style input to a browser text area with model and
  reasoning controls.

### Known Issues

- Sending still uses PTY input, then refreshes session files after a delay.
- Direct DeepSeek app-server integration is still pending.
- Main output visual design is under active iteration.
