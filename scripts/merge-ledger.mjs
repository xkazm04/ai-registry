#!/usr/bin/env node
/**
 * merge-ledger - the git merge driver for this registry's shared ledgers.
 *
 * Why it exists. The shift door (scripts/shift-land.mjs) applies a lander's ledger lines as
 * fragments to HEAD's copy, so two landers on one checkout never conflict. Two MACHINES do:
 * on 2026-11-08 a door push rebased nine local commits onto seventeen from another session,
 * and git's text merge stopped on .claude/skills/intake/SCORECARD.md, librarian/sources/index.md
 * and librarian/harvest/backlog.jsonl, because both sides had appended rows at the same place.
 * Every one of those conflicts was two independent appends, which no line merge can order.
 *
 * So this driver merges the way the door lands: it reads what the incoming side (%B) did to the
 * base (%O) as a fragment, and applies that fragment to the current side (%A) with the door's own
 * `applyFragment`, so each ledger keeps its insertion rule (sources index under the `## Mined`
 * delimiter, newest first; tables and SCORECARD rows at the end; a LESSONS `## ` block at the end;
 * backlog rows by id).
 *
 * What it reads as the incoming side's change:
 *   - backlog.jsonl: every row whose id is new in %B, or whose line differs from %O's. A row %B
 *     removed is removed from %A only if %A still holds %O's line for it.
 *   - LESSONS.md: %B must be %O plus appended text; that text is the fragment.
 *   - the table ledgers: rows of %B not in %O, in %B's order, less any %A already holds.
 *     A row %B removed is removed from %A if present.
 * A real conflict exits 1, which git reports as an ordinary conflict: %A and %B both changed one
 * backlog id to different lines, a LESSONS edit that is not an append, or a fragment the door's
 * rule refuses. Nothing is guessed.
 *
 * Contract with git: no bytes on stdout. Exit 0 with the merged text written to %A, or exit 1.
 *
 * Installed by scripts/install-merge-driver.mjs as
 *   merge.registry-ledger.driver = node scripts/merge-ledger.mjs %O %A %B %P
 * and named in .gitattributes for exactly the paths `ledgerRule` knows.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyFragment, ledgerRule, FragmentRefusal } from './shift-land.mjs';

export class LedgerConflict extends Error {}

const lf = (t) => t.replace(/\r\n/g, '\n');
const lines = (t) => lf(t).split('\n');
const idOf = (line) => { try { return JSON.parse(line).id ?? null; } catch { return null; } };

function byId(text) {
  const m = new Map();
  for (const l of lines(text)) { const id = idOf(l); if (id) m.set(id, l); }
  return m;
}

/** Pure. The merged ledger text for `target`, or a LedgerConflict. */
export function mergeLedger(target, base, ours, theirs) {
  const rule = ledgerRule(target);
  if (!rule) throw new LedgerConflict(`${target} is not a shared ledger`);
  base = lf(base); ours = lf(ours); theirs = lf(theirs);
  if (theirs === base) return ours;
  if (ours === base) return theirs;

  if (rule === 'backlog') {
    const O = byId(base), A = byId(ours), B = byId(theirs);
    const changed = [];
    for (const [id, line] of B) {
      if (O.get(id) === line) continue;
      const a = A.get(id);
      if (a === line) continue; // both sides made the same change
      if (a !== undefined && O.has(id) && a !== O.get(id)) throw new LedgerConflict(`${target}: both sides changed row ${id}`);
      changed.push(line);
    }
    let out = ours;
    if (changed.length) {
      try { out = applyFragment(target, out, changed.join('\n')); } catch (e) {
        throw new LedgerConflict(e instanceof FragmentRefusal ? e.message : String(e));
      }
    }
    const gone = [...O.keys()].filter((id) => !B.has(id));
    if (gone.length) {
      const keep = [];
      for (const l of lines(out)) {
        const id = idOf(l);
        if (id && gone.includes(id)) {
          if (l !== O.get(id)) throw new LedgerConflict(`${target}: one side removed row ${id}, the other changed it`);
          continue;
        }
        keep.push(l);
      }
      out = keep.join('\n');
    }
    return out;
  }

  if (rule === 'lessons') {
    const head = base.replace(/\n+$/, '');
    if (!theirs.startsWith(head)) throw new LedgerConflict(`${target}: the incoming side did more than append`);
    const added = theirs.slice(head.length).replace(/^\n+/, '');
    if (!added.trim()) return ours;
    if (ours.includes(added.trim())) return ours;
    try { return applyFragment(target, ours, added); } catch (e) {
      throw new LedgerConflict(e instanceof FragmentRefusal ? e.message : String(e));
    }
  }

  // Table ledgers: sources index, applied.md, SCORECARD.
  const baseSet = new Set(lines(base));
  const theirSet = new Set(lines(theirs));
  const ourSet = new Set(lines(ours));
  const added = lines(theirs).filter((l) => l.trim() && !baseSet.has(l) && !ourSet.has(l));
  const removed = lines(base).filter((l) => l.trim() && !theirSet.has(l));
  let out = ours;
  if (added.length) {
    try { out = applyFragment(target, out, added.join('\n')); } catch (e) {
      throw new LedgerConflict(e instanceof FragmentRefusal ? e.message : String(e));
    }
  }
  if (removed.length) {
    const drop = new Set(removed);
    out = lines(out).filter((l) => !drop.has(l)).join('\n');
  }
  return out;
}

export function main(argv) {
  const [O, A, B, P] = argv;
  try {
    const target = String(P ?? '').split(path.sep).join('/');
    const merged = mergeLedger(target, fs.readFileSync(O, 'utf8'), fs.readFileSync(A, 'utf8'), fs.readFileSync(B, 'utf8'));
    fs.writeFileSync(A, merged);
    return 0;
  } catch (e) {
    process.stderr.write(`merge-ledger: ${e.message}\n`);
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
