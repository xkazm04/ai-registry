---
source: github:Panniantong/Agent-Reach
kind: vendor repository (repo form, design-deep)
url: https://github.com/Panniantong/Agent-Reach
title: "Agent Reach — read/search access to 13 platforms for AI agents, without API fees"
author: Panniantong
commit: da5044d26fc6adddb6554d5679c94ac22e76e428
words: 1276 landing / 15459 in-tree md / ~17k LOC
extracted: 18 decisions (4 systems) + 11 triage rows
accepted: 3
declined: 0
leads: 1
already_covered: 5
untriaged: 3
applied: 2
shipped: 3
dispatched: 0
run_id: agentreach
siblings: 0 at claim, 1 at Phase 7
---

# Agent Reach — the documentation was the only place the guarantee could live

## Class and expected yield

**Vendor repository, repo form, design-deep.** A Python CLI that gives an agent
read access to thirteen platforms without paying any platform's API fees —
which it achieves by borrowing the operator's own logged-in browser sessions.
1,276 landing-page words against 15,459 in-tree markdown words, so the ingest
alone would have returned 8% of the source and all of the marketing. Tests
outweigh source (~7,500 lines against ~5,500), which was the first signal that
the interesting material was in the assertions rather than the implementation.

Expected yield stated before triage: architecture is the yield, claims are
secondary; the corpus is mature in probing and credential custody, so most
claim rows would be catches.

## Routing count (Phase 2d, v2.2) — written before extraction

18 decisions, 7 unmodelled, across four systems.

| System | Decisions | `corpus: NONE` | Shared home |
| --- | --- | --- | --- |
| A — backend health probing & routing | 6 | 1 | — |
| B — credential custody at the CLI boundary | 5 | 3 | none shared |
| C — glue-layer doctrine | 3 | 0 | — |
| **D — documentation as a tested artifact** | **4** | **4** | **`docs-sync` (exists)** |

**Neither clause sent this to a forge.** System D cleared the per-system
threshold at four, but with an **existing** home, so the v2.2 rule routes it to
a technique family inside that subject rather than to `/forge`. No handoff.

The count changed what got extracted, not only where it routed. After computing
it I stopped sweeping the channel adapters — six near-identical files — and
spent the remaining sweep inside `tests/`, which is where the entire yield came
from. `test_auth_guidance_policy.py` is 235 lines and produced three techniques;
it is not mentioned in the README at all.

## Landed — three techniques in `docs-sync`, and the argument for each

The subject has twelve walls and every one of them governs the coupling between
a document and a **source that changes**. The family fills a stage-one gap: a
class of documented statement that has no source area to couple to at all.

**`negative-claims-are-pinned`.** A promise about what the system does *not* do
has as its truth-maker the fact that no code exists. Nothing can be coupled to
it, so wall 5 correctly returns `unverifiable` and will return it forever — and
an honest verdict repeated indefinitely is operationally indistinguishable from
a hole. **The subject had already found this category once**, in wall 12, for
figures, and the pairing is what made the technique sharp rather than a
restatement: a figure is unverifiable because it cannot be *read*, and the fix
is to digest its **inputs**; a promise is unverifiable because it has **no
inputs**, so the comparison cannot be inverted and the mechanism has to change.
Two rot paths, neither a source change: somebody builds the thing (no map entry
could point at a capability that did not exist), or somebody deletes the
sentence (a negative claim reads as boilerplate to every editor who did not pay
for it). Three properties carried: the document scope is the finding, the
forbidden set is a floor, and **the pin proves the promise is stated, never
that it is true** — so its admission ticket is a dated human review.

**`prose-as-an-execution-surface`.** Every wall above treats prose as a claim
that can be true or false; prose is also **instructions**, and an instruction is
executed rather than evaluated. The source's strongest instance: its name on
the public package index is **owned by an unrelated project**, so a bare install
line in any of four landing pages delivers a stranger's code under this
project's own words. The scoping lesson is the durable half — the check's
candidate list is the prose corpus **plus one source file**, the integration
entry point that prints its own install instruction to standard error when an
optional dependency is missing. That line reaches the only user who never opened
a page, and a gate scoped to documentation files misses it by construction.

**`translations-drift-against-the-product`.** The mature treatment pins a
translated unit to its **source** revision. That question is right and has an
independent blind spot: **staleness relative to a stale source is zero.** When a
capability is retired and nobody updates the primary page, every hash matches
and every locale reports current. Worse, a page authored *directly* in a target
language has no source unit, so it sits outside the measured population while
the completeness board stays green. The corrective anchors the second detector
to the **shipped capability set read from the code**. The tell that a project
learned this rather than adopted it: the assertion set **differs per page** —
this source forbids two retired platform names in exactly two of its four
landing pages, and that asymmetry is the only written record anywhere in the
repository of which pages were authored independently.

## Applied — 2 rows, 3 commits, and a falsifier that held

**`negative-claims-are-pinned` → personas, `code` / `better` / `ab-paired`.**
The seam is the product's central commitment: *your personas, prompts, and
credentials never leave your machine … no telemetry dashboards … no cloud
account required*. Entirely negative, so the project's eleven-check chain — a
declared feature-to-document map, a glob validator, a per-turn nag hook, a
census — is **structurally blind to it, permanently**. Same mutated landing page
through both arms (the paragraph rewritten into a plausible benign replacement
that keeps the heading and drops every commitment): arm A detected **0 of 4**,
arm B **4 of 4**. Shipped `23070dba` + `2b40ab1e`, plus `900b4151` for the
project's applied rows; three commits, master, **not pushed**.

