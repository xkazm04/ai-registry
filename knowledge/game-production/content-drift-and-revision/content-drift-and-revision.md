---
layer: golden-path
type: golden-path
subject: content-drift-and-revision
status: forged
use_when: [regenerating an artifact that other records already point at, deciding how much revision history a generated artifact needs, a verdict or dashboard disagrees with what the content now says, many production jobs contend for one external tool]
techniques:
  - bounded-revision-history
  - content-hash-vs-status-drift
  - add-only-hydration
  - produce-direction-stamping
  - batch-lease-on-a-non-reentrant-resource
  - orphaned-artifact-visibility
---

# Content drift and revision

A production line that regenerates its content on demand has a failure mode a
hand-authored one does not. On a hand-authored line, an artifact changes because a
person changed it, at a moment, with intent, and usually with a commit behind it. On a
regenerating line, an artifact can become a *different artifact* at any time, in a batch
nobody watched, while every dashboard tile, stored verdict, coverage count and
downstream reference keeps pointing at it by identity and keeps reading as though
nothing happened. The name is stable. The row is stable. The content underneath is new.

This subject is the answer to that in two halves. **Reversibility**: a re-generation that
cannot be undone converts a cheap operation into an irreversible one, and people
correctly stop using it. **Drift detection**: a system that cannot tell "the content
moved" from "the verdict moved" is blind to the more dangerous of the two. Neither half
works alone. Undo without detection means you can restore something you never noticed
was wrong. Detection without undo means you learn the artifact is gone and can do
nothing about it.

## Regenerable is not disposable

The seductive argument against keeping history is that the content is regenerable: if it
can be produced again from a specification, the old one has no value. This is wrong on
two counts, and the reasoning matters more than any retention number.

First, regeneration is not deterministic. A generative step re-run against the same
specification returns *a* valid output, not *the* previous output. The thing that was
accepted, reviewed, referenced and shipped against cannot be recovered by asking for it
again. Regenerability guarantees you can get something; it never guarantees you can get
that.

Second, the cost is asymmetric in time. Regenerating costs a bounded amount of compute
now. Losing an accepted artifact costs the review that accepted it, the downstream work
built on it, and the credibility of the line — all of which were paid for over weeks. An
accidental re-produce with no history is the cheapest possible action with the most
expensive possible consequence, which is precisely the shape of a mistake that will
happen.

But the opposite extreme is also wrong. Unbounded history over regenerable content buys
very little: nobody is auditing the eleventh-most-recent draft of a generated
specification, and the storage is real because these payloads are large and numerous.
The correct position is a **bound**, and the craft is in defending the bound rather than
the number. The bound must be large enough to survive the realistic accident — a bad
batch run, a wrong steer applied across a sweep, a misconfigured template — which is a
handful of regenerations deep, not one. It must be small enough that retention does not
grow with production volume. Two dozen revisions is a defensible answer to that shape of
requirement; two is not, and unlimited is not. The technique states the rule.

The two halves also feed each other, which is the argument for building both at once. If a
version is archived *only* when the content genuinely differs — not when a verdict or a
tier is rewritten over an identical payload — then the archive stops being only a safety
net and becomes a change record nobody had to plan for: versions archived since a moment
are proof the content moved, and how many times.

## Two drifts, and only one of them is watched

Every content line eventually grows a dashboard, and dashboards watch **status**: this
step is accepted, that one is failing, this one is unjudged. Status drift is easy to see
because status is the thing being displayed.

Content drift is the other event: the status did not move, and the content underneath it
did. The verdict still says accepted. The tile is still green. What was accepted is no
longer what is there. This is more dangerous than status drift for three reasons — it is
silent, it is invisible to exactly the surface people trust, and it inverts the meaning
of the signal, because green now asserts something false rather than merely being out of
date.

