import { createServer } from "node:http";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, statSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { WebSocketServer } from "ws";

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8791);
const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "public");
const DEEPSEEK_TUI_BIN = process.env.DEEPSEEK_TUI_BIN || "deepseek-tui";
const DEEPSEEK_CLI_BIN = process.env.DEEPSEEK_CLI_BIN || "deepseek";
const PYTHON_BIN = process.env.PYTHON_BIN || "python3";
const TUI_BRIDGE = join(ROOT, "scripts", "tui_bridge.py");
const DEEPSEEK_HOME = process.env.DEEPSEEK_HOME || join(process.env.HOME || "", ".deepseek");
const DEEPSEEK_SESSION_DIR = join(DEEPSEEK_HOME, "sessions");
const DEEPSEEK_TASK_DIR = join(DEEPSEEK_HOME, "tasks");
const DEEPSEEK_SKILL_DIR = join(DEEPSEEK_HOME, "skills");
const DEEPSEEK_AUDIT_LOG = join(DEEPSEEK_HOME, "audit.log");
const execFileAsync = promisify(execFile);

const activeTuis = new Map();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
  });
  res.end(JSON.stringify(body));
}

function resolveWorkspace(value) {
  const candidate = value && String(value).trim() ? resolve(String(value)) : ROOT;
  if (!existsSync(candidate) || !statSync(candidate).isDirectory()) return ROOT;
  return candidate;
}

function handleHealth(res) {
  sendJson(res, 200, {
    status: "ok",
    backend: "python-pty",
    deepseek_tui_bin: DEEPSEEK_TUI_BIN,
    active_tuis: activeTuis.size,
    cwd: ROOT,
  });
}

function parseDeepSeekSessions(output) {
  const rows = [];
  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trim();
    const match = line.match(/^(\*)?\s*([0-9a-f]{8,})\s+\|\s+(.+?)\s+\|\s+(\d+)\s+msgs\s+\|\s+(.+)$/i);
    if (!match) continue;
    rows.push({
      current: Boolean(match[1]),
      id: match[2],
      title: match[3].trim(),
      messageCount: Number(match[4]),
      updated: match[5].trim(),
    });
  }
  return rows;
}

async function findSessionFile(id) {
  if (!id || !existsSync(DEEPSEEK_SESSION_DIR)) return null;
  const safeId = String(id).replace(/[^0-9a-f-]/gi, "");
  if (!safeId) return null;
  const files = await readdir(DEEPSEEK_SESSION_DIR);
  const match = files
    .filter((name) => name.endsWith(".json"))
    .find((name) => name === `${safeId}.json`);
  return match ? join(DEEPSEEK_SESSION_DIR, match) : null;
}

function normalizeContentBlock(block) {
  if (!block || typeof block !== "object") return { type: "text", text: String(block || "") };
  if (block.type === "text") return { type: "text", text: block.text || "" };
  if (block.type === "thinking") return { type: "thinking", text: block.thinking || "" };
  if (block.type === "tool_use") {
    return {
      type: "tool_use",
      id: block.id,
      name: block.name,
      input: block.input || {},
    };
  }
  if (block.type === "tool_result") {
    return {
      type: "tool_result",
      tool_use_id: block.tool_use_id,
      content: block.content || "",
    };
  }
  return { type: block.type || "unknown", text: JSON.stringify(block) };
}

function normalizeSession(raw) {
  const messages = Array.isArray(raw.messages) ? raw.messages : [];
  return {
    metadata: raw.metadata || {},
    messages: messages.map((message, index) => ({
      id: `${index}`,
      role: message.role || "assistant",
      content: Array.isArray(message.content)
        ? message.content.map(normalizeContentBlock)
        : [{ type: "text", text: String(message.content || "") }],
    })),
  };
}

async function handleSessions(res) {
  try {
    const { stdout } = await execFileAsync(DEEPSEEK_TUI_BIN, ["sessions", "--limit", "40"], {
      cwd: ROOT,
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    });
    sendJson(res, 200, { sessions: parseDeepSeekSessions(stdout) });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message,
      stdout: error.stdout || "",
      stderr: error.stderr || "",
      sessions: [],
    });
  }
}

