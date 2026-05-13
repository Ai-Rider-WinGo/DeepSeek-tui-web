# Project Notes

## Name

Deepseek-Tui-web

## Repository Target

Owner: `ai-rider`

Suggested repository name: `Deepseek-Tui-web`

## Version

`0.5.3`

## Purpose

Build a local WebUI for the installed DeepSeek TUI. The browser should expose
the practical workflow around the TUI: sessions, messages, thinking, plans,
tasks, skills, settings, stats, logs, and raw debug output.

## Current Implementation

- `server.js` serves the WebUI and starts `deepseek-tui` through a PTY bridge.
- `scripts/tui_bridge.py` owns pseudo-terminal bridging.
- `public/app.js` loads saved sessions, renders structured messages, syncs
  panels, and manages UI preferences.
- `public/style.css` owns the current visual system.
- The main middle area now defaults to structured conversation cards. The raw
  terminal mirror is kept as a hidden debug view.
- Composer send now uses an optimistic local message plus a temporary live
  assistant card sourced from PTY WebSocket output, then swaps to the persisted
  session answer after DeepSeek writes the final response.

## Important Product Principle

This project should not become a generic DeepSeek API chat page. It should stay
anchored to the installed local TUI while gradually exposing browser-native
controls around it.

## Next Work

1. Refine main conversation typography and spacing.
2. Replace the remaining polling fallback with a stronger event/source-of-truth
   model.
3. Investigate DeepSeek app-server integration for direct message submission.
4. Harden session actions.
5. Expand settings/config pages using Hermes WebUI as layout inspiration.
