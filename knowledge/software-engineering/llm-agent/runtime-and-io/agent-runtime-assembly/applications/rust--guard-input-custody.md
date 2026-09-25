---
layer: application
type: application
subject: agent-runtime-assembly
technique: guard-input-custody
stack: rust
status: forged
verified_on: 2026-09-25
verified_against: rust@1.96
applied: code
ab_verdict: better
proof: ab-paired
---

# A companion's raw-SQL tool could rewrite the ledger that recorded her

The stack witness is the tree's toolchain pin, `rust-toolchain.toml` at
`channel = "1.96.1"`; the workspace manifest's `rust-version = "1.80.0"` is the
floor, not the runtime.

The tree is a desktop agent host with a resident companion agent. The companion
is given a generic database capability over the host's user database: list
tables, describe one, run a SELECT, and run a single mutating statement
(`CREATE`/`INSERT`/`UPDATE`/`DELETE`/`DROP`/`ALTER`/`REPLACE`), the last one
approval-gated. The same database holds the companion runtime's own records,
and a code comment on the per-turn ledger says why: it lives there *so the
companion's own database introspection can reach it with no extra wiring*. The
records co-located this way include the per-turn ledger (cost, token usage, an
error flag the health surface turns into an error rate), the approval row every
proposed action leaves, the background-job table, the unattended night-shift
event log, and the daily budget counters. The host's end-of-day rollup — whose
own doc comment calls it the audit a user gets when they let the companion run
autonomously — is composed from those tables.

The approval gate did not hold the line it appeared to. Under the host's
autonomous mode, every proposed action fires without a card (a deliberate,
documented operator decision), so the mutation capability ran with no human in
front of it. And the capability's only checks were a verb prefix and a
single-statement test.

## Arms

Declared before any arm ran: a target of ten hostile statements, each counted
only if refused **with the records intact afterwards** (erase the ledger,
launder the error flag, forge a row, drop it, rename it, attach a trigger that
deletes each new row, shadow it with a session-temporary table of the same
name, clear the approval trail, reset a budget counter, and the erase again in
a mixed-case, quoted, schema-qualified spelling); and a floor of three checks
that must hold in every arm: the companion's own working table takes all five
verbs, the ledger stays readable, and the runtime's own insert into the ledger
succeeds on the same pooled connection after a refused statement.

| arm | what it is | target | floor |
| --- | --- | --- | --- |
| A | the capability as it stood | 0 / 10 | 5/5, read, runtime write |
| B1 | the source's rule read literally — the agent may not replace the recording component: refuse drop, rename, trigger, index and same-name shadowing on runtime tables | 4 / 10 | held |
| B2 | the amended rule — the record, rows and structure, outside the recorded party's write reach; read kept | 10 / 10 | held |

B2 is the database engine's per-statement authorizer, installed for the one
agent statement and removed before the connection goes back to the pool. It
refuses any write — row or structure — whose object is a table the companion
schema declares, and the protected set is derived by reading that schema
constant, so a ledger added there later is covered without an edit. The
refusal names the table and the way forward (read it, or write a table of your
own). The capability's verb-prefix check was left in place.

B1 scored what the literal rule predicts and no more: it closed the four
structural statements, including the shadow, and left all six row writes open.
The literal rule is not wrong; it is the smaller half.

## Controls

- **Positive control:** arm A scores 0 of 10 on the same predicates B2 passes,
  so each target assertion is demonstrably able to fail.
- **Negative control on the floor:** with B2's authorizer removal deleted, the
  floor check "runtime write after a refused statement" went red — the guard,
  left on a pooled connection, refuses the recorder's own inserts. The floor
  can see the one way this fix would damage what it protects.

## Seam class

A generic write capability, given to an agent, over a store that co-locates
the agent's working data with the runtime's records of that agent. The shadow
case is specific to stores that resolve an unqualified name through a
session-scoped namespace first; everything else transfers to any store with a
per-statement authorization hook.
