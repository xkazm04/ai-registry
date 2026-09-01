---
source: boundary-software-factory
kind: youtube
url: https://www.youtube.com/watch?v=tGbjIvvYuHE
title: How to Build a Software Factory for AI Coding Agents
author: Boundary (AI That Works - two founders in dialogue)
words: 15485
class: first-party practitioner account / dialogue
extracted: 12
accepted: 1
declined: 0
leads: 1
already_covered: 4
untriaged: 4
applied: 1
shipped: 0
dispatched: 0
fetches: 0
run_id: intake-yt-tgbj-0831
siblings: 4
---

# Software factory design patterns (dialogue)

Two founders comparing their **own** production agent fleets - one building a
programming language for agents, one building a multiplayer coding-agent
workspace. Both halves first-party; nothing relayed. Class read at Phase 2 and the
expected yield stated before triage: **1-3 findings, in the disagreements and in
unprompted convergence**, fetch budget likely unspent. That is what happened - 12
candidates, 1 landing, **0 of 3 fetches spent**, corroboration entirely
corpus-internal.

Four sibling runs were live at claim; six by the time content landed, and **two of
them named `machine-paced-delivery`** (`intake-ripgrep-0831`, `intake-rpwcyb`). The
contention was survivable without waiting because this run's landing is an
amendment *inside* an existing technique file plus one golden-path clause - it
never touches the `techniques:` list, which is the line two runs adding techniques
to one subject actually collide on. The golden-path clause was taken under the
`content` lock with a re-read inside it; the technique file was uncontended on
`check`.

## Accepted

**1 - Change size rubber-stamps the gate independently of arrival rate**
`[13:45]` - amendment to `human-gate-capacity`, plus one clause in the golden path.
The source's practice: a 20k-line prototype change is treated as a spec, then
deliberately decomposed into 1-3k-line changes, because "I'm not asking anyone to
review a 20k line PR... the person who's reviewing it is not going to have the same
bar of quality and they're going to resent it."

