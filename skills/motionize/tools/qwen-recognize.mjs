#!/usr/bin/env node
/**
 * Qwen-VL image recognition via the OpenAI-compatible DashScope (Alibaba Model
 * Studio, intl) endpoint. Drop-in alternative to /leonardo's gemini-recognize.mjs
 * — same `--input <img> --prompt "..."` CLI — so motionize validates traces
 * Gemini-free on the free QWEN tier (1M tokens / 90 days per model).
 *
 * Mirrors the approach in the `pof` project (src/lib/anim-critique/qwen.ts):
 * primary qwen3.7-plus (thinking VL; we read `content`, not `reasoning_content`),
 * with qwen3.6-flash / qwen3.6-plus quota-fallbacks (separate quotas).
 *
 * Usage:
 *   node qwen-recognize.mjs --input path.png --prompt "Describe the shapes/colors" [--model qwen3.7-plus] [--json]
 * Env: QWEN_API_KEY (or DASHSCOPE_API_KEY). MOTIONIZE_FETCH_TIMEOUT_MS sets the
 * per-call deadline in ms (default 300000): a provider that accepts the connection and
 * never answers used to hang this tool forever. A timeout is not a quota error, so it
 * ends the run (no fall-through to the next model) like any other non-quota failure.
 */
import { readFileSync } from "fs";
import { extname } from "path";

const BASE = (process.env.QWEN_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1").replace(/\/+$/, "");
const QUOTA = /quota|arrearage|exceed|insufficient|throttl|rate.?limit|too many requests|allocated|free.?tier/i;
const TIMEOUT_MS = (() => { const n = Number(process.env.MOTIONIZE_FETCH_TIMEOUT_MS); return Number.isInteger(n) && n > 0 ? n : 300000; })();
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" };

function parseArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const k = argv[i].slice(2), n = argv[i + 1];
      if (n && !n.startsWith("--")) { a[k] = n; i++; } else a[k] = true;
    }
  }
  return a;
}
function fail(o) { console.error(JSON.stringify(o, null, 2)); process.exit(1); }

async function main() {
  const args = parseArgs(process.argv);
  const apiKey = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;
  if (!apiKey) fail({ error: "QWEN_API_KEY (or DASHSCOPE_API_KEY) not set" });
  if (!args.input || !args.prompt) fail({ error: 'Usage: --input <img> --prompt "..."' });

  const primary = args.model || process.env.QWEN_CRITIQUE_MODEL || "qwen3.7-plus";
  const fallbacks = ["qwen3.6-flash", "qwen3.6-plus"].filter((m) => m !== primary);
  const models = [primary, ...fallbacks];

  const buf = readFileSync(args.input);
  const mime = MIME[extname(args.input).toLowerCase()] || "image/png";
  const content = [
    { type: "image_url", image_url: { url: `data:${mime};base64,${buf.toString("base64")}` } },
    { type: "text", text: args.prompt },
  ];

  let lastErr = "";
  for (const model of models) {
    // One signal covers the request and the body read below.
    const signal = AbortSignal.timeout(TIMEOUT_MS);
    let res, json, body = "";
    try {
      res = await fetch(`${BASE}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: [{ role: "user", content }], temperature: 0.2, max_tokens: 4096 }),
        signal,
      });
      if (res.ok) json = await res.json();
      else body = await res.text().catch(() => "");
    } catch (e) {
      if (signal.aborted) fail({ error: `Qwen ${model}: no response within ${TIMEOUT_MS} ms` });
      throw e;
    }
    if (res.ok) {
      const text = json.choices?.[0]?.message?.content;
      if (text) {
        if (args.json) console.log(JSON.stringify({ success: true, model, text }, null, 2));
        else { process.stderr.write(`[qwen] ${model}\n`); console.log(text); }
        return;
      }
      lastErr = `empty response from ${model}`;
      continue;
    }
    lastErr = `Qwen ${model} HTTP ${res.status}: ${body.slice(0, 200)}`;
    process.stderr.write(`[qwen] ${lastErr}\n`);
    if (!(res.status === 429 || QUOTA.test(body))) fail({ error: lastErr });
    // quota/throttle -> next model (separate quota)
  }
  fail({ error: `all Qwen models exhausted. last: ${lastErr}` });
}
main();
