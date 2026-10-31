// filing - one scan-sweep card (the SKILL.md section 9 finding shape, snake_case) -> the body of
// POST /dev-tools/ideas (Seam A1). Pure: no I/O but reading references/lenses.md once.
//
// Why a module of its own: the card used to lose most of itself on the way in. Scales were halved to
// 1-5 here and doubled back by the door (two exchange rates that had to stay inverse), and size, gate,
// result, method and lane were folded into the free-text `reasoning`, so Personas could not route,
// rank or verify by any of them. Now every scan-finding/1 field travels TOP-LEVEL, scales stay on
// their native 1-10 (the door normalizes once), and the stored score is computed here by score.mjs -
// never by the model in prose and never by the consumer.
//
// Wire casing: the door's existing keys stay snake_case (project_id, context_id, ...); every key the
// contract adds is camelCase (the door carries a snake_case alias for each). Absent = key omitted.
import { readFileSync } from 'node:fs';
import { scanScore, sizeToEffort } from './score.mjs';

const ENUMS = {
  category: ['technical', 'product'],
  confidence: ['low', 'medium', 'high'],
  band: ['ranked', 'reserve'],
  mvp_rule: ['top-score', 'override'],
  predicted_verdict: ['accept', 'reject', 'defer'],
  size: ['XS', 'S', 'M', 'L', 'XL'],
};
const PROOF_VERDICTS = ['better', 'not-better', 'inconclusive'];
const PROOF_CONTROLS = ['red', 'absent'];

/** snake_case card key -> camelCase wire key, for the keys the contract adds. */
const WIRE = {
  impact_why: 'impactWhy', confidence: 'confidence', band: 'band', mvp: 'mvp', mvp_rule: 'mvpRule',
  mvp_why: 'mvpWhy', predicted_verdict: 'predictedVerdict', predicted_why: 'predictedWhy',
  predicted_by: 'predictedBy', size: 'size', lane: 'lane', result: 'result', method: 'method', gate: 'gate',
  disposition: 'disposition', sweep_run_id: 'sweepRunId',
};
const camel = (k) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

