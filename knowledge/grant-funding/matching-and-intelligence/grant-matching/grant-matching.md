---
layer: golden-path
type: golden-path
subject: grant-matching
status: forged
use_when: [building or tuning a grant-to-organization ranking engine, adding AI fit analysis on top of deterministic scoring, designing the "why this matched" surface of a shortlist, hardening a matcher that reads funder-published text]
techniques:
  - weighted-component-scoring
  - diminishing-returns-keyword-overlap
  - explainable-match-reasons
  - verdict-thresholds
  - llm-plus-deterministic-two-lane
  - injection-safe-rfp-analysis
---

# Grant matching

Grant matching is the ranking of *eligible* funding opportunities against one
organization's mission, place and size — and the delivery of that ranking in a
form the organization can trust: a score they can interrogate, reasons that are
true, and a verdict honest enough to say "don't apply". The naive reading is
"compute similarity between the org and the grant and sort descending". The
principal reading is that matching is three disciplines stacked in a fixed
order — **gate, then rank, then explain** — and that most matcher failures are
one of those disciplines leaking into another's territory: a fit score arguing
with an eligibility rule, an explanation claiming credit the score never gave,
a funder's own prose steering the model that was supposed to judge it.

## Gate first: matching is ranking within the eligible set

Eligibility is not a score component. Applicant type, deadline, and
award-capacity fit are pass/fail facts, decided deterministically, and a hard
fail on any of them forces the verdict to "ineligible" no matter how high the
fit score climbs. This ordering is a law of the domain, not a preference: a
beautifully matched opportunity the organization may not submit to is worth
nothing, and a ranker that lets 95-point mission fit drown a failed
applicant-type check will eventually put a for-profit-only program at the top
of a nonprofit's shortlist. The gate runs first, the gate is code, and no
model output may override it ([verdict-thresholds](./techniques/verdict-thresholds.md)).

The corollary is just as load-bearing: once the gate has passed, *stop
re-litigating eligibility inside the ranking*. The score's job is relative
ordering of things the organization could genuinely pursue.

## Rank second: a small number of legible components

The ranking layer that survives contact with real users is not the most
sophisticated one — it is the one whose behavior can be predicted, explained
and tuned. That means a weighted sum of a handful of named components, each
scoring one dimension the organization actually cares about — does this funder
care about our *mission*, our *place*, and money at our *scale* — with weights
that encode a deliberate editorial judgment about which dimension dominates
([weighted-component-scoring](./techniques/weighted-component-scoring.md)).
Mission fit typically deserves the largest share: geography and award size are
mostly gates wearing score clothing, while mission overlap is where genuine
ranking signal lives.

Within the mission component, raw keyword counting has a failure mode that
inverts the ranking: the opportunity that mentions *every* keyword is usually
a broad meta-announcement — an umbrella program, a portal digest — not a
tighter fit. Overlap must saturate: strong credit for the first few
independent signals, vanishing marginal credit after that
([diminishing-returns-keyword-overlap](./techniques/diminishing-returns-keyword-overlap.md)).

Missing data is scored with an honest neutral, never an optimistic guess. An
unpublished award range earns a small default, not full marks; a geography
that matches nothing scores zero rather than "probably fine". Every optimistic
default is a fabricated fact wearing a number.

## Explain third — and only what the score credited

Every ranked item owes the user a short "why", and the discipline that makes
the "why" trustworthy is **fidelity**: the explanation is derived from the
same components the score rewarded, so it can never claim a reason the score
did not credit. This is the matching-layer form of a finding the wider
recommender-explainability literature keeps re-learning — users assume
explanations are faithful, so a plausible-but-decorative explanation is a
quiet lie that erodes trust precisely when the ranking is wrong and the user
needs the explanation most. Generate reasons from score components, cite the
concrete evidence (the actual overlapping terms, the actual place name that
matched), and when a component earned nothing, say nothing about it
([explainable-match-reasons](./techniques/explainable-match-reasons.md)).

Honesty extends to the verdict. A 0-100 score invites false precision;
users act on bands. Map score plus eligibility into a small verdict vocabulary
— ineligible / weak / possible / strong — with fixed thresholds, and let the
band, not the raw number, drive recommendations
([verdict-thresholds](./techniques/verdict-thresholds.md)).

## The two-lane architecture: deterministic floor, model ceiling

