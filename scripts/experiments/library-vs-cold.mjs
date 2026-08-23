#!/usr/bin/env node
/**
 * library-vs-cold — does reading a technique change what an independent model builds?
 *
 * Three design tasks, each run twice through the same model: COLD (the task alone) and
 * WITH-LIBRARY (the task, with one technique document in the system prompt). A blind
 * grader - the same model, shown the rubric but not the condition - marks each of seven
 * rules covered or absent and quotes its evidence. The raw answers are kept in the output
 * so a reviewer can overrule the grader; on 2026-08-23 one of seven "absent" verdicts was
 * a half (the cold design refused "skip the failed step" but not "mark it done anyway").
 *
 * What it measures, and what it does not: the rubric is the technique's own rules, so
 * this asks "does the document transfer?" (it did, 21/21) and "what does a strong model
 * not produce unprompted?" (7/21 - the incident-earned rules: id-less fallback, retry vs
 * replay, a fleet-wide retry budget, warn-once logging, a persisted failed-at mark, the
 * error's required fields, the explicit refusals). It does not reward anything good in a
 * cold answer that the rubric did not ask for. n=3 tasks, one model family.
 *
 * First measured 2026-08-23 (librarian run 2026-08-23-4): cold 14/21, with-library
 * 21/21, library answers shorter in all three tasks (992/1303, 1302/1321, 956/1256 words).
 *
 *   node scripts/experiments/library-vs-cold.mjs            # writes $TEMP/oss-mastery/ab-experiment.json
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { callModel, fleetConfig } from '../lib/fleet.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const R = path.join(ROOT, 'knowledge', 'software-engineering');
const TASKS = [
  {
    id: 'webhook-dedup',
    task: 'You are designing the inbound webhook ingress for a SaaS backend that receives at-least-once deliveries from several third-party senders (payment processor, git host, CRM). Specify how you will prevent one external delivery from being processed twice, including the identity you key on, what you answer the sender, what happens under concurrent duplicate arrivals, how the mechanism behaves when its own storage is unavailable, how memory is bounded, and what you measure. Be concrete and decisive; this is a design you will implement.',
    technique: `${R}/backend-platform/resilience/webhook-ingestion/techniques/duplicate-and-replay-dedup.md`,
    rules: [
      'Keys dedup on the sender-minted delivery id, namespaced by source (not the bare id)',
      'Falls back to a content digest bounded by a time window when the sender provides no id',
      'Mark-and-mint is atomic via a uniqueness-enforced write, not read-then-write',
      'A duplicate is acknowledged to the sender as SUCCESS, not an error',
      'When the dedup store/lookup itself fails, the delivery is REFUSED (fail closed), relying on sender retry',
      'Distinguishes sender retries from replay attacks and names a signed-timestamp window as the durable defense for old replays',
      'Dedup memory is bounded by age sized past the retry horizon, and duplicates are COUNTED per source',
    ],
  },
  {
    id: 'retry-storm',
    task: 'You are adding retries with backoff to an internal service that calls a flaky third-party provider at roughly 10,000 requests per second across a fleet of 40 instances, with three internal layers between the user request and the provider call. Specify the retry design end to end: where retries live, how many, how delays are computed, what bounds the aggregate during a provider outage, what happens when the provider recovers, how per-key state is kept from leaking, what gets logged, and how a refusal to retry is reported. Be concrete and decisive.',
    technique: `${R}/backend-platform/resilience/retry-backoff/techniques/storm-control.md`,
    rules: [
      'Retries live at ONE layer per failure domain; outer layers do not add their own ladder (names the amplification of stacked layers)',
      'A fleet-wide retry BUDGET caps retries as a fraction of recent request volume, with denial as a policy outcome',
      'Delays are JITTERED, with the explicit reason that deterministic delays preserve synchronization',
      'Recovery is PACED (bounded admission per tick), not a floodgate releasing the herd at once',
      'Per-key retry/breaker state is bounded at creation by TTL or size cap with safe eviction',
      'Logging is warn-once per key per episode with a suppressed-count summary at episode end',
      'Budget/pacing denials are spelled and counted distinctly from dependency failures and survive to the caller',
    ],
  },
  {
    id: 'migration-boot',
    task: 'You are writing the schema-migration runner that executes at startup of a desktop application with an embedded database, unattended, on thousands of user machines. Specify exactly how the runner behaves: what it does on a failing step, what outcomes a boot can report and how they differ, how the failed state is recorded, what the error must carry, what happens when the version ledger cannot be read, and which "helpful" behaviors you explicitly refuse to implement. Be concrete and decisive.',
    technique: `${R}/backend-platform/data-layer/migrations/techniques/error-propagation.md`,
    rules: [
      'Halts the chain on the first failing step; crashing at boot is treated as the safe direction',
      'Names three distinguishable boot outcomes: nothing pending / applied (which steps) / failed at step j',
      'Persists the failed verdict IN THE LEDGER (a durable failed-at mark) rather than only reporting it',
      'An unreadable ledger is reported as its own outcome, never as "nothing to do"',
      'The error carries: failing step, from/to version, operation in flight, the store error verbatim, snapshot location',
      'Refuses "continue past the failed step" and "log it but mark the step done" explicitly',
      'No in-boot retry loops (deterministic failure repeats); retry is next-boot via the ledger',
    ],
  },
];

// Fleet dispatcher with roster rotation and a per-call log. The first version bound itself to
// one model and spent 300s per attempt when that model started hanging instead of erroring.
const CFG = fleetConfig();
const ROSTER = CFG.models.length > 1 ? [...CFG.models].reverse() : CFG.models; // measured 2026-08-23: nemotron answered, the primary hung
const benched = new Set();
let calls = 0;
async function call(messages, maxTokens = 12000, label = '') {
  const system = messages.find(m => m.role === 'system')?.content;
  const user = messages.find(m => m.role === 'user')?.content;
  for (let attempt = 0; attempt < 6; attempt++) {
    const live = ROSTER.filter(m => !benched.has(m));
    const model = live[attempt % Math.max(1, live.length)] ?? ROSTER[0];
    const r = await callModel({ endpoint: CFG.endpoint, model, system, user, maxTokens, timeoutMs: 240000 });
    calls++;
    console.log(`  [call ${calls}] ${label} ${model} attempt ${attempt + 1}: ${r.ok ? `ok ${r.finish} ${r.content.length}ch ${Math.round(r.ms / 1000)}s` : `FAIL ${r.status} ${String(r.err).slice(0, 80)} ${Math.round(r.ms / 1000)}s`}`);
    if (r.ok && r.content) return r.content;
    if (!r.ok && r.status === 0 && r.ms > 200000) benched.add(model);
    await new Promise(s => setTimeout(s, 3000));
  }
  return '';
}

const grade = async (task, rules, answer) => {
  const rubric = rules.map((r, i) => `${i + 1}. ${r}`).join('\n');
  const txt = await call([{ role: 'user', content: `You are grading a design answer against a rubric. For EACH rule, decide whether the answer SUBSTANTIVELY specifies it (not merely mentions a related word). Quote up to 20 words from the answer as evidence, or write "absent".\n\nTASK GIVEN TO THE DESIGNER:\n${task}\n\nRUBRIC:\n${rubric}\n\nANSWER:\n${answer}\n\nRespond ONLY with JSON: {"rules":[{"n":1,"covered":true,"evidence":"..."},...]}` }], 12000, 'grade');
  const m = txt.match(/\{[\s\S]*\}/);
  try { return JSON.parse(m[0]).rules; } catch { return null; }
};

const out = [];
for (const t of TASKS) {
  const technique = readFileSync(t.technique, 'utf8');
  const [cold, withLib] = await Promise.all([
    call([{ role: 'user', content: t.task }], 12000, `${t.id}/cold`),
    call([{ role: 'system', content: `Before answering, read this technique document from your organisation's knowledge registry and apply it. State the rules you follow.\n\n${technique}` }, { role: 'user', content: t.task }], 12000, `${t.id}/lib`),
  ]);
  const [gc, gl] = await Promise.all([grade(t.task, t.rules, cold), grade(t.task, t.rules, withLib)]);
  const score = g => g ? g.filter(x => x.covered).length : -1;
  out.push({ id: t.id, roster: ROSTER, coldText: cold, libText: withLib, cold: { words: cold.split(/\s+/).length, score: score(gc), grades: gc }, lib: { words: withLib.split(/\s+/).length, score: score(gl), grades: gl }, n: t.rules.length });
  console.log(`${t.id.padEnd(16)} cold ${score(gc)}/${t.rules.length} (${cold.split(/\s+/).length}w)   with-library ${score(gl)}/${t.rules.length} (${withLib.split(/\s+/).length}w)`);
  for (let i = 0; i < t.rules.length; i++) {
    const a = gc?.[i]?.covered ? 'Y' : '.'; const b = gl?.[i]?.covered ? 'Y' : '.';
    console.log(`   rule ${i + 1}: cold ${a}  lib ${b}   ${t.rules[i].slice(0, 70)}`);
  }
}
const OUT = path.join(process.env.TEMP || process.env.TMPDIR || '.', 'oss-mastery');
mkdirSync(OUT, { recursive: true });
writeFileSync(path.join(OUT, 'ab-experiment.json'), JSON.stringify(out, null, 2));
const tc = out.reduce((a, x) => a + x.cold.score, 0), tl = out.reduce((a, x) => a + x.lib.score, 0), tn = out.reduce((a, x) => a + x.n, 0);
console.log(`\nTOTAL: cold ${tc}/${tn}   with-library ${tl}/${tn}`);
