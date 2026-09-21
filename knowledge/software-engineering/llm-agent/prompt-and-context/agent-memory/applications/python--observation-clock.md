---
layer: application
type: application
subject: agent-memory
technique: observation-clock
stack: python
status: forged
verified_on: 2026-09-17
verified_against: python@3.10
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# An extraction prompt that states the rule, and a call path that refuses it (mem0)

Source tree: `github:mem0ai/mem0@0df3e4b8` (2026-09-16), the open-source memory library.
The stack version is the floor its `pyproject.toml` declares (`requires-python >=3.10`);
the package itself is at 2.0.20. Nothing here was executed. Every claim below is a
traced call path, and the verdict is `unmeasurable` for that reason.

## The design this tree made

In its 2.0.0 release the library replaced a two-call pipeline (extract facts, then
decide ADD, UPDATE or DELETE against retrieved neighbours) with one extraction call whose
only operation is ADD
(`docs/changelog/sdk.mdx:348 "Replaced 2-LLM-call pipeline with additive extraction"`).
A change of belief is stored beside the old one with a link, and the choice between them
moves to retrieval time. That shifts the burden onto time. Once nothing is overwritten,
the only thing that tells two contradicting memories apart is *when* each was true. So
the new extraction prompt spends its most emphatic block on the clock:

- `mem0/configs/prompts.py:526 "This is your ONLY temporal anchor for resolving time"`
  defines the Observation Date.
- `mem0/configs/prompts.py:540 "Do NOT use this to resolve temporal references in messages"`
  forbids the Current Date for grounding.
- `mem0/configs/prompts.py:635 "Convert relative → absolute using Observation Date"`
  repeats it as a quality standard.

The prompt is correct, and it states the technique's rule almost word for word.

## The call path that cannot satisfy it

- `mem0/configs/prompts.py:1012 "observation_date = current_date"`: when no observation
  date is passed, the builder uses the current date.
- `mem0/memory/main.py:952 "custom_instructions=custom_instr,"` is the last argument of
  the only synchronous call to the builder. No timestamp is passed. The asynchronous call
  at `mem0/memory/main.py:2614 "custom_instructions=custom_instr,"` is the same.
- `mem0/memory/main.py:787 "Platform-only temporal parameter. Not supported in OSS."`
  documents the public write call's `timestamp` argument, and
  `mem0/memory/main.py:818 "raise ValueError(get_temporal_feature_error_message("` refuses it.

So every prompt the open-source build sends carries an Observation Date heading and a
Current Date heading holding the same value, the wall-clock date of the write. A backfill
of a year of history grounds every "last week" to the week of the import. The read side
is gated the same way:
`mem0/memory/main.py:1421 "Platform-only temporal parameter. Not supported in OSS."`
documents the search call's `reference_date`, so a question cannot state what *now*
means either.

The prompt the rewrite replaced used the writer's clock outright, and froze it:
`mem0/configs/prompts.py:50 "Today's date is {datetime.now().strftime("` sits inside a
module-level f-string. That string is formatted once, at import, so a long-running
process kept telling the model its import date. The builder that uses it no longer has a
caller.

## What it costs, by the tree's own numbers

The hosted tier's published scores (not reproducible from this build, as
`docs/core-concepts/memory-evaluation.mdx:137 "Scores reflect Mem0's managed platform"`
discloses) put the additive design's weakest category at contradiction resolution:
`docs/core-concepts/memory-evaluation.mdx:117 "| contradiction_resolution | 35.7 | 32.5 |"`,
the 1M and 10M scales, the lowest of ten rows at 1M. These are hosted-tier numbers, which
do receive an observation date, so they price the additive design and not this defect.
They show why the defect matters. A store that never retires a belief leans on its dates,
and the open build writes one date for everything.

## Simulation (three cases from this tree)

1. **Live chat, synchronous write.** The observation and current dates really are equal.
   A: correct. B (a real observation date passed through): identical. Falsifier: a
   difference in extracted text between the arms.
2. **A history import.** Messages from months ago are written today. A: every relative
   reference grounds to the import week. B: grounded to each message's date. Falsifier: A
   producing message-dated text, which would mean the model ignored the Observation
   Date heading and inferred dates from the conversation itself.
3. **A queued write that lands after midnight.** A: "tomorrow" is off by one day. B:
   correct. Falsifier: as in case 2.

## What this realization cannot do

It cannot be fixed by editing the prompt. The prompt is already right. The fix is one
parameter threaded from the public write call to the builder, and that parameter is
currently refused as a hosted-tier feature.

Return condition: measurable with a stub model that records the rendered prompt. Call
the public write path with a message dated a year ago and assert on the Observation Date
line. No embedding or vector store needs to be real.
