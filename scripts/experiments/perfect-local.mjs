// Analysis-only /perfect harness for local models via the Pi coding agent (read-only tools).
// Runs scout -> draft -> challenge (the propose phase) against a THROWAWAY clone; it never builds or ships.
//
//   git clone --local <project> <scratch>/clone
//   node scripts/experiments/perfect-local.mjs --model qwen3.6:35b --context <context-name> //        --repo <scratch>/clone --out <scratch>/run [--stages scout,draft,challenge] [--timeout 40] [--thinking low]
//
// Prerequisites: Ollama serving the model with OLLAMA_CONTEXT_LENGTH>=65536; Pi installed
// (npm i -g --ignore-scripts @earendil-works/pi-coding-agent) with an "ollama" provider in
// its models.json; the project needs .claude/perfect/config.md and context-map.json.
// Pi's CLI is found via PI_CLI, else the global npm root.
//
// Pi facts this depends on: the default tool set is read,bash,edit,write and grep/find/ls are off
// by default, so the read-only set is "+grep,+find,+ls" with bash/edit/write excluded
// ("--tools read,grep,find,ls" leaves the model with NO tools); stdin must be closed or Pi waits on it;
// pass the task as ONE argument (a shell splits it). Output files: <stage>.md, .stats.json, .events.jsonl.
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const a = Object.fromEntries(process.argv.slice(2).reduce((r, v, i, arr) => (v.startsWith("--") ? [...r, [v.slice(2), arr[i + 1]]] : r), []));
const { model, context, repo, out } = a;
const stages = (a.stages || "scout,draft,challenge").split(",");
const piCli = process.env.PI_CLI || path.join(execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["root", "-g"], { encoding: "utf8", shell: process.platform === "win32" }).trim(), "@earendil-works/pi-coding-agent/dist/bundle/cli.js");
const timeoutMin = Number(a.timeout || 25);
fs.mkdirSync(out, { recursive: true });

const cfg = fs.readFileSync(path.join(repo, ".claude/perfect/config.md"), "utf8").split("\r\n").join("\n");
const section = (name) => (cfg.match(new RegExp(`## ${name}\\n([\\s\\S]*?)(?=\\n## |$)`)) || [, ""])[1].trim();
const map = JSON.parse(fs.readFileSync(path.join(repo, "context-map.json"), "utf8"));
const ctx = map.contexts.find((c) => c.name === context);
if (!ctx) throw new Error("unknown context " + context);

const law = ["Repo law", "Vetoes", "User taste", "Opportunity arcs"].map((s) => `### ${s}\n${section(s)}`).join("\n\n");
const system = `You are the Director of the /perfect direction-and-delivery loop, running ANALYSIS ONLY on the repository in the current directory.
Rules: you have read-only tools (read, grep, find, ls). Never try to modify anything. Do not implement. Do not ask the user questions - decide.
Every claim about the code must cite a file path AND symbol AND the exact line you saw it on. If you did not read it, do not claim it. Say what you did not read.
Trace behaviour across files, not only inside one: follow data lifecycles (created, capped, pruned, cached), failure paths (what a caller sees when a producer fails, times out or is evicted) and caches keyed on identity. A residual that only tidies one file is weak; prefer a gap in how two parts interact.
State every predicted effect as a hypothesis with the measurement that would confirm or refute it, and say when the direction should be dropped (for example "drop if the measured cost is negligible").
A component only "exists" if something renders/mounts it; a file with zero importers is a finding, not a feature.
"Near-polished, N small residuals" is a perfectly good verdict - never pad. Do not invent files.
Be concise. Final answer = the requested document only.

## Project law (from the overlay)
${law}`;
fs.writeFileSync(path.join(out, "system.md"), system);

const ctxBrief = `Context: ${ctx.name}
Description: ${ctx.description}
Entry points: ${JSON.stringify(ctx.entry_points)}
File paths: ${JSON.stringify(ctx.file_paths)}
Cross refs: ${JSON.stringify(ctx.cross_refs)}`;

