// rules.mjs - the deterministic EN rule set and the engine that runs it. Builtins only.
//
// Every rule is regex or wordlist - no model, no detector, no network. IDs match the
// registry's `english` subject in the `localization` bundle; the rule text, sources and
// exceptions live there, and a finding cites the ID so a reviewer can look it up.
//
// A rule is a record of DATA plus one function (copy-quality-gates/severity-as-declared-data,
// .../format-aware-check-catalog):
//   id, defaultSeverity ('error'|'warn'), fragmentSafe, raw?, fileLevel?
//   kind        - issue type from the market's vocabulary (RULE_KINDS); printed on every finding
//   granularity - 'word' (competes for its span), 'char' (typography) or 'unit' (whole string)
//   priority    - integer; resolves overlapping word-level findings (higher wins)
//   status      - 'on' | 'temp_off' (keeps data, guards and tests; never fires)
//   precision   - { value, sample, date, note }: accepted share the last time someone counted
//   guards      - [{ pattern, reason, seen, example, scope? }]: the known false positives, as data.
//                 A RegExp pattern is executable: a finding whose span overlaps a guard match is
//                 dropped (scope 'unit': any match drops every finding of the rule on that string).
//                 A string pattern documents an exception the rule's own test() implements.
//                 `example` is a string the rule must NOT flag - every guard is a negative control.
//   examples    - { hit: [...], clean: [...] }: positive fixtures and negative controls, run by
//                 tests/test_rule_catalog.mjs for every rule (the enumerating ratchet)
//   test(str, ctx) -> [{ index, length, message, suggestion?, severity? }]
// `fragmentSafe: false` rules are sentence-level and never run on fragments.

import { uniqueSpan } from './span.mjs';

export const RULE_KINDS = ['terminology', 'mistranslation', 'grammar', 'style', 'register', 'locale-convention', 'typography', 'markup', 'whitespace', 'redundancy', 'regionalism', 'inclusive-language', 'usage'];

// ------------------------------------------------------------------ helpers

const W = (s) => String(s).trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

function scan(str, re, make = () => ({})) {
  const out = [];
  const rx = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
  let m;
  while ((m = rx.exec(str))) {
    const r = make(m);
    if (r) out.push({ index: m.index + (r.offset || 0), length: r.length ?? m[0].length, message: r.message, suggestion: r.suggestion, severity: r.severity });
    if (m[0].length === 0) rx.lastIndex++;
  }
  return out;
}

