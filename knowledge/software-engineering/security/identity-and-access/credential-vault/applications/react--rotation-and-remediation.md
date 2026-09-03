---
layer: application
type: application
subject: credential-vault
technique: rotation-and-remediation
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# Could-not-verify weighs zero, including when the evidence is the corrupt part

*Verified against the project tree at `bf2a1e249`.*

The remediation ladder's rule about evidence is one line in the technique:
*"could-not-verify outcomes weigh zero — absence of proof accumulated into
proof of breakage is how offline machines end up suspending their entire
credential population."* The failure it warns about is the ladder climbing on
non-evidence. This is the same rule violated in the other direction, which is
quieter and worse.

## The seam

`src/features/vault/shared/hooks/health/useRemediationEvaluator.ts` is the
client half of the loop: every 30 minutes it walks the credential store,
decides which credentials warrant the authoritative `getRotationStatus` IPC
call, and dispatches the resulting actions through `remediationBus`.

The decision is a fast path. `parseAnomalyFromMetadata` (`:41-51`) reads the
credential's metadata blob and returns `null` on two different facts:

```ts
if (!metadata) return null;
try { return JSON.parse(metadata); } catch { return null; }
```

and the loop then reads (`:78-84`):

```ts
const embeddedRemediation = parsed?.anomaly_score?.remediation;
if (!embeddedRemediation || embeddedRemediation === 'Healthy') { continue; }
```

`continue` is the whole ladder skipped: no status fetch, no evaluation, no
event, no row in `lastEvaluation`. A credential whose anomaly score is
*unreadable* takes the same exit as one that is *healthy*, and the surface
that would have shown otherwise never gets the data, because the fetch that
would have produced it is the thing being skipped.

The tree already knows this case has a name. `RotationStatus` carries
`healthcheck_corrupted` (`src/lib/bindings/RotationStatus.ts:16`), set on the
backend at `src-tauri/src/engine/rotation.rs:947`, and
`shared/utils/credentialHealthScore.ts:109-113` renders it as *"Healthcheck
data corrupted"* — a distinct reason string, beside `'No anomaly data'`,
already written. It is reachable only through `getRotationStatus`.

## A and B

**A** — one `null` for two facts, and a skip that reads it as health.

**B** — `classifyEmbeddedAnomaly(metadata)` returning
`'absent' | 'healthy' | 'actionable' | 'corrupt'`. Only `absent` and
`healthy` short-circuit. `corrupt` falls through to `getRotationStatus`,
because the fast path is an optimisation and an unreadable optimisation
input is not an answer.

The change is about fifteen lines of the hook. Its point is not the
branching; it is that a vocabulary of one value (`null`) was being asked to
carry two facts with opposite consequences.

## What was read

A unit test on the classifier, run against both policies:

- Under **A** (the existing decision transcribed into the same signature so
  the same test could see it): `expected 'absent' to be 'corrupt'`. The
  assertion that a blob which will not parse must not be classed with a blob
  that isn't there fails, because in A there is no spelling for the
  difference.
- Under **B**: 2/2, and 152 tests across `src/features/vault` unchanged.

Verdict `better`. The gate is narrow on purpose — it reads the
classification, not the dispatch — and the section below says what that
leaves unproven.

## The structural fact

The direction of the collapse is the finding. A vault that mistakes
could-not-verify for breakage pages an operator; a vault that mistakes it for
health does nothing at all, and does it invisibly. The technique's ladder is
built to be *proportional*, and every one of its rungs — observe, warn,
degrade, suspend — is reached by accruing evidence. There is no rung for "the
evidence is unreadable," so the implementation resolved it to the floor,
which is the only rung that produces no signal whatsoever.

What the tree says about that, without anyone designing it to: the backend
built the missing rung. `healthcheck_corrupted` exists, is computed, crosses
the IPC boundary as a typed field, and has a rendered reason string waiting
for it in the health-score module. The client's fast path skips the only call
that fetches it. A flag added specifically to name this case is unreachable
for exactly the credentials it was added for — not because anyone removed it,
but because the optimisation that decides whether to fetch it is itself
keyed on the corrupted data. That is a shape you cannot get to by making one
wrong decision; it takes a correct one on the trusted side and an unexamined
`catch` on the other.

## What this cannot do or prove

- **It fixes the classification, not the reporting.** After B, a corrupted
  credential reaches `getRotationStatus`; if that status has no
  `anomaly_score`, the loop still `continue`s at `:96` and the credential
  still produces no row in `lastEvaluation`. The operator-visible half —
  a "could not verify" entry beside the healthy and the actionable ones — is
  not built here. The run moved the boundary from "never asked" to "asked,
  and the answer may still be dropped."
- **No live corrupted credential was observed.** The blob is written by the
  backend and the corruption case is hypothetical in this tree: the test
  feeds `'{"anomaly_score":'` and `'not json at all'`, which prove the
  classifier, not the frequency. Nothing here measures how often metadata
  actually fails to parse, and if the answer is never, the fix is cheap
  insurance rather than a repair.
- **The 30-minute cadence is untouched and unmeasured.** B makes corrupt
  credentials fetch a status they previously skipped, which adds IPC calls
  proportional to the corruption rate — a rate this run did not measure. On
  a healthy population the cost is zero; that is an argument, not a
  measurement.
- **It says nothing about rotation.** The technique's larger half — the
  four-step overlap, the ledger write coupled to the clock — is a different
  seam in a different file, and a passing test on a metadata classifier is
  not evidence about any of it.
