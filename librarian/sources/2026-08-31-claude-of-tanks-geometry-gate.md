---
source: github:Kevin-Liu-01/Claude-of-Tanks
kind: first-party practitioner repository (build-walkthrough form; contract + lessons + postmortem + ~130 instruments in one tree)
url: https://github.com/Kevin-Liu-01/Claude-of-Tanks
title: "Claude of Tanks - browser armored-combat game with a procedural vehicle rebuild program"
author: Kevin B. Liu
words: 26981 landing page / ~60000+ in-tree operating documents
extracted: 14
accepted: 5
declined: 0
leads: 5
already_covered: 1
untriaged: 3
dispatched: 0
applied: 1
shipped: 0
run_id: tanks-0831
siblings: 2
---

# 2026-08-31 - claude-of-tanks geometry gate

Class read: **first-party practitioner repository**, build-walkthrough form. Named at
Phase 2 with an expected yield of **high**, and the class delivered. The distinguishing
feature is that `BUILD-STANDARD.md` records owner directives as *dated law revisions*,
each carrying the screenshot or incident that caused it, and `LESSONS.md` exists
explicitly as "the stories behind the laws" — a first-party account of paid-for failure
modes with the mechanism decoded rather than the symptom reported. Corroborated
corpus-internally; **0 of 3 web fetches spent**, as the class predicts.

Mined from a shallow clone at commit `286bd2a`, never from the ingest. Landing page is
26,981 words of README and would have yielded quotes; the in-tree operating documents run
past 60,000 across `GEOMETRY-GATE.md`, `BUILD-STANDARD.md` (13 dated addenda),
`LESSONS.md`, `DECISIONS.md`, `SCREENSHOT_CONTRACT.md` and a full rollback postmortem.
Swept in the Phase 2b order: operating documents → the instrument (`tools/`, ~130 probes
and audits) → the measurement (per-vehicle score files plus a tool-written ledger) →
types and config → tests → README last.

Board: 2 siblings live at claim (`intake-tigerbeetle-0831` holding
`standards-and-gates/quality-gates`, `genesis-agi` at phase 0); 5 live by Phase 6, none
in `game-production`. The tigerbeetle run's hold on `quality-gates` is why gate findings
were routed to `game-production` rather than to the software-engineering gate subject —
that routing turned out to be correct on the merits too, not merely polite.

## Accepted — one subject, six techniques

**`game-production/content-pipeline/reference-parity-gating`** (new subject).

Found by the Phase 6 enumeration hunt rather than from the source. The sibling subject
`generated-mesh-acceptance` states its own boundary out loud — *"does it read at
silhouette distance… those are perceptual judgments… That is a different subject"* — and
nothing in the corpus owned the other side. The bundle had a quality gate for **motion**
(`motion-quality-gating`) and none for **geometry against a reference**, which is the
asymmetry hunt paying out: two concerns that both "look covered" until you ask which one
is actually measured.

This source is a four-week program that built exactly that missing subject, with an
instrument, a per-vehicle measurement ledger, and case law for a defective reference.

Techniques landed:

- `dual-anchor-scoring` — two authorities measuring different quantities (reference
  silhouette owns profile, published specification owns scale) whose conjunction a wrong
  artifact cannot satisfy. Source's own words: *"You cannot satisfy both without being
  actually right."* Carries an amendment from the same-run A/B (below).
- `register-once-from-the-invariant` — translation-only registration, frame derived once
  from the region the defect cannot reach and reused, so a displaced part cannot
  self-register its error away.
- `no-average-hides-a-failure` — min across components, p95 over max, symmetric coverage;
  plus the floored-metric rule (a saturated headline reads 0 before and after a real fix —
  judge by the terms).
- `findings-carry-the-correction` — the row payload is the product; located signed
  deviations in real units, and no iteration cap because the gate defines done.
- `instrument-blindness-register` — enumerate the defect classes the rig structurally
  cannot see and assign each a different witness. Four worked classes, each of which
  shipped a defect at a passing score.
- `defect-cap-bounded-to-its-reach` — a waiver covers exactly the rows the defect can
  reach, derived from the registration; never the specification anchor.

Placement override worth recording: Phase 4's `HOME IF NEW` and my own instinct both said
`asset-production`. That category sits at **exactly 10 child directories** — the profile's
hard cap — so an 11th subject there is a gate failure, not a preference. `content-pipeline`
(6/10) is also the better home on the merits: these are parity-*measurement* techniques
that transplant across asset types, which is what separates that category from the
per-asset-type craft in `asset-production`. Verified against `taxonomy.json`, not against
a subject count.

## Applied

`dual-anchor-scoring` → a connected project's agent-specification contract gate, mode
**experiment**, verdict **not-better**. Arm A (the live gate) passed 4/4 on a
heading-exists rule; arm B added a second anchor asking whether the section enumerates its
outputs, and flagged 2 of the 4. Both flags were false — the specifications enumerate
correctly inside fenced templates the probe's pattern did not recognise.

The failure is the valuable part and it fired the technique's own third decision rule: arm
B read *the same representation* as arm A with a different parser, so its disagreements
were properties of its parser rather than of the artifacts. The technique gained the
amendment **"a different parser is not a different authority"** — independence belongs to
the authority, not to the rule, and correlation is hardest to see when the second
measurement is *stricter*, because strictness reads as rigour. Return condition: re-test
when that project's golden-output layer exists and supplies a behavioural anchor.

No project code was changed and no project tree was written to; the probe ran read-only
from scratch. The project-side `.ai/applied.jsonl` row is **pending operator confirmation**
per Phase 8 step 2 — the operator's pick named no project.