The gap was an **asymmetry**, which is the third one this subject has produced and
the shape its own note already generalizes. `human-gate-capacity` models the rubber
stamp as a *rate* phenomenon - four measures, all counting items, a distribution
discipline, an ordered demand ladder. `proposal-not-push` gives change size **one
sentence** ("the size at which review degrades to skimming is lower than people
admit") with no model and no measure. And the bundle already knew the relationship:
`batch-size-thresholds` in `delivery-analytics` buckets size against review
feasibility and names its top bucket *approval is a formality* - the rubber stamp,
at size, written down in a measurement subject and never connected to the gate that
models the rubber stamp.

Three things the amendment carries that neither neighbour had:

- A single oversized change reads as **health** on the leading measures - arrival
  low, backlog empty, dwell uninformative - and only post-merge repair moves. So
  post-merge repair is the detector and **arrival is the discriminator**: rising
  repair with *low* arrival is the size-driven case.
- The two causes have **opposite remedies**. The ladder reduces arrival; this one
  raises it, since one unreviewable change becomes eight reviewable ones. A team
  reading that rise as overload and batching the work back together walks into the
  failure it was measuring.
- The split needs a predicate, because `batch-size-thresholds` already warns that
  splitting is the canonical gameable move. The predicate is the one
  `proposal-not-push` applies to concerns, carried to size: **a piece must be
  independently mergeable and independently worth merging.** Merely smaller pieces
  "convert one formality into eight."

It also corrects a decision rule in the file: *per-item slimming is a constant
factor* holds for shape work and not for size, which falls off a cliff rather than
declining smoothly.

## Applied - and the apply step took the unit away

`experiment`, verdict `better` with the unit corrected. Read-only harness over a
managed project's history: 7,773 non-merge changes, 195 days, **39.8 changes/day** -
the subject's thesis arriving as a fact.

Arm A (the four item-counting measures) yields **one** repair number, 62.9%; two of
its four measures do not exist in git history at all, since there are no review
timestamps. Arm B by changed lines separated 81.3% above the large threshold from
57.4% below - a clean-looking 1.42x.

**It did not survive its control, and that is the run's most useful output.**
Repair tracks *files touched* on its own - 34% / 50% / 66% / 74% / 92% across file
bands - and holding files fixed, the line gradient mostly vanishes and in the
single-file band runs backwards (35.2% / 24.6% / 29.0%). Bigger changes touch more
files, so a line-based size measure reproduces the files result and appears to
confirm itself. The technique gained the condition: **state the unit and validate it
against the other candidate once.** The owning table names the unit as an open
choice and defaults to lines; in this tree that default carries almost none of the
signal it appears to carry.

Honest bound, written into the application: the measured tree has **no human merge
gate** on that population, so the run corroborates the amendment's premise and never
observes its mechanism. Return condition names the instrument - a tree with recorded
review events.

This also discharges a debt the subject note recorded on 2026-08-28: *"the subject
has no application for `human-gate-capacity`; the measures it prescribes have not
been taken on any connected tree."* They have now.

## Already covered - catches, with the corpus winning

- **Regenerate rather than sandbox** `[30:56]`. The source runs agents on bare
  hardware with no container, justified as: user feedback is untrustworthy, so we
  regenerate a repro through our own prompt and execute only that. The corpus covers
  this better and **refutes the stated reason**: `model-output-as-untrusted` treats
  the model as "a brilliant, unvetted contractor" and puts a closed operation grammar
  at the door. The source's own justification is that the model is "smart enough to
  like not try" to mine Bitcoin - which is the demo's proudest segment and exactly
  where its boundary is missing. The real control is that the regenerated artifact is
  constrained in *form*, not that the generator is well-behaved.
- **Bounded repair loop, then escalate** `[24:58]`. "Do not notify a human until the
  bot is happy, or until three iterations hit." `proposal-not-push` already: "After a
  bounded number of attempts, stop and report. An unbounded fix loop converges on the
  shortcut."
- **Multi-repo coordination directory** `[46:41]`. One canonical place to start agent
  work with a map of sibling repos; no submodules, no symlinks, no two-way
  references. Covered by `single-source-topology` and `workspace-ancestry-isolation`.
- **95% automatic beats 100% automatic** `[32:37]`. "The folly that a lot of people
  make is they try and make a system that is fully automatic." Covered in spirit by
  `automation-ships-off-by-default` and the unattended-loop material.

## Untriaged - nobody verified these, and they are NOT declines

Two sit on subjects a live sibling was holding during this run, so they were left
rather than judged.

- **Every pipeline stage ships its measured accuracy with the change** `[20:08]` -
  "you have to push repros onto here, so you actually have to give us metrics for
  every single version of this pipeline." Subject: `quality-gates`, held by two
  siblings this run.
- **"Post your token usage or it doesn't count"** `[05:33]` - an adoption claim is not
  credible without the spend evidence behind it. Subject: `measurement-honesty`, held
  by `intake-pgrust-0831`.

Two more are homeless rather than contended:

- **A cheap downstream observable corrects a weak classifier** `[21:00]` - "we can
  measure it always by lines of code. If the fix ends up being misclassified as a
  small issue and ends up being 500 lines of code, we just force classify it as the
  other one." The idea is to stop raising classifier accuracy and instead place an
  observable downstream that catches the error after the fact. Related in-source:
  "if it dedupes half of the things then you've saved yourself a lot of time" and a
  stated sufficiency target of 60%. No clear home; map on concepts next time it
  appears.
- **Untrusted feedback becomes an issue only after a machine-made repro** `[16:16]` -
  check-if-already-fixed, then dedupe, then generate a clean repro, and *only then*
  create the issue ("an issue isn't created from feedback; issues are created post
  feedback"). The second practitioner supplied the precondition unprompted, which is
  the discriminator this class is reliable for: it works "for issues with clear code
  repros" and anything hard to reproduce goes to a human instead. `triage-queues`
  excludes it by its own stated boundary ("the producers themselves... the queue's
  responsibility begins at the adapter"), and `remediation-handoff` starts from
  findings, not reports. Genuinely homeless, and the source's own version is
  unfinished ("we don't actually know what the accuracy rate is yet"). Would be a
  subject rather than a technique - deliberately not proposed as `XL` from one
  company's in-progress internal tool.

## Lead

**No interface standard between control plane and harness** `[52:10]`. ACP is "quite
narrow", AGUI broadcasts UI events, and **neither supports hooks** - while every
harness's hook and lifecycle model differs, which the practitioners argue is correct
rather than accidental, because the harnesses sit at different points on an
opinionated-to-configurable spectrum. Their own analogy: the missing abstraction is
whatever `state` was for web UI, and nobody has found it yet. Return condition: when
a hook-carrying interface ships from more than one harness vendor, or when a
connected project needs to target two harnesses at once.

## Not proposed, and why

The source's headline artifact is a **four-layer stack** - compute, dev environment,
harness (inner and outer), control plane - with a buy-or-build decision per layer and
the thesis that you should not have to buy every layer below the one you buy at. It
strip-tests cleanly and it is the most quotable thing in the source. It is also two
vendors describing the shape of the market they sell into, argued from their own
product boundaries, and landing it would be a subject authored by a video. The one
piece with independent teeth - that the layer you must own is the one whose
correctness depends on your private network topology and identity provisioning,
because that is where the vendor-cloud friction actually appears - is recorded here
and left unlanded pending a second, independent source.
