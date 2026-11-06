# Pre-research: from a list to a plan

Mining one video at a time pays a full run for what a neighbour already said, and for what a
newer video has outdated. So the list is read as a whole before any mining token is spent.

## The input

`.ai/.youtube-intake.local.md`, gitignored because of the leading dot. **`.ai/youtube-queue.local.md`
would NOT be ignored**: the dot is what protects it.

```
https://www.youtube.com/watch?v=VIDEOID   # optional note
https://www.youtube.com/playlist?list=PLAYLISTID
- https://youtu.be/VIDEOID                # struck: do not mine
```

The operator owns this file and the shift never rewrites it. Channel URLs are refused rather than
flooding the queue.

## When

`shift-queue next` includes a `pre-research` action when more than 5 videos are unplanned or the
oldest is over 24 h, with no draft plan waiting and no live planner. `/shift plan` forces it.

## The steps

```sh
node scripts/shift-plan.mjs sync          # expand playlists, park mined and struck ids
node scripts/shift-plan.mjs meta          # >= 8 s apart: date, duration, channel, description
node scripts/shift-plan.mjs transcripts   # serial, via research-ingest; failures do not block
node scripts/shift-plan.mjs brief         # writes plans/<planId>/input.json
```

Run these as background commands: a long list takes hours, and that is correct. Dedupe is the union
of `librarian/sources/index.md` and the frontmatter of `librarian/sources/*.md`, because the index
alone misses ids.

## The planner seat

One seat, recorded as `seat planner --key plan:new`, one `input.json`, writing
`plans/<planId>/plan.json`. Its brief:

1. **Group by decision, not by subject words.** A cluster is the set of videos a single batch run
   would read together: they could converge on or contradict one rule. Aim for 2-8 videos. A lone
   video stays a cluster of one; do not pad it.
2. **Map each theme** with `node scripts/research-map.mjs "<term>" ... --prose --top 40`, and read
   the whole result: an absence off a capped output is not evidence. Map on concepts, never on
   proper nouns, which return empty by construction. `homes[]` takes each hit's `file` verbatim.
3. **Mark what is superseded, with evidence.** Superseded means a newer video in this list, or a
   primary source, makes this one's claim stale: same tool at a newer major version, a method its
   own author replaced, a release the corpus already dates later. An old video is not superseded
   for being old, and a first-party account of a failure rarely ages. Name `by` and `reason`.
   Uncertain stays in the cluster.
4. **Read the class** per [`source-classes.md`](../../intake/references/source-classes.md) and say
   the expected yield honestly in `yield`. A cluster of second-hand surveys yields leads.
5. **Name `gpuProofs[]`**: which media or game findings would owe a local example. Each will need
   a held row. Check models on disk first, because the shift never downloads a model.
6. `voices` is the distinct channel count of the non-superseded videos. `validate` refuses a
   mismatch, because three videos from one creator are one voice.
7. `estSeats` counts the cluster's miners plus its one lander, so the operator can weigh the plan
   against `maxSeatsPerDay`.

The planner writes nothing else, and reaches no web. A fetch belongs to the cluster that earned it.

## The gate

```sh
node scripts/shift-plan.mjs validate .ai/shift/plans/<planId>/plan.json
node scripts/shift-plan.mjs render <planId>
```

Notify the operator of `plans/<planId>/index.html`; `/shift decisions` asks. **Every plan waits for
approval**; there is no timeout that proceeds. Only that plan's videos wait: **a waiting plan blocks
nothing else**, not mining of approved clusters, proofs or filler. New videos arriving meanwhile wait for the next plan: an approved plan never changes
under the operator.

`approve` marks videos `approved`, parks a struck cluster as `operator-struck-cluster`, and parks a
superseded video as `superseded by <id>: <reason>`. **Parked is not declined.** It carries no
judgement on the source, and the row returns if the operator removes the strike.
