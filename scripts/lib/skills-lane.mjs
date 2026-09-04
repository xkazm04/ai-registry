// skills-lane — the ONE reader of the `skills/` lane.
//
// check-skills.mjs (the gate), build-catalog.mjs (the catalog's `skills` entries),
// build-marketplace.mjs (the plugin marketplace) and fleet-audit.mjs (the operator-side
// instrument) all need the same facts about a skill: its frontmatter, its body, which
// files it ships, its content digest and its lessons. Four copies of that walk would be
// four answers to "what is in the lane"; this module is the single one.
//
// Zero dependencies, like every script in this registry.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Files and directories a published skill may carry (docs/skills-lane.md, "The shape").
export const SKILL_FILE = 'SKILL.md';
export const LESSONS_FILE = 'LESSONS.md';
// `tests` joined the declared set when the lane's minimum test tier started standing:
// a skill that ships instruments carries `node --test`-shaped tests beside them.
export const ALLOWED_DIRS = new Set(['references', 'scripts', 'tools', 'assets', 'tests']);
// Never published: run artifacts, installed dependencies and mutable state. State lives
// in the CONSUMING repository's declared overlay (or the plugin data directory), never in
// the lane — otherwise every copy diverges on first use.
export const FORBIDDEN_DIRS = new Set(['node_modules', 'out', 'output', 'state', 'dist', '.cache', 'tmp']);
export const FORBIDDEN_FILES = new Set(['.personas-skill-meta.json', '.DS_Store', 'Thumbs.db']);
export const FORBIDDEN_FILE_RE = /\.local\.[a-z0-9]+$/i;

// The content digest recipe is SHARED with the reference consumer (Ascent's
// `contentDigest`): sha256 over the artifact's FULL text with CRLF/CR folded to LF,
// first 16 hex, tagged `sha256-n1` (normalization revision 1). Two sides computing it
// identically is the whole point of tagging it.
export const DIGEST_PREFIX = 'sha256-n1';
export const contentDigest = (text) =>
  `${DIGEST_PREFIX}:${crypto.createHash('sha256').update(String(text).replace(/\r\n?/g, '\n')).digest('hex').slice(0, 16)}`;

