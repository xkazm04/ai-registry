---
layer: technique
type: technique
subject: narrative-engine-selection
technique: adjudication-honesty-tells
status: forged
laws: [unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
use_when: [rendering a verdict-shaped script, auditing a contested-question video, designing fields that store candidate weighing]
---

# Adjudication honesty tells

The adjudication engine — question, enumerate the candidate explanations,
weigh each on evidence, verdict — is the easiest engine in the catalogue to
fake, because the *appearance* of weighing alternatives persuades whether or
not any weighing occurred. A rigged adjudication is not merely a worse video;
it is the costume of rigor worn by polemic, and it leaves the viewer feeling
rigorously informed precisely where they were walked past the load-bearing
claim. Three structural tells separate honest from rigged, and all three are
checkable without knowing anything about the subject.

## Tell 1 — is the premise itself in the candidate set?

An honest adjudication admits the possibility that the thing being explained
is not real, or is mismeasured, or is an artifact of how the question was
framed. If every candidate theory presupposes the premise, the video
adjudicates only *causes* and never *whether* — the most contestable claim in
the script is the one claim never put on trial. Check: does the candidate
list contain at least one entry of the form "the phenomenon is not what the
question assumes"? If the premise was tested and survived, that test belongs
on screen; if it was never offered as a candidate, the adjudication starts
one step too late.

## Tell 2 — can any candidate beat the author's prior?

If the candidate theories are three framings of one conclusion, the weighing
is decorative. The structural check: was the verdict written *before* the
candidates were weighed? A verdict fixed in advance — for instance by a
workflow that demands the one-sentence answer during research, before
scripting, so the script can deliver it early — **is** the author's prior,
and every subsequent "weighing" is choreography around a settled outcome.
This is a genuine workflow tension, because answer-early is good delivery
craft: the resolution is that the verdict must be *revisable* and recorded
together with the candidate that produced it, so that weighing can overturn
it and the record shows whether it ever did. A pipeline whose schema fixes
the verdict upstream of the candidates has made the rigged path the default
path — reached by following the rules correctly.

## Tell 3 — is counter-evidence admitted or pre-excluded?

A challenge phrased as "name an X — but you may not cite [the most common X]"
is unfalsifiable by construction: the strongest counter-case has been removed
before the contest. Honest adjudication states the strongest opposing case in
its own strongest form — the steel-man — and this is the single most reliable
honesty signal the engine has. Check the script for exclusion clauses
attached to its challenges, and check whether the opposing case, as its best
advocate would state it, appears anywhere on screen.

## Making the tells enforceable

Stated only in prose, the tells are satisfied by whoever writes the first
script and shed silently by the second render. They become enforceable only
when the weighing is *stored*: a candidates structure on the research asset —
each candidate with its supporting and defeating evidence, its own outcome,
and the premise permitted to be one of them — plus a revisable verdict linked
to the winning candidate. Until those fields exist, treat every adjudication
render as unaudited by default:
[unmeasured-is-not-pass](../../_laws.md#unmeasured-is-not-pass) applies
directly — a pipeline that never checks the tells may not report the engine's
honesty as pass, and "the skeleton looks like an adjudication" is an
impression, not a measurement.

Two supporting checks:

- **Verdicts about people need external evidence.** When the question is
  "whose fault," the verdict beat is a finding of culpability, and under
  [output-never-outruns-evidence](../../_laws.md#output-never-outruns-evidence)
  it must rest on a filed action or a published admission — the weighing is
  an argument; the verdict is an assertion about people, and the in-video
  weighing is not evidence of the grade that assertion requires.
- **Causal-connector density corroborates.** A script that adjudicates should
  derive densely — but/so/because/therefore. Measured across a ten-video
  corpus, the one adjudication witness ran the *lowest* connector density of
  all ten sources; on this engine, a low score signals theories being
  announced rather than weighed. It is a corroborating measurement, not a
  tell — a rigged script can be connective-dense.

## When not to use

These tells audit the adjudication engine specifically; applied to a briefing
or a correction chain they produce false alarms (a briefing legitimately has
no candidate set). The steel-man check alone generalizes — any engine that
argues owes the opposing case its strongest form. And do not let a flawed
exemplar's clean skeleton launder its execution: file the structure, take the
honesty standard from sources that argue contested subjects while sourcing
their numbers and steel-manning their opponents.
