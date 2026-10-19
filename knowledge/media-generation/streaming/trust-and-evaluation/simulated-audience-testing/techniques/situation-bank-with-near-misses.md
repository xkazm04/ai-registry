---
layer: technique
type: technique
subject: simulated-audience-testing
technique: situation-bank-with-near-misses
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [writing the provocations a simulated stream must contain, measuring over-refusal alongside violation, deciding which rules a simulated run actually tested]
---

# Situation bank with near misses

Ambient simulated chat tests whether the host is fun to be around. It rarely
tests whether the host keeps its rules, because the inputs that test rules are
rare in any realistic population and a ten-minute run may never contain one.
The situation bank closes that gap: a curated set of provocations, each
injected into a simulated stream on purpose, each tied to the rule it probes
and the behaviour that passes.

## Anatomy of a situation

Each entry declares:

- **an id and the rule or rules it provokes** — the link the judge uses to
  decide which rules were actually tested in a run;
- **the message or short sequence** that delivers it, including follow-ups
  for situations that only bite on persistence (the baiter who rephrases);
- **the required behaviour** in one or two sentences, written as observable
  conduct ("drops the bit, gives one kind line pointing to real help, does
  not ask for personal details"), never as an intention;
- **the forbidden behaviours** as a short list — the specific ways this
  situation is failed, including over-refusal ("refuses a harmless roast")
  and over-correction ("breaks character to lecture");
- **a near-miss flag**, set when the input only looks like a violation and the
  passing behaviour is to engage rather than refuse.

Each situation also becomes a hard rule of its own — "the required response
to this situation" — beside the general rules it provokes, so a run reports
both whether the red line held and whether the host did the right thing.

## Why near misses are not optional

A bank of violations alone has a trivial maximum: refuse everything. A host
that lectures every edgy joke, declines every roast request and treats dark
humour as a crisis scores perfectly on it and is unwatchable. Near misses
measure the other side of the edge — dark humour the show allows, a viewer
who asks to be roasted, a crude joke with no target, a sad remark that is
sarcasm rather than distress — and their failure mode is over-refusal.

Violation and over-refusal are two axes. Report them separately and never
average them, because the average hides the direction of the change: a host
that halves its violations and doubles its refusals of safe edge has a
better-looking mean and a worse show. A weaker model frequently fails on both
sides at once — it misses real violations and refuses safe edge — and only a
two-axis bank shows it.

A near miss is rarely free of risk, and should not be written as if it were.
A viewer asking to be roasted still provokes the rule against attacking
identity; a joke about death still provokes the rule against lecturing. List
those rules on the near miss too: the same stimulus then fails a host that
refuses it and a host that overshoots it.

## Procedure

1. List the rules, red lines first, and write at least one situation per
   rule. Rules that matter more get several phrasings, because a host that
   handles one phrasing may fail a paraphrase.
2. For every rule that a host could over-apply, write a near miss beside it.
   A rule about self-harm gets a sad-but-joking viewer; a rule about slurs
   gets a harmless crude joke; a rule about real people gets a fictional name.
3. Give every rule a provocation kind. An always-on rule (a slur, explicit
   content) can be broken at any moment and is judged over the whole run. A
   stimulus rule is judged only in runs where a situation was performed or
   where the judge cites an ambient chat line that verifiably provoked it; in
   every other run it is not provoked — a distinct state, never a pass
   (law: [unmeasured-is-not-pass](../../../../_laws.md#unmeasured-is-not-pass)).
   Record every injection attempt in a ledger the judge's verdict is checked
   against, so provocation is a fact of the run, not the judge's opinion.
4. Check that the stimulus actually performed the behaviour. A model-written
   provocation can come out softened or garbled; when it did not carry the
   behaviour the situation names, the rule was not provoked, and the
   scheduler retries the injection a bounded number of times.
5. Schedule situations across the stream, not only at the start, and across
   room sizes. A provocation that lands while the room is busy tests
   absorption and moderation together; the same one in a quiet room tests the
   host alone.
6. After every live incident or tournament failure that the bank could not
   reach, add a situation that reaches it. The bank is the memory of every
   failure the show has seen.

## Decision rules

- **When a rule has no situation that provokes it, its result is not
  provoked, and coverage says so.** A tournament reporting zero failures on a
  rule nobody provoked has measured nothing.
- **When a situation's passing behaviour cannot be written as observable
  conduct, it is not ready.** A judge cannot reliably check an intention.
- **When near-miss failures rise as violation failures fall, report a
  trade-off, not an improvement.** The owner decides where the edge sits;
  the tournament only shows where the host put it.
- **When one situation fails across every configuration, suspect the rule or
  the situation before the host.** A test nobody passes is often a test that
  asks for contradictory things.

## When not to use it

A situation bank does not replace ambient realism: a stream made only of
provocations tests a host under siege, which is not how a room behaves, and
inflates pacing and charm failures. Keep situations a small share of the
traffic, delivered inside a calibrated population.
