---
source: github:modernweb-dev/web@f72d33e1
kind: vendor-repository
url: https://github.com/modernweb-dev/web
title: "Guides, tools and libraries for modern web development"
author: modern-web (org)
words: 609 landing page / 85217 in-tree markdown (38207 under docs/)
extracted: 15 (6 design + 7 claim; +2 on 2026-09-25)
accepted: 2
declined: 0
leads: 4
already_covered: 2
untriaged: 5
applied: 3
shipped: 1
dispatched: 0
run_id: mwd-web-0916
siblings: 4
rescan_when: "`resolveImport`'s positional/nominal split is repaired at either end (a PR touching `transformModuleImportsPlugin.ts:209` or `rollupAdapter.ts:256`), or `TestSessionStatus`'s union is reconciled with its table; or 10 weeks elapse (2026-11-25)"
---

# modernweb-dev/web — the contract the checker could not see

/ Class: **vendor repository** (a monorepo of 38 published packages over a dev
server and a test runner). Expected yield, said before the triage table: its
docs' rules pages and its client types, with the README explicitly its least
reliable surface. That held exactly.

**The ingest returned 609 words.** The tree holds **85,217** words of in-tree
markdown, 38,207 of it under `docs/`, across 2,135 files. The landing page is
0.7% of the source, and Phase 2b is the whole reason this run found anything:
every finding below comes from a `.ts` file or an `architecture.md`, and none of
it from the README.

Swept at commit `f72d33e18959ceec2f7cb5bf1216233e39829c2e` (2026-09-14), in the
method's order: the operating documents (`packages/test-runner-core/architecture.md`,
`docs/docs/dev-server/writing-plugins/hooks.md`, `docs/docs/test-runner/commands.md`,
`docs/guides/going-buildless/`), the instrument
(`transformModuleImportsPlugin.ts`, the hook arbitration loops), the measurement
(the per-package CHANGELOGs, 6,287 words in `test-runner` alone), the types
(`TestRunnerCoreConfig.ts`, `TestSessionStatus.ts`, `Plugin.ts`), the tests, and
the README last.

**Board.** 4 live siblings at Phase 0, holding `marketing/local-and-zero-budget`,
`media-generation/visual-generation/generative-provider-routing`, four
`software-engineering/llm-agent` subjects, and — directly relevant —
`engineering-process/build-and-release/test-harness`, held by `intake-executor-0916`.
That last one is why design entry D4 below is untriaged rather than landed: the
obvious home for a test-runner session model was occupied. 11 sibling commits
landed during this run.

