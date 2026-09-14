// rules.mjs - the deterministic EN rule set and the engine that runs it. Builtins only.
//
// Every rule is regex or wordlist - no model, no detector, no network. IDs match the
// registry's `english` subject in the `localization` bundle; the rule text, sources and
// exceptions live there, and a finding cites the ID so a reviewer can look it up.
// Each rule: { id, defaultSeverity, fragmentSafe, raw?, test(str, ctx) -> [finding] }
// where a finding is { index, length, span, message, suggestion?, severity? }.
// `fragmentSafe: false` rules are sentence-level and never run on fragments.

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

/** Replace URLs, emails, code spans, code-ish tokens and accepted terms with U+E000 (same length). */
export function maskText(text, accept = []) {
  const blank = (m) => m.replace(/\S/g, '');
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
// no ['yzes','yses']: "analyses" is also the plural of the noun "analysis" in US English (smoke test, 9 false positives)
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
  for (const m of String(str).matchAll(/(?<![\p{L}'’-])[A-Za-z]+(?![\p{L}])/gu)) {
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
  // and may be capitalized in sentence case (smoke test: 3 false positives on "Set up · X").
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

// ------------------------------------------------------------------ the rules

const PUFFERY = /(?<![\p{L}])(seamless(?:ly)?|robust|cutting[- ]edge|game[- ]chang(?:er|ers|ing)|unlock(?:s|ed|ing)?|elevat(?:e|es|ed|ing)|empower(?:s|ed|ing|ment)?|revolutioni[sz](?:e|es|ed|ing)|next[- ]level|supercharg(?:e|es|ed|ing))(?![\p{L}])/giu;

const FALSE_FRIEND_HINT = {
  actual: 'current, latest', actually: 'currently, at the moment', eventual: 'possible', eventually: 'possibly, if needed',
  sympathetic: 'likeable, friendly', concurrence: 'competition', formular: 'form', formulars: 'forms',
  actualize: 'update', actualise: 'update', actualized: 'updated', actualised: 'updated', actualizing: 'updating', actualising: 'updating', actualization: 'update', actualisation: 'update',
  realization: 'delivery, project, implementation', realisation: 'delivery, project, implementation', realizations: 'projects, our work', realisations: 'projects, our work',
};

const LINK_TEXT = new Set(['click here', 'here', 'read more', 'learn more', 'see more', 'find out more', 'more info', 'this link', 'click']);

export const RULES = [
  {
    id: 'EN-ARTIFACT', defaultSeverity: 'error', fragmentSafe: true, raw: true,
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
    test(str) {
      return [
        ...scan(str, /(?<=\p{L}) +[?!;:](?=\s|$|["”’])/gu, () => ({ message: 'space before ? ! ; or : (a French/Czech spacing habit)' })),
        ...scan(str, /(?<=\S) {2,}(?=\S)/g, () => ({ message: 'double space' })),
      ];
    },
  },
  {
    id: 'EN-SOURCE-RESIDUE', defaultSeverity: 'error', fragmentSafe: true,
    test: (str) => [
      ...scan(str, /„/g, () => ({ message: 'low-high quote from a source locale', suggestion: '“' })),
      ...scan(str, /\d[   ]%/g, () => ({ message: 'space before % (source-locale number format)' })),
      ...scan(str, /(?<![\d.,\p{L}])\d{1,3},\d{1,2}(?![\d,])/gu, () => ({ message: 'decimal comma (source-locale number format)' })),
      ...scan(str, /(?<!\p{L})Kč(?!\p{L})/gu, () => ({ message: 'source-locale currency word in English copy' })),
      ...scan(str, /\d,-(?![\d-])/g, () => ({ message: 'source-locale ",-" price ending' })),
    ],
  },
  {
    id: 'EN-COUNTABLE', defaultSeverity: 'error', fragmentSafe: true,
    test: phrase([
      /\b(informations|softwares|feedbacks|advices|equipments|know-hows|knowhows|furnitures)\b/gi,
      /\ba feedback\b(?! (loop|loops|form|button|widget|survey|session|mechanism|channel|tool|request|system|cycle|score|link|modal|dialog|prompt|card|panel|section|field|page|email|call|round|note|item|thread))/gi,
      /\ban advice\b/gi,
      /\ban information\b(?! (architecture|system|security|technology|sheet|panel|overload|gap|request|leak|asymmetry|pack|session|board|desk|page|icon|card|bar|box|banner|tooltip|message|note|hub|centre|center))/gi,
    ], (m) => `uncountable noun used as countable: "${m[0]}"`, (m) => {
      const w = m[0].toLowerCase();
      return { informations: 'information', softwares: 'software', feedbacks: 'feedback', advices: 'advice', equipments: 'equipment', 'know-hows': 'know-how', knowhows: 'know-how', furnitures: 'furniture', 'a feedback': 'feedback', 'an advice': 'advice, a piece of advice', 'an information': 'information' }[w];
    }),
  },
  {
    id: 'EN-COMPLEMENT', defaultSeverity: 'warn', fragmentSafe: true,
    test: phrase([
      /\b(?:allows?|enables?|permits?|allowing|enabling)\s+to\s+(?!do\b)[a-z]+/gi,
      /\bpossibility to\s+[a-z]+/gi,
    ], (m) => (/possibility/i.test(m[0]) ? '"possibility to": use "the option to", "the chance to" or "you can"' : '"allow/enable to" needs an object: "lets you X", "allows you to X", "you can X"')),
  },
  {
    id: 'EN-CONDITIONAL', defaultSeverity: 'warn', fragmentSafe: true,
    test: phrase([
      /\b(?:if|when|once|as soon as|unless|in case)\s+(?:you|we|they|he|she|it|the \w+)\s+will\b(?!\s*[,.;)]|\s*$|\s+(?:allow|excuse|permit|forgive|pardon|bear with)\b)/gi,
    ], '"will" in an if/when clause; use the present ("When you sign up, you get...")'),
  },
  {
    id: 'EN-PERFECT', defaultSeverity: 'warn', fragmentSafe: false,
    test: phrase([
      /\b(?:is|are|am|I'm|I’m|we're|we’re|you're|you’re|they're|they’re)\b(?:(?!\b(?:has|have|had|been)\b)[^.!?;]){0,50}?\bsince\s+(?:\d{4}|\d+\s+(?:years?|months?|weeks?))\b/gi,
      /\b(?:we|they|I)\s+(?!(?:have|has|had|haven|hasn|been|were|was|did|didn|'ve|’ve)\b)[a-z]+\b[^.!?;]{0,40}?\bsince\s+(?:\d{4}|\d+\s+years?)\b/gi,
    ], 'a state reaching now takes the present perfect ("We\'ve helped teams since 2019")'),
  },
  {
    id: 'EN-FALSE-FRIEND', defaultSeverity: 'warn', fragmentSafe: true,
    // "actual(ly)" is overwhelmingly native in the "real(ly)" sense - the first smoke test on a real
    // catalog found 30 of 33 hits native - so it is flagged only where the cognate's "current" sense shows.
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
    test(str, ctx) {
      // "robust" as a statistics/engineering term ("robust mean", "Robust = ...") is not puffery.
      const hits = [...str.matchAll(PUFFERY)].filter((h) => !(/^robust$/i.test(h[1]) && /^\s*(?:[=:(−-]|(?:[\w]+-[\w-]+\s+)?(?:mean|median|estimat\w*|statistic\w*|regression|standard errors?|variance|average|aggregate|to outliers|against\b))/i.test(str.slice(h.index + h[0].length))));
      const distinct = new Set(hits.map((h) => h[1].toLowerCase().replace(/(ly|s|ed|ing|er|ers|ment)$/, '')));
      if (distinct.size >= 2) return [{ index: hits[0].index, length: hits[0][0].length, message: `${distinct.size} puffery words in one string (${hits.map((h) => h[0]).join(', ')}); apply the swap test - replace with the checkable fact or cut` }];
      if (hits.length === 1 && ctx.role.heading) return [{ index: hits[0].index, length: hits[0][0].length, message: `puffery word "${hits[0][0]}" in a heading; apply the swap test - replace with the checkable fact or cut` }];
      return [];
    },
  },
  {
    id: 'EN-OPENER', defaultSeverity: 'warn', fragmentSafe: true,
    test: phrase([
      /\bin today['’]s\s+(?:fast[- ]paced|ever[- ](?:changing|evolving)|digital|modern|competitive|rapidly[- ]\w+|dynamic|busy|hyper[- ]\w+|connected)\b/gi,
      /\b(?:the|an|this|our)\s+ever[- ](?:evolving|changing)\s+(?:landscape|world|realm|space)\b/gi,
      /\bimagine a world where\b/gi,
    ], 'era opener; open with the reader\'s fact'),
  },
  {
    id: 'EN-SIGNIFICANCE', defaultSeverity: 'warn', fragmentSafe: true,
    test: phrase([
      /\bplay(?:s|ed|ing)?\s+(?:a|an)\s+(?:crucial|pivotal|key|vital|critical|essential|important|central|significant|instrumental)\s+role\b/gi,
      /\b(?:is|stands as|serves as|remains)\s+a\s+testament\s+to\b/gi,
      /\bunderscor(?:e|es|ed|ing)\s+the\s+(?:importance|significance|need|value)\b/gi,
      /\bmarks?\s+a\s+(?:pivotal|significant|major)\s+(?:shift|moment|milestone)\b/gi,
    ], 'importance narrated instead of shown; state the consequence'),
  },
  {
    id: 'EN-PARTICIPLE-TAIL', defaultSeverity: 'warn', fragmentSafe: true,
    test: phrase([
      /,\s+(?:ensuring|highlighting|showcasing|underscoring|emphasi[sz]ing|fostering|solidifying|cementing|paving the way)\b[^.!?]*/gi,
    ], 'sentence-final participial tail that comments rather than informs; cut it or make it a sentence with a subject'),
  },
  {
    id: 'EN-HEDGE', defaultSeverity: 'warn', fragmentSafe: true,
    test: phrase([
      /\b(?:could|may|might|can)\s+potentially\b/gi,
      /\b(?:may|might|could)\s+possibly\b/gi,
      /\bit(?:'s|’s|\s+is)\s+(?:important|worth|crucial)\s+(?:to\s+note|noting)\b/gi,
    ], 'stacked or performed hedge; one qualifier, placed where the uncertainty is'),
  },
  {
    id: 'EN-LATIN', defaultSeverity: 'warn', fragmentSafe: true,
    test: (str) => scan(str, /(?<![\p{L}])(e\.g\.|i\.e\.|etc\.?)(?![\p{L}])/giu, (m) => ({
      message: `"${m[0]}": write it out`, suggestion: { 'e.g.': 'for example', 'i.e.': 'that is', etc: 'and so on (or a complete list)', 'etc.': 'and so on (or a complete list)' }[m[0].toLowerCase()],
    })),
  },
  {
    id: 'EN-LINK', defaultSeverity: 'warn', fragmentSafe: true,
    test(str) {
      const t = str.toLowerCase().replace(/^[\s\p{P}\p{S}]+|[\s\p{P}\p{S}]+$/gu, '').replace(/\s+/g, ' ');
      if (!LINK_TEXT.has(t)) return [];
      const start = str.search(/\p{L}/u);
      return [{ index: start, length: t.length, message: 'link text that does not state its destination (WCAG 2.4.4)' }];
    },
  },
  {
    id: 'EN-CASE', defaultSeverity: 'warn', fragmentSafe: true,
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
    test(str, ctx) {
      if (!ctx.role.button) return [];
      const m = /(?<!\.)\.\s*$/.exec(str);
      return m ? [{ index: m.index, length: 1, message: 'full stop at the end of a button label' }] : [];
    },
  },
  {
    id: 'EN-ELLIPSIS', defaultSeverity: 'warn', fragmentSafe: true,
    test(str, ctx) {
      const e = ctx.contract.ellipsis;
      if (e === 'char') return scan(str, /(?<!\.)\.\.\.(?!\.)/g, () => ({ message: 'three dots; the contract declares the ellipsis character', suggestion: '…' }));
      if (e === 'dots') return scan(str, /…/g, () => ({ message: 'ellipsis character; the contract declares three dots', suggestion: '...' }));
      return [];
    },
  },
  {
    id: 'EN-QUOTES', defaultSeverity: 'warn', fragmentSafe: true,
    test(str, ctx) {
      const q = ctx.contract.quotes;
      if (q === 'curly') {
        if (/=\s*"|"\s*:/.test(str)) return [];
        return scan(str, /"/g, () => ({ message: 'straight double quote; the contract declares curly quotes' })).slice(0, 1);
      }
      if (q === 'straight') return scan(str, /[“”]/g, () => ({ message: 'curly double quote; the contract declares straight quotes' })).slice(0, 1);
      return [];
    },
  },
  {
    id: 'EN-AMPERSAND', defaultSeverity: 'warn', fragmentSafe: true,
    test(str, ctx) {
      if (ctx.kind !== 'sentence' && !ctx.role.heading) return [];
      return scan(str, / & /g, () => ({ offset: 1, length: 1, message: '"&" in running text or a heading; write "and"' })).map((f) => ({ ...f, length: 1 }));
    },
  },
  {
    id: 'EN-MINIMIZER', defaultSeverity: 'warn', fragmentSafe: true,
    // Only where the word claims the READER's effort: sentence-initial ("Simply drag..."), after
    // "you can / lets you", or before an instruction verb. "may simply have edited" (merely) and
    // "explains ideas simply" (manner) are native and stay silent - both were smoke-test false positives.
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
    test: () => [],
  },
];

export const RULE_IDS = RULES.map((r) => r.id);

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

const EXCLAIM = /[\p{L}\p{N})"'’”]!+(?=\s|$|["'’”)])/gu;

/**
 * Lint extracted records. Returns findings:
 * { rule, severity, file, line, key, raw, text, span, index, message, suggestion, record }.
 */
export function lintRecords(records, contract) {
  const active = RULES.filter((r) => contract.rules[r.id] !== 'off');
  const properNouns = collectProperNouns(records);
  const findings = [];
  for (const rec of records) {
    const role = roleOf(rec, contract);
    const ctx = { contract, role, kind: rec.kind, key: rec.key, file: rec.file, properNouns, text: rec.text };
    const seen = new Set();
    for (const rule of active) {
      if (rule.fileLevel) continue;
      if (rec.kind === 'fragment' && !rule.fragmentSafe) continue;
      for (const variant of rec.variants) {
        const str = rule.raw ? variant : maskText(variant, contract.terms.accept);
        const vctx = variant === rec.text ? ctx : { ...ctx, text: variant };
        for (const f of rule.test(str, vctx)) {
          const span = variant.slice(f.index, f.index + (f.length ?? 0));
          const sig = `${rule.id}|${f.message}|${span}`;
          if (seen.has(sig)) continue;
          seen.add(sig);
          findings.push({ rule: rule.id, severity: severityFor(rule, f, contract), file: rec.file, line: rec.line, key: rec.key, raw: rec.raw, text: variant, span, index: f.index, message: f.message, suggestion: f.suggestion, record: rec });
        }
      }
    }
  }
  // EN-EXCLAIM: at most one per surface (a catalog namespace or a file); none in error-class strings.
  const exclaim = active.find((r) => r.id === 'EN-EXCLAIM');
  if (exclaim) {
    const units = new Map();
    for (const rec of records) {
      const m = [...rec.text.matchAll(EXCLAIM)];
      if (!m.length) continue;
      const role = roleOf(rec, contract);
      const emit = (message) => findings.push({ rule: exclaim.id, severity: severityFor(exclaim, {}, contract), file: rec.file, line: rec.line, key: rec.key, raw: rec.raw, text: rec.text, span: rec.text.slice(m[0].index, m[0].index + m[0][0].length), index: m[0].index, message, record: rec });
      if (role.error) { emit('exclamation mark in an error-class string'); continue; }
      const ns = /^[\w-]+(?=[.[])/.exec(rec.key || '');
      const unit = `${rec.file}::${ns && !String(rec.key).startsWith('<') ? ns[0] : ''}`;
      const n = (units.get(unit) || 0) + 1;
      units.set(unit, n);
      if (n > 1) emit(`exclamation mark #${n} on one surface (${ns ? `namespace "${ns[0]}"` : 'this file'}); at most one per page`);
    }
  }
  return findings;
}
