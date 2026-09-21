# Lessons - cx

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-09-07 - firetv

- **Authored from a real need, before its first run.** A Next.js prototype of a TV-plus-phone
  product had sixteen TV screens and seven phone screens composed in one day, and the next job was
  not more screens but walking them as a user would, one at a time, across several sessions. No
  lane skill did that: `/explorer` finds defects in code, `/uat` checks acceptance, `/perfect`
  polishes a build. The gap was a *journey* walk with a CX lens, a stop-and-review rhythm, and a
  vault that survives the session boundary.
- **The stop is the unit, not the screen.** The first draft keyed everything by screen. That fails
  the moment a screen is met in two journeys - a hint screen reached from a homework page and the
  same screen reached from a phone question are different experiences with different reads. A stop
  is one screen in one scenario; ids are stable; `replan` reorders and never renumbers.
- **The user's turn is one prompt and it is prose.** The other lane skills make every prompt a
  single keystroke, and that discipline is kept for triage. But the thing this skill exists to
  collect - the user's own read and expectation for a screen - is not a menu choice. So Phase 5 is
  one prompt with a free-text default lane and keystroke triage inside it, and the expectation
  outranks the read: a contradicted proposal is withdrawn, never argued.
- **Zero proposals must be a legal outcome.** A review skill that always returns a table teaches
  the user to skim the table. The read allows an empty table with one sentence, and the heuristics
  reference names "filling the table" as an anti-pattern.
- **Every proposal names its heuristic or dies.** This is the whole defence against taste. The
  heuristic list lives in `references/` so a consumer can extend it via the overlay's
  `## Heuristics` without a fork; the 10-foot-UI and second-device sections came straight from the
  product that prompted the skill and are written generally enough to transplant.

## 1.0.0 - 2026-09-08 - firetv
- A stop for a screen that does not exist yet reads as a spec: the executor builds the read, and the real read only happens on the built screen. When the map adds new screens, budget a second round at that stop for the user's review before moving on.
- The user's review of a freshly built screen can redirect branding (module names, illustrations, a mark). Keep a hook for an image skill (/leonardo) in the overlay's Repo law or Run section so the executor can generate assets instead of leaving placeholders.

## 1.0.0 - 2026-09-08 - firetv (second run)
- On a stop whose scenario crosses two surfaces (a TV and a phone), the read must carry both surfaces with their own captures and heuristics; reading the primary surface and mentioning the second in one line let the user find the phone "impossible to operate" after the TV side was accepted. Phase 3 should capture every surface named in the stop line.
- A toggled state and a focused state must differ in kind, not degree; the practitioner's "focus is the cursor" heuristic should also ask "can the user tell chosen from focused from three metres?".

## 1.0.0 - 2026-09-08 - gravitone-gcloud
- **The method forbade the job.** Adopted into a content-studio app whose five production steps were
  built front-to-back and abandoned halfway, the very first scoping question hit `What this skill is
  not`: *"a stop that needs a new capability records it as `deferred - new feature` and moves on."*
  Under v1.0.0 the three highest-value stops in the map - two broken seams and a final output that
  does not exist in any form - were all illegal, and the walk would have polished the entry flow
  while the product's promise stayed unreachable. A CX method that can only improve what exists is
  the wrong tool for the majority state of real products, which is *unfinished*. Fixed in v1.1.0 as
  a MODE rather than a rewrite, so the two apps already mid-walk on v1.0.0 keep their behaviour.
- **The failure was on neither screen.** Measured: `research` 28 files / 4,434 lines, `script` 44 /
  9,039, `frames` 15 / 5,268, then `score` 1 / 382 and `cut` 1 / 298. But the file counts were the
  small half of the finding. The real break was that `score` reads no upstream output at all - it
  imports a `CUES` fixture while the user's actual scenes sit unread - and `cut` reads a `TIMELINE`
  fixture and persists only nudge offsets on clips the user never made. Both screens photograph
  perfectly. A screen-by-screen walk would have proposed polish on both and never found that the
  user's work stops travelling after step three. Hence the **seam as a unit of work**, read by
  following the data (payload / writer / reader) rather than the pixels, and the `Continuity`
  heuristic family in `references/`.
- **A state grade per stop turns the map into the finding.** Writing `built / thin / fixture /
  absent` beside each line, from evidence a reader can recheck, made the shape of the product
  visible in the map itself: a front half at `built` and a back half at `fixture` is a product that
  was demoed rather than finished. The user picked the start of the walk off that gradient - at the
  break, not at the front - which is a better decision than the one the ungraded map invited.
- **Ask where to start AFTER grading, not before.** The first map presented was an ungraded tour of
  16 screens and the natural answer was "S1, in order". The graded map made "start at the break"
  obvious, and it is the right call: polish upstream of a severed seam is spent twice.

