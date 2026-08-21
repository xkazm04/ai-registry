---
layer: technique
type: technique
subject: hypothesis-not-verdict-soft-signals
technique: a-confirmation-probe-per-signal
status: forged
laws: [inference-must-look-like-inference, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [emitting a behavioural signal from a career document, wiring a screening flag to an interview or work sample, deciding whether a signal is worth surfacing at all]
---

# A confirmation probe per signal

The probe is not an accessory to the signal. It is the signal's reason to exist.
A reading of a career document is only useful because it can be *resolved*, and it
is only safe because the resolution is a conversation rather than a decision. So
the rule is absolute and it is also a deletion rule: **a signal that cannot state
the question that would settle it does not ship.**

This is what converts the hypothesis grammar from a labelling exercise into a
mechanism. A flag with a confidence and a needs-confirmation field but no probe
still leaves the reader holding an unfalsifiable worry — and a reader holding an
unfalsifiable worry about a candidate rejects them quietly. Attaching the question
closes the loop
([inference-must-look-like-inference](../../_laws.md#inference-must-look-like-inference)):
the guess names its own test.

## What makes a probe a probe

- **It is askable verbatim.** "Walk me through your last three moves and what
  drove each transition" is a probe. "Assess flight risk" is a task assigned to an
  interviewer, which they will discharge by forming an impression.
- **It is answerable well in more than one way.** If only one answer clears it,
  it is a verdict with a question mark. The test: name two good answers before
  shipping the probe. If you cannot, the signal was a conclusion.
- **It asks about the record, not the person.** "What did you own on that
  project?" not "are you a finisher?".
- **It is bounded.** One question, resolvable in two or three minutes of an
  interview that has a budget. A probe that requires its own round will not be
  asked.
- **It names its resolution.** What answer would close the signal, what answer
  would keep it open. Without this the probe gets asked and the flag never clears.

## Routing: not every probe belongs in an interview

The strongest response to a hypothesis is a **targeted demonstration**, because it
skips the argument about the document entirely. Map each signal, where one fits,
to a kind of work sample rather than to a conversational question:

- an overclaim on a specific capability → a small exercise in that capability;
- outcomes stated without any quantity or scope → an exercise whose output is
  inherently measurable;
- concreteness of delivery in doubt → a task with a definition of done.

Where no work-sample kind fits, the probe stays conversational. Where the signal
concerns the *reasons* behind a career shape, it must stay conversational — no
exercise can answer why someone moved, and only they can.

The routing rule that makes this mechanical: **a signal becomes a work-sample
brief only if it still needs confirmation *and* carries a probe kind; everything
else is interview-only.** Two conditions, checked in that order, with no third
path — which means an already-confirmed signal cannot silently re-enter the
assessment as an exercise, and a signal with no mapped kind cannot be improvised
into one by whoever builds the sample.

## Procedure

1. **Author the probe with the detector, in the same change.** A detector merged
   without its question is a flag generator, and it will be used as one.
2. **Store the probe as a field on the signal**, not as a rendering rule elsewhere.
   The producer that made the claim owns the question that settles it; a probe
   composed downstream drifts away from the detector that justified it.
3. **Attach a probe kind where a demonstration fits**, so the loop from hypothesis
   to targeted test is machine-followable and a work-sample chooser can consume it
   without re-deriving the reasoning.
4. **Deduplicate probes before the panel sees them.** Three signals that resolve
   to the same question are one question. The panel's budget is the scarce
   resource, not the flag list.
5. **Prioritise by decision impact.** Ask first the probe whose two possible
   answers change what happens next; a probe whose answers change nothing is a
   curiosity and should be dropped rather than asked.
6. **Carry the answer back.** After the round, the signal is confirmed, refuted or
   still open, and it leaves the open list in the first two cases. A checklist that
   only grows is a dossier accumulating.

## Decision rules

- **When no honest probe exists, delete the signal.** This removes more proposed
  detectors than any other rule in the subject, and that is the point.
- **When the probe would require the candidate to disclose a protected
  characteristic or a private circumstance to answer well, delete the signal** —
  not the probe. "Why the two-year gap?" fails this test regardless of phrasing.
- **When a signal's confidence is high enough that the probe feels rhetorical,
  suspect the detector, not the candidate.** A document-derived reading that leaves
  nothing to ask has stopped being a reading of a document.
- **When the probe is asked and answered, the answer outranks the signal
  permanently** — a conversation sits above a document on the evidence ladder, and
  a refuted hypothesis must not be re-emitted by the next re-parse of the same
  document.
- **When a probe goes unasked, the signal stays open and unresolved — it never
  ages into a conclusion.** An unanswered question is not a bad answer, and it
  cannot drive an adverse outcome
  ([no-adverse-outcome-is-solely-automated](../../_laws.md#no-adverse-outcome-is-solely-automated)).

## When not to use it

- **For signals that are already measurements.** A verified credential does not
  need a probe; it needs a check. Probes belong to inferences.
- **For behavioural observations inside your own process.** If someone withdrew,
  the fact is the fact; the follow-up is a courtesy, not a confirmation.
- **Where the interview format cannot carry it.** A short, tightly scripted
  screening call has room for one or two probes. Emitting nine and expecting them
  to be asked produces a panel that ignores the surface entirely, which is worse
  than a surface with three.
