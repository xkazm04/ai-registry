# Subject proposal — `companion-runtime`

**Status:** dispatched (harvest wave, 2026-08-23). This is a forge input, not knowledge.
**Bundle:** `software-engineering`
**Category / subcategory:** `llm-agent` / `companion` (new subcategory, already in `taxonomy.json`)
**Class:** NEW
**Siblings in the same wave:** `companion-identity`, `conversation-orchestration`
**Engine:** `domain-knowledge-forge` — [`harvest-brief.md`](harvest-brief.md) is the contract.

---

## The gap, measured

`llm-agent` holds 22 subjects before this wave. None owns the **runtime** of a
persistent companion — the seam through which a companion's brain binds to a host
application, the single metered model entry point every leg passes through, the
turn as a transport-independent callable, or the catalog of actions the companion
may propose.

Verified three ways at `forge/companion` before drafting:

1. `grep -rli "companion"` across the whole bundle returns 20 files, **none of them a
   golden path in `llm-agent/`**. Every hit is an application citing a source tree, or
   an unrelated use of the word ("companion surface", "companion measure").
2. `grep -rniE "op (kind|catalog|envelope)|action catalog"` across the bundle returns
   **one line** — `hitl-approval/applications/rust--consent-gates.md:35`, which *consumes*
   an op envelope ("the disclosure derives from the bound op envelope the executor will
   run") and never says who defines one.
3. `grep -rniE "turn (lock|mutex)|one active turn per|per-conversation"` returns **two
   lines**, both about retrieval isolation and duplex session config. Nothing owns
   turn concurrency.

## The adjacent subjects, and what each does not own

| Subject | Owns | Does not own |
| --- | --- | --- |
| `agent-memory` | What memory *is*: the three layers, capture, the consolidation judgment pass and its pressure trigger, decay, recall budgets, provenance. | How a long-lived process *hosts* those stores — that the durable brain and the process-lifetime working set are two different stores with two different lifetimes, and what happens to the second at restart. |
| `proactive-nudges` | Machine-initiated contact policy: attention budgets, quiet windows, dedup identity, efficacy feedback. | The upstream decision an autonomous outcome must make before any of that applies — whether this outcome is worth reporting at all, or should be absorbed silently. That decision is a runtime contract on every cycle's output. |
| `cost-metering` | The money: price tables, ledger row shape, budget enforcement points, attribution axes, period boundaries. | The runtime obligation that makes the enforcement-point enumeration *closed* for a companion — one model entry point, a required leg-kind argument, one shared response parser. Cost-metering says "route through a chokepoint"; nothing says what a companion's chokepoint must accept. |
| `voice-io` (`portable-provider-package`) | How an **engine layer** — one provider direction, adapters, probes, a compare surface — travels between apps. | How the **brain** travels: a companion runtime's host seam is a store, a model leg, a turn stream, a pressure source and an action executor, and its proof of portability is a second channel, not a second app. |
| `streaming-output` | The stream itself: chunk framing, typed events, backpressure, render throttling, run attribution, finalization. | The turn as a callable unit inside the runtime — that a turn is a function returning a stream, that transports are adapters over it, and that concurrency on one conversation is a lock. |
| `structured-output` (`op-grammar-allowlisting`) | Extracting a validated artifact from settled model text; the allowlist as a capability grant. | The *derivation* problem behind the allowlist: one declaration of the action vocabulary from which the prompt teaching, the validator, the executors and the capability doc are all generated. |
| `hitl-approval` | The gate: state machines, consent, review queues, decision records. | What is on the other side of the gate — the closed, validated envelope the gate binds and the executor runs. |
| `mcp-tools` | A wire contract across a process boundary, with a trust boundary in both directions. | An in-process action catalog with no wire, no server, and no second party. |

## Siblings — the three-way split inside `companion`

- **`companion-identity`** owns *who the companion is*: constitution, self-model,
  the operator model, one mind across many mouths, and identity portability.
- **`conversation-orchestration`** owns *what the exchange looks like*: chat UX
  contracts, the shape a turn presents to a person.
- **`companion-runtime`** owns *the machine underneath both*: the host seam, the
  metered leg, the headless turn API, the action catalog, cycle hosting, the two
  runtime stores, and the report-or-absorb contract.

## Proposed techniques

Seven, carving only the ground the table above leaves open.

1. `host-seam-contracts` — the five host capabilities and nothing else; headless test doubles; a second channel as the proof.
2. `metered-llm-seam` — one entry point, leg kind required, one parser, unknown cost as a typed value.
3. `headless-turn-stream` — a turn is a function returning typed events; transports are adapters; one active turn per conversation; interrupt semantics.
4. `action-catalog-single-source` — one declaration, four derived consumers; validation symmetry; the reset path.
5. `autonomous-cycle-hosting` — the runtime half of a background cycle: admission, single-flight, non-overlap with live turns, a stated ceiling, propose-only mutation classes, restart safety.
6. `operative-working-set` — the process-lifetime "what is happening now" store versus the durable brain; reconstruction on boot; read-only to cycles.
7. `signal-economy-contract` — report or absorb, decided by the cycle that produced the outcome, before the nudge policy is consulted.

## Boundary risk accepted going in

`autonomous-cycle-hosting` sits closest to `agent-memory`'s `consolidation`, which
already owns the pressure trigger, the one-boundary-one-read rule, drain-forward
truncation and the validate-every-model-returned-id rule. This subject must **cede
all four** and own only the process-level hosting of a cycle. If the forger finds
nothing left after ceding, the honest outcome is to report it rather than restate
the neighbour.
