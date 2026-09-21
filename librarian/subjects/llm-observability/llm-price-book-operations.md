---
domain: llm-observability
subject: llm-price-book-operations
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# llm-price-book-operations

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/llm-price-book-operations",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:238bb26b064f57eb",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Two rebuilds read revisions 1 and 2; revision 1 finishes last and overwrites revision 2 under the same pointer lock.",
    "A premium lane costs more than standard, so base fallback understates rather than conservatively bounds cost.",
    "Unknown-model calls imputed at the window mean do not acquire their own model price merely when a row is added."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/economics-and-governance/llm-price-book-operations",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://platform.claude.com/docs/en/about-claude/pricing",
      "scope": "Primary pricing source consulted for provider-specific pricing structure; no complete current rate-table or historical application refresh."
    }
  ],
  "documents": {
    "llm-price-book-operations.md": {
      "disposition": "reverify",
      "reason": "A price book models estimates, not necessarily invoiced actuals. Ignoring discounts can overprice rather than always underprice. One-level variants cannot cover populated lane-by-tier combinations; served lane, effective time and usage classes matter. Frozen wrong estimates need auditable correction, not mandatory waiting for windows to roll."
    },
    "techniques/embedded-seed-fallback.md": {
      "disposition": "reverify",
      "reason": "Embedded nonempty data does not guarantee supported-model coverage, freshness or negotiated rates. A parseable empty file still wins under the stated precedence. Corrupt override fallback can silently change economics despite a warning; validate semantics and declare refusal policy. Versioned merges can be reproducible, and runtime staleness remains relevant after first boot."
    },
    "techniques/hot-swap-price-book.md": {
      "disposition": "clarify",
      "reason": "Repaired out-of-order rebuild races, snapshot consistency, database/cache divergence and write time versus provider effective time. Full rebuild plus pointer lock alone does not prevent an older read replacing a newer book."
    },
    "techniques/no-retroactive-repricing.md": {
      "disposition": "clarify",
      "reason": "Repaired estimates as immutable measurements and unpriced imputation as automatically correct after adding a row. Preserve original decisions while supporting versioned correction and explicitly valued projections."
    },
    "techniques/price-provenance-and-staleness.md": {
      "disposition": "reverify",
      "reason": "Source URL and write timestamp do not show who changed a row or preserve the cited page version. Separate actor, provider effective date, local activation and verification coverage. Typed units can prevent thousand/million mistakes. Repricing cadence is not a predictable validity bound; calendar defaults need risk-based and event-driven checks."
    },
    "techniques/price-resolution-order.md": {
      "disposition": "clarify",
      "reason": "Repaired premium-lane fallback as conservative, lane/tier incompatibility and syntactic date trimming as proof of price equivalence. Unknown rates and partial class coverage remain disclosed rather than fabricated actuals."
    },
    "techniques/price-row-variant-encoding.md": {
      "disposition": "reverify",
      "reason": "A parsed suffix grammar is one schema choice, not guaranteed future-proof. Arbitrary model names can collide with reserved suffixes. Lane-by-tier needs an explicit representation; token classes also interact with length thresholds. Multipliers can be valid provider rules and validated structured columns are legitimate. Missing cells cannot silently use base as actual price."
    },
    "applications/process--no-retroactive-repricing.md": {
      "disposition": "reverify",
      "reason": "Historical runbook retained, not rerun. Mean-priced-call imputation does not self-correct to the missing model rate simply because that rate is added; displayed implementation and prose disagree. Dated provider multipliers are not fully refreshed. Estimates may be corrected with lineage; startup semantic validation and concurrency remain unproven."
    },
    "applications/rust--price-resolution-order.md": {
      "disposition": "reverify",
      "reason": "Historical Rust code retained, not rerun. Priority as flex synonym can underprice a premium lane. Date-shaped suffix does not establish price identity, saturation hides cached counts exceeding input, and listed 100k/300k tests do not establish exact-threshold behavior. Seed activation now is valid if separate from verification; substituting verification date would conflate those clocks."
    }
  }
}
```

## 2026-09-10 — architecture re-review after the compression revert

I retract the `documents` map of the earlier 2026-09-10 record. It dispositioned the
compressed rewrite that has since been reverted, so its "Repaired ..." reasons name
edits that are not on disk. Its `reverify` reasons were largely restatements of each
technique's own "when not to use it" section; where a real claim sat inside one, I
have re-derived it below from the current bytes rather than carrying it forward on
trust.

All nine documents read in full. The subject holds up well. Its central move — that
the deepest decision in a price book is *when multiplication happens*, and that
stamping at ingest is what makes every downstream number citable — is stated once and
carried consistently, and the stamped-versus-imputed asymmetry is the rare rule that
explains both halves of an exception. Dominant disposition `keep`.

**I checked the field claims about token-class pricing against primary sources and
they hold.** Anthropic prices cache writes at a premium over base input tiered by
cache lifetime — 1.25x for the 5-minute TTL and 2x for the 1-hour TTL — with reads at
roughly a tenth of input; that is exactly what `price-row-variant-encoding` and the
process application assert. Google's Gemini pricing does carry a separate storage
line for explicit context caching, denominated per million tokens per hour, alongside
a discounted cached-token input rate — so the subject's claim that a non-token cost
line exists which "no token multiplication can produce" is confirmed rather than
inferred. One currency note without a disposition attached: the ~0.1x read multiple is
now model-dependent on the Anthropic side (Claude Fable 5.1 reads bill at 0.025x), so
the flat "a tenth is typical" is a generalization that has started to fray. The
application is dated 2026-08-20 with `refresh_by` 2026-11-20 and is inside its window;
this belongs in that refresh, not in a correction now.

Two findings.

**`price-resolution-order`'s lane-fallback rationale is wrong for the premium lane
its own subject models.** Step 1 says an unpriced lane falls through to standard
rates, "which is the conservative direction (base rates are the ceiling for discount
lanes)". The golden path's very first pricing bullet lists "a priority lane at a
multiple of standard" beside the discount lanes. For a premium lane base is a *floor*,
not a ceiling, so the fallback under-prices — which is precisely the direction the
golden path names as the systematic bias that "flatters the dashboard". The rule
itself may still be the right default (never fail a call over an unpriced lane), but
its stated justification only covers half the lanes the subject claims to model, and
the half it misses is the expensive one. The Rust application shows this is not
hypothetical: `PricingMode::parse` maps `"priority"` as a synonym for flex, so a
declared premium call is priced at the *discounted* rate.

**The imputation self-correction claim is contradicted by its own application.**
`no-retroactive-repricing` says that because imputation is recomputed at each
evaluation, "adding the missing price later means the very next evaluation prices that
traffic correctly". The process application documents the actual disclosed rule: an
unpriced call is charged against a cost cap "at the window's mean priced-call cost".
Under that rule, adding the model's row does not make the event price at its own rate
— the event still carries no stamp and is still imputed at the window mean. Adding the
row moves the mean; it does not price the traffic correctly. The technique's claim
only holds if imputation re-resolves the book per event and falls back to the mean
only on a miss, and nothing in either document says it does. Whichever rule is
intended, the two documents currently state different ones and the technique states
the stronger.

Smaller: `hot-swap-price-book` step 4 says "rebuild the whole book from a full
re-read, then swap behind a write lock" without saying whether the re-read is inside
the lock. Outside it, two concurrent admin writes can each re-read and swap with the
older read finishing last, leaving memory behind the database — the exact drift the
full-rebuild-over-patch rule exists to make impossible. One clause fixes it.

Unresolved: the OpenAI cached-input discount range ("roughly 50-90% off depending on
model") in the process application was not checked; the Gemini cached rate as a
fraction of input ("about a quarter") was not established, only the existence of the
storage line. The LightTrack tree was not cloned, no test was rerun, and no
`verified_on`, `refresh_by` or `last_verified` field was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/llm-price-book-operations",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:eaf6705dc6983fa0",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read in full at current bytes, with the cache-class pricing claims checked against provider primary sources and the lane-fallback and imputation rules traced between technique and application. Retracts the earlier 2026-09-10 record's document map, which described reverted content. Not evaluated: the LightTrack tree was not cloned and no test was rerun; the OpenAI cached-input discount range and the Gemini cached-rate fraction were not checked; no last_verified, verified_on or refresh_by field was refreshed.",
  "counterexamples": [
    "A call declares a priority lane and the book has no priority row. Resolution falls through to base, which for a premium lane is a floor rather than a ceiling, so the call is under-priced - the direction the golden path names as the bias that flatters the dashboard.",
    "A model's row is added after a month of unpriced traffic. Under the disclosed mean-priced-call imputation rule, the backlog is still charged at the window mean, not at the newly added rate - so 'the very next evaluation prices that traffic correctly' does not hold.",
    "Two admins write different rows at once. Each re-reads the full table and swaps; the older read completes last and the in-memory book silently loses the newer write until the next restart.",
    "A provider prices a batch call above a long-context threshold differently from either the batch row or the tier row. The one-level composition bound says define that cell as its own row - but resolution takes lane first and returns flat, so the tier row for that cell is unreachable through the stated order.",
    "A cache write lands in a TTL class the row's class map does not carry. The order says surface it as a disclosed partial miss; a book keyed only model x lane x tier has no place to disclose it except the non-coverage block, which is prose rather than a per-event field."
  ],
  "sources": [
    {
      "url": "https://ai.google.dev/gemini-api/docs/pricing",
      "result": "Confirms that Gemini explicit context caching bills a discounted cached-token input rate AND a separate storage charge denominated per 1,000,000 tokens per hour - establishing the subject's claim that a non-token cost line exists which no token multiplication can produce. It does not establish the cached rate as a fixed fraction of the input rate; the fraction varies by model and by effective date."
    },
    {
      "path": "shared/prompt-caching.md (Anthropic claude-api reference)",
      "result": "Confirms cache writes at 1.25x base input for the 5-minute TTL and 2x for the 1-hour TTL, and cache reads at roughly 0.1x. Also establishes that the read multiple is no longer uniform across models (0.025x on Claude Fable 5.1), which the subject's flat 'a tenth is typical' does not yet reflect."
    },
    {
      "path": "knowledge/llm-observability/economics-and-governance/llm-price-book-operations",
      "result": "Every owned document read at current bytes; the lane-fallback rationale and the imputation rule traced between technique and application. Establishes the two internal contradictions directly; establishes nothing about whether the LightTrack code still reads as described."
    }
  ],
  "documents": {
    "llm-price-book-operations.md": {
      "disposition": "keep",
      "reason": "The four load-bearing distinctions (seed is not source of truth, resolution is not storage, a miss is null, a correction is not a restatement) are each the right cut, and the failure-modes list names the real ones including the asymmetry of flat-rate flattening. It is also the document that establishes the premium lane exists, which is what makes the resolution-order finding a contradiction rather than an omission."
    },
    "techniques/embedded-seed-fallback.md": {
      "disposition": "keep",
      "reason": "The precedence rule is short and complete, rule 4 is correctly identified as where operators actually get burned, and the boot line that discloses which source won is the cheapest possible fix for it. The build-time assertions and the network-refreshed-seed decision rule are both earned."
    },
    "techniques/hot-swap-price-book.md": {
      "disposition": "clarify",
      "reason": "Step 4 does not say whether the full re-read happens inside the write lock. Outside it, two concurrent admin writes can swap out of order and leave memory behind the database - the drift the full-rebuild rule exists to prevent. The forward-only argument, the audit affordances and the multi-node propagation rule need nothing."
    },
    "techniques/no-retroactive-repricing.md": {
      "disposition": "clarify",
      "reason": "Claims that adding a missing price means 'the very next evaluation prices that traffic correctly'. Under the mean-priced-call imputation rule its own application documents, adding the row moves the window mean and does not price the event at its own rate. Either state that imputation re-resolves the book per event before falling back, or weaken the claim. The freeze argument itself, and the measurement-frozen/estimate-recomputed principle, are the best statement of this rule in the corpus."
    },
    "techniques/price-provenance-and-staleness.md": {
      "disposition": "keep",
      "reason": "Declared non-coverage as the most valuable line in the metadata block, the operational definition of staleness against the shortest provider cadence, and the effective-date-is-not-the-announcement-date distinction that makes a mispriced tranche computable. The unit-and-currency declaration as the only defence against a 1000x error is exactly right."
    },
    "techniques/price-resolution-order.md": {
      "disposition": "clarify",
      "reason": "The lane fallback's justification - 'base rates are the ceiling for discount lanes' - covers only the discount lanes, while this subject's golden path also models a priority lane at a multiple of standard, for which base is a floor and the fallback under-prices. Keep the rule if it is the right default; state its failure direction for premium lanes. The asymmetric class-fallback rule two sections later gets this exactly right, which shows the subject already knows the distinction."
    },
    "techniques/price-row-variant-encoding.md": {
      "disposition": "keep",
      "reason": "Modifier-in-the-key with a closed parsed grammar, self-contained rate cards rather than multipliers, and the class map as an axis orthogonal to the row key that does not count against the one-level bound. Its cache-write claims (a premium over input tiered by lifetime, 1.25x and 2x classes) check out against the provider documentation, as does the non-token storage line."
    },
    "applications/process--no-retroactive-repricing.md": {
      "disposition": "clarify",
      "reason": "Repeats the technique's overclaim - 'expect any unpriced backlog for that model to self-correct on the next evaluation' - two paragraphs after documenting that the imputation charge is the window's mean priced-call cost. The rest is a strong record: the caveat shipped inside the evaluation response, the refuse-rather-than-read-absence-as-headroom rule, and the dated class-map section whose Anthropic and Gemini claims I confirmed against primary sources. Not rerun; refresh_by 2026-11-20 left as it stands, and the flat ~0.1x cache-read multiple belongs in that refresh."
    },
    "applications/rust--price-resolution-order.md": {
      "disposition": "clarify",
      "reason": "Records that PricingMode::parse maps 'priority' as a synonym for flex without noting the consequence: a declared premium lane prices at the discounted rate, which is the technique's fallback bug made concrete rather than a neutral parsing detail. It should be listed beside the effective_date deviation it already names. Everything else - the order walked step by step, the strict-threshold assertion, the enumerated edge tests - is accurate. Not rerun."
    }
  }
}
```
