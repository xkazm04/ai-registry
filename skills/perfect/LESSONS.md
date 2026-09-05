# Lessons - perfect

Append-only reflection lane. One entry per run that taught something, newest last.
Format: `## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 2.0 - 2026-08-09 - personas-web

- **When the tree is shared, the one-branch-per-wave rule inverts.** Phase B says
  `git switch -c perfect/<date>` from a clean master. That assumes the wave owns the checkout. In
  this run the checkout was shared with other live Claude sessions *and* an unrelated builder agent
  mid-edit; switching the branch would have yanked it out from under them — a destructive act the
  method currently prescribes without qualification. The correct move was scoped
  `git commit --only -- <paths>` straight onto master, which is already the skill's guardrail for
  sibling safety. **Proposed SKILL.md edit (not applied):** add to Phase B step 2 — *"Before
  creating the wave branch, check `.claude/active-runs.md` AND for in-flight agents in this
  checkout. If either is present, do not switch branches: commit to the current branch with
  `--only` scoping. A branch switch is a whole-tree mutation and obeys the same sibling-safety rule
  as `git add -A`."*

- **A live sibling agent is a write-set constraint, not just a hazard.** The wave planner correctly
  partitions *accepted directions* by write set, but says nothing about files owned by an agent
  that is not part of the wave. Here 3 of 5 accepted directions had to be deferred to wave 2
  because a module-enrichment builder held those files. Phase B step 1 should treat non-wave agents'
  write sets as reserved, exactly like a sibling lot's.

- **The gate worked precisely as designed and that is worth recording:** the Director's own scout
  found that the *locked, already-approved* hero violated two rules the owner had set later in the
  same session (a type floor, and a benefit-first copy rule). Directions grounded in "the owner's
  own stated rule, broken in code at these line numbers" got a 5/5 accept — the highest-yield
  direction shape so far. Generalizes: **mine the user's recent corrections for rules, then grep the
  codebase for places that violate them.** That beats inventing improvements.

- **Builder refusals are signal.** The builder was told to adopt `SectionIntro` and instead argued
  it down with evidence (its `fadeUp` variants are parent-driven and ungated; no global
  `MotionConfig` exists; adopting it would break the reduced-motion acceptance criterion) and
  composed the underlying primitives directly to get the same idiom. The brief template should
  invite this explicitly: *"if an instruction in this brief conflicts with an acceptance criterion,
  follow the criterion and say so in your report."*

- **Benefit-first copy has an accuracy failure mode.** Rewriting internals into user value tempted a
  claim ("nothing happens without your say-so") that the product's own default setting makes false.
  Worth a line in the direction quality bar: **a benefit claim must survive a fact-check against the
  product's default configuration, not its most flattering one.**

## 2.0 - 2026-08-10 - personas-web (/athena page, later waves)

- **A builder that dies has usually already done the work — check the tree before re-dispatching.**
  Two of three parallel builders failed to resume (harness fault, not code). Both had written
  complete, lint-clean, under-limit directories and died before their gate/report/commit step. The
  cheap recovery is: lint the orphaned dirs scoped, confirm the entry point exists, confirm the only
  type errors belong to *still-running* siblings, then commit on their behalf with a message that
  says plainly what was and was NOT verified. Re-dispatching would have paid full price to
  regenerate work that already existed. **Add to Phase B builder-death recovery: inspect and salvage
  before assuming loss.**

- **Corollary — dead builders cannot clean up after themselves.** Each had left a temp preview route
  (and one a stray script at repo root). The Director must sweep those as part of recovery, and must
  distinguish the dead builders' leftovers from a still-running sibling's — deleting the live one's
  scratch route mid-run would break it. Name temp artifacts per-builder so ownership is legible.

- **A tree-wide `tsc` is not a verdict on one builder during a parallel wave.** The single type error
  on the tree belonged to the one builder still writing; scoping lint per-directory and reading
  *which* file the type error names is what separates "this variant is broken" from "a sibling is
  mid-edit". Report format should ask builders to name the file, not just the count.

## 2.0 - 2026-08-10 - systedo-case (Adamant)
- The one-branch/disjoint-lots shape ported cleanly OUT of the personas repo into a Next.js/Vercel repo with no Rust and no Class C codegen: 6 lots, 11 commits, zero cherry-picks, one ff-only merge. The Class C list is per-repo (here it was effectively empty — colocated TDict i18n needs no Director-applied locale step); briefs should derive it from the repo overlay rather than assuming the personas set.
- Two shared-tree traps worth adding to the brief template verbatim: (1) commit messages only via bash-quoted -m or a uniquely-named -F file — a PowerShell here-string leaked a lone `@` as a subject twice; (2) NEVER `git commit --amend` in a shared tree — a sibling committed between commit and amend, and the amend re-messaged the sibling's commit (recovered byte-for-byte via commit-tree + update-ref).
- Non-interactive history repair at quiescence works: GIT_SEQUENCE_EDITOR="sed -i '1s/^pick/reword/'" + GIT_EDITOR=a-script-that-copies-the-fixed-message. Do it before any final SHAs are recorded — every descendant SHA changes.
- Builders share the harness session scratchpad — temp files need builder-unique names; a commit-message file was overwritten mid-wave.

## 1.0 - 2026-08-17 - pof

- **A per-project skill copy can be silently shadowed by the workspace library copy, and nothing warns
  you.** `pof/.claude/skills/perfect/SKILL.md` existed, was well-formed, and was *not* what the harness
  registered — `~/.claude/skills/perfect/SKILL.md` was. The tell is the description string in the
  available-skills listing: it read "walks the repo's context map" (library wording) where the project
  copy said "walks context-map.json". Consequence: `/perfect` in a Next.js repo was running a method whose
  builder brief ordered `npm run check`, `cargo test export_bindings`, 13-locale translation and
  `src-tauri/src/lib.rs` Class C handling — none of which exist there. **Add to Phase 0: compare a
  distinctive phrase from the project copy's `description:` against the registered listing before trusting
  that your edits to the project copy govern anything.**

  ### Redesign proposal
  The root cause is that this skill mixes an application-agnostic *method* (roles, vault schema, the P/B/W
  state machine, the disjoint-lot wave shape) with a per-repo *overlay* (gates, repo law, Class B/C file
  lists, vault path, dev port). That mixture is why a library copy and a project copy must both exist and
  therefore why one can shadow the other, and it is why the reflection contract's "copy to
  `~/.claude/skills/<name>/`" sync step is actively unsafe here — publishing PoF's copy would impose PoF's
  conventions on every sibling. **Split SKILL.md into `SKILL.md` (method, publishable to the library) and a
  repo-resolved overlay (`config.md` in the vault, or `OVERLAY.md` beside the skill) that the method reads
  at Phase 0.** Not applied in this bump: it changes the file layout for every project already running the
  skill, so it wants its own coordinated change. Guarded against in the meantime by a second exception on
  the sync ritual forbidding step (b) for this file.

- **The filename case is load-bearing and `core.ignorecase=true` hides it.** Git tracked this skill as
  `skill.md` while every sibling skill in the same repo was `SKILL.md`; on Windows both resolve, so the
  defect survived indefinitely. It would break skill discovery on the first case-sensitive clone (CI, a
  Linux peer). Worth a one-line check in any skill-authoring pass: `git ls-files .claude/skills/` and
  confirm the casing matches its siblings, since the working-tree `ls` will not show you the mismatch.

- **A user's go-ahead is scoped to the facts it was given, and concurrent-session facts expire in
  minutes.** The operator approved a 206-commit sync of a sibling repo on the stated basis that no dirty
  file was touched by an incoming commit — true when measured, false 14 minutes later, because the live
  session in that tree had moved on to `Cargo.toml`/`Cargo.lock`/`lib.rs`, all of which the incoming
  commits also touch. **Re-measure a concurrency precondition immediately before the mutating command, not
  at the moment you ask about it** — an approval is not a lease on the other session's tree.

## 2.0 - 2026-08-17 - pof (same session, after applying v2.0)

- **The `@'...'@` commit-message trap is not a PowerShell caveat — it is a BASH-tool trap, and v2.0's
  own wording got that wrong.** The inherited lesson read "never a PowerShell here-string", which
  reads as advice for people using PowerShell. In fact the damage happens when that syntax is passed
  through the *bash* tool: bash has no here-string operator there, so it keeps the leading `@` as the
  first line of the message — i.e. as the subject. I hit it **twice within twenty minutes of writing
  the rule into the file**, producing `@ skill(perfect): v2.0 …` and `@ chore(ledger): …`. Neither is
  fixable after the fact: `--amend` is forbidden in a shared tree, and in the pof repo a sibling
  session had already committed on top within minutes. Applied in v2.1 with the mechanism spelled out
  plus a `git log --format=%s -1` verification step. **General form: a rule that names the wrong
  cause teaches the wrong avoidance.**

- **Regenerating generated files beat every alternative at merge conflicts — second toolchain, same
  result.** A 206-commit merge conflicted in exactly three files: one append-only ledger and two
  codegen outputs (`commandNames.generated.ts`, `enSectionStrings.ts`). Taking either side would have
  dropped one of the two contributing sources; running the generators reconciled both automatically
  (1586 commands from the merged `lib.rs`). This is the method's existing "regenerate from source,
  always" rule validated outside the repo it was learned in, and it is worth stating that **conflict
  count is a poor proxy for merge risk** — 206 commits produced 3 conflicts, of which 2 were not
  really conflicts at all.

- **A concurrency precondition is a measurement with a shelf life of minutes.** Recorded already in
  the 1.0 entry below, but re-confirmed in the opposite direction the same session: the merge that
  was unsafe at 19:00 was safe at 21:38 because the sibling had wrapped. The operational rule is
  symmetric — re-measure before acting, and a "blocked" verdict deserves a retry just as much as an
  "approved" one deserves a recheck. **Blocked is a timestamp, not a state.**

## 2.1 - 2026-08-18 - pof (autonomous sweep, 3 waves / 27 directions shipped)

- **The Director's predicted EFFECT is the most dangerous sentence in a direction note.** I wrote
  "this will visibly move cells off green — that is the point" into a provenance fix. Measured against
  the real DB, it lost *zero* greens and instead lifted 17 cells off RED: the map had been
  over-condemning on provisional verdicts its own drill-down already refused to apply. Wrong in
  DIRECTION, not degree. A builder that trusted the framing would have tuned toward it. **Phrase
  predicted effects as hypotheses to measure.** Applied in v2.2.

- **A criterion that correctly bounds one change will sometimes correctly block the bigger fix that
  change uncovers — and the Director must then act.** "No audited step may change class" properly
  scoped an engine-fallback fix, and properly stopped the builder fixing the real defect one seam
  down: an unrecognised engine name defaulting into the TRUSTED bucket, mis-classing 95 audited steps.
  It mattered *because* the same wave had just routed 10 newly-un-condemned cells through that
  mismatch. **If your wave creates an overstatement, your wave corrects it** — as a separate commit,
  in the same wave. Applied in v2.2.

- **Re-measure a builder's headline number before repeating it.** The builder reported 82 affected
  steps; the independent re-count found 95 — an entire engine string had been missed. Builder numbers
  are evidence, not verdicts. Applied in v2.2.

- **Evidence coordinates rot within a single session.** A wave-3 brief cited `file.ts:43-46`; wave 2
  had already moved that code to ~55-62 by inserting a function above it. Cite the SYMBOL beside the
  line number. Applied in v2.2.

- **"This input is unused so dropping it is free" is the costliest wrong premise this loop produces.**
  Twice now. Prove it by following the consumer, never by reading what the consumer is *for*. Applied
  in v2.2 (direction quality bar).

- **A bash-quoted `-m "..."` is NOT safe for commit bodies.** Double quotes run command substitution,
  so a backticked symbol name is silently eaten mid-sentence. Single-quote any message containing
  code, `$` or backticks. (The v2.1 lesson fixed the `@'...'@` half and left this one.) Applied in v2.2.

- **Temp-file rules need a LOCATION, not just a name.** Told to name temp files with their lot id,
  a builder put measurement harnesses in `src/__tests__/` — where the integration gate executes them —
  and dumps at the repo root. Scratchpad only, never a test tree. Applied in v2.2.

### Redesign proposal
Seven of this session's directions were auto-accepted, dispatched, and then materially corrected by the
builder — wrong evidence line, wrong scope, wrong predicted outcome, or a premise that did not survive
contact with the source. That is a ~30% brief-defect rate, and every instance was caught by a builder
reading the code the Director had only read *about* (via a scout brief). The scout→Director→builder
chain loses fidelity at each hop, and the Director is the only link that never opens the file.
**Proposal (NOT applied): before a direction is dispatched, the Director must personally verify its
single load-bearing evidence line in the source** — not the whole brief, just the one claim the
direction stands on. In this session every Director spot-check (the crash id-equality lookup, the
`PofBridgeStatus` shape, the `useUE5Connection` zero-consumer claim) held, while un-spot-checked
scout claims failed repeatedly. One grep per direction would have caught most of the seven. Not applied
now because it changes the propose-phase cost model and deserves its own measured round.

## 2.2 - 2026-08-18 - pof (the bare-commit sweep - foreign session, not a builder)

A research sibling session appended to `.claude/fleet-memory.md` and committed with a BARE
`git commit` (`906783b6`) at the instant a wave-9 builder had `git add`ed two NEW test files ahead of
its own `git commit --only`. The sibling's commit swept both files in. Content is correct at HEAD;
attribution is off; nothing was lost.

**What the protocol already got right:** the builder's `--only` would have protected ITS commit from
the sibling's staging — the hazard is the reverse direction, and `--only` cannot defend against a
foreign bare commit. `git add` of a NEW file is the one moment a builder's work sits in the shared
index unprotected.

**Rule change (SKILL.md v2.3):** builders should stage-and-commit new files in ONE step —
`git add <new> && git commit --only <new> <modified...>` as a single command, minimizing the window —
and the fleet-memory CLAUDE.md rule should say explicitly: *append with `git commit --only
.claude/fleet-memory.md`, never a bare `git commit`.* Not a builder failure; a shared-tree hygiene
rule that only this loop's participants currently follow.

## 2.2 - 2026-08-22 - ai-registry

- **Generalized into the registry skills lane as 2.3.0** (highest copy 2.2 → 3-part → one MINOR bump for
  the generalization). Seven copies merged: pof 2.2 + LESSONS (the canonical body — shared-branch wave
  model, write-set grouping, vault-clobber rules, the overlay concept); the user-tier 1.0 + LESSONS and
  the personas 1.0 copy (Rust lot cap, shared-build-cache lock, gate calibration on new warnings, the
  isolated-index commit form, the 2026-08-08 three-source context disagreement, the 24m05s/28m29s
  worktree bill, the outbox ingest rules); ascent and kp 1.0 (round shape, queue tiebreakers, one-ahead
  prefetch, delta re-scout and the "near-polished" verdict, never-pad slates, the data-path rule, the
  AskUserQuestion ≥ 2-options constraint, bugfixes-stand-alone, format owner, the visual pass with tab
  recycling and the SSR-curl plan B, source-guard tests, no dev server in a worktree, ingester caps);
  personas-web 1.0 (vault namespacing, commit-format override, locale-count sizing, pre-scouted feature
  docs, out-of-scope walls, "already polished" headroom caution); systedo-case 1.0 (slow LLM pre-commit
  gate, concurrent-agent discipline, sample-vs-live seam scouting, git-ignored in-repo vault).
- **The overlay is `.claude/perfect/config.md` in the consuming repo — ONE file, tracked.** The 2.2 copy
  kept a `config.md` in the vault; that cannot hold the vault path itself, and the vault is not
  version-controlled (the very reason the clobber rules exist). The vault's `config.md` is retired and
  migrated on first run; `## User taste` and `## Skill improvement log` move into the overlay and are
  committed with `git commit --only`. Every key has a default so the method runs with no overlay.
