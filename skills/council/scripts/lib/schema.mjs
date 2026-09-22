// schema - validate a result document against the contract the consuming door enforces.
//
// The door on the other side refuses a bad file and leaves no marker, which is correct
// and also silent. So the producer validates first, with the SAME closed sets, and says
// which field is wrong while the run that wrote it is still in memory.
//
// Two rules are worth naming because a generic validator would not have them:
//  - every closed set is closed HERE too. An unknown enum value is a failure, never a
//    pass-through, because the consumer's CHECK constraint will reject it at 3am instead.
//  - `outcome` may not be an admitting value. There is no `approved` in the set, and a
//    result claiming one is a method that decided something only a person may decide.

import {
  OUTCOMES, DIMENSION_STATES, DIMENSION_KINDS, TRUST_STATES, CONFIDENCES, SEVERITIES,
  HARD_FAILURE_CODES, PROOFS, SUBJECT_KINDS, SCORING_STATES,
  SCENARIO_STATES, SCENARIO_PROOFS,
} from './aggregate.mjs';

export const SCHEMA_VERSION = 1;
export const RUBRIC_VERSIONS = ['feature-v1', 'architecture-v1'];
export const EVIDENCE_KINDS = ['file', 'url', 'screenshot', 'video', 'metric'];

const isStr = (v) => typeof v === 'string' && v.length > 0;
const isNum01 = (v) => typeof v === 'number' && v >= 0 && v <= 1;