Start deterministic. A pure, zero-cost, zero-latency heuristic ranker is the
right first slice even when a capable model is available, because until real
matches are flowing you do not know what you are scoring — and a
deterministic lane gives you reproducibility, testability and a permanent
fallback for free. The model lane layers on *top*: deep qualitative fit
judgment, extraction of concrete application requirements from the RFP prose,
nuance no keyword list captures. The two lanes emit the same result shape and
are assembled through one shared path, so the deterministic eligibility stays
authoritative in both, the verdict derivation is written once, and a model
outage degrades quality without removing the feature
([llm-plus-deterministic-two-lane](./techniques/llm-plus-deterministic-two-lane.md)).

Treat the model lane's output with the same skepticism as any remote input:
parse defensively, clamp scores into range, and treat a response missing its
user-facing substance as a failure that falls back to the heuristic — an
empty headline billed as an analysis is worse than the heuristic's honest one.
Cache verdicts keyed on *everything that feeds them*, both grant content and
the organization's profile; a cache key that omits a profile field serves
stale verdicts the day the organization changes jurisdiction or legal form.

## The adversarial surface: the RFP is untrusted input

The text a matcher analyzes is written by third parties and gathered from
portals, feeds and scrapes. The moment it enters a model prompt it becomes an
injection surface: text inside a grant description can attempt to raise its
own score, change the task, or hijack the output format. The defense is
structural, not hopeful — untrusted text enters the prompt only inside
declared delimiters, with forged delimiters stripped at the boundary, an
explicit instruction that delimited content is data to analyze and never
instructions to follow, hard length caps so no single document dominates the
context, and a strict bounded output schema that makes hijacked output
unparseable rather than believable
([injection-safe-rfp-analysis](./techniques/injection-safe-rfp-analysis.md)).
The same treatment applies to the *organization's own* uploaded materials:
"supplied by our user" is not "trusted by the system".

Delimiter-based defenses are strong against syntactically obvious injections
and known to be weak against payloads that mimic legitimate content — a fake
"this funder prioritizes applicants exactly like yours" sentence looks like
data. That residual risk is why the architecture, not the prompt, carries the
last line: the deterministic lane's eligibility and the verdict derivation
sit outside the model entirely, so the worst a successful injection can do is
inflate a qualitative score that a hard gate and a clamp still bound.

## Failure modes of the naive reading

- **The eloquent ineligible.** Fit scoring runs before or instead of the
  eligibility gate; the top of the shortlist cannot legally apply.
- **The meta-RFP magnet.** Linear keyword counting ranks umbrella
  announcements above genuinely narrow fits.
- **The decorative explanation.** Reasons generated independently of the
  score — often by a model asked to "explain the match" after the fact —
  assert mission alignment the ranker never measured.
- **The optimistic unknown.** Missing award data scored as full fit; the
  shortlist fills with opportunities of unknowable size.
- **The inflated model score.** A fit model prompted without an explicit
  honesty instruction drifts toward flattering scores, because agreeable
  output is the path of least resistance.
- **The stale verdict.** Cached analyses keyed only on the grant; the org
  edits its profile and keeps seeing verdicts computed for who it used to be.
- **The self-promoting RFP.** Instructions embedded in a scraped description
  raise its own ranking or rewrite the output.

Each is prevented structurally by one of the six techniques. A matcher earns
trust not by being clever but by being *legible under challenge*: any ranked
row, clicked, must reveal a gate that ran, components that add up, reasons
that trace to evidence, and a verdict that would rather say "weak" than
flatter.

## The techniques

- [weighted-component-scoring](./techniques/weighted-component-scoring.md) —
  a small set of named, weighted components as the ranking backbone.
- [diminishing-returns-keyword-overlap](./techniques/diminishing-returns-keyword-overlap.md) —
  saturating overlap credit so breadth stops beating fit.
- [explainable-match-reasons](./techniques/explainable-match-reasons.md) —
  reasons derived from credited components only, with concrete evidence.
- [verdict-thresholds](./techniques/verdict-thresholds.md) — hard gates plus
  fixed score bands into a small verdict vocabulary.
- [llm-plus-deterministic-two-lane](./techniques/llm-plus-deterministic-two-lane.md) —
  deterministic floor, model ceiling, one shared assembly path.
- [injection-safe-rfp-analysis](./techniques/injection-safe-rfp-analysis.md) —
  delimited untrusted text, bounded context, strict output schema.
