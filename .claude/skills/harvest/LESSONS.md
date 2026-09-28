# Lessons - harvest

Append-only reflection lane. One entry per pass that taught something, newest last.
Format: `## <version used> - <YYYY-MM-DD> - <scope>` followed by `- ` bullets.

This file exists because a change needed one and there was none: the skill whose own
stop rule is a memory across passes carried no record of what any pass taught. Phase 6's
report now has a lane to land in.

## 0.4.1 - 2026-09-23 - ai-registry (bumped to 0.5.1 across the same change)

- **This skill's three halt rules were written for a reader and could not be computed.**
  Two consecutive passes landing nothing but leads and catches; the same failure
  signature surviving three passes; an evaluation debt of three or more. Every one of
  them is a comparison across passes, and until now no pass left behind a field to
  compare. In `auto` and `loop` mode, where nobody is present, the stop rule was
  effectively unenforceable - which is the mode it exists for.
- **`failure_signature` is an identity, and the schema enforces it as one.** The rule
  this skill already states - "attempt count is not the signal; failure identity is" -
  only works if the same failure produces the same string next pass. The helper refuses
  a signature with no letters in it, so a pass cannot satisfy the field with a counter
  and quietly reset its own halt rule.
- **The gaps in the file are load-bearing.** A parked row is not a decline and has no
  count of its own; an unsettled evaluation is not `unmeasurable` and stays out of
  `verdicts[]`, so the debt guard reads the *gap* between content landings and settled
  verdicts rather than a field that could be filled optimistically. Every place this
  skill refuses to conflate two outcomes, the schema refuses too.
- **`mined` and `parked` are queue states, not outcomes**, which the closed vocabulary
  settled rather than debated. A parked row never reaches a subject row at all - parking
  is a judgment about timing and the result file has nothing to say about it - and a
  mined row's outcome is whatever it landed. The queue keeps its own words.

## 0.5.2 - 2026-09-24 - ai-registry (first `research` refill, run hr-0924)

- **Most founding "no elite source" lines were search-budget artifacts, not literature
  facts.** One targeted agent per line struck 14 of 20 in a single pass, and the founding
  notes admitted it ("search budget capped before confirming candidates"). One line closed
  because the world moved: the benchmark-sharing spec got its first government adopter two
  days before the pass. A gap line ages like a lead and needs a refresh date, not just a
  strike.
- **Two refills claimed the same work two seconds apart, and the board could not see it.**
  This run claimed subject `harvest/coverage-gaps`; the sibling claimed
  `librarian/harvest/queue.md`, with a different `--source` string. Neither form ever
  contends with the other, so `claim` reported zero siblings, and both runs wrote the same
  two files. A refill should claim the literal paths it writes, as `paths`, because those
  strings are the same for every run. Found by listing the board before committing; the
  sibling was told by message.
- **Research agents put types in the class column** (`style-guide`, `reference-repo`,
  `handbook`), and source-classes.md has no class for a regulator, a standards body or a
  statute. The queue's own precedent files those as `vendor repository`. The orchestrator
  normalized each row by hand; a brief that quotes the queue's precedent would stop it at
  the source.
- **The orchestrator broke the cap of 5 once**, topping up before a completion arrived.
  Background agents give no count back unprompted. Keep a running tally in the scratch file.

## 0.5.2 - 2026-09-24 - ai-registry (first `auto` pass on software-engineering core, run hv-auto-0924)

