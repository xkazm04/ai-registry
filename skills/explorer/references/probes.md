# Explorer probe catalog

A probe is one command (or one short loop) that points at a JOIN between two layers - a
file and its gate, a guard and its sibling path, a doc and its consumer - rather than at
one file. In a mature codebase the internals are the best-defended surface: every file is
internally consistent and has usually been read by an earlier pass. The defect lives in
what one layer claims about another. Probes find those claims mechanically, so Phase 4
runs them **before** sampling files and reads whole files only where a probe pointed.

Measured yield of the probe (cross-layer) lens, from `LESSONS.md`:

| Run | Yield | LESSONS.md |
|---|---|---|
| 2.1.0, 2026-09-04 | 5 of 5 items; single-file reading 0 of 14 files | L283-291 |
| 2.0.0, 2026-09-01 (first run, autonomous) | 3 of 9 items | L237 |
| 2.0.0, 2026-09-01 (fan-out run) | 3 of the 4 high items | L252 |
| 1.3.0, 2026-08-29 (two sweeps) | the top finding of both runs | L125 |

Every item records the probe that surfaced it (`probe: <id>`, or `probe: sample` for a
finding from file sampling). That field is what lets a later revision of this catalog say
which probes earn their place; a probe that yields nothing across five runs is a candidate
for removal, and a recurring `sample` shape is a candidate for a new probe.

Placeholders: `<area>` is the context's path globs, `<family>` an enumerable set of
siblings (route handlers, IPC commands, jobs, adapters), `<guard>` a name the repo law or
the area's own code uses to enforce a rule. Use `git grep` (it respects the index and is
fast) or the Grep tool. Carry a known positive: before trusting an empty result, confirm
the same command finds one place you know matches.

## Run order

1. **Always** (cheap, highest measured yield): `known-gaps`, `gate-matrix`,
   `consumer-claim` (and its `stated-rule` variant when it returns nothing),
   `comment-cites-gate`, `unapplied-idiom`.
