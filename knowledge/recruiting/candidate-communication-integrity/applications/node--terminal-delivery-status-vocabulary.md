---
layer: application
type: application
subject: candidate-communication-integrity
technique: terminal-delivery-status-vocabulary
stack: node
status: forged
---

# One honest delivery vocabulary in a Next.js hiring app

The realization is a single import-free module, `app/_lib/comms-truth.ts`, that
every claim surface in the product routes its language through.

## The states, and why queued is terminal here

`app/_lib/comms-status.ts` defines `OUTBOX_STATUSES` / `OutboxStatus`, and
`docs/features/comms/README.md` §2 ("The status contract (single source of
truth)") states the property that makes this a hiring-integrity concern rather
than a queueing one — **all three states are terminal**:

| Status | Meaning | Terminal |
|---|---|---|
| `queued` | recorded in the local outbox; no relay configured | yes — "there is no worker, dequeue, delivery, or retry" |
| `sent` | the configured relay accepted it (HTTP 2xx) | yes |
| `failed` | relay configured, delivery dead-lettered | yes — escalated loudly (`console.error`) and durably (`comms.log`) |

With `COMMS_WEBHOOK_URL` unset (and no relay saved through the Channels tab),
*every* candidate message is a `dev_outbox` row and nothing reaches a candidate.
The README makes the pending-queue invariant explicit and inverts the usual
reading: "If `queued` ever appears *with* a relay configured, that is a bug, not
a pending send — nothing in the system transitions a `queued` row."

The header comment of `app/_lib/comms-truth.ts:1` records the drift this was
written to stop: **~8 surface families used to translate "row recorded" into
"sent / we've emailed you"**. That count is the honest measure of how far a
convenient word had spread before anyone owned it.

## The claim resolver and its blind case

`deliveryClaim(relayConfigured, status?)` (`app/_lib/comms-truth.ts`) returns
`"sent" | "queued" | "failed"`:

- `failed` or `bounced` → `failed` — "a `bounced` receipt means the green 'sent'
  was really undeliverable — treat it as the failure it is";
- `sent` → `sent`, `queued` → `queued` — the row's real status wins whenever the
  caller has one;
- **no row at all** → the capability bit decides: `relayConfigured ? "sent" :
  "queued"`. The comment states the licence for the optimism precisely — the
  `WebhookChannel` records `sent`/`failed` explicitly, so a message with no
  recorded failure and a configured relay did go; with no relay, "the row is a
  terminal `queued` by contract".

The module is deliberately import-free apart from the `OutboxStatus` *type*, so
it loads in client bundles and in the bare type-stripping Node unit runner alike;
the capability bit itself (`isRelayConfigured`, `app/_lib/comms-relay.ts`) reads
the database and is server-only. Keeping the vocabulary loadable everywhere is
what makes "every surface calls the same function" enforceable rather than
aspirational. It is unit-tested in `app/_lib/comms-truth.test.ts`, and
cross-surface parity is locked by `app/_lib/comms-delivery-truth.test.ts`.

## Rendering, not re-deriving

`docs/features/comms/README.md` §8 ("One delivery truth, on every surface")
names the three consumers that must not re-derive: the Comms Center, the
candidate drawer (fed by one exported mapping, `candidate-timeline.ts` →
`toCandidateComm`), and the resend clients. Failure detail lives in
`dev_outbox.failure_detail`, populated *only* for `failed` rows "so a stale
reason from a retry that later succeeded can never sit next to a green badge".
Both resend controls (`ResendButton`, `BouncedResend`) "surface the server's
refusal reason and only report success when the fresh row itself isn't
`failed`" — the button inherits the claim discipline of the send.

## The configuration surface as an honesty surface

The README's configuration summary gives each variable an "unset (honest
default)" column rather than a default value: with `COMMS_WEBHOOK_URL` unset,
"local outbox only; every surface says messages aren't being sent". That column
is the technique compiled into an operational document — the deployment states
the claim it is entitled to make.

## Where this deployment falls short of the standard

- `deliveryClaim`'s blind case earns `sent` from a capability bit, which is
  correct only while the send path records every failure explicitly. That is an
  invariant held by convention across the channel implementations, not by a type.
- The relay `sent` state means *the relay accepted the HTTP post*, one hop short
  of a mailbox accepting the message. The vocabulary is honest about its own
  boundary, but a recruiter reading "sent" is reading relay custody, not
  delivery; only an asynchronous bounce receipt closes that gap.