// Minimal YAML-subset frontmatter parser: scalars, `- item` lists, inline [a, b],
// quoted scalars, trailing ` # comment` stripped. Anything fancier in a frontmatter block
// is a contract violation anyway. Returns null when the file does not open with `---`.
export const parseFrontmatter = (raw) => {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  const fm = {};
  let currentKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && currentKey) {
      fm[currentKey].push(item[1].replace(/\s+#.*$/, '').trim());
      continue;
    }
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!kv) continue;
    const [, key, valRaw] = kv;
    const val = valRaw.replace(/\s+#.*$/, '').trim();
    if (val === '') { fm[key] = []; currentKey = key; }
    else if (val === '[]') { fm[key] = []; currentKey = null; }
    else if (val.startsWith('[')) {
      fm[key] = val.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean);
      currentKey = null;
    } else { fm[key] = val.replace(/^["']|["']$/g, ''); currentKey = null; }
  }
  return { fm, raw: m[0], body: raw.slice(m[0].length) };
};

export const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/;
export const parseSemver = (v) => {
  const m = SEMVER_RE.exec(String(v ?? '').trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
};
export const cmpSemver = (a, b) => (a[0] - b[0]) || (a[1] - b[1]) || (a[2] - b[2]);

// `## <version used> - <YYYY-MM-DD> - <project>`. The separator may be an ASCII hyphen or
// an em/en dash — the Personas skill standard writes the dash and this lane's lessons are
// merged from both. The version slot accepts a range (`0.1-1.0`) and two-part versions,
// because a lesson records the version a run USED, which may predate semver.
export const LESSON_HEAD_RE = /^## \S[^\n]*? [-–—] \d{4}-\d{2}-\d{2} [-–—] \S/;
export const lessonHeadings = (raw) => raw.split(/\r?\n/).filter((l) => l.startsWith('## '));

const walk = (dir, rel = '', acc = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      acc.push({ rel: r, dir: true });
      // Do not descend into forbidden trees — listing node_modules is the slow path the
      // gate exists to refuse, not to enumerate.
      if (!FORBIDDEN_DIRS.has(e.name)) walk(path.join(dir, e.name), r, acc);
    } else {
      acc.push({ rel: r, dir: false, size: e.isFile() ? fs.statSync(path.join(dir, e.name)).size : 0 });
    }
  }
  return acc;
};

/**
 * Read one skill directory. Never throws for a malformed skill — it returns what it could
 * read plus `problems`, so a gate can report every defect in one pass and a builder can
 * skip the broken entry without losing the rest of the lane.
 */
export const readSkill = (laneDir, name) => {
  const dir = path.join(laneDir, name);
  const skillPath = path.join(dir, SKILL_FILE);
  const out = {
    name, dir, rel: `skills/${name}`, exists: fs.existsSync(skillPath),
    raw: null, fm: {}, body: '', contentHash: null, lines: 0,
    lessons: 0, lessonsHash: null, lessonsRaw: null, lessonsPath: null,
    files: [], problems: [],
  };
  if (!out.exists) { out.problems.push('no SKILL.md'); return out; }
  try { out.raw = fs.readFileSync(skillPath, 'utf8'); } catch (e) { out.problems.push(`SKILL.md unreadable (${e.message})`); return out; }
  out.contentHash = contentDigest(out.raw);
  out.lines = out.raw.split(/\r?\n/).length;
  const parsed = parseFrontmatter(out.raw);
  if (parsed) { out.fm = parsed.fm; out.body = parsed.body; } else out.problems.push('no frontmatter');
  const lessonsPath = path.join(dir, LESSONS_FILE);
  if (fs.existsSync(lessonsPath)) {
    out.lessonsPath = `skills/${name}/${LESSONS_FILE}`;
    out.lessonsRaw = fs.readFileSync(lessonsPath, 'utf8');
    out.lessons = lessonHeadings(out.lessonsRaw).length;
    out.lessonsHash = contentDigest(out.lessonsRaw);
  }
  out.files = walk(dir);
  return out;
};

/** Every skill directory in the lane, sorted. FATAL conditions are the caller's to decide. */
export const readLane = (laneDir) => {
  const dirs = fs.readdirSync(laneDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
  return dirs.map((d) => readSkill(laneDir, d));
};

/** Sub-resource findings for one skill: forbidden dirs/files, lockfile discipline. */
export const subResourceFindings = (skill) => {
  const fails = [];
  const notes = [];
  let hasPackageJson = false;
  let hasLock = false;
  for (const f of skill.files) {
    const top = f.rel.split('/')[0];
    const base = path.posix.basename(f.rel);
    if (f.dir && f.rel === top && FORBIDDEN_DIRS.has(top)) {
      fails.push(`${skill.rel}/${top}/ must not be published — ${top === 'node_modules' ? 'declare dependencies in package.json + a lockfile and let the consumer install them' : 'run artifacts and mutable state live in the consuming repo, never in the lane'}`);
    } else if (f.dir && f.rel === top && !ALLOWED_DIRS.has(top)) {
      notes.push(`${skill.rel}/${top}/ is not one of the declared sub-resource directories (${[...ALLOWED_DIRS].join(', ')}) — allowed, but say in SKILL.md what it is for`);
    }
    if (!f.dir) {
      if (FORBIDDEN_FILES.has(base) || FORBIDDEN_FILE_RE.test(base)) fails.push(`${skill.rel}/${f.rel} must not be published (installation-local file)`);
      if (f.rel === 'package.json') hasPackageJson = true;
      if (/^(package-lock\.json|npm-shrinkwrap\.json|bun\.lockb?|pnpm-lock\.yaml|yarn\.lock)$/.test(f.rel)) hasLock = true;
      if (f.rel.endsWith('.md') && f.rel !== SKILL_FILE && f.rel !== LESSONS_FILE && f.rel === `${path.posix.basename(f.rel)}` && /^skill\.md$/i.test(f.rel)) {
        fails.push(`${skill.rel}/${f.rel}: the method file must be named exactly SKILL.md (case matters on the consumer's filesystem)`);
      }
    }
  }
  if (hasPackageJson && !hasLock) fails.push(`${skill.rel}/package.json without a lockfile — consumers install with \`npm ci\`, which needs package-lock.json`);
  return { fails, notes };
};
