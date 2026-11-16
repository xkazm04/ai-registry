---
layer: technique
type: technique
subject: model-routing
technique: cache-continuity
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [deciding whether a continuing conversation may change tier mid-stream, a cheaper tier turned out to cost more, justifying a sticky-session rule, a speed or effort toggle flipped mid-conversation and spend jumped, choosing between routing per call and routing per conversation]
---

# Cache continuity

The class→tier table in this subject prices a call as if it arrived alone.
Most calls do not. They arrive as the next turn of a conversation whose
standing prefix — tools, system layers, the accumulated history — is
already sitting in the provider's prompt cache, keyed to the exact prefix
bytes **and to the model that wrote them**. That cache is an asset with a
price, and a routing decision that ignores it can make the cheaper tier the
more expensive call.

## The arithmetic, with the vendors' published ratios

Providers price cached prefixes in three multiples of a model's base input
rate: a cache **write** at roughly 1.25× (more for a long-lived entry), a
cache **read** at a small fraction, and uncached input at 1×. The read
fraction is **a per-model fact, not a vendor constant**: two vendors' pages
read 2026-11-16 print 0.1× for most models and 0.05× or 0.025× for their
newest ones, and one of them charges no write premium at all on its earlier
models. Two facts follow that intuition gets wrong:

- **Staying costs the read fraction on the incumbent** — a tenth of its base
  rate or less for the whole prefix.
- **Switching costs a full write on the newcomer.** The new model has no
  entry for this prefix; the first call writes it in full, at 1× or 1.25×.
  The way back is charged again only if the incumbent's entry lapsed during
  the detour. A switch is not an eviction: the incumbent's entry ages from
  its last use, so a one-turn dip that returns inside the cache lifetime
  finds it warm.

So for a conversation carrying *C* cached tokens, the prefix term alone says
switch only when **w·p₂ < r·p₁**, with *r* the incumbent's read fraction
and *w* the newcomer's write multiple — the newcomer's base price must be under
*r/w* of the incumbent's (an eighth at 0.1× and 1.25×, a twenty-fifth at
0.05×, a fiftieth at 0.025×). That is the term that makes a mid-conversation
downgrade usually the expensive option wearing a cheap label.

**It is not the whole turn.** The turn also sends new input and produces
output and reasoning tokens, all priced at the serving model's own rates,
and a switch saves on every one of them. The full comparison is

    C·(w·p₂ − r·p₁)  <  N·(p₁ − p₂) + O·(o₁ − o₂)

with *N* new input tokens and *O* output plus reasoning tokens at output
prices *o₁*, *o₂*. Where output and reasoning dominate the turn — and in
this subject they usually do (see effort-calibration) — or where the small
tier on offer is priced below *r/w* of the incumbent, the switch can be the
cheaper turn. Price ladders are wider than the three- to five-fold gap
between neighbouring tiers: one vendor's sheet read 2026-11-16 puts its
small tier at a twentieth of its mid tier for short prompts, which is
already near that model's *r/w*. Compute the inequality per pair from the
current sheet; do not carry a "never" from an older one.

