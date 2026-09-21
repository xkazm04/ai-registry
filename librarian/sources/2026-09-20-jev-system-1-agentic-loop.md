---
source: jev-system-1-agentic-loop
kind: second-hand practitioner review
url: https://www.youtube.com/watch?v=ScvXFi4MUSc
title: "Jev + Claude Code = The Cheapest Agentic Coding Loop Yet"
author: Ray Amjad
words: 6358
extracted: 13
accepted: 1
declined: 0
leads: 4
already_covered: 5
untriaged: 2
currency: 1
dispatched: 0
applied: 1
shipped: 0
run_id: intake-scvxf-0920
siblings: 3
---

# Jev + Claude Code: the cheapest agentic coding loop yet

**Class: second-hand practitioner review**, with a large speculative half. A
creator demoing a third party's model release. Expected yield for the class is
low — *that it shipped*, plus leads — and that is what this run returned, with one
exception the class predicts precisely: the demo's proudest segment is where its
boundary is missing, and the segment this video is proudest of turned out to be
arithmetically inverted.

Most of the video is explicitly future tense — "I will be trying this myself over
the coming week", "random idea that I just had on the spot", "what if Jev could".
Under the prediction-report rule those yield nothing. The creator actually ran
three things: a comment-classification pass (150 comments, 9.3s, ~1 cent,
extrapolated by the agent to 57 cents for the codebase), a game-playing demo, and
a cost estimate produced by an agent rather than measured (28M input tokens,
$1.19).

**Siblings.** Three runs were live on the board at Phase 1
(`intake-uhelj-0920`, `intake-ltcwn-0920`, `intake-qw2ns-0920`), all on other
videos, all at phase 0–2, none holding a subject this run touched. The board was
re-checked clear immediately before the write.

**Fetch budget: 0 of 3 spent.** The one row that landed was corroborated
corpus-internally and by training-data convergence on prefix-cache mechanics — the
source never mentions caching at all, which is why its arithmetic is wrong. The
rows that would have needed the fetch are all leads, and the fetch is not owed to
a lead.

## Triage table

Rows targeting the upper layers were scored (v2.5). The currency row and the leads
were admitted under the corroboration table, which lets a source authorize both
alone.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | amendment | M | Price a standing catalog at the cache read price | se/llm-agent/mcp-tools | new-technique | real gap | 2/0/2 | **accept** |
| 2 | K | lead | S | A selector cuts wrong-capability loads 17% → 7.3% | se/llm-agent/mcp-tools | none | thin | — | lead |
| 3 | K | catch | — | Purpose-built closed-label decision model as a scorer rung | llm-obs/generator-uncertainty-scoring | none | likely catch | — | already covered |
| 4 | K | catch | — | Auto-act above a fixed probability threshold | llm-obs/generator-uncertainty-scoring | none | likely catch | — | already covered |
| 5 | K | catch | — | 255-option cap forces two-stage ranking | llm-obs/generator-uncertainty-scoring | none | likely catch | — | already covered |
| 6 | K | catch | — | A none-of-the-above label in the answer set | llm-obs/generator-uncertainty-scoring | none | likely catch | — | already covered |
| 7 | K | catch | — | Route a refused category to a model that takes it | media-gen/generative-provider-routing | none | likely catch | — | already covered |
| 8 | T | currency | S | A constrained-output "fast decision" model class shipped | — | resets-clock | real | — | accept (table) |
| 9 | K | lead | M | Two-tier control loop with explicit re-plan triggers | se/llm-agent/orchestration | none | partial | — | lead |
| 10 | K | lead | M | Massively parallel adversarial browser testing per release | se/quality-gates | none | thin | — | lead |
| 11 | K | lead | S | Tokens cheap, sandbox compute now the limiting cost | se/llm-agent/evaluation-and-cost | none | thin | — | lead |
| 12 | K | untriaged | M | Natural-language predicates as a per-PR qualitative gate | se/quality-gates, loc/copy-quality-gates | none | partial | — | untriaged |
| 13 | K | untriaged | M | The slow model rewrites the fast model's criteria from outcomes | se/agent-memory | none | partial | — | untriaged |

### Row 1 — the accepted row, and how it scored

Initial score was 2/1/2, which does not clear the +2 threshold: the `+1` on RISK
was a contested home between `mcp-tools/catalog-projection-modes` (which owns
projection-mode selection) and `agent-instruction-files/line-earning` (which owns
the price of an always-loaded line). The **promotion read** resolved it with two
file reads: `line-earning` governs whether a line is *admitted*, not the *cadence*
at which a catalog is projected, and `session-scoped-capability` governs who a
capability belongs to, not what it costs. Home resolved, RISK dropped to 0, and
`2 − 0 = 2` accepts with `GAIN 2 ≥ COST 2`.

GAIN is 2 rather than 1 because the amendment **inverts** the target file's stated
rule inside a lane the file did not reach. The file says a projection's resolution
is chosen "by an operator flag at startup — never per request", for two reasons
that are both about an MCP listing cache and incident reproducibility. The new
lane — a description-only catalog whose budget is the *model's prefix cache*
rather than a host's tool ceiling — admits a per-request projection under one
placement condition, and forbids it under the other for a quantitative reason the
file did not have.

### The source located the question and got the answer inverted

