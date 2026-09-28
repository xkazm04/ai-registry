---
layer: application
type: application
subject: candidate-outreach-and-halt-rules
technique: consent-gate-before-the-first-touch
stack: node
status: forged
verified_on: 2026-09-28
verified_against: node@24
---

# The gate chain in the outreach dispatcher

Re-read at kp `0c9a742d3` on 2026-09-28. The first reading (2026-08-20) cited
line numbers that had all moved; the substance held, and two of its three
deviations have since been closed by the tree.

`app/_lib/comms-dispatch.ts:494` — `dispatchOutreach` is the chokepoint every
generated outreach message passes through, and the whole of this subject's gate
ordering is visible in twenty lines of it.

## Consent first, because it is the irreversible one

```ts
const suppress = candidateOutreachSuppression(entry.candidateId, {
  givenAt: entry.consentGivenAt,
  expiresAt: entry.consentExpiresAt,
  anonymizedAt: entry.anonymizedAt,
});
if (suppress) {
  // Audit the refusal so the absence of a send is visible, not silent.
  recordAutomationEvent(entry.id, "outreach_suppressed", suppress, entry.workspaceId);
  return { sent: false, reason: suppress };
}
// ...
const halt = outreachHaltFor(entry.id, entry.workspaceId);
```

The comment at `comms-dispatch.ts:509` states the rule the technique gives as
procedure step 2: the halt is *"Checked AFTER consent so the irreversible gate
stays first"*. Consent, then the candidate's own opt-out, then the recruiter's
halt, then the reply, and every refusal is audited the same way.

The doc comment above the function (`comms-dispatch.ts:476-493`) records the
technique's motivating failure verbatim: *"The consent system governed
retention/anonymization but was never consulted on the outbound path — this
closes that gap."*

## The chokepoint became the channel

The first reading found the gate in one dispatcher. It is now re-asserted at the
channel handoff. `app/_lib/comms.ts:291`, `commsSendSuppression`, is *"The ONE
predicate every door shares"*, and `sendComm` refuses before handing anything to
a transport. The comment above it names the defect it closed: the resend door,
a lifecycle close, a promotion batch and the intake acknowledgement all called
`sendComm` directly, *"so the gate was a property of one call path rather than of
sending."* That is the technique's procedure step 1 — a second send path is a
second policy — found and fixed in the wild.

The same predicate draws the outreach/process line the technique's step 5 asks
for: consent and anonymization apply to every candidate-facing send, and the
sequence halt applies only where `msg.kind === "outreach"` (`comms.ts:311`),
because *"a rejection or an offer letter is owed to a candidate who replied, not
withheld from them."*

## Resolution at the durable identity, with the local snapshot folded in

`app/_lib/rediscovery-alert-store.ts:516`, `candidateOutreachSuppression`, is
procedure step 3 with the subtlety intact:

```ts
const snaps: ConsentSnapshot[] = entrySnapshot ? [entrySnapshot] : [];
const key = (candidateId ?? "").trim();
if (key) snaps.push(...candidateConsentSnapshots(key));
if (snaps.length === 0) return null;
return outreachSuppressionReason(resolveCandidateConsent(snaps), nowMs);
```

The durable identity's snapshots are unioned with the record's own, so an entry
with no durable link keeps exactly the guarantee it had before. The reason is in
the dispatcher's doc comment: rediscovery *"mints a fresh per-role entry with
BLANK consent, so an entry-only read would happily re-contact a person whose
ORIGINAL consent expired or who was anonymized/erased"*. The gate fails closed —
*"a missed send is recoverable, a consent-violating send is not"* — and returns
`"consent_expired"` rather than throwing.

## The opt-out now writes at the person

The first reading's second deviation — no way out in the message — is closed.
Every candidate comm carries two footers built together
(`comms-dispatch.ts:186`, `renderCandidateFooters` at `:203`): a data link and a
separate stop link, and the comment explains why they are not interchangeable.
The only lever used to be erasure, and *"Making the only way to decline further
messages the destruction of your own candidacy is the coupling the law forbids."*
The machine half rides as `List-Unsubscribe` with
`List-Unsubscribe-Post: List-Unsubscribe=One-Click`
(`app/_lib/comms-envelope.ts:142`), aimed at a route that exports a POST — the
comment at `comms-dispatch.ts:220` records that the header first pointed at a
page with no POST handler, so every one-click unsubscribe answered 405 and *"the
opt-out was never recorded"*.

The write is `recordCandidateOptOut` (`app/_lib/outreach-state-store.ts:241`) from
`app/api/stop/[token]/route.ts:101`, audited as `outreach_opted_out`. The read,
`candidateOptOutHalt` (`outreach-state-store.ts:71`), resolves at the durable
candidate identity and fails closed, so an opt-out from one role's letter stops
the next campaign's freshly minted entry. That is procedure step 6 exactly.

## Reasons, not booleans, in one closed union

`app/_lib/consent.ts:114` supplies the consent reasons, and
`comms-dispatch.ts:472` folds the halt reasons and the relay dead-letter into the
same result:

```ts
export type OutreachResult =
  | { sent: true; status: "queued" | "sent" }
  | { sent: false; reason: "anonymized" | "consent_expired" | HaltReason | "delivery_failed"; status?: "failed" };
```

The comment gives the rationale the audit technique states: `delivery_failed`
joins the union *"so a caller cannot handle the compliance refusals and silently
miss a drop that should be retried."*

## The audited non-send and the send marker

The refusal branches record `outreach_suppressed` and write no send marker. The
marker is written only after a non-failed handoff, at `comms-dispatch.ts:532`,
with the reason at `:529`: *"counting an attempt would make a dead-letter look like
a contact, and `sends > 0` is what later distinguishes a reply from a fresh
application."*

## Deviations

- **The outreach/process classification is a free string, set at send time.**
  The channel keys the halt on `kind === "outreach"`, which is the technique's
  split, but `OutboundMessage.kind` is `string` (`comms.ts:56`), not a closed
  type declared when a message type is defined. A new dispatcher that spells the
  kind differently skips the halt without a type error.
- **A recruiter-sourced first touch carries no notice or source.** The consent
  gate treats "no record anywhere" as *"recruiter-sourced first touch,
  contactable"* (`rediscovery-alert-store.ts:525`), which is correct for the
  gate. The letter it permits says nothing about where the person's details came
  from and links no candidate notice. See the-first-touch-carries-the-notice.
- **No recruiter override record.** There is no override, which is defensible,
  and also no place for a named human to take responsibility for a send the gate
  refused.
