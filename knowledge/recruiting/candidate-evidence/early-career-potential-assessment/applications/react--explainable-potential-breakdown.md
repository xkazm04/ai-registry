---
layer: application
type: application
subject: early-career-potential-assessment
technique: explainable-potential-breakdown
stack: react
status: forged
verified_on: 2026-09-26
verified_against: react@19
---

# The recruiter's half of the potential breakdown: two React surfaces

The Python pipeline computes the readiness score and its reasons (see the process
applications beside this one). This is the other half: what a recruiter actually sees
in a Next.js 16 / React 19 app with four UI locales (next-intl, en/cs/de/fr). Two
components carry it, and between them they show where the technique holds at the
component boundary and where it breaks: at the server's output contract, one layer
upstream.

## The match score: weights beside sub-scores, labels from a code

`ScoreBreakdown` (`app/features/shared/MatchPresentation.tsx:47-86`, rendered by
`app/features/insights/matrix/focus/MatchCard.tsx:163`) draws the total as one bar whose
segments are each dimension's contribution, with a legend line per dimension carrying
its name, its percent and its weight:

```tsx
<span className="uppercase">{dimLabel(d)}</span>
<span className="tabular-nums tracking-tight text-ink">{d.percent}</span>
<span className="tabular-nums tracking-tight">{t("weightPercent", { weight: d.weight })}</span>
```

Three rules of the technique are visible in the render:

- **The weight is shown beside the sub-score.** A low number on a heavily weighted
  dimension looks different from a low number on a light one, and the reader can see
  which is which.
- **The component does no arithmetic.** Every figure comes from the server
  (`matching.build_score_breakdown`, `matching.py:931-955`). The comment at
  `MatchPresentation.tsx:38-46` names the bug this replaced: a client-side 0-1 vs 0-100
  scale guess. When the recruiter view and the server share their facts, one of them
  cannot drift.
- **Labels follow the population and key off a code, not a string.** The server emits
  `label_code` per dimension. Early-career candidates get `foundation` / `potential` /
  `fit` in place of `skills` / `career` / `personal` (`matching.py:962-966`). The client
  resolves the display name from that code, `d.labelCode && tDims.has(d.labelCode) ?
  tDims(d.labelCode) : d.label` (`app/features/shared/matchLabels.ts:84-85`), so the
  renamed label is localized and nothing downstream reads the English word.

Where the band is not tight, its reasons render in plain text under the bar rather than
in a tooltip (`MatchCard.tsx:175-181`, "a recruiter reading '34–62' must see
'early-career, thinner record' without knowing to hover"). The drivers carry codes, so
the reasons are localized like the dimension names are.

## The potential score: the basis, shown on request

`PotentialBadge` (`app/_components/PotentialBadge.tsx`) is the surface built for the
technique. Its header comment (`:7-15`) states the argument: "a bare 'potential 64%'
pill invites distrust and overrides". The pill opens a popover titled "Why this
potential score" (`:99`) that lists three things:

- the learning signals behind the number;
- the transferred meta-skills, labelled "(professional grade)" (`:112`), which is the
  provenance tier stated at the point of use;
- the domain-distance band as words, "adjacent field, shorter bridge" or "far field,
  longer ramp", never a decimal (`:125-126`, `messages/en.json` `potential.bridgeValues`).

With no explanation data, for example an old persisted snapshot, it degrades to the
plain pill instead of inventing reasons (`:71-76`).

## Where it falls short of the technique

Most of the gaps trace back to what the server hands the component. The React code
renders what it receives, so these are not rendering bugs.

- **The four readiness sub-scores never reach the screen.** `compute_potential` returns
  `(score, signals)` (`pipeline/jobfit/transform.py:36`). Depth, velocity, foundation
  and initiative are summed and discarded, so the badge can show one percentage and a
  list of *positive* signals (`:30`, `:68`, `t("badge", { pct })`) and nothing else. That
  breaks two rules:
  - *Every dimension, including the unmeasured ones.* A readiness input with no data
    is invisible, not labelled "not measured".
  - *The weight beside the sub-score.* The 0.35 / 0.25 / 0.25 / 0.15 split exists only
    in Python.

  The failure this hides was measured on the same day. A graduate whose CV omits the
  degree line loses the whole foundation slot. Nothing in the popover says so, and the
  recruiter note says "not penalized" (see the readiness-rubric application).
- **The basis is English-only.** The learning signals are English f-strings built in
  Python (`transform.py:57`, `f"self-taught breadth: {n_skills} distinct skills"`). They
  carry no code, so in cs/de/fr they render in English beside localized dimension names
  and drivers. The contrast is stark: the band drivers were given codes precisely so
  they could be translated, and the reasons for the potential score were not.
- **The label map exists in more than one copy.** The server's
  `archetypes.json` `dimensionLabels` and `matching.py:962` define it. The client
  defines it twice more:
  - the recruiter weight panel's `dimKeysFor` (`MatchWeightsPanel.tsx:14-18`, "mirrors
    MatchCard's Bar labels");
  - the fallback bars for responses without a server breakdown
    (`MatchCard.tsx:168-170`).

  The technique says to declare the map once. Today the copies agree. Nothing makes
  them keep agreeing.
- **"Potential" can label a tenure number.** The label code keys on archetype alone
  (`matching.py:966`). The career slot falls back to the tenure-based `score_career`
  when an early-career candidate has no `potential_score` (`:1152`). On that path the
  recruiter would read "Potential" above a years-based score, which is exactly the
  cross-axis comparison the population label exists to prevent. Read from the code,
  not executed: the transform path always sets the score, so only a candidate built
  outside it could reach this.
- **The weights are adjustable per candidate.** The recruiter panel moves them inside
  server-enforced bounds, and the server renormalizes (`MatchWeightsPanel.tsx:20-24`).
  The bounds are real, but "identical for everyone in the population" no longer
  describes the result once a recruiter uses the panel. The breakdown still shows the
  weight that was applied, which is what keeps the adjustment reviewable.

## What to copy

Two things:

- The code-keyed label. It is cheaper than any review of translated strings, and it is
  what let the renaming survive four locales.
- The split between the two surfaces. The match bar answers "where did the total come
  from". The badge answers "why this potential". Neither tries to do both.

The part not to copy is the output contract. The breakdown a component can show is
bounded by what the scorer returns. The per-dimension account, including every
not-measured state, has to exist in the server's return type before any front end can
be honest about it.
