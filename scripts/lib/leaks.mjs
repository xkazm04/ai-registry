/**
 * leaks - the one table of what a machine's filesystem, or a person, looks like in text.
 *
 * This registry is public, and five gates exist to keep machine paths out of it:
 * check-public-paths (every published lane), check-usage and check-signals (the counts
 * lanes), check-runs (the committed run log) and check-projects (the fleet declaration).
 * Until 2026-10-25 they used three pattern tables - two of them hand-synced copies - and
 * a probe with planted paths found the same holes in all of them: lowercase
 * `c:\users\<n>\`, a WSL mount (`/mnt/c/Users/<n>/`), a home-relative layout (`~/code/x/`,
 * `$HOME/`, `%USERPROFILE%\`), and a profile path with no trailing separator
 * (`C:\Users\<n>` at the end of a sentence). Three tables meant three places to widen and
 * no reason to believe any of them had been. So the forms live here, once, and each gate
 * names the PRESET that says what its lane is allowed to carry:
 *
 *   PUBLISHED    prose and code (docs, knowledge, skills, ...). Teaching text names paths
 *                all the time, so only what identifies a machine fires: a user-profile
 *                path whose user is not a placeholder, and a home-relative path that spells
 *                a layout (`~/<dir>/<more>`), never a dot-dir (`~/.claude/projects` is a
 *                tool's path, not a machine) and never a JS module specifier
 *                (`from '~/lib/x'` is a tsconfig alias).
 *   FREE_TEXT    projects.json and the run log: free text by design, but no absolute path
 *                of any kind, no home anchor, no email. URLs stay legal - a run's source
 *                link is evidence.
 *   COUNTS_ONLY  usage/ and signals/: counts and slugs and nothing else, so additionally
 *                no `../` escape and no URL.
 *
 * Every form carries positive controls, and `assertScanner` runs them before a gate
 * reports: a must-not-match scan with a dead pattern and a clean lane print the same
 * thing (gate-liveness). A scanner that no longer fires on its own control is FATAL.
 *
 * No comment stripping, on purpose: a leak inside a code comment is still published.
 *
 * Builtins only - this file imports nothing.
 */

// One path segment: anything up to a separator, whitespace, a quote or a shell metachar.
// `<` is excluded, so `C:\Users\<user>\` never matches at all.
const SEG = String.raw`[^\\/\s\x60'"<>|:*?]+`;

// Names that teach rather than leak, and Windows' shared profile folders.
// `node_modules`: `C:\Users\node_modules` is the literal a broken junction resolves to,
// which a worktree recipe has to be able to name.
export const PLACEHOLDERS = Object.freeze(new Set([
  'me', 'you', 'x', 'y', 'u', 'user', 'username', 'name', 'example', 'someone', 'somebody',
  'foo', 'jdoe', 'alice', 'bob',
  'public', 'default', 'all users', 'default user', 'node_modules',
]));

