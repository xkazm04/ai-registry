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

## 0.6.0 - 2026-11-06 - self-evolving-harness (a /shift lander, no harvest pass ran)

- 0.7.0 adds judge family and draws per arm to each row's note cell. Rests on `repeat`: of 18 settled rows, 1 records a judge's family and 1 mentions any repetition, against a law and a golden path that require both. Mid-flight runs finish on the version they loaded.
- Not columns, because `evaluationDebt` reads `verdict` by the header's position.
- Not yet a minimum number of draws, and not a required cross-family judge. Two draws per arm in this lander's probe saw a floor drop and could not size it. A minimum is an operator trade, proposed in the source note.

## 0.7.0 - 2026-11-06 - pof (`/harvest evaluate` as a /shift filler, 2 rows, 2 draws per arm, GPT judge)

- **Give both arms the same query tool.** Both trees were archived with HEAD's `scripts/registry-query.mjs` over their own `knowledge/`, and the old index still answered. That leaves the knowledge as the only registry difference. Archives under neutral folder names also keep an arm from reading its state from a path or from `git log`.
- **`.ai/` is not always ignored in a project.** The method puts artifacts in the routed project's gitignored `.ai/` scratch, but in pof only named paths under it are ignored, so a new folder would have dirtied the checkout. They went to this repo's ignored `.ai/shift/runs/_evaluate/artifacts/` instead. Check with `git check-ignore` first.
- **Name the checks the old corpus cannot already pass.** Two of five governed checks in one rubric and one of six in the other took full marks in all four draws. Those checks only spent judge time. The whole margin came from the rest.
- **A site can pre-empt its probe.** The second site already computes drought flags, so its ordering check could not separate the arms. Read the site's history for the landing's vocabulary before choosing it.
- **The verdict words differ by file.** `evaluation.md` says `impact-*`, and `run-result.mjs` accepts only `better`, `not-better`, `unmeasurable` and `COVERED`. No text maps one to the other. This pass read `impact-positive` as `better`.

## 0.7.0 - 2026-11-07 - pof (`/harvest evaluate` as a /shift filler, 2 rows, GPT judge, 2 draws per arm on one row and 1 on the other)

- **A seat cap buys judges too.** Two rows at 2 draws per arm cost 10 dispatches, not 8. A cap of 8 left the second row one draw per arm, so size the cap before the rubric.
- **Word a rubric's tripwire from the technique.** One check said "price or small number change" where the technique says "cost change", and the judge flagged all four draws for misapplication on that wording, including two that never saw the technique. The judge cannot see the landing, so its flag says little about the landing unless it separates the arms.
- **A pre-registered misapplication clause still needs a reader.** One flag was specific to a HEAD draw, and reading it decided the verdict after unblinding. The row says who read it and what the strict reading gives.
- **An opponent that does not choose leaves the solve untested.** All four draws said enemies do not adapt, so the matrix and dominance steps ran and the equilibrium step and its counter lever did not.
- **A row spanning several techniques can miss them.** The HEAD draw opened one of the three amended techniques, so the probe could not test the other two.

## 0.7.0 - 2026-11-07 - ai-registry (`/harvest backlog --size 3` as a /shift filler, 3 rows, no extra seats)

- **A baseline that passes voids the run, and it can be the finding.** The unguarded arm of the orphan-guard experiment passed in 0 to 1 ms, so every arm looked good. Written down before running, "baseline must fail" voided it. Spawning detached made the baseline fail, and that difference went into the landing.
- **Read the source's ending before designing the arm.** The row for review as a commit of comments listed the limits and left out that its author shelved the tool. Fetching the post moved the falsifying seam to the stated limit, which came back 0 of 81 at the hunk boundary.

## 0.7.0 - 2026-11-07 - ai-registry (`/harvest backlog --size 3` as a /shift filler, 3 rows, 5 seats, GPT judge, 2 draws per arm)

