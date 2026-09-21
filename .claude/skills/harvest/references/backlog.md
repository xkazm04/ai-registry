# Backlog mode - land untriaged candidates on a measured verdict

The protocol behind `/harvest backlog`. The input is not the URL queue. It is the
untriaged tail every `/intake` run leaves behind: candidates that reached a triage
table, carried anchors, and were never verified. On 2026-09-16 that tail was 1,765
declared items; after excluding three bibliography notes (603 unread references, a
different lane) and splitting prose into items, it was **1,100 rows** in
[`librarian/harvest/backlog.jsonl`](../../../../librarian/harvest/backlog.jsonl), of
which 93 were already covered and closed on seeding.

## Why this mode lands without a human, when harvest's auto mode will not

Harvest's auto column is timid because a queue is *volume*, and volume launders
authority: 177 URLs are not 177 pending merges. That law still holds here. What
changes is who authorizes. **In backlog mode the source originates the candidate and
the measurement authorizes the landing.** No row lands because a past run liked it, a
ranker scored it, or a cluster found three sources for it. It lands because a verdict
came back `better`.

The operator set the bar on 2026-09-16: *"try to measure on test or simulation
benefit of each item. If positive then accepting into the main."* A simulation
verdict counts. It is recorded as `applied: simulation` on every landing, so a
simulation-landed technique that later goes wrong can be found, with every one of its
siblings, by one query of the frontmatter. That field is the price of the lower bar,
and it is not optional.

The operator's reasoning, so a later session does not "fix" this back to timid: the
backlog is too large and too technical for per-item human judgment, and a human gate
over it ratifies the ranker. That is the same finding intake v2.5 measured (134 of
149 source notes read `declined: 0`).

## The ledger and the picker

```sh
node scripts/backlog-wave.mjs status                       # counts by status, mode, verdict
node scripts/backlog-wave.mjs next --size 8                # the next wave, as JSON units
node scripts/backlog-wave.mjs mark <id,...> <status> --mode <m> --verdict <v> --commit <sha>
```

A **unit** is what one worker measures:

| unit | built from | why it travels whole |
| --- | --- | --- |
| convergence | rows sharing a cluster in `backlog-clusters.json` | two sources that reached one rule are ONE landing; two workers would draft duplicates. +2 priority when the members come from 2+ notes |
| tension | rows the clustering pass found contradicting each other | the loop must never land both sides of a disagreement; the sides are measured head-to-head and only the winner drafts |
| item | everything else | - |

**At most one unit per home subject per wave.** Workers do not write, so they cannot
collide on files; but parallel proposals against one golden path return overlapping
drafts, and a director merging them lands contradictions. The picker enforces this;
do not hand-assemble a wave around it.

Closed sets: status `queued measuring landed not-better unmeasurable covered held`,
mode `code experiment blind-ab simulation`, verdict `better not-better unmeasurable`.

## One pass

1. **Claim and pick.** `run-board claim --skill harvest --source "backlog wave <n>"`,
   then `backlog-wave.mjs next`. Mark every picked id `measuring`. Beat the board with
   each unit's home.
2. **Dispatch one Opus worker per unit** (brief below). Arms run as `claude -p` CLI
   sessions, never as nested subagents: nested agents count against the session's
   concurrency cap of 20, and a wave of eight workers each spawning three would
   exhaust it.

   **The wave size is a bound on the DIRECTOR's attention and must not be derived
   from that machine number.** This file said "cap 8 concurrent" and justified it by
   20 divided by a fan-out of 3, which is `limits-are-derived` satisfied in form and
   violated in substance - the tell is that the figure moves when the runtime is
   upgraded and does not move when the director changes. Wave 7's unit 1-106
   measured the defect here: seven waves of eight ran, the machine cap never came
   near binding, and one director read all 56 returns serially and rendered a
   landing verdict on each.

   Derive it from the discharge pattern instead, which `applied.md` already records:
   **the wave size above which one landing decision starts covering units that are
   not alike is this director's ceiling.** Recompute it rather than inheriting 8 -
   the number is per person. Until it is recomputed, 8 stands as an observed working
   figure and not as a derivation, and this paragraph says so rather than dressing it
   up. The releasing/non-releasing distinction is
   `fleet-orchestration/techniques/parallel-dispatch` > "The third number is the
   supervisor's".
3. **Land serially, per returned verdict.** The director writes every registry file.
   - `better` (any mode) -> land the worker's draft per intake Phase 7 (technique,
     amendment, correction, application), with `applied:` and `ab_verdict:` in the
     frontmatter, a `librarian/applied.md` row, and a subject note line. Mark `landed`.
   - `better` in `code` mode -> also ship the fleet change: take the worker's
     worktree branch onto the project's **active branch** by path checkout and a
     pathspec commit (a merge refuses a sibling-staged index), in the project's own
     commit convention, never bypassing a hook, never pushing. Uncapped, per the
     operator's 2026-09-16 rule; a *direction* still waits for its owner's ledger row.
   - `not-better` -> mark `not-better` with the seam class in the verdict line. Nothing
     lands: the candidate was never in the corpus, so there is no technique to amend.
     The row is the permanent record that it was tested and lost.
   - `unmeasurable` -> mark `unmeasurable` only with the instrument that would measure
     it named in the worker's return. Without that name the verdict is refused and the
     row goes back to `queued`.
   - covered on re-verification -> mark `covered`.
4. **Gate and commit** under the `index` and `commit` locks, from a **worktree of
   main** (`git worktree add C:/t/main-land main`). Never switch the shared
   checkout's branch to reach main. Regenerate index, catalog and
   `build-knowledge-rules.mjs` there: it holds no sibling WIP, so generated artifacts
   describe only committed content. Commit the ledger with the landings.
