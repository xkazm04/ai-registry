---
name: librarian
description: "Maintain the registry as a whole: sweep every bundle for structural and quality decay, rank what needs work by measured attention points, and dispatch scoped /deepen or /forge workers at it. Keeps coverage memory in an Obsidian vault under librarian/ so each run knows what the last one touched, what is saturated, and what is owed. Run manually; a scheduler is a later wrapper. Use when nobody has looked at the registry in a while."
category: ai-native
memory: project
version: 1.4.0
tags: registry, maintenance, coverage, dispatch, quality, upstream
---

# Librarian

The registry has three content engines and they are good. `/forge`
creates a bundle from a repository's ceiling. `deepen` raises one subject above any
repository, with research lanes and a saturation ledger. `research` runs inward: it
mines a source somebody handed us for what it changes here, and banks what it cannot
prove as a dated lead.

**This skill is none of them.** It is the layer that decides *what to run, where, and
whether it was worth running* - a warden over structure and a dispatcher over the
engines. It keeps the coverage memory that lets run N+1 know what run N did.

Say that out loud in every session, because the failure mode for a skill like this is
re-implementing deepen's research lanes badly under a new name. **If the answer is
"research this subject", the answer is `/deepen`, dispatched from here.** If it is
"mine this link", the answer is `/research`, and a human has to bring the link.

## Invocation

```
/librarian              # sweep + report, writes no content
/librarian run [domain] # the full loop, dispatches workers
/librarian structure    # the mechanical pass only - cheap enough for every merge
/librarian status       # read the vault, touch nothing
/librarian upstream     # the upstream lane alone: which mined trees have moved
/librarian reflect      # update the standard + this skill from what the last runs taught
```

## Never count anything yourself

`node scripts/librarian-scan.mjs --json` is the instrument. It emits, per subject:
technique and application counts, stack diversity, missing `use_when`, body mass,
oldest `verified_on`, expired and at-risk applications, version witness, consumer
demand where it exists, last-swept date, dry streak, and an attention score with its
reasons. `node scripts/check-currency.mjs --json` adds the decay detail.

This registry once reported a content gap at 0/267 over a corpus that was at 267/267,
because a counter read a different shape than the parser emitted. **Verify the
instrument before reporting a gap**: spot-check one number against one real file every
run. A model that counts its own corpus produces a confident number nobody can check.

## The loop

**1. Prove the instrument.** `check-bundles`, then `build-index`, then `build-catalog`
(that order - the catalog hash covers the index), then `build-knowledge-rules` (the
always-on consumer rule; CI gates it under "bundle index freshness" and it has been found
stale on trunk three times because this list used to omit it). Then the scan, and
`node scripts/build-registry-map.mjs --check` for the **consumer side**: how many recorded
verdicts in the fleet were judged against a subject that has since changed, by subject.
Confirm one figure by opening one file. If a gate is red, stop: you are about to rank a
corpus that does not parse.

Then the **upstream side**: `node scripts/upstream-check.mjs --self-test`, and only if it
passes, `node scripts/upstream-check.mjs --json`. The self-test asserts the compare call
against repositories known to have moved; without it, an all-quiet result is
indistinguishable from a dead API, and this repo has already paid for that lesson once.
It costs about 130 authenticated API calls against a limit of 5000/hr.

**2. Sweep and score.** Read the scan fresh. **Never carry forward last run's derived
numbers** - deepen learned this the expensive way, and the vault stores what was DONE,
never what was computed.

**3. Structure pass.** Cap breaches, taxonomy drift, orphan techniques, dead links,
file health. All mechanical, all fixable in-session, none needing a worker. A cap
breach is fixed by editing `taxonomy.json` and running
`node scripts/apply-taxonomy.mjs <bundle> --to nested --apply` - never by moving a
folder, because relative links encode depth and the mover is what rewrites them.

**4. Rank.** The scan orders by attention points. Then apply the three judgments a
script cannot:

