---
name: database-row-change-watch
version: 0.2.0
status: seed
domain: software_engineering
path: software_engineering/observability
---

# Database row change watch

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Row level change streams are almost entirely the product working correctly, so
a watch that relays them all trains its audience to ignore it and hides the few changes
that should never have happened; and the streams themselves redeliver, arrive out of
order, and stop without saying so.

**Input.** Row change events from the watched tables, the current state of the affected
record read back rather than taken from the payload, what this data normally does, and
whether anyone acted on the last things this watch surfaced.

**Core action.** Judge which changes are genuinely off against what this data normally
does, deciding from the record as it stands now rather than from the event that
announced it, and decide who if anyone needs to hear about each one and in how much
detail.

**Output.** Quiet on routine volume, and for the rest an account carrying the record and
the reason, delivered once per underlying change with a burst collapsed into one
message, plus a standing signal that the stream itself is still alive.

## Activities

1. Receive the change and identify the table, the operation and the record *(observe)*
2. Re-read the affected record rather than trusting the payload it arrived with
*(observe)*
3. Decide whether the change is routine or genuinely off against what this data normally
does *(decide)*
4. Decide who needs to hear it and at what depth of detail *(decide)*
5. Deliver once per underlying change, collapsing a burst into a single account
*(deliver)*
6. Carry forward whether anyone acted on what was surfaced, so the bar is tuned from
what people did *(act)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A row change that should not have happened is noticed while it still matters, and
routine volume produces nothing at all.**

- Changes that break an invariant are surfaced with the record and the reason, not just
  a count
- Routine volume produces no notification at all
- A burst of changes originating from one transaction or one bulk operation arrives as
  one account rather than one message per row

**A verdict reflects the state of the record when it was judged, not the state the event
claimed.**

- The affected record is read back before a change is called anomalous, and a change
  already superseded is reported as superseded rather than as current
- A repeated delivery of the same underlying change produces no second notification,
  with sameness decided from the record and its version rather than from the message
- A malformed or unreadable payload is recorded and skipped rather than failing silently

**A watch that has stopped receiving is distinguishable from a table where nothing is
happening.**

- The watch carries a standing signal that the stream is still delivering, so a stopped
  subscription surfaces rather than reading as calm
- A gap during which the watch was not running is stated, so the changes inside it are
  known to be unjudged rather than assumed routine
- The share of surfaced changes somebody acted on is carried forward, so a filter nobody
  responds to is visible as a broken filter
- A change somebody says afterwards should have been surfaced is recorded against the
  invariant that failed to catch it, because a bar tuned from what was surfaced is blind
  in the one direction that matters, which is what the watch stayed quiet about

## Guidance

Most row changes are the product working, so being quiet about them is the job. Do not
judge from the event payload: events arrive late and out of order, so re-read the record
before deciding anything about it. Collapse a burst by the transaction that caused it
rather than by a time window, since one human action can produce a thousand rows. A
stream that has stopped delivering looks exactly like a quiet table, so prove it is
still alive.

## Where this is worth adopting

- A team that turned on database webhooks, routed them all to a channel, and now has a
  channel nobody opens, where the one deletion that mattered went past unread three
  weeks ago.
- An operation where a bad migration or a mistaken bulk update is the realistic
  disaster, and the difference between noticing in ten minutes and noticing at month end
  is whether the data can still be reconstructed.
- A product with a small number of rows that carry real consequences, such as
  entitlements, prices or feature flags, sitting in the same database as high volume
  tables nobody needs to hear about.
- A compliance obligation to know when specific records change, where the record of
  having watched matters as much as the watching and a silently stopped subscription is
  the actual risk.
- A solo operator with no chat tooling who still needs to hear about the handful of
  changes that should never happen, and for whom a firehose is strictly worse than
  nothing.

## Connector types

`database`, `messaging`, `email`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[supabase](examples/supabase.md) for `database`, [slack](examples/slack.md) for
`messaging`.

## Recommended trigger

`event`. A row changing is a real external event and the judgement is only useful while
the change is recent, so this work wakes on arrival rather than choosing its own moment.
The liveness check on the stream itself is the one part that cannot wake on an event,
since its whole subject is events not arriving.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which tables carry consequences and which are noise, since watching everything equally
  is the same as watching nothing
- What an invariant looks like on each watched table, because a change being wrong is a
  claim about this operation's rules rather than about the row
- What the adopter wants to be interrupted for versus what can wait for the periodic
  health read, and how they will say afterwards whether an interruption was worth it
- Where an alert should land, given the adopter may have no channel configured at all,
  and how a delivered alert is known to have been picked up rather than merely sent

## Dependencies

None.