async function handleSessionRead(url, res) {
  const id = url.searchParams.get("id");
  const file = await findSessionFile(id);
  if (!file) {
    sendJson(res, 404, { error: "Session not found." });
    return;
  }
  try {
    const raw = JSON.parse(await readFile(file, "utf8"));
    sendJson(res, 200, normalizeSession(raw));
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}

const MAX_BODY = 64 * 1024; // 64 KB

async function readJson(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY) throw new Error("Request body too large");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function handleSessionAction(req, res) {
  let body;
  try {
    body = await readJson(req);
  } catch (error) {
    sendJson(res, 400, { error: `Invalid JSON: ${error.message}` });
    return;
  }
  const id = String(body.id || "").trim();
  const action = String(body.action || "").trim();
  if (!/^[0-9a-f]{4,}$/i.test(id)) {
    sendJson(res, 400, { error: "Valid session id is required." });
    return;
  }
  try {
    if (action === "rename") {
      const title = String(body.title || "").trim();
      if (!title) {
        sendJson(res, 400, { error: "Title is required." });
        return;
      }
      await execFileAsync(DEEPSEEK_CLI_BIN, ["thread", "set-name", id, title], {
        cwd: ROOT,
        timeout: 10000,
      });
      sendJson(res, 200, { ok: true });
      return;
    }
    if (action === "archive") {
      await execFileAsync(DEEPSEEK_CLI_BIN, ["thread", "archive", id], {
        cwd: ROOT,
        timeout: 10000,
      });
      sendJson(res, 200, { ok: true });
      return;
    }
    sendJson(res, 400, { error: `Unknown action: ${action}` });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message,
      stdout: error.stdout || "",
      stderr: error.stderr || "",
    });
  }
}

async function runDeepSeek(args, timeout = 10000) {
  const { stdout, stderr } = await execFileAsync(DEEPSEEK_CLI_BIN, args, {
    cwd: ROOT,
    timeout,
    maxBuffer: 1024 * 1024,
  });
  return { stdout, stderr };
}

async function handleConfig(res) {
  try {
    const { stdout } = await runDeepSeek(["config", "list"]);
    sendJson(res, 200, {
      rows: stdout.split(/\r?\n/).filter(Boolean).map((line) => {
        const [key, ...rest] = line.split("=");
        return { key: key.trim(), value: rest.join("=").trim() };
      }),
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message, rows: [] });
  }
}

async function handleStats(res) {
  try {
    const { stdout } = await runDeepSeek(["metrics"]);
    sendJson(res, 200, { text: stdout });
  } catch (error) {
    sendJson(res, 500, { error: error.message, text: "" });
  }
}

async function handleLogs(res) {
  try {
    const text = existsSync(DEEPSEEK_AUDIT_LOG)
      ? (await readFile(DEEPSEEK_AUDIT_LOG, "utf8")).split(/\r?\n/).slice(-240).join("\n")
      : "";
    sendJson(res, 200, { text });
  } catch (error) {
    sendJson(res, 500, { error: error.message, text: "" });
  }
}

async function handleTasks(res) {
  try {
    const files = existsSync(DEEPSEEK_TASK_DIR)
      ? readdirSync(DEEPSEEK_TASK_DIR, { recursive: true }).filter((name) => String(name).endsWith(".json"))
      : [];
    const tasks = [];
    for (const name of files.slice(0, 40)) {
      try {
        const raw = JSON.parse(await readFile(join(DEEPSEEK_TASK_DIR, String(name)), "utf8"));
        tasks.push({ path: String(name), data: raw });
      } catch {}
    }
    sendJson(res, 200, { tasks });
  } catch (error) {
    sendJson(res, 500, { error: error.message, tasks: [] });
  }
}

async function handleSkills(res) {
  try {
    const skills = existsSync(DEEPSEEK_SKILL_DIR)
      ? readdirSync(DEEPSEEK_SKILL_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => ({ name: entry.name, path: join(DEEPSEEK_SKILL_DIR, entry.name) }))
      : [];
    sendJson(res, 200, { skills });
  } catch (error) {
    sendJson(res, 500, { error: error.message, skills: [] });
  }
}

async function serveStatic(url, res) {
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = resolve(join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }
  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      "content-type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(body);
  } catch {
    sendJson(res, 404, { error: "Not found" });
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
    });
    res.end();
    return;
  }
  if (req.method === "GET" && (url.pathname === "/api" || url.pathname === "/api/")) {
    res.writeHead(302, {
      location: "/",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    });
    res.end();
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/health") return handleHealth(res);
  if (req.method === "GET" && url.pathname === "/api/sessions") return handleSessions(res);
  if (req.method === "GET" && url.pathname === "/api/session") return handleSessionRead(url, res);
  if (req.method === "GET" && url.pathname === "/api/config") return handleConfig(res);
  if (req.method === "GET" && url.pathname === "/api/stats") return handleStats(res);
  if (req.method === "GET" && url.pathname === "/api/logs") return handleLogs(res);
  if (req.method === "GET" && url.pathname === "/api/tasks") return handleTasks(res);
  if (req.method === "GET" && url.pathname === "/api/skills") return handleSkills(res);
  if (req.method === "POST" && url.pathname === "/api/session-action") return handleSessionAction(req, res);
  if (req.method === "GET") return serveStatic(url, res);
  sendJson(res, 405, { error: "Method not allowed" });
});

