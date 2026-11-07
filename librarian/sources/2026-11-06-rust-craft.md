---
source: batch
kind: batch
url: "github:teamleaderleo/glaeda @ 1feddaa1, github:leodearden/reify @ 8d65e1b0, github:Phixsura/orthic-mono @ 24665cd7, github:melgarafael/lina-space @ 9b4d57c8, github:vercel-labs/agent-browser @ 71850a02, github:rtk-ai/rtk @ 1cf7bc70 (delta)"
title: "Rust craft, /shift batch of 6 repositories from 6 authors"
author: "6 authors: teamleaderleo; leodearden; Phixsura; melgarafael; vercel-labs; rtk-ai"
words: 3622973
extracted: 112
accepted: 6
declined: 0
leads: 28
already_covered: 28
untriaged: 50
dispatched: 0
applied: 5
shipped: 0
run_id: shift-rust
siblings: 2
fetches: 0
rescan_when: "glaeda: its Rust track resumes (its roadmap says paused); reify: the spec-conformance crate or the parse backstop lands, which is the forge's precondition; orthic-mono: a push to its default branch after 24665cd7; lina-space: a stored snapshot gains a version; agent-browser: action categories return to the policy check; or 8 weeks elapse (2027-01-01)"
---

# Rust craft, mined under /shift, 2026-11-06

Plan `plan-repos-20261106`, cluster `rust-craft`, no plan-level homes, so the miners and this lander mapped
them. Repository method, Phases 2b and 2d. Phase 7.7: gate=skipped (unattended shift); nothing was asked. The rtk delta
updates its own note, [[2026-10-14-rtk]], per the intake skill; its rows are here so the voices read together.

**Voices.** Six authors. `reify` is the same voice as `dark-factory` ([[2026-11-06-agent-factories]]) and `orthic-mono` the same as
`attune`, so neither pair corroborates itself. Labels: G glaeda, R reify, O orthic-mono, L lina-space, B agent-browser, K rtk.

**Licences.** R is AGPL-3.0, O is BSL-1.1, L has none and declares itself proprietary: design recorded in our words, code copied from
none, and their anchors below are bare line references. G, B and K are Apache-2.0 (B holds one MPL file, not touched).

**The rule that governed this table.** The accept bar is **GAIN - RISK >= 3** for the rest of this shift, not +2: Phase 5 Step 4 raises it after
three false positives, and today's scorecard rows carry fp=1, 1, 1, 2 and 4. Miners scored most accepts before that took effect. Raw scores are
kept. A row at net +2 is banked with anchors, and untriaged is not declined. Currency and leads ran under the corroboration table. Nothing here is
render-bound.

**Expected yield,** from the miners: techniques inside existing subjects, many catches, performance as leads, one forge proposal. Miners accepted 24 rows.
Six rows landed, absorbing 3 more.

**Coverage.** Miners read roughly 5-10 % of each tree; R far less. Nothing in any clone was built or executed by anyone.

## Triage

