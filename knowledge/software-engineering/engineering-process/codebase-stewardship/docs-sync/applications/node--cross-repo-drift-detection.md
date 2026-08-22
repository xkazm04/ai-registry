---
layer: application
type: application
subject: docs-sync
technique: cross-repo-drift-detection
stack: node
status: forged
verified_on: 2026-08-22
verified_against: node@22
---

# 116 topics, 23 history queries, and 107 drifted documents nothing can fail on

A marketing/guide site (`personas-web`) documents a desktop application that
ships from a different repository (`personas`). `scripts/check-guide-coverage.mjs`
(272 lines, zero runtime dependencies) is the drift detector: it reads the guide
topic registry, and for each topic asks the desktop repository's history what
changed under that topic's declared watch paths since its review date.

`verified_against` is `node@22` on the evidence of `.github/workflows/ci.yml:23`
and `:42`, both `node-version: 22`. The manifest's `"@types/node": "^20.19.43"`
(`package.json:55`) is a **types pin and not a runtime witness**; there is no
`engines` field and no `.nvmrc`, so 22 is the only version the tree actually
attests.

## The declaration, and the note that explains its granularity

`src/data/guide/types.ts:46-61` defines `TopicCoverage`: `contentReviewedAt`
(the review date), `appVersion`, and `watchedFiles` — "Files in the desktop repo
whose changes should trigger a re-review." The interface's own doc comment,
`types.ts:34-45`, states the granularity rule the technique argues for, in the
author's words: `watchedFiles` are *"deliberately coarse desktop feature
directories so the drift signal doesn't churn per-file."*

Measured on 2026-08-22 across all 116 topics: **22 distinct watch paths, 19
distinct watch sets, 1 to 3 paths per topic, 1.45 on average** — feature
directories such as `src/features/agents/` and `src/features/vault/`, exactly
the altitude the technique calls workable. All **22 of 22 resolve** on the
desktop side, so the dead-watch-path failure is not present here; nothing in
the script asserts that, though, so it would not be noticed if it were.

`src/data/guide/desktop-modules.ts:1-10` is the sibling declaration for the
other coupled surface, and its header does what the technique asks of a
cross-artifact coupling — it names the other repository's authority explicitly:
*"Source of truth on the desktop side (verify against these on sync):
`src/lib/navigation/registry.ts` … `src/features/shared/chrome/sidebar/sidebarData.ts`."*

## The cache: a 5.0× reduction, and the normalisation it is missing