## Already covered — 1 catch

- **Freeze the candidate hash before rendering evidence; any change invalidates the prior
  verdict.** The source states it as a corrective action (*"reject any packet if code,
  assets, or hashes change during review"*). Fully owned by
  `game-production/craft-judgment/quality-verdict-integrity/content-hash-binding`, which
  says it better and adds the four-standing vocabulary. Not re-proposed.

## Corroboration, not discovery — 1

- **Envelope parity is false comfort.** An acceptance slate of twelve vehicles: all twelve
  matched published dimensions within ~4%, all twelve failed the perceptual review, nine of
  them on whether the road wheels could be counted in a side view. The source's phrase is
  *"envelope-parity is FALSE COMFORT."*

  This does not author a new claim — `_laws.md` L9 already says structural proof is
  necessary and never sufficient. What it adds is the *strength of the metric that still
  failed*: dimensional parity is much stronger than well-formedness, and it was still
  uncorrelated with acceptance at n=12, 0/12. Landed as the structural fact inside
  `applications/process--dual-anchor-scoring.md` rather than as a technique, because a
  measured negative on an existing law is a citation, not a new rule.

## Leads — 5, each with a return condition

1. **A render/material bucket is not a valid selector for a structural edit.** The
   postmortem's first root cause: a fleet-wide transform keyed on a merged `hull` bucket
   also moved skirts, fenders, lights and service fittings, because the bucket was a
   *render* grouping and the transform was a *structural* one. Corrective was an exact
   component allowlist and splitting the buckets before any mechanical edit. Generalises
   well beyond geometry — a grouping built for one concern is not a selector for another.
   *Return when a second independent source shows the same shape, or when a fleet project
   grows a bulk-transform seam.*

2. **Small commits do not contain a shared global assumption.** Same postmortem: *"Small
   commits did not make the program safe because they shared the same flawed global
   assumption."* This is a real correction to standard incremental-change doctrine — change
   *size* discipline gives no protection when N small changes share one premise, and the
   missing control was a stop-the-line rule when multiple families regressed in the same
   pattern. *Return when a second source or an incident in a managed project reaches the
   same rule; this is law-altitude material and needs convergence, not one repository.*

3. **Prove a coupled change by intercepting the instrument's inputs.** Where a reference
   repair and a candidate rework must land together, the program verifies against the
   *unmodified* gate by serving candidate bytes at the reference address through request
   interception — full-fidelity verification of a coupled state with zero shared-file
   edits. Partially absorbed into `defect-cap-bounded-to-its-reach`; the general testing
   pattern deserves its own home. *Return when a software-engineering testing subject is
   next swept.*

4. **Stage a tool-written shared ledger by index-blob surgery.** The program stages a
   constantly-rewritten, tool-owned ledger without touching the worktree copy —
   `git hash-object -w` plus `git update-index --cacheinfo` — to avoid sweeping concurrent
   agents' rewrites into a landing. This registry has the same problem and currently solves
   it with a coarser `ledger` lock; five sibling runs were live during this one. *Return
   when the run-board's ledger contention is next measured, or when a lost-append incident
   is observed.*

5. **Lock and ticket design scars.** A self-ticketing tool wrapped in an external lock
   deadlocked the fleet twice; a 16-digit ticket queue-jumped a 15-digit lexical sort
   ("width is law"); a foreign plain-file lock wedged a directory lock, so every tool now
   falls back through three unlink strategies. *Return when a concurrency subject is swept
   or the run-board grows a ticket queue.*

## Untriaged — 3, with anchors, nobody verified these

Recorded so a later run does not re-derive them. No judgment attached.

- **Severity follows the render loop.** A bundled skill re-ranks a generic scanner's
  findings by *where the code runs* — a minor inefficiency inside a 60 Hz frame callback
  outranks a major one in a settings panel — and keeps a hand-checked list of what the
  scanner structurally cannot see. Anchor: `.agents/skills/improve-threejs/SKILL.md`.
- **A screenshot contract as a runtime obligation.** The critic pipeline sees the product
  only through one capture tool, so the product must uphold a declared contract — a
  readiness global, a deterministic view enumeration, no dependence on wall-clock or input,
  zero console errors — or the build is defined as broken. Anchor:
  `docs/SCREENSHOT_CONTRACT.md`.
- **Claims about a measurable class must cite numbers with the instrument's noise band, and
  a delta below the printed band is NO-FINDING.** Angle σ ≈ 24/len_px°, sub-0.25 m segments
  carry a ±4° corner-bias floor, radii honest to ~3%, facet count ±1; eyeball reads of these
  classes stopped counting as evidence. Neighbours `measurement-honesty/noise-band-and-hysteresis`
  and `motion-quality-gating` may already own part of this. Anchor: `docs/BUILD-STANDARD.md` §D.

## Notes on the class

Two observations worth carrying forward.

**The dated-addendum structure is the tell for this sub-class.** A contract document whose
sections are numbered *and* carry an owner-directive date with the incident that caused
them is a first-party account with the motivation preserved — the release-walkthrough
property, in a repository rather than a talk. When a repository has one, read it before the
README and before the code; it is where the failure modes live. Thirteen dated addenda here
produced four of the six techniques.

**A repository's own postmortem outranks its lessons file for correction-class findings.**
`LESSONS.md` explains why the current rules exist and is therefore written from the winning
side. The postmortem is written from the losing side, names five root causes and six escape
points, and produced both of the strongest leads in this run — including the one that
contradicts standard doctrine. Read the postmortem for what the program got *wrong*; read
the lessons file for what it now believes.
