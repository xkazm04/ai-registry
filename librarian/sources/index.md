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
| 2026-08-23 | `youtube:NUK_TBz46dM` - "Turn Claude Into A Web Design Genius in 3 Steps" | practitioner-deep-dive (technique demo) | 4037 | 6 | 1 | 0 | 5 | [[2026-08-23-seedance-web-design]] - mined under `/deepen`; one technique on `review-iteration-loops`, five catches, one corpus contradiction |
| 2026-08-22 | `repo:onecli/onecli` @ ff7a192 | practitioner-codebase | n/a | 10 | 7 | 0 | 3 | [[2026-08-22-onecli-repo]] - three new techniques, two amendments, two applications |
| 2026-08-22 | `web:linear.app/data` - "How teams build (Edition 01)" | vendor-telemetry-report | 4613 | 7 | 0 | 0 | 0 | [[2026-08-22-linear-how-teams-build]] - none picked; class characterised, 7 untriaged |
| 2026-08-22 | `web:pinglin.tw` - "The Shapes of Agent Memory" | first-party-empirical-study | 13767 | 12 | 6 | 1 | 2 | [[2026-08-22-shapes-of-agent-memory]] - five amendments across agent-memory + eval-harness |
| 2026-08-22 | `youtube:bxp4G-oJATM` - "Difficulty in Video Games" | designer-talk | 2332 | 6 | 5 | 0 | 0 | [[2026-08-22-game-difficulty]] - landed on `research/game-difficulty` + cross-repo |
| 2026-08-22 | `youtube:3MP8D-mdheA` - "How To De-Slop A Codebase Ruined By AI" | practitioner-deep-dive (technique demo) | 2456 | 6 | 0 (+1 dispatched) | 0 | 1 | [[2026-08-22-de-slop-a-codebase]] |
| 2026-08-22 | `youtube:gaDdrDdczO4` - "New Skills! v1.2..." | practitioner-deep-dive (skill-library release) | 2514 | 10 | 5 | 0 | 2 | [[2026-08-22-skills-v1-2-release]] |
| 2026-08-22 | `youtube:u8Im0l_vwqM` - "Inside DeepWiki: How Cognition Builds Wikis for Devin at Scale" | practitioner-deep-dive | 2974 | 10 | 2 (+1 proposed) | 0 | 1 | [[2026-08-22-inside-deepwiki]] |
| 2026-08-22 | `youtube:NC4h5kWH_-A` - "AI News: The AI Agent Race Just Exploded" | mixed-ai-news-roundup | 6958 | 10 | 4 | 1 | 2 | [[2026-08-22-ai-agent-race-exploded]] |
| 2026-08-21 | `youtube:EfGF7QbJItA` - "AI News: The Best Open Model Runs on Your Computer!" | mixed-ai-news-roundup | 6507 | 12 | 1 | 0 | 0 | [[2026-08-21-ai-news-open-model-local]] |

## Source classes, and what each is trusted for

Written from what runs actually observe, never assumed up front. A class earns a line
here after it has been seen twice, with the incident that taught it.

| Class | Reliable for | Not reliable for |
| --- | --- | --- |
| Designer talk (domain craft, no tooling) | The STRUCTURE of a domain's received wisdom - the decomposition, the named hazards, the shapes practitioners converge on. | Whether any particular studio's version is best, and anything about software. Its findings never route to `software-engineering`; they route to a domain bundle, which may not be on the branch you are standing on. |
| First-party practitioner deep-dive | What they built, what they measured, and what changed when they changed it. Facts about one system, from the person who changed it - no corroboration lane improves on that. | What works in GENERAL. The sample is one pipeline at one company, so a measured result is an existence proof, not a distribution. |
| Mixed AI-news roundup | That the world moved: a release happened, a price changed, a benchmark was published. | Why it matters, whether it is true, whether it is new. Its claims are second-hand by construction. |

**Designer talk, first observation (2026-08-22).** A teacher explaining an established
body of practice - neither second-hand survey nor first-party account. The class has one
defining property for this registry: **it has a placement problem before it has a content
problem.** Its natural home was a bundle living on a different branch, which the mapping
instrument cannot see, so the instrument reported "no prior art" for a topic a sibling
branch covers in two subjects. The corpus is bigger than any one branch and the tooling
does not know it.

