# RESULT - cloud-261006-acb716 - upstream delta microsoft/mcp bc2a3b4..b753319

Method: `docs/upstream-brief.md` over `.claude/skills/intake/SKILL.md` 2.15.0 `--delta`.
Read first: `AGENTS.md`, the brief, the intake method in full, and the prior source note
`librarian/sources/2026-09-03-microsoft-mcp.md` in full.

## Delta

`bc2a3b4e..b7533190 - 1364 files, +55676 / -9290, 34 days (33 since the mine), 194 commits`

The re-scan read `b7533190a98d989469dce9d61b0d4752943bceaa`. `main` had **not** moved
past it when it was fetched (`git rev-parse origin/main` = `b7533190…`).

## The `rescan_when:` that fired, clause by clause

| clause | fired? | evidence |
| --- | --- | --- |
| output-schema migration past its five-command pilot | **no** | 6 production commands of 478 override `ResultTypeInfo` (5 App Configuration + `WorkspaceLogSearchCommand`) |
| a deprecation mechanism appears | **no** | none; #3689 renamed a whole tool area with no alias, and 8 PRs removed parameters as breaking changes |
| curated-mapping integrity assertions promoted out of DEBUG-only | **partly** | #3202 added `ConsolidatedToolMetadataTests` (metadata equality now gates CI in any configuration). Completeness assertions are still `#if DEBUG`. |
| 8 weeks elapse | no | 33 days |

Due on the tier 1 floor, as the dispatch said. One clause half-fired.

## Expected yield vs what landed

- **Predicted, before the triage table:** a high catch rate; 0-1 upper-layer landings;
  2-4 application-layer landings, mostly citation repairs; at least one case of the
  vendor moving to the corpus's position.
- **Landed:** 0 upper-layer (no technique, amendment, or golden-path change). 6
  application-layer: 4 re-pins, 2 of which withdraw a present-tense finding, plus 2 new
  applications. 7 catches. 6 untriaged. 0 declines. 4 leads carried, 1 updated.
