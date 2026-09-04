---
layer: application
type: application
subject: concurrency-guards
technique: race-catalog-with-two-histories
stack: node
verified_on: 2026-09-04
verified_against: node@22.19.0
---

# A 30-row race catalog in an agent harness (Node/TypeScript)

How `earendil-works/pi` realizes race-catalog-with-two-histories. Citations are
against commit `92d8e2d1` (2026-09-04), monorepo version `0.0.3`; the stack
witness is the repository's `engines` field (`package.json:63-65`,
`node >=22.19.0`), corroborated by every CI workflow pinning Node 22.

The catalog lives in `packages/agent/docs/harness.md` §9.2, inside a
27,820-word normative specification, immediately after the 38 invariants (§9.1)
and immediately before the test tiers (§9.3) — a placement that is itself the
argument, since the rows are what the tiers consume.

## 1. The two-history rule is stated as a rule, not observed as a pattern

§9.2 opens: *"Each durable mutation race has exactly two durable histories."*
The count is asserted before the table rather than emerging from it, and the
table's ~30 rows all conform. Representative rows, quoted:

| Race | Orders |
|---|---|
| `requestAbort` vs response settlement | marker first → normalized `aborted`; terminal commit first → completed record and later abort mismatches |
| `abort` vs started tool outcome staging | abort first → real result stages under cancelled control; outcome first → finalized result is preserved and later materializes |
| watcher registration vs state publication | watcher first → old snapshot plus the complete buffered event batch; publication first → new snapshot without that batch |
| later tool B settles vs earlier tool A | B stages outcome-ready immediately; tree placement waits for A |
| `close` vs settlement | settlement abandoned, state stays `effect_pending`; or it committed before the flag was set |

Note the shape the technique predicts: each row's two outcomes are *both
correct*, and the row exists to say which observable follows from which
commit order — not to name a bug.

## 2. The rows are normative by declaration, and the declaration is explicit

The specification does not leave the table's status to inference. §0.7 states:
*"Declarative rules, transition/race tables, invariants, and traces explicitly
called normative are normative; examples and sections marked informative are
not. This clarifies the old shorthand: **tables that tests consume are part of
the contract**."*

That sentence is the practice's whole load-bearing claim, written by the tree
rather than argued at it.

## 3. Both orders are constructed, and the mechanism is commit gating

§9.2 closes with the obligation: *"Test every listed order with test-only commit
gating and controlled hooks, providers, tools, and timers."* Gating the commit
primitive — rather than sleeping, or racing real timers — is what makes each
row's second order constructible on demand instead of occasionally.

Tier A (§9.3) then requires, for each of the 13 durable operation-state leaves:
construct it durably, close, reopen, drive, and assert the next transition. And
it adds a discipline that only a catalog makes checkable: *"For each recovery
prefix: close, reopen, drive, and compare against uninterrupted recovery —
invoking recovery twice from the initial prefix is **not** sufficient."* A
suite without an enumerated set of prefixes has no way to know it is doing the
weaker thing.

## 4. The strongest form is present: write-order assertion, with a named catch list

Tier B is the technique's "assert order, not end state" in its shipped form — an
instrumented decorator wrapping `Storage.commit()` that records every
transaction's writes in order and asserts them against the specification's own
transaction tables. What it catches is enumerated (§9.3), and the list is the
evidence that end-state assertions would not have sufficed:

> effects before intent; missing awaits of latest update delivery or checkpoint
> write before `after_tool`; per-frame storage awaits in the provider loop;
> frame appends out of provider-event order or persisted for `done`/`error`;
> settlements missing their frame-list delete; `tool_end` before rather than
> after staging; missing response/usage settlement; checkpoint or frame writes
> after their child state settled; outcomes not staged before replay becomes
> impossible; out-of-order tree placement; late result-id reservation; memos or
> staged/checkpoint/frame values leaked by outcome/terminal cleanup.

Every one of those leaves a correct final state. That is why the assertion is on
the sequence.

## 5. The structural fact: the catalog and the invariants police each other

The tree pairs the catalog with invariant 23 — *"The §4.2 `Gate.admit()` catalog
is complete. Every listed hook/provider/tool/timer integration calls
`admit(() => operation())` after preparation; **no unlisted code calls it**."*
An enumeration that forbids unlisted members is falsifiable by a grep, which is
what separates it from a list of examples. §4.2 states the same closure from the
other side: *"No other code calls `Gate.admit`"*, followed by an explicit list of
what it does **not** wrap.

Nobody designed that as a cross-check; it falls out of writing both the
enumeration and its complement. It is the cheapest available defence against the
failure mode the technique names — a catalog that silently stops describing the
system.

## 6. What this realization cannot do

- **It does not make the races rare, and does not claim to.** The catalog is
  large because the design is deliberately concurrent — lanes, joiners,
  watchers, abort markers. A system that wanted fewer rows would need fewer
  entitled callers, not a better table.
- **The specification says its conformance matrix is not a coverage claim.**
  §0.9: *"Part 9 states the required conformance matrix; it is not a claim that
  every listed row already has one dedicated test."* So the catalog here is a
  requirement that is met in some unstated fraction — which is the honest
  version, and the reason to read §0.9 before treating the table as evidence.
- **One window is outside the model entirely.** A death during the provider
  stream leaves a request that "may have been billed and may or may not have
  produced output" (§0.4). That is not a two-history race; it is a genuinely
  unknown outcome, and the tree files it under non-goals rather than adding a
  third column to a row.
