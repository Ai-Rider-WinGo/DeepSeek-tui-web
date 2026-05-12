const terminalHost = document.querySelector("#terminal");
const statusEl = document.querySelector("#status");
const reconnectButton = document.querySelector("#reconnect");
const newSessionButton = document.querySelector("#newSession");
const refreshSessionsButton = document.querySelector("#refreshSessions");
const sessionList = document.querySelector("#sessionList");
const sessionSearch = document.querySelector("#sessionSearch");
const sessionTitle = document.querySelector("#sessionTitle");
const backendBadge = document.querySelector("#backendBadge");
const workspaceBadge = document.querySelector("#workspaceBadge");
const messageList = document.querySelector("#messageList");
const rawLogPanel = document.querySelector("#rawLogPanel");
const rawLogToggle = document.querySelector("#rawLogToggle");
const utilityPanel = document.querySelector("#utilityPanel");
const brandLogo = document.querySelector("#brandLogo");
const themeLightButton = document.querySelector("#themeLight");
const themeDarkButton = document.querySelector("#themeDark");
const composerForm = document.querySelector("#composerForm");
const composerInput = document.querySelector("#composerInput");
const modelSelect = document.querySelector("#modelSelect");
const reasoningSelect = document.querySelector("#reasoningSelect");
const thinkingPanel = document.querySelector("#thinkingPanel");
const thinkingState = document.querySelector("#thinkingState");
const thinkingBody = document.querySelector("#thinkingBody");
const planState = document.querySelector("#planState");
const planList = document.querySelector("#planList");
const taskState = document.querySelector("#taskState");
const taskList = document.querySelector("#taskList");
const settingsDialog = document.querySelector("#settingsDialog");
const closeSettings = document.querySelector("#closeSettings");
const languageSelect = document.querySelector("#languageSelect");
const themeSelect = document.querySelector("#themeSelect");
const settingsModelSelect = document.querySelector("#settingsModelSelect");
const rawLogSelect = document.querySelector("#rawLogSelect");

const i18n = {
  zh: {
    nav_chat: "对话", nav_tasks: "任务", nav_skills: "技能", nav_config: "配置", nav_stats: "统计", nav_logs: "日志", nav_settings: "设置",
    brand_subtitle: "Web 控制台", new_session: "新对话", refresh_sessions: "刷新会话", search_sessions: "搜索会话",
    reconnect: "重新连接", raw_tui_log: "DeepSeek TUI 镜像", composer_placeholder: "给 DeepSeek 发消息...",
    model: "模型", reasoning: "推理强度", send: "发送 ⌘ Enter", thinking: "思考", plan: "计划", tasks: "任务",
    settings_title: "控制中心", settings_subtitle: "偏好、外观和本机 DeepSeek 控制。", language: "语言", theme: "主题",
    default_model: "默认模型", raw_log: "原始日志", no_data: "暂无数据",
    you: "你", deepseek: "DeepSeek", tool_result: "工具结果", section_chat: "对话", section_tasks: "任务", section_skills: "技能",
    section_config: "配置", section_stats: "统计", section_logs: "日志", empty_chat: "当前会话暂无可展示的文本内容。发送一条消息后会在这里同步 DeepSeek TUI 输出。",
    thinking_process: "思考过程", thinking_streaming: "正在思考",
  },
  en: {
    nav_chat: "Chat", nav_tasks: "Tasks", nav_skills: "Skills", nav_config: "Config", nav_stats: "Stats", nav_logs: "Logs", nav_settings: "Settings",
    brand_subtitle: "Web Console", new_session: "New Session", refresh_sessions: "Refresh sessions", search_sessions: "Search sessions",
    reconnect: "Reconnect", raw_tui_log: "DeepSeek TUI Mirror", composer_placeholder: "Message DeepSeek...",
    model: "Model", reasoning: "Reasoning", send: "Send ⌘ Enter", thinking: "Thinking", plan: "Plan", tasks: "Tasks",
    settings_title: "Control Center", settings_subtitle: "Preferences, appearance, and local DeepSeek controls.", language: "Language", theme: "Theme",
    default_model: "Default model", raw_log: "Raw log", no_data: "No data",
    you: "You", deepseek: "DeepSeek", tool_result: "Tool result", section_chat: "Chat", section_tasks: "Tasks", section_skills: "Skills",
    section_config: "Config", section_stats: "Stats", section_logs: "Logs", empty_chat: "No displayable text in this session yet. Send a message and DeepSeek TUI output will sync here.",
    thinking_process: "Thinking process", thinking_streaming: "Thinking",
  },
};