| # | Candidate | Anchor | Voices | Shape, rule | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|
| R3+L | A test helper is a fork of the driver | R `crates/reify-test-support/src/mocks.rs:66-71`; L `docs/adr/0024-atomicidade-do-write-de-aprovacao-no-app.md:9` | R, L, plus a fleet project's own comment | technique, Phase 5, top of the worklist | real gap beside a sibling's fresh technique | 4/1/2 | **accept, `a-test-helper-is-a-fork-of-the-driver`** |
| R1+L | A new field must choose | R `crates/reify-eval/src/engine_build.rs:3475-3500`; L `app/lina-gpui/src/canvas.rs:167-173` | R, L (L for the enum half only) | technique, Phase 5 | real gap | 3/0/2 | **accept, `a-new-field-must-choose`**, at the bar |
| O1+B3 | A string-keyed context is an unchecked join | O `crates/orthic-gateway/src/pipeline/dag/context.rs:75`; B `cli/src/native/state.rs:808` | O, B | technique, Phase 5 | real gap | 3/0/2 | **accept, `string-keyed-context-is-an-unchecked-join`**, at the bar |
| G1+L | A replace is visible before it is durable | G `src/unix_personal_worker_store/publication_fault.rs:12`; L `crates/lina-core/src/events.rs:2689-2696` | G, L, opposite defaults | technique, Phase 5 | real gap | 3/0/2 | **accept, `replace-is-visible-before-durable`**, at the bar |
| B2+R11+O11+B16 | Who reads the error, and whose text it quotes | B `cli/src/native/browser.rs:239`, `:1574`; G `src/disposable_clone_runtime.rs:182`; O `docs/design/error-handling.md:274`; R `crates/reify-core/src/diagnostics.rs:4953` | G, O, R, B | amendment, Phase 5 | real gap | 3/0/1, was 2/0/1 | **accept, `consumer-decides-error-shape`**, at the bar. Below |
| K1 | Repair four rtk applications and a stale technique sentence | [[2026-10-14-rtk]] | K | currency, table | 42 re-pinned, 1 withdrawn | n/a | **accept** |
| G3 | Undeclared source files are an orphan class | G `src/exact_commit_handoff/tests.rs` | G, O (one file), K (preventive), fleet closed | amendment, Phase 5 | real gap | 2/0/1 | untriaged at net 2. Below |
| O4 | An excluded package leaves every gate | O `Cargo.toml:4` | 1 | catch | catch | n/a | covered: `out-of-graph-artifacts`. Below |
| R4+G10 | A rule list declares each row's enforcement | R `docs/invariants.md:11`; G `tests/threat_model_enforcement_bindings.rs:21` | R, G, L on decay only | amendment, Phase 5 | mostly a catch | 2/1/1, was 2/0/1 | untriaged. Below |
| E | No generated test input | 5 trees by grep, per miners | G, R, O, L, B; K has fuzz | lead, table | a survey, not a claim | n/a | lead. Below |
| G2 | A derived decoder is a second constructor | G `src/lease_document.rs:97`, `src/artifact.rs:142` | 1 | technique | real gap | 2/0/2 | untriaged at net 2 |
| G4 | A word list proves the absence of words | G `tests/personal_worker_tick_contract.rs:36` | G, one line of [[2026-10-14-rtk]] | amendment | partial | 2/0/1 | untriaged at net 2 |
| G5 | Public-record errors hold no runtime text | G `src/personal_worker_store.rs:720` | 1 own tree holds both forms | technique | real gap, price unread | 3/1/2 | untriaged at net 2; its question landed in the amendment |
| G6 | Bind a proof's life to the record by borrow | G `src/hot_state_path_policy/admission.rs:267` | 1 | amendment | rewrites a sentence | 2/2/1 | untriaged |
| G7 | Explicit unlock beats dropping the descriptor | G `src/linux_lease_store.rs:352` | 1 | amendment | real gap | 1/0/1 | untriaged |
| G8 | Secret input discards the child's output at the OS | G `src/process.rs:148` | 1 | amendment | real gap | 1/0/1 | untriaged |
| G9 | Overflow kills, or keeps the tail | G `docs/adr/0009-bounded-subprocess-output.md:33` | G, K, opposite | amendment | discriminator | 1/0/1 | untriaged. Discriminator below |
| G11-G14 | Inventory ratchet; process door; pinned toolchain; failed sample is no speed result | G `tests/module_inventory.rs:55`, `docs/adr/0009-bounded-subprocess-output.md:33`, `rust-toolchain.toml:2`, `docs/DEVELOPER_LOOP_BENCHMARK.md:125` | 1 each | catch | catch | n/a | covered: `configuration-union-proof`, `spawn-contract`, `blocking-by-input-determinism`, `control-failure-is-not-a-datum-state` |
| G15-G19 | Computed speedup; kernels then paused; many test targets; prefetch slower; wrapper not faster | G `docs/ROADMAP.md:4`, `Cargo.toml:51` | 1 each | lead, table | their numbers | n/a | lead |
| R2 | Checker and evaluator owe one parity test | R `crates/reify-compiler/tests/harness_type_checking/mul_div_static_runtime_parity.rs:421` | R; L shape only | technique | six parity homes unopened | 2/1/2 | untriaged |
| R5-R8 | Fault implies error; value-changing ambiguity; vocabulary against dispatch; clause identity | R `crates/reify-syntax/src/member_continuation.rs:19`, `docs/prds/v0_6/syntax-lowering-contract.md:21`, `:524`, `docs/prds/v0_6/spec-conformance-suite.md:58` | 1 | design | mostly plans at HEAD | n/a | untriaged, E4 proposal 1 |
| R9, R10, R12, R13 | Bound one recursive layer; never-resolving cell; build script logic via include; layering gate moves tests | R `crates/reify-compiler/src/recursion_guard.rs:407`, `docs/legibility/design-invariants.md:178`, `tree-sitter-reify/build.rs:4`, `crates/reify-compiler/tests/harness_units/ri_literal_roundtrip.rs:13` | 1 each | amendment | partial | 1/0/1, 1/2/1, 1/2/1, 1/1/1 | untriaged |
| R14, R15 | Empty suite under a missing capability; layered crate graph | R `scripts/check-manifold-deps.sh:6`, `docs/prds/core-ast-ir-layering.md:48` | 1 each | catch | catch | n/a | covered: `configuration-axes-cross-the-ladder`, `module-design` |
| R16-R21 | Diff-scoped gate; feature union; split debug; test harness folding; own incremental engine; confusion codebook | R `scripts/check-harness-baseline-registration.sh:12`, `docs/notes/workspace-feature-union.md:16` | 1 each | lead, table | their numbers | n/a | lead |
| O2 | A stronger ordering does not join two stores | O `crates/orthic-gateway/src/pipeline/dag/context.rs:394-397` | 1 | technique | real gap | 2/0/2 | untriaged at net 2. Seam proposal 4 |
| O3 | State parked behind a narrow trait outlives its promise | O `crates/orthic-gateway/src/context_store.rs:17`, `:63` | 1 | technique | real gap | 2/0/2 | untriaged at net 2 |
| O5-O9 | Unset does not clear the environment file; head before insert; cancelled stream bills nothing; write-once per attempt; strict and the first byte | O `crates/decryption-sidecar/src/security.rs:162`, `crates/orthic-gateway/src/audit/writer.rs:93`, `crates/orthic-gateway/src/core/server/stream.rs:101`, `crates/orthic-gateway/src/pipeline/dag/context.rs:430-431`, `crates/orthic-gateway/src/core/server/service.rs:792` | 1 each | amendment | mixed | 1/0/1, 1/0/1, unscored, 1/1/1, 1/1/1 | untriaged |
| O15, O16 | Lua check-and-increment; bounded audit queue | O `docs/design/quota-atomicity.md:29`, `crates/orthic-gateway/src/audit/logger.rs:119` | 1 each | catch | catch | n/a | covered: `concurrency-guards`, `audit-logging` |
| O10, O12-O14, O17 | Rollback mismatch; review fix rate counts edits; named fixes; signature in stored stream; sub-3ms claim | O `crates/orthic-gateway/src/quota/checker.rs:295`, `.code-reviews/2026-01-19_001/SUMMARY.md:22`, `README.md:7` | 1 each | lead, table | read, not run | n/a | lead |
| L1 | A mirror is promoted by certificate | L `crates/lina-core/src/events.rs:2374`, `:3994` | 1 | technique | real gap | 2/0/2 | untriaged at net 2 |
| L2 | Check the screen under the lock its reader needs | L `crates/lina-core/src/lib.rs:2433` | 1 | technique | real gap | 2/0/2 | untriaged at net 2 |
| L3-L6, L8 | Stored fold names its code; weakest authority; bound the wait; skew as corruption; replay holds no effect handle | L `crates/lina-core/src/events.rs:3281`, `:199`, `docs/adr/0046-pump-2-fases-entrega-a2a-fora-do-lock-do-store.md:64`, `crates/lina-core/src/approval.rs:374` | 1 each | amendment | partial | 1/1/1, 1/0/1, 1/0/1, 1/1/1, 1/1/1 | untriaged |
| L7, L9-L11, L13 | Deny-list classifier allows by default; durable delivery; phased paste; hand-listed crates; per-OS test table | L `crates/lina-core/src/guard.rs:179`, `CLAUDE.md:46`, `.github/workflows/ci.yml:60` | 1 each | catch | catch | n/a | covered: `fail-loud-classification-default`, `delivery-guarantees`, `keystroke-injection`, `gate-liveness`, `configuration-axes-cross-the-ladder` |
| L12, L14-L16 | Serial tests hide a flake; poison recovered; per-append sync cost; spike figures | L `crates/lina-core/src/lib.rs:838`, `spikes/spike-gpui/RESULTADO.md:4` | 1 each | lead, table | their numbers | n/a | lead |
| B1 | A deny entry that matches nothing fails open | B `cli/src/native/policy.rs:95` | B, plus 2 existing homes | amendment | real gap at this home | 2/0/1 | untriaged at net 2. Below |
| B4 | A running session plans a settings change | B `cli/src/session_settings/plan.rs:3` | 1 | technique | real gap | 2/0/2 | untriaged at net 2 |
| B5 | A second realization of the browser subject | B `cli/Cargo.toml:3` | 1 | application | agrees, departs on 7 points | 2/0/2 | untriaged at net 2. Below |
| B6-B10, B17-B20 | Busy one level down; flags-anywhere parser; installed file is a pointer; crash relaunches and says so; stale ref recovers; exit always 1; identity on argv; Windows listener; close before reply | B `cli/src/native/browser.rs:520`, `cli/src/mcp.rs:2749`, `skills/agent-browser/SKILL.md:24`, `cli/src/native/actions.rs:15008`, `cli/src/native/element.rs:875`, `cli/src/output.rs:939`, `skill-data/core/SKILL.md:19`, `cli/src/connection.rs:433`, `cli/src/native/daemon.rs:514` | 1 each | amendment | mixed | 1/0/1, 1/1/1, 1/1/1, 2/2/1, 1/1/1, 1/1/1, 1/2/1, 1/1/1, 1/0/1 | untriaged |
| B11-B15 | Retry on proof of non-landing; approval binding; read-only claim on code; private command lists; prose classification | B `cli/src/connection.rs:1150`, `cli/src/native/actions.rs:3300`, `cli/src/mcp.rs:2255`, `cli/src/connection.rs:1151`, `:1237` | 1 each | catch | catch, live counterexamples | n/a | covered: `error-classification-for-retry`, `consent-gates`, `tool-schema-design`, `effect-classed-commands`, `error-handling` |
| B21-B24 | Retries multiply a timeout; default timeout a backstop; size and latency claims; skill evals | B `cli/src/connection.rs:1279`, `cli/src/native/daemon.rs:275`, `CHANGELOG.md:1271`, `evals/README.md:3` | 1 each | lead, table | not run | n/a | lead |
| K2 | A guard moved, the booking stayed | K `src/core/runner.rs:372` | K, converged on ours | amendment | real gap | 2/0/1 | untriaged at net 2, see [[2026-10-14-rtk]] |
| K3 | Empty is evidence only when all was read; a wrapper the gate cannot see through | K `src/hooks/permissions.rs:137`, `src/hooks/README.md:109` | K, converged on ours | amendment | partial | 2/0/1 | untriaged at net 2; the stale half landed under K1 |
| K4 | The frozen predecessor is a refactor's oracle | K `src/discover/lexer.rs:2223` | K, one other run | amendment | partial | 2/0/1 | untriaged at net 2 |
| K5, K8-K10 | Target in a build script; test never reached the statement; paired benchmark loaded one arm; pinning the installer | K `build.rs:11`, `.github/workflows/ci.yml:143`, `:34` | 1 each | catch | catch | n/a | covered: `os-arch-matrix`, `unreached-decisions-pin-nothing`, `the-baseline-is-the-untouched-path`, `blocking-by-input-determinism` |
| K6, K7, K14 | Copy what you do not model; fuzz the built parser's surface; truncated hash as upsert key | K `src/discover/registry.rs:1260`, `src/lib.rs:5026` | 1 each | technique, amendment, thin | mixed | 2/1/2, 1/0/1, n/a | untriaged |
| K11-K13 | Estimate cap gone; allocator on static builds; runner floor moved | K `Cargo.toml` musl block, commits `fab1f8c`, `fb3995d`, `5fa24dd` | 1 each | lead, table | their numbers | n/a | lead |

