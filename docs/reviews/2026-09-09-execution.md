# Architecture upgrade execution

The [architecture plan](2026-09-09-architecture.md) remains the dated baseline.
This log records execution and acceptance evidence without rewriting that baseline.

| Tranche | State | Evidence / remaining work |
| --- | --- | --- |
| 1. Enforcement and navigation | Complete | Commit `435fafb3`; recipe work included through preceding commit `fe1f55cf`. |
| 2. Format contracts | Complete | Commit `b2f223bf`; history check passed for all 136 recipes. Full recipe renderer and drift check; all 136 views migrated with patch versions; craft JSON unchanged; practice/memory checks; unfiltered CI runs the shared plan. Ten tests and all 17 local gates pass. |
| 3. Installation and authority | Implemented; harness smoke pending | Commit `d1150345`; explicit modes and rollback tested in isolated Git fixtures; capability preflight, mode-aware reflection, and private fleet roots. Full chain: 18/18; 13 tests pass. History check passed for 31 changed skills. |
| 4. Selection and context | Implemented; model comparison pending | Commit `1718d12d`; conditional branches extracted from research and architect with exact text reconstruction; Explorer quota/scope corrected; consult read-only logging corrected; 12 frozen routing cases. History check passed for four changed skills. |
| 5. Agentic-development subjects | In progress | Five orchestration subjects, including tenant-scoped-agent-runtime: all 48 documents read, source misinterpretations and unconditional workflow claims repaired. Live coverage: 5 reviewed / 458 total; 453 pending. |
| 6. Remaining domains and recipes | Pending | Remaining subject/topic decisions and evaluation evidence. |
| 7. Learning loop | Mechanism complete; unresolved identities queued | Commit `e76c81d7`; explicit alias contract, retained unknown counts, report dates/windows, conservative state aggregation and reproducible freshness report. Source identity decisions still require producer evidence. |

## Tranche 2 decisions

- Keep the current three-level recipe layout and ten-child hard limit. The documentation
  now requires a format/consumer migration before adding another grouping level.
- `recipe.json` is the complete authority. The generated view includes adoption details,
  provenance and unfamiliar extension values instead of losing them during rendering.
- Patch versions identify the rendering migration. Recorded maintenance lessons concern
  rendering verification only. Every recipe remains `seed`; no field effectiveness is claimed.
- Small-lane prose is UTF-8; frontmatter is ASCII. This matches the existing readable
  corpus while giving both small lanes concrete validation of identity and required fields.
- `registry.yml` has no path filter and calls `gate.mjs --all`. Existing workflow check
  names remain available for compatibility with remote protection settings.
- Regression tests use isolated temporary recipe trees: stale index and prose fail;
  regeneration repairs them; malformed source prevents writes.

## Tranche 3 decisions

- The new installer acts only on an explicitly selected project. Existing fleet
  operator scripts are not executed as part of the migration.
- Git fixtures exercise pinned release stability, explicit update and rollback,
  development edits, missing capabilities, edited caches and unowned directories.
- Roots formerly in the public fleet declaration were preserved locally before removal.
  All 12 local checkout resolutions remained identical. Missing roots no longer fall
  back to the caller's current directory. The privacy checker runs in the full chain.
- All 31 skills received reflection clause v4 and minor versions. Their maintenance
  lessons describe the instruction audit; no consumer outcome is inferred.
- A real Codex discovery smoke requires a separate agent execution. It has not run;
  filesystem discovery tests are not a substitute. Additional-agent authorization
  was requested under the session's delegation rule.

## Tranche 4 decisions and measurements

| Skill | Before | After | Entry bytes before / after | Conditional reference bytes |
| --- | --- | --- | ---: | ---: |
| research | 1.10.0 | 1.11.0 | 99,176 / 91,949 | 7,554 |
| architect | 1.7.0 | 1.8.0 | 70,640 / 62,519 | 8,405 |

Measurements normalize CRLF to LF and count UTF-8 bytes. Replacing each new stub with
its reference reconstructed the old entry exactly, apart from its version. These are
source-byte measurements, not observed token usage or latency. Optional branch runs
load the stub as well as the reference; no speed or quality gain is claimed.

Explorer 2.3.0 makes ten findings a ceiling, permits zero, and prevents quota-driven
scope expansion. Consult 1.4.0 resolves all catalog bundles and preserves read-only
scope when logging. The [12 routing cases](../evals/routing-cases.json) freeze desired
selection and action boundaries. They are evaluation inputs, not passing results.
The skills lane passes 5/5 checks. Model A/B execution remains pending.

## Tranche 7 decisions and evidence

This independent tranche was implemented while the model smoke/comparison remained
pending. Baseline: `1718d12d`. The task was to preserve telemetry uncertainty without
inflating named-artifact priority. `scripts/tests/telemetry.test.mjs` freezes duplicate
state, migration-alias, unresolved-count and freshness scenarios. All pass; the full
chain passes 18/18 with 16 tests. The aggregate deviation floor/ceiling remains 370/550.

`identity-aliases.json` requires a current target and a reason for each confirmed
migration. No mapping was guessed. Seven unknown usage names remain in the catalog's
evidence envelope; 24 unknown signal observations remain in the report and scorecard
JSON. These are assigned to identity reconciliation when producer evidence is available.
One possible duplicate block is diagnostic only, and cannot increase state priority.