const orbitLogo = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 24c8-13 17-16 24-8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="28" cy="13" r="3" fill="currentColor"/></svg>';

const themes = {
  dark: {
    background: "#0b0d0e",
    foreground: "#eef2f3",
    cursor: "#48d2b0",
    selectionBackground: "#25564d",
    black: "#111314",
    red: "#ff6b6b",
    green: "#48d2b0",
    yellow: "#f0c95a",
    blue: "#73a7ff",
    magenta: "#d491ff",
    cyan: "#56d6e7",
    white: "#eef2f3",
    brightBlack: "#566066",
    brightRed: "#ff8d8d",
    brightGreen: "#74e2c7",
    brightYellow: "#f6d981",
    brightBlue: "#98bdff",
    brightMagenta: "#e0adff",
    brightCyan: "#85e3ef",
    brightWhite: "#ffffff",
  },
  light: {
    background: "#fbfaf7",
    foreground: "#1c211f",
    cursor: "#167761",
    selectionBackground: "#cfe9e1",
    black: "#242927",
    red: "#b83242",
    green: "#167761",
    yellow: "#8b6900",
    blue: "#275fad",
    magenta: "#8b4bb3",
    cyan: "#14727f",
    white: "#f6f1e8",
    brightBlack: "#78817d",
    brightRed: "#cf4755",
    brightGreen: "#21977c",
    brightYellow: "#a77f00",
    brightBlue: "#3873cb",
    brightMagenta: "#a762ca",
    brightCyan: "#218b99",
    brightWhite: "#ffffff",
  },
};

const terminalTheme = {
  background: "#07111f",
  foreground: "#d8e2ef",
  cursor: "#5eead4",
  selectionBackground: "#153d49",
  black: "#07111f",
  red: "#ff6b7a",
  green: "#5eead4",
  yellow: "#f7d774",
  blue: "#7ab7ff",
  magenta: "#d7a1ff",
  cyan: "#67e8f9",
  white: "#d8e2ef",
  brightBlack: "#617086",
  brightRed: "#ff9aa5",
  brightGreen: "#9ff8df",
  brightYellow: "#ffe59b",
  brightBlue: "#a8ceff",
  brightMagenta: "#e7c3ff",
  brightCyan: "#a5f3fc",
  brightWhite: "#ffffff",
};

const term = new Terminal({
  cursorBlink: false,
  convertEol: false,
  disableStdin: true,
  fontFamily: '"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "PingFang SC", monospace',
  fontSize: 13.5,
  lineHeight: 1.28,
  scrollback: 30000,
  theme: terminalTheme,
});

const FitAddonConstructor = (typeof FitAddon !== 'undefined' && FitAddon.FitAddon) || FitAddon;
const fitAddon = new FitAddonConstructor();
term.loadAddon(fitAddon);
term.open(terminalHost);

let socket = null;
let resizeTimer = null;
let thinkingTimer = null;
let selectedSessionId = null;
let selectedSessionTitle = "Live TUI";
let freshNext = false;
let sessions = [];
let currentSession = null;
let sessionRefreshTimer = null;
let currentTheme = localStorage.getItem("deepseek-webui-theme") || "dark";
let currentLang = localStorage.getItem("deepseek-webui-lang") || "zh";
let pinnedSessions = readPinnedSessions();
let hiddenSessions = readHiddenSessions();
let renamedSessions = readRenamedSessions();
let liveThinkingArticle = null;
let liveThinkingContent = null;

const sessionActions = [
  { id: "rename", label: "重命名对话", run: renameSession },
  { id: "pin", label: "置顶对话", run: togglePinSession },
  { id: "archive", label: "删除对话", run: archiveSession },
];

function readPinnedSessions() {
  return new Set(JSON.parse(localStorage.getItem("deepseek-webui-pinned") || "[]"));
}

