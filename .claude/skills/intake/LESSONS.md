# Lessons - intake (formerly research)

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