Admission: auto=6/50/1, fp=3 (R2, R4, O4 died on the read; the rest of the miner accepts that did not land fell to the bar, which is not a death). Escalation: the E4 forge. Rows G10, R11, O11, B3 and B16
merged into landed or scored rows and are counted in `already_covered` with the 23 catches, so 112 rows add up. O4's undeclared-file half joined G3.

## What the promotion read contradicted

**A sibling landed the neighbour while this run read.** `proved-off-the-path` landed at 21:40, after the home was first opened, and R3's claim
reads like a case of it. Its opening covers a suite assembling its own path. Separating them took a test: its walk finds zero production calls, and here the call is
there and the setup differs, so a fork passes its walk. The comparison instrument is a mechanism it does not hold, so R3 stayed a technique. +1 risk for
the overlap. It clears at 4/1/2 because `test-harness` tops the worklist. A bullet in that file's "Not this technique" points across.

**R3's first anchor was misleading.** The miner quotes `compile_with_prelude(parsed, &[])`, but that line's own doc comment reserves that entry for bootstrapping, and points users elsewhere. The
PRD's four axes concern `reify-test-support`. The fake's satisfied default stands. The note rests on the fake, the PRD's statement and the personas read, not on that line.

**R4 and G10, per-row enforcement status, is mostly a catch.** Miners opened `style-rule-ships-its-detector` and `enforcement-demotion` and missed `prose-rule-drift`, whose audit
already produces "the honest inventory of which standards are mechanisms and which are aspirations", and whose reader tier already words a row. The style file already forbids an undifferentiated list. What remains is keeping
the audit's answers in the rows, with a legal "convention only": one sentence. Amendment 1, convergence +1 for reify and glaeda, home contested among three +1: 2/1/1, net 1. Banked wording: "Keep the audit's answer in the row, with 'convention only' as a legal value, and change it in the same change that lands the mechanism." Return: a tree that measures rows going stale.

