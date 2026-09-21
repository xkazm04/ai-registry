// icu.mjs - expand ICU MessageFormat (and i18next double-brace) messages into
// rendered English samples before any prose rule runs. Builtins only.
//
// Lint rendered text, not message syntax: deleting a placeholder breaks grammar
// rules ("Hi , welcome"), so a placeholder becomes a neutral sample instead -
// "Alex" for a name, "3" for anything count-like. plural/select take the `other`
// branch for the primary text; every other branch is rendered as an extra
// variant so a defect that lives only in `one {...}` is still seen.

const COUNT_LIKE = /^(count|n|num|number|total|amount|qty|quantity|days?|hours?|minutes?|mins?|seconds?|secs?|weeks?|months?|years?|size|limit|max|min|percent|pct|index|idx|step|steps|pages?|items?|rounds?|remaining|left|done|value|score|price|cost|version|position|rank)$|(Count|Total|Number|Num|Amount|Qty|Days|Hours|Minutes|Seconds|Size|Limit|Max|Min|Percent|Index|Price|Score)\d*$/;

const MAX_VARIANTS = 12;

export function sampleFor(name, type) {
  if (type === 'number' || type === 'plural' || type === 'selectordinal') return '3';
  if (type === 'date') return 'Monday';
  if (type === 'time') return '10:30';
  return COUNT_LIKE.test(String(name || '').trim()) ? '3' : 'Alex';
}

class IcuError extends Error {}

/** Parse into nodes: string | {arg,name,type,options} | {pound} | {tag,children}. */
export function parseIcu(msg) {
  let i = 0;
  const s = msg;

  function readUntil(chars) {
    const start = i;
    while (i < s.length && !chars.includes(s[i])) i++;
    return s.slice(start, i);
  }
  function ws() { while (i < s.length && /\s/.test(s[i])) i++; }

  function nodes(stopBrace, inPlural, closeTag) {
    const out = [];
    let buf = '';
    const flush = () => { if (buf) { out.push(buf); buf = ''; } };
    while (i < s.length) {
      const c = s[i];
      if (c === '}' && stopBrace) { flush(); return out; }
      if (c === '{') { flush(); out.push(arg(inPlural)); continue; }
      if (c === '#' && inPlural) { flush(); out.push({ pound: true }); i++; continue; }
      if (c === "'") {
        if (s[i + 1] === "'") { buf += "'"; i += 2; continue; }
        if (s[i + 1] === '{' || s[i + 1] === '}' || (inPlural && s[i + 1] === '#')) {
          const end = s.indexOf("'", i + 1);
          if (end === -1) { buf += s.slice(i + 1); i = s.length; continue; }
          buf += s.slice(i + 1, end); i = end + 1; continue;
        }
        buf += c; i++; continue;
      }
      if (c === '<') {
        const close = /^<\/([A-Za-z][\w-]*)\s*>/.exec(s.slice(i));
        if (close && closeTag) { flush(); i += close[0].length; return out; }
        const selfClose = /^<([A-Za-z][\w-]*)\s*\/>/.exec(s.slice(i));
        if (selfClose) { flush(); i += selfClose[0].length; out.push(' '); continue; }
        const open = /^<([A-Za-z][\w-]*)>/.exec(s.slice(i));
        if (open && s.includes(`</${open[1]}>`, i)) {
          flush(); i += open[0].length;
          out.push({ tag: open[1], children: nodes(false, inPlural, open[1]) });
          continue;
        }
      }
      buf += c; i++;
    }
    if (stopBrace) throw new IcuError('unclosed brace');
    flush();
    return out;
  }

  function arg(inPlural) {
    i++; // {
    ws();
    const name = readUntil(',}').trim();
    if (s[i] === '}') { i++; return { arg: true, name, type: null }; }
    i++; // ,
    ws();
    const type = readUntil(',}').trim();
    if (s[i] === '}') { i++; return { arg: true, name, type }; }
    i++; // ,
    if (type === 'plural' || type === 'select' || type === 'selectordinal') {
      const options = {};
      const order = [];
      for (;;) {
        ws();
        if (i >= s.length) throw new IcuError('unclosed select');
        if (s[i] === '}') { i++; break; }
        const sel = readUntil('{ \t\r\n').trim();
        if (sel.startsWith('offset:')) { continue; }
        ws();
        if (s[i] !== '{') throw new IcuError(`expected { after ${sel}`);
        i++;
        options[sel] = nodes(true, type !== 'select' || inPlural, null);
        order.push(sel);
        i++; // }
      }
      return { arg: true, name, type, options, order };
    }
    // number/date/time with a style: skip to the matching brace
    let depth = 1;
    while (i < s.length && depth > 0) { if (s[i] === '{') depth++; else if (s[i] === '}') depth--; i++; }
    if (depth !== 0) throw new IcuError('unclosed format');
    return { arg: true, name, type };
  }

  const out = nodes(false, false, null);
  return out;
}

