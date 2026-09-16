---
layer: application
type: application
subject: invariant-placement
technique: indistinguishable-members-do-not-rise
stack: node
status: forged
verified_on: 2026-09-16
verified_against: node@22
applied: experiment
ab_verdict: better
---

# Indistinguishable members, in a dev server and test runner monorepo

Verified against `modernweb-dev/web` at commit
`f72d33e18959ceec2f7cb5bf1216233e39829c2e` (2026-09-14). The version witnesses
are in the tree rather than inferred: the root `package.json` declares
`engines.node` as `>=22.0.0` and pins the checker at `typescript: "~5.9.3"`;
`packages/dev-server-core` is at `1.0.1`, `packages/test-runner-core` at
`1.0.0`. Every anchor below was machine-checked against the clone with
`scripts/check-anchors.mjs` on the date above.

This tree carries the technique's failure **twice, in both of its shapes**, in
two unrelated subsystems written by the same project. Neither instance is
reachable by any test the repository has, and one of them is alive only because
a second defect downstream undoes it. That is why this application exists: the
repository is a careful, mature one, and carefulness is not the variable.

## Instance 1: a positional contract, transposed, with a compensating consumer

The plugin-facing resolver contract declares its pair one way round, and the
function supplied as that contract declares them the other way round. Parameter
names are not part of structural compatibility, so the assignment is accepted.

- the contract, whose third and fourth members are `line` then `column` — `packages/dev-server-core/src/plugins/transformModuleImportsPlugin.ts:14-19` "export type ResolveImport = ("
- the implementation, whose third and fourth are `column` then `line` — `packages/dev-server-core/src/plugins/transformModuleImportsPlugin.ts:209` "async function resolveImport(source: string, code: string, column: number, line: number) {"
- where one is assigned to the other — `packages/dev-server-core/src/plugins/transformModuleImportsPlugin.ts:254` "return transformImports(jsCode, filePath, transformImport);"

Both sets of call sites are internally consistent with whichever declaration
their author read, which is what makes this survive review. The helper that
receives a `ResolveImport` passes the pair per the **type**; the local caller
passes it per the **implementation**.

- per the type — `packages/dev-server-core/src/plugins/transformModuleImportsPlugin.ts:104` "(await resolveImport(importSpecifier, code, line, column)) ?? importSpecifier;"
- per the implementation — `packages/dev-server-core/src/plugins/transformModuleImportsPlugin.ts:229` "let resolvedImport = (await resolveImport(source, code, column, line)) ?? source;"

So on the static-import path the implementation's `column` holds the real line
and its `line` holds the real column, and it hands that to every plugin:

- `packages/dev-server-core/src/plugins/transformModuleImportsPlugin.ts:211` "const resolved = await plugin.resolveImport?.({ source, context, code, column, line });"

**The public hook is name-checked, and therefore documents the wrong thing.**
The same pair is declared again as an object, with `column?: number;` and
`line?: number;` members, where names *are* checked:

- `packages/dev-server-core/src/plugins/Plugin.ts:39-46` "resolveImport?(args: {"

One codebase, one pair of values, modelled twice: positionally on the inside
where the checker cannot see the distinction, and nominally at the plugin
boundary where it can. The transposition is in the half that is unchecked.

### Why nothing has ever failed

The one in-tree consumer that reads those fields transposes them back, against a
constructor that declares the opposite order.

- the adapter destructures the hook's arguments — `packages/dev-server-rollup/src/rollupAdapter.ts:149` "async resolveImport({ source, context, code, column, line, resolveOptions }) {"
- and throws them swapped — `packages/dev-server-rollup/src/rollupAdapter.ts:256` "throw new PluginSyntaxError(errorMessage, filePath, code, column, line);"
- into a constructor taking `line` fourth and `column` fifth — `packages/dev-server-core/src/logger/PluginSyntaxError.ts:6-7` "public line: number,"

The two transpositions cancel, so the rendered error carries the correct line
and column and always has. This is the technique's **compensating pair** in the
wild: the defect is real, fully expressed in the declaration, and load-bearing.
Repairing either end alone would start reporting positions off by a line.