- **The queue's host is not the source's host any more.** Every `aws.amazon.com/builders-library/*`
  row now redirects to builder.aws.com, which serves a JavaScript shell. One miner came back
  with 0 words, and `research-ingest` called the 18-byte shell "too thin" (exit 3), a
  verdict about the source when the fetch had failed. A sibling miner found the readable
  copy (the Builders' Library PDF on d1.awsstatic.com), and a single re-dispatch on that
  route read the article on its first call. When one lane of a batch fails at fetch, read
  the sibling lanes' fetch routes before parking the row: the fix is often already in the
  batch.
- **Auto mode's `accepted: 0` hid the largest finding of the pass.** Three rows from two
  publishers converged on a subject the corpus names as missing in its own words. In auto
  that banks as a spec, correctly. So the report must lead with the spec bank, and
  `landed: 0` must not be read as stagnation when the batch found content. The two-pass
  stagnation rule reads `landed`, and in auto it cannot tell "nothing here" from "all of
  it is waiting for a person".
- **Expected currency never arrived.** Upper-layer techniques carry no citations and these
  subjects' applications cite no external canon, so a 2019-2022 canon source had no clock
  to move. Against mature software-engineering subjects, predict 0 currency from practitioner
  canon; currency comes from vendor releases.

## 0.5.2 - 2026-09-24 - ai-registry (`auto` pass on the llm-agent sandbox cluster, run hv-sea-0924)

- **Quote the sentence under test in the miner brief, not the topic.** The admission read
  found the subject's own words ("Runs may share a read-mostly package cache") and every
  brief carried them verbatim. Four lanes then tested one sentence from four sides, and the
  batch returned a contradiction with its corrected wording. A topic-level brief ("sandbox
  escape") would have returned five competing new-technique proposals instead of the
  corpus's one wrong line.
- **Send the repository lane last, against the other lanes' drafts.** SEA-023 was a top-up,
  so its brief could list the five specs the paper lanes had drafted and ask for corroborate
  / contradict / silent with file:line anchors. The clone refined the headline: fill-on-demand
  is safe when the host is the one writer and the run chooses no key. The measured failure
  alone would have banked a rule too strict to be true. When a batch holds one code row,
  hold it back until drafts exist.
- **The queue's class column was wrong on 5 of 7 rows**, with papers the most common miss:
  measurement studies filed as "research-model release", an incident investigation filed as a
  second-hand review. The miners corrected it at ingest, as the method says, but refill
  agents should be told that a paper without weights is not a model release.
- **The dispatch's recount agreed only because both counted a sibling's uncommitted
  edits.** The working tree read 262 queued rows and HEAD read 268: six SEC flips were a
  live sibling's work in progress. The target section was untouched either way, so there
  was no contradiction. But a recount should say which tree it read, or a sibling's work in
  progress reads as queue drift.

## 0.5.2 - 2026-09-25 - ai-registry (backlog loop x3, waves 8-10, runs hb-w8/w9/w10-0925, secondary machine)

- **The unit's home was wrong on about half the units in all three waves**, and twice it named a
  path that does not exist. The worker-brief lesson ("the home is a hint") held; what helped more
  was saying it again in a per-wave director note, alongside the lessons the previous wave had
  just earned. Director notes that carry forward from wave to wave are cheap, and every wave
  lesson that reached the next brief was followed there.
- **The literal repair lost to the residual in most code-mode units.** Arming the unit's own
  prescription as B1 (brief lesson 9) was the single most informative arm: it tied the as-is arm
  (a comment that changes no behaviour; "tell the model its session was lost") or it
  over-corrected (mark every step "may" and certify nothing; escape everything). A wave without
  B1 would have landed rules that the fleet had already shown to be too weak or too strong.
- **`checked: unverifiable` was wrong every time it was re-verified in these waves**: the source
  cloned, and the quote was still there. Read it as "the enumerator did not try".
- **One worker ran `taskkill /IM python.exe` and killed every Python process on the machine.** The
  director warned the live siblings, and each re-checked its logs. From wave 9 on, the director
  note says: stop only the PIDs you started.
- **A code verdict on a project whose checkout lives on another machine cannot ship from here.**
  The worker cloned the public remote and proved the change there. The commit sits on a local
  clone branch, and the applied row says UNSHIPPED rather than implying a fleet ship.
- **The director must count returns against the wave, not against the ledger.** The director
  began closing wave 10 with one unit still out, because the ledger rows looked complete. The
  wave file is the roster; the ledger only records what has already returned.
- **Paid headless arms need a declared cap in the declaration.** The blind-ab units spent
  $5-8 each against caps of $15-20, and each return reported its spend.

## 0.5.2 - 2026-09-28 - ai-registry (`auto` pass on the migrations cluster, run hv-mig-0928)

- **Stagger the code lanes, each one against every draft returned so far.** Three of six
  rows were repositories. The prose lanes went first; each repository lane was topped up on
  a completion and briefed with the drafts then in hand, asking corroborate / contradict /
  refine / silent with file:line anchors. The repositories turned the drafts into verdicts:
  two of five voices retry a lock timeout without any bound (a rule the prose lanes would
  have banked as unanimous), no source asserts the post-build index check a sibling
  proposed, and pgroll's `complete` observes nothing the Fowler draft said it observes.
  Each of the three was worth more last than it would have been first.
- **A 0-point subject can be missing a whole half.** `migrations` scores 0 because no
  consumer deviates from it, and it was admitted on its coverage-gaps line alone. Its
  server case turned out to be one technique long, with no text on lock waits, and five
  publishers converged there. Attention points measure disagreement with what a subject
  says, never what it does not say. A gap line confirmed at body level ("lock" occurs only
  as "file locked") is a sufficient needle.
- **The recount read HEAD, and HEAD was origin/main.** Following the 2026-09-24 lesson, the
  dispatch count was checked against a tree with no queue edits in the working tree, so
  257/296 and 51/57 were HEAD facts, not a sibling's work in progress.
- **Three consecutive software-engineering auto passes have now landed 0 and banked 27
  specs (sections 4, 5, 6).** The queue is not the bottleneck; the spec bank is. Another
  auto pass in this domain adds to a stack only an attended hour can drain, so the next
  software-engineering dispatch should be an attended `run` over specs.md sections 4-6, or
  auto should move to a domain whose rows yield catches and currency.
- **Miners still reach for `grep -i -e ... -e ...`.** Two lanes hit the known exit-134 crash
  and one had to delete a stackdump it left in a knowledge folder. The brief line "do not
  combine `-i` with several `-e`; delete any stackdump you create" worked in the lane that
  carried it. Put it in every miner brief.
