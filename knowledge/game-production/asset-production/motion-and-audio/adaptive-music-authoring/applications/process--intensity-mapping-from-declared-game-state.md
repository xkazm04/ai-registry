---
layer: application
type: application
subject: adaptive-music-authoring
technique: intensity-mapping-from-declared-game-state
stack: process
status: forged
verified_on: 2026-09-02
---

# Running the intensity mapping as a reviewable artifact

This is the methodology realization: how a team turns "the music gets more intense in
fights" into a document a composer, a designer and a gate can each act on, and how it is
reviewed before anyone renders audio. It assumes no particular engine or middleware, and it
assumes the mapping is authored *before* the score, because the mapping is what the score is
composed against.

## The document

One file per musical context — a zone, an act, a boss. It carries five sections and nothing
else.

**1. Signals.** Each input on one line: name, source system, unit, valid range, update rate.

```
enemiesEngaged    encounter system   count      0..12    on spawn/death
healthFraction    player stats       fraction   0..1     per frame
elitePresent      encounter system   boolean    —        on spawn/death
encounterActive   encounter system   boolean    —        on start/clear
```

The review question for this section is not "are these the right signals" but **"can each
of these be read outside gameplay code?"** A signal that only exists inside a combat actor's
tick cannot be replayed, and a mapping built on it cannot be tested. Push the signal into a
readable state object first, or drop it.

**2. Tiers.** Three to five, named for what the player is doing, not for how loud the music
is. `ambient` · `engaged` · `pressed` · `climax`. Each names the layer subset it plays. Each
carries a one-line editorial intent — *"pressed: the fight has turned, the player is
reacting rather than choosing"* — which is what the composer actually writes to.

**3. Thresholds.** Rise and fall, per tier, as a table. The reviewer checks three things and
nothing else:

- Is the fall threshold below the rise threshold by at least 15% of the signal's range?
- Is there a dwell floor of at least one musical phrase on every tier?
- Is there a dwell **ceiling** on the top tier, with a stated recovery before re-entry?

The third is the one that is always missing on a first draft. Without it a long fight sits
at climax indefinitely, and the player stops hearing the most expensive material in the
score as intensity.

**4. Overrides.** The places where the mapping is deliberately not a readout of the state:
hold the tier for the whole encounter and release on the clear event; suppress all
transitions during a scripted sequence; force `ambient` on death. Each override is one line
with its reason, because to anyone reading a log an override looks exactly like a bug.

**5. Reversal rule.** What happens when the state changes during a transition. One
sentence, and it is nearly always the same sentence: *resume the interrupted tier in
progress, never restart it.*

## The trace test, which needs no audio

The mapping is accepted against recorded state traces, before a note is written.

1. **Capture traces.** Record the declared signals at their update rate through real play.
   Three traces at minimum: a short skirmish, a long fight the player nearly loses, and a
   traversal with no combat. The third one matters — it is how you find a mapping that
   promotes on a signal that idles high.
2. **Replay each trace through the mapping** as a pure function, producing a tier over time.
3. **Read four numbers off the result.** Tier changes per minute, against a target of at most
   one per eight bars. The shortest dwell, against the declared floor. The longest dwell at
   the top tier, against the declared ceiling. And the set of tiers the trace entered.
4. **Report the fourth beside the other three, always.** A trace that entered two of four
   tiers has said nothing about the other two, and it returns exactly the same clean result
   as a trace that exercised everything. A tier no trace reached is *not measured* — it is
   listed as such, and it is a work item, not a pass.
5. **Iterate on thresholds only.** If the plot is wrong, the fix is a number in section 3.
   If the fix requires a new signal, section 1 changes and every trace is re-captured,
   because a trace that predates a signal cannot exercise it.

## Review roles, and the one rule that makes the review work

The composer reviews sections 2 and 4 — the tiers' editorial intent and the deliberate
divergences. The designer reviews sections 1 and 3 — whether the signals mean what the
mapping thinks and whether the thresholds match how encounters are actually built. Nobody
reviews the implementation, because the implementation is a pure function of the document
and is generated from it or trivially checked against it.

The rule that makes this hold: **the thresholds live in one place and the runtime reads
them from there.** A mapping document that is transcribed into gameplay code by hand has
two sources for every number, and the day one of them is tuned in a hotfix, the document
becomes a description of a system that no longer exists — and the trace test, which reads
the document, starts certifying the wrong thing while continuing to pass.

## What this process does not do

It does not tell you whether the music is good. It tells you whether the *shape* of its
response is defensible: that the score does not thrash, does not fatigue, does not sit at a
tier no encounter reaches, and does not lurch when a fight refuses to end. Every one of those
is a defect a listener will attribute to the composition and none of them is fixable by
composing.
