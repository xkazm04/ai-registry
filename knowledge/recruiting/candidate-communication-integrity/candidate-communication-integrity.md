---
layer: golden-path
type: golden-path
subject: candidate-communication-integrity
status: forged
use_when: [a surface is about to tell someone a message was sent, designing the outbox or delivery status model, a candidate says they never received a decision, adding a new candidate-facing channel or reply address]
techniques:
  - terminal-delivery-status-vocabulary
  - bounce-receipt-supersedes-a-green-send
  - recipient-addressability-contract
  - candidate-locale-resolution-authority
  - dead-letter-escalation-and-orphan-receipts
  - capability-honesty-never-promise-a-channel
---

# Candidate communication integrity

Never tell a candidate — or a recruiter — that you contacted someone when you did
not.

That is the entire subject, and it is not an infrastructure subject. Everything
about hiring communication that a delivery engineer would file under reliability
is, on the candidate side, a **truth-telling problem**. A rejection that was
composed, approved, recorded and then silently dropped by a relay is not a
dropped packet with a retry budget. It is a person refreshing a page for six
weeks, rehearsing what they did wrong, while your system's own screen says the
message was delivered and your recruiter's dashboard has moved on. The harm is
not that the bytes did not move. The harm is that a claim was made about a human
interaction that never occurred.

