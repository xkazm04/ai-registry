# Lessons - council

Append-only, newest first. One block per run, headed with the version the run **used** -
not the bump it argues for - then the date and the project, then concise bullets.

## 0.5.0 - 2026-10-09 - personas

**Authoring run, not a field run** - the `report` subcommand moved here from the consumer
that built it; no council round was driven to produce this entry.

- **The page was built and judged in a consumer, against the owner's own bar.** The
  renderer was designed in personas over 90 real run directories and accepted against the
  owner's /contest report bar (verdict first, members as designed claims, no decision
  control on the page) before it moved. What moved is the approved look: on all 90 runs the
  skill's page differs from the approved one only in five lines that named the consumer
  product and the machine path of the run.
- **It renders in the skill because the consumers cannot.** Every new run in every project
  needs a page, and a consumer's ingest door may be Rust or Python with no Node, and an
  installed app ships no scripts. The step that writes `report.md` is the only place that
  is always running Node with the run directory in hand, so phase 5 renders it there.
- **Dependency-free by necessity, and measured rather than assumed.** The consumer's
  version parsed markdown with remark from its own node_modules; the skill runs in repos
  that have none. `lib/report/mdparse.mjs` produces the same mdast as remark + remark-gfm
  for all 90 real report.md files and for 10,000 fuzzed recombinations of them; the scope
  it leaves out (reference links, footnotes) degrades to escaped literal text. One
  measured trap: lazy-continuation checks done by re-parsing were cubic (62 s for 1,000
  alternating lines); parsing optimistically and cutting at the first illegal lazy line is
  linear (5 ms).

## 0.3.1 - 2026-10-07 - ai-registry

**Authoring run, not a field run** - `--lite` (shipped as 0.4.0) was built and gated, never
driven against a real subject; nothing here is evidence that it judges well.

- **What changed and why: cost.** The one field run of the full council cost ~882k
  cumulative tokens and ~26 minutes (the 0.2.0 entry below). A fleet that sends every
  finished feature to a human gate cannot pay that per feature, so `--lite` is one pass by
  the running session over `value`, `craft` and `robustness` of `feature-v1`, in the same
  result document with `mode: "lite"`. Only subjects tiered major pay for the full council.
  Lite's own cost is not measured yet; the first lite field run should record it here.
- **The consuming door decided two choices before the brief did.** It requires every rubric
  row exactly once and recomputes coverage over every row that is not `not_applicable`, and
  it ignores keys it does not know. So the skipped rows are carried as `unmeasured` and
  coverage is over the whole rubric (a complete lite reads 0.70), and `mode` /
  `skipped_dimensions` could be added at `schema_version` 1. Writing the skipped rows
  `not_applicable` would have ingested too - as coverage 1.0, indistinguishable from a full
  council to a door that does not read `mode`. The arithmetic a consumer re-derives is the
  contract; a scope rule that disagrees with it is a refused result, not a design choice.
- **Rounds are counted per mode, and the door does not know that yet.** The same door
  requires `round_no` to be the subject's last round plus one over ALL its runs, so the first
  full round after a lite pass is refused until it counts per mode. The refusal leaves no
  ingest marker, so the run re-ingests unchanged once the door mirrors the rule. Recorded in
  `references/result-schema.md` as a consumer obligation, because the alternative - one
  shared count - lets three cheap lite reworks exhaust the expensive verdict's three rounds.
- **Counting rounds by prose was the weakest join, so it is now an instrument.** "Count the
  directories whose name contains `-<slug>-r`" also matched another subject whose slug ends
  in `<slug>`, and a lite directory name is ambiguous against a full one of slug
  `<slug>-lite`. `council.mjs round` anchors the pattern and lets `started.json` decide.

## 0.2.0 - 2026-09-22 - kp

**The first field run.** One subject (`developer-case-assessment`), round 1, `use_case`,
`feature-v1`, no overlay, no prior `state.json`, `uncalibrated`. Outcome `ready` at
overall 0.6289 / coverage 0.90; the app's door ingested it 14 seconds later with no manual
step. The method held - every observation below is about the method, not the verdict.

- **The parts that cost real money were the parts nobody had driven.** The arithmetic, the
  floors, the closed outcome set and the supersede rule all behaved as the authoring runs
  claimed, because those were tested. What broke were the *joins*: a manifest key that does
  not exist, a documented command line with no way to supply a required field, a member
  brief naming a pack file the pack table never listed, a `lead:` instruction with no
  destination. None of them is a hard thing to get right and none of them was reachable by
  a `node --test`, because every one of them is a sentence pointing at something outside
  the skill.
- **A one-number measurement carrying two facts is where a careful Director and a careless
  one diverge.** `npm run typecheck` exited 2 with all 33 errors in an untracked directory
  another session left, and zero in the span. The rubric's `0` anchor says "a declared gate
  fails over this span"; the pack recorded one number, so obeying the anchor and obeying
  the evidence were different acts. The careless move (re-run with an exclude) was already
  banned; nothing said what to do instead, and a ban with no alternative is a rule that
  gets broken quietly.
- **A prompt-injection defence that cannot tell a threat from its own evidence manufactures
  work.** The only text the run had to fence was the repo's own `uat/` overlay - which the
  value member's brief simultaneously orders it to reuse verbatim - and UAT files are
  written in imperative voice. The member read it correctly as data, scored correctly, and
  said in its own detail that nothing needed to change; the aggregate promoted it to
  `must_address` anyway, because every `high` lands there. The severity, not the detection,
  was the defect.
