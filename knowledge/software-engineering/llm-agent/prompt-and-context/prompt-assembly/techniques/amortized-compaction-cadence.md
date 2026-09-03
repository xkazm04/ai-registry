---
layer: technique
type: technique
subject: prompt-assembly
technique: amortized-compaction-cadence
status: forged
laws: [count-carries-predicate, derivation-names-recomputation, failure-not-empty-success]
shared_with: []
use_when: [a long session stalls visibly when the transcript crosses its compaction threshold, deciding how often to rewrite history against a provider cache discount, a summarizer paraphrased a standing instruction the operator gave, judging whether continuous compaction is paying for itself]
---

# Amortized compaction cadence

[history-compaction](./history-compaction.md) settles *whether* and *when* a
transcript is spent down: cross a stated fraction of the advertised window, or
take the provider's refusal, then compact. It leaves one variable unstated, and
the default reading fills it in silently — **one large summarization at the
moment the threshold is crossed**. That is a schedule, not a law, and it is only
one of two. The other pays the same bill in instalments: after each completed
turn, fold the single oldest un-absorbed unit of history into one rolling
summary, so the threshold is never approached at all. The work is identical;
what changes is its distribution, and distribution is what the bill is made of.

## Two schedules, and what each one buys

The batch schedule keeps the cached prefix intact between compactions and never
absorbs material the conversation might have finished with before outgrowing.
Its costs mirror those virtues: the whole summarization arrives at one arbitrary
moment as a visible stall, and occupancy sawtooths to the threshold and back —
so the window is fullest precisely when the conversation is most developed and
least able to afford a bad cut. The amortized schedule bounds the per-turn
increment however long the conversation runs, and settles into an equilibrium
rather than a curve: occupancy climbs while the protected tail is still most of
the transcript, then stops when the tokens reclaimed per pass match the tokens
the conversation adds per turn. One measured three-and-a-half hour session
settled near a fifth of its threshold and held there, with the threshold path
never firing at all.

## The price is the prefix, and it is paid every turn

A pass rewrites history that has already been sent, which invalidates the
provider's cached prefix from the rewrite point onward — so the amortized
schedule breaks the cache *every turn* where the batch schedule breaks it once
per compaction. In [cache-breakpoint-allocation](./cache-breakpoint-allocation.md)'s
arithmetic — the cost of a layer is its position multiplied by its cadence —
this is a deliberate, large increase in the cadence term for the transcript
block and everything downstream of it. That technique treats cadence as a
property to be discovered and merged around; here it is a knob an operator turns
up on purpose, to buy something else.

The choice is therefore a trade between two costs, decided by the deployment
rather than by the design. **Batch wins** where the cache discount is deep, the
standing prefix is large, and sessions are long enough to amortize it — the
per-turn invalidation can plausibly cost more than the stall it removes.
**Amortized wins** where a mid-session stall is expensive because a human is
waiting, where the discount is shallow or unavailable, or where sessions run
long enough that the batch path would fire repeatedly. Record which one the
system bought, and why, beside the dial: a system that cannot say why it chose a
cadence has not chosen one.

## Two dials, and shipping only one is the common defect

There are exactly two ways to make the rewrites rarer and more episodic, and
they reach that end by opposite routes. A **frequency dial** runs a pass every
Nth completed turn: fewer breaks, proportionally less reclaim, because it
absorbs less. A **reclaim-size gate** commits a pass only when it would free
more than a stated number of tokens: fewer breaks at an undiminished reclaim
rate, because it waits for a bigger win.

Implementations ship the frequency dial first because it is trivial, and stop
there. That is the defect: **a frequency dial alone commits whatever the
absorbed unit happened to save, large or small.** A pass that reclaims sixty
tokens and invalidates the prefix is a pure loss, and the frequency dial cannot
see it — frequency is a property of the schedule, reclaim is a property of the
material, and only the second knows whether this particular rewrite earned its
break. Ship both: the gate makes each break pay for itself, the dial caps how
often the question is asked at all.

Two smaller rules the dial needs regardless: the cadence counter advances per
completed turn rather than per committed pass, so a turn with nothing to absorb
still moves it along and cannot wedge the schedule; and a configured value below
one is clamped rather than read as "off".

## The cursor never absorbs what the operator wrote

The absorbable unit is not a message and not a call/result group. It is the
**model's turn**: it begins at a model message, takes its tool results and any
follow-up model iterations, and ends at the next operator message. The cursor
walks straight past operator messages to find its start, which makes the
exemption structural — **what the operator typed is never summarized, for the
life of the session, however many passes fire.**

The asymmetry is an argument about what compresses. Model output is largely an
account of derived work — it read this, it ran that, it got back this — and
narration of that kind survives summarizing with very little loss, because "it
was done this way" is about as informative compressed as in full. The operator's
turns are a different object: they are the intent everything else was derived
*from*, and they cannot be reconstructed from the work that followed.
Paraphrasing a standing prohibition into a summary is exactly how an agent
confidently does the thing it was told not to, six turns later, with no artifact
showing where the instruction went.

