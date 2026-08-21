---
layer: technique
type: technique
subject: candidate-communication-integrity
technique: bounce-receipt-supersedes-a-green-send
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, absence-of-evidence-is-not-evidence, say-only-what-the-record-holds]
shared_with: []
use_when: [modelling delivery state over time, asynchronous bounce or failure reports arrive after a success, deciding what a delivery history screen shows]
---

# A bounce receipt supersedes a green send

## The concern

Delivery is not a verdict returned at call time; it is a story told in
instalments by systems you do not control. A relay accepts a message and returns
success. Minutes or hours later it reports a hard bounce. If your model is one
mutable status column, one of those two facts is destroyed — and which one
survives depends on write ordering, which is to say on chance.

The fix is structural: **an append-only outbox of receipts, with supersession
resolved at read time.** No receipt is ever overwritten or deleted; the current
truth is a function computed over the sequence.

## The four resolved states

Computed over all receipts for one logical message, newest last:

- **deliverable** — an acceptance receipt exists and no later adverse receipt
  contradicts it. The only state that licenses the word *sent*.
- **bounced** — an adverse receipt exists later than the newest acceptance. The
  bad news wins.
- **recovered** — an adverse receipt exists, and a *later* acceptance for a
  subsequent attempt exists. A retry that worked really did work; the earlier
  failure stays in the record and is never pruned, because the failure is the
  entry with evidentiary value.
- **orphaned** — either nothing was ever heard back within the window in which a
  receipt would be expected, or a receipt arrived that folds onto **no send at
  all**. This is the state most systems never name, and it is where silently lost
  candidate messages live. Silence is not success
  ([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).

## Folding receipts, and the receipt that matches nothing

A failure receipt is *signal*, not a message: it is not something you wrote to a
candidate and it must never appear in a candidate-facing history as though it
were. So a receipt that can be attributed to a send is **folded onto** that send
— carrying its detail forward — and disappears from the list of messages.

A receipt that folds onto nothing is the case to design for deliberately. The
tempting move is to drop it as noise, and that is precisely how a transport
speaking a slightly different reference vocabulary than yours becomes invisible:
every bounce it reports matches no send, all of them are discarded, and the
resulting screen is indistinguishable from a channel with no bounces at all.
Keep the unmatched receipt, flag it, and read it as what it is — **a live
integration fault**, not a message. It is the only evidence you will get that
your identifiers and the transport's have drifted apart.

## Attribution is a known-weak join — say so

Receipts usually carry the transport's own identifiers, not yours, and are keyed
by whatever reference you put on the envelope. If that reference is coarser than
one message — a candidate reference plus a message kind, say — then a receipt
**cannot say which attempt of that kind bounced**. The honest heuristic is to
bind it to the newest send of that key at or before the receipt time: the most
recent attempt is the one the transport was almost certainly talking about.

Two rules follow. Write the heuristic down where the join happens, because a
plausible join that nobody labelled as a heuristic will be read as a fact by the
next person. And treat it as debt with a known repair: thread your own per-message
identifier through the envelope and require the transport to echo it, after which
attribution is exact and the heuristic can be deleted.

## Procedure

1. **Make the outbox append-only in the schema, not by convention.** No update
   path on receipt rows. A correction is a new receipt with a later timestamp and
   its own actor.
2. **Bind each receipt to the exact attempt**, not to the candidate or to the
   template. A retry is a new attempt with its own identifier; a verdict about
   delivery binds to the thing it judged
   ([a verdict is bound to what it judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)),
   so a success on attempt three must never be read as covering attempt one, and
   a re-sent letter with edited content inherits neither the earlier success nor
   the earlier bounce.
3. **Resolve at read time, in one function.** Every surface — the candidate's
   timeline, the recruiter's list, the audit export — calls the same resolver.
   Two resolvers means two truths.
4. **Define the orphan window explicitly.** Pick the duration after which no
   receipt means orphaned, from the transport's own observed behaviour, and make
   it a named constant, not an incidental timeout. Orphans age into visibility;
   they do not age into acceptance.
5. **Never prune.** A retention policy that deletes failed sends because they
   clutter a dashboard destroys precisely the records that answer "did you
   actually contact this person".

## Decision rules

- **When an adverse receipt is newer than the newest acceptance, the resolved
  state is adverse.** No weighting, no "the relay is usually wrong about this".
  Later bad news outranks earlier good news, always.
- **When two receipts share a timestamp, the adverse one wins.** Ties resolve
  pessimistically for you and safely for the candidate.
- **When a bounce is soft (mailbox full, temporary refusal), it is still adverse
  until a later acceptance supersedes it.** Optimism about a retry that has not
  yet succeeded is the same lie in a smaller dose.
- **When the resolved state changes after a human has already been told
  otherwise, the change is itself an event.** Someone told a recruiter this
  candidate was informed; that recruiter must learn it is no longer true. A
  silently corrected status is a second failure of the same kind
  ([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)).
- **When a message is re-sent after a bounce to a corrected address, keep both
  the old and new recipient on the record.** "We contacted them" is only
  meaningful with the address attached.

## When not to use this

- **A transport with no asynchronous feedback at all** — some internal or
  in-product channels — has nothing to supersede. Model it as queued-then-sent
  and be explicit that no bounce path exists, rather than inventing receipts.
- **Engagement events (opens, clicks) do not belong in this sequence.** They are
  not delivery receipts and must not promote or demote a delivery state; an
  unopened delivered message is delivered.
- **Do not use supersession to hide history from operators.** The resolved state
  is for surfaces that need one answer; the receipt sequence itself must stay
  visible on any screen whose job is to explain what happened.