**O4, an excluded package, is a catch.** `out-of-graph-artifacts` opens with exactly this: a whole-project command quantifies over a declared list, and anything no gated root reaches is outside every green. O's release script names the
package, so it is shipped and inside that technique, not its When-not.

**G3, undeclared source files, misses by shape, with three authors.** Evidence re-checked: G's file has no declaration by a literal search; O's `crates/orthic-console/src/api/synthetic.rs` has none in the three root files; K's refusal covers one folder and matches a substring (`build.rs:96 "let cmds = Path::new("src/cmds");"`, `build.rs:125`). It is a new bullet in a list whose instrument, reconciliation, already exists, so it is an amendment: 1 + 1 convergence = 2. Reading it as refuting "reachability catches orphan modules" would need that sentence changed, which is +2 under the rewrite test. Banked, with K's correction:

> **Undeclared source files** - in a language where a file joins the build only because something declares it, a file nothing declares is not dead code but absent code: never compiled, linted or tested, so it cannot even break. It accumulates at retirements, when the parent goes and its sibling test file stays. Every reach-shaped instrument starts from the declared tree and cannot see it. The instrument enumerates the directory and diffs it against the declarations, at build time if it can. Check the whole source root, strip comments first and follow every inclusion form the language has: the cheap form seen in the field covers one folder and accepts a commented-out line.