State the cost rather than hiding it: operator turns accumulate and are never
absorbed, so they are a floor on how small the middle can get. In ordinary use
that floor is low — a prompt is a small fraction of what one tool result costs —
but a workflow that pastes very large prompts keeps that weight in the window by
design. Taking the unit all the way to the next operator message also earns
protocol validity for free: the summary marker is a model-role message, and a
unit bounded by operator messages on both sides leaves role alternation intact
after the splice, where a single model-plus-tools group does not.

This rule sits next to, not inside, history-compaction's protection of
load-bearing material. That rule says move what the conversation cannot lose
*out* of the transcript, into layers compaction never touches. This one says a
class of material *inside* the transcript is structurally un-absorbable, because
the operator cannot be asked to relocate their own intent before typing it.

## One rolling summary, recoverable from the transcript

Each absorbed unit merges into a single running summary rather than accumulating
a pile of per-unit ones, and only the newest marker stays in the transcript —
superseded markers are strictly redundant, and leaving them stacks near-duplicate
text with its own scaffolding until the transcript grows on every pass instead
of shrinking. The summary needs a re-summarization threshold of its own or it
goes baggy; crossing it re-compacts the summary in place, touching no messages
and moving no cursor, so the operator-turn guarantee holds through it.

The cursor is a stored derived value and per
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
it names its recomputation: when the in-memory value is missing or out of range
— a fresh process, a resumed session — recover it by scanning for the last
summary marker and resuming just after it. The transcript is the source of
truth, which makes a resume cheap and stops it re-absorbing work already done.

One hazard the marker carries: it is a model-role message occupying the most
recent instruction-shaped position in the window, and a model that reads it as
the live task will resume work already finished. The marker states its own
status inside itself — background reference, respond only to the operator
message that appears after it, and this handoff must never become the turn.

## Judge it on occupancy, not on tokens saved

The marker's scaffolding is a fixed cost paid once, and on the first pass it is
paid against a single absorbed unit — so **the first pass legitimately shows a
positive token delta and is not a malfunction.** From the second pass the marker
is replaced rather than added, and break-even normally arrives on the second or
third. Reclamation also only ramps once the transcript exceeds the protected
tail; below that budget nearly everything is untouchable and early sessions
correctly show no passes at all.

Both facts make a per-turn token delta the wrong instrument, and
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) names
the fix: the number that governs is **occupancy** — how full the window is held
as a share of the compaction threshold — read across a session's trajectory,
together with **how many threshold compactions actually fired**, ideally none. A
session that saves nothing on paper can be a clear win on both. The population
matters as much here as for a cache hit rate: a mean over passes excludes every
session that ended before the scaffolding paid for itself. And the measurement
must never block a turn — where the occupancy figure needs a window size the
system has not resolved, it reports absent rather than resolving it inline,
because resolving it can mean a synchronous provider call on the critical path.

## Failure is best-effort, and its outcomes are spelled apart

A pass is wrapped so any exception leaves the conversation unchanged and the
turn completes normally: a compaction schedule may degrade, it may not break a
session. Per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success), the
three outcomes a pass can have stay distinguishable in what it emits — absorbed,
nothing available to absorb, and the summarizer call failed. Collapsing the last
two produces a system that looks healthy while summarizing nothing.

Repeated failure at one cursor position needs a terminal state: after a small
number of consecutive failures on the same unit, advance the cursor past it, or
one unsummarizable unit is retried every turn for the rest of the session. The
skipped messages stay in the transcript and fall to the threshold path — which
is the second reason the two schedules coexist. Amortized compaction **defers**
the threshold path, it does not replace it. Keep both, with markers in one
format so a transcript compacted by either is readable by the other; a burst can
still outrun the cadence and fill the window.

## Decision rules

- Choose the cadence deliberately and record the trade beside the dial: flat
  occupancy and no stall, bought with one broken cache prefix per turn.
- Ship a reclaim-size gate alongside any frequency dial. Frequency bounds how
  often you ask; only reclaim size answers whether this break was worth it.
- Define the absorbable unit as model-turn-to-next-operator-message, and let the
  cursor walk past operator messages. Never summarize what the operator wrote.
- Keep exactly one rolling summary and one marker; drop superseded markers, and
  re-summarize the summary on a threshold of its own.
- Recover the cursor from the transcript, not from process memory.
- Judge on occupancy across the session and on threshold compactions avoided;
  expect the first pass to cost tokens.
- Distinguish absorbed, nothing-to-absorb and failed; bound consecutive failures
  at one position and advance past the stuck unit.
- Where the durable record lives outside the message list and the prompt is
  rebuilt from it per call, none of this applies: nothing is spent down, cadence
  becomes a per-call rendering choice, and
  [tiered-history-projection](./tiered-history-projection.md) governs.

The cadence question also does not travel to a browsable corpus: summaries
compiled over a stored tree belong to
[context-hierarchy](../../context-hierarchy/context-hierarchy.md), where the
material is at rest and recompilation is triggered by accumulated input. Here
the material is the live conversation window, the trigger is the turn boundary,
and what is traded is a cache prefix that exists only because the window is sent
again on every call.
