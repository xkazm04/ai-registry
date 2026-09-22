---
layer: technique
type: technique
subject: toasts-notifications
technique: durable-notification-ledger
status: forged
laws: [count-carries-predicate, creation-names-reaper, identity-survives-reuse, derivation-names-recomputation, deletion-is-not-repair]
shared_with: []
use_when: [deciding which messages earn a durable record, badge count refuses to reach zero, the same news must be cleared twice]
---

# Durable notification ledger

Toasts are allowed to be missable only because something unmissable stands
behind them. The **notification center** is that something: a durable,
ordered record of the messages that mattered, with read-state, history,
and its own retention policy. It converts the transient layer from a
delivery guarantee it cannot honor ("the user saw this") into one it can
("this is on the record, marked unseen, and the record claims attention
until visited").

> **The toast is the announcement; the ledger entry is the fact.**

## Admission: what earns a record

Recording everything buries the signal under ceremony; recording nothing
makes toasts load-bearing. The admission rule derives from the two axes
the golden path established:

- **Action-required messages: always.** The obligation must survive the
  pixels — this is the mandatory half, with no exceptions.
- **Warnings and errors: yes**, even awareness-class ones. "What went
  wrong while I was away" is the ledger's core query.
- **Successes and info: generally no.** Copy-confirmations, save acks,
  micro-feedback are pure ephemera. The exception is completion of
  *long-running or user-awaited* work — a job the user started and walked
  away from earns a record, because the whole point is that they were not
  watching.
- Admission is decided **by the message's classification at the source**,
  not by whether the toast happened to display. A message the queue shed
  or coalesced still reaches the ledger (see
  [queue-discipline](./queue-discipline.md)); display and record are
  independent outcomes of one event.
- **The record is not part of the transaction it records.** Delivery
  machinery keeps bookkeeping of its own — a claimed window, a retry
  slot, an in-flight marker — and that bookkeeping is *rolled back* when
  a send fails, so the next attempt can proceed. The ledger row must sit
  outside that rollback and outside the failure path that triggers it.
  The moment a release, a retry reset or an error handler can carry the
  record away with it, the one outcome that most needs remembering —
  we decided to tell them and they were never told — is the only outcome
  that leaves no trace.

## One identity across tiers

A ledger entry and its toast (and its OS notification, if escalated) are
projections of **one event with one identity**
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
Consequences:

- Acting on the toast resolves the ledger entry; acting in the ledger
  retracts any live toast and pending OS notification. The user never
  clears the same news twice — double-clearing trains them that the
  center is a chore that re-litigates what they already handled.
- Coalesced repeats update *one* entry (occurrence count, latest
  timestamp) rather than appending N rows. The ledger records facts, and
  "still failing, 40th occurrence" is one fact.
- The entry carries the same action affordance as the toast, backed by
  the same idempotent handler — the ledger is the slow path to the same
  door, not a read-only museum of missed opportunities.

## Read-state and the badge

Read-state is the ledger's contract with the user's attention, and its
semantics are worth pinning precisely:

- **Unread means unseen, not unresolved.** Opening the center and viewing
  an entry marks it read; whether its obligation is discharged is the
  separate resolution state on the entry. Conflating them either nags
  forever (read-only-when-resolved) or lies (resolved-by-glancing).
- Bulk "mark all read" is legitimate for awareness entries and must *not*
  silently resolve obligations — action-required entries survive it
  visibly, in their own section or filter, still demanding their action.
- The **badge** on stable navigation is the ledger's ambassador: a count
  that states its predicate
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) —
  *unread*, or *unresolved-obligations*, but chosen once and never a blend.
  A badge whose number the user cannot make go to zero by any defined
  action becomes wallpaper within a week. Zero must be reachable and its
  meaning statable in one sentence.
- Badge and ledger derive from the same store. A badge counter maintained
  by increment/decrement at call sites drifts from the list it summarizes
  — the count is *derived* from the entries, with the derivation named
  ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

## Retention: the ledger names its reaper

Durable is not eternal. An unbounded ledger degrades into an archive
nobody scrolls, and its unread count into a shame counter. Retention is
declared at the ledger, per class
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)):

- **Read awareness entries** — shortest life; days, then gone.
- **Unread awareness entries** — longer, but still bounded: news too old
  to act on is noise, and expiring it is honest. Expiry decrements the
  badge; the reaper and the count share the store.
- **Unresolved obligations** — not time-expired. An obligation leaves by
  resolution or by *explicit* user dismissal — the system may not decide
  that a duty aged out. If obligations accumulate, that is signal about
  the product (it demands more than users can process), and hiding the
  backlog treats the symptom by deleting the evidence
  ([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)).
- Caps (max entries) back the time rules so a failure storm cannot bloat
  the store; overflow evicts oldest-read-first, never unresolved
  obligations.

## Derived notices: dismissal retracts the predicate

Not every durable notice is a row in the ledger's own store. A notice can
be *derived* — rendered because a route parameter is present, because a
stored flag is set, because a query still matches. Its persistence is real
and it belongs to a store the message layer does not own, which changes
what dismissal has to mean:

> **A derived notice is dismissed by falsifying its predicate, not by
> unmounting its view.**

Hiding the view satisfies the gesture and nothing else. The predicate is
still true, so the notice returns on reload, on back-navigation, and —
worst — for whoever the user sends the link to, who sees a message about
an event that was never theirs. A user who dismissed something and finds
it again learns that dismissal is decorative, which is the same lesson a
badge that will not reach zero teaches.

Two consequences worth designing for:

- **Dismiss optimistically, retract durably.** Retracting the predicate
  usually costs a round trip or a navigation; the user's gesture must not
  wait for it. Hide immediately, commit the retraction behind it, and
  make the retraction idempotent so a failed or repeated commit is
  harmless. The visible half is latency work; the durable half is the
  actual dismissal.
- **The retraction preserves everything else in the predicate's home.**
  Clearing one parameter must not clear the others that happened to
  travel with it — a dismissal that resets the user's filters, scroll
  target or view state has charged them for reading a notice.

Where the derived notice carries an obligation, the predicate's home is
the wrong place for it: obligations belong in the ledger, where the
retention rules above protect them. Derivation is for notices whose whole
life is one visit.

## Ordering and grouping

Newest first is the default and correct spine. Above it, two groupings
earn their complexity: **unresolved obligations pinned or sectioned apart**
(they are a to-do list, not news), and **same-source runs collapsed**
(twelve entries from one storm read as one incident with a count). Any
further taxonomy — per-feature tabs, per-severity filters — should be
demanded by observed volume, not anticipated; an empty six-tab center is
architecture cosplay.