The catalog now records source report dates/windows and distinguishes all reported
invocations from reported 30-day windows. `telemetry-report.mjs --as-of 2026-09-09`
is reproducible. It never updates source dates or infers current content from fresh
telemetry. [The contract](../telemetry-identity.md) defines future impact records;
the frozen workflow cases and unavailable model comparison remain open review work.

## Tranche 5: first subject

The [agent-chaining decision](../../librarian/subjects/software-engineering/agent-chaining.md)
covers all 13 owned documents. Baseline `e76c81d7`. Changes qualify universal grounding
claims, distinguish closed vocabulary from database storage evolution, account for
pending successors before declaring finality, and preserve resource ceilings when an
individual guard is disabled. Payload limits now preserve required structure and
respect retention/access boundaries.

Two pinned n8n claims were false: the path template alone cannot exclude deeper
strings, and refusing a lower resumed iteration ceiling does not prevent raising it.
Both were corrected from the primary source. The downloaded path helper was executed
locally under Node 24.14.0: direct child accepted, grandchild rejected. Other private
application witnesses were not re-executed, and verification dates were preserved.

`review-coverage.mjs` checks complete per-document decisions against the current subject
digest. A fixture proves that missing decisions and changed bytes cannot satisfy
`--require-complete`. The default reports pending/stale work without pretending it was
reviewed. Full chain: 19/19; 17 tests pass. See the [semantic review protocol](../semantic-review.md).

## Tranche 5: plan review

Baseline `bc1bd8aa`. All eight owned documents were read. The review corrects two
local source interpretations: a worker forbidden to commit can still write, and
Architect's queue disposition defers implementation rather than authorizing it.
The techniques now permit requirement-anchored omissions, materiality-based output
counts, observable internal slices, and labeled estimate retention for calibration.
Blocking review policies apply only when adopted for the workflow.

The self-review claims were checked against primary abstracts from Tyen et al. and
Wu et al. (2024), and the setup and relevant results of Choi et al. (2026).
Those studies do not establish universal fresh-context superiority in architectural
review. No paper experiments or connected-project workflows were reproduced.
The decision record lists these limits and all eight per-document dispositions.
Knowledge regeneration and its six checks pass; coverage is current for both subjects.

## Tranche 5: durable agent operations

Baseline `fee4d71f`. All seven documents were read and revised, preserving their
identities and frontmatter. The original design is now one explicit choice rather
than a universal prohibition on journals, batch placement, terminal records or
settlement during shutdown. Added missing ownership/version fencing, cross-store
reference publication, schema compatibility and cancellation-commit failure cases.
Attempt identities are distinguished from destination idempotency keys.

Primary event-history, atomic-commit and idempotent-API documentation supports the
counterexamples recorded in the subject ledger. A finite phase vocabulary does not
make every payload or schedule finite, and a database-write trace alone cannot
prove that intent preceded an external dispatch. Recovery tests now state their
bounds and observe both sides of that ordering.

The historical private runtime and prior fleet applications were not rerun.
An initial lane check rejected a stack name in generic prose; the source remains
linked through a generic citation label. Regeneration and all six knowledge checks
then passed, with three current complete decisions and no stale or invalid records.

## Tranche 5: session continuation

Baseline `8ea10877`. Read all twelve documents. Continuation now preserves accepted
task scope, explicit required-input and resource-limit yields, generation-safe
cancellation and idempotent compaction restore. Ordered composition is not claimed
to guarantee termination or reconcile incompatible conditions. Stage provenance
is separated from acceptance, atomic tracking from next-stage delivery, and
descriptor integrity from authentication.

Read the pinned source dispatcher and stage-profile ADR, plus the relevant
persistent-mode timestamp and cancellation functions. The dispatcher times out
its wait without stopping a losing handler; a same-thread timer cannot interrupt
synchronous work. Its shadow mode remains distinct from active enforcement.
The existing cancellation fixtures do not establish every concurrent mutation order.
The three application records retain their historical dates and carry reverify
dispositions for runtime evidence. All six knowledge checks pass with four current
decisions, zero stale records and zero invalid records.

## Enforcement follow-up

The top-level gate still classified an undeclared child exit as a content violation,
although the lower-level checker classifier correctly treated it as incomplete.
Changed the gate's fallback to FATAL. An isolated fixture runs the actual gate with
a checker exiting 97, verifies exit 2 and confirms later generators never run.
The complete local chain now passes 19/19 with 18 tests. This does not close the
remaining semantic coverage or the pending model/harness evaluations.

## Tranche 5: tenant-scoped runtime

Baseline `e197423b`. Read all eight documents. The review separates task-local
identity transport from authentication and code isolation, removes unsafe global
module-eviction prescriptions under concurrency, and requires trusted ingress
ownership before accepting an event's tenant stamp. Cache/handle keys now account
for identity and revision; a shared address or distinct object does not prove
data isolation. Documented fallback cannot weaken a promised isolation boundary.

Pinned Hermes daemon-pool comments incorrectly claim that Python 3.14's standard
pool captures context per submission. Read CPython 3.14.0 submission/dispatch and
official context/thread contracts to correct that claim. A local Python 3.12.1
fixture confirmed explicit per-submission bindings across a reused worker and
showed that copied contexts can still share a mutable dictionary. This is a
primitive check, not a full Hermes rerun; the application remains reverify.
Knowledge regeneration and all six lane checks pass with five current decisions.
