---
layer: technique
type: technique
subject: prompt-assembly
technique: context-budgeting
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [setting floors and elastic lines before assembly, each section fits its cap but the total still overflows, deciding whether heavy material rides every call, deciding whether shrinking a standing layer repays the authoring cost]
---

# Context budgeting

The window is the scarcest resource the system spends, and it is spent on
every call. This technique makes the spend deliberate: a global budget
derived from real limits, allocated per layer, defended by degradation
ladders, and honest about what pressure removed. The alternative is not
"no policy" — it is the provider's tail truncation, a policy that discards
whatever happens to be last, chosen by nobody, announced to no one.

## Derive the budget, then allocate it

The global budget is arithmetic, not folklore: the model's window, minus
the room reserved for the response (an answer squeezed to nothing is a
budget failure at the far end), minus safety margin for counting error.
Allocation then splits it across layers by kind:

- **Floors** for the layers that must never degrade — identity, policy,
  and the task itself. If the floors alone do not fit, the call is
  malformed and should fail loudly rather than ship a prompt with the
  rules shaved off.
- **Elastic allowances** for the layers that can degrade — context,
  examples, capability detail. Each elastic section gets its own
  allocation; a single shared pool means whoever renders first spends it,
  and the flooding failure (context drowning task) is exactly that pool
  race.
- **A line item per feeder.** Pipelines that inject material — memory
  recall, retrieval, state digests — each spend a named sub-budget. Recall
  in particular arrives pre-ranked to fit its line (the recall stage of
  [agent-memory](../../agent-memory/agent-memory.md) treats this number as
  its own scarcest resource); the assembler's job is to hold the line, not
  re-rank.

**And the total needs an owner.** Per-section caps do not compose into a
prompt budget: every section can individually honor its cap while the sum
grows without bound, because nothing owns the sum. The global budget is
enforced where the whole artifact is visible — the assembler — as its own
check, not as the hoped-for consequence of section discipline. A prompt
that leaves through any path the assembler cannot see (a post-assembly
append, a second concatenation site) is a prompt whose total nobody is
enforcing, whatever the sections say.

Budgets are measured in the unit the limit is enforced in — tokens, by an
honest counter or a stated estimator with known error, never "characters
divided by a hopeful constant." Per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate), a
budget number carries how it was measured; an allocation audited in one
unit and enforced in another is two numbers wearing one name.

## Every elastic section declares a degradation ladder

Pressure must have somewhere defined to go. Each elastic section states its
ladder at design time — typically: **full → summarized → headline →
omitted with notice** — and the assembler walks sections down their
ladders by declared priority until the prompt fits. Two rules keep the
ladder honest:

- **Summarize by threshold, not by reflex.** Below the threshold, source
  material rides verbatim (a summary of what already fit is pure loss —
  paid in fidelity, refunded in nothing). Above it, the summary replaces
  the material *and says that it is a summary of N items/spans*, so the
  model reads it at the right strength.
- **The bottom rung is a notice, not silence.** An omitted section leaves
  one line naming what was dropped and how much — "twelve older reports
  omitted" — because a model shown a partial view that presents as
  complete will reason confidently over the absence. The notice converts
  a lie into a stated limitation, at the cost of a dozen tokens. And the
  notice belongs *in the prompt*: when a cap fires, the party that needs
  to know is the model, which is about to reason over the truncated
  corpus — a log line informs only the operator, who is not the one
  reasoning.

Truncation *within* a rung obeys the same discipline: cut at semantic
boundaries (whole items, whole spans — never mid-sentence, which reads as
corruption), keep by value rather than by position where value is known,
and name the remainder.

## Move heavy material out of line

The strongest budget move is not compressing a section but removing its
standing cost. Material that is large, rarely needed, and retrievable on
demand belongs behind a **pointer**: a short inline index ("these
capabilities/documents exist; fetch one by name") plus an operation the
model can invoke to pull the full text into the conversation when a task
actually needs it. This converts a per-call tax into a per-use cost, and it
scales where inlining cannot — the index grows by a line per item while
the material behind it grows without bound.

The candidates are recognizable: reference documentation, extended
capability detail, long exemplars, historical context. The counter-signal
is material the model needs on *most* calls — pointer-chasing that fires
every time is the inline cost plus a round trip.

## The ceiling is one constraint; the recurring bill is the other

Everything above is a fitting problem, and fitting problems stop being
interesting the moment there is room. That is the trap. A section comfortably
inside its allowance is still billed **on every call**, so the window has two
independent constraints and only one of them ever trips a ladder: the ceiling
fires visibly and rarely, the recurring bill accrues silently and always. A
standing layer at half its allowance has no fitting problem and may still be
the most expensive line in the system.

Which makes shrinking a standing layer an *investment* rather than hygiene,
and investments are authorized by arithmetic. The work of rewriting a layer
smaller — whoever or whatever does it — is a one-time cost repaying a
per-inclusion saving, so the decision number is a **break-even in
inclusions**, not a token count:

> one-time authoring cost ÷ saving per inclusion = the number of future calls
> after which the shrink has paid for itself.

Compute it before commissioning the work. Material included a handful of
times a week will not repay a serious rewrite inside its own useful life;
material on the standing path of every call repays almost anything. A
published measurement of this loop is worth carrying as a scale anchor: an
automated pass that halved a reference document repaid its own cost only
after roughly two thousand uncached inclusions.

**And the denominator moves with cache state**, which inverts the intuition
in one important case. A prefix sitting in a provider's cache re-reads at
roughly a tenth of base rate, so the same shrink saves about an order of
magnitude less per call while it stays cached — pushing the break-even out by
the same factor. Worse, the edit itself invalidates the entry and the next
call rewrites it at above base rate (the multipliers and their derivation live
with the routing subject's cache-continuity technique). **A large, stable,
cached standing layer can therefore cost more to compress than to keep.** The
material that actually repays compression is material that is large *and*
re-billed at full rate: layers volatile enough to keep invalidating the
prefix, and calls that carry no shared prefix at all — one-shot and
fan-out work, where nothing is cached by construction and every token is paid
new. As with any other price in this system, a saving is not a saving without
the cache state it assumes
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Measure the spend, or the allocation is fiction

An allocation nobody audits drifts exactly like an unowned vocabulary:
sections grow past their lines one reasonable addition at a time. The
assembler is the one place the whole spend is visible, so it is the place
that records it — per-section token counts on each assembly, surfaced in
logs or traces. That record is what turns "the prompt got slow and dumb"
into "the context layer doubled in March," and it is the evidence base for
every future reallocation argument.
