// extract.mjs - enumerate every rendered English string in a source file. Builtins only.
//
// Coverage is counted, not claimed: every extractor returns the strings it found so
// the CLI can print what it covered. The fleet incident this module is shaped by: a
// catalog gate flattened nested objects but stored arrays as single leaf values and
// returned early for non-strings, so 62 strings per locale were never checked - and the
// only banned character left in that catalog sat inside one of them. Arrays, and
// objects inside arrays, are walked here like everything else.
//
// Record shape: { file, line, key, raw, text, variants, kind: 'fragment'|'sentence', tag }

import { expandIcu, sampleFor } from './icu.mjs';

// ------------------------------------------------------------------ shared helpers

export function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (offset) => {
    let lo = 0; let hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= offset) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
}

/** Fragment: fewer than 5 words, or no terminal punctuation. */
export function classify(text) {
  const words = String(text).trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  const terminal = /[.!?…]["'”’)\]]*$/.test(String(text).trim());
  return words.length < 5 || !terminal ? 'fragment' : 'sentence';
}

const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', copy: '©', reg: '®', trade: '™', middot: '·', times: '×', rarr: '→', larr: '←', bull: '•' };
export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') { const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(cp) ? String.fromCodePoint(cp) : m; }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

export function makeRecord(file, line, key, raw, { icu = true, tag = null } = {}) {
  const exp = icu ? expandIcu(raw) : { text: raw, variants: [raw] };
  return { file, line, key, raw, text: exp.text, variants: exp.variants, kind: classify(exp.text), tag, icuError: exp.icuError || null };
}

// ------------------------------------------------------------------ JSON catalogs

class ParseError extends Error {}

/** Walk a JSON document keeping the line of every string leaf. Arrays included. */
export function walkJson(text) {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  JSON.parse(src); // strict validity first; throws with the engine's message
  const lineAt = lineIndex(src);
  const leaves = [];
  let i = 0;
  const ws = () => { while (i < src.length && /\s/.test(src[i])) i++; };
  const str = () => {
    const start = i; i++;
    while (i < src.length) {
      const c = src[i];
      if (c === '\\') { i += 2; continue; }
      if (c === '"') { i++; return { value: JSON.parse(src.slice(start, i)), start }; }
      i++;
    }
    throw new ParseError('unterminated string');
  };
  const join = (p, k) => (p ? `${p}.${k}` : k);
  const value = (p) => {
    ws();
    const c = src[i];
    if (c === '{') {
      i++; ws();
      if (src[i] === '}') { i++; return; }
      for (;;) {
        ws();
        const k = str().value; ws();
        if (src[i] !== ':') throw new ParseError('expected :');
        i++;
        value(join(p, k)); ws();
        if (src[i] === ',') { i++; continue; }
        if (src[i] === '}') { i++; return; }
        throw new ParseError('expected , or }');
      }
    }
    if (c === '[') {
      i++; ws();
      if (src[i] === ']') { i++; return; }
      let n = 0;
      for (;;) {
        value(`${p}[${n}]`); ws(); n++;
        if (src[i] === ',') { i++; continue; }
        if (src[i] === ']') { i++; return; }
        throw new ParseError('expected , or ]');
      }
    }
    if (c === '"') { const s = str(); leaves.push({ key: p, value: s.value, line: lineAt(s.start) }); return; }
    const m = /^(-?\d+(\.\d+)?([eE][+-]?\d+)?|true|false|null)/.exec(src.slice(i, i + 64));
    if (!m) throw new ParseError(`unexpected token at ${i}`);
    i += m[0].length;
  };
  value('');
  return leaves;
}

export function extractJson(text, file) {
  return walkJson(text)
    .filter((l) => /\p{L}/u.test(l.value))
    .map((l) => makeRecord(file, l.line, l.key, l.value));
}

// ------------------------------------------------------------------ TS / TSX / JSX

const PROSE_ATTRS = new Set(['alt', 'title', 'aria-label', 'placeholder', 'label', 'aria-description', 'aria-placeholder', 'aria-roledescription', 'aria-valuetext']);
const SKIP_KEYS = new Set(['className', 'class', 'href', 'src', 'srcSet', 'id', 'key', 'type', 'role', 'variant', 'size', 'color', 'as', 'rel', 'target', 'method', 'path', 'pathname', 'route', 'url', 'icon', 'style', 'sizes', 'fill', 'stroke', 'width', 'height', 'locale', 'lang', 'format', 'pattern', 'mode', 'kind', 'status', 'slug', 'value', 'd', 'viewBox', 'xmlns', 'name', 'htmlFor', 'testId', 'data-testid', 'query', 'sql', 'regex', 'mimeType', 'contentType', 'encoding', 'accept', 'autoComplete', 'inputMode', 'media', 'crossOrigin', 'referrerPolicy', 'loading', 'decoding', 'fetchPriority', 'dir', 'transform', 'transition', 'easing', 'cursor', 'display', 'position', 'font', 'fontFamily', 'fontWeight', 'background', 'border', 'boxShadow', 'dataKey', 'event', 'selector', 'matcher', 'env', 'model', 'provider', 'endpoint', 'headers', 'method', 'animation', 'gradient', 'tone', 'intent', 'align', 'justify', 'side', 'placement', 'anchor', 'hash', 'code', 'command', 'cmd', 'shortcut', 'hotkey', 'keys', 'image', 'img', 'ogImage', 'thumbnail', 'avatar', 'logo', 'domain', 'host', 'email']);
const SKIP_CALLEE_LAST = new Set(['t', 'tr', 'useTranslations', 'getTranslations', 'getT', 'cn', 'clsx', 'classNames', 'twMerge', 'cva', 'tv', 'require', 'import', 'Error', 'TypeError', 'RangeError', 'SyntaxError', 'querySelector', 'querySelectorAll', 'getElementById', 'addEventListener', 'removeEventListener', 'fetch', 'redirect', 'push', 'replace', 'prefetch', 'URL', 'RegExp', 'Symbol', 'get', 'has', 'set', 'getItem', 'setItem', 'removeItem', 'matchMedia', 'setAttribute', 'getAttribute', 'describe', 'it', 'test', 'expect', 'assert', 'invariant', 'sql', 'css', 'keyframes', 'gql', 'graphql', 'notFound', 'revalidatePath', 'revalidateTag', 'cookies', 'split', 'join', 'startsWith', 'endsWith', 'includes', 'indexOf', 'match', 'matchAll', 'test', 'exec', 'localeCompare', 'toLocaleString', 'toLocaleDateString', 'Intl', 'DateTimeFormat', 'NumberFormat', 'format', 'parse', 'stringify', 'dynamic', 'lazy', 'track', 'capture', 'emit', 'on', 'off', 'once', 'dispatch']);
const SKIP_CALLEE_ROOT = new Set(['console', 'logger', 'log', 'debug', 'process', 'Sentry', 'posthog', 'analytics', 'z', 'path', 'fs', 'crypto', 'Buffer', 'JSON', 'Object', 'Array', 'Reflect', 'Math', 'Number', 'Date']);
const KEYWORDS_EXPR = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await', 'default', 'extends', 'instanceof']);
const INLINE_TAGS = new Set(['a', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'code', 'data', 'dfn', 'em', 'i', 'kbd', 'mark', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr', 'br', 'Link', 'Trans', 'NextLink', 'Fragment', '']);
const NON_EN_LOCALE_KEY = /^(cs|de|fr|es|it|pl|sk|pt|nl|ru|uk|ja|zh|ko|ar|he|hu|ro|sv|da|fi|nb|no|tr|el|bg|hr|sl|sr|lt|lv|et|vi|th|id|ms|hi|bn|fa|ca|eu|gl|cy|ga|is|mt|sq|mk|bs|be|ka|hy|az|kk|uz|mn|ne|si|ta|te|kn|ml|mr|gu|pa|ur|sw|af|zu|xh|am|tl|fil)([-_][A-Za-z]{2,4})?$/;
const EN_LOCALE_KEY = /^en([-_](US|GB|AU|CA|NZ|IE|IN))?$/i;
const DICT_NAME = /^(T|copy|COPY|strings|STRINGS|messages|MESSAGES|dict|DICT|dictionary|DICTIONARY|labels|LABELS|text|TEXT|texts|TEXTS|content|CONTENT|i18n|I18N|l10n|L10N|en|EN|translations|TRANSLATIONS)$|(Copy|COPY|Strings|STRINGS|Messages|MESSAGES|Labels|LABELS|Text|TEXT|Texts|Dict|DICT|Content|CONTENT)$/;
const DIRECTIVE = /^use (client|server|strict|cache)$/;

const TW_TOKEN = /^!?-?((sm|md|lg|xl|2xl|dark|hover|focus|focus-visible|focus-within|active|disabled|group-hover|group|peer|first|last|odd|even|motion-safe|motion-reduce|aria-[\w-]+|data-[\w-]+|supports-[\w-]+|placeholder|file|before|after|print|rtl|ltr|max-\w+|min-\w+)(:|\/))*-?(m|p|mx|my|px|py|mt|mb|ml|mr|ms|me|pt|pb|pl|pr|ps|pe|w|h|size|min-w|max-w|min-h|max-h|gap|gap-x|gap-y|space-x|space-y|text|bg|border|border-[trblxy]|rounded|rounded-[\w]+|shadow|flex|grid|col|cols|row|rows|items|justify|content|font|leading|tracking|z|top|left|right|bottom|inset|inset-x|inset-y|opacity|ring|ring-offset|stroke|fill|translate-x|translate-y|rotate|scale|duration|delay|ease|transition|overflow|overflow-x|overflow-y|object|place|self|order|decoration|underline-offset|line-clamp|aspect|sr|basis|grow|shrink|from|via|to|outline|divide|divide-[xy]|backdrop|blur|brightness|whitespace|break|align|list|indent|columns|snap|scroll|touch|select|resize|appearance|accent|caret|will-change|origin|skew|animate|cursor|pointer-events|mix-blend|bg-blend|isolation|table|caption|float|clear|box|drop-shadow|hue-rotate|invert|saturate|sepia|grayscale|contrast|stack|line)(-[\w./\[\]%#(),:'-]+)?$/;
const TW_WORD = /^!?-?((sm|md|lg|xl|2xl|dark|hover|focus|active|group|peer|disabled)(:))*(flex|grid|block|inline|inline-block|inline-flex|hidden|relative|absolute|fixed|sticky|static|isolate|truncate|uppercase|lowercase|capitalize|normal-case|italic|underline|container|shrink|grow|antialiased|visible|invisible|contents|border|rounded|shadow|ring|outline|transition|transform|filter|sr-only|not-sr-only|prose|group|peer|table|underline|no-underline|ordinal|tabular-nums|break-words|break-all|select-none|pointer-events-none|resize|italic|not-italic)$/;

export function isClassNameLike(s) {
  const toks = s.trim().split(/\s+/);
  if (!toks.length || /[.!?]$/.test(s.trim())) return false;
  if (/[A-Z]/.test(s) && !/\[[^\]]*[A-Z]/.test(s)) return false;
  const hits = toks.filter((t) => TW_TOKEN.test(t) || TW_WORD.test(t)).length;
  return hits / toks.length >= 0.6;
}
export const isUrlLike = (s) => /^\s*(https?:|mailto:|tel:|www\.|\/[\w\-/.[\]]*$|#[\w-]+$|\.{0,2}\/)/.test(s) || /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(s.trim());

export function isProse(s, inDict) {
  const t = s.trim();
  if (!/\p{L}/u.test(t)) return false;
  if (DIRECTIVE.test(t)) return false;
  if (isUrlLike(t) || isClassNameLike(t)) return false;
  if (/^[\w$.-]+$/.test(t) && !inDict) return false; // identifier-ish, no space
  if (/^[a-z][\w]*(\.[\w]+)+$/.test(t)) return false; // dotted key path
  if (/^[\w-]+\/[\w-]+/.test(t) && !/\s/.test(t)) return false;
  if (/^(SELECT|INSERT|UPDATE|DELETE|WITH|CREATE)\s/i.test(t) && /\b(FROM|INTO|SET|TABLE)\b/i.test(t)) return false;
  if (/^[\d\s.,:;()%+\-/*px]+$|^\(?(min|max)-(width|height)/.test(t)) return false;
  if (/[{};]\s*$/.test(t) && /[:=]/.test(t)) return false; // code-ish
  if (inDict) return true;
  return /\p{L}{2,}\s+\p{L}{2,}/u.test(t);
}

function unescapeJs(body) {
  return body.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])/g, (_, e) => {
    if (e[0] === 'u') return String.fromCodePoint(parseInt(e[1] === '{' ? e.slice(2, -1) : e.slice(1), 16));
    if (e[0] === 'x' && e.length === 3) return String.fromCharCode(parseInt(e.slice(1), 16));
    return { n: '\n', t: '\t', r: '', b: '', f: '', v: '', 0: '\0', '\n': '', '\r': '' }[e] ?? e;
  });
}

const PUNCT = ['===', '!==', '...', '**=', '??=', '&&=', '||=', '=>', '&&', '||', '??', '?.', '==', '!=', '<=', '>=', '++', '--', '+=', '-=', '*=', '/=', '%=', '**'];

/**
 * Lex a TS/TSX/JS/JSX module. `jsx` enables JSX parsing (tsx, jsx, mdx files).
 * Returns records; a parse failure in JSX mode retries without JSX (degraded).
 */
export function extractCode(text, file, { jsx = /\.(tsx|jsx)$/i.test(file) } = {}) {
  try {
    return lexCode(text, file, jsx);
  } catch (e) {
    if (!jsx) throw e;
    const recs = lexCode(text, file, false);
    for (const r of recs) r.degraded = true;
    return recs;
  }
}

function lexCode(src, file, jsxEnabled) {
  const lineAt = lineIndex(src);
  const out = [];
  let i = 0;
  let prev = null;          // last significant token (string form)
  let identChain = [];      // identifiers joined by . before a (
  let declName = null;      // const X = ...
  let assignName = null;
  const root = { type: 'root', key: null, pendingKey: null, index: 0, skip: false, locale: null, dict: false, callee: null };
  const stack = [root];
  const top = () => stack[stack.length - 1];

  const inherited = () => {
    let skip = false; let nonEn = false; let dict = false; let jsxTag = null;
    for (const f of stack) {
      if (f.skip) skip = true;
      if (f.nonEn) nonEn = true;
      if (f.dict) dict = true;
      if (f.jsxTag !== undefined && f.jsxTag !== null) jsxTag = f.jsxTag;
    }
    return { skip, nonEn, dict, jsxTag };
  };

  const keyPath = (extra) => {
    const segs = [];
    for (const f of stack) {
      if (f.key) segs.push(f.key);
      if (f.type === '[') segs.push(`[${f.index}]`);
    }
    if (extra) segs.push(extra);
    return segs.join('.').replace(/\.\[/g, '[');
  };

  const openFrame = (type, extra = {}) => {
    const parent = top();
    let key = null;
    if (type === '{' || type === '[') key = parent.pendingKey || (assignName && parent.type === 'root' ? assignName : null);
    if (parent.pendingKey && (type === '{' || type === '[')) parent.pendingKey = null;
    if (type !== '(') assignName = null;
    const frame = { type, key, pendingKey: null, index: 0, skip: false, nonEn: false, dict: false, ...extra };
    if (key) {
      if (SKIP_KEYS.has(key)) frame.skip = true;
      if (NON_EN_LOCALE_KEY.test(key)) frame.nonEn = true;
      if (EN_LOCALE_KEY.test(key) || DICT_NAME.test(key)) frame.dict = true;
    }
    stack.push(frame);
    return frame;
  };

  const emitString = (value, start, { template = false } = {}) => {
    const f = top();
    const own = f.type === '{' ? f.pendingKey : null;
    const inh = inherited();
    if (inh.skip || inh.nonEn) return;
    if (own && (SKIP_KEYS.has(own) || NON_EN_LOCALE_KEY.test(own))) return;
    if (prev === 'from' || prev === 'import' || prev === 'require') return;
    const dict = inh.dict || (own && EN_LOCALE_KEY.test(own));
    const v = template ? value.replace(/\s*\n\s*/g, ' ') : value;
    if (!isProse(v, dict)) return;
    const key = own ? keyPath(own) : (keyPath() || (inh.jsxTag ? `<${inh.jsxTag}>` : ''));
    out.push(makeRecord(file, lineAt(start), key, v, { tag: inh.jsxTag }));
  };

  const skipLineComment = () => { while (i < src.length && src[i] !== '\n') i++; };
  const skipBlockComment = () => { const e = src.indexOf('*/', i + 2); i = e === -1 ? src.length : e + 2; };

  const readQuoted = (q) => {
    const start = i; i++;
    while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; else if (src[i] === '\n') break; i++; }
    const body = src.slice(start + 1, i);
    i++;
    return { value: unescapeJs(body), start };
  };

  const regexAllowed = () => prev === null || KEYWORDS_EXPR.has(prev) || /^[(,=:[!&|?{};+\-*%<>~^]$|^(=>|&&|\|\||\?\?|==|===|!=|!==|<=|>=)$/.test(prev);
  const jsxAllowed = () => jsxEnabled && (prev === null || KEYWORDS_EXPR.has(prev) || /^[(,=:[{};?!]$|^(=>|&&|\|\||\?\?)$/.test(prev) || prev === '}');

  // template literal: returns rendered text with ${} -> {name} placeholders (sampled later)
  const readTemplate = () => {
    const start = i; i++;
    let buf = '';
    while (i < src.length && src[i] !== '`') {
      if (src[i] === '\\') { buf += unescapeJs(src.slice(i, i + 2)); i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') {
        i += 2;
        const exprStart = i;
        openFrame('${', { skip: true });
        const savedPrev = prev; prev = '(';
        codeUntil('}');
        stack.pop();
        prev = savedPrev;
        const expr = src.slice(exprStart, i - 1).trim();
        const name = (/([A-Za-z_$][\w$]*)\s*(\(\s*\))?\s*$/.exec(expr) || [])[1] || 'value';
        buf += `{${name}}`;
        continue;
      }
      buf += src[i]; i++;
    }
    i++;
    return { value: buf, start };
  };

  // Parse code until the given closing char at depth 0 of this call (consumes it).
  function codeUntil(close) {
    const baseDepth = stack.length;
    while (i < src.length) {
      const c = src[i];
      const n = src[i + 1];
      if (c === '/' && n === '/') { skipLineComment(); continue; }
      if (c === '/' && n === '*') { skipBlockComment(); continue; }
      if (/\s/.test(c)) { i++; continue; }
      if (c === '"' || c === "'") {
        const { value, start } = readQuoted(c);
        // key detection: "key": inside an object after { or ,
        const f = top();
        let j = i; while (j < src.length && /[ \t]/.test(src[j])) j++;
        if (src[j] === ':' && f.type === '{' && (prev === '{' || prev === ',')) { f.pendingKey = value; prev = 'key'; i = j + 1; prev = ':'; continue; }
        emitString(value, start);
        prev = 'str'; identChain = []; continue;
      }
      if (c === '`') {
        const tagged = prev && /^[A-Za-z_$][\w$]*$/.test(prev) && !KEYWORDS_EXPR.has(prev);
        const { value, start } = readTemplate();
        if (!tagged) emitString(value, start, { template: true });
        prev = 'tpl'; identChain = []; continue;
      }
      if (/[A-Za-z_$]/.test(c)) {
        const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i, i + 256));
        const word = m[0];
        i += word.length;
        const f = top();
        let j = i; while (j < src.length && /[ \t]/.test(src[j])) j++;
        if (src[j] === ':' && src[j + 1] !== ':' && f.type === '{' && (prev === '{' || prev === ',')) { f.pendingKey = word; i = j + 1; prev = ':'; identChain = []; continue; }
        if (prev === '.' || prev === '?.') identChain.push(word); else identChain = [word];
        if (prev === 'const' || prev === 'let' || prev === 'var') declName = word;
        prev = word;
        continue;
      }
      if (/\d/.test(c)) { const m = /^[\d_.xXa-fA-FeEn]+/.exec(src.slice(i, i + 64)); i += m[0].length; prev = 'num'; identChain = []; continue; }
      if (c === '<' && jsxAllowed() && /[A-Za-z>]/.test(n || '')) {
        const save = { i, prev, depth: stack.length };
        try {
          parseJsxElement(null);
          prev = 'jsx'; identChain = [];
          continue;
        } catch (e) {
          if (!(e instanceof JsxAbort)) throw e;
          i = save.i; stack.length = save.depth; prev = save.prev;
        }
      }
      if (c === '/' && regexAllowed()) {
        i++;
        let inClass = false;
        while (i < src.length && src[i] !== '\n') {
          if (src[i] === '\\') { i += 2; continue; }
          if (src[i] === '[') inClass = true; else if (src[i] === ']') inClass = false;
          else if (src[i] === '/' && !inClass) break;
          i++;
        }
        i++;
        while (/[a-z]/.test(src[i] || '')) i++;
        prev = 'regex'; identChain = []; continue;
      }
      // punctuation
      let p = c;
      for (const op of PUNCT) if (src.startsWith(op, i)) { p = op; break; }
      i += p.length;
      if (p === '=' && declName) { assignName = declName; declName = null; }
      if (p === ';' && top().type === 'root') { declName = null; assignName = null; }
      if (p === '(') {
        const callee = identChain.join('.');
        const last = identChain[identChain.length - 1];
        const skip = identChain.length > 0 && (SKIP_CALLEE_LAST.has(last) || SKIP_CALLEE_ROOT.has(identChain[0])) && !KEYWORDS_EXPR.has(last) && last !== 'if' && last !== 'switch';
        openFrame('(', { callee, skip });
      } else if (p === '{' || p === '[') {
        openFrame(p);
      } else if (p === ')' || p === '}' || p === ']') {
        if (stack.length > baseDepth) stack.pop();
        else if (p === close) { prev = p; return; }
        else if (close) { /* unbalanced inside expression: tolerate */ }
      } else if (p === ',') {
        const f = top();
        if (f.type === '[') f.index += 1;
        if (f.type === '{') f.pendingKey = null;
      }
      prev = p;
      // a member access keeps the chain: `console.warn(` must reach the callee check as
      // console.warn, not as a bare `warn` whose root was reset at the dot
      if (p !== '.' && p !== '?.') identChain = [];
    }
    if (close) throw new JsxAbort('eof in expression');
  }

  class JsxAbort extends Error {}

  // Parse a JSX element starting at '<'. `acc` collects inline text of a block parent.
  function parseJsxElement(acc) {
    i++; // <
    let tag = '';
    if (src[i] === '>') { i++; parseJsxChildren('', acc); return; }
    const m = /^[A-Za-z][\w.:-]*/.exec(src.slice(i, i + 128));
    if (!m) throw new JsxAbort('no tag');
    tag = m[0]; i += tag.length;
    let hidden = false; // aria-hidden="true" / {true}: decoration, not copy
    // generic / comparison guard
    let j = i; while (/\s/.test(src[j] || '')) j++;
    if (src[j] === ',' || src.startsWith('extends', j)) throw new JsxAbort('generic');
    // attributes
    for (;;) {
      while (i < src.length && /\s/.test(src[i])) i++;
      if (i >= src.length) throw new JsxAbort('eof in tag');
      if (src.startsWith('/>', i)) { i += 2; return; }
      if (src[i] === '>') { i++; break; }
      if (src.startsWith('/*', i)) { skipBlockComment(); continue; }
      if (src.startsWith('//', i)) { skipLineComment(); continue; }
      if (src[i] === '{') {
        i++; openFrame('{', { skip: true, jsxTag: tag }); const sp = prev; prev = '('; codeUntilBrace(); stack.pop(); prev = sp; continue;
      }
      const an = /^[A-Za-z_$][\w$:.-]*/.exec(src.slice(i, i + 128));
      if (!an) throw new JsxAbort(`bad attribute char ${src[i]}`);
      const name = an[0]; i += name.length;
      while (/\s/.test(src[i] || '')) i++;
      if (src[i] !== '=') continue;
      i++;
      while (/\s/.test(src[i] || '')) i++;
      const prose = PROSE_ATTRS.has(name) || PROSE_ATTRS.has(name.toLowerCase());
      if (src[i] === '"' || src[i] === "'") {
        const q = src[i]; const start = i; const end = src.indexOf(q, i + 1);
        if (end === -1) throw new JsxAbort('unterminated attr');
        const value = decodeEntities(src.slice(i + 1, end));
        i = end + 1;
        if (name === 'aria-hidden' && value.trim() !== 'false') hidden = true;
        if (prose && /\p{L}/u.test(value) && !inherited().skip && !inherited().nonEn) out.push(makeRecord(file, lineAt(start), `<${tag} ${name}>`, value, { tag: `${tag}[${name}]` }));
        continue;
      }
      if (src[i] === '{') {
        if (name === 'aria-hidden' && /^\{\s*true\s*\}/.test(src.slice(i, i + 16))) hidden = true;
        i++;
        const exprStart = i;
        openFrame('{', { skip: !prose, jsxTag: `${tag}[${name}]`, dict: prose, attr: name });
        const sp = prev; prev = '(';
        const before = out.length;
        codeUntilBrace();
        stack.pop(); prev = sp;
        // a prose attribute holding one string literal: keyed by the attribute
        for (let k = before; k < out.length; k++) if (!out[k].key || out[k].key.startsWith('<')) out[k].key = `<${tag} ${name}>`;
        void exprStart;
        continue;
      }
      throw new JsxAbort('attr value');
    }
    if (tag === 'script' || tag === 'style' || tag === 'code' || tag === 'pre') {
      const close = src.indexOf(`</${tag}`, i);
      if (close === -1) throw new JsxAbort('unclosed raw tag');
      i = src.indexOf('>', close) + 1;
      return;
    }
    if (hidden) {
      // aria-hidden content is decoration (a no-data glyph beside its sr-only label, an icon
      // character): parse it to stay in sync, into a sink that never reaches the rules
      openFrame('jsx', { skip: true, jsxTag: tag });
      parseJsxChildren(tag, newAcc(tag));
      stack.pop();
      return;
    }
    const inline = INLINE_TAGS.has(tag);
    if (inline && acc) {
      if (tag === 'br') { acc.parts.push(' '); }
      parseJsxChildren(tag, acc);
    } else {
      if (acc) flushAcc(acc);
      parseJsxChildren(tag, null);
    }
  }

  function codeUntilBrace() {
    // parse code until the matching } (the opening { already consumed and framed)
    const depth = stack.length;
    const savedLen = depth;
    // push a sentinel so codeUntil pops back to it
    codeUntil('}');
    if (stack.length > savedLen) stack.length = savedLen;
  }

  function newAcc(tag) { return { tag, parts: [], line: null }; }
  function flushAcc(acc) {
    const joined = acc.parts.join('');
    acc.parts = [];
    // collapse ASCII whitespace only: JS \s also matches U+00A0, and a real &nbsp; is rendered copy
    const text = decodeEntities(joined).replace(/[ \t\r\n\f\v]+/g, ' ').replace(/^[ \t\r\n\f\v]+|[ \t\r\n\f\v]+$/g, '');
    const line = acc.line; acc.line = null;
    const letters = text.replace(/\{[\w$]+\}/g, '');
    if (!/\p{L}{2,}/u.test(letters)) return;
    const inh = inherited();
    if (inh.skip || inh.nonEn) return;
    out.push(makeRecord(file, line, `<${acc.tag}>`, text, { tag: acc.tag }));
  }

  function parseJsxChildren(tag, parentAcc) {
    const acc = parentAcc || newAcc(tag || 'fragment');
    const frame = openFrame('jsx', { jsxTag: tag || null });
    void frame;
    for (;;) {
      if (i >= src.length) throw new JsxAbort(`unclosed <${tag}>`);
      if (src.startsWith('</', i)) {
        const m = /^<\/\s*([A-Za-z][\w.:-]*)?\s*>/.exec(src.slice(i, i + 140));
        if (!m) throw new JsxAbort('bad close');
        i += m[0].length;
        break;
      }
      if (src[i] === '<') {
        if (/[A-Za-z>]/.test(src[i + 1] || '')) {
          const childTag = (/^<([A-Za-z][\w.:-]*)/.exec(src.slice(i, i + 128)) || [null, ''])[1];
          if (INLINE_TAGS.has(childTag)) { parseJsxElement(acc); } else { flushAcc(acc); parseJsxElement(null); }
          continue;
        }
        throw new JsxAbort('stray <');
      }
      if (src[i] === '{') {
        i++;
        let j = i; while (/\s/.test(src[j] || '')) j++;
        if (src.startsWith('/*', j)) { const e = src.indexOf('*/', j); const close = src.indexOf('}', e); i = close + 1; continue; }
        const lit = /^\s*(["'])( ?)\1\s*\}/.exec(src.slice(i, i + 12));
        if (lit) { acc.parts.push(' '); i += lit[0].length; continue; }
        const exprStart = i;
        openFrame('{', { jsxTag: tag || null });
        const sp = prev; prev = '(';
        const before = out.length;
        codeUntilBrace();
        stack.pop(); prev = sp;
        const expr = src.slice(exprStart, i - 1).trim();
        const produced = out.length > before;
        if (!produced && /^[\w$.?]+(\([^()]*\))?$/.test(expr) && !/^t\(|\.t\(|^t\b/.test(expr)) {
          const nm = (/([A-Za-z_$][\w$]*)\s*(\([^()]*\))?$/.exec(expr) || [])[1] || 'value';
          if (acc.line === null) acc.line = lineAt(exprStart);
          acc.parts.push(`{${nm}}`);
        } else if (!produced) {
          acc.parts.push(' ');
        }
        continue;
      }
      const start = i;
      while (i < src.length && src[i] !== '<' && src[i] !== '{') i++;
      const chunk = src.slice(start, i);
      if (/\S/.test(chunk) && acc.line === null) acc.line = lineAt(start + chunk.search(/\S/));
      // JSX whitespace: lines are trimmed and joined; a newline-only gap vanishes
      const norm = chunk.includes('\n') ? chunk.split('\n').map((l, k, arr) => (k === 0 ? l.replace(/\s+$/, '') : k === arr.length - 1 ? l.replace(/^\s+/, '') : l.trim())).filter((l, k, arr) => l || k === 0 || k === arr.length - 1).join(' ') : chunk;
      acc.parts.push(norm);
    }
    stack.pop();
    if (!parentAcc) flushAcc(acc);
  }

  codeUntil(null);
  return out;
}

// ------------------------------------------------------------------ Markdown / MDX

function cleanInline(s) {
  return decodeEntities(s)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    .replace(/<https?:[^>]+>/g, '')
    .replace(/`[^`]+`/g, 'code')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\{[^{}]*\}/g, '{value}')
    .replace(/<\/?[A-Za-z][^>]*>/g, '')
    .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '$2')
    .replace(/(^|[\s(])[*_](?=\S)([^*_\n]*?\S)[*_](?=[\s).,;:!?]|$)/g, '$1$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/\\$/g, '')
    .replace(/[ \t\r\n\f\v]+/g, ' ') // ASCII only: a real U+00A0 is rendered copy
    .replace(/^ | $/g, '');
}

export function extractMarkdown(text, file, { mdx = /\.mdx$/i.test(file) } = {}) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  const out = [];
  let k = 0;
  if (/^(---|\+\+\+)\s*$/.test(lines[0] || '')) {
    const fence = lines[0].trim();
    k = 1;
    while (k < lines.length && lines[k].trim() !== fence) k++;
    k++;
  }
  let para = null;
  let fence = null;
  let inComment = false;
  let inEsm = false;
  const flush = () => {
    if (!para) return;
    const t = cleanInline(para.parts.join(' '));
    if (/\p{L}{2,}/u.test(t)) out.push(makeRecord(file, para.line, para.tag, t, { icu: true, tag: para.tag }));
    para = null;
  };
  const push = (tag, content, line) => {
    const t = cleanInline(content);
    if (/\p{L}{2,}/u.test(t)) out.push(makeRecord(file, line, tag, t, { tag }));
  };
  for (; k < lines.length; k++) {
    const line = lines[k];
    const ln = k + 1;
    const fm = /^\s*(```+|~~~+)/.exec(line);
    if (fence) { if (fm && fm[1][0] === fence[0] && fm[1].length >= fence.length) fence = null; continue; }
    if (fm) { flush(); fence = fm[1]; continue; }
    if (inComment) { if (line.includes('-->')) inComment = false; continue; }
    if (/^\s*<!--/.test(line)) { flush(); if (!line.includes('-->')) inComment = true; continue; }
    if (inEsm) { if (/^\s*$/.test(line)) inEsm = false; continue; }
    if (mdx && /^(import|export)\s/.test(line)) { flush(); if (!/;\s*$/.test(line) && !/from\s+['"][^'"]+['"]\s*$/.test(line)) inEsm = true; continue; }
    if (/^\s*$/.test(line)) { flush(); continue; }
    const img = [...line.matchAll(/!\[([^\]]+)\]\([^)]*\)/g)];
    for (const m of img) push('img[alt]', m[1], ln);
    const h = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (h) { flush(); push(`h${h[1].length}`, h[2], ln); continue; }
    if (/^\s*\|/.test(line)) {
      flush();
      if (/^\s*\|?\s*:?-{3,}/.test(line)) continue;
      for (const cell of line.split('|').slice(1, -1)) push('td', cell, ln);
      continue;
    }
    if (mdx && /^\s*<\/?[A-Za-z][^>]*\/?>\s*$/.test(line)) { flush(); continue; }
    const li = /^\s*([-*+]|\d+[.)])\s+(.*)$/.exec(line);
    if (li) { flush(); para = { tag: 'li', parts: [li[2]], line: ln }; continue; }
    const bq = /^\s*>\s?(.*)$/.exec(line);
    const content = bq ? bq[1] : line;
    if (!para) para = { tag: bq ? 'blockquote' : 'p', parts: [], line: ln };
    para.parts.push(content.replace(/\s{2,}$/, ''));
  }
  flush();
  return out;
}

// ------------------------------------------------------------------ dispatch

export const KINDS = ['json-catalog', 'ts-module', 'jsx', 'mdx', 'markdown'];

export function extractFile(text, file, kind) {
  switch (kind) {
    case 'json-catalog': return extractJson(text, file);
    case 'ts-module':
    case 'jsx': return extractCode(text, file, { jsx: kind === 'jsx' || /\.(tsx|jsx)$/i.test(file) });
    case 'mdx': return extractMarkdown(text, file, { mdx: true });
    case 'markdown': return extractMarkdown(text, file, { mdx: false });
    default: throw new Error(`unknown kind ${kind}`);
  }
}

export { sampleFor };
