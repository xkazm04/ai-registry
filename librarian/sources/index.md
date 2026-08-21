# The source ledger

Every external source [`/research`](../../skills/research/SKILL.md) has mined, one line
each, newest first. One note per run sits beside this file.

This ledger answers one question in one second: **has this been mined already?** A
re-ingested video costs a full extraction round to rediscover declines that are already
written down, and the answer to "did we look at this" is not something to reconstruct
from memory.

## What a source note holds

The candidates a source produced and what happened to each - accepted, declined with a
reason, banked as a lead with a return condition, or caught as already covered. The
declines are the most valuable part. A decline nobody wrote down gets re-proposed every
run forever, and a source class nobody characterised gets over-trusted every run
forever.

## What it never holds

A consumer's paths, repository internals, or the transcript itself. Transcripts are
run inputs; they live in a scratch directory outside the repository and are deleted
when the run ends. A note quotes an anchor, never a corpus.

## Mined

| Date | Source | Kind | Words | Extracted | Accepted | Leads | Caught | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| - | - | - | - | - | - | - | - | nothing mined yet |

## Source classes, and what each is trusted for

Written from what runs actually observe, never assumed up front. A class earns a line
here after it has been seen twice, with the incident that taught it.

| Class | Reliable for | Not reliable for |
| --- | --- | --- |
| Mixed AI-news roundup | That the world moved: a release happened, a price changed, a benchmark was published. | Why it matters, whether it is true, whether it is new. Its claims are second-hand by construction. |
