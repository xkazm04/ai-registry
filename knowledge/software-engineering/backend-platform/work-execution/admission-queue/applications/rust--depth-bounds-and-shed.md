---
layer: application
type: application
subject: admission-queue
technique: depth-bounds-and-shed
stack: rust
verified_on: 2026-08-31
verified_against: rust@1.85
applied: code
ab_verdict: better
proof: ab-paired
---

# Rust — three priority levels, a bound of ten, and a shed policy nobody chose

How a Rust desktop execution engine stands against
[depth-bounds-and-shed](../techniques/depth-bounds-and-shed.md), and
specifically against its rule that reject-by-class is foreclosed by the order
of the two checks. The tree carries the exact configuration the rule warns
about, and the paired arms below are what produced that section.

## The seam

A per-persona admission gate with a closed three-way verdict — run now, queue
at a position, refuse for depth — sitting in front of a bounded waiting line.
It is well built: the verdict vocabulary is a Rust enum rather than a boolean,
the depth bound is a named constant with a setter, quota cooldown and host
resource pressure compose into the same verdict, and refusals are counted.

It also declares **three priority levels**, and the middle one's own doc
comment names the top level's membership: healing retries, chain triggers,
manual re-runs. That is the urgent class, and it is the class that appears
precisely when the system is already in trouble.

The registry's evidence overlay for this subject recorded the arrangement as
"priority levels; bounded depth with **refuse-newest** shed" — filed as though
refuse-newest were the policy someone selected from the three this technique
offers. It is not. It is the policy that falls out of the check order.

## What the two arms were

The gate's depth test is a length comparison against the bound; it returns the
refusal. The class is derived afterwards, from the arrival, and reaches only
the insertion search that decides *where in the line* the entry sits. So the
gate that refuses has never seen a priority in its life
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The case that separates the two arms is the one neither existing test suite
contained. The depth test filled the queue with a single uniform level; the
priority tests mixed levels but never approached the bound. Nothing constructed
a queue that was bounded *and* prioritized — the intersection where the policy
actually lives.

- **A — the seam as it stands.** A queue held at its bound by low-priority bulk
  work; an urgent arrival. The engine's own test binary: **33 passed, 1
  failed.** The urgent execution is refused with the depth verdict while every
  bulk entry keeps its position. The bound holds and the levels are decorative,
  in the one condition that motivated declaring them.
- **B — the class evaluated before the depth verdict.** At the bound, the
  weakest resident is compared against the arrival; a strict comparison
  displaces it only when the arrival genuinely outranks it, so an equal-ranked
  arrival is still refused exactly as before. The line is held in descending
  priority with arrival order preserved inside a level, which makes its tail
  the lowest-ranked entry *and* the newest among its equals — the right victim
  on both counts, and the reason no separate scan is needed. **34 passed, 0
  failed**, including a second new case asserting that displacement is not a
  bypass.

Same instrument, same inputs, both arms present: the technique's rule is
`better` here, and the measurement is the reason.

## The half that is not the comparison

The displaced entry is a promise already made, so the arm that ships also has
to revoke it out loud
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The queue's verdict now carries the identity of whatever it evicted, and the
caller drops that entry's pending context and writes it the same terminal
record a cancel-while-queued produces, with a reason naming the execution that
displaced it. Reusing the existing cancellation path rather than inventing a
displacement state is what kept the change small.

That half is the one worth noticing: the comparison was four lines, and telling
the evicted party was the rest of the change. It is the concrete instance of
the technique's claim that a design which only sorts has no displacement rule,
because sorting makes the easy half look like the whole job.

## What this realization cannot do

Two limits a reader copying this should know.

**The fairness axis is untouched.** The bound is per-origin here, so
displacement arbitrates one origin's own line and never lets a busy origin take
another's capacity. A design with one shared bound across origins gets a
different question — displacing across origins is a fairness decision, not a
priority one, and this arm does not answer it.

**Only one of the two crates could be built.** The engine is a standalone
library crate and its gate ran both arms. The caller half lives in the desktop
crate, whose build script fails on this checkout for an unrelated missing
plugin permission — a pre-existing failure, reproduced with this change stashed.
So the measured claim covers the admission decision, and the revocation half is
reviewed rather than compiled. The application is written at the confidence that
supports: the verdict is `better` on the arm that ran, and the shipping of it
waits on an environment fix that is not this change's to make.
