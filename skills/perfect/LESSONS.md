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
