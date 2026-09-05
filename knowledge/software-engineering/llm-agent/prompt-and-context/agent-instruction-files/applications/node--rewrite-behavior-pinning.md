---
layer: application
type: application
subject: agent-instruction-files
technique: rewrite-behavior-pinning
stack: node
verified_on: 2026-09-05
verified_against: node@20
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# The lexical pin is not gate-grade: 35 real rewrites, 10 flagged, 0 confirmed

Run 2026-09-04 over the complete revision history of twelve always-loaded
instruction assets in seven repositories — six method files in a registry's
own skill lane, plus one repo-owned instruction file per project across a
six-project fleet. No product code was changed; the harness replays committed
history and reports.

The technique says a bulk rewrite needs behavioural pins because the per-line
funnel cannot see it. The cheapest thing anyone will reach for first is a
**lexical** pin — scan the diff for hedges that disappeared — and this run
built that, asserted it, and measured it against the real population.

## The two arms

**A — the review that actually happened.** Every one of these rewrites shipped
after an owner read its diff. By construction A flagged nothing: all 35 are in
`HEAD`.

**B — the same diffs through a modality-delta detector.** Removed lines
classified `hedged` (a permission or qualification lexicon) are paired against
added lines by token containment; a pair whose removed side was hedged and
whose added side is a bare imperative or a mandate is reported as a candidate
inversion.

The detector was asserted before it was trusted, against three known positives
covering the three shapes the technique names — hedge→mandate, hedge deleted,
permission→imperative — and four known negatives (a faithful paraphrase that
preserves modality, an unrelated pair, an unrelated pair carrying a hedge, and
a rephrasing that keeps its hedge).

## The mid-state, then the verdict

| Stage | Count |
| --- | --- |
| instruction assets swept | 12 (7 repositories) |
| revisions scanned | 152 |
| bulk rewrites (>=25% of lines replaced) | 35 |
| candidate inversions **flagged** | 10 |
| candidate inversions **confirmed** on reading | **0** |

The mid-state is the row that matters, and it is invisible at the endpoints.
Ten flagged reads as a working detector; zero confirmed reads as a clean
corpus. Both are wrong. All ten candidates were pairing artifacts: eight
matched a removed prose line against an unrelated added *table row* from a
prose-to-table restructure, and two matched a line against its own re-wrapped
continuation. The clearest, `sim=1.0`, paired "every key is optional (defaults
in ...)" against the tail of the same sentence after a re-wrap — the phrase
survived verbatim into the file as it stands today.

**Verdict: `not-better`.** Arm B costs ten alerts and buys nothing. A gate at
this precision would be switched off within a week, and the technique's own
rule predicted it: *a check that greps the candidate for a required phrase has
re-implemented the per-line funnel and inherited its blind spot.* The detector
asserts over text. The technique says pins assert over behaviour. The seam
confirmed the rule by violating it.

## What the tree said that nobody designed

Two structural facts fell out of the sweep and neither was the thing being
measured.

**The trigger has never fired here.** Of 35 bulk rewrites, **24 grew the file**
and 11 shrank it — and every shrinking one is a restructure of equal size, a
one-line re-wrap, or a whole-file deletion later restored. Not one is a rewrite
undertaken to reduce what the asset costs per turn. The technique governs
compression-motivated rewrites, and this fleet has never performed one, which
is why the inversion arm had nothing to find. The population, not the
instrument, is what is missing.

That absence is itself evidence for a sibling technique: `line-earning` names
"a file grown by accretion until it outweighs the task on every session" as a
failure mode, and the largest asset in the sweep is a 114 KB method file that
has taken 30 revisions and has never once been reduced (32 revisions and
114,270 bytes on 2026-09-05 — still growing). The fleet is a live
instance of the accretion it publishes a rule against.

**The gate is structural by construction.** The registry's own skill gate
(307 lines at the run; 339 on 2026-09-05) asserts file presence, frontmatter keys, ASCII in the blocks that
hand-rolled parsers read, kebab-case names, the routing-description cap and a
body-length note. Every assertion is about the file's *shape*; none is about
what an agent does under it. The published rule and the gate that guards it
are in the relation `gate-sees-target` describes, and the run that landed the
technique is the run that found its own tree unpinned.

## Three assertions this run overturned

Recorded because each was caught by the harness rather than by the author, and
because two of them are the same bias:

1. Pairing threshold at 0.34 — the known positive scored 0.29 and was missed.
   **The strongest inversions rewrite the most words**, so a similarity floor
   tuned by intuition excludes exactly the cases the detector exists for.
2. Similarity normalised by the longer line — a severe compression is much
   shorter, so the same bias reappeared one layer down. Containment over the
   shorter line, plus a shared-long-token requirement to hold false pairs down.
3. Threshold at 0.4 after that fix — admitted two positives and dropped the
   first again. Settled at 0.25, where all seven assertion cases pass.

## What this realization cannot do

The runtime witness is the registry's own CI, which pins node 20 across its
three gate jobs while the machine that ran the sweep carried node 24; the
lower major is kept because it is the tree's own pin. It reports on
**committed history only**, so it says nothing about a rewrite
still in a working tree, which is where a pin would have to fire to be useful.
It has no behavioural arm at all: nothing here ran an agent under either
version of any file, so "the behaviour survived" is never established — only
"the words did." And its lexicon is English and hand-built; a file written in
a different register would score differently for reasons that have nothing to
do with modality.

**Return condition.** Re-run when a fleet instruction asset is first rewritten
*to reduce its per-turn cost* — that is the population this measured the
absence of. At that point the useful arm is behavioural, not lexical: the same
task run against both revisions of the file, with the permissive branch as the
assertion.
