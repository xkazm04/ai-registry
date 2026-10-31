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
  const red = r.seeded_red === true && present(r.control_value) && r.control_run === 're-run' && present(r.control_cmd);
  const proof = {
    metric: r.metric, method: r.method, unit: r.unit, before: r.before, after: r.after, verdict,
    control: red ? 'red' : 'absent',
    control_value: red ? r.control_value : undefined, base_sha: r.base_sha ?? baseSha, head_sha: r.sha,
  };
  for (const k of Object.keys(proof)) if (!present(proof[k])) delete proof[k];
  return proof;
}
