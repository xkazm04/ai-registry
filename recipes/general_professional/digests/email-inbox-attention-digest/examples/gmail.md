# Gmail as the `email` connector

What was learned mapping this recipe onto Gmail specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Labels are the scope boundary, and they are the honest answer to a question that would
otherwise be answered by a prompt.** The connector exposes labels as a resource, so
"which mail is in scope" can be settled at adoption as a concrete list rather than left to
a sentence in an instruction that the reader will assume means something narrower than it
does. Where the mailbox is shared or carries several roles, this is the difference between
reading what was intended and reading everything.

**Gmail already ships an importance model, and it is not the reader's judgment.** The
`important` marker is itself a learned per-user signal, so treating it as ground truth
means this recipe learns from a second model rather than from the person. It is useful as
one input among several and dangerous as the label to train on, because two models
agreeing with each other is indistinguishable from either being right. Where the reader
has been overriding that marker for years, the overrides are the better signal and the
marker is the thing they were arguing with.

**Threads, not messages, are the unit a reader acts on.** A long thread arriving in
pieces will otherwise be scored, tiered and surfaced several times, which is the fastest
way to spend the reader's trust in a short list. Deduplicate to the thread and score the
thread's latest state.

**No inbound events, so the pass is always a poll.** The connector declares nothing to
subscribe to, which means the recipe reads on its own rhythm whatever trigger was chosen,
and that its "nothing qualified" delivery is the only evidence the reader has that the
watch is alive. Losing access looks exactly like a calm week unless the failed read is
reported as a failed read.

**Archiving and reading happen elsewhere, continuously.** The reader will act on mail
directly between passes, so the unread set at pass time is not the unread set at the
moment the last digest was written. A message the reader already dealt with must not
reappear, and the record of what was surfaced has to be keyed on the message rather than
inferred from unread state.

## What transfers to any email connector

- Settle scope against a structure the mail system already has, not against a description.
- Any importance flag the provider supplies is another model's output. Learn from the
  human's corrections to it, not from the flag.
- Score the conversation, not the message, or a long thread eats the whole digest.
- If the source cannot push, a failed read is invisible unless the recipe says so out
  loud. The empty digest is what carries that.
