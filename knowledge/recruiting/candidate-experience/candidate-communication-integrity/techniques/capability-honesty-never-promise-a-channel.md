---
layer: technique
type: technique
subject: candidate-communication-integrity
technique: capability-honesty-never-promise-a-channel
status: forged
laws: [say-only-what-the-record-holds, a-candidates-process-never-stalls-on-your-constraints, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [a setup flow offers an inbound address or channel, a message promises a reminder or a reply path, adding a link into candidate-facing content]
---

# Capability honesty — never promise a channel

## The concern

The most damaging communication defect is not a message that fails to arrive. It
is a **channel that does not exist being advertised as though it does.** A
message tells a candidate they may reply to this address, or that a reminder is
coming, or that they can manage their data at this link. Each of those is a
promise about your future behaviour, printed in a durable artifact, at scale.

The classic instance: a setup flow *derives* an inbound address from a workspace
name or identifier, because deriving one is trivial and provisioning one is not.
Nothing on the internet accepts mail at that address. It is then printed as the
reply-to on every outgoing message. Candidates reply — with questions,
withdrawals, accessibility requests, whole applications — and the replies fall
into nothing. From their side they have communicated with you. From yours they
are unresponsive. The silence is mutual and only one party knows.

**An inbound address is a capability, not a derivation.** It exists when somebody
provisioned it and something is demonstrably reading it. Until then, the honest
product says the channel is unavailable and offers one that works.

## Procedure

1. **Model channels as capabilities with a state**, not as strings on a settings
   record: *not configured*, *configured but unverified*, *verified*. Only
   verified may be printed to a candidate.
2. **Verify by round trip, not by syntax.** A capability becomes verified when a
   message sent to it was observed arriving in the system that claims to read it.
   Re-verify periodically; credentials and routes expire quietly.
3. **Never synthesise an address from an identifier.** If your code can construct
   the address without a provisioning step, it is a derivation, and the check
   that catches it is: did any external system ever accept mail here?
4. **Degrade to a working path.** With no verified inbound channel, the outgoing
   message names a real alternative — a portal, a named recruiter, a form — or it
   says plainly that replies are not monitored. Never a reply-to that eats mail;
   an unmonitored address that a candidate can see is unmonitored beats a silent
   one they cannot.
5. **Audit every promise in every template.** For each future-tense sentence a
   message makes — a reminder, a follow-up, a decision by a date, a link — name
   the mechanism that honours it. Sentences with no mechanism are deleted or made
   conditional ([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)
   applies to the future tense too: a promise is a claim about the record you
   intend to create).
6. **Make links absolute, always.** A relative link is dead the moment the
   content leaves your interface — a mail client has no base to resolve it
   against. Every candidate-facing message composes links from a configured
   absolute origin, and the composition is centralised so no template author can
   get it wrong. Resolve that origin from the live request when one exists, and
   from explicit configuration when the send is detached — a scheduled sweep, a
   reminder job — which is exactly where relative and wrong-origin links are
   born. When nothing deployment-specific is configured and a default origin is
   used, **warn loudly**: the link is still absolute, but it may point at the
   wrong deployment, and that is a fact an operator must be told rather than a
   silence to ship.
7. **Never drop a legal affordance to avoid a broken link.** The self-service
   data-rights line belongs on every candidate-facing message; if its link cannot
   be built well, the answer is to fix the origin, not to omit the footer. A
   broken rights link is a right denied — and a missing one is the same right
   denied more quietly. Omit it only where it is genuinely meaningless, such as a
   record already erased, in which case there is nothing left to manage.

## Decision rules

- **When a channel's state is anything but verified, do not print it.** Not in
  small text, not as a reply-to, not "just for now".
- **When a message would promise a scheduled follow-up that your scheduler cannot
  guarantee, drop the promise rather than the follow-up.** A confirmation issued
  for an event so soon that the reminder job could never fire must simply not
  mention a reminder. Never tell someone a reminder is coming and then silently
  skip it — that is the same lie as a silently dropped send, told in advance.
- **When a capability is required for a candidate's own action** — replying,
  withdrawing, requesting their data, accepting an offer — its absence must not
  block them; provide an alternative path
  ([a candidate's process never stalls on your constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
- **When you cannot determine whether a channel works, treat it as unavailable**
  ([uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
  An unverified channel silently consuming a withdrawal request is worse than an
  admitted gap.
- **When a template is authored by a customer, validate its promises too.**
  Configurable copy is where unbacked promises re-enter after you have removed
  them from the defaults.

## When not to use this

- **Internal staff channels** may run on unverified conveniences; the standard
  applies to what a candidate is told.
- **Where a genuine shared mailbox is provisioned and monitored by humans**, the
  capability exists — no further machinery is needed beyond keeping its verified
  state honest when the person monitoring it leaves.
- **Do not overreach into transport authentication** — domain signing, sender
  reputation, and inbound routing infrastructure belong to the engineering craft
  next door. What you keep is the rule that nothing is advertised to a candidate
  until that machinery has demonstrably worked at least once.