Return: anyone who would land this should weigh proposal 2.

**B2's score moved up, on a re-run.** Under the rule an amendment adding a case is G=1, not 2, and four authors add +1: net 2. The file's "prose is not a contract" stays true of a program, so this is not an inversion. The third point is a refutation: `agent-actionable-errors` prescribes class-marker patterns ordered specific to general, and a real door already doing that, copied unchanged and re-run, sent `Evaluation error: ReferenceError: interceptor is not defined` to the covering-element guidance. That sentence still stands and gains a condition, so it is an append. B16 merged here on that basis. Also found on the read: that file calls the first phrase "a contract" while this one says prose is not, with no discriminator between them. The amendment supplies it.

**B5, the second realization, did not clear.** 2/0/2 at net 2, and an application's `verified_on` would claim every line of a long document that was read at about 10 %. The precedent note took the same decision. Its value is real: it answers that subject's one-tree debt. Return: a `/reconcile` run on that subject, which would read the tree in full and could rebuild it from the discriminators below.

**B1, a deny entry that matches nothing, is a boundary.** The rule is already stated in `proof-class-bound-to-action-class` and a routing application, so it is 1 + 1. Wording to bank: "Check every name in a restricted set against the registry at load, and refuse to load on a name that is not there. Refusing a file that cannot be parsed is not this check." Return: a fleet deny list.