### Redesign proposal
- **The overlay should carry the final output, and the skill should refuse to map without one.**
  `complete` mode currently derives the ending from the product brief and the reviewer's judgement.
  A `final_output:` key in the overlay frontmatter - "a cut they would show someone" - would make
  the destination declared rather than inferred, and every stop's grade could then be stated as its
  contribution to that artefact. Not applied in v1.1.0: it changes the overlay contract for the two
  consumers already running, and it should be earned by a second `complete` run somewhere else
  first.

## 1.1.0 - 2026-09-08 - gravitone-gcloud (first `complete` run)
- **A grade set from the map is a hypothesis; a grade set from walking the stop is a measurement.**
  `seam script→frames` was graded `built` on good evidence — `useFrames` demonstrably reads
  `TrailerCutStepData`. Walking the stop DOWNSTREAM of it found that `framesFor` returns `[]`
  unless the source origin is one specific fixture, so the seam is built for exactly one of the
  product's disciplines. v1.1.0's Phase 2 should say this out loud: **grades are provisional until
  the stop is walked, and a stop may regrade its neighbours.** Add a `regraded` note to the journey
  line rather than silently editing the grade, so the correction is visible.
- **The deepest finding was one stop downstream of where it lives, and only building revealed it.**
  The read of S10 was correct and complete, and still could not see that NO PROJECT IN THE BUILD
  can have both halves of the step: one discipline has the picture and no musical intent, the other
  has the intent and no picture. That is invisible to a read of either screen AND to a read of the
  seam — it emerged from an executor trying to make the seam work end to end. **`complete` mode
  should expect a stop to yield a new blocking stop upstream of itself**, and Phase 7 should ask
  "did this stop change the map?" before closing. Right now the map is only rebuilt by `map` /
  `replan`.
- **A capture that renders is not a capture that is right, and the failure mode is silent.** Twice
  the tool produced a full-size, plausible PNG of the WRONG screen: once the framework's fresh
  profile had no seeded project (an error page), once the target step's upstream writer had never
  run so the screen showed its honest empty state. The second cost a false "failed acceptance"
  verdict. Phase 3 should require the capture to ASSERT it reached the screen — a title, a
  testid, a known string — and treat a deep-linked screen as suspect until the steps upstream of
  it have been walked. In a multi-step product a screen does not only render, it READS what the
  step before it WROTE.
- **Executor reports are evidence-shaped and partly wrong.** Both dispatches returned excellent
  work plus at least one confident false claim (one called a token a type-scale violation that had
  been fixed earlier in the same session). Phase 6 already says to run the gates yourself; it
  should also say to **diff the files yourself and verify each report's factual claims**, because
  the wrong claims arrive in the same register as the right ones.
- **The most valuable brief content was quoted from the repo, not written by the reviewer.** Two
  proposals were narrowed or decided before a line was written — one by a code comment that had
  already settled the question (`stepStore.ts`, on why a step persists nothing), one by the
  product's own craft knowledge (`knowledge/.../03-score/PATTERNS.md` §1). Phase 1 loads the
  design doc; for a multi-step product it should also load **the step's own knowledge directory
  when one exists**, and Phase 6 should require the brief to quote it.
- **An acceptance line can be unreachable for a structural reason, and that is a finding, not a
  failure.** S10's "at least one spot PLACED on the captured screen" could not be met by any
  project in the build. The item still landed — proven by probe and by an injected-fixture
  capture. Phase 6's "an item that fails acceptance is not landed" needs the caveat: **first ask
  whether the acceptance line was reachable**, and if not, record why and what was used instead.

## 1.1.0 - 2026-09-08 - kp

First adoption outside the product the skill was authored for: a Next.js recruiting studio with 34
stops across five personas, walked from the public landing inward.

- **The skill's own commit shape is rejected by exactly the repos that check commits.** `cx(S<n>):`
  failed kp's commit-msg hook on the first try, because that gate validates the TYPE against a closed
  list cut from its changelog sections and `cx` is in nobody's list. A method that prescribes a
  subject line has to yield to the repo's gate, not the other way round. Now an overlay key
  (`commit_format`) with the skill's shape as the default, and Phase 6 says to read the gate first.
- **A reveal-on-scroll page photographs as a column of empty color blocks.** The landing's full-page
  capture rendered its bands unpainted, because the shot is taken before the intersection observers
  fire; the read would have been made against nothing. Scroll through, return, then capture — and
  take the fold separately, because the fold is the screen the user actually meets. Phase 3 now says
  so. This is the same class as the deep-link capture lesson from the previous project: **a capture
  is a claim about what the user sees, and every claim needs its assertion.**
