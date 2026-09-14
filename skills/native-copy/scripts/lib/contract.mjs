// contract.mjs - load, validate and normalize docs/i18n/copy-contract.json. Builtins only.
//
// The contract records the DECLARED choices (variant, dash system, quotes, case per
// element class, termbase). The checker enforces only what is declared: an undeclared
// mechanic defaults to "any", because authorities genuinely contradict each other and
// the defect is mixing, not the choice. Schema: references/contract.md.

export const DEFAULT_HEADING_KEYS = '^(title|heading|headline|eyebrow|h[1-6])\\d*$|[a-z0-9](Title|Heading|Headline|Eyebrow)\\d*$';
export const DEFAULT_BUTTON_KEYS = '^(cta|button|btn|submit)\\d*$|[a-z0-9](Cta|CTA|Button|Btn)\\d*$';
export const DEFAULT_ERROR_KEYS = '(^|\\.)(errors?)(\\.|$)|(^|\\.)error[A-Z]\\w*$|[a-z](Error|Failed|Failure)\\w*$';

const KINDS = ['json-catalog', 'ts-module', 'jsx', 'mdx', 'markdown'];
const TOP_KEYS = new Set(['$schema', 'variant', 'spelling', 'sources', 'exclude', 'dash', 'quotes', 'ellipsis', 'case', 'terms', 'rules', 'baseline']);

const oneOf = (errors, where, value, allowed, dflt) => {
  if (value === undefined) return dflt;
  if (!allowed.includes(value)) { errors.push(`${where} must be one of ${allowed.map((a) => JSON.stringify(a)).join('|')}, got ${JSON.stringify(value)}`); return dflt; }
  return value;
};

const compile = (errors, where, src, dflt) => {
  const s = src === undefined ? dflt : src;
  try { return new RegExp(s); } catch (e) { errors.push(`${where} is not a valid regular expression: ${e.message}`); return new RegExp(dflt); }
};

/**
 * Normalize a parsed contract. Returns { contract, errors }. `knownRules` (optional)
 * validates the keys of `rules`.
 */
export function normalizeContract(raw, { knownRules = null } = {}) {
  const errors = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { contract: null, errors: ['contract must be a JSON object'] };
  for (const k of Object.keys(raw)) if (!TOP_KEYS.has(k) && !k.startsWith('_')) errors.push(`unknown top-level key ${JSON.stringify(k)} (keys starting with "_" are notes and ignored)`);

  const variant = raw.variant === undefined ? (errors.push('variant is required ("US" or "UK")'), 'US') : oneOf(errors, 'variant', raw.variant, ['US', 'UK'], 'US');
  const spelling = oneOf(errors, 'spelling', raw.spelling, ['standard', 'oxford'], 'standard');
  if (spelling === 'oxford' && variant !== 'UK') errors.push('spelling "oxford" only applies to variant "UK"');

  const sources = [];
  if (!Array.isArray(raw.sources) || raw.sources.length === 0) errors.push('sources must be a non-empty array of { path, kind }');
  else raw.sources.forEach((s, i) => {
    const p = s && (s.path ?? s.glob);
    if (typeof p !== 'string' || !p.trim()) { errors.push(`sources[${i}] needs a "path" (file or glob)`); return; }
    if (!KINDS.includes(s.kind)) { errors.push(`sources[${i}].kind must be one of ${KINDS.join('|')}, got ${JSON.stringify(s.kind)}`); return; }
    sources.push({ path: p, kind: s.kind });
  });

  const exclude = raw.exclude === undefined ? [] : raw.exclude;
  if (!Array.isArray(exclude) || exclude.some((e) => typeof e !== 'string')) errors.push('exclude must be an array of glob strings');

  const dashRaw = raw.dash ?? {};
  if (typeof dashRaw !== 'object') errors.push('dash must be an object { emDash }');
  const dash = { emDash: oneOf(errors, 'dash.emDash', dashRaw.emDash, ['allow', 'density', 'ban'], 'density') };

  const quotes = oneOf(errors, 'quotes', raw.quotes, ['curly', 'straight', 'any'], 'any');
  const ellipsis = oneOf(errors, 'ellipsis', raw.ellipsis, ['char', 'dots', 'any'], 'any');

  const caseRaw = raw.case ?? {};
  const kase = {
    style: oneOf(errors, 'case.style', caseRaw.style, ['sentence', 'title', 'any'], 'any'),
    headingKeys: compile(errors, 'case.headingKeys', caseRaw.headingKeys, DEFAULT_HEADING_KEYS),
    buttonKeys: compile(errors, 'case.buttonKeys', caseRaw.buttonKeys, DEFAULT_BUTTON_KEYS),
    errorKeys: compile(errors, 'case.errorKeys', caseRaw.errorKeys, DEFAULT_ERROR_KEYS),
  };

  const termsRaw = raw.terms ?? {};
  const accept = termsRaw.accept ?? [];
  const reject = termsRaw.reject ?? [];
  if (!Array.isArray(accept) || accept.some((t) => typeof t !== 'string' || !t.trim())) errors.push('terms.accept must be an array of non-empty strings');
  if (!Array.isArray(reject) || reject.some((r) => !r || typeof r.term !== 'string' || !r.term.trim() || typeof r.use !== 'string')) errors.push('terms.reject must be an array of { term, use }');

  const rules = {};
  const rulesRaw = raw.rules ?? {};
  if (typeof rulesRaw !== 'object' || Array.isArray(rulesRaw)) errors.push('rules must be an object { "EN-XXX": "error"|"warn"|"off" }');
  else for (const [id, sev] of Object.entries(rulesRaw)) {
    if (knownRules && !knownRules.includes(id)) { errors.push(`rules.${id}: unknown rule id (the checker implements ${knownRules.length}; run --list-rules)`); continue; }
    if (!['error', 'warn', 'off'].includes(sev)) { errors.push(`rules.${id} must be "error"|"warn"|"off", got ${JSON.stringify(sev)}`); continue; }
    rules[id] = sev;
  }

  const baseline = raw.baseline === undefined ? '.ai/copy-baseline.json' : raw.baseline;
  if (typeof baseline !== 'string' || !baseline.trim()) errors.push('baseline must be a path string');

  return {
    contract: {
      variant, spelling, sources, exclude: Array.isArray(exclude) ? exclude : [], dash, quotes, ellipsis, case: kase,
      terms: { accept: Array.isArray(accept) ? accept : [], reject: Array.isArray(reject) ? reject : [] },
      rules, baseline: typeof baseline === 'string' ? baseline : '.ai/copy-baseline.json',
    },
    errors,
  };
}

/** A permissive contract for tests and --init: defaults plus overrides, no sources required. */
export function contractFor(overrides = {}) {
  const { contract } = normalizeContract({ variant: 'US', sources: [{ path: 'x', kind: 'json-catalog' }], ...overrides });
  return contract;
}
