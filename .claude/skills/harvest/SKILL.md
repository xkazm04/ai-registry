---
name: harvest
description: "Drain the graded source queue in librarian/harvest/ through the /intake method, in parallel and in bulk: admit only sources that map to a measured live gap, mine a batch with scoped subagent miners, land what survives the intake discipline, then prove or refute the landing's impact with an A/B evaluation on a connected project. The loop that turns 100+ queued URLs into corpus mastery without turning the corpus into a feed. Use when the queue has rows and nobody is hand-feeding /intake links."
category: ai-native
memory: project
version: 0.1.0
tags: research, queue, batch, orchestration, evaluation, ab-test, cross-repo
---

# Harvest

The registry's content engines each have a mouth. `/forge` eats a repository.
`/deepen` eats a research question. `/intake` eats one link a human happened to bring.
**This skill is the feeder and the loop**: it owns the queue at
[`librarian/harvest/`](../../../librarian/harvest/index.md), decides which rows are
worth a mining round *right now*, runs several `/intake`-method rounds in parallel,
and then does the thing none of the engines do - **checks whether the landing
mattered**, against a real connected project, before the next pass spends anything.

This skill writes no content doctrine of its own. The mining method is `/intake`'s -
its source classes, its strip test, its five outcomes, its ledger. If a rule here
ever disagrees with [`intake/SKILL.md`](../intake/SKILL.md) about how a single source
is mined, intake wins and this file has a bug to fix in `reflect`.

Two laws carry from intake, said out loud every session:

- **A source ORIGINATES a finding. It never AUTHORIZES one.** A queue of 177 elite
  URLs is 177 candidates, not 177 pending merges. The failure mode of a harvest loop
  is volume laundering authority.
- **Rank a run by what it produced honestly, never by document count.** A pass that
  parks six rows, lands two currency resets and one lead is a good pass. The queue
  emptying slowly is the queue working.

And one law that is this skill's own:

- **A landing is a hypothesis until a consumer moves differently because of it.**
  Intake ends at "it survived corroboration". Harvest continues to "and it changed an
  outcome in a real project" - or records that it did not, which is just as
  permanent. The evaluation lane is not optional polish; it is the difference
  between a knowledge base and a link graveyard.

## Invocation

```
/harvest                     # plan only: map queue vs live gaps, propose the next batch
/harvest run [domain]        # one attended pass: admit -> mine in parallel -> triage -> land -> evaluate
/harvest auto [domain]       # one unattended pass: only self-authorizing outcomes land (see Modes)
/harvest loop <N> [domain]   # up to N consecutive passes with the stop rule and the budget guard
/harvest evaluate            # run or settle pending A/B impact evaluations, nothing else
/harvest research            # refill: attack coverage-gaps.md with research agents, append to queue
/harvest status              # read queue + evaluations ledger, touch nothing
/harvest reflect             # update LESSONS.md and this method from recent passes
```

## Instruments - never count, never construct, never fetch by hand

```sh
node scripts/librarian-scan.mjs --json               # the live gap map: attention, owed, never-swept
node scripts/research-map.mjs "<term>" "<term>" ...  # a row's target -> prior art + where new goes
node scripts/research-ingest.mjs <url|-> --json      # inside each miner, per intake's rules
```

The scan is recomputed at the top of **every** pass and again for the report. A gap
count carried from the last pass is drift; the vault rule ("nothing here a script can
recompute") binds this skill too. `research-map` is the only way a target string in
the queue becomes a subject path - a constructed path files a landing where no
consumer walks.

## The pass

### Phase 1 - admission: the queue proposes, the scan disposes

This is the first half of the auto-evaluation, and it runs **before** any token is
spent on mining. For each `queued` row in scope:

1. Run its target terms through `research-map`. No hit and no coverage-gaps line ->
   the row aims at nothing we measure. **Park it** with one clause of reason. Parked
   is not declined - it carries no judgment about the source, only about the timing.
2. A hit -> read the subject's live state in the scan: attention points, `owed` items
   in the domain note, zero-application techniques, dry streaks, expired
   applications, and [`coverage-gaps.md`](../../../librarian/harvest/coverage-gaps.md)
   lines. The row is **admitted** only if it plausibly moves one of those needles,
   and the needle is named on the row's batch entry.
3. Say the expected yield out loud, per class, before mining (intake's calibration
   rule). A `paper aggregator` admitted at a five-point subject still mostly yields
   leads; write that down so a small landing reads as calibration, not failure.

Priority in the queue is advisory. **A pri-1 row aimed at a saturated subject loses
to a pri-3 row aimed at a bleeding one.** That is the sentence that keeps the queue's
founding grades from ossifying into a plan.

### Phase 2 - batch: one domain, four to eight rows

Batches follow intake's batch lane (read
[`source-classes.md § "The batch lane"`](../intake/references/source-classes.md)
before the first batch of a session): one domain per batch so within-batch
convergence means something, dedupe convergence by *author* not by source, 4-8 rows
so the triage table stays holdable. Mixed-class batches are fine; mixed-domain
batches waste the convergence signal.

### Phase 3 - mine in parallel: scoped miners, cap 5, top up one per completion

