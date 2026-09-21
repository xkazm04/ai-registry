---
layer: application
type: application
subject: prompt-assembly
technique: response-reservation-sizing
stack: rust
status: forged
verified_on: 2026-09-21
verified_against: rust@1.96.1
applied: task
ab_verdict: not-better
proof: structural-only
---

# Two output ceilings, two crates, one wire: the derived number never arrives (Rust)

The technique says a response reservation is charged on every call, should be
derived from the observed response-length distribution, and that the common
failure is a derivation that is *written* rather than *computed*. This tree
refutes the first half of that framing and supplies a sharper version of the
second, which is why the seam was worth opening: it was chosen because it could
show the technique was unnecessary here, and it showed something else instead.

`verified_against` names the toolchain the repo root pins for its blocking
gates, which is what this tree witnesses about its own version rather than
whatever a runner happened to install; the crates were read at `07fa255c`.

## Where the technique does not apply here

The tree already does what the technique's headline advises. The wire ceiling
on the bare-API path is a deliberate 4,096 with the reasoning written beside it
— a verdict is a small object, so the ceiling is headroom rather than a target
— and the escalation to 64,000 for the top two effort levels carries its own
justification: at those levels the model's intermediate reasoning is billed
against the same cap, so a low ceiling reports the model as truncated when
nothing was wrong with it.

And the technique's precondition fails. Batch input is bounded at ~50k tokens
against a window many times that, so the reserved room never competes with the
input side. **The recurring cost this technique exists to recover is zero in
this tree**, which is the "when not to use it" clause arriving as a measured
result rather than as a hedge.

So on its own terms: `not-better`. The arm could not move the number the
technique names, because the number was already where the technique wanted it.

## What the seam showed instead: enforcement against the wrong ceiling

Two crates size the same response, and neither reads the other.

- The **packer** derives a per-dimension output cost from a measured failure —
  not a guess, per its own comment — and uses it to decide how many cases may
  share one call, under a default response budget of **16,000** tokens. Its
  comment is explicit that overrunning the response is the one failure that
  costs every case in the batch at once, and that the ceiling is therefore
  *enforced* there rather than left as advice.
- The **engine** sets the actual wire ceiling from a constant keyed on effort:
  **4,096** below the top two levels.

The enforcement is real. The number it enforces is not the number the wire will
impose. At default effort on the bare-API path the packer is protecting a
budget 3.91× larger than the ceiling the request will carry:

| LLM dimensions in rubric | packer packs | wire ceiling fits | over-packed by |
| --- | --- | --- | --- |
| 1 | 72 cases | 18 | 54 |
| 2 | 36 | 9 | 27 |
| 3 | 24 | 6 | 18 |
| 6 | 12 | 3 | 9 |

Arithmetic over two constants in the tree (16,000 and 4,096, at 220 tokens per
dimension per case), not a model call. The failure it produces is precisely the
one the packer's comment names: the input fits, the response does not, the JSON
truncates mid-object, and the call is unparseable — every case in it lost at
once. The engine reads the stop condition before interpreting the payload and
raises a truncation error rather than salvaging a fragment, so the loss is
loud; it is still the whole batch.

**Scope, stated so the finding is not larger than its evidence.** This binds
only where all three hold: the bare-API provider path (a key in the
environment, rather than one of the CLI transports, each of which carries its
own ceiling semantics), an effort level below the top two, and a batch wide
enough to cross the per-dimension line. At the top two effort levels the wire
ceiling is 64,000 and the packer's 16,000 sits safely under it — the escalation
that exists for a different reason happens to close this hole, which is why it
has stayed open.

## The structural fact: the request type has no slot for the derived number

Nobody designed this and it is the strongest evidence here. The request type
carries a system prompt, turns, a schema, tools and a tool choice. **It has no
output-ceiling field at all.** The packer computes a response budget; there is
no channel through which that number could reach the request even if a caller
wanted to send it. The derivation and the wire are not merely uncoordinated —
they are unconnectable without a type change.

That is the technique's "one function away" claim failing in the stricter
direction. The measurement is not sitting unread one function away; the
plumbing to carry it was never built, so the constant in the engine is not a
lazy default but the only thing the type system permits. A reviewer looking at
either crate alone sees a careful, well-commented, correctly derived number.

It also sharpens what [limits-are-derived](../../../../_laws.md#limits-are-derived)
warns about. Its stated failure is a formula in a comment that no longer tracks
its input. This is a formula that is genuinely computed, tracks its input
faithfully, and is derived from the wrong input — a budget the system chose for
itself instead of the ceiling the transport will apply. A derivation can be
live, correct and irrelevant at the same time.

## What the realization cannot do

The engine records response length on every successful call and reads it again
on the truncated ones, so the distribution this technique asks for is being
collected. Nothing aggregates it: there is no place where the observed spread
of verdict lengths is compared to either ceiling, so neither 4,096 nor 16,000
can currently be shown to be right or wrong by this tree's own data. Both
numbers rest on argument, and the argument is good — but the technique's
percentile step is unreachable here until something reads the collected
figures back.

The remedy is a work item rather than an edit, and it is filed as one: the
projection has to become a field on the request, threaded to each provider path
whose ceiling semantics differ, or the packer has to clamp its budget to the
ceiling the selected path will actually send. Both are larger than a diff a
reviewer reads in one sitting, which is why nothing was changed in the tree for
this row.
