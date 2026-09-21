---
source: voicestudio
kind: repository
url: https://github.com/debpalash/VoiceStudio
title: "VoiceStudio - fully-local voice cloning, dubbing, dictation and audiobook studio"
author: debpalash
commit: 9790d28922519e68110a9aacdc64efb109dabaf0
words: 3383 landing page / 341468 in-tree operating documents
extracted: 12
accepted: 1
declined: 0
leads: 1
already_covered: 4
untriaged: 6
applied: 1
shipped: 2
dispatched: 0
run_id: voicestudio-0907
siblings: 1
rescan_when: the "Fastest CPU render / lowest latency" job in docs/engine-acceptance.md acquires a holder (open at mine time, tracked as #1306), or the job map gains a row; or 8 weeks elapse (2026-11-02)
---

# VoiceStudio

A desktop voice studio - cloning, design, dubbing, dictation, transcription,
audiobooks - that runs entirely on the user's machine across ~15 swappable TTS
and ASR engines. Mined as a repository, from a clone at the commit above.

## Class and expected yield

Repository, on the boundary between vendor repository and first-party
practitioner account: a single-owner project whose operating documents are
written to be executed rather than read. The class predicts design decisions
over claims, and it was right.

**The ratio is the finding about the source itself.** The landing page
`research-ingest` returns is 3,383 words; the in-tree operating documents are
**341,468** - a hundred to one. A run that had extracted from the README would
have mined the one file in the tree written to be quoted. Swept, in yield
order: `docs/engine-acceptance.md` (the admission contract), `CLAUDE.md` (the
standing rules), `tests/` (405 top-level files, 37 named for the issue they
regress), `docs/adr/`, `docs/specs/longform/` (the largest single document is
15,369 words).

## Routing count (Phase 2d)

Load-bearing decisions with no home in the corpus, counted per system:

| System | Decisions | `corpus: NONE` |
| --- | --- | --- |
| Engine admission governance | 3 clauses of one bar | 1 family |
| Rule mechanisation (CLAUDE.md + tests/) | 3 | 1 boundary |
| Release / version discipline | 2 | 0 - covered |
| ADR pinned to shipped artifact | 1 | 1, unverified |

**Count: one or two. Stayed in intake, no forge handoff.**

Worth recording *why*, because the mechanical XL trigger would have fired and
should not have. The engine admission bar is three clauses - a job map, a
steward term, a public adapter - which reads as three design candidates
sharing one home, exactly the shape Phase 4 says fires an XL spec by
construction. They are three clauses of **one mechanism** in one document, not
three mechanisms. Counting clauses rather than decisions is a false positive
the trigger cannot see, and the guard is the Phase 2d wording that was already
there: a decision is load-bearing when removing it would change the shape of
the system. Removing any one clause of this bar changes the bar, not the
system.

## What landed

**One amendment**, to `quality-gates/gate-liveness`: *a scoped population
passes the floor test and checks almost nothing*. `gate-liveness` catches a
population of zero; `ratchet-design` catches the enumerated allowlist. Neither
catches the middle - a population **derived** from a predicate (a date, a ref,
an ordering) that reports a plausible non-zero count every run while
everything the predicate excluded sits exempt. The source's changelog linter
is a clean instance: it checks only sections dated after the rule's own
adoption, and argues the exemption is safe because the file is newest-first so
new sections cannot land in the grandfathered region. The argument is correct
and load-bearing and **nowhere asserted** - the derivation is code, the
invariant it rests on is a comment.

Boundary, not mechanism, so an amendment rather than a technique:
`gate-liveness`'s own rule survives entirely. What is added is that a *scoped*
population defeats the floor test by being legitimately non-zero.

## What was applied (Phase 7.5)

The falsifying seam was chosen deliberately, and it returned something the
landing did not already say. Rather than confirm the amendment against the
source's own linter, the question was aimed at our own checkers: **does the
registry carry a derived exemption whose premise is unchecked?** A caught
outcome would have refuted the mechanism's reach - if nothing here had the
shape, the finding was about someone else's tree.

It did not get caught. `scripts/check-skills.mjs` scoped version discipline to
`--since <ref>`, and with the flag absent printed a correct, distinguishable
`version discipline: NOT run` and exited **zero** - a derived population that
is empty by default. CI passes the flag. Every local invocation that
authorizes a commit does not, and this skill's own Phase 11 says to run
`check-skills.mjs` before committing a skill change without ever mentioning
it. So the registry violated, in its own tooling, a rule the registry
publishes - and `gate-liveness` already contains the sentence that convicts
it: a could-not-run routed to pass is wrong when the green authorizes
shipping.

Mode `code`, on this tree. Paired on a seeded unbumped `SKILL.md` edit:

| Arm | Invocation | Result |
| --- | --- | --- |
| A (before) | no `--since` | exit 0, `skills lane OK` - defect escapes |
| B (after) | no `--since` | exit 1, names the skill and the frozen version |
| control | clean tree | exit 0, green - no false positive |
| control | `--since HEAD~3` | unchanged, CI path intact |
| control | unresolvable ref | still FATAL exit 2 |

Verdict **better**. An omitted `--since` now means the population a local
commit is about to create - working tree and index against `HEAD` - and the
report carries its predicate rather than a bare count.

## What shipped incidentally, and matters more than the source

Executing round 37's second declared focus - the board-address item, open two
rounds because both intervening runs had zero live siblings - found a defect
in `scripts/run-board.mjs` that had been silently disabling this registry's
whole parallel-safety mechanism.

`norm`'s docstring claimed it folded `knowledge/x/y/z.md` and `x/y/z` to one
token. It never did; `touches` compared raw tokens. The method's own phases
guarantee the two sides never match: **Phase 4 claims a subject slug**, **Phase
7 checks the index file address**. Measured against a live sibling holding
`.../quality-gates`:

| claim form | check form | result |
| --- | --- | --- |
| subject slug | index `file` path | **clear - miss** (the documented workflow) |
| path | slug | **clear - miss** |
| subject document | technique nested under it | **clear - miss** (doubled leaf breaks the prefix) |
| identical spelling | identical spelling | CONTENDED |

The only pair that worked is the one the method never produces. Every `check`
any run has ever made against a subject a sibling held returned a false
all-clear. Fixed with an address fold, paired before/after on the same probe:
detection **1/4 -> 4/4**, with a sibling subject in the same category
correctly still clear. The fold now self-asserts on every invocation over the
cases measured broken.

`normSource` in the same file was fixed twice (2026-09-02, 2026-09-04) because
it was tested against real spellings. This fold was asserted in a comment and
never tested once.

## Triage table

`G/R/C` per Phase 5. Read: real gap / partial / likely catch / thin.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | design | M | Scoped population defeats the floor test | qg/gate-liveness | new-technique | real gap | 4/1/2 | **accept** |
| 2 | K | design | L | Engine job map: one holder, take it with numbers | voice-io/engine-abstraction | new-technique | real gap | 3/2/3 | untriaged - home unsettled |
| 3 | K | design | M | Steward with a term; archive on the conjunction | - | new-technique | partial | 2/2/2 | untriaged |
| 4 | K | design | S | Public adapter so refusal is not exclusion | voice-io/portable-provider-package | none | partial | 2/2/1 | untriaged |
| 5 | K | claim | S | Mechanical rules to tests, intent to a reviewer | qg/prose-rule-drift | none | likely catch | - | **already covered, better** |
| 6 | K | design | S | Parity governs behaviour, not performance | ec/deployment-contract | none | partial | 2/2/1 | untriaged |
| 7 | K | design | S | Version single truth with declared mirrors | er/release-pipeline | none | likely catch | - | **already covered** |
| 8 | K | design | M | ADR SHAs mirrored into a shipped artifact | ec/docs-sync | new-technique | partial | 2/2/2 | untriaged |
| 9 | K | claim | S | Regression test filenames carry the issue id | ebr/test-harness | none | partial | 1/2/1 | untriaged |
| 10 | K | claim | S | Allowlists with an expiry discipline | mg/ratchet-design | none | likely catch | - | **already covered** |
| 11 | K | claim | S | A spec's own draft cited a branch that did not exist | - | none | real gap | - | **lead** |
| 12 | K | claim | S | Docs-sync in the same PR, stale docs are bugs | ec/docs-sync | none | likely catch | - | **already covered** |

`auto=1/0/0`, `fp=0`. No row was escalated; row 1 cleared every veto and scored
`G-R=3`, `G>=C`.

The six untriaged rows carry no judgment - nobody looked hard enough to
decline them. Rows 2-4 are one mechanism family and are the strongest thing
left in this tree; they were banked rather than landed because their home is
genuinely unsettled (`voice-io` is domain-narrow for a rule about carrying
many interchangeable backends, and the near-empty map returned scattered,
semantically unrelated hits rather than a clean hole). The gate's bias toward
the recoverable error applies: a banked row with anchors costs the next run a
re-read; a mis-homed technique costs the corpus a document nobody looking for
it will find.

## Already covered - the catches

- **Mechanical rules belong in deterministic tests, not an AI reviewer**
  (`CLAUDE.md`, workflow section). `prose-rule-drift` owns this and states it
  better, as the artifact-versus-intent discriminator, with the cost of the
  reviewer tier written out (probabilistic, not bisectable, not auditable).
- **Two expiring allowlists** (`_REF_ALLOWLIST`, `_ALLOWED_FILES`).
  `ratchet-design`'s population split owns the pair, down to the obligation to
  emit the allowlisted population as advisory so the queue does not go dark.
- **Version single source of truth with declared mirrors** guarded by
  `tests/test_app_version.py`. `release-pipeline/version-single-truth`.
- **Docs-sync in the same PR, stale docs are bugs.**
  `docs-sync/same-change-enforcement`.

## Lead

**A spec that hallucinated its own state under test, corrected in place.**
`docs/specs/longform/34-runtime-verify.md` carries a grounding note recording
that its own first draft cited a branch and a PR range that did not exist, and
that both were corrected against the tree. An agent-authored spec's most
dangerous field is the one naming what it is written against, because every
later reader treats it as given and it is the one field the author had no
reason to check. The corpus has `judgeable-spec-authoring` in game-production
and `research-grounding` in media-generation; neither owns the
state-under-test field specifically.

*Return condition:* when a second independent source shows an agent-authored
spec misciting its own baseline, or when a fleet project's `.ai/` spec is
found citing a branch that does not exist.

## Board

One live sibling for this run's whole life (`intake-obcayes`, a video source,
holding no subject this run touched). Three subjects claimed at Phase 4 -
`quality-gates`, `agent-instruction-files`, `voice-io`. No contention, and for
the first time that statement is worth something: until this run's fix, "no
contention" was what the board said unconditionally.