export function validateResult(doc) {
  const p = [];
  const fail = (m) => p.push(m);
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return ['result: not a JSON object'];

  if (doc.schema_version !== SCHEMA_VERSION) fail(`schema_version must be ${SCHEMA_VERSION}, found ${JSON.stringify(doc.schema_version)}`);
  if (!isStr(doc.run_id)) fail('run_id is required');
  if (!doc.subject || typeof doc.subject !== 'object') fail('subject is required');
  else {
    if (!SUBJECT_KINDS.includes(doc.subject.kind)) fail(`subject.kind must be one of ${SUBJECT_KINDS.join(', ')}`);
    for (const k of ['slug', 'title', 'summary']) if (!isStr(doc.subject[k])) fail(`subject.${k} is required`);
  }
  if (!RUBRIC_VERSIONS.includes(doc.rubric_version)) fail(`rubric_version must be one of ${RUBRIC_VERSIONS.join(', ')}`);
  if (!Number.isInteger(doc.round_no) || doc.round_no < 1) fail('round_no must be an integer >= 1');
  if (doc.supersedes_run_id !== null && !isStr(doc.supersedes_run_id)) fail('supersedes_run_id must be a string or null');
  if (!TRUST_STATES.includes(doc.trust_state)) fail(`trust_state must be one of ${TRUST_STATES.join(', ')}`);

  const r = doc.receipt;
  if (!r || typeof r !== 'object') fail('receipt is required');
  else {
    if (r.head_sha !== null && !isStr(r.head_sha)) fail('receipt.head_sha must be a string or null');
    if (!Array.isArray(r.spanned_paths) || !r.spanned_paths.length) fail('receipt.spanned_paths must be a non-empty array');
    else for (const sp of r.spanned_paths) {
      if (!isStr(sp)) fail('receipt.spanned_paths holds a non-string');
      else if (/^([A-Za-z]:[\\/]|\/)/.test(sp) || sp.split('/').includes('..')) fail(`receipt.spanned_paths: ${sp} is absolute or escapes the root`);
    }
    if (!/^[0-9a-f]{64}$/.test(String(r.span_digest ?? ''))) fail('receipt.span_digest must be 64 hex characters');
  }

  if (!Array.isArray(doc.hard_failures)) fail('hard_failures must be an array');
  else for (const h of doc.hard_failures) {
    if (!HARD_FAILURE_CODES.includes(h?.code)) fail(`hard_failures: unknown code ${JSON.stringify(h?.code)}`);
    if (!isStr(h?.detail)) fail('hard_failures: every entry needs a detail');
  }

  if (!Array.isArray(doc.dimensions) || !doc.dimensions.length) fail('dimensions must be a non-empty array');
  else {
    const seen = new Set();
    for (const d of doc.dimensions) {
      const name = isStr(d?.dimension) ? d.dimension : '<unnamed>';
      if (seen.has(name)) fail(`dimensions: ${name} appears twice`);
      seen.add(name);
      if (!DIMENSION_KINDS.includes(d?.kind)) fail(`${name}: kind must be one of ${DIMENSION_KINDS.join(', ')}`);
      if (!DIMENSION_STATES.includes(d?.state)) fail(`${name}: state must be one of ${DIMENSION_STATES.join(', ')}`);
      if (SCORING_STATES.has(d?.state)) {
        if (!isNum01(d.score)) fail(`${name}: a ${d.state} dimension needs a score in 0..1`);
      } else if (d?.score !== null) {
        fail(`${name}: a ${d?.state} dimension must carry score null - an unmeasured dimension is never a zero`);
      }
      if (!CONFIDENCES.includes(d?.confidence)) fail(`${name}: confidence must be one of ${CONFIDENCES.join(', ')}`);
      if (d?.floor !== null && !isNum01(d?.floor)) fail(`${name}: floor must be a number in 0..1 or null`);
      if (typeof d?.floor_hit !== 'boolean') fail(`${name}: floor_hit must be a boolean`);
      if (typeof d?.advisory !== 'boolean') fail(`${name}: advisory must be a boolean`);
      if (d?.state === 'unmeasured' && !isStr(d?.unmeasured_reason)) fail(`${name}: unmeasured needs unmeasured_reason`);
      for (const f of d?.findings ?? []) {
        if (!isStr(f?.id)) fail(`${name}: a finding has no id`);
        if (!SEVERITIES.includes(f?.severity)) fail(`${name}: finding ${f?.id}: severity must be one of ${SEVERITIES.join(', ')}`);
        if (!isStr(f?.title)) fail(`${name}: finding ${f?.id}: title is required`);
        if (!Number.isInteger(f?.recurrence) || f.recurrence < 1) fail(`${name}: finding ${f?.id}: recurrence must be an integer >= 1`);
      }
      for (const e of d?.evidence ?? []) {
        if (!EVIDENCE_KINDS.includes(e?.kind)) fail(`${name}: evidence kind must be one of ${EVIDENCE_KINDS.join(', ')}`);
        if (!isStr(e?.ref)) fail(`${name}: evidence needs a ref`);
      }
      for (const t of d?.techniques ?? []) {
        if (!isStr(t?.subject) || !isStr(t?.technique)) fail(`${name}: a technique needs subject and technique slugs`);
        if (!PROOFS.includes(t?.proof)) fail(`${name}: technique ${t?.technique}: proof must be one of ${PROOFS.join(', ')}`);
      }
      if (d?.delta !== null && typeof d?.delta !== 'number') fail(`${name}: delta must be a number or null`);
    }
  }

  // scenarios + envelope - optional, and optional TOGETHER. `schema_version` stays 1: an
  // absent array means no scenarios were measured, which a consumer of the old contract
  // reads correctly by ignoring a key it does not know.
  if (doc.scenarios !== undefined) {
    if (doc.subject?.kind !== 'use_case') fail('scenarios: only a use_case subject may carry scenarios - a redesign has no user branches of its own');
    if (!Array.isArray(doc.scenarios)) fail('scenarios must be an array when present');
    else {
      const seen = new Set();
      for (const s of doc.scenarios) {
        const slug = isStr(s?.slug) ? s.slug : '<unnamed>';
        if (!isStr(s?.slug)) fail('scenarios: an entry has no slug');
        else if (seen.has(slug)) fail(`scenarios: ${slug} appears twice`);
        seen.add(slug);
        if (!isStr(s?.title)) fail(`scenarios: ${slug}: title is required`);
        if (!s?.axes || typeof s.axes !== 'object' || Array.isArray(s.axes)) fail(`scenarios: ${slug}: axes must be a flat object`);
        else for (const [k, v] of Object.entries(s.axes)) if (typeof v !== 'string') fail(`scenarios: ${slug}: axis ${k} must be a string`);
        if (!SCENARIO_STATES.includes(s?.state)) fail(`scenarios: ${slug}: state must be one of ${SCENARIO_STATES.join(', ')}`);
        if (s?.state === 'measured') {
          if (!isNum01(s.score)) fail(`scenarios: ${slug}: a measured scenario needs a score in 0..1`);
        } else if (s?.score !== null) {
          fail(`scenarios: ${slug}: an unmeasured scenario must carry score null - never a zero`);
        }
        if (!CONFIDENCES.includes(s?.confidence)) fail(`scenarios: ${slug}: confidence must be one of ${CONFIDENCES.join(', ')}`);
        if (s?.n !== null && !(Number.isInteger(s?.n) && s.n >= 1)) fail(`scenarios: ${slug}: n must be an integer >= 1 or null`);
        if (!SCENARIO_PROOFS.includes(s?.proof)) fail(`scenarios: ${slug}: proof must be one of ${SCENARIO_PROOFS.join(', ')}`);
        if (typeof s?.summary !== 'string') fail(`scenarios: ${slug}: summary must be a string`);
      }
    }
    if (doc.envelope === undefined) fail('scenarios without an envelope: the per-scenario view and the envelope are written together');
  } else if (doc.envelope !== undefined) {
    fail('envelope without scenarios: an envelope with nothing behind it is a claim about branches nobody listed');
  }
  if (doc.envelope !== undefined) {
    const keys = ['holds', 'weak', 'unmeasured', 'out_of_scope', 'proposed'];
    if (!doc.envelope || typeof doc.envelope !== 'object' || Array.isArray(doc.envelope)) fail('envelope must be an object');
    else {
      for (const k of keys) {
        if (!Array.isArray(doc.envelope[k]) || doc.envelope[k].some((x) => !isStr(x))) fail(`envelope.${k} must be an array of slugs`);
      }
      for (const k of Object.keys(doc.envelope)) if (!keys.includes(k)) fail(`envelope: unknown bucket ${k}`);
    }
  }

  if (doc.overall !== null && !isNum01(doc.overall)) fail('overall must be a number in 0..1 or null');
  if (!isNum01(doc.coverage)) fail('coverage must be a number in 0..1');
  if (!OUTCOMES.includes(doc.outcome)) fail(`outcome must be one of ${OUTCOMES.join(', ')} - the set holds no admitting value, because the skill does not admit`);
  if (!Array.isArray(doc.must_address) || doc.must_address.some((m) => !isStr(m))) fail('must_address must be an array of strings');
  if (typeof doc.summary !== 'string') fail('summary must be a string');

  return p;
}