Built stronger than the source instance in one respect the corpus asked for: the
checker **refuses** a pin without a dated `reviewed` field rather than
laundering an unreviewed sentence into a green, with two of eight tests on that
branch. The source tree has the pins and not the tickets.

**The declared-focus falsifier was run, not banked.** Before concluding no gate
reads the landing page, every reference to it across the project's scripts
directory was enumerated **uncapped** — seven files — and each opened. All seven
are comments, cross-references or workflow seed data. The absence is established
from the whole set.

**The structural fact the apply produced:** the promise lives in **exactly one
document**. The scope enumeration the technique demands came back as a list of
one, and that was invisible until the technique demanded it. One editorial pass
removes the entire privacy commitment.

**`prose-as-an-execution-surface` → personas, `simulation` / `not-better` /
`structural-only`.** Swept all eight checked-out projects: **zero** documented
credentials in process arguments, and one bare install line naming an
unsquattable first-party package. The population claim is confirmed — the
desktop app emits actionable install hints from compiled source
(`setup.rs:636`, `:648`, `:563`) that no documentation-scoped gate has in
scope — but the vector is absent because the fleet owns every namespace it
names, which is **the technique's own stated disqualifier**. So `not-better`
needed no amendment; it is the measured confirmation that the boundary does its
work. What the run adds is a sharper return condition than the technique
carried: **the vector is created by a rename**, not by a naming choice, so the
check belongs in a rename runbook rather than as a standing gate.

**`translations-drift-against-the-product` → unapplied.** No seam: none of the
eight checked-out projects ships prose documentation in a second language. One
carries UI message catalogs, which is the other subject's population, not this
one's. Return condition: **when a project ships a landing page in a second
language.**

## Catches — 5, and one against myself

- `which()` is not health → `health-checks/probe-design`. Its proxy table opens
  with *install path exists → tool executes and answers → corrupted,
  wrong-architecture, or half-updated tool*, which is this source's entire
  `probe.py` docstring, said first and said better. I had this on the table as a
  candidate and it is a clean catch.
- Retry only the transient failure classes → `retry-backoff/error-classification-for-retry`.
- Probe restricted to side-effect-free commands → `probe-design` ("what must it
  never change").
- Retire a channel when its upstream dies → `optional-dependency-degradation/fallback-retirement-condition`.
- Scrub credentials at the final output boundary → `browser-credential-boundary/opaque-upstream-errors`.
- Atomic private write with symlink rejection → `concurrency-guards/atomic-file-publish`.

## Untriaged — 3, with anchors, nobody verified these

- **A checkmark is a verdict with a subject.** The suite forbids
  checkmark-prefixed strings presenting a platform capability as verified
  (`tests/test_auth_guidance_policy.py:114-122`), and separately requires both
  agent-facing instruction files to state that a null backend value is a safety
  state rather than a routing instruction (`:199-209`). A glyph and a null both
  read as verdicts they had not earned. Partial against `probe-design`'s *depth
  is a dial* — the gap is the **reader's** inference, not the check's setting.
- **An unknown override must not hide working backends.** `channels/base.py:45-59`
  — an unrecognised backend override is ignored rather than honoured, so a stale
  override cannot mask a healthy backend. Nearest: `model-routing/consumer-overrides`.
- **A documentation error ships in the bug-fix list.** `CHANGELOG.md:22` files
  *"corrected misleading documentation"* — the landing page claimed a channel
  needed no configuration when it required a browser cookie — in the same list
  as a root-caused HTTP 400. Partial against `dated-corrections`.

## Lead

**The tests-outweigh-source tell for a design-deep sweep.** This tree has no
`docs/design`, no ADRs, and 235 lines of policy tests that produced the entire
yield; the ratio of test lines to source lines (1.36:1) pointed at the
assertions before any file was opened. Third consecutive repository run where
the design record came from somewhere other than a design folder — source header
comments (one run), abstract base classes (another), and now a policy test
suite. **Return when** a fourth run finds design in a non-obvious surface: that
is a three-sighting rule about where a design read should look, and it belongs
in the method's sweep order rather than in a bundle.

## Board

0 siblings at claim; 1 by Phase 7 (`odr-2026-09-04`, on four `llm-agent`
subjects — no overlap, no contention). `knowledge/*/index.json`, `taxonomy.json`
and `catalog.json` **left uncommitted**: the regenerated artifacts carry 12
references to that sibling's `probe-the-decision-not-the-artifact` and
`deliberation-as-an-elected-turn`, neither in `HEAD`.

`directions=skipped`, with the reason: `librarian/fleet-map.json` and
`fleet-map.md` both carry uncommitted changes, and regenerating a shared
committed artifact from a tree holding another session's work is the one thing
the parallel rules forbid. **Standing item for the operator: 10 direction
proposals are waiting across two projects** (9 in tracklight, 1 in pumper) with
no ledger rows, which is the backlog Phase 7.7 exists to clear.

**0 of 3 fetches** — eighth consecutive practitioner-codebase run to spend none.
Corroboration was the corpus itself plus the opened tree.
