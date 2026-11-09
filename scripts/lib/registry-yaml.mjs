/**
 * registry-yaml - the ONE reader of this repository's `registry.yaml`. NOT a YAML parser.
 *
 * ## Why
 *
 * `registry.yaml` declares itself "the authority on what lanes this repository carries",
 * yet until this file existed no script read it: README.md restated it by hand and the two
 * drifted (measured 2026-11-09: README said eight lanes against nine declared, and the
 * publications lane was missing from its table). A generator that derives the README from
 * the declaration needs a reader, and the repository is dependency-free, so there is no
 * YAML library to reach for.
 *
 * A general YAML parser written here would be a second, worse implementation of a large
 * specification. This reader accepts exactly the subset `registry.yaml` uses and REFUSES
 * everything else with the line number, so a construct it does not understand is a loud
 * error and never a silently wrong value:
 *
 *   - nested maps by indentation (spaces only; a tab is refused)
 *   - `key: value` with a bare key ([A-Za-z_][A-Za-z0-9_-]*); duplicate keys are refused
 *   - plain scalars, including a plain scalar folded over continuation lines that are
 *     indented deeper than its key (joined with one space, as YAML folds them)
 *   - "double-quoted" (JSON escapes) and 'single-quoted' ('' escape) scalars on one line
 *   - inline lists `[a, b]` of plain or quoted scalars (nothing nested)
 *   - block lists `- item` of scalars, indented deeper than their key
 *   - `# comments`, whole-line or after a value (` #`)
 *   - plain `true`/`false`, `null`/`~` and integers are typed; everything else is a string
 *
 * Refused, by name: anchors `&` and aliases `*`, tags `!`, block scalars `|` and `>`,
 * flow maps `{`, document markers `---` / `...`, complex keys `? `, quoted keys, a list
 * item that is a map, indentation that does not return to an open level, and anything
 * else that is not one of the shapes above.
 *
 * Note on folding: `registry.yaml` has continuation lines that contain ": " inside the
 * prose (for example `Text-only: the` in `lanes.publications.format`). This reader folds
 * them as text, which is what the authors meant. A strict YAML parser may reject such a
 * line - a consumer that switches to one should test against today's file first.
 */
import fs from 'node:fs';
import path from 'node:path';

export class RegistryYamlError extends Error {
  constructor(message, line, source) {
    super(`${source}:${line}: ${message}`);
    this.name = 'RegistryYamlError';
    this.line = line;
  }
}

const KEY = /^([A-Za-z_][A-Za-z0-9_-]*):(?:\s+(.*)|\s*)$/;

/** Strip a trailing ` # comment` from an unquoted fragment. */
const stripComment = (s) => {
  const m = /(^|\s)#/.exec(s);
  return (m ? s.slice(0, m.index) : s).trimEnd();
};

/**
 * Split a value fragment into its value and drop a trailing comment. A quoted scalar or an
 * inline list runs to its closing character; only a comment may follow it.
 */