**First-party practitioner deep-dive, second observation (2026-08-22) - the row is
earned, and one sub-class is worth seeking out.** Both observations confirmed the split:
authoritative about what they built, silent on generality. The sub-class that outperformed
is the **release walkthrough** - a library author going through one version's changes.
It is organised around CHANGES, and a change carries its own motivation, so the author
states the failure mode out loud because it is the reason the release exists. Three of
five accepted findings came from that structure rather than from the feature described.
A feature demo shows the solution and hides the problem; a release walkthrough shows both.

Also confirmed across both: no corroboration fetch was needed in either run. The 3-fetch
budget binds on second-hand surveys and never on this class.

**First-party practitioner deep-dive, third observation (2026-08-23) - the failure mode
finally showed itself, and the yield profile against a MATURE bundle is different.** The
first two observations inferred the class's weakness from its structure; this one caught
it in the act. A device rule ("if it is a mobile user, serve the still instead of the
video") was stated with total confidence and is the named wrong answer in a subject the
corpus already carries, which requires the page's own measured frame cost rather than a
declaration the device makes about itself. That is precisely the shape the row predicts:
a general recommendation inferred from one system where it happened to work.

The yield profile is the other half. Five of six candidates were already covered - and in
four of those the corpus was not tied but strictly better hedged, holding the same rule
*with its condition attached* (a rights rule, a four-rung ladder, a measurement instead of
a guess). Against a mature bundle this class should be expected to produce catches, not
content, and **a catch is worth recording with the hedge that beat it**, because the hedge
is the reusable argument for the layer contract. Fetch budget was touched for the first
time in this class - not to corroborate what the practitioner did, which still needs no
lane, but to check a claim they made about generation in general.

**Cross-class, second sighting: the candidate a source explains badly is the one worth
the budget.** The 2026-08-21 roundup named a real gap and inverted the rule for filling
it; this practitioner named a real gap (no divergence phase before the review loop) and
inverted its mechanism, calling for more amplitude where the literature says amplitude is
the lever measured not to work. Both runs' single accepted finding came from their single
badly-explained candidate, while every correctly-stated claim was already owned. The
provisional reading, one sighting short of a rule: **a claim a source gets right is a
claim the corpus probably already has**, so the corroboration budget belongs on the
claims that sound wrong rather than on the ones that sound right.

**First-party practitioner deep-dive, first observation (2026-08-22).** Its authority
maps onto the layer contract almost exactly: strong evidence for the SHAPE of a
technique, weak evidence for its universality. So its claims land well as decision rules
with their conditions attached and badly as unqualified assertions - which is a
different editing job from the roundups, not merely a higher trust level. Yield differed
in kind as well as degree: a coherent account of one problem maps onto one region of the
corpus, so the run produced two techniques and a subject proposal rather than findings
scattered across six subjects. At 2,974 words it outproduced a 6,958-word roundup, which
is the first evidence that transcript length is not a yield proxy.

**Mixed AI-news roundup, second observation (2026-08-22) - the class row is now
earned.** Two runs, same channel, and the pattern held in both directions. The class
located four real gaps and was *wrong* about two things the corpus has measured (the
precision-tier rule in run 1, the throughput-buys-thinking claim in run 2), plus a third
it got backwards on agent identity. Yield is not a property of the class but of where
its segments happen to land: run 1 hit model and media subjects and produced one
finding, run 2 hit `llm-agent` and produced four.

The second observation adds something the first could not show: **the class becomes
authoritative in aggregate.** Two independent vendors across two runs shipped the same
"observed repetition becomes a named skill" feature, which met the upper-layer
corroboration bar with no web fetch at all. That only worked because run 1 wrote down
its untriaged candidates - a vocabulary with only "declined" in it would have lost the
first half of the pair.

**Mixed AI-news roundup, first observation (2026-08-21).** The class did exactly what the
row predicts. The one segment that reached a landed finding named a real hole in the
corpus and stated the rule backwards - the primary literature says the compression
*format* dominates the nominal bit count, while the source said take the highest number
that fits. Originating a finding and authorizing one are different acts, and this class
can only do the first. Not yet a rule; one observation.
