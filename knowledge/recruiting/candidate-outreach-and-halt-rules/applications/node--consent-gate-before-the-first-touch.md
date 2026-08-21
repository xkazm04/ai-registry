---
layer: application
type: application
subject: candidate-outreach-and-halt-rules
technique: consent-gate-before-the-first-touch
stack: node
status: forged
---

# The gate chain in the outreach dispatcher

`app/_lib/comms-dispatch.ts:219` — `dispatchOutreach` is the single chokepoint
every outbound outreach message passes through, and the whole of this subject's
gate ordering is visible in twenty lines of it.

## Consent first, because it is the irreversible one

```ts
const suppress = candidateOutreachSuppression(entry.candidateId, {
  givenAt: entry.consentGivenAt,
  expiresAt: entry.consentExpiresAt,
  anonymizedAt: entry.anonymizedAt,
});
if (suppress) {
  recordAutomationEvent(entry.id, "outreach_suppressed", suppress, entry.workspaceId);
  return { sent: false, reason: suppress };
}
const halt = outreachHaltFor(entry.id, entry.workspaceId);
```

The file's own comment at `comms-dispatch.ts:236` states the rule the technique
gives as procedure step 2: the halt is *"checked AFTER consent so the irreversible
gate stays first"*. Consent → reply-halt → manual halt, in that order, and both
refusals are audited the same way.

The history recorded at `comms-dispatch.ts:205-215` is the technique's motivating
failure verbatim: *"the consent system governed retention/anonymization but was
never consulted on the outbound path"*. The consent model existed, was correct,
and simply was not a call site on the sending path — which is why this technique
is written as a gate placement rather than as a consent model.

## Resolution at the durable identity, with the local snapshot folded in

`app/_lib/rediscovery-alert-store.ts:230` implements procedure step 3, and it is
the version with the subtlety intact:

```ts
const snaps: ConsentSnapshot[] = entrySnapshot ? [entrySnapshot] : [];
const key = (candidateId ?? "").trim();
if (key) snaps.push(...candidateConsentSnapshots(key));
if (snaps.length === 0) return null;
return outreachSuppressionReason(resolveCandidateConsent(snaps), nowMs);
```

The durable identity's snapshots are **unioned with** the record's own, not
substituted for it, so an entry carrying no durable link keeps exactly the
guarantee it had before the check moved upward. The reason this matters is
written at `comms-dispatch.ts:216`: rediscovery *"mints a fresh per-role entry
with BLANK consent, so an entry-only read would happily re-contact a person whose
ORIGINAL consent expired or who was anonymized/erased"*. That is the identity bug
the technique exists to prevent, found here in a real scan rather than in theory.

The gate fails closed on an unreadable state, with the asymmetry stated in the
code comment — *"a missed send is recoverable, a consent-violating send is not"*
— and returns `"consent_expired"` rather than throwing, so the caller's refusal
handling covers the error path too.

## Reasons, not booleans, in one closed union

`app/_lib/consent.ts:95` supplies the reason vocabulary — `"anonymized"` and
`"consent_expired"`, with `none` (recruiter-sourced, never applied), `active` and
`expiring` all contactable. `comms-dispatch.ts:199` then folds the halt reasons
into the *same* result union:

```ts
export type OutreachResult = { sent: true } | { sent: false; reason: "anonymized" | "consent_expired" | HaltReason };
```

with the comment giving the rationale the technique's audit companion states:
*"every way a send can be refused is one union, so a caller cannot handle the
compliance refusals and silently miss the sequence-stopped ones."*

## The audited non-send and the send marker

Both refusal branches call `recordAutomationEvent(..., "outreach_suppressed", ...)`
before returning, and neither writes the send marker. The marker is written only
after the transport call returns, at `comms-dispatch.ts:249`, with the reason
spelled out in place: *"counting an attempt would make a failed send look like a
contact, and `sends > 0` is what later distinguishes a reply from a fresh
application."* The refusal record and the send marker are two distinct objects, as
the technique requires, and here the send counter's second job — feeding the reply
discriminator — is what makes the separation load-bearing rather than tidy.

## Deviations

- **No message-type classification.** The technique requires every template to be
  declared *outreach* or *process* at definition time so an outreach consent flag
  can never suppress a message the candidate's own process owes them. Here the
  separation is by function — `dispatchOutreach` is gated, `dispatchAcknowledgement`
  (`comms-dispatch.ts:180`) and `dispatchRejection` are not — which is correct
  today and is a convention rather than an enforced field. A new gated dispatcher
  could acquire the consent check by copy-paste with nobody noticing.
- **No opt-out path writing to the gate.** Nothing in the outgoing message carries
  a one-line way out that writes a durable suppression at the person identity;
  suppression arrives only through the retention and anonymisation lifecycle.
- **No recruiter override record.** There is no override, which is a defensible
  choice, but it also means there is no place for a named human to take
  responsibility for a send the gate refused.