const wss = new WebSocketServer({ noServer: true });

const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", () => clearInterval(heartbeatInterval));

function startTui(ws, requestUrl) {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
  const workspace = resolveWorkspace(requestUrl.searchParams.get("workspace"));
  const cols = Number(requestUrl.searchParams.get("cols") || 120);
  const rows = Number(requestUrl.searchParams.get("rows") || 36);
  const resume = requestUrl.searchParams.get("resume");
  const fresh = requestUrl.searchParams.get("fresh") === "1";
  const id = crypto.randomUUID();
  const tuiArgs = [
    "--workspace",
    workspace,
    "--skip-onboarding",
  ];
  if (resume && /^[0-9a-f]{4,}$/i.test(resume)) {
    tuiArgs.push("--resume", resume);
  } else if (fresh) {
    tuiArgs.push("--fresh");
  }

  let child;
  try {
    child = spawn(PYTHON_BIN, [
      TUI_BRIDGE,
      "--workspace",
      workspace,
      "--cols",
      String(Math.max(40, Math.min(cols, 240))),
      "--rows",
      String(Math.max(12, Math.min(rows, 80))),
      DEEPSEEK_TUI_BIN,
      ...tuiArgs,
    ], {
      cwd: workspace,
      env: {
        ...process.env,
        NO_PROXY: "api.deepseek.com",
        DEEPSEEK_FORCE_HTTP1: "1",
        TERM: "xterm-256color",
        COLORTERM: "truecolor",
        COLUMNS: String(Math.max(40, Math.min(cols, 240))),
        LINES: String(Math.max(12, Math.min(rows, 80))),
      },
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (error) {
    ws.send(JSON.stringify({
      type: "output",
      data: `\r\nFailed to start DeepSeek TUI: ${error.message}\r\n`,
    }));
    ws.close();
    return;
  }

  activeTuis.set(id, child);

  ws.send(JSON.stringify({
    type: "ready",
    id,
    workspace,
    command: `${DEEPSEEK_TUI_BIN} ${tuiArgs.map((arg) => JSON.stringify(arg)).join(" ")}`,
    resume: resume || null,
    fresh,
  }));

  let bridgeBuffer = "";

  child.stdout.on("data", (data) => {
    bridgeBuffer += data.toString("utf8");
    let newlineIndex = bridgeBuffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = bridgeBuffer.slice(0, newlineIndex);
      bridgeBuffer = bridgeBuffer.slice(newlineIndex + 1);
      newlineIndex = bridgeBuffer.indexOf("\n");
      if (!line.trim()) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        continue;
      }
      if (message.type === "output" && ws.readyState === ws.OPEN) {
        const text = Buffer.from(message.data || "", "base64").toString("utf8");
        ws.send(JSON.stringify({ type: "output", data: text }));
      }
      if (message.type === "error" && ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: "output", data: `\r\n${message.message}\r\n` }));
      }
    }
  });

  child.stderr.on("data", (data) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ type: "output", data: data.toString("utf8") }));
  });

  child.on("error", (error) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "output", data: `\r\nFailed to start DeepSeek TUI: ${error.message}\r\n` }));
    }
  });

  child.on("close", (exitCode, signal) => {
    activeTuis.delete(id);
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "exit", exitCode, signal }));
      ws.close();
    }
  });

  ws.on("message", (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString("utf8"));
    } catch {
      return;
    }
    if (message.type === "input") {
      if (child.stdin.writable) {
        child.stdin.write(JSON.stringify({
          type: "input",
          data: Buffer.from(String(message.data || ""), "utf8").toString("base64"),
        }) + "\n");
      }
    }
    if (message.type === "resize") {
      if (child.stdin.writable) {
        child.stdin.write(JSON.stringify({
          type: "resize",
          cols: Number(message.cols || 120),
          rows: Number(message.rows || 36),
        }) + "\n");
      }
    }
  });

  ws.on("close", () => {
    activeTuis.delete(id);
    try {
      child.kill();
    } catch {
      // Process may already be gone.
    }
  });
}

wss.on("connection", startTui);

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);
  if (url.pathname !== "/tui") {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, url);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`DeepSeek TUI WebUI listening on http://${HOST}:${PORT}`);
});