**E, no generated test input, is a survey and not a finding.** Five trees of five authors hold no property test or fuzz target, per miners' greps. Rtk has differential fuzz and a generated corpus, and personas declares `proptest`, so it is not universal, and this cluster was picked by theme. No tree shows what a generator would have found. `test-input-generation` owns the method, and no amendment was written. Return: one such tree or a fleet parser where a grammar-derived generator is run beside the hand suite and its finds are counted. No row banked: there is no target parser chosen yet, which is what it lacks.

**Glaeda's lead about personas is closed.** `8318f26ecf` deleted the two files on 2026-10-14. Its row was stale. Recorded in [[2026-10-14-rtk]].

**Withheld and corrected facts.** Windows directory handles: measured, refused. A miner's "15 and 15" in an rtk application: withdrawn for a stated pattern, 12 and 27 by text search.

## Where the voices chose opposite defaults

| Question | Voices | Discriminator |
|---|---|---|
| Runtime text in an error? | G no, O yes, R quoted source, B the interface | Who reads it, and whose text it quotes. Landed |
| Report a failed directory flush after publishing? | G returns it, L logs it | What the caller can still do. Landed |
| Overflow of captured output | G fails closed, K keeps the tail | Output decoded as evidence fails closed; output read as a diagnostic keeps its end |
| Browser crash | gstack tree exits, B relaunches | Can the caller see the loss on the very next response? |
| Reuse on a config difference | `session-reuse` cold spawn, B plans | Is the session's state what the caller came for? |
| Purity proof | G narrow test root, K and R real crates, O split then merged | How much the seam's data flow still crosses |
| Toolchain | G and R pinned, K, L and B floating with warnings denied | Already `blocking-by-input-determinism` |
| Async runtime | G none, L none with a global lock, O and B throughout | Network proxy or local tool; L shows blocking is not free |

## Design record, in our words

Recorded here and not as one application per entry, for the reason [[2026-11-06-agent-factories]] gave: most entries were read in part, and `verified_on` would claim more than was checked. Landed rows have theirs.

- **G.** One large crate with no async, closed public errors, a generated reach inventory with a ceiling, a test crate compiling a module under a narrow root, four named publication failure points.
- **R.** A generated recovering parser, a hand lowering, a post-parse layout check for a separator-free grammar, separate syntax and meaning crates. Many PRDs read like facts and describe plans: 5 of 8 mechanisms checked at HEAD had not landed.
- **O.** A pipeline of handlers over a shared context with a type-erased map, a side table for what a thin hook cannot carry, a separate process for the master key, a per-request lossy translation policy.
- **L.** An event log with rebuildable projections, a mirror promoted by certificate, approval written under the lock the reader needs, decode defaults at the weakest authority, a closed fold with listed no-ops.
- **B.** A thin CLI, a per-session daemon, an MCP server re-invoking the binary, settings as a per-command patch planned against the session, typed lost-response outcomes. Its documents describe a previous daemon's controls.

Routing: only R reaches 3 NONE entries with no home, the front end. The evaluation engines and agent coordination in R and L were not counted.

## Phase 7.5

| Landing | Mode | Verdict | Target and floor |
|---|---|---|---|
| `a-test-helper-is-a-fork-of-the-driver` | experiment, own schema; project seam read | unmeasurable | One locking question: refused against committed. Floor: no-reader case agreed. Instrument: the comparison in step 3 |
| `a-new-field-must-choose` | experiment, rustc on own code | unmeasurable | Planted field refused 0 to 1, floor held. Seam is the When-not case. Instrument: a survey for a large reset with history |
| `string-keyed-context-is-an-unchecked-join` | experiment, rustc on own code | unmeasurable | Mismatches compiling 2 to 0, control held. No seam read. Instrument: a scan of the project's maps |
| `replace-is-visible-before-durable` | experiment, own harness | unmeasurable | Writer's account right in B, floor identical. Instrument: a power-loss harness |
| `consumer-decides-error-shape` | experiment, transliterated ladder on own fixtures | better | Number-token misroutes 5 to 0; floor 42 of 42 parity fixtures. 3 word cases unmoved, so number tokens only |