function valuePart(raw, fail) {
  const s = raw.trim();
  let end = -1;
  if (s[0] === '"') {
    for (let k = 1; k < s.length; k += 1) {
      if (s[k] === '\\') { k += 1; continue; }
      if (s[k] === '"') { end = k; break; }
    }
    if (end === -1) fail('unterminated double-quoted scalar (a quoted scalar must close on its line)');
  } else if (s[0] === "'") {
    for (let k = 1; k < s.length; k += 1) {
      if (s[k] !== "'") continue;
      if (s[k + 1] === "'") { k += 1; continue; }
      end = k; break;
    }
    if (end === -1) fail('unterminated single-quoted scalar (a quoted scalar must close on its line)');
  } else if (s[0] === '[') {
    end = s.indexOf(']');
    if (end === -1) fail('inline list must close on the same line');
  } else {
    return stripComment(s);
  }
  const tail = s.slice(end + 1);
  if (!/^\s*(#.*)?$/.test(tail)) fail(`unexpected text after a closed value: ${JSON.stringify(tail.trim().slice(0, 40))}`);
  return s.slice(0, end + 1);
}

/** Parse one scalar fragment (already comment-stripped where that applies). */
function scalar(raw, fail) {
  const s = raw.trim();
  if (s === '') return null;
  const c = s[0];
  if (c === '&') fail('anchors (&) are not supported');
  if (c === '*') fail('aliases (*) are not supported');
  if (c === '!') fail('tags (!) are not supported');
  if (c === '|' || c === '>') fail(`block scalars (${c}) are not supported`);
  if (c === '{') fail('flow maps ({...}) are not supported');
  if (c === '@' || c === '`') fail(`a plain scalar may not start with ${c}`);
  if (c === '"') {
    if (s.length < 2 || !s.endsWith('"') || /(^|[^\\])(\\\\)*"/.test(s.slice(1, -1))) fail('unterminated or malformed double-quoted scalar (one line only)');
    try { return JSON.parse(s); } catch { fail('double-quoted scalar uses an escape this reader does not support'); }
  }
  if (c === "'") {
    if (s.length < 2 || !s.endsWith("'") || /'/.test(s.slice(1, -1).replace(/''/g, ''))) fail('unterminated or malformed single-quoted scalar (one line only)');
    return s.slice(1, -1).replace(/''/g, "'");
  }
  if (c === '[') {
    if (!s.endsWith(']')) fail('inline list must close on the same line');
    const body = s.slice(1, -1).trim();
    if (body === '') return [];
    if (/[[\]{}]/.test(body)) fail('nested collections inside an inline list are not supported');
    return body.split(',').map((item) => {
      const v = item.trim();
      if (v === '') fail('empty item in an inline list');
      return scalar(v, fail);
    });
  }
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '~') return null;
  if (/^-?\d+$/.test(s)) return Number(s);
  return s;
}

/**
 * Parse the text of a registry.yaml. Returns a plain object. Throws RegistryYamlError
 * naming the line for anything outside the supported subset.
 */
export function parseRegistryYaml(text, { source = 'registry.yaml' } = {}) {
  const lines = String(text).replace(/^﻿/, '').split(/\r?\n/);
  const root = {};
  // Stack of open containers: { indent, kind: 'map'|'list', value, key? }
  const stack = [{ indent: -1, kind: 'map', value: root }];
  // A `key:` with no value waits here until the next content line decides what it holds.
  let pending = null; // { indent, parent, key, line }
  // A plain scalar that may continue on deeper-indented lines.
  let folding = null; // { indent, parent, key }

  for (let i = 0; i < lines.length; i += 1) {
    const n = i + 1;
    const fail = (msg) => { throw new RegistryYamlError(msg, n, source); };
    const line = lines[i];
    if (/^\s*$/.test(line)) { folding = null; continue; }
    const lead = /^[ \t]*/.exec(line)[0];
    if (lead.includes('\t')) fail('tab in indentation is not supported');
    const indent = lead.length;
    const body = line.slice(indent);
    if (body.startsWith('#')) { folding = null; continue; }

    // Continuation of a folded plain scalar.
    if (folding && indent > folding.indent) {
      const more = stripComment(body);
      folding.parent[folding.key] = `${folding.parent[folding.key]} ${more}`;
      continue;
    }
    folding = null;

    if (indent === 0 && (body === '---' || body === '...' || body.startsWith('--- ') || body.startsWith('... '))) fail('document markers (--- / ...) are not supported');
    if (body.startsWith('? ') || body === '?') fail('complex keys (?) are not supported');

    // Resolve a pending `key:` now that we see the next content line.
    if (pending) {
      if (indent > pending.indent) {
        const container = body.startsWith('- ') || body === '-' ? [] : {};
        pending.parent[pending.key] = container;
        stack.push({ indent, kind: Array.isArray(container) ? 'list' : 'map', value: container });
      } else {
        pending.parent[pending.key] = null;
      }
      pending = null;
    }

    // Close containers this line dedents out of.
    while (stack.length > 1 && indent < stack[stack.length - 1].indent) stack.pop();
    const top = stack[stack.length - 1];
    if (indent !== top.indent && top.indent !== -1) fail(`indentation ${indent} does not match the open level (${top.indent})`);
    if (top.indent === -1 && indent !== 0) fail(`unexpected indentation ${indent} at the top level`);

    if (top.kind === 'list') {
      if (!(body.startsWith('- ') || body === '-')) fail('expected a list item (- ...) at this indentation');
      const item = body === '-' ? '' : body.slice(2);
      if (KEY.test(item.trim())) fail('a list item that is a map is not supported');
      const frag = valuePart(item, fail);
      if (frag.trim() === '') fail('an empty list item is not supported');
      top.value.push(scalar(frag, fail));
      continue;
    }

    if (body.startsWith('- ') || body === '-') fail('a list item here needs a key above it, indented less');
    if (body[0] === '"' || body[0] === "'") fail('quoted keys are not supported');
    const m = KEY.exec(body);
    if (!m) fail(`not a "key: value" line this reader understands: ${JSON.stringify(body.slice(0, 60))}`);
    const [, key, rest = ''] = m;
    if (Object.prototype.hasOwnProperty.call(top.value, key)) fail(`duplicate key "${key}"`);
    const value = valuePart(rest, fail);
    if (value === '') {
      top.value[key] = null;
      pending = { indent, parent: top.value, key, line: n };
      continue;
    }
    const parsed = scalar(value, fail);
    top.value[key] = parsed;
    // Only an unquoted, non-list plain scalar may fold onto following deeper lines.
    if (typeof parsed === 'string' && !/^["'[]/.test(value)) folding = { indent, parent: top.value, key };
  }
  return root;
}

/** Read and parse `<root>/registry.yaml`. */
export function readRegistryYaml(root) {
  const file = path.join(root, 'registry.yaml');
  return parseRegistryYaml(fs.readFileSync(file, 'utf8'), { source: 'registry.yaml' });
}

/**
 * The declared lanes, in file order: [{ name, path, holds, spec, gate, depth, status, ... }].
 * `gate` and `status` are null where the lane declares none (librarian/ has no gate).
 * Every other field the lane declares is carried through untouched.
 */
export function lanesOf(doc) {
  const lanes = doc?.lanes;
  if (!lanes || typeof lanes !== 'object' || Array.isArray(lanes)) throw new Error('registry.yaml declares no `lanes:` map');
  return Object.entries(lanes).map(([name, lane]) => {
    if (!lane || typeof lane !== 'object' || Array.isArray(lane)) throw new Error(`registry.yaml lane "${name}" is not a map`);
    return { name, ...lane, gate: lane.gate ?? null, status: lane.status ?? null };
  });
}
