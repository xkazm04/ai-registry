---
layer: application
type: application
subject: answer-engine-visibility
technique: informational-as-linking-fuel-not-traffic
stack: prompt-pipeline
status: forged
verified_on: 2026-10-14
refresh_by: 2027-01-14
verified_against: prompt-pipeline@2026.10.14
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Prompt pipeline: a brief generator that justified every page by its search volume

An advertising workspace turns a topic, a keyword and a few keyword-planner rows into a content
brief that an editor then commissions. The brief's system prompt told the model to prefer
high-volume, low-competition topics and to explain its choice in a short rationale. Nothing
asked what the page was for. For a query the engines answer in a box, that is the traffic
play the technique says not to brief: the page has no stated job, and its stated reason is a
number that no longer converts to clicks at the old rate.

## What was tested

Seam chosen to falsify "the brief already justifies pages sensibly": three Czech blog
briefs (a food shop, a running-shoe shop, a building firm holding its own price-per-square-metre
data), each with a brand block listing the money categories. Same real system prompt, then the
same prompt plus three rules: the rationale opens with a one-line job drawn from a closed list
(covers a sub-question for a named buying section, carries data only the firm holds, or keeps
an already-ranking page liftable; otherwise "no job, do not commission"); no promise or
estimate of visits or clicks; internal-link anchors run down from the article into buying
pages, each worded differently from the head keyword. Two repetitions per brief per arm,
one model, same inputs.

## What came back

| Measure | Before | After |
| --- | --- | --- |
| Rationale opens with a stated page job | 0 of 6 | 6 of 6 |
| Rationale justified by search volume or ranking odds ("1 900 searches, so a high rank is realistic") | 6 of 6 | 0 of 6 |
| Title and meta within limits, five to seven sections, head keyword in the first heading | 6 of 6 | 6 of 6 |
| Four question-and-answer pairs returned | 5 of 6 | 6 of 6 |
| Internal-link anchors point down at brand categories, none repeats the head keyword | 6 of 6 | 6 of 6 |

The last row is the honest null: the existing prompt already produced downward, varied
anchors, so the linking half of the technique moved nothing. The lift is the job statement and the
retirement of the volume justification. The building firm's data page was assigned "carries
own data" in both repetitions, which is the decision rule the technique names for the one page
worth writing under a box. The "no job" outcome never fired on three briefs that all had a
real money cluster, so the refusal path is untested here.

## Limits

n is twelve generations on constructed briefs, one model that is not the one this app serves in
production, and the first run of the harness read a truncated system prompt (an argument with
newlines passed through a shell) and a second leaked the edited prompt into the before arm; both
were discarded and the pair re-run from the committed prompt. The calendar-side half of the
technique, blanking the traffic column and reporting the page on a citation scoreboard, has no
counterpart in this tree yet. Return condition: after two refresh cycles, whether commissioned
pages appear on a citation scoreboard and the money pages they feed moved.
