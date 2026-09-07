/**
 * map-churn — what happens to a registry map's verdicts when the CONTEXT MAP moves.
 *
 * `build-registry-map.mjs` carries every judged pair forward across regenerations, keyed
 * by `<context key>|<subject>`. That key is the human string `c.id ?? "<group>/<name>"`,
 * and most context-map exports carry no `id` - so a renamed context is, to the join, a
 * deletion plus an unrelated arrival, and until 2026-09-06 every verdict on the old key
 * was dropped on the floor with no stat and no `--check` signal (`if (!row) continue;`).
 * A context-map rebuild could erase weeks of `/conform` work and the map looked fine.
 *
 * This module decides, for one project and one regeneration, which of four things each
 * previous context became:
 *
 *   matched   the key is in the current map                 -> verdicts carry (as before)
 *   renamed   absent, but a NEW context shares >= RENAME_OVERLAP of its recorded paths
 *             -> verdicts carry onto the new key, each pair `source: "renamed"` with
 *                `renamedFrom: <old key>`
 *   orphaned  absent and nothing adopts it                   -> its judged pairs move to the
 *             top-level `orphans[]` and STAY there across regenerations, until the key
 *             comes back, a rename adopts it, or the operator removes it
 *   arrived   the inverse: a current context the previous map did not have and no rename
 *             produced -> every pair `arrived: true` (unjudged, not stale - a different
 *             queue for `/conform`)
 *
 * The heuristic is deliberately crude and deliberately visible: overlap of PATHS, as the
 * map records them - the map caps a row's `paths` at 12 (the old side is the previous map's
 * row, the new side is the current row, both capped the same way), and a listed path that
 * no longer exists was already filtered out of both. So a rename whose files also moved
 * scores 0 and lands in `orphans[]`, which is the honest answer: nothing here can tell
 * "renamed and relocated" from "deleted and replaced", and a guess would attach verdicts
 * to code they were not written about. The threshold is high (0.6) for the same reason.
 *
 * When the export provides `id` on both sides the key IS the identity: a rename keeps its
 * id, so it matches as an ordinary pair and the path heuristic is skipped entirely. A key
 * that vanished under ids is a deletion, exactly.
 *
 * Nothing in here reads a file or writes one; the caller passes the previous document and
 * the freshly matched rows and gets back a plan. Zero dependencies.
 */

/** Share of the OLD context's recorded paths a new context must carry to be its rename. */
export const RENAME_OVERLAP = 0.6;

/**
 * A pair worth carrying across a regeneration: a verdict somebody paid to produce, or a
 * pairing somebody established by reading code (`/conform` adds those with `state:
 * "unknown"`). `renamed` is in the list because an inherited `conform` pair is rewritten
 * to `source: "renamed"` and must not be dropped on the NEXT regeneration for having lost
 * the word that used to protect it.
 */
export const isKeptPair = (s) =>
  (s.state && s.state !== 'unknown') || s.source === 'conform' || s.source === 'renamed';

const overlapRatio = (oldPaths, newPaths) => {
  if (!oldPaths.length) return 0;
  const have = new Set(newPaths);
  let n = 0;
  for (const p of oldPaths) if (have.has(p)) n += 1;
  return n / oldPaths.length;
};

/**
 * Reconcile the previous map against the current rows.
 *
 * @param {object|null} prev        the previous registry map document (null on a first build)
 * @param {Array<{context:string, name:string, group:string|null, paths:string[]}>} mapped
 *                                  the current rows, before verdicts are carried
 * @param {boolean} currentHasIds   the current context-map export carries `id` on its contexts
 * @returns {{
 *   prevPairs: Map<string, object>,   `<current key>|<subject>` -> the pair to carry (already
 *                                     rekeyed and annotated for renames)
 *   orphans: Array<{context, name, group, paths, subjects}>,
 *   renames: Array<{from:string, to:string, by:'id'|'paths', overlap:number}>,
 *   arrived: Set<string>,             current keys with no previous row and no rename
 * }}
 */
