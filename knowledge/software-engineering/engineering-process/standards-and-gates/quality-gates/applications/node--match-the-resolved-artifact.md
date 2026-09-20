---
layer: application
type: application
subject: quality-gates
technique: match-the-resolved-artifact
stack: node
verified_on: 2026-09-20
---

# Four text-matching gates and what each of them was really reading (Node)

Read on 2026-09-20 across four Node and TypeScript trees that share this
registry as their standard: a career-planning application (`kp`), a media
pipeline (`gravitone-gcloud`), a governance service (`ascent`), and a desktop
agent console (`personas`). Every citation below was opened in the tree on
that date. Each seam is the same technique at a different resolution step —
configuration resolution, comment stripping, literal folding, and the
tooling's own text-or-binary decision.

## 1. The resolved configuration, not the configuration file

`kp/eslint.config.mjs` carries five groups of `no-restricted-syntax`
selectors. The format replaces a rule's options rather than merging them, so
a later block matching a file supplies that rule wholesale for that file. The
four design-token selectors were declared in the first block and never
restated in a later block matching a superset of the same paths, so from the
day that block landed the design rule applied to nothing under `app/` — while
`scripts/design/check-design-tokens.mjs` told readers that half of the design
law "is an eslint rule in eslint.config.mjs, so it rides `npm run lint`".

The guard is `kp/app/lint-selector-coverage.test.ts`, and the part worth
copying is that it reads `ESLint#calculateConfigForFile()` rather than the
configuration source — its own header states why: "A test that greps
eslint.config.mjs for a selector string would have PASSED throughout the whole
period the rule was dead — the text was right there, in a block that no longer
won." As of this read it pins:

- **sixteen representative paths**, each with the selector groups it `must`
  carry and the groups it `mustNot`, one line of reasoning per path;
- a **non-vacuity pair** — the design group genuinely present in one layer and
  genuinely absent in the declared-exempt one, plus a third group present in
  both so the two layers are comparable at all;
- a **reach assertion** derived from `git ls-files` rather than from the
  expectation table, failing on any tracked TypeScript file that matches no
  block, with a floor (`TRACKED.length > 1000`) so a broken enumeration cannot
  assert over an empty set. Its comment records what that assertion found: the
  nineteen end-to-end specs, the root modules, `i18n/`, the edge worker and
  the TypeScript scripts had matched nothing — including the most portable
  lane in the repository, whose only structural law is that it must not import
  `app/`.

The failure messages name the repair in the configuration's own vocabulary
("add the group to that block's `restrict(...)` call"), which is what keeps
the fix from being "delete the expectation".

## 2. Comments are not code

`ascent/src/app/api/org/id-routes-gated.test.ts` asserts that every route
under an `[id]` segment calls one of nine authorization entry points. It
matched over raw file text, in a codebase whose house style is to explain each
route's gate in a comment above it. The header records the measurement:
deleting the import and both `requireOrgAccess` / `requireOrgRole` call sites
from `goals/[id]/route.ts`, leaving only the three comment lines that name
them, kept the suite at **21/21 green**.

The repair is `stripCommentsAndStrings()`, a character-by-character scan
rather than a regex pass — its comment gives the reason in both directions:
"a naive regex pass would treat `"// not a comment"` as a comment and
`// a "quote"` as a string opener". The seeded pair lives in the suite as
`finds a gate only in real code, never in the prose that explains it`, and it
asserts the third thing as well: that the *unstripped* text cannot tell the
two fragments apart.

The same file carries the boundary the technique names. The admission-route
probe deliberately reads the **raw** source, because the key it needs is a
string literal (`searchParams.get("repo")`) that the stripper would remove,
and its comment says why that is the safe direction: over-detection can only
demand a constraint on a route that mentions a repository, where a stripped
read "would silently stop asking for one".

## 3. A fingerprint nobody had ever checked against source

`gravitone-gcloud/pipeline/check-bundle.mjs` asserts that strings unique to
server-only modules are absent from every client chunk — on this read, eight
`SERVER_MODULE_FINGERPRINTS` plus three `TEST_ONLY_FINGERPRINTS`. Its
`assertFingerprintsAtSource()` now asserts each string **present** in the file
it names, with comments stripped, before any absence is checked, and the
file's own note dates the result: measured 2026-09-04, none of the ten then
listed had ever been checked against source, and one of them — `"[text] "`
with a trailing space, pointed at `lib/text/log.ts` — had never existed outside a
comment, because `formatTurn()` builds the line from the bare literal
`"[text]"` and joins with spaces at runtime. That leg had hunted nothing since
the seam was added on 2026-08-27. A second entry was split across two
template-literal lines that the bundler folds and a source read does not; the
fix stops the fingerprint at the literal's edge ("Refused before any vendor
was").

The routing is the technique's: the failure exits `die(2, "COULD NOT RUN: …")`
and the remedy text forbids the cheap repair — "Do not delete the entry: pick
another string from the same file that a browser must never see." The same
script applies the same shape one layer up, refusing to run when its
`.env.example` derivation yields fewer than eight variables.

## 4. One byte that empties the haystack

In `personas`, a separator written as a raw NUL byte inside a template literal
removes the file from every text instrument the project owns. Measured on
2026-09-20 with a byte scan over 5,745 source files: two still carry one. In
`src/hooks/design/template/useGalleryQuery.ts` line 115 ends in a `.join()`
whose argument is a one-character string holding the byte itself, and
`src/features/templates/sub_generated/shared/useConnectorReadiness.ts` uses
the same byte as a request-key separator on lines 94 and 111.

The observables, taken the same day:

- `grep -n coverageKey src/hooks/design/template/useGalleryQuery.ts` prints
  the single line `Binary file … matches` — no line, no line number, nothing a
  caller consuming matched lines can act on. A recursive search over the
  directory prints the same one line.
- `git show --stat 93863ed42d` renders that file as
  `Bin 13966 -> 13958 bytes`, `1 file changed, 0 insertions(+), 0
  deletions(-)`; `--numstat` gives `-` and `-`. Every diff-shaped gate and
  every line-level review sees a file that has never changed.
- `src/features/agents/sub_health/useHealthCheck.ts` — the file the defect was
  first found and repaired in — reads back as 443 addressable lines carrying
  no NUL byte. (The repair was reported at the time as 507 lines restored, so
  the file has since moved; what is verifiable today is that it is addressable
  and that the byte is gone.)

The repair is the escape sequence; the gate-side obligation the tree does not
yet hold is a population assertion that reports a file dropped for being
unreadable as a could-not-run rather than as a member that passed. Two files
carrying the defect today, with the class already diagnosed and fixed once, is
the evidence that the source-side rule alone does not close it.

## What this realization does not show

None of the four seams was re-run here; this is a read of the guards and of
the trees they point at, plus the byte scan and the two search and history
commands in section 4, all on 2026-09-20. The measurements attributed to
earlier dates (21/21 green under the raw-text matcher; ten fingerprints
unchecked) are the ones the guards themselves record, in the commits that
introduced them, not re-measurements taken today.
