---
layer: technique
type: technique
subject: civic-knowledge-graphs
technique: per-claim-provenance-stamping
status: forged
laws: [provenance-or-nothing, lead-not-finding]
shared_with: []
use_when: [designing the row shape of a civic graph store, admitting model-proposed claims, wiring human review of sensitive edges]
---

# Per-claim provenance stamping

The concern: make every node and edge answer, from its own row, four questions —
*how* was this produced, *in which pass*, *from what source*, and *who stands
behind it*. Provenance at dataset granularity ("the graph is built from
registries X and Y") is marketing; provenance at claim granularity is what lets
a reader check one edge without trusting the rest. Per
[provenance-or-nothing](../../../_laws.md#provenance-or-nothing), a claim that
cannot cite its production does not render — which in a graph store means it
does not get written.

## The stamp

Every node and every edge carries a provenance object with at least:

- **method** — the closed vocabulary of production methods. Two are load-bearing
  everywhere: `deterministic` (computed by reviewable code from raw rows;
  recomputable and exact) and `proposed` (suggested by an automated analyst and
  admitted through a validation gate). The method is the reader's first trust
  signal and the system's dispatch key: deterministic claims may be regenerated
  in place; proposed claims may only be superseded by a new gated proposal.
- **pass** — the numbered enrichment run that wrote the claim (see
  pass-based-incremental-enrichment). This is the temporal axis of blame: when
  a claim is wrong, the pass points to the code and inputs that made it.
- **ref** — the machine-checkable source: the registry export, the raw table
  and row, or the id of the proposal verdict the claim came from. "The model
  said so" is not a ref; the stored verdict the gate approved is.
- **computed-at** — the timestamp, because registries move and a correct claim
  can be a stale one.

Enrichment complicates this: later passes add properties to a node another pass
created. The rule is **nested provenance** — an enrichment writes its own
provenance object *inside the property group it added*, never overwriting the
row's identity provenance. A node then honestly reads as "minted by pass 1 from
the roster; contribution profile added by pass 11 from the vote store". One
flat provenance field forces the lie that the last enricher made everything.

## The gate on proposed claims

A proposed claim passes through a deterministic validation gate before storage,
and the gate checks references, not just shape:

- Every edge endpoint must be an entity that already exists or a node the same
  proposal explicitly declares. A raw identifier that resolves to nothing is a
  fabricated relationship — rejected, not repaired.
- Every entity identifier cited anywhere in the proposal's prose must resolve.
  A hallucinated person mentioned in a rationale poisons the claim even if the
  edge endpoints are real.
- The proposal's schema is enforced structurally (hand the validator's schema
  to the generator as a structured-output contract so drift is physically
  impossible), and a drifted or fabricated proposal is discarded and re-run —
  never patched into acceptability, per the domain's refusal to repair.

What survives the gate is still a machine result. Per
[lead-not-finding](../../../_laws.md#lead-not-finding), gating governs *admission
to the store*, not *assertion to the public* — that is the third axis.

## Review state: who stands behind it

Sensitive edges — above all the person-to-firm tie — carry a review state
alongside provenance: `pending_review` at birth, `verified` only by a named
human decision, `rejected` as a **terminal** state so a bad match cannot
re-surface in the review queue forever. Three disciplines make this real:

- **One write path.** Exactly one code path in the system may change review
  state. Every other writer — including re-ingests of the same source — must
  merge-preserve human-gated fields. The measured failure mode is an ingest
  that "refreshes" edges and silently resets a year of verification to
  pending.
- **Audit first, then update.** Each decision appends an audit row (edge, who,
  when, prior state, note) *before* the edge is touched, inside one
  transaction, ideally hash-chained so the decision history is itself
  tamper-evident. The audit trail is the provenance of the human layer.
- **State machine, not boolean.** Verified, pending and rejected have distinct
  successor sets — a rejected tie may return to pending on new evidence, but
  nothing flips to verified except a human confirm. Encode the transitions;
  do not scatter them across call sites.

## Decision rules

- When a source can be joined deterministically or matched heuristically, join
  deterministically and let the unmatched remainder surface as a counted gap.
  A heuristic match that skips the lead stage because "the name is unusual" is
  the first domino of a defamation.
- When a claim's method is in doubt at write time, it is `proposed`. Upgrading
  trust later is cheap; walking back a claim published as deterministic is not.
- When two provenance tracks populate the same tables (an analytical loop and
  an investigative case line), stamp the track too. Shared storage is
  economical; shared blame is not.

## When not to escalate

Not every claim needs human review — demanding it for deterministic bulk
relations (tens of thousands of co-membership edges) would drown the reviewers
and, by exhausting them, *lower* the scrutiny on the edges that matter. Review
state belongs on the claims whose wrongness harms a person: ties between named
individuals and firms, forensic flags, anything the product will phrase as an
allegation. Everything else is defended by determinism plus recomputability.