5. **Report**: counts by verdict and mode, landings with their `applied:` mode, fleet
   commits, and the next wave's priority band.

## The worker brief

The brief itself, with its binding lessons, is
[`backlog-worker-brief.md`](./backlog-worker-brief.md). Point every worker at
that file by path; it is what makes a fresh session's workers as careful as the
last session's.


```
You are measuring ONE backlog unit for /harvest backlog. Registry: <main worktree>.
UNIT: <JSON from backlog-wave.mjs next, verbatim>
Read first: .claude/skills/intake/SKILL.md Phase 6, 7 and 7.5, and
.claude/skills/harvest/references/evaluation.md.

1. RE-VERIFY. Open each item's source note (librarian/sources/<note>.md) for its
   anchors, and open the home subject's golden path and its nearest techniques. If
   the corpus already states the rule, return verdict COVERED with the file and line
   and stop. For a TENSION unit, state the discriminator between the sides first.

2. DRAFT the landing as text: shape (technique | amendment | golden-path correction |
   application), the full file content, the golden-path techniques: line, use_when,
   laws that already have anchors. Strip test: no product, company or tool name in an
   upper-layer file. A convergence unit is ONE draft citing every source.

3. MEASURE at the highest reachable mode, and say why not the one above it:
   - code: a fleet project whose domains include the bundle has a real seam. Work in
     your OWN worktree (git worktree add C:/t/bw-<unit> -b backlog/<unit>, junction
     node_modules if tests need it, rmdir the junction before deleting). Prefer the
     seam that could FALSIFY the rule. Declare TARGET and FLOOR before running. Arm A
     = seam as-is, arm B = rule applied. Commit B on your branch; never on the active
     branch, never push.
   - experiment: same inputs replayed through a harness that changes no product code.
   - blind-ab: the evaluation.md protocol, with the DRAFT as the knowledge under test.
     Probe from the draft's use_when at a real site. Arm A gets the draft in context,
     arm B does not; both via `claude -p --model claude-opus-5 --output-format json`
     in separate folders, writing answers to files. A third `claude -p` judges blind
     against a rubric written before the arms ran.
   - simulation: THREE cases pulled from a real tree or its history, each walked
     under the rule and without it, each with what would falsify the prediction.
     Invented cases are an opinion and do not count.

4. RETURN, and write nothing to the registry:
   verdict (better | not-better | unmeasurable | COVERED), mode, target and floor with
   numbers, arms summary, the draft files in full, the fleet branch + commit if code,
   the instrument that would measure it if unmeasurable, and anything you refuted.
```

## What `checked` means, and why a worker may not trust it

Every row carries a `checked` field, set by hand when the row was enumerated and
passed straight through by the picker. Nothing defined it until now, and five
wave workers have each had to guess. The closed set:

| value | means |
| --- | --- |
| `confirmed` | the enumerator read the source note and the claim is stated there as the row states it |
| `refuted` | the claim contradicts its own source - usually a figure that does not reconcile with the source's own tables |
| `unverifiable` | the enumerator could not reach what the claim rests on |

**It is a property of the CLAIM, not of the anchor, and that is where it has been
wrong most often.** A row whose repository clone is gone has an unreachable
*anchor*; if its claim is a fact about fixed-width arithmetic, the claim is
perfectly verifiable and was marked `unverifiable` anyway. Wave 4 found that
exact case, and a second row marked `unverifiable` that was simply `covered`.
Wave 5 found a `confirmed` row whose claim is a design choice the corpus already
rejects by name - measuring it would have landed an error.

So `checked` is a hint about what the enumerator saw, at the altitude of the
source note. It is not a verdict, it does not survive Phase 1, and a worker
**re-verifies it either way**:

- `refuted` is not a reason to skip a unit. It can mean the source's figure is
  wrong while its mechanism is sound (land the mechanism, quote no figure), or
  that the row is a correction to the corpus - wave 5's sharpest landing came
  from a row marked `refuted`, dispatched because it was.
- `confirmed` is not permission. Check the claim against the source AND against
  the corpus, because a confirmed claim can be a choice the corpus has already
  measured and refused.

When a worker finds the field wrong, it says so in the return and the director
corrects the row - the status field is authoritative afterwards, not `checked`.

## The backlog can contain claims that already landed

The enumeration reads each source note's untriaged table. A later intake run
can forge those same candidates into techniques, and if it does not also update
the note, the table stays standing - so the next enumeration turns already-landed
claims into backlog rows. Those rows are **phantoms**: real claims, already in
the corpus, waiting to be measured a second time. One of them reached a worker
on 2026-09-17 and came back COVERED against a technique forged by the very
intake run that had read its own source note.

`node scripts/backlog-phantom-screen.mjs` reports the suspects. It is note-level
and over-flags on purpose, because a note can have some candidates forged and
others genuinely untriaged - the same day the pattern was found, one source had
three techniques forged *and* a real residual that landed. So it applies a second
discriminator: whether the note itself was touched at or after the forge commit.
A run that forges a note's candidates and writes the note's counters in the same
commit leaves no phantoms.

The screen marks nothing. Verify a suspect by reading the forge commit and the
corpus, and mark `covered` only for the whole row - a row whose claim is mostly
stated with a residual surviving stays `queued`, and the residual is queued as
its own row.

**The real fix is upstream**: an intake run that forges a note's candidates
updates that note's untriaged table in the same commit. Until it does, run the
screen after every reseed and before dispatching a wave.

## Stop rule

Harvest's loop rule applies, with one addition. **A wave whose verdicts are all
`covered` or `not-better` in one home subject retires that subject from the next three
waves** - the backlog there is behind the corpus, and spending on it measures the
ranker's optimism, not the corpus.
