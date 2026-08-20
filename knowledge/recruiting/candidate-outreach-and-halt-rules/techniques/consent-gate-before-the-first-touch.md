---
layer: technique
type: technique
subject: candidate-outreach-and-halt-rules
technique: consent-gate-before-the-first-touch
status: forged
laws: [uncertainty-resolves-toward-the-candidate, every-decision-names-its-actor, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [wiring the checks that run before an outbound message, importing a sourced list, deciding what a consent withdrawal suppresses]
---

# Consent gate before the first touch

## The concern

Of all the reasons not to send a message, exactly one is irreversible. A halted
sequence can be resumed. A cadence limit can be raised. A message sent to a
person who withdrew consent, or who was never on a basis that permitted contact,
is in their inbox forever, and the record of the send is the evidence.

This technique places that check **first in the gate chain**, resolves it at the
**durable person identity**, and makes its refusals loud.

The lawful basis itself — which purposes were consented to, for how long, what
withdrawal and erasure mean for the record — belongs to the consent-and-retention
subject. This technique is the consumer: one call, at one place, before anything
else, and a hard stop on the answer.

## Procedure

1. **Establish a single pre-send chokepoint.** Every outbound path — sequence
   worker, recruiter's send button, bulk action, rediscovery campaign, a
   generated draft being dispatched — passes through one function that evaluates
   the gates. A second send path is a second policy, and it will be the one that
   is wrong.
2. **Order the gates by irreversibility.** Consent first. Then reply-halt. Then
   manual halt. Then cadence and volume limits. Cheap checks do not get to run
   early just because they are cheap: the first gate to refuse is the one the
   audit will name, and a reversible halt masking an unlawful send is a
   compliance report that lies in your favour.
3. **Resolve consent at the identity that survives records.** Not the current
   application, not the sourced profile that was just imported — the durable
   person. Where identity is uncertain, resolve conservatively: two records that
   might be the same human are treated as the same human for suppression
   purposes ([uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).
   Over-suppression costs a message; under-suppression costs a violation.
   **Fold the local record's own consent snapshot in rather than replacing it**:
   the durable lookup is the stronger check, but a record that carries no link to
   a durable identity must still keep exactly the guarantee it had before, or
   moving the check upward will have quietly weakened it for the population that
   cannot be resolved. Union the two answers; suppress if either says so.
4. **Return a reason, not a boolean.** The gate answers *why* — no basis
   recorded, consent withdrawn, purpose not covered, retention window expired,
   jurisdiction requires prior opt-in. The reason drives the audit record, the
   recruiter-facing explanation, and any later argument about intent.
5. **Separate the operational path.** Messages a candidate is owed because of a
   process they themselves started — acknowledgement, stage change, scheduling,
   an outcome — run on a different basis and must not be suppressed by a
   marketing or sourcing consent flag
   ([a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
   Classify every message type as *outreach* or *process* at definition time, not
   at send time, and make the classification a required field so a new template
   cannot arrive without one.
6. **Make the opt-out path write here.** The one-line way out in every cold
   message writes a durable withdrawal at the person identity, immediately, and
   without requiring a reply or a login. A suppression stored against a campaign
   is not an opt-out.
7. **Audit every refusal** with reason, actor and intended recipient
   ([every consequential decision names its actor](../../_laws.md#every-decision-names-its-actor)).

## Decision rules

- **When no basis is recorded at all, refuse.** Missing consent is not implied
  consent. A sourced list with no provenance is a list you may not write to until
  somebody records what permits it.
- **When the jurisdiction of the recipient is unknown and jurisdictions in your
  footprint differ on prior opt-in, apply the strictest.** Guessing location from
  a name, a language or a domain in order to unlock a send is the failure this
  rule exists to prevent.
- **When consent is scoped to a purpose, check the purpose.** Consent to be kept
  in a pool is not consent to be sequenced about an unrelated role, and it is
  never consent to be contacted on a channel the person did not give you.
- **When identity resolution is ambiguous, suppress.** See rule 3.
- **When a recruiter overrides the gate manually**, that is a decision by a named
  human with a recorded reason, it is available only where the law permits an
  override at all, and it never becomes an automated capability. An override that
  a job can invoke is not an override, it is a bypass.
- **When the gate's refusal rate moves sharply, treat it as an incident.** A
  spike means an import lost its basis field; a collapse to zero means the gate
  stopped being called.

## When not to use this

- **Do not use this gate to enforce operational quiet hours, volume caps or
  duplicate suppression.** They belong later in the chain and they are
  reversible. Mixing them in destroys the audit's ability to distinguish
  "we must not" from "we chose not to right now".
- **Do not re-implement the lawful-basis model here.** Retention windows, erasure
  cascades and purpose taxonomies belong to the consent-and-retention subject.
  This is a call site.
- **Do not apply it to messages the candidate's own action requires.** A person
  who opted out of sourcing outreach is still entitled to the outcome of the
  application they filed.
