---
layer: application
type: application
subject: candidate-communication-integrity
technique: bounce-receipt-supersedes-a-green-send
stack: node
status: forged
---

# Append-only outbox with read-time supersession

`app/_lib/comms-view.ts` is the pure derivation behind the Comms Center read
(`/api/comms`). The database stores `dev_outbox` **append-only** — a row is never
mutated, so a later row with the same `(ref, kind)` supersedes an earlier one —
and this module turns that raw log into the recruiter's view.

## The four derived states

From the module header (`app/_lib/comms-view.ts:1`):

- **recovered** — a `failed` dead-letter has a newer same-`(ref, kind)` row that
  reached `sent`/`queued`: a successful resend, so it is audit, not an alarm.
- **bounced** — a `sent` row has a newer same-`(ref, kind)` `bounced` delivery
  receipt (posted by the relay to `/api/comms/callback`): the green "sent" was
  really undeliverable.
- **deliverable** — could a real relay address this recipient at all? False for a
  sourced or manually-created candidate with no captured email
  (`app/_lib/comms-recipient.ts`).
- **orphaned** — a `bounced` receipt that folds onto no send at all: the relay
  reported a failure for a `(ref, kind)` the app never sent.

## Folding, and the orphan that used to be dropped

Bounce receipts are "pure signal, not candidate-facing messages", so a receipt
that matches a send is folded onto it — carrying the bounce detail — and dropped
from the returned list. The comment records the upward lesson directly: a receipt
folding onto nothing "used to be dropped too, which made a relay talking a
different ref/kind vocabulary look exactly like silence". Keeping and flagging it
turns an invisible identifier mismatch into a visible integration fault.

## Attribution is an admitted heuristic

A relay bounce is keyed only by `(ref, kind)` and carries no message identity, so
it cannot say *which* send of that kind bounced. The code binds the receipt to
the single newest send at or before the bounce time, and names both the reason
and the proper repair in the comment: threading the outbox row id through the
send envelope and echoing it in the callback — blocked at the time because "the
envelope lives in `comms-dispatch.ts`, owned by a prior wave, and the receipt row
has no id column". A weak join labelled as a heuristic in the place it happens is
the difference between known debt and an invented fact.

## One verdict function, born from two surfaces disagreeing

`commsVerdict()` (`app/_lib/comms-view.ts:71`) returns exactly one of
`orphaned | bounced | recovered | failed | sent | queued`, and derived bits
outrank the stored `status` in that order. The comment names the incident: the
Comms Center and the candidate drawer "used to disagree about the SAME message —
the drawer projected the raw `status` column, so a bounced offer showed a green
'sent' there while the Comms Center showed a red 'Bounced', and a recovered
dead-letter stayed red in the drawer forever". A raw `bounced` row reaching the
function at all is treated as an orphan "rather than inventing a message state".

## The divergence regrowing on the neighbouring field

`isUnaddressable(m, relayConfigured)` exists for the same reason one field over:
the Comms Center warned "no deliverable address" while the drawer, handed the
same `deliverable` bit, "dropped it and rendered a neutral 'queued'". Its three
conditions are each an honesty rule:

- `relayConfigured === true` — with no relay configured every message is a
  terminal local row for everyone, so a missing address is not *this* message's
  problem and warning there "would be a different (and dishonest) claim";
  `null` means "not known yet" and stays silent for the same reason;
- `deliverable === false` — `undefined` is a legacy or unprojected row: unknown,
  so silent;
- `!orphaned` — an unmatched relay receipt has no candidate address by
  construction, so the warning would be noise.

Supersession is unit-tested in `app/_lib/comms-view.test.ts` and
`app/_lib/comms-view.bounce.test.ts`; the module stays import-free of the
database so the bare runner loads it directly.

## Where this deployment falls short of the standard

- **No orphan-by-silence.** `orphaned` here means an unmatched receipt only. A
  message that left and produced no receipt within any expected window has no
  state and no sweep; the callback endpoint fails closed without
  `COMMS_CALLBACK_SECRET`, so a deployment with receipts unconfigured has no
  bounce path at all and does not say so per message.
- **No propagation of a late correction.** A `sent` row that later bounces
  changes what every surface renders, but nobody who already read the green tick
  is told; the correction is a re-read, not an event.
