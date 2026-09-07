# Resend as the `email` connector

What was learned mapping this recipe onto Resend specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**This is the binding that can actually satisfy the arrival criterion.** A transactional
sender returns per message events, so delivered, bounced and complained are facts rather
than inferences. This recipe's outcome says a broken pipe must never be read as an
unresponsive lead, and here that is achievable: subscribe to the events and write them
back to the lead. From a personal mailbox the same outcome can only be approximated.

**Domain authentication must be finished before the first send, because failing it is
silent.** Until the sending domain is authenticated, mail is accepted by the provider,
reported as sent, and quietly placed in spam. That is precisely the failure this recipe
forbids, and it cannot be found by watching reply rates because a low reply rate is what
a bad first draft looks like too. Verify authentication at adoption as a setup step with
its own confirmation, not as something the first week will reveal.

**Never send a first reply from an address nobody reads.** A transactional sender has no
inbox. If the reply-to is left at a no reply address, this recipe has produced a personal
sounding first touch that the enquirer cannot answer, which is worse than sending nothing
because it looks like an invitation. Point reply-to at a monitored mailbox and confirm
somebody is watching it.

**The from name is doing work the mailbox used to do for free.** Nothing here carries a
signature or a person by default, so the reply reads as coming from a system unless the
sender identity is deliberately set to a named person and a signature is written into the
body. This recipe already asks who a serious lead should be handed to; that answer is
what belongs here.

**Suppression is information the lead record wants.** A provider that has suppressed an
address after a bounce or a complaint knows something every later recipe needs. If that
does not reach the lead record, every subsequent send retries an address already known to
be dead and reports success while doing it.

## What transfers to any email connector

- The delivery evidence a sender returns decides which of this recipe's outcomes can be
  met at all. Choose the sender against the outcome, not against throughput.
- Authentication failures present as low engagement rather than as errors. Verify them
  explicitly.
- Whatever the provider learns about an address, the lead record should learn too, or
  every later recipe repeats the same dead send.