- **Put a permissive rule's own source case in its probe.** The draft existed to allow a gate to proceed past unknown, and both draft draws used its irreversibility condition to refuse that very case, while both base draws reached warn-and-continue from the current text. The other three sites scored close to level, 7 and 8 against 8 and 8 on the four checks away from that case.
- **A fix-shaped row can reach a seat that cannot make the fix.** One such row came up here, with connected projects read-only and the row itself asking for an owner decision. The rule half was stated, so it closed unmeasurable with its instrument named. 22 rows carry that shape, all queued.

## 0.7.0 - 2026-11-07 - ai-registry (`/harvest backlog --size 3` as a /shift filler, 3 rows, 5 seats, GPT judge, 2 draws per arm)

- **Check the harness against the pre-registration before scoring.** The first replay excluded transitions whose SQL changed with no cold-only change, where the text excluded only an unchanged file. Those were the transitions where the arms differ: 4 and 4 of 9 became 10 and 8 of 15. The verdict stayed not-better, and the row says so.
- **A project with no checkout here can still be read on its remote.** A row saying a project's gates were dead was 7 weeks old. The remote showed the config replaced and 5 green runs on main, so it closed covered and not unmeasurable.

## 0.7.0 - 2026-11-09 - ai-registry (`/harvest backlog --size 3` as a /shift filler, 3 rows, 1 seat, no arms spawned)

- **Recorded shell tool calls are a liveness truth that no static arm reads.** They showed 20 of 28 launched scripts named by no workflow, so a roster built from shell and CI called them dead.
- **Audit an arm's misses before scoring it.** The audit split 20 misses into 3 launched through a step table and 17 on a surface the arm does not read. The verdict stayed not-better at 17 against a bound of 14, and the row records both.

## 0.7.0 - 2026-11-09 - ai-registry (`/harvest backlog --size 3` as a /shift filler, 3 rows, 1 seat, blind-ab arms by CLI)

- **A rubric that names the form of the answer can pay for the form.** 3-013 met its target at exactly +2, and all of the gain was one baseline answer that reached the same outcome by declaring removed names instead of omitting them. Read the baseline's losing answer before crediting the gain; the row records both the score and the audit.

## 2026-11-09 - harvest 0.7.0 - a floor states what the text under test asks

Backlog 3-014, a model reading a real instruction. The target was met 0 of 8 to 8 of 8, and the row did not land, because the floor was written from what I expected a reader to do, and the instruction under test said otherwise. A second control written after the miss had no sentence in it, so it measured the answer menu's lean toward verifying instead. Before any model arm: read the floor against the literal text, and ask whether the answer menu can itself produce the result. A missed floor is reported as missed, and the row stays queued.

## 2026-11-09 - harvest 0.7.0 - a reading off the sample owes a held-out set

Backlog 3-020. The declared veto missed its target, 1 of 972, and the sample of merges then showed a different shape, a number differing on each side in about 75% of them. That reading was made by looking, so re-scoring it on the same data would have been a win against an answer key I had just read. It went on the record as a second hypothesis, then ran on repositories not yet opened. Backlog 3-022 was a separate catch: the claim sat in one sentence near the end of a section about a different problem, and the file's own slug did not name it. Read the section before drafting a landing.

## 2026-11-09 - harvest 0.7.0 - ask the instrument whether it ran

Backlog 3-024 and 3-023. A language server over a large copy answered quickly and delivered every planted error, and a project-info call then showed its size limit had disabled the language service, so the run was void. Without that control the scale result would have landed. 3-023 had the matching case in a metric: removing a required field's 1350 lines left subject recall@5 unmoved, so a null on that metric said little about the optional field, and the row needed a reading the control had shown could move. Before trusting a fast or empty result, query the instrument for its own state. Backlog 4-005 went the other way: linked pairs raised question yield, 12 of 14 against 6 of 14, and not the share that needed both passages, which is a result a yield-only target would have called a win.