function branchCount(sel) {
  if (sel === 'one' || sel === '=1') return '1';
  if (sel === 'zero' || sel === '=0') return '0';
  if (sel === 'two' || sel === '=2') return '2';
  return '3';
}

function render(ns, pick, pound = '3') {
  let out = '';
  for (const n of ns) {
    if (typeof n === 'string') out += n;
    else if (n.pound) out += pound;
    // an empty rich tag (<path></path>) is filled by the call site: sample it, never delete it
    else if (n.tag) out += n.children.length ? render(n.children, pick, pound) : sampleFor(n.tag);
    else if (n.options) {
      const choice = pick.get(n) ?? (n.options.other ? 'other' : n.order[n.order.length - 1]);
      const p = n.type === 'select' ? pound : branchCount(choice);
      out += render(n.options[choice] || [], pick, p);
    } else out += sampleFor(n.name, n.type);
  }
  return out;
}

function selectNodes(ns, acc = []) {
  for (const n of ns) {
    if (typeof n === 'string' || n.pound) continue;
    if (n.tag) selectNodes(n.children, acc);
    else if (n.options) { acc.push(n); for (const k of n.order) selectNodes(n.options[k], acc); }
  }
  return acc;
}

/**
 * Expand a message. Returns { text, variants, icuError }. `variants[0] === text`.
 * A malformed message falls back to replacing simple {name} placeholders.
 */
export function expandIcu(message) {
  const pre = String(message).replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, n) => `{${n.split('.').pop()}}`);
  if (!/[{<#']/.test(pre)) return { text: pre, variants: [pre], icuError: null };
  let tree;
  try {
    tree = parseIcu(pre);
  } catch (e) {
    const text = pre
      .replace(/\{\s*[\w.]+\s*,\s*(?:plural|select|selectordinal)\s*,/g, '')
      .replace(/(?:^|\s)(?:=\d+|zero|one|two|few|many|other|[\w-]+)\s*\{([^{}]*)\}/g, (m, body) => (/\bother\s*\{/.test(m) || !/[{}]/.test(body) ? ` ${body}` : m))
      .replace(/\{\s*([\w.]+)[^{}]*\}/g, (_, n) => sampleFor(n))
      .replace(/#/g, '3')
      .replace(/[{}]/g, '')
      .replace(/<\/?[A-Za-z][\w-]*\s*\/?>/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return { text, variants: [text], icuError: e.message };
  }
  const text = render(tree, new Map());
  const variants = [text];
  for (const node of selectNodes(tree)) {
    for (const sel of node.order) {
      if (sel === 'other') continue;
      if (variants.length >= MAX_VARIANTS) break;
      const v = render(tree, new Map([[node, sel]]));
      if (!variants.includes(v)) variants.push(v);
    }
  }
  return { text, variants, icuError: null };
}