The same write applies to anything else in the cache key. A speed
tier toggled mid-conversation, a tool roster that changed, an effort
setting that alters the system layer — each invalidates the prefix from
that level down, and the next call writes it. "Cheaper" or "faster" per
token says nothing about the bill for the turn that flips it
([count-carries-predicate](../../../../_laws.md#count-carries-predicate):
a price is not a price without the cache state it assumes).

## Decision rules

- **Route by class where the class has its own prompt family; do not swap
  the model under a shared context without pricing the swap.** A background
  aside or a headless micro-call that runs with its *own* small prompt has
  nothing cached to forfeit and should take the cheap tier freely. The same
  call issued *inside* the main conversation's context is a different call,
  and the incumbent is usually the cheap answer — unless the full inequality
  above says otherwise for this pair and this turn's expected output.
- **Stickiness is a cost rule where the arithmetic says so, and a quality
  rule where it does not.** Pinning a conversation to one model is often
  defended with an unmeasured claim about quality loss on switching. Where
  the price gap is under *r/w* and turns are short, the defence that
  survives review is the arithmetic above: within the cache lifetime the
  incumbent is the cheapest model for the next turn. Record it as that; a
  cost rule can be re-measured when prices move. Where the cheap tier sits
  below *r/w*, or output dominates the turn, the arithmetic favours the
  switch, and a pin then needs a measured quality reason — the cost
  argument is no longer available to borrow.
- **Continuity has a horizon: the cache lifetime.** Past it the prefix is
  cold on every model, the incumbent's advantage is gone, and the class
  table applies again without penalty. A conversation resumed after a
  long idle is a first turn for pricing purposes. A router that knows the
  time since the last turn can apply this exactly; one that does not
  should assume warm, because the cost of a wrong "cold" is the 1.25×
  write and the cost of a wrong "warm" is nothing.
- **Treat any mid-conversation change to the cache key as a routing
  event, and price it.** Speed, effort, tools, model: the decision record
  should carry that the prefix was invalidated and why, so a spend
  spike traces to the toggle that caused it rather than to the model.
- **Prefer a small prompt family over a small model.** When a cheap
  answer is wanted mid-conversation, the cheaper move is usually a
  separate one-shot call with a purpose-built prompt of a few hundred
  tokens on the small tier — not the small tier reading the whole
  history. The saving is in what is *sent*, not in who reads it.

## Where the provider keys the effort decides what the flip costs

The rules above treat effort as one more component of the cache key, and
the arithmetic holds exactly where that is true — but *where* a provider
encodes the setting is a provider fact, not a property of effort, and it
has been observed in three shapes:

- **In the prefix.** The effort setting is rendered into the system layer,
  so a flip invalidates from that layer down and leaves everything above
  it — the tool roster, the earlier layers — cached. Measured on one hosted
  agent harness (2026-09-08, paired, one session per arm): a two-turn
  session resumed at the *same* effort re-read 33,353 tokens and wrote 59;
  the same session resumed with the effort raised one step re-read 23,997
  and wrote 9,415 — the system-layer segment, to within the noise of the
  first turn's own write — and the turn cost 6.1× as much. "Price the
  toggle" applies in full.
- **In the request, below the prefix.** Some providers carry effort as a
  per-request parameter that keys only the message segment; the tool and
  system layers stay warm. Smaller than the first shape, never free.
- **As an in-band item appended to the conversation.** One provider's
  2026-09 API exposes effort as a configuration item placed *after* the
  cached prefix, so a flip preserves the prefix by design and costs nothing
  at the cache. It is paid for elsewhere: the same API rejects two adjacent
  configuration items and refuses to compact a history that contains one,
  so the conversation that flips effort freely is the conversation that
  must compact by hand, and re-declare its effort after every compaction.

The routing decision therefore carries one more fact per provider: which
shape effort takes. A router that prices every flip as a full-prefix
rewrite is right for the first shape and overcharges the third; one that
treats effort as free because a vendor document said "preserves the cache"
has imported the third shape's rule into a provider that runs the first.
One vendor's page (read 2026-11-16) adds a further fact a router can use:
setting the effort to the model's default is equivalent to omitting it
and invalidates nothing, so spelling out the default where it was unset
(or dropping it) is not a flip, and only a change of value is priced.

Record the shape beside the price ratios, and re-measure it when the
provider's API changes — for one provider it moved inside a single release.

The re-measurement is worth running whenever the claim arrives second-hand.
On 2026-09-24 two practitioner reports relayed that a vendor's newest models
"update effort mid-conversation without breaking the cache". The same
harness, re-measured on its two newest model families with the flip arm run
*first* on a forked resume (so no sibling arm could have warmed it), showed
the first shape unchanged: the flip read only the tool layer (17-19k tokens)
and rewrote everything below it, while the same-effort arm read the whole
prefix and wrote 38 tokens. The flip turn cost 1.7-1.9x at a near-empty
conversation, and since the cache is a prefix, in a long conversation "below
the tool layer" is the entire history. Clean in both repeats on one family
and in four of five forks on the other; the fifth read everything, and one
unexplained read is recorded, not averaged away. The relayed rule was the
third shape's rule imported into a provider that runs the first, which is
the error the paragraph above predicts.

## The cached prefix is also a latency asset

Everything above prices the prefix in money. For an interactive class the
same prefix is also time to first token, and a switch made *for speed* can
forfeit it. The engine that is faster per token on a trivial prompt may not
cache across process spawns at all. On the real prompt it then pays the full
prefill on every turn and arrives later than the incumbent it was meant to
beat.

Measured on one interactive tier (2026-09-17). On the production prompt
(three scenarios, two reps each), an engine that won the trivial cold-spawn
race by about two seconds reached first text 3.4 times later at the median
than the incumbent. It kept no cache across spawns. On the incumbent, one
process kept warm per conversation took turn two to first text in 2.2 s
against 4.4 s for a cold spawn. That required moving the per-turn context out
of the system layer and into the user message, so that the cached prefix stays
byte-identical between turns. Shrinking the prompt helped too, but not
uniformly. Moving from the full prompt to a small fixture saved 2.1 s on one
model and 0.4 s on another whose long prefix was already served from cache.

So for a slow interactive class the order of levers is: keep the prefix
byte-stable and the process warm, then shrink the prompt family, and only then
change the model or the engine. Measure every candidate on the real prompt, in
its real cache state, with first-token time recorded per turn. A trivial-prompt
benchmark measures spawn cost and says nothing about prefill.

## The observed fraction is an input, and it is easy to get wrong

Every comparison above takes *C*, the tokens actually served from the cache, as a
given. When a router estimates *C* from the last response's usage block, the
denominator of that fraction is the whole prompt, and several providers report their
input field as only the uncached remainder. Dividing by the remainder pushes the
fraction past one at a true half and a clamp hides it, which biases every decision
toward staying. The fix is a convention, not a tuning knob:
[whole-prompt-denominator](../../../evaluation-and-cost/cost-metering/techniques/whole-prompt-denominator.md).

## What this does not say

Nothing here argues against routing by class — that stance stands. It
adds one term to the decision: the incumbent's cached prefix, which is
worth 0.9× to 0.975× of its base price on every warm turn, depending
on the model's read fraction, and is forfeited in full by any change to
the key. It is one term, weighed against what the turn will send and
produce. Whether a switch also costs *quality* remains unmeasured in this
corpus; where the arithmetic favours the switch, that is the measurement
a pin is waiting on.
