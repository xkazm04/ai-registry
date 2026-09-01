# Lessons - research

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets. Merged from every copy of this skill on 2026-08-22 when it moved into the registry lane.

## 1.0 - 2026-08-12 - personas

- **Before adding a cap/budget/limit, grep for an existing one on the same material.** Applied as Phase 6 Step 3b. A budget was added to a memory-projection path; the first implementation truncated each entry and announced the cut, which had local precedent and looked right. Reading the existing `pack_by_budget` showed the codebase had made the opposite call for that exact material — skip over-budget entries, because "a partial memory is worse than none". Reverting to the existing packer made the change smaller and let it delete a duplicated constant instead of adding a competing one. The general failure is not "the cap already exists" (easy to spot); it is "the cap exists and decided the opposite way" (invisible unless you read it).
- **Read backgrounded tool output even after re-running it scoped.** Applied as Phase 6 Step 4b. Two wide greps timed out and were backgrounded; scoped re-runs answered the immediate question. Reading the backgrounded originals when they landed surfaced one reference the scoped versions had cut out, which escalated a one-module finding into a three-instance architectural pattern with a shipped-template victim. The reason a command was slow is usually that it covered ground the fast version does not.
- **New source-type row: best-practices listicle.** Added to the Phase 3 yield calibration table. Profile is catch-dominant (~1:3 findings-to-catches) because a listicle enumerates a canonical checklist that a mature repo mostly satisfies. The specific trap is stretching for parity with the list's length. The specific prize is the item the repo deliberately inverts — that is a catch with a reason worth recording, not a gap.
- **Risk language in a triage recommendation must be backed by a read, not by momentum.** Not applied as a rule edit (it is already covered by Phase 4's scoring-honesty rule; this is a fresh instance of an old failure). A recommendation characterized a dormant module as "an untested write path armed behind an env var". Both halves were false and both were one grep from being checked — and the evidence for one of them had already been read earlier in the session. Scoring honesty applies to the *risk* half of a finding, not only the relevance half.

### Redesign proposal

- **The skill has no step for "the finding grew while you were verifying it".** Three times in this run a Phase 6 verification materially changed a finding's size or shape after it had already been presented (one module → three gates → a shipped inert template), each time requiring an unsolicited correction message before the user could triage honestly. Phase 6 assumes verification precedes presentation and Phase 7 assumes findings are stable once printed. A future major version could add an explicit re-presentation contract: when verification changes a presented finding's scope, severity, or recommended shape, reprint that finding's row and restate the open question rather than appending prose. Not applied now because it is a structural change to the Phase 6/7 boundary, not a prompt refinement.

## 1.1 - 2026-08-13 - personas

- **New source-type row: specification / standard / RFC.** Added to the Phase 3 yield table. Profile is medium-findings + many catches, but the findings are unusually actionable (2 of 4 shipped same-session). The mechanism is specific: a mature codebase has usually built a spec's *features* — those all resolve to catches — and skipped one of its *invariants*. So the rule is **read the MUST/SHOULD/MAY table before the feature tour.** On this run every feature in the source was already implemented, and the entire security finding came from one normative sentence about path containment that the repo had never checked, in five separate code paths.
- **A landing page is not the source.** Applied as a Phase 2b subsection. The overview page of a multi-page spec site returned ~250 words of positioning — under the skill's own <300-word thinness floor — while the `/specification` subpage carried the whole normative contract. Following the existing rule literally would have aborted the run on a source that produced two shipped commits. The thinness check now explicitly fires *after* a bounded subpage pass.
- **Separate "unify the construction" from "change the emitted value".** Not applied as a new rule (Phase 6 Step 3b already tells you to read before reusing; this is the wire-contract instance of it) but worth recording as a distinct shape. A cleanup finding wanted eight hand-rolled JSON literals unified — and the spec implied renaming a field value while doing it. The value in question is read by third-party clients and the current spelling was live-verified working. Unifying construction is validated by a compile; changing an emitted value is validated by a live test against the reader. Bundling them would have shipped a behavior change disguised as a refactor. Split them, ship the refactor, pin the value to a named constant with the reasoning beside it, and track the rename separately.
- **The Edit-append rule for shared-by-date Lessons files protects others from you, not you from them.** Applied as a Phase 10b addition. A concurrent session `Write`-replaced the shared `Lessons/{date}-*.md` mid-run and erased a block that had been correctly Edit-appended minutes before. Recovery worked only because the harness surfaced the external modification inside the same turn. The rule as written (2026-04-14) is one-directional; the missing half is defensive — write the block late, and re-read it before the final summary.
- **When a wrapper script errors, suspect your invocation before the codebase.** Not applied as a rule (too small). Mid-run, `run-rust-tests.mjs --features desktop <filter>` returned `Unrecognized option: 'features'` — the script already supplies that flag. In a session that was already routing around a concurrent session's compile breakage, this briefly read as a third external failure. Cost was small but the bias is worth naming: once a run has established "the environment is hostile", it stops checking its own arguments.

## 1.1 - 2026-08-13 - personas (kpi-dashboard-design compare run)

Second run on 1.1 the same day, concurrent with the agent-plugins one above; both
bumped independently (that run 1.1→1.2, this one 1.2→1.3).

- **An aggregator listing is not the source, and the thinness floor cannot catch it.** Applied as a Phase 2b subsection. The source URL was a skills.sh listing; WebFetch returned a fluent, well-over-300-word *summary* of the skill — third-person, behind a "Show more" the fetch could not expand — that even stated its own incompleteness in the last line. Nothing in the pipeline would have stopped a run from comparing a mature module against a paraphrase. This is a different failure from the landing-page rule added in 1.1: that one is caught by the word floor, this one sails past it because the summary is long enough. The fix is a hard rule (resolve to the repo) plus the `gh api .../git/trees/main?recursive=1` one-call path lookup — the guessed path 404'd, the tree listing did not. Also: fetch every file the artifact splits across; the 770-word SKILL.md deferred all worked examples to a 1,241-word `references/details.md`.
- **Compare-mode runs must read the source as a checklist to FAIL, not a menu to shop.** Applied as a new Phase 3 subsection. When the invocation says "compare X with our implementation" the generative reading ("what can we take?") returns near-nothing against a mature module and tempts padding. Inverting to "which of these principles do we fail?" found both real defects. Two corollaries worth the words: the findings came from the source's *least* glamorous material (a one-word SMART bullet, an ASCII diagram) while its SQL and dashboard code — the parts that look like substance — were wholly inapplicable; and the catch table is the actual deliverable at these ratios (2 findings / 13 catches) and has to lead, not trail. Includes the rule that the outside checklist is not automatically the higher authority — this run declined its "cap at 5-7 KPIs" for a ranking the schema already stored, and recorded why so a future run does not re-litigate it.
- **A column with a DEFAULT and no writer on the dominant creation path is invisible dead configuration.** Not applied as a skill rule — it is a project fact and went to that repo's `codebase-stack.md` — but the *grep shape* generalizes and is worth naming here. `dev_kpis.tier` had a migration, a NOT NULL default, two live consumers, a UI control and an agent op, and was still constant in practice because the highest-volume creator never emitted it. Greps for the column look healthy; what is absent is a writer. Phase 6's existing catalog-vs-runtime check (Step 1b) is the same instinct one level up — when a finding depends on a field *meaning* something, check who writes it, and check the dominant creator specifically.
- **When a codebase has fixed an honesty bug once, grep the verdict function for its siblings.** Not applied (too close to Phase 6 Step 3b to earn its own step). The KPI dashboard already carried a documented fix for "unmeasured must not render as 0%" — applied at the bar renderer. The target-less case was the same bug one layer up, surviving because the earlier fix landed on the symptom rather than on the function computing the verdict. A repo that has written a comment explaining why one honesty case matters is a repo whose verdict function is worth re-reading in full.
- **Do not attribute a baseline delta to your own change without isolating it.** Not applied (session hygiene, not method). A mid-run `cargo check` moved the warning count 213→214 and the obvious reading was that the just-written Rust caused it. Stashing only my own file and re-running showed 213 both with and without — the extra warning was a concurrent session's in-flight edit to a crate I had not touched. In a repo with parallel sessions, "the baseline moved" is not evidence about your diff until you have isolated your diff.

## 1.3 - 2026-08-17 - personas (Chase AI Obsidian OS walkthrough)

- **A capped grep proves presence, never absence.** Applied as Phase 6 Step 4c. Mid-run I told the user "no tray icon either" on the strength of a `head -8`ed grep; the repo has `src-tauri/src/tray.rs` with exactly the window show/focus sequence the accepted finding needed. Ripgrep emits in path order, so the cap cut the one file whose *name* matched the concept — it sorted behind eight `commands/**` matches on the word "s**tray**". The sharp part is the timing: the same run had, one tool call earlier, deliberately read a backgrounded wide grep to corroborate a *different* absence claim (Step 4b working as designed), and then made the next absence claim from a capped result anyway. Obeying 4b does not generalize on its own; absence needed its own rule. Presence claims are safe to cap, absence claims never are.
- **Prefer the already-built-and-dark finding over the well-argued new feature.** Not applied as a rule (it is a ranking instinct, and Phase 7 already ranks). Worth naming: the strongest of three findings was a Tauri command that was implemented, registered, ts-rs-exported, and had zero callers anywhere — `get_recipe_outcome_tallies`. Nothing about it needed arguing; the product decision was already made by whoever wrote it, and only the wiring was owed. The two weaker findings both required persuading the user that a thing was worth existing. When a run surfaces an orphaned-but-complete surface, that is the one to lead with — and `docs/development/ipc-orphans.md`-style censuses go stale, so a command landing after the census is invisible to it.
- **On a product-demo source, name where the source is WORSE, not just where it is ahead.** Not applied (the 1.3 compare-mode subsection already covers the adjacent case). The 1.3 rule says an outside checklist is not automatically the higher authority; this run showed the same move pays on a *non*-compare run. Two of twelve catches were places the repo's answer is strictly better — a machine-built vault index vs. the video's hand-maintained `index.md` files, and a 1,026-turn bench vs. "Haiku because it's smallest and cheapest". Writing down *why* the repo wins is what stops the next run on the next Obsidian video from re-proposing them as gaps.
- **Codegen that lives in `predev`/`prebuild` has to be invoked by hand mid-session.** Not applied (project-shaped, but the class generalizes). `tsc` failed on three brand-new i18n keys until `scripts/i18n/gen-types.mjs` ran, and a new Tauri command needs `generate-command-names.mjs`. Both are wired into lifecycle hooks nobody runs during an in-session edit. When a repo generates a type tree from data files, run its generator immediately after touching the data, not at the gate.
- **Shell cwd persists across tool calls, and a `cd` for a build step will silently redirect later searches.** Not applied (harness hygiene). After `cd src-tauri` for `cargo check`, the next repo-root grep searched the wrong tree and "found" my own new Rust file as a match for a TypeScript hook query. Caught only because the result was absurd. After any build step that changes directory, `cd` back explicitly or use absolute paths.

## 1.4 - 2026-08-21 - personas

- **A gate the skill names in prose is not the gate the repo runs.** This run audited the repo's own
  `.claude/skills/` tree and found 12 skills each enumerating their own validation list; only 3 called
  the canonical `npm run check`, and **zero** named `census:check` — which lefthook runs at pre-push. A
  skill following its own instructions reported green and got stopped at push. Generalizes: when a repo
  has one composite gate command, a skill should CALL it, never restate its parts. Applied in SKILL.md
  Phase 8 (validation now routes through the composite gate).
- **Prose rituals duplicated across skills are the drift surface, and the ledger proves it.** The
  active-runs register/deregister ritual was prose in 23 skills with zero implementations. The file it
  governs had reached 3,429 lines with two rival `## Active` sections, three "Recently completed"
  sections, two incompatible entry formats, and 10 runs never closed. Deterministic steps (parse,
  place, timestamp, compare, trim) belong in a script the skill calls; only judgment stays in prose.
  Applied: `scripts/active-runs.mjs` + Phase 1.5/13h now invoke it.
- **Split the iteration log out of SKILL.md.** 337 of 1,658 lines (20%) were history that loads on every
  invocation and directs no behavior. `LESSONS.md` already established the on-demand-sibling contract in
  this same directory; the log simply never used it. Now `ITERATION-LOG.md`.
- **Absence claims still need uncapped greps — and presence claims need the RIGHT PATH.** Two near-misses
  this run. (1) `git add <SKILL.md>` silently no-oped because git tracks 11 of 36 skills as lowercase
  `skill.md`; Windows' case-insensitive FS let the edit land and the stage skip, so the commit looked
  complete. Resolve real paths with `git ls-files` before staging. (2) A worktree probe "proved" a gate
  failure was mine when the probe had merely changed relative-path resolution — the file-level argument
  (did I touch what it reads?) was the correct test.

### Redesign proposal — the isolated-index ritual must be ONE tool call, not a documented sequence

- CLAUDE.md primitive #5 prescribes `IDX=$(mktemp); GIT_INDEX_FILE=$IDX git read-tree HEAD; git add …;
  git commit …`. I followed it correctly and it still failed, because I split staging and commit across
  two Bash calls and **shell env does not persist between them** — so the commit silently used the shared
  index, reverted an entire prior task, and deleted a file, with green hooks and the right message.
  Recovered via `git reset --mixed HEAD~1` (content was all on disk). The ritual is only safe as a single
  invocation, which makes it exactly the kind of deterministic step that should be a script
  (`scripts/git-scoped-commit.mjs`) rather than a documented sequence agents retype. NOT applied here —
  it is CLAUDE.md-wide doctrine and the operator's call, not a /research change.

## 1.5.0 - 2026-08-24 - ai-registry

- **Re-seated onto the lane's overlay contract (1.5.0 -> 1.6.0).** The body declared itself "personas-specific" and hardcoded `C:/Users/kazda/Documents/Obsidian/personas` in eight places, including Phase 0's bootstrap and every "files updated" printout. On a second machine that root does not exist, so the memory loop the whole skill is built around wrote nowhere. The vault now resolves from an overlay candidate list and falls back to `<repo>/.research/`, which Phase 0 creates.
- **The overlays already existed; nothing read them.** `.claude/perfect/config.md` had been carrying the same repo's gates, i18n contract and context-source provenance for rounds. `/research` sat in the same checkout with a frozen copy of those facts inlined, including a locale count and a composite-gate name that only one repo has. The gap was never missing configuration - it was a body that never asked.
- **Three couplings had to be re-seated, not deleted.** (1) The catalog buckets B and C assumed one product's template and connector directories; they are now overlay-declared and simply absent in a repo that ships no catalog. (2) Phase 12's release-log machinery assumed one config file, one content directory and exactly 14 locale files; it now skips entirely unless the overlay declares `## Release log`. (3) The active-runs ledger and its helper script are optional - with no ledger declared, `git status` is the whole coordination surface.
- **Worked examples survive anonymization better than rules do.** The catalog-vs-runtime trap and the core-vs-plugin routing rule were written as one product's facts ("87 connectors", "dev-tools plugin"). Both generalize cleanly once the *denominator question* is stated as the rule and the product's real numbers move to the overlay's `## Domain notes` - and the general form is the more useful one, because the trap is not specific to connectors.
- **The engine survived untouched.** Source ingestion, web augmentation, the yield-calibration table, host-infrastructure-first, the capped-grep rule, scoring honesty, the security escalation rule, the four execution options and the mandatory atomic commit are all method. Re-seating changed where the run gets its facts, never how it reasons.

## 1.6.0 — 2026-08-25 — personas

- **New source type: a sibling product's codebase, read as an invariant checklist.** Apache Maka states
  its runtime invariants in prose ("a terminal header must be supported by a terminal fact"; "a path move
  is diagnostic, identity mismatch is a hard gate"). Against a mature repo those sentences test directly:
  4 findings / 9 catches / a large n/a block, and all three shipped findings were the same idea — a header
  claiming a state the facts do not support — in three places. Two moves made it work: (1) name the
  product's central mechanism in the opening line (Maka runs its own model/tool loop, Personas spawns a
  CLI) so whole chapters go n/a in one sentence instead of four dead findings; (2) the strongest finding
  was one clause in a 4,700-word chapter — compare-mode's "least glamorous material" rule held again.
  Worth a row in the Phase 3 calibration table: *sibling product codebase → medium findings, many
  catches, unusually actionable because the invariants are already phrased as tests.*
- **Attribute a red gate before reacting to it.** In a shared checkout both the clippy errors and all
  three census rises this run were in another session's dirty files (one clippy hit already at HEAD).
  First move on any red gate: `git status --porcelain`, then a file-level check of whether the failing
  site is in a file you committed. Ten minutes; it prevented "fixing" someone else's in-flight code. And
  the attribution itself needs the discipline of §4c: my first pass grepped empty outputs (I passed
  golden-path names to `--rule`, which returned zero rules) and would have "proved" innocence from
  nothing — assert the list is non-empty before grepping it.
- **Shared dirty files get committed as HEAD + your hunk, never as the working copy.** Applied to
  Phase 13c in this bump (1.6.0 → 1.7.0): `git show HEAD:<path>` + re-apply your edit programmatically
  + `hash-object -w` + `update-index --cacheinfo` into the isolated index. Three commits, three shared
  files, zero foreign lines. The isolated index was only ever half the ritual; this is the other half.
- **Prose payloads never go inline in shell.** A `node -e '…'` with an apostrophe in the text (`vault's`)
  and a quoted heredoc both broke bash quoting this run — one loudly, one as a silent no-op caught only
  because the next command errored. Write the payload with the Write tool (or to a file) and let the
  shell see only a path. Same family as the 2026-08-20 cwd-drift lesson: the tool answers a different
  question than the one asked, plausibly.

## 1.7.1 — 2026-08-26 — personas (openhuman → Athena companion)

- **A peer codebase is a source type the Phase 3 yield table doesn't have, and it behaves like a
  product demo.** Read `tinyhumansai/openhuman` (Rust+Tauri+React local-first AI, the same shape as
  the consuming repo) against Athena: **4 findings / 11 catches, ~1:3**, three shipped. Proposed row:
  *peer codebase / competitor repo → low findings + many catches; the findings come from the source's
  LEAST glamorous material.* Here they were a read-only diagnostic tool, an SVG score bar, and one
  enum variant in a learning cache — while its orchestration control plane, its agent-teams graph and
  its 560-file agent module were all catches or n/a. A generative reading gravitates to the big
  subsystems and finds nothing; compare-mode's "which of these do we FAIL" is what surfaced all three.
  NOT applied to SKILL.md: one run is thin evidence for reshaping a table 8+ projects read.

- **For a large-repo source, read the module READMEs, never the source first.** 5,820 files is not
  readable, and Phase 2b's landing-page rule has a sibling trap here: the repo root README is
  marketing. What worked, in three calls: `gh api .../git/trees/main?recursive=1` once, then
  `cut -d/ -f1-3 | sort | uniq -c | sort -rn` to find where the mass is (`agent/` 560, `memory/` 189),
  then fetch `<module>/README.md`. Four READMEs (~40KB) carried the entire design — public surface,
  calls-into, called-by, persistence, gotchas. Opening `.rs` files first would have cost 10x for less.

- **When a finding's fix trips a census rule, fixing it is usually cheap AND improves the change —
  budget for it instead of reaching for `--update`.** Two violations introduced, two fixed, net census
  **−11**. The FTS one forced the test to seed through the production writer (`episodic::append_episode`)
  instead of hand-syncing `companion_fts`, so the test now also fails if that writer stops mirroring.
  The bigint one removed a `bigint` field from a generated binding — a wire type `JSON.parse` can never
  produce. Neither fix was a workaround; both were the better code.

- **Fault-inject any test whose whole point is a refusal.** The end-to-end "a forgotten fact stays
  forgotten" test passed on first run, which proves nothing — a refusal test passes trivially if the
  candidate never appears. Disabling the gate (`if false && is_forgotten(..)`) made it fail at the
  expected assertion, then restore + re-verify. Cheap, and it is the only thing separating a behavior
  gate from a data gate.

- **Anchor path needles at a separator when attributing census drift.** My attribution script matched
  `src/lib.rs` as a substring and reported `src-tauri/db/src/lib.rs` as mine across three separate
  rules — three false "you broke this" panics on a file I never opened. Same family as §4c: the tool
  answered a different question than the one asked, plausibly. Compare against the exact dirty set
  (`git diff --name-only HEAD`), not a hand-written substring list.

- **Grepping your own long-running command's output can hide the finding.** Backgrounded a 25-minute
  crate-test run through `grep -E "^> cargo|^error|test result"` — the summary said `10 failed` and the
  failing test NAMES had been filtered out by my own pipe, so the file could not answer "which". Had to
  re-run. Log raw, filter on read.

## 1.8.0 - 2026-09-01 - pof (eval run, CoplayDev/unity-mcp, operator delegated)

- **Second sighting of the peer-codebase profile.** 2026-08-26 (openhuman → Athena) proposed a Phase 3
  row — *peer codebase / competitor repo → low findings + many catches, findings from the LEAST glamorous
  material* — and withheld it on one run's evidence. This run matched it exactly: 2 shipped / 5 persisted /
  13 catches / 3 n/a from ~30k words, and the shipped delta was a decorator argument
  (`annotations=ToolAnnotations(...)`) the repo's server never set. Two sightings; still not applied here
  (the table is read by 8+ projects and this run was an eval with no operator) — the next real run that
  lands a peer-codebase source should add the row.
- **Restore a fault injection by inverting the edit, never with `git checkout -- <file>`.** The injection
  did its job (the new guard failed on exactly the flipped tool), and the "restore" reverted the whole
  file to HEAD, erasing nine uncommitted edits with a green-looking build failure as the only tell. The
  tree recovered because the original insertion was a script. Generalizes the 08-19 "measure whether the
  intervention applied" lesson to the restore step: a restore is an intervention too, and `checkout` on a
  file with uncommitted work is a destructive one. Phase 6/8 could say it in one line where they ask for
  fault injection.
- **The security-escalation rule can fire on a documented DECISION; the honest output is then a
  deviation, not a CRITICAL.** "No auth boundary, single-owner tool" was a recorded decision; what the rule
  surfaced was that the repo's *own* doctrine ("loopback-only") is enforced by clients dialing 127.0.0.1
  while the server binds 0.0.0.0. Worth a clause in Phase 6: when the zero-auth grep hits a surface whose
  posture is documented, state the gap between the documented posture and the measured bind/gate, and let
  the operator own the severity.
- **Classify read-only by reading the route, not the description.** Eight POST-backed tools were pure
  (disk reads / compute); one description-identical sibling persisted a run. A `readOnlyHint` set from
  prose would have auto-approved a write. Pairs with Phase 6 Step 3b: the thing that decides is one layer
  down.
- **Worktree gates:** a package the root gate excludes (`tools/` out of tsconfig/vitest/eslint) has its OWN
  gate, and a fresh worktree lacks its `node_modules` — link it (gitignored) rather than reading the root
  gate's green as coverage. The skill's `## Gates` default ("detect from package.json") stops at the root.

## 1.8.0 - 2026-08-30 - personas
- Topic-driven invocation with NO pasted source works: when the argument names a
  popular external PRODUCT ("Grok bot, why is it popular, compare with our X"),
  Phase 2 becomes a bounded WebSearch/WebFetch round (3-4 calls) that builds the
  corpus, and compare mode then runs unchanged. Distill the product's popularity
  into named structural principles first; fail the repo against the principles,
  not the feature list. Both findings came from the one surface the user named.
- Cheap finding source discovered: grep the target module's schema/model comments
  for documented-but-unimplemented enum values (here `consumer='mention'` -
  "routes to an actor" - zero implementations). The schema often knows the
  feature before the code does, and the finding arrives pre-designed.
