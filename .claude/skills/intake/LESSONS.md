# Lessons - intake (formerly research)

## 1.1.0 - 2026-08-30 - operator-control-plane (bumped to 1.2.0 in the same change)

- **Repository sources were being mined at their README, and the method never said not
  to in a place a run would see.** `research-ingest` on a repo URL returns the rendered
  landing page; this run triaged fourteen candidates off 2,938 words of it and the
  operator caught it at the triage table. Five separate class rows each said the README
  is that class's least reliable surface - marketing surface, method advertisement, tour
  half - and saying it five times in five vocabularies is why no run generalised it.
  Now stated once as a cross-cutting rule, with Phase 2b as the procedure: clone, pin
  the commit, sweep operating docs -> instrument -> measurement -> types -> tests ->
  README last.
- **The tell is in the frontmatter, and it audits cheaply.** A repository note whose
  `words:` is a single small number and whose body cites no file from the source's tree
  read the advertisement. Fourteen repo sources in nine days audited that way in about
  two minutes: most had cloned; `autosaddler` (which says so in its own note),
  `openwiki` and this run had not. Notes now record the commit and both word counts so
  the tell stays visible.
- **A tree read only for claims is half-read.** The intake habit is hunting quotable
  assertions, which is right for a video and leaves the instrument, the schema, the test
  strategy and the failure taxonomy on the floor. Those are the parts that land in
  `scripts/`, `practices/` and `docs/`, where the corroboration table already says
  judgment is the only gate - so they were cheap to land and nobody was looking for
  them. Phase 2b now asks the question a video cannot be asked: what here is good
  enough to reuse, and what does it do that we do worse?

### Redesign proposal - re-mine the surface-level repo runs

  Three runs are known to have landed from a README alone. Their findings are not
  necessarily wrong, but their yield was drawn from the one file written to be quoted,
  and they carry 21 untriaged candidates between them. Re-running them is a batch of
  independent, tree-reading intakes - one worker per repository - not a method change,
  so it is proposed here rather than applied: `autosaddler`, `openwiki`,
  and any future note that trips the frontmatter tell.

## 0.16.0 - 2026-08-28 - plan-review execution (bumped to 0.17.0 in the same change)

- **An XL spec is now forged in the same session, by this skill, as the natural
  continuation of Phase 7.** The previous run ended with the spec banked and the
  operator had to reopen the session to say "execute it"; every neighbour the spec
  argued from had to be re-read. The rule: dispatch one forge worker under the forge
  and harvest briefs before Phase 9, review the diff in the director's chair, commit
  with a pathspec, mark the spec EXECUTED. `--spec-only` is the opt-out; a multi-subject
  spec still goes to `/forge`.
- The worker is dispatched with the spec's primaries as its web budget and read-only
  access to the project bridge; it runs no git. Same shape as the 2026-08-22 and
  2026-08-27 executions, now written down instead of remembered.

## 0.15.0 - 2026-08-28 - ai-literacy-superpowers-concepts (bumped to 0.16.0 in the same change)

- **The dispatch arrived as two things at once - a batch to mine and a phase to add -
  and split-at-Phase-3 handled both.** The phase is the X lane's first *proof* gate:
  the lane was opt-in and confirmation-gated, and an application's `verified_on` only
  ever said a tree was opened, never that the change did anything. Paired proof at any
  scale before a cross-repo commit, status from a closed set, `unproven` does not
  commit. The 2026-08-27 67/33 probe is the existence proof that an in-run A/B at n=1
  is cheap and decisive.
- **Real-gap-only is now the unattended rule (Phase 5).** The operator asked for it on
  this run; it is the right default for any run with nobody at the table, because an
  unattended verifier should spend on rows that can change the corpus and leave the
  judgment calls (`partial`, `likely catch`) recorded with anchors for a person.
- **A documentation corpus from one author is a channel corpus whose cluster is the
  finding.** Four pages, four readers built to one shape, one missing stage
  (`plan-review`). Fold the fragments into a spec; do not mint four techniques beside
  `hitl-approval`. The batch-lane rule held; the class file gained the observation.
- **The asymmetry hunt paid twice in the INVERSE direction.** Prior runs found a
  concept mentioned in one file and measured in another. This run found the corpus
  holding the instrument and the source supplying the case where its domain is one
  case wider: `decision-records` reads its distribution for an actor and the reading
  inverts for an objection; `human-gate-capacity` measures the gate and at the floor
  the gate is a person. New Phase 6 question: **read a technique's calibration loop and
  ask what it measures when the gated party is not an actor.**
- **Machinery items from a well-implemented source still outrank content** - the
  tiered-sources rule came from the smallest page in the batch (the model-cards page)
  and landed in the skill, not a bundle. The listicle tiebreaker generalises past the
  listicle.
- Zero fetches, tenth consecutive corpus-internal run; the source's primaries are
  training-data-resident and are listed in the spec for the drafter to fetch. One
  ingest exit 2 (transient 503), retried clean - the exit-code split did its job.
- Nav chrome was ~170 lines per page on a documentation site; strip it before reading
  or the token budget goes to menus. Worth a `--strip-nav` flag on `research-ingest`
  if a third doc-site batch arrives.
- Zero declines (unattended). 13 catches, 4 untriaged partials with anchors, 2 leads
  with return conditions. Decline reasons owed: none.

## 0.14.0 - 2026-08-27 - evaluate-llms-before-production

- **The enumeration hunt is now the dominant finding shape, and this run says why.**
  All four landings came from a sentence in which a forged document claimed its own
  completeness - five ugly-case regions, "representative by construction", "the only
  mode that supports a gate", and a subject that distrusted green twice and red never.
  The neighbourhood was the corpus's most mature, which is exactly the condition:
  **in a mature subject there are no missing opinions, only over-broad claims.** When
  prior art comes back thick, stop looking for holes and start reading for enumerations.
- **A hybrid whose halves are a listicle and a first-party account splits by paragraph,
  not by section.** The published structure was eight numbered how-to sections; the
  first-party half was individual sentences scattered inside them ("we did not treat
  precision and recall as interchangeable", "the model may focus on the wrong value").
  Every landing came from such a sentence and every catch came from a section heading.
  The build-walkthrough's discriminating question generalises further than its own row:
  *is the author describing a practice, or reporting what happened to their system?* -
  and for a written source it has to be asked per paragraph.
- **Corpus-internal convergence can come from a lane nobody would map to.** The
  strongest corroboration of the run - that a workflow outcome is not a label - was
  already written twice in the same bundle, in a nudge-efficacy technique and a
  finding-auto-close technique. No term in the Phase 4 map would have surfaced them;
  they were found by grepping the *concept* ("dismissed") rather than the candidate's
  vocabulary. **When a candidate says "X is not ground truth", grep the corpus for the
  workflow verb, not for the eval noun.**
- **A cross-bundle inversion is worth a subject note on the side you did NOT edit.**
  The distractor rule inverts between the eval bundle (mandatory) and the assessment
  bundle (disqualifying). The skill already says to record it in the subject note; this
  run had to *create* the note on the recruiting side to do so, which is correct and
  should be stated - the note whose subject was not touched is the one that stops the
  next run re-litigating the inversion, so its absence is not a reason to skip it.
- **Landing above the source's altitude is a compression, not an addition.** The source
  gave a three-tier metric table. The durable rule was that the third tier is just more
  of the second, leaving two roles and one sentence. The operator's standing critique is
  usually read as "synthesise across runs"; this run is the cheaper case - **synthesise
  within the source, by asking which of its categories collapse.**
- **Eighth consecutive zero-fetch run.** Every one of them carried its own primary
  material or corroborated corpus-internally. The 3-fetch budget has not bound in eight
  runs; the classes where it binds (review, listicle, paper) simply have not arrived.
  Worth saying out loud so the streak is not read as a rule about sources in general.
- **Shared-checkout hazard, third consecutive run.** A parallel session landed four
  techniques, two applications and a whole practices lane mid-run, and its in-flight
  application failed the bundle gate. Two things worked: running the gate and reading
  *whose* failure it was before touching anything, and leaving `index.json` /
  `catalog.json` regenerated-but-uncommitted. The second is now three-for-three and
  should probably be the documented default rather than a per-run judgment call.

## 0.1.0 - 2026-08-21 - ai-registry (run 1: mixed AI-news roundup; bumped to 0.2.0 in the same change)

- **The source class behaved exactly as designed for, which is the result worth
  recording.** A weekly AI-news roundup produced twelve candidates from ~fourteen
  segments; the one that was picked located a real hole in the corpus and stated the
  rule for filling it backwards. Originating and authorizing really are different acts,
  and the run is the first evidence that writing that rule into the method was right.
- **Contradiction is the best corroboration outcome, and v0.1.0 had no slot for it.**
  The corroboration table read as a pass/fail gate on the source's wording. What
  actually happened is that the primary literature inverted the source's rule, and the
  technique got written from the literature - sharper than either input. Applied to
  SKILL.md as a named outcome, hence the bump. Generalises to any low-authority source:
  ask whether it found something true while explaining it wrongly before dropping it.
- **Untriaged is not declined.** Eleven of twelve candidates were never picked. The
  Phase 9 frontmatter had no field for that state, and filing them as declines would
  have fed the decline ledger judgments nobody made - which Phase 11 promotes into
  standing rules after three sightings. Applied as a fifth outcome with its own table.
- **The strip test paid at extraction time.** Seven segments died before any budget
  reached them (a git-hosting launch, a desktop app, a music model, a robot). No change
  needed; the ordering in Phase 3 was already right.
- **An honest empty from the mapping instrument was the single most informative output
  of the run.** "quantization" matching nothing across 250 subjects is what turned a
  vague hunch into a located gap. The instrument's refusal to soften that is worth more
  than its ranking.
- **`--deep` is for vague terms, not technical nouns.** It cost ~10s reading every
  document's `use_when` and changed nothing for slug-distinctive terms; it earned its
  keep only on a behavioural phrase. Not written into the method at n=1, but the shape
  of the rule is "deep when the term is a sentence, shallow when it is a noun".
- **A shared checkout moved the branch out from under this run before it started.**
  Another agent session on the same tree switched branches mid-flight. v0.1.0 carried
  the pathspec-on-commit rule (inherited from a sibling lineage) but not the stronger
  answer, which is to isolate in a worktree. Applied. The Windows-specific corollary is
  real and cost one failed attempt: this corpus's deepest paths are long enough that a
  scratch-directory prefix exceeds the platform path limit and the worktree
  half-creates, so the worktree path has to be short.
- **One pick did not come close to binding the 3-fetch budget.** One search plus one
  fetch corroborated one technique. The budget is sized for four picks, not one; nothing
  to change, but the number is now measured rather than assumed.
- **The cross-repo lane was not exercised.** Reading a connected project for
  corroboration turned out to be the highest-value part of the verification - it
  supplied the application document and a real instance the technique teaches better
  than the source did. Writing to that project was correctly gated and correctly not
  invoked. The read/write asymmetry deserves a sharper statement in the method the first
  time the lane actually runs.

## 0.2.0 - 2026-08-22 - ai-registry (run 2: agent-news roundup; bumped to 0.3.0 in the same change)

- **Cross-run convergence corroborated an upper-layer technique with no web fetch, and it
  only worked because run 1 wrote down what it did not pick.** Two independent vendors,
  two independent runs, one rule (observed repetition promoted into a named skill). The
  corroboration table listed three routes; this is a fourth, and it is the cheapest one
  available. Applied, and it retroactively justifies v0.2.0's untriaged table as
  load-bearing rather than tidy - a decline ledger alone would have destroyed the first
  half of the pair.
- **A near-empty from the mapping instrument is more dangerous than a total empty.** One
  pick matched three semantically unrelated subjects and looked like a hole; it was a
  SEAM inside a nine-technique subject whose golden path already produced the material.
  Slug matching cannot see a concept living in prose. Zero hits usually means a hole;
  two or three weak hits mean hole-or-seam and the golden path has to be read before
  choosing. Applied to Phase 4. Writing the duplicate instead of the boundary was the
  available failure and it was close.
- **Real findings in a mature corpus are missing STAGES, not missing opinions.** All four
  accepted findings were a decision the documents left to a default because nothing sat
  at the point where it is made: whether to retrieve at all, when a memory becomes a
  capability, which step a limit counts, what a provenance check settles. A subject that
  is thorough from stage two onward is exactly where a missing stage one hides. Applied
  to Phase 6 as a verification question, and it is probably the most transferable thing
  either run has produced.
- **Carrying my own read per row changed the operator's pick.** Run 1's table stated
  prior art and left the judgment implicit; run 2 marked each row real / partial /
  likely-catch / thin, and the operator took four "real" and skipped three of four
  "likely catch". Applied to Phase 5 as a required column. Neutrality that withholds a
  read does not remove the guess, it relocates it to the party with less context.
- **The source was confidently wrong twice more, against things the corpus has measured.**
  Throughput-buys-thinking is refuted by `effort-calibration`'s opening claim; agent
  identity from a name is refuted twice over by `session-registry`. Two runs, four
  inversions. The class row in the ledger is now earned at two observations, and the
  finding is that yield is a property of WHERE a segment lands, not of the class: run 1
  hit model and media subjects for one finding, run 2 hit `llm-agent` for four.
- **Six picks is about one sitting.** Four techniques written and wired, two
  verifications, one amendment. The 3-fetch budget bound for the first time (one search
  plus two fetches, one of which 404'd on a moved support URL) - and one of those fetches
  was spent recovering from a redirect. Not changing the number yet; recording that it is
  now a real constraint rather than a theoretical one.
- **A finding can be right and still not be a law.** The provenance asymmetry is general
  enough to be a law and already IS one in a sibling bundle, but cross-bundle links are
  forbidden and the skill's bar for minting one is convergence across runs - two runs
  from a single channel is not that. Writing it as a technique with the law banked as a
  lead behind a stated return condition was the correct application of a rule that
  wanted to be broken. No change; the bar worked.

## 0.3.0 - 2026-08-22 - ai-registry (run 3: first-party practitioner talk; bumped to 0.4.0 in the same change)

- **The source CLASS is a reading instruction, not a trust level.** Three runs in, two
  classes with near-opposite shapes. A second-hand survey is broad, shallow and reliable
  only for "the world moved" - mine it for where to look. A first-party practitioner
  account is authoritative about what they built and measured and not at all about what
  works in general, because the sample is one. That maps onto the layer contract almost
  exactly: strong evidence for a technique's SHAPE, weak evidence for its universality,
  so its claims want their conditions attached rather than a higher confidence setting.
  Applied as a section that runs before the strip test.
- **Length is not yield.** 2,974 words outproduced 6,958. Density, first-hand-ness and
  topical coherence all beat volume, and a coherent account of one problem maps onto one
  REGION of the corpus - two techniques and a subject, rather than findings scattered
  across six subjects. Applied as a line in the class section so the ingest word count is
  not read as a forecast.
- **Choosing the home is a verification step, and it was the hardest call of the run.**
  One finding's obvious homes were both wrong on their own stated boundaries -
  `agent-chaining` owns event-wired chains, `fleet-orchestration` owns session
  supervision, and neither is the orchestration/agency dial. The answer came from
  reading each subject's opening boundary paragraph, which this corpus writes
  explicitly. Applied to Phase 6. The corollary that a finding with an obvious home was
  probably already covered is worth carrying: the interesting findings sit BETWEEN
  subjects.
- **The XL route worked and cost about as much as a technique.** Four fragment
  candidates from the same talk folded into one dispatchable proposal instead of
  becoming four leads that would be re-derived separately. Applied: fold the fragments
  in, and write the spec as the ENGINE's input - bundle, category, technique slugs with
  the decision rule each carries, the boundaries it must not absorb, the open questions -
  rather than as prose about a gap.
- **Three runs, six techniques, zero applications.** Not an accident any more. Every run
  so far has landed upper-layer content and none has written a `<stack>--` document,
  because writing one requires opening a real tree and no run has been asked to. The
  cross-repo lane exists and has never fired. This is the method's standing blind spot
  and the next run should either exercise it deliberately or the skill should stop
  implying applications are a routine outcome.
- **The corroboration budget went entirely unused.** First-party sources need no
  corroboration lane for what they report about themselves, so the 3-fetch budget is a
  constraint that binds on the roundup class and not on this one. No change.
- **The registry found a subject-sized hole in the thing it does itself.** Nothing owns
  generating a knowledge corpus from a codebase, which is what this repository's own
  forge skill does daily. Worth naming as a general risk rather than a local irony: a
  corpus is least likely to document the practice its own authors are too close to see.

## 0.4.0 - 2026-08-22 - ai-registry (run 4: skill-library release walkthrough; bumped to 0.5.0 in the same change)

- **An AMENDMENT is a first-class outcome and the method had no name for it.** Two of five
  accepted findings were sections added to well-forged techniques rather than new
  techniques - and both were sharper than most new techniques, because a mature document
  that already reasons well about its subject makes the case it *misses* stand out. It is
  also the cheaper move and the one that avoids minting a competing technique beside an
  existing one. Applied to the Phase 7 routing table.
- **Hunt where a document declares its own completeness.** "The subject owns two flows
  that are mirror images of each other." "The three cases where strictness is still
  correct." An enumeration is a claim; it invites exactly one question; asking it is
  nearly free. Both amendments this run and the `hitl-approval` finding came from a
  source demonstrating a case an enumeration did not contain. Applied to Phase 6, and it
  is the most mechanically reusable heuristic any run has produced.
- **When a rule inverts across bundles, name the discriminator - do not link.** One
  finding contradicted a technique in another bundle that argues its position well. Not a
  contradiction: the other bundle's harms are harms of MEASURING a person, and none
  transfer to gathering what they know. Cross-bundle links are forbidden, so the boundary
  condition goes in prose on the side being written, with a note in the subject file that
  the other bundle holds the opposite. Applied to Phase 7.
- **The release-walkthrough sub-class outperformed everything so far, per word.** It is
  organised around changes, and a change carries the reason it was made - so the author
  states the prior failure mode out loud. A feature demo shows the solution and hides the
  problem. Applied to the source-class section as a thing to seek out rather than wait for.
- **Seven picks worked, and the ceiling is the writing, not the verification.** Three
  techniques and two amendments in one sitting. Verification was cheap because a
  first-party source needs no corroboration lane; the cost was entirely in drafting. If a
  run's picks are mostly amendments, the ceiling is higher than seven.
- **FOUR runs, eleven techniques, ZERO applications, cross-repo lane never fired.** This
  has now survived three consecutive lessons entries as a note, which means noting it is
  not working. It is the method's defining gap: every run lands transplantable upper-layer
  content and none has ever reconciled a claim against a real tree, which is the half the
  layer contract says proves the standard is real. The next version should either make an
  application a REQUIRED consideration at the triage gate - "which of these picks could be
  verified against a connected project's code, and should be" - or the skill should stop
  listing applications as a routine outcome. Deliberately not fixed here, because the
  right fix is a gate change and this run had no application to write.

## 0.5.0 - 2026-08-22 - ai-registry (runs 5+6, parallel: a technique demo and a designer talk; bumped to 0.6.0 in the same change)

- **The cross-repo lane finally fired, and its value was not what the method assumed.**
  Five runs of lessons treated a missing application as a coverage gap - somewhere to
  point at real code. The first one written showed the lane is worth more than that: the
  tree's SHAPE confirmed the technique's central claim in a way no upper-layer reasoning
  could. A four-term model said one term is the one nobody can set; the evaluator turned
  out to carry a module context for every module it can build and none for that term,
  because nothing in a codebase can own it. Nobody designed that. Applied to Phase 8 as
  a question to ask of any tree you open: what could this not have been built to prove,
  and does it prove it anyway? The negative confirmation is the strongest form.
- **The mapping instrument was branch-blind and nobody had noticed for five runs.** It
  reads the working tree, so it reported "no prior art" for a domain a sibling branch
  covers in two subjects. Fixed in the script - it now prints the bundles scanned and the
  branch - and applied to Phase 4. The general lesson is that an instrument's silence is
  only as trustworthy as its scope, and this one had never declared its scope.
- **A dispatch spec asserted a structural fact and was wrong.** It claimed a category was
  flat and under its cap, reasoning from a subject count; the category was already nested,
  and the placement rule forbids a category holding both subjects and subcategories. The
  worker caught it, filed correctly, and reported the override. Applied: verify placement
  against the taxonomy authority and state the resolved path and link depth in the brief.
  Counting is not reading.
- **Both dispatched workers overrode their briefs and both were right.** One rejected a
  "prefer existing subjects" preference because the neighbours' own stated scopes excluded
  the work; the other fixed the placement error. Applied: ask for the override and the
  argument explicitly, because a brief that reads as non-negotiable buys compliance with a
  mistake. Also applied: review the diff, never the report - the purity check on a
  game-design subject was the one that mattered, since the source was made almost entirely
  of game titles and one leak fails the gate for everybody. It was clean; the check was
  still the point.
- **A fourth source class: the designer talk.** Domain craft with no tooling in it, and
  the first class whose findings never route to `software-engineering`. Its defining
  property is that it has a PLACEMENT problem before it has a content problem - which is
  how the branch-blindness above surfaced.
- **Two workers in parallel plus the project lane in the main thread is one sitting.** The
  bottleneck was waiting, not verification or writing. That argues for dispatching earlier
  in a run rather than for picking less.
- **One candidate is still owed a decision** (a blanket auto-approval grant deleting the
  human turn a flow exists for - third sighting of that thread). Recorded as untriaged
  rather than landed, which is the vocabulary working as intended two versions after it
  was added.

## 0.6.0 - 2026-08-22 - ai-registry (run 7: first-party empirical study; no bump - lessons only)

- **A fifth source class: the first-party empirical study.** Controlled protocol,
  published rows, an appendix arguing against its own headline. Two reading rules it
  taught: its NEGATIVE results are first-class candidates (three of six accepted findings
  came from the author's nulls and reversals - raw replay hurting, the stack outweighing
  the store, files winning abstention); and the author's own scope flags are binding -
  what the study declines to claim ("untested, not refuted"), a technique must not
  assert. Findings from this class land naturally as decision rules with measured
  conditions attached, which is the amendment shape almost by definition.
- **Against a mature subject, a study source yields amendments, not files.** Six accepted
  findings, five amendments, zero new documents - and the run's whole verification budget
  went into reading the homes, exactly as the missing-stage heuristic predicts. The
  10-technique agent-memory subject absorbed four findings as missing *distinctions*
  (state vs event, labeled vs applied, floor vs abstention, yield as health) without
  growing.
- **Never guess a URL; follow the source's own links.** Two of three corroboration
  fetches were burned learning this: an arXiv abstract page (should have gone straight
  to /html full text) and a guessed paper id (404). The source names and links its
  primary documents; harvest those hrefs during ingest and fetch them, not reconstructions.
  The one clean fetch (the Graphiti paper, full text) authorized finding 1 by confirming
  both the mechanism and the gap.
- **The invocation loaded the wrong skill and the run had to notice.** `/research` in this
  checkout resolved to a personas-specific skill from the user library (its Phase 1 would
  have aborted on a missing file); the repo's own method - renamed to `intake` by a
  parallel session mid-run - was the one to follow. When a skill's constants name another
  project's paths, stop and look for the repo-local method before executing anything.
- **The parallel-session rule fired again, harder.** The main tree carried a staged
  lane-wide rename while this run was live. Worktree-from-HEAD kept the run isolated, and
  writing against HEAD's file layout (this file, at its old path) lets rename detection
  carry the append into the moved file instead of resurrecting the old one.

## 0.6.0 - 2026-08-22 - ai-registry (run 9: practitioner codebase; no bump - lessons only)

- **A sixth source class: the practitioner codebase, and it out-yields every transcript
  class.** A cloned public tree produced three new techniques, two amendments and two
  applications - the run's whole verification budget was reading the tree itself, so
  corroboration was free. Two reading rules: mine the COMMENTS for reasons (this tree's
  doc comments state failure modes with a candor talks never reach - "four of the six had
  silently rotted", "runs but can never report"); and the class is the only one that can
  authorize applications, so plan at least one application per run on this class - it is
  the cheapest high-grade artifact available.
- **A finding that resolves to a catch can be repaid as an application.** The substrate
  seam matched `seams-and-adapters` completely; instead of a drop, the tree became the
  technique's second application. Catch-plus-tree = application is a standing move on
  this class.
- **READMEs undersell; interfaces tell the truth.** The steering finding looked thin from
  the marketing sentence ("redirects it right away") and turned out to carry a
  three-clause contract in the harness interface (declared capability, refuse-between-
  turns, observable join). On a codebase source, never triage an interaction claim from
  prose alone - grep for the interface before scoring.
- **Link depth is per-file, not per-subject.** Two of three new technique files shipped
  with a three-level `_laws.md` path where four levels were needed; the gate caught one,
  the sed fixed all. Count the segments from the file being written, not from the sibling
  that was open in context.

## 0.6.0 - 2026-08-25 - ai-registry (run 10: second-hand practitioner listicle; bumped to 0.7.0 in the same change)

- **The skill's commit phases had drifted from the house rules by two days.** Phase 8
  and Phase 10 still said "a branch, always, never main / never push the project" -
  written under the multi-party model the operator retired on 2026-08-23. A skill that
  contradicts the doctrine in memory makes every run re-litigate it. Applied: both
  phases now commit direct with a pathspec and reserve the branch for the two cases
  that still earn one. The general rule: when governance changes, grep every skill's
  commit phase the same day.
- **Two references still pointed at the skill's old name.** The ledger header and the
  local bridge's comment said `skills/research` after the rename to `intake`; the
  2026-08-23 runs then went through `/deepen` because nothing said where a URL goes.
  Applied: pointers fixed, and `/deepen` carries a one-paragraph routing note. A rename
  is not done until `grep -r <old name>` is empty.
- **A listicle's numbers are pointers, not facts - and the primary is usually one fetch
  away.** "162 personas across 2,500 prompts" was 162 roles x 2,410 questions; "7x more
  tokens" was about a different feature than the item it decorated. All three accepted
  findings were written from the primary the number pointed at. Applied as a new
  source-class row. Corollary worth naming: a **derived** rule (the cache break-even
  at 1/8 of the incumbent's price) is stronger than anything the source said, because
  it comes from the vendor's published ratios and can be re-derived when they move.
- **Operator scope is a decline reason, and it is a good one.** Sixteen candidates
  were declined in one sentence: "no significant value for our current projects". The
  note records each with enough anchor to re-propose on a different day, and marks the
  two (6, 17) that are real gaps declined on scope rather than merit. Do not argue a
  scope decline; record it so it does not cost a second triage.
- **The cross-repo lane produced the run's best evidence, twice.** Both the
  brief-carries-the-session and cache-continuity applications found the connected
  tree doing the right thing *for a different reason than the technique gives* (a
  pinning test on restated invariants; one prompt family per tier chosen for an
  awareness regression). Convergence between a tree's recorded reason and the
  technique's argument is a stronger corroboration than either alone, and it is only
  visible when the application asks "why did they build it this way" rather than
  "where is the instance".
- **`--deep` was not needed at three picks.** The operator asked for "quality deep
  research"; three primaries inside the 3-fetch budget covered three picks exactly. The
  budget binds at pick four. Not applied - a per-pick lane borrowed from `/deepen` is
  the design if a run ever needs it; bank it as a lead rather than build it unexercised.
- **Python is not on this machine.** Two scripted edit batches printed a Store prompt
  and changed nothing; the harness reported success because the shell did. Use the
  editor tool or `sed`/heredocs here; check `git diff --stat` after any scripted edit.
- **A generated file shared with a sibling session is committed from the INDEX, not with a
  pathspec.** `catalog.json` regenerated with my hash AND a sibling's uncommitted skill; a
  pathspec commit takes the working-tree file whole, sweeping the sibling in. The move:
  `git show HEAD:catalog.json`, apply only your hunk, `git hash-object -w` +
  `git update-index --cacheinfo`, stage your paths explicitly, verify with
  `git diff --cached --name-only`, then commit with NO pathspec. The pathspec rule in
  Phase 10 protects against sweeping; here the curated index is the pathspec.

## 0.7.0 - 2026-08-25 - ai-registry (run 11: practitioner codebase, curated prompt library; no bump - lessons only)

- **A source written for a model class the subject was not forged on reads as a
  contradiction and is usually a missing stage.** Two picks triaged `corrects-claim`
  (text locking vs the no-text rule; purpose-first vs style-first) resolved on reading
  the full files to `fills-stage`: the golden path already named the other architecture
  in one sentence and owned none of what the sentence implies. The tell is a boundary
  statement with no technique behind it. Read the golden path's boundary sentences
  before the triage column says "corrects".
- **Two vendor guides fetched for the same class beat one paper.** Neither vendor
  documents a prompting method, but both agree on the class facts (natural-language
  brief, explicit text, no negative parameter). Convergence between vendors on what the
  API *lacks* is corroboration the source could not have given.
- **A curated library's pitfall guides are its knowledge; its templates are its
  product.** Thirteen "避坑指南" blocks produced every finding; the 21 templates and 529
  cases produced none directly. Same shape as the release-walkthrough lesson (run 4):
  read the stated failure modes first.
- **The library's most-used templates were its ethics finding.** Social-post and
  live-stream screenshot generators, with guidance to make them indistinguishable from
  captures, are a fabricated-record engine. A source's *popularity ranking* is a signal
  about which hazard the field is currently mass-producing.
- **Offer the cross-repo lane as a table row and let it be declined.** Listing
  systedo-case as row X with "I have not opened that tree" cost one line and produced a
  clean decision; the project is now a named return condition in two subject notes.
- **Push discipline in a shared consumer checkout: the sibling switched branches
  between my commit and my push, twice.** The run-10 commit landed on the sibling's
  feature branch; recovered with a short-path scratch worktree of `master`
  (`git worktree add <short> master`, cherry-pick, rebase, push). Long scratch paths
  fail `worktree remove` on this platform. And a red pre-push hook on the consumer is
  the operator's call, not the run's - report, do not `--no-verify`.

## 0.7.0 - 2026-08-25 - ai-registry (run 12: paper aggregator, 284 papers; bumped to 0.8.0 in the same change)

- **New source class: the paper aggregator, and it triages by cluster or not at all.**
  284 items collapsed into 7 rows by mapping the list taxonomy onto bundle subjects;
  3 reads, all productive. Item-level triage would have burned the run on titles.
  Applied as a class row with its own per-paper fetch budget (reading a picked paper
  IS the extraction for this class).
- **The operator scepticism was the correct prior, and the class row now encodes it:
  frameworks are marketing, measurements are substance.** The ~80-paper coordination
  cluster produced exactly one landing - the failure-taxonomy paper - and the whole
  workflow-search space was declined as a class. Negative results and failure
  taxonomies survive the strip test; architectures do not.
- **The corpus beat a systems paper on its own headline idea.** Temporal-KG
  supersedence resolved to a catch because consolidation already carries the
  mechanism AND its limitation (windowed supersedence leaves the state-vs-event
  judgment to the writer). A catch where the corpus outreasons the paper is worth
  recording verbatim - it is the strongest available answer to "do papers bring
  practical value".
- **A vendor paper's counter-lane is the competing vendor's paper - one fetch.** The
  competitor's own ablation (graph +2%) did more damage to the graph-memory pitch
  than any critique could, and it converged with the shapes-study hybrid-ties-flat
  into a convergence-earned golden-path paragraph. Second-sighting rule satisfied by
  two parties with opposite interests - the best kind.
- **Cross-run convergence is compounding: the failure-taxonomy paper's measured
  interventions (+9.4 role specs, +15.6 verification) ARE run 10's task-envelope and
  brief-carries-the-session, measured by someone else.** When a paper's remedy is a
  technique the corpus already carries, cite the measurement into the technique
  rather than minting a sibling.
- **The scholar-link tell.** Aggregator entries linking to a search query rather than
  a stable id mark the thin tail; stable-id density per section is a cheap relevance
  prior for the next list.

## 0.8.0 - 2026-08-25 - ai-registry (run 13: app aggregator; bumped to 0.9.0 in the same change)

- **New source class: the app/tutorial aggregator - mine the periphery, not the apps.**
  All three landings came from CI gates, validators and one law-instantiating schema;
  every app-architecture cluster resolved to catches against forged bundles. The class
  row encodes it, with the checkout-verification instrument lesson (a Windows path
  casualty silently halved the clone; git ls-tree vs ls caught it).
- **The best ecosystem lesson was operational, and adopting it beat describing it.**
  The source's five-tier skill eval ladder became a running instrument
  (`check-skill-triggers.mjs`) in the same run that read it - and proving the new
  instrument (lower the floor, check the distribution) surfaced that today's lane
  passes with its top pair at 0.41 vs the 0.45 floor. An adopted check is a stronger
  landing than a documented pattern; reach for it when the source's periphery fits the
  registry's zero-dep doctrine.
- **A decline can cite the doctrine, and the doctrine cuts both ways.** Hash-chained
  audit trails were declined by the same single-owner rule that retired branch
  ceremony here - tamper-evidence defends against a party that would falsify the
  record, and this fleet has one party. Writing the decline against a named doctrine
  makes it durable: the next hash-chain demo is a one-line catch.
- **A tutorial tree can corroborate a law even when it cannot anchor an application.**
  The typed-RAG entry enforced answered<->citations mutual exclusion with tests -
  grade-lower than a practitioner tree, but as a *sighting* beside the fleet's own
  enum-armed schemas it carried an amendment. Tutorial code is evidence about shapes,
  not about production.
- **Zero web fetches.** The clone was the source; the corroboration was the corpus and
  the fleet. Cheapest run of the series.

## 0.9.0 - 2026-08-25 - ai-registry (run 14: commissioned paper batch; no bump - lessons only)

- **The commissioned sweep is the paper-aggregator class without the list: search,
  triage by the same measurement-over-framework rule, read 3-4.** Web search surfaced
  ~15 candidates; the two framework batches screened out at title level would have
  read exactly as run 12's coordination cluster did. No new class row needed - the
  paper-aggregator row's rules carried over unchanged.
- **A paper about the thing the fleet runs beats a paper about the field.** The CLI
  trajectory anatomy out-yielded everything since run 10 because its unit of analysis
  IS our unit of operation (a dispatched worker's trajectory). Rank candidates by "do
  we run this?" before venue or recency.
- **When two independent corpora price a rule the corpus minted last week, write the
  numbers INTO the rule.** Fabricated success (26%) and constraint violation (38%)
  went into task-envelope and enforcement-demotion as measured paragraphs rather than
  new techniques - third occurrence of the cite-into-existing move, now clearly the
  default for convergent measurements.
- **Read-and-decline is a first-class outcome for a full paper.** The PR study was
  read completely and earned one recorded line (no maturity effect). Saying so keeps
  the next PR study a comparison instead of a re-read.
- **The window is the operator's, and naming a violation got a better decision.** The
  strongest paper of the batch sat just outside the 2-month window; flagging it and
  asking beat both silent inclusion and silent exclusion.
- **Instrument: direct arXiv PDF ingest works** (14,774 words, exit 0); `title: null`
  on PDFs is the remaining gap - banked as a lead, not fixed mid-run.

## 0.9.0 - 2026-08-25 - ai-registry (run 15: practitioner-judgment relay; bumped to 0.10.0 in the same change)

- **OPERATOR FEEDBACK, verbatim in substance: "we are focused on low level numbers and
  practices often invalid in couple of months or across different llm providers -
  either the resources suck or we lack ability to create higher level perspective on
  top of the researched content."** The second clause was correct. Runs 10-14 landed
  clean granular material and never proposed the synthesis; the operator had to. The
  numbers were not waste - they were the corroboration the law layer requires - but
  the skill treated corroboration as the product. Applied as the altitude column
  (law / doctrine / technique / dated fact), a standing preference for the highest
  altitude the corroboration supports, and a mandatory cross-run convergence check:
  a finding sharing a root with two prior runs lands as the root.
- **The law was already paid for when this run started.** Five independent sightings
  sat in the ledger; the source's only real contribution was phrasing the root well
  enough to see it. A judgment source is the right trigger for a law pass exactly
  because it carries shape without numbers - read it ASKING "which of our measured
  findings is this the qualitative form of?"
- **A run can change the skill and the corpus in the same motion.** The altitude rule
  was applied to this run's own triage before it was written into the file - the
  table the operator picked from already carried the column. Dogfood the change in
  the run that mints it.
- **"Unoriginal" praise is a class marker.** The source itself says the advice is
  ordinary senior-engineer judgment that now must be written down because agents
  arrive with zero acculturation every session. That is the registry's founding
  premise said backwards, and it is why judgment relays will keep resolving to
  catches-plus-roots rather than techniques: the techniques are already here; the
  roots are what they still lack.

## 0.10.0 - 2026-08-26 - composer-song-editor

- **An exit-3 stops the mining lane, not the session.** The thinnest source ever
  (76 words) arrived with an operator question attached - where does audio live? -
  and the question, not the transcript, carried a category-sized run. Credit the
  yield honestly: the note names the question as the body and the source as one
  catch plus one clock. The class (vendor product announcement) is characterized
  in the note: reliable only for "the vendor shipped it", and its best use is as a
  pointer at the vendor's docs, which is where the one strip-test survivor of this
  run actually came from.
- **The best catch of the run was a law outrunning a product.** The announcement's
  headline feature IS `edit-do-not-regenerate`, forged before the product existed
  and cited by 13 documents. Worth saying in triage tables when it happens: "the
  corpus states the vendor's pitch at higher altitude" reads as calibration, and
  it is the strongest form of already-covered.
- **Structure questions get instrument evidence, not opinion.** The operator asked
  domain-vs-category; the decisive facts were mechanical - research-map filed a
  hypothetical music subject under `visual-generation` (a category that cannot
  hold it), every existing domain is job-named rather than substrate-named, and
  the consumer test split audio users across four bundles that are each correct.
  The four-way discriminator (producing / placing / plumbing / judging) landed as
  boundary prose on both sides per the no-cross-links rule.
- **A same-day consumer tree turns a forge into a verification.** The category was
  written in the morning and one of its techniques was measured in a real tree by
  evening (10.000s briefed, 10.032s delivered) - and the tree pushed back
  usefully: the vendor delivered a different bitrate than requested, which is the
  acceptance subject's measure-don't-trust doctrine demonstrated unprompted. An
  application written the day its subject is born beats a process-only launch.
- **Platform note.** The Windows shell resets cwd between calls unpredictably
  under sandboxing; a mid-run `cd knowledge && grep` left later relative paths
  silently wrong until re-anchored. Use absolute paths or re-`pwd` after any cd.

## 0.10.0 - 2026-08-26 - ai-registry (run 17: curriculum repo; no bump - lessons only)

- **"Spec plus execution" collapses the XL lag, and the worker pool is the spec.** The
  operator picked execution over banking; the spec never existed as a document - it
  became three parallel forge briefs plus a director-written golden path, and the
  subject landed gate-clean in one session. When the operator is present to review,
  the dispatchable-spec artifact is overhead; write it only when execution is
  deferred.
- **Partition by the work's own axis, and say why when the operator suggests another.**
  The operator offered per-language workers; the subject is language-agnostic process
  craft, so the split was per-technique (two each, three workers). Naming the axis
  choice in the plan - not silently substituting - is what kept it a decision instead
  of a disagreement.
- **All three workers overrode the same brief error, independently, with the same
  argument.** The director's law-link depth was wrong (four ups; the sibling files
  prove three). Third occurrence of "link depth is per-file, count from the file being
  written" - and the strongest yet for the override-and-argue clause in briefs: a
  brief error briefed as non-negotiable would have shipped three times.
- **A deferred category's return condition fired and was recognized.** The i18n waves
  deferred a `craft` category "until a non-skill consumer needs it"; this source was
  that consumer. Deferred-with-condition beats deferred-vaguely exactly here: the
  trigger was checkable, so the arrival was a decision already made.
- **A sibling session ran its own intake between my runs and took the run number.**
  Renumber from the ledger, never from memory; the ledger is the authority on run
  count as on everything else.

## 0.10.0 - 2026-08-26 - next-16-3-3-fleet

- **New source class: the operator dispatch.** No URL, no transcript - a version
  number, an observation about the fleet, and a framing. It is authoritative about
  LOCAL facts (the version numbers checked out exactly) and unreliable about the
  GLOBAL frame (the subject it asked for could not be built). Near-inverse of the news
  roundup, which is reliable that the world moved and unreliable about why. Verify a
  dispatch's premises against the trees and its framing against the corpus; the second
  is where it fails. Class row added to the ledger.
- **The most valuable thing a dispatch can be is wrong in a checkable way.** This one
  asked for a performance-tracking topic because "each minor feature can improve our
  performance." The named release was two critical unauthenticated RCEs whose AVIF fix
  is a *removal*. Accepting the framing would have produced a performance topic and
  left six checkouts inside two advisory ranges. The premise was checkable in two
  fetches - check it first, always, and check it before the corpus work, not after.
- **Run the denylist before promising the topic.** The literal ask - a `knowledge/`
  subject on a named framework - was unbuildable: the framework, its bundlers and its
  view library are all on the `software` purity denylist. This is checkable in one
  grep at triage time and it reshapes the entire run, so it belongs in Phase 4 or
  earlier. Say the split out loud (transportable half -> technique prose, product-named
  half -> application + instrument) rather than half-building the ask.
- **Read the four neighbours' boundary statements before declining an XL.** I declined
  a subject proposal at triage on the grounds that three subjects covered it. During
  verification all four candidate homes turned out to scope explicitly *away* from the
  concern. The decline did not survive its own run. Boundary statements are cheap to
  read and this corpus writes them in the golden path's opening - read them at triage,
  not at landing, or the triage read is guesswork wearing a confidence.
- **A contradicted premise and a real gap can be the same finding.** Rows 1 and 2 were
  presented as separate techniques and landed as one amendment. Two techniques there
  would have been padding: they are one insight seen from the risk side and the benefit
  side. Merging is a reportable outcome, not a shortfall - say which rows merged and why.
- **Instrument the fleet fact rather than filing it.** The "fleet version ledger"
  candidate would have been a file stale by the next release. Written as a script with
  a `--min` floor lane and an exit code, it answers the same question forever and turns
  every future advisory into one command.
- **The new instrument caught the run's own defect within a minute of existing.**
  `npm install <pkg>@<version>` rewrites an exact pin to a caret range; the upgrade had
  silently changed four projects' pinning policy while fixing their vulnerability -
  the same class of defect as the finding itself. Build the instrument BEFORE the
  cross-repo commits, not after, and run it against your own work first.
- **Overriding a triage row is allowed for the runner too.** Row 7 said "extend
  fleet-audit"; the script's own charter is the skills lane, so it became a sibling
  instrument instead. The skill asks workers to override and argue - the same duty
  applies to the session holding the skill.

## 0.10.0 - 2026-08-26 - supermemory (vendor repository)

- **A closed engine still ships its ontology.** The product's memory engine is hosted
  and absent from the repo; its full record schema - `forgetAfter`, `forgetReason`,
  `version`/`parentMemoryId`/`rootMemoryId`, an `updates|extends|derives` relation enum -
  was published anyway in the TypeScript types of a *visualization* package, because
  that package is typed against the live API. Ingesting the README produced 2,091 words
  of marketing; one shallow clone plus one file produced the run. New class row written
  (0.11.0). Generalise: when the interesting component is closed, read the types of
  whatever open thing renders it.
- **Zero fetches, and the budget was never the constraint.** All corroboration came from
  the clone, the corpus, and a connected tree. A vendor's SOTA claims were deliberately
  left unverified because the corpus does not need the ranking - spending a fetch to
  check a leaderboard would have bought nothing a finding rests on.
- **The strongest outcome was the tree overriding the technique.** The episodic-capture
  amendment was drafted claiming a crowded distillation batch never names what it
  crowded out. The connected tree's packer names it (`dropped` against
  `total_available`, surfaced into the distiller's own prompt) and goes further -
  overflow is *deferred* to the next pass with the stopping boundary recorded, not
  discarded. The technique now carries "overflow defers; it does not drop" and it came
  from the code. Phase 8's "look for the structural fact" cuts both ways: sometimes the
  tree disproves the sentence you arrived with, and that is the run's best product.
  Draft the amendment BEFORE opening the tree, so the tree can contradict something.
- **Another session mid-write is a worktree, not a negotiation.** Personas' active
  branch had a live agent editing `companion/brain/**` - `semantic.rs` touched two
  minutes before the run reached it - with a declared scope covering exactly the target
  files. The mtimes plus `.claude/active-runs.md` answered this in one command, and it
  is worth making a habit: **check mtimes against the clock before choosing a lane**, not
  just `git status`. A pathspec commit would have swept a sibling's unlanded work.
- **A worktree off HEAD means the WIP's code does not exist yet.** A comment was written
  citing a table (`companion_fact_tombstone`) and a function seen in the *working copy*;
  neither is in `HEAD`, because both belong to the other session. Caught only because a
  grep for the symbol in the worktree came back with one hit - the comment itself. When
  a run reads a dirty tree and then writes in a clean one, every symbol learned from the
  dirty read has to be re-verified against `HEAD`.
- **Verification degraded gracefully instead of being claimed.** A fresh worktree could
  not run the Tauri build script (`updater:default not found`) and the test profile
  outran the time budget. Rather than assert green: baseline-with-changes-stashed was
  shown to fail identically (so the failure is environmental, not the change), the db
  crate was checked alone, the DDL and sweep semantics were exercised against real
  SQLite, and `parse_expiry` was compiled standalone with rustc and run over 15 cases.
  The commit and the application both say the unit tests are unrun. Partial verification
  named precisely beats a green claim that covers a gap.
- **The project's own pre-commit hook is a reviewer.** lefthook's rustfmt gate rejected
  the first commit. Fixing the formatting was correct; `--no-verify` would have been the
  cheap wrong move and the ledger would never have shown it.
- **Heredocs mangle backslashes and non-ASCII on this platform.** Multi-line Python
  patches piped via `<<'EOF'` silently lost a backslash level and mis-decoded em-dashes
  on stdin. `PYTHONUTF8=1` fixes the decode; nothing fixes the backslashes reliably -
  write the patch script to a file and run it. Companion to the existing `py` note.

- **Take the connected project's baseline BEFORE the cross-repo change.** Phase 8 landed
  an upgrade in six trees and only then tried to build the one risky member. It failed,
  and proving the run innocent cost a full reinstall-and-rebuild cycle. The build was
  already red on the outgoing version, in a different phase - the upgrade had unblocked
  an early failure and let the build reach a second, older defect. A post-upgrade failure
  in a DIFFERENT phase from the pre-upgrade one is a question about ordering, not a
  conclusion about cause. Cost of the baseline: one build that was going to be run
  anyway. Phase 8 should take it before touching the tree, not after.

## 0.11.0 - 2026-08-26 - stop-building-ai-slop

- **Length is not yield, tested at the far end.** 14,649 words - the longest
  source the ledger has taken, more than double the previous roundup record -
  produced one amendment. The method has asserted this since 2026-08-22 on the
  evidence of a short talk beating a long roundup; this run is the other tail
  and it holds. The `--min-words` floor asks whether anything is there; the
  class predicts how much is worth having. Nothing about the word count did.
- **Practitioner tutorial (course walkthrough), second observation - the row is
  earned.** 2026-08-23: 9,483 words, 1 accepted. This run: 14,649 words, 1
  accepted. The class is a *demonstration transcript* and its ratio of
  narrated-clicking to stated-reasoning is the worst in the ledger. Predict 1-2
  and say so before the table.
- **Mine a tutorial's residue, never its curriculum.** Every candidate that
  survived the strip test came from something the creator did in passing; the
  five things the course set out to teach produced nothing at all. The accepted
  finding came from a 40-second cost aside, and the strongest unpicked
  candidate came from the creator silently trimming a video to hide a defect.
  For this class, read for the workarounds, not the steps.
- **A source's demonstrated failure outranks its stated advice, and can be the
  better half of one finding.** The accepted amendment has two bullets: the
  first is the source's advice generalised, the second is the source's own
  unremarked failure (a probe covering only the opening, and the render
  breaking past it). The second bullet is the one the corroborating literature
  did not supply. Watch for the moment a creator fixes something on camera
  without naming it as a lesson - that is the class's densest seam.
- **The enumeration hunt found this one too - four runs, four times.** The gap
  was two worked examples inside a technique's third section, both silently on
  the same axis. "This document lists its cases - is the list complete?" remains
  the highest-yield read available once a candidate has a home.
- **Corroboration that sharpens beats corroboration that confirms.** The single
  fetch turned "use a cheap medium to preview an expensive one" (a tip) into
  "each rung dropped a dimension, and the dropped dimension is unsettled, not
  approved" (a rule with a law behind it). Budget the fetch for the pick most
  likely to be *reshaped*, not the one most likely to be validated.
- **A near-empty and a total empty in the same mapping call, read differently
  and both correctly.** `storyboard` was empty over 111 techniques but the
  concept lived under other words - a seam, so the landing was a boundary
  inside an existing technique, not a new one. `ui cloning` was empty and is a
  real hole. Same instrument output, opposite meanings; only opening the top
  prior-art file separates them.
- **A convergence pair earns a golden-path root, and the root is not either
  sighting restated.** Two runs had seen a synthetic testimonial with no witness
  and a silent generated figure in a labelled slot. Written as a third instance
  it would have been another technique about generated people. Written as the
  root it became a second *family* alongside the corpus's three laundering
  forms - claims with no referent at all, which pass every grade-propagation
  mechanism silently because there is no grade. The test that found it: ask what
  the sightings share that the existing structure cannot express.
- **A well-forged technique that declares your case out of scope is telling you
  to write a sibling, not an amendment.** `performer-claims-need-a-person` says
  "the trigger is the line, not the face" and has a two-property test requiring a
  spoken claim; the new case has no line. Amending it would have meant rewriting
  its thesis, which is not an amendment. The rule: amend when the case extends
  the technique's trigger, mint a sibling when the case has a *different*
  trigger, and state the boundary in both files either way. The default toward
  amendments still holds - this was the exception, and the exception is legible.
- **The best catch is one where the corpus holds the correct procedure and the
  source recommends its exact inverse.** Finding 3 resolved almost entirely to
  `style-onboarding-from-sample`, which already said the sample must never be a
  conditioning input. Do not stop at "already covered" - ask *why the source's
  advice felt safe to follow*, because that is the residue. Here it was an
  unmodelled layer (structure) whose presence made the corpus's own recommended
  step (restyle) read as compliance while the identifying layer passed through.
- **A run's own catalog must never be regenerated from a tree holding another
  session's uncommitted work.** `build-catalog` swept a parallel session's
  LESSONS.md edit into catalog.json (lessons 47 to 48). Hand-patching a
  generated JSON back is worse than the disease - the first string replace hit
  the wrong occurrence. Correct move: `git checkout HEAD -- catalog.json`, leave
  it out of the commit, and say in the report that it needs regenerating once
  the sibling lands. A stale derived artifact is visible and self-healing; a
  committed one asserting a count that is not in HEAD is neither.
- **Legal-adjacent findings stay engineering-grade by finding the discipline's
  own discriminator.** The trade-dress candidate could have become alarmism. One
  fetch supplied both the correction (the identifying unit is the *combination*,
  so swapping the cheapest axis clears nothing) and the carve-out (functional
  arrangements are not identifying), and the carve-out is what turned it into a
  decision rule a team can apply: not "have I changed enough" but "which of what
  I kept is functional and which is identifying".

## 0.11.0 - 2026-08-26 - jd-opensource/JoyAI-Echo

- **New class: research-model release** - engine plus operating instructions in
  one tree. Rank the artifacts before reading: first-party prompt-engineering
  documents, then config-plus-the-code-that-reads-it, then the README a distant
  last. Three of four findings came from two shipped system prompts; zero came
  from the README; zero web fetches were needed for the whole run because every
  document claim had an implementation in the same checkout.
- **Diff the sibling instructions first in any multi-project release.** The
  single cheapest move of the run. Two shot-prompt writers from one lab
  disagreed about camera language, and that disagreement *is* the discriminator
  - a boundary drawn by people who had to draw it, delivered for free. A
  single-system repo cannot produce this. Generalisation: when a source
  contradicts *itself* across two artifacts, that is the highest-value thing in
  it, higher than anything it states confidently once.
- **Look for the rule that silently depends on a property of its one example.**
  The restatement law held for years because its constant was always a *style*,
  and a style has no moods. The precondition (a restated block may contain
  nothing that varies) was invisible until a source made the constant a
  character. This is a repeatable hunt, and it is different from the
  enumeration hunt already in the method: not "what does this list omit" but
  "what is this rule quietly assuming about the only case it was forged
  against". Both findings 1 and 4 have exactly this shape - finding 4's
  keep/demote/strip enumeration assumed *separability*, which was free until a
  model emitted one waveform.
- **Two independent implementations of one policy inside a single source beat
  a second source.** The bank pinning its earliest slots and the attention
  cache holding a persistent sink are different mechanisms at different
  altitudes reaching the same rule. That is convergence *within* a first-party
  account, and it answers the class's standing weakness (sample size one) for
  the specific claim - the policy is about the problem, not about either
  implementation. Worth looking for deliberately: when a repo solves the same
  thing twice, the shared part is the finding.
- **Read the validator, not just the value.** `max_size: 7` is a number;
  `_trim()` keeping a fixed prefix is the policy; the cache's `validate()`
  asserting `0 < sink < window` and `chunk <= window - sink` is the *reason*,
  and it produced both bounds that made the landed amendment more than a
  restatement of a default. Assertions in a source are the author telling you
  what they think can go wrong.
- **Escalation of the 0.10.0 catalog lesson: HEAD itself can be the broken
  party.** Last run's rule was "never regenerate the catalog over a sibling's
  uncommitted work". This run found HEAD's committed `catalog.json` already
  counting two technique files the sibling had not committed, so
  `build-catalog` FATALs for *everyone* until they land - the guard is correct
  and the tree is wedged by someone else's partial commit. Correct move is
  unchanged and now has a second reason: restore both derived artifacts to
  HEAD, commit content plus your own bundle's index, and say plainly in the
  report whose commit owes the regeneration. Check `git show HEAD:catalog.json`
  against `git show HEAD:knowledge/<bundle>/index.json` before assuming a
  mismatch you observe is yours.
- **A `cd` in an `&&` chain silently skipped a heredoc write.** The shell's cwd
  persists between calls, so a re-issued `cd` failed, and only the first of two
  file writes was gated on it. Verify files exist after a batched write rather
  than trusting the exit code of the batch.

## 0.12.0 - 2026-08-26 - knowledge-compressor (run 23)

- **A source's method can be the finding while its result is not.** The article's
  headline (documentation halves) was measured on one synthetic article written
  to have the redundant texture of real docs, and it did not transfer to this
  corpus at all. Its *loop* transferred completely, once corrected. For the
  first-party class, read the procedure as the deliverable and treat the number
  as an artifact of the test material until something replicates it.
- **The second observation of the first-party row holds, and sharpens.** Both
  technique-level findings came from the author's stated failure modes ("one
  risk with this agentic process is that the agent might play it safe"), not
  from features. That is now twice, counting the release-walkthrough run. **A
  practitioner describing what nearly went wrong outproduces the same
  practitioner describing what works** - promote this to the class row when a
  third run sees it.
- **Zero fetches, three findings at technique level.** The first run in the
  series to spend nothing from the corroboration budget and still land above
  dated-fact altitude. What paid for it: corpus-internal convergence (the same
  move already existed in two other subjects, against other unknowns) and a
  prior run's banked vendor arithmetic (`cache-continuity`, 2026-08-25). The
  untriaged tables and banked derivations are the reason the budget went unspent
  - that is the compounding the vocabulary was designed for, showing up.
- **When the corpus already holds a move twice, the third sighting is a boundary
  job, not an import.** `negative-control-tests` and lane ablation were already
  here. The finding was not "add ablation" but "name what each of the three
  deprives, and what is unknown in each" - which is why both new files close with
  a boundary section and the subject note records the pair.
- **Build the corrected method, not the published one - and say so in the lane
  doc.** The compression lane implements the source's loop with two mandatory
  changes and states the composition order, because run in the other order it
  destroys content while reporting success. A lane doc that reproduced the
  source faithfully would have been a trap with a citation.
- **Read the instrument's output before trusting its number.** `compression-scan`
  counted overlapping shingles as separate repetitions and reported 74.3% where
  the truth was 15.1%. Caught by looking at the printed spans and noticing one
  passage listed nine times. The naive figure would have licensed exactly the
  destructive pass the lane exists to prevent: **the instrument nearly authorized
  its own worst outcome on run one.** Self-test now asserts the merge.
- **A negative result is the deliverable when the operator asked for a build.**
  The lane shipped complete and its first answer is "do not run the expensive
  half on this corpus" (mean repetition 0.94%; top document two-thirds
  irreducible under a real screen). Reporting that as a finished build rather
  than as a failed experiment is correct - the screening instrument earning its
  cost by saying no is the instrument working.
- **Run the screen on yourself, in the honest order.** The Phase 1 trial worked
  because predictions were written to a file *before* the document was opened.
  Any other order is unfalsifiable. Cost: one file, two minutes; it produced the
  run's most decision-relevant number.
- Instrument gotcha: a heredoc carrying a file that itself contains fenced-code
  backticks fails on this platform. Use the Write tool for scripts.

## 0.12.0 - 2026-08-26 - dhh-lex-fridman

- **The podcast interview leaks the counterexample to its own advice.** A
  practitioner essay edits practice into agreement with its thesis; five hours
  of conversation cannot. This run's best finding came from the gap between
  what the source SAID (be as vague as you can) and what it NARRATED DOING (a
  tightly-enveloped dispatch: single binary, pixel-identical, do not stop).
  For this sub-class, mine the anecdotes against the advice - the contrast is
  the discriminator, and it is the one artifact the speaker did not curate.
- **A "contradiction" of a technique is usually its unstated precondition.**
  The source appeared to invert `task-envelope`; reading the file showed the
  technique silently assumes a knowable done criterion, and the source's claim
  was the complement case. Third sighting of this shape (2026-08-21 precision
  tier, 2026-08-23 amplitude): when a credible source inverts a forged rule,
  look for the predicate both sides are conditioning on before drafting a
  correction.
- **3.7x the record length, median yield.** 54,597 words produced three
  amendments - same as a 76-word product announcement produced four landings.
  The craft fraction of a general-audience podcast is maybe a third, and the
  extractable fraction of that follows the class, not the wordcount. Do not
  scale the extraction pass to the transcript; scale it to the class.
- Transcript over 256KB: the Read tool caps out; chunk by offset. Five reads
  covered it; the run's context cost was dominated by the transcript, which is
  the argument for keeping Phase 3 extraction in-context rather than re-reading.

## 0.12.0 - 2026-08-27 - video-workflow-batch (8 sources, first batch run)

- **Batch ingest works, and the batch produces a signal a single source
  cannot: within-batch convergence.** Eight tutorials, deduped at extraction
  into 15 candidates; every candidate carried by 2+ independent creators
  landed on verification (5/5). Not cross-run convergence - the sources share
  an ecosystem - but it separates one creator's habit from a field's
  practice, which is what triage needs. Record the source count per row.
- **A batch also reveals clusters.** Five of ten accepted findings sat on
  multi-clip sequence continuity - a missing STAGE between the bundle's
  image subjects and its assembly subject that no single video would have
  shown. When several sources' findings share a neighbourhood, say so at
  triage; the cluster is itself a finding about the bundle.
- **Vendor-channel tutorials are first-party practitioner accounts wearing an
  ad.** The densest source of the batch (6 findings originated or
  corroborated) was the platform's own channel. The strip test deletes the
  sponsor along with the product names; what it cannot save are the
  tool-selection claims ("best model for faces"), which were the batch's
  least durable sentences and landed nowhere.
- **The cross-repo lane's best find was a leak shape, not a technique
  sighting: the contract with one caller outside it.** The consumer enforced
  the text half of a two-channel contract through a compiler no call can
  skip, while the image half rode an optional field - so production ran
  text-only against an approved reference sheet for weeks, beside a
  playground that measured conditioning 67/33. When verifying a contract in
  a tree, enumerate the CALLERS of the optional half; the compiler proves
  only the mandatory half.
- 26,578 words across 8 sources ≈ one good talk's yield. Two sources yielded
  zero (a sponsored speedrun; an off-domain builder video). A batch buys
  coverage, not per-source efficiency - price it that way at triage.

## 0.12.0 - 2026-08-27 - video-workflow-batch-2 (12 sources, ~5 voices)

- **Count voices, not videos.** Six of twelve sources were one creator; a
  batch's convergence column must dedupe by author or it manufactures
  corroboration out of one practitioner's habit. The signal that survived
  the dedupe (cross-author, cross-platform) predicted landings as well as
  run 24's did.
- **Back-to-back related batches compound.** Four of ten landings were
  widenings of the previous day's amendments, each corroborated by an
  independent source the second batch supplied. Mining a related batch
  while the first is fresh converts single-source landings into
  corroborated ones at the cost of a sentence each - sequencing is a lever
  the operator controls.
- **Re-map against HEAD mid-run in a shared checkout.** A parallel session
  landed a new subject in the same bundle between runs; Phase 4's first map
  would have mis-homed two candidates. The instrument's own branch warning
  covers other branches - it cannot cover commits that land after you read
  the worklist. Cheap fix: re-run the map (or at least re-read the bundle's
  subject list) before Phase 6 homes are final.
- **A law can land from intake when the sightings are cross-run.** Three
  consecutive runs, three channels (camera, beat grid, emotion), one shape;
  the law wrote itself as the root and the three techniques cite it. The
  altitude guidance's synthesis step worked exactly as written - the
  operator was offered the law-level landing at triage rather than a third
  local paragraph.

## 0.12.0 - 2026-08-27 - control-center-dashboard

- **New class, first observation: the practitioner build-walkthrough of a
  personal tool.** A hybrid whose two halves have opposite reliability, which
  is what makes it worth naming. The *tour* half is a feature demo - it shows
  the solution, hides the problem, and improvises its explanations on camera.
  The *operating* half - the handful of sentences about a tool the builder has
  actually run daily for months - is a genuine first-party account. The
  discriminating question is cheap and it decided every row in this run's
  triage: **is he describing what the tool does, or what happened to him while
  using it?** All three findings came from the second half; the tour produced
  nothing but catches and proper nouns. One observation, so it goes here and
  not into the class list in SKILL.md.
- **The class's build narration is evidence, and it is the honest part.** This
  source left the agent run timers on screen: 15 minutes to a complete-looking
  shell, then 20, 23, 31 and 157 minutes plus a further 41-minute prompt, all
  of it defect repair. Creators hide the failure in a demo and show it in a
  build log, because the build log is the flex. Read the timers.
- **A near-empty that is a seam can sit inside ONE bundle.** The skill already
  warns that a near-empty may be a seam rather than a hole. This run found the
  seam's two sides in the same bundle: `grant-funding` prices source-counting
  in three techniques across two subjects, and its own ingest subject discards
  the count one merge earlier. The tell was that the prior-art hit
  (`stable-dedup-key-selection`) was *thorough* - it resolved cross-source
  overlap two different ways and both were correct, which is what a subject
  looks like when it has answered a neighbouring question so well that nobody
  noticed it never answered this one. Grepping the bundle for the *consumer* of
  a number is a cheaper way to find the producer's gap than reading the
  producer.
- **A source that implements a good idea badly is worth more than one that
  implements it well.** The tool counts how many newsletters carried a story,
  and AI newsletters relay each other wholesale - so its number measures
  promotion, not corroboration. The corrected premise (record carriers at
  *publisher* granularity; a republisher contributes its origin's identifier)
  is the half the technique would not have had if the source had been right.
  Third run in which the corrected-premise pattern produced the stronger
  finding.
- **The enumeration case generalises past this source and is worth carrying in
  the head during Phase 3.** A brief that lists parts supplies a
  machine-checkable done criterion by accident, and the model satisfies *that*
  one. It is the same defect as a padded findings list: counting the artifacts
  produced instead of checking that any of them resolves. Worth noticing that
  `/intake`'s own "report the counts and let them be small" rule is this
  technique applied to itself.
- **Shared-checkout operations: a shared append-only file needs surgical
  staging, not a pathspec.** A pathspec protects files you did not touch; it
  does nothing for `librarian/sources/index.md`, which both sessions append to.
  The move that works: rebuild the file as `git show HEAD:<path>` plus your own
  row, `git add` it, commit, then restore the working-tree version carrying
  both rows. Here the sibling committed mid-run and the problem dissolved, but
  the sequence is the one to reach for and it does not depend on that luck.
  Not yet a SKILL.md line; one sighting.
- **Yield again independent of length.** 5,750 words, three findings - the same
  count as a 2,974-word talk and a 54,597-word interview. Four data points now
  say the `--min-words` floor answers "is anything there", nothing more.
- **Zero fetches, third consecutive run.** Budget 3, spent 0. Every finding was
  corroborated by corpus-internal convergence plus training-data convergence.
  The fetch budget is looking less like a constraint and more like a signal:
  when a mature corpus supplies the other half of a claim, reaching for the web
  is usually a sign the claim has no home yet.

## 0.12.0 - 2026-08-27 - video-workflow-batch-3 (11 sources, ONE creator)

- **The channel corpus is its own sub-class and inverts batch economics.**
  One voice voids within-batch convergence entirely; triage leans on
  corpus-vs-source novelty and cross-run corroboration. Yield profile:
  amendments and corroborations, never new subjects. Recognize it at ingest
  (author column) and say the expectation before the table.
- **Three related batches in three days built a corroboration ladder no
  single run could.** Techniques forged from one source in run 24 are now
  multi-author corroborated (motion plates, storyboard grids, voice
  references) because the operator sequenced related material while it was
  fresh. When an operator feeds a themed series, the skill should track
  which prior landings are still single-source and read each new batch
  against that list first.
- A batch whose every video is sponsor-linked still yielded six amendments;
  the only near-total loss was the model-ranking video (dated comparative
  facts). Sponsorship predicts nothing; demonstrated-mechanics density
  predicts everything.

## 0.12.0 - 2026-08-27 - video-editing-batch (4 sources, operator-dispatched lane)

- **A themed batch dispatched against a named consumer feature is the
  highest yield-per-word shape observed**: the dispatch defines what "real"
  means at triage, and the X-lane experiment executes in-run instead of
  banking as a lead. 7.6k words produced a technique, three amendments, an
  executed probe, and a plan appendix.
- **When the operator gates an experiment on what the sources reveal
  ("allowed if videos discover X"), record the discovery explicitly before
  running it.** The videos established the editor's scriptability; the
  probe then ran under a satisfied condition, not an assumed one - and the
  probe's negative half (the one-time preference gate) was worth as much as
  the positive half.
- The strongest source was 699 words: a builder narrating their own
  connector. Fourth consecutive run where length predicted nothing; the
  ledger's class table already says this - trust it at triage time.

## 0.12.0 - 2026-08-27 - s1-mini-transcript-cleanup (single source, operator-dispatched)

- **New class: the second-hand practitioner review** (a creator demoing a
  vendor release). Behaves like the practitioner listicle but worse in one
  specific way, and the rule is sharp enough to carry into SKILL.md at the
  next reflect: **a demo is organised around a happy path, so it states no
  operating constraints.** Every section of this run's new technique - the
  required control-line grammar, greedy-only decoding, the output ceiling, the
  behavioral-toggle trap, and "empty output is expected" - was in the model
  card and none of it was in the 1,565-word video. **For this class the fetch
  is not corroboration, it is the extraction.** Budget the fetch at triage,
  not after.
- **The segment a demo is proudest of is where its boundary is missing.** The
  video's most persuasive pitch ("clean the correction before it reaches the
  coding agent") was the one placement where the rule inverts. A demo reaches
  for its most relatable example and relatability is uncorrelated with
  correctness. Read the best segment as a candidate counter-case.
- **Shortest source mined to date (1,565 words) and a good run.** Fifth
  consecutive run where length predicted nothing - but the mechanism here was
  different from the previous four: it was not a dense source, it was a thin
  source plus an operator question that forced a primary fetch. Recorded
  because the corrective differs: a thin first-party account needs no help; a
  thin *review* needs the fetch or it yields a lead and nothing else.
- **An operator question with three lanes outperformed the source.** "Do we
  have this path / what does installing it require / is it worth adopting"
  routed to prior-art mapping, a primary-source fetch, and the cross-repo lane
  respectively. The middle lane carried the entire technique. When a dispatch
  arrives with sub-questions, treat each as its own lane rather than
  collapsing them into "mine this video".
- **Write the negative application.** The consumer verdict was do-not-adopt
  and the instinct was to record nothing. The tree turned out to prove the
  technique's central rule structurally - it holds exactly two dictation
  destinations and the reader/reasoner split disqualifies both, which nobody
  designed - and that is better evidence than an adopting tree would have
  given. Phase 8 step 5 already says to look for the structural fact; this run
  is the case where the fact only existed because the answer was no.
- Corpus shape worth reusing: **where a subject explicitly denies a symmetry,
  check whether it denied too much.** `voice-io` insists its two pipelines are
  not mirror images (correct), and that framing had hidden for months the fact
  that their *doors* do mirror and only one was built.

## 0.12.0 - 2026-08-27 - reflect (runs 24-28; bumped to 0.13.0 in the same change)

Six runs had accumulated at 0.12.0 - the longest lessons-only stretch in the series -
and two classes had been explicitly deferred to "the next reflect". This is that pass.

- **The file hit its size budget, and that was the real finding.** SKILL.md was 550
  lines against a ~500 guidance, and the pending additions were worth ~80 more. The
  class list had grown from 2 classes to 9 and was 102 lines of pure reference material
  sitting inside a procedure document. Extracted to
  `references/source-classes.md` (239 lines, the established repo pattern), leaving a
  routing table plus the three cross-cutting rules inline: 551 -> 545 while absorbing
  two new classes, a whole new lane, and six method additions. **A skill that grows one
  lesson at a time needs a periodic structural pass, not just appends** - reflect is
  where that happens, because it is the only phase that reads the whole file.
- **The split's one risk is that the moved material stops being read**, so Phase 2 now
  names the reference file as a step rather than trusting the earlier pointer. A
  reference file a procedure never tells you to open is a deleted file.
- **Two classes landed that single runs had correctly refused to land.** Both the
  build-walkthrough (run 26) and the practitioner review (run 28) wrote "one sighting,
  so it goes here and not in SKILL.md". Holding them was right, and the payoff is that
  they arrived together and turned out to share a discriminator - **a hybrid source's
  halves have opposite reliability, and one question separates them** - which is now a
  cross-cutting rule rather than two isolated class rows. The two-sighting discipline
  produced a better abstraction than either sighting would have.
- **The batch lane was invisible in the method for four runs that used it.** Runs 24-27
  developed within-batch convergence, author-deduping, the channel-corpus sub-class, the
  cluster-as-finding rule and batch pricing entirely in LESSONS. Anything the skill does
  repeatedly and does not describe is a procedure being re-derived from memory each
  time. Worth a standing check at reflect: *what did the last N runs do that this file
  does not mention?*
- **The fetch-budget contradiction resolved into a class property.** Three consecutive
  runs spent zero of three fetches and concluded the budget was a signal that a claim
  had no home; run 28 spent two and they carried the entire technique. Neither lesson
  was wrong - they held different classes. First-party accounts and batches corroborate
  corpus-internally; reviews, listicles and papers are lossy pointers to a primary that
  states the constraints they omit. **The synthesis is the deliverable here**, per the
  operator's 2026-08-25 standing critique: two runs' numbers disagreeing is usually a
  missing discriminator, not a measurement error.
- **Held deliberately, still at one sighting:** the surgical staging recipe for a shared
  append-only file (`git show HEAD:<path>` + your row, add, commit, restore). Run 26
  flagged it as not-yet-a-line and nothing since has needed it. Held.
- Landed from run 28's own operations, because it was verified in-run rather than
  reasoned about: a pathspec commit cannot see unstaged new files, so every new document
  needs an explicit `git add` by name first. Cost one failed commit.

## 0.12.0 - 2026-08-27 - herdr (single repo, first-party agent-runtime class)

Ran the 0.12.0 procedure; another session bumped the file to 0.13.0 mid-run.

- **New class: the first-party agent-runtime repository.** An open-source product whose
  subject matter IS agent infrastructure, so its tree carries production rules for
  agents building it, a skill for agents driving it, and the hooks that enforce both.
  Characterised in the ledger at one sighting.
- **The bundled-skill prediction was wrong and is now a question.** The 2026-08-26
  vendor-repository lesson says a vendor's bundled skill is "an ad with a `use_when`",
  from one that closed by instructing agents to recommend its vendor. This one inverts
  it completely: a *negative* description ("Do not use merely because a task could
  benefit from a background terminal, delegation, or parallel work") and a first
  instruction that halts the skill when a runtime precondition is unmet. The durable
  form is not a prediction but a read: **a bundled skill is written under invocation
  pressure; read which way that pressure resolved.** Amended the class note rather than
  the method, since both observations are single-vendor.
- **When the source implements the primitive, its code is the primary source.** Spent 2
  of 3 fetches hunting a terminal-behaviour citation - the control-sequence reference
  does not state the property, and the obvious multiplexer FAQ does not discuss it. The
  answer was in the tree already open, in the vendored emulator's own API contract,
  stated outright. **Check the tree for the citation before spending the budget on the
  web, whenever the source is an implementation of the thing being claimed.** This is
  the strongest form of "prefer primary" and it costs nothing.
- **A contested home was worth more than the finding.** Two candidates proposed as
  separate techniques merged into one after reading the *neighbour* subject rather than
  the candidate's own. `fleet-orchestration/lifecycle-signals` already owned the state
  machine; what it did not own was the case where its own tier one does not exist. The
  general move: when a candidate looks like a duplicate of a neighbour, read the
  neighbour for **its stated precondition**, and check whether the source's situation
  satisfies it. Here it did not, and that gap was the entire technique. Recorded on both
  sides per Phase 7.
- **Taking a golden path's numbered rule literally, against its own headline tenant.**
  Phase 6's enumeration hunt keeps paying, but the sharpening is *which* counterexample
  to look for: the rule failed on the subject's primary tenant, not an exotic one. A
  thorough document is least suspicious of its main case. Ask "which tenant breaks this"
  and try the obvious one first.
- **Precision about the mechanism changed the fix.** The easy write-up - "the ring misses
  output" - was wrong: the ring is byte-faithful and keeps every byte; what it cannot do
  is reconstruct history the terminal never retained. The wrong version would have sent
  readers to raise the buffer budget forever. Worth a standing check when correcting a
  claim: **state what the mechanism actually does, then what it therefore cannot
  deliver** - not the symptom.
- Operationally clean: the parallel session that held voice-io WIP committed mid-run, so
  index/catalog regeneration was safe. Verified with `git status` before regenerating
  rather than assuming, per the shared-checkout rule.

## 0.13.0 - 2026-08-27 - duckdb-changing-physics-of-analytics (single web source, operator-dispatched at a named weakness)

- **When an operator dispatches a source at a weakness they have felt, check the FLEET
  before the web.** The run's real corroboration was not the post and not a fetch - a
  connected project held a 392-line measured decision guide over the exact question,
  with four dated cases, cross-engine correctness checksums, and negative results. 1 of
  3 fetches spent, and the canonical primary 403'd twice at its own host before the
  author's independent write-up supplied the mechanism. The class rule already says
  reaching for the web is usually a sign the claim has no home yet; the stronger version
  is that an operator-felt weakness is *evidence* the claim has a home, because the
  operator felt it somewhere.
- **Survey connected projects with `git grep`, never `grep -r`.** An untracked sweep
  counted vendored `node_modules` and put a manufactured fact in front of the operator at
  triage ("both projects adopted this engine"). The tracked-files answer was the exact
  opposite - both evaluated it, neither adopted it - and the opposite was the finding.
  It is also ~100x faster; the untracked sweep timed out at 120s on one tree. A
  dependency claim must come from the tracked manifest, and a manifest claim should be
  read as "declared", never as "used".
- **A concept returning zero prior art is a finding; a product name returning zero is the
  purity floor working.** `research-map` returned zero for `postgres`, `sqlite` AND
  `olap`. The first two are the upper layers correctly refusing product names and say
  nothing about coverage. The third is a hole. Reading all three the same way would have
  either dismissed the run or manufactured three gaps. Add the discrimination to the
  Phase 4 near-empty guidance: **classify each zero as concept-zero or name-zero before
  interpreting it.**
- **A category whose subjects all begin AFTER some decision is a stage-zero hole, and it
  is visible without reading a single document.** `data-layer`'s four subjects each
  presuppose the engine (the seam above it, operating it, evolving its schema, converging
  two of them). The Phase 6 instruction to find the missing *stage* generalises up a
  level: run it on the category's subject list, not only on one subject's pipeline. It
  cost one `ls` and it framed the whole run.
- **The strongest finding of the run was a gap between two states of a decision**, and no
  gate can see it: a project measured a 43x win, wrote it as a numbered rule, named the
  workload - and that workload still imports the incumbent. A document recommending an
  engine and a script not using it are each individually valid. Worth generalising into
  the cross-repo lane: when a tree contains a written recommendation, **check the import
  graph before crediting it**, because "decided" and "landed" look identical in prose.
- **The best consumer-tree finding this run was a dependency boundary, not a decision.**
  A private benchmark-only manifest with its own lockfile, gitignored install, and a
  stated reason ("kept OUT of the product package.json so these native engines never
  touch the app's dependency tree or CI") is how an engine gets evaluated at full
  fidelity without being adopted by accident - and it is what made the un-adoption
  checkable from outside. Phase 8 step 5 says to look for the structural fact the tree
  could not have been built to prove; this was one the tree was built to prove and it was
  still the most copyable thing present.
- **The hybrid class held: a vendor announcement wrapped around a systems-design essay.**
  The commercial relationship was announced in the same post that argued for the system,
  which is exactly the provenance that must not author a standard alone - and did not.
  Recorded in the spec's provenance section per-technique, so the one proposed technique
  that rests on the post alone is marked as such rather than inheriting the others'
  corroboration.


## 0.13.0 - 2026-08-27 - managing-15-agents-solo-founder

- **New sub-class, the practitioner DIALOGUE: two first-party accounts compared.** The
  ledger carried the single first-party account already; two of them in conversation is
  not just more of the same, it changes where the yield sits. A single account is
  authoritative about one person and weak about universality, and the standing corrective
  is to land its claims as rules with conditions attached. **A dialogue supplies some of
  those conditions for free: where two practitioners with the same job chose opposite
  defaults, the boundary is already drawn.** These two split on where the agent
  conversation should live - the agent's own threads for context locality, or public chat
  because that is what made background agents legible to a company adopting them - and
  neither was wrong. Same property as a lab shipping two contradicting sibling instruction
  documents. **Diff the practitioners, not just the transcript.** Where they converge
  unprompted is the other signal, and that is what carried this run: both said, without
  being asked, that they deliberately ship less than they could.
- **A triage read that verification corrects DOWNWARD is the run working, not failing.**
  I marked the pick "real gap" on the framing "the corpus models machine throughput and
  has missed that the human is the constraint." Phase 6 step 1 killed that: the corpus
  says it in its own words, in a technique the map did not surface as the primary hit.
  Had I written the correction I triaged, it would have been a phantom fix against a claim
  the corpus already makes - `deepen`'s dominant failure mode, inherited here, and the
  reason step 1 is step 1. Say the corrected read out loud to the operator; the narrower
  finding was the better one.
- **The generalisable shape: when a corpus states a constraint in prose in one technique
  and models it thoroughly in another, the finding is the ASYMMETRY between them.** Not an
  omission - an unequal treatment. Here the machine bottleneck had four measures,
  distribution discipline, denominators and an ordered demand-reduction section; the human
  bottleneck had one sentence, no capacity model, and only per-item slimming. The subject
  sized its first server against machine-paced arrival and routed the entire output into a
  second server whose rate was never written down. **This is invisible to the slug map and
  invisible to a summary** - two files that both "cover" a concept score identically. Only
  opening both reaches it. Add to the Phase 6 repertoire beside the missing-stage and
  enumeration hunts: *find the concept the subject mentions in one place and measures in
  another.*
- **Enumeration hunt, fourth consecutive run, and this one was in the opening paragraph.**
  "Two consequences follow, and the second one is the one that gets missed." An
  enumeration is a claim, it invites exactly one question, and the third consequence was
  the entire finding. The golden-path opening remains the highest-yield paragraph in any
  subject.
- **Ask what the two failure modes sharing a queue look like, because they can be
  opposites.** The source's real gift was that an overloaded machine queue *stalls* while
  an overloaded human gate *accelerates* - rising throughput against an empty backlog is
  the failure, not the win. That single asymmetry is what let the technique separate a
  stall from a rubber stamp with four measures and give them opposite remedies. A
  constraint whose overload signature resembles success is worth hunting for on its own.
- **Landing only what the operator picked kept the technique honest.** Two untriaged rows
  were the obvious mechanisms for the technique's own levers, and folding them in
  unverified would have been padding wearing a decision rule's clothes. The technique names
  the levers generically and says so; the note records both mechanisms with anchors so they
  attach to it later rather than competing with it. `XL` folding (Phase 7) applies to a
  subject-sized SPEC, not to a technique - do not import it as a licence to absorb
  unverified neighbours.
- **0 of 3 fetches, as the class row predicts** - four runs now where a first-party source
  corroborated corpus-internally plus training-data convergence. The convergence here was
  bottleneck analysis and the code-review batch-size literature, neither of which needed
  the source in front of me, which is exactly the bar the corroboration table sets.

## 0.13.0 - 2026-08-27 - best-engineers-focus-on-system-design

- **A hand-off target is a checkable claim, and checking it took one read.** The accepted
  technique did not come from the source. `structure-is-not-delegable` partitions design
  decisions on whether the outcome is scoreable inside the run, owns the unscoreable half
  superbly, and hands the scoreable half to another technique - whose subject turned out
  to be the LLM tool surface, not an engineer choosing between two implementations. The
  class had been defined twice in this bundle and owned by nobody. **Promote this beside
  the enumeration hunt in Phase 6.3: an enumeration that delegates a case to another
  document is a claim ABOUT that document, and following the link is the cheapest check
  available.** Second time in three runs that a "does not apply where..." sentence was the
  highest-value thing on the page.
- **The interview is graded, not segmented - a new sub-shape of the first-party class.**
  A roundup is ten items in a trench coat and must be split on segment boundaries. An
  interview is one continuous gradient and the grade runs one way: the first ~20 minutes
  (his own systems, his own numbers) produced everything, the last ~10 (curiosity,
  learning, motorcycles) produced nothing. Read the first third closely, skim the rest,
  and do not mistake the tail's emptiness for a thin source.
- **A concept returning zero across a mature bundle is the finding - second sighting.**
  `vertical scal` returns ZERO across 149 subjects. The DuckDB run said the same thing
  with `olap` five sources ago. This is now a repeatable instrument rather than an
  anecdote: **probe the concept vocabulary, not the product vocabulary, and treat a zero
  as a missing stage until three checks say otherwise.** Product names returning zero is
  the purity floor working correctly and means nothing.
- **The near-empty discipline earned its keep in the opposite direction.** The map's top
  hit looked like a seam (`metric-forecasting`, which forecasts growth curves). Opening it
  showed a subject that scopes itself to *whether a projection may be displayed* - a
  dashboard discipline. Had I trusted the slug I would have written a correction into a
  subject that does not hold the claim. The hole was real and the nearest neighbour was
  the proof.
- **XL folding worked, and the placement section had to argue against itself.** Five
  fragments that each looked standalone at extraction went into one dispatch. But the
  resolved category (`backend-platform/resilience`) is the *least-bad* home, not an
  obvious one, and saying so - with both rejected alternatives and an explicit instruction
  to override - is what makes it dispatchable rather than a decision smuggled into a brief.
  A spec that hides its own weak joint buys compliance with a mistake.
- **Parallel-session hazard, in its most concrete form yet.** The checkout gained two
  commits mid-run, including a bump of this skill from 0.13.0 to 0.14.0. Re-checking HEAD
  before staging was what kept the corpus correct: the sibling's commit had NOT regenerated
  `index.json`, so my regeneration had to carry both techniques, and a naive "their file is
  untracked, stay away from the index" would have committed a stale index. **Diff the
  shared derived artifacts against the CURRENT HEAD immediately before staging, not against
  the tree you started from.** Record the version the run *used*, not the one on disk when
  it ends.
- **0 of 3 fetches - fifth consecutive zero-fetch run for a first-party source.** The class
  row's fetch prediction is now the most reliable line in the reference file.

## 0.14.0 - 2026-08-27 - agentic-engineering-practical-guide (single web article, first-party practitioner account)

- **In a first-party account, read the failure list first and the recommendations last.**
  This is the run that isolates it cleanly: 15 candidates, 8 of them straight catches, and
  every accepted word came from the author's "they also exposed weaknesses" section. A
  recommendation is what the author believes; a stated failure is what their system did to
  them. Only the second is reliably absent from a mature corpus - **because the corpus was
  built from other people's recommendations too.** This generalises the release-walkthrough
  note ("three of five accepted findings came from the stated failure modes") from a
  sub-class to the whole class, and it should change where Phase 3 spends its attention:
  extract the failure list exhaustively, extract the recommendations as catch candidates.
- **Name the guide shape as a hazard.** A guide *reads* high-yield - organised, confident,
  comprehensive, section per concern - and is structurally low-yield, because
  comprehensiveness over known ground is precisely what a mature bundle already has. The
  recommendation half of this source could have been written from the corpus. Do not let a
  well-organised source raise the expected yield; it predicts catches, not findings.
- **The headline was already owned; the finding was three paragraphs further down.** The
  picked candidate's thesis - put the trust boundary where the agent cannot edit it - is
  owned by a golden-path section titled "The gate lives in the substrate, not the prompt",
  anchored to a law, with two corollaries the source never reaches. Had the run landed the
  headline it would have shipped a duplicate into a subject that says it better. **Phase 6
  step 1 earned its place again: the pick's headline and the pick's finding were different
  claims, and only opening the file separated them.**
- **A completeness claim does not stop being good hunting ground after it has been hunted
  once.** `hitl-approval`'s "the subject owns two flows that are mirror images of each
  other" yielded a third flow on run 4 and a fourth on this run, from two unrelated
  sources, four months apart in corpus time. Run 4's own subject note had even banked the
  observation ("three flows now, and the opening still says two") and the frame was still
  never rewritten. Add to Phase 6 step 3: **a stale enumeration is a standing lead, not a
  spent one** - re-read it every time a source lands nearby, and check the subject note for
  whether a previous run already flagged it.
- **The denial hunt (step 3's second half) fired for the second consecutive run.**
  `gate-state-machines` says approval transitions are driven only by a human. True for
  verdicts; read across the whole harness record it forbids the amendment lane the source
  measured as the *normal* case in 173 real harnesses. The corrective is not to weaken the
  denial but to name the distinction it was missing - a verdict says a gated thing may take
  effect, an amendment says the route changed inside a scope already granted.
- **Fold the failure modes in; do not let them become five thin candidates.** Three of the
  source's five measured weaknesses became sections of the one technique (asymmetric cost
  of the fixed tier, the reaper on task-scoped records, and the boundary in "what this
  cannot do") rather than separate rows. The XL folding rule from run 32 applies below XL
  too: fragments from one source that share a mechanism belong in one document.
- **Declining a pick is a result and the reason is the reusable part.** Row 2 - risk
  proportionality - lost cleanly to an existing section with four named triggers and an
  explicit complement. The one non-identical edge (the corpus prices over-gating as *human
  attention* depletion, the source measured it as *task latency*) was real and too thin to
  carry a technique. Writing that edge down is what stops the next run re-proposing it and
  what would let a second sighting promote it later.
- **The derived-artifact hazard ran the OTHER direction this time.** Run 32's lesson was
  "diff shared derived artifacts against current HEAD before staging". Here the sibling
  session ran `build-index` mid-run and swept this run's in-flight technique into *its*
  regeneration, then kept landing files - so `index.json` went from current to stale to
  containing my technique but not theirs, while their new file was never in HEAD.
  **Regenerating would have committed an index referencing a file absent from HEAD, which
  breaks a clean clone; the safe move is to commit content only and leave the generated
  files to whichever session lands last.** The asymmetry is worth stating as a rule: an
  index missing your content is stale and recoverable, an index citing content that does
  not exist is broken. **When they conflict, prefer stale.**
- **0 of 3 fetches - sixth consecutive zero-fetch run for a first-party source.** The class
  row's fetch prediction remains the most reliable line in the reference file.
- **Two heredoc/quoting failures cost real time on this platform.** A `bash` heredoc writing
  the technique died on "unexpected EOF", and a `python -c` inside a double-quoted shell
  string had its backticks command-substituted (which would have silently mangled markdown
  had the assert not caught it). For prose documents containing backticks, apostrophes and
  em dashes, use the file-writing tools directly rather than shell heredocs.

## 0.14.0 - 2026-08-27 - picomq-durable-streams

- **A new class row earned its place: the open-source infrastructure engine.**
  Not the vendor-repository row (that one assumes a hosted engine and sends
  you to the client types). Here the engine, ~14k words of design docs and a
  wire specification ship in one permissively-licensed tree, which is the
  *research-model release* row's structural property - claims checkable
  against implementing code, in-run, no fetch - occurring outside a model
  release. Worth adding to the routing table on a second sighting; recorded
  here rather than edited into the reference on one.
- **Do not price a repository run off the ingest word count.** The ingest
  returned 453 words because that is what a repository landing page renders;
  the tree held roughly thirty times that in design docs alone, and every
  finding came from the thirty. The `--min-words` floor answers "is anything
  there at all" and for this class it is not even answering that - it is
  measuring the wrong file. Stated an expected yield off it anyway and was
  wrong within one phase.
- **Project age predicts the reliability of adoption claims, not the density
  of design decisions.** 15 commits, days old, and the reasoning "its most
  reliable claim is that it exists" was sound for a *currency* read and
  useless for a *design* read. A young infrastructure project has just
  finished making every hard choice it will make and written the reasons down
  while fresh. Discount its maturity claims, not its design docs.
- **Check in-tree docs against in-tree code as routine, not as a spot check.**
  Four greps. It produced the whole run: the write-path doc describes group
  commit as knob-free and self-tuning, the shipped config carries a 250 ms
  timer, an 8 MiB cap and a 50-deep in-flight pool. The prose is the design
  the authors wanted, the configuration is the one they shipped, and the gap
  is where the boundary condition lives.
- **The sibling-systems property is not specific to research-model releases.**
  The reference file names it for labs shipping two contradicting instruction
  documents. Here one repository implemented group commit twice - a timer-
  driven pipelined version in the write path, a timer-free serial version in
  the metadata sink - and the discriminator was visible in the diff without a
  judgement call: serial flushes self-close on the previous flush, pipelined
  flushes cannot and must reintroduce a timer. **Look for the same mechanism
  implemented twice in one tree**; it is cheaper to read than either half.
- **Fifth confirmation that a source implementing a good idea badly beats one
  implementing it well** - and the strongest instance yet, because a single
  source did both and the gap between its halves *was* the technique. Accurate
  docs would have yielded a plausible rule with no boundary attached.
- **Sixth consecutive paying run for the enumeration hunt.**
  `single-flight-primitives` lists four second-caller policies and closes by
  instructing the reader to pick one explicitly - which is what makes an
  incomplete list consequential. Merge was the missing fifth. When a document
  both enumerates and instructs the reader to choose from the enumeration,
  the omission is a defect rather than a gap.
- **Three findings, three amendments, zero new techniques.** At 150 subjects
  this keeps being the right shape: every home already existed and was wrong
  or incomplete rather than absent. Two of the three *corrected* standing text
  (a four-item list that should be five; an ordering rule stated
  unconditionally that inverts across a store boundary).
- **0 of 3 fetches - sixth consecutive zero-fetch run** for a source carrying
  its own primary material. The class row's fetch prediction remains the most
  reliable line in the reference file.
- **Shared-checkout hazard, new variant: my own regeneration swept a parallel
  session's untracked work into the derived artifacts.** `index.json` was
  clean at run start, so the modification was mine - `build-index` scans the
  tree, and the tree held another session's two untracked techniques. Fix that
  worked and should be the standing move: `git worktree add` at HEAD (short
  path), copy in only the files I own, regenerate there, copy the artifacts
  back. Produces a self-consistent commit and touches nothing of theirs.
  **Regenerating derived artifacts is a write to shared state, not a read.**
- **Tooling note for this platform:** long quoted heredocs and `node -e` with
  single-quoted shell strings both break on apostrophes in prose. Write the
  script to a file and run it; do not fight the quoting on note-sized content.

## 0.14.0 - 2026-08-27 - kciter-animation-design (single web article, methodology essay)

- **New sub-class: the methodology essay, and it inverts this skill's cheapest
  filter.** A first-party practitioner account where the author is teaching a
  method rather than reporting a system. The source was mathematics and design
  vocabulary - graphs, damping coefficients, piecewise functions - and carried
  essentially no proper nouns, so **the strip test killed nothing**. Every
  candidate survived into Phase 6. The skill's economics assume the strip test
  does most of the culling for free; when it does not, the whole run's cost
  moves into prior-art verification and the triage table has to be built from
  file reads rather than from the map. Budget the run accordingly: this one
  spent its entire effort between Phase 4 and Phase 6.
- **`research-map` produced its first TOTAL empty over well-covered material.**
  `spring physics` returned "PRIOR ART: none. The corpus has never heard of
  this - that is a finding, not a miss." The corpus covers springs in depth in
  `engine-selection` (retargeting from position *and* velocity, the interruption
  story, the shared scripted engine) and the consumer evidence file records a
  real rAF spring engine. The documented near-empty rule says a *near*-empty may
  be a seam; this run says the same doubt applies to a **total** empty, and the
  check is one grep of the neighbourhood before believing it. Had the zero been
  trusted the run would have written a spring technique beside one that existed.
- **The corollary is the more useful half: the real gap was invisible to the
  instrument for exactly the same reason.** No slug expresses "the contract
  assumes a timed curve". A slug map cannot find a missing *assumption*, only a
  missing *word* - so on a mature subject, expect the instrument to be silent
  precisely where the finding is.
- **A cheap mechanical form of the asymmetry hunt: check a contract's mandatory
  fields against what its sibling technique permits.** `preset-vocabulary`
  required four declarations; `engine-selection` recommends an engine that
  cannot supply two of them; `taste-budgets` filed that same engine as a third,
  incompatible thing. Three files, one subject, mutually contradictory, and
  every one of them individually well written. The cross product of "what must
  be declared" against "what is blessed elsewhere" is a finite list and it takes
  one read per file.
- **Four candidates that are one finding must land as one finding.** The
  operator's standing critique (synthesis comes from the skill, not the
  operator) had a clean instance here: three amendments and a new technique all
  followed from one root - a contract forged for the fire-and-forget timed
  gesture. Landing them separately would have produced four correct edits and no
  statement of what they share. The golden path took the boundary section; the
  amendments hang beneath it.
- **Scoping an over-broad claim beats deleting it.** `unprompted-motion-lifecycle`
  said "for unprompted reveals the answer is **always** one-shot". That is right
  for scroll-triggered and a bug for scroll-driven. The edit changed "unprompted"
  to "scroll-*triggered*" and added the boundary section - the original rule
  keeps its force where it was earned. A denial that denied too much is repaired
  by naming its domain, not by weakening its verb.
- **An enumeration in an opening sentence is as good a target as one in a
  heading.** "Every gesture in the vocabulary runs on one of three engines" was
  line one of the technique, and the missing member was the source's closing
  section. Fifth consecutive run where an enumeration produced a finding.
- **0 of 3 fetches - sixth consecutive zero-fetch first-party run**, with an
  additional reason worth recording for this sub-class: the claims are
  mathematics, which is training-data convergent, so there was nothing a fetch
  could add that reading the corpus could not settle.
- **Parallel-session hazard, a new and sharper variant: the race is between the
  staging-area CHECK and the staging COMMAND, not between the run and the
  commit.** A sibling intake run committed the shared `librarian/sources/index.md`
  - carrying this run's already-inserted row - in that window. The surgical
  "rebuild the ledger from HEAD plus my row" then read the *new* HEAD and
  inserted the row a second time. Verifying the artifact in HEAD caught it and a
  one-line follow-up commit fixed it. **When rebuilding a shared append-only file
  from HEAD, check whether HEAD already contains your line before inserting it** -
  the idempotent form is a grep, not a splice.
- **Also confirmed: do not commit `index.json`/`catalog.json` when another
  session has uncommitted content.** The regeneration swept four references to a
  sibling's in-flight technique. Committing them would have published another
  run's work and left HEAD's index pointing at a file HEAD does not contain.
  Diffing the generated files for the sibling's slug before staging is a
  two-second check and it decided the whole commit strategy here.


## 0.14.0 - 2026-08-27 - openexecutive-virtual-executive

- **The vendor-repository row has the wrong discriminating variable.** The class
  entry is built around the engine being a hosted service, which is why it
  sends you to the client types: a closed client is all you get. This source
  had a hosted engine and a fully open application tree, and the "stated
  production rules" third was not a page but nine hundred files. **Ask what
  fraction of the product is in the tree, not whether the engine is hosted.**
  Closed client gives one types file; open client gives every operating rule
  the team learned, in comments nobody wrote for an audience.
- **New high-yield shape, and it is cheap: diff a tree's rulebook against its
  own code.** Three of five accepted candidates had one form - the prose states
  an absolute, the code knowingly breaks it for a stated correct reason, and
  the prose never names the reason. A contributor guide said *never put dynamic
  content in a cached block* while the cache builder put two computed values
  there and justified each as *process-stable*. Four artifacts blamed a queue
  claim for forcing single-instance while the comment beside the claim said it
  was safe across processes. This is the contradicted-source pattern arriving
  from inside one source, and it is cheaper than the usual form: no fetch can
  adjudicate what the code settles. **The delta between a repo's rules and its
  code is pre-filtered to the rules the team found too simple to follow** -
  exactly the population a mature corpus has not absorbed.
- **The asymmetry hunt has a second, more mechanical form: compare the two
  halves of a seam the corpus states as one.** `mcp-tools` models the inbound
  question in a full technique and gives egress one bullet inside another
  technique. Both files "cover" the seam and score identically to a slug map.
  The generalisation of "which file *measures* it" is **which file has a
  mechanism and which has a policy** - a sentence stating that something must
  be constrained is a policy, and a policy with no mechanism beside it is the
  cheapest gap in a mature corpus to find and the most likely to be mistaken
  for coverage.
- **A subject can be thorough about a mechanism and silent about the number
  that mechanism decides.** `job-coordination` models process death across five
  techniques - verdicts, evidence, lineage, registry reconciliation - and never
  says that the recovery sweep, not the claim, caps the executor count. Third
  hunt beside missing-stage and enumeration, and it generalises: **when a
  subject is exhaustive about how something works, ask what operational number
  it silently determines.**
- **Fold the correction into the technique it corrects, not beside it.** Rows
  2 and 3 were separate candidates (allocate the cut points; the admission rule
  is wrong) and are one finding - the merge rule and the admission rule are the
  same question asked about a block's boundary and its contents. Same for rows
  4 and 5. Landing them separately would have produced four correct documents
  and no statement of what they share. Fifth run confirming the operator
  critique that synthesis is the skill's job.
- **A README metric is usually a count with its predicate stripped.** An
  advertised steady-state cache hit rate is measured over the most favourable
  population available - late turns of long conversations, excluding every cold
  start and fan-out call. It went into the technique as a `count-carries-predicate`
  caution rather than as a cited number. Treat any headline percentage in a
  marketing surface this way by default.
- **Seventh consecutive zero-fetch run** for a source carrying its own primary
  material. The shallow clone is the extraction for any open tree; verify it
  with `git ls-tree HEAD | wc -l` against a `find` count before reading (894 =
  894 here, no path casualties).
- **Parallel-session hazard, a third variant: the sibling registered its new
  technique AFTER this run's `build-index`.** The generated files were
  therefore stale against the tree the moment they were written - my two
  techniques present, theirs absent - and committing them would have published
  an index that omits content HEAD contains. The check that caught it was
  grepping the sibling's slug in `index.json` and finding *zero*, which reads
  like the safe answer and is the dangerous one. **Grep for both slugs, not
  just your own: yours present + theirs absent is the contamination signature
  for a mid-run race, and the fix is the same - do not commit the generated
  files.**
- **Tooling, re-confirmed the hard way:** a quoted heredoc still broke on
  apostrophes in prose on this platform, mid-run, exactly as the 0.13.0 lesson
  says. Write the script to a file the first time; the lesson is right and I
  paid the second time for testing it.
## 0.14.0 - 2026-08-27 - whip-coding-agent-harness

- **A new sub-class, and it is the highest-yield thing seen in this class so
  far: the comparative-design corpus.** An open tree that carries first-party
  teardowns of its RIVALS - four of them here, each cited `file:line` into that
  rival's source, plus a PTY probe of five competitors' first paint. The
  property to seek: **every "what we should NOT take, and why" section is a
  discriminator someone was forced to draw.** This is the research-model-release
  class's sibling-instruction property at much higher density - one release
  gives you one boundary, a teardown corpus gives you a section of them per
  rival, already argued and already attributed. Four of six landings came from
  the teardowns rather than from the engine's own architecture docs, and the
  teardown directory is NOT where the README points. Read it first.
- **High relevance predicts a high catch rate, and the prediction was
  instructively wrong.** Calling the expected yield out loud at Phase 2 said: a
  coding-agent harness lands on `llm-agent/runtime-and-io` (8 subjects, the
  densest area here), so expect picked rows to resolve to already-covered. Zero
  did. The reason is worth carrying: **the corpus held every concept in this
  source and was missing stated boundaries in five places.** When a source lands
  squarely on a mature area, budget verification for enumerations and
  asymmetries, not for concept gaps - the concept gaps are genuinely gone and
  the boundaries genuinely are not.
- **The enumeration hunt paid twice on the same file in two consecutive runs.**
  picomq added `merge` as a sixth second-caller policy to
  `single-flight-primitives`; this run scoped `join` (written for a computation;
  pointed at a durable resource the execution recurs and the one-shot completion
  signal cannot). **A file that yielded to the enumeration hunt once is a good
  bet to yield again** - its enumerations are load-bearing enough to be written
  down and therefore load-bearing enough to be incomplete.
- **A near-total empty on the map is worth more than a total empty, confirmed
  again and in the strong direction.** `broadcast observer deadlock` returned
  ONE hit across 337 subjects, and it was spurious. Reading the top prior-art
  subject settled hole-versus-seam in a single pass: a seam, inside an
  enumeration that says "the fan-out loop has ONE sharp edge" and offers a
  remedy (snapshot the set) that answers a different question (set mutation)
  than the one the deadlock asks (lock ownership during dispatch).
- **New hunt shape, and it found the run's largest landing: audit the layer
  table for a layer nobody authored.** `prompt-assembly`'s five layers -
  identity, policy, capability, context, task - are each written, derived or
  selected. The tool-use transcript is none of those verbs and is the only part
  of the prompt that grows *because the system is working correctly*, so nothing
  owned it. Generalizable: **wherever a subject enumerates its parts by who
  produces them, look for the part that produces itself.**
- **When the missing stage is a producer rather than a stage.**
  `mid-turn-steering` models its mechanism completely and models exactly one
  producer, the human - and its sharpest rule ("a steer with no turn in flight
  refuses loudly, never queues") inverts for machine producers because the
  rule's own stated justification rests on the caller having a second door. The
  tell was purely lexical and cheap: the technique's vocabulary is "the user",
  "the caller", throughout. **Grep a technique for who it says is acting; a
  single actor named everywhere is a producer axis nobody drew.**
- **Two triage rows merging on verification is a good outcome, not a triage
  error.** Rows 3 and 4 were the pairing invariant and the reactive-compaction
  path; verification showed one root (our accounting versus their protocol) and
  they landed as one technique. Per the standing critique that synthesis must
  come from the skill, the merge is the skill doing its job - but say so in the
  note, because the counts otherwise read as a miscount.
- **Parallel-session hazard, and the sibling's 0.14.0 lesson was already on
  disk when I hit it.** Same checkout, sibling actively writing (a file two
  minutes old), gate failing on THEIR untracked application. Confirmed their
  conclusion independently: do not commit `index.json`/`catalog.json`. Adding
  one detail they did not have - **the gate's failure list is the ownership
  test.** One problem, naming only a path I never touched, is positive evidence
  my own content is clean; it is not a reason to fix their file, and fixing it
  would have raced their session.
- **Shared librarian files are additive and safe to commit; generated files are
  not.** `librarian/sources/index.md`, a shared subject note and this file all
  carried both sessions' content. Committing them publishes the sibling's notes
  a few minutes early and loses nothing; committing the generated pair would
  publish an index over content HEAD does not have. The discriminator is whether
  the file is authored or derived, not whether both sessions touched it.

## 0.14.0 - 2026-08-27 - latticedb (vendor documentation set + operator dispatch)

- **For a vendor in a crowded class, the densest first-party document is the page
  arguing against its own product, and it can be found by name.** The class file says
  to expect the marketing surface to be worthless and to check the client's types.
  Here the engine was open-source so the types were moot - but the *comparison guides*
  played the role the file assigns to the "things we learned running this" page. "vs
  Kuzu" and "vs SQLite" state which single row was measured head to head and which are
  third-party figures on hardware they do not control, put that caveat ABOVE the table
  rather than in a footnote, and devote a titled section to what the archived rival did
  better. Every accepted finding came from those two pages. **Read the pages named
  after competitors before the landing page.** Proposed as a `vendor repository` row
  amendment; one observation.
- **A vendor disclosing its measurement provenance is not more adoptable - it is a
  better source.** The disclosures are the reusable part, and the rule extracted from
  them is a rule about reading everyone else's tables. Do not let honesty about
  benchmarks read as evidence about the product; they are independent.
- **The enumeration hunt paid a seventh consecutive time, and the enumeration was a
  lane roster.** `retrieval`'s "No single lane suffices" lists four lanes; all four are
  similarity-or-policy matchers over the query, so none can surface the item that
  DISAGREES with the top hit. A roster is the highest-value enumeration shape found so
  far, because a roster that is complete-looking gets implemented faithfully and the
  omission then propagates into every consumer.
- **The best finding came from the vendor implementing its own pitch wrongly, for the
  fifth run running.** Its flagship query computes BM25 relevance and discards it into
  a boolean filter while vector distance alone orders the result - in the headline
  example of an engine whose whole claim is answering the lanes together. That produced
  the `hybrid-lane-fusion` amendment (convergence is evidence only across INDEPENDENT
  lanes). A correct source hands you a catch; a wrong one hands you the boundary.
- **New shape: the faithful implementation as evidence.** The application is negative
  and its force comes from the tree implementing the standard *completely* - four lanes,
  the budget rule learned as a scar, the floor ordered before fusion with a test
  asserting it. Because nothing is wrong with the implementation, the gap can only be
  in the standard. **When a connected tree matches a subject's enumeration item for
  item, stop looking for its defects and start looking for what the enumeration omits.**
- **"A dataset is not a workload" needed two trees with opposite shapes to become a
  rule.** One HAD the workload and measured the engine losing; the other had the data
  and no workload at all. Either alone is an anecdote; the pair is a test (enumerate the
  readers, classify each as request path / offline / export / admin). Folded into a
  dispatch-ready spec rather than banked - four fragments in one document beat four
  leads re-derived one at a time, and this is the second run to fold rather than bank.
- **Operator dispatch sub-questions split three ways again, and only the third paid.**
  Second consecutive confirmation. "Worth it for our projects" was answered by two
  trees, "for a future use case" by a return condition, "over other alternatives"
  carried both spec techniques.
- **A shared checkout with THREE live sessions: the ledger row was swept by a
  sibling's commit.** I held `librarian/sources/index.md` back because a sibling had a
  staged row in it; by the time that cleared, two further commits had landed and one of
  them carried my row into `ff254b9`. Content correct, attribution theirs, nothing lost.
  The prior lesson (authored files are safe to co-commit, derived files are not) held -
  and gains a corollary: **holding an authored file back does not protect it, it just
  transfers the commit.** Commit authored files promptly; the sweep risk runs both ways.
- **Index/catalog regeneration was deliberately skipped and turned out not to be owed.**
  Two sessions were mid-run when the content landed, so running a global generator would
  have published an index over content HEAD did not have. A sibling regenerated after
  landing and picked my technique up. **In a busy checkout, check `build-index --check`
  at the END rather than assuming a regeneration is owed.**
- **Cross-repo scope was cut by tree state, not by the finding.** One project was clean
  and took a documentation change plus two rules; the other had its whole data-crate
  mid-refactor under another session, so it took a decision record and no code. Say
  which half was cut and why - a run that silently narrows reads as a run that finished.

## 0.14.0 - 2026-08-27 - openwiki-self-correcting-memory

- **Verify structural claims against the AUTHORITY, never against the data
  lying around. Second sighting, and this is now settled rather than advice.**
  Mapping this registry's contribution lane I read the two live `signals/`
  files, found `consults` and `deviations`, and concluded there was no channel
  for a verification verdict. The checker accepts a third key, `citations`,
  carrying `resolved`/`moved`/`gone` per application, keyed by slug and never a
  path, counts-only with the privacy rationale in the failure message. The
  finding was already drafted. **Data shows what contributors happened to send;
  only the validator says what the lane is.** The 2026-08-22 category-nesting
  error was the same mistake against `taxonomy.json`.
- **The corrected finding was strictly stronger than the wrong one, and that is
  the pattern rather than the consolation.** "The schema is missing a field"
  became "the channel is specified, the collector - the lane's only writer - has
  no code path that emits it, and the consuming scan reads one of its three
  counts." Specified, unpopulated, half-consumed is a far better technique than
  add-a-field, and it generalises into a test worth reusing: **a contribution
  channel exists if the collector emits it unasked, not if the validator would
  accept it.** When a structural claim is corrected, re-ask what the corrected
  structure teaches before rewriting - the second draft is usually the finding.
- **Read the real implementation before prescribing to a subject the registry
  itself implements.** The `citations` design supplied the technique's central
  move, which I did not have and would not have invented: **a count crosses a
  publish boundary that an anchor cannot.** For any subject where this registry
  is itself an instance, the tree is primary source, not illustration.
- **When two picked rows turn out to be one decision, land one file and say
  so.** Rows 1+7 were two rules about the artifact's own verification state;
  rows 5+4 were a collector and its ordering precondition. Four files would have
  been padding and would have taken a mature nine-technique subject to thirteen.
  Landed as two, with the merge stated in the source note so the operator can
  see their picks were not dropped. The reverse move also applied: pick 8 landed
  as an amendment rather than a twelfth technique, because its prior art
  (`gate-liveness`) was real and the boundary was better written inside the
  existing verdict-vocabulary file.
- **The asymmetry hunt beat the enumeration hunt this run.** The best knowledge
  finding was not a missing list member: `docs-sync` *measures* what a report may
  claim across four techniques and merely *mentions* the document's own review
  date - the exact field wall 7's detector consumes to pick its query window.
  Neither a slug map nor a summary can see this, because both files "cover"
  freshness and score identically. **When a candidate looks already-covered
  because some file says the words, ask which file MEASURES it.**
- **A contested home is a signal to argue from the subject's stated job, not to
  bank a lead.** Pick 9 mapped to four subjects and fit none by slug. It landed
  in `telemetry-pii-redaction` on the argument that every technique there rests
  on an assumption the finding breaks - the sensitive value passing through as a
  value - which is a stronger test than proximity and is reusable.
- **The contradicted pick was again the best one.** Fifth run in a row. The
  source's whole-set reconciliation contract is right and its retraction signal
  (omission) is wrong, which makes forgetting and deciding byte-identical - the
  silent rewrite `dated-corrections` opens by rejecting, moved from the sentence
  to the set.
- **New class row worth naming: the paired single-voice source.** A vendor's
  release walkthrough plus that vendor's own repository is a two-artifact channel
  corpus - within-batch convergence is VOID, and saying so before triage stopped
  eight candidates from being scored as though two independent sources carried
  them. Distinct from the channel corpus in one way that matters: the two halves
  have different reliability (the blog states what was wrong before; the repo's
  "stated production rules" half is dense while its benchmark claims are the
  least useful thing present), so route per artifact, not per source.
- **0 of 3 fetches - seventh consecutive zero-fetch run** for a source carrying
  its own primary material. The only thing a fetch could have bought was the
  vendor's benchmark percentages, which the landings deliberately do not cite:
  the replay *protocol* was the finding, not the numbers it produced.
- **Expected yield was right about shape and low about count** (predicted
  amendments and catches, got eight landings from eight picks). The reason is
  worth carrying: when the source's subject matter IS the registry's subject
  matter, the fraction touching our own machinery is far higher than for an
  ordinary vendor source, and the usual n=1 discount does not apply to what the
  tree can be read against directly.

## 0.14.0 - 2026-08-28 - acceptmarkdown-reference

- **New class: the standards index.** A curated link hub whose own body is below
  the ingest floor by construction (281 words, `research-ingest` exit 3, correctly)
  and whose children are PRIMARY - specifications and registries, not commentary.
  It superficially matches the second-hand survey row (somebody else's links) and
  is its exact opposite: a survey is reliable only for *that* the world moved,
  while a standards index points at documents that authorize a golden path
  outright, with no convergence wait and no second source. **Expected yield is
  high, and saying so before the triage table mattered** - the instinct on seeing
  exit 3 is to report the source as thin and stop, which would have missed a whole
  missing layer. Corrective: ingest the hub for its link list, then run the children
  as a batch. `--min-words` on the hub answers nothing for this class.
- **The budget line to watch is corroboration, not fetches.** Six fetches, all
  extraction, corroboration cost ZERO - the inverse of the review/listicle
  economics the 3-fetch rule was written for. When the children ARE the primaries,
  the expensive half of the budget never gets spent. Worth stating in the note in
  those terms rather than reporting "6 of 3" as an overrun.
- **Read a standards index adversarially; its framing is the least reliable thing
  on it.** Both of this hub's framing errors were worth more than its correct
  links. It filed alternate-address publishing under *proactive* negotiation when
  that is *reactive*, hiding a real cache trade - which became the proposed
  subject's first technique. And it asserted a refusal status is "the right
  response" when the standard says an origin may honour OR disregard the
  preference; that correction is now written INTO the proposed technique so the
  received wisdom cannot enter through the back door. Fourth run where a source
  located something true and explained it wrongly, and the first where the
  *curation* rather than the content was the thing that was wrong.
- **A standards index mis-citing its own headline entry is this class's
  characteristic failure, and it costs one grep.** This one cited "RFC 9110
  SS12.5.1 Proactive Content Negotiation"; SS12.5.1 is `Accept` and proactive
  negotiation is SS12.1. Not registry content - but for a source whose entire
  value is its citations, spot-check one before trusting the set.
- **An enumeration stated TWICE in one file is the strongest form of the hunt,
  and it is a new reusable tell.** Eighth consecutive run the enumeration hunt has
  paid. `web-scraping` gives its alternatives ladder in the opening prose and
  again as a four-bullet section; neither contained the same page in another
  representation from the same server. When an author reaches for a list from two
  directions and gets the same set both times, the gap is in the model rather than
  in the typing - which is exactly when it is safe to propose against it.
- **The naive reading of the source's own thesis was wrong, and the primaries are
  what showed it.** "Negotiation replaces scraping" holds only for a representation
  authored at the origin; the common managed case converts the same markup on the
  fly and inherits the redesign it appeared to protect against. Landing the
  enthusiast's version would have shipped a technique that *relaxes* the subject's
  shape-change instruments - turning its detector into a blindfold. Carry the
  general form: when a source's claim would let a downstream subject drop a
  safeguard, that is the claim to verify hardest, not the one to accept because it
  is well sourced.
- **Zero declines, and that is a property of the class rather than a soft triage.**
  Primary standards do not produce the half-corroborated middle that generates
  declines - a claim either has a normative sentence behind it or it does not.
  Expect the decline ledger to learn nothing from this class, and do not pad it.
- Gate note: `build-index --check` was stale on arrival from an earlier commit that
  added a technique without rebuilding the index. Phase 1 caught it, which is what
  Phase 1 is for; regenerated and folded in rather than left for the next run.

## 0.14.0 - 2026-08-28 - autosaddler-harness-optimization

- **A research release's README advertises a METHOD, and a method's advertisement is
  made of its DISTINCTIONS.** The `research-model release` row says the README is the
  least useful file present, and it is right about reliability and wrong about yield.
  This run got the README and nothing else - no prompt artifacts, no config, no
  architecture guide - and landed three findings, because what a paper claims as novel
  is a patch taxonomy, a session-type taxonomy, a four-way outcome classification. **A
  taxonomy survives the strip test where a benchmark number does not.** The contrast
  that makes this a routing rule rather than a happy accident: a vendor repository's
  README advertises a PRODUCT and is therefore made of names, which is why the row
  correctly sends you to the client's types there. Amend the class entry: for a
  research release, the README is low-reliability and **medium-yield on taxonomies
  only** - read it for the distinctions the authors are claiming, and disbelieve
  everything else on the page.
- **A hazard's best statement is often one operational sentence in a reproduction
  recipe.** Finding 1 came from step 3 of a "how to reproduce our smoke run" section -
  the kind of prose the extraction phase skims because it is full of paths and
  commands. Recipes are where a first-party author records what actually bit them,
  and they are the closest thing a research release has to the "things we learned
  running this" page the vendor-repository row prizes. **Read the reproduction
  instructions, not just the method description.**
- **The enumeration hunt paid a ninth consecutive run, and this time in a subject's
  STRUCTURE rather than its prose.** Both accepted techniques came from denials that
  no sentence states: `agent-instruction-files` sorts loading into three categories
  that all describe files an author placed deliberately, and sorts fixes into gate-or-
  prose where both branches presuppose an agent that CAN perform the behavior. Neither
  is written down as a claim of completeness - it is a claim made by the shape of a
  taxonomy. **Extend the hunt: a subject's technique roster is itself an enumeration,
  and the question is what a candidate could be that no existing technique's framing
  admits.**
- **When a funnel has a residual bucket, check each tell against the failures it does
  NOT own.** Finding 3's value was not "a row is missing" but "the existing tells
  misroute, and the residual absorbs the misroute." A strictly correct application of
  `failure-attribution` sends an agentic tool failure to `model` and prescribes a model
  migration for a tool-description bug. **Any most-upstream-first taxonomy ending in a
  catch-all deserves this check**, and it is cheap: take a failure class the taxonomy
  predates and walk it through the tells in order.
- **A method with a paper is not automatically a subject.** The triage carried an `XL`
  new-subject proposal on a near-empty map (no slug matches "harness optimization") and
  it dissolved on verification - the material decomposed cleanly across two mature
  subjects under different names. This is the near-empty signature the SKILL already
  warns about, arriving in a new disguise: **a named method with its own vocabulary
  reads like a hole because its NAME is absent, while its content is distributed.**
  Before proposing a subject for a named method, decompose the method into its steps
  and map each step separately.
- **Triage read accuracy: 3 for 3 on "real gap", and one of the three was mis-shaped.**
  Rows 1-3 were all marked `real gap` and all survived, but row 3 was carried as a
  technique and resolved as an amendment. That is the right direction to be wrong in
  and it cost nothing. Worth carrying into the table: **the shape column is a weaker
  prediction than the read column**, because shape depends on what the target file
  already contains and the read does not.
- **Fetch economics, ninth consecutive locally-corroborated run.** 1 of 3 fetches, and
  it was extraction rather than corroboration - it settled a mechanism and then handed
  over a second half the source never mentioned (lazy downward loading), a fallback,
  and a verification instrument. **When a finding rests on a harness's discovery or
  resolution rule, the vendor's own documentation is worth the fetch even when the
  corpus already "has" the mechanism** - the corpus had the concatenation behaviour and
  not the absence of a repo-root boundary, and the finding doubled in size.
- Zero declines: the operator picked 3 of 14 and left 9 unpicked. Recorded as untriaged
  with anchors and nearest prior art, per the vocabulary rule. Row 4 (the *regressed*
  cell a shallow reflection loop never computes) flagged in both the note and the
  subject note as the likeliest real finding on a second look.

## 0.14.0 - 2026-08-28 - gemini-omni-1-1-flash

Operator dispatch: a vendor's release post plus "and impact on gravitone project".
1 accepted, 3 caught, 3 declined at the gate, 5 untriaged. 2 of 3 fetches.

- **New class: the vendor release announcement, and it is the release walkthrough's
  opposite.** The walkthrough row says seek it out because a change carries its own
  motivation - the author says what was wrong before. An announcement is organised
  around changes the vendor is *proud of*, which inverts that: it states what is now
  possible and never what was wrong, because what was wrong was its own last version.
  The discriminator now in the class file: **a walkthrough states failure modes; an
  announcement states numbers, and its numbers are the yield.** Every accepted finding
  came from a number; none from a sentence.
- **The fetch is the extraction here, for a class-specific reason: an announcement
  rounds toward the sale, and it rounds away the mechanism.** The post said the model
  "can now analyze up to 10 seconds of prior context" - compatible with sampling ten
  seconds from anywhere. The API doc said **"the last 10s"**. Trailing window versus
  sample is the entire finding, and *which* ten seconds is not a selling point, so
  marketing had no reason to carry it. The first fetch also missed (general video page,
  no numbers) and named the second - budget for the miss.
- **A source can correct the corpus one day after the corpus wrote the error.** The
  "whole previous clip" wording came from run 25 (2026-08-27) via a practitioner batch;
  a vendor doc refuted it on 2026-08-28. Cross-run convergence is the cheap corroboration
  the method advertises, but cross-run *contradiction* at one-day range is a different
  and sharper signal: it says the subject is being written faster than it is being
  verified. Worth watching on any subject with three runs inside a week.
- **Phase 6.1 paid again, against my own summary.** I believed
  `resolution-as-stage-property` had an upscale-shaped hole in its "promotion re-renders,
  so it is a risk event" enumeration. It already prefers true upscaling of accepted
  pixels over re-sampling, for exactly the stated reason. The correction would have been
  a phantom fix. The enumeration hunt is high-yield precisely because it *usually* fails
  - report the failures too.
- **A subject can be worked into the wrong shape by successive correct findings.** The
  2026-08-27 subject note said the conditioning ladder carries five riders and the next
  pass should rebuild the golden path around a widened ladder "rather than accreting a
  sixth section." This run accreted the sixth, because an amendment was the honest
  landing for the content. Both facts are true, and the resolution is not an intake job.
  **When a subject note names a structural debt and the current run increases it, say so
  in the note and name the dispatch** - otherwise each individually-correct amendment
  makes the restructure less likely to ever happen.
- **`build-catalog.mjs` cannot be scoped to the files you own.** It scans the filesystem,
  so with a parallel session live it silently encoded that session's uncommitted
  technique count (982 -> 984) into `catalog.json`, and `build-index.mjs` did the same to
  `knowledge/software-engineering/index.json`. CI checks both. The working resolution:
  revert the foreign index, then **hand-patch only your own bundle's `contentHash` row in
  the catalog** rather than regenerating it. Check `build-knowledge-rules --check` too -
  it reported media-generation *current*, which is how you confirm an amendment changed
  no counts and the rules view is not yours to regenerate.
- Operator picked 1 of 3 recommended rows, declining the currency reset and the named
  consumer application. **The project was named in the invocation and still declined at
  the gate** - the invocation confirms the lane, it does not pre-approve the row. No tree
  was touched. Decline reasons owed; asked batched.

## 0.14.0 - 2026-08-28 - audit-your-agent-files

- **The listicle row's tiebreaker did the whole triage.** *Items that touch this
  registry's own machinery outrank items about bundle content* - every picked row was
  machinery, and the three the operator picked were the three the tiebreaker promoted.
  On a source whose subject was already forged four days earlier, that rule is what
  separated two real findings from nine catches. It has now earned its place as the
  first thing to apply on this class, not a note at the end of the row.
- **A subject's explicit denial is now three-for-three as the highest-yield hunt.**
  Run over `microsoft/AutoSaddler` found a seven-item failure enumeration that denied
  too much; the herdr run found a golden path denying a symmetry; this run found
  `instruction-freshness` saying "couple the file to change, not to calendars" - a
  denial that ruled out the only schedule capable of catching the drift it did not
  model. **The pattern to look for is a denial whose stated reason is sound and whose
  scope is one axis too narrow.** The corrective is almost never to reverse the denial:
  here it was to give its change list a second column, which preserves the original
  argument intact. A correction that has to overturn the subject's reasoning is usually
  the wrong correction.
- **Check whether the subject already owns the instrument at the wrong polarity.**
  The accepted technique needed a way to measure whether a line still changes behaviour.
  `capability-before-steering` already had the rig - a failure that "persists at the top
  of a fresh, minimal file" isolates a capability gap - and running it with the rule
  *absent* instead of present measures the other thing entirely. Before writing a new
  apparatus, read the neighbouring techniques for one that runs the same experiment in
  the other direction. New step for Phase 6: after naming the home, ask which existing
  technique already builds the rig the finding needs.
- **Phase 4's "one moment" warning is not hypothetical and it changed this run's
  output.** A parallel session landed two techniques into the picked subject between the
  map call and the write. Re-reading was load-bearing: one of them supplied the
  instrument above, and writing against the pre-read state would have minted a competing
  apparatus beside it. The re-read cost one file read.
- **The reverse of the shared-checkout hazard also happens: a sibling session's
  directory-wide commit swept this run's ledger row into *its* commit.** The skill warns
  about sweeping others' WIP; it does not warn that your own in-flight lines can be
  taken. Write the ledger row late, or verify after committing which commit actually
  carries it (`git log -S<slug> -- <path>`). Outcome was harmless here - the row is in
  `HEAD` under someone else's message - but the run note would have been wrong about
  where it landed.
- **For a relay class, the fetch's value was the mechanism, not the number.** The source
  flattened its primary to "instruction value can expire". The primary carried *why*
  (guardrails written for a weaker model become wrong for a stronger one) and *a second
  cost* (lines from different generations contradict each other across layers), and
  those two turned a cadence recommendation into a technique with a sort and an
  instrument. Also worth recording: **the primary stated no removal procedure at all** -
  it reported the result and offered a tool. The relay's protocol was the only candidate
  procedure either source carried. A relay can be the one holding the method even when
  the primary holds the evidence.
- 2 of 3 fetches; one wasted guessing a vendor URL rather than searching for it first.
  Search before fetching when the URL is not in the source.
- Zero declines. Ten rows went unpicked and are recorded untriaged with anchors; the
  personalization paper is flagged as a cross-run convergence candidate against the
  2026-08-22 pair that `agent-memory/procedure-promotion` rests on. Decline reasons owed:
  none, because nothing was declined.

## 0.15.0 - 2026-08-28 - six-things-mistaken-for-good-oop

- **A listicle on design canon is its own reading, and its yield is the mechanism-level
  instance of a rule the corpus holds one altitude up.** No vendor, nothing to fetch,
  nothing that "moved"; corroboration is training-data convergence plus the home
  subject's own neighbours. Predicted "mostly catches, one or two amendments, zero
  fetches" before the table; got two catches, three amendments folded from five items,
  one lead, 0 of 3 fetches. Write at the corpus's altitude and cite the mechanism as
  an example - `module-design` is mechanism-neutral by its own golden path, and letting
  a class-hierarchy video pull it down to class vocabulary would have been the "video
  authors an upper layer" failure in a subtler coat.
- **The map's zero on a canon term is usually a vocabulary miss, not a hole.** "liskov",
  "mixin", "duplication" all came back as "the corpus has never heard of this", and all
  three were present as substitutability, the contract suite and "duplication is
  cheaper than the wrong abstraction". Extends the 2026-08-22 near-empty lesson to the
  total empty: on a term with a textbook name, read the home before believing the zero.
- **The highest-yield seam was a rule with one side written.** `module-depth` said "a
  different need is a different module, not a mode flag" - correct, and read alone it
  invites a unit per combination of settings, which is what the source demonstrated.
  Same shape as the 2026-08-27 denial lesson: a decision rule stated in one direction
  is an enumeration of one, and the cheap question is what happens on the other side.
- Unattended run: picks made on registry impact, said so in the note. Folding five items
  into two amendments (shared roots: substitution promise; data-vs-unit) is the
  spec-lane "fold the fragments" rule applied at S/M scale, and it read better than five
  sections would have.

## 0.17.0 - 2026-08-28 - media-generation-batch-4 (12 sources, 6 voices)

- **An enumeration near the top of a long technique file is not the file's coverage,
  and the longer the file the more it lies.** A candidate was triaged as a real gap
  because `generated-shot-sourcing`'s conditioning ladder enumerates four rungs and a
  video reference is on none of them. The same file owns it in full two hundred lines
  later, under its own heading, with the split and the boundary. The operator skipped
  the row and was right. This is the counterpart of the 2026-08-22 near-empty lesson
  and the 2026-08-28 vocabulary-miss lesson, one layer in: Phase 6 says read the file,
  and in a file over ~250 lines "read the file" cannot mean read the head and the
  section the map pointed at. Grep the file for the candidate's concept before
  believing an enumeration excludes it.
- **A subject that keeps taking amendments is telling you its shape is wrong, and
  intake is the wrong engine to fix it.** `video-assembly` had already flagged, twice,
  that its conditioning ladder was accreting riders and owed a `/deepen` rebuild. This
  run added two more sections, and the triage error above is the same debt surfacing
  as a reader failure rather than as a complaint. When a subject note carries a
  standing rebuild flag, the honest options are dispatch it or land nothing there -
  not land two and re-flag it harder. Say so in the note when you do it anyway.
- **Cross-author disagreement inside a batch is worth more than cross-author
  agreement.** The two agreements this batch produced (draft-resolution ladder,
  per-clip generated audio) were both catches against techniques the corpus already
  held more precisely. The one *disagreement* - two independent voices giving opposite
  advice on in-prompt timestamps - is the highest-altitude candidate the run surfaced,
  because a discriminator arrives already drawn. Add disagreement to the batch triage
  signal beside convergence; it is rarer and it does not need a dedupe.
- **Demonstrated-*failure* density predicts yield better than demonstrated-mechanics
  density.** Sources that showed something going wrong and what they did next produced
  six of seven landings; sources that showed finished results produced one. The
  single highest-yield source in a 29k-word batch was its shortest first-party account
  at 1,174 words, and it earned that by narrating three defects and three different
  repairs. Sharpens the 2026-08-27 batch rule rather than replacing it.
- Fourth batch at one bundle in two days: **seven landings, all amendments, zero new
  techniques.** Predicted before the table and it is the right shape - say the expected
  yield out loud when the bundle has been widened 26 times this week, so an
  amendment-only run reads as saturation rather than as a weak batch.
- 0 of 3 fetches, eleventh consecutive corpus-internal run. Every landing corroborated
  either by the amended technique's own stated principle extended to a case it did not
  cover, or by training-data convergence reached without the source in view.
## 0.15.0 - 2026-08-29 - ai-native-sdlc-and-ci-on-call

- **A vendor doctrine document is a listicle without the pain.** Fifteen candidates,
  and the three highest-impact ones were all cases where the source stated a rule the
  corpus already modelled more carefully - the yield was in the two places the source
  *conflated* things the corpus keeps apart (signal magnitude vs diagnostic confidence;
  ask-controls vs decide-controls). Read a playbook for its tier tables and its
  "belongs in stage N" placements; those are where a vendor's simplification is
  checkable.
- **The batch pairing worked in one direction only.** The first-party account gave the
  measured half (median minutes, a lessons-log correction); the doctrine document gave
  the general rule. Where both said the same thing (tiered response) the pair counted
  as two voices and the corpus's own ladder made three - enough for an amendment, not
  a technique. Where only the doctrine spoke, the landing was gated on training-data
  convergence and never on the source.
- **The worklist tie-breaker paid.** The one new technique went to the #2 attention
  point (`quality-gates`, never swept), and the gap there had the missing-stage shape:
  the merge-gate half of the rule existed in another subject; the in-task half did
  not. Check `proposal-not-push`'s reserved classes before writing anything about
  what an agent may edit - three findings now trace to that list.
- **0 of 3 fetches, eighth consecutive.** Nothing in either post needed a primary;
  the product-keyed settings block was the only thing a fetch could have extended,
  and it is application-grade with no tree opened.

## 0.15.0 - 2026-08-29 - recuris-dual-memory

- **Single-paper explainer is the paper-aggregator class at n=1, and the fetch is the
  extraction.** The video gave headline deltas and a metaphor; the paper's ablation table
  - which the video never mentioned - was the only thing worth landing. For this class,
  fetch the primary before triage and read its ablations before its headline.
- **Missing-stage shape, tenth sighting.** `working-memory` was thorough about how the
  state is rewritten and silent about who checks the rewrite. The hunt "who verifies
  this?" over a technique's verbs is cheap and keeps paying.
- **Cross-bundle laws corroborate an amendment for free.** Two other bundles carried the
  rule as a law (`no-gate-self-certifies`, `coverage-is-counted-not-claimed`); named in
  prose, not linked, and the training-data convergence was total.
- 2 of 3 fetches, both extraction, unattended run; picked by impact, two accepted rows
  share one root and were counted as one finding.

## 0.15.0 - 2026-08-29 - graph-engineering-system-intelligence

- **A paper critique is a source class the table does not name, and it behaves like
  the dialogue.** The paper half is a framework survey relayed second-hand and strips
  to nothing; the critique half is a practitioner disagreeing with a taxonomy - first-
  party about a view, not a system. Its value is that every counter-case the critic
  raises is an enumeration being challenged, which is the highest-yield thing to read
  the corpus against. Read the critique half for boundaries, the paper half for leads.
- **The source argued for tearing down the thing the corpus builds, and the finding was
  a stage inside it.** "A fixed ontology detects only known unknowns" is true; the
  corpus's closed vocabulary is also right; what was missing was where the gate's
  refusals go. Fourth time a contradicted source located the gap while prescribing the
  wrong fix - a pattern now, not an observation.
- **`subagent` returned zero corpus-wide and it was vocabulary, not a hole.** Before
  treating an empty as a finding, try the corpus's own word (worker, session, seat).
- Ninth consecutive zero-fetch run for a source carrying its own material.

## 0.15.0 - 2026-08-29 - future-of-ai-harness-to-rsi

- **A commentator's digest with no product names is the strip test's blind spot.** The
  test passed nearly every candidate and most of what survived was the textbook. For
  this class the second filter is "which file *measures* it" - five of ten candidates
  were catches, found by opening the golden path rather than by the map.
- **The finding was a stage, again, and the source only supplied the generalization.**
  The prompt-scoped rule existed in another bundle; the source's component
  enumeration is what let it apply to tools, memory, context and verifiers. Two
  bundles reaching the same rule from different sides is corroboration enough for an
  amendment - and the cross-bundle situation is a discriminator in the subject note,
  never a link.
- **0 of 3 fetches, ninth consecutive, but this time the class said the fetch would be
  the extraction.** It was not, because the papers never became picks; they became
  leads with a return condition. A second-hand survey of papers yields the papers as
  leads unless a pick actually depends on their protocol.

## 0.15.0 - 2026-08-29 - task-coevolve-harness-optimization

- **The class file's rule held on first contact with a paper review: the fetch was
  the extraction.** The 2,744-word video carried the thesis and the headline numbers;
  every non-obvious element of the technique - the never-solved floor, the
  uncertainty bonus, the two estimators, the authors' own stated limitation - was in
  the paper and none of it was in the video. Two fetches (a search to locate the
  primary, then its HTML) after eight zero-fetch runs; the streak was a property of
  the classes mined, exactly as the class file says.
- **The inversion hunt paid where the enumeration hunt did not.** No enumeration in
  `eval-harness` was too narrow this time; the finding was a rule the corpus praises
  (`eval-economics`: the golden set is frozen and saturated) that is exactly wrong one
  row down its own cadence table. When a candidate contradicts a sentence the corpus
  is proud of, ask which *question* the sentence was answering before writing either a
  correction or a catch - here both sides are right and the discriminator is the
  question.
- **A same-day technique is the best boundary partner.** `oracle-frozen-during-repair`
  landed the previous run and says "freeze"; the source says "do not stay fixed". Two
  runs apart that would have read as a contradiction to resolve; one day apart it was
  obvious that *what moves* is the discriminator. Check the previous run's landings
  for the opposite side of a new claim before mapping.
- **Shared checkout, again.** A sibling session was amending `failure-attribution.md`
  in the same subject mid-run, and had regenerated the civic-intelligence index. Left
  both unstaged; committed the eval-harness index and catalog only. The catalog hash
  will be re-cut by whichever run commits next, which is fine in a tree where both
  runs regenerate before committing.

## 0.15.0 - 2026-08-29 - two-loop-rsi-llm-and-harness

- **A second-hand survey can still point at an asymmetry.** The class entry says this
  class is reliable for "that the world moved" and nothing else, and for content that
  held: six catches, two thin leads. But the source's one emphatic sentence mirrored a
  completeness claim the corpus makes on exactly one side (suite expires with the
  candidate; harness compensations do not expire with the model), and the finding came
  from opening the mirror, not from believing the video. For this class, spend the
  verification budget on "which corpus sentence does the source's strongest line
  mirror" rather than on corroborating the source.
- **The corpus held both halves of the rule two subjects apart.** `hitl-approval`
  had the general shape (a compensating capability names its retirement condition)
  and `eval-harness` had the suite-side instance; the amendment is the join. When a
  candidate feels familiar, grep the bundle for the *shape* of the rule, not its
  subject - the corroboration may already be inside.
- **When the target file is another session's live WIP, hold the amendment in the
  source note, verbatim, with a return condition.** Same subject, same technique, same
  hour: the other session's section and this one compose, and the only safe landing
  was to write the text where the next run can paste it - and here the other session
  committed minutes later, so the return condition was met and the section landed in
  a second commit inside the same run. A held amendment is `dispatched`, not
  `accepted`, until it lands. Re-check `git status` for the target
  file between Phase 6 and Phase 7, not only at Phase 10.
- **Class prediction stated before triage held to the number** (0 techniques, 1
  amendment at most, leads for the paper). Ninth consecutive zero-fetch run; a
  paper explainer that never names the paper leaves the fetch nothing to hit.

## 0.15.0 - 2026-08-29 - method redesign (operator-directed): apply and A/B test, scorecard reflection

- **The operator's critique, verbatim in substance: the skill was enriching a wiki.**
  Twenty-six runs landed techniques and amendments; the cross-repo lane (Phase 8) was
  opt-in and was taken on two of them. The funnel had no measured stage after
  "landed", so nothing ever reported that the last three stages of research ->
  extract -> test -> apply -> ship were converting at zero.
- **Redesign applied as 1.0.0:** Phase 7.5 makes apply mandatory per landed technique
  or amendment, with a graded mode ladder (code / experiment / simulation) so the step
  is never unreachable, a closed verdict vocabulary borrowed from scan-sweep 2.5
  (better / not-better / unmeasurable, not-better is a rejection), an applied ledger
  in `librarian/applied.md`, and `/intake apply <technique>` for backfilling the
  wiki debt. Phase 11 becomes the shared skill-reflection shape (lanes 0-3) with a
  per-run `SCORECARD.md` row on the five stages and a mandatory "weakest stage" line
  that sets the next run's focus - the mechanism that turns repetition into mastery.
- **Simulation is allowed and bounded.** Three real cases from the tree or its
  history, each walked under both policies, with a falsifier. Invented cases do not
  count. This is the floor that stops "we could not test it" from being an exit.
- **Not done in this session:** the backfill. The five landings from the morning run
  are the first rows owed; the scorecard says so and names the first one.

## 1.0.0 - 2026-08-29 - apply wave 1 (personas + gravity)

- **The apply lane converts when it is fed deviations, not techniques.** Seven Opus
  workers, 29 rows, 24 in code mode with a project gate that saw A and B. The input
  that made this cheap was the backtest wave's `conform-detail.json`: every row started
  from a seam with a file:line and a stated consequence. `/intake apply <technique>`
  without a prior conform verdict would have spent its budget finding the seam.
- **Twenty-four of twenty-nine rows are TypeScript.** Every Rust seam - including the
  strongest defects in the wave (relay ingress accepting unsigned events, tombstones
  never written, notice-delivery contradicting its own contract) - fell to
  `experiment` or `simulation`, because a cold worktree has no cargo target and the
  workspace test build is priced at an 8.9 GB peak. The instrument the next wave needs
  is a warm Rust gate, not more workers.
- **The brief's frontmatter template was wrong** (`verified_against: <project>@<sha>`);
  `check-bundles` requires `<stack>@<version>`. Two workers noticed and adapted, five
  followed the brief. Fixed after the fact by the director; the sha now lives in the
  body. The brief must be checked against the gate before fan-out - a template error
  costs N corrections.
- **A `not-better` arrived on the first wave and it is the best row.** Drawing the
  evidence-class chip changed 1 of 21 cards because the underlying `sources[]` was
  empty everywhere except the one fact a defect had forced someone to correct. The
  technique held; the tree was not ready for it. That is what the return condition is
  for.
- **Ship is now the weakest stage**, by construction: 24 branches, none merged. The
  lane must not mint branches faster than the operator reads them - a `code` row whose
  branch is never merged is a wiki page with a commit hash.

## 1.0.0 - 2026-08-29 - apply wave 1 follow-ups (branch merge + repair)

- **A worktree commit can fail silently and `worktree remove --force` then destroys
  the work.** The project's pre-commit hook runner was not on PATH inside the
  worktree ("Can't find lefthook in PATH"), the commit aborted, my grep for errors
  hid it, and the forced removal discarded nine edited files. The edits were scripted
  so the redo cost minutes; unscripted edits would have been lost. Rule for the apply
  lane: after committing in a worktree, assert the commit landed (`git log -1` shows
  your subject) BEFORE removing the worktree, and never filter a commit's output.
- **Verify the brief's gate before fan-out, again.** `cargo check` on the app crate
  fails on this machine before any source compiles (a Tauri permission-manifest
  lookup in the build script) - in the main checkout too, not just in worktrees. Every
  Rust seam in the wave fell to experiment/simulation for this reason, and the
  scorecard called it "no warm gate" when it is "no gate at all": the library crates
  (`core`, `engine`) check fine. Name the crate a Rust gate can reach, not the workspace.
- **Addendum, same day: the "unreachable" Rust gate was one flag away.** The build
  script failed because a capability referenced an optional plugin that plain
  `cargo check` never compiles; the project's own CI runs `--features desktop`, and
  with that flag the whole workspace checks warm in minutes - the event-registry
  repair is now compile-verified, not just statically argued. The rule: the gate a
  project's CI actually runs IS the gate; read the workflow file before declaring a
  gate unreachable.

## 1.1.0 - 2026-08-30 - tesana-loop-mode-game-builds

- **A managed project's recorded run state is a corroboration instrument, and for
  claims about loops it beats a fetch.** The source said where its post-loop prompts
  went (n=5 builds, one creator); the connected tree's four saved harness runs
  (`game-plan.json` + `progress.json`, 92 deciding iterations) said the same thing
  with a number and a cause - the perceptual gate never returned a verdict once -
  and the finding was written from the tree. Before spending a fetch on a claim
  about unattended runs, ask which managed project keeps run state on disk.
- **Sponsored review class, first observation.** Behaves like the second-hand
  practitioner review (the tour half strips to nothing) but its operating half was
  usable because the creator counted his own prompts on camera. The discriminating
  read was the prompt history shown on screen, not the gameplay. Yield: one
  technique, four catches, two leads, 0/3 fetches.
- **The experiment mode's B arm can be degenerate and still decide.** B certified
  zero of 323 features, which reads like a broken predicate; it was the structural
  fact (the judging gate ran zero times). Report a degenerate arm as the finding it
  is, and write into the technique the boundary that keeps B from becoming the stop
  condition.

## 1.1.0 - 2026-08-30 - headlong-agent-microharness

- An in-tree design doc's REVISION LOG is its highest-yield section, the way a
  release walkthrough's failure modes are. Both of the run's hardest technique
  rules (rumination must not count as work; self-replies must not reset
  engagement) lived in dated revision notes at the top of a design doc, each
  recording a defect the authors paid for after shipping the first version.
  Read a design doc's revisions before its body.
- Phase 7.5 seam selection has a hidden axis: where the B arm's instrument
  lives. Two consecutive runs picked sharp seams whose instruments sit in
  production state no local gate reaches, and both fell to simulation. Prefer a
  seam whose instrument is in the tree (fixture, recorded log, replayable
  script) over a sharper seam whose instrument is remote.

## 1.2.0 - 2026-08-31 - method: parallel safety and the reference-wave lane

Two operator directives, both about the method rather than about a source. No run
was mined; this entry records why 1.3.0 exists.

- **The skill had no concept of a sibling, and was about to be run twelve at a time.**
  Every parallel hazard in this method was already written down as a *war story* -
  a branch switched under a run (2026-08-21), a directory-wide `git add` that swept a
  sibling's instrument (2026-08-23), a subject landed mid-run that Phase 4's map had
  declared absent (2026-08-27), a scratch sweep that races a neighbour (Phase 2b) -
  and every one of them was mitigated by asking the run to *be careful*. Care does not
  scale to twelve terminals, and the failures do not announce themselves: an interleaved
  ledger append succeeds and one line silently ceases to exist. The corrective is
  `scripts/run-board.mjs` plus SKILL § "Running beside a dozen siblings": announce, claim
  what you will write, and take a named lock across the three genuinely shared operations
  (index regeneration, ledger append, commit). Nothing else is serialized.
- **The board is a DIRECTORY, not a document, and that is the whole design.** The obvious
  artifact was a shared `.active-runs.md` every session appends to - which is precisely
  the race it exists to prevent. One file per run, written only by that run, collated on
  read. It lives in `$(git rev-parse --git-common-dir)/run-board/` so it is shared across
  worktrees, can never be staged, and needs no `.gitignore` line.
- **Liveness must be measured in time, not in process liveness.** First implementation
  used `process.kill(pid, 0)`. Each board command is a one-shot `node` invocation that
  exits immediately, so the pid check declared every lock holder dead a millisecond after
  it acquired - the lock was a no-op that looked like it worked. The agent session is the
  run; the process that wrote the record is not. TTL and heartbeat only.
- **A fetch budget written for one class silently became a sample size in another.** The
  run-wide 3-fetch cap is right where fetching is *corroboration*. For a bibliography the
  references ARE the extraction, so the same rule quietly enforced reading 3 of 200 - a
  1.5% sample, drawn on titles, reported as the source's yield, with the unread tail
  leaving no trace for the next pass. The operator's complaint ("we gambled with top 2-3
  references and many valuable ones were ignored") is this bug, and it was invisible
  because it read as discipline. New class (`reference index`), new lane
  (`references/reference-waves.md`): enumerate all, rank the whole set against measured
  attention points rather than against titles, read in parallel waves until the yield
  floor, and **record the ranked tail** so the next pass diffs instead of re-deriving.
- **Generalisation worth watching**: the same shape may exist elsewhere in this method -
  a cap chosen for one source class inherited by a class whose economics invert. The
  paper aggregator's "~3 papers per run" was the same bug and is now corrected. Check any
  other number in this file that was set once and never re-derived per class.

## 1.3.0 - 2026-08-31 - tigerbeetle

Run used 1.3.0. No SKILL.md edit is applied here; the two defects below are lessons on
first sighting and the third is a rule I would apply after one confirmation. A mid-flight
sibling should finish on the version it loaded.

- **A repository's architecture document is an operating document, and Phase 2b's
  examples do not say so.** The sweep list reads `docs/`, `design/`, `spec/`,
  `*_SPEC.md`, `RUNBOOK`, `owners-manual/`, `ADR/`, `CHANGELOG` - every example is
  process-flavoured, and the justification ("first-party practitioner documents with
  paid-for failure modes recorded as revisions") reads as *history of decisions*. I read
  the category that way, opened `TIGER_STYLE.md`, `HACKING.md`, `releases.md`,
  `testing.md`, `vopr.md` and `docs.md`, and skipped `ARCHITECTURE.md` - the largest
  document in the tree after the changelog, and the tree's own answer to what the system
  is - while it sat in a file listing I had already printed. The corrective is one word
  in the list plus one sentence: **a document that states what the system IS ranks with
  the documents that state how it is operated**, and for an engine repository it
  outranks them.

- **The strip test is biased toward process claims, and the bias is invisible because it
  fires at extraction rather than at triage.** "Remove every proper noun; is anything
  left?" passes process doctrine trivially - "make releases cheap enough to skip" has
  nothing to strip. Architecture doctrine arrives wrapped in named machinery (a
  write-ahead log, a consensus protocol, a grid of blocks, a superblock) which *reads* as
  proper nouns and is not: those are domain terms, and the rules underneath survive the
  test completely ("consensus converts durability into availability"; "store the checksum
  outside the thing it checksums, because an internal checksum cannot detect a disk
  writing correct data at the wrong offset"). The failure produces no declined row and no
  untriaged row - the candidate never becomes a candidate - so nothing in the scorecard
  can see it. **Corrective to apply once confirmed: strip *product* nouns, not *domain*
  nouns, and say so in the test's own wording.**

- **`none` is two different findings wearing one word, and Phase 4's vocabulary cannot
  tell them apart.** The registry-impact vocabulary ends in `none`, which the method
  glosses as "honest and common... the value that should make you ask whether the
  candidate belongs in `skills/` or `memory/`". That gloss assumes the candidate is
  *smaller* than a bundle. It is equally often *outside* one: a real gap with no home,
  which reads identically at triage and is dropped identically. A prior run (2026-08-27,
  `storage-engine-selection`) invented the discriminator by hand and it has lived in one
  proposal document ever since: **a product name returning zero hits is correct by the
  purity floor; a *concept* returning zero is the finding.** That check belongs in
  Phase 4, and `none` should split into `none` and `no-home-yet`.

### Redesign proposal - the corpus has a construction frontier and the method reproduces it

Not applied, and larger than this skill. This run's audit (written up in
`librarian/domains/software-engineering.md` § "the construction frontier") found that the
`software-engineering` bundle builds at the application layer and consumes everything
below it: fifteen builder-position systems concepts map to semantically unrelated
subjects by slug-token collision, four (`fsync`, `allocator`, `syscall`, `numa`) return
zero corpus-wide, while a consumer-position control run resolves cleanly at scores of
18-42. The bundle is not consumer-position throughout - `llm-agent` is 29 subjects of
deeply builder-position knowledge - so the line tracks subject matter, not capability:
**this corpus builds what a product team writes and consumes what a product team
installs.**

Two mechanisms hold the line, and one of them is this skill. The source diet is the
first: 77 sources mined, overwhelmingly agent harnesses, LLM tooling, media generation
and process, with TigerBeetle the first systems-infrastructure source in the ledger - and
an application repository contains no write-ahead log, only a client for someone else's.
The second is Phase 4 -> Phase 5: below-the-line material returns noise or `none`, `none`
reads as "does not belong", and the row never reaches the operator. That is not
hypothetical; it is what this run's first triage did, producing twelve process rows and
zero architecture rows from a database.

**The self-reinforcement is the part worth designing against.** A corpus whose frontier
is invisible cannot be argued with, because every instrument it owns measures occupied
ground: `librarian-scan` ranks attention debt over subjects that exist, so a category
that does not exist accrues none, and no sweep can ever surface the hole. The proposal is
therefore not "forge a storage-engine category" - it is that **a bundle should state its
construction frontier in its own profile**, so that a below-the-line candidate becomes an
honest decline with a reason rather than a silent drop, and so that moving the frontier
becomes a decision somebody makes rather than a thing that never happens.


## 1.3.0 - 2026-08-31 - genesis-agi

- **The A/B tree is a second source, and this run is the first where it acted like one
  in both directions.** Phase 7.5 is written as a *verification* step - does the project
  get better - but both `better` verdicts here changed the technique rather than merely
  scoring it. The severity discriminator in `lane-reconciliation` (a lane's class is
  decided by whether its readers carry a fallback, not by what the lane is) and the whole
  structural-default section in `probe-without-write-back` (a suppression flag protects
  the callers someone remembered; a split write endpoint protects every future one) exist
  because a managed tree solved the same problem differently from the source. Neither was
  derivable from the source. Worth saying out loud in the method: **when the apply target
  already solves the finding, read HOW before recording a verdict** - a tree that reached
  the rule by another route is handing over the comparison the source could not.

- **`not-better` needs a third reading the closed vocabulary does not have.** The
  vocabulary is `better` / `not-better` / `unmeasurable`, and `not-better` is documented
  as a rejection whose condition feeds back into the technique. This run produced a
  `not-better` that means the opposite: zero edits were required to reach arm B because
  the tree *already* implemented all three obligations, in two independent instruments,
  with no connection to the source. That is the strongest corroboration the amendment
  could have received, and it lands in the ledger wearing the same word as a refutation.
  Two of these on one technique currently demote it to a lead - which would be exactly
  backwards here. Not proposing a vocabulary change on one sighting; recording it so the
  second sighting is recognisable.

- **A repository run should state its read fraction, and this one is ~15%.** The
  tigerbeetle row started recording it (0.4%); this run followed and it immediately
  changed what the note could claim. The two largest files in the source's memory
  subsystem (3,518 LOC combined) were never opened, which is why one lead is "go back for
  `dream_cycle.py`" rather than a confident saturation call. The Phase 2b yield ordering
  (operating documents, then instrument, then measurement) is right and it is also
  *self-limiting*: it reaches the densest prose first and the largest implementations
  last, so a run that stops on budget always stops with the big files unread.

### Redesign proposal - the ship stage is blocked by this file, not by capability

The scorecard's own funnel now says it unambiguously. Across the five source-driven runs
since the apply lane landed - tesana, headlong, operator-control-plane, tigerbeetle,
genesis-agi - **`ship` is 0 every time**, and four of the five give the same reason: the
operator's directive named no project, so the Phase 8 step 2 confirmation was never
given. This run found a *real, reachable, paired-measured* defect in a managed tree and
filed it instead of fixing it, for that reason alone.

This is not a capability gap and no amount of declared focus on earlier stages will move
it. It is a rule in this file interacting with the way the skill is actually invoked: the
runs are unattended by design (the 2026-08-28 operator rule exists precisely to let them
be), Phase 8 requires an interactive confirmation, and there is no way for an operator
launching an unattended run to grant that confirmation in advance. The stage is
structurally unreachable, and every run pays the full cost of the apply lane to produce a
row that says so.

The proposal is an invocation-level standing confirmation - `--project <slug>` as the
counterpart to `--domain <d>`, meaning "this run may commit to this tree under the Phase 8
rules". It does not weaken Phase 8: the pairing requirement, the pathspec, the
never-push rule and the proof status all still bind, and a run without the flag behaves
exactly as it does today. It only closes the gap between "the operator authorised this
lane" and "the operator is sitting here to be asked."

Not applied in this version - it changes the invocation surface and eight sibling runs
were live on the board while this was written. A mid-flight run should do nothing about
it and finish on the version it loaded.

## 1.3.0 - 2026-08-31 - claude-of-tanks-geometry-gate

- **The dated-addendum contract is the highest-yield document class this method has
  met.** Not "a repository has docs" but a narrower tell: a contract file whose sections
  are numbered *and* carry the directive date plus the incident that caused each. That is
  the release-walkthrough property - a change carries its own motivation - preserved in a
  repository instead of a talk. Thirteen such addenda produced four of six techniques,
  while the 26,981-word landing page produced none. When the sweep finds one, read it
  before the code and before the README.
- **Read the postmortem before the lessons file when hunting corrections.** A repository's
  lessons file explains why the current rules exist and is therefore written from the
  winning side; the postmortem is written from the losing side and names root causes the
  rulebook has already absorbed and stopped arguing with. Both of this run's strongest
  leads came from the postmortem, including one that contradicts standard doctrine (small
  commits give no protection when N of them share one global assumption). Phase 2b's sweep
  order lists operating documents as one bucket; postmortems deserve to be called out
  inside it.
- **The category cap is a placement authority, and Phase 4's `HOME IF NEW` does not know
  about it.** The instrument pointed at `asset-production`, my own reading agreed, and both
  were wrong: the category sat at exactly ten child directories, so an eleventh subject
  there is a gate failure rather than a preference. The 2026-08-22 lesson said to verify
  structural claims against `taxonomy.json` rather than a subject count; this run shows the
  same check is owed even when nobody wrote a spec, because `HOME IF NEW` reads like an
  answer. Count the child directories before writing the first file - and note that the cap
  forced a *better* home, since the techniques transplant across asset types.
- **An A/B can refute the technique it is testing, using that technique's own rule.** The
  arm-B probe added a second anchor that was stricter, differently coded, and read the same
  representation as arm A - so both its catches were its own parser's artifacts. That is
  precisely `dual-anchor-scoring`'s third decision rule, which I had written an hour
  earlier and then violated. Worth generalising: **when a run applies a technique it landed
  in the same session, check the application against the technique's own decision rules
  before reporting a verdict** - the author is the reader least likely to notice they are
  the counter-example.
- **Ship-0 is two different outcomes and the scorecard has been summing them.** A `better`
  verdict that never shipped is blocked; a `not-better` verdict that never shipped is
  finished. Four consecutive rows of the first kind made ship look like a standing failure,
  and a stage that is always red stops steering. Scored against *`better` verdicts that did
  not ship*, the denominator is honest. Applied to the focus paragraph in `SCORECARD.md`,
  not to `SKILL.md` - one observation, and the blocked cases remain the majority.
- **`apply` as a bare count hides coverage.** A run that lands six techniques and applies
  one reads `0c/1e/0s`, identical to a run that landed one and applied it. Five wiki pages
  are invisible in that notation. Next row writes `<rows>/<landed>`.

### Redesign proposal - not applied

Phase 7.5 budgets "one project per finding per run", which reads as a ceiling and behaved
as one: this run stopped at a single apply because the budget language made the sixth
technique's row feel optional rather than owed. The anti-pattern list already says a
technique with no applied row is a wiki page. Those two are in tension, and the budget
wins by being concrete. A future version should make the *unit* of the budget the landing
rather than the finding - a run that lands N techniques owes N rows, and the budget caps
the mode (simulation is always reachable) rather than the count. Not applied in this
version: five sibling runs were live on the board, and this changes what every one of them
owes mid-flight. A mid-flight run should finish on the version it loaded.

## 1.3.0 - 2026-08-31 - archify

- **A line number obtained by grepping a guard idiom is usually wrong.** Three of five
  citations in this run's application were off by 2-4 lines, because
  `if (!clip) return null;` appears twice in the target module - once in a small helper,
  once in the function being cited. The Phase 8 "open one cited line" step caught all
  three, and it is the only reason four bad citations did not publish. The generalisable
  form: for a citation, `grep -n` the *complete* line and confirm the enclosing function,
  because the shorter and more idiomatic a guard is, the more likely the file holds
  several of it.
- **The ledger lock protects the append, not the commit.** This run appended to
  `librarian/applied.md` and `librarian/sources/index.md` inside the lock, released, and a
  sibling's pathspec commit on those files swept both rows in under its own message minutes
  later. No content was lost - verified in `HEAD` - and nothing was wrong with either run.
  But the method's mental model ("take the lock, append, unlock") quietly implies the
  appending run will be the one to commit it, and with nine live sessions it usually will
  not be. Either commit the ledger inside the same lock, or expect the row to travel under
  a neighbour's commit and stop treating that as an anomaly. Recorded rather than applied:
  holding a lock across a commit is a bigger cost than mis-attributed ledger rows.
- **When the technique under test is about outcome expressiveness, the test harness is a
  second instance of the seam.** This run's A/B measured whether a detector's caller can
  distinguish "could not measure" from "measured clean". The harness's first version had a
  bug of exactly that shape - it mis-numbered a stubbed call because a cleanup sits in a
  `finally` that runs before the compare - and arm A's two-state return reported a uniform
  `null` for all six cases, which is indistinguishable from the harness working correctly.
  Arm B's typed reasons exposed it on the first run. Worth seeking deliberately: when the
  finding is about a collapsed vocabulary, run the instrument against itself first.
- **Nine siblings is a different regime from three, and the board absorbed it.** Two gate
  failures during this run belonged to neighbours' untracked work; both were reported and
  neither was touched, and one was fixed by its owner mid-run without any coordination
  beyond the board. The index/catalog pair stayed uncommitted by design - regenerating them
  under the lock is correct, but committing them would have put an index in `HEAD`
  referencing a dozen files that are not, which is why this repo has a separate
  `chore(generated)` commit lane. That reasoning is not in `SKILL.md` and should be: the
  method says regenerate under the lock and says nothing about whether to commit the result.

### Redesign proposal - not applied

**For a single-subject XL, the spec-then-dispatch round trip may be pure overhead.** Phase
7 says write the spec, then dispatch one forge worker, and argues for same-session
execution because "the context that argued the spec is the cheapest forge input the
registry will ever have." This run could not dispatch (a standing session instruction
forbade subagents), so the director forged the subject directly - golden path, seven
techniques, one application - with the neighbours already open, the boundary already
argued against two adjacent subjects' own statements, and the placement already verified
against `taxonomy.json`. The result passed the gate on the second try, with one
link-depth error.

The method's own argument for same-session execution is an argument against the handoff:
if the loaded context is the valuable thing, serialising it into a spec and rehydrating it
in a worker is a lossy round trip whose only gain is parallelism this run did not need.
The dispatch clearly earns its cost when a spec spans subjects, when the director's
context is exhausted, or when several specs can forge concurrently. It is not obviously
right for one subject the director has just finished arguing.

Not applied: one observation, and it was forced rather than chosen, so it is not a clean
comparison against a dispatched run. A future version might make the dispatch conditional
on subject count and remaining context rather than unconditional. Mid-flight runs should
finish on the version they loaded - nothing here changes what is owed.

## 1.3.0 - 2026-08-31 - herdr (re-run under an orthogonal lens)

- **"Already mined" is not a property of a source. It is a property of a source and a
  lens.** Phase 1 step 3 says to stop when the ledger already carries the source, and
  this run would have stopped correctly by that rule and wrongly in fact. The same tree
  at the same commit, swept four days apart, produced three landings that shared **no
  file** with the first sweep: run one read `src/detect/manifests/` and landed in
  `terminal-multiplexing`, run two read the justfile, an architecture test and a vendor
  patch ledger and landed in `quality-gates` and `supply-chain`. The stop condition
  should be "was it mined under this lens", and the ledger row is what makes that
  answerable - so a row should say which lens was used, not only that the source was
  seen. Not applied to `SKILL.md` yet: one run is not three.
- **The untriaged table paid for this run.** Three of nine candidates were already
  sitting in the 2026-08-27 note with anchors, and two of the three landings came from
  those rows. The method already argues the untriaged table is not bookkeeping, on the
  grounds that convergence needs prior sightings; this run shows a second and more
  immediate return - the table is the *input to the next lens*, and it made a second
  sweep of a large tree cheap enough to be worth running at all.
- **The funnel's cheapest new source may not be a new URL.** The scorecard has named
  `extract` and `research` as the weak stages for several runs, and the standing answer
  has been more sources in parallel. A large tree mined for one domain still holds the
  others, at zero ingest cost and with a prior note that pre-loads the candidates. Worth
  watching whether re-sweeps keep converting at this rate; if they do, it is a lane and
  not an anecdote.
- **A `not-better` verdict that finds the rule already implemented is the strongest
  corroboration available, and the ledger vocabulary slightly hides that.** The A/B
  returned `not-better` because the consumer already refuses an empty scope in 4 of 4
  checkers, one of them stating the rule almost verbatim in its own error string. That
  is independent convergence on a technique landed the same hour, from a tree that never
  read it - materially better evidence for the rule than an adopting tree would have
  been - and it is recorded under the same word that covers "the technique did not
  help". The row carries the distinction in prose; whether the vocabulary should carry a
  fifth value (`already-holds`) is a question for a later run that hits this twice.

### Redesign proposal (not applied)

Phase 1 step 3's stop is binary and the ledger cannot inform it. If re-sweeps keep
converting, the shape is: the ledger row gains an explicit `lens:` field, the check
becomes "mined under this lens?", and `/intake` grows a `--relens` affordance that loads
the prior note's untriaged table as its Phase 3 seed rather than re-extracting from
scratch. Deferred until a third re-sweep confirms the yield.

## 1.3.0 - 2026-08-31 - openmontage

- **A clone can report success and be missing half the tree, and no phase tells you to
  check.** The first clone of this source, taken under the scratchpad prefix, dropped
  2,159 files - the entire `.agents/skills/` directory, 506,542 words, the densest half
  of the repository - to Windows path limits, printed a normal-looking completion, and
  left `git status --short` showing thousands of `D` entries. Phase 2b's warning about
  long paths exists but is filed under *taking a worktree*, not under *cloning a source*,
  and it warns about the failure without naming the check. A run that swept the truncated
  tree would have found `lib/` and `docs/` intact, produced plausible findings, and
  recorded a word count off by an order of magnitude - with nothing anywhere saying it
  had read a partial source. **The check is one command and belongs immediately after the
  clone**: `git -C <dir> status --short` must be empty. Two more sightings and this is a
  line in Phase 2b rather than a lesson.

- **When a source cites a primary for its central rule, the fetch is the extraction, not
  politeness.** `reviewer.md` grounded its severity rule on a named arXiv paper. The
  paper is real - and the source had renamed its three axes (precision/recall/
  constructiveness became Accurate/Complete/Constructive) and attributed it to two
  institutions the listing does not support. The renaming was the expensive part: it
  converted a *retrieval pair that trades off* into three parallel virtues, which is
  exactly the structure a reviewer needs and exactly what the paraphrase destroyed.
  Writing against the paper produced a materially better technique than writing against
  the source would have. This is the third time the ledger records a corroboration fetch
  correcting rather than confirming, and it is now the reliable use of the budget: spend
  it where the source leans on someone else's authority, not where it reports its own work.

- **The two strongest findings both came from hunts, not from what the source emphasised.**
  The delivery-promise technique came from the enumeration hunt - the golden path stating
  what a *probe* does with a dropped dimension, and silently not covering a *delivery*
  that drops one. The coverage contract came from an asymmetry **inside the source**: it
  held both the named form and the enumerated form of the same contract test, in two
  files, with only the second one's docstring explaining why. Neither was what the
  repository advertises. Worth noting as calibration rather than as a new rule: on a
  943k-word tree the README's emphasis and the tree's yield were uncorrelated, and the
  file that explained the method best was a test docstring.

- **Two of three apply rows found the target tree had already reached the rule.** Not a
  null result - it is the cheapest corroboration available, and it changed what got
  written: in both cases the technique's *gap* moved downstream of where the source put
  it, because the obvious half was already solved in a tree nobody had consulted. The
  apply stage keeps behaving as a second source rather than a checkbox, which is the
  third run running that this has happened.


## 1.3.0 - 2026-08-31 - omniroute

- **The losing arm of an A/B is often the finding.** The run tested three arms, not two:
  current behaviour, the technique applied naively, and the technique applied as written.
  The naive arm was *harmful* in a way the correct arm was not (0/6 high-intent items
  served under congestion), and that contrast is what promoted a caveat inside the freshly
  written technique into a stated boundary with a measurement behind it. A two-arm A/B
  would have returned `better` and taught nothing about how to apply the thing. **When a
  technique carries a distinction that an implementer could plausibly collapse, make the
  collapsed version the third arm.** It costs one more run of the same harness.
- **Ship was blocked by not asking, not by the missing affordance.** Five consecutive runs
  recorded ship 0 and attributed it to the invocation being unable to carry a standing
  project authorisation. That affordance is still worth having, but this run got its
  confirmation in one turn by simply putting the question after the verdict came back —
  with the measured numbers and the exact diff shape in the options. The standing lesson
  should be: **a `better` verdict on a real seam obliges the run to ask, in that turn.**
  The scorecard's declared focus was doing its job; what it could not do was make a run
  raise the question.
- **Two of four landings contradicted the corpus, and both came from reading the corpus
  file rather than the source.** The source did not know what this registry says. The
  contradiction surfaced because Phase 6 opened `depth-bounds-and-shed` and
  `priority-and-fairness` in full and found, in each, a sentence whose *reasoning* the
  source had already paid to disprove. Slug-level prior art would have reported both as
  covered. This is the third run to say the technique-file read is where contradictions
  live; it may be worth promoting "read the neighbour's reasoning, not just its scope"
  into Phase 6's numbered hunts.
- Minor: application frontmatter `stack:` must come from the bundle's declared `stacks:`
  list; two files were written as `typescript` when the bundle declares `next`. Caught by
  the gate. Worth a glance at `index.md` before naming a stack in a new application.

## 1.3.0 - 2026-08-31 - cline

- **Two triage rows that are instances of the same law are one technique, and the check
  is cheap.** This run extracted "never default a projected status" and "a probe failure
  is not evidence of completion" as separate rows with separate homes and separate
  effort estimates. They are the same claim — a layer that observed nothing supplying a
  definite value — and both resolve to `unknown-is-not-a-value`. Landed as one technique
  with three laundering points, it says something neither half could: that the subject
  models two *producers* of state and has no account of the non-observers between them.
  Landed as two, it would have been a pair of small amendments that never named the
  category. **Proposed as a Phase 5 step: before the triage table, run each row's root
  through the law index; rows that land on the same law are one row.** That is the
  synthesis the operator's standing critique (2026-08-25) asks the skill to perform, and
  this is the first run where it had a mechanical trigger rather than a judgment call.
- **In an open-tree repository, `evals/` is a measurement-doctrine document, and the
  sweep does not currently say so.** Phase 2b item 3 sends you to the measurement to
  "read where it was refuted" — i.e. at *results*. This tree's results were stale and
  half-disabled, and the yield was entirely in the **estimator definitions**: a metrics
  module whose JSDoc states, in the author's own words, that one estimator answers "can
  this model solve the problem?" and the other "can I rely on this model?". That framing
  was the whole argument for the landed technique. An eval harness is a first-party
  practitioner account *about how its authors decided to measure*, and that half survives
  even when the numbers have rotted. Worth adding to item 3: read the estimators and
  their comments before the results table.
- **The board's "clear" at Phase 4 is not durable, now two runs running.**
  `fleet-orchestration` mapped clear at Phase 4 and was held by a sibling by Phase 7.
  The method already says to re-check before the first write and it paid again. What is
  worth carrying forward is the shape of the resolution rather than the collision: a new
  *technique file* essentially never collides, so the contention is always about the
  golden path's `techniques:` list and the prose line beside it. That is a ten-second
  edit under the `content` lock, and framing it that way turns a scary-looking contended
  subject into a routine one.
- Minor: `verified_against` must be `<stack>@<version>`, not a commit sha — the commit
  belongs in the application's prose line. Caught by the gate on both applications.
- Minor, and it cost the run nothing only by luck: **the regenerated index absorbed four
  live siblings' untracked subjects** (152 -> 153 subjects, 25 sibling references in
  `index.json`). Generated artifacts were left uncommitted, per the precedent two earlier
  runs set. In a fleet this size that is not an exception any more — it is the normal
  outcome of regenerating at all, and the method's "regenerate only after your own
  content lands" does not prevent it, because siblings' content is in the working tree
  either way. Worth stating plainly in Phase 7: **in a shared checkout with live
  siblings, expect not to commit the generated artifacts, and say so in the commit
  message.**

## 1.3.0 - 2026-08-31 - anydoc

- **`.github/releases/` is an operating-document location Phase 2b does not name, and it
  can be the densest thing in a tree with no `docs/` at all.** This repository has no
  `docs/`, `design/`, `spec/`, `ADR/` or `RUNBOOK` — by the checklist it looks like a repo
  whose only prose is a README. Its four release notes under `.github/releases/` are
  first-party practitioner accounts with the failure modes recorded as revisions, which is
  exactly what item 1 of the sweep is hunting. Add the path to the list. The generalisation
  worth carrying: **a release note is an operating document written after the fact**, and a
  project that writes real ones has a changelog with reasons in it rather than a list of
  commits.
- **Read a version series in order, as one document.** Individually the four notes are
  four features. Read in sequence they are the same defect found four times — content
  vanishing from a lossy conversion without the output saying so — and the second note is
  a *regression caused by the first note's fix*. That sequence was the run's single most
  valuable artifact and it is invisible if you extract each note as a candidate. Phase 3
  says to split a segmented source on its boundaries and treat each segment separately;
  for a release series the opposite is true, and the method should say so.
- **A `research-map` empty for a phrase is not an empty for the concern.** The spec
  asserted no prior art for amplification caps on the strength of `"decompression bomb"`
  and `"amplification"` both returning "the corpus has never heard of this". The concern
  was covered one subject away in the same category, under the name "bounded parsing",
  including the derivation-beside-the-number rule the spec proposed as new. The instrument
  matches slugs and `use_when`; a concern living in a technique's *prose* under different
  vocabulary is exactly what it cannot see, and a zero-hit result on a distinctive phrase
  reads far more like a hole than a near-empty does. **Before asserting a hole from a
  phrase-level empty, read the neighbouring subject's techniques, not just its golden
  path.** This is the near-empty warning's stronger sibling and it deserves its own line.
- **The worker caught the director, for the second consecutive run.** The brief asked for
  the override and argued for it, and got one that was right. Worth keeping as evidence
  that the "tell the worker to override you" instruction earns its space in the brief:
  both times the override came with the neighbour's actual text quoted back.
- **Forging a subject and applying it are in tension, and the scorecard was punishing the
  run for it.** A subject forged into genuinely empty corpus ground tends to land in
  genuinely empty *fleet* ground too: five techniques landed, one had a live instance.
  The apply number (1 of 7) reads as a failure and is not one. The notation needs to
  separate **unapplied because nobody tried** from **unapplied because the fleet does not
  do this yet**; only the first is the skill's failure. Recorded as the next run's declared
  focus rather than applied to `SKILL.md` — first sighting.

### Not applied to SKILL.md this run

Both method findings above are first sightings, and six sessions are live on 1.3.0 right
now. A mid-flight run that reads this should do nothing differently: finish on the version
you loaded. If a second run confirms either the `.github/releases/` sweep gap or the
phrase-empty trap, that is the point to bump.

## 1.3.0 - 2026-08-31 - archify (apply turn)

- **Ask for the confirmation before Phase 9, not after.** This run reached a `better`
  verdict, could not ship for want of one sentence, filed the change, and finished. The
  operator then said the sentence and the whole cross-repo lane completed in a fraction of
  the original cost - because the seam, the proof harness, the two arms and the corpus
  technique were all still loaded. Nothing had to be rediscovered. That is the *same*
  argument Phase 7 already makes for dispatching a forge worker before Phase 9 ("the
  context that argued the spec is the cheapest input the registry will ever have"), and it
  applies verbatim to the apply stage, where the method does not currently make it. A run
  that reaches `better` and is blocked only on confirmation should ask **while the tree is
  still open**, not file and end. Filing is correct only when the operator is absent.
- **The confirmation affordance is now demonstrated rather than asserted.** Five runs
  reported ship 0 and blamed the missing standing authorisation; none had shown that the
  authorisation was sufficient, because none had ever received it. This one did, and the
  change shipped in the same session with no other blocker appearing. That is the second
  sighting for the 1.3.0 redesign proposal and the stronger kind - a positive control, not
  another negative.
- **A gate that passed by not looking, on the commit repairing exactly that defect.** The
  target project's pre-commit hook ran for 77 seconds and reported success on files its
  own lint config ignores by pattern. Worth generalising into how this skill verifies a
  cross-repo commit: **a green hook is not evidence the change was checked** - confirm the
  gate's scope covers the paths you touched, or say in the application that the paired
  proof is the only verification. The corpus already holds the law
  (`failure-not-empty-success`); what was missing was the reflex to apply it to *my own*
  commit's gate rather than only to the code under study.

## 1.3.0 - 2026-08-31 - voltagent-awesome-ai-agent-papers

First run of the reference-wave lane and of the run board, both landed the same
morning. The lane worked; the run's largest output was still a correction to its own
method.

- **A proper-noun grep cannot measure coverage in a purity-gated corpus, and it fails
  in the most convincing direction.** Wave 1 concluded "the corpus owns nothing that
  scores a trajectory" from a grep for `ReAct` / `Plan-and-Execute` over `knowledge/`.
  `check-bundles.mjs` FORBIDS those words in upper-layer documents, so the query was
  guaranteed to return empty: it measured the purity gate, not the coverage. The
  director then re-ran the same grep as verification and reported the claim as holding.
  Two wave-2 lanes refuted it independently against
  `fleet-orchestration/worker-trajectory-anatomy` - 1,794 annotated trajectories, 63k
  steps, an independent 20,574-session field corpus - which is better evidenced than
  either paper proposing the "missing" vocabulary. Phase 4 already warns that a
  near-empty is more dangerous than a total empty; this run says the dangerous case is
  narrower and sharper: **a total empty from a query whose terms the gate bans is
  manufactured, and it reads as decisive.** Map on concepts, never on product,
  framework or scaffold names, and open a file before believing an absence.
- **`research-map` matches slugs and is structurally blind to a concept filed under an
  unrelated name.** Director test, in-run: `research-map "evidence conditioned
  faithfulness" "groundedness verification"` returns six subjects, and
  `civic-intelligence/accountability-method/llm-forensic-gating` - an eight-technique
  build that directly owns the concept, including a technique that already rejects the
  similarity-matching approach a paper in this wave proposed - is not among them.
  `--deep` reads `use_when` and was not enough. Every "we have no material on X" this
  corpus has ever drawn from that instrument is suspect, and two independent lanes
  reached that conclusion before the director did. Filed as owed tooling work, not as a
  lead waiting on the world.
- **Subject-level contention is not file-level contention, and `git status` is the
  finer instrument.** The board claims subjects because that is the unit a run can name
  in advance, but collisions happen at files. A sibling held `model-routing` for the
  whole run while editing its golden path and adding a new technique; `failover-horizon.md`
  was untouched, so an amendment inside it landed with zero collision and the golden
  path's `techniques:` list was never opened. Check the board for who is in the
  neighbourhood, then `git status` the specific file before deciding you are blocked.
- **Regenerating under the `index` lock does not isolate you from uncommitted sibling
  work.** The lock serializes writers; it does not give you a private tree. This run
  regenerated correctly under the lock and the artifact came back referencing a
  sibling's uncommitted technique six times. Committing it would have baked their WIP
  into a hash in `HEAD` under this run's name. **After regenerating, grep the artifact
  for content not in `HEAD`; if any is present, commit your content and leave the
  generated files alone.** SKILL 1.3.1 carries this.
- **Give a wave worker its reference in the message, not just the handle.** Two
  mid-flight corrections went to the wrong lanes, off by one. One worker recognised the
  message described a different paper, quarantined it, and said so; the other partly
  absorbed it. A director holding eight lanes cannot address them positionally. Every
  message to a wave worker should open with the arXiv id or title it is about.
- **An annotation that paraphrases the abstract carries zero ranking signal**, and it is
  the most common shape. Three of sixteen annotations were materially wrong - seeds
  named as a dominant effect the paper measures as its smallest, "56 scenarios" that are
  53, "48,000 scenarios" that are 300 base cases under ~160 conditions - and several
  more were accurate and useless. Up-weight annotations naming a measurement, a negative
  result or a contradiction; down-weight abstract paraphrase. The ranking heuristic
  already does the first half; add the second.
- **Read the benchmark table before the results table.** One paper's "eight benchmarks,
  multiple LLMs, diverse agent frameworks" concealed that seven of eight are single-turn
  QA and the agentic evidence is n=165. Neither the annotation nor the abstract could
  have revealed it.
- **Fetch `arxiv.org/html/<id>` first; the PDF endpoint returns undecodable compressed
  streams through the summarizer** and costs a fetch to discover. One lane recovered a
  full paper from the locally-saved binary with PyMuPDF at zero additional fetch cost.
  Belongs in the wave worker brief.
- **The wave stop rule should read the KIND of yield, not only its volume.** Wave 2 was
  not thin - it produced three amendments and two catches - but its highest-value
  outputs were corrections to our own premises rather than findings from its papers.
  When the marginal reference starts returning less than the marginal correction, the
  honest move is to stop and land, which is what the operator's yield-floor instruction
  bought here. A third wave would have read more papers to answer questions that had
  been answered or declared unanswerable.
- **A negative that closes a line of enquiry is a first-class result.** The final lane
  established that Family B's missing base rate is structurally unobtainable from
  bug-report corpora at all: nobody files a ticket saying the agent gave them a
  well-formatted answer they believed, and two corpora over the same technology reported
  inverted symptom distributions because the reporting channel decides what gets filed.
  That saved a wave 3 and is worth more than the papers that produced it.
- **Class prediction held on both hard cases.** The paper-aggregator rule - authoritative
  for its measurement in its protocol, weak for its framework - correctly predicted that
  a fine-tuned guardrail's taxonomy table would carry the yield while its benchmark
  (generated by its own synthesizer) would not, and that an internal-representation probe
  would be beaten by its own black-box baseline. Twice the run's best finding came from
  the half of a paper its authors were not selling.

### Redesign proposal - not applied

The two families this run landed were both discovered by hunting **our own enumerations**
(a stated ranking, a stated inventory, a stated "what this does not buy"), and both were
verified against the corpus rather than against the source. Meanwhile the papers'
contribution was mostly to say which enumeration to open. If that holds for another
reference-index run, the lane's ranking weights are aimed at the wrong thing: they rank
references by what the reference might contain, when the higher-yield question is which
of OUR enumerations a reference is positioned to test. That would be a different Phase 2c
step 3 - rank the corpus's completeness claims first, then match references to them -
and it is a redesign, not an adjustment.

## 1.3.0 - 2026-08-31 - aider

- **Both landings came from hunting our own enumerations, and this is now a second
  sighting from a different source class.** The reference-index run's redesign proposal
  argued that the corpus's completeness claims are the higher-yield thing to rank; this
  run reached the same conclusion from a repository. The technique came from a golden
  path that enumerates its lanes and *denies a symmetry* ("every other lane is a function
  of the query"); the amendment came from a technique that argues admission **value** is
  set-conditional and models admission **cost** as per-item additive in the same file.
  Neither is visible to `research-map`, which scores two files identically when both
  "cover" a concept. A third sighting makes this a rule Phase 6 should carry as its
  first hunt rather than its third.
- **The asymmetry hunt has a sharper form than "look for asymmetries".** The productive
  shape is: *a file that models the two halves of one decision with different
  sophistication.* Value/cost, read/write, admit/evict, produce/consume - name the pair,
  then check whether the file gave both halves a model or gave one a model and the other
  a sentence. That is mechanical enough to run without inspiration and it found the
  better of this run's two landings.
- **Phase 7.5 is an extraction surface, not only a verification step.** Second run in
  four where the seam amended the corpus rather than merely scoring it: the A/B was built
  to test the centrality technique and surfaced a ranking column sitting at its schema
  default for 93.7% of its rows - an `unknown-is-not-a-value` instance nobody had gone
  looking for - which became a section of the technique. Phase 7.5 should ask explicitly,
  after the verdict: *what did the seam teach that the source did not?*
- **New parallel hazard: the regenerated index bakes in whichever sibling is red at that
  instant.** With 8 siblings live, every `build-index` run this session picked up an
  untracked sibling technique that was failing `check-bundles` (first two files, then a
  third from a different run). The method says not to regenerate over files you do not
  own, but says nothing about the case where your own landing *requires* a regeneration
  and a neighbour is red. This run's resolution: **commit the content without
  `index.json`/`catalog.json`, and say so in the commit message** - the last green run
  regenerates, and the corpus self-heals within minutes. Worth a line in the Phase 7
  regeneration block if a second run hits it.
- **Verify your content is in HEAD by grepping content, never by trusting your own
  commit.** A sibling's commit swept this run's ledger appends (`applied.md`,
  `sources/index.md`, `SCORECARD.md`) into *their* commit before this run reached Phase
  10. Nothing was lost - the appends were made under the `ledger` lock and survived
  verbatim - but the run's own commit does not carry them, so a check of the form "did my
  commit include my rows" reports a false negative and would have prompted a duplicate
  append. The existing `git grep <slug> HEAD` instruction is correct precisely because it
  is content-addressed; this is the failure mode it prevents.
- **Editing a connected project's tree can break a build you cannot see.** Phase 8's
  foreign-WIP test is "does another session have uncommitted work *in the files you
  touch*", and it passed here - then a `cargo test` from that other session, started
  minutes earlier, compiled this run's uncommitted edits as part of its own run. The
  shared artifact is the **build**, not just the files. For a compiled project the test
  should be "is another session building or testing this tree right now", which is one
  process query, and the answer changes whether you edit before or after committing.

## 1.3.0 - 2026-08-31 - tc39-proposals

- **The reference-index class needs a discriminator, and the ratio test is not it.**
  This source passes the ratio tell overwhelmingly - 1,603 unique outbound links over
  ~10,900 in-tree words - and Phase 2c's lane would have enumerated ~200 references,
  ranked them, and read them in waves. It would have been near-total waste: the
  references are individual language-feature proposals, every one of which strips to
  `nothing` against all eight bundles, so a full campaign spends ~40 fetches to return
  ~200 honest negatives. The yield sat entirely in what Phase 2c treats as annotation.
  **Each row was a maintained RECORD - stage, owner, a per-stage evidence column, a
  dated notes trail, a rationale for the dead - so the table's schema was the source
  and the bibliography was decoration.** The discriminator to ask after the ratio test
  fires: *does the curator maintain per-row STATE over time, or only select rows?* A
  bibliography selects; a tracker maintains. Only the first is a wave lane. Second
  reference-index run in the ledger (after `voltagent-awesome-ai-agent-papers`, which
  was genuinely the wave shape) and the two answer it differently, which is what makes
  it a discriminator rather than a preference.
- **Read what the columns do DIFFERENTLY at different stages.** The single highest-yield
  observation in the run was not any row's content but that the column set changes per
  stage - and the one fetch confirmed the change tracks the process's entrance criteria
  exactly. A tracker's schema is its author's model of their own pipeline, stated in a
  form that cannot hedge. That is the same instinct Phase 2b applies to a checker ("the
  file that implements a rule the README merely names"), transposed to a table.
- **The `index` lock serialises regenerations, not the tree they read - and the method
  currently implies otherwise.** The regeneration ran correctly inside the lock and
  still baked a sibling's uncommitted technique into the artifacts, because a lock
  cannot see a file already sitting in the shared working tree. SKILL.md's anti-pattern
  ("a regeneration over a sibling's half-written subject bakes their WIP into an
  artifact you then commit under your name") describes the outcome but the procedure
  offers the lock as the remedy, and the lock cannot deliver it. **The cheap corrective,
  worth adding to Phase 7: inside the lock and before regenerating, run `git status
  --short` over the bundles you touched; foreign untracked or modified files there mean
  the artifacts you are about to write are not yours to commit, and the right move is to
  regenerate anyway (siblings need it) and leave the artifacts unstaged.** That is what
  this run did.
- **A contended golden path is not always separable at commit time, and the method's
  stated resolution assumes it is.** SKILL.md says the second run "writes its technique
  and takes the `content` lock for the golden-path line alone." That works when the
  collision really is the `techniques:` list. Here both runs also added a prose section
  and a techniques-list entry, so by commit time the shared file held three
  interleaved edits from two runs and no clean pathspec or index surgery could separate
  them - staging a partial version would have orphaned the sibling's declaration, and
  staging the whole file would have committed their content. **Resolution that worked
  and generalises: commit your own new documents and ledgers, leave the shared spine
  entirely to whoever commits last, and say so in the commit message.** The spine's
  worktree copy already declared BOTH runs' techniques, so HEAD self-heals the moment
  either run commits it - a transient integrity red that repairs itself is strictly
  better than either run touching the other's prose. Worth stating in Phase 10 beside
  the pathspec rule.
- **Note on `git commit -- <pathspec>`, which the method leans on hard.** A pathspec
  commit takes the WORKTREE state of those paths and ignores the index, so it cannot be
  used to commit a curated subset of a contended file. Where a shared file must be
  split, the index is the only lever (`git hash-object -w` + `git update-index
  --cacheinfo` stages a variant without touching the worktree) - and this run tried that
  before concluding the edits were not separable and abandoning it. The lesson is not to
  use the trick; it is that the pathspec rule and "stage your new files by name" are two
  different mechanisms and the method treats them as one.
- **Apply produced corpus content twice, and the `unmeasurable` row was the useful
  one.** Running `item-liveness`'s own diagnostic against a second seam found its
  precondition missing - a flat status queue has no per-item trail, so "last-touched is
  free" holds only where dated per-item events already exist. The technique gained that
  condition and the schema cost. Fifth consecutive run where the A/B tree acted as a
  second source rather than a checkbox; the pattern is now strong enough that the apply
  step should probably be described in SKILL.md as a corroboration lane, not only as a
  proof lane.

## 1.3.1 - 2026-08-31 - whatwg-html

- **A new source class arrived and the method has no row for it: the *standard
  repository*.** It is the only class so far that sits at the top of the
  corroboration table on its own — a primary normative document, so its statements
  about its own conformance model *authorize* rather than merely originate, and
  the 3-fetch budget is irrelevant because there is nothing upstream to check it
  against. Its yield profile is unlike every other repository class and inverts
  twice. Against the landing page: 302 words versus 717,109 in-tree, **2,374x**,
  the sharpest the ledger holds by two orders of magnitude. And *inside* the tree:
  711,540 words of normative text produced **zero** landings, while ~120 words of
  editorial notes plus a 5,472-word FAQ and contributor guide produced both. The
  reason is structural rather than incidental — **a standard's subject matter is
  un-strippable by construction.** Its substance is element names, attribute
  names, algorithms for one format; the strip test kills all of it, every time. So
  the extraction lane for this class is never the specification, it is the
  meta-layer: how the specification is engineered as an artifact, which lives in
  the contributor guide, the FAQ, the change template, and the editorial notes.

  ### Redesign proposal — the row, ready to paste

  For the routing table in SKILL.md:

  | **standard repository** | is this the normative text of a specification, maintained in the open? | its own conformance model, its change process, and the annotations it defines for itself - never its subject matter |

  And for `references/source-classes.md`, the operative instruction, which is the
  part that would have saved this run an hour: **do not read the normative text —
  grep it for its annotation vocabulary.** A mature specification defines
  marked-up concept classes for itself (a term for deliberate deviations from
  other standards, a term for privacy-relevant features, a heading class for
  guidance addressed to checkers rather than authors) and every one of them is a
  hand-built, curated, enumerable index into exactly the places where its
  engineering doctrine is written down. `grep -c` over each marker gives the yield
  before a single paragraph is read. Both landings here came from two such
  markers; the 711,540 words around them contributed nothing.

  Not applied to SKILL.md this run on purpose: five siblings were live and one had
  just committed a skill-lessons change, and the method's own rule is not to edit
  the file from two runs in one afternoon without reading the other's diff. This
  is a lesson with the edit pre-written, for whoever bumps next.

- **The board changed what was mined, for the first time on the record.** The
  method has said since 1.2 that a source whose obvious home is a subject a
  sibling holds should be "routed elsewhere or mined for its other half", and this
  is the first run where that actually fired and mattered. A sibling held
  `quality-gates` while mining the process repository of the *other* major web
  standard. The obvious extraction here — the change-admission gate (independent
  implementer interest, plus a filed obligation in the test suite, in each
  engine's tracker, in the mapping specifications, in the docs site) — is the
  canonical staged-advancement material, and that sibling's source is the better
  *authority* for it, not merely the earlier claimant. So it was recorded
  untriaged with its anchor and both landings came from material that source does
  not carry.

  The refinement worth carrying: the routing rule currently reads as collision
  avoidance, and the useful version is **authority comparison**. When two live
  runs can both reach a finding, the one whose source is the primary for it should
  take it, and the other should say so in its untriaged table rather than racing.
  That is a better allocation than "first claim wins" and it costs one line.

- **Two candidates shared a root and were deliberately NOT merged — and saying why
  is the same discipline as merging.** The standing critique asks the skill to
  synthesise, and the last two runs did (cline merged two candidates into one
  technique; the ledger praised it). This run reached the same fork and went the
  other way: an authoring-side inability marker and a maintainer-side deviation
  register are both "a true known violation, declared in band, not reported as
  news", and the decision rules still do not overlap — different actor, different
  failure mode (an undetectable fabrication versus a repair that reintroduces the
  avoided problem), different required fields. The lesson is that the synthesis
  step needs a stated *test*, not a preference. The one used here: **merge when
  the two candidates would share a decision rule; keep them apart and cross-link
  when they share only a shape.** Written into both files as an explicit
  discriminator so a later run recognises the pair instead of re-litigating it.

- **The apply step disproved the premise it was set up to test, and the finding
  got stronger.** The tree was picked to measure a gate manufacturing fabrications
  and turned out to have no such gate — 21 hand-written lint rules, none touching
  the field — while carrying the fabrication at 55.6% of the population anyway. A
  run that had scoped the experiment to "find the gate, measure its output" would
  have reported *no seam* and moved on. Scoping it to the *population* instead
  (every element the rule would govern, two predicates, same instrument) is what
  let a disproved premise become a measured correction to the technique. Sixth
  consecutive run where the A/B tree acted as a second source; the previous
  lesson's proposal — describe the apply step in SKILL.md as a corroboration lane
  and not only a proof lane — now has its third sighting and should be applied.

- **A parallel-run failure worth a Phase 10 line: a pathspec commit that omits the
  shared spine.** A sibling committed two techniques and two applications to
  `main` without `quality-gates.md`, so `HEAD` carried two techniques its golden
  path did not list — a bidirectional-link break that no gate could see, because
  every checker reads the *working tree*, where the edit was present and green.
  This run inherited the file, added its own section, and committed the whole
  thing (said so in the message). The rule the method is missing: **when a landing
  edits a golden path, the golden path is part of the pathspec, and the HEAD
  verification must check the roster and not only the technique file.** Phase 10
  already says to verify with `git grep <slug> HEAD`; verifying the *slug* passes
  while the declaration is missing, because the slug is in the file you did commit.
  Verify the golden path names it, in `HEAD`, as a separate check.

## 1.3.1 - 2026-08-31 - brooker-blog

- **A near-empty from `research-map` has a second cause nobody had recorded: the material
  is in an *application* document.** The instrument ranks subjects and techniques; it does
  not rank applications. Twice in one run it reported "the corpus has never heard of this"
  over ground the corpus had already covered in an application - shuffle sharding, hands
  dealt from a bucket set, head-of-line blocking with its metric name, all sitting in an
  application filed under the very subject the map said was empty. The existing warning
  covers other branches and later commits; add this one. **Before believing an empty,
  grep the applications of the two nearest subjects.** The corollary is a corpus finding
  rather than a method one: material written at the application layer and never lifted is
  invisible to every instrument this method has.
- **A single-author archive is a reference index whose central signal is unavailable.**
  The lane's strongest triage instrument is within-index convergence deduped *by author*.
  Where the curator and the author are the same person, every convergence is n=1 by
  construction. That does not disqualify the class - this run landed eight - but it must
  be said at Phase 2 and the corroboration must come from elsewhere: corpus-internal
  evidence, training-data convergence, or a primary the reference points at. A run that
  reports "three references agreed" over a single-author archive has counted one voice
  three times.
- **Rank an author's posts by word count before spending a fetch.** Sixteen lanes gave a
  clean discriminator that costs nothing: the 74-word aphorism and the ~500-word product
  aside returned `nothing`; the 613-word queueing post and the 805-word talk write-up were
  among the strongest. Length does not predict yield, but **account-versus-aphorism does**,
  and word count separates them for free. Relatedly: **title-level epistemics keywords are
  non-evidence.** A post titled "hypothesis" stated no falsifier and was ranked top of its
  band on the word alone.
- **The class is a property of the document, not the byline** - four of sixteen lanes found
  otherwise, on an author with impeccable credentials in the exact domain. Two returned a
  vendor product paragraph for their author's own employer, which authorizes nothing.
- **A below-the-frontier source earns a slot only when it argues who *pays* for the
  mechanism.** This is the sharpest ranking refinement the run produced. A post explaining
  a mechanism below the construction frontier is worthless here; a post arguing where the
  cost lands when you decline to buy that mechanism is consumer-position and valuable - the
  displaced work arrives in the layer this bundle owns. The slug map cannot see the
  difference, so it has to be read off the argument.
- **For a talk write-up, read the images.** One lane found nine slides carrying `alt=""`
  and the only numbers in the document, including a reproduced peer-reviewed fleet table
  the prose never mentions. A text ingest silently loses them.
- **`WebFetch` refuses verbatim reproduction and burns a budget slot returning a summary.**
  Two lanes lost a fetch to it, and one received a hallucinated date and an invented
  percentage. For a short single-page essay, go to `research-ingest` or raw retrieval first.
- **Look before overwriting.** I created an application with a shell redirect onto a path I
  had not checked, and destroyed a document from 2026-08-18; it was restored from `HEAD` and
  mine refiled under the stack that actually ran the arm. `Write` refuses an unread file and
  `cat >` does not. **Use the tool that refuses.**

### Redesign proposal - the apply lane's brief decides the ship column

Not applying this now; it wants a second sighting. Three consecutive rows have named the
ship column's cause and each named it one step too early. 1.3.0 blamed the missing
confirmation affordance; the last two rows blamed selection at triage. This run selected
well at triage, dispatched four apply lanes, and shipped zero - because every brief said
*read-only in project trees*, which is right for a seven-tree sweep and forecloses `code`
before a seam is looked at. Three of eight landings had a small code arm and all three were
excluded by my own instruction.

The proposal is to split Phase 7.5's dispatch in two, and to say so in `SKILL.md`:
**a fleet reconnaissance lane (read-only, many trees, finds the seam) and a code lane
(write access to exactly one named tree, briefed only after a seam is named).** They are
different jobs with different risk profiles and they currently share a brief, which
resolves the conflict in favour of the safe half every time. The scorecard row would then
carry which lane got write access, making the decision visible at dispatch rather than
inferable from a zero six phases later.

## 1.3.1 - 2026-08-31 - voltagent-awesome-ai-agent-papers, wave 3

The wave that changed what the ranking is FOR, and it was the highest-yield change the
lane has made. 8 of 8 lanes worth a slot against wave 2's roughly half.

- **Rank OUR enumerations, then match references to them.** Waves 1-2 both landed
  almost entirely from hunting the corpus's own completeness claims - a stated ranking,
  a stated inventory, a stated "what this does not buy" - while the papers mostly said
  which claim to open. Wave 3 inverted the ranking accordingly: it read `agent-memory`'s
  five stated enumerations first and picked references positioned to test them. Result:
  two independent three-way convergences, where topic-ranked waves produced one
  two-way each. The banked redesign proposal from wave 2 is now applied in practice
  and should be written into Phase 2c step 3 if a second reference-index run repeats it.
- **An abstract paraphrase does not merely carry zero ranking signal - it
  systematically mis-ranks MEASUREMENT papers downward**, because abstracts are written
  to sell the framework. The run's single best return would have been skipped on its
  annotation: a "reframes memory as dynamic decision-making" abstract concealed a stage
  ablation over working memory, the durable store, supersedence and forgetting, plus a
  limitation section that converged with our provenance obligation from the optimization
  side. New rank signal, cheap to check: **does the reference have an ablation table and
  a limitation section?** Prefer annotations promising a mismatch, a negative
  correlation or an ablation over those promising an architecture.
- **A headline number does not survive a relay.** This run committed a lead saying a
  paper published a "43% detection base rate"; the paper says generic detectors *miss*
  43%, n=200, on a claim type that is 13.8% of its taxonomy. It came from a wave-2
  worker's second-hand impression of a reference it had not read, and the sign flipped
  in one hop. The corroboration section already says a relay is downstream of its
  primary; the operational form is narrower and sharper: **the run that LANDS a number
  must have read the sentence containing it.** A lead may carry a claim; it may not
  carry a figure.
- **Third denominator inflation in three waves, which is convergence.** "48,000
  scenarios" that were 300 base cases under ~160 conditions; "1,187 bug reports" that
  were 73% help-desk posts; "1,847 queries" whose observation unit was 24 self-reporting
  analysts. Past the threshold for a rule rather than a third log entry: **establish the
  observation unit before quoting any count, and expect the largest number in a paper to
  be its corpus size rather than its evaluation size.**
- **The `ledger` lock covers the append, not the commit - and those are different
  critical sections.** This run appended its scorecard row under the lock, released, and
  a sibling's commit swept the uncommitted row into their message minutes later. The
  content landed intact; the attribution did not. Either append and commit inside one
  hold, or accept that shared-ledger rows may land under a neighbour's commit and stop
  treating `git log` as the record of who wrote a row. The board record is the honest
  index; the commit is not.
- **Subject-level board claims are the right granularity for announcing and the wrong
  one for blocking** - confirmed a second time. `model-routing` was held all run while
  the file this run needed sat untouched. The pairing that works: the board says who is
  in the neighbourhood, `git status` says whether the specific file is contended.
- **`research-map` was blind three times, and the third measured its cost.** Fourteen
  techniques across two `civic-intelligence/accountability-method` subjects own claim
  verification completely, and every `llm-agent` query missed them, so the agent lane has
  been re-deriving that material from finance-ML papers. `--prose` now reads document
  bodies. Two things to keep from building it: the first weighting was wrong in a way
  that made the fix invisible - a subject sharing the single word "verification"
  outranked a subject whose prose carried the whole concept, so **a retrieval fix is not
  done when it scores, only when it ranks** - and its limit is real and recorded: it
  helps where vocabulary overlaps and not where it does not. It raises the floor; it is
  not a semantic index.
- **The bottleneck moved from discovery to landing, and the wave machinery is what
  moved it.** Three waves produced 13 landed amendments against roughly 30 verified
  candidates. That gap is the wiki anti-pattern in a new form: not techniques with no
  apply row, but findings with no landing. A fourth wave would widen it. When a wave's
  candidate count outruns the session's landing capacity by more than about two to one,
  the honest next move is to land or to hand off, not to mine.

### Redesign proposal - not applied

Apply 0 twice in a row now, and both times for the same structural reason rather than a
skipped step: the findings are rules about **how a number is produced**, and the fleet
has no project that produces that kind of number - no memory comparison, no structural
extractor, no tolerant comparator. Phase 7.5 assumes every technique has a seam in
running code. A whole class does not: measurement-discipline techniques have their seam
in *another measurement*, and the only honest A/B for them is a re-analysis of a study,
ours or someone else's. If a third run reports apply 0 for this reason, Phase 7.5 needs
a fourth mode - `re-analysis`, whose A and B are two readings of one published protocol -
rather than continuing to record these as unapplied.

## 1.3.1 - 2026-08-31 - danluu-2026

- **The standing `re-analysis` question is answered: no fourth mode is needed.** The
  previous entry proposed one, reasoning that measurement-discipline techniques have
  their seam *in another measurement* and so cannot be A/B'd against running code. All
  five landings this run were measurement-discipline techniques and three of them got
  ordinary two-arm code A/Bs. The move that unlocked it: **a project's own measurement
  apparatus is code you can run.** An eval lane, an integrity gate and a judged verdict
  corpus are all executable, all held in the tree, and all testable read-only. The prior
  runs looked for the seam in the product, found none - correctly - and concluded the
  mode was missing rather than that the search was aimed one layer off. Where a technique
  is about how a number is produced, grep the project for what produces its numbers.

- **Ship-0 has now been blamed on three different mechanisms in three runs; they share
  one ancestor, and it is the triage table.** Run N-2 blamed selection at triage, run N-1
  blamed the apply lane's brief, and this run could have blamed neither (it dispatched no
  lanes and wrote every arm itself). What actually foreclosed `code` here is that the
  operator picked rows by number and the table named no project, so Phase 8 step 2 -
  correctly - refused to edit a tree nobody authorized. **A triage row whose seam is
  plausibly a few readable lines should carry the project it would touch**, so that
  picking the row authorizes the tree. This is a candidate `SKILL.md` Phase 5 edit; it is
  recorded as a lesson because it is the first sighting *of this cause*, and because two
  runs in one afternoon editing the method is the thing lane 2 warns about.

- **The cross-bundle asymmetry is a repeatable probe, and it is not the same as the
  enumeration hunt.** The best landing this run came from noticing that two bundles both
  'cover' judge instability and only one *models* it: the builder-side harness has carried
  a repeatability floor for weeks, while the operator-side subject runs a trust bar, a
  per-cycle drop alert and a windowed regression detector with no floor beneath any of
  them. Both files score identically on every keyword a map can match; the difference is
  only visible by opening both. Phase 6 step 4 already says *find what a subject mentions
  in one place and measures in another* - this run says it holds **across bundles**, where
  the corpus's own no-cross-links rule makes the gap least likely to be noticed and most
  likely to persist. Worth adding to step 4 if a second run finds one.

- **Second sighting of the single-author archive, same afternoon, reached independently.**
  `brooker-2026-08-31` and this run both mined a personal blog's archive, both classified
  it `reference-index (single-author archive)`, and both wrote the same calibration
  without seeing each other's note: within-index convergence deduped by *author* is
  structurally unavailable, so every convergence is n=1 and the references originate
  freely while authorizing almost nothing. Two independent sightings meets the class-note
  bar but not the three-run bar for a rule, so it stays here. The practical consequence
  worth carrying now: **say the n=1 cap out loud before the triage table**, because the
  lane's headline signal is missing and a reader of the note will otherwise assume it was
  checked and passed.

- **A 100% sample is available more often than the wave lane assumes.** Phase 2c is built
  for a 200-entry bibliography and prescribes ranking plus waves. An operator filter can
  collapse the set below the wave threshold - here, `articles published in 2026` took 120+
  posts down to 6 reachable references, all of which were read directly with no workers
  and no ranking step. **When the filtered set is small enough to read whole, read it
  whole and say so**; the ranking machinery exists to avoid sampling, and a full read is
  the thing it approximates. The note records `sample: 100%` for exactly this reason - it
  is what makes four already-covered catches evidence rather than an artifact of which
  three links looked interesting.

## 1.3.1 - 2026-08-31 - tigerbeetle-blog

- **The scorecard's declared focus had no reader, and that is why four runs missed it.**
  Phase 11 writes "next run's declared focus" into `SCORECARD.md`. Phase 1 loads
  `check-bundles`, `build-index --check`, `librarian-scan`, the source ledger and the
  board - and never this file. So the focus is written at the end of run N and
  discovered at the end of run N+1, after the triage table it was meant to shape has
  already shipped. Three prior rows each diagnosed a different proximate mechanism and
  each prescribed a fix the *next* run's shape made inapplicable; all three are
  downstream of a feedback loop with no read step. **Applied in v1.4.0**: Phase 1 gains
  a fifth item. This is the first structural change in the sequence rather than another
  prescription, and the next row says whether it was sufficient.

- **A first-party reference index is a hybrid whose two halves must be routed
  separately.** Where a source's value is its links but every link is the *same
  organisation's* writing, Phase 2c's **mechanics** are entirely right - enumerate all
  31, rank the whole set, cut waves from the returns, table the unread tail - and its
  headline **triage signal is void**. Within-index convergence means independent
  curated references reaching one rule; here the index is 3-4 voices and one author
  wrote 13 of 31, so two posts agreeing is one voice twice. Worse, the same
  organisation's *repository* had been mined the same morning, so several posts
  elaborate bullets already banked - which is **depth, not independence**. Read the
  mechanics and the signal as separable; taking Phase 2c as a package is the failure.

- **`--wave` sizing should come from the operator's scope when they give one.** The
  operator scoped this run "2026 first, then 2025 if valuable", which cut wave 1 at a
  natural boundary (6 articles) and made the wave-2 decision a real yield judgement
  rather than an arbitrary top-N. That is better than the skill's default banding and
  worth offering explicitly: when a source has a date axis, propose waves along it.

- **The corpus can be empty of a concept while being full of its word.** All 56 `fuzz`
  hits in `software-engineering` are *fuzzy matching*; `research-map` over testing
  vocabulary returned confident slug collisions into four unrelated bundles. The
  2026-08-31 rule says never let a proper noun decide an absence. Its converse also
  holds: **never let a common word decide a presence.** Establish an absence by grepping
  the *concept* under several names and reading what matched - the false-positive
  vocabulary is the tell that a slug map cannot see this territory at all, which is
  itself the explanation for how a subject-sized hole survives 153 subjects.

- **Prefer the technique's own procedure as the apply arm when the technique is a
  reading discipline.** `generator-bounds-the-space` prescribes "enumerate what the
  generator cannot produce". Running exactly that against a live property suite *is* a
  two-arm comparison - arm A is the suite's green report, arm B is the enumeration - and
  it produced 9 dimensions and 3 confirmed-unreachable code paths in about ten minutes,
  with no code changed. Techniques whose content is "ask this question" have a cheap
  `experiment` arm that is easy to miss because it looks like reading rather than
  measuring. This generalises the prior run's finding that the seam can live in the
  *instrument* rather than the product.

- **A confirming tree is worth applying to, when the confirmation is asymmetric.** The
  instinct is to seek a tree that lacks the technique. The bitemporal row here landed
  against a tree that already had it - and the finding was that the clock the system
  *originates* is `not null` while the clock it must *learn from the world* is nullable
  and empty. A tree that designed for the rule and still drifted is stronger evidence
  than one that never knew it, which only shows that people forget.

### Redesign proposal - not applied this run

- **The triage table should carry a `project` column by default, not by exhortation.**
  Two rows of this scorecard have now prescribed carrying a project on picked rows, and
  both were written as advice to the next run rather than as a change to the Phase 5
  table format shown in `SKILL.md`. The format in the file has seven columns and none of
  them is a project; a run copying that format faithfully cannot comply. If v1.4.0's
  Phase 1 read does not close the ship gap by itself, the next change is to the table in
  Phase 5 - add the column, and let a row with no plausible seam say `-` explicitly.
  Deliberately not applied here: two method edits in one run, from one session, with
  three live siblings reading this file, is more churn than one run's evidence supports.


## 1.3.1 - 2026-08-31 - verou-2026-blog

- **Ask for the project tree after the A/B, not at triage.** The triage pick named no
  project, so the run went read-only under Phase 8 step 2 - correct, and it stayed
  correct. What unblocked ship was going back at Phase 7.5, once there was a measured
  `better` verdict and a sized diff (~8 lines, one file), and asking with both attached.
  The question was answered instantly because it carried a number. Several prior rows
  proposed authorizing the tree at triage to remove this friction; that would ask
  earlier and worse, before anyone knows whether there is anything worth shipping. The
  gate is not friction to relocate - it is a question whose answerability depends on
  what is known when it is asked.

- **A source's class can be right about the yield and wrong about the ceiling.** The
  channel-corpus row predicts "amendments and corroborations, never new subjects", and
  that held exactly. What it does not say, and should: a channel corpus by a *standards
  participant* carries one narrow authorization power (claims about the process they
  participate in) that is usually irrelevant, and the run should say so out loud at
  Phase 2 so the fetch budget is not held in reserve for it. This run spent 0 of 3 and
  the reason was structural, not lucky.

- **`code` mode pays twice, and the second payment is the one to plan for.** Re-running
  the arms against the real revisions (functions extracted from HEAD and from the
  working tree, then executed) converted the instrument's own self-assertions into
  regression checks at no extra cost - "the arms must agree on every explicit value" is
  an instrument check before the change and a regression check after it. More
  importantly the tree refused half the fix: a second resolution point carried the
  identical defect and could not take the identical repair, because its consumers render
  a single resolved value. That produced a clause the desk-written technique did not
  have (*defer a resolution only to a consumer that can perform it*). **A technique
  written at a desk and the same technique written through a tree differ by exactly that
  clause**, and the difference is only discoverable in `code` mode - an experiment over
  transcribed arms would never have met the second consumer.

- **Phase 6's "read the file" rule earned its keep in the most expensive way available.**
  The run's best landing was a *correction* to a technique that already held the
  requirement and prescribed the opposite remedy. No concept query built from this
  source's vocabulary reaches that file - it lives in a rendering subject, under
  measurement vocabulary - and any summary of it would have read as "already covered".
  Only opening it showed the remedy was wrong. This is the third run to record a version
  of this and it should probably become a rule: **a candidate that looks already-covered
  is the one where the file must be opened, because the cheap signals cannot tell
  "covered" from "covered wrongly".**

### Redesign proposal (not applied)

**Price the `XL` row in the triage table.** The scorecard names `test` as the weakest
stage and identifies the mechanism: an `XL` row loses every head-to-head against a
technique that lands in one file, so the subject-sized finding is systematically the one
banked. `SKILL.md`'s corrective (write the spec, dispatch before Phase 9) only fires if
the row is picked. Proposal: Phase 5's table carries a cost estimate on any `XL` row the
run's own read marks `real gap`, stated against the combined cost of the cheap rows, so
the operator chooses between comparable quantities rather than between one large unknown
and four small certainties. Not applied here because it is a Phase 5 format change and
this run has only one sighting of the failure; a second run that banks an `XL` row it
marked `real gap` makes it a rule.

## 1.3.1 - 2026-08-31 - tanstack-query

- **A Phase 1 instruction reaches only runs that START after it lands, and this
  run is the controlled instance.** v1.4.0 added "read SCORECARD's declared
  focus" to Phase 1 precisely because four consecutive rows had missed the
  focus. I loaded the skill at Phase 0 while that edit was in flight, got
  1.3.1, and missed the focus for exactly the diagnosed reason. That is not an
  argument against the fix — it is the boundary on it. **In a fleet that
  routinely runs a dozen terminals, every method edit has a propagation delay
  equal to the longest in-flight run**, so the first row after a Phase 1 change
  is expected to miss it and should not be read as the fix failing. The
  scorecard's "next run's declared focus" should probably say *runs starting
  after <timestamp>*, so a mid-flight run can tell whether the instruction was
  ever addressed to it.

- **Open one cited line per number before it reaches a document.** The apply
  harness produced two confident, plausible, entirely fabricated results in one
  run. First: a flat constant lookup let `GC_TIME_MS.STANDARD` (600000)
  overwrite `CACHE_TTL_MS.STANDARD` (300000), and the run reported a **2.0x
  spread on a key where all seven sites agree**. Second: a 900-character
  lookahead window bled past the end of one registration into the next, and
  invented a divergence between two *different* keys. Neither looked wrong in
  the output — both looked like exactly the finding the technique predicted,
  which is what made them dangerous. Both died the moment the cited lines were
  opened by hand. The existing rule ("open one cited line to see that it says
  what the citation claims") is written for reviewing a *forge worker's* diff;
  it belongs just as much to Phase 7.5, where the director is the one holding
  a freshly written instrument. **A number produced by a harness you wrote this
  hour is not evidence until one of its rows has been read in the source.**

- **Make the harness assert its own parse, not just its own presence.** The
  corrective that actually worked was cheap: assert that the parsed constant
  table has the values it must have (`CACHE_TTL_MS.STANDARD === 300000`) and
  that two tables which must stay distinct actually are. It fired immediately
  on the next run and refused to print — `failure-not-empty-success` applied to
  the apply lane's own instruments. A harness that reports zero findings and a
  harness that parsed zero rows must not look the same, and in this run they
  briefly did: the first version silently parsed **0 of 39** error codes and
  would have reported a clean tree.

- **A repository that ships a linter: read the linter second, after the
  migration guides and long before the README.** New class note, and the
  strongest routing signal this run found. The tree held 134,411 words of
  documentation across 497 files and a 383-word README, and the densest single
  artifact was neither — it was an eight-rule lint plugin whose rule documents
  run to a few hundred words each. A linter is the one file that **cannot hedge
  about what the contract is**: the docs say a rule exists, the plugin says
  what the rule actually is, in a form that has to execute. Two of the three
  landings trace back to it. The corollary is the untriaged finding this run
  did not land: read together, a shipped rule set is a **taxonomy of the type
  system's blind spots** — key order where inference flows between keys,
  referential identity, which fields were read, whether a value was returned —
  and every entry is a contract term whose violation is silent.

- **The enumeration hunt paid again, but the more valuable probe this run was
  the half-stated symmetry.** Two landings came from documents declaring
  themselves complete ("Every cache declares four policies"; "exactly four
  legitimate terminal states"), which is the familiar move. The third came from
  a subject that describes one side of a symmetry without ever naming it as one
  side: `client-state` models *declared* subscription narrowing and had no
  vocabulary for the *observed* form. **This is invisible to both the slug map
  and a summary**, because the file genuinely covers the concept — it scores
  well on every keyword and reads as complete. The question that finds it is
  not "is this covered" but **"is this covered from more than one direction,
  and does the document know which direction it is standing in?"**

### Redesign proposal (not applied)

The declared focus has now been missed five runs running, and v1.4.0's fix
addresses the reader while leaving the writer untouched. A focus line is prose
at the bottom of a 220-line file; every run must notice it, interpret it, and
remember it through triage. **Consider making the focus a structured field the
triage table is checked against** — e.g. a `focus:` key the run echoes in its
Phase 5 table header, so that producing a table without the focus's required
column is visible at the moment the table is written rather than at Phase 11.
The current design asks a run to remember an instruction across the six phases
where it is most loaded; the cheap version asks it to copy one line.

## 1.3.1 - 2026-08-31 - remeda

- **The apply step refuted the technique it was testing, twice, in the same run — and this
  is the first time in this file it has run in that direction.** `mutating-local-gates` was
  drafted from the source claiming that *mutation* creates a turn-end gate's termination
  contract. Phase 7.5 found the seam in a managed project: a turn-end gate that neither
  mutates nor blocks, and still guards re-entry, because its advisory exit feeds the model,
  the model acts, and acting ends another turn. Draft 2 said *blocking* creates it; the same
  file refuted that in its own header (*"Nothing here ever blocks"*). Draft 3 carries a
  three-tier ladder — advisory / blocking / mutating — and names the advisory tier as the one
  most likely to ship unguarded precisely because it looks harmless. **The method treats
  Phase 7.5 as validation; this run says it is also a drafting instrument.** A technique
  written from one source is a hypothesis, and the seam is the first thing that has ever
  actually disagreed with it. Worth doing deliberately: draft, then apply, then re-draft
  before the commit — which is the order this run stumbled into rather than chose.

- **A source-class tell worth adding to the Phase 2b sweep: the `.agents/` tree.** A
  repository that carries agent-facing instructions, path-scoped rule files and turn-end
  hooks is giving a first-party practitioner account of *agent operation*, regardless of what
  the repository is for. This source is a utility library; nothing that landed touches utility
  libraries. The `.agents/` + `.claude/` surface outproduced every other part of the tree
  combined, and it is not in the sweep order — which currently names operating documents, the
  instrument, the measurement, types, tests, README. It belongs at position 1, and its
  distinguishing property is that its comments record failures the maintainer *paid for*
  rather than decisions they are advertising.

- **Rank our own enumerations — third consecutive sighting, and this time the corpus's
  enumeration was ranked in the wrong order rather than merely flat.** `suppression-hygiene`
  offers "an expiry date, a re-review cadence, or the checkable condition" as interchangeable.
  The source rejects the first outright with a mechanism the corpus had not considered: a date
  fires on a schedule nobody chose, at whoever runs the instrument that day, working exactly as
  designed and arriving at the wrong person — so the cheapest available repair is to postpone
  it, and a reaper whose most probable outcome is its own postponement is decorative. The wave-3
  lesson said rank our enumerations; the sharper form is **check whether the order we implied is
  backwards**, because a flat list read left-to-right teaches the first item as the default.

- **Contention became the dominant filter on yield for the first time.** Four of twelve
  candidates routed into subjects a single sibling held, including a finding (inverted release
  severity by blast radius) the corpus has no owner for at all. The board did its job and the
  run routed around it correctly — but the cost is real and invisible in any single note. If
  parallel intake keeps concentrating on the same central bundles, the ledger will accumulate
  untriaged rows whose only defect was arrival time. Worth watching across runs rather than
  fixing now; the untriaged table with anchors is the mitigation and it held.

### Redesign proposal (not applied)

- **Phase 7.5 should run before the technique is committed, not after it is written.** The
  method's order is Phase 7 land → Phase 7.5 apply, and this run had to edit a landed technique
  twice because the seam disagreed with it. Nothing was harmed — the commit happens later — but
  the method's prose reads as though landing settles the content and applying merely scores it.
  It does not. Proposal: rename the boundary so Phase 7 is *draft and place*, Phase 7.5 is
  *apply, and re-draft from what the seam showed*, and the commit in Phase 10 is the first
  moment the content is fixed. This is a wording change to an order the skill already
  implicitly permits, which is why it is a proposal rather than an edit — a sibling is at 1.4.0
  in the same afternoon and a second structural edit today should be reviewed, not stacked.

## 1.4.0 - 2026-08-31 - youtube:3IyKC5EtNkM (9 Ways to do Inheritance in Rust)

- **The seam hunt is a better ship mechanism than the operator naming a project,
  and this is the first run in five to ship because of it.** `ship` has been 0
  for four consecutive runs, and every post-mortem located the cause upstream -
  the operator's triage pick did not name a project, so Phase 8's confirmation
  gate never opened. This source names no project and could not have: it is a
  language talk. What produced Ship 1 was grepping the fleet in Phase 7.5 for
  **the technique's own shape** rather than for the source's subject matter -
  implicit delegation, and a read function parameterized by the caller's type.
  Both returned real seams in the first project searched. The generalisation:
  *a technique describes a code pattern, and a code pattern is greppable across
  seven trees in about a minute.* Phase 7.5 step 1 already says to grep for "the
  decision the technique governs"; what this run adds is that the grep should be
  written from the technique's **mechanism**, which is concrete, rather than from
  its **subject**, which is abstract and matches nothing.

- **Two picked rows can verify into one root, and merging them is the higher
  landing even though it makes the scorecard look worse.** The operator picked
  rows 5 and 7 as separate candidates. Verification found they are one idea seen
  twice - an interface authored upstream, once via delegation and once via a
  borrowed taxonomy - and the technique that names the root is stronger than
  either would have been beside the other. The altitude rule in Phase 5 covers
  the *cross-run* case ("when this run's finding and two prior runs' findings
  share a root, the landing is the root") and is silent on the within-run case,
  which is more common and easier to miss because the two rows arrive in the same
  table with different numbers. **Say in the note that N picks became M landings
  and why**, or the source note reads as two dropped candidates.

- **Distinguish an instrument that failed from an arm that failed.** The first
  attempt at the `borrowed-surface` A/B ran the project's own compiler over the
  probe and came back exit 0 - which looked like arm A passing and was actually
  the build script dying before the compiler reached any of the code. Ten minutes
  spent, and the result was worth nothing in either direction. A green or red
  gate is only evidence if the gate *ran the thing being tested*; the check is to
  confirm the instrument reached your code before reading its verdict. When it
  cannot, the honest move is to drop to a faithful reduction and record the mode
  as `experiment` rather than `code` - and, for a change to security-adjacent
  code, to leave it uncommitted, because `unproven` does not commit.

- **A source that numbers its own completeness is pre-marked for the enumeration
  hunt, and the refutation is usually in its Q&A.** This talk is "9 ways"; two
  audience members named a tenth and an eleventh, and the speaker had used
  neither. That is the enumeration hunt (Phase 6 step 3) being run *by the source
  on itself*, for free, and it is worth reading a talk's question period before
  its content for exactly that reason. Filed as a lead with a return condition
  rather than as a class rule - one sighting.

### Redesign proposal (not applied)

**The apply-row obligation mis-counts when two landings share a root.** The
method says a run that lands N techniques/amendments owes N rows in
`librarian/applied.md`. This run landed three things and paid two rows, honestly:
the `seams-and-adapters` fourth signal *is* `borrowed-surface`'s second form
stated from the neighbouring subject's side, so it shares not only the root but
the seam and the arms - testing it separately would have meant running the same
A/B twice and reporting it as two results. The current rule makes that
double-count the compliant answer and the honest answer look like a shortfall.
Consider making the obligation **one row per distinct A/B**, with landings listed
in the row, so a run that correctly refuses to re-run an experiment is not
scored as owing.

## 1.3.1 - 2026-08-31 - voltagent wave-3 leads, landing pass

The pass that closed the gap the previous entry named. Fifteen banked amendments
landed across ten files, and the two that found a seam produced the run's cleanest
measurement.

- **A banked lead is worth landing the same day, and the reason is mechanical rather
  than motivational.** The previous entry recorded that candidates were outrunning
  landings roughly two to one and called that the wiki anti-pattern in a new form.
  Clearing it cost far less than the mining did, because every anchor had already been
  verified in-tree and every home already checked on the board. The expensive half of a
  landing is the argument, and the argument was already paid for. **Land within the
  session that argued it, or pay to rebuild the context** - the same rule Phase 7 states
  for an XL spec, and it generalizes to any banked finding.
- **`git status` beat the board again, and this time in the other direction.** The board
  said all four subject roots were clear; a sibling named for the very subject about to
  be written in was live and had claimed nothing yet. Claiming ten files immediately, at
  file granularity, is what made the pass safe - the neighbour then arrived to a board
  that already said who was inside. **Claim before reading, not before writing**: the
  window between deciding a target and editing it is where a collision is cheapest to
  prevent and invisible to prevent later.
- **A structural fact beats an argument, and the tree keeps supplying them.** Two arms on
  one population: referential integrity passes 74 of 74; the read-back passes 14 and
  fails 60. The amendment predicted the gap between those checks and the tree measured
  it, on a schema that had carried a `verified_at` column the whole time with zero rows
  ever set. That column is the strongest evidence in the pass - it is a design-time
  admission that the check was known to be owed.
- **Report what a crude instrument can and cannot separate.** The 60 failures collapse
  paraphrase-rather-than-reproduction with drift-since-recording, and a substring match
  cannot tell them apart. Naming that honestly produced a better finding than pretending
  to: **the read-back is a write-time instrument**, because the two populations are
  distinguishable at write and merged forever after. A measurement's blind spot is often
  the technique's real content.
- **Apply 0 twice running was a false alarm about the fleet and a true one about the
  method.** This pass found two seams in a store three earlier passes had walked past,
  by asking what tables the project *has* rather than what code implements the decision.
  The earlier runs looked for a seam in code; the seam was in data. **For a
  data-discipline technique, grep the schema before grepping the source** - a store that
  carries a column for a check nobody runs is a paired A/B already set up. The thirteen
  that stayed unapplied still stand as a real gap, and the `re-analysis` redesign
  proposal is unchanged.
- **Fifteen amendments across ten files in one commit is at the edge of reviewable, and
  the batching that made it safe was by FILE, not by finding.** Three scripted batches,
  gate run between each, so a broken anchor could only ever cost one batch. Anchors were
  taken from a prior read in the same session; two needed a list renumber, which is the
  kind of edit that fails silently and was worth the explicit check.

## 1.4.0 - 2026-08-31 - rq-beyond-basics

- **A repository's operating document can be its branch list, and no file-tree
  sweep can see it.** This source scored thin on every heuristic the method
  has: 158-word README, 13 source files, one markdown file. It was not thin —
  seven feature branches carry the content, and the diffs between them are a
  maintainer's ordered curriculum, each step motivated by a failure the README
  only names. Phase 2b's sweep order (operating documents, instrument,
  measurement, types, tests, README last) has no row that finds this, because
  the artifact is in the refs rather than in the tree, and a `--depth 1` clone
  hides it by construction. The instrument is one command —
  `git ls-remote --heads` — and it costs nothing. **One observation, so it stays
  a lesson**; if a second run meets a workshop, tutorial or conference-talk repo
  and finds the same shape, this is a Phase 2b line.

- **The most valuable diff in a curriculum is the one that replaces working code
  with different working code.** Steps 4 and 7 of this source produce the same
  visual affordance by two mechanisms at two layers — a predicate over the
  previous payload, then a deferred input — and the whole landed technique came
  from the gap between them. A step that *adds* a feature teaches what the tool
  does; a step that *rewrites* an earlier step is the only place a curriculum
  puts two designs for one problem side by side with the author's preference
  recorded as the ordering. When a source is a sequence, diff non-adjacent
  steps, not only consecutive ones.

- **The corpus saying something twice is a signal to check it, not to trust
  it.** Two subjects carried the same prescription in near-identical words, and
  the natural reading — independent convergence, therefore settled — was
  backwards here: the second document inherited the sentence from the first as
  a specialization, so the two are one observation with one author. The tiering
  rule this method already applies to external sources (a relay is downstream of
  its primary, so three relays are one observation) applies inside the corpus
  too, and nothing currently says so. Before treating internal repetition as
  corroboration, ask which document is upstream.

- **The apply instrument's self-assertion earned its cost on its first run**, one
  day after a sibling added the practice. It refused to print because
  `a: b || undefined` was yielding `undefined` as a key. Worth noting the shape:
  the bug was in the *parser*, not the predicate, and it would have inflated the
  census with a plausible-looking field name rather than producing an obvious
  error. Two of two recent runs that asserted their instrument caught something.

### Redesign proposal (not applied this run)

- **Phase 7.5 step 1 treats seam reachability as given, and it is not.** This run
  wrote, debugged and hand-verified a census before discovering that the
  coordinates it measures are unreachable from any shipped control — which caps
  the verdict at `unmeasurable` regardless of the technique's quality. A seam is
  `file:line` where a decision is made; a decision no user can trigger cannot be
  graded by an experiment. The proposal is a reachability check *before* mode
  selection: prove a shipped control, route or entry point drives the governed
  input, and if it does not, choose `simulation` over the code's history rather
  than `experiment` over its present. Not applied because it is one run's
  experience and changes a mandatory phase; the scorecard's next focus tests it
  cheaply first.


## 1.4.0 - 2026-08-31 - future-agi

- **The ship valve has a third position the scorecard does not model: indeterminacy.**
  The previous row's focus offers confirmation and size. This run was authorized and the
  change was two lines, and it still correctly shipped nothing behavioural, because the
  audit's finding sat in a code path with no production caller where the right increment
  semantics is an open question. Written up in the scorecard addendum, with the
  generalization: **change-shaped vs check-shaped techniques**. A check-shaped technique
  applies by running against a tree and produces a finding, not a diff, so it reads
  ship=0 under the current definition no matter how well it was applied. Not folded into
  `SKILL.md` — it is one run's observation and the scorecard's next focus tests it
  cheaply first.

- **Amending a technique that landed the same day is a good outcome, not a collision.**
  `probe-without-write-back` was created hours earlier by a sibling intake run from a
  different source. This run read it as prior art, found a source that contradicts one of
  its closing claims, and amended it. Nothing in the method anticipates this case and it
  is worth naming: the board makes it *safe* (the sibling was at phase 11 and held other
  subjects), but what makes it *valuable* is that a fresh technique has an author's
  argument still legible in it, so the counterexample lands against a stated position
  instead of against inferred intent. When `research-map` returns a technique dated
  today, read it harder rather than treating it as settled.

- **Phase 4's "map on concepts, never proper nouns" rule paid immediately.** The source's
  vocabulary is entirely product and framework names; a map built from them would have
  returned the empty result the 2026-08-31 correction warns about. Mapping on
  `memory eviction policy`, `usage tracking`, `context compaction` and `soft delete`
  reached the corpus's most mature subject on the first call. No change proposed; this is
  the rule working, recorded so the next run trusts it.

- **A `not-better`-shaped honesty case worth keeping: `unmeasurable` because the fleet
  already agrees with you.** The second amendment found no seam in any managed project —
  and the reason was that two independent trees had already implemented the branch it
  recommends, by two different mechanisms. That is corroboration for the default *and*
  the reason it is untestable, and the two facts are the same fact. The method's
  `unmeasurable` row wants an instrument named; it should probably also distinguish
  "no seam because nobody built this yet" from "no seam because everybody already got it
  right", which are opposite signals about the technique's value.

## 1.4.0 - 2026-08-31 - tigerbeetle-blog (wave 3)

- **The v1.4.0 Phase 1 read worked on its first run, and the evidence is specific.**
  Reading the declared focus before Phase 5 changed the triage table (every row carried
  a project and a file), which changed the operator's pick (a tree was authorized in the
  same keystroke), which changed the apply lane (straight to a code arm rather than
  rediscovering the permission question at Phase 8). Four prior runs each prescribed a
  fix the next run's shape made inapplicable; this is the first one that fired. Keep the
  step.

- **The ship blocker is a trichotomy, not a binary.** The standing focus asked runs to
  name whether a `better` row was blocked by *size* or *confirmation*. This run was
  blocked by neither: the change was ~40 lines and the tree was authorized. It was
  blocked by a **running application holding the binary the build had to relink** - an
  *environment* cause. The correct response differs from both others: do not commit code
  you could not build, and do not resolve it unilaterally, because killing an operator's
  running process is their call. State in one line what would unblock it. Applied to the
  scorecard's focus; not yet a `SKILL.md` edit, since one run is one sighting.

- **A control that fails is worth more than the arm it was controlling for.** Arm B
  existed only to show that a serialized structure obviously round-trips, so that the
  interesting comparison would be clean. It came back **38/50 lossy**, which turned a
  confirmation into a real amendment to the technique being applied. The general lesson:
  **include the control even when the answer is obvious, and read it.** A technique's
  unstated preconditions live exactly where nobody expects a measurement, which is why
  they stayed unstated.

- **Verify a surprising measurement against a second instrument before writing it down.**
  The lossy round-trip could have been my harness. It was separated by bit-level
  comparison against the language's own standard parser, which handled the identical
  string correctly - locating the loss in one library's default decoder rather than in
  the format, the text or the writer, and then finding that library's documented opt-in
  which restored 50/50. Writing "JSON loses float precision" would have been wrong,
  lazy and repeated forever. The rule: **a finding that indicts a widely-used dependency
  needs a second instrument before it reaches the corpus.**

- **Prefer an apply target the corpus has already made a prediction about.** The repair
  tested here was one a *prior* application in this same subject had recommended in
  writing, for unrelated reasons. That made the measurement much stronger than a fresh
  target would have: the technique predicted that this specific edit would invalidate
  recorded seeds, and the edit was already on the record as advisable. When choosing a
  seam, check whether an earlier application already prescribed a change there; testing
  a prediction the corpus made beats testing one you chose today.

- **A copy of a generator is a legitimate arm when the claim is about the generator's
  draw sequence.** The project binary was locked, so the strategies were reproduced
  faithfully - same draw order, ranges and pinned fields - rather than linked. That is
  sound for a claim about seed-to-draw-sequence mapping and unsound for a claim about
  the system's behaviour, and the application says which it is. Name the substitution and
  scope the claim to it, rather than abandoning the measurement or overclaiming it.

- **Three landings absorbed by a subject with no home argument is how you learn a
  boundary was right.** Wave 2 created `test-input-generation` on an argued boundary;
  wave 3's three findings landed inside it without any placement debate. That is a
  cheaper and better signal than any amount of reasoning at creation time, and it is
  worth stating in the subject note when it happens.

- **Ranking corrections belong in the note, aimed at the run that did the ranking.**
  Wave 3 read a post wave 2 had banded **B** expecting a documentation taxonomy; the
  taxonomy lives in that organisation's *repository*, already banked by a third run, not
  in the post. **A blog post and a repository document can share a topic and not share
  the content**, and the ledger's own bank is the better predictor of which holds the
  material. Wave 2's ranking used the title.


## 1.4.0 - 2026-08-31 - arxiv-2606-10106-agent-harness-definition

- **Mine a paper's "future work" against the corpus before mining its contribution.** A
  paper's stated open problems are a free, high-precision list of things an author who
  just surveyed the field believes nobody has solved, and checking that list is one grep
  each. It resolves two ways and both are worth more than the paper's positive claims. If
  the corpus holds the answer, that is the strongest already-covered signal available -
  stronger than any slug match, because the author *looked* and reported an absence. If it
  does not, the gap is a lead vouched for by a survey rather than by our own map. This run
  is the clean case: the paper closes on "an evaluation that isolates the harness's
  contribution, controlling for the model, is missing" and leaves it as future work; it is
  `eval-harness/unaided-baseline-screening`, shipped, with an operational trigger. Same
  shape one level up - the paper *admits* its validation was near-tautological (six systems
  chosen for already being harnesses, all passing), which is `quality-gates/gate-liveness`
  as a practice. **The section a paper is least proud of is the one to read first**, which
  is the paper-class analogue of the demo rule already in the method: the segment a source
  is proudest of is where its boundary is missing.

- **`paper` has a definitional subclass, and its expected yield is near zero.** The class
  entry already says a paper is authoritative for *its measurement, in its protocol* and
  weak for its framework. This source is the limiting case - a conceptual analysis with no
  measurement anywhere in it, over a corpus of grey literature, which by the tiering rule
  is commentary about primaries rather than a primary. The tell is cheap and available from
  the abstract: **it proposes a definition, a taxonomy or a vocabulary, and its validation
  is that the definition classifies known cases consistently.** That validation is
  near-tautological by construction, and the honest expected yield is 1-2 leads and a pile
  of catches. Saying so before the triage table is what kept eight catches reading as
  calibration rather than as a failed run. Worth adding to `source-classes.md` as a
  sub-class of **paper** on a second sighting.

- **Third consecutive confirmation that a near-empty is a seam, and the first with a clean
  count: 3 of 3.** `verifier` (2 weak hits, both in other bundles), `guardrail` (1, in
  `recruiting`), `containment sandbox` (4 spurious) - every one of them was a concern living
  inside `hitl-approval`, `quality-gates` or `eval-harness` under a different name. Believing
  the three near-empties would have minted four duplicate techniques into a corpus that
  states each rule more sharply than the source does. The existing rule needs no edit; this
  is the sighting that should promote it from lesson to method text on the next one.

- **A run can land nothing and still owe the scorecard a distinction the scorecard cannot
  express.** `landed 0 because the corpus already owned every candidate` and `landed 0
  because the run failed to convert its picks` are opposite results and render identically
  in the five stage counts. Recorded under the table rather than as a method edit, because
  fixing it means changing the row format every parallel sibling is appending to - a change
  that needs a version bump and a fleet that is not mid-flight.

## 1.4.0 - 2026-08-31 - agent-loops-to-structured-graphs (arXiv 2604.11378)

- **A source that disclaims its own evidence is still worth mining, and the class rule
  predicts exactly what for.** This was a position paper that says twice that it has no
  results. By the class entry that makes it "the class's marketing" - and the yield came
  from the four things a framework paper carries that are *not* framework: a failure
  taxonomy, two proved propositions, a self-declared boundary table, and a survey. Saying
  the expected yield out loud before triage (1-2, amendment-shaped) made a 1-landing run
  read as calibration rather than as a thin result. The class rule works; the mistake
  would have been to skip the source because its headline claim authorises nothing.
- **The enumeration hunt found the landing, and the enumeration was in the technique's
  own honest-split section.** `graph-validation` explicitly divides defects into
  provable-at-the-door and named-run-time-check, and names the space between them as what
  "must never exist". That is a completeness claim about a *partition*, and the question
  it invites is not "is the middle handled" but "is the partition exhaustive". It was not:
  a defect that never causes a failure is in neither half. **A partition stated as a
  virtue is a stronger hunting ground than a list**, because the author has committed to
  covering the space rather than to covering N items.
- **A subject's standing assumption can hide in its boundary prose for months.** Every
  document in `pipeline-dag` is written for a graph *the user authored* - the golden path
  says "the user drew fifty edges", the technique opens "a document the user authored" -
  and that assumption is load-bearing for the finding: the defect class is nearly harmless
  for an authored graph and becomes a rate under a planner. The boundary statement that
  makes a subject well-scoped is also the place its untested premise lives. Worth reading
  boundary prose as a *claim* rather than as scope.
- **The apply step produced the technique's best rule, not just its verdict.** The inert
  edge - an edge that cannot fail still counting in a ratio's denominator, silently capping
  the scale - was not in the source. It came out of running the A/B and asking why exactly
  five nodes differed. The method already says a contradicted source is the best case; this
  is the adjacent case: **an apply step against real code can return a rule the source never
  had**, and the technique should be edited from the apply's return before it is committed,
  not treated as finished at Phase 7.
- **Purity greps must include the *project's* vocabulary, not only the source's.** The
  grep caught "wound" - the consumer tree's internal word for a cascade failure - sitting
  in the new technique's `use_when`, where it had arrived by osmosis during the seam
  reading. The method's Phase 7 review names the source's vocabulary as the grep target
  ("a game-design source is made of game titles"); in a run that also opens a tree, the
  tree's nouns are the likelier leak, because they are the ones being read at the moment
  of drafting. Grep both.
- **The index lock does not give you a private tree, and this run hit the case the method
  warns about.** Regenerating produced an `index.json` referencing four siblings'
  uncommitted techniques eight times. Committing it would have baked their WIP into a hash
  under this run's name. Content committed, `index.json` and `catalog.json` left dirty -
  and the counts in the regeneration output (`1064 -> 1069` techniques for one added
  document) are the cheap tell that this is happening, visible before any grep.

## 1.4.0 - 2026-08-31 - agent-harness-design-decisions

- **A paper source has a landing page too, and `research-ingest` exits 0 on it.** The
  `/abs/` URL for an arXiv paper returns the abstract plus site chrome - 661 words here,
  against 16,055 in the `/html/<id>v1` full text, a 24x gap. Exit code 0, no thin-source
  warning, nothing to distinguish it from a successful ingest of a genuinely short source.
  This is Phase 2b's README rule in a class that has no clone step, and the run-level trap is
  sharper than for a repository: a README at least advertises a tree, whereas an abstract IS
  the paper's own summary of itself, so triaging off it produces candidates that read as
  perfectly reasonable findings. `source-classes.md` already says the per-paper budget is
  "abstract, then full text"; what neither file says is that **the ingest of an abstract URL
  is indistinguishable from success**. The tell is the same one Phase 2b uses - a `words:`
  under ~2,000 on a source described as a 35-page paper with 13 tables - and the fix is a URL
  rewrite, not a fetch decision. Recorded rather than applied: the rule generalizes past
  arXiv (a journal DOI landing page, a conference abstract page) and the right edit is a line
  in the paper class entry, which is worth doing with the next paper source rather than from
  one sighting.

- **The declared focus worked as a mechanism, and the row it produced rules blockers out
  rather than merely naming one.** Phase 1 step 5 cost one file read and changed the shape of
  the scorecard row: the apply reached `better`, and the row names `confirmation` *and*
  says why it is not `size`, not `indeterminacy` and not `environment`. Naming the class is
  cheap; excluding the other three is what makes the zero readable six weeks later, and it
  took about two sentences. Worth carrying into the next row's expectations.

- **The re-read-inside-the-ledger-lock rule paid visibly, with a measurable number.** The
  scorecard's last data row was at line 144 when I read the file at Phase 1 and at line 176
  when the lock opened - 32 lines of sibling appends in between, across three ledgers. An
  append computed from the Phase 1 read would have silently destroyed them. This is the first
  entry in this file able to quantify the gap rather than assert the risk, and 4 live siblings
  is a modest fleet by current standards.

- **The apply step falsified my own prediction for the fourth time in six runs, and the
  falsification was the useful half.** I expected a `Math.min(x, 100)` clamp to be the defect;
  it fires in 9 of 101 flagged states and never in the shipped configuration. The defect was
  the denominator and the clamp was only its fingerprint - a distinction that matters because
  removing the clamp changes nothing and *looks* like a fix. The generalizable form: **a
  defensive coercion is evidence that an impossible state is reachable, not the reason it is
  reachable.** Worth watching for a second sighting before it becomes method text; it is close
  to the corpus's own "defaulting to zero at a read site is the most common laundering point"
  and may belong there rather than here.

## 1.4.0 - 2026-08-31 - tkdodo-vertical-codebase

- **An enumeration is one-sided until you check its polarity.** The enumeration hunt has now
  produced the run's best finding three times in five runs, but this run sharpens what to ask
  of one. The golden path listed nine failure modes; the useful question was not "what tenth
  item is missing" — that invites invention — but **"do all nine fail in the same direction?"**
  They did: every one was structure being too weak, misplaced or decorative, and none was
  structure being too *effective*. A list whose every entry shares a polarity is missing the
  opposite pole, and that is a mechanical check over an enumeration rather than a creative act.
  Same shape as the 2026-08-27 lesson that a denial ("these are not mirror images") can deny
  too much, and cheaper to run.

- **When an apply instrument matches on a NAME, its top-ranked hits are the ones most likely
  to be false — hand-check those first, for exactly that reason.** Arm B here ranked six
  `validate_*` functions and `is_private_ip` at the top, and every one was a private adapter
  forwarding to the public implementation, which is the healthy single-door pattern. The
  reason is structural and generalizes past this instrument: **a well-built codebase
  deliberately reuses the name at the boundary it delegates across.** So name-collision
  ranking is positively correlated with the healthy pattern, and an instrument that reports
  its rank-1 hits as findings will confidently report good practice as a defect. The fix was
  not more care — it was a second predicate (a body that calls a function of its own name is
  forwarding, not reimplementing), which moved 15 of 67 out. **The refutation was worth more
  than the original measurement**, and this is the fourth run to say a source or instrument
  that gets something wrong hands you the boundary.

- **The blocker classes attach to cases, not to rows.** The focus asked for one class per
  `better` row. This row honestly needed two — `confirmation` for the row, `indeterminacy`
  for one of two cases inside it — and collapsing them would have discarded the half that
  names the question the operator has to answer.

### Redesign proposal - ask for the tree at Phase 5, not at Phase 8

`confirmation` is the most frequent ship blocker across the last ten rows, and it is a defect
in this method's own prompt rather than a fact about operators. Phase 5 has the operator
present and asks one question: which candidates to land. By then Phase 4 has named each
finding's domain, and `loadFleet()` can list the projects declaring it — so the run already
knows which trees a `better` verdict would implicate, and asks about none of them. It then
spends its full budget, reaches a verdict warranting a change, and discovers at Phase 8 that
it lacks an authorization that was free to obtain an hour earlier.

The proposal is one added clause in the Phase 5 question: alongside "which should I verify and
land", ask **"and may I edit `<project>` if the test comes back better?"**, naming the
specific projects Phase 4's domains implicate. It costs the operator one word, it is asked
while they are already in the chair, and it converts a class of zero that the last two runs
correctly reclassified as "not a failure" into an actual ship attempt.

Not applied here, and deliberately. Seven sessions were live on the board at Phase 11, all
reading `SKILL.md` from the version they loaded at their own Phase 0, and a Phase 5 prompt
change is precisely the edit a mid-flight run cannot absorb. It also wants the operator's
judgment: pre-authorizing a tree before the verdict exists is a different consent than
approving a diff, and that trade is theirs to make, not this run's. **A mid-flight run that
reads this should do nothing about it and finish on the version it loaded.**

## 1.4.0 - 2026-08-31 - github:TkDodo/knip

- **The apply step refuted the technique the same run had just landed, and this
  is the first time that has happened.** `excess-indicts-the-instrument`
  predicted that finding-distribution separates misconfiguration from debt; the
  A/B fired on 7 clusters and was right about misconfiguration 0 times. The
  method already says a contradicted *source* is the best case; it does not say
  what to do when the contradicted claim is **the run's own draft**. What worked:
  the technique was corrected *before* the commit, so the corpus never carried
  the wrong version, and the refutation became a named section rather than an
  erratum. Generalises as: **Phase 7.5 is not a validation step after the writing
  is done - it is the last review of the draft**, and a run that writes the
  technique file only after the A/B returns would produce the same document with
  less rework. Worth considering as an ordering change if a second run hits this.

- **A one-directional vocabulary is a findable gap, and grep finds it.** Both
  landings came from the same move: pick the subject's core concept, grep the
  bundle for its *opposite*, and count. "false negative" -> 6 hits bundle-wide,
  0 in the three checker techniques. Every instrument-failure signal in
  `gate-liveness` -> all deficiency, none excess. This is cheaper than the
  enumeration hunt and the missing-stage hunt, it runs before any file is opened,
  and it produced two techniques in one run. Candidate for Phase 6 as a fourth
  named hunt: **count the corpus's coverage of a concept and of its inverse; a
  large asymmetry is the finding.**

- **The board and the working tree disagreed, and the tree was right.** The board
  reported 0 live siblings while `git status` showed four files of uncommitted
  sibling work across three subjects. The board only sees runs that claimed and
  have not released; sessions that ended without releasing, or never claimed, are
  invisible to it and completely visible to `git status --short`. Phase 10
  already pairs the two - the lesson is that Phase 1 should too, because the
  disagreement changes the regeneration decision at Phase 7, not at Phase 10.

- **A `better` verdict on a measured zero is a real `better`.** The second
  apply found no defect: 11 of 11 constructs detected. It is still `better`,
  because the technique converted a property the project could not measure into a
  measured negative in ten minutes. The vocabulary handles this correctly, but it
  reads as a null result at a glance, and the ledger row has to argue it. Worth
  saying once in the method: **the verdict grades the technique, not the tree.**

- **Repository classes keep paying for the clone, and the ratio keeps growing.**
  380 words on the landing page, 32,535 in the tree. Neither landing touched the
  README. Nothing new, just another data point for a rule that is already carried.


## 1.4.0 - 2026-08-31 - github:TkDodo/pacer

- **A forward pointer that resolves is not the same as a claim that is owned.**
  The denial hunt is written as "where a subject explicitly denies a symmetry,
  check whether it denied too much", and this run found a variant one step to the
  side: the denial was correct, the exception it named was real, and the file it
  forwarded to genuinely carried that exception - as one of three items on a
  menu. Everything resolved. What nothing owned was the *precondition* that makes
  the named policy reachable at all. **Following a cross-reference and finding the
  concept present is where the check usually stops; the question worth asking
  after it is whether the destination states the policy or merely offers it.**

- **The word-count field lies on a generated-docs repository, and the lie is
  flattering.** This tree's `docs/` is 116k words, of which 87k are generated API
  reference across 267 files and 29k are authored guides across 21. Reporting
  116k would have made the sweep look four times deeper than it was and would have
  put the run's densest material in a 20% minority of its own count. The method's
  repo rule says record honest counts on both sides of the landing page; it does
  not say to **separate generated from authored inside the tree**, and on any repo
  with a docs generator that is the split that matters. Cheap tell: a `reference/`
  or `api/` subtree whose file count is an order of magnitude above the rest.

- **A slice is only honest if it compiles on both sides of every boundary it
  crosses.** The ship valve's `size` position says to ship the smallest honest
  slice. This run had a tested, green, four-line-ish engine change and a caller
  change in a second crate that could not be built for pre-existing environment
  reasons. Shipping the tested half alone was available and would have been wrong:
  it changes a type the other crate consumes, so it converts a build failure the
  operator already has into a build failure the operator has *and* did not cause.
  **`size` and `environment` can co-occur, and when the seam crosses a compilation
  boundary the smallest honest slice is the whole change.** Recorded against the
  valve table rather than as a new position.

- **The evidence overlay recorded a defect as a design.** This subject's
  consumer-side overlay described the project as "bounded depth with refuse-newest
  shed" - accurate as a description of behaviour and wrong as a description of
  intent, because refuse-newest was inherited from the check order rather than
  selected. Overlays are generated from the consuming repo's own frontmatter, so
  they inherit that repo's belief about itself. **An overlay line is evidence that
  something is true of the tree, never evidence that anyone chose it** - which is
  exactly the distinction this run's finding turned on, and it is worth knowing
  that the overlay cannot carry it.

- **Untested-intersection is a reusable hunt, and it is cheap.** Two well-tested
  features whose *combination* is the actual policy: 8 priority tests and 7
  capacity tests in the source, 34 tests in the project, and zero on either side
  constructing both. It costs two greps once a candidate has a home, it produces a
  concrete missing test case rather than an opinion, and it found the same hole
  twice in two unrelated codebases in one run. Sits beside the missing-stage, the
  enumeration and the asymmetry hunts in Phase 6; not promoted to the method yet -
  **one sighting**.

## 1.4.0 - 2026-08-31 - tkdodo-creating-query-abstractions

- **A ship blocker is a queue, not a value.** v1.4.0's focus - name the blocker
  from {size, confirmation, indeterminacy, environment} and act per class - worked
  and is incomplete. This row hit `confirmation` (the triage pick named a knowledge
  row, not a project), and then, once the operator authorized the tree, hit `size`:
  making the change compile required narrowing two *pre-existing* pass-through
  option bags, which is past the slice that had just been authorized. The second
  blocker was **unknowable before the first cleared** - nobody can see that a
  change exceeds a slice until the slice exists. The four-class table is written as
  if a row has one blocker; the correct shape is name the one in front, clear it,
  re-ask. A run that names one blocker and stops has answered only what it could
  see from where it stood. **One sighting** - not promoted to the method.

- **A census's first number is never the measurement, and the gap between its
  first and its hand-verified number is the reportable quantity.** This
  instrument said 13 divergent keys, then 3 after the parse window was cut at the
  next key, then **1 real** after opening the files - and the most serious defect
  in the tree appeared in none of those numbers, because its declarations live in
  a declarative array that no enclosing-call resolver can parse. Three of four
  rows were wrong, in *both* directions: one over-counted from textual fetcher
  comparison (two spellings of one call), one under-counted, one was a
  normalization artifact. The corrective is not a better parser. It is to **report
  two figures and a blind spot** - what the instrument said, what survived hand
  verification, and what shape it structurally cannot see - and to put that in the
  application's own limitations section, where a reader deciding whether to copy
  the method will actually meet it. Sits beside the existing self-assertion rule:
  asserting the instrument proves it can see the shape, and says nothing about
  whether what it saw is real. **One sighting.**

- **Cross-run convergence arrived through the subject note and would have been
  missed without it.** The most serious finding in the applied tree - one key,
  two different API clients - was already banked as an open lead by a different
  intake run against the same subject, reached from the other side while
  verifying a *lifetime* census. Neither run's instrument can see it; both found
  it by hand. Reading the subject note before writing the application turned a
  claimed discovery into a **second sighting**, which is a materially different
  and stronger claim. Phase 9 tells you to write the subject note; this run is
  evidence for *reading* it at Phase 6, beside the source ledger.

- **Mid-flight runs on 1.4.0: nothing to do.** No method file changed this run;
  both lessons above are one-sighting and stay lessons.
## 1.4.0 - 2026-08-31 - pgsql-hackers-2026-08

- **`research-ingest` truncates a paginated source silently, and reports the
  truncated length as the source's length.** The archive offered 31 days; the
  ingest returned 4 and wrote `words: 2480` with nothing in its metadata saying
  "page 1 of 20". A run that trusts it mines 7.5% of the source and reports the
  result as the source's yield - the precise failure Phase 2c was written to end,
  arriving through the instrument rather than through the reader's laziness. The
  landing page carried `Next` links and a day index, so the truncation was
  cheaply detectable and only if somebody looked. **Check for pagination affordances
  whenever a source is an archive, an index or a listing, before ranking anything.**
  **One sighting**, but the mechanism is general to every listing-shaped source.

- **The reference-index lane assumes a CURATOR, and three common source shapes
  have none.** The lane's "one finding of its own" is what the curator chose to
  include and leave out - a bibliography as a stated opinion about a field's
  boundary. A mailing list archive, an issue tracker and a commit log all invert
  the link-to-word ratio exactly as the lane's tell predicts, and none of them was
  curated by anyone. Reaching for the curator finding there **invents an opinion
  nobody held**. What an uncurated index offers instead is a *distribution* - a
  fact about where attention went, not about anyone's judgement - and that is a
  weaker and differently-shaped artifact. Proposed as one line in
  `references/source-classes.md` under the reference-index entry. **One sighting.**

### Redesign proposal (not applied)

- **The ship-blocker table is missing a position, and measurement techniques will
  hit it every time.** The four positions are `confirmation`, `size`,
  `indeterminacy`, `environment` - all of which presume the shippable object is
  known and only its authorization, scope, semantics or build is in question. A
  technique that is a *measurement* has no product change to ship at all: what
  would ship is the harness, and this run's harness was the very thing its own
  A/B proved unreliable in its most attention-grabbing column. Call the fifth
  position **artifact-choice** - the row is authorized and the change is small,
  but which object the landing *is* remains open (project script, registry
  `scripts/`, or nothing). Not applied because it is one sighting and the table
  is load-bearing for three other skills; a second measurement-shaped landing
  that stalls the same way should promote it.

- **Mid-flight runs on 1.4.0: nothing to do.** No method file changed this run;
  all three entries above are one-sighting and stay lessons.

## 1.4.0 - 2026-08-31 - agentic-coding-trends-report

- **A broken reader that returns binary is confidently LARGE, and no floor catches it.**
  `research-ingest` reported 13,029 words at exit 0 for a 3,418-word PDF: `res.text()`
  decoded the container as UTF-8, `htmlToText` found no tags and passed it through, and
  the counter counted FlateDecode streams as tokens. `--min-words` is structurally
  unable to see this, because binary always clears the floor. The generalisation is not
  "add PDF support" - it is that **an instrument must assert the SHAPE it found, not
  only the size**: pages, fonts, a plausible first screen. Landed as an assertion (no
  page content streams is exit 2, not exit 3) and as a Phase 2 instruction to look at
  the output before naming the class.
- **Font awareness is not a nicety for this corpus's sources.** A subsetted display face
  returns mojibake without its `/ToUnicode` CMap, and vendor documents put their
  headings, pull quotes and *numbers* in exactly those faces. A naive reader would have
  returned 1,626 of 3,418 words and lost the two passages both landings came from,
  while reporting a healthy count. The second assertion (non-text ratio) exists for that
  case, where the count is real and the words are not.
- **New class: the vendor prediction report.** Routes like an announcement but is worse
  in one specific way - **future tense is unstrippable by construction**, so the strip
  test does not filter the predictions, it annihilates them, and every forecast resolves
  to `none`. Both landings came from the two places the document cited measurement or
  reported observed behaviour; none came from any of the eight numbered trends. Added to
  the reference with its own yield prediction.
- **A subject that has survived two enumeration extensions is not finished.**
  `hitl-approval` had already been extended twice at its "two mirror-image flows"
  enumeration. This run's finding came from a *different* list in the same subject - the
  gate-fatigue countermeasures - where every entry reduced volume and none reached the
  reviewer who reads carefully and still cannot check. When hunting enumerations, walk
  every list in the file, not the one the golden path opens with.
- **A source's wrong explanation is again the useful half.** The report frames its
  observation as a delegation *habit* engineers developed ("intuitions for AI
  delegation"). Taken as a habit it is a lead about people. Taken as a property of the
  work - can this output be checked at all - it is a missing axis in a gate map. The
  finding was written from the second reading, which the source does not make.

### Redesign proposal - not applied now

`ship` in the scorecard conflates **blocked** with **correctly declined**. This run's two
knowledge landings produced zero project commits, both times correctly (one
`structural-only`, one `not-better`), and they score identically to a run stopped by a
missing confirmation. Several runs have now read `ship 0` as the funnel's weakest stage
on that basis. The fix is a predicate on the zero - `ship 0 (declined: ...)` versus
`ship 0 (blocked: <class>)` - and then a re-reading of the last ten rows, which may name
a different weakest stage. Written as the next run's declared focus rather than applied
here, because changing the column's meaning mid-table needs the operator to see it
first.

**Mid-flight runs:** nothing to do. Finish on the version you loaded. 1.5.0 adds a
routing row, a Phase 2 sentence and two reference sections; it changes no phase order
and invalidates no work already done.

## 1.5.0 - 2026-08-31 - icse-2026-seip

- **A conference program is a reference index whose annotations were stripped, and the
  venue's admission rule is the substitute.** A curated bibliography ranks on the
  curator's sentence per row; a program page carries title, authors and affiliation and
  nothing else, so `reference-waves.md` step 3 loses the signal it weights highest. What
  replaces it is the track's own stated bar for acceptance — here, quoted on the page,
  that papers must "present evidence for the paper's conclusions." That is a *per-venue*
  annotation applied uniformly to every row, and it worked: **8 of 8 references read
  returned usable material**, a hit rate no title-ranked sample earns. Read the venue's
  admission rule at Phase 2 and say what it guarantees; where a track mandates
  measurement, the class's expected yield should be revised upward, not down.

- **Check the citation graph before a convergence premise ranks a wave.** This run's top
  band was built on two papers on one topic accepted independently into one track, called
  genuine convergence. The second cites the first as a numbered reference and relays every
  validity number it carries from four other papers — so under the tiering rule the pair is
  **one observation**, and the wave's single strongest ranking signal was fake.
  `reference-waves.md` step 2 already carries the rule that kills this ("a relay of a
  primary already in the set is not a reference"); it was being applied to *URLs* and not
  to *citations*, which is where the relationship actually lives for papers. The corrective
  is one line in step 2: for any two references proposed as convergent, check whether either
  cites the other before ranking them as independent — and for papers that check is usually
  free, because the citing paper's related-work section names it.
  The reassuring half: the *real* convergence arrived from two references admitted for
  unrelated reasons, which is the argument for breadth over a ranked top-N stated as
  cleanly as this lane will ever state it.

- **A wave of N workers is N writers to one directory.** Two lanes independently reported
  that sibling workers wrote generic filenames (`paper.html`, `paper.txt`) into the shared
  run scratchpad root, and one lane's conversion read a *different* lane's document before
  catching it by content check — it nearly extracted candidates from the wrong paper.
  Phase 9's "scratch is per run, never a blind sweep of the root" has a missing corollary:
  **scratch is per worker inside a run.** The worker brief should name a unique
  subdirectory (`<scratch>/<run-id>/<lane-key>/`) the way the run names one, and a worker
  that fetches to a shared name should verify content before extracting. Cheap, and the
  failure is silent — the file parses, it is just somebody else's source.

- **Extraction was parallelised; verification was not, and the funnel's loss moved one
  stage downstream.** Eight parallel readers returned ~30 candidates and the director
  verified 7, serially. That is the worst Extract→Test ratio in the last ten runs, and it
  is not a quality loss — it is a budget one. Worse, most of what the serial step actually
  did was *mechanical*: four of the verifications were "does this quoted sentence exist in
  this file", and one of those was botched on the first attempt by a stale working
  directory and had to be redone. Opening a file to confirm a quote is parallelisable;
  deciding what a confirmed quote means is not. The director's serial budget should be
  spent on judgment, and this run spent most of it on `grep`.

### Redesign proposal (not applied this run)

Split Phase 6 into a mechanical half and a judgment half, and parallelise only the first.
A wave that returns N candidates dispatches N *verification* lanes, each given one claim,
one file address from prior art, and the worker's quote, and each returning only: does the
quote exist verbatim, what does the surrounding section actually say, and what does the
file's own enumeration or boundary statement claim. They write nothing. The director then
does what only the director can — decide which confirmed gaps are worth landing, and in
what shape. This is the same single-writer discipline the wave already runs on, applied to
the stage that became the bottleneck once the stage above it was fixed. Not applied here
because it changes Phase 6's shape and wants its own version bump and a run to prove it.

**Mid-flight runs:** nothing to do. This entry proposes no phase change and bumps no
version; the citation-graph check and the per-worker scratch rule are both worth folding
into `references/reference-waves.md` when someone next edits it deliberately.

## 1.2.0 - 2026-08-31 - 3d-documentary-ai

- **A source that contradicts one of the corpus's own DENIALS, without noticing
  it has, is the cheapest high-altitude finding available - and confidence-ranked
  triage cannot see it.** Phase 6 already says to hunt enumerations and treats a
  denial as one. This run adds the retrieval side: the creator narrates the
  disqualifying case in nine seconds as a nice cinematic moment and moves on. He
  does not think it is interesting, states it with no emphasis, and never returns
  to it. Every signal a triage naturally ranks on - emphasis, dwell time, how
  confidently the source asserts it, whether the source frames it as a lesson -
  pointed at the eight candidates that turned out to be catches. The finding was
  reachable only by holding the corpus's denials in mind while reading, and asking
  of each segment "does anything here do the thing we say cannot be done?" That is
  a different read of the transcript than "what is this source claiming", and it
  should be a named pass, not a hope.
- **Check seam existence at Phase 5, not at Phase 7.5.** Both amendments landed
  this run govern calls that no fleet project makes - no generative-video request
  path, no composite subject+plate imaging call - and that was discovered after the
  verification budget was spent. It is a one-grep question at triage time. A row
  with no seam anywhere is still worth landing (both of these were), but it should
  be picked in the knowledge that it will produce a simulation, and the run should
  say so where it says the expected yield. This is the fourth consecutive
  source-driven run with zero `code` rows and the first to find the cause upstream
  of the seam: the corpus is being deepened where the fleet does not operate.
- **A sponsored tutorial's craft half is better than the class average, for a
  structural reason.** The sponsorship corrupts the tour half completely (no
  failures, no retakes, no reject counts in twelve minutes, and the proudest
  segment is where the boundary is missing) and leaves the operating half alone -
  because a tutorial must be *reproducible by a stranger*, so its rules get stated
  as rules rather than demonstrated as moves. Every one of this run's thirteen
  candidates came from sentences the creator volunteered as generalizations at the
  end of a segment. One observation; not yet a class row.
- The strip test kept its record as the cheapest instrument here: eight of
  thirteen candidates were killed or routed by it before any file was opened, and
  the two that survived to landing were both relations rather than attributes -
  which may be a pattern worth watching. A mature bundle's remaining gaps were not
  missing opinions or missing stages this run; both were **missing relations
  between two things the corpus already models separately** (two anchors, two
  references). Second sighting of this shape would be worth a method line.

## 1.5.0 - 2026-08-31 - breeze-tts2-local-voice

- **Read the corpus's enumerations while you listen, not after.** All three
  landings this run came from holding three of the target bundle's own
  completeness claims in mind during the transcript read - a six-axis decision
  matrix, a capability-axis list, and a four-item audition script - and asking of
  each segment whether it walks past a case the enumeration does not contain.
  Phase 6 already says to hunt enumerations once a candidate has a home; this run
  says the hunt belongs at Phase 3, because it changes what gets *extracted*.
  Ranked by the source's own emphasis - dwell time, confidence, what the creator
  frames as the headline - the top three candidates were the leaderboard
  position, the language count and the streaming latency, and all three are
  catches. The enumeration pass and the emphasis pass select disjoint sets, and
  only one of them is worth a verification budget. This is the second consecutive
  run to record a version of it (the previous one as "contradict the corpus's own
  denials"); a third sighting makes it a rule this file should carry at Phase 3.
- **A sponsored hybrid splits more cleanly than the class table implies, and the
  split is worth stating as a prediction before extraction.** Twelve minutes of
  tour half - vendor-supplied compute, no failures, no reject counts - yielded
  nothing, and every landing came from the operating half. The generalisable tell
  is not sponsorship but *who is exposed by the claim*: the tour half describes a
  product the creator did not build and is not accountable for, the operating
  half describes what happened to a machine he owns. Saying which half you expect
  to pay before you extract makes a zero from the other half read as calibration.
- **A source whose whole class is "reliable only for that it shipped" can still
  beat its average, and the discriminator is whether the corpus's model of the
  domain is older than the source's.** The voice package modelled a voice as a
  reference picked from a catalog. Any source describing an engine that *authors*
  voices would have contradicted it, regardless of that source's quality - the
  yield came from the corpus being behind, not from the video being good. Worth a
  triage habit: before declaring the expected yield from the class alone, ask
  whether the target subject's central data model predates the thing the source
  is about.
- **The apply step is now the most productive stage in this method and the
  scorecard should probably say so.** Six consecutive rows show it, and this run
  is the clearest: the A/B refuted the new technique's own transcript rule at its
  premise, and the seam hunt found a fact larger than anything in the source - a
  non-commercially-licensed engine recorded as a module doc comment, currently
  protected by an identity guard about an unrelated concern, where the obvious
  next feature removes the guard and the accidental protection together. Neither
  came from the video. The stage is not a checkbox that proves a landing; it is a
  second source that happens to be a tree.
  ### Redesign proposal
  Phase 7.5 is written as verification ("does a project do better under this
  rule"). Both of this run's best outputs were *discoveries* made while looking
  for a seam, not verdicts on the rule. If that holds for a third run, the phase
  should be split: a seam-reading pass that is allowed to return findings of its
  own and route them back into Phase 3, and a verdict pass that is not. Not
  applied now - two runs is a pattern, not a rule.
- **`unmeasurable` earned its keep as a verdict rather than a shrug.** The
  recording-chain amendment produced three simulation cases and two were void
  against the tree (a catalog shipping exactly one voice; pieces carrying a
  single voiceover). The honest report is that the finding is real, the tree
  cannot see it, and the instrument that would - an acoustic measure over
  rendered samples plus one usage fact - is nameable. A run that had forced a
  `better` out of one live case would have recorded an opinion.
## 1.5.0 - 2026-08-31 - ripgrep

- **The Extract->Test ratio means two different things and the scorecard conflates
  them.** On a wave or unattended run it is a director-capacity signal - candidates
  arrived faster than one serial verifier could judge them, which is what the last
  focus was written to fix. On an attended run it is the operator's appetite, and
  the unverified rows were never in contention for the verification budget at all.
  This run reads 2/12 and lost nothing; the previous window's 7/30 lost plenty.
  Averaging them produces a "weakest stage" that describes no real population, and
  that reading is what every method edit is aimed at. Record the triage mode on the
  row and read the series separately. Filed as the next run's declared focus.

- **A denied symmetry is now the highest-yield Phase 6 hunt, ahead of the missing
  stage and the enumeration.** Three consecutive runs have had their best landing
  come from a technique that explicitly says "the distinction is X, *not* Y" - and
  in each case Y turned out to be load-bearing in a neighbouring case the author had
  not separated. It outperforms the plain enumeration hunt for a structural reason
  worth stating: an enumeration is a claim somebody made carelessly while writing
  something else, whereas a denial is a boundary somebody *thought about* and drew,
  which means it is both more likely to be nearly right and more likely to be
  wrong in an interesting place. The method lists this third among the hunts; on the
  evidence it should be first. Not applied as an edit yet - one more run confirms it.

- **The fetch budget's class prediction has now held three times running, and saying
  it out loud before the triage table is what makes it useful.** This run named the
  class, predicted zero fetches and amendments-not-subjects, and spent zero of three.
  The prediction is not a formality - it is what stopped a "no prior art" reflex on
  two candidates that turned out to be seams inside ten-technique subjects.

- **`git`-shaped repository sources tempt a proper-noun map query and the method's
  2026-08-31 warning caught it.** The candidate vocabulary here was almost entirely
  banned words - the tool's name, the ignore-file names, the alternate regex engine.
  Mapping on concepts instead ("directory traversal", "filter escape hatch") returned
  the neighbourhoods that mattered. The warning added this morning did its job on the
  first run that could have tripped over it.

### Redesign proposal - not applied

  **The scorecard's funnel table should carry a `mode` column** (attended /
  unattended / wave / apply-only), and the closing "weakest stage" line should be
  computed per mode rather than over the last ten rows regardless of shape. The
  current single series has now mixed an apply-only run with 0 extract, wave runs
  with 30, and attended runs with 12, and the resulting stage reading has changed
  its diagnosis three times in ten rows - which is better explained by the population
  changing than by the method changing. This is a change to the measurement rather
  than to the pipeline, so it belongs to a run that is not also landing content.

- **Mid-flight runs on 1.5.0: nothing to do.** No `SKILL.md` edit was made this run;
  the lessons above are recorded and unapplied, and no version bump is owed.

## 1.5.0 - 2026-08-31 - awesome-agentic-patterns

- **The queue's class grade is a hypothesis, and the ratio test is the cheapest way
  to refute it.** This source was graded `paper aggregator / reference index` in the
  harvest queue, and the operator picked it specifically to run the `--wave` lane.
  The tree said otherwise in one command: 5,080 outbound links over ~996,000 words
  of prose is **one link per 193 words**, a code-repository ratio, where a reference
  index inverts it. Phase 2c already describes this test but frames it as something
  to reach for once you suspect a bibliography. It should run on **every**
  repository-shaped source, before the lane is chosen, because the failure it
  prevents is not a mis-read — it is a whole run executed in the wrong lane. Eight
  parallel readers would have been dispatched over a corpus whose value was three
  JSON files.

- **A declared focus is only spendable when the run's class matches, and that is not
  a miss.** The focus inherited from 1.5.0's last row was about waves flooding the
  director's verification budget. No wave ran, so the focus had no occasion. The
  right move is to hand it forward intact rather than report it as unmoved — a focus
  attached to a *lane* survives a class correction, one attached to "the next run"
  does not. Four runs' worth of the same instruction have now been consumed by
  whichever source happened to arrive next.

- **Record the first number beside the corrected one.** Three instruments produced
  three wrong first numbers this run — 576 contradictions, then 114, then roughly 1
  after hand-inspection — and each correction came from opening the artifact rather
  than from re-running the count. The scorecard promoted "an instrument's first
  number is not its measurement" to a rule last run; this run is its fourth, fifth
  and sixth confirmation, which means the rule is established and the *interesting*
  quantity is now the size of the correction. No run has yet reported the pair. A
  note that says "576 → 29" teaches the next run how much slack to budget; one that
  says "29" teaches it nothing.

- **When the corpus refuses a candidate, say which file refused it.** One candidate
  died against `gate-liveness`, which owned the whole idea and owned it better than
  the source explained it — seeded-failure tests, "time since last red", fixtures
  that never contain the pattern the rule exists to catch. Writing the refuting
  file's name into the source note's catch is what stops the candidate being
  re-derived; writing only "already covered" does not.

- **A `not-better` from domain mismatch is a condition, and the condition outlives
  the verdict.** The apply step failed in the connected project not because the
  technique was wrong but because the predicate meant something different there: a
  statute's neighbouring years are process dates, so "earlier year, later
  identifier" is normal rather than impossible. That sentence is now the most
  portable thing the run produced — it tells any future reader exactly which corpora
  the cheap check is decisive in. A `not-better` row whose note says only "did not
  hold here" would have thrown it away.

- **Mid-flight runs on 1.5.0: nothing to do.** No `SKILL.md` edit was made this run;
  the lessons above are recorded and unapplied, and no version bump is owed. The
  first two bullets argue for a Phase 2/2c wording change, but a method edit with
  six sessions live belongs to a run that is not also landing content.

## 1.5.0 - 2026-08-31 - boundary-software-factory

- **A near-empty is sometimes neither a hole nor a seam: it is material we own, filed
  in a subject that does not make decisions.** The method already names two readings of
  a weak map result. This run found a third and it was the whole finding.
  `human-gate-capacity` models the review rubber stamp and enumerates its remedies;
  `batch-size-thresholds`, two categories away in a *measurement* subject, had already
  written "approval is a formality" as the definition of its top size bucket. Neither
  file was wrong and no map query would have connected them, because the concept lives
  under different slugs on both sides. The generalisable move: when a candidate looks
  already-covered, ask not only *which file measures it* (the existing asymmetry hunt)
  but **whether the file that measures it is allowed to decide anything**. A measurement
  subject can hold a fact for months without any decision subject inheriting it.

- **An amendment inside a technique file is the collision-free landing, and that is a
  structural property worth exploiting deliberately.** Two siblings held
  `machine-paced-delivery` while this run wrote into it. A new technique would have
  contended on the golden path's `techniques:` list - the one line every landing on a
  subject must touch. An amendment touches only the technique file plus, optionally, one
  prose clause. The method already prefers amendments on yield grounds ("often the
  higher-yield move and always the cheaper one"); it should also say they are the
  *parallel-safe* one. When the board shows a sibling on your subject, check whether the
  finding can be an amendment before deciding to wait.

- **The apply step's control is not optional, and the first number lied twice in one
  run.** Arm B separated post-merge repair 81% vs 57% by changed lines - a clean 1.42x
  that would have shipped as a confirmation. Holding *files touched* fixed collapsed the
  gradient and inverted it in the single-file band: the effect was surface area, since
  larger changes touch more files. The baseline lied too - 62.9% repair across the whole
  population was a saturated predicate at 40 changes/day on overlapping files. Both were
  caught by the same cheap move: **name the confounder you would most like not to have,
  and hold it fixed once.** This is the fifth sighting across three runs of "an
  instrument's first number is not its measurement"; the scorecard now says it belongs in
  the method rather than here.

- **A negative unit result is a landing.** The refutation did not weaken the amendment,
  it gave the amendment the one thing it was missing - a stated unit condition. The
  owning threshold table names the unit as an open choice and defaults to changed lines;
  this run is the first evidence in the corpus that the default can carry almost none of
  the signal it appears to carry. Phase 7.5 has now re-drafted a technique on this
  subject three separate times, which is enough to say plainly: **the apply step is a
  drafting instrument, not a validation step**, and a technique landed without one is a
  first draft regardless of how well it reads.

### Redesign proposal - the Test column is measuring operator selectivity as loss

Not applied this run. The scorecard has named Extract->Test as the weakest stage for two
windows running, but three of the last four runs recorded that ratio explicitly as
*operator choice* (1 of 12 here, 2 of 12, 2 of 21). Phase 3 is instructed to extract
5-15 candidates precisely so Phase 5 can steer cheaply, so most candidates not advancing
is the gate working as designed. Counting them as funnel loss commits the error the
method forbids elsewhere - treating untriaged as declined - and it has now sent two
consecutive runs chasing a director-throughput problem that the numbers do not show.
Proposal: record `test` as `picked/verified/dropped` against `extracted`, so
picked->verified is the only ratio read as loss. Belongs to a run not also landing
content.

- **Mid-flight runs on 1.5.0: nothing to do.** No `SKILL.md` edit was made this run and
  no version bump is owed. Five sibling sessions were live at commit; the two rules above
  that argue for a method edit (the third near-empty reading, and the confounder rule
  reaching its threshold) are recorded and unapplied, and the scorecard names the next
  run to touch `SKILL.md` as their carrier.
## 1.5.0 - 2026-08-31 - semantica

- **An A/B that returns `not-better` and then corrects the technique it tested is the
  highest-value outcome this method produces, and this run got two in one sitting.** The
  SSRF consumer's own comments supplied a rule the technique had implicitly denied — the
  pre-flight validator is *not* redundant with the connect-time resolver, because a
  literal address never reaches a resolver at all — and the lockfile row discovered that
  the ecosystem's strict-install command already *is* the oracle the technique
  prescribed building, which would otherwise have shipped duplicated logic to every
  reader whose installer already enforces it. In both cases the technique was **less
  correct before the apply step than after it**, and neither correction was reachable
  from the source: one came from a consumer that had solved the problem better, the
  other from a tool's documented behaviour. The scorecard now records this as the third
  consecutive run producing an amendment from a `not-better`. **This is past the
  three-run threshold and belongs in `SKILL.md` as a rule of Phase 7.5** — a `not-better`
  row asks "what did the seam know that the technique did not", and the answer is
  written into the technique before the run ends, not banked. Not applied here: three
  sibling runs have edited the skill lane today (`6ac2b4a`, and three more touching
  `SCORECARD`/`LESSONS`), and a fourth editing `SKILL.md` in the same afternoon without
  reading their diffs is the exact hazard the method names. **A mid-flight run should do
  nothing about this bullet; the next run to open `SKILL.md` should carry it.**

- **Read the prior-art file for what it *declines*, not only for what it covers.** Two
  of six landings were located this way, and neither was visible in the candidate list.
  `absent-degrades-malformed-fails-fast` contains the sentence "malformed is not 'the
  dependency rejected it' — that is a runtime fact and a different technique", and that
  technique did not exist; `quality-gates` enumerates three ways a check cannot fire and
  the source supplied a fourth of a different kind. Phase 6 step 3 already says to hunt
  enumerations, and step 4 says to hunt asymmetries. This adds the cheapest variant of
  both: **a document that names a neighbouring technique as out of scope has told you
  whether that technique exists — and the corpus is large enough now that it usually
  does not.** A grep for "a different technique", "not this subject", "belongs to" across
  the bundle would return a standing worklist of gaps the corpus has already localised
  for free. Worth an instrument if a second run confirms the yield.

- **A declared focus is scoped to a lane, and a run in a different lane should say so
  rather than comply.** The inherited focus was to parallelise Phase 6's mechanical half
  when a *wave* returns more candidates than the director can verify. This was a
  single-source repository run: no wave, one director, 18 candidates. Manufacturing
  parallelism to satisfy it would have produced worse work and a meaningless scorecard
  row. Phase 1 step 5 already permits "if the focus does not apply to this source, say
  why in the scorecard row" — this run is the case that makes the permission load-bearing
  rather than decorative, and the ratio it was aimed at (Extract→Test) came in at 18→6
  anyway, by a different mechanism.

- **A sibling swept this run's `SCORECARD` append into its own commit** (`0cf4da6`)
  between the ledger unlock and this run's commit. Nothing was lost — the row is in
  `HEAD` under another run's message — and the `ledger` lock did its job, because the
  append itself did not race. But it shows the lock's boundary: it serializes the
  *write*, not the window between the write and the writer's commit, and a shared file
  appended by twelve runs will routinely be committed by whoever reaches `git commit`
  first. That is benign and probably not worth fixing; it is worth **not** diagnosing as
  a lost append the next time a run finds its own row already in `HEAD` under a stranger's
  commit message.

- **Two `ship 0` rows this run were `better` with the change argued, the measurable
  named, and the fix under ten lines**, and both stopped on `confirmation` — the operator's
  triage answer picked six rows and named no project. The previous run's lesson was to
  ask for the tree in the same question that asks for the pick; this run asked, in one
  line, and it was not answered. The scorecard's next focus moves the question to where
  it is concrete: ask at Phase 7.5, holding a named seam and a run A/B, not at triage
  holding a hypothesis.

## 1.5.0 - 2026-08-31 - pgrust

- **The vendor-repository class predicts the parts correctly and the ratio wrongly,
  and one question separates the two shapes.** The class entry describes a company's
  repo for a product "whose engine is a hosted service" — marketing-dominant, one
  honest rules page, the real data model hiding in a client's types. This source is
  the same nominal class and inverts it: 2,480 rendered words against ~7,500 words of
  operating documents, with no hosted engine and therefore no client types to check.
  The discriminating question is **is the repository the product, or an SDK over a
  product that lives elsewhere?** When the repository *is* the product, the class's
  reliability ordering still holds (README last) but its yield expectation is far too
  low, and the run should be budgeted like a first-party practitioner account. Not
  applied to the reference yet — one source is thin evidence for a class edit, and a
  second sighting should make it a row.

- **Third consecutive run in which the denial hunt (Phase 6 step 3) carried the entire
  yield**, and this one is the cleanest instance: all three landings are enumerations
  that claim completeness and miss a case the same file describes. Two rot axes named
  with the third in the file's own prose; "there is no self-check" true for only one
  direction of a distinction the file never draws; "compare against that one rather
  than writing a third" silent on what that oracle cannot see. The rule is already in
  `SKILL.md`, so no edit is owed — what is worth recording is that the hunt is now the
  *primary* extraction method on mature subjects rather than a supplementary one, and
  that its best targets are the sentences a technique writes to sound thorough.

- **An apply step refuted the run's own new document, for the second consecutive run.**
  The draft covered the fitted corpus and not the fitted grading predicate; the arm
  that exposed it scored 11/11 while 9 of 11 payloads passed through the artifact
  unmodified. Worth generalising as a habit rather than a rule: when the landing is a
  *measurement* technique, run its own check against the apply's instrument before
  writing the row — the technique that says "the corpus can be fitted" is the one
  likeliest to have forgotten that the question can be too.

- **Operational, cost one failed gate run:** application filenames are
  `<stack>--<technique>.md` **exactly**, one per (stack, technique) pair, and a
  descriptive suffix fails `check-bundles`. When a technique already has an
  application on your stack from a different tree, the collision is real and the
  repair is to pick the more specific accurate stack label (here `next` over `node`),
  not to invent a suffix. `verified_against` must then name that same stack, which
  is a second failure if only the filename is changed.

- **A wrong first hypothesis about a project's CI, settled by one command** — the
  fourth consecutive run where an instrument's or a tree's first apparent reading was
  wrong. The test files skip on an unset environment variable, which reads as
  "env-gated out of CI"; the workflow stands the infrastructure up and marks the arms
  required. Reading the test file is not reading the pipeline, and the pipeline is
  where the policy lives.

## 1.5.0 - 2026-08-31 - agentic-operating-level

- **A doctrine talk inverts the strip-test/corroboration ordering, and the shipped
  order wastes a pass.** A practitioner presenting a framework with no system, no
  artifact and no measurement produces claims that are proper-noun-free *by
  construction* - so the strip test, which exists to kill most candidates cheaply,
  kills none, and all fourteen candidates arrive at the corroboration table that was
  always going to refuse eleven of them. For this class ask *what could authorize
  this* before asking *what survives stripping*. Recorded as a class note in the
  source note; not yet in `references/source-classes.md`, because one observation.
- **The move that works when a source can authorize nothing: find a document
  declaring its own completeness and ask whether it is short by one.** Both landings
  came from it - *"There are three honest resolutions"* was short by one, and *"every
  failing case is owned by exactly one of these"* had a row holding two causes with
  opposite repairs. `SKILL.md` Phase 6 already names the enumeration hunt; what this
  run adds is that it is the *primary* instrument for an unauthorizable source rather
  than one of three, because it sources the finding from the corpus and uses the
  source only as a pointer.
- **Fourth run running: a source that implements a good idea badly beat one that
  implements it well** - and this is the cleanest instance, because nothing here was
  quotable. The source pointed at both findings and got both wrong: a direction with
  no mechanism, and a mechanism that is backwards (it prescribed teaching for the
  half that teaching does not move). Neither finding could have been written from it;
  neither would have been looked for without it.
- **An instrument built at the wrong altitude does not go quiet, it produces
  confident numbers.** The apply harness harvested a glossary's own
  *must-translate* callout as protected terms and reported a 29.6% violation rate,
  counting every correct translation as a defect. It cleared its own self-check
  because the self-check tested that terms *parsed*, not that they were the right
  terms. Fifth consecutive run where an instrument's first reading was wrong; the
  standing corrective (an instrument's first number is not its measurement) held
  again, and the failure is now the same shape as the finding the run was landing.
- **`research-map` is near-useless on a doctrine source and the reason is structural.**
  Doctrine terms are abstractions - altitude, leverage, control - and the index
  matches slugs, so every call returned high-scoring, semantically unrelated hits
  (`ui-controls` for "leverage control tradeoff"). All four homes were found by
  reading subjects' **stated boundary paragraphs** instead. Worth a line in Phase 4:
  for a doctrine candidate, go to the boundary statements directly and treat the map
  as neighbourhood-only.
- **A sibling swept this run's ledger appends into their commit, and nothing was
  lost.** `librarian/applied.md` and `librarian/sources/index.md` were appended under
  the `ledger` lock and were in `HEAD` under another run's name minutes later.
  A second sibling appended a `SCORECARD.md` row *while this run held the ledger
  lock* - both rows survived only because this run inserted by line position rather
  than rewriting the file. **Mid-flight runs on 1.5.0: nothing to do, finish on the
  version you loaded.** The 1.6.0 edit is the Phase 5 question only.

### Promoted to a rule this run

- **Ask for the tree in the same question that asks for the pick.** The scorecard
  named this fix twice, in two consecutive closing paragraphs, and a third run
  (this one) reproduced the blocker anyway: two `better` apply rows, `ship 0`,
  blocked on nothing but Phase 8's confirmation gate. Three runs running is this
  file's own threshold, so Phase 5's question now asks for both halves and
  `SKILL.md` went to 1.6.0. **The second-order lesson is the more uncomfortable
  one**: the diagnosis was already written down and did not travel, because a
  scorecard's closing paragraph is read at Phase 1 for the focus line and
  apparently for nothing else.

## 1.3.1 - 2026-09-01 - voltagent-awesome-ai-agent-papers, wave 4

The Multi-Agent cluster wave 1 dropped for contention, mined once the board emptied.
8 of 8 lanes worth a slot. Three rules landed in SKILL 1.3.2; the rest is here.

- **Never establish an absence from a truncated output.** Wave 1's rule was about a
  bad query. This is the same failure with a *good* query and a cut-off result, and it
  is worse because nothing looks wrong: a grep returned 22 files, `head -8` showed
  eight, and the subject that refuted the whole acceptance rule was in the fourteen
  that scrolled past. Independently, `research-map --prose` ranked the same subject 7th
  against a default top-6. **Two correct instruments, two truncations, one hidden
  subject** — and I wrote a wave-wide acceptance rule on the strength of it. Two
  workers caught it; one diagnosed the mechanism more precisely than I had.
- **A worker retracting its own candidate is the system working.** The MAS-Orchestra
  lane proposed an amendment, then withdrew it after applying the corpus's own
  family-diversity test and finding the paper's negative result was our rule's
  prediction. Briefs should keep asking for the override *and the argument*; this is
  what it buys, and it is cheaper than a director catching it at review.
- **Three headlines died to arithmetic in one wave, and each died differently** — a
  denominator swap (the reported gap was against a per-problem hindsight oracle, which
  reproduced 5/5 while the advertised baseline reproduced 0/5), a direction inversion
  (a paper measuring the opposite of its title), and a control parameter that does not
  contain the variable in the title. The common defence is the same and it is cheap:
  **re-derive the headline from the table before quoting it.** None of the three needed
  a fetch to catch — only arithmetic on numbers already extracted.
- **Apply 0 twice is not one pattern.** Wave 3's unapplied set were rules about how a
  *number* is produced; wave 4's are rules about *structures the fleet does not build*
  — no chain that forks and rejoins, no recursive decomposer, no multi-model panel, no
  a11y ladder. Recording them as one class would have merged two different gaps and
  falsely triggered the `re-analysis` redesign. **Check each finding against the tree
  individually and state the reason per class, not per run.**
- **A demand signal and an absence can be the same fact from two ends.** The librarian
  scan ranks `accessibility` third at 46 points with a single-stack flag; the fleet's
  one React desktop app has no axe dependency and no a11y script at all. The scan
  measures demand from the consumer side and the tree shows the vacuum from the other.
  Worth a standing check: when a subject ranks high on attention and its consumers run
  none of its tooling, that is not a coverage gap in the corpus, it is an adoption gap
  in the fleet, and the two want different work.
- **The wave's best material came from papers that failed.** Four of eight lanes
  returned no content and were still worth their slot: one killed a fabricated
  threshold before it landed, one proved its own thesis unmineable, one turned out to
  be repository metadata rather than failure data, and one was an instance of a smell
  we already publish. The corroboration section's "a source that implements a good idea
  badly is worth more" held four times in one wave.

## 1.6.0 - 2026-09-01 - slideops-readme

- **A source class can be inverted by the operator's question, and the inversion is
  worth naming rather than treating as an exception.** Phase 2b's rule is that a
  repository's README is its advertisement and must be read last. This run's scope was
  *the README's form* — styling, formatting, the balance of visual and text elements —
  which makes that same file the primary source and the tree the corroborating
  evidence that the form was engineered rather than stumbled into. The generalisation:
  **when the question is about a document's form rather than its claims, the file the
  class tells you to distrust becomes the artifact under study.** The class still
  decides where the yield hides; it just stops deciding which file is the ad. Phase 2b
  should say this in one sentence rather than leaving the next run to rediscover it,
  because the naive reading ("clone it, read the README last") would have produced a
  run that never opened the thing it was asked about.

- **When a run forges a rule AND its detector, reconcile the detector to the rule
  BEFORE the rule's numbers are argued — not after.** This run wrote
  `check-readmes.mjs` with provisional thresholds, measured the fleet, handed those
  numbers to a forge worker, and the worker argued its threshold against them. Then the
  forged technique turned out to state a *closed break set* that my counter did not
  implement: it admitted paragraph breaks and bare headings, and read the fleet's worst
  prose run at 39 lines where the rule's own break set reads 96. Reconciling the
  instrument invalidated the argument the worker had built — "a limit of forty would
  pass every project in the survey" was true of the draft counter and false of the
  corrected one — and the subject's cited distribution and its defence of its threshold
  both had to be rewritten after the gate was already green.

  The order that avoids it: draft the rule's *shape* first, implement the detector
  against the shape, measure, and only then argue the numbers. What made this
  recoverable rather than embarrassing is that the technique itself states the meta-rule
  — the numbers live in the written rule and the instrument reads them, never the
  reverse — so the corpus contained its own correction before the correction was needed.

  ### Redesign proposal (not applied)
  Phase 7.5 currently tests a landed technique against a project. It has no step for
  the case where **the run's own instrument is one of the landings**, which is now
  common enough to name: three of the last four repository runs produced a script. Such
  an instrument is a consumer of the corpus like any project, and it deserves the same
  question — does the artifact do what the document says? A cheap version is one line
  in Phase 7: *if this run wrote an instrument that encodes a rule it also wrote, run
  the instrument against the rule's stated definition and report the disagreement.*
  Not proposing a SKILL.md edit on one sighting; return on a second.

- **A hand-count in the triage table is a measurement without a predicate, and it was
  wrong.** My Phase 3 survey credited a fleet project with 7 images; they were badge
  images. The instrument written two phases later caught it, and the spec had already
  been dispatched with the bad table. Cheap corrective, no method change needed: when a
  run is going to build a counter anyway, build it before the triage table rather than
  after, and let the table quote it.

## 1.6.0 - 2026-09-01 - firstmate

- **A `docs/verification/` directory is a source-class signal, and it outranks
  the operating documents.** This repository's whole yield came from eight
  documents whose job is recording *what was measured, against which version, on
  which date, and what remains uncovered* - not from its architecture or design
  docs, which Phase 2b ranks first. The tell is cheap: version numbers and
  observed output inside fenced blocks, and sentences of the form "remains
  uncovered rather than inferred from". When a tree carries one, read it before
  the operating documents. It is a maintainer's evidence file, and evidence
  files carry the failure modes that were paid for rather than the ones that
  were anticipated.
- **Reading a project that AGREES with the finding is where the finding's
  wording gets fixed.** The apply step corrected this run's own amendment for
  the second consecutive run - but this time not by exposing a defect. The tree
  had already solved the problem, and solved it *better than the draft
  prescribed*: the amendment said an in-path gate should fail "open, silently",
  and the tree's three-exit-code form showed that withdrawing and going quiet
  are two decisions, only one of which the argument licensed. The instinct at
  Phase 7.5 is to hunt for a project exhibiting the defect. A project holding
  the cure is at least as valuable and is the **only** thing that catches a
  prescription which is subtly wrong rather than absent - a defect-holding tree
  can only confirm that the problem exists.
- **`ship 0` has two causes that must not be merged in the scorecard.**
  `blocked: confirmation` is an authorization failure the method can fix, and
  moving the tree question to Phase 7.5 largely did fix it. `declined: no change
  warranted` is a different fact entirely: the fleet does not hold the defect.
  Three of this run's four rows were the second kind. Merging them makes seven
  consecutive ship zeros read as one unsolved problem when the last two runs
  actually retired the first cause. Say which kind, per row, or the funnel
  reading is wrong in the direction that keeps a solved problem on the worklist.
- **The corpus is increasingly finding gaps in itself rather than gaps the fleet
  exhibits, and that has a cost the apply stage pays.** Four consecutive runs
  landed via the enumeration and asymmetry hunts against mature subjects. Those
  findings are real and they are about *the standard*; a standard-level finding
  frequently has no project defect behind it, because the project either already
  complies or has no seam at all. This run: no fleet project ships a session-start
  injector, none spawns an agent CLI with injected context, and the one in-path
  gate already implemented the amendment. The hunts are not wrong - but a run
  that expects `ship` to move should weight source selection toward domains where
  the fleet actually has code, and a run mining a mature subject should predict
  `declined: no change warranted` out loud at triage rather than discovering it
  at Phase 8.
- **Mechanical, costs one gate round-trip:** the bundle checker enforces one
  application per `<stack>--<technique>` pair. A second application of a
  technique on the same stack must **extend the existing file**, not sit beside
  it, and `verified_against` must be `<stack>@<version>` - a project slug there
  fails. Both are the corpus preferring amendment over duplication, expressed as
  a filename rule.

## 1.6.0 - 2026-09-01 - adaptive-harness-review

- **The fetch budget belongs to the source's HALF, not to the source.** The class
  table states, correctly and with evidence, that for a second-hand review "the
  fetch is not corroboration, it is the extraction" — a demo states no operating
  constraints, so the vendor's own document is where the technique comes from. This
  run was that class and spent **0 of 3**, and the reason is not discipline, it is
  that the rule scopes to the wrong unit. A hybrid review has a relay half and a
  critique half; the fetch rule was written from the relay half, and here the relay
  half came back **6 of 6 already covered**, so a fetch would have bought
  corroboration for candidates that needed none. The critique half — the reviewer
  reading the paper's own evidence tables — is a first-party account, and the method
  already says first-party accounts corroborate corpus-internally. The routing rule
  is the one the method already carries one paragraph earlier ("route per half,
  never per source"); it simply was not applied to the *fetch* line. Worth folding
  into the class entry when someone next edits it: **decide the fetch per half, at
  triage, and say which half you are buying.**

- **A ship-class prediction should name the project and must not name the file.**
  The declared focus asked each triage row to carry `seam: <slug>` or `seam: none`,
  and to report whether any prediction turned out wrong. One did, in the most useful
  way available: the project was right and the file was wrong. A `.rs` + schema grep
  pointed at the gate function and the baseline column; those turned out
  **unmeasurable** (an immutable row with no update path, a store with zero rows),
  and the arm that actually ran was a **shipped JSON config file** the seam grep had
  no reason to open. The general form is that a seam grep searches code for a
  decision, and a real system also encodes decisions in configuration, fixtures and
  schemas — so file-level seam prediction is systematically biased toward the
  language the grep was written for. Project-level prediction cost one command and
  held. **Carry `seam: <slug>`; let the file be discovered at Phase 7.5.**

- **A grep that times out is an unknown seam, not an absent one — and the timeout
  is the tell that the query was wrong.** A cross-fleet loop-termination grep over
  six trees hit the 2-minute limit and was abandoned. It was recorded as `seam: ?`
  and the row went to the untriaged table, which is correct per the truncation rule
  the method added on 2026-09-01. The addition worth making: a timeout is not just a
  missing answer, it is evidence the query was unscoped — six repository trees with
  five include-globs is a query nobody would run twice. The corrective is to scope
  to one candidate project chosen from the domain declaration first, then grep. The
  fleet-domain filter exists precisely to make the seam grep small and it was not
  used before the grep, only after it failed.

- **Third consecutive run in which the apply step corrected the technique it was
  testing, and this time the correction was a BOUNDARY rather than a defect.** The
  arms measured a canonicalization table that collapses dated model variants to a
  family — 8 identities where 11 instruments exist — and the naive reading is that
  the tree has the bug the technique describes. It does not: the table's own header
  argues for the collapse, and for the leaderboard it serves the collapse is right.
  What the arms actually established is that a codebase carries **one** identity
  function, the aggregation surface is the one people look at daily, and a
  comparability predicate therefore inherits the aggregation surface's answer for
  free. That discriminator went into the technique and was not in it before. Worth
  generalising as a Phase 7.5 reading: **when an arm shows a tree doing the thing a
  technique forbids, ask what surface the tree was serving before writing it up as
  the failure** — a correct-for-its-purpose implementation that a second consumer
  silently inherits is a different and more useful finding than a defect.

### Addendum (same run) — the code arm was reachable, and what made it reachable

The row above shipped after the operator lifted the tree question at Phase 7.5. Four
observations, because this is the first `code` row in eight runs and the scorecard has
been naming that zero for weeks:

- **What unblocked it was not permission — it was picking a quiescent tree at Phase 5.**
  The focus two runs ago said to check WIP state at triage rather than at Phase 8. Doing
  it took one `git status --short` per candidate project and eliminated four of six
  in-domain trees on the spot (66, 19, 8, 2 dirty files). The tree that survived had one
  untracked file. **The seam and the authorization were never the constraint; the
  constraint was that the fleet is usually mid-work, and that is a property you can
  filter on cheaply and in advance.**
- **A code arm is reachable when the change fits the call boundary, and the boundary is
  worth looking for before the schema is.** The technique's own procedure opens with
  "store the baseline as a record, never as a scalar" — a four-store schema migration,
  and not shippable in a session. The reachable version was one signature: the caller
  already held everything and narrowed it to a float one line early. **Ask what the
  caller already has before asking what the schema lacks**; a narrowing at a seam is the
  cheap half of most provenance findings and it is invisible in a schema diff.
- **Shipping corrected the technique a second time, and differently from the
  experiment.** The experiment arm found a *boundary* (aggregation wants a family, a
  predicate wants a variant). The code arm found *limits*: it checks one condition
  rather than the predicate, the frozen flag is a proxy that produces false refusals,
  and the tree cannot detect judge drift at all because immutability is doing the work a
  check appears to do. Worth stating as a rule: **an experiment tells you whether the
  idea is right; shipping tells you how much of it you actually got.** Both belong in
  the application, and the second is the half a run that stops at `experiment` never
  writes.
- **The five identical cases were the load-bearing number, not the three that differed.**
  The subject's own doctrine says added rigour may trade a false alarm for a detection
  and may never disarm the gate. An A/B that reports only what changed cannot answer
  that; reporting 5 of 8 byte-identical is what shows the change is a detection and not
  a rewrite. **When a technique's home subject states a safety property, size the arm to
  measure that property, not just the effect.**

## 1.6.0 - 2026-09-01 - reallusion-ai-studio

- **An absence check run on the SOURCE's vocabulary measures the purity gate, not the
  corpus.** The method already says this for banned proper nouns ("a total empty over
  banned vocabulary is not evidence of anything"). This run hit the same wall through a
  door the method does not name: *industry jargon*. `previsualization`, `blocking pass`,
  `proxy render`, `depth map` returned a genuine, uncapped, verified zero across eight
  bundles — and `scene-grammar-progression` has owned the concept since run 26 as **the
  blocking frame**, with an operating detail (the hard-scoped role line that stops the
  stand-in's emptiness leaking into the shot) that the vendor page does not have. The
  zero was real; it was a fact about how this corpus names things. A source's own
  vocabulary is the single worst query set for establishing an absence, because a
  news/vendor source is made of exactly the words the upper layers strip.
- **The refutation came from `librarian/subjects/<domain>/<subject>.md`, not from any
  grep or any technique file.** The note said "run 26 … camera pose (the blocking
  frame) — a neutral 3D stand-in scene exported as a frame". Phase 6 sends a run to
  `research-map`'s `file` and to the neighbouring techniques; it never sends it to the
  subject note, which is the one artifact written specifically to record what a subject
  recently gained and in what words. It is one file read per picked candidate and it
  would have moved two rows from `real gap` to `likely catch` before the verification
  budget was spent. Promoted to the next run's declared focus.
- **The golden-path/technique hedging asymmetry runs both ways.** The method warns that
  "golden paths in this corpus routinely hedge better than their techniques do" and that
  a correction written against a summary is a phantom fix. Here it inverted:
  `cinematic-language`'s opening states a governing fact flat ("models read described
  effects, not equipment or numbers") that its own `movement-motivation` scopes in full
  one level down. The residual finding was therefore **navigational, not substantive** —
  a reader deciding whether the subject applies to them meets the unqualified version
  first. Worth checking in both directions, and worth noticing that the fix is a clause,
  not a technique.
- **A seam predicts the apply TARGET, never the apply MODE.** The declared focus
  (predict ship class at triage from the fleet) worked as far as it can: `gravity` was
  correctly predicted, was the first `code`-reachable tree in eight runs, and the
  operator authorized it. The mode was still `simulation`, because the surviving finding
  was a golden-path clause. Mode follows the finding's *shape* and is knowable at triage
  from the `shape` column alone — a `correction` is a `simulation` row before anyone
  opens a tree.
- **Vendor-page calibration held exactly.** Expected yield stated at 1-3 before the
  triage table; actual 1 landing, 0 leads, 5 catches, 3 untriaged. The class table's
  "reliable for its numbers - the prose is the strip test's problem" is right, and the
  operator's broader-research ask did not change the yield so much as change what the
  fetches were *for*: they located the general technique class (geometry-proxy
  conditioning) so the vendor's framing could be checked against a primary rather than
  restated. That is the correct use of the budget on this class and it still ended in
  catches, because the corpus had already been there.

## 1.6.0 - 2026-09-01 - stefan3d-free-ai-level

- **The A/B instrument is the one thing in Phase 7.5 that nothing checks, and it lied
  confidently.** The mutation probe this run built to decide its apply verdict reported
  4 of 13 gates insensitive on its first run. All four were the probe's fault: it scaled
  every number at once, which leaves a predicate reading a *ratio* exactly invariant, and
  it walked only the top level, so a step whose artifact is a single nested object was
  never mutated at all. Nothing about the output looked wrong — it was well-formed,
  plausible, and it named specific steps. Had it shipped, this run would have filed a
  finding indicting four working gates in a connected project, in a ledger row that reads
  as evidence forever. The corpus already holds this rule for *remedies*
  (`regeneration-vs-repair-economics`: a remedy earns its place by measurement on a
  before/after pair, never by plausibility) and the run had to rediscover it for the
  measuring instrument. **Corrective, now the declared focus: before writing an A/B
  verdict, run the instrument against a case whose answer is already known** — one
  known-good and one known-bad input, checked by hand. It is cheap, because the known
  case is usually an artifact already in front of the run.
- **In a parallel fleet the declared focus can change under a run mid-flight.** The
  focus read at Phase 1 was *predict the ship class at triage*; by Phase 9 a sibling had
  appended a newer closing block (*open the prior-art subject's `librarian/subjects/`
  note before writing `real gap`*). Neither read was wrong and both were honoured, but
  the run only noticed because it re-read the file inside the ledger lock. Worth knowing
  rather than fixing: Phase 1's `tail` is a snapshot, and the honest scorecard row names
  which focus it was actually run under.
- **Corroborating corpus-internally beats a fetch when two subjects of one bundle
  disagree, and the disagreement is findable by hunting the denial.** The golden path
  said a generated asset "is the only thing that can carry the line forward"; a subject
  in the same bundle ships a locally computed, seed-reproducible terminal artifact. That
  is not a contradiction to resolve by tiering sources — it is the corpus telling you
  where its own boundary is drawn wrong, and it costs nothing. Sixteenth consecutive
  zero-fetch run, and the first where the corroboration came from the bundle contradicting
  *itself* rather than from a neighbouring subject agreeing.
- **Opening the technique file downgraded the finding and improved it.** `research-map`'s
  summary did not surface the technique's existing "where the stand-in is the deliverable"
  exception; reading the file did, which turned "a missing exception" into the sharper and
  correct "a missing third origin". This is the standing Phase 6 rule paying again, and it
  is the second consecutive run where the run's own first write-up was wrong in a way only
  the file could catch.
- **When the corpus is right and the tree already agrees, the shippable artifact is the
  instrument the technique prescribes and nobody ran.** Three of the last four runs closed
  `declined: no change warranted` — a correct outcome that still reports as a zero. Here
  the technique's own mutation probe had never been run against the connected project, so
  the apply step needed it, and the probe itself became the commit. That converts the
  common "nothing needs changing" case into a real ship without inventing a change, and it
  is repeatable wherever a technique prescribes a check rather than a behaviour.
- **Build-walkthrough calibration held.** Expected yield stated as *low* before the triage
  table; actual 1 landing, 2 leads, 6 catches, 3 untriaged from 5,616 words. The class
  rule decided every row — the single landing came from one offhand aside in the operating
  half, and the entire tour half (roughly 85% of runtime) produced nothing but proper
  nouns against a bundle that already held ten subjects over the same territory.

## 1.6.0 - 2026-09-01 - faceless-channel-claude-code

- **An absence established from a truncated FILE is the same failure as one established
  from a truncated grep, and it is harder to see because reading feels like verification.**
  The method already warns against establishing an absence from a piped or capped
  instrument output (Phase 4, added earlier the same day). This run reproduced the identical
  root through a different door: a triage read of `never-the-account-default` was formed
  from `head -45` of the technique, and the "missing case" it claimed was present twice in
  the unread remainder — once as a decision rule (*when the response does not state which
  model served, treat identity as unverified*) and once as a *When NOT to use this* clause.
  **Second sighting of this root in two days.** The existing warning lives under Phase 4 and
  is phrased for instrument output; the door this run came through is Phase 6 step 1, which
  says "Read the actual file" and does not say *whole*. If a third run trips on it, the
  mechanical fix is one word there — "read the actual file, in full, before writing the word
  *missing*" — plus a note that `head`/`sed -n` on a technique is the same hazard as `head`
  on a grep. Holding at lesson per the three-sightings rule; recording the exact edit so the
  third sighting can apply it without re-deriving it.
- **A wrong triage read is not a wasted row when the verification is what ships.** The run's
  only landing came from the candidate it got wrong. The row was picked as a `partial`
  amendment, resolved to `already covered` on a full read, and the act of confirming the
  catch is what opened the connected tree and found the real defect there. Worth stating
  because the instinct on discovering "already covered" is to close the row and move on:
  the catch is a *reason to open the consumer*, since a technique the corpus states well
  and a tree implements badly is exactly where an application lives. Two of the last three
  landings now have this shape.
- **A source can be worth a run while authorizing nothing in it.** This one contributed
  exactly one thing to the standard — that a provider disclosing no model identifier at all
  is now a marketed product category rather than a hypothetical — which justified a third
  enum value and nothing more. Recording that as *currency, deliberately not inflated* was
  the correct size, and the scorecard row should read as a good run: 1 landing, 1 ship, 6
  catches, 0 fetches. The temptation the method keeps naming is to promote the other seven
  rows to justify the hour; the corrective is that the class predicted this yield out loud
  at Phase 2 and was right.
- **Build-walkthrough calibration held for the second consecutive run**, in its
  tour-half-dominant variant (a sponsored vendor demo, ~4 sentences of genuine operating
  half in 2,837 words). Every content row lost to the corpus, and lost *informatively*: the
  video's headline rule is `asset-vs-disposable-render`, and the video then commits on
  camera the exact failure `delivery-promise-lock` predicts — specifying two purely temporal
  attributes as "style" and proofing them on a still frame that cannot render either. **A
  source demonstrating the failure our corpus already names is a stronger confirmation of
  the corpus than a source agreeing with it**, and it costs nothing to notice once the
  neighbours are open.
- **Two runs authorized against one project tree on one afternoon was safe, and the board is
  why.** A sibling simulated against `gravity`'s `cinematic-language` seam while this run
  shipped to `lib/imaging/`. Disjoint files, no contention, neither had to wait. The
  regeneration was the only real hazard and the existing rule handled it: `index.json` and
  `catalog.json` were left uncommitted because they had absorbed the sibling's in-flight
  applications. Recording this as the clean counter-case — the collision rules are usually
  written up only when they fire.

## 1.6.0 - 2026-09-01 - awesome-game-security

- **A reference index with no home in the corpus is not waved; it is ranked at the
  granularity the corpus can rank and filed as a lead.** The wave lane's weights are all
  about the corpus (attention points, refutation, a subject to land in). When every
  domain term returns a total empty on *concept* vocabulary and no managed project has
  the seam, all N references score the one weight the lane says to distrust, and eight
  workers would return one sentence eight times. Run the enumeration (it is cheap and it
  is the artifact), rank by section, record the ranking as the wave plan, and spend the
  run on the half that has a home. Say why in the note; `refs_read: 0` over
  `refs_distinct: 4,017` must read as a decision, not the old failure.
- **A pipeline's own ledgers are its measurement.** Phase 2b item 3 says `evals/`,
  `benchmarks/`, results tables. For a curation or maintenance pipeline the equivalent is
  the log it appends to and the state file it keeps: counts per mode, ring sizes, the
  empty separators at the top of a journal. This run's landing was a count (3,950 : 0)
  read off a log, corroborated by a size (2,728 : 200) read off the tree - no prose in
  the source states either.
- **A "list" that mirrors its references is a code repository by weight.** A plain
  shallow clone pulled 864 MB and timed out; `--filter=blob:none --no-checkout` plus a
  sparse checkout of markdown, then scripts, finished in seconds. Check the tree's
  extension histogram (`git ls-tree -r HEAD | sed 's/.*\.//' | sort | uniq -c`) before
  the first full checkout of any repository class.
- **Convergence can arrive from the fleet rather than from a second source.** The
  amendment's corroboration was a managed project that carried the identical rule pair
  (per-edit cap beside artifact cap) and the identical violation, found by grepping
  standing docs for stated size caps. For a *shape* finding, "does any managed project
  state the same rule?" is a corroboration lane that costs one grep and produces the
  apply seam at the same time.

## 1.6.0 - 2026-09-01 - matrix-rust-sdk
- **Per-PR changelog fragments outrank `docs/` in a repository that keeps them.** Three of
  four landings came from `changelog.d/*.fixed.md` files of 40-250 words, each a paid-for
  failure with its mechanism written by the person who paid, under a contributing rule
  that a fragment must read to an outsider. The Phase 2b sweep order puts operating
  documents first; for this shape the fragments directory belongs ahead of them, and a
  `*.fixed.md` glob is the cheapest first read in the tree.
- **An empty ingest body is a class signal, not a retry.** 597 landing words with zero
  body text on a repository URL is the vendor-repository class announcing that the clone
  is the source; spending a second ingest on it would have bought the README.
- **A rule inversion between two subjects is a technique, and the discriminator is the
  landing.** The source said a failed head must block its lane; `optimistic-write-path`
  said the opposite; both were right for their lane. Writing the question that sorts a
  lane (would item N still mean what its author meant if N-1 vanished) on both sides was
  worth more than either rule, and it is the shape the cross-bundle clause already
  prescribes - it applies inside one bundle too.
- **A `not-better` reached by structure is still a row.** The regain check had nothing to
  dirty in the only tree with a lease, because every loop re-reads the store per tick.
  That took one grep, produced the technique's own precondition, and cost less than the
  three `better` rows; the ledger wants it exactly as much.
- **Foreign WIP in a golden path routes the landing into the technique file.** Two of the
  four homes carried a sibling's uncommitted technique in the golden path; amending the
  technique file alone kept the commit clean and lost nothing, because the golden path
  already linked the technique. Check `git diff --stat` on every home before deciding
  between a new technique (needs the golden path) and an amendment (does not).

## 1.6.0 - 2026-09-02 - sherpa-onnx

- **Arm A is a source.** The baseline of a Phase 7.5 A/B - the connected tree exactly
  as it stands, run on the source's named failure case - produced this run's shipped
  fix and its strongest amendment, and neither the source nor the corpus nor the
  tree's own comments could have: the guard, its comment and the technique all said
  "empty is a claim" and the engine had never once produced an empty. When the
  connected project ships the engine class the source is about, run the baseline at
  Phase 6, before drafting; it is a first-party measurement at the top of the tier
  table for the price of one download and five runs.
- **A crate gate that fails in its build script is not a red gate for the change.**
  The project's test command stopped on a capabilities file naming an undeclared
  plugin permission, before any source compiled; the arms were run as a faithful
  standalone reduction under the same compiler, the pattern earlier applications
  against the same tree used. Record the gate's failure text in the row so the
  return condition is checkable, and do not let an unrelated red gate demote a
  `code` row to `experiment`.
- **Changelog-fragment focus, third data point: fragments can be triggers rather than
  content.** Here the 10,400-word per-PR changelog named one hazard in one line and
  the implementation supplied the rule; the fragments cost ~10,400 words for one
  pointer. The matrix-rust-sdk result (fragments as content) held because that
  project's contributing rule requires each fragment to be understandable outside the
  project; this one's fragments are PR titles. Read the fragment format before
  deciding whether the sweep is an extraction or an index.
- **A project pre-commit hook is part of the ship step.** The first commit attempt was
  rejected by the project's formatter hook; the fix was one formatter run, but a run
  that does not read the hook's output reports a commit that never happened. Verify
  in `HEAD`, as Phase 10 says - the hook is one more reason.
- **Do not append a long ledger row through a shell heredoc.** One append in this run
  was cut mid-sentence and the two after it never ran, silently, with the ledger lock
  still held. Write the row to a scratch file with the file tool and `cat` it in;
  then re-read the tail before unlocking.
## 1.6.0 - 2026-09-02 - sentry-self-hosted

- **A fleet tree can complete a source's finding instead of confirming it.** The source
  had a progress heartbeat and no ownership one; the apply seam had the reverse, with its
  coupling rule stated in a comment ("liveness must never wait on anything the work
  computes"). The amendment is the *split*, and neither side alone would have produced it.
  When the seam's shape is the inverse of the source's, write the discriminator - not an
  adoption, not a rejection.
- **The calibration case that moved a count was a row from the run's own output.** The
  planted checks (a merged proposal must not count; a single-proposal package yields no
  pair) passed and changed nothing. Reading the four rows the classifier returned found
  that three were a different mechanism (the bot rebuilding grouped proposals). Before
  writing a verdict, read the instrument's positive rows, not only its known cases.
- **The registry's own scripts are managed-project seams.** The not-better row against
  `link-registry.mjs` needed no cross-repo confirmation, ran in seconds, and *bounded* the
  technique (machine-owned regions are out of its scope). When a finding is about a tool
  the registry itself is, apply it here first.
- **On a packaging repository the "changelog fragments" are the step scripts.** The
  CHANGELOG is PR titles; the first-party unit that explains a paid-for failure is the
  install script with the issue number in its comment. The fragments-first focus should
  read "the smallest first-party unit that explains a failure", whichever file that is.
- Method edit deferred, deliberately: the calibration focus has met its own three-run
  check and belongs in Phase 7.5, but a sibling was mid-run on this version. A mid-flight
  run should do nothing about this; the next run alone on the board bumps to 1.7.0 with
  that one step added.

## 1.6.0 - 2026-09-02 - create-better-t-stack

- The changelog-fragment focus is class-conditional, and this repo showed the
  condition: a commit-generated changelog has no fragments, and the substitute that
  worked was the class's own advice (ADR, findings log, openspec design first). Read the
  focus as "fragments where they exist, else the operating documents", not as a rule
  that a repository without fragments is a thin source - this one produced two landings
  and a 52-million-case bound from documents the README never mentions.
- The Phase 1 lead check produced its first measurement, and it is about the *form* of
  return conditions rather than their age. Ten notes read; no condition fired by its own
  terms. The one lead that advanced did so because a source landed on it, and its
  condition was written as a registry action ("a debugging subject is forged, or a
  project adopts a postmortem template") - an event no source can produce. Conditions
  written as observable events a source CAN produce ("a second independent sighting",
  "a measured number") are the only ones a Phase 1 read can ever fire. Two-run
  hypothesis for the scorecard: classify each banked lead's condition as
  source-fireable or registry-fireable at Phase 1; if the registry-fireable ones never
  fire across three runs, rewrite them at the source note, not at the method.
- The Phase 1 scorecard read goes stale in a shared checkout. A sibling appended its
  row and a new declared focus between this run's Phase 1 and Phase 11, so the focus
  this run said out loud was one behind. Re-read the last row inside the ledger lock
  before appending, and say in the row whether the newest focus was applied. Cheap,
  and it is the same "re-read inside the lock" rule the ledgers already carry.
- Version stays 1.6.0: the previous lesson reserved the 1.7.0 bump for a run alone on
  the board, and this one had two live siblings. A mid-flight run should do nothing.

## 1.6.0 - 2026-09-02 - handy

- **The changelog-fragment focus generalises to "wherever the project stores its why".** This tree has no changelog directory; its paid-for failure records are module-level doc comments that open with the issue number (`//! ... (#502)`), and five of those produced both landings while 9,108 words of markdown produced none. The sweep order in Phase 2b should say "the first-party failure record, in whatever form the tree keeps it: per-PR fragments, issue-citing module headers, test names after a failure" rather than naming one form.
- **A paired test can amend the technique, not only the tree.** The A/B's arm A passed a case the technique said it must fail, because the runtime's HTTP client enforces the advertised length itself. The right landing was a caution inside the technique beside the checks, and the application carries the measurement. When arm A is right for a reason the seam did not build, that reason is a boundary the technique was missing - check for it before recording `not-better`.
- **A project's commit hook can be the apply step's second gate.** The consumer's doc-sync hook refused the commit until the coupled doc was updated in the same change; that is the project's own instrument enforcing the "docs synced same-session" rule this registry only states. Note it in `.ai/applied.jsonl` for the project - Phase 8 step 4's "a few lines a reviewer can read" now includes the doc line the hook demands.

## 1.6.0 - 2026-09-02 - monai

- **A source whose domain has no bundle can still be a three-landing run, and the class
  read predicts where.** Medical imaging yielded nothing and was never going to; the
  contributing guide, the deprecation decorator, the release notes' advisory list and
  one test helper yielded two techniques and an amendment. The sweep order's items 1
  and 2 (operating documents, then the instrument) found all three; the README found
  none. Nothing to change in the method - this is the method working - but the
  expected-yield line at Phase 2 should say "from the periphery" explicitly when the
  domain is foreign, so the operator does not read a domain-free triage table as a miss.
- **Phase 7.5's seam search across a fleet must be per-project `git grep`, never a
  recursive grep over the fleet root.** A recursive grep over eleven trees timed out at
  two minutes; ripgrep with excludes timed out at twenty seconds; `git grep` per project
  over tracked files, with lockfiles and markdown excluded by pathspec, returned every
  seam in seconds. The difference is untracked build output the ignore files do not
  cover. Worth a line in the Phase 7.5 step-1 text on the next version bump.
- **The apply step corrected the technique's operand, which the source could not.**
  The source runs a release train and its deprecation scheme compares versions; the
  first fleet seam had a version unchanged for fifteen months, so version arithmetic
  had no operand there. The technique now says "the unit the project actually advances"
  - written from the seam, before the technique shipped, which is the cheapest place
  that correction will ever be made.
- **A `not-better` reached without an instrument is still worth its row.** The numerics
  probe amendment was refuted by the substrate (no mode exists on a general-purpose
  double lane), and the condition became the amendment's closing paragraph - the same
  shape as the 2026-09-01 matrix-rust-sdk row. Two runs in a row have produced the
  technique's boundary from the tree's shape; that is the structural-fact step working
  on a negative, and the reason a simulation is the floor and not an excuse.

## 1.6.0 - 2026-09-02 - deer-flow

- **A total empty on a concept term is not evidence either when the corpus speaks a
  different house word.** `research-map "subagent delegation"` returned "the corpus has
  never heard of this" over a subject that owns dispatch, roster, harvest and the
  worker's failure anatomy under *session / member / worker*. The 2026-08-31 rule
  covers proper nouns (the purity gate guarantees the empty) and the 2026-08-22 rule
  covers near-empties (seams); this is the third case - a synonym gap - and the
  corrective is the same as the seam rule's: before trusting an empty over a concept,
  map on the corpus's own vocabulary for that concept, which the nearest category's
  golden-path opening states in its first paragraph. One extra call.
- **Changelog first: two rows now say trigger-not-content.** The sherpa row and this one
  both swept the changelog first and both found that it named every landing's mechanism
  in one line and supplied none of the rules; the operating documents (module guides,
  design specs) did. Not yet a SKILL edit - the previous lesson reserved the bump and
  the scorecard asks for three rows - but the shape to write when it lands: the
  changelog is the *index* into the operating documents, read first to choose which
  guides to open, and mined second, never alone.
- **The densest document in a 225k-word tree was one paragraph.** The delegated-work
  verifier's entire design - decidable leaves, UNVERIFIED semantics, provenance stamps,
  evidence bounds, the accepted boundaries pinned by a named test class - lived in a
  single 4,800-word paragraph of a module guide, not in `docs/`, not in a spec. The
  sweep order's item 2 ("the instrument and its rules") found it because the guide was
  read whole; a grep for the feature name would have returned the changelog line. Read
  module guides whole when a tree maintains them as the source of truth for agents
  (this one imports them into its assistant instruction file), because that is where
  the paid-for cases go.
- **A contradicted pick was the strongest landing.** The memory technique forbids
  inventing an expiry; the source assigns one to every fact. A pass/fail read would have
  dropped it. Asking which *field* each side was right about produced the amendment
  (expiry is the claim's, review deadline is the store's) and the consolidation
  inheritance rule beside it. Third run to confirm the 2026-08-21 rule; it is already
  in the method.
- Version stays 1.6.0: six siblings were live at claim. A mid-flight run should do
  nothing.

## 1.6.0 - 2026-09-02 - dora

- **Assert the seam-search instrument before believing its empty.** Two silent
  failures in one Phase 7.5: a recursive grep across eleven fleet trees timed out on
  its first pattern (the monai row already says so), and a `timeout`-wrapped ripgrep
  returned nothing for every project because the wrapper could not resolve the
  binary - exit 0, empty, on a corpus that holds the word in dozens of files. The
  catch was one command: search a word known to be present in a tree known to hold
  it, and read the answer before reading the real one. The method's own
  `gate-liveness` rule, applied to the shell loop that finds seams. Per-project
  ripgrep without the wrapper answered in seconds.
- **An experiment proves a policy, not a change, and the scorecard should count
  that ceiling.** Both experiments this run were honest A/Bs (a harness over three
  child shapes; a static census of two test populations) and neither could ship,
  because the change they imply is a few lines in a function the harness never
  called. The same session had the seam open and the harness written; substituting
  the product's function under the harness would have cost minutes and produced a
  paired proof against the tree. Next run's focus names it.
- **A source that documents its own timers' arming points is a first-party
  practitioner document even when it reads as reference.** The fault-tolerance
  page looked like API docs and carried the arming rule, the respawn-reset defect
  (from the audit) and the on-demand-channel warning - three failure modes
  somebody paid for, each written beside the knob. Reference pages that explain
  *why* a default is what it is belong in sweep item 1, not item 6.
- **Changelog-as-index, third row.** The Unreleased section produced one landing's
  entire content (the schema-version story, told three times) and the triggers for
  the enumeration-failure catch; everything else came from `docs/`. Three rows now
  agree: read the changelog first, mine it second. The sweep order in Phase 2b
  should say so at the next version bump; not applied here because seven siblings
  were live.
- Version stays 1.6.0: seven siblings live at Phase 7. A mid-flight run should do
  nothing.

## 1.6.0 - 2026-09-02 - openbao

- **An `experiment` needs the tree's parameters, not the tree's binary.** The
  lease-renewal A/B ran in a 60-line scratch harness against the engine with the
  project's own constants (busy-timeout, TTL, cadence) read off three `file:line`s,
  and it *inverted the source's remedy* - which a simulation would have argued
  the other way, because the argument is intuitive and wrong. When the seam is a
  storage engine, a scheduler or a protocol, the cheapest paired measurement is
  the engine under the tree's numbers; building the tree is rarely required.
- **Choose the apply seam to falsify, not to confirm.** Three of five rows were
  `not-better` this run and two of them are the most reusable output. Every one
  came from asking "where would this NOT hold" *before* picking the seam (a
  single-writer store for a pool-reservation rule; a display hook for an
  authority rule; a one-owner repo for an uninvited-agent rule). Written into
  the next declared focus; a third run confirming it moves it into Phase 7.5.
- **A source's changelog `security` category is a shape detector.** Four
  advisories with different components were one shape (canonicalize-once), and
  the shape was visible only because all 46 were read in one sitting, sorted by
  category rather than by date. Read the security fragments as a set before
  reading any one of them.
- **The reader-side technique was tested on this run by the source itself.**
  The tree's instruction file addressed this agent directly, with a canary. The
  method held (the file became a finding; nothing was obeyed), and the author's
  side landed as an amendment. A source that tries to instruct the run is source
  material of the highest yield, not a hazard to route around - but only under
  the flat-sibling scratch layout the technique prescribes, which this skill's
  Phase 2b already uses.
- Mid-flight runs on 1.6.0: nothing to do; no SKILL.md edit this run.

## 2.0.0 - 2026-09-02 - method redesign (operator challenge after twelve repository runs)

### Redesign proposal - applied

- **The measurement that triggered it.** Twelve consecutive runs over large systems
  (a secrets manager, a dataflow runtime, an agent harness, a medical-imaging toolkit,
  an error tracker, a chat SDK): 193 candidates extracted, 11 amendments, 6 techniques,
  0 subjects, 0 XL specs, 0 forge dispatches, 0 project changes larger than a few
  lines, 8 of 12 apply rows simulation or structural-only. The operator's read - "so
  many impressive repositories and took so little" - was confirmed by the scorecard
  before any method text was touched.
- **Root cause, in the method's own rules.** The unit of extraction was a sentence
  (Phase 3 records title/claim/anchor), so architecture never reached the triage
  table. Prior-art mapping against 1,100 techniques always found a neighbour, so the
  impact column read `amendment`, and Phase 7 said in so many words that the
  amendment "is often the higher-yield move and always the cheaper one". The
  unattended rule advanced `real gap` only, and a design decision always overlaps a
  subject, so it always read `partial` and was banked. Phase 7.5's budget was "at most
  the effort of the landing", written for a video, so the cheapest apply mode won.
  The scorecard counted landings without weighing them. And `/forge` - the engine
  built for exactly this shape - was never invoked, because nothing routed to it.
- **Six changes, all applied in this version.** (1) Phase 2d design read with a
  routing count; three or more unmodelled load-bearing decisions hand off to `/forge`
  (forge 1.4.0 accepts the design record as its Phase 0 brief). (2) `design` candidate
  shape with deferred strip test and a technique-or-subject default landing. (3)
  Applications written against the source tree itself. (4) Mechanical XL trigger:
  three design candidates with one home is a spec by construction. (5) `partial` rows
  get their promoting question executed in-run. (6) A `task` apply mode with a
  branch-first ship rule, a 3x repository budget for Phase 7.5, and a depth cell on
  the scorecard.
- **Mid-flight runs:** none live at the bump (board reaped, zero siblings). A run that
  loaded 1.6.0 finishes on it; its scorecard row has no depth cell and is read as
  `0/T/A/0/0`.
- **Replication owed:** one of last week's forge-shaped sources re-run under 2.0.0 as
  `--design-only`, its design record and routing count diffed against the 1.x note, so
  the version bump has a measured before/after rather than an argued one.

## 2.0.0 - 2026-09-02 - monai (second pass; the replication the 2.0.0 entry owed)

- **The before/after the bump owed, measured.** Same commit, same operator, twelve
  hours apart. 1.6.0: 15 claims, 3 landings from the periphery, 3 homeless leads,
  routing count not computable. 2.0.0: 11 design decisions, routing count 9, a forge
  handoff, 2 source-tree applications, 1 task row. The three homeless leads of the first
  run are three of the nine decisions of the second - which is the concrete form of the
  redesign's diagnosis: under 1.x a mechanism with no home became a lead, and a lead
  is where a subject goes to be forgotten. Nothing the 1.6.0 run landed was wrong; the
  design read simply reached the 40,000 words the claim read never opened (type
  docstrings, design pages, release-note rationale), so the two methods are
  complementary on one source and the design read should go first.
- **A forge handoff has a cost the method does not state: three agents' worth of
  session budget on top of the run.** The first scout dispatch died on a session rate
  limit with nothing returned, and the run stalled until the limit reset. Rule worth a
  patch line in Phase 2d: **if the session is near its limit, bank the design record and
  hand off `--design-only`; dispatch scouts only from a fresh budget.** The design record
  is the handoff; the scouts deepen it, and a banked record loses nothing but time.
- **The `verified_against` format is a gate, and a source-tree application has no
  fleet stack version to name.** `<stack>@<version>` was written for fleet trees; for a
  source clone the honest value is the source's own minimum runtime (`python@3.10` here,
  from its release notes), with the commit in a separate `source_commit:` line. A
  sibling run hit the same gate on four files in the same hour with a prose value. The
  Phase 7 (v2) row should say this in one clause.
- **Task mode needs a worktree, not a branch switch, on any tree with foreign WIP.** The
  project tree had two other sessions' uncommitted files; `git worktree add <short
  path> -b <run-branch>` gave the task its branch without moving anyone's checkout, and
  the plan plus the first step committed there. Same rule as the registry's, restated
  for the cross-repo lane.

## 2.0.0 - 2026-09-02 - openbao (replication of the 1.6.0 run at the same commit)

- **The replication owed by the 2.0.0 entry is paid, and it is a before/after not an
  argument.** Same tree, same commit, same day: 1.6.0 read 20 claims (0 with no
  corpus neighbour) and landed 5 amendments; 2.0.0 read 17 decisions in 7 record
  entries (6 with no corpus subject) and handed off 9 NEW subjects. The 1.6.0 run
  never opened the 37-RFC directory because nothing in 1.x asked for a design
  surface; Phase 2d asked, and three parallel readers covered 57,188 words in one
  pass. The design record's unit - decision/forces/rejects - is what made the NONE
  count possible; claims always have a neighbour.
- **Reader agents for the design read, scouts for the handoff - two different
  briefs, and the second needs the first as its input.** Readers return decisions
  with forces; scouts return where craft is embedded and candidate slugs. Dispatching
  scouts without the record produced code-quality drift in past forges; here every
  scout anchored to a record entry and one corrected it (an accepted RFC not landed).
  Candidate for the method: Phase 2d may fan out readers over a large design
  surface exactly as 2c fans out over references, director consolidating.
- **The depth cell has no value for "handed off, pending".** A handoff run reads
  `0/0/0/1/0` - indistinguishable from a run that found nothing - until the forge
  closes it. Proposal, not applied: a `H` column (handoffs open) beside the depth
  cell, decremented by the forge wave that executes one.
- **The taxonomy cap is the first thing a handoff hits, and the record should say
  so.** Nine NEW subjects cannot nest under a category that holds subjects directly;
  the placement constraint was written into the handoff before any worker exists,
  which is the 2026-08-22 lesson ("verify every structural claim against the
  authority") applied one phase earlier.
- Mid-flight runs on 2.0.0: nothing to do; no SKILL.md edit this run.

## 2.0.0 - 2026-09-02 - oh-my-claudecode

- **The XL trigger worked as a count, and the handoff rule collapsed into it.** Nine
  design entries, three `corpus: NONE`, one home: the forge-handoff threshold (three
  or more -> hand off to `/forge` scouts) and the XL trigger (three design candidates
  with one home -> one spec, one worker) both fired, and the second is the cheaper
  and correct reading when the NONE entries share a category. Say so in the routing
  section rather than dispatching a scout wave over a one-subject gap.
- **A sweep worker that dies on a rate limit should be retried once after the reset,
  not written off.** This run named the hook source as unopened and forged the
  applications from the hook *reference*; the re-anchor is now owed in the subject
  note. One retry costs minutes; the owed item costs a later pass.
- **The B arm is often already in a sibling tree.** The experiment's rule was copied
  from pumper's hook, which had it, into kp and ascent, which did not. Before
  inventing a B arm, grep the fleet for a tree that already implements the
  technique - it is a cheaper and more honest B than a first draft.
- **Changelog-first has its fourth row; promoted to the sweep order.** For a
  release-notes stub, the rule costs one sentence.
- Mid-flight runs on 2.0.0: nothing to do; no SKILL.md edit this run (the sweep-order
  promotion is a one-line patch edit the next run makes with the version bump, so two
  runs do not edit SKILL.md in one afternoon).

## 2.0.0 - 2026-09-02 - deer-flow (v2 back half)

- **A spec-scoped forge worker is the right size when the bundle exists.** The v2
  routing rule says "hand off to /forge" at three unmodelled decisions; forge's Phase 0
  scouts a whole repository into a bundle. When the XL trigger has already named one
  subject in an existing bundle, the handoff is one worker on that spec under the
  intake director (Phase 7's own XL path), and the bundle-level dispatch is for a source
  whose decisions span bundles or categories. Both are "the handoff"; SKILL.md should say
  which is which in the routing section - proposed as a wording patch, not applied here
  (five siblings live).
- **`verified_against` is `<stack>@<version>` and nothing else.** The v2 source-tree
  application rule says "`verified_against` only if you opened the tree" and does not say
  the gate's format; this run and the openviking sibling both wrote the commit into the
  field in the same hour and both were rejected. The commit belongs in the body's first
  line under the title. One sentence in Phase 7's application row would have saved two
  runs a gate round.
- **A rate-limited worker is resumable, and the folder is the state.** The forge worker
  stopped at the session limit with a "failed" notification while five techniques were on
  disk; on resume it turned out to have finished the sixth and three applications before
  the stop registered. Read the folder before re-dispatching; a second worker would have
  overwritten a finished subject.
- **The falsifying-seam focus produced its best result on the row that came back
  `better`.** The seam chosen to break the technique (two peers, no shared store) did not
  break the custody rule but exposed the delivery rule's failure in a tree that had
  built everything else correctly - a seam chosen to confirm would have read the
  custody half and stopped. Third row confirming the 2026-09-02 focus; a rule this file
  can carry at the next bump.
- Version stays 2.0.0: five siblings live. A mid-flight run finishes on the version it
  loaded.

## 2.0.0 - 2026-09-02 - openviking

- **The XL trigger fired on a count and the count was right.** Twelve design entries,
  five NONE, three with one nearest neighbour - and the neighbour was a *paragraph*
  (`agent-memory`'s shape hedge), not a technique. A hedge that names a force and owns
  no mechanism is the strongest "corpus: NONE" there is, because the corpus already
  argued the subject should exist. Read golden-path hedges as unfilled homes.
- **A resumed worker beats a redispatched one.** The forge worker died on a rate limit
  after writing the golden path and one technique; one message to the same agent
  finished the other three and the report, with zero re-reading. The reader that died
  earlier was not resumed and its slice was covered by director greps - which found the
  one thing the worker later overrode (a declared-but-unused constant), so the greps
  were not a loss, but the resume path is the cheaper habit and it is now proven twice.
- **`verified_against` is `<stack>@<version>` and nothing else.** Eight applications by
  three runs in one afternoon put the commit in that field and tripped the gate; the
  commit belongs in prose. One line in the application rule would end it.
- **A falsify-first row can be three rejections and still be the run's best apply
  column** - but only if each rejection lands its condition somewhere durable. Here one
  did it in the amendment's own text (the join that makes delete order moot), one in the
  technique's "when not to use" (audience is not counterpart), one in a ledger note
  (validation against the read set is the same property). The third is the weakest
  placement; a not-better whose condition lives only in a ledger is a lead wearing a
  verdict.
- **Docs that describe the previous implementation as current are a finding, not an
  obstacle.** The concept pages said parent bubbling was unconditional; the code at the
  same commit implemented the digest-and-ratio policy. The worker caught it by opening
  the anchor; a run that trusted the concept page would have landed the source's past
  as its present. For a repository, the design document is the *forces*; the code is
  the *decision*; read both before writing either.

## 2.0.0 - 2026-09-02 - dora (v2 re-run; first forge handoff)

- **The routing rule works, and the same tree proves it.** Under 1.6.0 this
  repository yielded four paragraphs; under 2.0.0 the design read counted four
  unmodelled decisions out of seven and the handoff produced a five-subject
  subcategory the same day. The v1 run was not careless - it opened the same
  documents - it simply had no row for a decision. Keep the routing count written
  before the decision; it was not close here (4 of 7) and the count made the
  handoff non-negotiable.
- **A handoff over a bundle that exists must run in an isolated worktree, and the
  method should say so.** A taxonomy entry with no folders reds the shared
  checkout's gate for every live sibling until the wave lands; the forge skill
  already says to use the harness worktree, but intake's handoff paragraph does
  not, and this run discovered it after the entry was written. Then the worktree's
  isolation refused writes to the shared checkout, so the ledgers had to wait for
  the exit. Sequence for next time: commit intake's own outputs to main first,
  create the worktree from local HEAD, forge and commit there, exit with keep,
  then persist on main.
- **One application per stack per technique is a real limit v2 did not
  anticipate.** The checker requires `<stack>--<technique>.md`, so a source-tree
  application for a technique whose slot another tree already holds cannot be
  written (D7 here: the rust slot on `terminal-state-recovery` belongs to a
  different tree). The design record is where that reconciliation now lives.
  Either the naming rule grows a qualifier or the method says "record in the
  design record when the slot is taken" - a redesign proposal for the checker,
  not for this skill.
- **The forge brief's golden-path budget is stale against the corpus.** A forger
  measured 162 golden paths (median 236 lines, p90 325) against the brief's
  120-220 and overrode it with the argument. The override was right; the brief
  should carry the corpus number or say "match the neighbour you read for voice".
- **Scouts corrected the design record on five entries, and one correction
  retracts a v1 catch.** The fault-tolerance page's recovery section describes a
  blanket boot-fail the code no longer does; the v1 run filed a catch against it
  (#5) as "the corpus says the opposite". The corpus and the code agree; the page
  is stale. A repository's operating documents are first-party AND can lag the
  tree - the class table should name "stale operating document" as the vendor
  repository's failure mode beside "the README is the ad". A design read that
  opens the code at the anchors catches it; a claims read of the page does not.
- **Rate limits are a fleet-scale cost now.** Eleven agent dispatches for eight
  that finished; every death was before the first write, so nothing was
  corrupted, but a wave that dies mid-write in a shared checkout would be worse.
  The worktree isolation is also the answer to that.
- **A forged subject from a system the fleet does not run has no seam, and the
  scorecard should expect it.** Five `unapplied` rows is the honest result; the
  focus paragraph proposes the source tree itself as the `task` target.
- Version stays 2.0.0: the method edits above are proposals; three siblings were
  live. A mid-flight run should do nothing.

## 2.1.0 - 2026-09-02 - the direction lane (operator design question, same day as 2.0.0)

- **The gap 2.0.0 did not close.** The pipeline could improve a path the project already
  has a context for, and could forge a sibling subject, but it could not propose a
  capability a project lacks entirely - because the registry map is a join from contexts
  to subjects, and a subject with no context never appears in it. Reforging cannot see
  it either: the same repository yields the same subjects.
- **Three pieces, all built.** (1) A `scope:` block in every fleet manifest (does /
  does_not / out_of_scope_categories / out_of_scope_subjects / directions_ledger) -
  drafted by the registry for ten projects, owner-edited from here. (2)
  `scripts/build-fleet-map.mjs` -> `librarian/fleet-map.json` + `.md`: the map of context
  maps (projects -> groups -> contexts -> governing subjects) and its inverse (subjects ->
  projects present / absent, each absence classified out-of-domain / out-of-scope /
  declined / deferred / accepted / candidate). (3) Phase 7.6 direction pass + the Phase 8
  lane split: coverage ships on the recommendation, a direction is a proposal in the
  project's `.ai/directions/` and waits for the owner's ledger row. Doc:
  `docs/fleet-map.md`.
- **First measurement, before scope blocks existed:** candidates per project ran 43-139
  (ten mapped projects, 348 subjects). That is the "tens per project" reading the design
  predicted - scope needs tightening, not a fleet missing a hundred features each. The
  number to track across the next runs is candidates per project after the owner's first
  scope edit; the second measurement (draft scope blocks in place) is in the 2.1.0 commit.
- **What is deliberately not automated.** "Does the project's scope admit the decision's
  forces" is a judgment; the proposal schema makes it reviewable, the cap (three per run)
  makes it cheap to decline, and the ledger makes a decline permanent. If the direction
  pass ever produces more accepted rows than declined ones, the cap is too high, not the
  judgment too good.
- **Next.** Five to ten repository intakes under 2.1.0 with a reflect after each, before
  the redesign is published. Watch: routing counts, handoffs executed, candidates per
  project after scope edits, proposals written vs accepted.

## 2.1.0 - 2026-09-02 - claudeception

- A repository under ten thousand words is read whole in one session - no workers, no
  sampling - and its commit log is the operating half: both paid-for failures (duplicate
  skills -> a contributed dedupe step; under-firing -> an every-prompt hook) were in commit
  messages and neither was in the body. Unshallow the clone before the design read.
- Gates that export their predicate as a pure function are the cheap experiment seams. The
  fleet's doc-sync hook exposes `evaluateEditedFiles(edited, map)`, so an A/B over 1,631
  recorded turns was one forty-line replay script. When Phase 7.5 looks for an experiment,
  grep the project's hooks for exported functions before designing a harness.
- Measure the corpus's suggested instrument, not only the source's claim. The technique
  text recommended a pairwise vocabulary lint; run on a real store it ranked the one true
  duplicate third of five. The source's trigger search was the control arm. The amendment
  is written from the corpus's guard failing, which is the stronger provenance.
- Stage shared ledgers by hunk, never by whole file - and re-diff in the same second as the
  add. An aborted staging here was re-run a minute later with whole-file `git add`, and the
  minute was enough for a sibling to append its rows to four ledgers; they went out under
  this run's commit, the sibling's own commit added them again, and HEAD carried every row
  twice until a third commit removed the copies. The partial-stage rule was applied to the
  subject note and not to the ledgers, because the ledgers "looked like mine".

## 2.1.0 - 2026-09-02 - gstack (round 1 of the 2.x calibration series)

- **The routing count worked, and it worked on a sub-tree.** The repository as a whole is
  a skill suite the corpus mostly models (instruction files, quality gates, memory,
  hitl); the count reached three only inside one subsystem (the browser daemon), and the
  handoff was scoped to that subsystem - one forge worker, one subject, not a scout wave
  over 840k words. Write that into Phase 2d: the count is per *system*, and a repository
  can hold several; hand off the system, not the repository.
- **The fleet map's grain hides technique-level directions.** `host-contract-compilation`
  implies a direction for the desktop app (its provider trait has one implementation and
  its scope says "wrapped CLIs", plural), but the app is *present* for the technique's
  subject, so Phase 7.6 - which reads only `candidate` absences at subject grain - could
  not propose it. Recorded as "not proposed" with the reason. Two-run hypothesis: if a
  second run hits the same wall, the fleet map gains a per-pair `techniques_absent` list
  (registry-map pairs already carry the subject digest; the technique list is in the
  index) and 7.6 reads both grains.
- **Source-tree applications are cheap and they are where the architecture went.** Three
  written in the time one fleet simulation used to take, each carrying a "where the tree
  falls short" section the tree itself admits. The gate wants `verified_against` to name
  the document's `stack`, so a runtime that is not the stack (a compatible one) goes in
  the body with the commit, not in the field.
- **The scorecard focus (a `task` row against the source tree for a handoff with no fleet
  seam) is executable only after the worker returns its deviations.** Sequence it after
  the forge review, not beside it.
- **Depth cell for this run** is the first with a subject and a handoff in the same row;
  read it against the 1.x rows over comparable trees (openbao, dora) before calling the
  method better - the comparison the user asked for is rounds, not runs.

## 2.1.1 - 2026-09-02 - hermes-agent (round 2 of the 2.x calibration series; Opus workers throughout)

- **The front half ran on an Opus worker end to end and the director's review found
  nothing to redo.** Class read (research-model release, argued against the vendor
  reading), a 14-document sweep with honest totals, 15 design entries with the golden path
  opened per `corpus:` line, per-system routing counts, seven promoting questions
  executed, a spec drafted in the template's shape with placement verified against the
  taxonomy (and the cap collision named). Spot checks by the director: three tree anchors
  held verbatim, the taxonomy counts matched, an uncapped concept map agreed with the
  NONE verdicts. **The method shielded the model**: nothing in the file depended on which
  model wrote it, and the parts the skill prescribes as mechanical (count per system, open
  the file, never a slug match) are where a weaker reader would otherwise have failed.
- **Per-system routing works, and it splits a repository three ways.** One system had
  three NONE with no home (forge); two systems had three NONE each with an *existing* home
  (technique triples inside those subjects, dispatched as briefs); one had two (stayed in
  intake). The rule from round 1 held without amendment. What round 1 did not anticipate:
  the technique-grain clusters are as large as the subject, and they need their own
  workers - four Opus workers ran in parallel, one per home subject, with disjoint write
  sets and the board claimed per subject.
- **The direction pass has a third shape: the peer comparison.** When the source is a
  peer of a fleet project (the operator: "very similar to what we do in personas... I would
  expect dozens of comparison points"), three proposals is the wrong cap. The right output
  is a comparison study in the project's own `.ai/directions/` - 30-45 points with a closed
  verdict set (`adopt` / `adapt` / `keep ours` / `different forces`), tests to initiate,
  features ranked, and the inverse list of what the project does better - with the top
  three features as proposals in the schema. Phase 7.6 should say: *peer source -> study,
  not cap*. Apply in the 2.2.0 bump after round 3 confirms it.
- **`verified_against` must be `<stack>@<version>` naming the document's stack** - learned
  in round 1, applied by every worker in round 2 because the brief said so. Put it in the
  forge brief once rather than in every dispatch.
- **Round-1 focus checks:** routing count named per system (yes: five systems, one
  handoff). Technique-grain directions blocked by grain: 0 this run, because the comparison
  study made the grain question moot for personas; still 1 from round 1. Not yet the second
  sighting the fleet-map change waits for.

## 2.1.1 - 2026-09-02 - portkey-gateway (round 3 of the 2.x series; Opus workers throughout)

- **A vendor repository with no rules page is a different sweep, not a thin source.** Step
  1 of Phase 2b returned nothing for the first time in the ledger; the front-half worker
  read the pipeline code as the operating documents and produced six design NONEs from
  ~5,500 lines against zero from 22,000 words of cookbook. The branch is now written into
  `references/source-classes.md` under the vendor-repository entry. Yield ratio to expect:
  about nine from code for every one from prose.
- **Per-system routing produced a third shape: no system clears alone, the cluster does.**
  Whole-tree count 6, per-system maximum 2, and four NONEs sharing one `HOME IF NEW`
  across four consecutive pipeline stages. The mechanical trigger's `HOME IF NEW` clause
  fired where the per-system count did not, and that is the right outcome - a scoped
  forge on one subject, three ordinary landings alongside. Phase 2d's text should say both
  counts are computed and either can fire.
- **The peer shape held for a second and a third project without a mid-run note.** The
  front-half worker was told to run the peer check and returned twelve seeded points; the
  study worker expanded them to 32 for tracklight and 13 for pumper, corrected one seeded
  point against the tree (pumper's retries default off, same as the source - a convergence,
  not a contrast), and found pumper's `capped_retry_sleep` had independently reached the
  source's hardest retry decision, so the fleet's own code became the reference the
  tracklight proposal cites. This is the second sighting of the peer shape; the 2.2.0 bump
  writes it into Phase 7.6.
- **Opus, round 3: nothing redone.** Five workers, five reports, one anchor the forge
  worker re-checked before claiming (the strictness key is in the validated schema), one
  seeded row corrected by the study worker, one slug the security worker argued against
  the subject's own naming idiom. The director's review found the same things it found in
  rounds 1 and 2: gate, purity, `use_when`, taxonomy order, one cited line - and nothing
  else. Three rounds is the threshold the skill sets for a lesson becoming a rule: **the
  method shields the model; Opus is the default worker for every phase but the review.**
- **A foreign restructure appeared mid-run without a board claim** (game-production's
  asset-production nested into four groups, 94 deletions and four new folders, no live
  record). The run's pathspec excluded it and the index/catalog were left uncommitted.
  The board only protects runs that claim; an operator's manual restructure is invisible
  to it. Worth one line in the board doc: claim a manual restructure too.
- **`verified_against` witness.** Two workers noted the tree's only node witness was a
  types package or a CI pin (20.x), and wrote the dispatched `node@22`. The rule should be:
  the version the tree WITNESSES (engines, CI, lockfile), not the one the dispatch guessed;
  write the witness source in the application's first paragraph.

### 2.2.0 - 2026-09-02 - applied at round 3 Phase 11

- Phase 7.6 gains the peer shape (comparison study, closed verdicts, cap on the ranked features); Phase 2d counts NONE per system AND the HOME-IF-NEW clause across systems; Phase 7 states the witnessed `verified_against`. Mid-flight runs: none live at the bump (board held only this run). A run that loaded 2.1.x finishes on it.

## 2.2.0 - 2026-09-03 - lightrag (round 4 of the 2.x series; first run on 2.2.0; Opus workers)

- **A worker that loses its network mid-run is resumed, not re-run.** The front-half
  worker and a nested reader both died on a DNS outage at the peer-check step, with the
  deliverable unwritten. One message to the same worker id ("the outage is over, resume
  from the peer check, write the file, do not re-read the tree") recovered fifty minutes of
  reading. The worker did the honest thing on its own: every anchor marked `[V]` (verified
  this run) or `[H]` (substance reported before the reader died, line number not
  re-verified), and the forge worker's brief then said "re-derive every `[H]` line
  number by opening the file" - it did, and found the line numbers had shifted. Rule for
  the director: on a worker failure, check for the deliverable first, resume second,
  re-dispatch last; and carry the `[H]`/`[V]` convention into every downstream brief.
- **Both routing clauses fired on the same cluster, and the record stated both counts
  first.** Whole tree nine or ten NONE, per system only one at three, HOME-IF-NEW three on
  that same system - the cleanest signal the v2.2 text describes, and the worker refused
  the repo-wide reading in the record's own words. No rule was needed mid-run. First round
  where that is true.
- **The peer shape held for a fourth project, on the opposite identity regime.** The
  peer's value here is the discriminator itself: the fleet project builds the same object
  registry-joined and gated, the source keys on the model's surface form, and the
  corpus's civic subject had already drawn the line in its own words. A peer that is the
  *other side* of a discriminator is worth more than a peer that is the same design.
- **Directions waiting: 8 proposals, 0 ledger rows** at Phase 1 (personas 3, pof 1,
  tracklight 3, pumper 1), all from the last twenty-four hours. Expected today; the
  round-4 focus counts it, round 5 counts it again, and a third unchanged count returns
  the cap.
- **The one thing the director did that a worker could not:** resume the failed worker,
  decide D1 out of the subject before the forge dispatch so two workers would not write
  the same stage, and choose the task deviation. Everything else was review.
- **Session crossed midnight.** `verified_on: 2026-09-02` on the subject's application
  was the dispatch's date; the forge finished on 09-03. Harmless, recorded.

### 2.3.0 - 2026-09-03 - the decision gate (operator request)

- Phase 7.7: every waiting proposal across the fleet shown as one multi-select per project at the end of an attended run; selected = accepted, unselected = declined, no third state; ledger rows and status lines written in the project; accepted proposals executed in the same session, one Opus worker per proposal in an isolated worktree on a `direction/<slug>` branch, gate verdict into `.ai/applied.jsonl`, branches left for the operator to merge. First gate: 11 shown, 9 accepted, 2 declined (a priced credential roster for tracklight; an entity-id grammar door for politicas), 9 workers dispatched. Mid-flight runs: none live at the bump.

## 2.3.0 - 2026-09-03 - rusttraining

- **A new source class: the doctrine corpus.** A repository whose value is prose it wrote
  *about* engineering rather than a system it built. Discriminating question: *is there a
  system here at all?* This one was 175 markdown files, ~217,000 words, one source file
  and a build tool. The v2 method routes a repository by its design decisions, and this
  tree has almost none — 6, all in the operational periphery. Reading it as a system would
  have produced nothing; the claim read was the whole run and it yielded a subject. **The
  routing count worked in the negative for the first time: it correctly said "do not hand
  this off."** Proposed for `references/source-classes.md`: expected yield is a high
  candidate count with heavy strip-test mortality, survival concentrated in chapters that
  state a boundary, and near-total loss in any chapter organised as a translation table.
- **Mortality is per-chapter, not per-source, and it is predictable from the chapter
  title.** Four readers independently reported the same pattern: chapters whose titles
  state a *judgment* ("when X isn't the right fit", "when elegance wins", "X is an
  optimization, not an architecture", "common pitfalls") survived the strip test; chapters
  whose titles name a *mechanism* died. Survival ran 26-40% by lane and ~1 sentence across
  three entire books. A future run over a teaching corpus can rank chapters by title mood
  before reading a word.
- **The strongest thing a source can give you is a stated hole in your own corpus.** The
  run's highest-value single landing (`deterministic-proxy-gate`) exists because
  `operation-assertion-gates` says, in its own text, that its axis offers two honest
  configurations, rejects both, and admits its escape hatch "does not hold the number."
  The source supplied the missing fourth resolution. **Phase 6's enumeration hunt should
  explicitly include "where does the target technique confess a limit?"** — a confessed
  limit is a better landing site than a missing opinion, and it is greppable.
- **A source that is wrong about its own costs is more useful than one that is right.**
  The book asserts its patterns are free and never states a compile-time, error-message,
  migration or onboarding cost in ~40,000 words — every "compile time" mention is a boast.
  The costs the new subject carries were found by reading *what the source does on the
  page*: a four-parameter type presented as the general case, ~55 lines of declarations to
  make four fields required, and a fabricated default inside the chapter arguing that
  defect away. **Reading a source's examples against its claims is a distinct extraction
  pass and it produced the differentiating half of the subject.** Worth naming as a step.
- **Two readers converging on one finding, unable to see each other, is the strongest
  triage signal available inside a single source.** The central finding (that
  parse-at-the-boundary had no owner) arrived independently from two different books via
  two workers. Deduped by author it is one observation — but it is the one the subject was
  built on, and neither reader alone would have argued for a subject.
- **The apply budget does not scale to a subject-sized landing, and the contradiction is
  now open.** 38 findings landed, 1 apply row written. The rule ("one project per finding
  per run") was written for a video yielding two or three findings. Prior 2.x rounds hid
  this behind small landings. Proposed correction is in the scorecard's round-6 focus: owe
  one row per *subject or amendment cluster*, not per technique.
- **Resume beats re-dispatch, and now has five-for-five evidence.** A session rate limit
  killed all five landing workers mid-flight. Every one resumed from its transcript with
  its on-disk work intact and finished correctly; the forge worker resumed with its golden
  path already written and produced only the seven missing techniques. **Zero work was
  redone.** The director's job on a wave failure is: survey the disk first, tell each
  worker precisely what is already on disk and what remains, then resume. Re-dispatch
  would have cost five full re-reads and risked duplicate files.
- **Tell a resumed worker what changed while it was dead.** Two workers were resumed into
  a checkout where neighbours had since started editing files adjacent to theirs. Adding
  "another worker is now editing X, re-read immediately before each edit" to the resume
  message is cheap and prevented a collision on two shared golden paths.
- **A worker that regenerates a shared derived artifact is doing the right thing locally
  and the wrong thing globally.** Three of five correctly refused to regenerate
  `index.json` and said so; one regenerated it. Neither is a defect — but the director must
  own the final regeneration *and* the `HEAD` check regardless, because the working index
  had by then absorbed four sibling runs' unlanded subjects. Both artifacts were left
  uncommitted. **The check that matters is not "is the index stale" but "does the index
  describe content that is not in `HEAD`."**
- **`build-index.mjs --help` is treated as a normal run and writes every index.** Reported
  by a worker who hit it. Harmless (output is deterministic from disk) but surprising, and
  it means an exploratory `--help` inside a parallel wave silently regenerates a shared
  artifact. Worth a guard in the script.

### Redesign proposal — not applied this round

**The scorecard's `Landed` column should separate a subject from its techniques when
reading the funnel.** This round reads `S1/T23`, and the 23 is not comparable to a round
that landed 23 techniques across 23 existing subjects: 7 of them are one coherent subject
forged from one spec by one worker, which is a different unit of work and a different unit
of risk. The depth cell already carries `S`, but the funnel sentence reads `T`. Proposal:
report techniques *inside a new subject* separately from techniques *added to existing
subjects*, because the second number is the one that measures whether the corpus is being
deepened rather than extended. Not applied — one round is not enough to know whether the
distinction changes any decision.

## 2.3.0 - 2026-09-03 - vllm (six-system forge wave)

- **Run Phase 7.5 BEFORE 7.6, and let a `not-better` row veto a proposal.** The direction pass ranks candidates by how many design-record entries a project is absent from; that ranking is a hypothesis, and this round three of its top candidates were refuted the moment the trees were opened - one already published counters and declines a scrape endpoint on the record, one already validates the lease invariant the source only states in prose, one already inverts its exposed-surface default. Under the current order those would have been three proposals an owner had to read and reject. Under the reversed order they are three apply rows that cost nothing and made the pass produce ONE proposal. The round-4 complaint that the pass "produces faster than an owner decides" has a mechanical fix and this is it.
- **A worker correcting the DIRECTOR is a success condition, and the brief should ask for it explicitly - it already does, and it paid twice.** One worker corrected a wrong `_laws.md` link depth in the dispatch; another corrected the design record's account of an eviction mechanism (the queue was already coarse recency, so reverse-order release is the tie-break WITHIN one release, and the intuitive answer for non-cacheable blocks is inverted). The second correction was only possible because the design record was written down BEFORE dispatch and handed over as the brief - a director's reasoning that stays in the director's head cannot be refuted. Amend the record in place when this happens; it is the artifact a later pass diffs against.
- **Read `taxonomy.json` for the CAP, not just for the category name.** The method already says to verify placement against the authority. This round the authority said something subtler than "wrong category": the bundle sat at exactly ten top-level categories, so the obvious move - a new top-level for a genuinely new domain, which is what the previous repository wave did - would have failed the gate and sent four workers into a rejected folder. The fix was a new SUBCATEGORY under an existing category. Phase 7 should say: count the children before proposing a new parent.
- **A boundary statement can refute a home faster than a map can find one.** A finding about guarding an untrusted expansion looked like it belonged in the limits subject. That subject's golden path explicitly disclaims it - it bounds work per unit time, "not whether the work is valid (validation's job)" - and the real home turned out to already own the mechanism, making the finding a boundary case rather than a technique. Reading the candidate's own stated scope is cheaper than `research-map --deep` and settled it in one read.
- **`research-map` is close to useless on a domain the corpus does not carry**, and the failure mode is the dangerous one: it returns confident, high-scoring, semantically unrelated hits driven by slug substrings ("page size", "state", "limit"). Every one of 24 terms returned a top hit from an unrelated subject. What actually established the absence was a concept grep over the whole corpus (three files, all client-side, all one subject). When a routing count is about to be written, the instrument is a grep for the CONCEPT, and the map is only a neighbourhood hint.
- **A defect found in the source has no outcome slot.** Three were found and verified in code this round - a lease sweep defeated by its own renewal, a deprecation stage plumbed and never read, a document contradicting its own implementation. Each is more valuable than most techniques and each ended as a lead in a source note, because filing upstream is outward-facing and unauthorized. The six outcomes have no row for "we found a real bug in the source". Either add one with an operator gate, or stop describing these as the run's best output while filing them where nobody acts on them.
- **The parallel rules earned their keep this round; two of three fired.** Siblings went 0 -> 2 mid-run. The index regeneration referenced three sibling slugs absent from HEAD, so index.json and catalog.json were held back; the gate went red on 18 findings, none mine, and was unlocked before investigation rather than after. A third case the method does NOT cover: a fleet project whose main checkout sat on **another session's feature branch** with uncommitted work. Phase 8 says commit a proposal "on the project's active branch" - but the active branch was a sibling's. The right move was to leave the proposal uncommitted and give the executing worker a worktree cut from the default branch. Worth a line in Phase 8: check WHOSE branch is active before committing into a project tree.

## 2.3.0 - 2026-09-03 - awesome-langchain (reference index, 211 refs, 198 of them repositories)

- **The reference-wave lane's per-reference fetch budget assumes a reference is a
  DOCUMENT. An index of repositories inverts that, and the inversion is detectable
  before a single lane dispatches.** 198 of 211 references here were code hosts. A
  ~2-fetch budget against a repository buys its rendered landing page, which is the
  one file in the tree written to be quoted - so the naive reading of the lane would
  have mined 211 READMEs and reported it as a bibliography's yield. **Corrective
  applied this run:** compute the class profile at step 2 (it is free - the URL host
  decides it), and when repositories dominate, wave workers get **clone briefs
  carrying the Phase 2b sweep order** instead of fetch briefs, with the clone under
  `<scratch>/<run-id>/refs/<name>`. Every lane confirmed the README was its least
  useful surface; one found ~46,000 words of in-tree operating documentation behind a
  ~2,000-word landing page. Wave size drops accordingly - a clone-and-sweep lane is
  heavier than a document lane, so 7 was right where the lane's cap is 8.

- **Annotation-based ranking has a false-negative class: the under-annotated
  primary.** The lane says to rank on the curator's annotation, and that is right, but
  a five-word annotation on a substantial reference is indistinguishable from a
  five-word annotation on a toy. This index annotated a paper-backed project with a
  function-calling benchmark as "An API store for LLMs" - five words - and my
  signal filter dropped it into band B. **Corrective:** after ranking on annotations,
  run one free second pass on *repository shape* - an academic or lab org in the
  path, a benchmark or leaderboard in the name, a `paper`/`citation` file - and
  promote on that. It costs no fetch and it is exactly the signal the annotation
  destroyed.

- **`[H]`/`[V]` carried into a downstream brief prevented a corpus inversion. This is
  the second sighting; a third promotes it to a SKILL.md rule.** Round 4 established
  the convention after a worker died mid-read. Here it did something stronger than
  preserve precision: the wave worker's headline comparative (judge-free scorers
  "consistently outperform" judges, with a figure pair) was marked `[H]` because it
  came through a fetch summarizer, the forge brief said re-derive or drop, and the
  re-derivation found the claim **backwards** - a model judge was the best
  non-ensemble scorer in 11 of 24 scenarios. Unmarked, it would have become the
  premise of a new subject, with a citation that looked solid. **The proposed rule:**
  a numeric or comparative claim marked `[H]` may not enter a landing; re-derive it
  from the primary or cut it, and make that the forge worker's FIRST task rather than
  its last, because the subject's argument may have to be rebuilt around the answer.

- **A spec that cites "A / B" as one document invites a re-derivation against the
  wrong artifact.** My own spec wrote a preprint id and a journal id as a single
  citation; they were two different documents, and the experiments were in neither at
  the named location. The forge worker found this and spent its budget correctly
  anyway. **Corrective:** one document per claim in a spec's citation, and say which
  claim each document carries.

- **A repository clone on this platform can silently check out a fraction of its
  tree.** One lane's first clone produced 72 of 1,709 files with no error and no
  non-zero exit; a sweep over that tree would have reported absences from an
  incomplete checkout, which is the worst kind of wrong because it looks like a
  finding. **Corrective:** clone with `-c core.longpaths=true`, and have every
  repository lane report its file count in its return so a truncated tree is visible
  to the director.

- **A shared checkout breaks "the gate is the review".** Three sibling WIP subjects
  turned the global gate red mid-run on files this run never touched. The method
  already says to unlock and report rather than fix; what it does not yet say is what
  to verify against instead. **Corrective applied:** grep the gate's error list for
  your own paths and require zero *there*, and never commit a shared artifact
  (`catalog.json`, another bundle's `taxonomy.json`) whose regeneration would carry a
  sibling's half-written subject into `HEAD` under your name.

- **A triage gate whose option count is smaller than its cluster count silently
  untriages the remainder - and that is a method bug, not an operator choice.** I
  tabled six clusters and asked a question with four options; cluster F never appeared
  on the ballot and therefore carries no operator judgment at all. It went into the
  source note's untriaged table with its anchors, which is the correct handling, but
  the correct *prevention* is: when clusters exceed the options a single question can
  carry, either split into two questions or make one option explicitly "the rest, as
  a batch". A cluster that reaches the table and not the ballot is invisible to the
  operator and looks, six weeks later, exactly like a decline.

- **Three projects testing one technique produced three different `not-better`
  reasons, and all three were boundaries rather than refutations.** `similarity-keyed-admission`
  came back not-better from all three trees for three unrelated causes - a reject arm
  carrying unrelated side effects, a normalization equivalence class, and a
  projection-scoped memo - and each one sharpened the technique instead of weakening
  it. The method says two `not-better` rows from different projects demote a technique
  to a lead. **That rule needs a discriminator:** demote when the rows say the
  mechanism did not help where it applied; when they say the precondition was absent,
  the rows are boundary work and the technique gets a scope section. Distinguishing
  them is the difference between a technique that is wrong and one that is merely
  narrower than its first draft.

### Redesign proposal - the apply lane should run per technique across projects, not per project across techniques

This run dispatched one lane per project, each carrying every finding. It worked, but
the value concentrated in a way that suggests the other axis is better: the three
independent `not-better` returns on ONE technique, from three trees, were worth more
than any single project's full sweep, because together they mapped the technique's
boundary from three sides in one round. A per-technique lane would also make the
method's "two not-better rows demote to a lead" rule checkable inside a single run
instead of across runs. The cost is that each lane must then open three trees rather
than one, and loses the per-project context that produced this run's best structural
facts. Not applying it now; proposing it for a round where a run lands few techniques
and wants them tested hard rather than many and tested once.

## 2.2.0 - 2026-09-03 - microsoft-mcp

- **The routing count is not a proxy for "needs a forge", and v2.2 already knew it.** Per-system NONE came in at 5/4/6 with a whole-tree 15 - met twice over - and the correct answer was still technique-grain, because nine of the fifteen home into a subject the corpus forged in August. The clause that decides it is "a system at three or more with an *existing* home is a technique triple inside that subject", and it did the work without a mid-run rule. Rounds 1-4 all handed off, so it is worth saying explicitly: **a high count over owned ground is a sign the corpus was right about where the material lives.** No skill edit; the text is already correct.
- **Phase 7 is where a technique gets tested, not Phase 6.** The four source-tree applications forced five corrections to technique text that four writers had already reported clean, and every one came from opening the tree with a specific hunt rather than from re-reading the corpus. The strongest: a uniqueness gate that greps for a declaration form the codebase had refactored away, so it matches nothing, reports "0 violations", and has been green forever - with a placeholder identifier from a test fixture shipping on a real capability underneath it. That is a `vacuous-by-evaluation` specimen the technique had to absorb as a clause ("enumerate from the constructed surface, not the source text; a gate that finds no identifiers is broken, not passing"). **Candidate rule if round 6 repeats it:** the application is written before the technique is believed, and the run budgets director time to revise technique text after applications land.
- **A sibling's `git add -A` was observed from the victim side for the first time.** Commit `568118f` swept six of this run's in-flight files into another run's commit: two ledger appends, two subject notes, a golden-path edit and a whole amendment. **Nothing was lost and every gate stayed green**, because the gates check presence and the board checks intent - neither checks authorship. The run only noticed because six expected paths were missing from `git status`. The anti-pattern is already in the method from the perpetrator's side; the cheap defence for the victim is one extra command at Phase 10 - confirm the content is in `HEAD` under *this run's* commit, not merely in `HEAD`.
- **The directions ledger is not machine-portable, which makes the round-5 focus unanswerable as written.** The focus asked how many proposals are waiting; on this machine the honest count is zero observable, because rounds 2-4 committed their twelve proposals into project checkouts that exist only on the other box. A ledger whose rows live in per-machine checkouts cannot be counted from a second machine, so the cap it feeds ("one per project until an owner decides") is being set from a number nobody can read. The run applied the cap anyway on the conservative reading. **Redesign proposal, not applied here:** the fleet map already aggregates per-subject state centrally; direction *status* belongs beside it in the registry, with the proposal body staying in the project.
- **A tree refuting an amendment is worth more than a tree confirming it, and this is the second round running.** The `cross-boundary-propagation` amendment said only fields with a grammar may cross a trust boundary. Applied to the fleet's observability service that rule would have deleted a shipped feature - opaque trace ids, pinned with tests the same morning by another session. The correction is that grammar-validation and bounding are **separable**: for an identity field the bound is the whole defence and the grammar is unavailable by design. The director caught this *before* dispatching the apply worker, by reading the target's recent commits; a brief written from the corpus alone would have had the worker implement the wrong half and then argue with a passing test suite. **Reading the target tree's last few commits before writing an apply brief is cheap and it changed the outcome.**
- **The peer study corrected the corpus upward again.** pumper's cassette layer grades replay fidelity as a three-valued fact about the *app's code* rather than the cassette, carries the grade on the result so a partial replay cannot read as full determinism, and refuses the unreplayable case at the door. The technique had the seam-as-precondition rule and no way to say how much of a green was actually recorded; it now carries the grading rule cited to `count-carries-predicate`. Two of the last three rounds have had a fleet project improve a technique rather than receive it - the `not-better` row is earning its billing as the most valuable one in the ledger.
- **Worker rate-limit deaths: check, then re-dispatch clean.** Two workers died mid-run on a session limit. Both were checked for partial deliverables (neither had written anything), then re-dispatched with the same brief, and both succeeded. Checking first is what makes the choice between resume and re-dispatch cheap; a resume would have been wrong here and would have carried a poisoned context.
- **Mid-flight runs on an older version: nothing to do.** No `SKILL.md` edit accompanies this entry, so a run that loaded 2.2.0 earlier today should finish on it.

- **A dispatched worker's scratch discipline is the director's problem, not the
  worker's.** The brief told the forge worker where to clone and said nothing about
  where to put anything else, so the papers it downloaded to re-derive a claim landed
  in the scratch **root** — outside this run's directory, where Phase 9's
  delete-by-run-id could not reach them and where a sibling sweeping the root would
  have taken them. Nothing broke here because the director noticed at cleanup, but the
  rule the method already states for its own files does not currently propagate into
  briefs. **Corrective:** every dispatch that may write anything names one directory,
  `<scratch>/<run-id>/`, for *all* of the worker's artifacts — clones, downloads, temp
  files — not just for the clone.

## 2.3.0 - 2026-09-03 - voicebox

- **The direction pass has been writing to a path no project reads, for three rounds.** Phase 7.6 says `.ai/directions/<date>-<subject>.md`. The fleet's peer project declares only `contextIndex`, `memory`, `evals` and `guardrails` under `paths:` in its manifest, its doctor resolves only those, and its real, populated directions lane is `.perfect/directions/` (14 files with their own frontmatter schema). So the 12 proposals rounds 2-4 counted as output landed where nothing enumerates them — which is the exact and complete explanation for the round-4 scorecard's puzzle of "12 proposals, 0 ledger rows". **A proposal in an unread directory is worse than no proposal, because the scorecard counts it as work.** This run relocated its study to the read lane and rewrote the frontmatter to that lane's schema. The method edit this implies is in the next bullet.

  ### Redesign proposal
  Phase 7.6 must **resolve** the directions directory rather than hardcode it: read the project's manifest `paths:` block, then look for an existing populated `*/directions/` directory, and only fall back to `.ai/directions/` if the project has neither — recording in the source note which of the three applied. The same resolution belongs in Phase 7.7's gate, which reads "every proposal with `status: proposed` across the fleet" and today would enumerate a directory that is empty in every project. Not applied this run: it changes a phase two other live sessions are executing from, and the round-6 focus can carry it with the evidence attached.

- **A `[V]` anchor mark is a claim about a file, and it is not free to trust.** Two front-half readers returned line ranges marked verified that do not exist — `:164-172` in a 108-line file and `:43-68` in an 82-line file. Both were caught only because a downstream forge worker opened them while drafting. The cheap fix is mechanical: a reader that marks `[V]` should have the range inside `wc -l`, and a brief that says so costs one sentence. The expensive fix — every downstream worker re-opens every anchor — happened by luck here and should not be the plan.

- **Resume beats re-dispatch, and the check is "did it write", not "how far did it get".** Two Opus workers died mid-flight on a session rate limit. Both had read their briefs and every neighbour subject; neither had written a byte. Resuming cost one message each and preserved the whole reading context; re-dispatching would have paid for two full neighbour reads again. The rule that made this cheap was checking the working tree for their deliverables *first* — the answer ("nothing written, context intact") is what selects resume over restart.

- **`run-board.mjs check` under-reports contention and `list` does not.** `check` returned `clear` for `mcp-tools` and for `dependency-declaration` while `list` showed live siblings holding both, twice in one run. The run only avoided writing into a contended golden path because it read `list` as well. Until `check` is fixed, treat its `clear` as "no information" and read `list`. (The contended-subject procedure itself worked exactly as written: the technique file landed, the golden-path edit was handed to the director as a patch, and the director applied it under the `content` lock in four edits.)

- **A commit can carry a crafted blob when a shared file holds a sibling's line.** `taxonomy.json` acquired both this run's subject and a sibling's, and the sibling's directory was still untracked — so committing the file wholesale would have put a reference to a nonexistent subject into `HEAD`. Staging a blob built from `git show HEAD:<path>` plus only this run's insertion, via `git hash-object -w` and `git update-index --cacheinfo`, then committing the index with **no pathspec** (a pathspec commit re-reads the working tree and would have defeated it), landed exactly one line. Worth knowing: the pathspec habit and this technique are mutually exclusive, and the `commit` lock is what makes the no-pathspec form safe.

- **Choosing seams to falsify produced four `not-better` rows out of twelve, and they are the run's best output.** Every one bounded a technique with a precondition that is absent in a real tree: an engine class that has no stop token to miss cannot run away; a view that is not throttled gains nothing from relocating its stream; a bundler that does not strip sources has no exposure to the constructs an adoption audit hunts; a satisfiable constraint set does not need a resolver bypass. Three of the four turned out to be operational restatements of a boundary the technique had already published in prose — which is itself the finding: **a published boundary that has never been measured is a hypothesis, and measuring it is cheap.**

- **A negative application beat every positive one this run.** The source implements exactly one of a technique's four rules and none of the other three, so the defect that technique exists to prevent is still reachable in shipping code at a nameable line. That document is worth more than the three confirmations landed beside it, and the worker's own judgement — that it slightly undersells, deliberately, because no frequency was measured — is the right register. The honest lever on a negative application is a measurement, not a stronger adjective.

- **Reading the source's own agent skills against its code found the run's sharpest untriaged candidate.** The tree ships four machine-executable maintenance skills; the extension skill claims "zero per-engine dispatch points" while four dispatch chains sit in the file it names, and the one machine-enforced registration point is a schema regex listed as one bullet among fifteen. Asking of a repository "what does the procedure demand that the code does not enforce, and what does the code enforce that the procedure never mentions" is a question only a repository can be asked, and it should be a standing ask in the periphery lane rather than a one-off in this run's brief.
### 2.3.1 - 2026-09-03 - merge after the gate (operator rule)

- "Once the activity is approved we do not need a second human gate": a direction branch whose gate ran green is merged by the director in the session, `--no-ff`, never pushed; red or un-runnable gates stay branches with the reason. Applied-ledger conflicts between sibling branches resolve by union. First application: all nine 2026-09-03 branches merged (two needed the union rule; one project had a concurrent session's uncommitted ledger rows, committed first as their own change; one had the ledger untracked in the main checkout, unioned after the merge).

## 2.3.1 - 2026-09-03 - kube-rs (round 5 of the 2.x series; Opus workers; two operator-named dimensions)

- **When the docs are doc comments, the sweep order inverts.** The front half counted 49,580 words of `///` and `//!` against 19,885 words of markdown (16,411 of it changelog) and treated module docs as the docs tier. A `*.md` sweep would have read 7% of the first-party prose. The class table now needs a row-level rule for this shape: count both before choosing the tier order.
- **The HOME-IF-NEW clause can fire alone, and the director can widen it.** No system reached three NONEs (max 2), but four entries across three systems shared one home-if-new; the front half proposed one subject, and the director, reading the taxonomy (operations at two subcategories, service-operations at eight of ten), created a subcategory and declared three subjects, then dispatched one worker per subject. Two of the three were promoted from PARTIAL technique candidates (A2, B1) whose forces did not fit their nominal homes. The gate stayed red on "assigns X, which has no folder" until the last worker landed, which is the right signal for a mid-run authority change.
- **Convergence corroboration from two peer studies is a landing, not a lead.** Two independent trees (kp's chart probing the root page beside an honest serving endpoint; the source's one-shot readiness gate) showed the same absence in `health-checks` - no readiness/liveness asymmetry. The method's convergence rule (two independent sightings, no fetch) authorized the director to land it in-session. One sighting (the craft worker's two candidates) stays a lead.
- **List the directory before writing to a slot.** The craft worker wrote an application to a slug that already existed and overwrote it, then restored it byte-identically from a sibling worktree. The brief said the slot; it did not say to list. Rule for the forge brief: an application slot is claimed by `ls applications/` first.
- **Seeded points are hypotheses; the studies corrected fifteen of them.** Four studies over 119 points corrected 15 seeds against the trees, including two that inverted (tracklight does use the ignore attribute; pumper's dedup is server-synthesised). The seed list is worth keeping because the corrections are the study's highest-value lines.
- **The fleet config can hide the best peer.** gravitone carries the most advanced cluster surface in the fleet and is absent from `projects.json`; the fleet map therefore never listed it. A direction pass keyed on the map cannot see what the map does not hold; the lead is filed as a registry-hygiene item, not an intake one.

## 2.2.0 - 2026-09-02 - gemini-3-8-flash

- **A release note does not carry an API identifier, so for this class the
  first fetch is the extraction and not corroboration.** The post named the
  model in prose only; the id, the absence of a Lite variant, and three
  SHUT-DOWN ids all came from the model list. The shut-down list was worth more
  than anything in the announcement - two fleet projects were calling retired
  ids and returning 404s in production, which no amount of reading the post
  would have surfaced. For a vendor release announcement, budget the docs fetch
  before triage, not after.
- **A model can be callable before it is documented.** On release day the model
  list carried the id while the spec table carrying input modalities did not
  exist. "The id is live" and "I know what it accepts" are different facts with
  different dates, and on a vision seam the gap between them is the difference
  between an upgrade and an outage. This is why the run went one fetch over
  budget, and it would again: a capability check before shipping into someone's
  tree outranks budget purity. Either the budget carves that out or it stays a
  soft limit runs are expected to break with a recorded reason.
- **A fleet-wide sweep is a run shape this method does not describe.** The
  operator's ask was "find every project holding this fact and update it",
  which has no Phase. What worked, and is worth writing up as a lane: enumerate
  the seam with one grep per project; classify every hit as active-default /
  historical-data / measured-baseline / normalization-rule, because only the
  first is upgradable and the other three are corrupted by a blanket rename;
  then let each tree's own record veto. Three of nine projects declined on
  evidence they had already written down, and every one of those refusals was
  worth more than the edit would have been.
- **The best corroboration was two fleet projects disagreeing in prose.** Both
  had booked a promotional rate, in opposite directions, each with an argued
  comment. Neither was wrong; they were answering different questions with one
  field, and the disagreement handed over the discriminator the technique
  needed. A contradiction between two trees is as good as a contradiction
  between a source and a primary, and it costs no fetch. Look for it: the
  fleet is a corpus of realizations, not just a place to apply findings.
- **The strongest finding was a guard that stayed green.** A rate table keyed
  by the constant naming the current model passed its own completeness test
  through a tenfold mispricing, because the key followed the rename and the
  number did not. Phase 6's hunt for what a subject "mentions in one place and
  measures in another" has a sibling worth adding: **ask what a passing
  assertion would still permit.** The A arm is where that is visible, and only
  as a silence - so read what A did NOT fail, not only what it did.
- **Write bytes, not text, on Windows.** Python text-mode writes flipped LF to
  CRLF and turned one-line edits into whole-file diffs in two projects. Caught
  only because `git diff --stat` looked wrong; `--ignore-cr-at-eol` confirmed
  it. Read the file's own ending, write with `'wb'`, and check the stat before
  every cross-repo commit.
- **Verify a number before writing it into the scorecard.** The directions-
  ledger count went in from memory of the previous row's worry (9 waiting, 0
  decided) and was wrong: 30 proposals across six projects, 11 ledger rows.
  Corrected in place, and it reverses the conclusion - owners are deciding, the
  pass is not outrunning them, and the cap does not return. A focus item that
  says "count X" is not answered by recalling what X was last round.

## 2.2.0 - 2026-09-03 - emdash

- **A repository can fire the routing clause twice, and the per-system count is what
  makes that safe.** Whole-tree NONE was 14; per system it was A2/B5/C6/D0/E1. Read
  whole-tree, this would have been a repository-wide scout wave over 347k words. Read
  per system, it was two scoped forges with a stated boundary between them, each with
  its own spec, each executed in-session. Two handoffs from one source is not a budget
  overrun when the systems are genuinely separate — but the boundary sentence between
  the siblings has to be written into BOTH specs before dispatch, or the two workers
  will each absorb the other's half. Both specs carried it and neither drifted.

- **Walk the neighbour technique's own table before deciding it is prior art.** The
  finding that decided the larger subject was not a slug miss: `operator-tier-code-loading`
  *does* cover extension loading, and a slug-level read would have called it a catch.
  What made it a subject was reading its two-row table and noticing that the second
  row's absolute ("may name code: never") is justified by a stated precondition, and
  that the source falsifies the precondition on purpose. **A rule with its reason
  written down is a rule you can find the boundary of.** This is the enumeration hunt
  applied to a table rather than to prose, and it is the third consecutive run where
  the hunt carried the yield.

- **The most valuable apply row was the rejection, and it inverted the technique rather
  than qualifying it.** A fleet project had independently solved the same problem at the
  *opposite polarity* — truncating the adverse verdict where the source truncates the
  admitting one — so applying the technique as written would have produced the exact
  inversion it exists to prevent. The generalisable move: when a seam already implements
  the mechanism, do not score it as "already covered"; ask which *end* it implements and
  whether the technique's prose committed to one. Ours had, in its title sentence.

### Method note, not yet a rule

- **The ship-scope question does not cover Phase 7.6.** It is asked at Phase 5 as "which
  trees may I touch if an apply row comes back `better`", which is a 7.5 question. A
  direction proposal is also a write into a project tree, and this run found a real
  latent defect in a project the answer had not named (a module-scope memoised promise
  on a runtime that tears down request contexts) and could not deliver it. Recorded as
  round 6's first focus item rather than edited into Phase 5 now, because one sighting
  is a lesson and three is a rule — but this one has a cheap fix (widen the wording) and
  a real cost (a defect sat undelivered), so it should not wait for three.

### On the director's own errors, which were the run's only real failures

- Three, all mine, all caught by an instrument rather than by rereading: an arm-B draft
  that was **worse than arm A** for a live run holding a short lock (the fifth control
  caught it — a control set that only confirms the change is not a control set); a
  **fabricated version witness** in two applications, citing a `package.json` engines
  floor for a repository that has no `package.json` (the gate caught the format, not the
  fabrication — I caught that by grepping for the field I had just cited); and a
  `use_when` completeness check written as `grep -L` with `-q`, which is contradictory
  and reported every file missing. The third is the one worth generalising: **I used a
  broken instrument to contradict five workers' reports and briefly believed the
  instrument.** The method already says never establish an absence from a truncated or
  piped result; this adds that a *contradictory flag combination* fails the same way and
  is harder to see, because it produces confident output rather than empty output. Assert
  the instrument against a known positive first — one file that certainly has the field.

### 2.3.2 - 2026-09-03 - one worker per project when proposals share files

- The second gate accepted eleven of eleven across four projects, and in every project
  the accepted proposals overlapped on a file (kp: all three touch the chart checker;
  pumper: the claim statement and the error enum; tracklight: the chart; personas: the
  execution path). Eleven worktrees would have produced eight merge conflicts for the
  director to resolve by hand. Four workers, one per project, executed their proposals in
  order on one branch with one commit and one applied row each; four `--no-ff` merges,
  zero conflicts. Verdicts: 11 better (one with its replay marked unmeasurable inside the
  row because the backup it names is not on this machine). Pre-existing red on the
  project's own main (a stale rustfmt file, keychain tests) does not block the merge; the
  worker names it and leaves it.
- Workers corrected proposals against the tree again: personas' trigger id is NULL for
  scheduler-spawned rows so the key reads the event source; pumper's "186 flattening
  sites" was workspace-wide, 18 by the guard's rule. A proposal is a spec written from a
  study, and the worker's first job is to re-open every anchor.

### 2026-09-03 - gravitone onboarding and the third gate (kube-rs round, closing)

- **A fleet slug can name the wrong repository.** `gravity` resolved to gravitone-gcloud (the content studio) and `librarian/projects.md` called that same row `gravitone`; the TTS service at kiro/gravitone had no slug at all. The fix was an onboarding, not a rename: a new slug, a manifest with a scope block, the owner's own context map read by the registry-map builder (nested groups shape; 78 contexts), and a first direction pass. Check the remote of a checkout before trusting its slug.
- **Onboard from the remote's HEAD, not the local clone.** The local gravitone was 190 commits behind and the remote had moved the app under `gravitone/`; a context map and three proposals written against the old tree had to be re-pathed after the merge, and the first execution worktree was thrown away. Fetch before the first read of any project that is new to the fleet.
- **When the worker lane is overloaded, the director executes.** Five consecutive worker launches died on server overload (both models). The gravitone directions were executed in-session by the director with the same discipline (one branch, one commit and one applied row per proposal, the measurable run, the gate run); the tracklight upstream merge (14 conflicted files, 385 remote commits) was resolved the same way. Nothing in the method requires a subagent; the subagent is the parallelism, not the correctness.
- **Shipping is a gate per project, and three of them were red for reasons that were not ours.** politicas' pre-push typecheck failed on a missing local dependency (`npm install` fixed it); personas' golden-path census rose on five rules across the merged directions and stays unpushed until fixed or deliberately ratcheted; systedo-case's gate fails on another session's incomplete model-rename. A push is reported per repository with the reason, never forced past a hook.

## 2.3.2 - 2026-09-03 - chatterino2

- **Workers must write each file the moment it is drafted.** Two session rate limits
  killed eight landing-worker attempts mid-flight in one run. The first batch, briefed
  the usual way, left nothing on disk; the re-dispatched batch, told to write as it
  drafted, left every technique, application and amendment in place and the director
  finished the last three items with one small worker and a few `sed` lines. Draft-in-
  head-then-write-at-the-end is the shape that loses a whole worker to one 429; the
  brief should say so by default (proposed for the next version's landing brief).
- **Model substitution is a scorecard fact, not a failure.** Three Opus dispatches
  returned 529 before writing anything; the run continued on Fable for every worker and
  the front half as a fork. Record the substitution in the row and let the depth column
  judge it - here the landings were as deep as the previous round's and the director
  caught the same class of worker gaps (a missing frontmatter line, an unregistered
  stack) it would have caught either way.
- **A not-better simulation is the apply lane's best output, and it must edit the
  technique in-session.** `applied-defaults-ledger` came back not-better on a tree whose
  migrations are idempotent replays over structure; the boundary that resulted ("the
  ledger is for shipped sets of user-editable values; for structure, keep the replay")
  is sharper than anything the source could have authorized. Phase 7.5 step 3 already
  says the technique gains an amendment; the lesson is that it happens now, while the
  three cases are open, not as a banked row.
- **The landing worker refutes the front half, and that is the review working.** The
  design read said a failed catch-up was silent in the source; the worker re-opened the
  anchor, found the failure stated by a shared error handler, and found the real omission
  (a catch-up returning exactly its cap says nothing about truncation). The amendment is
  right because two readers disagreed and the second one opened the file.
- **A direction's falsifier can fire on the first read.** The safe-mode candidate for the
  fleet desktop app looked admitted by scope until the extension surface's own header was
  read: in-tree compiled code registered at startup, nothing dynamic. The forces the
  source answered (operator-supplied code that can break boot) do not exist there. Ten
  minutes of reading saved a proposal nobody could accept; record it under "not
  proposed" with the line that killed it.
- **`verified_against` for a C++ tree is `cpp@<standard>`**, witnessed by the build
  file's language-standard line, because the gate's regex wants `<stack>@<version>` and
  the stack must equal the filename prefix; the product version and toolkit requirement
  go in the first paragraph. `cpp` is now in the software-engineering stack list.
- **The gate can be red on a sibling's untracked folder at commit time.** A live run's
  half-written subject fails the link check for everyone; the rule from 2026-08-31
  (regenerate under the lock, commit your own content, leave the index artifacts
  uncommitted if they reference content not in `HEAD`) covers it, and the source note
  should name the folder so the next reader knows why the index was left behind.
- **Never build a pathspec from `git status`.** The content commit's modified-file list
  was `git status | grep ' M'` minus a few known exclusions, and by then a sibling had
  touched three files this run never opened; all three went into `HEAD` under this run's
  name and had to be restored index-only in a follow-up commit (a pathspec commit could
  not do it, because a pathspec commits the working tree). The list of files a run may
  commit is the list of files the run wrote - the design read's checklist plus the
  director's own writes - and it is assembled from that inventory, never from the tree's
  current state, which belongs to everyone.

## 2.3.2 - 2026-09-03 - adaptive-agentic-worms

- **A bot wall is a property of one frontend, not of the document, and the exit code is
  what makes that actionable.** `research-ingest` returned exit 2 (HTTP 429) twice on the
  canonical URL. Because 2 means instrument failure and 3 means thin source, the next move
  was route-around rather than report-nothing, and a community mirror served the same
  4,381-word document clean on the first try. The split between those two exit codes paid
  for itself in one command. Worth generalising: for aggregator sources, a mirror is a
  cheaper first response to a 429 than a retry, and the retry is what a run reaches for.

- **Phase 7.7's pending-proposal detection matches prose, and presented a study at the
  operator's decision gate as a decidable item.** The scan for waiting proposals matched
  `status: proposed` anywhere in a document. A peer comparison study that *describes* its
  proposals' status in a sentence ("Each is `status: proposed`. No ledger row is written
  by this pass; the owner writes it.") matched, and was shown at the gate beside a real
  proposal. It was flagged as suspect in the option text and declined, and **no ledger row
  was written for it** - a decline row for something that was never a proposal poisons the
  directions ledger exactly the way filing an untriaged candidate as declined poisons the
  decline ledger. The fix is one clause: the gate's inventory reads a **frontmatter
  field**, not a regex over the body. Not applied this run (first sighting, and SKILL.md
  has eleven live readers); proposed wording recorded here for the next run to apply with
  a patch bump.

- **Second sighting, from the other side, of the status-derived pathspec.** A sibling run
  committed four of this run's finished-but-uncommitted knowledge files into its own
  commit (`ff802432`), having built its pathspec from the working tree's current state;
  it caught the mechanism itself two commits later and wrote the lesson immediately above
  this entry. The content was byte-identical to this run's working tree, so nothing was
  lost or half-published - but this run's three landed knowledge files carry another run's
  commit message, and neither operator reviewed them as such. **The board did not and
  could not prevent this: it tracks subjects, not a run's uncommitted working tree, and
  the two runs held no subject in common.** That is the gap - a run's in-flight *files*
  are invisible to siblings except through `git status`, which is precisely the instrument
  the sweeping run used. This lesson now has two independent sightings from two runs in
  one afternoon; the rule "the committable list is assembled from what the run wrote,
  never from the tree's current state" should graduate into SKILL.md on the next sighting,
  or on the next method edit, whichever comes first.

- **Both catches this run came from reading a file the slug map ranked below the noise.**
  `refusal-reroute-hop` surfaced only on a concept term (never on a proper noun - the
  vendor names in the source return zero by construction against the purity gate), and
  `candidate-write-access` was found by listing a subject's technique *directory* after
  the golden path's own list came back shorter than the folder. Both then turned out to
  state the source's claim better than the source did. The habit worth keeping: when a
  subject's technique list and its technique folder disagree in length, read the folder.

- **A dialogue's retraction is worth more than its disagreement.** The class entry says
  the yield sits where two practitioners chose opposite defaults. This source added a
  sharper case: a commenter asserted three limitations of the paper, was answered with the
  paper's own text, and **publicly retracted** - leaving exactly one surviving limitation,
  stated precisely, which became the run's second amendment. A retraction is a
  discriminator that has already been tested by the person who held the wrong side. When a
  thread contains one, read it before the article's own conclusions.

## 2.3.2 - 2026-09-03 - automated-alignment-researchers

- **The vendor-announcement fetch rule earned its keep in its strongest form yet: the
  fetch *refuted* the pick rather than corroborating it, and the replacement was
  better.** The post said the agent cheated "by exfiltrating test labels from a remote
  API"; the primary report documents no such thing, and documents instead that the only
  cheat that ever succeeded was plain re-submission - re-running and keeping the luckiest
  score. Had the run written from the announcement it would have landed a technique about
  a network surface that this study never exercised. The class entry says "budget one
  fetch to the vendor's own reference docs before writing anything from an announcement's
  numbers, and expect the doc to make the finding bigger than the post did." It is bigger
  *and different*; the entry could say that the doc sometimes replaces the finding.

- **A sibling's live WIP can decide a landing's FORM, not only its timing.** The second
  finding was drafted as an amendment to `candidate-write-access` and landed as its own
  technique because a sibling was rewriting that exact file mid-run (adding a fifth
  enumeration question and a measurement-vs-containment boundary). That was the right
  call - amending a file being restructured by someone else is how two runs produce one
  incoherent document - but Phase 7's amendment-or-technique test is written purely about
  the finding's shape and says nothing about the file's occupancy. It should: **live
  foreign WIP in the target file is a reason to prefer the standalone document.**

- **The "is the index describing non-HEAD content" check is easy to run wrongly, and it
  fails silently in the reassuring direction.** This run checked with
  `git grep -q <slug> HEAD` and got "yes" for two sibling subjects whose own documents
  were still untracked - the slug appeared in a committed taxonomy entry and a committed
  handoff note. The check that answers the question is about the *files'* tracked status
  (`git status --short` over the bundle), not about whether a string exists somewhere in
  HEAD. Same family as the `grep -L`/`-q` and multi-`-e` defects already in this ledger:
  an instrument that returns a confident wrong answer about an absence.

- **The declared-focus mechanism is single-writer and the fleet is not.** Round 7's focus
  was written by a concurrent sibling *after* this run's Phase 1 read, so the run it was
  addressed to had already shipped its triage table. With a dozen live sessions the focus
  steers the next *quiet* run, not the next run. Either re-read the focus at Phase 5, or
  say this plainly in Phase 1 so a run stops believing it is acting on the current one.

- **A focus item the source class cannot discharge should be skippable by class.** Round 6
  asked for the fleet map's `techniques_absent` list for the fourth time. A non-repository
  source writes no design record, never runs Phase 7.6, and never consults the map - so
  this run could not build it and, more importantly, had *no evidence about it*. Carrying
  it forward as an open item across runs that structurally cannot answer it makes the
  focus line noisier every round.

- **The "never switch the branch" rule is written for this checkout and applies with equal
  force to every consuming tree.** This run created a branch in a fleet project that had
  another session's uncommitted work in it, which silently moved that session onto a branch
  it had not chosen. Repaired within the minute (back to `master`, all seven WIP entries
  verified intact, the commit left on the branch), and the correct move was available and
  cheaper: commit to the branch from a worktree, or check `git status` in the *consuming*
  tree before `checkout -b`, which Phase 8 never tells you to do.

- **Second sighting: a sibling's broad `git add` swept this run's in-flight files into its
  commit.** `ff802432` carries three runs' work under one run's name, including this run's
  two techniques and a golden-path edit, committed without review by their author. Nothing
  was lost and HEAD holds the final drafts, so the cost was attribution and a review that
  never happened. The method already forbids `git add -A`; what it lacks is the *victim's*
  move, which is what this run had to invent: verify HEAD holds your final draft, say so in
  the commit message, and commit the remainder rather than trying to reconstruct authorship.

## 2.3.2 - 2026-09-03 - llmfit

- **Prior-art mapping can miss a landing's real home when the term list is built from
  the source's vocabulary, and the failure is silent.** System C (a crowd-sourced
  measurement contribution loop) was mapped with "crowd-sourced contribution
  ingestion", "benchmark result submission" and "submission schema validation". Those
  returned plausible neighbours in four bundles and **not** `federated-benchmark-sharing`,
  which is the home and which holds six techniques directly on the concern. It surfaced
  by accident, on an unrelated later query ("workspace crate boundaries"), because the
  word *boundary* appears in its `use_when`. Had that query not been run, this run would
  have minted three techniques as a new subject beside an existing one and called the
  count a forge trigger. **The corrective is to map the forces as well as the concern:**
  a source's own words name what it *does* ("submission", "contribution"), while a
  mature subject's slug often names what it *protects* ("federated", "sharing"). Run at
  least one query phrased from the decision's forces, not from the tree's vocabulary.
  This is the same family as the standing rule against letting a proper noun decide an
  absence, one level up: a *concern*-shaped query can be as blind as a product-shaped one.

- **The v2.2 "existing home" clause worked, and the discriminator that made it work was
  the missing-stage read.** System A had three NONE entries and an obvious neighbour
  (`multi-provider-gateway-plane`, forged the previous day, six techniques, thorough).
  The clause says three-or-more with an existing home is a technique triple inside that
  subject. What made that call confident rather than arbitrary was asking the Phase 6
  question at Phase 2d: *where in the subject's own pipeline does this decision happen,
  and does anything own that point?* The subject's every section begins from a
  configured tree of candidates; nothing owns endpoint discovery or identification. A
  missing **stage** in a thorough subject is a technique triple; a missing **opinion**
  would have been an amendment; a different **unit of work** would have been a sibling
  subject. Recording the three-way distinction because the routing count alone does not
  make it.

- **Phase 7.7's pending-proposal scan has a second defect, and it is worse than the
  first.** A sibling logged today that the scan matches `status: proposed` in prose. It
  also matches a proposal that has **already been executed** — the personas
  backup/restore direction read `proposed` on `master` because the branch that built it
  (and updated the status, and wrote its own ledger row) was never merged. The gate
  therefore presented finished work as a decidable item, the operator accepted it, and
  a duplicate acceptance row was written before the branch was discovered. **Before
  presenting a proposal, check for a branch matching `direction/<slug>` and for an
  existing row in the project's directions ledger.** Both are one command. The recovery
  (a correction row appended to the ledger rather than a rewrite) is the right shape but
  should not have been needed.

- **Second sighting: a status-derived pathspec sweeps siblings' finished files.** Four
  of this run's completed knowledge files — three techniques and a golden path — landed
  in commit `ff802432` under another run's message. Content byte-identical, nothing
  lost. A sibling logged the same failure from the same commit earlier the same day.
  Two independent sightings in one afternoon: **the pathspec must be built from the
  list of files this run wrote, carried in the run's own notes, and never from `git
  status` output.** That is the rule the anti-pattern list should carry; "commit with a
  pathspec" is now demonstrably not sufficient guidance, because the natural way to
  build one is to read the status.

- **A repository whose comments carry issue numbers and measurement dates is a
  different source class in practice, even though the taxonomy has no row for it.** The
  yield here came almost entirely from doc comments that record *the refuted
  alternative* — "adding the bare family stem made 238 of 9,250 look installed (#861)",
  "a zero would read as immeasurably slow rather than not estimated", and a removed
  heuristic with both directions of its error written out. That is a first-party
  practitioner account distributed through a codebase, and it corroborates
  corpus-internally: **0 of 3 fetches spent, everything landed.** The class rule that
  a practitioner codebase needs no web budget held completely. What is worth adding to
  the sweep order: after the operating documents, grep the source for issue references
  in comments — they mark the exact lines where somebody paid for a boundary.

- **Confirmations from an independent tree deserve a row and the vocabulary has no
  clean word for them.** Four techniques this run were found already implemented in an
  authorized project, each reached by a *different argument* than the corpus uses (the
  clearest: a conservative identity posture argued from unwindability rather than from
  cost direction). These are not `better` (nothing changed), not `not-better` (nothing
  was refuted), and calling them `unmeasurable` is a stretch that hides their value —
  two independent routes to one rule is the strongest corroboration available. They
  were filed as `unmeasurable` with the confirmation stated in the row and an explicit
  "do NOT count toward the two-rows-demote rule". **A fourth verdict — `confirmed` —
  would carry this honestly.** Proposing it rather than applying it; one run's
  observation.

- **A long repository run outlives its own board claim, and the protection expires
  exactly when the run is writing.** The board reaps a record whose heartbeat is more
  than 45 minutes old. This run beat at Phase 4 and Phase 7 and then spent well over an
  hour in landing, applying, the direction pass and the gate — by Phase 10 the board
  reported **no live runs** while this session was still committing to three
  repositories. Every collision rule in the method degrades to hope in that window, and
  it is the *worst* window to lose, because early phases only read. A news run finishes
  inside one heartbeat and never sees this; a v2 repository run cannot. **Beat at the
  top of every phase from 7 onward**, not only when the map names a subject — it is one
  command and the alternative is being invisible during the only phase that writes.

## 2.3.2 - 2026-09-03 - boa

- **A cluster with no home returns nothing on every query, and that is the honest
  shape, not a mapping failure.** Every runtime-phrased query ("bytecode interpreter",
  "interpreter", "embeddable") returned *no prior art*; the forces-phrased queries
  ("untrusted code", "guest code", "sandbox") found the one subject that touches an
  in-process guest runtime, which was the home of the single retained boundary
  amendment. Round 8's focus item held: say which query found the home. For this source
  the answer was "the forces query found the amendment's home; no query found the
  cluster's, because the cluster had none" - and that absence was read as a forge
  routing signal at Phase 2d rather than re-tested at Phase 4.
- **The application filename rule is one file per stack and technique per subject
  (`check-bundles.mjs`, rkb-profile §2), and a repository run collides with itself on
  it.** A Rust source tree and a Rust fleet project applying the same technique cannot
  each have a document. This run folded both witnesses into one file (the fleet project
  as the applied tree, the source as the origin, both anchored) and used the *forge*
  subjects' own applications for the source tree's runtime facts. The method should say
  so in Phase 7: when the source and the apply target share a stack, write one
  application carrying both witnesses, never two files.
- **A worktree-isolated session refuses shell constructs with computed values (loops
  over a variable, `$(...)` in an argument, a variable path to `sed`), even when no git
  is involved.** Four commands were refused this run. The workaround that always passed:
  node one-liners for anything computed, literal paths for `rg`/`sed`, and the Read tool
  for a file whose name came from a listing. Worth a memory note rather than a method
  change.
- **Scouts corrected the design record three times against the same tree the record was
  written from, all three in the direction "the design doc is stale, the code moved".**
  A repository's `docs/` is the first thing the sweep reads and the most likely to
  describe a previous version of the system. Under v2 the design record is written
  before the scouts run; the fix is cheap - the handoff document now carries a "What
  the wave inherits" block that lists every correction, and the workers were told to
  treat the docs as the naive reading. A future run should write the record's `where:`
  anchors from code first and docs second.
- **Unattended, the direction pass proposes and the gate skips - which means a
  simulation whose next step is a new context lands as a proposal nobody has read.**
  That is the designed behaviour, and it is worth naming in the scorecard so the next
  attended run's Phase 7.7 inventory includes it.
## 2.3.2 - 2026-09-03 - rowboat

- **A `not-better` apply row is a source, and this method does not say so.**
  The run's best result came from picking a connected tree as a seam, being
  wrong about it, and finding the tree was ahead of the technique. Four
  mechanisms went from the project into the registry. The method's
  `not-better` clause currently says the technique "gains an amendment stating
  the condition under which it did not hold" - which frames the tree as a
  counterexample. It is often a better *implementation*, and the right move is
  to read it as a first-party practitioner source. Proposed step, not yet
  applied: on `not-better`, ask what the tree knows that the technique does
  not, before writing the row.
- **The concern-phrased query and the forces-phrased query disagreeing is the
  signal.** Round 7's focus asked runs to add a forces-phrased query and say
  which one found the home. Here the concern-phrased query found a home on the
  first try and it was *wrong* - a UI subject that shares the concern
  (`chat-transcript/composer-turn-queue`, "delivered at the machine's next
  safe point") and not the layer. Slug and use_when overlap cannot tell a
  surface subject from a runtime one, because both legitimately talk about
  turns and messages. The forces query ("a caller-supplied drain the loop
  cannot see past") separated them. The focus item should be strengthened from
  "say which query found the home" to "say whether the two agreed".
- **An apply step can be unreachable rather than skipped, and the scorecard
  cannot currently tell the difference.** Five findings, five owed rows, five
  written - and two were `unapplied` because no authorized tree meets the
  technique's preconditions at all. That reads as a zero in the Apply column
  and it is not one; it is the corpus outrunning the fleet. Proposed: count
  landed findings whose preconditions no authorized tree meets, as its own
  number.
- **Measure the halves of a change separately when a change has halves.** The
  applied elision was two mechanisms - elide payloads, and serialize compact -
  and only the first was in the plan. The intermediate measurement (63,844
  bytes eliding-but-pretty against 43,628 eliding-and-compact) showed the
  serializer was worth a third of the win. It was nearly not taken, because
  the A/B I had designed was one arm against one arm.
- **A negative that the change itself proves belongs in a test, not only in
  prose.** Elision did not reach the byte threshold that triggers it, because
  it bounds payload per item and cannot bound an unbounded item count. That
  residual is pinned by an assertion that fails if a later change fixes it, so
  the next author has to tighten it deliberately rather than discover it.
- **The board claim survived to Phase 10** by beating at the top of every
  phase from 7 - round 7's fix, and it worked. Worth keeping as a rule rather
  than a focus item.
- Mid-flight runs on an earlier version: nothing to do. No `SKILL.md` change
  was made this round; the three proposals above are lessons awaiting a third
  sighting, per the skill's own promotion rule.

## 2.3.2 - 2026-09-04 - agentic-video

- **For a vendor release announcement, the finding is the SPREAD between two
  published figures, not either figure.** The class rule from 2026-08-28 says
  "an announcement states NUMBERS, and its numbers are the yield." Two runs
  have now read that as *mine each number*. This run got its entire result
  from a number nobody printed: the post advertises -88% tokens and -66% cost
  for the same workload and separately that the mode carries no feature fee,
  and those three facts together force a conclusion the post never draws.
  Marketing prints savings on whichever denominators flatter it and never
  divides them, because the ratio is the mechanism and the mechanism is not a
  selling point. **The sharpening: when an announcement quotes improvements on
  two different denominators, compute the ratio and ask what could make them
  differ.** That question is free, it needs no fetch, and it is the highest
  yield-per-token move available on this class. Third sighting promotes it
  into the class table in `references/source-classes.md`; this is the first.

- **The `use_when` on a technique should be written for the day the world
  changes, not for the day the reader has a problem.** `unit-classes-are-open`
  landed with "a provider ships a mode that reports token counters you do not
  read" as its first trigger - a *world event*, not a symptom. Every existing
  `use_when` in the subject is symptom-shaped ("bills exceeding what the gate
  approved", "two current-month spend figures disagreeing"). Symptom triggers
  only fire after the damage; this defect's whole nature is that it produces
  no symptom, so a symptom trigger would never have matched it. Not yet a
  rule - one instance - but worth watching for whether silent-failure
  techniques systematically need event-shaped triggers.

- **The corpus was corrected by a fleet project for the second consecutive
  run**, and both times the correction came from executing round 9's focus
  item 2 (on a tree that is ahead, ask what it knows before writing the row).
  The mechanism is now clear enough to state: a mature consumer tree has
  *already paid* for the boundary cases the corpus reasons about abstractly,
  so where the tree and the technique disagree, the tree usually has the
  better rule and the corpus has the more general one. Take the tree's rule
  and keep the corpus's generality. Second sighting.

- Mid-flight runs on an earlier version: nothing to do. No `SKILL.md` change
  was made this round.

## 2.3.2 - 2026-09-04 - worldlabs-atlas

- **The highest-yield paragraph in a vendor release announcement is the one that
  hedges its own benchmark.** This run's shipped technique came entirely from a
  sentence the post did not have to write: "it is possible that more sophisticated
  prompt engineering or creative multimodal prompts could improve camera following
  for some models." A release announcement is written to be quoted, and the one place
  it is not is where it explains why its own number might be generous - which is
  exactly where the *protocol* becomes visible, and the protocol is what strips.
  Read that paragraph before the results table. Candidate line for
  `references/source-classes.md` under the vendor-release-announcement row, whose
  current guidance ("reliable for its numbers") points at the wrong half.

- **The v2 promoting question earned its cost, and it earned it by DEMOTING.** All
  three `partial` rows moved; two moved down. A currency row ("sparse-view
  reconstruction now beats specialists") became a bundle-scope lead when one counted
  grep showed the bundle carries zero files on the topic - there was no clock to
  reset because there was nothing there. A lead became a catch when the named law
  turned out to model its forces exactly. Under v1 both would have been banked with
  their anchors and re-derived later at full price. The rule as written implies
  promotion is the point; the value here was that the question is cheap enough to
  answer honestly in the losing direction. Cost: three file reads.

- **A promoting question can only be answered honestly with an uncapped count.** The
  currency demotion above rests on "zero files in the bundle mention this", and that
  claim is exactly the shape the method already warns about twice (truncated output,
  banned vocabulary). It was run as `grep -rlin ... | wc -l` first and the file list
  second. A promoting question answered from a `head`-ed grep would have produced a
  confident promotion instead of a correct demotion, and nothing would have caught it.

- **Ask the tree-as-source question on PASSING apply rows too.** Round 9's focus item
  aimed it at `not-better`. This row came back `better`, and the finding that made the
  run still came from asking what the tree already knew: it had independently
  implemented the technique's first step for one control dimension, with the reasoning
  written into the type, and the second dimension **inverted across the same provider
  pair** with no declaration at all. A passing verdict hides that as effectively as a
  failing one. Proposed for the next version as an edit to Phase 7.5 step 1 rather
  than to the verdict handling.

- **The design read works on a source with no tree, and the trigger should probably be
  a stated architecture with forces rather than a clone.** Phase 2d is written for
  repositories. Run against a 2,835-word blog's Technical Details section it produced
  five entries with honest `forces:` and `rejects:` lines, a routing count of 2, and
  the decision to stay in intake - all before the triage table, which is where that
  decision is supposed to be made and where twelve v1 runs never made it. The one
  honest degradation: `where:` is a section name, so no source-tree application is
  writable and the entries cannot be diffed by a later pass the way a pinned commit
  can. Cost about five minutes.

  ### Redesign proposal (not applied)

  Phase 2d's entry condition currently reads as "if the source is a repository, after
  the sweep". Consider inverting it to a property of the source's content: **run the
  design read whenever the source states an architecture together with the forces that
  chose it**, which a release announcement's technical section, a conference talk and
  an ADR all satisfy and a listicle does not. The routing count is the cheapest
  correct answer to "is this a forge job", and gating it on `git clone` means the
  question is never asked of the sources most likely to be over-mined for claims.
  Not applied here because one blog is one data point, and because the honest
  degradation above (no anchors, no diffable baseline) may matter more than it looked
  like it did in this run.

- **Fleet reach is a state, and it now has two sightings.** One of this run's two
  techniques has no seam in any of the eight authorized trees, and the fleet map
  classified every absence for both landed subjects as `out-of-domain`. Filing that as
  an apply zero would be wrong twice: nothing was skipped, and the correct next move is
  a fleet decision (a new domain, or a narrower landing bar), not a better apply step.
  Proposed as a standing scorecard column rather than a sentence.

- **For a mid-flight run on an earlier version: nothing to do.** No `SKILL.md` edit was
  made this run; the three proposals above are lessons awaiting a confirming sighting.

## 2.3.2 - 2026-09-04 - zvec-grep

- **A vendor repository carrying a published `benchmarks/` protocol is two sources, and
  the benchmark half ranks first.** The class entry predicts "its docs' rules page and
  its client's types", and that prediction was right about half this tree and blind to
  the other half: a 300-trial paired A/B with locked selections, an isolated reference
  set, an independent judge, and its aggregation choices argued in prose. That half
  produced two of the four landings, and it produced the two whose corpus homes were
  cleanest, because a report that argues its own method is a first-party practitioner
  account wearing a vendor's badge. I found it second, by sweeping `docs/` first as the
  method's yield order says. The order is right in general and wrong for this shape:
  when a repository has a `benchmarks/` or `evals/` directory containing a *protocol*
  (not just fixtures), read it before the operating documents. Proposed for the
  source-classes reference's vendor-repository entry; one sighting.

- **The routing count declining a handoff is the count working, and the scorecard should
  say so in the positive.** v2 exists because twelve runs mined systems with the news
  method. This run computed both clauses, got two and two, and correctly stayed in
  intake - and there is no vocabulary in the method for that outcome except the absence
  of a handoff. A run that computes the count and declines has run the same discipline
  as a run that hands off; the depth column currently makes the first look like a run
  that did nothing structural. Minor wording, no rule change.

- **`not-better` treated as a source has now paid twice running, and the pattern in both
  cases is the same: the tree carried an ENUMERATION the technique had as a binary.**
  2026-09-03: a boot classifier had three classes where the technique had two.
  2026-09-04: a token gate had four refusal verdicts where the technique required only
  that a refusal name its surface. Both times the extra arms existed because collapsing
  them would have hidden a specific incident behind something that looks like correct
  behaviour. That is sharper than the current focus-item wording ("ask what the tree
  knows that the technique does not"). **Proposed sharpening: on a `not-better` row,
  first ask whether the tree enumerates more states than the technique does, and why the
  extra ones were split.** Two sightings; a third makes it a rule this file carries.

- **The direction pass is silently disabled for most of the fleet, and a per-run note
  cannot say that.** Phase 7.6's eligibility test reads `scope.does`; seven of eight
  projects report `scope=missing`, so all three of this run's candidate absences were
  ineligible and the pass produced nothing. Writing "directions=0/3" in a scorecard row
  makes it look like a judgment about those three projects. It is a standing fleet
  condition that will produce the same zero every run until scopes are declared.
  **Proposed: the scorecard's directions cell carries the eligible-project count, not
  just the proposed count** - `0/3 (0 eligible, 7 of 8 projects scope=missing)` - so the
  blocker is visible as structural rather than as a run's choice. First sighting; if a
  second run reports the same shape, it belongs in `SKILL.md` Phase 7.6.

- **For a mid-flight run on an earlier version: nothing to do.** No `SKILL.md` edit was
  made this run; all four items above are lessons awaiting confirming sightings.

## 2.3.2 - 2026-09-04 - copilot-cost-efficiency

- **The tree-as-source step is triggered too narrowly.** Round 9's focus item says to
  run it when an apply row comes back `not-better`. This run had no `not-better` row
  and the step still produced its best corroboration: the seam was picked because the
  tree looked like it lacked behavioural tests over a standing prompt, the tree in fact
  ran a ten-fixture behavioural bench over exactly that prompt, and reading it as a
  source found that its own recorded baseline had reached the landing technique's
  central decision rule seven weeks earlier, from a measurement. **The trigger is not
  the verdict, it is the contradiction:** run the step whenever the tree refutes the
  reading that picked it. Second sighting of the general shape (2026-09-03 rowboat was
  the first, via `not-better`); a third makes it a `SKILL.md` edit to Phase 7.5.

- **An unapplied landing's precondition is often shared, and reporting per-row hides
  it.** Three of five landings here are unapplied. Counted per row that is a 60% miss
  rate; in fact all three wait on one precondition — no authorized project owns a layer
  that shapes tool results before a model reads them — so it is one missing capability
  class with one return condition. Propose for Phase 9's scorecard line: report
  unapplied rows **grouped by precondition**, with the count of distinct preconditions
  beside the count of rows. First sighting.

- **A negative-result-dense source outyields its class prediction, and the density is
  predictable from the shape.** The class (first-party practitioner account) predicts
  two to four landings; this one produced five from 2,225 words. The reason is
  recordable: the post leads with a change it measured and **did not ship**, and then
  describes a rewrite that regressed in production and was stopped. **Each negative
  result is a boundary already drawn by somebody who paid for it**, and a boundary is
  the expensive half of a technique. Worth adding to the source-class reference as a
  yield signal: count the source's own negative results before predicting its yield.
  First sighting.

- **Two runs landed cost-measurement techniques one shelf apart on the same day
  without seeing each other.** `end-to-end-unit-of-optimization` (this run, the
  boundary a cost is measured inside) and a sibling's `outcome-conditioned-cost`
  (which trials may enter a cost mean). They do not collide, but the board was the only
  instrument that showed the sibling existed and only opening their uncommitted file
  settled it — the index cannot see an uncommitted subject, which is the failure the
  board exists for. Proposal: before landing a technique whose subject matter is *how a
  number is measured*, open what live siblings hold rather than trusting the map. First
  sighting.

- **A pre-commit hook rejecting formatting is not a reason to skip the hook.** The
  cross-repo commit was refused by a rustfmt hook; running the formatter and restaging
  cost one command. Recorded because the tempting move under a run budget is
  `--no-verify`, and the method forbids it for good reason.

- **The 2026-09-01 quoting lesson exists and I reproduced its failure three times
  anyway.** That entry says plainly: *"For prose documents containing backticks,
  apostrophes and em dashes, use the file-writing tools directly rather than shell
  heredocs."* This run wrote a subject note, a scorecard block and this very entry
  through `node -e` inside a double-quoted shell string, and the shell
  command-substituted every backticked slug out of all three — silently, with a
  zero exit code. **The lesson is not new; what is new is that reading it did not
  prevent it, because the failure arrives at write time and the lesson is read at
  reflection time.** The corrective is mechanical rather than remembered: the
  document-writing tools for any prose file, always, and never a shell string as
  the transport. Second sighting, and it belongs in `SKILL.md` Phase 9 rather than
  here — a lesson that cannot be applied at the moment it is needed is a lesson in
  the wrong file.

- **For a mid-flight run on an earlier version: nothing to do.** No `SKILL.md` edit
  was made this run; every item above is a lesson awaiting a confirming sighting.

## 2.3.2 - 2026-09-04 - wigolo

- **A tree can carry its ADRs in source header comments, and the sweep order does
  not say so.** Phase 2b ranks `docs/`, `design/`, `ADR/` first by yield density.
  This repository had 12,071 words of `docs/` (configuration and tool contracts -
  useful, not design) and no `ADR/` directory at all, while every load-bearing
  decision sat in a 20-40 line prose block above a pure module: forces, the
  rejected alternative, and the incident that motivated it. The tell is a module
  whose comment-to-code ratio is inverted. A run that reads "no design folder" as
  "no design record" falls into the README, which is the anti-pattern the phase
  exists to prevent - reached by following the phase.
- **The per-system routing count re-aimed extraction, not just routing.** Writing
  the count at Phase 2d before extracting meant the deep read went into one
  subsystem of twenty and the other nineteen got one pass each. Under v1 the same
  tree would have produced an even spread of shallow claim rows. The count's
  second-order effect is the valuable one and the scorecard cannot currently see
  it - the depth cell records what was routed, not what was read.
- **The apply seam contained a defect the corpus predicted.** `classify-before-you-respond`
  says classify a refusal before choosing a response; the project's ingest layer
  keyed retry on two literal status codes, and in one of three adapters the
  non-ok throw fired inside the try so the network-error catch retried it - a 403
  cost three requests against a host that had just declined. The technique did not
  merely fit the seam, it named a bug at it. This has now happened twice in three
  days and both were logged as ordinary `better` rows; the ledger vocabulary has
  no way to say "the corpus found a defect in a tree nobody was auditing", which
  is a stronger result than a measured improvement.
- **A project's own hook is a better reviewer than the method's confirmation
  gate.** The commit was blocked by a doc-sync hook demanding either a doc update
  or a recorded dismissal on two coupled documents. Checking them properly found
  one that genuinely discusses retry behaviour - for a different adapter - and one
  dated founding-session record with no section for the file I touched. The
  dismissals are on the commit and reviewable. **Never bypass the hook**; its
  dismissal channel exists precisely so the reasoning is recorded where a reviewer
  will see it.
- **Directions were skipped because a shared artifact was held.** `fleet-map.json`
  had a sibling's uncommitted edits, and Phase 7.6 begins by regenerating it. The
  parallel rules forbid regenerating a shared artifact you do not own, and the
  method does not currently say what Phase 7.6 should do about that. It should say
  it: skip with a stated reason, exactly as an unattended run skips the gate.

### Redesign proposal - not applied this run

The `librarian/applied.md` verdict vocabulary is `better` / `not-better` /
`unmeasurable`, all three of which describe *the technique's effect on the tree*.
Two runs this week produced a fourth thing: the technique's arrival exposed a
defect that predated it. That is not "better" - the improvement is real but
incidental to what the technique claims - and recording it as `better` loses the
result that would most justify the whole apply phase to a sceptic. A fifth column
or a `seam-defect: <one line>` field would make it countable. Proposing rather
than applying, because one week is two sightings and this file's own rule is that
a lesson becomes a rule at three.

## 2.3.2 - 2026-09-04 - zvec-grep (addendum: an absence established from an unrun search)

- **A fleet-wide absence may not be established from a path glob without confirming
  the glob exists in each tree.** This run wrote "no seam in any authorized tree" for a
  landed technique, and put the resulting count in the scorecard as the fleet's reach.
  The search behind it globbed `src/ crates/ src-tauri/` across eight projects.
  and it iterated a hand-typed **six**-project list, so grant and gravity were never in
  it at all; politicas and kp have none of those directories, so those greps matched zero
  files and exited quietly; pumper and LightTrack keep their client code in `clients/`,
  goat in `app/` and `lib/`. **Four of eight trees contributed zero files** and two more
  were half looked at, and the empty output read exactly like a clean negative. The
  miscount survived the first correction too - I wrote "three of eight" and it was four,
  because a hand-typed project list is a second, independent way for a fleet search to
  miss a tree, and I had only checked the first. The verdict happened to survive the re-run - which is luck, not method.
  **This is `failure-not-empty-success` at the fleet layer**, and the corpus already
  owns the rule: assert the instrument before reporting the result. The method's Phase 4
  warnings cover truncated output and banned vocabulary; neither covers *a glob that
  addresses nothing*, which is the fleet-shaped version of the same defect.
  **Proposed for Phase 7.5 step 1: before reporting "no seam in any managed project",
  run the search once against a pattern that must hit (a control), per project, and say
  how many files each tree contributed.** A tree contributing zero files to a control is
  a tree that was not searched - and the control must be driven from `loadFleet()`, not
  from a hand-typed list, because that list is how two of the four misses happened. The
  control run here reported personas, kp, politicas, goat, grant (971), gravity,
  LightTrack and pumper all non-zero, which is what the absence claim needed and did not
  have. First sighting, but it produced a false published
  sentence, so it is proposed rather than banked.

- **What caught it was a background task's exit code, not a review.** The search was
  backgrounded, its empty output was read and believed mid-run, and the non-zero exit
  arrived after the run had committed. Nothing in the method says to reconcile a
  backgrounded instrument's exit status before using its output, and here the output was
  used four phases before the status arrived. **Proposed: when an instrument is
  backgrounded, its result is provisional until its exit status is read** - the same
  discipline as not trusting a green gate whose command never ran.

- **The re-run found something real that was out of scope, and it is filed as a lead
  rather than acted on - and widening the search changed what the lead MEANS.** Three
  fleet projects spawn the same coding CLI. Two (grant, gravity) route the prompt through
  stdin, keep argv static, and each wrote down the reasoning independently; one
  (personas) puts the prompt in argv under `shell: true`. At two projects this read as a
  disagreement; at three it reads as **one deviation from a fleet norm with two
  independent rationales behind it**, which is a much stronger thing to hand the next
  run. Worth generalising: a fleet-wide observation drawn from a partial search can be
  true and still carry the wrong weight, and the weight is what decides whether anyone
  acts on it. It is the inverse of the technique under test and security-shaped, so it
  went in the source note with a return condition rather than into a landing this run
  was not asked for.

## 2.3.2 - 2026-09-04 - flatnotes

- **Where a tree has no design documents, its abstract surfaces are the design
  documents.** The method's Phase 2b sweep leads with `docs/`, `design/`, `ADR/`,
  and round 10 already added the correction that they may live in source header
  comments. This tree has neither: 4,222 words of server code, no `docs/`, no
  ADRs, no tests, no CHANGELOG. It still produced a full seven-entry design
  record, because three abstract base classes, a config object whose every field
  validates-or-exits, and a models module state the contract exactly and **cannot
  hedge, because something compiles against them**. The sweep order's item 4
  ("the types and the config schema") is doing more work than its position
  suggests: for a small tree it is not the fourth-best source, it is the *only*
  one, and it is where the decisions are. Worth one sentence in the sweep order
  saying the ranking inverts as the tree gets smaller.

- **The enumeration hunt works best against a passage that is confident and
  right.** The finding came from `editor-interop:78-94`, which is one of the
  better-argued passages in the whole bundle: it enumerates the watcher's silent
  failure modes individually, concludes they promote the time bound "from
  prudence into the load-bearing mechanism", and demotes the watcher explicitly.
  Every sentence of that is correct. It is also a two-member enumeration asserted
  with enough confidence to read as exhaustive, and the third member was sitting
  in the source. **A hedged passage invites no question; a confident one names
  its own boundary.** The method already says an enumeration is worth exactly one
  question — what it does not say is that the *best* enumerations to interrogate
  are the ones you would least expect to be incomplete, because vagueness is what
  usually protects a document from this check.

- **The corpus corroborated the source's non-obvious half, in the direction the
  method usually runs the other way.** The tree compares mtimes with `!=` and
  never says why. `replicated-substrate` — already in this subject — says exactly
  why: a checkout or timestamp-preserving copy installs an *older* file, so an
  ordering comparison serves the superseded derivation forever. The usual shape
  is a fetched primary correcting a source; here the registry supplied the
  argument a correct implementation had left implicit, and the technique is
  stronger than the tree it was read from. Worth naming as a third corroboration
  route beside "primary fetched in-run" and "training-data convergence":
  **corpus-internal justification of an unexplained choice**, which costs no
  fetch and is only available because someone forged the neighbour first.

### Redesign proposal - the triage gate returns one row because it asks for one

  Not applied this run. Eleven candidates extracted, three carrying a `real gap`
  read, one verified — and the same shape is visible in the last four rows, where
  the design record has steadily widened Extract while Landed stayed flat. The
  gate's question ("which should I verify and land? numbers / all / none /
  leads-only") is not wrong, but it prices nothing, so a single number is the
  path of least effort and it is also a perfectly reasonable answer. The proposal
  is one clause: **state the `real gap` count and the marginal cost before the
  question** — "3 rows read as real gaps; taking all three is roughly one extra
  verification round and no extra fetches" — so that a one-row answer is a
  decision about cost rather than a default. This is a Phase 5 wording change and
  it should not be made from one run's evidence; it wants the round-11 row to
  confirm the pattern first.

## 2.3.2 - 2026-09-04 - duckdb-wasm

- **`techniques_absent` is CLOSED, not built - the decision, after eight
  deferrals.** It was proposed in round 2 on a single sighting: a technique-grain
  direction proposal was blocked because the fleet map resolves at subject grain.
  Eight rounds later the evidence has inverted. No run has been blocked in a way
  the subject-grain map could not answer; the one round that hit the limit (round
  7, `llmfit`) worked around it by reading the subject's techniques by hand,
  which is a single file read. Meanwhile the artifact it would enlarge -
  `fleet-map.json`, derived and shared - has now **twice stopped a direction pass
  outright** because a sibling held it or the index behind it. Building
  `techniques_absent` would grow the shared artifact whose sharedness is already
  that pass's dominant failure mode, in order to save a one-file read needed once
  in eight rounds. **Decision: not built. Reopen condition: two runs blocked at
  technique grain within one round-window in a way a single file read does not
  resolve.** Stop carrying it in the focus line.

- **The routing count is worth more when it re-aims extraction than when it
  routes.** Round 10 asked the next repository row to say which it did. This run
  computed the per-system count at Phase 2d, saw System A at 3, and *abandoned
  two packages it had been sweeping* to spend the remaining budget in one
  subsystem. The whole-tree count was 10 NONE, which would have handed off the
  repository and never opened the file carrying the run's defect. The count's
  value is as a **budget allocator during the sweep**, not only as a routing
  decision after it - and Phase 2d currently reads as though it is the latter.

- **Two subjects denying a case is stronger evidence for a new subject than
  either subject's silence.** The promoting question for a `partial` design row
  is usually "does any subject model these forces". Here two did *not*, and both
  said so **in their own prose** - one excluding expensive probes as "a different
  discipline", the other narrowing itself to "the grant, not the config". A slug
  map cannot see either sentence; only opening the files does. **Where a design
  row's prior art is a mature subject, read that subject's exclusions before its
  inclusions** - a well-forged subject states what it is not, and the union of
  two such statements is where the unowned stage is.

- **A repository with no `docs/` is not a repository with no design record - and
  this is now the third of the last four repository runs to say so.** This tree
  carries 1,533 words of markdown total and no design folder of any kind, while
  every load-bearing decision sits in header comments (a 40-line I/O-stack
  diagram with its forces in prose above the buffer manager) or in the header
  files themselves. Phase 2b's sweep order lists `docs/`, `design/` and `ADR/`
  first and would report "no design record" here. **The sweep needs one sentence:
  the operating documents may be inside the source files, and the tell is a
  module whose comment-to-code ratio is inverted.** This has now been recorded
  three times without the file changing; it should become a rule at the next
  version bump rather than a fourth lesson.

- **The enumeration hunt works on a TEST, and a presence assertion is a weak
  enumeration.** The source's defect was found by asking what a test that lists
  the serialized configuration flags *omits*. It asserts two of three by
  `HasMember` - so it would also pass against a payload carrying the third with
  the wrong value, and it runs under the empty configuration, which is exactly
  the case the defect lives in. Both halves fail together. **An enumerating test
  that asserts presence rather than value is not enforcing the enumeration; it is
  documenting it.**

- **Report a tree that is already ahead as a distinct outcome, not as
  `unapplied`.** Fleet reach this run was 1 of 8, but the seven were not alike:
  one project states the technique's central rule independently in its own
  comments, one is covered ground, five have no seam. Recording all seven the
  same way understates the corpus - a project that reached the rule by itself is
  **corroboration**, and it is the cheapest convergence evidence available.

### Redesign proposal - Phase 7.6 depends on a regeneration, which the parallel rules forbid

Not applying this now; it wants a third sighting or the operator's call.

The direction pass is the only phase in this method whose **precondition is
regenerating a shared, committed, derived artifact** (`fleet-map.json`, itself
derived from the bundle indexes). Every other shared write in the method is an
*append* under a short lock. Regeneration is different in kind: it reads the
whole working tree, including siblings' uncommitted files, and the method's own
rule is "do not regenerate to be helpful" over files you do not own.

The consequence is now measured rather than predicted. Round 10 skipped 7.6
because `fleet-map.json` carried a sibling's uncommitted edits. This round
skipped it because regenerating it would have derived it from an index that
carries 13 and 7 references to two siblings' half-written subjects. **In a
checkout with live siblings, the pass's precondition is almost never safely
satisfiable**, and the phase degrades to "skipped, with a reason" - which is
honest but is not a direction pass.

Three candidate fixes, in increasing cost:

1. **Read the map from `HEAD`, not the working tree.** A direction proposal is
   about a project's *committed* shape; a sibling's uncommitted subject is not
   yet a fact about the corpus. `git show HEAD:librarian/fleet-map.json` needs no
   lock, cannot be contaminated, and is stale only by the amount the corpus moved
   this session - which for this purpose is the correct staleness.
2. **Scope the regeneration to the subjects the run touched**, so the artifact
   written is a function of this run's content only, and merge it as an append.
3. **Make the pass consume the subject list directly** and drop the derived
   artifact from its critical path entirely, keeping `fleet-map.json` as a
   reporting convenience rather than a precondition.

Option 1 is nearly free and would have unblocked both of the last two runs. If a
third consecutive run cannot run the direction pass for this reason, take it.

**For any run mid-flight on 2.3.2: nothing to do.** No `SKILL.md` change is made
here; finish on the version you loaded.

## 2.3.2 - 2026-09-04 - `pi`

- **A repository that ships a document calling itself NORMATIVE is a third sweep
  shape, and the sweep order should name it.** Phase 2b ranks `docs/` and `ADR/`
  first; round 10 added "the operating documents may be inside the source files".
  This tree has neither an `ADR/` directory nor inverted comment ratios - it has
  `docs/harness.md`, 27,820 words, whose first section says it is the normative
  specification and marks in a numbered subsection which parts are specified but
  not implemented. Ten numbered work packages beside it carry the forces and the
  rejected alternatives. The tell is cheap and mechanical: **grep the docs tree
  for a document that claims normativity over the code**, and when one exists,
  the README is not a summary of it and the source files are not where the
  decisions are. Not yet a method edit - one sighting.

- **A `benchmarks/` directory ranks first only when it publishes RESULTS.**
  Round 10's declared focus said to read a vendor repository's `benchmarks/`
  before its `docs/` when a published protocol exists. Followed here, and it
  produced **nothing**. The protocol is genuinely good - deterministic synthetic
  data, fixtures prepared outside the measured callback, a fresh process with
  forced GC per pair, an explicit "not CI performance gates" clause - but it
  publishes a *method* and no numbers, and its target list registers exactly one
  backend. The round-10 rule holds with a qualification that costs one `ls`:
  **rank a benchmark directory first when a results table or a populated target
  list exists; otherwise it ranks with the other operating documents.** That is
  the second run to refine this rule and it should go in the class table on the
  third.

- **The routing count changed what was EXTRACTED, and this run can prove it
  because the count was written first.** Round 10's check, answered directly.
  The tree's most prominent system - a 30-provider unified LLM API, the largest
  README in the repo and the thing the landing page sells - counted **0 NONE**
  against two existing subjects. It was classified and closed. The extraction
  pass then went entirely to `harness.md` and the work packages, which the
  landing page does not link at all, and **both landings came from there**. A
  claims-first pass would have spent itself on the provider roster and produced a
  currency signal. The count is doing the work the depth column was added to make
  visible.

- **A cap can move a subject, and the placement note must say so.** The
  merits-correct category for the new subject holds exactly 10 subjects against
  `MAX_CHILD_DIRS = 10`; an 11th fails the gate. Verified against `taxonomy.json`
  as the authority rather than a folder count, per 2026-08-22 - but the newer
  point is that the *subject* now carries a sentence in its own boundary section
  saying where it belongs and why it is not there. A reader who cannot find a
  subject where it belongs is owed the reason, and the alternative (subdividing a
  sibling category as a side effect of an unrelated run) is a corpus-wide link
  break nobody asked for.

- **Run the apply step's falsifier IN the run; do not write it down as a return
  condition.** The task plan for this run's shipped row was written with a
  falsifier - "if every consumer already branches on the detail string before
  summing, this is cosmetic" - and it was one grep. Running it turned a plausible
  finding into a confirmed one (**one** production consumer, and it does not),
  shrank the size estimate from "3-5 files" to three, and would have cost the
  next run a session to rediscover. A falsifier a run can execute and defers is
  not a falsifier; it is a hedge. **Candidate for the method:** Phase 7.5 should
  say that a stated falsifier cheap enough to run in-session is run in-session,
  and the row records the answer rather than the question.

- **Two unapplied rows behind ONE precondition is a different fact from two
  behind two, and this run has both shapes at once.** Round 9's focus asked for
  unapplied landings to be grouped by precondition. This run has three rows the
  fleet cannot meet: two share *a closed durable-state vocabulary the runtime
  owns*, and one needs *parallel effects into a single ordered record*. Reporting
  "3 unapplied" hides that the first two have one return condition that would
  unblock both, and that the third would not be touched by it. The grouping was
  written into the rows themselves, and the row that shares a precondition names
  its partner.

- **A `not-better` verdict produced this run's strongest corroboration, and the
  trigger for reading a tree as a source is still written too narrowly.** Round
  10 widened it from `not-better` to "the tree contradicted the reading". Both
  fire here, but the valuable case is a third one: the tree **agreed** and had
  reached the rule independently, from a different problem domain (a job runner,
  not an agent harness), with the incident that taught it recorded in its own
  test module. That is a second independent sighting - the convergence bar the
  corroboration table sets - and it arrived through a verdict column that says
  `not-better`, which reads like a miss. **Candidate for the method:** the apply
  row's vocabulary needs a way to say *the tree already does this, independently*,
  because that is corroboration and the ledger currently files it as a rejection.

### Redesign proposal - not applied now

- **A technique landed by a run can be amended by the same run's apply step, and
  the method has no lane for it.** `total-restart-point-by-reference` was forged
  in-session and its apply row came back `not-better` against a plugin host that
  cannot satisfy its precondition, because the durable content is opaque to the
  runtime by design. That condition belongs in the technique, and Phase 7.5's
  `not-better` clause says exactly that ("it gains an amendment stating the
  condition under which it did not hold"). It was **deferred** here on the
  judgment that a condition established from one tree is a lead and a second
  sighting should decide whether the boundary is "plugin hosts" or the narrower
  "any host whose durable content is opaque to it". But the method does not
  distinguish those two cases, and a run that forges and applies in one session
  will hit this every time. The proposal: say explicitly whether a same-run
  amendment is written immediately or banked, and on what test - otherwise the
  answer is whatever the director felt like, which is what happened here.

- **Nothing a mid-flight sibling should do about this entry.** No `SKILL.md`
  edit was made and the version is unchanged; every bullet above is a lesson or a
  proposal. Finish on the version you loaded.

## 2.3.2 - 2026-09-04 - flatnotes (second pass, rows 2 and 5)

- **A design-record `corpus: NONE` can be wrong in one specific direction: the
  read hunts the DECISION and misses the subject that owns the CONSTRAINT behind
  it.** Entry C1 recorded NONE for a session token duplicated into a cookie so
  that browser-issued subresource loads authenticate. The corpus owned it —
  `stream-proxy-hop/credential-attachment-at-the-hop` opens on the identical
  protocol fact (a client that cannot set request headers) and already ranks the
  auto-attached credential first. Nothing was going to find that by mapping
  "attachment", "cookie" or "subresource", because the subject is named for a
  *streaming proxy*. The generalisable move: for a design entry, map the **force**
  as well as the decision. The decision was "put the token in a cookie"; the force
  was "this request cannot carry a header", and the force is what the corpus had
  filed.

- **The verification that DOWNGRADES a row is worth as much as the one that
  confirms it, and the method should be able to say so.** Row 2 went from
  `real gap` to an amendment. That is not a miss — it is the check working, and
  it changed the landing from a new technique in a subject whose stated job
  excludes it (a misfile that would have sat there for months) to a boundary
  section in the file that already owns the constraint. The scorecard's Landed
  column counts shapes; nothing in it records that a shape *changed on
  verification*, which is the single clearest evidence that Phase 6 is doing
  work. Worth a depth-cell token.

- **An amendment refuted by its own apply step is the strongest outcome available,
  and it is only reachable because the apply step is mandatory.** The row-2
  amendment was written from one tree and was wrong on its discriminator; the
  second tree it was walked against had reached the same protocol fact, chosen a
  different rung, and *written down why* — and its reasoning was correct. Had the
  apply step been optional, the amendment would have shipped with a boundary drawn
  at "content-issued versus app-issued" instead of at "who owns the URL string and
  whether it outlives the credential", and the corpus would have carried a rule
  that makes a good tree worse. The 40-minute gap between landing and refutation is
  the argument for Phase 7.5 not being skippable.

- **A third tree whose answer is "the question cannot arise here" belongs in the
  technique, not just in the ledger.** kp's markdown renderer enumerates a closed
  tag subset with no image syntax, so no content-issued request exists to
  authenticate — and that fell out of an injection-safety decision, with the
  credential question never considered by anyone. An empty enumeration whose
  emptiness is *structural* is a finding; the amendment now says to run the
  enumeration even when you expect it to be empty. Two of three cases in that
  application are negative, and it is the most useful application of the run.

## 2.3.2 - 2026-09-04 - `pi` (correction: a stale belief under a correct lock)

- **The `ledger` lock protects the append; it does not protect the belief the
  append asserts.** This run re-read `applied.md`, `sources/index.md` and
  `SCORECARD.md` inside the lock before appending to each - the discipline the
  method names, correctly applied, and no line was lost. It then wrote a cell
  and a focus item asserting that `techniques_absent` was on its **ninth
  deferral**. It had been **closed** four commits earlier by a sibling this run
  had watched on the board all afternoon, and the run appended its own lessons
  entry directly below that closure without reading it. The re-read protected
  the *rows*; the *claim* came from a Phase 1 read of a different file. **A
  parallel run must re-read the file that carries a decision before asserting
  the decision's status - and for a standing item that file is `LESSONS.md`,
  which Phase 1 never sends anyone to.** Phase 1 step 5 says read `SCORECARD.md`'s
  last row and closing paragraph; the closing paragraph carries the *focus*, and
  the *decision* lives elsewhere.

- **The blast radius of a stale claim is larger than a lost line, which is why
  this is worth a method edit rather than a note.** A dropped ledger row costs
  one row. This wrote an instruction into the one paragraph every subsequent run
  reads at its own Phase 1 - "the next run that answers at subject grain owes the
  closure" - so the error was not merely recorded, it was **queued for
  re-execution**, and two runs had already started against it. The anti-pattern
  "appending to a ledger from a read taken before the lock" has a sibling that
  the list does not carry: **writing the NEXT run's focus from a read taken
  before the lock.**

  ### Redesign proposal - not applied here

  One clause in Phase 11 lane 0, and it is cheap: **before writing the closing
  focus paragraph, re-read `LESSONS.md`'s entries added since this run's Phase 1**
  (`git log -p --since` on that file, or simply its tail), because that is where
  siblings record decisions that retire focus items. The focus paragraph is the
  only artifact this skill writes whose audience is every future run, and it is
  currently the one written from the oldest read. Not applied from one sighting -
  but this sighting cost a real instruction to a live fleet, so the bar for the
  second should be low.

- **A closed item's reopen condition is the thing to check, and checking it is
  one question.** The closure states: reopen on two runs blocked at technique
  grain within one round-window that a single file read does not resolve. Round
  11 was **not** such a sighting - its direction pass never ran at all, for an
  unrelated reason (the project carries no `scope` block), so it produced no
  technique-grain evidence in either direction. Recorded so the next run does not
  have to re-derive that either. The item stays closed.

## 2.3.2 - 2026-09-04 - obscura

- **The operator granted a STANDING tree authorization and asked for it to be bent into
  the method: "apply to any project which can benefit always."** That is the answer to
  the second half of the Phase 5 question, given once, for every future run. Applied as
  2.4.0: Phase 5 stops asking which trees may be touched, and Phase 8 stops treating a
  *coverage* change as needing per-run confirmation. Three things did NOT change and the
  edit says so explicitly, because a standing grant is not a blanket one: a **direction**
  (a new capability) still waits for the owner's ledger row, the paired proof before a
  cross-repo commit is untouched, and **never push** is untouched. The grant removes a
  question nobody was answering, not a gate that was catching anything.

- **A denial is a better find than a hole, and this run should be the worked example the
  next reader is pointed at.** `guest-execution-bounding` was forged the previous day and
  had already *considered* the mechanism this source demonstrates, rejecting it in three
  clauses. All three were objections to killing a thread; none survives when the host
  calls a termination handle the engine published instead. The method's Phase 6 hunt 3
  already says "a denial is an enumeration too: check whether it denied too much" - it
  worked exactly as written, and the reason it worked is that the denial was *specific*.
  A vague subject cannot be refuted. Worth saying to future runs: **the subjects most
  likely to yield are the ones that argued hardest**, because an argument states its
  premises and a premise can be false.

### Redesign proposal - the apply vocabulary needs a fourth verdict

- Round 11 asked for this and this run is the instance, so it is now two sightings and
  stays a lesson under the three-run rule rather than becoming a rule.
  `better` / `not-better` / `unmeasurable` cannot express **"the tree already does this,
  independently"** - which is not a middle outcome between the three, it is the
  *strongest corroboration the method can produce without a fetch*: a second independent
  sighting of a mechanism from a different problem domain.
  This run's row says `better` only because 8 residual sites happened to change. Had the
  target project's coverage been complete, the run would have discovered a genuine second
  sighting of the rule and had **no honest cell to record it in** - `not-better` reads as
  a rejection in every summary, and `unmeasurable` is false. Proposed value:
  `already-convergent`, with the same obligation `unmeasurable` carries (name what would
  distinguish independent convergence from the project having read the corpus - here, the
  project's comment predates the subject's forge date, which is checkable from git).
  **The third sighting closes it.**

- **A file-level grep is a hypothesis, not a finding, and this run had it refuted in both
  directions in one pass.** Pairing "files containing a timeout" against "files containing
  the guard" produced 15 suspects; reading them produced 8 real ones, because 5 killed the
  child explicitly on the timeout branch (a different correct pattern the grep cannot see)
  and 2 more were miscounted. It also **missed** one that the grep could never find: a
  child spawned *inside* the async block the ceiling drops. The corrective is not a better
  grep. It is that a structural count is only publishable after every member has been
  opened - the same rule this method already carries for establishing an absence from a
  truncated result, applied to a *presence*.

## 2.4.0 - 2026-09-04 - open_deep_research

- **The map names a home; the golden path's opening decides it.** Two design
  candidates mapped cleanly to `agent-chaining` on slug and `use_when`. Its
  first three paragraphs draw a boundary that excludes them both: an
  orchestrator-driven pipeline holds the whole authored graph, a chain is
  event-wired with the topology implicit in subscriptions - and a fan-out a
  language model decides per turn is neither, because the topology does not
  exist before the turn. `fleet-orchestration` took them without strain once
  the dispatcher was allowed to be a model. Phase 6 already says to read the
  file; this is narrower and mechanical: **read the chosen subject's own
  boundary statement, which this corpus always puts in the golden path's
  opening, and quote it in the source note.** Cost: one read. It was the
  difference between two techniques in the right subject and two in a subject
  whose first paragraph argues against them.

- **A refutation at two of three sites is the run's best row, and the verdict
  column still cannot say it.** The escape-hatch amendment predicted uncapped
  failure fallbacks in bounding stages. Walked against three real sites in the
  applied tree, two already cap their fallback below the trigger exactly as the
  amendment prescribes, and the third states the amendment's disclosure rule in
  its own source comment - *a refusal is loud, a truncated command line is not*
  - and refuses rather than truncating, which is **stronger** than what the
  amendment asks for. The row reads `not-better`, which in every summary reads
  as "the technique failed". It did not: it was confirmed by a tree that had
  reached it independently and gone one step further. Third consecutive run to
  report this shape.

  ### Redesign proposal - a fourth apply verdict

  Add `converges` to the closed set. `not-better` means the test ran and the
  technique did not help. `converges` means the seam already implements the
  mechanism, the test's value was the confirmation, and the correct next move
  is to cite the seam in the technique rather than to amend it. The distinction
  is not cosmetic - it decides whether the next run treats the technique as
  weakened or as corroborated, and two `not-better` rows currently demote a
  technique to a lead. Round 11 proposed it, round 12 supplied the instance,
  this run supplies the case where the target is ahead of the registry. Three
  sightings is this file's own bar. Not applied here: it changes Phase 7.5's
  vocabulary and the demotion rule that reads it, and eleven sessions are
  holding this file.

- **Run the falsifier as arm A, not as a check afterwards.** The shipped row's
  test was written to fail against the unmodified tree and run there first. Its
  first three assertions passed - the loop really did charge 96 of 200
  requested turns and really did say nothing - so the defect was established by
  the instrument rather than by the argument that produced the hypothesis, and
  the same file became the after-arm with no extra work. Cheaper than proving
  it twice, and the failure output is the paired proof's A arm verbatim.

- **A mid-flight run should finish on the version it loaded.** This edit adds
  no procedure; the lesson above proposes one and does not apply it.

## 2.4.0 - 2026-09-04 - agent-reach

- **A subject that already found a category once is the cheapest place to find
  its second member.** `docs-sync` wall 12 had discovered the permanent-
  `unverifiable` state for figures and written the sentence "unverifiable
  permanently rather than occasionally". The source's promise-pinning material
  fell straight into that shape, and the technique got its whole spine from the
  **contrast** rather than from the source: a figure is unverifiable because it
  cannot be read (fix: digest the inputs), a promise because it has no inputs
  (so the comparison cannot be inverted at all). Phase 6's hunt 3 says to test
  an enumeration for what it excludes; this is the adjacent move and it is
  cheaper — **when a subject names a permanent or degenerate STATE, ask what
  else lands in it**, because the author reached that state from one direction
  and a state with one member is usually a state with two.

- **`not-better` against a technique's own stated disqualifier is not a
  rejection, and the method's default reflex is wrong for it.** Phase 7.5 says a
  `not-better` row earns the technique an amendment naming the condition under
  which it did not hold. Here the technique *already named the condition* — the
  fleet owns every namespace it names, which is verbatim its `When not to use
  this` — so the honest outcome is that the boundary was measured and held, and
  writing an amendment would have been padding a technique with a restatement of
  its own last section. **Check the technique's exclusions before writing the
  amendment a `not-better` seems to owe**; if the row landed inside a stated
  exclusion, the finding is the confirmation, and the ledger note is where it
  goes. Second vocabulary gap now standing alongside `already-convergent`, and
  the same shape: a verdict set built for outcomes being asked to carry reasons.

- **Three sightings now say a design-deep repository keeps its design record
  somewhere other than a design folder**, and the sweep order should say so.
  Source header comments (duckdb-wasm), abstract base classes and a
  validate-or-exit config object (flatnotes), and now a **policy test suite**
  that asserts prose. In all three the tree had no `docs/design` and no ADRs,
  and in all three the README named none of it. The sweep order's item 1 is
  "the operating documents", which sends a run looking for a folder; items 2, 4
  and 5 are where these actually were. Not applied as an edit from this run
  alone — but the *tell* generalizes and is cheap: **a test-to-source line ratio
  above 1 is a design record living in the assertions**, and this tree was at
  1.36:1 before a single file was opened.

  ### Redesign proposal - not applied here

  Phase 2d could carry one line: before the sweep, compute the tree's
  test-to-source ratio and its markdown-outside-README word count, and let those
  two numbers pick the sweep's *entry point* rather than walking items 1-6 in
  order. This run walked the order, found nothing at item 1, and only reached
  the yield because the routing count sent it back. Two runs have now paid that
  cost. The bar for the third should be low.

- **The direction pass has been skipped four runs running for one structural
  reason, and calling that a note is now the error.** `fleet-map.json` is a
  shared committed artifact; a parallel checkout is almost always dirty; so a
  pass gated on regenerating it is gated on a condition that a busy fleet
  rarely satisfies. Ten proposals have accumulated unread across two projects.
  This is not four runs being unlucky — it is a design fault in where the
  gating artifact lives, and the next run should report it as one.

- **A swept append is recovered by VERIFYING, not by re-appending** - and this
  run was the victim, which the method has never written up. This run appended
  to `SCORECARD.md` and `LESSONS.md` under the `ledger` lock, released it, and
  a sibling committed both files sixty seconds later with its own message and
  a body that denies the very row my append had just added ("no third sighting
  and stays at two" - my row is the third). The `git commit` that followed
  exited "no changes added to commit", which is the *only* signal that anything
  happened, and it reads like a no-op.

  The recovery is one command and no edit: **`git grep <your slug> HEAD -- <the
  file>` before concluding anything.** Both appends were present and correct;
  re-appending would have produced duplicate rows in a file two sessions were
  already fighting over. The lock did its job - the append was not lost - and
  the lock cannot cover the window between unlock and commit, which is where
  a sibling's broad `git add` lives. So: after any ledger append, if your own
  commit reports nothing staged, that is the expected shape of having been
  swept, and the next move is to verify and stop, not to write again. Attribution
  is the only thing actually lost, and it is not worth a duplicate row.
## 2.3.2 - 2026-09-04 - fluxer

- **The apply step may send a finding BACK to Phase 7, and doing so beat the
  alternative.** The method sequences land (7) then test (7.5), and Phase 7.5's
  `not-better` arm says the technique "is not deleted; it gains an amendment
  stating the condition under which it did not hold." That is the right rule for
  a technique already in the corpus. It is the *wrong* rule inside the run that
  is minting it: this round's headline technique was refuted by its own apply
  step before commit, and rewriting its selector produced a single coherent
  document, where amending would have shipped a wrong rule plus a paragraph
  retracting it. Nothing in the method says the finding may go back a phase, and
  a reader following it literally ships the worse artifact.
  ### Redesign proposal
  Phase 7.5 gains one sentence: *when the finding being tested has not yet been
  committed, a `not-better` verdict returns it to Phase 7 for rewriting, and the
  application document records the refutation. An amendment is for a technique
  the corpus already published.* The apply row stays `not-better` either way -
  the verdict is about the test, not about what was done with it.

- **A `not-better` that rewrites its technique, one that confirms a stated
  exclusion, and one that simply fails are three different results in one cell.**
  This run produced the first two in the same round (the zero-depth refutation;
  and `refusal-without-release` landing exactly on the boundary its own closing
  section draws, against a tree on the release side of it). Both read as
  `not-better` in `applied.md` and in the scorecard, and the second is a
  *confirmation* of the technique's judgment. Two runs have now recorded
  confirmations as `not-better` for want of a word.

- **Phase 7.6 can silently produce nothing, and no step notices.** The direction
  pass is specified to run per design-record entry whose `corpus:` names a
  subject. Here every such entry named one subject, whose seam the authorized
  peer already has - so there was no *absence* to classify and the pass produced
  no output and no statement that it had run. `directions=0/0` in the depth cell
  is therefore indistinguishable from `n/a` (a news source with no design
  record) and from a pass that ran and admitted nothing. The pass needs to report
  its own outcome in words, which is round 10's first focus item.

- **A worktree is artifact isolation, not only branch isolation, and that is the
  stronger argument for taking one.** The method's parallel section recommends a
  worktree for branch safety, and separately warns that regenerating the index in
  a shared checkout can bake a sibling's uncommitted subject into a hash you then
  commit - with a `git grep HEAD` check as the remedy. From a worktree the second
  hazard cannot occur at all: the build reads only that working tree. This run
  regenerated beside two live siblings and `git status --porcelain knowledge/`
  returned exactly one file it had not authored - the generated index itself. The
  remedy is still correct for shared-checkout runs; the worktree removes the
  class.

- **Five parallel design readers, and two refuted the director's brief - both
  correctly.** One was told the CI workflows are generated from a Rust program
  and found the opposite (the YAML is deliberately logic-free glue invoking one
  typed binary, so there is no generator and therefore no drift surface to
  check); the other was told to find the LLM pipeline's token/cost budget and
  found that `tokens.rs` is placeholder protection and that no cost accounting
  exists anywhere. Both inversions were better than the questions. The forge
  brief's "tell the worker to override you and say so" clause is doing real work
  in the design-read lane too, and the readers only overrode because the brief
  asked them to.

- **Two consecutive rounds now: the routing count is met and the answer is still
  not a forge.** This one adds a case the previous did not have - the
  *cross-system* cluster (four independent sightings of forked-policy drift in
  one tree) was refuted by the corpus rather than by arithmetic, because
  `quality-gates` already owns it in three techniques. Worth stating in the
  method that a high routing count is evidence about the tree's density, not
  about the corpus's gaps, and that the cluster clause needs the same
  read-the-neighbour discipline as a per-system count.

- **Tooling, for whoever hits it next:** backticks inside a double-quoted
  `py -c "..."` are command-substituted by the shell before Python sees them, so
  a Markdown code span silently becomes an empty string and the append succeeds
  with a hole in it. Caught here only because the substitution printed
  `command not found`. Use a quoted heredoc (`py - <<'EOF'`) or the Write tool
  for any content carrying backticks.

- Mid-flight runs on an earlier version: nothing to do. No `SKILL.md` change was
  made this round - the proposals above are first or second sightings and stay
  lessons under the skill's own three-sighting promotion rule.

## 2.3.2 - 2026-09-04 - jetkvm

- **The prior-art maps have a shared blind spot, and running two phrasings does
  not cover it.** Round 7 taught that a disagreement between the concern-phrased
  and forces-phrased queries is the signal. This run got a disagreement — and
  both answers were wrong the same way. `research-map` matches slugs and
  `use_when` text; it cannot surface a subject whose name shares no token with
  any term you thought to type. Twenty terms across two passes never mentioned
  `self-healing`, which is the subject that owned the ground. What found it was
  four lines of `node -e` printing the subject slugs under each category in
  `taxonomy.json`. **Read the category listing for every candidate home before
  writing "no prior art" or accepting a proposed new subject.** The instrument
  already exists, costs nothing, and is the only one that can see a concept the
  query vocabulary cannot name.

- **The v2.2 routing count is a trigger, not a verdict, and Phase 6 step 1 is
  what turns it into one.** The count fired cleanly (3 unhomed decisions in one
  system) and pointed at a forge handoff. Reading the actual neighbour file
  converted it to "technique triple in an existing subject" — v2.2's other
  branch — with no forge worker dispatched. Worth stating in the method: a
  routing count computed against a map that missed the home is a count of the
  map's blind spot. The count decides *whether to look harder*, never *where to
  land*.

- **On a `not-better` reading, keep going before writing the row.** Round 9's
  focus item said to ask what the tree knows that the technique does not. Doing
  that inverted the verdict: the tree deliberately survives its own give-up as a
  witness (contradicting the technique's exit rule, so `not-better`), and the
  next question — *can anything read the witness?* — found that nothing could.
  The row shipped as `better`. **A `not-better` that has not yet asked whether
  the tree's better idea actually works is a premature row**, and the ask is one
  question deep.

- **A gate can be correct and still prescribe the defect.** The project's chart
  policy `probes-distinct` diagnosed the right constraint and its remediation
  string told operators to configure the broken thing. When a finding contradicts
  a project's own guard, read the guard's *remediation text*, not just its
  predicate — the predicate is reviewed, the fix-it string usually is not, and it
  is what people follow.

- **Two rounds of "no seam anywhere" is a method question, not a run result.**
  Three of four findings this round, two of five last round. Either the triage
  gate should weight testability by the fleet, or unapplied-with-a-return-condition
  should be scored as a terminal state rather than as a loss. Deferring the choice
  a third time makes the funnel measurement wrong rather than absent.

*Mid-flight runs: nothing to do. No `SKILL.md` edit was made this round; these are
lessons pending the three-run confirmation rule.*

## 2.3.2 - 2026-09-04 - Sylinko/Everywhere

- **The ship authorization is now standing, and the method changed to say so
  (v2.4.0).** The operator lifted the cross-repo gate permanently: where a run
  identifies the impact, it may change the project tree without asking. Phase 5's
  two-part question became one, Phase 8 step 2 became "no confirmation needed", and
  the anti-pattern inverted - asking again for permission already given is now the
  anti-pattern. What stayed gated is the pair that was never about permission:
  a *direction* still waits for its ledger row, and a diff too large to read in one
  sitting still takes a branch. **A mid-flight run on 2.3.2 should finish on 2.3.2**;
  the only difference is one question it will ask and need not.

- **`corpus: NONE` over-reports, two rounds running, and the failure is the same
  both times.** The map ranks by slug and `use_when` overlap, so a design decision
  whose forces a subject models but whose vocabulary it does not share reads as a
  hole. Round 9 caught it by reading `taxonomy.json`'s category listing; this round
  caught it because the neighbour happened to rank first. The instrument is right and
  its negative is soft: **NONE means "no subject shares this finding's words", never
  "no subject owns these forces".** Before a routing decision, read the taxonomy
  listing for the implicated area. This is a candidate rule for the file after one
  more sighting.

- **A `better` verdict does not mean the technique was complete.** The apply step's
  focus item was written for `not-better` rows - on a rejection, ask what the tree
  knows. This round returned `better` and the tree was *still* ahead: it had reached
  the amendment's discipline independently and applied it more consistently than the
  mined source, and its refinement (demote the *reason* with the bound, because the
  reader on that rung reasons) is now the amendment's second paragraph and is better
  than anything the source offered. **Ask the tree what it knows on every apply row.**
  The verdict grades the change, not the technique.

- **A repository's routing count can clear the threshold and still correctly refuse a
  handoff.** Two clusters at 3 and 5 unhomed decisions, both naming an *existing*
  subject. Under v2.2 that is a technique cluster, not a forge - and the run is worth
  reporting as a **compliment to the corpus**: the subjects were scoped well enough
  that a system this dense lands inside them. A run that reads a high count as
  automatically forge-shaped has skipped the second clause.

- **Two of the five design series were in Chinese, and they were the two largest**
  (12,162 and 4,539 words). A sweep that reads only the English documents would have
  reported this tree at roughly half its size and would have missed System B
  entirely. Add to the repository sweep: check the language of every doc series
  before deciding the tree is thin.

- **The narrative design series is the highest-yield document shape a repository
  offers.** ScreenPicker's four chapters are organised as *what we tried and why it
  failed*, ending on a solution that made the previous two chapters unnecessary. Every
  `rejects:` line in the design record for that system came free. When a tree has one
  of these, read it first and read all of it - the forces are already written, which
  is the expensive half of a design entry.
## 2.3.2 - 2026-09-04 - opik

- **A routing count above threshold with every home already existing is a
  distinct result, and the depth cell renders it as a miss.** Six unhomed
  decisions over four systems, per-system max three - and no forge, because
  `agent-instruction-files`, `pipeline-authoring`, `untrusted-extension-host` and
  `metric-surface-contract` were all already there. The cell reads `S0` and looks
  like a routing failure. Round 10 hit the same shape and had to explain it in
  prose too. Two rounds is a pattern; the convention (say it in the row) is
  cheaper than a new column and is this round's declared focus.
- **The `.agents/` shape is now common enough to expect: a vendor-neutral source
  directory with per-host targets, some symlinked and some generated.** Sweep it
  the way the method sweeps operating documents - here it was ~85,000 words
  across 80 files against a 2,799-word landing page, and it was the densest
  first-party material in an 11,266-file tree. It is also where an
  agent-instruction finding will come from, because the tree is *using* the thing
  the corpus theorises about.
- **A tool re-implementing another tool's decision function is a recurring
  source shape, and it reads as ordinary glue until you ask who else implements
  it.** The tell is a script that parses a config file it does not own. The
  question that turns it into a finding: what happens when that config uses a
  feature this parser does not model? A good answer is a loud refusal; the common
  answer is silence.
- **The measurement instrument gave a confident wrong answer, and the assertion
  harness caught it - then the assertion itself was wrong and the instrument was
  right.** First version grepped workflow files for each hook's script path: 9
  gaps, 6 false, because CI invokes npm wrappers. The corrected version carried
  two known positives and one known negative, and the *negative* failed - because
  I had verified that negative by hand with a grep that also only read workflow
  files. The hand-check and the instrument shared a blind spot, and only
  expanding the wrappers resolved it. **A known-good assertion inherits the bias
  of however you established it.** Establish the positive and the negative by
  *different* means than the instrument uses, or the harness certifies its own
  error.
- **Windows: `subprocess` with `text=True` translates `\n` to `\r\n` on
  stdin.** Piping file content into `git hash-object -w --stdin` that way stages a
  byte-different blob, and a one-section append renders as a 288-line whole-file
  rewrite - which, in the partial-stage flow this method uses on shared subject
  notes, would have committed a rewrite of a file a sibling was editing. Use
  binary I/O for anything that becomes a git object. The check that catches it is
  free: `git diff --cached --stat` should show roughly the number of lines you
  wrote.
- **A worktree of a project with a hook-based gate cannot run the gate**, because
  it has no `node_modules` and the linter's own config fails to resolve. Junction
  the dependency directory in from the main checkout, run the gate for real, and
  **remove the junction before removing the worktree** - `git worktree remove`
  would otherwise delete the real tree through it.
- **`not-better` twice, both confirmations rather than defects, and both worth
  the row.** One tree already sat correctly in the regime the new amendment's
  question routes it to; another satisfied the new technique's own escape clause
  (zero runtime dependencies, so no substitution needed). Neither changed a
  project and both are evidence the rule is right. The vocabulary handles this
  fine; the risk is a future run reading a `not-better` streak as a weak corpus.
  Say in the row which kind it is.

## 2.4.0 - 2026-09-04 - cargo-make

- **The routing count's two clauses can both read 'three' and still not fire, and
  the run must say which.** This tree carried three unhomed decisions in one system
  (the descriptor) - which reads like the v2.2 technique-triple trigger - but the
  three did not share a home: one wanted `repo-manifest-standard`, two wanted
  `settings`. The trigger is *three sharing one home*, not *three in one system*, and
  a run that reports only the per-system number will hand off a repository whose
  decisions scatter. Write both counts AND the grouping, not just the maxima.
- **A source with nine unhomed decisions is not automatically a forge job.** Twelve
  rounds of v2 have optimised against under-routing; this is the first round where
  the honest answer was 'many decisions, no cluster'. Say the count out loud and
  then say no - the count is an input to the decision, not the decision.
- **The apply step refuted the run's own technique twice, and one refutation would
  have shipped a regression.** Applying `version-gate-precedes-schema-gate` to this
  registry's taxonomy loader, the obvious early return was *worse* than the shipped
  behaviour: the loader returns a triple whose callers guard on the parsed object, so
  a truthy early return leaves them cross-checking against an unpopulated map - 191
  spurious findings. Only the third arm (return the loader's existing not-usable
  signal) was correct. **Always build the arm the technique implies AND the arm the
  caller's guard implies**; the second one is where the regression hides, and a
  two-arm A/B would have shipped it.
- **`unapplied` needs a predicate, exactly like every other count in this corpus.**
  Two of five rows this round were `unapplied` - but established by enumerating 108
  termination sites across three trees, not by shrugging. That is a different fact
  from an unattempted row and the ledger cannot currently tell them apart. Proposed
  as round 13's focus (3).
- **A profile limit, not a method one: one application slot per (stack, technique).**
  `check-bundles` requires the filename `<stack>--<technique>.md` exactly, so a second
  tree on the same stack cannot be recorded. This run's shipped `gate-liveness`
  realization has a ledger row and no application, because `node--gate-liveness` is
  held by an unrelated tree. The workaround used for `rust--fork-to-outlive-the-healed`
  was to write ONE application covering both trees - the external positive and the
  fleet rejection - which turned out to be a *better* document than two would have
  been, because the pair is the finding. Worth considering as the default shape rather
  than a workaround.
- **Mid-flight runs: nothing to do.** This version bump is a patch-level method note
  plus a scorecard row; finish on the version you loaded.

## 2.4.0 - 2026-09-04 - gamedev-resources

- **A reference index has two sub-classes and the method only describes one.** The
  Phase 2c ratio test (outbound links over own word count) finds the *lane*
  correctly and says nothing about whether the lane is worth running. A
  **bibliography** points at documents that can authorize a finding - papers,
  vendor docs, specs - and the wave machinery is built for it. A **directory**
  points at products, and every one of those references strips to nothing by
  construction, so the correct expected yield from all of them is zero regardless
  of how many are read. This source: 356 links, 4,245 words, ratio inverted as
  predicted, and ~90% of the references are engine and tool landing pages. The
  discriminator is the **class mix of the references**, which Phase 2c step 2
  already computes and currently uses for nothing. First sighting; not yet a rule.
- **A class name settles what a source is reliable FOR, not where in it to look,
  and those come apart.** The lane's instruction here is to enumerate and read the
  references. Obeying it would have spent a per-reference budget on tool homepages
  and reported an honest zero. The whole run came from four non-README files under
  5,000 words and 495 commits of history - a `.travis.yml` and its commit messages
  produced two amendments to two mature techniques. The run recovered only because
  Phase 2b's sweep runs regardless of class. Proposal for round 14's focus: say the
  expected *location* of the yield out loud beside the expected quantity.
- **Git history is a first-party operating document, and it is the only one a
  five-file repository has.** The Phase 2b sweep order lists operating documents,
  the instrument, the measurement, the types, the tests, the README. This tree has
  none of the first five in file form - but twelve years of commit messages
  recorded, one at a time, exactly which host had just been wrongly flagged and
  whether the response was to remove the link or exempt the host. That is a
  paid-for failure taxonomy with dates. The sweep order should name history
  explicitly for small trees rather than leaving it to be remembered.
- **The apply step refuted the run's own INSTRUMENT this time, not its prose.**
  Fourth consecutive round where the apply step corrected the landing before the
  commit, and the first where the corrupted artifact was the measuring device: the
  citation sweep reported 6 dead citations, of which 5 were `${...}` interpolations
  and regex fragments its URL regex pulled out of fenced code blocks. Narrowing to
  prose moved it to 1 - a 6x error in the alarming direction. The corpus had
  already named the cause (`checker-false-positive-discipline`, "never
  pattern-match a language you have a parser for"), which is an argument for
  reading the neighbour techniques of the thing you are *building*, not only of the
  thing you are landing.
- **`process--<technique>.md` is the escape hatch round 12 was looking for.** Round
  12 filed the `<stack>--<technique>.md` uniqueness limit as a structural blocker -
  a second tree on the same stack cannot be recorded, and its `gate-liveness`
  realization had a ledger row and no application. `node--gate-liveness` is taken;
  `process--gate-liveness` was free and is arguably the more honest stack for a
  realization whose subject is a workflow rather than a runtime. Two of this run's
  three applications used it. Note the gate's rule that comes with it:
  **`stack: process` forbids `verified_against` entirely** ("a process application
  has no runtime version"), so the tree's witness commit goes in the prose instead.
- **Do not regenerate the index when a sibling's WIP is in the tree.** `run-board`
  showed one live sibling; `check-bundles` was red on 23 problems, every one in
  their uncommitted files and none in this run's. Regenerating would have read
  their half-written subjects into `index.json` and `catalog.json` and committed
  the hash under this run's name. Left stale deliberately, and said so in the
  source note. The method already carries this rule; recording that it fired.

### Redesign proposal (not applied)

Phase 2c's ranking step ("rank the whole set against the corpus") is written as
though ranking is always the right next move. For a directory it is not - the
correct move is to **abandon the reference lane entirely** and spend the run on the
tree, which is what happened here by luck rather than by instruction. A cheap stop
rule would be: after step 2 classifies the references, if fewer than ~20% belong to
classes that can authorize (paper, spec, vendor doc, first-party account), declare
the reference yield zero, say so in the note, and route the whole run to Phase 2b.
Proposed rather than applied because one sighting cannot distinguish a threshold
from a coincidence.

## 2.4.0 - 2026-09-04 - kdenlive (round 14)

- **`techniques_absent` is CLOSED, not deferred. The item is deleted.** Round 13's focus
  said "either build it or write the argument that the category listing plus one
  golden-path read already answers the question it was proposed for, and delete the
  item." Here is the argument, and it is stronger than the eleven deferrals suggested,
  because the deferrals were all reporting the same finding without recognising it.

  The item was proposed in round 2 so Phase 7.6 could distinguish a **technique-grain**
  absence (this project has a context the subject governs, but nothing at this
  technique's decision point) from a **subject-grain** one (this project has no context
  the subject governs at all). The fleet map resolves at subject grain, so the proposal
  was: cache a per-pair `techniques_absent` list into `fleet-map.json`.

  Seven runs have since consulted the map at technique grain. **None of them wanted the
  list**, and each independently reported the same workaround: `ls <subject>/techniques/`
  against the project's `.ai/registry-map.json`. Two O(1) reads of files that already
  exist and are current by construction. Rounds 6, 7, 8, 9, 10, 12 and 13 each recorded
  this as an excuse for deferring; seven identical excuses are not an excuse, they are a
  measurement.

  Three reasons to close rather than build:

  1. **It would be a second authority for a quantity the tree already answers.** The
     technique set of a subject is the directory listing. A cached per-pair list is a
     derived copy that goes stale the moment a technique lands and must be regenerated
     by the same build step - `one-authority-per-quantity`, and the corpus has an
     opinion about inventing that.
  2. **The grain problem was never a lookup problem.** Round 7 hit it directly, worked
     around it by hand in one step, and described the workaround as trivial. What is
     hard at technique grain is *writing a proposal that argues the forces* - and no
     cached list helps with that.
  3. **The cheaper instrument was found by accident and is better.** Round 9 found that
     reading the category listing out of `taxonomy.json` answers the neighbouring
     question (does a home already exist) and, in round 12, prevented two new subjects
     from being minted beside existing owners. That read is now standing practice. The
     `techniques_absent` list would have answered a narrower question at higher cost.

  **Action taken:** the item is removed from the owed list. No `SKILL.md` change - the
  method never named it; it lived only in the scorecard's focus line, which is why it
  survived eleven rounds without anyone being obliged to build it. **That is the
  transferable lesson: an owed item that lives only in a focus line has no owner and no
  gate, and will be re-deferred indefinitely by runs that each have a locally good
  reason.** An owed item belongs in `SKILL.md` with a trigger, or it belongs nowhere.

- **The corpus's incomplete enumerations are now the highest-yield hunt over a
  design-deep source, and both of this run's intake-retained landings came from it.**
  `undo-history` opened "There are **two** ways to make an action reversible" and priced
  exactly two; `seed-is-not-a-reproduction` closed with "**three lanes**, and they are
  not interchangeable". Both enumerations are correct about what they contain and both
  are missing a member that a real system runs in production. This is the fourth
  consecutive round where the enumeration/denial hunt carried the yield, and it is worth
  stating why it survives corpus maturity: a mature subject states its completeness
  claims *explicitly and in prose*, which makes them greppable, and the more confident
  the subject the sharper the claim. A slug map cannot see this and a summary cannot
  either - only reading the golden path's own opening can.

- **The forge worker corrected the director twice on facts the director had asserted,
  and both were in the frontmatter rather than the prose.** `verified_against:
  cpp@qt-6.10.0` named a *framework* where the field wants the document's stack - the
  tree witnesses `CXX_STANDARD 14` at `src/CMakeLists.txt:310` on every target, which I
  had not looked for because the CMake file advertises its Qt and framework floors
  loudly and its language standard not at all. And a cross-subject link was one `../`
  short in a nested category. Neither would have been caught by review of the prose,
  because both are the kind of line a reader's eye slides over. **A worker dispatched
  into the same tree is a second reader of the director's own diff, and asking it to
  report "gate output that is not yours" is what surfaced them** - that instruction was
  in the brief for the worker's benefit and paid off in the opposite direction.

- **A repository's own advertisement of its versions is not its witness.** Generalising
  the above: the version a tree shouts (a dependency floor in the top-level build file,
  a badge, a release note) is chosen for readers, and the version a document should
  record is the one something *compiles or runs against*. Look for the property that a
  build would fail without - a language-standard property on a target, a lockfile pin,
  an engines field - and prefer it over the number the project put in its headline.

- **An instrument that scores 4/4 on both arms has not measured anything.** The goat A/B
  returned a perfect tie on the first run, and the tie was the fake store failing
  validation so that `executePlan` mutated nothing and both arms scored the untouched
  initial state. It took two more corrections to separate the arms (a dense
  position-indexed grid, then a missing `isItemUsed` on the fake backlog whose absence
  threw inside a `try/catch` and returned a plausible failure result). **The general
  rule, and it is sharper than "assert the instrument against a known positive": print
  the MID-state.** A paired test has three observation points, not two, and the one
  between the arms - did the operation under test actually happen - is the one that
  catches a harness that is measuring nothing. Both of this run's false ties were
  invisible at the endpoints and obvious in one line of mid-state.

- **`not-better` earned by a cheaper alternative is a distinct and useful result.** The
  personas row did not fail to find a defect because the technique is wrong; it failed
  because the seam's real gap (a generator bound) was closable by the *neighbouring*
  technique - widen the generator - and closing it revealed nothing. That is worth
  recording as its own shape: **before applying a technique, ask whether an existing
  neighbour closes the same gap more cheaply, and if so test the neighbour first.** The
  answer here cost one generator edit and 8,000 cases, and it saved building a field
  capture lane nothing yet needs.

## 2.5.0 - 2026-09-04 - copilot-cost-efficiency

- **An instrument built to test a technique can violate that technique, and the
  violation is the finding.** This run landed "pins assert over behaviour, not over
  text", then built a *lexical* detector to test it: 10 flagged, 0 confirmed over 35
  real bulk rewrites. The refutation was predicted by the file it was refuting. Worth
  generalising into the method: **when the apply step builds an instrument, check the
  instrument against the technique's own rules before running it** - if the technique
  forbids the shape you just built, the experiment's result is already known and the
  budget should go to the shape it permits.
- **A threshold tuned to suppress false positives suppresses the true positives first,
  when the signal IS severity.** Three separate assertion failures in one run, all the
  same root: the strongest modality inversions rewrite the most words, so every
  similarity floor that quieted the detector also blinded it. The general form is worth
  carrying into any Phase 7.5 harness: **ask whether the thing that makes a hit
  strong also makes it dissimilar**, and if so, tune on the known positives rather than
  on the false-positive rate.
- **A design record is worth writing for a non-repository source when the source states
  forces and rejected alternatives.** The method's Phase 2d is written for a tree, and a
  run over an article would normally skip it. This source carried six decisions each
  with its forces, its rejected alternative and a measurement, and the record is what
  made the routing count computable and what turned four scattered claims into two
  homed candidates. Suggested method edit (not applied): let Phase 2d fire on a
  **first-party account that states forces**, not only on a repository, with quote
  anchors standing in for `file:line`.
- **The direction pass (7.6) is inert by construction for this skill's modal landing,
  and that is now measured rather than argued.** Its eligibility test is *presence*:
  a project with no context for the subject. `agent-instruction-files` governs a file
  every repository has, so `absent: []` - and the `llm-agent/*` subjects intake lands in
  most often are exactly the universal ones. Five rounds of "locally good reasons to
  skip" were all symptoms of one structural fact. The fix belongs in the fleet map, not
  in the run: eligibility should be **coverage-depth** based (a project whose context
  predates N of a subject's techniques is a candidate even though present). Recorded
  here rather than applied because `SKILL.md` had 126 uncommitted insertions from a
  live sibling session throughout this run.

### Redesign proposal

**The untriaged tail is write-only and should either get a drain or lose its number.**
Every round since 2.2 banks 3-5 untriaged candidates with anchors, and no round has ever
returned to one; this run banked five, two of which are its own unhomed design decisions
with homes already named. The method has `/intake apply` for techniques with no applied
row, and nothing for candidates that reached the table and were never picked. The
asymmetry is not defensible: an untriaged candidate is cheaper to land than a fresh
source is to mine, and it is already mapped. Proposal is an `/intake untriaged` mode that
re-ranks banked candidates against the *current* corpus before proposing them - most were
banked when their home did not exist, which is precisely the condition that changes. Not
applied in this run for the same reason as above: a method edit against a sibling's
in-flight 126-line diff is the one change a parallel fleet cannot absorb quietly.

## 2.4.0 -> 2.5.0 - 2026-09-04 - exo

- **The Phase 5 human gate was replaced by a scored admission gate, at the
  operator's instruction, and the calibration is the part worth keeping.** The
  instinct was to automate the yes. The ledger said something more useful: **149
  source notes carry a `declined` field and 134 read `declined: 0`**, with the
  scorecard's own prose recording the modal answer as "rows 1-6 per your
  recommendation". So the gate was changing roughly one run in ten by a median of
  one row, and the thing actually doing the selecting was the run's own `real
  gap`/`partial`/`likely catch` read. That reframes the change: not "ask less",
  but *a filter that decides everything while appearing to defer to someone else
  never has to justify itself*. The new gate is therefore **stricter** than the
  stamp it replaced, not more permissive. Any future loosening of it should have
  to answer that sentence.
- **Order is the safety property, not the arithmetic.** Vetoes, then escalations,
  then the score, with a score forbidden from overturning a veto. Without that
  ordering a scored gate is a rubber stamp that has learned to show its working.
- **The threshold is asymmetric on purpose and the asymmetry is already in the
  method.** A false reject costs a banked row with anchors that a later run picks
  up cheaply - the method guarantees this by never filing an unpicked row as
  declined - while a false accept puts an unearned claim in the upper layers.
  `GAIN - RISK >= 2` rather than `> 0` is that asymmetry priced.
- **The placement veto paid for the whole design on its first run.** Row 8 was a
  genuinely good finding (at-most-once chosen *because retry is the dangerous
  direction*, which no subject models) and its home was `llm-agent/runtime-and-io`
  at 10 of 10. Under the old gate it would have been proposed, picked, and
  discovered at the point where a forge worker built into a folder
  `check-bundles.mjs` rejects - the 2026-08-22 failure. Counting a category costs
  one command before drafting and a whole dispatch after it.
- **The promotion read is the piece to keep if only one survives.** Two rows were
  blocked solely by the "rests on an unre-checked worker report" penalty; one file
  read each flipped both, and one came back *stronger* than the worker had stated
  it. That converts the gate from something that punishes gaps in verification
  into something that aims verification where it changes an outcome. Its cost was
  two reads; its yield was two landings.
- **Known bias, recorded now so it is not discovered as a surprise:** `GAIN` gives
  its top score partly for landing in a subject `librarian-scan` names in its top
  15, so an excellent finding in a low-attention subject is structurally
  penalised. Defensible - attention points are the corpus's own measure of need -
  but not free. If `fp` stays at 0 while good rows keep landing just under
  threshold, that is the term to revisit first.
- **Mid-flight runs: finish on the version you loaded.** This edit changes one
  phase and leaves every other phase, the six outcomes and the corroboration table
  untouched, so a run that loaded 2.4.0 loses nothing by finishing on it.

### On the run itself

- **Parallel design-read workers produce within-source convergence, and the method
  has no name for it.** Two workers reading two *different* systems of one tree
  independently reached the same finding (a stop request whose receipt is
  observable needs two deadlines) and independently concluded the corpus does not
  model it. The method names within-batch convergence for the batch lane and
  within-index convergence for reference waves; it does not name this, and it is
  the same signal from a different geometry - arguably stronger, because the two
  readers had *different evidence* rather than different sources for the same
  claim. It promoted that row to the top of the table and it deserves a line in
  the method next time this shape appears. Not applied now: one sighting.
- **Both of this round's overturned assertions were absences read off capped
  output, and one of them was mine while quoting the rule against it.** I read a
  golden path's frontmatter with a 20-line cap, counted 14 techniques against 15
  files, and asserted a bidirectionality break; the fifteenth entry is on line 20.
  It was caught by the mandatory re-read *inside* the content lock - a discipline
  that exists for staleness and happened to catch a truncation error instead. The
  other was the scorecard's own stale account of the direction lane, caught by
  reading the fleet trees rather than the prose about them. **The pattern across
  both: the corrective for a capped read is not "read more carefully", it is to
  derive the claim from a different layer.**
- **A `code` arm can be blocked by the project rather than by the finding, and the
  distinction belongs in the row.** The seam was real, the fix was five lines, and
  the crate's build script fails on a pre-existing capability error before any code
  compiles. That is not `unmeasurable` - the policy difference was measurable and
  was measured on a faithful replication - so the row reads `experiment` with the
  blocker named and the committed test pointed at it. A mode downgrade caused by a
  broken gate should never be recorded as an absence of evidence.

- **An "unapplied, no seam" row is an absence claim and gets the same scrutiny as
  any other.** Three rows were filed saying no fleet project captures execution
  state; the peer study then found a 272-line checkpoint/snapshot/rollback/fork
  module in the peer, declared `pub mod`, backed by a migrated table, with zero
  call sites - verified independently before the rows were corrected. The rows are
  now *better* than they were: an unwired seam has a far sharper return condition
  than an absent one ("when the module gains its first caller"), and it is the
  cheapest moment a technique will ever apply, because nothing has shipped yet.
  **A searched absence is only as good as the search**, and "grep the tree for the
  concept" missed a module whose name did not contain the corpus vocabulary.

## 2.5.0 - 2026-09-04 - system-design-break-order

- **The scored gate cannot cleanly accept a corpus-verified factual correction.**
  A correction to a false sentence in a forged document scores GAIN 2 and takes the
  `+2` rewrite penalty, landing at 0 against a `+2` threshold. It was admitted only
  by reading the penalty's own stated test literally — *a rewrite is a change that
  makes a standing sentence false*, and correcting a false sentence makes nothing
  false. This class of landing is the cheapest and safest the skill produces (the
  evidence is the tree, not the source) and the gate is biased against it. A run
  that has to argue past its own score has a broken score. Proposed carve-out is in
  the round-16 closing paragraph.

- **A near-empty from `research-map` is not the only false absence; a concept query
  can miss a subject entirely.** Two concept maps ("capacity ladder", "when to add
  infrastructure") never surfaced `resilience/scale-investment-timing`, the one
  subject owning the source's whole thesis. A directory listing found it in one
  command. The existing rules cover truncated output and proper-noun queries; this
  is a third shape — a *well-formed concept query whose vocabulary the target
  document does not use*. Before writing "no subject owns this", enumerate the
  plausible category directories. It costs one `ls`.

- **Never chain a existence check and a destructive write with `;`.** This run ran
  `ls | grep -i scale || echo "no existing note"` immediately followed by a heredoc
  `>` in the same command. The check printed the file's name and the write clobbered
  189 lines anyway, because `;` does not gate anything. Recovered with
  `git checkout --`. The standing memory says to look at the target before
  overwriting; the operational form of that rule is that the look must be its **own
  tool call**, whose output is read before the write is composed.

### Redesign proposal

- **Make the promoting question the admission condition for `untriaged`, not a
  courtesy.** Rounds 12-15 banked 3-5 untriaged rows each and round 16 banked one,
  and the difference was not discipline about triage — it was that this round
  actually executed the promoting question on its only `partial` row, which closed
  it in a single file read. The scorecard has been reading the tail as a funnel loss
  needing a drain mode. The cheaper reading is that a `partial` row is *unread*, and
  a row may not be filed as untriaged until one file read has been spent on it. Test
  this before building `/intake untriaged`; a drain mode would spend a whole run
  re-deriving rows that one read would have closed on the day they were extracted.

## 2.5.0 - 2026-09-04 - rust-proc-macros

- **A row's home should be checked for viability at Phase 4, not discovered at Phase 6.**
  Three of this run's five surviving rows died for one reason - no home - and the run
  paid to verify them first. None was a close call: the obvious candidate subject
  (`codegen`) defines its own scope in its golden path's second paragraph as *committed
  source derived from other committed source*, which a macro expansion is not, and all
  seven of its techniques are inapplicable to an artifact that is never a file. One read
  of the `file` the map already returns would have routed all three to the lead lane
  before verification. The map's `why` line reports slug and `use_when` overlap; it does
  not report whether the subject's stated boundary *admits* the row, and those are
  different questions. Proposed for 2.6: before scoring, open the top hit's golden path
  and ask whether its stated scope admits the row.
- **The promoting question changed two outcomes this round, in opposite directions**, and
  that is the argument for promoting it out of the `partial` clause into the default
  first move after Phase 4. Positively: reading `io-free-core`'s decision rule and its
  "when not to use it" in full is the whole reason the accepted row landed as a technique
  rather than as an amendment to a technique that does not cover its case. Negatively: on
  the three rejected rows it produced the *evidence* for the rejection, which is what
  turned three loose rows into one coherent escalation instead of three shrugs. Two
  rounds running it has been the highest-leverage read in the method.
- **A landing verified only against the corpus has one reader.** The technique shipped
  claiming the remaining shim "contains no branches"; the tree it was applied to kept one
  guard, correctly, because reaching for the host had a side effect on the host. The only
  reason this surfaced is that Phase 8 demands a behaviour-preserving proof before the
  commit, which forces "does arm B still do what arm A did?". Phase 7.5 is not only how a
  technique earns its keep - it is the cheapest available review of the technique's own
  wording, and a run that lands and stops publishes its overreach.
- **Name the constraint from the config, not from the framework's reputation.** This run's
  first framing of the seam blamed a `server-only` import for the untestability. The
  project's own vitest config already aliases that module to a stub - which is why a
  sibling server-only file had tests all along - and the real blocker was the ambient
  request accessor alone. The wrong framing would have aimed a whole technique at the
  wrong constraint. A stack's documented restriction is a claim about the stack, not
  about this tree; the tree's test config is the authority on what the tree can reach.

## 2.5.0 - 2026-09-04 - modelcontextprotocol specification (round 18)

- **The rewrite carve-out is discharged, and it is incomplete.** Rounds 16 and 17
  asked for it and neither could exercise it; this run needed it six times. Five
  of the six corrections have a target sentence that is *demonstrably false*
  against the primary, which is exactly what the carve-out was written for. The
  sixth is a **currency** correction - the file said a question was open, and it
  was open on the day it was written. Nothing there is false, so there is nothing
  for the carve-out to exempt, and the full `+2` rewrite penalty lands on the
  cheapest and safest edit this skill makes. **The carve-out must read "false *or
  superseded*".** Not applying it yet: one run is one sighting, and the scorecard
  focus carries it to round 19 where a second currency correction can confirm it.

- **Mining implementations of a standard teaches you its architecture and not its
  rules.** Six load-bearing statements in a mature twelve-technique subject
  reproduced a superseded revision, and nothing about the run that wrote them was
  sloppy - it mined a large vendor implementation catalog, which is a legitimate
  and productive source. But an implementation shows you one vendor's *reading* of
  a standard, and a reading is not a citation. The architecture section that run
  wrote is still correct; every rule that depended on the standard's own wording
  was wrong. **Where a subject's material is a published standard, the standard is
  a distinct source that must be mined on its own**, and `rescan_when` does not
  create that obligation because it attaches to the source that was mined - a
  repository re-scan re-checks the repository, never the specification behind it.

- **An application can carry a mechanism its subject never learned.** The corpus
  already held this source's continuation-state mechanism in full - envelope,
  key floor, TTL, principal binding, constant-time compare - inside a *dated
  application* about one SDK's transport behaviour, described using the vocabulary
  of the rule it is an exception to. The gap was placement, not coverage, and
  nothing in the structure surfaces it: applications are read as evidence *for*
  techniques, never as candidates *to become* them. Worth a lane in some later
  sweep - "which applications describe a mechanism no technique states?" - but it
  is a librarian question, not an intake one.

- **The untriaged tail has two causes and the count conflates them.** Round 16
  said 13 untriaged and meant rows whose promoting question was never executed.
  This run says 13 and means something else entirely: 21 of 43 design entries had
  no home, 12 were admitted, and nine real, verified, corpus-absent mechanisms
  were banked for **writing capacity** alone - two of them after their promoting
  question had already been executed and promoted them. A drain mode is genuinely
  the right instrument for this second cause and genuinely the wrong one for the
  first. Report the cause with the count.

- **A specification repository is a source class this method does not have a row
  for.** It behaves like none of the fifteen: its ADR directory is first-party
  design record at a density no vendor repo matches (43 proposals each carrying
  Motivation, Alternatives Considered, Backwards Compatibility), it is
  simultaneously the *primary* that other sources are corroborated against, and it
  ships several published revisions in one checkout so a claim's history is a diff
  rather than a memory. That last property did most of the work here - the
  strongest finding was available only because 2025-06-18, 2025-11-25 and
  2026-07-28 were all in the tree at once. Not proposing a class row yet; one
  sighting.

- **The one that cost time: naming a defect before reading the tree's tests.**
  The pumper finding was first written as "the tool surface has no validation",
  which the tree's own test names refuted in one grep - the handlers validate by
  hand and already used the in-band channel correctly. The corrected finding is
  narrower and better (the *enforced* set had drifted from the *published* set),
  but the first version would have shipped a wrong sentence into an application.
  **Read the target's tests before writing the finding, not before writing the
  fix** - a test file is the cheapest statement of what a tree believes it does.
## 2.5.0 - 2026-09-04 - stencil-harness-playbook

- **The forge trigger's second clause cannot fire the way runs actually report homes, and this is the second run in two days to hit it.** The rule counts entries "sharing one `HOME IF NEW`" to detect a subject-sized gap. But a design-read worker asked for a home names the most specific correct place, which in a mature bundle is almost always an *existing* subject's `techniques/` directory. This run had 15 unhomed decisions across 6 systems - `agent-runtime-assembly` collected four of them - and the trigger did not fire, correctly, because those four are four techniques in a subject that exists. The clause is written as if "no home" and "new subject needed" were the same condition; in a bundle with 34 subjects in one category they have come apart. Not proposing an edit yet: the outcome has been *right* both times, and a trigger that never fires in a mature bundle may simply be the correct behaviour of a corpus that has outgrown a source class. Worth watching for the case where it is wrong - a genuinely new area where workers still name existing neighbours out of habit.

- **A design-deep source that is not a repository has no forge path at all.** `/forge` scouts a clone. This source was a 21,593-word book with a complete TLA+ appendix and more architecture than most repositories carry, and had the count fired the only available route was a spec plus one in-session forge worker. Phase 2d's routing branch should say so explicitly rather than leaving a run to discover it: the handoff is a repository affordance, not a design-depth affordance.

- **The rewrite penalty bit again, exactly as round 17 predicted, and the carve-out as written does not reach this case.** Round 17 proposed exempting "a correction whose target sentence is demonstrably false **against the tree**". Two of this run's four landings correct a *completeness claim the corpus makes about itself* - `single-loop-authority`'s "closed set" of three and `amortized-compaction-cadence`'s "Two schedules" - and neither is falsified against a tree. They are falsified by a design that exhibits a fourth member. Scored literally, both take `+2` for making a standing sentence false and land under threshold; both were accepted only by rewriting the landing so the enumeration is *scoped* rather than *extended*, which is the honest structure anyway. That is now twice. **Proposed carve-out wording, for a third sighting to confirm:** a landing that adds a member to an enumeration takes no `+2` when the existing members remain true within a stated scope - the penalty is for invalidating content, not for narrowing a claim that was over-broad.

- **The board's `check` contradicted the board's own `list`, and `check` was the one that was wrong.** A sibling's claim was registered as `software-engineering/llm-agent/mcp-tools`; this run checked the full nested path `knowledge/software-engineering/llm-agent/runtime-and-io/mcp-tools` and got `clear` over a subject the sibling demonstrably held, with five uncommitted technique files in it. Two independently derived observations beat the one instrument that had to normalize a path - the `assertion-inherits-its-own-bias` shape, arriving through a path-matching bug rather than a query bias. **Operating rule until the instrument is fixed: never establish absence of contention from `check` alone; read `list` and `git status` beside it.** Three good rows were deferred on the strength of that read, which is the outcome the board exists to produce.

- **The maps were not merely noisy here, they were unusable, and the directory listing carried the whole run.** `research-map` returned 157 matched subjects for one term on slug overlap alone, with the top four hits spread across three bundles. Every home that mattered came from enumerating `knowledge/software-engineering/llm-agent/*/` and opening golden paths. One worker found three homes by directory enumeration that no slug search surfaced. This is round 16's lesson holding for a third time; it is no longer a caution, it is the default order of operations for a source whose vocabulary is generic English nouns (state, runtime, interface, control).

- **Environment: a PowerShell here-string inside the Bash tool silently produced a commit whose subject line was `@`.** The tool's own instructions forbid `@'...'@`; the commit succeeded, the message was mangled, and nothing failed loudly. Caught only by reading the message back with `git log -1 --format=%B`. **Read back any commit message built from a multi-line string** - the failure is silent and the fix after a push is not free.

- **The best apply row came from a project that had already solved the technique's problem once, for a different guarantee.** tracklight degrades reproducibility in-band through a three-state `Determinism` enum read at 66 sites, and left schema enforcement announced on stderr - so the same team had the exact pattern and applied it to one of two sibling guarantees. Looking for *where a tree already does this correctly for something else* turned out to be a much faster route to a real seam than looking for where it does it wrong, and it makes the change unarguable in review because the precedent is the codebase's own.

## 2.5.0 - 2026-09-04 - yt:B-YQANvDOq0 (Claude Code function hooks)

- **When a source reviews a tool that is installed on this machine, the installed
  artifact is the primary, it is free, and it should be read before the fetch
  budget is touched.** The class table tells a review run that "the fetch is not
  corroboration, it is the extraction", which aimed this run at the vendor's
  documentation. That documentation described five hook types; the shipped
  binary's own schema defines six, and the two that decide by asking a model -
  the finding that refuted a sentence in a mature technique - were in neither the
  docs nor the video. One fetch 404'd, one returned a summarising model's reading
  of a page that was wrong about its own product, and a `grep -a` over the binary
  settled it in two calls. `dated-capability-matrix` already ranks a live
  artifact above vendor prose; this method's budget silently assumes the primary
  is a document. Proposed as a class-rule amendment, not applied this run.
- **The asymmetry hunt (Phase 6 step 4) produced both landings, and it is
  cheaper to run than the enumeration hunt.** The query is mechanical: find a
  place where a forged technique models one case in full - a section, a
  provenance rule, decision rules - and gives its sibling case one sentence.
  `rewrite-before-the-gate` models rewriting a call's arguments completely and
  disposes of short-circuiting in a clause ("a legitimate use of a wrapping
  point, not a failure"); that clause was the technique. `enforcement-demotion`
  models the *rule* side of its sort exhaustively and never asks what the
  destination is. Neither gap is visible to the slug map or to a summary, and
  both were found by reading two files.
- **The superseded-claim carve-out is real and this run is the first to apply it
  deliberately.** Round 18 diagnosed it; round 19's focus asked for it; the row
  that needed it scored `3/2/2` and rejects at -1 on the rewrite penalty alone,
  where the only sentence made false is a dated fact about a vendor surface. The
  distinction that makes it safe to apply: the +2 protects standing *reasoning*
  from being overwritten. A stale fact has no reasoning to protect - correcting
  it is what keeps the reasoning around it true. Recommend the next run that hits
  this promote it from a lesson to a rule in the gate, which would make three
  sightings.
- **The board's `check` contradicted its `list` again**, on `agent-runtime-assembly`
  - the same contradiction round 18 recorded. Second sighting. `list` was treated
  as authoritative and the row proceeded as an append under the `content` lock.
  One more sighting makes it a rule; it may be that `check` ignores a subject a
  sibling declared but has not yet written into.
- **A cwd left behind by an earlier `cd` produced a confident false absence.**
  A compound `cd .../techniques && cat ...` moved the persistent Bash cwd, and a
  later `find knowledge/... -type d` returned nothing for a directory that
  exists. It read exactly like "this subject is not in this checkout". Absolute
  paths, or `cd` to the repo root in the same call - and the general rule the
  corpus already holds applies to the shell too: never establish an absence from
  an instrument whose frame you have not checked.

## 2.5.0 - 2026-09-04 - authority-hacker-writing-models

### Redesign proposal: `not-better` is two verdicts wearing one word

Four apply rows, three `not-better`, and none of the three was a refutation. In
every case the fleet project **already implemented the technique**, sometimes
better than the technique stated it. The closed vocabulary
(`better` / `not-better` / `unmeasurable`) cannot express that, so the ledger
files prior conformance beside genuine failure, and the two demand opposite
follow-ups:

- a **refutation** says the rule is wrong under some condition, and owes the
  technique an amendment naming that condition (the method already says this, and
  says two of them demote a technique to a lead);
- **prior conformance** says an independent tree reached the same rule without
  seeing the corpus, which is *convergence* — the corroboration Phase 5 awards
  `+1` for, arriving through the apply lane instead of the source lane, and
  currently thrown away.

The demotion rule makes the conflation actively dangerous: "two `not-better` rows
on one technique from different projects demote it to a lead" would demote a
technique that two projects independently confirmed.

Proposed: split into `not-better` (the seam showed the rule failing) and
`already-holds` (the tree implements it; nothing to adopt), with `already-holds`
feeding the convergence count and never the demotion rule. Not applied here —
one round is one round, and the method's own bar is three.

### The `already-holds` row is worth more if you ask one more question

The three conforming rows were not equally productive, and the difference was a
single question: **what does this tree do that the technique does not?** Asked
once, on the pooled-leaderboard row, it produced the run's best content — the
tree could not adopt the technique's remedy (report components, not a
leaderboard) because its ranking *is* the product, and its actual answer, widen
the interval by a between-source variance term, went back into the technique as a
second branch with a discriminator. Not asked on the other two, which closed as
"already conforms" and taught the corpus nothing.

A conforming tree is not a dead end; it is a tree that has already solved the
problem and can be read for the solution. That is nearly the inverse of how the
apply phase is currently framed, which asks whether the *project* would be better
off.

### Assert the instrument, twice, and both times it was a substring

Two confident wrong answers in one run, both from an unanchored pattern, both
caught only because a known-positive assertion ran beside them:

- `elo` matched **"below"** across five fleet trees, returning a page of comment
  lines that looked like a real ranking seam;
- `TER` matched **"better"**, **"register"** and **"counter"** across the newly
  forged localization subject, which briefly read as a purity-gate failure on a
  metric name.

Both were `grep -E` without `-w`. The existing memory covers `grep -L` with `-q`
and multi-`-e`; this is the same family and the corrective is the same one, so it
is worth stating as the general rule rather than as a third special case:
**a proper-noun or acronym pattern needs `-w`, and any absence or presence claim
needs a known positive run beside it in the same call.** The second one mattered
more than it looked: a false purity hit on a forge worker's output is exactly the
kind of thing a director rejects a good subject over.

### Backticks in a shell-quoted `node -e` are substituted, again

Reproduced verbatim from an existing memory, in the *appending* direction this
time: a scorecard paragraph written through `node -e "...\`apply\`..."` inside a
double-quoted Bash string had **every** backtick span silently replaced by the
output of a failed command. The append reported success; the file lost eight
inline-code spans and the sentences around them became ungrammatical.

What makes this worth re-recording is the detection cost. The corruption is
invisible in the tool's own output (it printed `scorecard appended`), and the
only reason it was caught was reading the tail back with `cat -A`. **Any prose
containing Markdown code spans goes through a file** — Write it, then `node -e`
reading that file — and the append is verified by reading back, not by trusting
the exit code.

### The board's `check` contradicted its `list` again - second sighting

Round 18 recorded this; this run reproduced it exactly. `run-board.mjs list`
showed a quiet sibling holding `model-routing` among nine subjects; `check`
against that subject's golden path returned `clear: no live sibling holds 3
target(s)`, exit 0. Trusting `check` would have meant editing a contended spine
believing it uncontended.

Two sightings, so this is a lesson and not yet a rule, but the operational
advice is already unambiguous and cost nothing here: **when the two disagree,
trust `list`** - it is the conservative reading, and the price of being wrong in
that direction is a short wait rather than a lost write. A third sighting should
produce an instrument fix rather than another lesson, since `check`'s whole
purpose is to be the cheap call you make immediately before writing.

### The enumeration hunt produced the only new technique, from two different lists

Both promoted rows and the run's single technique came from Phase 6's third hunt
- a document declaring its own completeness. `comparison-modes` says "Its
pathologies are specific and standard:" and lists five; every one is a property
of a *comparison*, and the missing sixth is a property of the *set* of
comparisons - which pairs ran and how often each candidate appeared. That became
`pairing-schedule`. `turn-classification` says "The recurring axes:" and lists
three; all three describe how a call is *consumed*, and the missing fourth
describes what it *produces*.

Worth naming because it is cheap and repeatable: in a mature subject the
enumeration is where the gap is, and the tell is a colon followed by a list. The
hunt costs one read of a file the map already named.

## 2.5.0 - 2026-09-04 - pgmq-just-use-postgres

- **When a source states a claim the corpus refutes, read what the refutation is
  MADE OF.** This is the run's central lesson and it is not in Phase 6's hunt
  list. A refutation cannot deny a claim without naming the condition under which
  the claim *would* be true - and that named condition is frequently unbuilt,
  because it entered the document as a debunking aid rather than as a design.
  Here: the source said a visibility timeout "guarantees exactly once delivery";
  `guarantee-selection` refutes it and, to do so, names "which holds only when
  both live in the same transactional store" - then closes with "There is no
  fourth row." The condition was load-bearing, unowned, and its mirror image was
  already built at full strength in another bundle branch. **The catch was the
  cheap half; the refutation's construction was the run.** Phase 6 currently
  lists four hunts (missing stage, self-declared enumeration, asymmetry between
  mention and measurement, read the neighbours). This is a fifth and it fires on
  the single most common intake outcome - a source the corpus already beats.
- **A corpus can own one direction of a symmetric property and deny the other.**
  The generalisable form of the above. The registry modelled the producing side
  (an effect's intent made durable in the same commit as the data - and called it
  "the strong version") and denied the consuming side (the effect and the
  acknowledgment in the same commit) as an illusion. Both rest on one property.
  The cheap check, once a disclaimer names a property: grep the other bundle
  branches for whether that same property is built as a mechanism somewhere. It
  cost one search and it decided the run.
- **A guard whose false-positive rate is 100% for a common class has disabled
  itself, not merely misfired.** The board refused this run's claim as a SAME
  SOURCE collision with an unrelated video, because its URL fold drops the query
  string and a video's identity lives in `?v=`. Every YouTube pair collides;
  `youtu.be/<id>` and `watch?v=<id>` do *not* - it fails in both directions at
  once. The dangerous part is not the bug, it is the operator adaptation: a check
  that cries wolf on the skill's most common source class trains everyone to
  `--force` past it, and then it is gone for that class while still appearing
  green. Fixed with an 8-case assertion that pins the 2026-09-02 repository fold
  it must not regress.
- **A `try` around a whole function body converts bugs into plausible answers.**
  Asserting the above, the harness reported a confident wrong result: the
  extracted function referenced a lookup table the extraction had not carried, and
  the resulting `ReferenceError` fell straight through the function's own
  catch-all into its not-a-URL fallback, which returns a normal-looking token.
  Nothing failed loudly. The shipped `catch` is now around the parse alone. The
  general rule for this method's instruments: **catch the anticipated failure, not
  the function.**
- **A tree's own account of itself ages faster than the tree.** The apply target's
  feature scout documented a double-claim bug in its job queue in detail. It is
  fixed in `HEAD` - the lease is renewed and the completion write is conditioned
  on still holding it - and it was one step from being reported as a live finding
  on the strength of a dated document in the tree. Phase 2b already ranks the
  README last; the same suspicion is owed to any *dated* in-tree document, and the
  discipline is to read the code the document points at before citing it.
- **The untriaged tail has a third cause, and it is the good one.** Round 19 asked
  for `unverified` vs `verified but unwritten`. Both of this run's untriaged rows
  are neither: their promoting question was executed and the answer **resolved
  against the row** - the concern is real and the corpus already places it
  elsewhere, or the source supplies no forces. That is a finished piece of work,
  not a backlog item, and filing it under either existing cause misreports the
  run. The three-way split should be `unverified` / `verified-but-unwritten` /
  `resolved-against`.
- **Calibration held.** Expected yield for a thin second-hand review was stated
  before the table as "one content row at most, plus catches", and that is what
  landed. The class's "for a review the fetch IS the extraction" rule did **not**
  bind: 0 of 3 fetches, because the finding corroborated corpus-internally, by
  training-data convergence, and against code in two connected trees - all of
  which the corroboration table already ranks above commentary. Worth noting that
  the rule as written pushes toward a fetch the run did not need; the
  discriminator is not the class alone but whether the claim has a home yet.

### Redesign proposal - add the refutation hunt to Phase 6

Not applied in this run's edit, because one sighting is a lesson and not a rule.
Phase 6 would gain a fifth hunt: *"Where the corpus refutes the source, read the
refutation's own construction. Name the condition it concedes in order to deny
the claim, and ask whether anything owns that condition as a mechanism."* It is
cheap (one file already open), it fires on the modal intake outcome rather than a
rare one, and it aims verification at the one place a mature corpus reliably
leaves unbuilt: the escape clause in its own denial. Confirm on two more runs
before it goes in the file.

## 2.5.0 - 2026-09-04 - vibevoice (microsoft/VibeVoice @ 1541f59)

- **The refutation hunt has its third sighting and is now a rule, with an aiming
  tell the first two sightings did not have.** The prior entry proposed it as a
  fifth Phase 6 hunt pending two more confirmations; this is the second of those
  and it produced the run's best landing. What it adds: **a denial repeated
  across two subjects is where the yield is.** `streaming-output` states that a
  non-monotone producer should not be streamed live, and `voice-io` cites that
  same denial when routing partial transcripts to display-only. The second site
  is what proved the denial load-bearing rather than incidental — a rule two
  mature subjects both lean on has been *relied* upon, so the escape clause
  underneath it has never been examined by anyone. It is also mechanically
  searchable: grep for a golden path's own claim appearing in another subject's
  prose. That is a cheaper aim than "read every refutation", which is what the
  hunt currently says.

- **The `+2` rewrite penalty turns on whether an enumeration CLAIMS
  completeness, and this needs saying in the file because it decided half this
  run.** Two rows added an arm to a mature enumeration — a third remedy to
  "either render checkpoints or wait", a fourth row to a table introduced as
  "three specification kinds". Scored as rewrites both land at `+1` and are
  banked untriaged; scored as appends both clear at `+3`. The method's own
  mechanical test settles it and gives the example nearly verbatim — *"A new row
  beside three true rows is an append"* — but the test is stated as "do the
  file's existing sentences stay true?", and a reader can talk themselves into
  either answer, because a count word does become wrong. The discriminator that
  actually works: **does the enumeration assert its own closure?** "Either X or
  Y" and "there are three kinds" do not; the 2026-09-04 pgmq run's *"There is no
  fourth row"* does. An open list gains an arm for free. A closed one costs `+2`
  and should, because overturning a stated closure is a real claim about the
  author having been wrong rather than incomplete.

- **Scoring the seam at triage (round 21 item 1) works, and immediately exposes a
  dependency the focus did not name: the fleet map can be stale.**
  `build-fleet-map.mjs --check` reported stale, and the run read the map anyway
  and then re-derived its two load-bearing zeros from all eleven projects' own
  `.ai/registry-map.json` files. Both held. But a run that had trusted the map
  would have recorded a verified-sounding "no seam exists" from an artifact that
  had announced it was out of date. **The seam score is only as good as the map's
  freshness, and the map is a generated file any session can leave stale**, so
  the check belongs beside the read: if `--check` says stale, either regenerate
  or verify per project, and say in the note which was done.

- **Instrument: `cmd --check 2>&1 | tail || cmd` never runs the fallback.** A
  pipeline's exit status is the *last* command's, so `tail` returning 0 masks the
  checker's non-zero and the `||` branch is dead. Used here to "regenerate the
  fleet map if stale", it silently did nothing while printing the staleness
  warning — the failure looked like success and the warning looked like output.
  Same family as the `grep -L`/`grep -e` entries in operator memory: an
  instrument reporting success for a reason unrelated to what was asked. Capture
  the status before piping, or use `PIPESTATUS`.

### Redesign proposal - the ship column needs two zeros

Not applied, because one sighting. `Ship` has read `0` in seven of the last ten
rows and the scorecard cannot distinguish the two causes. This run's zero is a
*result*: two seams were found, both were tested with real arms, both returned
`not-better`, and committing anything would have been dishonest. Earlier rounds'
zeros were *blockers*: no seam reached, or a confirmation nobody gave. Those are
opposite diagnoses and the funnel reading at the bottom of the scorecard — "the
stage now losing most" — is computed from a column that merges them, which means
the weakest-stage call can be wrong in exactly the round where the pipeline is
working. Proposal: report `ship=0/tested` versus `ship=0/untested`, and treat
only the second as a loss. Confirm on two more runs before editing the file.
### Phase 7.7 addendum - what the branch gates could not see

- **Two green branches merged into a red trunk, and no gate in the method looks there.** Both execution workers independently hit the same pre-existing breakage on `master` (four test fixtures missing a field that had been added to their struct), both fixed it correctly, and both branches gated green. They inserted the field at *different positions in the same struct literals*, so the textual merge kept both and produced `field specified more than once` in three places. Neither branch was wrong; the merge was. **v2.3.1 says to merge a green branch right after review and stops there - it needs one more step: after the LAST merge of a round, re-run the cheapest gate on the trunk.** A per-branch gate is a claim about a branch, and the artifact the operator keeps is the trunk. Cost here was one `cargo check`.

- **The collision is structural, not bad luck, and it has a cheap preventive.** Any pre-existing breakage that blocks a worker's own gate will be fixed by *every* worker that needs to run tests, independently, in the same round. The fix is to hoist it: when a worker reports "I had to repair something that was already broken to run my gate", that repair belongs on the trunk once, before the merges - or the second worker should be told it is already fixed. Both workers reported the repair honestly in their own commits, so the information was there; nothing in the method consumed it.

- **My own repair was wrong before it was right, in the way this skill keeps warning about.** The first dedupe used a regex keyed on the preceding field name, which also matched two *legitimate* fields in sibling structs and deleted them - a fix that made the tree worse while looking plausible. Reverted, redone with brace-depth scoping so only a second occurrence *inside one literal* is dropped, and the script printed every removal with its line number. **An edit script over source code needs the same discipline as a measurement instrument: scope it structurally, and make it report what it did rather than how many.**

- **The workers overrode their briefs four times and were right four times** - the count is worth recording because the method asks for the override and this is the first round where every one of them held. The strongest refused the function the spec named, citing the module's own doc comment against it, and in doing so found that the alternative path had no matching restore at all. **A brief that names a specific function is a brief that can be wrong about it; keep naming them, and keep asking to be overruled.**

- **A second-hand detail I did not verify reached a published document.** I re-verified the load-bearing claim of a worker's report at source and then repeated a small adjacent detail from the same report - that a struct "already carries a slot" - without opening it. It has six fields and no such slot. The executing worker found it and the estimate changed with it. **The verification budget should be spent per *claim that will be written down*, not per *claim that sounds important*** - the load-bearing one gets checked because it is obviously load-bearing, which is exactly why the small one slips through.

## 2.5.0 - 2026-09-04 - agentic-testing

- **A comment thread is a source class the method does not name, and it
  out-produced the article.** The run's strongest landing originated in a reader
  comment: a practitioner describing their own shipped tool, which is a
  first-party account by the class table's own discriminating question ("did
  they build the thing they are describing?"). The article was a listicle; the
  comment under it was not. Two of the four comments were first-party, one drew
  a discriminator against the article's thesis, and neither is reachable by any
  rule currently in `source-classes.md` — the class is read once, for the source,
  and applied to the whole document. **A hybrid source's halves have opposite
  reliability** is already the rule; this is a third half nobody looks at, and it
  arrives free with the ingest.
- **Convergence can be found *within* one source when its voices are
  independent.** The article's thesis (a locator's name is a fragile key, so an
  innocent rename gives a false red) and the commenter's (a rename dodges the
  detector, so a deliberate one gives a false green) are one root with opposite
  signs, reached by two people who were not reading each other. That scored the
  convergence point and is what promoted the row from an amendment to a
  mechanism. The corroboration table's convergence clause says "two independent
  sources, from different runs"; this was two independent voices in one document,
  and it is worth the same.
- **The enumeration hunt has a mechanically greppable form and it should be run
  first, not third.** A section *heading* that counts ("Two advisory-nesses",
  "Three rules that separate...", "the three cases where...") is a completeness
  claim in a position a grep can find, unlike the same claim buried in prose.
  Round 22's amendment came from one such heading in under a minute. Round 21
  reached its equivalent by accident. Suggest a Phase 6 line: grep the home
  subject's headings for a cardinal number before reading the bodies.
- **A promoting question can promote a row and leave it vetoed, and that is a
  distinct outcome the note must not blur.** Row 10 promoted from `partial` to
  `real gap` — the corpus genuinely does not own it — and stayed untriaged
  because V2 was never the blocker the promotion addressed. The banked row is
  therefore much more valuable than an ordinary untriaged one: the prior-art work
  is done and only corroboration is owed. The untriaged table should say which
  of the two it is, because a later run picking it up needs to know whether to
  re-check the corpus or just spend a fetch.
- **Verifying a quoted number is not the same as verifying the sentence around
  it.** The primary carried the 20/40/80 spread and did not carry the causal
  reading the newsletter put on it. The fetch confirmed the fact and refuted the
  claim, which is the class's stated failure mode ("every number it quotes is a
  lossy pointer") operating one level up: the *number* was faithful and the
  *inference* was the relay's own. Landing the weaker rule the measurement alone
  authorizes is the corrected-premise move, and it was cheaper than dropping the
  row.

### Redesign proposal (not applied)

The scorecard has measured `research` as the weakest stage three rounds running
without the column being able to say so, because every run's cell reports what
it *got* and never what the source was *worth before it was mined*. The class
read at Phase 2 already produces an accurate forecast — three consecutive rounds
predicted their yield band correctly — so the information exists and is
discarded. A `priced=<forecast>/<actual>` cell would turn the class table from a
routing index into a **selection** instrument: a queue of sources could be
ranked by forecast before any of them is ingested, and the run that should not
have happened becomes visible as a row rather than as a feeling. This is a
change to Phase 2 and to the scorecard's schema, argued here rather than applied
because one round's evidence is not three.

## 2.5.0 - 2026-09-04 - youtube:CmmLZeuK4lg (infinite AI stream)

- **An honestly self-scoped enumeration is a signpost to the regime it excludes, and it is the cheapest hunt in the method.** `buffering-and-backpressure` opens with "The producer being faster is not an edge case - it is the operating condition" and later enumerates "exactly two honest responses" when a consumer falls behind. Every word is true and correctly scoped; that is precisely what makes it a map to the hole. The subject was not wrong and needed no correction - the *inverse regime* (a consumer that cannot be slowed, where the failure is underflow) simply had no owner. Fourth sighting of the denial/enumeration hunt; it is a rule this file already carries, and the refinement is: **the strongest signposts are the confident, correct scope statements, not the hedged ones.** A hedge means the author was unsure; a flat declaration of the operating condition means they knew exactly which world they were in and named it.
- **`research-map`'s near-empty behaved exactly as documented and the documentation earned its place.** "buffer underflow continuity" matched 11 of 413 subjects with a top score of 6 on a spurious slug overlap. The method says a near-empty is a hole *or* a seam and that only opening the candidate homes settles which. Opening both took four minutes and settled it as a hole - but it also produced the run's real finding, because reading `timeline-scheduling` closely showed *why* the gap exists (its whole model assumes the composition is authored, which is load-bearing for its gap-handling rule).
- **A fleet project holding a source's exact error is worth more than a fleet project lacking the technique, and the tell is an unread column.** The strongest apply row this run was not "the project needs this technique" but "the project computes the technique's own statistic, acts on it correctly one layer down, and throws it away in the gate that matters most." That asymmetry was nobody's decision - two layers written at different times to answer different questions - which makes it better evidence for the technique than the fix itself. **Proposed as a cheap triage signal:** a project that already emits the number a candidate's claim is about, with nothing reading it, is a seam; a project that lacks the number entirely is usually `unapplied by construction`. This is detectable by grepping the tree for the quantity before drafting, and it is a different question from the fleet map's context/absence classification, which only sees subject-level coverage.
- **Two apply rows on one technique pair split `better`/`not-better`, and the `not-better` one improved the corpus more.** The refused half returned two rules the technique lacked (priority as a deadline with an aging bound; a per-class floor on caller-supplied urgency, because a request-body priority field is an unauthenticated privilege knob). Both were written back in the same session while the seam was still open. This is the method's own claim about `not-better` confirmed again, with the addition that **the amendment must be written in the same session as the refusal** - the reasoning that produced it is the read of the project's code, and it is not recoverable from the ledger row later.
- **A mid-flight focus change arrived from a sibling and the right move was to finish on the loaded one.** Round 23's focus was appended to `SCORECARD.md` after this run's Phase 1 read and before its Phase 11. The run reported against round 22 (which it executed) and contributed evidence to round 23 without claiming to have run it. Worth stating because the alternative - retrofitting the run's narrative to the newer focus - would have made the scorecard's focus-tracking unfalsifiable, which is the one property that makes it useful.

## 2.5.0 - 2026-09-04 - sozu

- **A stack or language slug cannot price a run.** This run forecast a possible XL
  partly because `research-map "rust"` returned no prior art while `rust` appears as
  a stack on dozens of subjects. That is not a seam: the upper layers are
  language-neutral by construction, so the query measures the purity gate, not
  coverage. It is the same class of error the method already warns about for banned
  product vocabulary, arriving in a costume the warning does not name. Extend the
  Phase 4 warning to cover stack and language names, not just proper nouns.
- **The productive hunt on a strong source is the corpus's unqualified sentences,
  not the source's novelty.** All five landings came from a practitioner doing
  something the corpus carries a sentence against; none came from the source knowing
  something the corpus lacked. Two refuted a corpus assertion outright, one resolved
  a standing contradiction between a technique and a landed application. On a mature
  corpus this is the higher-yield direction and it should be a named hunt in Phase 6
  beside the missing stage, the enumeration and the asymmetry: **read the host file
  for "always", "by definition", "nothing can", and ask which one this source
  violates.**
- **Source quality does not move `ship`.** Round 23 said to prefer a source the
  fleet is behind. This run took the strongest source class the method recognises —
  a production system with 61k words of doctrine, two deterministic simulators and a
  published testing philosophy — and still filed five honest `not-better`/`unapplied`
  rows. `ship` is gated on the fleet having an unsolved problem, not on the source
  having a good idea, and no amount of front-of-funnel improvement reaches it.
- **A routing count of zero is a result worth reporting loudly.** A 175k-line system
  with 27 design documents fired neither routing clause, because every load-bearing
  decision it carries has a home whose golden path already states its forces. The
  depth column should be read as evidence about the *corpus's* maturity when this
  happens, not as a routing miss - and the note has to say which, because the two
  look identical in the cell.
- **Assert an instrument against a known positive before believing its absence -
  fourth consecutive run.** The non-test panic counter cut each file at its first
  `#[cfg(test)]`, which is correct for inline test modules and silently wrong for a
  crate whose tests live in whole `tests_*.rs` files with no inline marker: it
  reported 177 non-test panic sites in the top file. The corrected count was 4 for
  the entire crate. Both numbers were plausible and only one was checked.

### Redesign proposal (not applied now)

The six outcomes table ranks `Applied` above `Content` on the grounds that it "is
the only outcome that proves the corpus changes what a project does". Six
consecutive rounds of measured `not-better` suggest a seventh outcome is missing:
**`Confirmed`** - a landing whose rule the fleet already independently satisfies,
verified against a tree. That is not a failed apply and filing it as `not-better`
flattens two different facts: "we tested this and the technique did not help" and
"we tested this and the fleet had already arrived". The second is the strongest
possible corroboration a technique can get - independent convergence in real code -
and the ledger currently spells it the same way as a rejection. If a later round
agrees, the vocabulary gains `confirmed` beside `better`/`not-better`/`unmeasurable`
and the scorecard's `ship` zero stops reading as a funnel loss when it is not one.

## 2.5.0 - 2026-09-04 - pi (earendil-works/pi)

- **A peer-shaped source may already have been studied by the consumer, and
  nothing in Phase 1 asks.** The operator asked for a comparison against
  `personas`; at Phase 7.6 the scout found
  `.ai/directions/2026-09-04-harness-playbook-comparison.md` - a 43-point study
  against omp/omp², which is *a fork of pi itself*, with three more peer
  studies beside it. A fresh 43-point study would have re-derived most of it.
  The source ledger answers "did this registry mine it" and the board answers
  "is a sibling mining it now"; **nothing answers "has a consumer already
  compared itself to it"**, and for a peer-shaped source that is the question
  that decides whether the run's headline deliverable is new work or a
  duplicate. One grep over the fleet's `.ai/directions/` at Phase 1 is the
  whole fix. Round 24 item 1.

- **The apply step produced a landing the design read could not have.** The
  amendment to `terminal-state-recovery` did not come from pi at all. It came
  from hunting pi's technique for a seam in `pumper` and finding that the tree
  *cites this subject in its own source comment*, has adopted it faithfully for
  the `running` class, and therefore built precisely the gap the technique's
  reachability table invites by saying terminal states need no mover. A
  correctly-adopted technique produced a defect **because** it was correctly
  adopted - which is a class of finding only Phase 7.5 can reach, and only in a
  fleet that actually consumes the corpus. Third round running that the apply
  step changed or produced the landing; the depth cell still files these as
  Phase 7 output. Round 24 item 2.

- **The routing count can be met while neither v2.2 clause fires, and the
  method has no word for it.** Three load-bearing decisions with no corpus home
  (the in-flight position, the deleted deadline, the race catalog) - count met.
  But they home into three *different* existing subjects, so no system reaches
  three NONE and no three share a home-if-new. "Count met, no cluster" is a
  third outcome that reads to any later reader as a declined handoff, which is
  a different and worse thing. Say it explicitly in the depth cell until the
  method names it. Round 24 item 3.

- **A reject-biased gate on a single-reader run converges on one row, and that
  is working correctly.** `auto=1/6/0` over eleven candidates. Six untriaged
  rows are all real absences; every one carried the contested-home `+1` on
  RISK, and only the row that *refutes an enumeration the corpus asserts*
  reached GAIN 3. Worth stating plainly so a future round does not read a
  1-of-11 accept rate as a weak source: it is the designed asymmetry, and the
  six are banked with anchors precisely so a second sighting promotes them at
  no fetch cost.

- **A sibling's commit can absorb your ledger appends, and the evidence looks
  like loss.** This run's commit reported 6 files where 9 were expected; the
  three shared ledgers (`applied.md`, `sources/index.md`, `SCORECARD.md`) were
  already in `HEAD`, carrying this run's lines, committed by the concurrent
  `sozu` run. Nothing was lost and nothing needed repair. The check that
  settles it in one command is `git grep -c <your marker> HEAD -- <ledger>`,
  not the commit's own stat - and a run that reacts to the short stat by
  re-appending would have duplicated every row. The pathspec discipline is what
  made this benign in both directions.

- **`verified_against` must be `<stack>@<version>`, and the gate says so late.**
  Cost one cycle here (`node >=22.19.0` rejected, `node@22.19.0` accepted) and
  the same error was sitting in a sibling's two uncommitted applications when
  the index lock was taken - so the gate went red on files this run did not
  own, and the method's rule applied: unlock first, then report, do not fix a
  neighbour's file inside the lock.

## 2.5.0 - 2026-09-04 - weave-router

- **The routing count is time-dependent, and no run has said so.** Phase 2d's
  count asks whether a system's decisions have a home. This tree's largest system
  reached three unhomed decisions, which under v2.2 is a forge — except the home
  had been forged **48 hours earlier**, from a different gateway, by a sibling
  run. The same tree read a week ago is a forge job; read today it is a technique
  pair inside an existing subject. Nothing in the method tells a run to look at
  *when* the home was created, and it changes the decision. It also changes the
  value: a home forged in the last week is single-sourced, so a second
  independent system landing into it is corroboration the subject cannot get any
  other way, and it outranks a technique placed somewhere less contested. One
  line in the source note — the home's age and how many sources it has — would
  make this reproducible instead of lucky.

- **The XL trigger counts homes; it should also ask whether two candidates are
  arms of one rule.** Two design entries here (no fallback may answer for the
  selector; nothing may override the selector afterwards) mapped to the same home
  and looked like two techniques. They are two directions of one force — *the
  decision you measure must be the only thing that determined the outcome you
  record* — and landing them separately would have produced two files that each
  argue half a rule and cite each other. The method's anti-padding language is all
  about *count* ("nine catches and one lead is a result"); it has nothing about
  two findings that should merge. Ask, before drafting N techniques from N design
  entries, whether any two share a force rather than a home. Merging is the same
  discipline as not padding, applied one level up.

- **"Compiles under the project's own gate" is evidence, and the proof vocabulary
  loses it.** The cross-repo change here compiled clean under the exact invocation
  the project's CI uses, and then the test binary failed to *launch* on this
  machine for a pre-existing, binary-wide reason (an untouched neighbouring test
  fails identically; a sibling workspace crate passes). Three different facts —
  "the test failed", "the test did not run", "the code does not compile" — all
  collapse into `structural-only` or `unproven` if a run is not careful, and only
  one of them is true here. Report which gate was reached and why the next one was
  not; the distinction is what tells the operator whether to re-run it or fix
  their toolchain. Not proposing a vocabulary change on one sighting — proposing
  that runs state it in the row, which this one does.

- **A `not-better` against a *diagnostic* technique returns the missing number.**
  The amendment landed here prescribes a check (compare cached reads against cache
  creations) and, as written from the source alone, had no threshold — so it was
  advice, not an instrument. Applying it to a fleet project returned `not-better`
  (the project passes, nothing to ship) and with it the healthy pole: 16.8:1
  against the pathological ~0.02:1. Two orders of magnitude apart, so the check
  needs no calibration, only the sign of `ratio - 1`. The method already says
  `not-better` is the most valuable row in the ledger and explains that as a
  boundary condition on the technique; this is a second, different way it pays —
  where the technique is a *measurement*, a negative result supplies the reference
  value, and the landing should be edited to carry it. Second sighting of the
  general shape (the 2026-09-04 vibevoice run's 3,700x fingerprint result did the
  same); one short of a rule.

- **Instrument, minor:** a `cd` inside a compound Bash command persists for later
  calls in this harness, so a subsequent relative `cd` from the assumed repo root
  fails. Cost one cycle. Absolute paths, or `cd` in every command.

- **The peer study corrected the run that dispatched it, and that is the argument
  for dispatching it.** Four of thirteen seeds came back wrong, and one of them
  landed on this run's own shipped change: the seeded reading of a fleet project's
  failover ladder was inverted. The loop breaks on *spawn success*, so the ladder
  advances only on a process-launch failure that a different model cannot fix —
  which means the `0 of 6,163` this run had already measured, written up, shipped
  against and reported was **consistent with the mechanism never firing**, not with
  substitutions going unrecorded. The apply verdict went from `better` to
  `unmeasurable`, the application and both ledgers were corrected, and the run is
  better for it.

  Two things generalize. First: **a number measured on real data is not a finding
  until the mechanism that produces it has been read.** `was_failover = 0` was a
  true count with two incompatible explanations, and this run picked the more
  interesting one without checking which. `count-carries-predicate` is already law
  here; the predicate this count needed was not "how it was counted" but "what
  could have made it non-zero". Worth stating as its own habit at Phase 8 step 3:
  before writing the measurable, name the mechanism that would move it and read
  that mechanism's trigger condition.

  Second: the correction produced a **better** finding than the error concealed —
  a constant-`false` audit flag cannot distinguish "the mechanism never fires" from
  "it fires unrecorded", and those call for opposite responses. That is the landed
  technique at a sharper angle, and it only exists because a second reader was
  pointed at the same tree with a written brief. The method already dispatches the
  peer study for the *fleet's* benefit; this run is the first evidence in the
  scorecard that it also functions as review of the director's own apply row.
  Second sighting would make it a rule: **dispatch the peer study before the apply
  row is final, not after.**

## 2.5.0 - 2026-09-04 - pi (operator triage of the untriaged tail)

- **The routing count is computed before anyone has decided which rows are
  real, so it can be wrong in both directions.** Run `pi-01` scored routing
  count 3 with the decisions scattering into three different subjects, so
  neither v2.2 clause fired and no forge handoff was raised. The operator then
  accepted four of the six banked rows, and two of the three homeless decisions
  landed in *the same subject* (`job-coordination`), alongside an amendment to a
  third technique there. The cluster the count looked for and did not find at
  Phase 4 was assembled at triage instead. It did not change the outcome here -
  three techniques in an existing seven-technique subject is not a forge job -
  but a run whose picks concentrate harder could be a forge job that the count
  had already ruled out. **Count the homes of the rows that survive the gate,
  not the rows that enter it**, or say explicitly that the Phase 4 count is
  provisional.

- **Every row the operator rescued was blocked by RISK, never by evidence.**
  Four accepts, and all four had cleared corroboration, placement and the strip
  test - each was held under the +2 bar by the contested-home or
  single-sighting `+1`. That is a specific, actionable shape: the gate is not
  filtering weak claims on a single-reader repository run, it is filtering
  *lonely* ones. A third round showing the same pattern would be a real argument
  for a repository-class accept threshold of `+1`, since a repository read in
  depth by one director is the case where "only one source saw it" is least
  informative. One round is not that argument; two now exist.

- **Two `not-better` rows were worth more than the `better` one, and for the
  same reason each time - the negative named a precondition.** The deadline rule
  is satisfied across the fleet not because the projects are careful but because
  *no fleet project has a separable advance call*, so the anti-pattern cannot be
  expressed; that turns an empty result into a return condition with a trigger.
  And personas' boot recovery inverts the total-state amendment deliberately and
  safely - absence of a clean-shutdown marker *is* the crash signal - which
  yielded the boundary the amendment does not state: absence-as-signal is sound
  when a positive write manufactures the presence on the healthy path and the
  ambiguous reading is the cautious one. **An apply row that says "already
  satisfied" is only cheap if it also says what would make it unsatisfied.**

## 2.5.0 - 2026-09-04 - wan2gp

- **The absolutes hunt produced every landing in this run, and it is cheap enough to
  be a step rather than a habit.** Round 24 proposed reading the host file for its
  unqualified sentences — "always", "never", "nothing can", "this is the whole cure"
  — before drafting anything. Run deliberately over three host files, it returned
  three landings from three reads. The reason it works is structural rather than
  lucky: **an absolute is a claim with a suppressed quantifier**, so a tree that
  violates it either refutes the claim or reveals the scope the claim forgot to
  state, and both of those are landings. It also aims the verification budget at the
  one paragraph most likely to be wrong, which is the opposite of where novelty-hunting
  aims it. Second confirming round; a third makes it a Phase 6 step rather than a
  lesson.

- **A `not-better` on a *second* measurable is what stops a landing from
  overclaiming, and it only exists if the experiment prints both arms.** This run's
  experiment carried two numbers: origin retention (A=5/14, B=14/14 — a clean win)
  and distinct masters over the sequence (A=14, B=14 — **unchanged**). The fix was
  right and shipped on the first number. But the amendment, as drafted, had implied
  the second number would move, and nothing except the printed arm would have caught
  that — a verdict-only harness returns `better` and the corpus quietly carries an
  overclaim. **A single-measurable experiment can confirm a fix and still ratify a
  wrong reason for it.** Where a landing's prose names a property, that property
  wants its own arm even when it is not the one being fixed.

- **`unapplied` needs its predicate carried, and the reason can be a fact about the
  subject rather than about the run.** Two of three landings had no seam in any fleet
  project, established by searching six trees per-project rather than by assuming.
  The finding underneath is more useful than the rows: `mcp-tools` has 15 techniques,
  12 applications, and **every application is an external stack**, because the fleet
  consumes MCP and the subject is written for publishers. A subject whose apply rows
  can only ever be source-tree applications is not a funnel loss — it is a subject
  whose audience we are not. Recording that once in the subject's note would save the
  next two runs a six-tree search each.

  ### Redesign proposal (not applied now)

  Phase 7.5 could ask, once per subject rather than once per run: **is this subject's
  audience the fleet at all?** A subject whose last three apply rows all read
  `unapplied — no seam` is answering that question already, and the answer belongs in
  `librarian/subjects/<domain>/<subject>.md` as a standing note that later runs read
  before searching. The risk is obvious and is why this is a proposal rather than an
  edit: a standing "no seam here" note is exactly the kind of cached negative that
  stops being true the moment a project grows the capability, so it would need a
  return condition like any lead, and a run that accepts it without checking the
  condition has cached a stale absence. Worth doing only with that condition attached.

- **"Count met, cluster collapses" is the third routing outcome, and it is not the
  one round 24 was describing.** Round 24 named "count met, no cluster" for decisions
  that scatter across different homes. This run hit a different case: the decisions
  did cluster — one system, three unhomed entries, one shared home-if-new — and the
  *cluster itself* dissolved when this round's own second focus item was applied
  ("which two share a force?"). All three were arms of one rule. So the count can be
  met, the cluster can form, and the forge still correctly does not fire, because
  three entries are not three ideas. Both outcomes read as "count N, no handoff" in
  the depth cell and a reader will assume a decline for either. The shared-force test
  belongs *before* the routing count, not after it, or the count is counting entries
  when it means to count ideas.

- **A repository's verification can live in its documents rather than its tests, and
  the sweep order should expect that.** Phase 2b ranks tests fifth and measurement
  third. This tree has **one** test file over ~89,500 lines of Python, and 76,498
  words of operating documents that carry the failure modes, the settings contract,
  the flag vocabulary and the agent's own operating rules. Reading its single test as
  a signal about quality would have been wrong in both directions. The sweep order
  held anyway — documents first, README last — but the ordering's *rationale* should
  say that a thin test directory is not evidence of a thin tree, only evidence about
  where that tree keeps its contracts.

- **Two absences I asserted in a draft application were both wrong, and both were
  wrong in the same direction: the tree had the material and stopped one step short.**
  I wrote "the routing tools carry no per-action behaviour annotations at all" and
  "the skill file separates them by instruction rather than by mechanism". In fact
  every action declares an `access` tier used for gating, and the write-path routing
  is stated in the schema description as well as the skill. The corrected paragraphs
  are sharper than the originals — "classified correctly and never published" is a
  better finding than "never classified". **When about to write that a tree lacks
  something, grep for the thing it would have been called instead**, because a mature
  tree usually has the concept under a local name, and the interesting failure is
  almost never absence — it is the boundary the concept does not cross.

## 2.5.0 - 2026-09-04 - monty

- **The score's rewrite penalty nearly rejected the run's best finding, and the
  reason is a missing third category.** Phase 5 scores `+2 RISK` for a landing
  that "rewrites rather than appends", tested mechanically: *does a standing
  sentence become false?* This run's strongest row **scoped** three unqualified
  sentences in a one-day-old golden path — the measurements stayed true, the
  design stayed right for the system it came from, and only the *unqualified
  reading* changed. Scored as a rewrite it lands at GAIN 3 − RISK 2 = +1 and is
  banked; scored as an append it lands at +3 and ships. The mechanical test has
  no word for **adding a scope condition to a true-but-unqualified claim**, which
  is precisely the landing a second independent source is uniquely able to
  produce — so the penalty is heaviest exactly where cross-source corroboration
  is most valuable. I scored it as an append and said so in the note with the
  reasoning, which is what Step 4's audit trail is for. *Not yet a rule: one
  sighting. If two more runs hit it, the fix is a third category — `scopes` at
  RISK +0 when every existing sentence stays true of the population it was
  derived from, distinct from `rewrites` at +2 when one becomes false.*

- **A grep count over a file holding two constructs of the same shape counts the
  file, not the construct.** I reported 144 opcode variants from
  `grep -c "^    [A-Z]..."` and wrote the number into an application before
  checking it; the file holds a second `#[repr(u8)]` enum and the real count is
  122. The corrected number was *stronger* — 122 variants with discriminants
  0–121 contiguous is positive evidence of no reserved band, which 144 could not
  have shown. The rule the last round already wrote (a number is not a finding
  until its mechanism is read) has a corollary: **parse the construct's own
  bounds before counting inside it.** One `node -e` walking brace depth cost
  thirty seconds and changed the finding.

- **An instrument reporting 100% positive on a population is reporting about
  itself.** My first drift check said all four generated/source pairs had
  DRIFTED at line 1 — implausible for four independently generated files, and it
  was a CRLF assumption in my frontmatter regex. Normalised, all four are
  identical. This is `excess-indicts-the-instrument` from the corpus applied to
  the run's own tooling, and the tell is the same: a uniform verdict across a
  heterogeneous population is a fact about the check.

- **The focus mechanism worked as designed and is worth recording as a
  positive.** Round 24 asked for the home's age before the routing count; reading
  it converted a forge-shaped repository (two systems, thirteen design entries)
  into a corroboration run, because both homes were forged the day before and
  were single-sourced. Three rounds have now written focus items that changed a
  run's *shape* rather than its wording. The scorecard should keep saying whether
  the focus fired, because a focus that never changes a decision is a lesson
  that should have been a rule.

## 2.5.0 - 2026-09-04 - wikiskill (arxiv:2608.27454)

- **The class rule that predicts yield can also refuse a landing, and refusing is
  the more valuable use.** "A paper is authoritative for its measurement, weak
  for its framework" has until now been read as a *routing* hint - look at the
  tables, skim the architecture. This run used it as a **veto**: row 4 was a real
  corpus gap, the promoting question confirmed no technique owned it, and it was
  still sent to leads, because the source's support for it was an unmeasured
  design choice. The generalisation is worth carrying: **every source class's
  "reliable for" column is also a "may not authorize" column**, and the second
  reading is the one that keeps a corpus from filling with well-argued
  architecture. Nothing to edit yet; if two more runs decline a believed row on a
  class rule, the corroboration table should say so explicitly.

- **Assert an instrument against a known NEGATIVE, not only a known positive -
  and pick the negative from the same week.** The Phase 7.5 scorer passed its
  positives on the first try and was still worthless: bag-of-words overlap scored
  a known-absent focus item at **1.00**, because the file it searched is long
  enough to contain almost any content word. A positives-only assertion would
  have certified it. The negative that caught it was a rule written days earlier
  and demonstrably not yet landed - close enough to the target to share
  vocabulary, which is exactly what made it discriminating. A negative drawn from
  nonsense would have passed too.

- **An A/B whose two arms agree has three things to check, and "the change did
  nothing" is the least likely.** The personas schema gate returned 0 on both
  arms; the cause was a placeholder substituted as a predicate when it was a
  member list, so neither arm's DDL parsed. This is already a lesson in the
  operator's memory and it is **not in `SKILL.md`** - which is itself this run's
  apply finding, measured at 83 imperatives against 9 carried. Phase 8 step 3
  should require the mid-state, not merely permit it.

- **Two design candidates that share a FORCE are one technique, and the test is
  cheap enough to run every time.** Round 24's focus asked for this and it fired
  here: "the knowledge layer is never rolled back" and "the harness writes the
  rejection record" looked like two techniques and are two arms of one rule - the
  gate's verdict and its evidence outlive the artifact they rejected. Asking the
  question cost one sentence and removed a padded landing. Second consecutive
  round where it changed the count; a third makes it a rule for `SKILL.md`.

- **`routing=n/a` needs to be said out loud on a non-repository source.** A paper
  has no tree, so there is no design record, no forge count and no Phase 7.6 -
  but the depth cell renders that identically to "count met, handoff declined",
  which is a completely different decision. Round 24 asked for a word for the
  third outcome ("count met, cluster collapses"); this is a *fourth* ("no count
  to take"). The column needs the distinction, not more prose.

### Redesign proposal - the design record needs the measurement/framework test

Not applying this now, because one run is thin evidence for a phase change.

Phase 2d reconstructs load-bearing decisions from a tree's ADRs, module guides
and rejected approaches, and it treats what it recovers as material a technique
can be written from. But **a decision recovered from a design document has
exactly the epistemic status of a framework paper's architecture section**: it is
the authors' account of why they did it, unmeasured, and often written to
persuade a reviewer. This run's class rule refused a landing on that basis for a
paper; the design lane has no equivalent, and eleven rounds of design reads have
never once sent a design entry to leads for want of measurement.

The proposed addition to the design record's shape is one line beside `forces:`:

```
disconfirms:  what this tree would have to show for the decision to be wrong,
              and whether it shows it - or NOT-CHECKABLE, with the reason
```

An entry that cannot fill it is a lead with anchors, not a technique candidate.
The prediction this makes, which is what would falsify the proposal: the
`disconfirms:` line will most often be answerable from the tests or the
measurement directory the sweep already reads, so it should cost little and
should reclassify a minority of entries. If it turns out to reclassify most of
them, the design lane has been landing accounts rather than mechanisms and that
is a larger finding than this proposal.

## 2.5.0 - 2026-09-04 - cargo-make (second lens: language craft)

- **A mined repository is not a spent one, and the ledger's "already mined" check
  cannot see that.** Phase 1 step 3 says to stop if the source is in the ledger.
  This run was invoked over a tree mined eight hours earlier, at the same commit,
  and the two runs share **zero candidates**. The reason is structural rather
  than lucky: a design read (Phase 2d) reconstructs *forces*, and a craft read
  asks *what a type is being asked to carry*, and those two questions do not
  compete for the same material. The architecture run recorded `types.rs` as "the
  real data model" and never opened `error.rs`, which held the best engineering in
  the tree - not an oversight, just a different question. The ledger check is a
  guard against paying twice for one transcript; over a repository it also blocks
  a second pass that costs one clone and returns a full run's yield.
- **The tell that a second lens is available is already in the prior note.**
  Phase 2b names two sweeps - one for claims, one for reusable engineering - and
  the prior note's own triage table had ten rows and none in the second lane. A
  repository note whose candidates are all `design` shape, or all claims, has
  read one of the two and says so in a form the next run can check in about
  fifteen seconds. That is a cheaper signal than re-deriving the tree.
- **The craft lens has its own predicted yield, and it is not the design lens's.**
  Stated before the triage table and it held: high on error representation and
  boundary types, low on abstraction machinery, and concentrated in what the
  language made easy versus expensive. Three counts framed the whole run - zero
  trait definitions in 13,145 lines, five generic functions, 347 clones against
  two `unsafe` blocks - and none of them is a finding on its own. They are the
  calibration that told the run where the type-level contract work actually was.
- **An apply row can amend the technique that produced it, in the same run.** The
  `not-better` verdict against a fleet worker boundary showed
  `state-carrier-decides-the-lane` over-triggering, and the precondition it
  gained (an existing shared carrier copied to cross, *not* a payload built for
  the crossing) was invisible from the originating seam, because there the
  carrier pre-existed the lane. This is the strongest argument yet for Phase
  7.5's "budget the apply step against the landing": the apply step is not
  validation of the technique, it is the second observation that makes the
  technique's trigger correct. A run that lands and defers applying ships a rule
  fitted to one seam.
- **A matched pair is a legitimate A/B when the claim is about discriminating
  power.** `shape-with-a-not-applicable-member` claims the type declaration tells
  you nothing and the producer audit tells you everything. The proof was two
  unions of identical surface shape - one in the source, one in a fleet project -
  with opposite verdicts and nothing separating them but the audit. That is two
  arms and one instrument, and it is stronger than a before/after against either
  one alone. Worth naming as a shape for rules whose whole content is "the
  obvious signal is not the signal".

### Redesign proposal (not applied)

`/intake <url> --lens <design|craft>` and a `lens:` field in the source-note
frontmatter, so Phase 1's ledger check can answer "already mined" *per lens*
rather than per source. As it stands the check is correct for a video and wrong
for a repository, and the only thing that stopped this run from stopping at
Phase 1 was the operator naming the lens in the invocation. Two lenses are
confirmed distinct by exactly one run, so this stays a proposal - but the cheap
half is free now: **a repository-class source note should record which of Phase
2b's two sweeps it ran**, which costs one frontmatter line and makes the
question answerable without re-reading the triage table.
