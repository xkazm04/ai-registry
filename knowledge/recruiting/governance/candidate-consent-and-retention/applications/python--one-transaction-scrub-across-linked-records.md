---
layer: application
type: application
subject: candidate-consent-and-retention
technique: one-transaction-scrub-across-linked-records
stack: python
status: forged
verified_on: 2026-10-21
verified_against: python@3.12
applied: simulation
ab_verdict: better
---

# The stores an entry-keyed scrub cannot reach, on the Python side of a hiring engine

A hiring product whose erasure lives in TypeScript (`anonymizeEntry`, one SQLite
transaction keyed by the pipeline entry; see the node application) also runs a Python
analysis engine. That engine writes to three places the entry-keyed scrub has no key
for: a job-keyed interview kit, a deployment-level LLM metering ledger, and opt-in
prompt captures on disk. Read at kp `efa2089f1` plus `47fd18d35`. The question was
whether each one is unable to hold the person, or only nobody has checked.

## Unable by signature: the job-level interview kit

The kit is stored keyed by job, and the scrub walks entries. The engine does not ask
callers to keep candidates out. It removes the parameter:

- `pipeline/jobfit/automation.py:1514 "NO CANDIDATE IS AN INPUT HERE. That is a property of the signature, not a discipline"`
- `pipeline/jobfit/automation.py:1517 "derived that reached it would be undeletable"`
- `pipeline/jobfit/automation.py:1584 "Nothing candidate-authored is in scope here"`. `kit_context(job, brief)` is
  the one place prompt input is built, and it takes a job and a role brief.
- The CLI states the same rule from the other end, at
  `pipeline/jobfit/automation_cli.py:17 "job-keyed, where the entry-keyed erasure scrub could never reach it again."`

This is the strongest form of the rule. A store the scrub cannot address is safe only
if the code path that writes it cannot receive a person. Here that holds by type, so no
reviewer has to re-check it on each change.

## Unable by reduction: the metering ledger's reason column

`llm_usage` is deployment-level and carries no entry id. The TypeScript side lists it in
`ERASURE_EXEMPT` as holding nothing to erase (`app/_lib/db/pipeline.ts:2453`). That
sentence depends on a Python write door. A provider's error message can echo the
prompt, and the prompt holds the CV. So the reason is reduced to a closed vocabulary
before it reaches the durable column:

- `pipeline/jobfit/llm/degradation.py:114 "Reduce a caller's reason to a CODE before it reaches a durable column."`
- `pipeline/jobfit/llm/degradation.py:124 "must never mint a new code in a durable column"`. Prose collapses to
  `provider_error`.

The exemption's reason is therefore a property enforced at the write, not a description
of what callers usually pass. That is the condition the technique now names.

## Not unable: opt-in prompt captures

`KP_LOG_PROMPTS=1` writes the full prompt and response, a whole CV, to
`tmp/prompts/<request_id>-<suffix>`. These files are keyed by request id, outside any
table, so they are outside the tenancy manifest that `erasure-full-scrub.test.ts:257`
holds the scrub to. An erasure that commits and answers `{ erased: true }` does not
touch them. The ledger row above carries the same `request_id` (`pipeline/jobfit/llm/monitor.py:215`),
which is the join back to the file.

The engine handles this honestly in its own documentation. The captures are off by
default and written owner-only (`pipeline/jobfit/logger.py:41`). The module states that
`pipeline/jobfit/logger.py:16 "With the variable unset the artifacts are NEVER"` swept.
What it lacks is the store-side half of the rule. When enabled, this store receives the
person, has no bounded clock unless an operator sets one, is not in the erasure
inventory, and is not in the candidate-facing disclosure. The retention side of the same
module is the python application under `retention-ttl-and-derived-disclosure`.

## Simulation: does the added condition separate these three?

Each real store was checked against the technique before and after its new condition
(*a store the scrub cannot key into must be unable to receive the person, or be bounded
and declared*).

| Store | Prior rule (joinable table: inventory or reason) | Added condition |
|---|---|---|
| interview kit (job-keyed) | silent, since nothing joins it to a person | holds, by signature |
| `llm_usage.reason` | listed with a reason, but the reason was a claim | holds, by write-door reduction |
| prompt captures (request-id files) | silent, since it is not a table | **flagged**: receives the CV, unbounded by default, undeclared |

`better`: the prior rule was silent on all three. The added condition passes the two
that are safe by construction and flags the one that is not. n = 3 stores in one tree,
read rather than executed. The flagged store is an operator opt-in that kp's 2026-09-22
drain deferred as an intentional policy choice. So it is recorded here as a deviation,
not changed in the product.
