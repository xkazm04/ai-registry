---
layer: technique
type: technique
subject: companion-runtime
technique: autonomous-cycle-hosting
status: forged
laws: [creation-names-reaper, absent-guard-is-loud, failure-not-empty-success]
shared_with: []
use_when: [a companion does work between conversations, two maintenance passes overlapped, deciding what a background pass may change without asking]
---

# Hosting an autonomous cycle

A companion works when nobody is watching: consolidating what it learned,
reacting to something that happened, tidying its own state. Each such pass is a
**cycle**, and a cycle is not a loop that happens to be running — it is work the
runtime hosts, with an admission decision at the front, a boundary around what it
consumes, a ceiling on what it may spend, and a declared landing place for what
it produces.

What triggers a cycle over accumulated material — pressure rather than a clock,
one read serving both the admission measurement and the consumed window,
drain-forward truncation, validation of every identifier a model returns — is the
memory subject's discipline for its consolidation pass, and applies to any cycle
that consumes a backlog. This technique owns the process-level half: the parts
that are true of every cycle regardless of what it computes.

## Admission is one decision with one owner

Before a cycle starts, exactly one component decides whether it may. That
decision is not distributed across the callers that might want to trigger one
(a schedule, a person's explicit request, a wake after idleness, a developer
button), because each of those will implement a slightly different subset of the
checks and the one that skips the check is the one that runs at three in the
morning.

The admission decision answers, in order: is a cycle of this kind already
running; is a turn currently live for this companion; is there enough pressure to
justify the cost; is there budget; and has the minimum interval since the last
completed pass elapsed. Every refusal is a **named reason**, returned to the
caller and recorded — "not admitted: a turn is live" and "not admitted:
insufficient pressure" are different facts, and a cycle that simply does not
happen teaches nobody anything
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The most common operational question about a companion that has gone quiet is
*why has it not run*, and it is only answerable if refusals are recorded as
loudly as runs. Skipping is an outcome, not an error: a scheduler that consults
admission on every tick will be told "not yet" almost every time, and a runtime
that returns a failure for the normal case trains its operator to ignore its
failures.

**The interval floor keys on the last completion, never on the presence of an
in-progress marker.** The two look interchangeable and are not: an in-progress
marker left behind by a crashed run is exactly the state a system needs to keep
(it is the only evidence the crash happened), and an admission check that treats
it as "a cycle is running" lets one dead process suppress every future cycle,
silently and forever. Liveness within this process is answered by an in-process
claim; history is answered by completions.

## Single-flight, and never beside a live turn

**A cycle never overlaps itself.** Two passes over the same backlog either
double-process the overlap or split it unpredictably, and both outcomes are
invisible in the output. The guard is a claim, not a check: acquire-or-refuse as
one indivisible act, so two triggers arriving together produce one run and one
recorded refusal rather than two runs that each saw an idle system.

**A cycle does not run beside a live turn on the same companion.** The two would
read and write the same state while a person waits, and the person's turn is the
one that must not slow down or read half-applied changes. Which yields to which
is a product decision — a cycle can be deferred until the conversation quiets, or
interrupted mid-pass — but it is a decision, and the interrupted case only works
if the cycle is resumable, which is the next section.

The claim names its reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): it is
released on success, on failure, on interruption, and on an early return from
anywhere in the pass — which is an argument for tying its release to the scope
that owns it rather than to a line at the end of the happy path. A claim that
outlives its run is a companion that has permanently stopped maintaining itself,
and it presents weeks later as "the cycle just never runs any more", with no
error anywhere. The simplest version that holds: keep the claim in process
memory, so process death releases it by construction, and keep the *durable*
in-progress marker separate and honest — it records that a run started and never
finished, and nothing keys admission on it.

## Every cycle declares its ceiling in advance

A cycle spends money with nobody watching, which is the worst combination of
properties in the system. So each cycle kind declares, before it starts, what it
may consume: a cap on the material it will read, a cap on the model legs it will
run, and a spend ceiling for the pass. Reaching a cap ends the pass **cleanly and
visibly** — a recorded partial run with what was covered — rather than by
continuing until something else stops it.

A ceiling that has to be configured to exist is not a ceiling
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)): a deployment
that never set one converges on unbounded, and unbounded is exactly the state
that was supposed to be impossible. The default is the conservative value, and a
deployment raising it is a visible act.

**What a cap dropped is counted, and counted against the right denominator.**
The trap is subtle and it defeats the whole report: if the pass measures its own
window by the size of the fetch it performed, and the fetch was itself capped,
then a window of a thousand items reports as "read 120 of 120" and the loss is
invisible in the exact run where it was largest. The available count comes from a
separate measure of the whole window; the read count comes from the pass. A
number that travels carries what it counted
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)), and a
pass that does less but reports truthfully beats one that does more silently.

## Propose-only is the correct default for anything structural

Cycles produce two very different kinds of output, and conflating them is how a
companion becomes untrustworthy in one release.

**Additive, reversible, per-item output** — a new memory item, a strengthened
confidence, a recorded observation — can land directly, subject to the same
validation door as any other write.

**Structural output** — reorganizing the companion's own taxonomy, deciding what
to forget in bulk, rewriting its self-model, retiring a body of knowledge —
lands as a **proposal**: written to a queue, visible, adoptable or rejectable,
and never applied by the pass that composed it.

There are two conservative modes here and they suit different risks. **Propose**
is for output a person can act on: the pass writes the candidate, it changes
nothing until adopted, and adoption is one action. **Report-only** is for output
whose *policy* is not yet trusted — bulk retirement is the usual case. The pass
runs the real selection, using the same code the enforcing version would use, and
writes what it *would have* done into its report without touching anything. That
is how a policy earns promotion: a run of reports a person reads and agrees with,
rather than an argument. Running a different, simpler selection for the dry run
defeats it, because what gets reviewed is then not what would run.

This is not timidity. It is the
recognition that structural changes are the ones whose mistakes are hardest to
notice (nothing looks wrong; some knowledge is simply gone) and hardest to undo
(the evidence needed to reconstruct it was part of what was removed). A young
system's honest answer for every structural class is propose-only, and promoting
a class to automatic is a decision made from evidence — a record of proposals
that were adopted unchanged — rather than from confidence.

The proposal queue is itself hosted work: it has a cap, an expiry, and a reaper,
or it becomes a backlog of stale suggestions that a person learns to ignore
wholesale, which is worse than not proposing at all.

## Restart safety

A cycle must be safe to kill at any instant, because it will be. Three properties
deliver that, and a cycle missing any one of them will eventually corrupt
something quietly:

- **Idempotent over its window.** Re-running a crashed pass does not re-mint what
  it already produced or double-apply what it already applied.
- **Progress is committed as it is made**, not at the end. A pass that writes
  everything in a final step loses an hour of work to a restart and — worse —
  loses it in a way that leaves the consumed-through position ambiguous.
- **The consumed-through position advances only over material actually
  processed.** A pass that advances its cursor on start, or on partial success,
  skips material no pass will ever revisit; the skip is silent and permanent.

## When not to do this

A companion with one background pass, run manually, does not need admission
plumbing — but it does need the claim and the ceiling, because those are the two
that fail catastrophically rather than inconveniently. Everything else in this
technique arrives with the second cycle kind, which is also when the interactions
between cycles start to matter.