Two seams were chosen to falsify; each is stated in its application. No project changed. `simulation` substituted for nothing.

## Held rows

None. Every proof that could run did run here on CPU. What remains needs a change in a managed project, or a power-loss rig, so neither is a row that could run unattended.

## Proposals, not landed

1. **E4: a scoped `/forge` of the language front end,** with R5-R8 as the brief. `language-runtime` holds 10 subjects, so V1 refuses it there; `backend-platform` has 9 categories, so a new category needs the operator. Three of its four mechanisms are plans at HEAD and one tree is thin; read a second open front end alongside. AGPL: design only.
2. **Admission method.** Convergence is a flat +1, so three authors score as two. G3 misses the bar with three, and the amendment class caps at net 2 unless it refutes. The method owner should read whether that is wanted at +3. Today's row: of 24 miner accepts, 3 died on the read and 14 fell to the bar, with most of the latter re-derivable for free.
3. **Note conflict, `docs/upstream-brief.md` against the intake skill.** The brief says a delta writes a new `-v2` note, and the skill's Phase 9 says a `--delta` re-scan updates the original. This run followed the skill. Whichever stays, the other needs changing.
4. **personas seams, all proposals, nothing changed there.** Test fixture: compare the settings and schema the boot path reaches with the fixture's, and name the fixture for what it omits. Failure classifier: anchor status numbers as tokens (measured above), and move classification before stderr is quoted. Stream tracker reset: a destructure, small gain. Companion bridge (`fleet_bridge.rs`): a flag and a start time stored apart, O2's shape, read by the miner, not reproduced here. **Reproduced and fixed 2026-11-06, b25dfc9c7b, on master and not pushed:** release now clears the time first; a scratch model of the atomic sequence gave 67046 false force-releases in 3M turns against 0, and the real window is far narrower than that rate. File publish: no change, unapplied. Workspace crate purity (G4) unread.
5. **`/shift` miner brief.** Three additions the miners asked for: check each mechanism against HEAD, since a plan or a retired control reads like fact; a delta needs a clone with history; and, on a live discriminator, open the subject's whole technique list, since the home here was named by the fifth report.
6. **`source-classes.md`.** Four more miners found no class for a first-party system with its engine in the tree. A sibling's landing may have changed this; read first.
7. **`librarian/upstream.md` has no row for rtk.** The rescan clause is the only trigger. `upstream-check --ledger` was not run by this landing.
8. **`research-map`.** Four miners read it reduced because it returned over 2,000 lines; a domain filter would help, and it ranks on incidental words.

No law, direction, XL row or taxonomy change was made. Defects read in other people's trees stay leads: nothing was filed upstream, and each would need one integration test before anyone did.

## Leads: return conditions

- **B: `state clear <name>` clears everything, `confirm <id>` ignores the id, documented category policies match nothing, `wait_for_function` annotated read-only.** Return: someone runs the binary. Literal searches here agree with the reading for the first two.
- **O: post-response output checks and PII policy rules read keys nothing writes; a stream past the context's lifetime records nothing.** Return: an integration test, or a push to the default branch.
- **G: a validated type's derived decoder on a ledger path; six orphan or test-only files.** Return: a failing decode test, or the operator adopting that inventory.
- **R: a guard's recursion bound leaves the parse on the same small stack.** Return: a run of the deep case.
- **L: a stored fold with no record of its code.** Return: `client-state` opened to choose the home, with a reducer changed under an old snapshot.
- **G15-19, R16-21, O10-17, L12-16, B21-24, K11-13:** a measured reproduction on a fleet project, or a second independent voice. Performance figures are the sources' own and none was run.

## Could not verify, and what was not done

- Anything by running any of the six trees. The rewriter re-run was a copy of one function in scratch.
- The fsync statement on the directory entry was fetched by a miner and not re-fetched here, nor were the miners' other primaries.
- Whole-tree key diffs by miners: only the named keys were re-searched here.
- The miners' rows outside the five landings were not re-opened, so their scores are the miners' under the new bar.
- The board claim and the queue stay with the supervisor. `/shift` was not edited. Clones were scratch only and deleted by name.
