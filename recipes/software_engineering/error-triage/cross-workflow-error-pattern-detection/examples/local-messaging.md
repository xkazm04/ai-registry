# In-app messaging as the `messaging` connector

What was learned mapping this recipe onto the platform's own inbox rather than an
external chat product. Nothing here is part of the recipe: swap the connector and this
file stops applying while the recipe does not change.

## What the mapping has to decide

**Most of the buffering advice written for this kind of work is about somebody else's
rate limit.** An external chat product throttles, returns a retry hint, and can be
unreachable while the failure being reported is still happening, which is why alerting
recipes accumulate elaborate guidance about queueing and consolidating on recovery. None
of that applies here: there is no remote service between the pattern and the reader. That
guidance is connector knowledge and belongs in this file, not in the recipe.

**What replaces it is the reader, not the transport.** The in-app inbox has no channels,
no mentions and no notification policy of its own, so a pattern account competes for
attention with every other thing the platform writes. The suppression rules in the recipe
are doing all the work that a separate incident channel would otherwise do, and setting
the interrupt threshold low here degrades the whole inbox rather than one room.

**An account here is read where the members are also visible.** That is the one real
advantage over an external channel and it changes what the account should contain: link
the members rather than restating them, because the reader can open each one, and a
pattern account that inlines five failures is longer and less useful than one that names
them.

**There is nobody to page.** Delivery to this connector reaches a person when they next
look, which for an overnight cascade may be hours. An adopter who needs a response inside
a bounded time has to bind something that reaches a phone, and the honest thing at
adoption is to say that this connector is the floor rather than the answer.

## What transfers to any messaging connector

- Buffering and consolidation guidance is a property of the transport, not of the craft.
- Where the account and its members live in the same place, link rather than restate.
- A channel that is only read when somebody looks cannot carry a time-bounded response
  expectation, and saying so at adoption is cheaper than discovering it during an outage.