2. **By lens** (the lens `pick.mjs` chose, or the user's category):
   `sec` - `unread-flag`, `gate-matrix` along the trust boundary;
   `bug` - `test-title-vs-assertion`, `derived-flag`, `hand-maintained-list`;
   `ui` / `a11y` / `i18n` - `literal-attribute`, `unvalidated-config-key`, `unapplied-idiom`;
   `dx` / `quality` - `hand-maintained-list`, `own-gates-vs-ci`.
3. **When the area is registry-governed** (`.ai/registry-map.json` names a subject for
   it): `technique-first` before any of the above.
4. **When the area is large** (> 40 files): `scout-ruled-out` to fan the reading out.

Budget about ten probe commands. A probe pass that finds nothing in the joins is a
signal to widen the probe set or the area, not to fall back to reading files end to end.

## The probes

### known-gaps - a doc section that already diagnosed the defect

An honest "Known gaps" / "Limitations" section in the repo's own feature docs is a
pre-verified backlog: someone already paid to verify it and named the remaining edit.

```sh
git grep -n -i -E "^#+ .*(known gap|limitation|not yet|todo)" -- "*.md"
```

Restrict to the docs the area maps to. When an item closes a gap, delete the gap line in
the same commit. Measured: LESSONS.md L173-178 (the run's highest-severity item).

### gate-matrix - one guard missing from one member of a family

The mechanical form of the cross-layer lens: print which guard names each member of an
enumerable family contains. The asymmetry becomes a shape on the screen instead of
something held across N reads. Works the same for a pair (read/write, POST/DELETE,
barrel/deep import, arming screen/receipt).

```sh
for f in $(git ls-files "<family glob>"); do
  printf '%-60s' "$f"
  for g in <guard-1> <guard-2> <guard-3>; do
    if grep -q "$g" "$f"; then printf ' %s' "$g"; else printf ' -'; fi
  done
  echo
done
```

Take the guard names from the repo law and from the best-guarded member. A row with a
`-` where its siblings carry the guard is a candidate; the premise check (Phase 5) reads
the caller chain to rule out a guard applied one layer up. Measured: LESSONS.md L210
(two ungated by-id routes, found by both arms of a two-model run, L209 and L311); L252
(a rule on 3 of 4 siblings).

### consumer-claim - a doc comment that obliges code it cannot see

A modal verb about a CONSUMER ("a caller must", "a consumer that shows this must also
show X", "the term is named for what it measures") is unenforced by construction.

```sh
git grep -n -i -E "(caller|consumer|client|user)s? (must|should|is expected to|has to)|must also" -- <area>
```

Open every consumer the sentence names, including consumers outside the area's file list
(another crate, another package). Measured: LESSONS.md L125 (top finding of two sweeps),
L252 (a doc claim about a consumer in another crate).

**Variant `stated-rule` - when `consumer-claim` comes back empty.** A hardened area often
states its rules about itself rather than about a consumer ("never import X here",
"always pass through Y", "this module must stay pure"). Grep the rule-stating comments,
then check that the SIBLING files the rule governs comply:

```sh
git grep -n -i -E "(//|#|\*) .*\b(never|must|always|do not|only)\b" -- <area>
```

For each rule, list the files it covers (same directory, same family, the files named in
the comment) and grep them for the forbidden or required shape. Record items under
`probe: stated-rule`. Measured: the 2.6.0 field run (LESSONS.md, 2.6.0 entry) -
`consumer-claim` 0 hits in a hardened area, this variant fed 3 items.

### comment-cites-gate - "this is covered by <check>" is a hypothesis

A comment that says a file is under a gate (lint rule, check script, contract test) is a
claim about the gate. Open the gate and confirm what it actually checks.

```sh
git grep -n -i -E "(under|checked by|enforced by|guarded by|covered by|keeps .* honest).{0,40}(check|lint|test|gate|guard)" -- <area>
```

Measured: LESSONS.md L97-104 (the run's highest-severity finding: a gate that compared a
literal against one theme's token and never scanned for the raw values it was credited
with catching).

### unapplied-idiom - the repo's own good idiom, and where it was not applied

In a healthy area the finding is usually "here is where the established idiom wasn't
used". Find the module that solved a problem well, then list the places that solved it
again by hand or skipped it.

```bash
git grep -l -E "<trigger shape>" -- <area> > /tmp/explorer-<run-id>-trigger.txt
git grep -l -E "<idiom marker>" -- <area> > /tmp/explorer-<run-id>-idiom.txt
comm -23 <(sort /tmp/explorer-<run-id>-trigger.txt) <(sort /tmp/explorer-<run-id>-idiom.txt)
git log -S"<capability name>" --oneline -- <area>
```

The last line dates a documented-but-unused capability: "added by <sha>, never wired" is
the strongest evidence a dead capability can carry. Measured: LESSONS.md L35-38 (2 of 4
items: a printable delimiter composing keys over outside values, the correct idiom one
file away); L77-86 (one shape, four times: an idiom applied in twelve places and missed
in three, a parameter with a passing test and no caller).

### test-title-vs-assertion - a green test that documents the bug

```sh
git grep -n -E "(it|test)\(['\"\`][^'\"\`]*(not|never|reject|without|only|refuse|deny)" -- "<area>/**/*.test.*" "<area>/**/*.spec.*"
```

For each hit, read the assertion under the title. A title stating the correct behaviour
over an assertion pinning the opposite (often with a comment explaining it away) is a
defect with a signpost on it. Measured: LESSONS.md L30-34 (the run's highest-severity
finding).

### unread-flag - a boolean with a setter and no reader

For every boolean a write API, form or config accepts, count its readers on the path it
names. A flag with a setter, a column, a listing and a docs row and zero readers where it
matters is the highest-severity shape a `sec` pass finds.

```sh
git grep -n -w "<flag>" -- . ":(exclude)*.test.*" ":(exclude)*.md"
```

Widen a `sec` run along the trust boundary (the module that owns the policy the area must
honour), not along the taxonomy's group adjacency. Measured: LESSONS.md L238-242.

### derived-flag - a response field that is a constant

A boolean computed downstream of a gate from the same collection the gate already
branched on is constant unless the gate's definition says otherwise. Read the
definition (often in another module or crate), not the comment at the site. Measured:
LESSONS.md L221-226.

### unvalidated-config-key - a key the UI reads and the validator never names

For each key a UI helper reads out of a loosely typed config (`Record<string, unknown>`,
a JSON blob, a settings map), grep the same key in the validating layer. Zero hits there
is a bug.

```sh
git grep -h -o -E "config\??\.[A-Za-z_]+" -- <ui paths> | sort -u
git grep -c -w "<key>" -- <validator paths>
```

Measured: LESSONS.md L247 (the run's top item).

### literal-attribute - attribute strings outside every JSX-text lint

```sh
git grep -n -E "(aria-label|placeholder|title|alt)=\"[A-Za-z]" -- "<area>/**/*.tsx" "<area>/**/*.jsx"
```

In a localized, lint-clean area these sit outside the text lint. Measured: LESSONS.md
L247 (this probe and `unvalidated-config-key` together produced 5 of 10 items).

### hand-maintained-list - a contract test's list is the codebase's claim about itself

A list typed by hand inside a contract test (route names, locales, allowed imports) says
what the author believed the family was. Diff it against the family on disk; what it
omits is where the rule is still broken. Measured: LESSONS.md L211.

### technique-first - read the registry technique before the code

For a registry-governed context, read the technique (`.ai/registry-map.json` -> the
subject -> the techniques whose `use_when` matches) and turn each invariant into a
question against the code ("what can the fold not undo?"). A technique is a list of
places the author already knows code goes wrong. Measured: LESSONS.md L261-265 (a cap
bypass the code's own comment called safe, in a file two prior passes had read).

### scout-ruled-out - fan-out scouts report what they ruled out

For a large area, one read-only scout per two or three large files. The scout prompt
REQUIRES, per candidate, a line naming what it checked to rule out the guard elsewhere
(the caller, the wrapper, the middleware). That line turns the lead's premise check into
a targeted re-read instead of a re-scan. Measured: LESSONS.md L251 (21 candidates in
about 3 minutes, 10 itemized, 0 killed by the premise gate).

### own-gates-vs-ci - the repo's checkers that nothing runs

List every check script the repo owns and diff against what CI and the hooks invoke; run
the unwired ones. One sighting only (LESSONS.md L298-306, recorded as a proposal, not
yet confirmed in a second repo) - run it when the area is tooling, and record the yield.

## Not in the catalog

- **Prior-finding annotation density** (files carrying finding-numbered comments from
  earlier passes yielded nothing; unannotated files carried the yield). Two sightings,
  one repo (LESSONS.md L49, L127); it needs a marker convention the method cannot
  assume, so it belongs in that repo's overlay.

## Lens vocabulary

Explorer's lenses are its eight categories. `scripts/pick.mjs` counts a category as
already run in a context when either loop ran it there:

| Explorer lens | scan-sweep lens keys that count | lens-scan lens |
|---|---|---|
| `bug` | bounty-hunter, error-handler, parity-auditor, observability-auditor (legacy: bug-hunter, error-handling) | - |
| `sec` | security-auditor (legacy: security) | security |
| `quality` | architecture-analyst, tech-debt-tracker, documentation-auditor | development |
| `perf` | code-optimizer (legacy: performance) | performance |
| `ui` | ux-reviewer, visual-craft, state-coverage, mobile-specialist (legacy: ui-perfectionist, design-tokens, motion) | design |
| `a11y` | accessibility-checker | accessibility |
| `dx` | test-strategist, dependency-auditor, devops-optimizer | - |
| `i18n` | copy-auditor | - |

scan-sweep keys with no explorer analogue (feature-scout, monetization-advisor,
growth-hacker, risk-assessor, registry-conformance, the challenge lenses, ...) never mark
an explorer lens as run. Explorer reads scan-sweep's ledger and never writes it.
