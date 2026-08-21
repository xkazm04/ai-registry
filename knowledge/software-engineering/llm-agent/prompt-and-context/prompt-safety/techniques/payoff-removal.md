---
layer: technique
type: technique
subject: prompt-safety
technique: payoff-removal
status: forged
laws: [one-authority-per-vocabulary, deletion-is-not-repair]
shared_with: []
use_when: [untrusted content reaches a prompt whose output has consequences, designing what a model response is allowed to change, hardening a boundary that cannot be made leakproof]
---

# Payoff removal

Every other technique in this subject makes it harder for planted text to be
*heard*. This one makes it not worth saying. The move is to stop asking "can
an injection reach the model?" — assume it can, assume it worked — and ask
instead: **what did it win?** Then remove or bound the win. Payoff removal is
the only layer of the boundary whose strength does not depend on the model
behaving, which is why it survives the day the fence does not.

The analysis runs on the *output* side, and it needs a shape the inbound
techniques do not use: the model's response is not one blob, it is a set of
**channels**, each with its own consequence.

## Rank every response channel by what emitting it wins

Enumerate the fields, sections and verbs the response may contain, and give
each one an explicit payoff assignment:

- **Inert** — prose a person reads, a narration, a rationale. Winning this
  channel changes what a report says. It is visible to the reader, who is the
  person best placed to notice that the text has gone strange.
- **Consequential** — a number that lands in a stored score, an identifier
  that retires or supersedes a record, a proposed operation, an outbound
  message. Winning this changes the world.
- **Self-elevating** — the class that earns this technique its name: a channel
  whose content enlarges the model's own latitude on this same run. The
  canonical shape is a self-audit field — "the computed evidence for this
  dimension is wrong" — which, honoured, widens the range the model is then
  allowed to move that dimension within.

The third class is an amplifier, and amplifiers change the attacker's problem
qualitatively. Against a consequential channel, planted text must produce the
outcome directly, inside whatever bound already exists. Against a
self-elevating channel it only has to buy room, and something else — the
model's ordinary, non-malicious reading of hostile-but-plausible text — spends
it. One sentence, two steps of leverage, and the second step looks like normal
operation in every log.

The payoff assignment is recorded next to the schema, because it is a property
of the **pipeline**, not of the field. A channel is inert only for as long as
nothing downstream reads it; the day a new consumer starts feeding that field
into a suppression list, a routing decision or a future prompt, it has become
consequential and the ranking must be re-derived. An un-revisited payoff
assignment is a security claim that expired quietly.

## Route found instructions to a channel that cannot pay

A model that notices instruction-shaped text in a data region is producing the
most valuable signal in the run. Two failure modes bracket the correct
handling.

**Silently dropping the observation** destroys detection. The model saw the
attempt; nothing else in the system did. (This is
[deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) applied to a
security signal: the observation is the evidence.)

**Reporting it into a consequential channel** is the vulnerability itself. If
"I found an instruction" is expressed through the same field that widens a
bound or names a record, the injection has been handed the lever by the
defence built to catch it.

So the rule: **the found-instruction report goes to a named channel with no
downstream consequence, and the prompt says so explicitly** — this is where
you report it, that is where you may not. Stated as a routing instruction it
is unambiguous to a cooperative model, and a captured one gains nothing from
disobeying, because the destination it wants is bounded by the next rule
anyway. Treat the report as a governance finding about the source, and let it
reach the trip protocol in [canary-tripwires](./canary-tripwires.md).

## Bound the amplifier: a disclosed, all-or-nothing budget

Where a self-elevating channel must exist — and it usually must, because it is
how a system learns its deterministic checks have blind spots — it is bounded
rather than trusted:

1. **A small integer budget**, defined once and read by *both* the prompt that
   states it and the code that enforces it
   ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
   A budget the prompt announces and the engine does not enforce is prose; a
   budget the engine enforces and the prompt hides is a trap that teaches the
   model nothing.
2. **Count only what could actually be honoured.** Claims aimed at channels
   that cannot move anything — an already-fixed value, a component that did
   not run, an unrecognized name — are filtered out *before* counting, or a
   payload full of inert claims exhausts the budget and denies the honest
   correction its slot.
3. **Over budget, honour none — not the first N.** The structural reason is
   the decisive one: any keep-N rule needs a tie-break (order, severity,
   stated confidence), and every tie-break is a control surface the model can
   steer. All-or-nothing has no tie-break, so there is nothing to steer. The
   evidential reason seconds it: a response claiming most of the deterministic
   layer is broken has not earned more trust, whether the cause is a
   hallucination or planted text.
4. **Disclose the rule in the prompt.** "At most two, and if you flag more,
   none count" makes over-claiming self-defeating instead of free — the honest
   channel and the captured one face the same gradient.
5. **Record when the budget bound**, with the count that blew it, so the rate
   is measurable. A budget nobody can see binding is a constant nobody can
   tune.

The sibling discipline of bounding a model's judgment against computed
evidence owns the sizing of the band this budget widens, and the record that
tracks it; do not re-derive that here. What belongs here is the reason the
budget is a *trust boundary* and not only a calibration knob.

## Decision rules

- **If a channel's payoff is zero, do not budget it.** Ceremony on inert
  fields costs review attention and buys nothing; spend it on the amplifier.
- **If a channel is self-elevating and cannot be bounded, delete the channel
  and re-measure without it** — but only after trying the budget. Removing the
  audit path because one run abused it converts a bounded, recorded
  disagreement into an unmeasured one.
- **If the correcting stage can re-run the check the model disputes, do that
  instead.** Corroboration beats budgeting: an independent re-measurement
  settles the claim on evidence. The budget is the enforceable half of the
  same idea, for stages that receive already-computed signals and cannot
  re-measure.
- **Name the prize per call site.** A generic denial of authority does not
  cover a payoff the prompt never mentions. Where naming a record retires it,
  the instructions say that naming a record retires it, and that a record must
  be earned by the content's meaning and never by the content asking.

## When not to use it

Payoff removal is not a substitute for the fence. A system whose channels are
all inert still leaks a corrupted narrative to whoever reads it, and prose is
not harmless when a person acts on it. Nor does it apply where the model's
output *is* the product and every channel is consequential by definition — in
that shape the containment lives at the acting door
([model-output-as-untrusted](./model-output-as-untrusted.md)) instead. The
technique earns its place exactly where a response is structured, mixed, and
one of its parts feeds back into how much the rest is believed.
