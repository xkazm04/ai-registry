---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: substituted-result-attribution
status: forged
laws: [unknown-is-not-a-value, record-precedes-effect, gate-sees-target]
shared_with: []
use_when: [a wrapping frame returns a cached result instead of running the tool, an extension answers a built-in tool's call from a different provider, deciding what the transcript should say about a call that did not execute, a policy gate approved a destination the call never reached, an agent reasons about freshness from the fact that it just called a tool]
---

# Substituted result attribution

A wrapping frame has a third power beside rewriting arguments and running the
call beneath it: it can **return without entering the continuation** — answering
in the tool's place. [rewrite-before-the-gate](./rewrite-before-the-gate.md)
names this and stops there, correctly, because its subject is the arity contract:
what it has to settle is that a frame which *returns* is doing something
legitimate and a frame which *raises* is not. That leaves the interesting half
unowned. Something was returned, and the model will read it as the tool's output.

The asymmetry is worth stating plainly, because it is the shape of the defect.
That technique makes every downstream decision see the effective **arguments**,
and pairs the power with a provenance rule: carry the original beside the
effective value, trace the frame that changed it. Nothing does the same work on
the way back. The result arrives with no producer attached, and the two channels
that need to know — the record and the model — are told a call happened.

## Two shapes, and they fail differently

- **Replay.** The frame returns a value some earlier real call produced: a memo
  on a fetch, a cached lookup, a recorded fixture. The value was true once. What
  the frame cannot supply is the property the model will assume it has — that it
  describes the world *now*.
- **Substitution.** The frame answers from a different producer than the one the
  call named: a preferred search backend under the built-in search tool, a proxy
  under the built-in fetch, a local index under a remote query. The value may be
  perfectly current and still carry none of the named producer's properties.

Both are legitimate and both are useful; the point is that they are not the same
hazard, and a runtime that models only "the frame short-circuited" cannot tell
its operator which one happened.

## What an unmarked substituted result asserts falsely

Three claims ride along with a tool result, none of them written down, all of
them relied on.

**That the tool ran.** The transcript shows a call and a result; the record is
the artifact an operator, an audit and a later session all reconstruct the run
from. A call that did not execute, recorded as one that did, is
[record-precedes-effect](../../../../_laws.md#record-precedes-effect) inverted —
not a missing record for a real effect, but a record for an effect that never
happened, which is the same accounting hole read from the other side.

**That the result is current.** The model's freshness reasoning is positional:
it called the tool, so the answer is from now. Under replay that inference is
silently wrong, and it is wrong in the direction that matters — the agent
proceeds *more* confidently than the evidence supports. "We do not know how old
this is" rendered as an ordinary result is
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) at the
tool boundary.

**That the named producer produced it.** This is the one that reaches past
correctness into policy. A tool's identity is what every upstream decision was
made against: the egress rule that permitted the destination, the trust class
the result is handled in, the credential that was scoped to it, the cost meter
it was charged to. Substitute the producer and each of those decisions was
computed over a call that never happened —
[gate-sees-target](../../../../_laws.md#gate-sees-target) on the return path.
The mirror is exact and worth carrying as the summary of this technique:
*rewriting makes the gate judge a value the model did not write; substituting
makes the gate judge a producer that did not answer.*

## Mark it at the boundary, in three channels

The result a short-circuiting frame returns carries, beside its payload:

- **the frame that produced it**, by the same source-and-reason trace the
  rewriting path already emits — so one mechanism explains both directions;
- **the producer's identity**, when it differs from the tool's;
- **the freshness**, as the time the value was actually obtained, never as the
  time it was served.

Those three go to three different readers, and dropping any one of them is a
distinct failure:

- **The record** shows a call that did not execute, spelled differently from one
  that did. An audit that cannot separate them cannot answer the only question
  it will be asked after an incident — did we call that endpoint?
- **The operator surface** says which frame is answering. A substitution that
  works is invisible; a substitution that quietly degrades — a stale memo, a
  fallback backend with worse recall — is invisible in exactly the same way, and
  the first symptom is the agent reasoning badly for reasons nothing on screen
  explains.
- **The model** is told, in the result, that the value was not obtained now or
  not obtained from the named producer. This is the channel most runtimes skip,
  on the theory that provenance is an operator concern. It is not: the model is
  the component making the freshness inference, and it is cheap to correct in
  the one place it is made.

## The substitution that is worth making anyway

The motivating case is real and this technique is not an argument against it.
An agent that reliably reaches for a built-in tool will keep reaching for it
however firmly the instruction file prefers the alternative — that is a steering
problem, and steering is the weak instrument. Replacing the *implementation*
behind the tool the model already chooses is the strong move: it changes
behaviour by construction instead of by persuasion, and it needs no compliance.
The cost of the strong move is precisely the attribution above. Take the power,
pay the marking, and keep the fallback honest — a substitution that silently
falls back to the original producer on error has two producers and must say
which one answered, or it has re-created the ambiguity it was built to remove.

## Decision rules

- Treat a frame that returns without entering the continuation as a producer,
  not as a skipped step, and require it to identify itself. The cheapest
  enforcement is by construction: make the *wrapped* result type obtainable
  only from the continuation, so a frame can return a refusal or a marked
  substitution without entering but cannot return a wrapped-shaped value it
  never obtained — the dispatcher checks whether the continuation was
  entered and treats an unentered wrapped return as a fabricated verdict,
  not as a substitution.
- Distinguish replay from substitution in the record; they have different
  remedies and only one of them is fixed by re-running the call.
- Stamp freshness with the time the value was obtained, never the time it was
  served.
- Where the substituted producer differs from the named tool, re-evaluate the
  decisions that were made against the tool's identity — egress, trust class,
  credential scope, cost attribution — or state in the contract that they do
  not transfer.
- Say in the result, not only in the log, that the value was replayed or
  substituted; the model makes the freshness inference and is the cheapest
  place to correct it.
- Make a fallback name the producer that actually answered.

## When not to use it

A runtime whose extension surface cannot short-circuit — every frame must call
the continuation — has no substituted results and needs none of this. It arrives
with the first cache, the first proxy and the first tool override, which in
practice arrive together, because they are one power discovered three times.
