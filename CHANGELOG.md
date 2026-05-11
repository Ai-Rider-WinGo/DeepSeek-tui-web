# Changelog

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