- **Demand outranks structure.** A consumer deviation or a citation reported `gone`
  beats any structural gap. But when `demandKnown` is false, demand is UNKNOWN, not
  zero - say so in the report rather than ranking as though nobody needs anything.
- **Suppress the saturated.** A subject with `dry_streak >= 2`, no expired clock and
  no event to point at does not get re-run. That is deepen's law and it is what stops
  the loop burning tokens on settled ground.
- **Systemic beats individual.** When one defect dominates the worklist across dozens
  of subjects, the fix is one systematic pass, not forty dispatches. Notice this
  before you dispatch, not after.
- **A due lead is cheaper than a fresh scan.** `librarian/sources/` holds findings a
  research run proved real and could not land, each with a return condition. Read them
  before ranking: a lead whose condition has arrived is work somebody already scoped.
- **Upstream movement is a third party's news, and it ranks below ours.** A consumer
  deviation, verdict debt or a due lead all outrank a repository having shipped a
  release. The one exception is **citation risk**: when `upstream-check` reports
  `pin-unreachable` or `rewritten`, the corpus cites a commit that moved or vanished and
  every application resting on it is unverifiable *now*. That is decay, not news, and it
  ranks with `check-currency`'s expiries. See [the lane's design](../../../docs/plans/upstream-lane-2026-09-04.md)
  for why eligibility is measured as reach into the fleet's code rather than across the
  corpus - the obvious instrument was built, run, and rejected on its output.
- **Verdict debt is demand too.** The map check reports, per subject, which projects
  hold verdicts the registry has since moved under. A subject with stale verdicts in
  three projects is being *used*; that outranks a structural gap in one nobody joins
  to. And a subject whose last landing was never applied anywhere (no row in
  `librarian/applied.md`) is a wiki page the sweep should not enrich further before it
  has been tried once.

**5. Dispatch.** A fleet of scoped workers, **cap 10 concurrent, topped up one per
completion** - the number both existing skills converged on across measured runs. Each
worker owns exactly one subject folder and **resolves its path from
`knowledge/<bundle>/index.json`, never constructs one**. Cross-subject findings come
back as proposals for you to place; a worker that writes outside its folder is the
collision the scope rule exists to prevent.

Choose the engine by what is missing:

| finding | engine |
| --- | --- |
| subject is thin, stale, or contradicted | scoped `/deepen` |
| subject does not exist but should | forge wave (`/forge`) |
| a banked lead in `sources/` came due | scoped `/deepen` at the subject the lead names |
| subject is single-source (one stack, one origin) | `/reconcile` wave against an external counterpart |
| missing `use_when`, dead link, bad frontmatter | fix in-session; no worker |
| cap breach, misplaced subject | `apply-taxonomy.mjs`; no worker |
| a new technique or flipped rule with no `applied.md` row | apply worker at the project the map joins it to (`/intake` Phase 7.5 method), one per finding |
| stale verdicts in a project under a subject this run touched | that project's `/conform --stale`; hand it the list, do not judge from here |
| a mined repository is `due` in `upstream-check` | scoped `/intake <url> --delta` under [`docs/upstream-brief.md`](../../../docs/upstream-brief.md), one worker per repository |

**The upstream lane's caps are the point of it.** At most **3 delta re-scans per run and
6 per calendar month**, and they spend the same cap 10 and the same review ceiling as
everything else here - they get no budget of their own. 39 eligible repositories on a
monthly clock is a feed, and a feed is what this lane must never become. Rank the due
rows by condition-fired, then tier, then age; dispatch the top three; and **write every
due row you did not take into the run note with the reason**, or the next run re-derives
it. A repo whose `handoff:` is not yet EXECUTED is owed work, not a re-scan, and the
instrument already withholds it.

**6. Review diffs, not reports.** Purity grep over the upper layers, read every new
technique, check corrections against the file's prior voice. Not delegable, and it is
what sets the batch ceiling near 8 per sitting.

