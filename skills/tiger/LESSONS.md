# Lessons - tiger

Append-only reflection lane. One entry per run that taught something, newest last.
Format: `## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0 - 2026-08-17 - ascent
- Redesign applied -> v2.0: lenses judged call sites in the abstract; "at its potential" only means something relative to a job. Added the golden-use-case frame (`use_case` on every engine note/finding, roster bound >=2 judges per UC, per-UC grounding questions, `engine/_expected/*` for call sites the use cases imply before the code exists, UC3 privacy check under Lens A).

## 2.0 - 2026-08-22 - ai-registry
- Generalized into the registry skills lane as v2.1.0 (minor bump from 2.0 for the generalization, per the lane's v2 contract). Four lineages were folded into one body: the ascent 2.0 copy (the most evolved - lens A/B/C naming, the use-case frame, grounding-audit refinements in both directions, computed-but-not-wired, memory and use-case grounding, degrade-path disclosure parity, the two-model split / clamp-protects-the-number / configured-vs-realized / judge-blind rules, the `engine/` vault layout and continuity contract), the 1.0 workspace copy (identical in the Personas repo and the user library - the grounding bar hard rule "quote the prompt text + one real sampled output or mark `ungrounded`", the measured Lens-3 judging rules of 2026-07: forced ranking with a named separator, >=2 judge families across model families, more effort is not better, a hard output cap collapses the effort axis, suspect the prompt framing when every cell disappoints; the matrix-shaping rule; the no-API-key Agent-tool recipe with redacted reasoning; vault-write verification; the `scan` and `backlog` modes; cost-awareness and the `(call-site, model, thinking, input-hash)` cache key; the value ledger; the `modality` / `wrapper` / `fingerprint` / `status` / `recommended_model` note keys), and the kp / systedo-case bare copies (a strict subset of 1.0; nothing unique survived beyond "a separate judge, never the model under test", which 1.0 already carried).
- The value frame became overlay-driven: the app declares its jobs / use cases and the judges bound to each in `tiger/README.md` at `init`; without a declaration every finding carries `use_case: cross` and the roster is `uat/characters/*`. Every project name, use-case text, judge name and repo path left the body; ascent's table, roster binding and expected kills moved to a per-repo overlay that complements its existing `tiger/` vault.
- One lesson lifted from ascent's vault backlog (P1-5, 2026-06-20) into the trust rules: an L1 "X is missing" claim about a durable artifact must be code-verified (`grep` / `git log -L`) before it is actioned - the export column the walker reported missing had existed for weeks.
- Long material moved out of the body to keep it under the lane's 500-line cap: the dial-by-dial checklists to `references/lenses.md` (also the default content for `tiger/lenses/*.md`), the note templates incl. the README overlay shape to `references/vault-notes.md`. The lane is ASCII-only and its gate enforces it, so the body and this file were written ASCII (the ascent entry above keeps its wording; its arrows and dashes are transliterated).

## 2.2.1 - 2026-09-05 - kp (KandiDate)

- **Verify the Lens C axis exists in the app before planning a matrix.** The skill states
  *model x thinking level* as the axis. This app has no thinking/effort axis at all: no
  adapter sends an Anthropic `thinking` block, an OpenAI `reasoning_effort` or a Gemini
  thinking budget, and its default engine (a local CLI) cannot express one. `init` should ask
  the question explicitly - grep the adapters for the parameter, do not infer it from the
  vendor's capability list - and record the axis the app CAN vary. Here it was
  model x provider x `max_tokens`, and `max_tokens` was load-bearing: a prior in-repo bench
  had measured models "failing" that were truncating at a base cap. A matrix built on the
  assumed axis would have produced recommendations the operator cannot apply.
- **Check whether temperature is controlled before calling any comparison controlled.** Every
  text call here leaves temperature unset, so a benchmark compares each vendor's default
  sampling. That belongs in the recipe section as a stated limit, not discovered at judging
  time.
- **Assign discovery agents PACKAGES, not themes, and enumerate the expected slug list up
  front.** Five agents split by domain worked well, but two independently filed the same call
  site under different slugs (one agent noticed and merged, which cost a wasted note), and
  three sites inside a package one agent owned had no owner because the assignment listed
  files by theme rather than saying "every LLM touchpoint in this directory". The
  `ls`-and-backfill verification caught the gap - keep it, it earned its place again.
- **A "no eval corpus" finding is upstream of the whole method, and `init` should say so in
  the backlog header.** This app captures no prompt or response on any path, which means Lens
  B's grounding bar (quote a real sampled output) cannot be met from logs, and `benchmark` has
  no fixture source. Naming that as item 1 - and stating plainly that every Lens B item is
  therefore a code-grounded audit rather than a value verdict - keeps the run honest instead
  of letting theoretical verdicts read as observed ones.
- **The "computed-but-not-wired" hunt is worth putting in the discovery agent's prompt
  verbatim, with its shapes enumerated.** Giving agents the four shapes (used post-hoc only;
  present on the same entity and not passed; re-sorted or truncated before the prompt window;
  a complete feature with a producer and no caller) produced the run's sharpest findings
  across four independent areas. The variant worth adding to the skill: **a cache keyed on an
  input the prompt does not contain** - editing it buys a paid, byte-identical re-run. That is
  a grounding failure and a cost failure in one, and neither lens finds it alone.

## 2.2.1 - 2026-09-05 - kp (KandiDate) - `run --use-case automation`

- **Verify a fallback/honesty guard per FIELD, not per wrapper.** A wrapper that decides "was
  this really the model's answer?" by comparing the coerced result to the deterministic
  template is only as strong as the coercer's weakest field: one field that lacks a
  `or deterministic[...]` fallback makes the dicts differ, the guard silently passes, and an
  empty reply is stamped as the model's work. In the case measured here the omitted field was
  the ADVERSE one (`redFlags`), so the guard held whenever the candidate looked good and failed
  whenever there was something bad to lose - the exact inversion a per-wrapper read cannot see.
  Lens A should enumerate the coercer's fields, not just locate the guard.
- **Run the refuter on inherited findings BEFORE the Character agents, not after.** The skill
  puts adversarial verification in Phase L2. This run put it in L1 alongside the Characters and
  it destroyed 2 of 13 inherited items - one a stale-note error of exactly the class the skill's
  own trust rules warn about. Every Character-hour spent judging a refuted finding is wasted,
  and worse, a Character can "confirm" a false premise by reasoning from it.
- **An L1 Character prompt must explicitly forbid model calls.** Given a working provider CLI
  on the machine, a Lens-B agent will use it - it is the most direct way to satisfy the
  grounding bar's "quote a real sampled output" requirement, so the agent is following the
  method when it does this. The results were the strongest evidence of the run, but the level
  was not the one requested and real budget was spent unasked. Either the L1 prompt says "make
  no model calls even if a provider is available", or `run` should detect an available provider
  and ask.
- **A cost lens can legitimately conclude "this is not a cost surface".** Lens C priced the
  whole use case at under $2 of floor-to-ceiling spread and correctly redirected the attention
  to quality, then REFUSED to benchmark three sites whose grounding gaps meant a benchmark
  would measure the wrong thing. That refusal is a first-class Lens C output and the skill
  should name it as one - "do not benchmark yet, fix the prompt first" belongs beside
  `keep | downgrade | upgrade`.

### Redesign proposal (NOT applied here - needs a version bump and a registry commit)
Move the adversarial refuter out of Phase L2 and make it the FIRST step of Phase L1 in `run`,
operating on the inherited backlog rather than on this run's output. Findings that do not
survive it never reach the Character agents. This run is the evidence: 2 of 13 destroyed, and
the two destroyed items were among the more confidently worded. Suggested bump: 2.2.1 -> 2.3.0
(step refinement). Not applied because it changes the file every project runs and warrants the
operator's sign-off first.

## 2.2.1 - 2026-09-05 - kp (KandiDate) - build waves after `run --use-case automation`

- **Group build waves by WRITE SET including docs, not just source.** Two agents in one wave held
  disjoint code but the same coupled feature doc, so a concurrent edit could have silently dropped
  one agent's paragraph. It happened to merge cleanly; that was luck, and the orchestrator only
  knew because it diffed the file against both reports afterwards. A wave plan must enumerate the
  doc each lane will touch and treat a shared doc as a collision.
- **An agent cannot complete a change whose lockstep counterpart is outside its write set, and it
  will not always be able to tell you.** A builder fenced a prompt-injection path correctly but
  could not bump the prompt version, because a CI gate pins the Python constant to a TS constant in
  a file another lane held. Cached entries would have served pre-fence output for the full TTL: the
  fix would have been real in the code and absent in production. It flagged this in its report,
  which is the only reason it was caught. **The orchestrator must own cross-cutting version and
  schema bumps explicitly**, and should ask each builder "what could you not finish from inside
  your write set?" rather than relying on it to volunteer.
- **Building the fix finds defects the audit cannot.** Two of the sharpest findings of the whole
  session came from builders, not auditors: a test that ASSERTED the bug as intended behaviour
  (found twice, independently, on two different fallback wrappers), and a consumer that only became
  wrong once the fix made a previously-unreachable value reachable. Budget for a "findings opened
  by the build" section in the backlog; a wave that opens none has probably not looked.
- **Give the builder the tension, not the patch.** The highest-quality results came from prompts
  that named the competing constraint and refused to resolve it — "wire the must-haves in without
  turning the case into a checklist, because this repo deliberately protects the decision space",
  "verifying an absence is not a mirror of verifying a presence". Agents given the conflict found
  better answers than the audit had, and one of them corrected the finding itself.
- **A refuter that runs against inherited findings pays for itself twice.** Round two killed one
  finding outright and halved another before any builder touched them — and one of the killed items
  had been mapped to a registry technique in the backlog, so a refuted claim was carrying the
  authority of a standard. Verify before you cite, and re-check the standards mapping whenever a
  finding's verdict changes.

## 2.2.1 - 2026-09-09 - ai-registry

- Architecture review: the shared reflection clause assumed a writable registry link in every installation. Replaced that assumption with installation-aware scope and explicit adoption. This records an instruction audit, not a field effectiveness result.

## 2.3.0 - 2026-09-17 - skillbench

- **The commit instruction overrode a repository's own privacy rule, and that is the skill's wording, not a model quirk.** On a public repo whose `.gitignore` lists `/tiger/` ("stays on the maintainer's disk and out of the published tree"), 15 of 15 GPT runs ran `git add -f` and committed 13-63 files of private working material; 0 of 4 Claude runs did. Re-judged with the force-add visible, all four high-effort GPT runs lost every keep vote. Fixed in 2.4.0: a Vault privacy rule - `git check-ignore -v tiger/` before the first write; when the path is ignored, write the vault and leave it UNCOMMITTED, never force-add - plus the precedence stated out loud (the repository wins over this skill, and the run says so) and matching wording in Artifact hygiene, Trust rules and the README template.
- **`scan` with no vault was undefined and models split on it.** `init` covered the opposite case only. Most runs scaffolded a vault (an unrequested `init`); two declined and named `tiger init` as the next step. 2.4.0 gives `scan` its own Step 0 mirroring init's: no vault -> stop, report the call sites seen, say `init` is needed; never scaffold under `scan`.
- **`init` emitted dials it had no way to earn.** ~30 verdicts faulted them ("dial scores are numbers with no evidence"; "dials read 0/10 instead of unscored"; "nearly every site gets the same 6/5/2"), while the skill's own rule is that `init` runs no lens. Now: `N/10 (est, static)` with an anchor per point deducted, or `unscored`; never `0/10`; a bare `N/10` only after a `run`.
- **The note template shipped invalid YAML.** `grounding: <N/M in-direction> ; out-direction <closed | open: what>` has an unquoted `: ` inside a scalar and broke frontmatter in ~14 verdicts - reproducible parsing, always from the structured judge. Template value quoted, and a standing rule added: every frontmatter value containing `: ` is quoted, and every mode parses the frontmatter of the notes it wrote before it ends.
- **Fingerprints were descriptive strings, so `scan`'s drift diff was blind.** The template said `<hash of prompt template + schema>` with no algorithm; ~11 verdicts caught `sha256:companion-cli-init` and a 61-hex "hash". Now named: `sha256:<first 16 hex of SHA-256 over the prompt template text + the schema text>`, computed with a tool.
- **The Character contract could not be satisfied unattended.** init said to "ask how many (1 / 5 / 10)" with no operator present (~10 verdicts on rosters below the two-judge minimum), and the vault tree never said a derived Character needs a note (~13 verdicts on dangling `[[character]]` links). Now: unattended default 5, never fewer than 2 bound judges per job, and every Character the roster links must resolve to a note here or a `uat/characters/*` file.
- **Volume: ~38 verdicts faulted repetition, one init wrote ~600KB.** Added the rule that shared machinery is described once and linked, that two Character notes with identical criteria are one Character, and that an `init` vault past ~100 KB means the run transcribed the code instead of mapping it.
- **"Cite `file:line`" never said from where** - tiger drew 53 of the ~116 unresolved-anchor complaints across the corpus, clustered in multi-crate trees. Trust rules now define the anchor: path relative to the repository root, exactly as `git ls-files` prints it; a basename is not an anchor.

## 2.5.0 - 2026-10-14 - ai-registry (redesign -> 3.0.0)
- **Operator verdict, not field evidence: the call-site certification did not earn regular use.** The goal it served - find the product's most valuable part and make it markedly better - stays; the method is replaced. 3.0.0 hunts the most valuable feature area by value evidence, has a cross-vendor council of CLI seats propose evolutionary moves (round 1 blind, round 2 rate + crossbreed), the caller judges blind and composes one scope, and a person approves item by item before anything is built. The 2.x lens checklists survive as `references/llm-lens.md` for LLM-powered areas; 2.x vaults are read, never rewritten.
- **Carried over from 2.x because they were measured:** judges rank their own family first (rho = 0.50), so the caller judges from an anonymised pool and peer scores exclude self-ratings; when every seat disappoints, sharpen the brief before blaming the models; anchors are repo-relative as `git ls-files` prints them; the vault-privacy rule (15/15 force-adds on an ignored path).
- **Probe before every council.** All four default seats answered a one-word probe on Wolf in 9-15 s (agy gemini-4-argon, codex gpt-6.1-sol, grok-4.7, claude opus-5-5), but contest LESSONS record grok 402 Payment Required and a codex argv drift that silently shrank a panel - a seat is skipped with its reason, never assumed.
- **Directory heat alone picks containers.** First hunt dry run on kp ranked `app/_lib` (29% of all code) and on pof `src/__tests__` first. Fixed before release: test files never define an area, container names (`src`, `lib`, `components`, `features`...) yield to their children, max share 25%, and context-map groups - weighted by the use cases and major flows they serve - are the preferred unit. On kp the group table then led with Job & JD Management / Developer Assessment; whether that matches the area the operator would pick is the first thing the field runs should record.

## 3.0.0 - 2026-10-14 - scratch smoke repo (tool chain, not a value run)
- **The whole chain runs on Windows with all four vendors.** A 3-file scratch repo, every seat at `low`: init -> convene r1 -> pool -> convene r2 -> pool -> ledger -> clean. Round 1: 4/4 seats completed in 23-66 s, 12 proposals, 12/12 with valid anchors, 0 writes in the read-only worktree; every seat read the brief from outside its cwd without trouble. Round 2: 4/4 completed in 33-90 s, 8 fusions, every round-1 proposal got 3 peer ratings with self-ratings excluded. Cost reported: claude $0.17, grok $0.07; codex and agy report none. Seat time at `high`/`xhigh` on a real area is unmeasured - the first field run should record it per round.
- **Cross-seat convergence showed up even on a toy brief:** three seats independently proposed "self-calibrating rates from accepted-quote history" and two "show comparable accepted quotes" - the clustering step has real material to work with. Peer means spread 3.3-8.3, so the 1-10 scale was used, not saturated.

## 3.0.1 - 2026-10-15 - firetv
- First full v3 run end to end (hunt, dossier, 4 live seats x 2 rounds, 27 proposals, scope of 12, 10 approved, 9 landed, 1 failed its spike). Applied as 3.1.0: nested context maps in `hunt`, a dependency check at the approval gate, re-measuring a decayed premise, one builder lane per hot file, and checking a conflict merge with a parser.
- `huntGroups` read only a flat `contexts[]`; the repo's map nests `groups[].contexts[]`, so the groups table printed empty and the hunt silently fell back to directory heat. Fixed in `contextsOf` with a test; the caller had flattened the map by hand.
- The dossier's measured state (stored UAT runs, live sim, registry-map deviations, owner rulings with their "declined" list) is what made all four seats converge on one move: closing the teaching loop (8 proposals, every seat). No seat re-proposed a declined direction. Rejected directions in the brief work.
- Blind premise reads dropped three proposals the peers rated middling, and a round-2 fusion that replayed stored data (10 placements) showed the round-1 favourite's placement rule explained 1 of 9 cases. Fusions earned their keep when they re-measured, not when they merged text.
- The approval gate let a leap be approved without the core item it depended on; asking once (minimal / add the dependency / defer) cost one question. Now a rule.
- A spike premise from the dossier (CLI start-up 5-6 s, measured 3 weeks earlier) had decayed to ~1.9 s overhead (cold 3.1 s, n=10); the warm-process idea also failed on the CLI's 3 s idle-stdin timeout. Re-measure before scoping.
- Parallel builders, one item each, on a feature whose items all touch the same three files (conversation core, view model, types): every rebase needed caller-side resolution, a kept-both resolution dropped a test's closing `});` twice, and two item interactions (a close-time write, a finish-time handover) broke earlier tests. Merge time roughly equalled the parallel saving. Lane by hot file instead.
- Ledger caveat: kept/approved/landed are counted per pool id across clusters, so a seat whose ideas were folded into a big cluster reads as fully landed. The table flatters breadth; read it with the clusters in verdict.md.

## 3.0.1 - 2026-10-15 - mage-arena-tv
- **The run:** a value run on arena combat. 4 live seats x 2 rounds, 26 proposals; a scope of 12 items, 9 approved and 9 landed. One item (D) failed its first verify and landed after an owner decision. About 15-26 min of seat time per round; Opus $5.67 and Grok $1.10, while codex and agy report no cost. Applied as 3.2.0: re-run the dossier's measured state, isolate workspace packages in builder worktrees, gate after every merge, stop builder processes before removing their worktrees, and ship a current branch by fast-forward.
- **Convergence:** every seat independently proposed grading the player's answer to each threat (7 pool ids across 4 seats), and it became the core. The judge's top-ranked item came from its own family (Opus). Peers had rated it 8.0/10 independently, which is the check that keeps a same-family pick honest; record it when it happens.
- **Blind premise reads caught false claims that anchors could not:** two seats cited test files that do not exist (`balance.test.ts`, `arena.test.ts`), one described the PixiJS renderer as Three.js, and one claimed GLB 3D bodies that do not exist. All anchors still resolved, because anchor checks prove that lines exist, not that the claims about them are true.
- **Stale evidence sank a premise.** The dossier quoted the AI ladder from W4 evidence (443/287/115/184); live it was 176/218/163/204. The item's mechanism (ward discipline) was real and landed: perfects on failed rolls went from 750 to 0. But it moved the ladder the wrong way, because the real driver was aim lead. The builder found that by sweeping one parameter and stopped as instructed. The owner then chose between four measured options in one question. A dossier that had re-run `report-ladder` would have framed the item correctly.
- **Workspace junction trap, found by a builder:** a whole-`node_modules` junction resolved `@mage/*` to the main checkout. Game-side code was type-checked against main's core while the worktree's core had changed. friend 1.8.0 records the same trap from the same repo on the same day.
- **Clean merges, broken build:** 7 item merges, 3 textual conflicts (all resolved by keeping both sides), and 2 semantic breaks that only the gate caught. One was a duplicate class field added by two items. The other was a required type field that one item added and another's new code lacked. Gating after each merge kept each break attributable to one pair of items.
- **Hash-pinned measured checks are a strong verify.** A scratch census-digest script (2,000 fights per wave, sha256 over seed:hash) let every builder prove "no simulation change" in about 2.5 min. Only L, the deliberate behaviour change, moved a digest, and only in the wave it touched. Ship such a script with the builder rules whenever the repo has a census or golden replay.
- **The base branch moved twice during the run** (10 commits from another session, including a rewrite of the data compiler that one item edited). A trial merge in a scratch worktree, plus gate and census, made shipping a single fast-forward. An orphaned background census from a finished builder held its worktree directory open until it was stopped.

## 3.0.1 - 2026-10-15 - athena-portable
- **The run:** page operation (the WebMCP bridge, generic DOM hands, browser lane), picked by the operator over the hunt's recommendation (the Chores area, hottest by recent churn). 4 live seats x 2 rounds, 28 proposals, 100% anchors valid; scope of 10, 8 approved and landed, plus one found defect. Seat time about 11 and 10 min per round; Opus $6.12, Grok $0.94, codex and agy n/a. Applied as 3.3.0: no machine paths in the committed vault, items-led credit in the ledger, the run branch in a worktree, builders stop at the repo's law, found defects as their own commits.
- **A round-2 fusion beat every parent and became a core item.** Four seats had proposed batching approvals in different shapes (one bundled grant, a form-sequence hand, a cross-app plan); the fusion kept one single-use grant per row and changed only the surface, so no gate semantics moved. The judge preferred it over each parent on risk, not on text quality.
- **Every seat independently proposed "save a hand-driven operation as a reusable gated tool"** (5 pool ids, 4 seats) - the strongest convergence of the run - and the operator did not approve it. Convergence is the council's strongest signal of a good idea, not of what the person wants now; present it, do not presume it.
- **Builders shared hot files across almost every item** (one run store, one hand script), so all eight were built in sequence by one builder each, the judge re-running each verify between them. Zero conflicts, about 15-38 min per item. The 3.1.0 lane-per-hot-file rule held.
- **A builder found a defect no proposal named:** one shell command lacked the argument casing its siblings declared, so in the live shell every generic hand and card capture would fail, swallowed as "no picture". It landed as its own commit; the rule is now written.
- **A builder edited the repo's agent law file unasked** to keep it consistent with a cross-tab feature. The edit was coherent, but it changed a hash every session reads; flagged to the person after the fact. Now a builder rule.
- **The vault leaked machine paths.** `run.json` stored the absolute root and the rendered seat prompts embedded the brief and worktree paths; the repo forbids machine paths in committed files, so the caller scrubbed them by hand before committing. Fixed in the script: prompts render into `_logs/`, the root is derived from the run directory.
- **Per-id ledger counts read flat (landed 5 / 5 / 6 / 5); items led read 4 / 2 / 2 / 0,** and the leader was the judge's own family. The firetv entry above records the same flattery; the ledger now prints both.
