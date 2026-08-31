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
