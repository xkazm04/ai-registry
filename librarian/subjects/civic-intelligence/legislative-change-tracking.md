---
domain: civic-intelligence
subject: legislative-change-tracking
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# legislative-change-tracking

## Architecture review - 2026-09-09

Retain the subject with bounded extraction and explicit historical/current distinctions. Resolve collection-year derivation against publisher records and reverify both applications before new witnesses.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/legislative-change-tracking",
  "date": "2026-09-09",
  "baseline": "a3dbf888",
  "digest": "sha256:98eb1bce56a2d31a",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed with explicit counterexamples. External checks are scoped in sources. No consumer runtime, historical incident replay, or application witness refresh.",
  "counterexamples": [
    "A returned bill has reached a stronger historical stage than its current state.",
    "An unknown later committee event follows a known referral.",
    "A first signatory did not draft the text.",
    "A single proposer is recorded directly on the print row.",
    "A publication and history event fall in different years.",
    "Two overlapping edits compose or commence on different dates.",
    "A novel instruction fails the grammar but remains an amendment."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1303",
      "result": "Checked transition, proposer and collection-year field contracts; discrepancies need consumer verification."
    },
    {
      "source": "All nine subject documents",
      "result": "Assessed milestone, extraction and identity counterexamples; historical batch incidents and consumer runtime not replayed."
    }
  ],
  "documents": {
    "legislative-change-tracking.md": {
      "disposition": "clarify",
      "reason": "Correct proposer and publication-year assumptions against primary schema."
    },
    "techniques/amendment-instruction-grammar.md": {
      "disposition": "clarify",
      "reason": "Bound grammar claims by document context and explicit unknowns."
    },
    "techniques/bill-fate-dating.md": {
      "disposition": "clarify",
      "reason": "Clarify transition semantics and independently supported publication fields."
    },
    "techniques/committee-routing-reconstruction.md": {
      "disposition": "clarify",
      "reason": "Distinguish historical routing summaries, unknown events and current assignments."
    },
    "techniques/sponsorship-and-rapporteur-roles.md": {
      "disposition": "clarify",
      "reason": "Distinguish role assignment from authorship and work performed."
    },
    "techniques/statute-citation-extraction.md": {
      "disposition": "clarify",
      "reason": "Require full legal identity, evidence spans and explicit extraction limits."
    },
    "techniques/statute-collision-clustering.md": {
      "disposition": "clarify",
      "reason": "Require version-aware targets and qualify candidate counts."
    },
    "applications/node--bill-fate-dating.md": {
      "disposition": "reverify",
      "reason": "Reverify source-contract discrepancies and nonmonotonic states."
    },
    "applications/node--statute-collision-clustering.md": {
      "disposition": "reverify",
      "reason": "Reverify version mixing, target attribution and historical coverage."
    }
  }
}
```

## Intake apply - 2026-10-22

sponsorship-and-rapporteur-roles, second application (politicas, code, better,
pushed). The seam was chosen to falsify the contradictory-duplicate rule and
found one live case. The replay also showed that the register numbers
joined-later signatures from 1 again (21 of 23 mixed bills), so "rank 1"
alone gave 21 bills a second first signatory. The technique gained a boundary
section: rank restarts per partition, and a list with no submission-time row
cannot supply the proposer. The application is
`applications/node--sponsorship-and-rapporteur-roles.md`. Open: the six bills
whose table lacks the named proposer, and the authored-bill total that still
counts rows. Still a single stack (node). No second stack in the fleet carries
this seam.

## Intake apply - 2026-10-22 (statute-citation-extraction)

statute-citation-extraction, first application (politicas, code, better,
pushed). The title extractor already held the technique's pattern rules, so
the seam was chosen to falsify its pointing-is-not-amending rule on titles.
Titles name each target's amendment history after "as amended by", and the
extractor read those acts as targets. That gave two false edges in the live
term and 856 of 6,890 across all terms. The technique gained a decision rule:
separate history from targets by the title's own grammar, and know that case
alone fails after a generic as-amended phrase. The application is
`applications/node--statute-citation-extraction.md`. Open: surface the history
count, and the old titles whose targets are cited without the dot. Still a
single stack (node). No second stack in the fleet carries this seam.

## Architecture review - 2026-10-31

Stale since four applications landed. The 2026-09-09 technique clarifies have landed. The golden
path lagged its own sponsorship technique in three sentences, the technique missed signature
withdrawal (documented in the publisher's schema), and the bill-fate application still presented a
superseded sponsorship rule as confirmation. Applications otherwise stay reverify.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/legislative-change-tracking",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "coverage": "All 13 owned documents read, including the four applications added since 2026-09-09. PSP print-register schema re-read 2026-10-31. No consumer runtime, dump replay or application witness refreshed.",
  "counterexamples": [
    "A joined-later row at rank 1 is the first joiner, not the responsible signatory.",
    "A member who withdrew a signature still appears in the proposer list.",
    "A committee rapporteur is appointed but the committee never reports.",
    "A bill title names its target's amendment history, which the bill does not amend.",
    "A returned bill has reached a stronger historical stage than its current state (retained from 2026-09-09)."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1303",
      "result": "Re-read 2026-10-31. predkladatel: poradi 'Pořadí osoby v seznamu', typ '0 - předkladatel, 1 - jako předkladatel se připojil později'. navrh_podpis stav '1 - připojil podpis, 10 - vzal podpis zpět' (basis for the withdrawal clarify). tisky id_navrh filled only for non-government bills (id_druh = 2). hist zaver_sb_cislo: 'číslo za lomítkem se vezme jako část rok z hist:datum' (collection year from the history date, the discrepancy the bill-fate application still owes). hist_vybory typ '1 - navrženo k přikázání, 2 - přikázáno, 3 - projednáno iniciativně' and garancni 1 or 2 for the lead committee."
    },
    {
      "source": "Internal consistency across the subject",
      "result": "Golden path vs sponsorship technique on authorship, rank and rapporteur weight; bill-fate application vs the 2026-10-22 sponsorship application; recomputed citation-history ratios."
    }
  ],
  "digest": "sha256-b2:a63c6d5f390c3952",
  "disposition": "clarify",
  "documents": {
    "legislative-change-tracking.md": {
      "disposition": "clarify",
      "reason": "Three sentences contradict the sponsorship technique: 'real authorship lives in the signature table' (the technique says drafting authorship is not in the record), 'position one carries responsibility' (rank restarts for joiners, 2026-10-22), and 'the committee-level rapporteur is the strongest did-the-analytical-work signal' (the technique says appointment does not show work and relative workload needs activity evidence). Align them."
    },
    "techniques/amendment-instruction-grammar.md": {
      "disposition": "keep",
      "reason": "The extraction-preconditions section landed and is exactly the gap the 2026-10-13 application probed (quoted instructions)."
    },
    "techniques/bill-fate-dating.md": {
      "disposition": "keep",
      "reason": "Current state vs strongest-ever milestone, independent identifiers and publication-step classes landed; matches the PSP schema's derivation of the collection year from hist.datum."
    },
    "techniques/committee-routing-reconstruction.md": {
      "disposition": "keep",
      "reason": "Historical-vs-current split landed; the unrecognised-codes decision rule matches its 2026-10-14 application; the ladder codes match the PSP hist_vybory documentation."
    },
    "techniques/sponsorship-and-rapporteur-roles.md": {
      "disposition": "clarify",
      "reason": "The PSP schema documents a signature-event table whose status marks '1 - připojil podpis, 10 - vzal podpis zpět' (added / withdrew signature). The technique never mentions withdrawal, so a withdrawn signature still counts as sponsorship. Add a rule. The rank-restart boundary and the predkladatel typ flag (0 proposer, 1 joined later) match the source."
    },
    "techniques/statute-citation-extraction.md": {
      "disposition": "keep",
      "reason": "Identity and coverage limits landed; the amendment-history rule's ratios (856/6,890 = one in eight; 2/185 = one in ninety) match the application."
    },
    "techniques/statute-collision-clustering.md": {
      "disposition": "keep",
      "reason": "Version-aware comparison and candidate-count wording landed."
    },
    "applications/node--amendment-instruction-grammar.md": {
      "disposition": "reverify",
      "reason": "Unmeasurable by its own statement; the print cache it needs was absent."
    },
    "applications/node--bill-fate-dating.md": {
      "disposition": "clarify",
      "reason": "Its 'Sponsorship confirmation' paragraph still presents lowest-rank dedupe and the rank-1 reading as confirming the standard; node--sponsorship-and-rapporteur-roles (2026-10-22) superseded both. Add a pointer. The publication 'keep the latest' and collection-year discrepancies remain reverify against records."
    },
    "applications/node--committee-routing-reconstruction.md": {
      "disposition": "reverify",
      "reason": "Paired A/B coherent (1 hidden row to 0, 11,383 pairs unchanged); live dump not re-read."
    },
    "applications/node--sponsorship-and-rapporteur-roles.md": {
      "disposition": "reverify",
      "reason": "Counts are internally consistent (raw two-rank-1 count 21 to 20 because the one contradictory duplicate became rank unknown; 27,322 of 27,323 pairs unchanged). Dump and store not re-read; withdrawn signatures not examined."
    },
    "applications/node--statute-citation-extraction.md": {
      "disposition": "reverify",
      "reason": "Paired A/B coherent; store not read, so live edges unmeasured by its own statement."
    },
    "applications/node--statute-collision-clustering.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09."
    }
  }
}
```