let lensCats;
/** lens id -> its `Category:` line in references/lenses.md (the lens's default; a card may override). */
export function lensCategories() {
  if (lensCats) return lensCats;
  lensCats = new Map();
  try {
    const ref = readFileSync(new URL('../references/lenses.md', import.meta.url), 'utf8');
    for (const s of ref.split(/^(?=## [a-z-]+ )/m).filter((x) => x.startsWith('## '))) {
      const m = /^Category: (technical|product)\s*$/m.exec(s);
      if (m) lensCats.set(s.slice(3).split(' ')[0], m[1]);
    }
  } catch { /* no reference: categories stay whatever the card says */ }
  return lensCats;
}

/**
 * The finding's category under the contract's one-way rule: it is the lens's declared default, and a judge may
 * move it technical -> product, never product -> technical. Why: category picks the autonomy start (technical L2,
 * product L0), so a relabel was a way past the human gate - Dowser cycle 2 (2026-10-30) watched a fork mark a
 * product lens's cards technical and pre-triage decide them. A lens with no declaration keeps the card's value.
 * @returns {{category: string|undefined, clamped: boolean}}
 */
export function clampCategory(lens, category) {
  const declared = lens ? lensCategories().get(lens) : undefined;
  if (declared === 'product' && category === 'technical') return { category: 'product', clamped: true };
  return { category: category ?? declared, clamped: false };
}

const present = (v) => v !== undefined && v !== null && v !== '';
/** A card may carry a key snake_case (the finding shape) or camelCase (a converted wire body). */
const pick = (c, k) => (present(c[k]) ? c[k] : present(c[camel(k)]) ? c[camel(k)] : undefined);

/**
 * @param {object} c the card
 * @param {{projectId?: string, contexts?: Map<string,string>, runId?: string}} o
 * @returns {{ body: object, notes: string[] } | { error: string }}
 */
export function toFiling(c, { projectId = '<unregistered>', contexts = new Map(), runId } = {}) {
  const notes = [];
  const get = (k) => pick(c, k);
  const size = present(get('size')) ? String(get('size')).toUpperCase() : undefined;
  const cat = clampCategory(c.lens, get('category'));
  if (cat.clamped) notes.push(`category clamped technical -> product (lens ${c.lens} declares product)`);
  const fields = { category: cat.category, confidence: get('confidence'), band: get('band'), mvp_rule: get('mvp_rule'), predicted_verdict: get('predicted_verdict'), size };
  for (const [k, allowed] of Object.entries(ENUMS)) {
    if (present(fields[k]) && !allowed.includes(fields[k])) return { error: `${k} must be ${allowed.join('|')} (got ${JSON.stringify(fields[k])})` };
  }
  if (fields.mvp_rule === 'override' && !present(get('mvp_why'))) return { error: 'mvp_rule override needs mvp_why' };
  // A carry is approved and owed to this context's next round (SKILL.md section 9): it is never presented for a
  // decision, and the door refuses it (400). Refusing here keeps it owed in the hand-off file instead of erroring
  // per item at the door.
  if (get('disposition') === 'carry') return { error: 'disposition carry is owed to the next round, never handed to Approvals' };
  // Built, measured, then reverted (nothing landed - e.g. a reserve item built before rank.mjs allocated): the
  // contract's `proof` covers "a change was built", and `disposition: reverted` says the change is not in the tree.
  // Without the proof it is an ordinary backlog card wearing a claim, so it is refused (SKILL.md section 9.1).
  if (get('disposition') === 'reverted' && !present(get('proof'))) return { error: 'disposition reverted needs the proof of what was built (proof.head_sha = the reverted commit)' };

  let effort = get('effort');
  if (!present(effort) && size) { effort = sizeToEffort(size); notes.push(`effort from size ${size}`); }
  const impact = get('impact');
  const risk = get('risk');
  // Each present scale is checked on its own: scanScore only checks them when the card is scorable, so a lone
  // `impact: 12` without effort used to travel unvalidated (found 2026-10-30 writing the spool test).
  for (const [k, v] of Object.entries({ impact, effort, risk })) {
    if (present(v) && (!Number.isInteger(v) || v < 1 || v > 10)) return { error: `${k} must be an integer 1-10 (got ${JSON.stringify(v)})` };
  }
  let scored;
  try { scored = scanScore({ impact, confidence: fields.confidence, effort, risk }); } catch (e) { return { error: e.message }; }
  const given = get('score');
  if (present(given) && (!scored || given !== scored.score)) {
    notes.push(`card score ${given} ignored: score.mjs gives ${scored ? scored.score : 'unscored'}`);
  }

  const proof = get('proof');
  if (present(proof)) {
    if (typeof proof !== 'object' || !PROOF_VERDICTS.includes(proof.verdict)) return { error: `proof.verdict must be ${PROOF_VERDICTS.join('|')}` };
    if (present(proof.control) && !PROOF_CONTROLS.includes(proof.control)) return { error: `proof.control must be ${PROOF_CONTROLS.join('|')}` };
  }

  const lane = present(get('lane')) ? String(get('lane')).toUpperCase() : undefined;
  const head = lane === 'B'
    ? '> **Lane B - A/B-drainable.** An instrument can decide this. Accept = run `/scan-sweep --ab-only` on it; reject = drop it.\n\n'
    : '';
  const evidence = c.evidence ? `\n\n## Evidence\n${c.evidence}` : '';
  const source = get('source');

  const body = {
    project_id: projectId,
    title: c.title.trim().slice(0, 200),
    description: (head + (c.body || '') + evidence).slice(0, 6000),
    reasoning: ['scan-sweep hand-off', source ? `from ${source}` : null, notes.length ? notes.join('; ') : null].filter(Boolean).join(' - '),
    origin: 'scan_sweep',
  };
  const ctx = get('context');
  const contextId = ctx ? contexts.get(String(ctx).trim().toLowerCase()) : undefined;
  if (contextId) body.context_id = contextId;
  if (c.lens) body.lens = c.lens;
  if (fields.category) body.category = fields.category;
  // native 1-10, unhalved: the door normalizes once for its 1-5 display columns.
  if (present(impact)) body.impact = impact;
  if (present(effort)) body.effort = effort;
  if (present(risk)) body.risk = risk;
  if (scored) { body.score = scored.score; body.scoreParts = scored.score_parts; }
  for (const [k, w] of Object.entries(WIRE)) {
    const v = k === 'size' ? size : k === 'lane' ? lane : get(k);
    if (present(v)) body[w] = v;
  }
  const mvp = get('mvp');
  if (typeof mvp === 'boolean') body.mvp = mvp;
  if (!present(body.sweepRunId) && runId) body.sweepRunId = runId;
  if (present(proof)) body.proof = proof;
  const auto = get('auto_decide');
  if (typeof auto === 'boolean') body.autoDecide = auto;
  return { body, notes };
}

/**
 * A Lane B worker's return (references/ab-lane.md) -> the contract's `proof`, or undefined when
 * nothing was built (`fp`: Before did not reproduce; `demoted`: reverted at its honest size).
 * @param {object} r the worker JSON
 * @param {{base_sha?: string}} o the director's arm-A commit, when the worker did not report it
 */
export function proofFromAb(r, { base_sha: baseSha } = {}) {
  const verdict = { better: 'better', 'not-better': 'not-better', unmeasurable: 'inconclusive' }[r?.verdict];
  if (!verdict) return undefined;
  // A red control carries the reading the seeded control produced; without it the claim is unverifiable and the
  // contract (and the Personas door) refuse it, so it is honestly `absent`. And the reading must have been RE-TAKEN on
  // the reverted tree (`control_run: "re-run"` with its `control_cmd`): personas cycle 2 (2026-10-30) had two workers
  // report the base tree's pre-edit reading as the control, which shows nothing about the instrument going red.
  // This holds for every method - a grep or comment count is re-run on the reverted file like any test.
  const voided = voidControl(r);
  const red = !voided && r.seeded_red === true && present(r.control_value) && r.control_run === 're-run' && present(r.control_cmd);
  const proof = {
    metric: r.metric, method: r.method, unit: r.unit, before: r.before, after: r.after, verdict,
    control: red ? 'red' : 'absent',
    control_value: red ? r.control_value : undefined, base_sha: r.base_sha ?? baseSha, head_sha: r.sha,
    // Why the control is absent although the worker called it red; travels so the verify state can say it.
    void_control: r.seeded_red === true ? voided : undefined,
  };
  for (const k of Object.keys(proof)) if (!present(proof[k])) delete proof[k];
  return proof;
}

/**
 * The shapes a control takes when the reverted tree fails to LOAD the test rather than failing its assertion: the
 * new symbol is gone, so the import, the link or the compile breaks. Kept to symbol-resolution errors on purpose -
 * a type mismatch (TS2322, TS2739) can be the instrument itself (a typecheck card), a missing name never is.
 */
const MISSING_SYMBOL = [
  /does not provide an export named/i,
  /\bis not a function\b/i,
  /\bis not defined\b/i,
  /\bis not a constructor\b/i,
  /Cannot find (module|package|name)\b/i,
  /has no exported member/i,
  /\bTS(2304|2305|2307|2339|2551|2614|2724)\b/,
  /\berror\[E0(412|425|432|433|599)\]/,
  /cannot find (function|value|type|struct|macro|module)\b/i,
  /unresolved import/i,
  /\b(ImportError|ModuleNotFoundError|NameError)\b/,
  /has no attribute\b/i,
];

/**
 * Is this control void - did it fail only because the new symbol was missing? A worker that reverted B by deleting
 * the new function (rather than restoring the OLD behaviour behind the SAME signature) gets an import or compile
 * error: red, and proof of nothing (personas c2r2, 2026-10-31: 21a3a2b5 failed to import, 9d2e26fc to compile).
 * @returns {'missing-symbol'|'compile'|undefined}
 */
export function voidControl(r) {
  if (r?.control_failure === 'missing-symbol' || r?.control_failure === 'compile') return r.control_failure;
  const out = present(r?.control_value) ? String(r.control_value) : '';
  return MISSING_SYMBOL.some((re) => re.test(out)) ? 'missing-symbol' : undefined;
}

/**
 * A Lane B verdict -> the app's outcome for the idea (POST /dev-tools/ideas/{id}/outcome: delivered | declined |
 * blocked | already_delivered). `superseded` is a card made moot by a sibling card's merge in the same group
 * (personas c2r2: 16634bfc became true when d8397f84 merged and had to be filed `fp`): it closes as
 * `already_delivered` naming the sibling's commit - the app requires `commit` for that outcome - and it is never an
 * `fp` (abTally keeps it out of the five slots the self-correction reads).
 * @param {object} r the worker return plus the director's `merge` (the --no-ff merge sha) and, for superseded,
 *   `superseded_by` (the sibling idea id or sha) and `commit` (the sibling's merge sha)
 * @returns {{outcome: string, commit?: string, note?: string} | {error: string}}
 */
export function outcomeFor(r) {
  switch (r?.verdict) {
    case 'better': return present(r.merge) ? { outcome: 'delivered', commit: r.merge } : { outcome: 'delivered' };
    case 'not-better': case 'fp': return { outcome: 'declined' };
    case 'unmeasurable': case 'demoted': return { outcome: 'blocked' };
    case 'superseded': {
      if (!present(r.superseded_by)) return { error: 'superseded needs superseded_by (the sibling idea id or sha)' };
      if (!present(r.commit)) return { error: 'superseded needs commit (the sibling merge on the branch): already_delivered requires it' };
      return { outcome: 'already_delivered', commit: r.commit, note: `superseded by ${r.superseded_by} (merged ${r.commit})` };
    }
    default: return { error: `no outcome for verdict ${JSON.stringify(r?.verdict)}` };
  }
}

export const OUTCOMES = ['delivered', 'declined', 'blocked', 'already_delivered'];

/**
 * The body of POST /dev-tools/ideas/{id}/outcome (the app's IdeaOutcomeInput: outcome, note, branch, commit, pr_url),
 * validated here so a post that the app would refuse is never spooled as "durable". Pure.
 *
 * `figures` (the measured before/after/control the director read) and `choice` (an approved Lane C card's open
 * product choice that the director settled: {picked, rejected, why}) are extra keys the app ignores today, so the
 * choice is ALSO written into `note`, which the app keeps as the task's outcome block - the one place it survives.
 * @returns {{body: object} | {error: string}}
 */
export function toOutcome({ outcome, note, branch, commit, pr_url: prUrl, figures, choice } = {}) {
  if (!OUTCOMES.includes(outcome)) return { error: `outcome must be ${OUTCOMES.join('|')} (got ${JSON.stringify(outcome)})` };
  if (outcome === 'already_delivered' && !present(commit)) return { error: 'already_delivered requires commit (the commit that already satisfies the item)' };
  if (present(figures) && (typeof figures !== 'object' || Array.isArray(figures))) return { error: 'figures must be a JSON object' };
  if (present(choice)) {
    if (typeof choice !== 'object' || Array.isArray(choice) || !['picked', 'rejected', 'why'].every((k) => present(choice[k]))) {
      return { error: 'choice must be {picked, rejected, why}, all three present' };
    }
  }
  const choiceLine = present(choice) ? `choice: picked ${choice.picked} over ${choice.rejected} - ${choice.why}` : undefined;
  const body = {
    outcome,
    note: [present(note) ? String(note) : undefined, choiceLine].filter(Boolean).join('; ') || undefined,
    branch, commit, pr_url: prUrl,
    figures: present(figures) || present(choice) ? { ...(figures ?? {}), ...(present(choice) ? { choice } : {}) } : undefined,
  };
  for (const k of Object.keys(body)) if (!present(body[k])) delete body[k];
  return { body };
}

/**
 * ab.jsonl rows -> the snapshot's `ab` field (`better/not-better/unmeasurable/fp/demoted`, SKILL.md section 10) plus
 * `superseded` beside it. A superseded card's premise was true when dispatched, so it counts in none of the five
 * slots, least of all `fp`: the fp counter demotes the whole skill a level (section 5).
 */
export function abTally(rows) {
  const n = { better: 0, 'not-better': 0, unmeasurable: 0, fp: 0, demoted: 0, superseded: 0 };
  for (const r of rows ?? []) if (Object.hasOwn(n, r?.verdict)) n[r.verdict] += 1;
  return { ab: [n.better, n['not-better'], n.unmeasurable, n.fp, n.demoted].join('/'), fp: n.fp, superseded: n.superseded };
}