- **"No screenshots" is a legal mode, not a degraded one.** The owner declined captures outright and
  asked that every build go to an executor so the director could stay at journey altitude. That is a
  coherent way to run the walk — the owner reviews the live product themselves, which is faster and
  truer than a PNG — and the method should name it rather than treat it as the "cannot run here"
  fallback. It also made the standing-preferences file earn its place on day one.
- **A stop that names two screens with a slash is two stops, and the cost is not cosmetic.** S2 was
  written as `about / trust`. The read spent five proposals across both surfaces; the owner then
  descoped `/trust` entirely and four of the five were withdrawn in one sentence. Had they been two
  stops, one would have closed and the other would never have been read. The skill's unit was right
  and the map violated it; Phase 2 now says to split at map time.
- **The second round is the good case, not rework.** The owner's instruction was "accept all, I will
  add scope after the implementation" — and the round-2 items (a closing line that must never wrap, a
  10% larger illustration peak) were things only the built screen could reveal. A stop stays `[~]`
  through it and the new items land against the same `S<n>`. Phase 7 now carries this.
- **The executor measures, the director does not guess.** The no-wrap item looked like a `max-width`
  edit; the measurement found the widest locale needs 771px against a 720px container, and that the
  line only clears the page's own fixed rail from 1171px, which moved the breakpoint from `lg` to
  `xl`. A brief that says "measure, do not guess, and report the numbers" got a better answer than
  the proposal that prompted it — and surfaced a pre-existing overlap the walk had not seen.
- **The walk pays a second time as knowledge.** The page this run polished turned out to be an
  instance of a pattern the corpus had no subject for, and the run's own hard-won capture lesson
  became one of its techniques. A `/cx` run over a well-made surface is a harvest site: when a stop's
  read keeps naming craft the corpus cannot cite, that is a subject proposal, not a proposal table.

## 1.1.0 - 2026-09-08 - gravitone-gcloud (ordered walk, S1-S3)
- **A brief must mark which claims were verified this session and which were inherited.** Twice in
  one wave my briefs carried a false claim downstream with the authority of a measurement: a design
  law quoted from a code comment that had gone stale, and a hypothesis I had disproved for ONE
  element and generalised to another. Executors caught both — one checked the premise it had been
  handed instead of obeying it, the other noticed that the ARIA rule I cited (focusable descendants
  are never pruned) does not cover the non-focusable element the fix would introduce, so the fix
  would have measured as landed while doing nothing. Phase 6 tells the executor to treat quoted
  repo law as non-negotiable, which is exactly what makes an inherited falsehood dangerous. The fix
  is not to quote less: it is to mark provenance per claim, so an executor knows which lines are
  measurements and which are quotations to test.
- **DEAD CONTROLS deserve their own heuristic.** Two of twelve items were controls that could not
  do anything: a bake-off switcher shipped ungated to users that was inert on the very stage it
  appeared on, and a "Next" that could never be enabled because picking already advanced the
  stage. Neither is a bug, neither breaks a test, and nothing in a normal gate asks "can this
  control ever do something?". Filed under `primary action` and `input economy`, which undersold
  both. Proposed row for the core list - **dead control**: *can every control on this screen
  actually do something, in some reachable state?* Evidence: a disabled control with no path to
  enabled; a toggle whose effect is overridden where it is shown; a prototype switch with no
  production gate.
- **An executor that reports a gate failure it did not cause is doing the right thing, and the
  reviewer must check WHOSE it is.** One returned with the lint ratchet red and correctly refused
  to re-baseline, attributing it to a sibling. It was neither sibling but a THIRD, unrelated Claude
  session working the same repo concurrently, which landed its own commit mid-walk. Two of this
  session's commits came from agents outside the walk entirely. Phase 6's "run the gates yourself"
  should add: on a red gate, establish whose change caused it before acting, because in a repo with
  concurrent sessions the answer is often nobody in this run - and pathspec-scoped commits are what
  keep the bodies of work separable.
- **Withholding a proposal and putting the design question to the user produced a better fix than
  the proposal would have.** The obvious read of a wordless landing page is "it needs a headline",
  which the page's own stated brief forbids. Raised rather than enacted, the operator confirmed the
  brief and the item became "the drawing has never been given real work to show" - which was the
  actual defect: 19 real generated stills sat committed in the repo while the page drew mock
  gradients. The `What this skill is not` rule about the design doc earned its keep here.