function writePinnedSessions() {
  localStorage.setItem("deepseek-webui-pinned", JSON.stringify([...pinnedSessions]));
}

function readHiddenSessions() {
  return new Set(JSON.parse(localStorage.getItem("deepseek-webui-hidden") || "[]"));
}

function writeHiddenSessions() {
  localStorage.setItem("deepseek-webui-hidden", JSON.stringify([...hiddenSessions]));
}

function readRenamedSessions() {
  return JSON.parse(localStorage.getItem("deepseek-webui-renamed") || "{}");
}

function writeRenamedSessions() {
  localStorage.setItem("deepseek-webui-renamed", JSON.stringify(renamedSessions));
}

function stripAnsi(value) {
  return String(value)
    .replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "")
    .replace(/\x1b[()][A-Za-z0-9]/g, "")
    .replace(/\x1b[=>]/g, "")
    .replace(/\r/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .trim();
}

function setStatus(text) {
  statusEl.textContent = text;
}

function t(key) {
  return i18n[currentLang]?.[key] || i18n.en[key] || key;
}

function applyI18n() {
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.title = t(node.dataset.i18nTitle);
    node.setAttribute("aria-label", t(node.dataset.i18nTitle));
  });
  languageSelect.value = currentLang;
}

function applyLogo() {
  brandLogo.innerHTML = orbitLogo;
}