const phrase = (patterns, message, suggest) => (str) => patterns.flatMap((re) => scan(str, re, (m) => ({ message: typeof message === 'function' ? message(m) : message, suggestion: suggest ? suggest(m) : undefined })));

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordRe = (term, flags = 'giu') => new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRe(term)}(?![\\p{L}\\p{N}_])`, flags);

const matchCase = (src, repl) => {
  if (src === src.toUpperCase() && src.length > 1) return repl.toUpperCase();
  if (src[0] === src[0].toUpperCase()) return repl[0].toUpperCase() + repl.slice(1);
  return repl;
};

const uncounted = { value: null, sample: null, date: null, note: 'uncounted' };

/** Guard matches of one rule in one string: [{ index, length, guard }] (executable guards only). */
export function guardMatches(rule, str) {
  const out = [];
  for (const g of rule.guards || []) {
    if (!(g.pattern instanceof RegExp)) continue;
    for (const m of scan(str, g.pattern)) out.push({ index: m.index, length: m.length, guard: g });
  }
  return out;
}

/** The guard that covers [index, index+length) in `str`, or null. */
export function guardFor(rule, str, index, length) {
  for (const { index: gi, length: gl, guard } of guardMatches(rule, str)) {
    if (guard.scope === 'unit') return guard;
    if (gi < index + Math.max(length, 1) && index < gi + Math.max(gl, 1)) return guard;
  }
  return null;
}

/** Replace URLs, emails, code spans, code-ish tokens and accepted terms with U+E000 (same length). */
export function maskText(text, accept = []) {
  const blank = (m) => m.replace(/\S/g, '\uE000'); // U+E000: same length, never a letter
  let s = String(text)
    .replace(/\b(https?:\/\/|www\.)\S+/gi, blank)
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, blank)
    .replace(/`[^`]*`/g, blank)
    .replace(/\S*[A-Za-z0-9][_/\\=<>{}[\]@#$^|~]\S*/g, blank)
    .replace(/\b[a-z]+[A-Z][A-Za-z0-9]*\b/g, blank)
    .replace(/\b[\w-]+\.(m?js|cjs|tsx?|jsx|json|mdx?|css|html?|py|rs|go|ya?ml|toml|sh|ps1)\b/gi, blank)
    .replace(/\b\d+(\.\d+){2,}\b/g, blank);
  for (const term of accept) s = s.replace(wordRe(term), blank);
  return s;
}

// ------------------------------------------------------------------ spelling pairs

const IZE = ['organize', 'recognize', 'realize', 'optimize', 'customize', 'prioritize', 'authorize', 'minimize', 'maximize', 'summarize', 'apologize', 'categorize', 'emphasize', 'finalize', 'standardize', 'synchronize', 'utilize', 'visualize', 'personalize', 'monetize', 'normalize', 'specialize', 'capitalize', 'centralize', 'digitize', 'memorize', 'modernize', 'localize', 'stabilize', 'sanitize', 'initialize', 'serialize', 'randomize', 'criticize', 'generalize', 'harmonize', 'mobilize', 'neutralize', 'penalize', 'symbolize', 'characterize', 'familiarize', 'jeopardize', 'publicize', 'scrutinize', 'subsidize', 'energize', 'globalize', 'idealize', 'itemize', 'agonize', 'colonize', 'dramatize', 'economize', 'formalize', 'humanize', 'nationalize', 'patronize', 'polarize', 'privatize', 'rationalize', 'revitalize', 'socialize', 'sterilize', 'trivialize', 'victimize', 'incentivize', 'operationalize', 'contextualize', 'democratize', 'legitimize', 'maximize', 'minimize', 'terrorize', 'vaporize', 'visualize', 'tokenize', 'containerize', 'virtualize', 'parameterize', 'hospitalize', 'mesmerize'];
const IZE_SUFFIX = [['ize', 'ise'], ['izes', 'ises'], ['ized', 'ised'], ['izing', 'ising'], ['ization', 'isation'], ['izations', 'isations'], ['izer', 'iser'], ['izers', 'isers']];
const YZE = ['analyze', 'paralyze', 'catalyze'];
// no ['yzes','yses']: "analyses" is also the plural of the noun "analysis" in US English (EN-SPELLING guard)
const YZE_SUFFIX = [['yze', 'yse'], ['yzed', 'ysed'], ['yzing', 'ysing'], ['yzer', 'yser'], ['yzers', 'ysers']];
const OR = ['color', 'favor', 'flavor', 'honor', 'humor', 'labor', 'neighbor', 'behavior', 'harbor', 'rumor', 'vapor', 'armor', 'odor', 'endeavor', 'savior', 'splendor', 'parlor', 'clamor', 'tumor', 'valor', 'candor', 'fervor', 'ardor'];
const OR_SUFFIX = ['', 's', 'ed', 'ing', 'ful', 'fully', 'less', 'able', 'ably', 'ite', 'ites', 'hood', 'hoods', 'al', 'ally', 'ings'];
const RE = [['center', 'centre'], ['theater', 'theatre'], ['fiber', 'fibre'], ['liter', 'litre'], ['caliber', 'calibre'], ['somber', 'sombre'], ['saber', 'sabre'], ['luster', 'lustre'], ['specter', 'spectre'], ['meager', 'meagre'], ['maneuver', 'manoeuvre']];
const LL = ['cancel', 'travel', 'model', 'label', 'fuel', 'level', 'signal', 'channel', 'total', 'marvel', 'dial', 'counsel', 'tunnel', 'rival', 'equal', 'quarrel', 'shovel', 'jewel', 'pencil', 'panel', 'funnel', 'yodel', 'grovel', 'swivel', 'unravel', 'snorkel'];
const LL_SUFFIX = [['ed', 'led'], ['ing', 'ling'], ['er', 'ler'], ['ers', 'lers']];
const EXPLICIT = [
  ['catalog', 'catalogue'], ['catalogs', 'catalogues'], ['cataloged', 'catalogued'], ['cataloging', 'cataloguing'],
  ['defense', 'defence'], ['defenses', 'defences'], ['offense', 'offence'], ['offenses', 'offences'], ['pretense', 'pretence'],
  ['gray', 'grey'], ['grays', 'greys'], ['grayscale', 'greyscale'], ['aging', 'ageing'], ['artifact', 'artefact'], ['artifacts', 'artefacts'],
  ['aluminum', 'aluminium'], ['mold', 'mould'], ['molds', 'moulds'], ['plow', 'plough'], ['cozy', 'cosy'], ['pajamas', 'pyjamas'],
  ['airplane', 'aeroplane'], ['airplanes', 'aeroplanes'], ['pediatric', 'paediatric'], ['enrollment', 'enrolment'], ['enrollments', 'enrolments'],
  ['enroll', 'enrol'], ['enrolls', 'enrols'], ['fulfill', 'fulfil'], ['fulfills', 'fulfils'], ['fulfillment', 'fulfilment'],
  ['skillful', 'skilful'], ['skillfully', 'skilfully'], ['installment', 'instalment'], ['installments', 'instalments'], ['willful', 'wilful'],
  ['jewelry', 'jewellery'], ['skeptical', 'sceptical'], ['skeptic', 'sceptic'], ['skepticism', 'scepticism'], ['counselor', 'counsellor'],
  ['counselors', 'counsellors'], ['sulfur', 'sulphur'], ['mustache', 'moustache'], ['analog', 'analogue'],
  ['centered', 'centred'], ['centering', 'centring'], ['maneuvered', 'manoeuvred'], ['maneuvering', 'manoeuvring'],
];
// flagged only in a US contract: the UK form is wrong in US copy, but the "US" form is also valid UK in some senses
const US_ONLY = [['program', 'programme'], ['programs', 'programmes'], ['license', 'licence'], ['licenses', 'licences'], ['practice', 'practise'], ['practiced', 'practised'], ['practicing', 'practising'], ['check', 'cheque'], ['checks', 'cheques'], ['tire', 'tyre'], ['tires', 'tyres'], ['curb', 'kerb']];

function buildPairs() {
  const pairs = [];
  const add = (us, uk, family, usOnly = false) => pairs.push({ us, uk, family, usOnly });
  for (const v of IZE) for (const [a, b] of IZE_SUFFIX) add(v.slice(0, -3) + a, v.slice(0, -3) + b, 'ize');
  for (const v of YZE) for (const [a, b] of YZE_SUFFIX) add(v.slice(0, -3) + a, v.slice(0, -3) + b, 'yze');
  for (const v of OR) for (const s of OR_SUFFIX) add(v + s, `${v.slice(0, -2)}our${s}`, 'our');
  for (const [us, uk] of RE) { add(us, uk, 're'); add(`${us}s`, `${uk}s`, 're'); }
  for (const v of LL) for (const [a, b] of LL_SUFFIX) add(v + a, v + b, 'll');
  for (const [us, uk] of EXPLICIT) add(us, uk, 'explicit');
  for (const [us, uk] of US_ONLY) add(us, uk, 'usOnly', true);
  // the program/license/practice/check/tire/curb pairs: flag only the UK form in US copy
  return pairs;
}
export const SPELLING_PAIRS = buildPairs();
// Base (lemma) pairs, the count the method promises is >= 60.
export const SPELLING_BASE_PAIRS = IZE.length + YZE.length + OR.length + RE.length + LL.length + EXPLICIT.length + US_ONLY.length;

const US_TO_UK = new Map();
const UK_TO_US = new Map();
for (const p of SPELLING_PAIRS) {
  if (p.us === p.uk) continue;
  if (!US_TO_UK.has(p.us)) US_TO_UK.set(p.us, p);
  if (!UK_TO_US.has(p.uk)) UK_TO_US.set(p.uk, p);
}
// US forms that are also correct UK for a distinct sense or in software - never flagged in UK copy
const UK_TOLERATES = new Set(['program', 'programs', 'license', 'licenses', 'practice', 'practiced', 'practicing', 'check', 'checks', 'tire', 'tires', 'curb', 'analog', 'dial', 'dialed', 'dialing']);

/** Spelling hits of one variant in a (masked) string: [{ index, word, other, pair }]. */
export function spellingHits(str, form) {
  const map = form === 'US' ? US_TO_UK : UK_TO_US;
  const out = [];
  for (const m of String(str).matchAll(/(?<![\p{L}\uE000'’-])[A-Za-z]+(?![\p{L}\uE000])/gu)) {
    const lower = m[0].toLowerCase();
    const p = map.get(lower);
    if (!p) continue;
    if (form === 'US' && p.usOnly) continue; // "program", "license", "check": valid UK too, never a US-form signal
    out.push({ index: m.index, word: m[0], other: form === 'US' ? p.uk : p.us, pair: p });
  }
  return out;
}

// ------------------------------------------------------------------ case helpers

const MINOR = new Set('a an the and but or nor for so yet as at by from in into of off on onto out over per to up via vs with without than if is are be'.split(' '));

/** Shape of a heading: significant words after the first, and how many are capitalized. */
export function caseShape(text, { accept = [], properNouns = new Set() } = {}) {
  let t = String(text);
  const allWords = t.split(/\s+/).filter((w) => /\p{L}/u.test(w));
  for (const term of accept) t = t.replace(wordRe(term), ' ');
  if (/\p{L}/u.test(t) && t === t.toUpperCase()) return { words: allWords.length, significant: 0, capitalized: 0, allCaps: true };
  // Keep raw tokens so the token before each word is still visible: a word after a sentence
  // break ("Pricing: plans") or a segment separator ("Set up · Company") starts a new segment
  // and may be capitalized in sentence case (EN-CASE guard).
  const raw = t.split(/\s+/).filter(Boolean);
  const strip = (w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
  const firstIdx = raw.findIndex((w) => strip(w));
  const rest = [];
  for (let k = firstIdx + 1; k > 0 && k < raw.length; k++) {
    const w = strip(raw[k]);
    const prevRaw = raw[k - 1];
    if (!w) continue;
    if (/^[·•|/\\\-–—:>→]+$/.test(prevRaw) || /[.!?:]$/.test(prevRaw) || /^[("“‘]/.test(raw[k])) continue;
    if (!/^\p{L}[\p{L}'’-]*$/u.test(w)) continue;
    if (MINOR.has(w.toLowerCase())) continue;
    if (/^\p{Lu}{2,}$/u.test(w)) continue;           // acronym
    if (/\p{Lu}/u.test(w.slice(1).replace(/-\p{Lu}/gu, ''))) continue; // internal caps: OpenAI, iPhone
    if (properNouns.has(w)) continue;
    rest.push(w);
  }
  const capitalized = rest.filter((w) => /^\p{Lu}/u.test(w)).length;
  return { words: allWords.length, significant: rest.length, capitalized, allCaps: false };
}

/** Capitalized words seen mid-sentence more often than lowercase: proper nouns of this catalog. */
export function collectProperNouns(records) {
  const cap = new Map(); const low = new Map();
  for (const r of records) {
    if (r.kind !== 'sentence') continue;
    for (const m of r.text.matchAll(/(?<=[\p{L}\p{N},;)] )(\p{L}[\p{L}'’-]*)/gu)) {
      const w = m[1];
      const bucket = /^\p{Lu}/u.test(w) ? cap : low;
      const k = w[0].toUpperCase() + w.slice(1);
      bucket.set(k, (bucket.get(k) || 0) + 1);
    }
  }
  const out = new Set();
  for (const [w, n] of cap) if (n > (low.get(w) || 0)) out.add(w);
  return out;
}

// ------------------------------------------------------------------ lexicons

const PUFFERY = /(?<![\p{L}])(seamless(?:ly)?|robust|cutting[- ]edge|game[- ]chang(?:er|ers|ing)|unlock(?:s|ed|ing)?|elevat(?:e|es|ed|ing)|empower(?:s|ed|ing|ment)?|revolutioni[sz](?:e|es|ed|ing)|next[- ]level|supercharg(?:e|es|ed|ing))(?![\p{L}])/giu;

const FALSE_FRIEND_HINT = {
  actual: 'current, latest', actually: 'currently, at the moment', eventual: 'possible', eventually: 'possibly, if needed',
  sympathetic: 'likeable, friendly', concurrence: 'competition', formular: 'form', formulars: 'forms',
  actualize: 'update', actualise: 'update', actualized: 'updated', actualised: 'updated', actualizing: 'updating', actualising: 'updating', actualization: 'update', actualisation: 'update',
  realization: 'delivery, project, implementation', realisation: 'delivery, project, implementation', realizations: 'projects, our work', realisations: 'projects, our work',
};

const LINK_TEXT = new Set(['click here', 'here', 'read more', 'learn more', 'see more', 'find out more', 'more info', 'this link', 'click']);

// EN-REDUNDANCY: [pattern, suggestion]. Derived from the english subject's trigger list; letter
// formulas stay with EN-OFFICIALESE, bare intensifiers on absolutes with EN-UNCOMPARABLE.
const REDUNDANCY = [
  [/past history/, 'history'], [/free gifts?/, 'gift'], [/end results?/, 'result'], [/final outcomes?/, 'outcome'],
  [/advance planning/, 'planning'], [/added bonus(?:es)?/, 'bonus'], [/basic fundamentals/, 'fundamentals'],
  [/close proximity/, 'near'], [/completely (?:finished|eliminat(?:e|es|ed|ing))/, 'finished, eliminate'], [/each and every/, 'every'],
  [/(?:join|combin|merg|collaborat)(?:e|es|ed|ing|s)? together/, 'join, combine, merge, collaborate'], [/new innovations?/, 'innovation'],
  [/unexpected surprises?/, 'surprise'], [/true facts?/, 'fact'], [/repeat(?:s|ed|ing)? again/, 'repeat'],
  [/(?:revert|return)(?:s|ed|ing)? back/, 'revert, return'], [/brief summar(?:y|ies)/, 'summary'], [/general consensus|consensus of opinion/, 'consensus'],
  [/still remains?/, 'remains'], [/sum total/, 'total'], [/first began/, 'began'],
  [/(?:because of|due to|owing to) the fact that/, 'because'], [/(?:despite|in spite of) the fact that/, 'although'],
  [/in a timely manner/, 'promptly, or the deadline itself'], [/at this point in time|at the present time/, 'now'],
  [/in the event that/, 'if'], [/for the purpose of/, 'to, for'], [/ha(?:s|ve) the ability to/, 'can'],
  [/on an? (?:daily|weekly|monthly|yearly|regular) basis/, 'daily, weekly, monthly, regularly'], [/in the process of/, '(cut it)'], [/a large number of/, 'many'],
].map(([re, use]) => [new RegExp(`(?<![\\p{L}\\p{N}])(?:${re.source.replace(/ /g, '\\s+')})(?![\\p{L}\\p{N}])`, 'giu'), use]);

// EN-REDUNDANT-ACRONYM: all-capitals acronym + the word its last letter already stands for.
const ACRONYM_PAIRS = [['PIN', 'number'], ['ATM', 'machine'], ['UI', 'interface'], ['GUI', 'interface'], ['API', 'interface'], ['LLM', 'model'], ['ISBN', 'number'], ['VIN', 'number'], ['SSN', 'number'], ['LCD', 'display'], ['HIV', 'virus'], ['GPS', 'system'], ['RAM', 'memory'], ['LAN', 'network'], ['VPN', 'network'], ['UPC', 'code'], ['PDF', 'format'], ['FAQ', 'questions']];
const ACRONYM_RE = new RegExp(`(?<![\\p{L}\\p{N}])(?:${ACRONYM_PAIRS.map(([a, w]) => `${a}s?\\s+[${w[0]}${w[0].toUpperCase()}]${w.slice(1)}(?:e?s)?`).join('|')})(?![\\p{L}\\p{N}])`, 'gu');

// EN-CLICHE: a short list of stock English figures, derived for this checker (not imported from
// any published list). Figures built on a single EN-PUFFERY word ("game changer") stay with EN-PUFFERY.
const CLICHE = [
  /at the end of the day/, /think(?:s|ing)? outside (?:of )?the box/, /mov(?:e|es|ed|ing) the needle/, /low[- ]hanging fruit/,
  /hit(?:s|ting)? the ground running/, /the tip of the iceberg/, /the best of both worlds/, /the elephant in the room/,
  /push(?:es|ed|ing)? the envelope/, /rais(?:e|es|ed|ing) the bar/, /(?:level(?:s|led|ed|ling|ing)? the|a level) playing field/,
  /(?:take|takes|taking|took)\s+(?:[\p{L}’']+\s+){0,3}?to the next level/, /cut(?:s|ting)? through the noise/, /hit(?:s|ting)? the nail on the head/,
  /the whole nine yards/, /back to the drawing board/, /a no[- ]brainer/, /second to none/, /tried[- ]and[- ](?:true|tested)/,
  /one[- ]stop[- ]shop/, /the sky(?:'s|’s| is) the limit/, /go(?:es|ing)? the extra mile|went the extra mile/, /bang for (?:your|the) buck/,
  /boil(?:s|ing)? the ocean/, /(?:a )?needle in a haystack/, /a win[- ]win/, /in a nutshell/, /the holy grail/, /a double[- ]edged sword/,
  /the ball is in your court/, /(?:a )?perfect storm/,
].map((re) => new RegExp(`(?<![\\p{L}\\p{N}])(?:${re.source.replace(/(?<!\\s|\])\s(?![+*?{])/g, '\\s+')})(?![\\p{L}\\p{N}])`, 'giu'));

// EN-DIALECT-LEXIS: [pattern, flagged in, use]. `in` is the variant whose catalogs flag the form
// ('US' = a UK form flagged in US copy); 'any' is Indian-English lexis outside a declared Indian
// variant, which this contract cannot declare. Ambiguous words (holiday, mobile, flat, resume
// without an accent, gas, fall) are deliberately absent: see the rule's guards.
const DIALECT = [
  [/post[- ]?codes?/giu, 'US', 'ZIP code', 'UK'], [/CVs?/gu, 'US', 'résumé', 'UK'], [/lorr(?:y|ies)/giu, 'US', 'truck', 'UK'],
  [/petrol/giu, 'US', 'gas, gasoline', 'UK'], [/fortnight(?:s|ly)?/giu, 'US', 'two weeks, every two weeks', 'UK'], [/maths/giu, 'US', 'math', 'UK'],
  [/at the weekend/giu, 'US', 'on the weekend', 'UK'], [/car parks?/giu, 'US', 'parking lot', 'UK'], [/estate agents?/giu, 'US', 'real estate agent', 'UK'],
  [/zip[- ]?codes?/giu, 'UK', 'postcode', 'US'], [/cell[- ]?phones?/giu, 'UK', 'mobile phone', 'US'], [/résumés?/giu, 'UK', 'CV', 'US'],
  [/vacations?/giu, 'UK', 'holiday', 'US'], [/sidewalks?/giu, 'UK', 'pavement', 'US'], [/parking lots?/giu, 'UK', 'car park', 'US'],
  [/math/giu, 'UK', 'maths', 'US'], [/gas stations?|gasoline/giu, 'UK', 'petrol station, petrol', 'US'],
  [/prepone(?:s|d)?|updation|do the needful|kindly revert|revert(?:s|ed|ing)?\s+(?:back\s+)?to\s+(?:you|us|me)|lakhs?|crores?/giu, 'any', 'the international form (bring forward, update, reply, hundred thousand, ten million)', 'Indian English'],
].map(([re, flagIn, use, label]) => [new RegExp(`(?<![\\p{L}\\p{N}_])(?:${re.source})(?![\\p{L}\\p{N}_])`, re.flags), flagIn, use, label]);

/** The EN-INCLUSIVE termbase used when a contract declares no `terms.inclusive` of its own. */
export const INCLUSIVE_SEED = [
  { term: 'whitelist', use: 'allowlist' }, { term: 'whitelists', use: 'allowlists' }, { term: 'whitelisted', use: 'allowlisted' }, { term: 'whitelisting', use: 'allowlisting' },
  { term: 'blacklist', use: 'blocklist' }, { term: 'blacklists', use: 'blocklists' }, { term: 'blacklisted', use: 'blocklisted' }, { term: 'blacklisting', use: 'blocklisting' },
  { term: 'master/slave', use: 'primary/replica' }, { term: 'slave', use: 'replica, secondary' }, { term: 'slaves', use: 'replicas' },
  { term: 'master node', use: 'primary node' }, { term: 'master branch', use: 'main branch' }, { term: 'master database', use: 'primary database' },
  { term: 'demilitarized zone', use: 'perimeter network' }, { term: 'hangs', use: 'stops responding' },
];

const quoted = (example) => ({ pattern: /“[^”]{1,300}”|"[^"\n]{1,300}"/u, reason: 'quoted speech is evidence, not voice (english subject exception)', seen: 'english subject', example });

// ------------------------------------------------------------------ the rules

const PUFFERY_GUARDS = [
  {
    pattern: /(?<![\p{L}])robust(?=\s*(?:[=:(−-]|(?:[\w]+-[\w-]+\s+)?(?:mean|median|estimat\w*|statistic\w*|regression|standard errors?|variance|average|aggregate|to outliers|against\b)))/iu,
    reason: '"robust" as a statistics or engineering term, not a claim',
    seen: 'first real-catalog run, 2026-09-14',
    example: 'Own = own weights; Robust = mean across schemes; delta = robust - own.',
  },
  { pattern: 'one puffery word outside a heading', reason: 'a single word in body copy is often literal ("unlock the door"); density or a heading makes it a claim', seen: 'rule design', example: { text: 'Unlock the door with your badge', key: 'help.body' } },
];

export const RULES = [
  {
    id: 'EN-ARTIFACT', defaultSeverity: 'error', fragmentSafe: true, raw: true,
    kind: 'markup', granularity: 'word', priority: 100, status: 'on', precision: uncounted,
    guards: [{ pattern: 'a numeric footnote marker such as [1]', reason: 'citation markers are matched by their generator-specific shapes only', seen: 'rule design', example: 'Footnote [1] applies to annual plans.' }],
    examples: { hit: ['See the report :contentReference[oaicite:0]{index=0}', "Certainly! Here's your hiring plan.", 'Contact [Company Name] for details.'], clean: ["Here's how it works."] },
    test: phrase([
      /\b(oaicite|contentReference|citeturn\w*|filecite|turn\d+(?:search|news|view|file|image)\d+)\b/gi,
      /\[cite(?::\s*|_start\]|\s+)[^\]]{0,20}\]/gi,
      /【[^】]{0,40}†[^】]{0,40}】/g,
      /\bas an AI(?: language)? model\b/gi,
      /\bI hope this helps\b/gi,
      /\b(?:Certainly|Sure|Absolutely|Of course)! Here(?:'s|’s| is| are)/g,
      /\[(?:Company|Your|Product|Brand|Customer|Client|Insert|Date|Location|Industry|Website|Phone|Author)(?: [A-Z][a-z]+){0,3}\]/g,
      /\blorem ipsum\b/gi,
      /\b(?:as of my (?:last )?(?:knowledge|training) (?:cutoff|update)|my knowledge cutoff)\b/gi,
    ], 'generation artifact or chat residue; strip it (zero tolerance)'),
  },
  {
    id: 'EN-SPELLING', defaultSeverity: 'error', fragmentSafe: true,
    kind: 'locale-convention', granularity: 'word', priority: 90, status: 'on',
    precision: { value: null, sample: null, date: '2026-09-14', note: 'first real-catalog run: 9 false positives from "analyses" plus proper-name hits (total findings not recorded); guarded since, not recounted' },
    guards: [
      { pattern: '"-yses" forms are not paired', reason: '"analyses" is also the US plural of the noun "analysis"', seen: 'first real-catalog run, 2026-09-14 (9 false positives)', example: 'Recruiter time-per-hire analyses and cost reports' },
      { pattern: 'a capitalized word inside a run of capitalized words mid-sentence', reason: 'a proper name keeps its own spelling; terms.accept is the explicit cure', seen: 'first real-catalog run, 2026-09-14 ("Czech Labour Office")', example: 'Openings registered at the Czech Labour Office every week' },
      { pattern: 'program, license, practice, check, tire, curb, analog, dial in a UK contract', reason: 'valid British forms for a distinct sense or in software', seen: 'english subject exception', example: { text: 'Install the program and check the licence', contract: { variant: 'UK' } } },
      { pattern: '-ize and -yze under spelling "oxford"', reason: 'Oxford spelling is British with -ize', seen: 'english subject exception', example: { text: 'Organize your analyses', contract: { variant: 'UK', spelling: 'oxford' } } },
    ],
    examples: { hit: ['Customise your colour palette', 'Built on public labour-market data', { text: 'Optimize the catalog', contract: { variant: 'UK' } }], clean: ['Customize your color palette', 'Docs at https://example.com/colour-guide and file theme_colour.css', { text: 'Optimise the catalogue', contract: { variant: 'UK' } }] },
    test(str, ctx) {
      const c = ctx.contract;
      const wrong = c.variant === 'US' ? 'UK' : 'US';
      // A capitalized word inside a run of capitalized words mid-sentence is a proper name
      // ("Czech Labour Office") and keeps its own spelling; terms.accept is the explicit cure.
      const properName = (h) => {
        if (!/^\p{Lu}/u.test(h.word)) return false;
        const before = str.slice(0, h.index);
        if (/(^|[.!?:]\s+)$/.test(before) && !/\p{Lu}\p{L}*\s+$/u.test(before)) {
          return /^\s+\p{Lu}/u.test(str.slice(h.index + h.word.length)) && before.trim() !== '';
        }
        return /\p{Lu}\p{L}*\s+$/u.test(before) || /^\s+\p{Lu}/u.test(str.slice(h.index + h.word.length));
      };
      return spellingHits(str, wrong)
        .filter((h) => !properName(h))
        .filter((h) => !(c.variant === 'UK' && (UK_TOLERATES.has(h.word.toLowerCase()) || (c.spelling === 'oxford' && (h.pair.family === 'ize' || h.pair.family === 'yze')))))
        .map((h) => ({ index: h.index, length: h.word.length, message: `${wrong} spelling in a ${c.variant} catalog`, suggestion: matchCase(h.word, h.other) }));
    },
  },
  {
    id: 'EN-DASH', defaultSeverity: 'error', fragmentSafe: true,
    kind: 'typography', granularity: 'char', priority: 80, status: 'on', precision: uncounted,
    guards: [
      { pattern: 'a spaced hyphen between digits', reason: 'a numeric range, not a clause joint', seen: 'rule design', example: 'Open 2020 - 2021 in e-mail and sign-up' },
      { pattern: 'one em dash under dash.emDash "density"', reason: 'density mode flags the dash only when it has become the default joint', seen: 'rule design', example: { text: 'One idea — stated once.', contract: { dash: { emDash: 'density' } } } },
    ],
    examples: { hit: [{ text: 'Fast — and cheap', contract: { dash: { emDash: 'ban' } } }, 'Fast - and cheap', { text: 'One — two — three', contract: { dash: { emDash: 'density' } } }], clean: [{ text: 'Fast — and cheap', contract: { dash: { emDash: 'allow' } } }] },
    test(str, ctx) {
      const mode = ctx.contract.dash.emDash;
      const out = [];
      const ems = [...str.matchAll(/—/g)];
      if (mode === 'ban' && ems.length) {
        out.push({ index: ems[0].index, length: 1, message: `em dash banned by the contract (dash.emDash: ban)${ems.length > 1 ? `; ${ems.length} in this string` : ''}; use a colon, parentheses, a comma or a full stop`, severity: 'error' });
      } else if (mode === 'density' && ems.length > 1 && W(str) < 60) {
        out.push({ index: ems[1].index, length: 1, message: `${ems.length} em dashes in ${W(str)} words; the dash has become the default clause joint`, severity: 'warn' });
      }
      out.push(...scan(str, /(?<=[\p{L},)"'’”]) (-{1,2}) (?=[\p{L}("'‘“])/gu, () => ({ offset: 1, length: undefined, message: 'hyphen used as a dash between words', severity: 'warn' })).map((f) => ({ ...f, length: 1 })));
      out.push(...scan(str, /(?<=\p{L})--(?=\p{L})/gu, () => ({ message: 'double hyphen used as a dash', severity: 'warn' })));
      return out;
    },
  },
  {
    id: 'EN-SPACING', defaultSeverity: 'error', fragmentSafe: true,
    kind: 'whitespace', granularity: 'char', priority: 80, status: 'on', precision: uncounted,
    guards: [
      { pattern: 'a spaced colon between digits', reason: 'a time or a ratio, not a French spacing habit', seen: 'rule design', example: 'Meet at 10 : 30 with a 3 : 1 ratio' },
      { pattern: 'an empty rich-text tag is sampled, never deleted (icu.mjs)', reason: 'deleting a call-site tag manufactured a double space', seen: 'first real-catalog run, 2026-09-14', example: 'The sources in <path></path> rendered live.' },
    ],
    examples: { hit: ['Ready ?', 'Note : this matters', 'Two  spaces here'], clean: ['Ready? Note: this matters.', 'Smile :)'] },
    test(str) {
      return [
        ...scan(str, /(?<=\p{L}) +[?!;:](?=\s|$|["”’])/gu, () => ({ message: 'space before ? ! ; or : (a French/Czech spacing habit)' })),
        ...scan(str, /(?<=\S) {2,}(?=\S)/g, () => ({ message: 'double space' })),
      ];
    },
  },
  {
    id: 'EN-SOURCE-RESIDUE', defaultSeverity: 'error', fragmentSafe: true,
    kind: 'locale-convention', granularity: 'char', priority: 90, status: 'on', precision: uncounted,
    guards: [{ pattern: 'a comma followed by exactly three digits', reason: 'an English thousands separator, not a decimal comma', seen: 'rule design', example: '25% off for 1,000 users, 12,500 seats, 1.5 hours' }],
    examples: { hit: ['„Quoted“ text', '25 % off', 'Takes 1,5 hours', 'From 499 Kč', 'Only 499,-'], clean: ['25% off for 1,000 users, 12,500 seats, 1.5 hours'] },
    test: (str) => [
      ...scan(str, /„/g, () => ({ message: 'low-high quote from a source locale', suggestion: '“' })),
      ...scan(str, /\d[ \u00A0\u202F]%/g, () => ({ message: 'space before % (source-locale number format)' })),
      ...scan(str, /(?<![\d.,\p{L}])\d{1,3},\d{1,2}(?![\d,])/gu, () => ({ message: 'decimal comma (source-locale number format)' })),
      ...scan(str, /(?<!\p{L})Kč(?!\p{L})/gu, () => ({ message: 'source-locale currency word in English copy' })),
      ...scan(str, /\d,-(?![\d-])/g, () => ({ message: 'source-locale ",-" price ending' })),
    ],
  },
  {
    id: 'EN-COUNTABLE', defaultSeverity: 'error', fragmentSafe: true,
    kind: 'grammar', granularity: 'word', priority: 85, status: 'on', precision: uncounted,
    guards: [
      { pattern: /\ba feedback (loop|loops|form|button|widget|survey|session|mechanism|channel|tool|request|system|cycle|score|link|modal|dialog|prompt|card|panel|section|field|page|email|call|round|note|item|thread)/i, reason: '"feedback" as a noun modifier is countable through its head noun', seen: 'rule design', example: 'Close a feedback loop and share information' },
      { pattern: /\ban information (architecture|system|security|technology|sheet|panel|overload|gap|request|leak|asymmetry|pack|session|board|desk|page|icon|card|bar|box|banner|tooltip|message|note|hub|centre|center)/i, reason: '"information" as a noun modifier is countable through its head noun', seen: 'rule design', example: 'Start with an information architecture review.' },
    ],
    examples: { hit: ['More informations', 'Send us a feedback'], clean: ['Share information and feedback with the team'] },
    test: phrase([
      /\b(informations|softwares|feedbacks|advices|equipments|know-hows|knowhows|furnitures)\b/gi,
      /\ba feedback\b/gi,
      /\ban advice\b/gi,
      /\ban information\b/gi,
    ], (m) => `uncountable noun used as countable: "${m[0]}"`, (m) => {
      const w = m[0].toLowerCase();
      return { informations: 'information', softwares: 'software', feedbacks: 'feedback', advices: 'advice', equipments: 'equipment', 'know-hows': 'know-how', knowhows: 'know-how', furnitures: 'furniture', 'a feedback': 'feedback', 'an advice': 'advice, a piece of advice', 'an information': 'information' }[w];
    }),
  },
  {
    id: 'EN-COMPLEMENT', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'grammar', granularity: 'word', priority: 54, status: 'on', precision: uncounted,
    guards: [{ pattern: 'the passive "is allowed to" is not matched', reason: 'the passive has its object in the subject slot', seen: 'rule design', example: 'You are allowed to edit this' }],
    examples: { hit: ['The app allows to export data', 'We offer the possibility to pay later'], clean: ['The app allows you to export data'] },
    test: phrase([
      /\b(?:allows?|enables?|permits?|allowing|enabling)\s+to\s+(?!do\b)[a-z]+/gi,
      /\bpossibility to\s+[a-z]+/gi,
    ], (m) => (/possibility/i.test(m[0]) ? '"possibility to": use "the option to", "the chance to" or "you can"' : '"allow/enable to" needs an object: "lets you X", "allows you to X", "you can X"')),
  },
  {
    id: 'EN-CONDITIONAL', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'grammar', granularity: 'word', priority: 55, status: 'on', precision: uncounted,
    guards: [{ pattern: /\b(?:if|when|once|as soon as|unless|in case)\s+(?:you|we|they|he|she|it|the \w+)\s+will\b(?:\s*[,.;)]|\s*$|\s+(?:allow|excuse|permit|forgive|pardon|bear with)\b)/i, reason: '"if you will" and volitional "will" ("if you will allow me") are native', seen: 'rule design', example: 'It is, if you will, a map of the market.' }],
    examples: { hit: ['When you will sign up, you get a gift.'], clean: ['When you sign up, you get a gift.'] },
    test: phrase([
      /\b(?:if|when|once|as soon as|unless|in case)\s+(?:you|we|they|he|she|it|the \w+)\s+will\b/gi,
    ], '"will" in an if/when clause; use the present ("When you sign up, you get...")'),
  },
  {
    id: 'EN-PERFECT', defaultSeverity: 'warn', fragmentSafe: false,
    kind: 'grammar', granularity: 'word', priority: 56, status: 'on', precision: uncounted,
    guards: [
      { pattern: 'a has/have/had/been between the verb and "since"', reason: 'the perfect is already there', seen: 'rule design', example: 'It has been live since 2019 for everyone.' },
      { pattern: 'fragments never run (fragmentSafe: false)', reason: 'a label such as "Trusted since 2012" has no finite verb to correct', seen: 'rule design', example: 'Trusted since 2012' },
    ],
    examples: { hit: ['We are on the market since 2015 already.', 'We help teams since 2019 across Europe.'], clean: ["We've helped teams since 2019 across Europe."] },
    test: phrase([
      /\b(?:is|are|am|I'm|I’m|we're|we’re|you're|you’re|they're|they’re)\b(?:(?!\b(?:has|have|had|been)\b)[^.!?;]){0,50}?\bsince\s+(?:\d{4}|\d+\s+(?:years?|months?|weeks?))\b/gi,
      /\b(?:we|they|I)\s+(?!(?:have|has|had|haven|hasn|been|were|was|did|didn|'ve|’ve)\b)[a-z]+\b[^.!?;]{0,40}?\bsince\s+(?:\d{4}|\d+\s+years?)\b/gi,
    ], 'a state reaching now takes the present perfect ("We\'ve helped teams since 2019")'),
  },
  {
    id: 'EN-FALSE-FRIEND', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'mistranslation', granularity: 'word', priority: 38, status: 'on',
    precision: { value: 0.09, sample: 33, date: '2026-09-14', note: '"actual" family only, counted before the context guard: 30 of 33 hits were the native "real(ly)" sense; the guarded rule is uncounted' },
    guards: [{ pattern: '"actual(ly)" outside a current-sense context (prices, offers, version, available...)', reason: '"actual(ly)" is overwhelmingly native in the "real(ly)" sense', seen: 'first real-catalog run, 2026-09-14 (30 of 33 hits)', example: 'Verify what the candidate actually did with their actual CV.' }],
    examples: { hit: ['See the actual prices today.', 'These offers are actually available until Friday.'], clean: ['See the current prices today.'] },
    test: (str) => {
      const ff = (m) => ({ message: `"${m[0]}": check the sense; valid English if meant (a false friend of a Central European cognate would mean: ${FALSE_FRIEND_HINT[m[0].toLowerCase()] || 'see EN-FALSE-FRIEND'})` });
      return [
        ...scan(str, /(?<![\p{L}])(eventual|eventually|sympathetic|concurrence|formulars?|actuali[sz](?:e|ed|ing|ation)|reali[sz]ations?)(?![\p{L}])/giu, ff),
        ...scan(str, /(?<![\p{L}])actual(?=\s+(?:prices?|offers?|news|version|state|status|information|info|situation|trends?|topics?|vacancies|openings|promotions?|conditions|rates?|timetable|schedule|menu|edition|season|discounts?|deals?)\b)/giu, ff),
        ...scan(str, /(?<![\p{L}])actually(?=\s+(?:available|valid|open|active|running|in stock|on sale|hiring|unavailable|in progress|underway)\b)/giu, ff),
      ];
    },
  },
  {
    id: 'EN-OFFICIALESE', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'register', granularity: 'word', priority: 64, status: 'on', precision: uncounted, guards: [],
    examples: { hit: ['Do not hesitate to contact us.', 'We would like to inform you that the plan changed.'], clean: ['Questions? Contact us any time.'] },
    test: phrase([
      /\b(?:do not|don't|don’t) hesitate to\b/gi,
      /\bwe would like to inform\b/gi,
      /\bin case of any (?:questions|queries|problems|issues)\b/gi,
      /\bwithin the framework of\b/gi,
      /\bhereby\b/gi,
      /\bDear (?:customer|user|client|sir or madam)\b/gi,
    ], 'officialese formula; state the news and address the reader'),
  },
  {
    id: 'EN-PUFFERY', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'style', granularity: 'word', priority: 36, status: 'on',
    precision: { value: null, sample: null, date: '2026-09-14', note: 'first real-catalog run: "robust" in its statistics sense was a false positive (count not recorded); guarded since, not recounted' },
    guards: PUFFERY_GUARDS,
    examples: { hit: ['Seamless and robust sync for every team.', { text: 'Unlock growth', key: 'hero.title' }], clean: ['A robust estimator of the median.', { text: 'Rank by the robust cross-scheme mean instead', key: 'jobs.fairRankTitle' }] },
    test(str, ctx) {
      const hits = [...str.matchAll(PUFFERY)].filter((h) => !guardFor({ guards: PUFFERY_GUARDS }, str, h.index, h[0].length));
      const distinct = new Set(hits.map((h) => h[1].toLowerCase().replace(/(ly|s|ed|ing|er|ers|ment)$/, '')));
      if (distinct.size >= 2) return [{ index: hits[0].index, length: hits[0][0].length, message: `${distinct.size} puffery words in one string (${hits.map((h) => h[0]).join(', ')}); apply the swap test - replace with the checkable fact or cut` }];
      if (hits.length === 1 && ctx.role.heading) return [{ index: hits[0].index, length: hits[0][0].length, message: `puffery word "${hits[0][0]}" in a heading; apply the swap test - replace with the checkable fact or cut` }];
      return [];
    },
  },
  {
    id: 'EN-OPENER', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'style', granularity: 'word', priority: 68, status: 'on', precision: uncounted, guards: [],
    examples: { hit: ["In today's fast-paced world, teams ship weekly.", 'Imagine a world where hiring runs itself.'], clean: ['Today, teams ship weekly.'] },
    test: phrase([
      /\bin today['’]s\s+(?:fast[- ]paced|ever[- ](?:changing|evolving)|digital|modern|competitive|rapidly[- ]\w+|dynamic|busy|hyper[- ]\w+|connected)\b/gi,
      /\b(?:the|an|this|our)\s+ever[- ](?:evolving|changing)\s+(?:landscape|world|realm|space)\b/gi,
      /\bimagine a world where\b/gi,
    ], 'era opener; open with the reader\'s fact'),
  },
  {
    id: 'EN-SIGNIFICANCE', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'style', granularity: 'word', priority: 66, status: 'on', precision: uncounted, guards: [],
    examples: { hit: ['Data plays a crucial role in hiring.', 'This launch is a testament to our team.'], clean: ['Data decides who gets the next interview.'] },
    test: phrase([
      /\bplay(?:s|ed|ing)?\s+(?:a|an)\s+(?:crucial|pivotal|key|vital|critical|essential|important|central|significant|instrumental)\s+role\b/gi,
      /\b(?:is|stands as|serves as|remains)\s+a\s+testament\s+to\b/gi,
      /\bunderscor(?:e|es|ed|ing)\s+the\s+(?:importance|significance|need|value)\b/gi,
      /\bmarks?\s+a\s+(?:pivotal|significant|major)\s+(?:shift|moment|milestone)\b/gi,
    ], 'importance narrated instead of shown; state the consequence'),
  },
  {
    id: 'EN-PARTICIPLE-TAIL', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'style', granularity: 'word', priority: 70, status: 'on', precision: uncounted,
    guards: [{ pattern: 'a participle with no comma before it', reason: 'a sentence-initial or subject participle informs; only the comma-attached tail comments', seen: 'rule design', example: 'Ensuring quality is the job of the gate.' }],
    examples: { hit: ['We check every string, ensuring consistent quality.'], clean: ['We check every string, then we ship.'] },
    test: phrase([
      /,\s+(?:ensuring|highlighting|showcasing|underscoring|emphasi[sz]ing|fostering|solidifying|cementing|paving the way)\b[^.!?]*/gi,
    ], 'sentence-final participial tail that comments rather than informs; cut it or make it a sentence with a subject'),
  },
  {
    id: 'EN-HEDGE', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'style', granularity: 'word', priority: 40, status: 'on', precision: uncounted, guards: [],
    examples: { hit: ['This could potentially save time.', "It's important to note that plans renew."], clean: ['This could save time.'] },
    test: phrase([
      /\b(?:could|may|might|can)\s+potentially\b/gi,
      /\b(?:may|might|could)\s+possibly\b/gi,
      /\bit(?:'s|’s|\s+is)\s+(?:important|worth|crucial)\s+(?:to\s+note|noting)\b/gi,
    ], 'stacked or performed hedge; one qualifier, placed where the uncertainty is'),
  },
  {
    id: 'EN-LATIN', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'usage', granularity: 'word', priority: 30, status: 'on', precision: uncounted, guards: [],
    examples: { hit: ['Use a tag, e.g. urgent.', 'Files, images, etc.'], clean: ['Use a tag, for example urgent, and eggs.'] },
    test: (str) => scan(str, /(?<![\p{L}])(e\.g\.|i\.e\.|etc\.?)(?![\p{L}])/giu, (m) => ({
      message: `"${m[0]}": write it out`, suggestion: { 'e.g.': 'for example', 'i.e.': 'that is', etc: 'and so on (or a complete list)', 'etc.': 'and so on (or a complete list)' }[m[0].toLowerCase()],
    })),
  },
  {
    id: 'EN-LINK', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'usage', granularity: 'unit', priority: 30, status: 'on', precision: uncounted,
    guards: [{ pattern: 'link text that names its destination after the generic words', reason: 'only a string that is ENTIRELY generic link text is flagged', seen: 'rule design', example: 'Learn more about pricing' }],
    examples: { hit: ['Learn more →', 'Click here'], clean: ['Read the pricing guide'] },
    test(str) {
      const t = str.toLowerCase().replace(/^[\s\p{P}\p{S}]+|[\s\p{P}\p{S}]+$/gu, '').replace(/\s+/g, ' ');
      if (!LINK_TEXT.has(t)) return [];
      const start = str.search(/\p{L}/u);
      return [{ index: start, length: t.length, message: 'link text that does not state its destination (WCAG 2.4.4)' }];
    },
  },
  {
    id: 'EN-CASE', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'typography', granularity: 'unit', priority: 30, status: 'on',
    precision: { value: null, sample: null, date: '2026-09-14', note: 'first real-catalog run: 3 false positives on segment separators ("Set up · Company"); guarded since, not recounted' },
    guards: [
      { pattern: 'a word after a segment separator or a colon', reason: 'a new segment may start with a capital in sentence case', seen: 'first real-catalog run, 2026-09-14 (3 false positives)', example: { text: 'Set up · Company', key: 'setup.steps.company.eyebrow', contract: { case: { style: 'sentence' } } } },
      { pattern: 'accepted terms, acronyms, internal capitals, catalog proper nouns', reason: 'names keep their capitals', seen: 'rule design', example: { text: 'Works with Google Ads', key: 'pricing.title', contract: { case: { style: 'sentence' }, terms: { accept: ['Google Ads'] } } } },
      { pattern: 'all-capitals strings', reason: 'an eyebrow set in capitals has no case to judge', seen: 'rule design', example: { text: 'SETTINGS AND HIRING PLAN', key: 'page.eyebrow', contract: { case: { style: 'sentence' } } } },
    ],
    examples: { hit: [{ text: 'Browse By Category Today', key: 'pricing.title', contract: { case: { style: 'sentence' } } }, { text: 'Browse by category today', key: 'pricing.title', contract: { case: { style: 'title' } } }], clean: [{ text: 'Browse by category today', key: 'pricing.title', contract: { case: { style: 'sentence' } } }, { text: 'Browse By Category Today', key: 'pricing.body', contract: { case: { style: 'sentence' } } }] },
    test(str, ctx) {
      const style = ctx.contract.case.style;
      if (style === 'any' || !(ctx.role.heading || ctx.role.button)) return [];
      const shape = caseShape(ctx.text, { accept: ctx.contract.terms.accept, properNouns: ctx.properNouns });
      if (shape.allCaps || shape.words < 3 || shape.significant === 0) return [];
      const cls = ctx.role.heading ? 'heading' : 'button';
      if (style === 'sentence' && shape.capitalized === shape.significant) return [{ index: 0, length: str.length, message: `Title Case in a ${cls}-class string; the contract declares sentence case (add real names to terms.accept)` }];
      if (style === 'title' && shape.capitalized < shape.significant) return [{ index: 0, length: str.length, message: `sentence case in a ${cls}-class string; the contract declares title case` }];
      return [];
    },
  },
  {
    id: 'EN-END-PUNCT', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'typography', granularity: 'char', priority: 30, status: 'on', precision: uncounted,
    guards: [{ pattern: 'an ellipsis at the end of a button', reason: 'a progress label ("Loading...") is not a full stop', seen: 'rule design', example: { text: 'Loading...', key: 'form.submitButton' } }],
    examples: { hit: [{ text: 'Save changes.', key: 'form.submitButton' }], clean: [{ text: 'Save changes', key: 'form.submitButton' }, { text: 'Your changes were saved.', key: 'form.status' }] },
    test(str, ctx) {
      if (!ctx.role.button) return [];
      const m = /(?<!\.)\.\s*$/.exec(str);
      return m ? [{ index: m.index, length: 1, message: 'full stop at the end of a button label' }] : [];
    },
  },
  {
    id: 'EN-ELLIPSIS', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'typography', granularity: 'char', priority: 30, status: 'on', precision: uncounted, guards: [],
    examples: { hit: [{ text: 'Saving...', contract: { ellipsis: 'char' } }, { text: 'Saving…', contract: { ellipsis: 'dots' } }], clean: [{ text: 'Saving…', contract: { ellipsis: 'char' } }, { text: 'Saving...', contract: { ellipsis: 'any' } }] },
    test(str, ctx) {
      const e = ctx.contract.ellipsis;
      if (e === 'char') return scan(str, /(?<!\.)\.\.\.(?!\.)/g, () => ({ message: 'three dots; the contract declares the ellipsis character', suggestion: '…' }));
      if (e === 'dots') return scan(str, /…/g, () => ({ message: 'ellipsis character; the contract declares three dots', suggestion: '...' }));
      return [];
    },
  },
  {
    id: 'EN-QUOTES', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'typography', granularity: 'char', priority: 30, status: 'on', precision: uncounted,
    guards: [{ pattern: /=\s*"|"\s*:/, scope: 'unit', reason: 'a string holding code-like quoting (attr="x", "key":) is not prose quotation (curly contracts)', seen: 'rule design', example: { text: 'Use the key "title": a short label', contract: { quotes: 'curly' } } }],
    examples: { hit: [{ text: 'Select "Save" to continue', contract: { quotes: 'curly' } }, { text: 'Select “Save” to continue', contract: { quotes: 'straight' } }], clean: [{ text: 'Select “Save” to continue', contract: { quotes: 'curly' } }, { text: 'Select "Save" to continue', contract: { quotes: 'any' } }] },
    test(str, ctx) {
      const q = ctx.contract.quotes;
      if (q === 'curly') return scan(str, /"/g, () => ({ message: 'straight double quote; the contract declares curly quotes' })).slice(0, 1);
      if (q === 'straight') return scan(str, /[“”]/g, () => ({ message: 'curly double quote; the contract declares straight quotes' })).slice(0, 1);
      return [];
    },
  },
  {
    id: 'EN-AMPERSAND', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'typography', granularity: 'char', priority: 30, status: 'on', precision: uncounted,
    guards: [
      { pattern: 'fragments that are not headings', reason: 'a nav or footer label ("Terms & conditions") is a set phrase', seen: 'rule design', example: { text: 'Terms & conditions', key: 'footer.link' } },
      { pattern: 'an unspaced ampersand', reason: 'R&D, Q&A are abbreviations', seen: 'rule design', example: 'Our R&D team reviews every Q&A in one place.' },
    ],
    examples: { hit: ['Plan & ship your launch in one place.', { text: 'Plans & pricing', key: 'pricing.title' }], clean: ['Plan and ship your launch in one place.'] },
    test(str, ctx) {
      if (ctx.kind !== 'sentence' && !ctx.role.heading) return [];
      return scan(str, / & /g, () => ({ offset: 1, length: 1, message: '"&" in running text or a heading; write "and"' })).map((f) => ({ ...f, length: 1 }));
    },
  },
  {
    id: 'EN-MINIMIZER', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'register', granularity: 'word', priority: 34, status: 'on',
    precision: { value: null, sample: null, date: '2026-09-14', note: 'first real-catalog run: "simply" meaning "merely" and manner "simply" were false positives (count not recorded); guarded since, not recounted' },
    guards: [
      { pattern: '"simply/easily" after a modal, "has/have/had" or "to", unless addressed to the reader', reason: '"may simply have edited" means "merely"', seen: 'first real-catalog run, 2026-09-14', example: 'That proves nothing: the candidate may simply have edited the line away.' },
      { pattern: '"simply/easily" mid-sentence and not before an instruction verb', reason: 'manner adverb ("explains ideas simply") says nothing about the reader\'s effort', seen: 'first real-catalog run, 2026-09-14', example: 'Explains complex ideas simply and checks for understanding.' },
    ],
    examples: { hit: ['Simply drag the file here.', 'You can easily export every report.'], clean: ['Drag the file here; a simple list appears.'] },
    // Only where the word claims the READER's effort: sentence-initial ("Simply drag..."), after
    // "you can / lets you", or before an instruction verb.
    test: (str) => scan(str, /\b(?:simply|easily)\b/gi, (m) => {
      const before = str.slice(0, m.index);
      const after = str.slice(m.index + m[0].length);
      const sentenceStart = /(^|[.!?:;]\s+)$/.test(before);
      const addressed = /\b(?:you|You)\s+(?:can|could|will|'ll|’ll)\s+$/.test(before) || /\b(?:lets?|helps?)\s+you\s+$/i.test(before);
      const instruction = /^\s+(?:click|tap|select|drag|drop|add|connect|import|export|create|set up|sign|upload|install|choose|pick|type|enter|share|invite|switch|manage|find|get|build|launch|start|copy|paste|open|scan|follow|reply|book|schedule|track|customi[sz]e|update|edit|remove|delete|replace|configure|integrate|embed|send|use|turn|browse|compare|download)\b/i.test(after)
        && !/\b(?:may|might|could|would|should|must|has|have|had|to|can|will)\s+$/i.test(before);
      if (!(sentenceStart || addressed || instruction)) return null;
      return { message: `"${m[0]}" claims the reader's effort; cut it or state the measured claim` };
    }),
  },
  {
    id: 'EN-ONE-TERM', defaultSeverity: 'error', fragmentSafe: true,
    kind: 'terminology', granularity: 'word', priority: 95, status: 'on', precision: uncounted,
    guards: [{ pattern: 'whole-word match only', reason: 'a forbidden term inside another word is not the term', seen: 'rule design', example: { text: 'Sign in to continue with a design online', contract: { terms: { reject: [{ term: 'sign on', use: 'sign in' }] } } } }],
    examples: { hit: [{ text: 'Sign on to continue', contract: { terms: { reject: [{ term: 'sign on', use: 'sign in' }] } } }], clean: [{ text: 'Sign in to continue', contract: { terms: { reject: [{ term: 'sign on', use: 'sign in' }] } } }] },
    test(str, ctx) {
      const out = [];
      for (const { term, use } of ctx.contract.terms.reject) {
        out.push(...scan(str, wordRe(term), () => ({ message: `"${term}" is a forbidden variant in the termbase; use "${use}"`, suggestion: use })));
      }
      return out;
    },
  },
  {
    id: 'EN-EXCLAIM', defaultSeverity: 'warn', fragmentSafe: true, fileLevel: true,
    kind: 'register', granularity: 'unit', priority: 30, status: 'on', precision: uncounted,
    guards: [
      { pattern: 'one mark per catalog message; the per-surface count applies to component and content files only', reason: 'sibling catalog messages (accepted/declined/already) never co-render', seen: 'kp, fleet adoption 2026-09-14', example: { text: 'Welcome aboard!', key: 'landing.a' } },
      { pattern: 'a "!" not followed by space or end', reason: '"!important" and "a != b" are not exclamations', seen: 'rule design', example: 'Use !important sparingly and a != b' },
    ],
    examples: { hit: [{ text: 'Something failed!', key: 'errors.network' }, 'Welcome! You did it!'], clean: [{ text: 'Something failed. Try again.', key: 'errors.network' }] },
    test: () => [],
  },
  // ---------------------------------------------------------------- wave-3 rules (all warn)
  {
    id: 'EN-REDUNDANCY', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'redundancy', granularity: 'word', priority: 60, status: 'on',
    precision: { value: 0, sample: 1, date: '2026-09-14', note: 'eight fleet trees, read by the implementing worker (not a project owner): 1 hit, "Advance warning" as a feature label - a false positive, guarded; 0 hits since' },
    guards: [
      { pattern: '"advance warning" and "advance notice" are not listed', reason: '"advance" separates a warning before expiry from an alert at expiry, and "30 days\' advance notice" is contract language', seen: 'personas-web, wave-3 fleet run 2026-09-14', example: 'Advance warning for non-refresh credentials: a yellow status N days before expiry.' },
      { pattern: /future plans?(?=[^.!?]{0,60}\b(?:pricing|price|tiers?|seats?|billing|subscriptions?|per month|monthly|annual|upgrade|downgrade)\b)|(?<=\b(?:pricing|price|tiers?|seats?|billing|subscriptions?|upgrade|downgrade)\b[^.!?]{0,60})future plans?/iu, reason: '"plans" as pricing tiers: a future plan is a tier not yet offered, not a pleonasm', seen: 'rule design (SaaS pricing copy)', example: 'Upgrade now; future plans will change the per month price.' },
      quoted('A customer wrote: “the end result speaks for itself.”'),
    ],
    examples: { hit: ['Because of the fact that the import is completely finished, the end result arrives.', 'Claim your free gift today.', 'We report on a daily basis.'], clean: ['The import is done, so the report arrives within a minute.'] },
    test: (str) => REDUNDANCY.flatMap(([re, use]) => scan(str, re, (m) => ({ message: `"${m[0].replace(/\s+/g, ' ')}" says it twice or uses a frame for one word; say it once`, suggestion: use }))),
  },
  {
    id: 'EN-REDUNDANT-ACRONYM', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'redundancy', granularity: 'word', priority: 52, status: 'on',
    precision: { value: 1, sample: 1, date: '2026-09-14', note: 'eight fleet trees, read by the implementing worker (not a project owner): 1 hit, accepted' },
    guards: [
      { pattern: 'the lowercase form is never matched ("pin number")', reason: 'lowercase can be another sense, such as a connector pin', seen: 'english subject (checker guard worth keeping)', example: 'Connect the sensor to pin number 4.' },
      { pattern: 'terms.accept masks a product name carrying the repetition', reason: 'a name is not ours to edit', seen: 'english subject exception', example: { text: 'Open the ATM Machine Finder app', contract: { terms: { accept: ['ATM Machine Finder'] } } } },
    ],
    examples: { hit: ['Enter your PIN number to unlock the app.', 'Pick an LLM model for the draft.'], clean: ['Enter your PIN to unlock the app.'] },
    test: (str) => scan(str, ACRONYM_RE, (m) => ({ message: `"${m[0].replace(/\s+/g, ' ')}": the acronym already contains the word after it`, suggestion: m[0].split(/\s+/)[0] })),
  },
  {
    id: 'EN-EXPLETIVE-OPEN', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'style', granularity: 'word', priority: 58, status: 'on',
    precision: { value: 1, sample: 1, date: '2026-09-14', note: 'eight fleet trees, read by the implementing worker (not a project owner): 1 hit, accepted' },
    guards: [
      { pattern: /(?<=^|[.!?]\s+)There(?:\s+(?:is|are|was|were|will be|has been|have been)|['’](?:s|re))\s+(?:no|nothing|none|not|never)\b/u, reason: 'existence is the claim ("There are no results")', seen: 'english subject exception', example: 'There are no plans that fit this team yet.' },
      { pattern: '"You can" openers are not matched', reason: 'a step and an optional capability look identical to a pattern; the review checklist asks it', seen: 'english subject exception (EN-YOU)', example: 'You can export reports as spreadsheets.' },
    ],
    examples: { hit: ['There are three settings that control sync.', 'Sync is on. There is one admin who approves invites.'], clean: ['Three settings control sync.'] },
    test: (str) => scan(str, /(?<=^|[.!?]\s+)There(?:\s+(?:is|are|was|were|will be|has been|have been)|['’](?:s|re))\s+[^.!?;:]{1,60}?\b(?:that|who|which)\s+\p{L}+/gu, () => ({ message: 'sentence opens on "There is/are" and buries its real verb in a relative clause; promote the verb' })),
  },
  {
    id: 'EN-UNCOMPARABLE', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'usage', granularity: 'word', priority: 44, status: 'on',
    precision: { value: null, sample: null, date: '2026-09-14', note: 'eight fleet trees: 0 hits - no precision evidence, and no recall evidence either' },
    guards: [
      { pattern: /(?<![\p{L}])(?:more|most|less|least|very|so)\s+unique\s+(?:visitors?|users?|views?|sessions?|values?|keys?|ids?|entries|items?|combinations?|words?|ips?|devices?|clicks?|opens?|customers?|players?|pageviews?)(?![\p{L}])/iu, reason: '"unique" as a count qualifier: the comparative grades the count, not the uniqueness', seen: 'rule design (analytics copy)', example: 'See more unique visitors every week.' },
      { pattern: /(?<![\p{L}])(?:more|less)\s+complete\b[^.!?:]{0,30}:/iu, reason: 'a real degree of approach to the absolute, stated after a colon (english subject exception)', seen: 'english subject exception', example: 'A more complete export: it now includes tags.' },
      quoted('Their motto is “a more perfect union” for every team.'),
    ],
    examples: { hit: ['The most optimal, very unique way to sync calendars.', 'This step is totally essential.'], clean: ['Syncs two calendars in under a second.', 'The export is almost complete.'] },
    test: (str) => scan(str, /(?<![\p{L}])(?:very|really|extremely|totally|so|more|most|less|least|somewhat|rather|fairly|pretty|incredibly|highly|truly)\s+(?:unique|optimal|perfect|complete|essential|ultimate|absolute|infinite|unanimous|impossible|universal|paramount)(?![\p{L}])/giu, (m) => ({ message: `"${m[0].replace(/\s+/g, ' ')}" grades an absolute; drop the intensifier or state the measure` })),
  },
  {
    id: 'EN-CLICHE', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'style', granularity: 'word', priority: 62, status: 'on',
    precision: { value: 1, sample: 1, date: '2026-09-14', note: 'eight fleet trees, read by the implementing worker (not a project owner): 1 hit, accepted' },
    guards: [
      { pattern: /(?<!^|[.!?:;]\s*)\bat the end of the day\b(?!\s*,)/iu, reason: 'the literal time of day ("summaries arrive at the end of the day"), not the figure', seen: 'rule design (scheduling copy)', example: 'Summaries arrive at the end of the day.' },
      quoted('Our founder likes to say “think outside the box” to new hires.'),
    ],
    examples: { hit: ['At the end of the day, our alerts move the needle.', { text: 'Take your hiring to the next level', key: 'hero.title' }], clean: ['Our alerts flag a failed payment within five minutes.'] },
    test: (str) => CLICHE.flatMap((re) => scan(str, re, (m) => ({ message: `stock figure "${m[0].replace(/\s+/g, ' ')}"; state the claim it stands for` }))),
  },
  {
    id: 'EN-DIALECT-LEXIS', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'regionalism', granularity: 'word', priority: 61, status: 'on', collapse: 'file',
    precision: { value: null, sample: 148, date: '2026-09-14', note: 'eight fleet trees: 148 hits, all "CV"/"CVs" in one hiring product whose market uses CV - one house-term decision for that project (terms.accept), not 148 judged findings; since collapsed to one finding per form per file' },
    guards: [
      { pattern: 'one finding per form per file (collapse: file)', reason: 'a vocabulary form used consistently is one ruling, not one defect per string; the finding carries the count', seen: 'kp, wave-3 fleet run 2026-09-14 (148 "CV" hits)', example: { text: 'Upload your résumé.' } },
      { pattern: 'holiday, mobile, flat, gas, fall, and unaccented "resume" are not in the list', reason: 'each has a native sense in both variants (a US public holiday, a mobile app, resume a download)', seen: 'rule design', example: { text: 'Resume the upload on your mobile app after the holiday.', contract: { variant: 'UK' } } },
      { pattern: /(?<![\p{L}])Math\.[a-z]/u, reason: 'a code identifier (Math.round), not the school subject', seen: 'rule design', example: { text: 'Round the score with Math.round first.', contract: { variant: 'UK' } } },
    ],
    examples: { hit: ['Upload your CV and enter your postcode.', { text: 'Enter your ZIP code to continue.', contract: { variant: 'UK' } }, 'We will revert back to you within a day.'], clean: ['Upload your résumé and enter your ZIP code.', { text: 'Upload your CV and enter your postcode.', contract: { variant: 'UK' } }] },
    test(str, ctx) {
      const variant = ctx.contract.variant;
      const out = [];
      for (const [re, flagIn, use, label] of DIALECT) {
        if (flagIn !== 'any' && flagIn !== variant) continue;
        out.push(...scan(str, re, (m) => ({ message: `"${m[0]}" is ${label} vocabulary in a ${variant} catalog; the declared variant governs vocabulary too`, suggestion: use })));
      }
      return out;
    },
  },
  {
    id: 'EN-INCLUSIVE', defaultSeverity: 'warn', fragmentSafe: true,
    kind: 'inclusive-language', granularity: 'word', priority: 48, status: 'on',
    precision: { value: null, sample: null, date: '2026-09-14', note: 'eight fleet trees: 0 hits - no precision evidence, and no recall evidence either' },
    guards: [
      { pattern: /(?<![\p{L}])(?:formerly|previously|once called|also known as|a\.?k\.?a\.?|renamed from|instead of)\s+(?:the\s+)?["“'‘]?(?:whitelist|blacklist|master|slave)\p{L}*/iu, reason: 'one mention of the old term so searchers find the new one (english subject exception)', seen: 'english subject exception', example: 'The allowlist (formerly whitelist) holds trusted addresses.' },
      { pattern: /(?<![\p{L}])hangs\s+(?:out|on|up|around|over|onto|in|tight|loose|together|back|by|from|off|down|above|below|beside|behind|near)\b|\b(?:picture|painting|poster|portrait|photo|flag|coat|sign|banner|lamp|cloud|shadow|threat|question|sword|fate|future|balance)s?\s+hangs\b/iu, reason: 'phrasal or physical "hang", not a program that stopped responding', seen: 'rule design', example: 'A framed poster hangs in every office.' },
      { pattern: /(?<![\p{L}])slave(?:s|ry)?\s+(?:trade|labou?r|owners?|states?|narratives?|ships?|revolts?|rebellions?|markets?|codes?)\b|\b(?:former|enslaved|runaway|fugitive|freed)\s+slaves?\b/iu, reason: 'historical or human-rights subject matter uses the literal sense', seen: 'rule design (civic and history copy)', example: 'The museum covers the slave trade in the Atlantic.' },
    ],
    examples: { hit: ['Add the address to the whitelist.', 'Restart the master node if the app hangs.', { text: 'Add it to the denylist.', contract: { terms: { inclusive: [{ term: 'denylist', use: 'blocklist' }] } } }], clean: ['Add the address to the allowlist.', { text: 'Add the address to the whitelist.', contract: { terms: { inclusive: [] } } }] },
    test(str, ctx) {
      const list = ctx.contract.terms.inclusive ?? INCLUSIVE_SEED;
      const out = [];
      for (const { term, use } of list) {
        // a slash term ("master/slave") is masked as a code-ish token; read it from the unmasked
        // text (same offsets: masking preserves length)
        const hay = /[/\\]/.test(term) ? ctx.text : str;
        out.push(...scan(hay, wordRe(term), () => ({ message: `"${term}" is a bias-coded term the termbase replaces; use "${use}"`, suggestion: use })));
      }
      return out;
    },
  },
  {
    id: 'EN-GENERIC-PRONOUN', defaultSeverity: 'warn', fragmentSafe: true, raw: true,
    kind: 'inclusive-language', granularity: 'word', priority: 50, status: 'on',
    precision: { value: null, sample: null, date: '2026-09-14', note: 'eight fleet trees: 0 hits - no precision evidence, and no recall evidence either' },
    guards: [
      { pattern: /(?<![\p{L}])(?:he|she|they)\s*\/\s*(?:him|her|them)(?![\p{L}])|(?<![\p{L}])(?:he|she)\s*\/\s*(?:she|he)\s*\/\s*they(?![\p{L}])/iu, reason: 'a pronoun picker lists pronouns; it does not use a generic one', seen: 'rule design (profile forms)', example: 'Choose your pronouns: he/she/they or add your own' },
      quoted('The survey asked: “Did he or she reply within a day?”'),
      { pattern: 'the generic masculine ("each admin ... his") is never matched', reason: 'telling a generic "he" from a specific one needs the referent; the review checklist asks it', seen: 'english subject (narrow by design)', example: 'Ask Tom whether he signed the invoice.' },
    ],
    examples: { hit: ['Each admin sees his/her invoices once he/she signs in.', 'The owner confirms he or she agrees.'], clean: ['Admins see their invoices once they sign in.'] },
    test: (str) => scan(str, /(?<![\p{L}])(?:he\s*\/\s*she|she\s*\/\s*he|s\s*\/\s*he|\(s\)he|he or she|she or he|his\s*\/\s*her|her\s*\/\s*his|his or her|her or his|him\s*\/\s*her|her\s*\/\s*him|him or her|her or him|himself\s*\/\s*herself|himself or herself)(?![\p{L}])/giu, (m) => ({ message: `"${m[0]}": walk the ladder - "you", a plural, "the/a", the role, "person", then singular "they"` })),
  },
];

export const RULE_IDS = RULES.map((r) => r.id);
const RULE_BY_ID = new Map(RULES.map((r) => [r.id, r]));
export const ruleById = (id) => RULE_BY_ID.get(id) || null;

// ------------------------------------------------------------------ engine

const lastSegment = (key) => String(key || '').replace(/\[\d+\]/g, '').split('.').pop();

export function roleOf(rec, contract) {
  const tag = String(rec.tag || '');
  const isAttr = /\[.+\]$/.test(tag);
  const bare = tag.replace(/\[.*$/, '');
  const last = lastSegment(rec.key);
  const keyish = !String(rec.key || '').startsWith('<');
  return {
    heading: !isAttr && (/^h[1-6]$/i.test(bare) || bare === 'title' || (keyish && contract.case.headingKeys.test(last))),
    button: !isAttr && (/^button$/i.test(bare) || (keyish && contract.case.buttonKeys.test(last))),
    error: keyish && contract.case.errorKeys.test(String(rec.key || '')),
  };
}

const severityFor = (rule, finding, contract) => contract.rules[rule.id] ?? finding.severity ?? rule.defaultSeverity;

/**
 * One span, one finding. Among word-granularity findings on one string, a warning whose span
 * overlaps a higher-ranked finding is dropped; rank is severity (error first), then priority, then
 * span length. An error is never dropped: its fingerprint is in some project's baseline, and the
 * ratchet must see exactly what it saw before. Character- and unit-level findings (a dash, the case
 * of a whole heading) answer a different question and never compete with wording findings.
 * Greedy, so a finding dropped by a stronger one cannot in turn drop a third.
 */
export function resolveOverlaps(findings) {
  const rank = (f) => [f.severity === 'error' ? 1 : 0, f.priority ?? 0, f.length ?? 0, -(f.index ?? 0)];
  const cmp = (a, b) => { const ra = rank(a); const rb = rank(b); for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return rb[i] - ra[i]; return 0; };
  const competing = findings.filter((f) => f.granularity === 'word');
  const kept = [];
  const dropped = new Set();
  for (const f of [...competing].sort(cmp)) {
    const len = Math.max(f.length ?? 0, 1);
    const clash = kept.find((k) => k.index < f.index + len && f.index < k.index + Math.max(k.length ?? 0, 1));
    if (clash && f.severity !== 'error') { dropped.add(f); f.droppedBy = clash.rule; continue; }
    kept.push(f);
  }
  return findings.filter((f) => !dropped.has(f));
}

const EXCLAIM = /[\p{L}\p{N})"'’”]!+(?=\s|$|["'’”)])/gu;

/** Rules that can fire under this contract: status on, not turned off by the contract. */
export const activeRules = (contract) => RULES.filter((r) => r.status !== 'temp_off' && contract.rules[r.id] !== 'off');

/**
 * Lint extracted records. Returns findings:
 * { rule, kind, severity, file, line, key, raw, text, span, anchor, index, message, suggestion, record }.
 * `anchor` is the span expanded until it occurs exactly once in `text` (span.mjs).
 */
export function lintRecords(records, contract) {
  const active = activeRules(contract);
  const properNouns = collectProperNouns(records);
  const findings = [];
  const anchorOf = (text, index, length) => uniqueSpan(text, index, length).span;
  for (const rec of records) {
    const role = roleOf(rec, contract);
    const ctx = { contract, role, kind: rec.kind, key: rec.key, file: rec.file, properNouns, text: rec.text };
    const seen = new Set();
    for (const variant of rec.variants) {
      const unit = [];
      for (const rule of active) {
        if (rule.fileLevel) continue;
        if (rec.kind === 'fragment' && !rule.fragmentSafe) continue;
        const str = rule.raw ? variant : maskText(variant, contract.terms.accept);
        const vctx = variant === rec.text ? ctx : { ...ctx, text: variant };
        for (const f of rule.test(str, vctx)) {
          if (guardFor(rule, str, f.index, f.length ?? 0)) continue;
          const span = variant.slice(f.index, f.index + (f.length ?? 0));
          const sig = `${rule.id}|${f.message}|${span}`;
          if (seen.has(sig)) continue;
          seen.add(sig);
          unit.push({ rule: rule.id, kind: rule.kind, severity: severityFor(rule, f, contract), granularity: rule.granularity, priority: rule.priority, length: f.length ?? 0, file: rec.file, line: rec.line, key: rec.key, raw: rec.raw, text: variant, span, index: f.index, message: f.message, suggestion: f.suggestion, record: rec });
        }
      }
      for (const f of resolveOverlaps(unit)) {
        const { granularity, priority, length, droppedBy, ...rest } = f;
        void granularity; void priority; void droppedBy;
        findings.push({ ...rest, anchor: anchorOf(variant, f.index, length) });
      }
    }
  }
  // collapse: 'file' - a rule whose finding is a catalog-wide ruling (a vocabulary form) reports the
  // first occurrence of each form per file, with the count, instead of one finding per string.
  // Only warnings collapse; an error is never folded into another finding's count.
  const collapsing = new Set(active.filter((r) => r.collapse === 'file').map((r) => r.id));
  if (collapsing.size) {
    const groups = new Map();
    for (const f of findings) {
      if (!collapsing.has(f.rule) || f.severity === 'error') continue;
      const g = `${f.rule}|${f.file}|${f.suggestion ?? ''}|${f.span.toLowerCase().replace(/(?:e?s)$/, '')}`;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(f);
    }
    const folded = new Set();
    for (const list of groups.values()) {
      if (list.length < 2) continue;
      list[0].message += `; ${list.length} occurrences of this form in this file - one vocabulary ruling covers them (record it in terms.accept to keep the form)`;
      for (const f of list.slice(1)) folded.add(f);
    }
    if (folded.size) {
      const keep = findings.filter((f) => !folded.has(f));
      findings.length = 0;
      findings.push(...keep);
    }
  }
  // EN-EXCLAIM: none in error-class strings; at most one per message in a catalog; at most one
  // per surface in a component or content file.
  const exclaim = active.find((r) => r.id === 'EN-EXCLAIM');
  if (exclaim) {
    const units = new Map();
    for (const rec of records) {
      const m = [...rec.text.matchAll(EXCLAIM)];
      if (!m.length) continue;
      const role = roleOf(rec, contract);
      const emit = (message) => findings.push({ rule: exclaim.id, kind: exclaim.kind, severity: severityFor(exclaim, {}, contract), file: rec.file, line: rec.line, key: rec.key, raw: rec.raw, text: rec.text, span: rec.text.slice(m[0].index, m[0].index + m[0][0].length), anchor: anchorOf(rec.text, m[0].index, m[0][0].length), index: m[0].index, message, record: rec });
      if (role.error) { emit('exclamation mark in an error-class string'); continue; }
      // A catalog cannot say which messages render on one page (sibling outcomes never co-render),
      // so catalogs get the per-message check only; the per-surface count applies to component and
      // content files, where a file is a surface.
      if (/\.json$/i.test(rec.file)) { if (m.length > 1) emit('more than one exclamation mark in one message'); continue; }
      const unit = `${rec.file}::`;
      const n = (units.get(unit) || 0) + 1;
      units.set(unit, n);
      if (n > 1) emit(`exclamation mark #${n} in this file; at most one per page`);
    }
  }
  return findings;
}
