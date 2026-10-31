---
domain: civic-intelligence
subject: conflict-of-interest-detection
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# conflict-of-interest-detection

## Architecture review - 2026-09-09

Retain the economic screening method with explicit limits. Consumer formula parity, ambiguous joins, temporal semantics and ranking calibration remain re-verification work.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/conflict-of-interest-detection",
  "date": "2026-09-09",
  "baseline": "a3dbf888",
  "digest": "sha256:d9d42fa383865920",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed with explicit counterexamples. External checks are scoped in sources. No consumer runtime, historical incident replay, or application witness refresh.",
  "counterexamples": [
    "A non-financial interest creates a conflict without a realized improper decision.",
    "A 0.35 class multiplier on a very large amount exceeds a 1.0 multiplier on a small amount.",
    "An unknown end date is mistaken for a continuing role.",
    "Two conflicting ballots are stably but arbitrarily selected.",
    "Multiple role ties share a person/company/vote hash.",
    "A negative refund breaks the claimed lower-bound fraction."
  ],
  "sources": [
    {
      "url": "https://legalinstruments.oecd.org/public/doc/130/body-text.en.html",
      "result": "OECD definition and broader interest categories checked; no jurisdiction-specific legal verdict."
    },
    {
      "source": "All nine subject documents and printed score/identifier expressions",
      "result": "Semantic and arithmetic counterexamples assessed; current consumer implementation and historical runs not executed."
    }
  ],
  "documents": {
    "conflict-of-interest-detection.md": {
      "disposition": "clarify",
      "reason": "Clarify legal scope, source fallibility and disclosed sampling."
    },
    "techniques/registry-corroboration-gating.md": {
      "disposition": "clarify",
      "reason": "Clarify evidence grades and bounded queue policy."
    },
    "techniques/tie-class-taxonomy.md": {
      "disposition": "clarify",
      "reason": "Do not treat stewardship as exoneration or title classification as legal fact."
    },
    "techniques/temporal-alignment-of-money-and-role.md": {
      "disposition": "clarify",
      "reason": "Clarify event semantics, temporal precision and scope of exclusions."
    },
    "techniques/statute-relevance-mapping.md": {
      "disposition": "clarify",
      "reason": "Expose temporal and jurisdictional scope and table coverage limits."
    },
    "techniques/vote-versus-interest-join.md": {
      "disposition": "clarify",
      "reason": "Clarify stable identity, recusal exclusions and versioned computation."
    },
    "techniques/triage-signal-scoring.md": {
      "disposition": "clarify",
      "reason": "Cover nonfinite math, correlated evidence and threshold provenance."
    },
    "applications/node--triage-signal-scoring.md": {
      "disposition": "reverify",
      "reason": "Reverify actual imports, numeric guards and tier boundaries."
    },
    "applications/node--vote-versus-interest-join.md": {
      "disposition": "reverify",
      "reason": "Reverify ambiguity handling, identity and date semantics."
    }
  }
}
```

## Apply - 2026-10-10 (ap-rcg-1010)

registry-corroboration-gating gained its first application (node, politicas,
experiment, better). The consumer gates the vote-versus-interest join and the
review tier on registry confirmation. The published per-MP attributable figure is
not gated: its bucket is decided by tie class alone. A replay of the committed
211-tie ledger found 6 of 30 published figures carrying 128.1M CZK from ties the
register had not confirmed. A confirmed-only arm withholds all of it and none of
the confirmed money. The seam was chosen to falsify the gate. Four of the six
"contradicted" ties, 95% of the withheld money, were later confirmed by deeper
register reads, and none had a contradicting record. The technique gained a
check-depth boundary: record whether a check read the current view or the full
history, and treat a current-view no-match as unchecked history, not as a
contradiction. The single-stack attention point does not move: the fleet's one
civic project is node.

## Architecture review - 2026-10-31

Stale since four applications landed (registry-corroboration-gating, statute-relevance-mapping,
temporal-alignment, tie-class-taxonomy). Every 2026-09-09 technique clarify has landed. Two small
internal inconsistencies remain: a golden-path heading that contradicts its body, and a corroboration
state whose definition does not point at the distinction its own procedure requires.
Applications stay reverify.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/conflict-of-interest-detection",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "coverage": "All 13 owned documents read, including the four applications added since 2026-09-09. OECD guidelines re-read 2026-10-31; application arithmetic recomputed. No consumer runtime, ledger replay or application witness refreshed.",
  "counterexamples": [
    "A disclosed pilot screen over one committee is legitimate method, not a shortlist, if it does not imply clearance elsewhere.",
    "A current-view register no-match for a role that ended years ago is unchecked history, not a contradiction.",
    "An apparent conflict exists where it appears private interests could influence duties though they do not in fact.",
    "A non-financial family affiliation is a private interest under the OECD definition yet invisible to this screen.",
    "A 0.35 class multiplier on a very large amount exceeds a 1.0 multiplier on a small amount (retained from 2026-09-09)."
  ],
  "sources": [
    {
      "url": "https://legalinstruments.oecd.org/public/doc/130/body-text.en.html",
      "result": "Re-read 2026-10-31. 'A conflict of interest involves a conflict between the public duty and private interests of a public official, in which the public official has private-capacity interests which could improperly influence the performance of their official duties'; apparent and potential conflicts defined separately; ''private interests' are not limited to financial or pecuniary interests'. Supports the golden path's scope paragraph; no change needed there."
    },
    {
      "source": "Arithmetic and internal consistency across the subject",
      "result": "Recomputed 121.4/128.1 = 94.8%, 128.1 - 121.4 = 6.7; 15 - 8 = 7 edges dropped across 5 + 1 bills. Found the heading/body contradiction in the golden path and the state-vocabulary gap in registry-corroboration-gating."
    }
  ],
  "digest": "sha256-b2:2ba35a7ec2bb7a1a",
  "disposition": "clarify",
  "documents": {
    "conflict-of-interest-detection.md": {
      "disposition": "clarify",
      "reason": "The 2026-09-09 scope clarify landed and matches the OECD text re-read today. The section heading 'Whole population or nothing' contradicts its own body and the closing 'Scope and source limits', which allow a disclosed sample or targeted investigation. Retitle the heading."
    },
    "techniques/registry-corroboration-gating.md": {
      "disposition": "clarify",
      "reason": "The 'Unconfirmed' state definition lumps 'has not run' with 'ran and found nothing' without saying the check record keeps them apart, while procedure step 4 and 'Evidence and queue boundaries' require the distinction. Make the bullet point at it. The 2026-10-10 check-depth boundary is present and matches its application."
    },
    "techniques/tie-class-taxonomy.md": {
      "disposition": "keep",
      "reason": "The stewardship-is-not-exoneration and title-only-classifier limits landed; the unknown-class rule matches the 2026-10-14 application's open finding."
    },
    "techniques/temporal-alignment-of-money-and-role.md": {
      "disposition": "keep",
      "reason": "Event semantics, timezone, start <= end and the impossible-date rule (2026-10-14) are all present; the lower-bound condition on the aligned fraction is stated."
    },
    "techniques/statute-relevance-mapping.md": {
      "disposition": "keep",
      "reason": "The scope paragraph and the repeal-overlap boundary landed; the 141-bill figures match the application (5 of 11 bills lost)."
    },
    "techniques/vote-versus-interest-join.md": {
      "disposition": "keep",
      "reason": "Chamber/term keys, role-level identity, recusal and pinned caches are covered in 'Candidate identity and action scope'."
    },
    "techniques/triage-signal-scoring.md": {
      "disposition": "keep",
      "reason": "Nonfinite logs, refunds, correlated signals and threshold provenance are covered; class multiplier is no longer claimed to guarantee dominance."
    },
    "applications/node--registry-corroboration-gating.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks: 121.4 of 128.1 M CZK is 94.8% (stated 95%), remainder 6.7 M matches. The committed ledger replay and later payloads were not reopened."
    },
    "applications/node--statute-relevance-mapping.md": {
      "disposition": "reverify",
      "reason": "Arm counts are consistent (15 edges/11 bills to 8 edges/6 bills, five bills losing all edges). Committed payload not re-run."
    },
    "applications/node--temporal-alignment-of-money-and-role.md": {
      "disposition": "reverify",
      "reason": "Constructed paired cases are coherent with the technique; the shipped function was not re-read."
    },
    "applications/node--tie-class-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Registry-only, unmeasurable by its own statement; return condition needs the live graph."
    },
    "applications/node--triage-signal-scoring.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09; guards, mirrored formulas and callers not re-read."
    },
    "applications/node--vote-versus-interest-join.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09; duplicate handling, term scoping and the lexical date comparison not re-read."
    }
  }
}
```