`check-guide-coverage.mjs:114-116` states the design in a comment — *"One `git
log` per unique (watchedFiles, since) pair; topics sharing a category-level
watch set reuse the same query"* — and `:128` builds the key as
`` `${since} ${watched.join(" ")}` ``.

Measured: **116 topics collapse to 23 distinct keys**, because there are only 19
watch sets and **6 distinct review dates** across the whole corpus. That is the
clustering the technique predicts, and it is what makes the check finish in
seconds rather than minutes.

The key is **not normalised** — the paths are joined in declared order, so two
topics watching the same two directories in opposite order would miss each
other's cache entry. It costs nothing today (sorting the sets yields the same
23 keys, so no collision is currently being missed) and it is a one-line fix
that removes a silent future regression, which is why the standard asks for it
rather than waiting for the miss.

## Confirmed: coarse watch sets saturate, and ranking is the answer

Run against the desktop checkout on 2026-08-22:

| measured over 116 guide topics | |
|---|---:|
| topics carrying both `watchedFiles` and `contentReviewedAt` | 116 (100%) |
| history queries actually executed | **23** |
| topics checked | 116 |
| topics skipped | 0 |
| topics reporting drift | **107 (92.2%)** |
| desktop commits under one topic's watch set since review | max **407**, median **93**, min 8 |

Ninety-two percent flagged is the saturation the technique warns about, arriving
exactly as predicted: coarse sets, review dates backfilled in six sittings, an
actively developed repository on the other side. The implementation already
carries the right remedy — `:156` sorts results by commit count descending and
the report prints the top 15 — so the output is a ranked work list rather than
a binary that says "almost everything." This is the strongest confirmation in
the reconciliation: the saturation is not a defect in the detector, and
narrowing the watch sets to suppress it would trade a triage problem for a dead
signal.

## Deviation 1 — three skip classes, one hard-coded explanation

`computeDrift` increments a single `skipped` counter from three places:
`:126-129` when a topic declares no `watchedFiles` or no `contentReviewedAt`,
and `:148-150` when the cached query result is the `null` sentinel set by the
`catch { hit = null; }` at `:142` — a catch that runs with the child process's
stderr discarded (`stdio: ["ignore", "pipe", "ignore"]`, `:138`), so a missing
history binary, an unreadable repository and a path the tool rejects are one
indistinguishable outcome.

The report then prints one explanation for all of them (`:255`):
`(${drift.skipped} skipped — no watchedFiles/contentReviewedAt)`. On a machine
where the history tool is broken, that line states a cause that is not the
cause. Against
[checked-vs-skipped-denominators](../techniques/checked-vs-skipped-denominators.md)'s
reason classes this is the named failure: an aggregated skip counter with a
confident wrong label sends the reader to audit records that are already fine.

## Deviation 2 — the honest headline, the dishonest structured output

The human-readable path is better than the standard's warning anticipated. When
the desktop repository is absent, `:250-251` prints
`"Desktop drift: skipped (desktop repo not found — set PERSONAS_DESKTOP_REPO)"`
— *skipped*, never *zero drift*. When it is present, `:253-256` prints
`107/116 topics drifted`: a **fraction**, with the denominator, exactly as the
technique asks.

The `--json` path is where the discipline lapses. `:200-206` emits
`available: false`, `topicsChecked: 0`, `topicsSkipped: 116` and
`driftedTopics: []` — and any consumer that reads `driftedTopics.length === 0`
without first reading `available` gets a clean bill of health from a run that
queried nothing. The technique's rule is that the denominators live inside the
same object as the findings so the numerator cannot be reached without them;
here they are siblings, and a sibling flag is a flag that gets skipped.

## Deviation 3 — the drift detector's own documentation has drifted

The script's header (`:11-12`) describes dimension 3 as *"topics whose
`watchedFiles` have changed in the desktop repo **since the topic's
`appVersion`**"*, and `types.ts:57-58` repeats it: *"Checked by the drift
detector against the git log since `appVersion`."*

The code uses `contentReviewedAt` (`:124`), not `appVersion`. `appVersion` is a
semver string and could not serve as a `--since` bound at all; it is read only
for display (`:106`) and is never queried. Two documents, in two repositories'
worth of surface area, describing a mechanism the mechanism does not implement —
inside the drift detector. It is the subject's own defect class, self-inflicted,
and it is precisely what the standard's insistence on a *re-runnable* freshness
claim is for: the declaration was accurate when written and nothing re-read it.

## Deviation 4 — nothing can fail, and nothing invokes it

The only enforcing threshold in the file is `:265-272`: `--fail-under` compares
`localeCoverage` — the per-locale **screenshot** completeness — and exits 1 below
it. Neither staleness (27 topics past the 90-day threshold at `:47`) nor drift
(107 topics) can fail anything, at any threshold, ever. The report also labels
one of its three signals as advisory and not the others: `:247` prints
`"(text-only is OK — this is informational)"` for the screenshot-recipe count,
leaving the two loud, large, entirely unenforced numbers looking like they
matter more than the one that says it does not.

Underneath that: `check-guide-coverage.mjs` **appears in no manifest script, no
workflow, and no hook** — `package.json` has `check:guide-content`,
`check:i18n-coverage`, `check:i18n-encoding` and no coverage entry, and the only
other references in the tree are the script's own usage header copied into
worktrees. A `--fail-under` flag on a program no automation runs is a gate
argument, not a gate. The 107 is a real, correct, useful measurement that is
produced only when a human types the command.

## Deviation 5 — the strongest check on the surface runs nowhere

`scripts/check-guide-content.mjs:1-15` is the content invariant, and its header
states the cost of its absence precisely: a topic listed but missing from its
content module *"silently 404s — while generateMetadata still ships full SEO
tags, the sidebar advertises a dead link, and search indexes the orphan."* It
exits non-zero on any mismatch (`:99-103`).

It is wired into `package.json` as `check:guide-content` and **into nothing
else**. `.github/workflows/ci.yml:26-31` runs `typecheck`, `lint`, `test:unit`,
`check:i18n-coverage`, `check:i18n-encoding`, `build` — not this. The installed
pre-push hook (`scripts/install-git-hooks.mjs:19-24`) runs
`check:i18n-coverage` and `check:i18n-encoding` — not this. Verified 2026-08-22;
the sibling worker's report holds. The check is real, correct, and reachable
only by hand.

## Confirmed both ways: the two strategies for reading source as data

This tree runs both doors from
[source-as-data-without-the-app](../techniques/source-as-data-without-the-app.md),
which is what makes it a useful exemplar rather than an illustration of one.

**Scrape**, in the coverage script's own loader (`:57-72`): a comment stating
the motive — *"avoiding a runtime TS compiler keeps this script zero-dep"* —
then `src.match(/export const GUIDE_TOPICS[^=]*=\s*(\[[\s\S]*?\n\]);/)` and
`Function(...)` over the captured literal. `check-guide-content.mjs:28-53` is
the pure form, three regular expressions with no evaluation at all. Both write
the weakest possible floor: `if (ids.length === 0) throw` and
`if (out.length === 0) throw` — "at least one", which is exactly the floor the
standard names as insufficient, since it cannot distinguish twelve records from
116. Today both parsers agree at **116 topics**, which is the good outcome and
also the reason nobody has noticed the floor is decorative. Two smaller cracks
in the same loader: the comment at `:66-67` promises to *"strip `as const` /
`satisfies` suffixes if any"* and the code strips nothing, and the non-greedy
`[\s\S]*?\n\]);` terminates at the first line that looks like the array's close.

**Sandbox**, in `scripts/check-i18n-coverage.mjs:12-38`: `ts.transpileModule` to
CommonJS (`:15-22`), then `vm.runInNewContext` (`:32`) against a sandbox whose
`require` throws by construction (`:26-29`) —
``throw new Error(`Unexpected runtime import "${specifier}" while checking ${locale}`)``.
That is the refused-resolution contract verbatim: the locale file is asserted to
be self-contained data, and the day it is not, the gate names the specifier. It
also asserts the export came back and is an object (`:33-37`) rather than
accepting an empty evaluation, which is the discipline that keeps the exact
strategy from degrading into the partial one.

And the shape comparison the sandbox pays for: `compareShape` (`:55-102`) walks
the baseline and the candidate together, reporting `missing translation` for an
absent key (`:91`) and — the rule most implementations omit —
`` `${keyPath}: empty translation` `` at `:62` when a present key holds a string
that trims to nothing. Presence and content are checked separately and named
differently, which is what the standard asks and what makes the difference
between certifying a key set and certifying a corpus.