So the discipline here is **claim discipline**: for every sentence your product
speaks in the past tense about a message — *sent*, *emailed*, *notified*,
*informed*, *contacted* — there must be a fact in the record that licenses it,
and that fact must be the acceptance of the message by something outside your
process, not the successful insertion of a row inside it. This is
[say only what the record holds](../_laws.md#say-only-what-the-record-holds)
applied to the delivery layer, where it is violated most casually, because the
violation feels like a UI copy decision rather than a claim about a person.

## What this subject owns, and what it cedes

The mechanics of getting bytes to a mailbox belong to the engineering craft next
door: transport, retry and backoff policy, idempotency keys, message signing and
domain authentication, provider webhooks and their signature verification, queue
durability, rate limiting, suppression lists as an infrastructure concern. Do not
re-derive any of that here. Adopt it, and assume it works about as well as such
things ever do — which is to say, with a long tail of asynchronous, hours-late
bad news.

What this subject keeps is the layer *on top* of that plumbing: **what you are
allowed to say, to whom, and when, given what the plumbing has actually told
you.** The retry belongs to engineering. The word "sent" belongs to you.

The seams with the neighbouring hiring subjects are equally sharp, and you should
hold them:

- Deciding what a decline *says* — its tone, its specificity, whether it offers a
  reason at all — belongs to the subject on declining with dignity. You own only
  whether the decline truthfully arrived.
- Deciding *whether and when* to send at all — sequence spacing, follow-up
  cadence, the halts that stop a sequence when a candidate replies or a recruiter
  intervenes — belongs to the subject on outreach and halt rules. You own the
  enforcement being honest: that every refusal to send is recorded as a refusal
  rather than vanishing.
- The candidate's own view of where they stand belongs to the status-transparency
  subject. You own the guarantee that your view and their view cannot contradict
  each other about a message they did or did not get.
- The offer deadline itself — how it is computed, extended, expired — belongs to
  the offer-lifecycle subject. You own the rule that the letter states the same
  deadline the candidate's own countdown states, because those two artifacts are
  produced at different moments by different code.

## The three audiences you can lie to

A delivery status is read by three parties, and integrity fails differently for
each.

**The candidate.** Told "a confirmation has been emailed to you", they stop
looking. If the message never lands, the false claim removes the very behaviour
(checking, chasing, asking) that would have recovered the error. Optimistic copy
does not merely mislead; it disarms the person's own correction path.

**The recruiter.** Told the rejection went out, they close the record, stop
thinking about the person, and answer "we contacted them on the 14th" to any
later question, including a legal one. A recruiter acting on a false send is
worse than a recruiter acting on no information, because they now defend the
claim.

**The record.** Six months later somebody must reconstruct what this
organisation actually communicated to this person. Every non-send that left no
trace is a hole in that reconstruction, and holes in that reconstruction are
resolved, in practice, in favour of whoever tells the more confident story.

Design for the third audience and the first two come out right. Design for the
first audience only, and you build a system optimised for looking calm.

## One vocabulary, terminal at the edges

The commonest structural defect is that "sent" means five different things in
five different places: a row was written; a job was enqueued; a relay accepted
it; a mailbox accepted it; a human opened it. Each surface picks the one that
reads best there, and the product ends up unable to state, as a single fact, what
happened.

Fix this by declaring **one closed vocabulary**, owned in one place, that every
surface must speak — and by choosing its boundaries so that no word in it can be
reached by an event inside your own process alone. *Sent* requires an external
acceptance. *Queued* is the honest word for recorded-but-not-yet-out-of-here, and
it is a promise of nothing. *Failed* is a real state that must be reachable and
must be visible.

The refinement most teams miss: **queued is often terminal.** With no relay
configured at all, every message is recorded locally and *nothing will ever
deliver it* — no worker, no dequeue, no retry, no future in which that row
becomes a send. Treating queued as "in flight" turns a permanent non-delivery
into a hopeful one and lets a screen write "sending…" over a state that has
already finished. Decide whether your queued is terminal or pending and say
which; and if a pending queue exists, a row resting in it while the transport is
healthy is a bug to alert on, not a send to wait for.

One vocabulary also means **one resolver**. The characteristic bug is two
surfaces disagreeing about the same message: a detail panel projecting the raw
stored status shows a green tick while the operations console, which applies the
derived bounce, shows red — and a failure that was later recovered by a
successful resend stays red on the panel forever. Derived truth outranks stored
truth, and the derivation happens exactly once, in a function every surface
calls. Expect the divergence to try to regrow on the neighbouring field the day
after you kill it on the first one: whichever adjacent bit a screen is free to
interpret for itself (is this recipient addressable? is this resend a success?)
becomes the next place two screens tell one person two different stories.

See terminal-delivery-status-vocabulary for the construction,
and note the corollary that catches most teams: a status is not merely a label,
it is an **assertion boundary**, so the vocabulary must forbid rendering a
queued row with delivered copy no matter how convenient. This is
[meaning does not live in a label](../_laws.md#meaning-does-not-live-in-a-label)
in its delivery form — the word must key off a stable state, not off what looks
tidy on the screen.

## Delivery is not a moment, it is a story that keeps changing

The second structural defect is treating delivery as a synchronous verdict. It
is not. A relay accepts a message, returns success, and forty minutes later — or
eight hours later — reports a hard bounce. The recruiter has already seen a green
tick. Any model that stores one mutable status field and overwrites it will,
depending on write order, either lose the bounce or lose the send.

The correct model is an **append-only outbox** of receipts, with explicit
supersession rules that are applied at read time. The later bad news outranks the
earlier good news; a later success supersedes an earlier failure (a retry that
worked really did work); and there is a fourth state that most systems never
name — the **orphan**. Orphans come in two shapes and both are invisible by
default: a message that entered the pipe and about which nothing was ever heard
again, and its mirror image, a failure receipt that folds onto *no send at all*
because the transport is reporting about an identifier your system never
dispatched. The second shape is the quieter killer: a relay speaking a slightly
different reference vocabulary than yours produces receipts that match nothing,
get dropped as noise, and look exactly like silence — while real bounces go
uncounted. An unmatched receipt is a live integration fault, and it must surface
as one rather than being discarded. Silence is not success. That is
[absence of evidence is not evidence](../_laws.md#absence-of-evidence-is-not-evidence)
with a mail server attached: an unheard-from message has a distinct state, not a
default optimistic one. See bounce-receipt-supersedes-a-green-send.

## Addressability is a contract, and it has a terminal literal

Who receives this message? The naive answer is "the candidate's email address",
and the naive failure is what happens when there isn't one — an anonymised
record, a sourced profile with no contact detail, a candidate whose data was
erased on request, a test fixture. Systems reach for a fallback: the recruiter,
the workspace owner, a no-reply mailbox, an empty string, the literal text
`undefined`. Every one of those either misroutes a candidate-facing message to a
staff member or produces a send that fails in a way nobody can attribute.

State the recipient resolution as an explicit, ordered **contract** whose last
tier is not a guess but an explicit unaddressable marker — a value chosen so that
it can never be a real address, is impossible to mistake for one in a log, and
routes the message straight to the dead-letter path with its intended recipient
still recorded. Unaddressable is a legitimate outcome of a correctly functioning
system. Silently unaddressable is not. See recipient-addressability-contract and
dead-letter-escalation-and-orphan-receipts.

## The channel you advertise must exist

A distinct and more embarrassing failure: promising a channel you cannot receive
on. A setup flow that *derives* an inbound address from a workspace name, or
prints a reply-to that no mail exchanger anywhere accepts, publishes an address
into thousands of outgoing messages and then silently eats every application,
question and withdrawal sent to it. Candidates reply, believe they have replied,
and are treated as unresponsive.

The rule is absolute: **an inbound address is a capability, not a derivation.**
It exists only if somebody provisioned it and something is demonstrably reading
it. Until then, the product says the channel is unavailable and offers a path
that works. The same rule governs every promise a message makes in passing — a
reminder that is coming, a portal link, a data-rights request path. If the
message says it, the system must be able to honour it, and a message that cannot
honour a promise must drop the promise rather than the honour. See
capability-honesty-never-promise-a-channel.

## Composition-time truth: say it in the right language, with the right facts

Two failures happen before the message ever reaches the relay, and both are
integrity failures rather than formatting bugs.

**Language.** A message sent in a language the candidate does not read is, for
that candidate, a message not sent — with the added insult of appearing, from
your side, to have been delivered. Locale is not a rendering preference; it is a
property of the recipient with a defined resolution authority: the candidate's
own recorded choice first, then the workspace's default, then the application
default, with the unrecorded case an explicit fall-through rather than an assumed
match. Populations that predate the field are the dangerous cohort: they have no
recorded choice, and a naive default will address them all in whichever language
the code was written in, under a brand they know in another. See
candidate-locale-resolution-authority.

**Facts.** Any figure a message states that is also displayed to the candidate
elsewhere — a deadline, a stage name, an interview time — must be resolved at
**dispatch**, not baked in at draft time. Drafts are edited, approved late, sat
in a queue over a weekend, or re-sent. A letter that hard-codes the deadline it
knew about on Tuesday will contradict the countdown the candidate is watching on
Friday, and when a document and a screen disagree about a deadline the candidate
is entitled to rely on the more favourable one — which is exactly the position
[uncertainty resolves toward the candidate](../_laws.md#uncertainty-resolves-toward-the-candidate)
puts you in. Inject volatile facts at the last possible moment, from the same
source the candidate's own view reads.

## A refusal to send is an event, not a nothing

Compliance gates, halt rules and consent checks all end in the same place: this
message will not go out. The naive implementation returns early. The record then
shows nothing at all, which is indistinguishable from "nobody ever tried" and
from "it was sent and lost".

Every refusal is audited with its reason, its actor and its intended recipient —
[every consequential decision names its actor](../_laws.md#every-decision-names-its-actor)
does not exempt the decision *not* to act. Three practical consequences:

- **Order the gates by irreversibility.** Evaluate the check whose violation
  cannot be undone first — consent to be contacted at all — then the reversible
  operational halts. A message that should never have been sent must fail on the
  consent gate, and the audit must say so, not report a halt that happened to
  fire first.
- **Resolve consent at the durable identity.** A person who asked, two years ago,
  never to be contacted again may exist today as a fresh application record with
  no history. Consent belongs to the human, not to the candidature; resolve it at
  whatever identity survives across records, or you will re-contact exactly the
  people who most explicitly told you not to.
- **Audit the refusal; do not write the send marker.** The two records are
  different objects and confusing them costs a person their next opportunity. The
  refusal event says *we declined to contact this person, for this reason, on this
  date*. The send marker says *this person has been contacted at this stage*, and
  it is what later sequencing reads to decide whether they are exhausted. Write
  the second one on a refusal and a candidate who re-consents next month is
  permanently skipped by a system that believes it already wrote to them. For the
  same reason the marker is written **after** the transport accepted the message,
  never at the attempt: counting an attempt makes a failed send look like a
  contact.
- **A refusal is not an outage.** Blocking a recruiter's bulk action because a
  quota ran out is your business; blocking a candidate's own confirmation for the
  same reason is not — see
  [a candidate's process never stalls on your constraints](../_laws.md#a-candidates-process-never-stalls-on-your-constraints).

## Failure modes of the naive reading

- **Green means written.** The tick reflects a row in your database. Nothing
  outside the process has ever seen the message.
- **The bounce nobody reads.** Bounce receipts arrive, are stored, and are
  rendered nowhere a human looks; the pipeline keeps advancing candidates who
  have not been contacted in months.
- **The reassuring aggregate.** "142 messages sent" counts rows. The honest
  headline is the pair: what left, and what could not.
- **Retry as absolution.** "It will retry" is used to justify optimistic copy
  now. Retries change the future; they do not license a past-tense claim.
- **The helpful fallback recipient.** An absent candidate address quietly
  resolves to the recruiter, who receives a message addressed to somebody else
  and assumes the candidate got a copy.
- **Relative links.** A link that works in your own interface is dead in a mail
  client. Every link that leaves the building is absolute, or it is a broken
  promise the candidate discovers alone.
- **The reminder that never came.** A confirmation promises a reminder the day
  before; the scheduling window is too short for the reminder job to fire. Either
  the promise is conditional on the window, or you have told a person something
  untrue about your own future behaviour.
- **Deletion of embarrassing history.** Someone prunes failed sends to make a
  dashboard look better. The failed record is the one with evidentiary value;
  the successful one is routine.
- **The optimistic resend.** A resend control reports success because the request
  returned, not because the new attempt itself avoided failing. The button
  inherits the same claim discipline as the original send.
- **Over-warning, which is also a false claim.** Flagging "no deliverable address"
  on every message when *no transport is configured at all* blames the record for
  a condition that belongs to the whole channel. Honesty runs in both directions:
  a warning asserts something too, and an unknown value must stay silent rather
  than render as a problem.

## The bar

You have this subject right when three statements hold simultaneously and can be
demonstrated from the record. Every past-tense claim your product makes about
contacting a person is backed by an external acceptance for that exact message.
Every message that did not reach its recipient is visible to a human whose job it
is to fix it, within a bounded time, without anyone having gone looking. And no
candidate can ever be in the state where your system believes they were told
something they were not — because when your system does not know, it says
so, in the same words to the recruiter and to the candidate.
