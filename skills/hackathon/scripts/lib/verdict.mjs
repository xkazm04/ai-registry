// verdict.mjs - what the owner decided, and what wrap may therefore remove.
//
// WHY a fusion: the first hackathon's owner did not pick one entry. They kept one entry as the
// base, folded a second one's backend into it, deferred a third to a later package and left the
// fourth out, then handed the composed scope to /spark. 1.0.0 could only say --winner/--runner-up,
// and its wrap would have removed the worktree the follow-up still needed. A disposition per entry
// records the decision as it was made, and wrap keeps every tree the follow-up builds from.
// Pure: callers own the state file.

export const DISPOSITIONS = ['base', 'absorb', 'defer', 'drop'];
/** Dispositions whose worktree the follow-up builds from: wrap keeps them unless released. */
export const KEEP_TREE = new Set(['base', 'absorb']);

/** "e1=base,e2=absorb,e3=defer,e4=drop" -> { dispositions, problems }. Every entry must be named. */
export function parseFusion(text, entryIds) {
  const problems = [];
  const dispositions = {};
  const parts = String(text ?? '').split(',').map((x) => x.trim()).filter(Boolean);
  if (!parts.length) problems.push('--fuse names no entry (e1=base,e2=absorb,...)');
  for (const part of parts) {
    const m = part.match(/^(e\d+)\s*=\s*([a-z]+)$/i);
    if (!m) { problems.push(`"${part}" is not <entry>=<${DISPOSITIONS.join('|')}>`); continue; }
    const eid = m[1].toLowerCase();
    const d = m[2].toLowerCase();
    if (!entryIds.includes(eid)) { problems.push(`${eid} is not an entry (${entryIds.join(', ') || 'none'})`); continue; }
    if (!DISPOSITIONS.includes(d)) { problems.push(`${eid}=${d}: disposition is one of ${DISPOSITIONS.join(', ')}`); continue; }
    if (dispositions[eid]) { problems.push(`${eid} is named twice`); continue; }
    dispositions[eid] = d;
  }
  for (const eid of entryIds) if (!dispositions[eid] && parts.length) problems.push(`${eid} has no disposition - name it (drop, when the owner left it out)`);
  const bases = Object.entries(dispositions).filter(([, d]) => d === 'base').map(([e]) => e);
  if (bases.length > 1) problems.push(`more than one base (${bases.join(', ')}) - one entry is the base, the others absorb into it`);
  if (parts.length && !Object.values(dispositions).some((d) => KEEP_TREE.has(d))) problems.push('a fusion needs a base or an absorbed entry - otherwise close it (--close)');
  return { dispositions: problems.length ? {} : dispositions, problems };
}

/** The base entry of a fusion, or null. */
export const fusionBase = (dispositions) => Object.entries(dispositions ?? {}).find(([, d]) => d === 'base')?.[0] ?? null;

/** One-line verdict for the index, status and the vault note. */
export function verdictLabel(state, { titles = true } = {}) {
  const t = (eid) => (titles && state.entries?.[eid] ? ` ${state.entries[eid].title}` : '');
  if (state.dispositions && Object.keys(state.dispositions).length) {
    const order = (d) => DISPOSITIONS.indexOf(d);
    return `fusion: ${Object.entries(state.dispositions).sort((a, b) => order(a[1]) - order(b[1]) || a[0].localeCompare(b[0])).map(([eid, d]) => `${eid} ${d}`).join(', ')}`;
  }
  if (state.winner) return `winner ${state.winner}${t(state.winner)}${state.runner_up ? `, runner-up ${state.runner_up}` : ''}`;
  if (state.closed) return `closed: ${state.closed}`;
  return 'undecided';
}

/** { remove: [eid], keep: [{ eid, why }] } - what wrap removes. `release` frees the kept trees too. */
export function wrapPlan(state, { release = false } = {}) {
  const remove = [];
  const keep = [];
  for (const eid of Object.keys(state.entries ?? {})) {
    const d = state.dispositions?.[eid];
    const why = d ? (KEEP_TREE.has(d) ? d : null) : (eid === state.winner ? 'winner' : null);
    if (why && !release) keep.push({ eid, why }); else remove.push(eid);
  }
  return { remove, keep };
}