function applyTheme(themeName) {
  currentTheme = themeName === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = currentTheme;
  localStorage.setItem("deepseek-webui-theme", currentTheme);
  term.options.theme = terminalTheme;
  themeLightButton.classList.toggle("active", currentTheme === "light");
  themeDarkButton.classList.toggle("active", currentTheme === "dark");
  themeSelect.value = currentTheme;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function renderMarkdown(markdown) {
  const source = String(markdown || "");
  const codeBlocks = [];
  let html = escapeHtml(source).replace(/```([\s\S]*?)```/g, (_match, code) => {
    const token = `@@CODE_${codeBlocks.length}@@`;
    codeBlocks.push(`<pre class="md-code"><code>${code.trim()}</code></pre>`);
    return `\n\n${token}\n\n`;
  });
  html = html
    .replace(/^### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^## (.*)$/gm, "<h3>$1</h3>")
    .replace(/^# (.*)$/gm, "<h2>$1</h2>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

  const blocks = html.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean).map((part) => {
    const codeMatch = part.match(/^@@CODE_(\d+)@@$/);
    if (codeMatch) return codeBlocks[Number(codeMatch[1])] || "";
    if (/^<h[2-4]>/.test(part)) return part;
    const lines = part.split(/\n/);
    if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
      return `<ul>${lines.map((line) => `<li>${line.replace(/^\s*[-*]\s+/, "")}</li>`).join("")}</ul>`;
    }
    if (lines.every((line) => /^\s*\d+\.\s+/.test(line))) {
      return `<ol>${lines.map((line) => `<li>${line.replace(/^\s*\d+\.\s+/, "")}</li>`).join("")}</ol>`;
    }
    if (lines.length >= 2 && lines.every((line) => /^\|.*\|$/.test(line.trim()))) {
      const rows = lines
        .filter((line) => !/^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|$/.test(line.trim()))
        .map((line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim()));
      const [head, ...bodyRows] = rows;
      return `<div class="md-table-wrap"><table class="md-table"><thead><tr>${head.map((cell) => `<th>${cell}</th>`).join("")}</tr></thead><tbody>${bodyRows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    }
    return `<p>${part.replace(/\n/g, "<br>")}</p>`;
  });
  return blocks.join("");
}

function socketUrl() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host || "127.0.0.1:8791";
  const params = new URLSearchParams({
    cols: String(term.cols || 120),
    rows: String(term.rows || 36),
  });
  if (selectedSessionId) params.set("resume", selectedSessionId);
  if (freshNext) params.set("fresh", "1");
  return `${protocol}//${host}/tui?${params.toString()}`;
}

function send(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    return true;
  }
  return false;
}

function fitAndResize() {
  if (rawLogPanel.classList.contains("hidden") || terminalHost.offsetWidth === 0 || terminalHost.offsetHeight === 0) {
    send({ type: "resize", cols: term.cols || 120, rows: term.rows || 36 });
    return;
  }
  fitAddon.fit();
  send({ type: "resize", cols: term.cols, rows: term.rows });
}

function connect() {
  if (socket) socket.close();
  term.reset();
  term.writeln("\x1b[32mConnecting to DeepSeek TUI...\x1b[0m");
  if (!rawLogPanel.classList.contains("hidden") && terminalHost.offsetWidth > 0 && terminalHost.offsetHeight > 0) {
    fitAddon.fit();
  }
  sessionTitle.textContent = selectedSessionTitle;
  socket = new WebSocket(socketUrl());
  freshNext = false;

  socket.addEventListener("open", () => {
    setStatus("PTY connected");
    fitAndResize();
    composerInput.focus();
  });

  socket.addEventListener("message", (event) => {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }
    if (message.type === "ready") {
      const mode = message.tmux ? `tmux ${message.tmux}` : "direct PTY";
      setStatus(`${message.resume ? `Resumed ${message.resume}` : "Running fresh TUI"} · ${mode}`);
      workspaceBadge.textContent = message.workspace || "Current workspace";
      backendBadge.textContent = message.tmux ? "tmux-backed PTY" : "direct PTY";
    }
    if (message.type === "output") {
      term.write(message.data);
      inspectTuiOutput(message.data);
    }
    if (message.type === "exit") {
      term.writeln("");
      term.writeln(`\x1b[31mDeepSeek TUI exited (${message.signal || message.exitCode}).\x1b[0m`);
      setStatus("PTY exited");
      loadSessions();
    }
  });

  socket.addEventListener("close", () => {
    setStatus("Disconnected");
  });

  socket.addEventListener("error", () => {
    setStatus("Connection error");
  });
}

function blockText(block) {
  if (block.type === "text" || block.type === "thinking") return block.text || "";
  if (block.type === "tool_use") return `${block.name || "tool"} ${JSON.stringify(block.input || {})}`;
  if (block.type === "tool_result") return block.content || "";
  return block.text || "";
}

function renderContentBlocks(blocks) {
  const fragment = document.createDocumentFragment();
  for (const block of blocks) {
    if (block.type === "text" && (block.text || "").trim()) {
      const node = document.createElement("div");
      node.className = "text-block";
      node.innerHTML = renderMarkdown(block.text || "");
      fragment.append(node);
    }
  }
  return fragment;
}

function visibleTextBlocks(message) {
  return (message.content || []).filter((block) => {
    return block.type === "text" && Boolean((block.text || "").trim());
  });
}

function visibleThinkingBlocks(message) {
  return (message.content || []).filter((block) => {
    return block.type === "thinking" && Boolean((block.text || "").trim());
  });
}

function createAssistantRoleLabel() {
  const label = document.createElement("div");
  label.className = "message-role";
  label.innerHTML = `<span class="role-dot"></span><span>${t("deepseek")}</span>`;
  return label;
}

function renderThinkingDetails(blocks, { open = false, streaming = false } = {}) {
  const details = document.createElement("details");
  details.className = "thinking-details";
  details.open = open;
  const summary = document.createElement("summary");
  summary.innerHTML = `<span>${streaming ? t("thinking_streaming") : t("thinking_process")}</span><strong>${open ? "open" : "folded"}</strong>`;
  const content = document.createElement("div");
  content.className = "thinking-content";
  content.textContent = blocks.map((block) => block.text || "").filter(Boolean).join("\n\n");
  details.append(summary, content);
  return details;
}

function ensureLiveThinkingCard() {
  if (liveThinkingArticle && messageList.contains(liveThinkingArticle)) return liveThinkingContent;
  liveThinkingArticle = document.createElement("article");
  liveThinkingArticle.className = "message-card assistant-message live-thinking";
  liveThinkingArticle.append(createAssistantRoleLabel());
  const details = renderThinkingDetails([{ text: "" }], { open: true, streaming: true });
  liveThinkingContent = details.querySelector(".thinking-content");
  liveThinkingArticle.append(details);
  messageList.append(liveThinkingArticle);
  return liveThinkingContent;
}

function showLiveThinking(text) {
  const content = ensureLiveThinkingCard();
  content.textContent = text;
  messageList.scrollTop = messageList.scrollHeight;
}

function clearLiveThinkingCard() {
  liveThinkingArticle = null;
  liveThinkingContent = null;
}

function renderStructuredSession(session) {
  currentSession = session;
  messageList.innerHTML = "";
  clearLiveThinkingCard();
  const messages = session.messages || [];
  let visibleCount = 0;
  for (const message of messages) {
    const isAssistant = message.role === "assistant";
    const visibleBlocks = visibleTextBlocks(message);
    const thinkingBlocks = visibleThinkingBlocks(message);
    if (!visibleBlocks.length && !(isAssistant && thinkingBlocks.length)) continue;
    visibleCount += 1;
    const article = document.createElement("article");
    article.className = `message-card ${message.role === "user" ? "user-message" : "assistant-message"}`;
    if (isAssistant) article.append(createAssistantRoleLabel());
    if (visibleBlocks.length) {
      const body = document.createElement("div");
      body.className = "message-body";
      body.append(renderContentBlocks(visibleBlocks));
      article.append(body);
    }
    if (isAssistant && thinkingBlocks.length) {
      article.append(renderThinkingDetails(thinkingBlocks, { open: false }));
    }
    messageList.append(article);
  }
  if (!visibleCount) {
    const empty = document.createElement("div");
    empty.className = "conversation-empty";
    empty.innerHTML = `<strong>${t("deepseek")}</strong><span>${t("empty_chat")}</span>`;
    messageList.append(empty);
  }
  messageList.scrollTop = messageList.scrollHeight;
  renderInspectorFromSession(session);
}

function renderInspectorFromSession(session) {
  const assistantBlocks = (session.messages || [])
    .filter((message) => message.role === "assistant")
    .flatMap((message) => message.content || []);
  const thinkingBlocks = assistantBlocks.filter((block) => block.type === "thinking");
  const toolBlocks = assistantBlocks.filter((block) => block.type === "tool_use");
  const latestThinking = thinkingBlocks.at(-1);
  thinkingBody.textContent = latestThinking?.text || (currentLang === "zh" ? "当前会话暂无思考内容。" : "No thinking content in this session yet.");
  thinkingState.textContent = "idle";
  thinkingPanel.classList.remove("open");

  planList.innerHTML = "";
  const planCandidates = assistantBlocks
    .filter((block) => /plan|todo|任务|计划/i.test(blockText(block)))
    .slice(-6);
  for (const block of planCandidates.length ? planCandidates : [{ text: currentLang === "zh" ? "暂无结构化计划。" : "No structured plan yet." }]) {
    const item = document.createElement("li");
    item.textContent = blockText(block).slice(0, 180);
    planList.append(item);
  }
  planState.textContent = planCandidates.length ? "synced" : "ready";

  taskList.innerHTML = "";
  for (const block of toolBlocks.length ? toolBlocks.slice(-8) : [{ name: currentLang === "zh" ? "暂无工具任务" : "No tool tasks yet", input: {} }]) {
    const row = document.createElement("div");
    row.className = "task-row";
    row.textContent = block.name ? `${block.name} ${JSON.stringify(block.input || {})}` : (currentLang === "zh" ? "暂无工具任务" : "No tool tasks yet");
    taskList.append(row);
  }
  taskState.textContent = toolBlocks.length ? `${toolBlocks.length}` : "0";
}

function inspectTuiOutput(raw) {
  const text = stripAnsi(raw);
  if (!text) return;
  if (/thinking/i.test(text) || /思考|推理/.test(text)) {
    thinkingPanel.classList.add("open");
    thinkingState.textContent = "streaming";
    thinkingBody.textContent = text.slice(-900);
    clearTimeout(thinkingTimer);
    thinkingTimer = setTimeout(() => {
      thinkingState.textContent = "idle";
      thinkingPanel.classList.remove("open");
    }, 1600);
  }
  if (/Plan|计划|update_plan/i.test(text)) {
    planState.textContent = "active";
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean).slice(-6);
    planList.innerHTML = "";
    for (const line of lines.length ? lines : ["Plan detected in TUI output."]) {
      const item = document.createElement("li");
      item.textContent = line.slice(0, 120);
      planList.append(item);
    }
  }
  if (/task|todo|任务|completed|in_progress/i.test(text)) {
    taskState.textContent = "updated";
    const row = document.createElement("div");
    row.className = "task-row";
    row.textContent = text.split("\n").filter(Boolean).at(-1)?.slice(0, 120) || "Task update";
    taskList.prepend(row);
    while (taskList.children.length > 6) taskList.lastElementChild.remove();
  }
  if (/idle|completed|完成/i.test(text)) {
    clearTimeout(thinkingTimer);
    thinkingTimer = setTimeout(() => {
      thinkingState.textContent = "idle";
      thinkingPanel.classList.remove("open");
    }, 500);
  }
}

async function loadSession(id) {
  if (!id) return;
  try {
    const res = await fetch(`/api/session?id=${encodeURIComponent(id)}`);
    if (!res.ok) return;
    const data = await res.json();
    renderStructuredSession(data);
  } catch {
    // Keep current view.
  }
}

async function loadUtilitySection(section) {
  if (section === "chat") {
    utilityPanel.classList.add("hidden");
    rawLogPanel.classList.add("hidden");
    messageList.classList.remove("hidden");
    return;
  }
  if (section === "settings") {
    openSettings();
    return;
  }
  utilityPanel.classList.remove("hidden");
  messageList.classList.add("hidden");
  rawLogPanel.classList.add("hidden");
  const title = t(`section_${section}`);
  utilityPanel.innerHTML = `<header><h2>${title}</h2><button id="utilityRefresh" type="button">${t("refresh_sessions")}</button></header><div class="utility-content">${t("no_data")}</div>`;
  document.querySelector("#utilityRefresh").addEventListener("click", () => loadUtilitySection(section));
  const content = utilityPanel.querySelector(".utility-content");
  try {
    const endpoint = { tasks: "/api/tasks", skills: "/api/skills", config: "/api/config", stats: "/api/stats", logs: "/api/logs" }[section];
    const res = await fetch(endpoint);
    const data = await res.json();
    content.innerHTML = renderUtilityData(section, data);
  } catch (error) {
    content.textContent = error.message;
  }
}

function renderUtilityData(section, data) {
  if (section === "stats" || section === "logs") return `<pre class="utility-pre">${escapeHtml(data.text || t("no_data"))}</pre>`;
  if (section === "config") {
    return `<div class="kv-list">${(data.rows || []).map((row) => `<div><strong>${escapeHtml(row.key)}</strong><span>${escapeHtml(row.value)}</span></div>`).join("") || t("no_data")}</div>`;
  }
  if (section === "skills") {
    return `<div class="card-list">${(data.skills || []).map((skill) => `<article><strong>${escapeHtml(skill.name)}</strong><span>${escapeHtml(skill.path)}</span></article>`).join("") || t("no_data")}</div>`;
  }
  if (section === "tasks") {
    return `<div class="card-list">${(data.tasks || []).map((task) => `<article><strong>${escapeHtml(task.path)}</strong><pre>${escapeHtml(JSON.stringify(task.data, null, 2)).slice(0, 1200)}</pre></article>`).join("") || t("no_data")}</div>`;
  }
  return t("no_data");
}

function openSettings() {
  settingsDialog.classList.remove("hidden");
  languageSelect.value = currentLang;
  themeSelect.value = currentTheme;
  rawLogSelect.value = "open";
}

function closeSettingsDialog() {
  settingsDialog.classList.add("hidden");
}

function getSessionTitle(item) {
  return renamedSessions[item.id] || item.title || "Untitled";
}

function sortSessions(items) {
  return [...items].sort((a, b) => {
    const ap = pinnedSessions.has(a.id) ? 1 : 0;
    const bp = pinnedSessions.has(b.id) ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return 0;
  });
}

function renderSessions() {
  const query = sessionSearch.value.trim().toLowerCase();
  const visible = sortSessions(sessions)
    .filter((item) => !hiddenSessions.has(item.id))
    .filter((item) => {
      if (!query) return true;
      return `${item.id} ${getSessionTitle(item)} ${item.updated}`.toLowerCase().includes(query);
    });

  sessionList.innerHTML = "";
  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "session-empty";
    empty.textContent = "No sessions found";
    sessionList.append(empty);
    return;
  }

  for (const item of visible) {
    const row = document.createElement("div");
    row.className = "session-row";
    row.classList.toggle("active", item.id === selectedSessionId);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "session-item";
    button.innerHTML = `
      <span class="session-title"></span>
      <span class="session-meta"><span>${item.id.slice(0, 8)}</span><span>${item.messageCount} msgs</span><span>${item.updated}</span></span>
    `;
    button.querySelector(".session-title").textContent = `${pinnedSessions.has(item.id) ? "Pinned · " : ""}${getSessionTitle(item)}`;
    button.addEventListener("click", () => {
      selectedSessionId = item.id;
      selectedSessionTitle = getSessionTitle(item);
      connect();
      loadSession(item.id);
      renderSessions();
    });

    const menu = document.createElement("button");
    menu.type = "button";
    menu.className = "session-menu";
    menu.setAttribute("aria-label", "Session actions");
    menu.textContent = "⋯";
    menu.addEventListener("click", (event) => {
      event.stopPropagation();
      openSessionMenu(menu, item);
    });

    row.append(button, menu);
    sessionList.append(row);
  }
}