### Re-record after apply - 2026-10-31

All three clarifies applied; record against the new digest. The bill-fate application's
publication-step and collection-year items stay owed: they need specific records, not text.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/legislative-change-tracking",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "coverage": "All 13 owned documents read, including the four applications added since 2026-09-09. PSP print-register schema re-read 2026-10-31. No consumer runtime, dump replay or application witness refreshed.",
  "counterexamples": [
    "A joined-later row at rank 1 is the first joiner, not the responsible signatory.",
    "A member who withdrew a signature still appears in the proposer list.",
    "A committee rapporteur is appointed but the committee never reports.",
    "A bill title names its target's amendment history, which the bill does not amend.",
    "A returned bill has reached a stronger historical stage than its current state (retained from 2026-09-09)."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1303",
      "result": "Re-read 2026-10-31. predkladatel: poradi 'Pořadí osoby v seznamu', typ '0 - předkladatel, 1 - jako předkladatel se připojil později'. navrh_podpis stav '1 - připojil podpis, 10 - vzal podpis zpět' (basis for the withdrawal clarify). tisky id_navrh filled only for non-government bills (id_druh = 2). hist zaver_sb_cislo: 'číslo za lomítkem se vezme jako část rok z hist:datum' (collection year from the history date, the discrepancy the bill-fate application still owes). hist_vybory typ '1 - navrženo k přikázání, 2 - přikázáno, 3 - projednáno iniciativně' and garancni 1 or 2 for the lead committee."
    },
    {
      "source": "Internal consistency across the subject",
      "result": "Golden path vs sponsorship technique on authorship, rank and rapporteur weight; bill-fate application vs the 2026-10-22 sponsorship application; recomputed citation-history ratios."
    }
  ],
  "digest": "sha256-b2:c5f160215de46ea4",
  "disposition": "keep",
  "documents": {
    "legislative-change-tracking.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the signature table now carries 'member attribution (political responsibility, not drafting)'; responsibility sits at position one 'on the submission-time list' with joiners' numbering able to restart; the rapporteur sentence now says an appointment at any level does not by itself show the analytical work was done."
    },
    "techniques/amendment-instruction-grammar.md": {
      "disposition": "keep",
      "reason": "The extraction-preconditions section landed and is exactly the gap the 2026-10-13 application probed (quoted instructions)."
    },
    "techniques/bill-fate-dating.md": {
      "disposition": "keep",
      "reason": "Current state vs strongest-ever milestone, independent identifiers and publication-step classes landed; matches the PSP schema's derivation of the collection year from hist.datum."
    },
    "techniques/committee-routing-reconstruction.md": {
      "disposition": "keep",
      "reason": "Historical-vs-current split landed; the unrecognised-codes decision rule matches its 2026-10-14 application; the ladder codes match the PSP hist_vybory documentation."
    },
    "techniques/sponsorship-and-rapporteur-roles.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: new rule, a withdrawn signature is not a current sponsorship; read the signature-event table before counting and keep the withdrawn row as history."
    },
    "techniques/statute-citation-extraction.md": {
      "disposition": "keep",
      "reason": "Identity and coverage limits landed; the amendment-history rule's ratios (856/6,890 = one in eight; 2/185 = one in ninety) match the application."
    },
    "techniques/statute-collision-clustering.md": {
      "disposition": "keep",
      "reason": "Version-aware comparison and candidate-count wording landed."
    },
    "applications/node--amendment-instruction-grammar.md": {
      "disposition": "reverify",
      "reason": "Unmeasurable by its own statement; the print cache it needs was absent."
    },
    "applications/node--bill-fate-dating.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: the sponsorship paragraph now points to node--sponsorship-and-rapporteur-roles as superseding the lowest-rank dedupe and rank-1 reading; verified_on unchanged. The publication 'keep the latest' and collection-year items remain owed against specific records."
    },
    "applications/node--committee-routing-reconstruction.md": {
      "disposition": "reverify",
      "reason": "Paired A/B coherent (1 hidden row to 0, 11,383 pairs unchanged); live dump not re-read."
    },
    "applications/node--sponsorship-and-rapporteur-roles.md": {
      "disposition": "reverify",
      "reason": "Counts are internally consistent (raw two-rank-1 count 21 to 20 because the one contradictory duplicate became rank unknown; 27,322 of 27,323 pairs unchanged). Dump and store not re-read; withdrawn signatures not examined."
    },
    "applications/node--statute-citation-extraction.md": {
      "disposition": "reverify",
      "reason": "Paired A/B coherent; store not read, so live edges unmeasured by its own statement."
    },
    "applications/node--statute-collision-clustering.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09."
    }
  }
}
```
