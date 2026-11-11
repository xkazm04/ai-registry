---
layer: technique
type: technique
subject: webhook-ingestion
technique: signature-names-the-relay
status: forged
laws: [gate-sees-target]
shared_with: []
applied: blind-ab
ab_verdict: better
use_when: [a signed webhook wakes an agent or starts a run, an inbox or comment or form service relays events written by other people, deciding who may cause a run, a per-endpoint rate limit sits after the signature check]
---

# The signature names the relay, not the author

A verified signature proves one thing: the bytes were produced by the service
holding the shared secret. When that service is a **relay** - an inbox
provider announcing a received message, a code host announcing a comment, a
form service announcing a submission - the event it signs was *caused* by
someone else: whoever can send mail to the address, comment on the public
issue, fill in the form. The signature is a true statement about the messenger
and no statement at all about the author.

That the content is third-party text after verification is
[prompt-safety](../../../../llm-agent/prompt-and-context/prompt-safety/prompt-safety.md)'s
rule, and reviewers apply it unaided. The half they miss is the wake.

## The wake is a capability the author reaches

When the event starts a run, causing an event is the same as starting the run.
Anyone who can make the relay emit can wake the agent, spend its budget and
place text in its context. Fencing the payload and gating the agent's outbound
step limit what the run can do; neither decides whether it runs. So who may
cause a run is decided **on the author, before anything is woken**, as its own
gate:

- **An author gate after the signature gate.** Admit on the author identity the
  relay asserts - the sender, the commenter, their role on the repository - and
  only as far as the relay authenticates that identity itself: a code host's
  comment author is authenticated by the host, an e-mail From header is not.
  Events from authors outside the gate are recorded and not woken.
- **Bound the wake per author, not only per endpoint.** A rate limit keyed on
  the endpoint and placed after the signature check is usually justified as
  "only the real sender can spend it". With a relay, every stranger's event is
  the real sender's delivery: one person producing events through it - a flood
  of comments, a burst of mail - is all signed, consumes that bucket, and
  starves the legitimate events behind it. Keep the endpoint bucket as a
  ceiling; the bucket that protects the run budget is keyed on the author.

## Where the rule stops

The signature check stays: it is what stops anyone from posting forged events
straight at the endpoint with whatever author they like, and without it the
author gate reads an identity nobody vouched for. The two gates answer
different questions - who delivered this, and who caused it. A relay whose
events have no outside author (a build service reporting its own job, a
payment processor reporting a settlement) needs only the first.