- **Three briefs reaching one defect is structural, and only one of them was told to move
  its score.** An unbounded client-side buffer was legitimately in robustness's hard-fail
  check, craft's durability technique, and economics' boundedness pin - and only economics'
  brief says "pins your score at or near 0". The house rule ("two members scoring the same
  defect is that defect counted twice") had no ownership table behind it, so it could be
  obeyed by every member individually and still be violated by the round.
- **`unmeasured` worked exactly as designed, and that is worth recording as evidence rather
  than as doctrine.** Economics came back `null` with a 1,269-character argument about what
  was missing; coverage fell to 0.90 and the mean did not move. The renormalisation is the
  part of this method most likely to be "simplified" by a second implementation, and this
  is the first run where it earned its keep against a real gap.
- **The blindness guarantee has a price and it is measurable.** Six subagents, ~882 k
  cumulative context tokens, ~26 minutes wall clock, five members each independently reading
  the same 716-line file. The mechanical-first ordering was load-bearing in the other
  direction: had robustness come in under 0.50, the three judged members (~17 min and most
  of the tokens) would not have run at all.
- **A default that writes into a consuming repo must name a path that repo already ignores.**
  `<repo>/.council/` was not in kp's `.gitignore`, so a vault whose own schema says "not
  version controlled" sat in `git status` forever - while `.personas/`, where the run
  directories already live, was ignored at line 70. The bug was choosing a fresh top-level
  name instead of the tree the method had already been given.

## 0.1.0 - 2026-09-21 - ai-registry

**Authoring run again** - the scenario/envelope change (0.2.0) was built and gated, never
driven against a real subject. These are observations from building it.

- **An "optional, additive" field is a claim until a golden fixture pins the other case.**
  `buildResult` composing `scenarios: []` and an empty `envelope` unconditionally would
  have changed every result document the contract has ever produced, while every existing
  test still passed - they all assert about keys they name, and none of them asserts about
  keys they do not. The fixture `tests/fixtures/result-no-scenarios.json` is the cheap
  thing that makes "additive" testable: absent, not empty, because an empty envelope is a
  claim that the branches were considered.
- **The judge may not own the scope.** The scenario scopes are read from the product's
  exported `state.json` and a member's self-written `scope` is ignored, because a judge
  that can also decide which branches count can always pass by narrowing the question. The
  member keeps the one power it needs - proposing a branch it discovered - and that lands
  as `proposed`, which moves nothing.
- **The proof ladder is recorded and not gated, deliberately.** Refusing to bucket a
  `simulated` must-hold branch as `holds` was tempting and would have made the instrument
  decide what counts as evidence. It says so in the member's summary instead. This is the
  first rule in the method a second implementation could plausibly "improve" into a gate,
  so the rule order in `references/result-schema.md` states it as a rule rather than an
  omission.
- **A brief that says "at or above floor, or for tracked >= 0.5" is two rules.** A
  `tracked` branch carrying an explicit floor is the ambiguous case; it buckets at a flat
  0.5 here, and that is written down rather than inferred, because a port reading the same
  sentence would otherwise pick the other reading and disagree only on the rows nobody
  tests.

## 0.1.0 - 2026-09-20 - ai-registry

**Authoring run, not a field run.** The method has not yet been driven against a real
subject, so nothing below is evidence that it judges well; these are observations from
building it and running the lane's own gates, and they are recorded here because this
lane's gate requires a skill to ship with at least one entry rather than an empty file.

- **Adding a key to the `signals/` lane is three files, never one.** The council feedback
  path (`bundles.<bundle>.councils`) was specified as a change to `signals-collect.mjs`
  alone. `check-signals.mjs` holds CLOSED key sets for both the top level and a bundle, so
  the collector would have written a file the lane's own gate rejects on the next commit.
  The change is the writer, the gate and `docs/signals-lane.md` together - and it was
  proved in both directions with a throwaway contributor file: one that must pass, and one
  carrying a prose key and a path-shaped slug that must fail.
- **A council line carries subject slugs but no bundle**, unlike a consult line. Resolving
  the bundle from `knowledge/<domain>/index.json` and DROPPING a slug that resolves nowhere
  was the only honest option; defaulting to `software-engineering` would file a real human
  verdict under the wrong corpus and nothing downstream could detect it.
- **`meta` earns its place as a denominator, not a notes field.** A bundle with no
  `councils` key cannot otherwise be told from a machine where no council log was readable,
  which is the same absent-is-not-zero rule the method's own `unmeasured` state exists for.
- **The trigger gate's containment is over the SMALLER vocabulary**, so a short description
  collides more easily than a long one. A long, specific description naming the method's
  own boundary (one finished subject, bounded members, a human gate it may not pass)
  reported no near-collision at all at the 0.45 report floor against the four skills it was
  most at risk from.
- **`node --test skills/council/tests` does not work on Node 24**; the directory form
  resolves as a module and fails with `MODULE_NOT_FOUND` while still printing a test count.
  The glob form `node --test "skills/council/tests/*.mjs"` is what runs. The suite was also
  proved able to fail by breaking one assertion (exit 1, the named test red) before being
  reported green, and `NODE_TEST_CONTEXT` was scrubbed from the environment first.