## 2026-11-09 - harvest 0.7.0 - measure the row inside its own banked boundary

Backlog 4-006, 4-028, 4-030. A local model server split a pinned request 5 of 8 in the run that began the pass, and a sequential re-run of the same prompts then split 0 of 8, so a single reading of a replay would have given either answer; the useful fact was which state each pass ran in. Rows 4-028 and 4-030 belong to a cluster the operator banked whole until a fleet payment or a forge wave exists, and the picker does not read handoffs, so a row can look open while its cluster is held. Open the row's source note's handoff line before measuring. Backlog 4-070 turned up its own correction: the row said a technique forbids what the source did, and the source's changelog showed the source doing what the technique asks.

## 2026-11-09 - harvest 0.7.0 - a row with a mechanism in it is two rows

Backlog 4-075, 4-056, 4-073. A rule about reviewing a stale branch came with a stated cause, a squash reverting in-between work. Measured apart, the review half held and the cause failed for a three-way squash, surviving only for a soft reset onto the target tip. Landing the row whole would have shipped the wrong mechanism with the right rule. The rule's real consumer was a two-dot diff in this registry's own consult check, and a seam search over the fleet found no other. Row 4-031 belongs to the same banked cluster as 4-028 and 4-030 and was passed over: the picker offered it and the source note's handoff line held it. Row 4-073 stayed unmeasurable after a column-name scan: same-shaped pairs exist, but a name scan cannot see a column's write rule.

## 2026-11-09 - harvest 0.7.0 - a saving quoted from one workload is that workload's ineligible share

Backlog 4-106, 4-104, 4-113. A rule about predicates before a per-file spawn arrived with a 17x figure and the cause "the spawn is the cost". Replayed through a real per-edit hook, the same predicate saved 3.9 % on a population three-quarters eligible, and an eligible run cost eight times the spawned no-op. The figure was a property of its corpus, so the target has to be set against the population the seam actually sees. The commit-path population was a proxy for edit events: the transcripts held 24 real events, too few to decide it, and the target was held to the population declared before the run. Rows 4-104 and 4-113 ended unmeasurable on instruments this machine does not have: a ripgrep build with PCRE2, and a store whose consolidation has actually run.

## 2026-11-10 - harvest 0.7.0 - a deepen run can close a backlog row and leave it queued

Backlog 5-015, 5-016, 6-012. Row 5-015 came back covered whole: a deepen run had landed it in its golden path a month earlier and named the closed lead in its commit body, but it never touched the source note, so the row stayed queued. The phantom screen keys on intake forges, and a deepen commit that closes a lead is the same miss by another engine. Row 5-016 landed on a blind-ab whose probes came from this registry's own run history, and that history also corrected a technique: an egress limiter that cannot count fails open only while the remote refuses, not while it sanctions the identity. Row 6-012 was a dated figure with no consumer. Its mechanism was already covered and its residual was already a lead, so it is unmeasurable and names an instrument; a figure nobody decides on is not tested by being repeated in a probe.

## 2026-11-10 - harvest 0.7.0 - a correction the model does not need measures at the ceiling

Backlog 6-013, 6-014, 6-016, second filler pass of the day. Row 6-016 was a sound amendment: the corpus couples delta storage to ancestry-dependent reads, and the source shows the coupling is the row, not the delta. Both arms scored at the ceiling, because the arm without the amendment rejected the false premise unaided on every probe. An imprecise sentence that does not mislead the reader it is written for does not clear a better bar, and the row is not-better rather than covered. Its falsifier still earned its cost: a read-only scan of real session journals refuted the first draft before any arm ran, since nearly every multi-child parent was concurrent work, not a rewind. Row 6-014's residual lost on its own vocabulary: the over-correction floor caught a job-map framing that made the arm restructure a config nobody asked to change. Row 6-013 landed with the target met by a gap of five. Two of the three home hints were wrong again, and one worker's draft files ended in stray tool-call text that the director had to strip before landing.