So a comparison between two observations of the same production line must yield **two
independent classifications**, not one: did the standing verdict change, and did the
content change. The four combinations are all real and all mean different things.
Unchanged in both is quiet. Status moved, content did not: someone re-judged, or a
rubric changed, and the artifact itself is untouched. Content moved, status did not: the
dangerous quadrant — a regeneration slipped under a standing verdict, and the verdict is
now evidence about the past, which is
[a verdict is bound to its content](../_laws.md#a-verdict-is-bound-to-its-content) read
from the content side. Both moved: an ordinary produce-then-judge cycle, and the only
one of the four that needs no explanation.

Detecting content drift means fingerprinting content, which means deciding what counts
as content — and the exclusion rule that answers that is the sharpest single edge in
this subject. Bookkeeping the pipeline writes for itself (stamps, retry logs, cached
renderings, timestamps) must be outside the fingerprint, or every artifact drifts every
time it is touched and the signal is discarded as noise within a week. The rule must
exist exactly once and be read by every path that computes or compares a fingerprint;
two implementations of "the same" exclusion will diverge, and the divergence is
invisible from both sides — [one authority per quantity](../_laws.md#one-authority-per-quantity)
applied to a derived value. The adjacent concern of binding a *verdict* to a fingerprint
at the moment of judgment, and classifying the standing of a verdict whose content has
since moved, belongs to the quality-verdict layer and is not restated here; what this
subject owns is detecting the movement of content itself, over time, whether or not a
verdict exists.

## The write path is contended, and the failure is quiet

Regeneration is usually a batch: a sweep across many entities and steps, run
unattended. Two properties of that make the write path the second source of drift.

The first is **concurrency at the record level**. Persisted production state is
frequently a document — a bag of keys, one per step or per facet — that several writers
update. The naive merge reads the document, computes a new one, and writes it back,
which silently deletes any key a concurrent writer added between the read and the write.
The victim is not corrupted data; it is a *missing* artifact, indistinguishable from one
that was never produced, and it will be produced again, costing money and possibly
overwriting something else. The rule is that hydrating persisted state into memory is
**add-only**: it may introduce keys and it may update the keys it owns, and it may never
remove a key it did not expect to see.

The second is **non-reentrant external resources**. Much of a production line drives
something that cannot be entered twice: a single-instance authoring application, an
editor session, a device, a licence-limited tool. A fleet of jobs contending for it will
not fail loudly; it will interleave, and the interleaving produces artifacts that are
each individually plausible and collectively wrong. The answer is an exclusive lease
held for the whole batch rather than a lock taken per job, because partial progress
against a resource that dies mid-batch is worse than no progress: it leaves a set of
entities half-regenerated with no record of where the line stopped. And a lease is
**drained**, not cancelled — when the batch must end, the work in flight is allowed to
finish and is counted, because cancelling hides the cost and leaves the resource in a
state nobody recorded. This is
[refuse rather than destroy](../_laws.md#refuse-rather-than-destroy) at the batch scale: a
refusal to start is a result, and a better one than a half-finished sweep.

A close cousin lives in the engine-integration territory — leases over a live external
application that a person may also be using — and the difference is worth naming. There,
the lease protects a human's session and the correct behaviour is to refuse loudly. Here,
the lease protects a shared throughput resource and the correct behaviour is to queue.
The mechanism is the same; the failure the mechanism is chosen for is not.

## An artifact must carry the direction that produced it

When an operator regenerates a step with a free-text steer — "darker, and make the
second phase a chase" — that steer is the most valuable and most perishable input in the
system. It is not in the specification, it is not in the template, and if it lives only
in the request that triggered the job, then the next regeneration silently drops it and
returns the artifact the operator was steering away from. The operator experiences this
as the line ignoring them.

So the steer is stamped **onto the artifact**, alongside the content it produced, and a
regeneration reads it back and re-applies it unless explicitly cleared. This makes the
artifact self-describing about how it came to be, which pays a second time during drift
investigation: when content drift is detected, the first question is what direction the
new content was produced under, and if that answer lives only in a job log it is usually
already gone.

The stamp is bookkeeping, not content — it is exactly the kind of key the fingerprint
exclusion rule must drop. An artifact whose steer was edited did not change; the same
steer re-run producing new content did. Getting this backwards makes every steer edit
read as a content change and every real regeneration read as clean.

## Orphans are the accounting hole

An artifact is stored against a compound identity: the collection, the entity, the step.
Entities get deleted. Steps get renamed or removed from a pipeline. The artifact keyed to
the old identity survives, and is now invisible to every normal query, because every
normal query starts from a live entity or a declared step and walks down. It is never
listed, never cleaned up, never counted in coverage, and it still occupies storage and
still carries a verdict that will never be revisited.

The naive fix — cascade the delete — is wrong for the same reason unbounded regeneration
is wrong: it converts a reversible mistake into an irreversible one, and a mistaken
entity deletion should not also destroy weeks of accepted content. The right fix is
**visibility**: a query that starts from stored artifacts rather than from live
identities, joins back, and reports the ones with no living owner as a named category. An
orphan that is on a list is a decision waiting to be made. An orphan that is not on a list
is a lie in the coverage number, because
[unmeasured is not a pass](../_laws.md#unmeasured-is-not-a-pass) has a mirror image: work
that exists but is uncounted distorts the denominator in the flattering direction.

## What the naive reading gets wrong

- **"Regenerable means we do not need history."** Regeneration is non-deterministic; you
  can get *a* result, never *the* result. The bound is the answer, not the absence.
- **"We watch status, so we would see it."** Status is the drift that is already
  visible. The dangerous one is content moving under a stable status, and nothing on a
  status dashboard can show it.
- **"The fingerprint should cover everything, to be safe."** A fingerprint that includes
  bookkeeping fires on every touch, and a detector that always fires is turned off. The
  exclusion rule is what makes the signal usable.
- **"Lock per job — it is finer-grained."** Finer-grained locking maximises the chance of
  a half-completed sweep, which is the outcome you were trying to avoid.
- **"Deleting the entity cleans up its artifacts."** It hides them. Cascade turns a
  recoverable mistake into an unrecoverable one; a visible orphan list keeps the choice
  with a person.