function openSessionMenu(anchor, item) {
  closeSessionMenus();
  const menu = document.createElement("div");
  menu.className = "floating-menu";
  for (const action of sessionActions) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action.id === "pin" && pinnedSessions.has(item.id) ? "取消置顶" : action.label;
    button.addEventListener("click", async () => {
      await action.run(item);
      closeSessionMenus();
      renderSessions();
    });
    menu.append(button);
  }
  anchor.parentElement.append(menu);
}

function closeSessionMenus() {
  document.querySelectorAll(".floating-menu").forEach((node) => node.remove());
}

async function renameSession(item) {
  const next = window.prompt("重命名对话", getSessionTitle(item));
  if (!next || !next.trim()) return;
  renamedSessions[item.id] = next.trim();
  writeRenamedSessions();
  if (selectedSessionId === item.id) {
    selectedSessionTitle = next.trim();
    sessionTitle.textContent = selectedSessionTitle;
  }
  await fetch("/api/session-action", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "rename", id: item.id, title: next.trim() }),
  }).catch(() => {});
  loadSessions();
}

async function togglePinSession(item) {
  if (pinnedSessions.has(item.id)) pinnedSessions.delete(item.id);
  else pinnedSessions.add(item.id);
  writePinnedSessions();
}

async function archiveSession(item) {
  if (!window.confirm(`删除/归档对话「${getSessionTitle(item)}」？`)) return;
  hiddenSessions.add(item.id);
  writeHiddenSessions();
  if (selectedSessionId === item.id) {
    selectedSessionId = null;
    selectedSessionTitle = "Live TUI";
  }
  await fetch("/api/session-action", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "archive", id: item.id }),
  }).catch(() => {});
  loadSessions();
}