### Re-record after apply - 2026-10-31

Both clarifies applied; record against the new digest.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/conflict-of-interest-detection",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "coverage": "All 13 owned documents read, including the four applications added since 2026-09-09. OECD guidelines re-read 2026-10-31; application arithmetic recomputed. No consumer runtime, ledger replay or application witness refreshed.",
  "counterexamples": [
    "A disclosed pilot screen over one committee is legitimate method, not a shortlist, if it does not imply clearance elsewhere.",
    "A current-view register no-match for a role that ended years ago is unchecked history, not a contradiction.",
    "An apparent conflict exists where it appears private interests could influence duties though they do not in fact.",
    "A non-financial family affiliation is a private interest under the OECD definition yet invisible to this screen.",
    "A 0.35 class multiplier on a very large amount exceeds a 1.0 multiplier on a small amount (retained from 2026-09-09)."
  ],
  "sources": [
    {
      "url": "https://legalinstruments.oecd.org/public/doc/130/body-text.en.html",
      "result": "Re-read 2026-10-31. 'A conflict of interest involves a conflict between the public duty and private interests of a public official, in which the public official has private-capacity interests which could improperly influence the performance of their official duties'; apparent and potential conflicts defined separately; ''private interests' are not limited to financial or pecuniary interests'. Supports the golden path's scope paragraph; no change needed there."
    },
    {
      "source": "Arithmetic and internal consistency across the subject",
      "result": "Recomputed 121.4/128.1 = 94.8%, 128.1 - 121.4 = 6.7; 15 - 8 = 7 edges dropped across 5 + 1 bills. Found the heading/body contradiction in the golden path and the state-vocabulary gap in registry-corroboration-gating."
    }
  ],
  "digest": "sha256-b2:6652049b0f2d055f",
  "disposition": "keep",
  "documents": {
    "conflict-of-interest-detection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: heading 'Whole population or nothing' now reads 'Whole population, or a disclosed selection', matching its body and the scope section."
    },
    "techniques/registry-corroboration-gating.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the Unconfirmed bullet now says the check record (step 4) keeps 'not run' and 'found nothing' apart while both sit in this state."
    },
    "techniques/tie-class-taxonomy.md": {
      "disposition": "keep",
      "reason": "The stewardship-is-not-exoneration and title-only-classifier limits landed; the unknown-class rule matches the 2026-10-14 application's open finding."
    },
    "techniques/temporal-alignment-of-money-and-role.md": {
      "disposition": "keep",
      "reason": "Event semantics, timezone, start <= end and the impossible-date rule (2026-10-14) are all present; the lower-bound condition on the aligned fraction is stated."
    },
    "techniques/statute-relevance-mapping.md": {
      "disposition": "keep",
      "reason": "The scope paragraph and the repeal-overlap boundary landed; the 141-bill figures match the application (5 of 11 bills lost)."
    },
    "techniques/vote-versus-interest-join.md": {
      "disposition": "keep",
      "reason": "Chamber/term keys, role-level identity, recusal and pinned caches are covered in 'Candidate identity and action scope'."
    },
    "techniques/triage-signal-scoring.md": {
      "disposition": "keep",
      "reason": "Nonfinite logs, refunds, correlated signals and threshold provenance are covered; class multiplier is no longer claimed to guarantee dominance."
    },
    "applications/node--registry-corroboration-gating.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks: 121.4 of 128.1 M CZK is 94.8% (stated 95%), remainder 6.7 M matches. The committed ledger replay and later payloads were not reopened."
    },
    "applications/node--statute-relevance-mapping.md": {
      "disposition": "reverify",
      "reason": "Arm counts are consistent (15 edges/11 bills to 8 edges/6 bills, five bills losing all edges). Committed payload not re-run."
    },
    "applications/node--temporal-alignment-of-money-and-role.md": {
      "disposition": "reverify",
      "reason": "Constructed paired cases are coherent with the technique; the shipped function was not re-read."
    },
    "applications/node--tie-class-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Registry-only, unmeasurable by its own statement; return condition needs the live graph."
    },
    "applications/node--triage-signal-scoring.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09; guards, mirrored formulas and callers not re-read."
    },
    "applications/node--vote-versus-interest-join.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09; duplicate handling, term scoping and the lexical date comparison not re-read."
    }
  }
}
```