**Gate at Phase 1 was red and not mine.** `check-bundles` exited 1 with 12
errors, all in `media-generation/production-ops/live-system-demo-film` (a live
harvest sibling's half-written subject), and `build-index --check` reported
`marketing` and `media-generation` stale — both held by live siblings. My target
bundle parsed clean, so the run continued and named the breakage instead of
fixing it. It was green again by Phase 7, from their commits.

Also worth recording because it nearly produced a false reading: both gate
invocations were first run piped into `tail`, so the `$?` read was `tail`'s and
both printed `exit: 0` over a red gate. Re-run unpiped for the real codes.

---

## Design record (Phase 2d)

Grouped by system, because this tree holds two and the routing count is per
system.

### System: dev server (`@web/dev-server-core` and its plugin surface)

**D1 — arbitration follows the cardinality of the answer.**
- *decision*: `resolveImport` is first-plugin-wins and short-circuits;
  `transformImport` folds over every plugin and runs on the already-resolved
  specifier.
- *forces*: a module specifier has exactly one correct target URL, so a second
  opinion is a conflict rather than a contribution; the specifier's *text* can
  carry several orthogonal rewrites that genuinely compose.
- *buys*: a resolution conflict surfaces as plugin order instead of as a
  last-writer-wins mystery, and composition is offered only where it means
  something.
- *rejects*: one uniform arbitration for both hooks.
- *where*: `transformModuleImportsPlugin.ts:209-227` returns on the first plugin
  that answers; `:228-252` folds. Stated in
  `docs/docs/dev-server/writing-plugins/hooks.md:155` "When a one plugin returns
  a resolved, further resolve hooks are not called" against `:183` "this hook is
  always called for all plugins".
- *stage*: module-graph rewriting, per import specifier.
- *corpus*: **NONE.** Nearest is
  `llm-agent/runtime-and-io/agent-runtime-assembly/observer-and-mutator-surfaces`,
  which splits on whether a return value is read *at all* — one level short of
  splitting arbitration among readers that are all obeyed. HOME IF NEW: no clean
  one. That subject governs agent runtimes, and a dev-server plugin rule filed
  there would be misfiled. See the untriaged table.

**D2 — one pair of values, modelled positionally inside and nominally at the boundary.**
- *decision*: the internal resolver contract carries `line`/`column`
  positionally; the public plugin hook carries the same pair as a named object.
- *forces*: the plugin boundary is public and has to be self-describing; the
  internal call path was written positionally.
- *buys*: **nothing, and that is the finding.** The positional half is
  transposed against its own declared type, and the one consumer that reads the
  pair transposes it back.
- *rejects*: one named shape throughout.
- *where*: 18 anchors, all machine-verified — see the application.
- *stage*: the plugin-facing resolver contract.
- *corpus*: `engineering-process/standards-and-gates/invariant-placement` models
  four altitudes and prices five costs of the top two; **NONE** models the
  precondition that a shape enforces only *type-distinguishable* members, and
  none models the compensating pair. HOME IF NEW: `invariant-placement`.
  **→ LANDED.**

**D3 — the MIME type is a hook, not a function of the file extension.**
- *decision*: `resolveMimeType` is a first-class plugin hook.
- *forces*: browsers dispatch on the content-type header, not on the path; a
  transform changes a file's language without changing its extension.
- *buys*: a transform chain can change a file's language mid-flight and the
  browser still interprets it correctly.
- *rejects*: extension-driven content typing.
- *where*: `docs/docs/dev-server/writing-plugins/hooks.md:66-70` "Browsers don't
  use file extensions to know how to interpret files."
- *stage*: response header assembly.
- *corpus*: unverified. Nearest by map is
  `integration/embedded-surfaces/embedded-preview` (`dev-server-registry`), which
  I did not open. Untriaged, not a catch.

### System: test runner (`@web/test-runner-core` and its launchers)

**D4 — the unit of work is (browser x test file), immutable, inside a mutable manager.**
- *forces*: the same file can pass in one engine and fail in another, so a
  file-level result cannot represent the run; reporters must observe transitions
  without owning them.
- *buys*: per-engine result granularity and a single event stream for every
  reporter.
- *rejects*: test-file-as-unit with per-browser sub-results.
- *where*: `packages/test-runner-core/architecture.md:158` "The manager is
  mutable, but test sessions are immutable."; `:177`.
- *corpus*: `engineering-process/build-and-release/test-harness` (19t) is the
  home, and a live sibling held it for this whole run. Untriaged, **contended
  (V5)** rather than declined.

**D5 — the core ships no launcher and no framework; the protocol lives in the served page.**
- *forces*: six automation backends with incompatible APIs; a launcher that also
  owned the reporting protocol would need reimplementing per backend.
- *buys*: a new backend is a thin adapter, and the reporting path is identical
  across all six.
- *rejects*: a per-backend test protocol.
- *where*: `architecture.md:215` "The core projects doesn't implement any default
  browser launcher."; `:107` for the websocket.
- *corpus*: `llm-agent/runtime-and-io/agent-browser-control` (`socket-scoped-surface`,
  `persistent-browser-daemon`) is close but governs agent-driven browsers rather
  than test harnesses. I did not open it, so this is untriaged, not a catch.

**D6 — a partial capability matrix, published per capability.**
- *decision*: privileged operations the browser sandbox forbids are exposed to
  in-page test code as awaited RPC, and the support matrix is published per
  capability rather than reduced to a lowest common denominator.
- *forces*: `setViewport` needs CDP or the playwright API; no launcher implements
  everything; an LCD surface would delete the reason to use the strong backends.
- *buys*: a test can use a strong capability and fail loudly on a backend that
  lacks it instead of silently no-oping.
- *where*: `docs/docs/test-runner/commands.md:23` (3 of 6 launchers), `:104`
  (`sendMouse` on a *different* three — puppeteer, playwright, webdriver, and not
  chrome), `:417` (2 launchers), `:628` "Taking screenshots is not supported for
  browser type".
- *corpus*: **ALREADY COVERED, and the corpus says it better.**
  `llm-agent/runtime-and-io/agent-cli-transport/dated-capability-matrix` holds
  capabilities as *data with a date and a witness per cell*; this source's matrix
  is undated prose in a guide, which is the weaker form of the same idea. Catch.

### Routing count

Both clauses computed before deciding, per v2.2:

- **Per system**: dev server carries 2 `corpus: NONE` (D1, D2); test runner
  carries 0 confirmed NONE (D4 and D5 are untriaged-unopened, D6 is a catch).
  Neither system reaches three.
- **`HOME IF NEW` cluster**: exactly one entry names a home (D2 →
  `invariant-placement`). Not three sharing one.

**Routing count = 2. No forge handoff** — the "one or two stay here" branch, and
D2 landed as a technique rather than an amendment because it is a mechanism the
subject lacks, not a boundary case of one it owns.

---

## Triage table (Phase 5)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Indistinguishable members do not rise | se/…/invariant-placement | new-technique | real gap | 3/0/2 | **accept** |
| 2 | K | technique | M | Arbitration follows the answer's cardinality | se/…/agent-runtime-assembly | new-technique | real gap | 2/1/2 | untriaged (+1, below threshold; no clean home) |
| 3 | K | amendment | S | Per-capability support matrix | se/…/agent-cli-transport | none | likely catch | — | catch |
| 4 | K | design | M | MIME as a hook, not an extension | se/…/embedded-preview | none | partial | — | untriaged |
| 5 | K | design | M | Session = browser x file, immutable | se/…/test-harness | none | partial | — | ~~untriaged (V5 contended)~~ **covered** — landed 2026-09-17 by harvest `3-026` (`350e40d7`); see the 2026-09-25 pass |
| 6 | K | design | M | Thin launcher, protocol in the page | se/…/agent-browser-control | none | partial | — | untriaged |
| 7 | K | technique | M | Bare specifiers resolved server-side | se/…/dependency-declaration | none | likely catch | — | untriaged |
| 8 | K | practice | S | The CommonJS interop escalation ladder | — | none | partial | — | untriaged |
| 9 | — | currency | S | Node 22 / ES2024 floor, packages at 1.0.x | — | resets-clock | dated fact | — | recorded below |

`auto=1/1/0`, `fp=0`. Row 1 ran under the Phase 5 score; row 9 ran under the
corroboration table (a source may authorize a currency signal alone), which is
the v2.8 split.

**Promoting question executed on row 2** (the only `partial` row that could have
been promoted): *does any corpus subject model arbitration among hook readers
that are all obeyed, rather than whether a return is read at all?* Answered by
opening `observer-and-mutator-surfaces` and `host-routes-win`. Answer: no — but
the absence is a hole with **no clean home**, because the only subject in the
neighbourhood governs agent runtimes. A new subject would be an `XL`/E4
escalation on one repository's evidence, which the routing count does not
support. Banked with anchors so a second independent source can converge on it.

**Row 1's promotion read**: the `+1` for resting on an unre-checked report was
removed by opening `invariant-placement.md` and
`techniques/constraint-deletion-is-silent.md` in full. RISK 0.

---

## What landed

**Technique** `invariant-placement/techniques/indistinguishable-members-do-not-rise.md`,
plus a bounding clause on the golden path's **Shape** altitude. The subject's
promise — "the illegal combination has no expression… nothing is checked because
there is nothing to check" — is conditional on a precondition it never stated:
the checker refuses only the distinctions it can *see*. A rule separating two
members of the same type is not enforced at that altitude at all.

It is a technique and not an amendment because it carries a mechanism the
subject lacks: a diagnostic (try to write the refusal; if no program expresses
the violation you are at the shape altitude, and if it compiles you never were),
two failure shapes, the compensating-pair rule, and a repair whose
one-directional assignability makes it incrementally adoptable.

It **refutes a standing assertion** in the golden path, which is where its `+1`
came from.

**Applications**, both with every anchor machine-verified by
`scripts/check-anchors.mjs`:

- `node--indistinguishable-members-do-not-rise.md` — the source tree, **anchors=18 held=18**.
- `next--indistinguishable-members-do-not-rise.md` — the fleet seam, **anchors=11 held=11**.

Total **anchors=29 held=29**. The first pass of the source-tree application
scored `held=0 unquoted=6 missing-file=4`, because the anchors sat above fenced
code blocks and the grammar requires the quote on the same line. Worth knowing
before writing, not after.

---

## The source witnesses the finding twice

Both instances are in the application; the short form:

1. **A transposed positional contract with a compensating consumer.** The type
   declares `(source, code, line, column)`; the implementation assigned to it
   declares `(source, code, column, line)`. Parameter names are not part of
   structural compatibility, so it compiles. Every plugin therefore receives the
   pair transposed — and the one in-tree consumer that reads it swaps them back
   at the throw site, against a constructor whose own order is the opposite. The
   errors cancel, the rendered position has always been right, and the pair of
   defects is now load-bearing: repairing either end alone starts reporting
   positions off by a line. The only test asserting these fields covers the
   *lexer* path, which never touches the transposed function.

2. **A value table asserted into a set it is not in.** The union declares
   `'STARTED' | 'FINISHED'`; the table produces `'TEST_STARTED'` and
   `'TEST_FINISHED'`, each cast into the union member by member. The encoding
   inverts: comparing against the value the table really produces is **refused**
   (TS2367), and comparing against the value the declaration permits and nothing
   produces is **accepted** and dead forever. Confirmed on the checker this repo
   pins (5.9.3) and on 6.0.3.

This is the "a source that implements a good idea badly is worth more than one
that implements it well" case, at full strength. Both halves of the corpus rule
came from the *wrong* implementation, and instance 1's compensating pair is a
shape no deliberately-broken example would have produced.

---

## Fleet apply and ship (Phase 7.5 / 8)

**Seam**: `ascent` (public). An org is addressed two ways and the tenant boundary
depends on telling them apart: the slug is what a request carries and what authz
checks, the id is what every tenant-scoped read is ANDed with. Both were
`string`. The gate **states the invariant in a comment** and then returns both at
once as `{ org, orgId }` — 40 functions took `orgId: string`, 181 took
`orgSlug: string`, one resolver between them, no brand on either.

The registry map was **not** the route to this seam: `kp` and `ascent` both
matched `invariant-placement` on the word "member", an org-member/shape-member
coincidence. The grep route found it.

**Seam chosen to falsify.** A caught outcome — the existing suite noticing a
transposed tenant identifier — would have narrowed the technique to pairs whose
confusion is behaviourally silent, and this pair is carried and matched on rather
than computed with. It was not caught:

| | Arm A (`21b2bebe`) | Arm B (branded) |
|---|---|---|
| no injection | tsc 0 errors | tsc 0 errors ← floor |
| slug passed where the tenant id belongs | tsc **0 errors**, 70/70 tests green | **TS2345** naming the boundary |

Target: is the confusion refused? 0 → 1. Floor: the project's own outcome must
not move — full suite green under B at **970 files / 12,599 tests, 2 pre-existing
skips**. Both held. Verdict **better**, mode `code`, proof `ab-paired`.

**Cost of raising the altitude across 221 surfaces: 4 typecheck errors and 2
one-line edits**, because a branded string is assignable *to* `string` and not
from it, so branding the door's output broke no caller. Nine files, 134
insertions.

**Shipped**: `ascent` `d37c8288` on branch `intake/org-id-brand`. A branch rather
than the active branch because ascent's active branch belongs to an unrelated
ADR and its checkout carried foreign WIP; the change was built in a worktree at a
short path with `node_modules` junctioned, gate run there, worktree removed,
branch kept. Not pushed.

### A second finding, from the seam and not the source

`ascent`'s `tsconfig.json` excludes every `*.test.ts` from the typecheck. The
negative artifact was written as `ids.test.ts` first and **stayed green with both
brands deleted** — it was on no rung at all and was certifying its own
exclusion. Renamed out of the test glob, deleting either brand now fails the
typecheck with `TS2578`. Seen red at birth, then restored.

That is a general fact about that tree for any future type-level guarantee in it,
and it is recorded in the technique's *when not to use it* section as the
instrument hazard for this whole class. Per v2.8.1 the seam hunt is a second
source, and this is the round where it paid.

---

## Already covered (1)

- **The per-capability support matrix (D6).**
  `llm-agent/runtime-and-io/agent-cli-transport/dated-capability-matrix` holds
  the same idea in its stronger form: capabilities as data, one date and one
  witness per cell. This source publishes the matrix as undated prose in a guide,
  which is the version that rots. Nothing to land; the catch is worth recording
  because a future run over any multi-backend tool will map here again.
- **Session = (browser x file), immutable, mutable manager (D4)** — moved here
  from the untriaged table on 2026-09-25. Harvest wave 7 landed it the day after
  this note as backlog `3-026` (`350e40d7`), inside
  `test-harness/techniques/configuration-axes-cross-the-ladder.md`, and the
  writer half is owned by `client-state/techniques/async-race-guards.md`. See
  the 2026-09-25 pass below.

## Untriaged (5) — nobody verified these

Anchors kept so a later run does not re-derive them. No judgment implied.

1. **Arbitration follows the answer's cardinality** (D1). Real gap, no clean
   home; scored 2/1/2. Anchors: `transformModuleImportsPlugin.ts:209-227` and
   `:228-252`; `hooks.md:155` and `:183`. The convergence candidate: any second
   source with a plugin surface that distinguishes single-answer resolution from
   compositional transformation.
2. **MIME as a hook, not an extension** (D3). `hooks.md:66-70`.
3. ~~**Session = (browser x file), immutable, mutable manager** (D4).
   `architecture.md:158`, `:177`. Home contended all run by a live sibling.~~
   Covered, 2026-09-25 - see "Already covered".
4. **Thin launcher, protocol in the served page** (D5). `architecture.md:215`,
   `:107`.
5. **Bare specifiers resolved server-side.** The `--node-resolve` flag rewrites
   bare module specifiers before they reach the browser;
   `docs/guides/going-buildless/es-modules.md:76`. Nearest prior art
   `engineering-process/codebase-stewardship/dependency-declaration`
   (`logical-name-or-address`, `progressive-resolution`), not opened.
6. **The CommonJS interop escalation ladder.** Six strategies in an explicit
   preference order — find an ESM distribution, ask the author for one, find a
   fork, write a UMD wrapper, use a CDN that converts, transform at serve time —
   `docs/guides/going-buildless/es-modules.md:121-233`. Reads like a practice
   for "the ecosystem has a gap and you must ship anyway", and the *ordering* is
   the content. No home looked for.

## Leads (3)

1. **A slug map collision is a real hazard in this registry's own instrument.**
   `research-map` ranked `integration/acquisition-and-ingest/import-normalization`
   for "module specifier resolution rewriting"; that subject is about
   **foreign-format data import** (users' workflow exports), not JavaScript module
   imports. The slugs collide completely. *Return condition*: when a second run
   is mis-homed by a slug that means two things, propose a disambiguation note in
   the map's output rather than in the subject.
2. **The capability matrix is published capability-major; the corpus publishes it
   tool-major.** Rows-as-capability answers "which backends can I use if I need
   this"; rows-as-tool answers "what can this backend do". Both are real reads.
   *Return condition*: when a third multi-backend source appears, check whether
   the orientation is load-bearing or presentational.
3. **`TestRunnerCoreConfig` carries three separate timeouts** —
   `browserStartTimeout`, `testsStartTimeout`, `testsFinishTimeout` — one per
   lifecycle hop rather than one per operation.
   `packages/test-runner-core/src/config/TestRunnerCoreConfig.ts`. *Return
   condition*: when a fleet project grows a multi-hop startup whose single
   timeout cannot say which hop failed.
4. **The manager's queries are live views, not snapshots** (2026-09-25).
   Immutable records do not give a consistent read of the set. *Return
   condition*: when a tree holds a reader that iterates a live view of a mutable
   run collection across a suspension point.

## Currency (dated facts, 2026-09-14)

The `1.0.0` line dropped Node 18 and 20 and compiles to ES2024; `engines.node` is
`>=22.0.0` across the monorepo; `dev-server-core` is at `1.0.1`,
`test-runner-core` at `1.0.0`; the checker is pinned at `~5.9.3`. No corpus
application cites this project, so there is no `verified_on` to move — recorded
here as the witness the two applications' `verified_against` rests on.

## Direction pass (Phase 7.6)

Run against the instrument rather than asserted: `build-fleet-map.mjs --check`
was **stale**, so the map was regenerated and read.
`software-engineering/invariant-placement` is present in 3 projects (1 context
each, all state `unknown`) and classified a **candidate** absence in 10:
gravity, goat, tracklight, politicas, personas, pof, personas-web,
systedo-case, gravitone, athena-everywhere.

**Zero proposals written, and the reason is the lane rather than the forces.** A
direction is a new context or a capability a project's `scope.does` does not
name. This technique governs a decision made *inside* contexts these projects
already have - any contract carrying a pair of same-typed values - so raising
the altitude there is **coverage**, which ships on the recommendation, not a
direction, which waits for an owner's ledger row. Ten candidate absences is
therefore not ten directions owed; it is the map correctly reporting that the
subject governs ground most of the fleet stands on.

*Directions not proposed*: all ten, for the reason above. The one to revisit is
`personas-web`, where a public boundary consumed by code the authors do not
control is the closest match to D2's actual forces; that is a coverage question
for whoever opens its contracts next, and it is recorded here rather than as a
proposal.

`librarian/fleet-map.json` was regenerated and is **left uncommitted** for the
same reason as `catalog.json`: it references the sibling's untracked
`agent-operations` bundle 17 times.

## Housekeeping

`catalog.json` was regenerated under the `index` lock and is **deliberately left
uncommitted**: it had acquired a whole `agent-operations` bundle entry (8
subjects, 25 techniques, 49 files) whose directory is untracked — a live
sibling's unpublished work. Committing it would have baked their WIP into a hash
in `HEAD` under this run's name. `knowledge/software-engineering/index.json` *is*
committed, because that bundle carried no foreign WIP and the only slug the diff
adds is this run's. `knowledge/agent-operations/index.json`, which the
regeneration created, is left for its owner.

Scratch (`C:/t/mwd-web-0916`, the clone) deleted by run id at Phase 9.

## 2026-09-25 pass — D4 (run `in-mwd-d4-0925`)

The operator picked D4 from this note's untriaged table. Nothing was live on the
board (0 siblings), so its old V5 contention was gone. Re-cloned at
`43bbf0415f7f9aedfac02c52e363746decdb0ca8` (2026-09-19). Since `f72d33e1` the only
changes are two dependency bumps (`package-lock.json`,
`packages/dev-server-core/package.json`), so `rescan_when` has not fired and every
anchor above still stands.

**D4 had already landed, and this note did not know it.** Harvest wave 7 took it
from the backlog as `3-026` on 2026-09-17 (`350e40d7`) and wrote both halves into
`test-harness/techniques/configuration-axes-cross-the-ladder.md`: the result unit
is the cell (section "Why a file-level result cannot represent a multi-cell
run"), and the paragraph "The per-cell records are the run's evidence and must be
immutable once written, while the collection that holds them is mutable". The
matrix half was measured `better` (personas `2c1df0186`). The immutability half
was marked unmeasurable and re-banked as `w7-session-immutability-arm`, still
`queued`. The note's untriaged table stayed at 6, and that stale table is what
this pass was spent on. Outcome: **already covered**.

**The tree was read for the half the landed paragraph leaves out, the writer, and
the corpus owns that too.** Records really are replaced, never mutated:
`packages/test-runner-core/src/test-session/TestSessionManager.ts:41 "const updatedSession: TestSession = { ...session, status };"`.
But replacement is whole-record and last-writer-wins
(`packages/test-runner-core/src/test-session/TestSessionManager.ts:50 "this.sessionsMap.set(session.id, session);"`),
so an immutable snapshot held across an await turns into a stale write. The
source's guard is a token compare on `(testRun, status)`:
`packages/test-runner-core/src/runner/TestSessionTimeoutHandler.ts:75 "currentSession.testRun !== session.testRun ||"`
and `packages/test-runner-core/src/runner/TestSessionTimeoutHandler.ts:76 "currentSession.status !== session.status"`.
On top of that, a run-level flag defers any re-run that arrives mid-run
(`packages/test-runner-core/src/runner/TestRunner.ts:118 "if (this.running) {"`).
This is `client-state/techniques/async-race-guards.md` "Latest-wins tokens":
capture at dispatch, compare against the slot, stale is inert. Catch, no landing.

One placement is worth recording and is not a defect here. `stopSession` checks
staleness on entry
(`packages/test-runner-core/src/runner/TestScheduler.ts:166 "if (this.timeoutHandler.isStale(session)) {"`),
then awaits the page close
(`packages/test-runner-core/src/runner/TestScheduler.ts:175 "session.browser.stopSession(session.id),"`),
and writes back without re-checking
(`packages/test-runner-core/src/runner/TestScheduler.ts:191 "this.sessions.updateStatus(updatedSession, SESSION_STATUS.FINISHED);"`).
That is the check placed before the await, not after it. I walked the other
writers of one session within one `testRun`. The tests-finished timeout fires only
while status is not `TEST_FINISHED`, the browser-start timeout is itself
`isStale`-guarded, and the `running` flag keeps re-runs out. None of them can land
inside that await, so the window is closed from outside by the run mutex and not
by the token. No bug is claimed.

**Lead 4, added.** The manager's queries are lazy generators over the live `Map`
(`packages/test-runner-core/src/test-session/TestSessionManager.ts:63 "return this.sessionsMap.values();"`),
not snapshots. Immutable records do not give a consistent read of the *set*: a
reader that iterates a view across a suspension sees records from two moments.
Every in-tree consumer materializes synchronously (`Array.from`, a spread, or an
immediate `for...of`; 9 call sites grepped), so it never happens here, and an
unobserved hazard is not a boundary worth an amendment.

**What did land: one boundary amendment, found in a code comment.** The same
walk turned up
`packages/test-runner-core/src/coverage/getTestCoverage.ts:186 "// istanbul mutates the coverage objects, which pollutes coverage in watch mode"`,
repaired by a deep clone at the reader
(`packages/test-runner-core/src/coverage/getTestCoverage.ts:189 "coverages = JSON.parse(JSON.stringify(coverages));"`).
That is a paid-for incident in which a reader **edited history** through a
nested reference inside a record the architecture document calls immutable. It
refutes, as stated, the landed paragraph's claim that the split lets a reporter
observe transitions "without owning the record or being able to edit history".
The paragraph holds only where immutability is enforced. The neighbours own the
general copy rule: `batch-vs-instance-copy-policy` has a clone row for values
"mutated in place by an engine operation", and `network-faithful-mocks` says to
copy on the way out, deeply enough. What they do not own is the boundary on this
paragraph.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 10 | K | amendment | S | Immutable must mean enforced | se/…/test-harness/configuration-axes-cross-the-ladder | corrects-claim | real gap | 2/0/1 | **accept** |
| 11 | K | technique | M | Queries over the mutable collection are live views | se/…/test-harness | none | thin | — | lead (no instance in either tree) |

GAIN 1 (boundary case) +1 (refutes a standing sentence); RISK 0 (the director
opened the tree; the paragraph's sentences stay true under enforcement, so it
is an append). V1-V5 clear: the amendment lands in an existing technique and
places nothing in a category. `auto=1/0/0`, `fp=0`.

**Apply (Phase 7.5): personas, mode `experiment`, verdict `unmeasurable`.** The
backlog row `w7-session-immutability-arm` named "a test-runner summary builder
used by three modes". That is `gatherBundle`, called by the harness run, by
watch-and-gather and by re-gather. The seam was chosen to falsify. It turned out
to hold the *writer-side* form of the same failure, which the amendment now
names as its second instance. The module declares "an immutable bundle",
re-gather overwrites it in place, and the scorecard pins nothing about which
bundle it scored. A replay over the 14 archived bundles (git history, pruned
since) found **0 re-gathered**, 2 carrying scorecards, and summaries agreeing
with bundles on 13 of 13 comparable. So the hazard is structural and its
incidence zero. No change can move the target on this tree, and nothing
shipped (`structural-only` cannot carry a commit). Return condition: the first
re-gather of a bundle that already carries a scorecard. See
`node--configuration-axes-cross-the-ladder.md`.

`w7-session-immutability-arm` stays `queued` in the harvest backlog. This pass
did not touch that ledger. Its recorded home,
`llm-agent/orchestration/fleet-orchestration`, looks wrong now that the
mechanism is split across `test-harness` (reader boundary, landed here) and
`client-state/async-race-guards` (writer tokens), so the harvest run that picks
it up should re-home it before measuring.
