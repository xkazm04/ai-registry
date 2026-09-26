---
layer: application
type: application
subject: role-intake-conversation
technique: expansion-reflection-over-confirmation
stack: react
status: forged
verified_on: 2026-09-26
verified_against: react@19
applied: simulation
ab_verdict: better
---

# The intake studio's call and its cards: the silence goes to a detector, the escape goes into the card set

The process applications of this subject cover the engine: a Python persona
prompt and a scripted keyless path. This one covers the client that carries
the conversation to the requestor — a React 19 studio in a Next.js app, with a
typed composer, decision cards, and a "talk instead" voice call. Three of this
technique's rules are decided here and nowhere else: whether a pause is left
to the requestor, whether a disposable contrast is actually disposable, and
whose words a picked option becomes. Read at one pinned commit of the
consumer on 2026-09-26.

## What the studio gets right: the disposal clause is structural

The technique permits a this-or-that contrast only after an open question has
stalled, and only framed as disposable. The engine can only *ask* the model to
say that the options may be refused. The studio makes the refusal part of the
widget, whatever the model wrote:

- the propose eyebrow reads "A few options (none of them is fine)"
  (`messages/en.json:5309`);
- the card set carries its own decline — "None of these. I'll say it in my
  own words" (`:5311`) — as a button on the set
  (`app/_components/studio/StudioChoiceCards.tsx:133`), which returns focus
  to typing. The rationale sits in the header (`:24-26`): "The escape is IN
  THE CARD SET, not only in the composer … A choice you cannot decline is a
  field";
- the contract clamps a set to two to four options, one set per turn, and
  forbids a set as "the FIRST thing said about a topic", a way "to skip the
  laddering", or the read-back (`app/_lib/intake-choices.ts:31-33`).

This is the strongest realization of the stall repair in the fleet: a
disposal clause the author cannot forget, because the author does not render
it.

## Deviation 1: the voice call hands the requestor's pause to a 500 ms detector

The call runs the provider in relay mode — it transcribes, the product's own
engine answers (`app/api/intake/[id]/voice-connect/route.ts:94`). Relay mode
configures end-of-turn detection as a bare silence detector:
`input.turn_detection = { type: "server_vad", create_response: false,
interrupt_response: true }` (`app/_lib/voice/openai.ts:212`), with no silence
window, so the provider default applies — 500 ms, which the provider's
reference says "may jump in on short pauses from the user". Every completed
segment then goes straight to the engine when the client is idle
(`voiceOrchestration.ts:47`, the idle path of `enqueueUtterance`); segments
are merged only while a turn is already in flight.

The same codebase has already learned this lesson on its other voice path.
On 2026-09-18 the candidate interview moved to semantic end-of-turn detection
at its least eager setting, with the reason in the source
(`openai.ts:149-152`): "An interview answer is long and full of thinking
pauses — the default ("auto" = medium) cut candidates off mid-thought — so
the house default is "low"". The same change pinned role intake to the old
behaviour — "relay mode (role intake) is byte-unchanged" — on the reasoning
that "relay never answers on its own" (`openai-session.test.ts:108-128`).
The provider does not answer; the client does, on every segment.

**Simulated with the tree's own engine.** The keyless voice turn is the
scripted slot engine itself, so the pinned `pipeline/jobfit` was exported to
a scratch folder and driven with three requestors from the project's own
persona bank whose answers carry a thinking pause, under two end-of-turn
policies: A, a silence cut at the pause (the shipped configuration), and B,
a finished-thought cut.

| Persona (the paused answer) | B: finished thought | A: silence cut at the pause |
| --- | --- | --- |
| vague requester — "Honestly not sure — we think we need someone for the data side, reporting keeps slipping" | title "Maybe a Data Analyst?"; outcome, musts and nices in their slots | the second half is filed as the **title**; the stated outcome becomes a **must-have**; the musts become nice-to-haves; the urgency lands in **budget** |
| can't articulate level — "good but not expensive-good... senior-ish? let's say medior" | seniority captured, no stray label | "good but not expensive-good" becomes the grade label; the rest is filed as the **languages** answer; every later slot shifts by one |
| contradicts self — "We want a junior we can shape, someone who owns our architecture from day one — maybe that's odd, not sure" | title "Backend Developer" | title "maybe that's odd, not sure"; outcome filed as a must-have; the rest shifted |
| control: power-unit backfill (no pause) | — | identical to B |

B was right in 3 of 3, and A misfiled the second half of the thought in 3 of
3, with no difference on the control. The first misfiling is the robust
result. The cascade after it is an upper bound, because the persona driver
does not adapt; a live requestor would re-answer, at the cost of a turn and
of a brief that now needs a correction. The model-led path was not simulated:
there the agent replies to half a thought rather than misfiling one, which is
the technique's failure in its original form. **Falsifier:** a requestor who
never pauses mid-answer for longer than the detector's window — the
power-unit control — sees no difference, so the verdict rests on hedging,
story-shaped requestors, the ones the long path exists for.

The typed composer's dictation mode gets the rule right: it has no silence
cutoff at all, and a press ends it.

## Deviation 2: a spoken correction after a one-utterance close is dropped

The voice fast path closes on the model's end token alone. Once the engine
has closed, the client drops everything spoken afterwards —
`if (!trimmed || state.ended) return { state, dispatch: null }`
(`voiceOrchestration.ts:47`), pinned by a test titled "after the engine
closes, further utterances are dropped and nothing dispatches"
(`voiceOrchestration.test.ts:48`) — and hangs up six seconds later
(`voicePhase.ts:24`), however long the spoken read-back took. A read-back
that ends in the same utterance as the close has invited a correction the
channel can no longer carry. The typed studio has a repair (re-open the
conversation); the call does not.

## Deviation 3: a picked card becomes the requestor's own words

The integration is described with care in `intake-choices.ts:42-45`:
"Picking SENDS A NORMAL MESSAGE. The selected labels become the requestor's
words in the transcript … and the value lands as `stated`, because they did
say it." They clicked it; the model wrote it. The card set stays on screen
as "the record of what was offered", but the stored transcript and the export
keep only the picked label, so a seniority or a dealbreaker chosen from an
offer reads, in the brief a screener inherits, exactly like one typed from
nothing. The technique's third constraint on the stall repair — record a
pick as chosen from an offer, with the offer beside it — is the fix; the
decline button above already proves the studio can make an honesty rule
structural.

## Beyond this technique

Two further gaps belong to neighbouring rules and are recorded here because
they live in the same screens. A stated 90-day outcome is rendered with no
provenance and no turn (`briefSections.ts:107`), while the facet copy that
carried "stated" and its source turn is dropped as a near-duplicate
(`jdsIntakeBriefModel.ts:155`) — the outcome every requirement should trace
to shows the "assumed" mark. And a skipped or never-reached slot is simply
not rendered, on screen or in the export, so "compensation skipped" and "no
constraint on compensation" look identical — the unreached-slot rule of
session-shape triage, lost at the last step.
