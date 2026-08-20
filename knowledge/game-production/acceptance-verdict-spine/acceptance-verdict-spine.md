---
layer: golden-path
type: golden-path
subject: acceptance-verdict-spine
status: forged
use_when: [two systems report different statuses for the same work, designing how a shippability gate concludes, a producer's self-reported pass reaches a dashboard, a composed check needs to explain itself]
techniques:
  - three-layer-merge-order
  - explain-why-this-verdict
  - ungraded-marker-doctrine
  - gate-check-dependency-map
  - hardcoded-pass-antipattern
  - first-non-pass-reporting-in-all-of
---

# Acceptance verdict spine

A unit of production work — one step of one piece of content — accumulates opinions.
A cheap local checker reads what was produced and grades its shape. A server-side
drain actually runs the runtime and perceptual gates the local checker could only
defer. A quality judge looks at the artifact and says whether the craft is good
enough. Three authorities, three answers, and every surface in the product wants a
single colour.

The spine is the machinery that turns those opinions into **exactly one verdict per
unit of work**, deterministically, with an audit trail. It is not a scoring system
and not a consensus mechanism. It is a conflict-resolution design, and the correct
answer to conflict resolution here is a **total order over authorities plus a record
of who spoke** — never voting, never averaging, never last-writer-wins, and never
most-recent-timestamp.

## Why the obvious answers are all wrong

**Voting** assumes the authorities are peers measuring the same thing. They are not.
A shape checker and a perceptual judge do not disagree about one quantity; they
observe *different* quantities and happen to emit the same vocabulary. Two out of
three saying `pass` tells you nothing when the dissenter is the only one that looked
at the pixels.

**Last-writer-wins** makes the verdict a function of scheduling. Re-run the drain and
a judged failure evaporates; re-run the judge and a real runtime failure evaporates.
The system's answer becomes unstable under operations that were supposed to be
read-only.

**Most-recent-timestamp** is last-writer-wins with a defence. It fails identically and
adds a new failure: clock skew between the machine that ran the checker and the
machine that ran the drain now moves verdicts.

**Averaging or scoring** destroys the distinction between *failed* and *not measured*
— the single most expensive collapse in this whole domain ([unmeasured is not a
pass](./../_laws.md#unmeasured-is-not-a-pass)). Two statuses with no ordering between
them cannot be arithmetic operands.

The property you actually need is **determinism under replay**: the same three inputs
produce the same verdict, in any order they arrived, on any machine. A fixed
precedence order gives you that for free. Nothing else on the list does.

## One spine, or the surfaces will disagree

The rule that makes the whole design worth building is
[one authority per quantity](./../_laws.md#one-authority-per-quantity): the merge
happens in exactly one implementation, and every consumer — the detail banner, the
navigation rail, the progress matrix, the coaching surface, the rollup, the
command-line status report — calls it.

The failure this prevents is not hypothetical and it is not cosmetic. When two
derivations both claim to be the truth and one applies all three layers while the
other applies one, the product renders a green dot beside a red banner *for the same
step*, and a third surface picks a side. Nobody notices for weeks, because each
surface is individually self-consistent. Then someone ships against the green dot.

The corollary is stronger than "share a function": a consumer that re-derives a
verdict from raw produced data — even using the same checker — has forked the
authority. It sees no drain outcome and no judge verdict. It will diverge, silently,
in exactly the cases that matter (see `gate-check-dependency-map`).

## The order, and why an overlay may only move in one direction

The layers are ordered by **what they can observe**, cheapest first:

1. **The local checker** grades the produced data itself. It is pure, fast, and can
   run anywhere. For gates that need a live runtime or a rendered frame, it cannot
   decide at all — and it must say so with a distinct status meaning *deferred to
   something that can actually look*, never `pending` and never `pass`.
2. **The drain overlay** carries the outcome of the runtime and perceptual gates that
   actually ran, out of band.
3. **The judge** carries a craft verdict about the artifact's quality.

Each later layer is constrained in the direction it may move the verdict, and the
constraint is the interesting part of the design:

- **The drain may only decide what the checker declined to decide.** A concrete
  outcome supersedes `deferred`; against any status the checker was competent to
  produce, the drain does nothing. Otherwise an out-of-band runner silently overrides
  a checker that read the data in front of it — and the two authorities are back to
  disagreeing, just with one of them hidden.
- **The judge may condemn but not elevate.** A current, content-bound craft failure
  turns a structural pass into a failure. A craft *pass* never turns a structural
  failure into a pass, because passing the craft bar says nothing about whether the
  artifact is well-formed, wired, or within budget. This asymmetry is the same
  conservative instinct as
  [structural proof is never sufficient](./../_laws.md#structural-proof-is-never-sufficient),
  applied in reverse: evidence at one rung cannot discharge a different rung.

Both constraints have the same shape. **A later authority acts only where it knows
strictly more than the earlier one.** That sentence is the whole merge rule; the
order is just its enumeration. Write it down next to the code, because the day
someone "simplifies" the overlay into an unconditional assignment is the day the
spine stops being one.

## A verdict is a record, not a colour

The merged result is not a status. It is a small record that survives to the surface:

- **status** — the resolved outcome, from a vocabulary in which *not measured* is its
  own member.
- **tier** — the rung of evidence the outcome was proven at, so `pass` at a
  structural rung is not confused with `pass` at a perceptual one.
- **reason** — why, in the failing and deferred cases, always.
- **deciding authority** — which layer changed the verdict last.
- **judgment provenance** — attached even when the judgment was *not* applied,
  because a craft verdict about content the unit no longer holds is evidence about
  the past, and dropping it silently lets "unjudged since the last edit" read as
  "judged and passed" ([a verdict is bound to its
  content](./../_laws.md#a-verdict-is-bound-to-its-content)).

The deciding authority is the field teams forget, and it is the one that pays for
itself fastest. An operator looking at a red unit has three completely different jobs
depending on who condemned it: fix the data, re-run the drain, or re-judge. Without
the deciding layer on the record, all three look identical and the operator guesses.
`explain-why-this-verdict` turns that record into a reconstructable chain.

## A claim and a verification are different objects

Under automation this is the load-bearing distinction of the entire subject, and it
generalises far beyond content pipelines.

A producer — a generator, a build script, an unattended agent — reports what it did,
including whether it succeeded. That report is an **input** to a verdict, never the
verdict ([no gate self-certifies](./../_laws.md#no-gate-self-certifies)). The
defence is to re-grade every submitted claim on the receiving side with an
independent checker.

The hole in that defence is the part everyone misses: **re-grading only works where a
checker exists.** For every unit whose label no independent checker can resolve, the
re-grade quietly does nothing and the producer's own `pass` stands, indistinguishable
from a verified one. The receiving side then reports a number that is part
verification and part hearsay, with no way to tell which rows are which.

The fix is not to invent a verdict and not to discard the claim — there is nothing
truer to replace it with. The fix is that **the row says it was never verified**, in
a marked, greppable form that travels with the artifact wherever it is read. Then
the gap is a visible finding rather than a hidden lie, and it can be counted, closed
and regression-tested. `ungraded-marker-doctrine` is that discipline, and it is the
most transplantable technique here: any system that accepts self-reported success
needs it.

The same doctrine forces a second habit. An unattended process reports **two**
numbers — what it verified and what it merely asserted — and the one that appears in
a completion claim is the verified one.

## The terminal gate must be downstream of its evidence

Most pipelines end with a unit that means "is this shippable" — a test gate, a
release check, a definition-of-done row. It is the most dangerous unit in the system,
because it is the one people read, and it is structurally tempting to make it assert
its own success.

A terminal gate has no data of its own to grade. Its verdict is a **derivation** over
the resolved verdicts of the units it depends on, and that dependency has to be
written down: each named check maps to the upstream units it actually verifies
(`gate-check-dependency-map`). Three properties follow:

- The gate reads the *resolved* sibling verdict — checker, drain or judge, whichever
  decided — never the sibling's raw data, and never by re-running the sibling's own
  checker. Re-derivation is how the gate that gates everything becomes the one place
  the drain and the judge are invisible.
- The gate distinguishes *blocked by a failure* from *blocked by something nobody has
  run yet*. When every blocker is deferred, the gate's own verdict is unobservable,
  and reporting a failure would be as dishonest as reporting a pass.
- The gate names its blockers **with the layer that condemned each one**, because
  that is the operator's routing information.

The antipattern is worth naming as a species because it recurs under many disguises:
a literal constant success in the producing code, a gate with no inputs, a checklist
whose rows are authored rather than computed. `hardcoded-pass-antipattern` covers
detection and remediation. Its signature is a gate that has never once failed.

## Composed checks and the first non-pass

A unit's checker is often a composition: shape, then a content invariant, then a
budget. When several members are unsatisfied, the composition must report **the first
non-pass, named** — one member's specific status, tier and reason, plus the identity
of the member it came from.

Not a count ("3 of 5 failing" is not actionable). Not a concatenation (the reasons
belong to different rungs of evidence and reading them as one sentence invites
fixing the wrong thing). One reason, attributable, in a stable order that makes the
composition deterministic and lets the author sequence cheap checks before expensive
ones. Naming the member is not decoration: without it the tier and reason on screen
belong to something the reader cannot identify, which reliably sends people to fix
the base check when a budget invariant is what spoke.

## Failure modes to watch for

- **Green by default.** Any code path that maps "no verdict found" to `pass`. The
  absence of a measurement is a value in the vocabulary, not a gap to be filled.
- **The second truth.** A new surface that computes its own status "just for the
  badge". It will disagree, and the badge is the thing people trust.
- **Order by convenience.** Applying the judge before the drain because the judge
  data was already loaded. The order is semantic; it is not an optimisation surface.
- **The unconditional overlay.** Dropping the "only over deferred" guard during a
  refactor, because the guard looks like a special case rather than the rule.
- **Marker erosion.** An unverified-claim marker that gets stripped by a formatter, a
  truncation, or a well-meaning display cleanup on its way to the surface.
- **Verdicts that outlive their content.** A craft judgment retained across a
  re-produce, still rendering as current.

## Where this subject ends

The **ladder of evidence itself** — what the tiers mean, what each status is for, how
a unit earns a higher rung — is the adjacent concern of content acceptance tiering,
and this subject consumes its vocabulary rather than defining it. The **internals of
the judge layer** — binding a verdict to a content fingerprint, standing when the
content moves, the condemn-versus-elevate asymmetry as a rule about provenance — are
the concern of quality-verdict integrity; here the judge is one authority with one
directional constraint. **Declaring how an artifact is granted, activated and
verified** is the wiring-contract concern; the spine only reports the verdict that
concern's checks produce. And the operator-side practice of scoring live model
traffic in general is a different discipline entirely: what this subject cares about
is only how such a score enters a single, explainable, one-per-unit verdict.
