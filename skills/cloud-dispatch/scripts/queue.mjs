#!/usr/bin/env node
/**
 * queue - park briefs that may ship to the cloud when the local session runs out of quota.
 *
 *   node queue.mjs --add <brief> --repo <path> --from <skill> [--allow-ahead]
 *                                                                queue a brief (needs `cloud_ok: true`);
 *                                                                --allow-ahead lets overflow ship it while the
 *                                                                repo's default branch is ahead of origin
 *   node queue.mjs --done <id>                                   the local worker finished it; never ship it
 *   node queue.mjs --list [--json]                               every item, oldest first
 *
 * Why it exists: overflow.mjs ships queued briefs unattended when a session stops on a rate
 * limit, so the decision that a brief is safe to run without a human must be made earlier, by
 * whoever wrote it - that is what `cloud_ok: true` in the brief's frontmatter records, and this
 * script refuses a brief without it. `--done` exists so work a local worker already finished is
 * never paid for twice.
 *
 * Exit codes: 0 ok, 1 refused, 2 usage. Builtins only; imports only its own lib/.
 */
import { EXIT_OK, EXIT_REFUSED, EXIT_USAGE, queueAdd, queueDone, listItems, registryDir, parseArgs } from './lib/core.mjs';

const opts = parseArgs(process.argv.slice(2));
const die = (msg, code = EXIT_USAGE) => { console.error(`cloud-queue: ${msg}`); process.exit(code); };
const str = (k) => (typeof opts[k] === 'string' ? opts[k] : undefined);

if (opts.add !== undefined) {
  if (!str('add')) die('--add <brief> needs a file');
  if (opts.repo === true || opts.from === true) die('--repo and --from need values');
  const r = queueAdd({ briefPath: str('add'), repo: str('repo'), from: str('from'), allowAhead: Boolean(opts['allow-ahead']) });
  if (!r.ok) die(`refused: ${r.reason}`, EXIT_REFUSED);
  console.log(r.id);
  process.exit(EXIT_OK);
}

if (opts.done !== undefined) {
  if (!str('done')) die('--done <id> needs an id');
  const r = queueDone({ id: str('done') });
  if (!r.ok) die(`refused: ${r.reason}`, EXIT_REFUSED);
  console.log(`${r.item.id} done`);
  process.exit(EXIT_OK);
}

if (opts.list) {
  const items = listItems(registryDir());
  if (opts.json) { console.log(JSON.stringify(items, null, 2)); process.exit(EXIT_OK); }
  if (!items.length) { console.log('the cloud queue is empty'); process.exit(EXIT_OK); }
  for (const i of items) {
    const extra = i.dispatch_id ? ` -> ${i.dispatch_id}` : i.reason ? ` (${i.reason})` : '';
    console.log(`${i.id}  ${String(i.state).padEnd(10)} ${i.from ?? '-'}  ${i.brief_path}${extra}`);
  }
  process.exit(EXIT_OK);
}

die('usage: queue.mjs --add <brief> --repo <path> --from <skill> [--allow-ahead] | --done <id> | --list [--json]');