## 1.1.0 - 2026-09-08 - gravitone-gcloud (S4, claim provenance applied)
- **Tagging every claim in a brief `[VERIFIED <date>]` or `[INHERITED]` worked on first use.** The
  previous wave sent two false claims downstream with the authority of a measurement; this brief
  tagged all of them and the executor confirmed each one, reporting "every VERIFIED claim held" —
  the first brief in the run with nothing wrong in it. The tag costs a few characters and changes
  the executor's relationship to quoted repo law from *obey* to *confirm*, which is the correct
  relationship when the law lives in a comment somebody wrote weeks ago. **Proposed for Phase 6:**
  a brief's quoted law and evidence should carry provenance per claim, and the executor should be
  told to report any claim it finds false.
- **The read should name what is already right, not only what is wrong.** S4's note opens with
  four things left deliberately alone. Two reasons, both practical rather than diplomatic: a walk
  that only subtracts teaches its reader that nothing in the product was earned, so the reader
  starts discounting the read; and an unnamed strength is a thing a later stop will "improve".
  One of the four — a finish button that is *legitimately* disabled — exists only as a contrast
  with three sibling stages where the same pattern was a defect, which is a distinction the table
  alone could not carry. **Proposed for Phase 4:** allow a short "left alone, and why" block
  beside the proposals table.
- **At any commit point, enumerate what becomes immutable and check the screen says so.** S4's
  H-impact finding did not come from a heuristic row; it came from asking what the button makes
  true. Three of the wizard's four decisions stay editable forever and one does not, and the screen
  that enacted the irreversible one never mentioned it — the fact was stated two stages earlier, at
  the point of *choosing* rather than the point of *committing*. This generalises past wizards to
  any create/publish/send/delete: the `recovery` heuristic asks "can the user undo", but nothing in
  the list asks "does the screen say what cannot be undone, where it happens".

## 1.0.0 - 2026-09-08 - firetv (third run)
### Redesign proposal
- The default walk treats the existing screen set as the finished path and polishes inside it. On this repo it walked five stops of a homework flow before the operator pointed out that no module had an end-to-end design at all - the camera stop was reachable only because a seeded task list pretended the learning had already happened. The read must challenge the PATH before it reads the SCREEN: a stop's overview should carry a line naming how the user ARRIVED at this screen and what makes that arrival real (a seeded fixture is not an arrival), and a missing upstream is an H finding that stops the walk for design, not a polish item. `complete` mode exists for this; the lesson is that the DEFAULT mode is where the operator was harmed, because nothing in the default read is allowed to say "this path does not exist".

## 1.1.0 - 2026-09-08 - gravitone-gcloud (S5, the largest seam yet)
- **Every serious finding in this walk came from asking whether two individually-true things
  AGREED.** Four stops produced four of them and none was visible in any single file: two screens
  both correct with no data passing between them; two disciplines both valid, neither able to hold
  both halves of a step; and — at S5 — a mature research prompt demanding 4-8 web searches, a real
  reasoning chokepoint, and a deliberate `--allowed-tools ""` policy that makes the prompt's first
  phase impossible. A screen-by-screen read cannot find any of these, and neither can a code
  review of either side. **This is the strongest argument for the seam as a unit of work, and it
  should be stated in the skill rather than left for a reviewer to rediscover:** the method's
  distinctive power is contradiction-hunting across artefacts, not defect-hunting within one.
- **A state grade must answer "does this step do its job", and file counts do not.** Graded wrong
  twice in one walk, the same way both times: `built` because a reader existed; `built` because 28
  files and 4,434 lines existed. Both were real, checkable evidence about the wrong question. The
  Constants table says to grade from recheckable evidence, which is necessary and NOT sufficient —
  it should also say *which question the evidence must answer*, and that a grade is provisional
  until the stop is walked.
- **The executor's refusals were better than my brief twice, and both refusals came from asking
  what a thing DOES rather than where it SITS.** I listed a chip among "evaluation scaffolding to
  gate" because it sat inside the prototype panel; it was the disclosure that the run is a replay,
  and gating it would have deleted the honesty the same brief demanded. And my acceptance line's
  word "genuinely researched" was refused in favour of "reasoned" on evidence I had in front of me
  and had not cross-checked. **Phase 6 should invite the executor to challenge the brief's own
  framing, not only its facts** — the current wording asks for report of anything "the brief got
  wrong", which reads as factual error, and both of these were errors of categorisation.
- **On money: forbid live calls during a build, and make the executor say what that leaves
  unproven.** This stop wired a billing seam without spending a cent — validator driven offline
  against 12 inputs, all four route error paths exercised with the engine off. The report then
  stated plainly that a first real run is unproven and will need prompt tuning. That is the right
  trade for a walk and the right disclosure; a brief touching a paid seam should require both.

## 1.2.0 - 2026-09-09 - ai-registry

- Architecture review: the shared reflection clause assumed a writable registry link in every installation. Replaced that assumption with installation-aware scope and explicit adoption. This records an instruction audit, not a field effectiveness result.
