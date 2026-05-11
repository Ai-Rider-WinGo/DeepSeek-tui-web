# 代码审查报告：Deepseek-Tui-web v0.3.4

> 审查方：DeepSeek TUI (deepseek-v4-pro)  
> 日期：2026-05-11  
> 审查范围：全部 6 个源文件 + 4 个文档

---

## 🔴 严重（3 项）

| # | 文件 | 问题 | 解决方案 |
|---|------|------|----------|
| 1 | server.js | `readJson` 无 body 大小限制，可 OOM | 加 `MAX_BODY = 64KB` 上限 |
| 2 | server.js | `findSessionFile` 空 `safeId` 匹配全部文件 | `safeId` 为空时返回 `null`，精确匹配不用 `startsWith` |
| 3 | tui_bridge.py | `stdin_buffer` 无上限增长 | 加 1MB 上限，超限断连 |

## 🟠 高（5 项）

| # | 文件 | 问题 | 解决方案 |
|---|------|------|----------|
| 4 | server.js | `handleSessionAction`/`runDeepSeek` 硬编码 `"deepseek"` | 统一使用 `DEEPSEEK_TUI_BIN` 环境变量 |
| 5 | server.js | `findSessionFile` 同步 `readdirSync` 阻塞事件循环 | 改用 `fs/promises.readdir` |
| 6 | server.js | WebSocket 无心跳/超时检测 | 加 `pingInterval` + `isAlive` 检测 |
| 7 | index.html | CDN 资源无 SRI，无 fallback | 加 `integrity` hash 或本地打包 xterm |
| 8 | style.css | `.xterm` 强制覆盖为比例字体 | 删除 `!important` 规则，保留 xterm 等宽字体 |

## 🟡 中（8 项）

| # | 文件 | 问题 | 解决方案 |
|---|------|------|----------|
| 9 | server.js | `activeTuis` Map 异常路径下不清理 | 加超时兜底清理 |
| 10 | server.js | CORS `*` + 无安全头 | 加 `x-content-type-options: nosniff` |
| 11 | tui_bridge.py | `os.write` 部分写入数据丢失 | 循环写入直到全部完成 |
| 12 | app.js | `inspectTuiOutput` 关键词匹配误报 | 改为匹配结构化 JSON 而非裸文本 |
| 13 | app.js | `loadUtilitySection` 重复绑定事件 | 使用 `{ once: true }` 或先移除旧监听 |
| 14 | app.js | `renderUtilityData` truncate 破坏 HTML 实体 | 截断末尾补全实体 |
| 15 | app.js | model select 值与选项不同步 | 检查值是否在 option 列表中再赋值 |
| 16 | app.js | `sendPrompt` 乐观更新无回滚 | WebSocket 失败时移除乐观消息 |

## 🟢 低（8 项）

| # | 文件 | 问题 | 解决方案 |
|---|------|------|----------|
| 17 | server.js | 错误响应泄露内部路径 | 生产环境脱敏 `error.message` |
| 18 | server.js | `recursive: true` 无深度限制 | 加递归深度上限 |
| 19 | tui_bridge.py | `time.sleep(0.05)` 多余 | 删除 |
| 20 | app.js | `window.prompt`/`confirm` 阻塞 | 替换为自定义模态框 |
| 21 | app.js | `currentSession` 全量内存存储 | 考虑分页或虚拟化 |
| 22 | style.css | 缺少 `:focus-visible` | 增加键盘焦点样式 |
| 23 | app.js | `FitAddon` 无加载检测 | 加全局变量存在性检查 |
| 24 | package.json | 无 test/lint 脚本 | 增加 ESLint + 基础测试 |

---

## 建议修复优先级

1. **第一轮（严重 3 项）** — body 大小限制、空 safeId 拦截、stdin_buffer 上限
2. **第二轮（高 5 项）** — 二进制路径统一、异步 I/O、WebSocket 心跳、CDN SRI、xterm 字体
3. **后续迭代** — 中/低问题逐步修复

总计：24 个问题
