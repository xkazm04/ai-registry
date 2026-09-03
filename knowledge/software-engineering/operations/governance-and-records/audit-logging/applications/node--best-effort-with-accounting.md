---
layer: application
type: application
subject: audit-logging
technique: best-effort-with-accounting
stack: node
status: forged
verified_on: 2026-09-02
verified_against: node@22
proof: structural-only
---

# An egress ledger whose polarity is pinned as test data

gstack writes a hash-chained, content-free receipt to
`~/.gstack/security/egress.jsonl` **before** every off-machine send it
initiates (`lib/egress-receipt.ts`; `bin/gstack-egress-lib.sh` for shell
callers). This application records how the tree resolves the technique's
central tension — the write must never fail the action, and the trail must
never silently miss one — and where it stops.

## Claim before the side effect, with the polarity decided per sink class

The technique's second exception says a claim write fails closed. The tree
generalises that into a **polarity table** and pins it as data in the test
that enforces wiring (`test/egress-receipt-wiring.test.ts`, `POLARITY`):

| class | sinks | on receipt failure |
| --- | --- | --- |
| fail-closed | brain sync, memory ingest, telemetry sync, tunnel start, MCP verify, database provisioning | refuse the send with a typed code; print problem, cause, fix |
| fail-open | the design binary's model calls, update check, the read-only dashboards, git-class user operations | warn on stderr and proceed |

The comment beside the table states the rule the classification follows:
"gstack state leaving the machine unrecorded is worse than the operation
failing" for the first class; "user-facing operations that must not die over
an audit-log hiccup" for the second. Changing a sink's class is called out as
a security decision. The ledger's documentation names which actions are
claims — the technique's last sentence in the exception section — by making
the list executable.

## Every sink is enumerated, and a new one fails CI

The same test holds three wired lists (TypeScript modules that must import
the helper and call it; shell scripts that must source the shared library;
the design binary's files that must use the receipted fetch) and a
**new-sink scanner** that sweeps the whole tree for outbound network
operations and requires every hit to be wired or in a reasoned exemption
list. The file's comment: "there is no KNOWN_UNWIRED bucket." This is the
technique's completeness half — the miss is counted before it can happen —
moved from a runtime counter to a static gate.

## The stated bounds

`ARCHITECTURE.md` (egress section) and the module header both carry the
threat model verbatim: the ledger is "forensic observability of ATTEMPTED
egress", "not an exfiltration control". `verify` recomputes the chain and
detects in-place edits, reordering and mid-chain deletion; it does **not**
detect tail truncation, whole-file re-fabrication or deletion of the ledger,
and the doc says guarding against the same-user actor who owns the file is
out of scope. A fail-open send that could not be receipted proceeds
unrecorded with a warning — the technique's "gaps that do not surprise".

## Where the tree falls short of the technique

- **No durable miss counter.** Fail-open sinks warn on stderr once per
  process; nothing counts how many sends went unrecorded, and nothing
  surfaces that number. The technique's half two is the static scanner plus
  a warning, not a counter on a health surface.
- **Rotation is a TODO.** The module warns at 25 MB and never rotates; the
  chain-genesis sketch for multi-generation verification is written in a
  comment, not in code.

Both are honest gaps the tree names itself. The first is the one the
technique would ask for next: a counter keyed by sink and failure class,
kept away from the ledger it counts.