The suite cannot see it. The only assertion on these fields is correct, because
it exercises the **lexer** error path, whose error is constructed inline with
the positions computed in place and never passes through the transposed
function at all.

- the assertion — `packages/dev-server-core/test/plugins/transformModuleImportsPlugin.test.ts:261-262` "assert.equal(error.column, 16);"
- the path it covers — `packages/dev-server-core/src/plugins/transformModuleImportsPlugin.ts:121` "throw new PluginSyntaxError("

A test on the right fields, on the wrong path, passing for the right reason.

## Instance 2: a value table asserted into a set it is not in

A closed set is declared, and the table below it produces two values that set
does not contain, each individually asserted into it. The per-member assertion
is what suppresses the check.

- the declared set — `packages/test-runner-core/src/test-session/TestSessionStatus.ts:1` "export type TestSessionStatus = 'SCHEDULED' | 'INITIALIZING' | 'STARTED' | 'FINISHED';"
- a member outside it — `packages/test-runner-core/src/test-session/TestSessionStatus.ts:11` "TEST_STARTED: 'TEST_STARTED' as TestSessionStatus,"
- and another — `packages/test-runner-core/src/test-session/TestSessionStatus.ts:14` "TEST_FINISHED: 'TEST_FINISHED' as TestSessionStatus,"

`'STARTED'` is in the declared set and is produced nowhere in the repository.
`'TEST_STARTED'` is produced throughout it:

- `packages/test-runner-core/src/runner/TestScheduler.ts:35` "if (session.status === SESSION_STATUS.TEST_STARTED) {"
- `packages/test-runner-core/src/server/plugins/api/testRunnerApiPlugin.ts:173` "this.sessions.updateStatus(session, SESSION_STATUS.TEST_STARTED);"
- `packages/test-runner/src/reporter/getTestProgress.ts:72` "SESSION_STATUS.TEST_STARTED,"

**The encoding has inverted, and that is measurable.** Against the checker at
the version this repo pins (5.9.3) and again at 6.0.3:

| Comparison | Runtime truth | Checker |
| --- | --- | --- |
| `status === 'TEST_STARTED'` | the value the table really produces | **refused**, TS2367 `no overlap` |
| `status === 'STARTED'` | never produced, dead forever | accepted |

The declared type rejects the only correct literal comparison and admits the one
that can never be true. Replacing the assertions with `as const satisfies
Record<string, TestSessionStatus>` reports `TS2322` naming `TEST_STARTED`
immediately, which is the negative artifact this table never had.

## The A/B, and what it ran on

The mechanism was measured rather than asserted, on a standalone probe against
two checker majors (5.9.3, as pinned here, and 6.0.3):

- **Arm A, members sharing a type.** A function declared `(source, code, column,
  line)` assigned to a contract declaring `(source, code, line, column)`: **no
  error**. The shape enforces nothing about the order.
- **Arm B, members made distinguishable.** The same transposition with the two
  numbers carrying distinct nominal brands: **TS2322**, and the compiler names
  the swap itself, reporting that the types of parameters `column` and `line`
  are incompatible.

One variable, two arms, the diagnosis printed by the instrument in arm B and
absent in arm A. `better`, for the narrow claim the technique makes: the
distinction is enforced exactly when the checker can see it.

## What this tree could not have been built to prove

The repository documents the plugin hook's `line` and `column` by name, and its
one consumer of those names compensates for them being wrong. Nobody designed
that. It fell out of two independently reasonable local decisions — a positional
internal helper, and an adapter written against observed behaviour — and it is
better evidence for the technique than a deliberately broken example would be:
the pair of errors is now the contract, and the honest future consumer, the one
that trusts the declared names, is the one that will look wrong.

## What the realization cannot do

This application reports a **latent** hazard in both instances and no live wrong
output. The rendered positions are correct today, and every status comparison in
the tree goes through the table's own members, so a reader deciding whether to
copy this should not expect a visible bug to point at. That is the technique's
claim rather than a weakness of it: the class is defined by being unobservable,
and the evidence for it is that the checker's refusal changes while the
behaviour does not.
