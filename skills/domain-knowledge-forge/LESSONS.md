# Lessons - domain-knowledge-forge

Append-only reflection lane. One entry per run that taught something, newest last.
Format: `## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-08-19 - gravitone-gcloud + politicas + grant-writing-nonprofits (the founding run)

- Scale observed: 8 scouts over 120 contexts, then 46 subject-forgers, cap 10 concurrent,
  ~5 hours wall-clock. Every forger came back gate-clean on first report; the per-forger
  "run the gate yourself, ignore other subjects' failures" rule is what made a 46-agent
  wave reviewable at all.
- The two-phase order held its promise measurably: forgers consistently reported 5-7
  "upward lessons" per subject - incident-anchored rules the expert draft lacked - while
  zero subjects read as a description of one codebase. Keep the order non-negotiable.
- Repos that hand-extract their own craft (doctrine files, prompt libraries, incident
  comments above pure functions) yield an order of magnitude more than repos where the
  knowledge is implicit in behavior. Scout reports should say which kind they found -
  it predicts forge quality per subject.
- The densest artifact in one repo (a 703-line review-gate library) was absent from its
  context map entirely. Scouts must be told the map is a starting partition, not a fence.
- Topping the pool one agent per completion notification beat fixed batches: the cap held
  exactly, and no slot idled waiting for the slowest sibling.
- **Verify the instrument before reporting a content gap.** The index builder counted
  `use_when` with a string-only check while the parser returns lists as arrays, so a
  corpus at 267/267 coverage was reported as 0/267 - and a whole "backfill pass" was
  planned (and six agents dispatched) against a gap that did not exist. The fix was one
  line in the counter, not 267 edits. Same failure family as every carried-forward-metric
  incident: the tool answered a different question than the one asked, plausibly.
- Shared-checkout discipline mattered twice: a sibling session's in-flight file sat
  pre-staged in the registry's index during the first commit (isolated read-tree-HEAD
  index kept it untouched), and the follow-up ran in a git worktree from the start -
  strictly simpler. Default to the worktree.

## 1.0.0 - 2026-08-20 - llm-observability (LightTrack)

- When the new domain neighbors an existing bundle (five colliding subjects with
  the builder-side llm-agent category), the fix that held was structural: a
  boundary contract in the bundle's index.md plus every golden path naming its
  neighbor subject in prose. Zero duplication across 16 subjects; adopt as
  standing doctrine for any adjacent-domain forge.
- The deepen skill's demand matrix falsified one of this forge's consolidation
  calls within hours (a folded-out subject was a live-demand coverage hole).
  Lesson for Phase 1: when folding a scout candidate out, record it as a lead
  with its demand evidence - consolidation is a hypothesis, not a verdict.

## 1.0.1 - 2026-08-20 - ascent (assessment domain, into an existing bundle)

- **First run into an EXISTING bundle rather than founding one.** 18 new subjects joined a
  106-subject bundle. Two additions to the method carried it: dispatches named 1-3 adjacent
  existing subjects and required a prose boundary ("declared here, proven there"), and a new
  category was **appended** (order 9), never reordered. Result: zero duplication across 28
  touched subjects, and forgers spontaneously negotiated seams with each other's in-flight
  work. The scout brief must carry the full existing subject list so candidates come back
  classified NEW vs EXTENDS - without it the wave re-proposes what the bundle already owns.
- **Forgers correctly refuse to link a sibling whose folder does not exist yet.** Six did,
  naming the sibling in prose instead. That is right (the gate checks links), but it leaves
  the bundle under-linked, so the director owes a link-upgrade pass at Phase 4. 13 links,
  one script, after every folder exists.
- **A reciprocal apply pass is the strongest verification the bundle has, and it belongs in
  the method.** After publishing, the deviations forgers recorded in `applications/` were
  harvested into a ranked defect backlog (52 found, 1 already fixed and dropped, 8 merged to
  4, 47 real) and landed back into the source repo. Two payoffs. First, it re-verifies the
  extraction: every cited `path:line` is opened again, and 5 citations needed correcting.
  Second, and larger:
- **The apply pass FALSIFIED a promoted upward lesson, in the same session.** `agent-memory`
  had taken "usage is a veto on forgetting" from the repo as an upward lesson and promoted it
  to three documents. Implementing the bundle's own rules proved it was the defect: the term
  counted deliveries not uses, and was unbounded while the retirement sweep scored with the
  same model, so an item financed its own survival forever. Doctrine now: **an upward lesson
  stated as an emergent property deserves more suspicion than one stated as a rule.** "Nobody
  has to implement it, it falls out of the arithmetic" is the shape of an unbounded feedback
  loop. Ask what the loop's input is and whether it terminates.
- **The recurring defect class in a mature repo is not wrong code - it is a fix the repo
  already wrote and never called.** A stable-identity helper existed while the caller joined
  on rendered text; an effort-ordinal authority was documented as "the single authority" and
  consumed nowhere. Reconciliation finds these precisely because the forger reads the doctrine
  comment stating the intent, then checks whether anything consumes it. Worth telling forgers
  to look for it by name.
- **Give apply agents disjoint write sets and forbid every git command; the director commits
  per area.** Eight agents on one branch would otherwise race the index. The cost is that a
  fix whose plumbing crosses the boundary lands disabled - three did (an instrument-comparability
  gate reading "unknown" for every real pair, a privacy distinction with no reader, a meter
  basis nothing rendered). The director must finish those, or the wave ships gates that are
  present in the code and absent in the product. Ask every apply agent to state explicitly
  whether its fix is reachable end to end.
- **Measure the target repo's baseline before dispatching and put it in the brief.** "tsc exit
  0, 508 files / 6788 tests" made every later failure attributable in one line. The full suite
  at the end caught two regressions the eight targeted runs each missed - including a new audit
  action shipping unlabelled, caught by the repo's own static action test.
- Scale: 5 scouts / 49 contexts, 18 forgers, 10 deepeners, 8+8 apply agents, cap 10 throughout.
  A session limit killed 7 deepeners mid-write; 5 had already integrated and were complete, 2
  left orphan techniques the gate named immediately, 1 had written nothing. The bidirectional
  technique check is what made a mid-air failure diagnosable in one command. Repair agents were
  told to review before integrating, since an orphan was written by an agent that never
  reconciled it - one was kept unedited, one gained nothing (its anchors were already covered).

## 1.2.0 - 2026-08-22 - a harvest into software-engineering (one ordinary repo, all 56 contexts)

- **Joining a bundle is a third lane, and it needed its own contract.** Not founding
  (the taxonomy, laws and voice are already decided) and not deepening (the material
  comes from a tree, not from research). Written as `docs/harvest-brief.md` and used by
  all 20 workers: the seam is the job, the voice is inherited, the laws are closed, and
  the highest-value outcome available to a worker is reporting that its ground is
  already owned. Scale: 10 scouts / 56 contexts / 1,029 files, then 14 new subjects and
  6 extensions, cap 10 concurrent, all gate-clean.
- **Expect the same subject to be proposed by three or four unrelated territories, and
  dedup by SUBJECT FOLDER before dispatch.** Four scouts independently proposed
  extending one subject; four more independently proposed extending another. Eight
  dispatches as proposed would have been eight workers racing two golden paths. Only
  the director reads every scout, so this is director work by construction - and it is
  the single thing that makes a harvest wave survivable.
- **The same merge appears in content, not only in scheduling.** Four scouts each found
  one face of one subject (a marketing demo, a dashboard fixture fallback, a three-plane
  API client, a nav badge that must not count fabricated incidents). Carving by
  MECHANISM versus HONESTY produced one shippable subject and one banked one. Asking the
  worker to confirm the carve as a tiebreaker cost nothing and confirmed it.
- **Check the target's technique count and stack list from the SCAN, never from the
  domain note.** One extension was dispatched to retire single-stack debt on the
  strength of a note one day old; the scan showed the subject already carried two stacks
  and already stood at nine techniques, the house ceiling. Dropped mid-wave and swapped
  for a subject that genuinely was single-stack. The note is a record of a moment.
- **A harvest GROWS the bundle's transplant debt.** Single-stack subjects went 67 -> 79:
  two retired, fourteen new ones born with one stack each, because a subject reconciled
  against one tree has exactly one. This is arithmetic, not a regression, but a wave
  should report it rather than netting it away - and the pass that pays it down is a
  transplant pass, not another harvest.
- **Tell workers the source repo's context map may be stale, and make re-opening every
  cited line a step separate from drafting.** It paid on every axis: roughly a fifth of
  anchors were off by one to three lines, several listed files no longer existed at all,
  and two anchors carried a stated rationale inverted relative to the code's real
  effect. A citation nobody re-read is the one liability an external reconcile already
  measured; a harvest has ten times the citations.
- **A worker refused a director instruction and was right.** Six dispatches carried a
  runtime version justified by a types-package pin in the manifest; the tree's only real
  runtime witness was its CI workflow, two majors away. One worker checked, refused, and
  said so; the rest had complied. Broadcasting the general rule mid-wave - when a
  dispatch states a fact about the tree and the tree disagrees, the tree wins and you
  report it - is worth doing at dispatch time instead.
- **Ten workers proposed ten laws; none qualified.** Every worker proposed at least one
  anchor, three cited sightings in subjects outside their own, and one had four. The bar
  is cross-domain recurrence and every sighting sat in one domain. Bank them per subject
  with their evidence and return conditions: a law proposed by ten independent workers
  in one afternoon is either a real anchor or a shared blind spot, and one wave cannot
  tell which. Resist minting at wave end - an anchor no technique cites is decoration.
- **Verifying the instrument caught two things, not one.** A catalog/index disagreement
  that looked like registry drift was another session's uncommitted work in a shared
  checkout (confirmed by file mtimes, and by a clean baseline in a fresh worktree from
  the same commit). And the maintenance scan's never-swept clause read a frontmatter
  field that no writer anywhere emits, so it scored the entire corpus permanently and
  dominated its own ranking - surfaced only because twenty fresh subject notes moved the
  count by exactly zero.
- **In a shared checkout the worktree is step one, not the fallback.** This session's
  first git command moved another session's HEAD onto a branch it never asked for.
