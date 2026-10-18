// overlay - reads the takeover-app project overlay, <repo>/.claude/takeover-app/config.md.
//
// WHY its own parser: registry scripts are builtins-only Node (no YAML dependency), and the overlay needs one level
// more than `key: value` - the `ado:` block nests `areaPathMap:` under it. This reads the YAML subset the overlay
// documents and nothing else: block maps by indentation, scalars (true/false/null, numbers, quoted or bare strings),
// inline lists `[a, b]`, `#` comments. Anything it cannot read is an error that names the line, never a guess.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const OVERLAY_PATH = '.claude/takeover-app/config.md';

const scalar = (raw, where) => {
  const v = raw.trim();
  if (v === '' || v === '~' || v === 'null') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (/^".*"$/.test(v)) { try { return JSON.parse(v); } catch { throw new Error(`${where}: bad double-quoted string ${v}`); } }
  if (/^'.*'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
  if (/^\[.*\]$/.test(v)) return v.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean).map((x) => scalar(x, where));
  return v;
};
const unquoteKey = (k) => (/^".*"$/.test(k) ? JSON.parse(k) : /^'.*'$/.test(k) ? k.slice(1, -1) : k);
const stripComment = (line) => {
  let q = null;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (q) { if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
  }
  return line;
};

/** The YAML subset above -> a plain object. */
export function parseYamlSubset(text, file = 'overlay') {
  const root = {};
  const stack = [{ indent: -1, obj: root }];
  const lines = String(text).split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = stripComment(lines[i]).replace(/\s+$/, '');
    if (!line.trim()) continue;
    const where = `${file}:${i + 1}`;
    if (/^\s*-\s/.test(line)) throw new Error(`${where}: block lists are not read here; write an inline list [a, b]`);
    const m = /^(\s*)("(?:[^"\\]|\\.)*"|'[^']*'|[^:]+?)\s*:(?:\s+(.*))?$/.exec(line);
    if (!m) throw new Error(`${where}: not a 'key: value' line`);
    const indent = m[1].length;
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    const key = unquoteKey(m[2].trim());
    if (m[3] === undefined || m[3].trim() === '') {
      const child = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else parent[key] = scalar(m[3], where);
  }
  // an empty block (`key:` with nothing under it) is null, not {}
  const nullEmpty = (o) => { for (const [k, v] of Object.entries(o)) if (v && typeof v === 'object' && !Array.isArray(v)) { if (!Object.keys(v).length) o[k] = null; else nullEmpty(v); } return o; };
  return nullEmpty(root);
}

/** Frontmatter + `## <Section>` bodies of a config.md. */
export function parseOverlay(text, file = OVERLAY_PATH) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(String(text));
  const fm = m ? parseYamlSubset(m[1], file) : {};
  const body = m ? m[2] : String(text);
  const sections = {};
  let cur = null;
  for (const line of body.split(/\r?\n/)) {
    const h = /^##\s+(.+?)\s*$/.exec(line);
    if (h) { cur = h[1]; sections[cur] = []; continue; }
    if (cur) sections[cur].push(line);
  }
  for (const k of Object.keys(sections)) sections[k] = sections[k].join('\n').trim();
  return { ...fm, sections };
}

/** The overlay of a product repo, or {overlay: 'defaults'} when it has none. */
export function readOverlay(root) {
  const p = join(root, OVERLAY_PATH);
  if (!existsSync(p)) return { overlay: 'defaults', sections: {} };
  return { overlay: OVERLAY_PATH, ...parseOverlay(readFileSync(p, 'utf8'), OVERLAY_PATH) };
}
