---
domain: software-engineering
subject: mcp-tools
last_touched: 2026-08-22
touched_by: research, external-reconcile
dry_streak: 0
---

# mcp-tools

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-22 - `/research`, from a practitioner deep-dive

Gained `orchestration-to-tool-migration` (6 -> 7 techniques). Source:
[[2026-08-22-inside-deepwiki]].

The subject governed how a tool is shaped - schema, transport, scoping, result trust -
and not what earns a place on the surface at all. That answer is not stable: it is
derived from model capability, which moves, so pipelines accumulate scaffolding
compensating for limitations that have since lifted.

Home was the run's hardest call. `agent-chaining` owns event-wired peer-to-peer chains
and `fleet-orchestration` owns session supervision; neither is the orchestration/agency
dial. Recorded here because the next run to meet a finding of this shape will face the
same question, and the answer is that the tool surface is where the dial is visible.

### 2026-08-22 - external reconcile, [[2026-08-22-5]]

Gained `node--transport-selection` against
`modelcontextprotocol/typescript-sdk` @ `3924de9` (2.0.0-alpha line) — second
stack; the single-stack debt is cleared. Hint held and was strengthened: the
dual-era tree makes the technique's claims visible as a literal diff.

## Open leads

- **The seam with `prompt-assembly/context-reachability`**, landed the same run: granting
  a tool changes what context is worth injecting. Two subjects, one boundary, opposite
  sides. Worth one deliberate read before either is deepened.
- **The orchestration/agency dial is under-covered corpus-wide.** Two of three picks this
  run were about it. That is a `/deepen` target on its own rather than something to wait
  for a source to raise.

From the reconcile (convergence rule applies):

- The transport decides what silence means: same timeout, capability signal on
  one transport, availability signal on the other — the decision table needs
  the row.
- Per-request self-description is an HTTP obligation, not universal —
  parenthood guarantees one peer whose era cannot change.
- Era/version lists as physically separate artifacts, never one list filtered
  at use.
- A probe should run on a disposable sibling, so a server that dies on an
  unrecognized request is classified, not lost.
- Documented opt-in security (deprecate the in-transport check, ship a pure
  helper, tell the consumer to mount it) — proposed by the worker as a
  possible LAW-layer theme (safe defaults vs composable defaults); needs more
  sightings before a law is even drafted.

## Cross-subject proposals

- Strong uncovered evidence for node--client-integration (auth seams, response
  cache, a shipped v1→v2 codemod) — banked for a future wave.
- createMcpHandler + listenRouter + serverEventBus → a node counterpart for
  server-composition.

## Standing debt

- **Never swept by `/librarian`.**

## Declines

None.

## Applied to the technique layer

- 2026-08-22-8: **checks on unless deliberately removed** (opt-in-guard family) applied to `transport-selection` ([[2026-08-22-8]]).
- 2026-08-22-10: `transport-selection` now cites the promoted `absent-guard-is-loud` law ([[2026-08-22-10]]).