This is the run's finding and it is the class's signature failure. The video's
headline proposal is to gate a capability catalog behind a classifier and "remove
about 10,000 tokens from my context window". The token count is right — measured
on this machine, 70 capability packages publish 40,003 characters, about **10,001
tokens**. The economics are inverted, because the source counts those tokens at
face value and they are not sold at face value:

- a standing catalog sits in the cached prefix, so it is charged at the cache's
  **read** multiplier every turn after the first. Removing it saves `r × listing`.
  At a read multiplier around a tenth, the prize is a tenth of the number quoted;
- a listing that varies per request is volatile at its own offset, so everything
  downstream is rewritten at the **write** multiplier every turn. Both terms are
  per-request, so there is no horizon over which it repays.

Swept over `prompt` 20k–400k, `r` 0.05–1.0 and `w` 1.0–2.0, the in-place variant
won in exactly one regime: `r = 1`, no prefix cache at all. That corner is the
discriminator, and it means the source's arithmetic is not merely wrong — it is
**correct in the uncached case and inverted in the cached one**, which is the more
useful thing to have written down.

### Already covered, and covered better

Rows 3–6 all collapse into `llm-observability/quality-scoring/generator-uncertainty-scoring`,
forged 2026-09-18 — two days before this source was mined. Its technique
`stated-distribution-over-closed-labels` anticipates this model class explicitly in
its closing paragraph: *"where a purpose-built decision model returns a native
distribution, this technique's rules still govern what the caller does with it —
the threshold in code, the gated destructive labels, the disjoint fit — but its
calibration is that model's claim to prove on the caller's own cases."*

The video's central operating rule — "if the probability is greater than like
85–90%, then automatically reject the invoice" — is refuted point for point by
that subject: a threshold is an absolute-level claim wearing a small number, the
measured expected calibration error of a raw confidence was 0.428 before fitting
and 0.031 after, and destructive labels are the ones that get gated. The video
even supplies its own corroboration for the corpus without noticing: it reports the
score moving 85% → 94% when the criteria text changed, and varying "about 2–3%"
between identical runs, which is precisely why a fixed cutoff near the mode is not
a decision rule. The 255-option cap corroborates the cardinality wall; the
"human review" option corroborates the none-of-the-above rule.

## Leads

- **A capability selector cuts wrong-capability loads from 17% to 7.3%** at a
  182-item catalog, on a small model. Relayed from a vendor cookbook via a video,
  so it is a relay of a vendor's own benchmark and cannot corroborate anything —
  and the corpus's own rule says a vendor benchmark whose reference labels come
  from models measures agreement with those models. *Return condition:* when a
  selector is measured against this registry's own capability set, which is the
  same measurement the accepted row's application names as its return condition.
- **A two-tier control loop with an explicit re-plan trigger policy** — the slow
  tier re-plans on a timer (two minutes) *and* on setbacks *and* on milestones,
  while the fast tier picks from an enumerated action set. The trigger policy is
  the part worth having; the demo is a game and proves nothing. *Return
  condition:* when a fleet project runs a two-tier loop whose re-plan cadence is
  a tunable.
- **Massively parallel adversarial browser testing per release**, at pennies.
  Second-hand from a tweet, no protocol, no defect yield reported. *Return
  condition:* when a first-party account reports what share of the defects it
  found were real.
- **The limiting cost inverts from tokens to sandbox compute.** Stated by a
  creator who sells a sandboxing service, immediately after stating it. *Return
  condition:* when a fleet project's own cost ledger shows compute outgrowing
  tokens.

## Untriaged

Nobody verified these. Recorded with anchors so a later run does not re-derive
them.

| Candidate | Anchor | Why it stopped here |
| --- | --- | --- |
| Natural-language predicates as a per-PR qualitative gate ("does the name describe everything this function does, including side effects?"; classify a logged value as secret / financial / PII and fail or warn accordingly) | `[00:19:49]`–`[00:20:18]` | Reads `partial` against `quality-gates` and `localization/copy-quality-gates`, and this fleet already runs a prose-quality gate at pre-push on eight projects, which is the same shape. Needs one read of `layered-mechanical-gate` to settle whether the classifier rung is new or is that technique's existing bottom rung. |
| The slow model rewrites the fast model's criteria from recorded decisions and outcomes | `[00:09:01]`, `[00:22:04]` | Reads `partial` against `agent-memory/self-trained-capture-filter` and `judge-calibration-and-drift/scheduled-recalibration`. Probably a catch; the promoting question is whether any existing technique closes the loop on *criteria text* rather than on weights or thresholds. |

## Currency

A model class whose output is a probability distribution over a caller-declared
answer set, rather than text, is now commercially available behind a waitlist,
with sub-100ms responses claimed, a 255-entry answer-set cap and an 11-point
ordinal cap. This dates nothing in the corpus by itself — `scorer-cost-class`
already describes a judge as "a separate metered call to a second model", and a
cheap judge is still a judge — but it is the first sighting of the class as a
product and the second sighting will matter. No clock was reset.

## What this run did not do

- No fetch was spent, so every vendor number in this note is relayed and is
  labelled as such. The 17% → 7.3% figure in particular is the single number that
  would most change the accepted row's floor, and it was not reproduced.
- Rows 12 and 13 were left untriaged rather than declined. Nobody looked; they
  carry no judgment.
