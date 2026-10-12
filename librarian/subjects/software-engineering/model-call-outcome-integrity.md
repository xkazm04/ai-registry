---
subject: model-call-outcome-integrity
domain: software-engineering
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# model-call-outcome-integrity

First note. The subject was forged on 2026-09-05 and deepened once since, by
dp-mcoi-0930. That pass ran a single counter-evidence lane, made the stop condition a
vocabulary, and wrote no note. With no note, the scan kept reading the subject as never
swept, which is why it was dispatched three more times. dp-mcoi-0930b and dp-mcoi-1001
idled on that reading.

## 2026-10-10 - /deepen dp-mcoi-1010: a filter is not a refusal

Source class: vendor reference pages and official SDK source, re-read raw. SDK lines are
pinned to commits from 2026-10-09. Three lanes ran: counter-evidence, current vendor
vocabulary, and a blind training-data lane.

- **Golden path, flipped.** "The model declined" was one row owned by the model. It is now
  two:
  - the model declined: a refusal the model writes itself, usually under a normal stop
  - a filter withheld the answer: a policy layer beside the model blocked the input or
    stopped the output, and reported it as a stop reason

  Both lanes reached this independently. A not-better simulation added the condition: the
  split pays only where a report, a repair loop or a ledger reads the outcome.
- **spend-precedes-the-error, refuted then corrected.** "Several failure modes bill in
  full, including a refusal or safety block" is wrong. Vendors document pre-output
  refusals as free in most categories, and input-guardrail blocks as free of model charges.
  A 401 or a 429 is free. A filtered 400 is charged for processing. New rule: price a
  failure from what the response reports, never from its class.
- **one-deadline-across-attempts, two conditions.**
  - The client library's ladder runs inside yours. One official library replaces any
    stated wait over 60 s with backoff capped at 8 s. A second gives up above 120 s. A
    third honours any wait.
  - Before naming a remote window, rule out the library's default timeout (commonly
    10 minutes) and idle-connection drops. Streaming or a keep-alive fixes those; a
    smaller request does not.
- **enforcement-demotion-on-translation-loss, one condition.** Acceptance is not
  enforcement: one cloud endpoint accepts unsupported schema fields and ignores them.
  Three vendor-documented routes lead out of an enforced schema: a ceiling, a refusal,
  and enum casing that changes under a normal stop.
- **unattempted-is-not-failed, three additions.**
  - In a stream, usage arrives after the stop, so a dropped stream has no price either.
  - Newer stop members name the request or the account, not the call.
  - Billed intermediate work is read from usage, not from visible text.
- **declared-call-site-identity, confirmed.** The generative-AI telemetry conventions
  (still in development status) carry no field for purpose.
- **Verified and left untouched:** reasoning models return empty visible output under a
  low ceiling, and are billed for it, according to two vendors' own sentences.
- **Application:** `next--unattempted-is-not-failed`, the technique's first. It is a code
  A/B: 13/13 stop-condition fixtures were retryable before the change, 0/13 after.

### Impact

Map regenerated for the three projects that join the subject. The digest moved to
`a9e52b1a`.

| project | pairs | judged | stale |
| --- | --- | --- | --- |
| tracklight | 2 | 0 | 0 |
| systedo-case | 1 | 0 | 0 |
| kp | 1 | 0 | 0 |

The `/conform --stale` queue gains nothing, because no verdict was ever recorded against
this subject. Demand stays inferred until a project judges a pair.

### Applied (rows in [[applied]])

| finding | project | mode | verdict |
| --- | --- | --- | --- |
| unattempted-is-not-failed (stop vocabulary, owed since 0930) | systedo-case | code | better |
| golden path, filter is not a refusal | systedo-case | simulation | not-better (condition written) |
| golden path, filter is not a refusal | tracklight | simulation | better |
| spend-precedes-the-error, price from the response | systedo-case | - | unmeasurable (no usage on the error type) |
| one-deadline-across-attempts, library ladder and default timeouts | - | - | unapplied (no fleet seam calls through a library with a default ladder) |
| enforcement-demotion, acceptance is not enforcement | - | - | unapplied (no fleet seam calls the accepting endpoint) |

### Declined

- "Retry with backoff on every failure is wrong for deterministic stops" (blind lane).
  Owned by retry-backoff (`error-classification-for-retry`), which says it already.
- "Record the raw vendor stop verbatim beside the class and its owner" (blind lane).
  Already covered by the closed vocabulary and the unmapped-is-loud rule.
- "A 429 with no retry-after can be a spend cap, not a throttle" (counter lane, vendor
  sentence). It is an error-classification fact and belongs to retry-backoff, not here.
- Cancelled-stream billing. No vendor sentence was found for two of the vendors, so the
  killed-supervisor case stays hedged as "may".

### Open leads (with return conditions)

- A model now writing its refusal as text and billing the whole call, instead of a block.
  This rests on one forum report. Return: a vendor sentence, or a fleet trace showing it.
- tracklight's providers read only the length stop. Return: a code A/B there when its
  providers grow a stop vocabulary (the simulation above predicts better).
- systedo-case's typed error carries no usage. Return: when it does, measure booked
  failure cost against each vendor's category rule.
- The Messages API now reports thinking tokens separately, but tracklight's adapter still
  says it does not ("no thinking/answer split"). Return: the next pass that touches the
  tracklight adapter.