- **What moved out of the body into overlays:** vault roots and namespaces, base branch, gates (always /
  conditional / slow / builder), Class B and Class C file lists and their Director-side application
  commands, repo law digests and review conventions, product/stack brief headers, commit formats, smoke
  ports/bridges/DB paths/seed scripts, context-map provenance facts and coverage name sources,
  opportunity arcs, vetoes, taste. Per-project overlays were written for pof, personas, personas-web,
  ascent, kp and systedo-case.
- **Applied from LESSONS in this bump:** the one-step `git add … && git commit --only …` form (the
  bare-commit sweep's v2.3 rule change); the registered-copy check in Phase 0 (shadowing); the
  `git ls-files` casing check in the sync ritual; the evidence spot-check — applied at DISPATCH (Phase B
  step 1, where the Director already reads the call path to derive the write set) rather than at
  propose time, so it costs one grep per *accepted* direction, not per proposed one. The propose-time
  version remains unmeasured and is left as a proposal.
- **Dropped as superseded:** the 1.0 per-worktree rules that conflict with the shared-branch shape
  (`git add -A` WIP snapshots inside a private worktree; `--no-verify` inside the worktree with the
  Director re-gating on master; the separate cross-builder integration phase) — their incidents are kept
  as the rationale in `references/worktree-recipe.md`.
- Body is 290-ish lines; the verbatim shared-resource block, the worktree recipe, the base-moved
  surgery, the builder brief template and the outbox detail live in `references/`.

## 2.4.0 - 2026-09-01 - kp (Fable vs Opus bake-off, round 24, delegate-gated)
- Both directors reconciled a 545-commit-stale vault claim by claim and refuted the same carried "round-24 lead" (`GET /api/schedule?slots=1` open: the smoke ran keyless in dev mode; `proxy.ts` fail-closes in production). Age the vault's claims one at a time; a lead that survived a smoke pass is only as good as the configuration it was observed under. Four "missing" ledger SHAs were squashes; grep the signature symbol before calling a ship lost.
- Fable shipped six directions in two contexts; Opus three in three disjoint contexts with a registry standard named on each and four candidates rejected at gate. Both merged. Thin slates by evidence are the method; a context reported CONFORMANT with its golden path is a first-class scout verdict.
- Capture the fork point's gate result with its exit code before the first builder writes; `| tail` masked an exit-1 baseline and proving the failures pre-existing cost a detached worktree.
- Builder death has three dispositions: complete (re-gate and land as the direction's own commit), partial (keep the half whole, finish inline, say which half was whose), unverifiable (only then the `wip` snapshot). Scaffolding can hide inside tracked files (a probe block in `eslint.config.mjs`); diff every touched file before committing on a dead builder's behalf.
- When the pool refuses a dispatch, the lot does not disappear: wait, dispatch fewer lots, or build inline and say so. Five of ten dispatches were refused across the two runs.
## 2.4.0 - 2026-09-01 - personas
- An isolated-index commit leaves the SHARED index stale, and the staleness lies in a specific way: `git status` shows phantom `MM`/`D` rows and `git diff HEAD --stat` reports a builder's NEW files as deletions even though they are on disk (git diffs only paths the index knows). Two builders and the Director each nearly acted on that. The method should say: after a wave's last isolated-index commit, resync with a mixed `git reset` ONLY when `git diff --cached --name-status` lists nothing outside the wave's write sets, and never read `git diff HEAD` on a stale index as evidence of loss.
- A `SendMessage` to a builder that has already delivered its final report RESUMES it with full context; a Director addendum ("your sibling landed X, now route your two sites through it") was cheaper and safer than re-briefing or doing it inline in the builder's file. Worth naming in Phase B step 5 as the standard way to close a cross-lot seam discovered at review time.
- The ai-registry map's `deviation` entries (file:line + why) were the highest-yield direction seed in the session - one per context, both accepted, one shipped as the wildcard. Phase P step 3 should list "read `.ai/registry-map.json` for the cursor context" beside "mine the user's corrections" as a first-class source.
- Scout counts still need a Director re-measure before they enter a brief: "ai-title on 32/60 transcripts" (relayed from a prior analysis) was 7/60 when the builder counted. The brief's premise was wrong in DEGREE and the builder's correction changed which half of the direction mattered. Same lesson as round 13, still not automated.

## 2.4.0 - 2026-09-01 - kp (model bake-off)

- Context: round 24.
- The Director role already names Fable with Opus as fallback; the head-to-head confirmed the ordering and sharpened it. Fable shipped six directions across two contexts (including the same dead design-law lint gate the architect run found) and built a refused lot inline; Opus shipped three standard-anchored directions across three disjoint contexts, rejected four candidates with reasons, and reconciled the stale vault claim by claim. Both refuted the same carried lead. The operator merged both. Rule kept: Fable directs; when a slate must be thin and every direction must cite a standard, an Opus director is not a downgrade.

## 2.5.1 - 2026-09-04 - ai-registry

- The dated `## Model choice (bake-off 2026-09-01, ...)` section moved out of the SKILL.md body into the block above. The lane spec (`docs/skills-lane.md`, "The body is generic") says a body may carry no project name, and this one named kp; a dated finding about a run is what `LESSONS.md` owns. Content preserved verbatim; nothing else in the body changed, so a patch bump.

## 2.5.0 - 2026-09-04 - ai-registry (first run of the loop on the registry that publishes it)

- **Re-check the git log between the gate and the dispatch.** A sibling explorer session shipped one of the ten accepted directions (the trigger-linter link dedupe) in the minutes between the user's gate and the wave plan. Phase B step 1 verifies evidence lines; it should also `git log --since=<scout time>` and drop any direction a sibling already landed. Caught here only because the Director re-ran the linter to write the direction note.
- **A change that touches every file of a lane is Director-at-quiescence, never a lot.** Re-stamping a shared clause rewrites all 29 SKILL.md files, so it collides with every lot that edits any skill and with any sibling-dirty skill. The lot edited the template and bumped the clause version; the Director ran the stamp with `--bump patch` once, after every lot landed and the dirty skill was clean. Worth naming in Phase B step 1 as a partition rule: a whole-lane rewrite is its own serial step.
- **A builder's diagnosis of a red gate outside its write set is evidence, not a verdict.** Lot A attributed the clause checker's 29 reds to CRLF; the cause was the sibling lot's clause-version bump, and the checker went green on re-stamp. The brief already says "report the file"; the Director must still re-derive the cause from the state, because a confident wrong cause invites a wrong fix.
- **Scout premise-failure rate held at ~1 in 10.** One of ten directions carried a false premise (a parse site already guarded); the builder read the code and refused the churn. The 2.5 rule that a refusal is signal held; the spot-check discipline in Phase B step 1 caught nothing the builder did not.
- **On a Windows checkout, `ln -s` through the bash tool COPIES the directory** (MSYS default), and the registry's own trigger gate flagged the result as a shadow copy within minutes. Installing this skill into a consumer by hand is `cmd /c mklink /D <link> <target>` or `scripts/link-registry.mjs`, never `ln -s`.
- Volume: 10 accepted from 10 presented across two contexts; 9 shipped (3 lots, all keep, 0 redo, 0 drop) + 1 shipped by a sibling; 2 real bugs found by first-run tests in a builder's lot; integration gate green 12/12 through the entry point the wave itself created.

## 2.5.0 - 2026-09-04 - ascent
- **A redo sent after the builder's final report still lands.** `SendMessage` resumes a completed builder from its transcript; a Director follow-up ("close the Known gap you documented, write set extended by one file") produced a tested commit in one round-trip with file ownership intact. Prefer this over a fresh builder for a gap the original lot already understands.
- **Brief the scout with the Director's stale hypotheses as things to REFUTE.** Six campaign-era defects from memory were all fixed by a later sibling loop; asking the scout to verify each and correct the Director turned a "six defects" cursor into an honest one-direction slate with a measured residual. A scout briefed only with questions cannot say the Director is wrong.
- **A live foreign session in the checkout means no branch switch, and `master` may not be the base.** Three foreign commits landed mid-wave; building on the current feature branch with `--only` commits was safe. Phase 0 should print `git log HEAD..<base>` and read what it finds - here the base branch carried ~50 unrelated bench-fixture commits.
- **A regenerated context map's `summary` can disagree with its own groups** (49 declared, 54 present) and can lag the tree by 17% within a week. Count the groups, not the summary; treat the queue as provisional; point scouts at directories when a context's file list is visibly short.
- Volume: 5 presented / 5 accepted across two contexts; 5 shipped (3 lots, all keep, 1 redo, 0 drop) + 3 Director commits; one host measurement (a shell-spawned grandchild survives `child.kill()`) filed as a registry lead.

## 2.5.0 - 2026-09-04 - pof
- **A sibling wave can wrap OUTSIDE the vault, and Phase 0 has no step that would notice.** Wave 25 (2026-08-20) shipped four accepted directions, wrote fleet-memory, and never touched the vault; sixteen days later Phase 0 read a pool that overstated by four and a home note naming an already-shipped direction as "the first thing the next wave should take". Caught only because the Director ran `git log --since=<Perfect.md updated>` and grepped a signature symbol for every `status: accepted` direction before partitioning. Make that a Phase 0 step: the vault's `updated:` date vs `git log -1`, then one grep per accepted direction — cheaper than one re-dispatched builder.
- **Builders must not write session-scoped shared ledgers.** Three lots each appended to the repo's fleet-memory (a "max 2 lines per session" file at its 200-line cap) and each pruned the oldest lines to make room — so one lot's prune could have removed a sibling's fresh line, and the Director had no quota left. The brief should say: report your one-line DELIVERED in the final report; the Director writes the ledger once at quiescence.
- **`npm run validate`-style compound gates die whole under memory pressure; run them staged.** The gate was OOM-killed mid-lint by the OS (foreign python + WSL VM held 63 of 64 GB). typecheck → lint → `vitest run --maxWorkers=3` passed the same content. Under pressure, stage the gate and cap workers rather than retrying the compound script.

## 2.5.2 - 2026-09-05 - ascent
- **Verify the base gate is green BEFORE dispatching builders.** On a fresh device the generated Prisma client was stale (572 tsc errors) and two lockfile packages were missing (`server-only`, `libsodium-wrappers`), so every one of five builders spent effort classifying "errors outside my write set" and the Director could not tell a rotten baseline from a sibling mid-edit. One `prisma generate` + `npm install` + dropping stale `.next/dev/types` at Phase 0 costs minutes; a Phase 0 step should run the overlay's `always` gate on the clean base and refuse to dispatch on a red it cannot attribute.
- **Pre-approved deviations are the best first slate on a registry-mapped repo.** Nine directions, all `deviation` pairs from `.ai/registry-map.json` re-verified by scouts, 8/9 accepted, 8/8 shipped with KEEP on review and one redo note. The scout prompt that asked "re-verify each clause with file:line AND symbol" found one extra unsigned writer the prior audit missed and moved two line numbers - the map is a queue of hypotheses, not of facts.
- **Make docs Director-only when two lots share a feature doc.** Two audit lots would both have edited `org-intelligence.md`; declaring `docs/**` Class C for the wave and asking builders to report "doc-worthy changes" produced two clean Director doc commits and zero registry-style conflicts. Cheaper than teaching five builders anchored-insert discipline on prose.

## 2.5.0 - 2026-09-05 - personas-web

- **A `vault:` candidate can name a user that does not exist on this machine.** The init rule says to
  CREATE the first named root when none exists, "rather than silently falling back". Here the first
  candidate was another machine's home directory; creating it would have built a vault under a
  non-existent user and hidden the fact that a prior round's notes were unreachable. Falling through to
  the second candidate and writing a loud RECONSTRUCTION NOTICE was the honest move. Suggest the rule
  become: create the first named root only if its PARENT exists; otherwise fall through and say so.
- **A stale registry verdict is worth re-verifying even when it is `strong`.** Both deviations this round
  carried `stale: true` and both were wrong in the details that mattered. One was half-refuted (it
  conflated two live mechanisms and called a by-design absence "unrealized"); the other named the wrong
  symptom ("duplicates accumulate") because a dedupe downstream was masking it - the load-bearing half
  was real and its true cause was sharper than the verdict. Re-verification changed what got built, not
  just how it was described. The method already says to re-verify; what it does not say is that the
  correction itself is worth writing down as a lead.
- **"Layer on the existing X" is ambiguous and can itself be the defect.** A brief criterion said to layer
  on the repo's existing relative-time formatter rather than fork one. The builder complied exactly - and
  reused the *staleness label*, putting "Just now" / "15m ago" into a five-tick chart axis where a terse
  "now" / "{n}m" belonged. The instruction meant "do not fork the mechanism"; it read as "reuse the
  value". Worth a line in the brief template: when a criterion says reuse, say whether it means the
  mechanism, the formatter, or the copy.
- **Builders assume `DECISION NEEDED` has no answering channel.** One lot touched four files outside its
  write set and reported "I could not raise these as blocking questions and wait - no interactive
  channel, so I implemented the minimum". The channel exists and round-trips in about a minute. The brief
  says to return the question; it never says the Director is listening and will reply. Add that sentence.
- **Two lots writing the same append-only registry make history order-dependent, not lossy.** Three of
  four lots added i18n keys to the same 14 locale files; `git commit --only` took whole files, so one
  lot's edits landed inside another's commit. Nothing was lost, and the ordering happened to be correct
  (keys before consumers). It could as easily have been reversed, leaving a commit whose components
  reference keys that arrive later. Consider naming a Class-B owner per wave the way feature docs already
  get one, or explicitly stating that Class-B ordering is not guaranteed and commits touching it may not
  bisect.
- **A gate at exactly its warning ceiling is a wave-planning constraint.** Lint ran `--max-warnings 24`
  with exactly 24 present. Any direction adding one warning would have failed the integration gate at
  quiescence, after all builder work was done. One builder discovered this and trimmed a file to 199
  lines to stay under a separate LOC rule rather than spend the last slot. Worth measuring headroom in
  Phase B step 1 and telling builders what it is.
- **Re-running the integration gate after a fast-forward merge is ceremony.** The tree is byte-identical
  to the branch just gated. Step 8 says to re-run on the base; that is right after a `--no-ff` content
  merge and pure cost after a fast-forward. Worth distinguishing.
- **Builders should commit BEFORE the full gate, not after.** (ascent round 2, same day) A lot ran targeted gates green, then launched the tree-wide gate and died there with a complete direction uncommitted on disk. The brief's "commit the moment it is verified" reads as "after every gate"; say explicitly: targeted gates -> commit -> full gate -> follow-up commit if the full gate finds something. Builder death is the norm, and the gate is where it happens.
- **A builder's "open risk outside my write set" is a Director work item, not a footnote.** The direction-9 builder correctly refused to touch the flow file and named a first-paint number that would GROW (the mirror of the report's forward-only rule). A 15-line Director follow-through closed it before merge; left in the report it would have shipped as a known regression of a rule the same repo already enforces elsewhere.

## 2.5.2 - 2026-09-05 - kp
- An e2e lot cannot verify itself when the shared worktree cannot build (junctioned node_modules): "enrol these specs in CI" shipped seven never-run specs, and a Director live run found five broken against the current app and one real a11y defect. Method rule: for any lot whose deliverable is a spec, the Director boots the app from the main checkout on a spare port with an isolated DB and puts the base URL in the brief; a spec that needs an app change is dropped from the CI list, never holdout-listed.
- A builder stalled by the harness watchdog (600 s of silence) is resumed from its own transcript with one SendMessage naming the on-disk state (commits landed, files dirty); two such resumes cost zero rework. Brief builders to keep every command under ~5 minutes so the watchdog does not trip on a long gate.
- Heredoc/stdin patches on this harness can mangle `\b` into 0x08 bytes inside a regex while the file prints normally; the pins fail with "0 hits". Verify written regex lines with `cat -A` (or patch by line index with plain strings) before trusting a red.
- **"Is a FAILED read distinguishable from an EMPTY one, per sensor?" is the scout question that finds persisted false negatives.** (ascent round 3) A prior audit had marked the PR sensor fixed and moved on; asking the question sensor by sensor found four more that scored a thrown fetch as absence, one of which wrote a remediation for a control the repo has. Put it in every scout prompt for a pipeline context.
- **A change to what the detectors SEE is the product owner's rubric call, not the Director's.** The reproducible-ingestion fix moved no constant and priced nothing, yet its own measurement showed ~15% more content reaching the detectors on budget-bound repos. Ask at the gate with the measurement in hand (bump / document / hold); the owner bumped.
- **Pre-check every accepted direction's write set against `git status` BEFORE partitioning.** (ascent round 4) A foreign session's dirty `src/lib/types.ts` blocked one criterion mid-wave; the builder stopped correctly and the criterion was parked. The brief already listed the file as reserved, but the direction should never have been dispatched with a criterion that needed it - the Director had the information at planning time. Phase B step 1 should say: intersect each write set with the dirty foreign set and defer or re-scope on any hit.
- **The wave branch is not private when a sibling session bare-commits.** A concurrent session landed a commit on the wave branch mid-wave; the ff-merge carried it to the base harmlessly, but the Director must read `git log base..HEAD` for foreign commits before merging and say so in the session note.
- **Pre-checking write sets against the dirty foreign set at planning time works; keep it as Phase B step 0.** (ascent round 5) The one direction whose files a sibling session held was deferred at the gate, presented as such, and pooled; nothing blocked mid-wave, zero DECISION NEEDED, zero follow-throughs. Round 4's lesson, confirmed one round later.
- **"Which composed sentence has exactly one caller?" and "which policy flags are unconditionally inert on this surface?" are two scout questions that each found a shipped-but-unfinished fix.** Add both to the scout prompt template for multi-renderer and gate contexts.
- **`.git/config` is part of the shared tree.** (ascent round 6) A test harness sharing the checkout set `core.bare=true` and a throwaway `user.*` mid-wave; one builder's plain git broke and one commit landed under the fake author. Phase 0 and the pre-merge check should both assert `core.bare` is false and that `git log --format=%an base..HEAD` shows only real authors, and the Director should restore the config (not rewrite the commit) when it happens under live builders.
- **A builder's mechanism-level refusal of a criterion is a redesign request.** The one-line "owner -> admin" flag flip would have shown admins a form that 403s, because one component fronted two routes with two bars. The builder refused with the evidence; the Director split the affordance. Encode: when a refusal names a second mechanism the criterion ignored, rewrite the criterion.
- **"Shipped but half-mounted" deserves a standing scout question: for each mechanism, list every consumer and which actually receive it.** Round 6 alone found a lift map with two transports and zero readers, a first-step field rendered only on the fallback, a decision API with no product caller, and an MCP-only honesty list - four instances of one shape.
- **A smoke's reach is set by the seed, and SSR `curl` can be blind.** (ascent smoke 2026-09-05) Every org tab body was a client chunk, so Plan B saw only the shell; the repo's own `node_modules/playwright` + cached Chromium turned Plan A into a 40-line script (fresh context per hop, `innerText` + screenshot + console/4xx). Of 12 owed surfaces, 5 were unreachable by construction (mock scans never persist; the seed has no passports/CODEOWNERS) - list "not drivable" before driving and file a seed gap as a direction, not a smoke failure. Mint -> run every call -> revoke in ONE command when a check needs a credential.

## 2.5.2 - 2026-09-05 - kp (round 45 merge)
- A sibling session can switch the SHARED MAIN CHECKOUT to its own branch mid-wave. The Director's `git merge --ff-only` then runs against that HEAD and fails, and any Director commit in that checkout lands on the sibling's branch. Method rules: (1) read `git status -sb`'s first line immediately before every merge/commit/push in the shared checkout - `git rev-parse main` proves nothing about what is checked out; (2) land a gated wave into the base branch by REF (`git update-ref refs/heads/<base> <wave-tip> <old-base>` after verifying ancestry, or `git push . <wave>:<base>` when the checkout is clean) instead of switching or merging in a checkout somebody else holds; (3) push to origin FROM THE WAVE WORKTREE so the pre-push hook gates the wave tree, never a sibling's dirty one; (4) never pipe a merge into `tail` - the pipe hides the exit code and the wrap runs on a lie. Recovery when a commit lands on the wrong branch: `update-ref` that branch to the commit's parent after proving the only foreign commit is yours, unstage your file from their index, leave their working tree alone, and say so in the session note.
