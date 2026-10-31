#!/usr/bin/env node
// personas-door - reach a local Personas install WITHOUT the app running. Zero dependencies (node >= 22.5).
//
//   status   [--repo R]                      DB path, app up/down, project registered?, spool depth
//   sql      "<SELECT ...>"                  read-only query against the app database (JSON out)
//   ideas file --file cards.jsonl [--repo R] [--register] [--dry-run] [--no-spool] [--origin scan_sweep] [--out f]
//            list [--repo R] [--status pending] [--limit 50]
//   contexts refresh [--repo R] [--dry-run]  deterministic map refresh from git; flags contexts worth an LLM rescan
//            plan    [--repo R] [--only a,b] [--limit 12] packets for the flagged contexts (what the session LLM re-judges)
//            apply   --file patch.json [--tokens-est n] [--note s]
//            stats   [--repo R]              rescan yield + the thresholds it implies
//            sync    [--repo R]              give the app the map (declare door), spooled when it is down
//   sync                                     drain every spool (ideas, contexts, outcomes) through the app's doors
//                                            (outcomes are spooled by scan-sweep's `door.mjs outcome` when the app is down)
//
// Writes never touch the app database: they go through the app's HTTP door, or wait in ~/.personas/spool.
// Every invocation opportunistically drains the spool when the app is up (skip with --no-drain).
// Exit: 0 ok (spooled counts as ok: the work is durable), 1 a card failed, 2 bad arguments, 4 repo not registered
// (only with --no-spool), 5 no readable database.
import fs from 'node:fs';
import path from 'node:path';
import * as door from './lib/personas-door/door.mjs';
import * as ideas from './lib/personas-door/ideas.mjs';
import * as ctx from './lib/personas-door/contexts.mjs';
import * as outcomes from './lib/personas-door/outcomes.mjs';

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const opt = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const repo = path.resolve(opt('--repo', process.cwd()));
const out = (o) => console.log(JSON.stringify(o, null, 2));
const bad = (m) => { console.error(m); process.exitCode = 2; };

const [cmd, sub] = argv;

// --help anywhere: usage and exit 0 BEFORE any verb runs or the spool drains. personas cycle 2 (2026-10-30):
// `contexts refresh --help` ignored the flag and rewrote context-map.json - a help flag must never be a write.
if (has('--help') || has('-h')) {
  const src = fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n');
  const start = src.findIndex((l) => l.startsWith('//   status'));
  const end = src.findIndex((l, i) => i > start && !l.startsWith('//   '));
  console.log(['usage: personas-door <verb> [...]', ...src.slice(start, end).map((l) => l.slice(3))].join('\n'));
  process.exit(0);
}

async function drain() {
  if (has('--no-drain') || cmd === 'sync') return null;
  if (!door.pending('ideas').length && !door.pending('contexts').length && !door.pending('outcomes').length) return null;
  if (!(await door.appUp())) return null;
  const i = await ideas.sync(); const c = await ctx.syncPending(); const o = await outcomes.sync();
  return { ideas: i.drained, ideasLeft: i.left, contexts: c.length, outcomes: o.drained, outcomesLeft: o.left };
}

try {
  if (cmd === 'status') {
    const up = await door.appUp(); const p = await door.findProject(repo);
    out({ db: door.dbPath(), dbReadable: !!(await door.openRO()), appUp: up, repo, project: p ? { id: p.id, name: p.name } : null,
      spool: { ideas: door.pending('ideas').length, contexts: door.pending('contexts').length, outcomes: door.pending('outcomes').length }, map: fs.existsSync(ctx.mapPath(repo)) });
  } else if (cmd === 'sql') {
    out(await door.query(argv[1] ?? ''));
  } else if (cmd === 'ideas' && sub === 'file') {
    const f = opt('--file'); if (!f || !fs.existsSync(f)) { bad('ideas file: --file <cards.jsonl> required'); }
    else {
      const d = await drain();
      const { cards, unreadable } = ideas.parseCards(fs.readFileSync(f, 'utf8'));
      for (const u of unreadable) console.error(`line ${u.line}: ${u.error} - not filed, still owed`);
      const r = await ideas.file(cards, repo, { register: has('--register'), dryRun: has('--dry-run'), spool: !has('--no-spool'), origin: opt('--origin', 'scan_sweep') });
      const results = [...r.results, ...unreadable.map((u) => ({ line: u.line, outcome: 'unreadable', error: u.error }))];
      if (opt('--out')) fs.writeFileSync(opt('--out'), results.map((x) => JSON.stringify(x)).join('\n') + '\n');
      const tally = ideas.tally(results);
      console.log(`${path.basename(repo)}: ${cards.length} cards via ${r.mode} -> ${Object.entries(tally).map(([k, v]) => `${v} ${k}`).join(', ') || 'nothing'}${d ? ` (drained ${d.ideas} earlier)` : ''}`);
      if (r.mode === 'spool') console.log('  queued durably in ~/.personas/spool; they reach Approvals the next time any session runs this tool with the app up');
      for (const x of results.filter((x) => x.outcome === 'error')) console.log(`  FAILED ${x.title}: ${x.error}`);
      const ok = results.every((x) => ideas.LANDED.has(x.outcome) || x.outcome === 'queued' || x.outcome === 'dry-run');
      process.exitCode = ok ? 0 : r.mode === 'none' || results.some((x) => x.outcome === 'unregistered') ? 4 : 1;
    }
  } else if (cmd === 'ideas' && sub === 'list') {
    out(await ideas.list(repo, { status: opt('--status'), limit: Number(opt('--limit', 50)) }));
  } else if (cmd === 'contexts') {
    await drain();
    if (sub === 'refresh') out(ctx.refresh(repo, { write: !has('--dry-run') }));
    else if (sub === 'plan') out(ctx.plan(repo, { names: opt('--only')?.split(','), limit: Number(opt('--limit', 12)) }));
    else if (sub === 'apply') {
      if (!opt('--file')) bad('contexts apply: --file patch.json required');
      else out(ctx.apply(repo, JSON.parse(fs.readFileSync(opt('--file'), 'utf8')), { tokensEst: opt('--tokens-est') ? Number(opt('--tokens-est')) : null, note: opt('--note', null) }));
    } else if (sub === 'stats') out(ctx.stats(repo));
    else if (sub === 'sync') out(await ctx.sync(repo));
    else bad('contexts: refresh | plan | apply | stats | sync');
  } else if (cmd === 'sync') {
    out({ ideas: await ideas.sync(), contexts: await ctx.syncPending(), outcomes: await outcomes.sync() });
  } else {
    bad('usage: personas-door <status|sql|ideas file|ideas list|contexts refresh|plan|apply|stats|sync|sync> (see header)');
  }
} catch (e) {
  console.error(e.message);
  process.exitCode = /no readable Personas database/.test(e.message) ? 5 : 1;
}