export function reconcileContexts(prev, mapped, currentHasIds) {
  const prevPairs = new Map();
  const orphans = [];
  const renames = [];
  const arrived = new Set();
  // A first build has no "previous" for anything to be absent from, so nothing arrives
  // and nothing can be orphaned: the map is born whole.
  if (!prev) return { prevPairs, orphans, renames, arrived };

  const current = new Map(mapped.map((r) => [r.context, r]));
  const prevRows = new Map();
  for (const r of prev.contexts ?? []) prevRows.set(r.context, r);
  // Previous orphans are still "vanished" rows: they may come back by key or be adopted
  // by a rename this time round. A row that is somehow in both lists is a context first.
  for (const o of prev.orphans ?? []) if (!prevRows.has(o.context)) prevRows.set(o.context, { ...o, _orphan: true });

  const vanished = [];
  for (const [key, row] of prevRows) {
    if (current.has(key)) continue;
    vanished.push({ key, row });
  }
  const newborn = [...current.keys()].filter((k) => !prevRows.has(k) || prevRows.get(k)._orphan);
  // (A key that was an orphan and is now a context is "back", not "arrived": its verdicts
  // re-attach below and it is excluded from the newborn set right after.)
  const back = new Set(newborn.filter((k) => prevRows.has(k)));
  const candidates = newborn.filter((k) => !back.has(k));

  // ---------------------------------------------------------- rename detection
  // The id fast path: ids on both sides make the key exact, and a vanished id is a
  // deletion. `contextKey` on the previous document says which kind of key it carried;
  // a document written before the field existed used `<group>/<name>`.
  const idsOnBothSides = currentHasIds && prev.contextKey === 'id';
  const adoptedNew = new Set();
  const adoptedOld = new Map(); // old key -> new key
  if (!idsOnBothSides && vanished.length && candidates.length) {
    const scored = [];
    for (const { key, row } of vanished) {
      const oldPaths = row.paths ?? [];
      for (const nk of candidates) {
        const overlap = overlapRatio(oldPaths, current.get(nk).paths ?? []);
        if (overlap >= RENAME_OVERLAP) scored.push({ from: key, to: nk, overlap });
      }
    }
    // Highest ratio first; ties break lexically (old key, then new key) so the plan is
    // the same on every machine. One old context adopts at most one new one and vice
    // versa - greedy in this order.
    scored.sort((a, b) => b.overlap - a.overlap || a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
    for (const s of scored) {
      if (adoptedOld.has(s.from) || adoptedNew.has(s.to)) continue;
      adoptedOld.set(s.from, s.to);
      adoptedNew.add(s.to);
      renames.push({ from: s.from, to: s.to, by: 'paths', overlap: Math.round(s.overlap * 100) / 100 });
    }
  }

  // ---------------------------------------------------------- the plan
  const carry = (key, pair) => prevPairs.set(`${key}|${pair.subject}`, pair);
  for (const [key, row] of prevRows) {
    const kept = (row.subjects ?? []).filter(isKeptPair);
    if (current.has(key)) {
      // Matched (or back from the orphan list): carry as-is. `arrived` is a one-generation
      // mark and must not ride along on a carried pair.
      for (const s of kept) { const { arrived: _a, ...rest } = s; carry(key, rest); }
      continue;
    }
    const to = adoptedOld.get(key);
    if (to) {
      for (const s of kept) { const { arrived: _a, ...rest } = s; carry(to, { ...rest, source: 'renamed', renamedFrom: key }); }
      continue;
    }
    if (!kept.length) continue;   // a vanished context with nothing paid for on it is just gone
    const { _orphan, ...orphanRow } = row;
    orphans.push({
      context: key,
      name: orphanRow.name ?? null,
      group: orphanRow.group ?? null,
      paths: orphanRow.paths ?? [],
      subjects: kept.map((s) => { const { arrived: _a, ...rest } = s; return rest; }),
    });
  }
  for (const nk of candidates) if (!adoptedNew.has(nk)) arrived.add(nk);

  return { prevPairs, orphans, renames, arrived };
}

/**
 * Print the churn report of an already-built map: what the last regeneration recorded
 * under `orphans[]`, on renamed rows and on arrived rows. Reads the document, not the
 * project - `/straighten` and `/project-populate` call this right after a rebuild.
 */
export function printChurn(slug, doc, log = console.log) {
  const st = doc.stats ?? {};
  log(`churn - ${slug} (map generated ${doc.generatedAt ?? '?'}, ${st.contexts ?? '?'} contexts, ${st.pairs ?? '?'} pairs)`);
  log(`  orphanedVerdicts=${st.orphanedVerdicts ?? 0}  renamedContexts=${st.renamedContexts ?? 0}  arrivedContexts=${st.arrivedContexts ?? 0}  staleVerdicts=${st.staleVerdicts ?? 0}`);
  const orphans = doc.orphans ?? [];
  log(`\n  orphans (${orphans.length}): contexts gone from context-map.json whose verdicts were kept`);
  for (const o of orphans) {
    const judged = o.subjects.filter((s) => s.state && s.state !== 'unknown').length;
    log(`    ${o.context}  ${o.subjects.length} pair(s), ${judged} judged  [${(o.paths ?? []).slice(0, 3).join(', ')}${(o.paths ?? []).length > 3 ? ', ...' : ''}]`);
  }
  const renamed = (doc.contexts ?? []).filter((r) => r.renamedFrom);
  log(`\n  renamed (${renamed.length}): contexts adopted by path overlap >= ${RENAME_OVERLAP} (or by id)`);
  for (const r of renamed) {
    const inherited = r.subjects.filter((s) => s.source === 'renamed').length;
    log(`    ${r.renamedFrom}  ->  ${r.context}  (${r.renameBy === 'id' ? 'by id' : `overlap ${r.renameOverlap}`}, ${inherited} pair(s) inherited)`);
  }
  const arrived = (doc.contexts ?? []).filter((r) => r.arrived);
  log(`\n  arrived (${arrived.length}): contexts the previous map did not have - unjudged, not stale`);
  for (const r of arrived) log(`    ${r.context}  ${r.subjects.length} pair(s): ${r.subjects.map((s) => s.subject).join(', ') || '-'}`);
  log('');
  log('  An orphan stays until its key returns, a rename adopts it, or you delete it by hand;');
  log('  `/conform` judges arrivals in its own pick order. Nothing here is a verdict.');
}
