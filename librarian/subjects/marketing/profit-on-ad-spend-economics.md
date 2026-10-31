---
subject: profit-on-ad-spend-economics
domain: marketing
last_touched: 2026-09-09
touched_by: intake-marketing-0909 (forge wave)
dry_streak: 0
---

# profit-on-ad-spend-economics

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `measurement-and-economics`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** judging whether a channel or campaign makes money rather than revenue, setting a break-even target from a margin, loading overhead or fulfilment onto ad economics, deciding whether a spend increase will still pay, reviewing a surface that calls a high-ratio channel profitable

**Techniques (6):** break-even-roas-is-inverse-margin, efficiency-is-not-profitability, overhead-and-fulfilment-loading, profitable-means-net-profit-nonnegative, ratio-vocabulary-one-guarded-divide, response-curve-gate-and-marginal-return.

**Applications (3; stacks: node):** node--overhead-and-fulfilment-loading, node--profitable-means-net-profit-nonnegative, node--response-curve-gate-and-marginal-return.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- No `librarian/applied.md` row yet except where the source note says so; the
  unapplied backlog is every technique here without a row.

## Architecture review - 2026-10-31

First architecture review, against `0ec5245ac`. All eleven documents read in full;
the bundle now holds four applications (the note above lists three, from before
`node--break-even-roas-is-inverse-margin` was added on 2026-10-14). The arithmetic
across the golden path and techniques was recomputed and holds. Two claims were
checked against primary sources and both need narrowing: the response-curve
technique's "twelve or more weeks" understates what weekly media-mix guidance asks
for, and the break-even technique attributes JavaScript's infinity-to-null behaviour
to "a JSON encoder" in general. Two small internal inconsistencies sit in the golden
path. The consumer workspace the applications cite was not reachable, so they are
`reverify`; no verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/profit-on-ad-spend-economics",
  "date": "2026-10-31",
  "baseline": "0ec5245ac",
  "digest": "sha256-b2:83f3815cd78df2cc",
  "disposition": "clarify",
  "coverage": "All 11 documents read in full (golden path, 6 techniques, 4 applications). Arithmetic recomputed: 4 x 0.15 = 0.60, 4 x 0.55 = 2.2; 1/0.42 = 2.38, 1/0.30 = 3.33, 1/0.58 = 1.72; loaded break-even solves revenue x margin = ad + overhead + fulfilment for revenue / ad; donor loss cost x (1 - return x margin) is the negated net profit. Two primary sources opened. Not evaluated: the private consumer workspace at 2893314 and 7baeb12a (not reachable from this checkout), any test run, any connected-project runtime.",
  "trigger": "First architecture review of a subject forged 2026-09-09 (state pending).",
  "intended_benefit": "A profit verdict derived once from margin and net profit, with every threshold labelled, so no surface turns an efficiency ratio into a profit claim.",
  "failure_if_ignored": "A zero-cost channel reads as a loss, a high-ratio low-margin channel reads as a win, and two surfaces disagree about one channel the day the margin changes.",
  "boundary": "Takes platform-reported revenue and a supplied margin as inputs; does not own causality (attribution), period significance, the reallocation move, or pacing.",
  "counterexamples": [
    "Inside one account where margin is uniform across campaigns, ranking by return on ad spend orders campaigns exactly as ranking by profit would; the profit lens adds nothing until margin varies.",
    "Python's json.dumps writes float('inf') as the bare token Infinity (invalid JSON) rather than null, so the null hazard the break-even technique names is specific to JavaScript's JSON.stringify; a strict parser on the other side fails loudly instead of reading zero.",
    "A fourteen-day daily fit clears the subject's gate while sitting far below the two to three years of weekly data Google's Meridian documentation asks of a media-mix model; passing the gate licenses a local marginal reading, not a media-mix estimate.",
    "A channel whose contribution before allocation is positive can still be worth cutting when the overhead it is charged is genuinely activity-driven and would leave with it; the 'never cut on an allocated loss' rule assumes the overhead is fixed."
  ],
  "sources": [
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify",
      "result": "'The numbers Infinity and NaN, as well as the value null, are all considered null', with JSON.stringify([NaN, null, Infinity]) giving '[null,null,null]'. Supports the hazard for JavaScript; local check: Python json.dumps(float('inf')) prints Infinity. Basis for narrowing 'a JSON encoder'."
    },
    {
      "url": "https://developers.google.com/meridian/docs/pre-modeling/collect-data",
      "result": "'historical data should be a minimum of two years' worth of weekly data for geo-level models' and 'three years of data for national-level models'; 'Collect data at the weekly level.' Refutes 'twelve or more weeks' as the practitioner bar for weekly-grain media models."
    }
  ],
  "documents": {
    "profit-on-ad-spend-economics.md": {
      "disposition": "clarify",
      "reason": "Sound and consistent with the techniques except two places. (1) The loaded break-even 'is only defined when there is spend to divide by'; the technique also requires a positive margin. (2) The margin-bases bullet says diverge 'by more than a couple of percentage points'; the technique's convention is at or above two points."
    },
    "techniques/break-even-roas-is-inverse-margin.md": {
      "disposition": "clarify",
      "reason": "Formula and loaded derivation verified. The serialisation rule says 'a JSON encoder writes infinity as null'; that is JavaScript's JSON.stringify (MDN), not encoders in general. Name it."
    },
    "techniques/efficiency-is-not-profitability.md": {
      "disposition": "keep",
      "reason": "Doctrine, corollaries and the donor-loss formula are correct; the When-not-to-use section already carries the uniform-margin counterexample."
    },
    "techniques/overhead-and-fulfilment-loading.md": {
      "disposition": "keep",
      "reason": "Two attachments, whole-versus-split reconciliation, reject-don't-coerce boundary and the two-point convention are stated with footing. Rejecting a zero margin at the cost-model boundary is consistent with break-even's 'never' for a per-channel zero margin, which is a different input."
    },
    "techniques/profitable-means-net-profit-nonnegative.md": {
      "disposition": "keep",
      "reason": "Zero-cost case, inclusive boundary and one-predicate rule are correct; the loaded predicate (contribution profit >= ad cost) matches the overhead technique's definitions."
    },
    "techniques/ratio-vocabulary-one-guarded-divide.md": {
      "disposition": "keep",
      "reason": "One guard, rendering distinctions, re-derive-from-sums and reciprocal thresholds are correct and consistent with the golden path."
    },
    "techniques/response-curve-gate-and-marginal-return.md": {
      "disposition": "clarify",
      "reason": "Model, derivative and gate are coherent and every bar is labelled convention. The footing 'Practitioner guidance for weekly-grain media models asks for twelve or more weeks' is wrong: Google's Meridian documentation asks for at least two years of weekly data (geo) and three (national). Correct it, which also makes plain how thin the 14-day floor is."
    },
    "applications/node--break-even-roas-is-inverse-margin.md": {
      "disposition": "reverify",
      "reason": "Internally consistent count table and three located gaps; the workspace at 7baeb12a and its 23 tests were not reopened."
    },
    "applications/node--overhead-and-fulfilment-loading.md": {
      "disposition": "reverify",
      "reason": "Quoted incident comment and revenue-share deviation are coherent with the technique; the workspace at 2893314 was not reopened."
    },
    "applications/node--profitable-means-net-profit-nonnegative.md": {
      "disposition": "reverify",
      "reason": "Records the fallback-margin deviation honestly; anchors at 2893314 were not reopened."
    },
    "applications/node--response-curve-gate-and-marginal-return.md": {
      "disposition": "reverify",
      "reason": "Gate order and constants match the technique (CURVE_B_RANGE [0.2, 1] with slope >= 1 rejected is the technique's [0.2, 1) band); anchors at 2893314 were not reopened."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the four clarify items the earlier 2026-10-31 record named, against
`7b8db2118`. MDN and the Meridian data page were opened this run and support the
two corrected footings; the two golden-path edits align it with its own techniques.
Applications were not touched and keep `reverify`, which is now the overall
disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/profit-on-ad-spend-economics",
  "date": "2026-10-31",
  "baseline": "7b8db2118",
  "digest": "sha256-b2:45286b693077b3fa",
  "disposition": "reverify",
  "coverage": "All 11 documents decided. The four clarify items the earlier 2026-10-31 record named (two in the golden path, one each in break-even-roas-is-inverse-margin and response-curve-gate-and-marginal-return) were applied and the edited passages re-read. Both primary sources were opened this run. Other documents are byte-unchanged and keep their dispositions. The private consumer workspace was not reachable and no verification date was refreshed.",
  "trigger": "First architecture review of a subject forged 2026-09-09 (state pending).",
  "intended_benefit": "A profit verdict derived once from margin and net profit, with every threshold labelled, so no surface turns an efficiency ratio into a profit claim.",
  "failure_if_ignored": "A zero-cost channel reads as a loss, a high-ratio low-margin channel reads as a win, and two surfaces disagree about one channel the day the margin changes.",
  "boundary": "Takes platform-reported revenue and a supplied margin as inputs; does not own causality (attribution), period significance, the reallocation move, or pacing.",
  "counterexamples": [
    "Inside one account where margin is uniform across campaigns, ranking by return on ad spend orders campaigns exactly as ranking by profit would; the profit lens adds nothing until margin varies.",
    "Python's json.dumps writes float('inf') as the bare token Infinity (invalid JSON) rather than null, so the null hazard the break-even technique names is specific to JavaScript's JSON.stringify; a strict parser on the other side fails loudly instead of reading zero.",
    "A fourteen-day daily fit clears the subject's gate while sitting far below the two to three years of weekly data Google's Meridian documentation asks of a media-mix model; passing the gate licenses a local marginal reading, not a media-mix estimate.",
    "A channel whose contribution before allocation is positive can still be worth cutting when the overhead it is charged is genuinely activity-driven and would leave with it; the 'never cut on an allocated loss' rule assumes the overhead is fixed."
  ],
  "sources": [
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify",
      "result": "'The numbers Infinity and NaN, as well as the value null, are all considered null', with JSON.stringify([NaN, null, Infinity]) giving '[null,null,null]'. Supports the hazard for JavaScript; local check: Python json.dumps(float('inf')) prints Infinity. Basis for narrowing 'a JSON encoder'."
    },
    {
      "url": "https://developers.google.com/meridian/docs/pre-modeling/collect-data",
      "result": "'historical data should be a minimum of two years' worth of weekly data for geo-level models' and 'three years of data for national-level models'; 'Collect data at the weekly level.' Refutes 'twelve or more weeks' as the practitioner bar for weekly-grain media models."
    }
  ],
  "documents": {
    "profit-on-ad-spend-economics.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the loaded break-even is now 'only defined when there is spend to divide by and a positive margin'; the margin-bases bullet now says they diverge 'by two percentage points or more', matching the technique's convention."
    },
    "techniques/break-even-roas-is-inverse-margin.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'a JSON encoder writes infinity as null' now reads 'JavaScript's JSON encoder writes infinity as null (other encoders emit a non-standard token or refuse)', per MDN and a local Python check."
    },
    "techniques/efficiency-is-not-profitability.md": {
      "disposition": "keep",
      "reason": "Doctrine, corollaries and the donor-loss formula are correct; the When-not-to-use section already carries the uniform-margin counterexample."
    },
    "techniques/overhead-and-fulfilment-loading.md": {
      "disposition": "keep",
      "reason": "Two attachments, whole-versus-split reconciliation, reject-don't-coerce boundary and the two-point convention are stated with footing. Rejecting a zero margin at the cost-model boundary is consistent with break-even's 'never' for a per-channel zero margin, which is a different input."
    },
    "techniques/profitable-means-net-profit-nonnegative.md": {
      "disposition": "keep",
      "reason": "Zero-cost case, inclusive boundary and one-predicate rule are correct; the loaded predicate (contribution profit >= ad cost) matches the overhead technique's definitions."
    },
    "techniques/ratio-vocabulary-one-guarded-divide.md": {
      "disposition": "keep",
      "reason": "One guard, rendering distinctions, re-derive-from-sums and reciprocal thresholds are correct and consistent with the golden path."
    },
    "techniques/response-curve-gate-and-marginal-return.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the 14-day footing no longer cites 'twelve or more weeks'; it states Meridian's two years of weekly data (geo) and three (national), and that clearing the floor supports a local marginal reading, not a media-mix estimate."
    },
    "applications/node--break-even-roas-is-inverse-margin.md": {
      "disposition": "reverify",
      "reason": "Internally consistent count table and three located gaps; the workspace at 7baeb12a and its 23 tests were not reopened."
    },
    "applications/node--overhead-and-fulfilment-loading.md": {
      "disposition": "reverify",
      "reason": "Quoted incident comment and revenue-share deviation are coherent with the technique; the workspace at 2893314 was not reopened."
    },
    "applications/node--profitable-means-net-profit-nonnegative.md": {
      "disposition": "reverify",
      "reason": "Records the fallback-margin deviation honestly; anchors at 2893314 were not reopened."
    },
    "applications/node--response-curve-gate-and-marginal-return.md": {
      "disposition": "reverify",
      "reason": "Gate order and constants match the technique (CURVE_B_RANGE [0.2, 1] with slope >= 1 rejected is the technique's [0.2, 1) band); anchors at 2893314 were not reopened."
    }
  }
}
```
