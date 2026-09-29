---
source: youtube:2nc_QMuNp18
kind: video
url: https://www.youtube.com/watch?v=2nc_QMuNp18
title: Seven uses of a decision-only model inside coding-agent workflows (title's product name mangled by the caption track)
author: AI LABS
words: 2834
extracted: 11
accepted: 1
declined: 0
leads: 1
already_covered: 7
untriaged: 2
dispatched: 0
applied: 1
shipped: 0
run_id: in-2nc-0929
siblings: 0
fetches: 1
---

# A default the harness moved under the skills' feet

**Class:** first-party practitioner account in demo form, with a sponsor segment (roughly
00:06:47-00:07:38, an ad for an integration platform, not a candidate) and a community upsell at the
end. The team built seven hooks and skills around a hosted model that does not write text: it picks
from a given set of options and returns a confidence with the pick. The caption track renders the
product's name as an unrelated word throughout, so the name is not recorded here and nothing below
depends on it.

**Expected yield, said before the table:** low. A demo half shows the solution and hides the
boundary, and this one reports no false-positive rate, no accuracy and no cost figure for any of the
seven builds; its only measurements are latency (under a second for the compaction, 1.6 s to rank 35
files) and one test per build. Most of it was expected to be catches. The corpus already owns
the shape of most of these.

**Siblings live at start:** 0. **Focus carried in from the last scorecard row:** spend the promotion
read on every row whose only blocker is an un-re-checked worker report. This run used no workers for
extraction, so no row carried that blocker; every verification was a director read. The focus did
not apply, and that is the result.

## Triage

| # | Lane | Shape | Eff | Candidate | Prior art | Impact | G/R/C | Read | Outcome |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | Block an edit when the classifier is at least 80% sure a rule is broken (00:11:26-00:11:52) | `generator-uncertainty-scoring`, `enforcement-demotion` | none | - | likely catch | **catch**: "a threshold is an absolute-level claim wearing a small number"; a model-backed hook's false-negative rate is silently promised zero |
| 2 | K | technique | M | Cheap yes/no screen before review; all "no" gets one quick round, any "yes" or "unsure" gets the full one (00:09:20-00:09:45) | `screen-then-confirm-detection` | none | - | likely catch | **catch**: a screen biased so that a positive never escapes, real work scoped to what it flagged |
| 3 | K | technique | S | Ask a model whether each documented rule has a test (00:05:04-00:05:31) | `rule-registry-enumerated-fixtures`, law `coverage-is-counted-not-claimed` | none | - | likely catch | **catch**: the corpus enumerates from the registry; a model's "has a test" is a claim, not a count |
| 4 | S | technique | M | A prompt-time skill picker that reads names and descriptions and returns one skill or none (00:05:56-00:06:47) | none in the corpus | new-technique | 2/2/2 | real gap? | **untriaged** (V2: no primary, no convergence, no tree) |
| 5 | K | technique | M | Replace the compaction summary with importance decisions; engage only above 25% of the window (00:03:22-00:04:39) | `compaction-horizon-breakeven`, `amortized-compaction-cadence`, `summary-evidence-gate` | none | - | likely catch | **catch** |
| 6 | K | technique | S | Keyword prefilter, then a model scores candidates 20 at a time, open only the top few (00:08:03-00:08:54) | `second-pass-rescoring` | none | - | likely catch | **catch**: also bounds how many candidates the expensive scorer sees |
| 7 | K | technique | M | Enumerate every link and button, let a model pick the next click, and check each role reaches only its allowed pages (00:10:10-00:11:00) | `verification-inherits-driver-reach`; nothing on forced navigation | new-technique | 2/2/2 | partial | **untriaged**: promoting question executed (below), did not promote |
| 8 | T | currency | S | The built-in Explore subagent used to run on the small tier and now runs on the session's model (00:08:03-00:08:29) | no application says either | dates-application | admitted under the corroboration table | verified | **landed**: see below |
| 9 | K | technique | S | A hook runs every time, an instruction file is followed "most of the time but not every time" (00:11:26) | `enforcement-demotion` | none | - | likely catch | **catch** |
| 10 | T | lead | S | A decision model answers all questions at once, so it is fast, and the output tokens are free (00:00:50-00:01:52) | none | none | - | thin | **lead** |
| 11 | K | technique | S | The agent that built the change must not judge it (00:05:04, 00:09:20) | `no-gate-self-certifies`, `heterogeneous-model-panels` | none | - | likely catch | **catch** |

`auto=0/2/0 fp=0` for the scored upper-layer rows (4 and 7, both below +2 and vetoed or unearned);
rows 1-3, 5, 6, 9, 11 are catches and were never scored; row 8 ran under the corroboration table
(a currency signal is a statement about the world), and row 10 under the same table as a lead.

## The one row that landed, and why it is not the row the video was about

Row 8 is a currency signal, and it was verified against the primary rather than the video: the
maintainer's changelog, fetched verbatim (fetch 1 of 3). Release 2.1.198, published 2026-07-01,
says the built-in search agent "now inherits the main session's model (capped at opus) instead of
running on haiku". The video says the same thing in a garbled sentence (an Opus session's search agent runs on Opus),
which the changelog confirms; what the video omits is the ceiling, which only matters to a session
on a tier above it.

No knowledge document says anything about that default, so no clock reset was owed. **The seam hunt
found it anyway, in this registry's own tree**: two workflow skills described their scouts as
"cheap" and "Explore-tier" while pinning their builders by name, and a third skill's lesson
(2026-09-01, after the change) recorded a fan-out of Explore agents as a speed and yield result
without saying which model the scouts ran on, so that measurement's tier is unknown.
That is an unclassified call in the sense `turn-classification` states, and its own text predicts
the event: "defaulting expensive converts every future omission into invisible spend".

Applied at mode `experiment`, one brief, three arms, two runs each (full table in the application):
the floor held in all six runs, and the target depends on the session's tier. Verdict `better`
for an enumerate-the-sites brief; `unmeasurable` for a tracing brief, which the two skills mostly
send. Landed as an application of `turn-classification` and a patch-version wording correction in
both skills, with lessons recorded against the versions that carried the premise. **A seam chosen to
falsify:** the pin could have lost on the floor and did not; it lost on latency and on a depth the
brief did not ask for, which is the part of the result worth having.

## The promoting question for row 7, executed

*Does anything in the corpus say a negative access claim ("this role cannot reach that page") needs a
request aimed at the forbidden target rather than a crawl from the front door?* One grep over
`software-engineering` for forced navigation, direct navigation and link crawl: zero hits.
`verification-inherits-driver-reach` states the general rule (a verifier certifies only what drove
it) and is the nearest owner; the authorization golden path has no testing stance at all. The row
stays untriaged, not declined: the rule the row would carry is the general one already written, and
what is new is one instance of it whose corroboration would be a fetched primary or a tree that grows
the check.

## Untriaged and leads, with return conditions

- **Prompt-time skill picker (row 4).** A router that reads the same names and descriptions the
  agent already reads adds no information; what it can change is where the decision is made and how
  much of the main context it costs, and the video reports no accuracy for it. Return when a labelled
  prompt set exists (prompt, the skill a reviewer says fits) and a paired run compares the picker's
  choice with the harness's own; a local model returning a single-token yes/no is enough to build the
  arm. Anchors 00:05:56-00:06:47.
- **Role reachability by goal-directed crawl (row 7).** Return when a fleet project with role-gated
  routes grows a negative-reach test, or when a fetched primary on forced browsing lets the general
  rule carry an application. Anchors 00:10:10-00:11:00.
- **Decision-model product claims (row 10).** Speed, "output is free", non-generative. All
  vendor-side, none measured in the video, and the caption track hides the product's name. Return when
  the vendor's own documentation is read verbatim.
- **Not a lead, a hygiene note found by the experiment's scouts:** the recipes checker
  re-declares the child-directory cap instead of importing the shared constant, two authorities for
  one number (`one-authority-per-vocabulary`). Both scripts are in this registry, so it is a fix
  waiting for someone who owns that lane, not corpus material.

## Directions and fleet

`directions=n/a` (a video has no design record). No fleet project was touched: the seam was the
registry's own skills, so `ship` for the fleet is 0 by construction. The change to the two skills is
registry content, committed direct to `main`, not pushed.

## Runs owed

`rescan_when` is not required (not a repository source).