/** A segment that is a placeholder (`<user>`, `%USERNAME%`, `$USER`, `{name}`, `me`, `...`). */
function isPlaceholder(segment) {
  const s = segment.replace(/[.,;:!)\]}…]+$/, '');
  if (!s || /^[<%${[]/.test(s)) return true;
  return PLACEHOLDERS.has(s.toLowerCase());
}

// The home anchors: what a shell or a doc writes instead of a profile path.
const ANCHOR = String.raw`(?:~|\$HOME\b|\$\{HOME\}|%(?:USERPROFILE|HOMEPATH)%|\$env:(?:USERPROFILE|HOME)\b)`;
// Not a word char, a separator, a dot or another `~` (`~~x~~/g`, `blank/~/x`, `a.~/b`).
const ANCHOR_START = String.raw`(?<![\w~/\\.$%-])`;
// A JS/TS module specifier: `from '~/x'`, `import('~/x')`, `require("~/x")`, `vi.mock('~/x')`.
const NOT_SPECIFIER = String.raw`(?<!(?:\bfrom|\bimport|\brequire|\bmock)\s*\(?\s*['"])`;

/**
 * The table. Order is specificity: when two forms match at overlapping spans, the earlier
 * one is reported and the later dropped, so one leak reads as one finding.
 * `segment` names the capture group that may be a placeholder.
 */
export const FORMS = Object.freeze([
  {
    id: 'windows-profile',
    what: 'a Windows user-profile path',
    re: new RegExp(String.raw`(?<![A-Za-z])[A-Za-z]:[\\/]{1,2}Users[\\/]{1,2}(${SEG})`, 'gi'),
    segment: 1,
    controls: ['C:\\Users\\jane\\code\\x.ts', 'c:\\users\\jane\\x', 'see C:\\Users\\jane.', 'C:/Users/jane'],
  },
  {
    id: 'wsl-profile',
    what: 'a WSL-mounted Windows profile path',
    re: new RegExp(String.raw`\/mnt\/[A-Za-z]\/Users\/(${SEG})`, 'gi'),
    segment: 1,
    controls: ['/mnt/c/Users/jane/code', 'in /mnt/d/users/jane'],
  },
  {
    id: 'wsl-unc-home',
    what: 'a WSL home path through its Windows share',
    // `\\wsl.localhost\<distro>\home\<n>` (or the older `\\wsl$\`), either slash, JSON-escaped
    // or not: what Explorer copies for a file in a distro. posix-home cannot see it - the
    // `/home` follows the distro name, not a separator boundary.
    re: new RegExp(String.raw`(?:\\{2,4}|\/\/)wsl(?:\.localhost|\$)[\\/]{1,2}${SEG}[\\/]{1,2}home[\\/]{1,2}(${SEG})`, 'gi'),
    segment: 1,
    controls: [String.raw`\\wsl.localhost\Ubuntu\home\jane\code`, String.raw`\\wsl$\Debian\home\jane`, '//wsl.localhost/Ubuntu/home/jane'],
  },
  {
    id: 'posix-home',
    what: 'a POSIX home path',
    // not after `:` - `C:/Users/<n>` is windows-profile's; not after a word char - a
    // repo-relative `src/home/page` is not a home directory
    re: new RegExp(String.raw`(?<![\w.~:-])\/(?:home|Users)\/(${SEG})`, 'g'),
    segment: 1,
    controls: ['cloned to /home/runner/work/repo', 'on a Mac: /Users/jane', '(/home/jane)'],
  },
  {
    id: 'home-layout',
    what: 'a home-relative path',
    // an anchor, a non-dot directory, a separator, and more path: a layout under a home
    re: new RegExp(String.raw`${ANCHOR_START}${NOT_SPECIFIER}${ANCHOR}[\\/](?![.<{*$%])(${SEG})[\\/][^\s\x60'"<>|]`, 'gi'),
    segment: 1,
    controls: ['under ~/code/app/src', '$HOME/work/repo', '%USERPROFILE%\\code\\app', '${HOME}/src/x', '$env:USERPROFILE\\kiro\\x'],
  },
  {
    id: 'home-anchor',
    what: 'a home-directory reference',
    // any home anchor that starts a path, or a bare Windows/PowerShell home variable
    re: new RegExp(String.raw`${ANCHOR_START}(?:${ANCHOR}[\\/]|%(?:USERPROFILE|HOMEPATH)%|\$env:(?:USERPROFILE|HOME)\b)`, 'gi'),
    controls: ['~/.claude/projects', '$HOME/x', '%USERPROFILE%', '~\\kiro'],
  },
  {
    id: 'windows-drive',
    what: 'a Windows path',
    // the lookbehind keeps `https://` (its `s:/`) from reading as a drive letter
    re: /(?<![A-Za-z])[A-Za-z]:[\\/]/g,
    controls: ['C:\\Users\\x\\y', 'D:/work/repo'],
  },
  {
    id: 'posix-system',
    what: 'a POSIX home/system path',
    re: /(?<=^|[\s"'`(\[=,])\/(?:home|users|var|etc|opt|tmp|mnt|root|srv|private)\//gi,
    controls: [' /home/x/y', '"/tmp/a"', '(/var/log/x'],
  },
  {
    id: 'path-escape',
    what: 'a relative path escape',
    re: /\.\.[\\/]/g,
    controls: ['../x', '..\\x'],
  },
  {
    id: 'url',
    what: 'a URL',
    re: /https?:\/\//gi,
    controls: ['https://x.example', 'HTTP://x'],
  },
  {
    id: 'email',
    what: 'an email address',
    re: /[\w.+-]+@[\w-]+\.[a-z]{2,}/gi,
    controls: ['a@b.co', 'mail me@example.com'],
  },
]);

const BY_ID = new Map(FORMS.map((f) => [f.id, f]));

const PROFILE_FORMS = ['windows-profile', 'wsl-profile', 'wsl-unc-home', 'posix-home', 'home-layout'];
/** Form ids each lane applies. See the header for why each lane gets what it gets. */
export const PRESETS = Object.freeze({
  PUBLISHED: Object.freeze([...PROFILE_FORMS]),
  FREE_TEXT: Object.freeze([...PROFILE_FORMS, 'home-anchor', 'windows-drive', 'posix-system', 'email']),
  COUNTS_ONLY: Object.freeze([...PROFILE_FORMS, 'home-anchor', 'windows-drive', 'posix-system', 'path-escape', 'url', 'email']),
});

function resolveForms(forms) {
  const ids = forms ?? PRESETS.PUBLISHED;
  return ids.map((id) => {
    const f = BY_ID.get(id);
    if (!f) throw new Error(`leaks: unknown form "${id}" (known: ${[...BY_ID.keys()].join(', ')})`);
    return f;
  });
}

/**
 * Every leak in `text`, in order of position: `{ form, what, match, index }`.
 * `forms` is a preset (or any list of form ids); PUBLISHED by default.
 * Overlapping hits collapse to the most specific form (the earlier one in FORMS).
 */
export function leaksIn(text, forms) {
  const s = String(text ?? '');
  const found = [];
  for (const f of resolveForms(forms)) {
    f.re.lastIndex = 0;
    for (const m of s.matchAll(f.re)) {
      if (f.segment && isPlaceholder(m[f.segment])) continue;
      found.push({ form: f.id, what: f.what, match: m[0], index: m.index, rank: FORMS.indexOf(f) });
    }
  }
  found.sort((a, b) => a.index - b.index || a.rank - b.rank);
  const out = [];
  let end = -1;
  for (const h of found) {
    if (h.index < end) continue;
    out.push({ form: h.form, what: h.what, match: h.match, index: h.index });
    end = h.index + h.match.length;
  }
  return out;
}

/**
 * Throws unless every form in `forms` fires on each of its own controls, alone.
 * Call it before reporting: a dead pattern and a clean lane print the same thing.
 */
export function assertScanner(forms) {
  for (const f of resolveForms(forms)) {
    for (const control of f.controls) {
      if (!leaksIn(control, [f.id]).some((h) => h.form === f.id)) {
        throw new Error(`the ${f.what} form (${f.id}) did not match its control ${JSON.stringify(control)} - the leak scanner is broken`);
      }
    }
  }
}