const tasks = {
  scout: () => `PHASE P.2 - SCOUT. Produce a current-state brief of this context.
${ctxBrief}

Read the entry points and the main files above (use grep to find importers/mount points; use grep on docs/blueprint-ui.md for this context's rules - do NOT read that whole file, it is 110 KB).
Return markdown with sections: "What exists" (traced to a mount point), "What is rough" (dead ends, UX seams, perf smells, repo-law violations), "Residuals", each bullet with file:symbol(:line) evidence. Then a one-line verdict.
Also list the cross-file lifecycles and failure paths you traced (producer -> consumer), with the lines.
Read every entry point and as many of the listed files as you can; end with a line "Not read: ..." naming the listed files you did not open. Start your answer directly with the brief (no preamble).`,
  draft: (brief) => `PHASE P.3 - DRAFT up to 5 directions for this context, one per lens: feature, ux, optimization, robustness, wildcard. Count = what the evidence honestly supports; never pad.
Weight by User taste: outcome-value, not cosmetic churn. Each direction sized to ONE builder session (S/M/L; XL only as phase-1 slice).
${ctxBrief}

### Scout brief
${brief}

For each direction output exactly:
### N. <title> - <lens> - <size>
Why (user moment, one paragraph) / Evidence (file:symbol:line) / Files it will touch / Acceptance criteria (3-6 checkable bullets) / Risks and non-goals.
Predicted effects must be phrased as hypotheses to measure.
BEFORE writing each direction, verify its evidence with read/grep: cite only lines you have actually seen, and grep for an existing implementation of the idea first. Lens must be exactly one of feature | ux | optimization | robustness | wildcard (tests, guards and observability are robustness). Do not use one lens twice unless you say why. Directions that are only cosmetic (a glyph, a dot, a spinner, a colour) break the owner's taste rules; do not propose them. One direction = one change; do not bundle.`,
  challenge: (draft) => `PHASE P.4 - CHALLENGE. You are arguing against the slate below. For EACH direction, use grep/read to check:
1) Does the evidence line/symbol really exist and say what is claimed? 2) Does it already exist in code? 3) Does it break Repo law, a Veto, or an owner-taste rule? 4) Is the value claim concrete? 5) Can one builder session ship it?
Also reject any direction whose premise is contradicted by the scout brief itself, and any direction that only restates a guard that already exists (grep for the check script first).
Output a table-free list: per direction -> VERDICT (KEEP / REPLACE / DROP), the single check that decided it, and any correction. End with the final slate (KEEP ones, corrected) in the same format as the draft, plus a 3-line summary.
${ctxBrief}

### Draft slate
${draft}`,
};

function runPi(stage, prompt) {
  return new Promise((resolve) => {
    const pf = path.join(out, `${stage}.prompt.md`);
    fs.writeFileSync(pf, prompt);
    const args = ["--no-session", "--provider", "ollama", "--model", model, "--mode", "json", "--tools", "+grep,+find,+ls", "--exclude-tools", "bash,edit,write", "--thinking", a.thinking || "low", "--no-skills", "--no-extensions", "--append-system-prompt", path.join(out, "system.md"), `@${pf}`, "Carry out the task in the attached file."];
    const t0 = Date.now();
    const p = spawn(process.execPath, [piCli, ...args], { cwd: repo, stdio: ["ignore", "pipe", "pipe"] });
    let buf = "", raw = fs.createWriteStream(path.join(out, `${stage}.events.jsonl`));
    const ev = [];
    p.stdout.on("data", (d) => { raw.write(d); buf += d; let i; while ((i = buf.indexOf("\n")) >= 0) { const l = buf.slice(0, i).replace(/^﻿/, ""); buf = buf.slice(i + 1); try { ev.push(JSON.parse(l)); } catch {} } });
    let err = ""; p.stderr.on("data", (d) => (err += d));
    const killer = setTimeout(() => p.kill(), timeoutMin * 60000);
    p.on("close", () => {
      clearTimeout(killer); raw.end();
      const asst = ev.filter((e) => e.type === "message_end" && e.message?.role === "assistant");
      const calls = asst.flatMap((m) => (m.message.content || []).filter((c) => c.type !== "text" && c.type !== "thinking"));
      const last = asst[asst.length - 1];
      const text = (last?.message.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
      const usage = asst.reduce((u, m) => ({ input: u.input + (m.message.usage?.input || 0), output: u.output + (m.message.usage?.output || 0) }), { input: 0, output: 0 });
      const r = { stage, model, seconds: Math.round((Date.now() - t0) / 1000), turns: asst.length, toolCalls: calls.length, toolNames: [...new Set(calls.map((c) => c.name))], usage, chars: text.length, stderr: err.slice(0, 300) };
      fs.writeFileSync(path.join(out, `${stage}.md`), text);
      fs.writeFileSync(path.join(out, `${stage}.stats.json`), JSON.stringify(r, null, 1));
      console.log(JSON.stringify(r));
      resolve(text);
    });
  });
}

const read = (f) => (fs.existsSync(path.join(out, f)) ? fs.readFileSync(path.join(out, f), "utf8") : "");
let brief = read("scout.md"), draft = read("draft.md");
if (stages.includes("scout")) brief = await runPi("scout", tasks.scout());
if (stages.includes("draft")) draft = await runPi("draft", tasks.draft(brief));
if (stages.includes("challenge")) await runPi("challenge", tasks.challenge(draft));
