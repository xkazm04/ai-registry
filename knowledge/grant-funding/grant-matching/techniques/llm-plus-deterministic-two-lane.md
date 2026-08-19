---
layer: technique
type: technique
subject: grant-matching
technique: llm-plus-deterministic-two-lane
status: forged
laws: [hard-gates-precede-soft-scores, honest-null-over-forced-guess, never-fabricate-a-figure]
shared_with: []
use_when: [adding model-based fit analysis to a matcher, deciding what stays deterministic vs what a model may judge, designing fallback when the model lane fails]
---

# LLM-plus-deterministic two-lane matching

The concern: model-scored fit is genuinely better at qualitative judgment than
any keyword heuristic — and genuinely worse at everything that must be exact,
reproducible, cheap, or authoritative. A matcher that is *only* a model is
slow, costly, unreproducible and gameable; a matcher that is *only* heuristic
plateaus at keyword-level insight. The technique is a two-lane architecture
with a strict division of authority: a **deterministic lane** that always
runs and owns everything binding, and a **model lane** that layers
qualitative judgment on top and is allowed to fail.

## Procedure

1. **Ship the deterministic lane first, alone.** Resist "model-scored from
   the start": until real matches flow, you do not know what you are scoring,
   and a pure-function ranker gives determinism, zero cost, zero latency and
   a test surface while you find out. The model lane is an upgrade to a
   working system, not the foundation.
2. **Fix the division of authority.** Deterministic-only, forever:
   eligibility gates, verdict derivation, score clamping, jurisdiction and
   currency resolution. Model lane: the qualitative fit score, "why match /
   why not" narrative, and extraction of concrete application requirements
   from RFP prose. The model may inform; it may never override a gate.
3. **Make both lanes emit the same result shape** (score + narrative fields),
   tagged with their source, and assemble the final analysis through one
   shared function that attaches the deterministic eligibility and derives
   the verdict. One assembly path is what keeps the lanes consistent as each
   evolves.
4. **Instruct the model toward honesty explicitly.** "Be concrete and honest
   — do not inflate the score" is not decoration: an un-instructed fit judge
   drifts flattering, because agreeable output is its path of least
   resistance. Demand a bounded output schema (strict structured object,
   capped list lengths, no prose outside it).
5. **Parse defensively, and define "unusable" broadly.** Tolerate fences and
   surrounding prose when extracting the structured object; coerce and clamp
   every field. Then apply a substance check: a response that parses but
   lacks its user-facing core (an empty summary) is a *failure*, not a
   result — throw, reclaim the spend, fall back. Billing the user for an
   empty headline is worse than the heuristic's honest one.
6. **Fall back to the deterministic lane on any model failure** — outage,
   parse failure, substance failure. The feature degrades in quality, never
   in availability, and the fallback is the lane you shipped first, so it is
   always current.
7. **Cache model verdicts keyed on everything that feeds them.** The key
   covers the grant content *and* every profile field the analysis reads —
   jurisdiction, legal form, location, revenue, mission keywords, and a hash
   of any supplied reference materials. An omitted field serves stale
   verdicts the day that field changes; hash long inputs to keep the key
   bounded.

## Decision rules

- **When the two lanes disagree on fit,** that is signal, not error — surface
  the model's narrative with its score, but the verdict still derives from
  the shared function. Investigate systematic disagreement offline; do not
  auto-reconcile.
- **When cost or latency pressure rises,** the deterministic lane is the
  default and the model lane becomes on-demand (user-triggered per item)
  rather than bulk — never the reverse.
- **When the model extracts factual claims** (requirements, deadlines,
  amounts), treat them as *candidates* attributed to the RFP text, never as
  authoritative fields; deterministic ingest data wins any conflict.
- **When evaluating the model lane,** replay a fixed grant+profile set and
  diff scores across model or prompt versions; the deterministic lane doubles
  as the stable baseline that makes drift visible.

## When NOT to use it

- When the deterministic lane alone meets the product bar — a second lane is
  operational surface (cost, cache, fallback, injection defense); add it for
  demonstrated insight gaps, not for architecture prestige.
- For the gates themselves. There is no "model-assisted eligibility" lane;
  an eligibility judgment a model can sway is a compliance incident, not a
  feature.
- When you cannot afford the cache-and-fallback machinery yet: a model lane
  without defensive parsing, substance checks and fallback is a reliability
  downgrade dressed as an upgrade.