Dispatch one subagent miner per row. The cap is 5 concurrent (mining is heavier than
librarian's sweep workers; do not borrow its cap of 10), topped up one per
completion. Each miner's brief is scoped and self-contained:

```
You are running the /intake method (read .claude/skills/intake/SKILL.md and its
references/source-classes.md) on exactly ONE source, as one lane of a batch.
SOURCE: <url>   CLASS (queue's guess - verify at ingest): <class>
ADMITTED FOR: <the named gap: subject, attention points, owed item>
PRIOR ART: <research-map output for the row's terms, verbatim>
FETCH BUDGET: per your class's rule in source-classes.md, max 3.
RETURN, as text, and write NOTHING to disk:
  1. the class you actually found (and the halves, if hybrid)
  2. a candidate table: claim | strip-test result | corroboration status | proposed
     outcome (content/currency/lead/covered) | target subject (from PRIOR ART only)
  3. a draft source note in the librarian/sources/ format
  4. what you did NOT extract and why (the untriaged tail)
```

**Miners return proposals; only the orchestrator writes.** A miner that writes to
the tree, the ledger, or the queue is the same bug as a librarian worker outside its
folder - the single-writer rule is what makes parallelism safe in a lane where
every file is shared. Miners may read anything, fetch within budget, and must not
touch `git`.

### Phase 4 - land serially: intake's triage, harvest's bookkeeping

The orchestrator merges the miners' returns into one triage table (batch convergence
noted per intake) and triages by mode (next section). Then, serially, per decision:
land content/currency per the intake method, write each source note and its ledger
line in [`librarian/sources/`](../../../librarian/sources/index.md), flip the queue
row (`mined`, with outcome counts), strike any coverage-gaps line a landing closed,
and record untriaged candidates in the source notes' own tables - untriaged is not
declined, here exactly as in intake.

### Phase 5 - evaluate: the A/B lane

For every **content** landing (new technique, amended technique, new subject), queue
an impact evaluation per
[`references/evaluation.md`](references/evaluation.md) - the protocol in one line:
route to the connected project that declares the landing's domain (via
`.projects.local.json`), build a probe task from the technique's own `use_when`, run
arm A (consults the registry at HEAD) against arm B (consults the registry at the
pre-landing commit), judge blind, and write the verdict to
`librarian/harvest/evaluations.md` and the subject's vault note.

Run evaluations in-pass when the batch was small; otherwise leave them `pending` and
settle with `/harvest evaluate`. **A pass is not fully reported while it has
unevaluated content landings older than two passes** - that is the loop's own
honesty gate, and `status` shows the debt first.

Currency landings and leads are not evaluated - the ledger and the return condition
are their whole story.

### Phase 6 - report

Counts by outcome (small numbers reported plainly), scorecard delta (recompute the
scan; never diff against a remembered number), evaluation verdicts settled or owed,
rows parked with reasons, and the proposed next batch. In `loop` mode this report is
what the stop rule reads.

## Modes - who authorizes what

| outcome | `run` (operator present) | `auto` (nobody present) |
| --- | --- | --- |
| already covered | lands (it is only a catch) | lands |
| currency (clock reset, `refresh_by`) | lands | lands |
| lead (dated, with return condition) | lands | lands |
| content -> **existing** subject | operator triages, then lands | **banks as `--spec-only` spec** + lead; lands next attended pass |
| content -> **new** subject | operator triages; usually a `/deepen` dispatch | banks as spec, never lands |
| decline | operator declines, reason ledgered | **never auto-declined** - parked or untriaged only |

The auto column is deliberately timid. An unattended loop that can land techniques
is a bundle acquiring the queue's error rate at machine speed; an unattended loop
that can *decline* poisons the decline ledger with judgments nobody made. Auto mode
exists to burn down the cheap half of the queue (catches, currency, leads) overnight
and stack the expensive half, corroborated and speced, for a human hour.

## The loop and its stop rule

`/harvest loop N` runs passes back to back, each with the full admission phase
(the scan moves under the loop - that is the point). It stops early when either:

- two consecutive passes land nothing but leads and catches in a domain -> the
  queue's remaining rows for that domain are ahead of the corpus's ability to absorb
  them; move domains or stop, and say so in the report; or
- the budget guard trips: the session has spent its fetch or token budget, or an
  evaluation debt of 3+ content landings is outstanding. **Evaluation debt stops the
  loop before volume does.** Mining faster than you can measure impact is how the
  A/B lane silently becomes decoration.

## Refill - `/harvest research`

When the queue thins (or a domain's rows are all terminal),
[`coverage-gaps.md`](../../../librarian/harvest/coverage-gaps.md) is the shopping
list. Dispatch research agents (same cap discipline) with one gap line each, the
elite bar from `librarian/harvest/index.md`, and the standing dedupe set (ledger +
queue + watchlist). Agents return candidate rows; the orchestrator grades, dedupes
and appends. A refill that returns "no elite source exists yet" updates the gap
line's `nearest stand-in` instead - that is a finding, not a failure.

## Never

- Never construct a subject path; `research-map` is the only resolver.
- Never let a miner or research agent write to the tree; single writer, always.
- Never auto-land upper-layer content, and never auto-decline anything.
- Never count a parked row as a decline, or an untriaged candidate as either.
- Never carry a scan number, a queue count or an evaluation verdict from a previous
  pass by memory; recompute or reread.
- Never mine a URL without grepping the ledger and the queue for it first.
- Never report a pass with 3+ unevaluated content landings as complete.

## Project overlay

None required. If a repo carries `.claude/harvest.local.md`, it may pin: the default
domain scope, the loop budget (max passes, max fetches), and a preferred evaluation
project per domain overriding the `.projects.local.json` routing. The skill runs
without it.
