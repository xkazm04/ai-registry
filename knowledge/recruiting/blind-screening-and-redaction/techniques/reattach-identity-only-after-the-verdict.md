---
layer: technique
type: technique
subject: blind-screening-and-redaction
technique: reattach-identity-only-after-the-verdict
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, every-decision-names-its-actor, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [ordering a blind assessment pipeline, deciding when a name returns to a decision, preventing an unblinded re-run]
---

# Reattach identity only after the verdict

Blind screening is an ordering property before it is anything else. Redaction
runs before the assessment; identity returns only once the verdict is sealed;
and the return is an *attachment*, never a reopening. Get the ordering wrong and
every other technique in this subject becomes decorative, because a mask applied
after a reading has masked nothing.

## The sealed boundary

The verdict is sealed at the moment the assessment is written down — its score,
its findings, its wording, and its manifest, fixed together. Re-attachment then
binds that sealed object to a candidate record so a recruiter can act on it. What
re-attachment must not do is give anyone a second bite:

- **No unblinded re-run whose result may replace the blind one.** This is the
  poisonous pattern: run blind, dislike the answer, run again with the name in
  view, keep the preferred result. That is *worse* than never masking, because
  the choice between the two answers is now made knowing both, and the blind
  label survives on an artifact that no longer describes what happened.
- **No silent revision.** If a verdict genuinely must change after identity
  returns — new information, a correction, a human disagreeing — the change is a
  **new decision** with its own author, its own timestamp, and its own reason,
  recorded alongside the original rather than overwriting it.
- **No inheritance.** A revised verdict does not inherit the blind claim. Only
  the original assessment was blind.

[A verdict is bound to what it
judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged) is the governing
law: the blind verdict judged a masked document under a stated policy, and it
means nothing about the unmasked one. Where the masking policy itself changes,
prior blind verdicts are marked as produced under a superseded policy rather
than silently re-read as though they were current.

## The identity you re-attach is the one you held, not the one you got back

Re-attachment restores the identity the **redactor deterministically detected and
set aside** before the assessment ran. It never restores an identity the
assessor produced, and it never accepts one it inferred. This closes the loop
opened by the blind-mode instruction: the assessor is told to return an empty
identity field, and the pipeline is built so that field is never a source —
which is what makes the instruction enforceable rather than merely polite. It
also means the recruiter-visible name comes from a deterministic, reproducible
step, so two runs of the same document name the same person even when the
assessment differs.

## Identity is not the same thing as a decision

Re-attachment is a step in a decision, not the decision. Two laws constrain what
follows:

[Every consequential decision names its
actor](../../_laws.md#every-decision-names-its-actor) — the re-attachment and
any subsequent revision each record who or what performed them. A blind
assessment whose provenance is a chain of anonymous steps cannot be defended
later, and "who unblinded this, and when" is the exact question an audit asks.

[No adverse outcome is solely
automated](../../_laws.md#no-adverse-outcome-is-solely-automated) — a blind
assessment is a *recommendation*, and it becomes no more actionable for having
been produced blind. The temptation is real and specific: teams reason that
because the machine could not see who the candidate was, its rejection is safe
to automate. It is not. Blindness constrains one input; it says nothing about
whether the rubric, the requirements, or the scoring were sound. Reject stays a
human act.

## The identity of the result itself

A point that looks like plumbing and is a fairness fact: **a blind assessment and
an unblinded assessment of the same document are different assessments and must
never share a result identity.** Anything that decides whether a stored result
may be reused — a cache key, a deduplication rule, an idempotency token — must
include the blind mode, and the masking policy version with it.

Omit it and the failures are severe and quiet in both directions: a candidate
receives a verdict produced with their name in view, stamped and audited as
blind; or a blind verdict is served where an unblinded, richer assessment was
expected and its silences are read as findings. Either way the procedural claim
— the only claim this practice reliably supports — is attached to the wrong
artifact, and no downstream inspection can tell.

## Decision rules

- **When a recruiter wants the unmasked document, give it to them *after* the
  verdict is visible and sealed, and log the unmasking.** Access is legitimate;
  what is not legitimate is access that precedes or silently replaces the blind
  reading.
- **When the same document is re-assessed under a changed masking policy, treat
  it as a new assessment with a new identity.** Policy version is part of what
  the verdict judged.
- **When a downstream stage needs the candidate's name to schedule, notify, or
  correspond, that stage is outside the blind boundary by design.** Blind covers
  the assessment hop. Say so plainly rather than pretending the whole process is
  blind — the first conversation unblinds everything anyway.
- **When an automated route would act on a blind verdict, allow only the
  non-adverse directions.** Advance and hold may route; reject parks at a human
  gate regardless of how the assessment was produced.

## When not to use this

The ordering discipline is unnecessary where the assessment never had access to
identity in the first place — a structured intake where identity fields are held
in a separate store the assessor cannot reach needs no re-attachment ceremony,
only an access boundary. And do not stretch re-attachment into a general
record-linkage problem: this technique governs one join, at one moment, under
one rule.
