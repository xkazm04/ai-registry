---
layer: application
type: application
subject: agent-memory
technique: exposure-is-not-credit
stack: python
status: forged
verified_on: 2026-10-15
verified_against: python@3
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# Credit replayed over a year of recorded contexts: exposure confirmed, the repair missed its floor

This tree's memory harness replays a fabricated year against pluggable memory designs.
One arm, a self-hosted memory service, recorded every probe's context at its own
instant, so a year of real delivered sets, each with a graded answer and a known gold
value, exists on disk without a model call. That is the data a feedback-driven memory
would learn from, and the harness itself cannot run such a memory: its task outcomes
are drawn when the scenario is generated, independent of what was recalled, and its
adapter contract forbids feedback on recall.

The Python version is witnessed by the harness being invoked as `py`; nothing pins a
minor version, so `python@3` is what the tree supports.

## The instrument

`evals/memory-year/memory_year/checks/exposure_credit.py` (commit `d9343ca762`) replays
each probe's delivered items and verdict through four attribution rules, scores them
with a 90-day half-life and a 4x harm weight, and compares the result against ground
truth neither rule sees: whether the item carried the probe's gold value (or covered
its procedure or fix). The source tree's rule is arm A:

evals/memory-year/memory_year/checks/exposure_credit.py:87 "if ok: A[it].append"
evals/memory-year/memory_year/checks/exposure_credit.py:88 "elif len(D) <= BLAST:"

and use credit is arm B:

evals/memory-year/memory_year/checks/exposure_credit.py:91 "used = len((toks(it) - qt) & at) >= 2"

It asserts itself first, on a planted always-delivered item that must reach the proven
class under A and must not under B.

## Arm A and arm B

**Target:** the share of the top 25 items by credit that ever carried an answer, and the
share of proven items that never did. **Floor:** useful items pushed below neutral may
exceed arm A's count by at most two. The rule was written after a first look over an
incomplete ground truth that left procedure and fix probes out, and the script says so:

evals/memory-year/memory_year/checks/exposure_credit.py:31 "floor F   = useful items scored below neutral"

Two read modes of the same store, 194 probes each, 59 to 100 items per context, answers
graded correct at 0.92 and 0.90:

| | A: session verdict, blame gated | C: session verdict, symmetric | B: use credit | D: use credit, no blame (post hoc) |
| --- | --- | --- | --- | --- |
| rank corr. with delivery count | 0.82 / 0.81 | 0.39 / 0.29 | 0.30 / 0.23 | 0.30 / 0.28 |
| rank corr. with carrying an answer | 0.06 / 0.05 | 0.03 / -0.03 | 0.30 / 0.26 | 0.30 / 0.30 |
| proven, never carried an answer | 25 of 36 / 23 of 33 | 25 of 29 / 23 of 26 | 0 of 0 | 0 of 0 |
| top 25 that carried an answer | 0.36 / 0.32 | 0.08 / 0.16 | 0.92 / 0.96 | 0.96 / 0.96 |
| useful items below neutral | 0 / 0 | 44 / 69 | 7 / 11 | 0 / 0 |
| useful items with positive credit | 228 / 227 of 228 | 184 / 159 | 122 / 114 | 128 / 125 |

**Verdict: not-better.** The target moved by a wide margin and the floor fell: blame
through use pushed 7 and 11 useful items below neutral, past the tolerance of two. Read
one by one, the 18 were: 5 records carrying both the old and the new value, blamed when
the reader picked the old one; 9 procedures, fixes or failure causes the answer applied
and that were still graded wrong; and 4 single values that had since changed, the
only case where the item itself misled. Arm D removes blame through use and holds the floor
at the same precision, but it was built after B's result on the same data, so it is the
next test, not this one's answer.

## What the seam was chosen to falsify

A relevance retriever had already chosen every context, so the delivered sets were
mostly on topic: if a session verdict could ever track usefulness, it was here. It did
not. Arm C was added to falsify the cheaper reading - that the source's asymmetric
guard on blame, not the attribution unit, causes the drift - and it made things worse,
so the unit is the cause. The finding the technique rests on held; the repair the
technique first prescribed did not, and the blame-through-use section was written from
that miss. The first draft of that section said every blamed item was a two-value
record; reading the eighteen rows showed five, and the section now says what they were.

## What this realization cannot do

It measures attribution over contexts recorded without feedback, so it cannot show the
loop: in a live store, credit would raise rank and rank would raise delivery, and these
numbers are the first turn of that loop only. Ground truth is a string match of the gold
value, which credits an item that mentions the value in passing and misses one that
implies it. Use is a token-overlap test against the answer. Both arms share both
proxies, so the comparison is fair and the absolute numbers are not. The next
measurement needs the harness to draw task outcomes from what was recalled.
