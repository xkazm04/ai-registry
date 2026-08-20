---
name: deepen
description: "Review and widen an existing knowledge-bundle topic via deep web research + training data: scan a domain for undercooked subjects, research the chosen ones in mandatory-counter-evidence lanes, and land gate-clean corrections, techniques and dated field applications. Runs interactively (finding-level triage), in batch (worker-per-subject under Director diff-review), or as a long-running loop with a saturation ledger. Use when a bundle's subjects should rise above the repo they were forged from, or stay current as the field moves."
category: ai-native
memory: project
version: 1.0.1
tags: knowledge, rkb, research, saturation, loop
---

# Deepen

The forge (`domain-knowledge-forge`) creates a bundle from a repository's ceiling;
`/deepen` raises subjects *above* any repository - **improve** (date-stamp or correct
stale claims), **widen** (convergence-earned techniques, dated field applications),
**validate** (benchmarks where a claim hinges on a measurement). Validated across four
bundles: interactive, 3-wide and 8-wide batch, and a 3-round loop on a fresh domain.

## The cycle

1. **Scan** - score every subject: deterministic signals first (technique/application
   counts, body mass, stack diversity, missing dated applications), then **demand**
   (registered consumer apps' use-cases x the bundle index - a coverage hole is
   forged, not deepened around; a consumer deviation outranks any scan), then
   staleness (expired `refresh_by:` clocks). Spot-check the index against one real
   file before trusting any score. Judgment gap-thesis pass on the shortlist only.
2. **Research** - 3-6 lanes per subject. **Counter-evidence is non-optional** and the
   highest-value lane per token in every measured run: actively refute the subject's
   strongest claims; a claim verified-and-left-untouched is a first-class result.
   One **training-data-only** lane runs blind to search results - its job is proving
   convergence (a claim two independent lanes reach earns technique-level placement).
   **Read the current file before drafting any correction** - golden paths often
   hedge better than techniques, and phantom fixes against a summary are the
   dominant failure mode.
3. **Apply** - in-session, gate-clean, atomic commits per subject. Product-named
   knowledge lands only in applications; every dated application carries
   `refresh_by:` (vendor landscapes ~3 months, regulatory <=12, standards ~6, craft
   principles no clock). Corrections keep `status: forged`; nothing self-promotes.
4. **Reflect** - decline-why (once, batched), a per-domain **saturation ledger**
   (depth rung L1 synthesis / L2 primary / L3 empirical; last-pass yield; clocks;
   demand; dry-streak), and banked leads with return conditions. Recompute scores
   fresh every cycle - carried-forward derived metrics drift silently.

## Batch mode (Director-reviewed)

One full-pipeline worker per top candidate, in parallel. Hard worker rules: own
subject folder only (cross-subject findings return as **proposals**, including
home-ambiguous techniques - the Director places them); at most one new technique and
only on lane convergence; never touch shared files; never commit. **The Director
reviews actual diffs, never worker self-reports** - purity grep over upper layers, a
read of every new technique, corrections checked against the file's prior voice.
That review is the quality gate that replaces per-finding triage; it is not
delegable, and it is the batch-size ceiling (~8 per sitting).

## Loop mode

Cycle -> ledger -> repeat. A subject is **saturated** when: two consecutive passes
return counter-evidence all-confirmed with no earned technique (dry=2), the
structural floor passes, and every dated claim sits inside its clock. Saturation is
a state, not an end: when nothing clears threshold the loop **idles until the
earliest clock or an event** (consumer deviation, new registered app, a probe
contradicting the literature) and says so. Later rounds are **training-data-first by
design** - probes test standing claims; only round-1 surveys are web-heavy.

## Source-class memory (guarded)

Keep a per-domain ledger of source **classes** - never URL allowlists - tallied
post-hoc from worker citations against accepted vs declined findings ("regulation
text beats commentary"; "standards bodies' own docs are rich"; "listicles need a
second source"). Class priors feed landscape/current-practice lanes only; the
counter-evidence lane searches unconstrained, and the training-data lane never sees
priors - it is the calibration control (divergence from prior-guided lanes means the
priors are drifting). Negative caches are per-topic, never global. A class rule
graduates into this skill only after 3+ cross-domain observations, with its incident.

## Benchmarks

Only where a claim's value hinges on a measurement and a harness exists. Prefer
fixtures with **known ground truth** over fresh generations; run one agent making N
calls; n always visible; ask before real spend. Measured results live in
applications with their n - never laundered into upper layers as universal numbers.

## Anti-patterns (each earned by a measured incident)

- Reporting a content gap without verifying the instrument first.
- Padding a findings list - dry is a result; bank it.
- Editing upper layers with product names; the gate catches it, don't make it.
- Carrying forward last cycle's scores, or writing counts from memory instead of
  the regenerated index output.
- A benchmark that asserts data round-tripped rather than behavior observed.
- Re-running a saturated subject with no clock or event to point at - the loop's
  own law is that unmeasured is not pass.