async function loadSessions() {
  try {
    const res = await fetch("/api/sessions");
    const data = await res.json();
    sessions = data.sessions || [];
    const current = sessions.find((item) => item.current);
    if (current) hiddenSessions.delete(current.id);
    if ((!selectedSessionId || !sessions.some((item) => item.id === selectedSessionId)) && current) {
      selectedSessionId = current.id;
      selectedSessionTitle = getSessionTitle(current);
      sessionTitle.textContent = selectedSessionTitle;
      await loadSession(current.id);
    }
    renderSessions();
  } catch {
    sessions = [];
    renderSessions();
  }
}

function refreshAfterPrompt(attempt = 0) {
  clearTimeout(sessionRefreshTimer);
  sessionRefreshTimer = setTimeout(async () => {
    await loadSessions();
    if (selectedSessionId) await loadSession(selectedSessionId);
    if (attempt < 8) refreshAfterPrompt(attempt + 1);
  }, [500, 900, 1400, 2200, 3200, 4600, 6500, 8500, 11000][attempt] || 12000);
}

async function loadHealth() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    backendBadge.textContent = `${data.backend} · ${data.deepseek_tui_bin}`;
    workspaceBadge.textContent = data.cwd;
  } catch {
    backendBadge.textContent = "offline";
  }
}