- **Deviation:** the vendor moved to the corpus's position **four** times, not once:
  - the fail-open single-mode gate closed (#3466);
  - the uniqueness gate now built from the constructed surface (#3614);
  - required behaviour verdicts (#3614);
  - a filter-backed read-only claim withdrawn (#3202).

  Every reversal in this window was in the corpus's favour, so the delta's product was
  corroboration written into applications rather than new upper-layer content.

## citations_reopened: 167 / 147 / 20

167 checked, 147 re-pinned, 20 withdrawn, plus 8 corrected that were already wrong at the
prior pin. Re-opened line by line by four read-only workers; the director re-checked
each load-bearing withdrawal against the tree.

| application path | checked | re-pinned | withdrawn |
| --- | --- | --- | --- |
| `knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/applications/dotnet--catalog-projection-modes.md` | 49 | 41 | 8 (SDK pin; single-mode fail-open finding; 3 counts) |
| `knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/applications/dotnet--tool-identity-vs-tool-name.md` | 44 | 36 | 8 (SDK pin; id counts; "nothing checks uniqueness / parses the format") |
| `knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/applications/dotnet--sanctioned-session-state.md` | 28 | 27 | 1 (SDK pin) |
| `knowledge/software-engineering/engineering-process/build-and-release/test-harness/applications/dotnet--recorded-interaction-fixtures.md` | 46 | 43 | 3 (SDK pin; 2 counts) |

Two of the 20 withdrawals are findings. The rest are the SDK pin
(`10.0.400` → `10.0.401`, #3751) and counts that grew.

## Landings (every one a path)

1. `knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/applications/dotnet--catalog-projection-modes.md`:
   re-pinned. The fail-open finding is withdrawn as current and kept as history. Added
   #3837, #3749, the #3630 wrong-name answer, the #3202 forced regroup, and the new
   equality test with its three gaps.
2. `knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/applications/dotnet--tool-identity-vs-tool-name.md`:
   re-pinned. "Nothing checks uniqueness" is withdrawn. New section "What the delta did":
   - the #3614 test;
   - six malformed ids grandfathered;
   - a #3689 rename that kept 30/30 ids;
   - #3202 keeping ids across a semantic change, against the tree's own checklist.
3. `knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/applications/dotnet--sanctioned-session-state.md`:
   re-pinned. Three citations that were wrong at the first pin are corrected.
4. `knowledge/software-engineering/engineering-process/build-and-release/test-harness/applications/dotnet--recorded-interaction-fixtures.md`:
   re-pinned. Added #3824 (playback stretches the client's own timeouts).
5. **New** `knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/applications/dotnet--tool-schema-design--microsoft-mcp.md`:
   a second witness (rkb-profile witness segment). It records a publisher correcting its
   behaviour hints four times in a month, with a mechanical scan:
   - 10 read-only and non-idempotent commands at the old pin; 9 at the new one;
   - the two that #3818 fixed were among the 10.
6. **New** `knowledge/software-engineering/engineering-process/standards-and-gates/quality-gates/applications/dotnet--gate-liveness.md`:
   the first dotnet witness. A perf lane is announced as "gated" (#2510), but its gate
   step is removed at template expansion.
7. Source note `librarian/sources/2026-10-06-microsoft-mcp-v2.md`. It carries the delta
   frontmatter and a new `rescan_when:` with a date fallback `(2026-12-01)`.
8. Subject notes appended: `librarian/subjects/software-engineering/{mcp-tools,test-harness,quality-gates}.md`.
9. Run result: `librarian/runs/cloud-261006-acb716/result.json`, written through
   `scripts/lib/run-result.mjs`.
10. Regenerated: `knowledge/software-engineering/index.json`,
    `rules/ai-registry-software-engineering.md` and `catalog.json`. The only content change
    is the application count, 1236 → 1238.

## Declines

**None.** Nothing was ruled out. The six rows below scored under the v2.5 gate's +2
threshold and are **untriaged** (no judgment). Each is banked with anchors in the source
note:

| row | why it did not land |
| --- | --- |
| 7. playback has two clocks: zero the recording's wait, push the client's timeout out of reach (test-harness) | GAIN 1 boundary case; 1/0/1 |
| 8. "read-only implies idempotent" holds only under the effect-only meaning of idempotent (tool-schema-design) | GAIN 1; 1/0/1 |
| 9. one predicate per policy across loaders (catalog-projection-modes) | GAIN 1; 1/0/1 |
| 10. a wrong operation name is not an omission (catalog-projection-modes) | GAIN 1; 1/0/1 |
| 11. create-only; secure default on create; an omitted option on update means preserve (mcp-tools) | GAIN 2, home contested with `write-freshness-gate`; 2/1/2 |
| 12. a delegated credential sent to a data-supplied host: bind the host to the credential's audience, and check before token acquisition (browser-credential-boundary) | GAIN 2, home contested with `mcp-tools/authentication-and-scoping`; 2/1/2. **Highest-value row of the run**; suggested as a scoped `/deepen` brief. |

Catches (already covered), rows 13-19:
- the semantic-change identity lapse (tool-identity);
- npm stdout (transport-selection);
- a truncated listing as success (failure-not-empty-success);
- required verdicts and a write annotated read-only (tool-schema-design);
- the perf gate (gate-liveness);
- CLI option types (tool-schema-design).

## Gate

`node scripts/gate.mjs --lane knowledge`, exit 1. Output tail:

```
  knowledge/game-production/systems-canon/realtime-combat-semantics/applications/process--start-protection-window.md:13: C:\Users\…

check-public-paths: 36 machine home path(s) in 8466 published file(s).
Write a repo-relative path (`<project>/src/x.ts`) or a placeholder (`<vault>`). Absolute roots belong in .machine.local.json.

gate FAILED at scripts/check-public-paths.mjs - exit 1 (VIOLATIONS)
2 step(s) passed before it; 5 not run.
```

All 36 violations are under `knowledge/game-production/`, and **none is in a file this
run touched** (`grep -vc game-production` over the violation list = 0). The remaining
steps, run one by one:

| step | exit | tail |
| --- | --- | --- |
| `node scripts/build-index.mjs --check` | 0 | `index is current` |
| `node scripts/build-knowledge-rules.mjs --check` | 0 | `rules are current.` |
| `node scripts/review-coverage.mjs` | 0 | `513 subjects; 393 pending, 71 reviewed, 49 stale, 0 invalid` |
| `node scripts/check-hash-stability.mjs` | 0 | `generated output is checkout-stable …` |
| `node scripts/build-catalog.mjs --check` | 0 | `catalog.json is fresh — 11 bundle(s) indexed` |

Also run: `node scripts/check-bundles.mjs`, which printed `bundle integrity OK`.

`node scripts/check-anchors.mjs <doc> --root <clone>` over all seven touched or new
documents gave:
- zero `quote-absent` and zero `past-eof`;
- every quoted anchor reported as `missing-file`.

The cause is that these applications cite paths relative to a project directory
(`NamespaceToolLoader.cs:120-130`), the convention the first scan also used. The
instrument cannot resolve them, so it **did not evaluate** the quotes. The citations
were verified by the four workers and by the director's own reads, not by this
instrument.

## Skipped because this is a cloud session (recorded, not done)

- **Run board** (`run-board.mjs` claim, beat, lock, check, release): sole writer in this
  clone.
- **Shared ledger appends** (`librarian/sources/index.md`, `librarian/applied.md`,
  `.claude/skills/intake/SCORECARD.md`, `upstream-check.mjs --ledger`). The rows are
  under "Ledger rows" below.
- **Fleet application.** Phase 7.5 apply and A/B, 7.6 direction pass, 7.7 decision gate,
  8 cross-repo lane and 6b render proof were all skipped (no sibling checkouts, no
  `.machine.local.json`). No technique or golden-path rule landed, so the method owes no
  apply row. Handoff entries are below anyway, for the two application findings a local
  session could test.
- **Phase 10** committed to this branch, not to `main`. Files were staged by name.
- **Phase 11**: no edit to the intake skill or its LESSONS. Proposals are below.
- `--help` was never passed to any script; argument handling was read from source.

## Ledger rows

**`librarian/sources/index.md`** (append):

```
| 2026-10-06 | [microsoft/mcp delta](2026-10-06-microsoft-mcp-v2.md) `github:microsoft/mcp` @ `b7533190` — a **commit delta** over a tree mined 33 days earlier at `bc2a3b4e` | **vendor repository re-scan** (cloud dispatch 261006-acb716). Due on the tier 1 floor; prior condition decided clause by clause: schema migration no (6/478), deprecation mechanism no, DEBUG-only assertions **partly** (equality now a CI test, completeness still DEBUG), 8 weeks no. Expected yield said first (**high catch rate, 0-1 upper-layer, 2-4 application landings, at least one vendor-moved-to-us**) and the shape held; the vendor moved to the corpus **four** times | changelog delta ~4,600 words (beta.41-beta.50) + ~35 commits at diff level; 1364 files, +55676/-9290, 194 commits, 34 days | 20 | 6 (all applications) | 0 declined | 7 already-covered | 4 leads / 6 untriaged | **Every reversal in the window ran toward a rule the corpus already states**: single-mode fail-open closed (#3466, 8 days after we recorded it), uniqueness gate rebuilt on the constructed surface with a non-empty assertion (#3614), every behaviour verdict made `required` (#3614), a keyword-filter read-only claim withdrawn and moved to the database's permissions (#3202, which annotation-equality then forced into a new curated group). **Citations: 167 checked / 147 re-pinned / 20 withdrawn / 8 corrected-at-prior-pin** — 2 of the 20 were findings, the rest an SDK patch pin and grown counts. 2 new applications: a second tool-schema-design witness (10→9 read-only-but-non-idempotent commands, the two #3818 fixed among them, and the source's `Idempotent` meaning output variance too) and the first dotnet gate-liveness witness (a perf gate announced four times whose step is removed at template expansion). Highest-value untriaged row: a delegated credential sent to a data-supplied host — bind the host to the credential's audience before token acquisition (`EndpointValidator`, 5 PRs) — suggested as a `/deepen` brief for browser-credential-boundary. 0 of 3 fetches | [[2026-10-06-microsoft-mcp-v2]] |
```

**`librarian/applied.md`**: none. No technique, amendment or golden-path rule landed,
so no Phase 7.5 row is owed. (The applications are source-tree applications, not fleet
applications.)

**`.claude/skills/intake/SCORECARD.md`** (append):

```
| 2.15.0 | 2026-10-06 | `github:microsoft/mcp` @ `b7533190` — **delta re-scan** (cloud dispatch 261006-acb716) over `bc2a3b4e`, 194 commits / 34 days | 1 source (changelog delta read whole, ~35 commits at diff level, 4 read-only citation workers) | 20 (6 application/currency, 6 scored upper-layer, 7 catches, 1 lead update) | 167 citations re-opened; every load-bearing withdrawal re-checked by the director in the tree | 0 techniques / 0 amendments / 6 applications (4 re-pinned, 2 new) | 0 rows — no technique or rule landed (cloud: no fleet in any case) | 0 — cloud dispatch, no fleet | Prediction held on shape (0 upper, 2-4 app → 6) and undercounted corroboration (vendor moved to us 4x, predicted 1). `auto=0/6/0`, `fp=0`. Focus (list committed registers at 7.5) n/a: no Phase 7.5 | 0/0/0/6-src/0; routing count n/a (delta); no handoff; directions=n/a |
```

Line under the table, to follow the row: *Weakest stage unchanged for repository deltas:
**apply**. A delta that only corroborates owes no apply row, but its strongest untriaged
row (a credential-audience boundary for data-supplied hosts) has an obvious fleet seam
and no session to test it in. Next delta run's declared focus: when an untriaged row
carries GAIN 2 with a contested home, spend the promotion read on the contest (read both
candidate homes' boundary statements) before banking it.*

**`librarian/upstream.md`** (via `node scripts/upstream-check.mjs --ledger`, run
locally): the `microsoft/mcp` row should re-pin to `b7533190`, mined `2026-10-06`, and
carry the new condition from the v2 note's `rescan_when:`.

## Handoff

No technique landed and no golden-path rule flipped, so the method owes no handoff
entries. The two application-layer findings below have a reachable fleet seam, and a
local session could test them cheaply. Project joins are read from
`librarian/fleet-map.json` (generated 2026-09-21). Every join there is in state
`unknown`.

- **`knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/techniques/tool-schema-design.md`,
  the cross-axis rule ("a read-only verdict is non-destructive and idempotent by
  definition")**
  - Projects joined to `mcp-tools`, with context counts: personas 64, kp 49,
    systedo-case 37, athena-everywhere 34, pumper 17, ascent 13, personas-web 12, pof 11,
    politicas 10, tracklight 9, gravitone 8, goat 8.
    Prefer **tracklight** (the 2026-09-03 run's code/better seam for this source) or
    **pumper** (the peer study).
  - Seam: the project's tool registry, at the point where behaviour hints are declared.
  - Test: scan for read-only-and-not-idempotent pairs. Before treating any pair as a
    defect, read the project's own definition of idempotent.
  - Expected mode: **code** (a scan plus a test in the project's gate). Use
    **experiment** if no gate can see it.
- **`knowledge/software-engineering/security/data-and-transport/browser-credential-boundary/techniques/outbound-fetch-destination-validation.md`,
  with untriaged row 12 (credential-audience host family)**
  - Projects joined to `browser-credential-boundary`: kp 5, pumper 4, personas-web 4,
    ascent 4, personas 3, gravitone 2.
  - Seam: the client-construction line where a tool's or route's endpoint argument
    meets a delegated credential.
  - Which of the six projects actually holds that seam is **not resolved here**. It
    needs the checkouts.
  - Expected mode: **simulation** with three real call sites until a seam is found;
    then **code**.

## Proposed lessons (for `.claude/skills/intake/LESSONS.md`; not applied)

- `## 2.15.0 - 2026-10-06 - microsoft-mcp-v2`
- For a vendor system already mined once, a delta can be **all corroboration**. Every
  reversal in the window moved toward a rule the corpus states, and the right landing
  shape for "the vendor moved to us" is the application that recorded the gap, rewritten
  as history plus closing commit. It is not a new upper-layer row. The OpenWiki yield law
  ("a delta's product is reversals") holds; what a reversal *lands as* depends on which
  side it moved toward.
- `upstream-check.mjs` fires its mechanical release clause on **any** GitHub release
  after the mine. A vendor tagging twice a week (this one tagged beta.45 to beta.50 in
  three weeks) would fire it on every sweep if those tags carry release objects. A
  `rescan_when:` for such a repository should name upstream events plus a date, never a
  release.
- Most of a delta's withdrawn citations are incidental (a patch-level SDK pin, counts
  that grow). An application that cites a toolchain patch version in prose re-breaks on
  every patch. Prefer the witness's major/minor in prose and keep the patch in
  `verified_against:` only.
- `check-anchors.mjs` cannot resolve the project-relative path convention these
  applications use. That stays a known blind spot until the applications either write
  root-relative paths or the instrument learns a per-document root prefix.

## Open questions (for the operator)

- Row 12 (credential-audience host family) is GAIN 2 with a contested home. Should it go
  to `browser-credential-boundary` (attention rank 12) as a `/deepen` brief, or to
  `mcp-tools/authentication-and-scoping`?
- The prior note is left unedited. `SKILL.md` Phase 9 says a `--delta` "updates the
  original note rather than opening a second one", while `docs/upstream-brief.md` and
  this dispatch say to write a `-v2`. This run followed the brief and the dispatch.
  Should the two documents be reconciled?

## Files changed

- `knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/applications/dotnet--catalog-projection-modes.md`
- `knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/applications/dotnet--tool-identity-vs-tool-name.md`
- `knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/applications/dotnet--sanctioned-session-state.md`
- `knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools/applications/dotnet--tool-schema-design--microsoft-mcp.md` (new)
- `knowledge/software-engineering/engineering-process/build-and-release/test-harness/applications/dotnet--recorded-interaction-fixtures.md`
- `knowledge/software-engineering/engineering-process/standards-and-gates/quality-gates/applications/dotnet--gate-liveness.md` (new)
- `librarian/sources/2026-10-06-microsoft-mcp-v2.md` (new)
- `librarian/subjects/software-engineering/mcp-tools.md`
- `librarian/subjects/software-engineering/test-harness.md`
- `librarian/subjects/software-engineering/quality-gates.md`
- `librarian/runs/cloud-261006-acb716/result.json` (new)
- `knowledge/software-engineering/index.json`, `rules/ai-registry-software-engineering.md`, `catalog.json` (regenerated)
- `.cloud-runs/261006-acb716/RESULT.md` (this file)