**7. Commit, write the vault, reflect.** Atomic commits per subject. Then update
`librarian/subjects/<domain>/<subject>.md` for everything touched, the domain note,
and one run note. **Record what you declined and why** - a decline nobody wrote down
gets re-proposed every run forever. Re-run `node scripts/upstream-check.mjs --ledger`:
a repository checked and found unmoved still gets its date carried forward, because
without that row "are we overdue?" has no answer.

**8. Propagate.** The run is not over at the registry commit; that is where every run
before 2026-09-02 stopped, and the measured result was a fleet whose recorded verdicts
were 100% stale against the corpus with nothing having told any project. After the
generated files are rebuilt (`build-index`, `build-catalog`, `build-knowledge-rules`):

- `node scripts/build-registry-map.mjs` over the fleet. It carries every verdict
  forward, marks the pairs whose subject moved `stale: true`, and prints the impact
  table: subject → projects with stale verdicts. Commit each project's
  `.ai/registry-map.json` with a pathspec on its active branch; never push.
- Write the impact table into the run note under **Impact** and into each touched
  subject note - slugs and counts, never paths. It is the project's `/conform --stale`
  queue, and it is next run's demand.
- Every new technique and every flipped rule this run landed owes a row in
  `librarian/applied.md` (mode, verdict, or `unapplied` with a return condition).
  Dispatch one apply worker per finding at the project the map joins it to, cap the
  same as step 5, review their diffs the same as step 6. A run that lands six
  techniques and applies none has enriched a wiki.

## The vault

```
librarian/index.md                        map of content
librarian/standard.md                     the bar every sweep grades against
librarian/projects.md                     which connected project relates to which bundle
librarian/domains/<domain>.md             per bundle: last swept, shape, what is owed
librarian/subjects/<domain>/<subject>.md  last touched, dry streak, open leads, declines
librarian/runs/<YYYY-MM-DD>-<n>.md        what one run swept, dispatched, accepted, declined
librarian/sources/index.md                the ledger of external sources /research mined
librarian/sources/<YYYY-MM-DD>-<slug>.md  what one source yielded, and what it did not
librarian/upstream.md                     every mined repository: when we last looked, what moved
```

Obsidian-navigable: wikilinks between notes, one fact per note. It lives in the
registry because it is reviewed like everything else here and readable with no tool.

Subject notes are created when a subject is first touched, not up front - 186 empty
notes would be noise, and "no note" already means "never swept", which the scan reads.

**The lane is public.** Scores, slugs and dates only. Never a consumer's paths - the
same rule as `usage/` and `signals/`.

## Rules that are not negotiable

- **Open a pull request; never push to `main`.** Merging is adopting and it is a human
  act - the whole governance model of this repository. This matters most when a
  scheduler eventually runs the loop unattended: build it in now, or the scheduler is
  the change that quietly breaks the model.
- **Work on a branch**, and verify `git log -1` is your commit before reporting.
- **Unknown is not zero.** An unwitnessed bundle is not a current one; an unswept
  subject is not a healthy one. Report absence as absence.
- **Dry is a result.** A sweep that finds nothing worth dispatching is a finding.
  Write it in the run note and stop. Do not pad a worklist to look productive.
- **Never edit the upper layers with product names.** The gate catches it; do not make
  it work.

## Scheduling (not yet built)

The loop is idempotent and its whole state is files, so a cron wrapper is small. What
that wrapper must preserve: the pull-request rule above, a token budget per run, and two
triggers worth waking up for - `check-currency.mjs --fail-on-expired` for our own decay,
and `upstream-check.mjs --due --exit-code` (exit 3) for a mined tree that has moved. An
unattended run that finds nothing should write a one-line run note and exit, not
invent work.

Until that wrapper exists, say the honest thing: the upstream lane is *due-checkable* at
any time, not *scheduled*. `librarian/upstream.md` makes "how overdue are we" a fact
rather than a feeling, and that is the whole of the cadence guarantee today.