function sendPrompt(prompt) {
  const text = prompt.trim();
  if (!text) return;
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    setStatus("Disconnected - reconnect before sending");
    return;
  }
  thinkingPanel.classList.add("open");
  thinkingState.textContent = "waiting";
  thinkingBody.textContent = "等待 DeepSeek 开始流式思考。";
  send({ type: "input", data: text });
  setTimeout(() => {
    send({ type: "input", data: "\r" });
  }, 650);
  const optimistic = {
    metadata: currentSession?.metadata || {},
    messages: [
      ...(currentSession?.messages || []),
      { role: "user", content: [{ type: "text", text }] },
      { role: "assistant", content: [{ type: "thinking", text: currentLang === "zh" ? "等待 DeepSeek 写入最终回答..." : "Waiting for DeepSeek to write the final answer..." }] },
    ],
  };
  renderStructuredSession(optimistic);
  thinkingPanel.classList.add("open");
  thinkingState.textContent = "waiting";
  thinkingBody.textContent = "等待 DeepSeek 开始流式思考。";
  refreshAfterPrompt();
}

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(fitAndResize, 80);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".session-row")) closeSessionMenus();
});

document.querySelectorAll("[data-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(`#${button.dataset.toggle}`).classList.toggle("open");
  });
});

document.querySelectorAll(".rail-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".rail-item").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    loadUtilitySection(button.dataset.section);
  });
});

composerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendPrompt(composerInput.value);
  composerInput.value = "";
  composerInput.focus();
});

composerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.metaKey) {
    event.preventDefault();
    composerForm.requestSubmit();
  }
});

modelSelect.addEventListener("change", () => localStorage.setItem("deepseek-webui-model", modelSelect.value));
reasoningSelect.addEventListener("change", () => localStorage.setItem("deepseek-webui-reasoning", reasoningSelect.value));
modelSelect.value = localStorage.getItem("deepseek-webui-model") || modelSelect.value;
reasoningSelect.value = localStorage.getItem("deepseek-webui-reasoning") || reasoningSelect.value;
settingsModelSelect.innerHTML = modelSelect.innerHTML;
settingsModelSelect.value = modelSelect.value;
settingsModelSelect.addEventListener("change", () => {
  modelSelect.value = settingsModelSelect.value;
  localStorage.setItem("deepseek-webui-model", settingsModelSelect.value);
});
modelSelect.addEventListener("change", () => { settingsModelSelect.value = modelSelect.value; });

reconnectButton.addEventListener("click", connect);
newSessionButton.addEventListener("click", () => {
  selectedSessionId = null;
  selectedSessionTitle = "New Session";
  freshNext = true;
  connect();
  renderStructuredSession({ metadata: {}, messages: [] });
  renderSessions();
});
refreshSessionsButton.addEventListener("click", loadSessions);
sessionSearch.addEventListener("input", renderSessions);
themeLightButton.addEventListener("click", () => applyTheme("light"));
themeDarkButton.addEventListener("click", () => applyTheme("dark"));
rawLogToggle.addEventListener("click", () => {
  messageList.classList.add("hidden");
  utilityPanel.classList.add("hidden");
  rawLogPanel.classList.remove("hidden");
  setTimeout(fitAndResize, 0);
});
closeSettings.addEventListener("click", closeSettingsDialog);
settingsDialog.addEventListener("click", (event) => { if (event.target === settingsDialog) closeSettingsDialog(); });
languageSelect.addEventListener("change", () => {
  currentLang = languageSelect.value;
  localStorage.setItem("deepseek-webui-lang", currentLang);
  applyI18n();
  renderSessions();
  if (currentSession) renderStructuredSession(currentSession);
});
themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));
rawLogSelect.addEventListener("change", () => {
  if (rawLogSelect.value === "open") {
    messageList.classList.add("hidden");
    utilityPanel.classList.add("hidden");
    rawLogPanel.classList.remove("hidden");
    setTimeout(fitAndResize, 0);
  } else {
    rawLogPanel.classList.add("hidden");
    messageList.classList.remove("hidden");
  }
});

applyTheme(currentTheme);
applyI18n();
applyLogo();
loadHealth();
loadSessions().finally(connect);
