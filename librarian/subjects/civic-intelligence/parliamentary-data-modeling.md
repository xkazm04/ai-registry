---
domain: civic-intelligence
subject: parliamentary-data-modeling
last_touched: 2026-10-22
touched_by: intake
dry_streak: 0
---

# parliamentary-data-modeling

## Architecture review - 2026-09-09

Retain all six techniques with explicit identity, temporal and snapshot limits. Both applications require current consumer verification, especially deletion reconciliation, missing scopes and manual role exemptions. No dump reload or runtime re-verification was performed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/parliamentary-data-modeling",
  "date": "2026-09-09",
  "baseline": "a3dbf888",
  "digest": "sha256:efbd6fc2f06f3cbf",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed with explicit counterexamples. External checks are scoped in sources. No consumer runtime, historical incident replay, or application witness refresh.",
  "counterexamples": [
    "A seated member has no observed activity because ingestion is incomplete.",
    "One human has multiple publisher person records.",
    "An end date is unknown rather than a documented current affiliation.",
    "A term with no roll calls still contains legitimate excuses.",
    "Correcting a start date changes a natural key and leaves a stale old row.",
    "An external officeholder is not a voting member.",
    "Political-party membership differs from both list and club."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1301",
      "result": "Checked duplicate-person warning, discriminator, dates, sentinel and electoral/club distinction."
    },
    {
      "url": "https://www.popoloproject.com/specs/membership.html",
      "result": "Separate membership relation checked; not a universal institution or boundary rule."
    },
    {
      "url": "https://www.popoloproject.com/specs/post.html",
      "result": "Post/office identity distinguished from occupants."
    }
  ],
  "documents": {
    "parliamentary-data-modeling.md": {
      "disposition": "clarify",
      "reason": "Correct person uniqueness, mandate evidence and snapshot reconciliation."
    },
    "techniques/cross-term-registry-loading.md": {
      "disposition": "clarify",
      "reason": "Handle eventless terms, key-changing corrections and authoritative scope."
    },
    "techniques/mandate-vs-person-identity.md": {
      "disposition": "clarify",
      "reason": "Clarify tenure classification, denominators and source identity."
    },
    "techniques/membership-window-modeling.md": {
      "disposition": "clarify",
      "reason": "Preserve source boundaries and distinguish interval corrections from new stints."
    },
    "techniques/office-vs-plain-membership.md": {
      "disposition": "clarify",
      "reason": "Handle unknown discriminators and versioned projections."
    },
    "techniques/party-club-vs-electoral-list.md": {
      "disposition": "clarify",
      "reason": "Avoid inferred whip, independence and electoral-system assumptions."
    },
    "techniques/term-and-chamber-scoping.md": {
      "disposition": "clarify",
      "reason": "Scope the organization model and retain unknown institutional mappings."
    },
    "applications/node--cross-term-registry-loading.md": {
      "disposition": "reverify",
      "reason": "Reverify snapshot reconciliation and eventless scopes; counts not refreshed."
    },
    "applications/node--office-vs-plain-membership.md": {
      "disposition": "reverify",
      "reason": "Reverify role mapping and retain manual-classification deviation."
    }
  }
}
```

## Apply - 2026-10-10 (intake, run intake-apply-mvpi-1010)

First application of `mandate-vs-person-identity`, an experiment on politicas with
verdict `better`. The run picked two seams because each could falsify the technique.

- **Denominators (the defect).** The event tables are keyed by mandate. The
  participation and attendance denominators are keyed by the term. Replayed on the
  public term-10 dumps, the floor held: 0 of 193 full-term mandates moved. 10 short
  mandates moved, in opposite directions on the two rates. Under the shipped rule,
  8 of the 15 lowest participation rates belong to short mandates. This refuted
  the project's own framing of the fix (Q-effort-5, "mandate_start_date-aware"):
  for one replacement, a window from the start date counts 1,738 roll calls, while
  the publisher's per-mandate rows count 1,595. Shipped as the first step of a
  `task`: the helper, its test and the plan are on politicas master (`5af5c7f`,
  pushed). It is not yet wired in, because wiring it changes a published formula
  and needs a writer run against the store.
- **Never-seated (held).** The activity-signature classifier agreed 4 of 4 with
  hand research. The bulk tables hold no better seating evidence: the pre-oath
  code is unused, and excuse rows were filed after one member had given up the
  seat.
- **Technique gained** a boundary section: the opportunity set is the publisher's
  rows, a term denominator errs in opposite directions on the two rate kinds, and
  neither a missing pre-oath code nor an excuse row proves seating.
- **Not moved:** the single-stack attention point. The only civic project in the
  fleet is node.

## Apply - 2026-10-22 (intake, run intake-apply-tacs-1022)

`term-and-chamber-scoping`, first application, on politicas, mode `task`, verdict
`better`, proof `ab-paired`.

- **Ingest half held.** One term-code function, a visibly synthetic fallback, ids and
  codes stamped on mandates and roll calls, and identity never term-scoped. A source
  test pins the single definition.
- **Read half refuted, at the seam chosen to falsify.** The store's term-scoped
  membership read implemented "ancestor" as "parent". On the public dump it returns
  1,345 of 3,260 current-term membership rows, and terms 4 to 9 show the same shape.
  The dropped rows (subcommittees, interparliamentary groups) had been recorded as
  "0 subcommittee memberships" in three comments and a prose-gate exclusion, while the
  contribution formula lists subcommittees as a committee type.
- **Shipped:** corrected comments, the owner decision and a plan on politicas master,
  pushed (`a0f83cb`). The read fix and its fixture test (A 8/9, B 9/9) are on a local
  branch (`401150a`). They wait because the next recompute through a depth-correct read
  would move the committee component for 51 of 207 members (+361.3 points).
- **Technique gained** a boundary section: ancestry is transitive, and a body type that
  never receives a row is a scope defect until proven otherwise.
- **Not moved:** the single-stack attention point. The only civic project in the
  fleet is node. Return: when a second-stack civic consumer joins the fleet.

## Architecture review - 2026-10-31

Re-review of all 13 documents. The 2026-09-09 clarifies are in the text. Since then four applications and two boundary sections arrived. Two wording defects remain: the spine and the identity technique still say most publishers key events to the mandate, which Popolo's vote spec refutes, and the party technique lists three affiliations and then says 'both'.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/parliamentary-data-modeling",
  "date": "2026-10-31",
  "baseline": "c283f0c50",
  "digest": "sha256-b2:8694b54aa1c6544b",
  "disposition": "clarify",
  "coverage": "All 13 current documents read in full. Prior clarifies checked by diff against the 2026-09-09 baselines; applications' internal arithmetic recomputed. Primary sources listed were opened this run unless marked otherwise. Not evaluated: any connected-project tree, dump replay or test run. No verification date refreshed.",
  "counterexamples": [
    "A Popolo-shaped export keys each ballot to a person, so a mandate-keyed ingest has no mandate id to keep.",
    "A subcommittee two levels below the chamber falls out of a parent-only term read and is then counted as zero.",
    "A window counted from the mandate start over-counts a replacement's eligible roll calls when the oath comes later.",
    "A sitting member with no open club window is independent today, not a member of the club they last left.",
    "One human has multiple publisher person records (retained from 2026-09-09)."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1302",
      "result": "Re-read 2026-10-31. hl_poslanec.id_poslanec is 'Identifikátor poslance, viz poslanec:id_poslanec' (the mandate row). Codes: 'A' ano, 'B' or 'N' ne, 'C' zdržel se, 'F' nehlasoval, '@' nepřihlášen, 'M' omluven, 'W' hlasování před složením slibu, 'K' zdržel se/nehlasoval; 'Od účinnosti novely jednacího řádu 90/1995 Sb. se nerozlišuje zdržel se a nehlasoval'. Manual votes: 'R - ruční (nejsou známy hlasování jednotlivých poslanců)'; 'E' marks votes with data missing through a technical fault. zmatecne votes are those 'na jejich výsledek nebyl brán zřetel'; hl_check records challenges, where mode 1 is only a note for the transcript. Supports the vocabulary, merged-category ceiling, coverage and challenge-is-not-annulment claims."
    },
    {
      "url": "https://www.popoloproject.com/specs/vote.html",
      "result": "Read 2026-10-31. A vote's voter is 'The person or organization that is voting'. Popolo-shaped data therefore keys ballots to persons, not mandates, which refutes the 'most publishers' exports reference the mandate id' generalisation and supports 'follow each table's actual foreign key'."
    },
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1301",
      "result": "Not re-opened this run; the 2026-09-09 record checked the duplicate-person warning, discriminator, dates and sentinel. hl_poslanec (k=1302) links ballots to poslanec, the mandate table."
    }
  ],
  "documents": {
    "parliamentary-data-modeling.md": {
      "disposition": "clarify",
      "reason": "The 2026-09-09 clarifies landed (duplicate person records, no-observed-activity is not proof, re-upsert does not propagate deletions). Still owed: the spine says the mandate id is what event tables reference 'in most publishers' exports'. PSP does (k=1302), but Popolo's vote names a person or organization as voter, and the technique's own later section says not to assume mandate ids. Soften to 'many', naming the per-table foreign key rule."
    },
    "techniques/mandate-vs-person-identity.md": {
      "disposition": "clarify",
      "reason": "Opportunity-set and seating-evidence boundary (2026-10-10) is internally consistent with its application (0.807 x 1,595 / 1,738 = 0.741; 193 + 10 + 4 = 207). Owed: the opening 'most publishers' event tables reference the mandate id' contradicts the document's own 'instead of assuming all publishers use mandate IDs' and Popolo's person-keyed voter; soften."
    },
    "techniques/term-and-chamber-scoping.md": {
      "disposition": "keep",
      "reason": "The 2026-10-22 transitive-ancestry boundary is consistent with its application: 1,915 of 3,260 dropped rows is 58.7%, stated as 59%; 781 + 1,134 = 1,915. Continuing-institution and unknown-scope clarifies from 2026-09-09 are present."
    },
    "techniques/membership-window-modeling.md": {
      "disposition": "keep",
      "reason": "2026-09-09 clarifies landed: unknown end is a separate state, raw boundaries retained, corrections versus new stints, nesting only where the institution requires it."
    },
    "techniques/party-club-vs-electoral-list.md": {
      "disposition": "clarify",
      "reason": "Prior clarifies landed. Internal inconsistency introduced by them: the opening lists three affiliations (party, list, club) and then says the model 'must keep both answers'. Fix the count."
    },
    "techniques/office-vs-plain-membership.md": {
      "disposition": "keep",
      "reason": "Unknown discriminator stays unknown, projections are rebuilt, eligibility for headcounts and heuristic weights are declared: the 2026-09-09 clarifies are present."
    },
    "techniques/cross-term-registry-loading.md": {
      "disposition": "keep",
      "reason": "Eventless terms, key-changing corrections, conflicting duplicates and authoritative scope are present. The earlier 'keep only rows whose term id is present in this dump's own events' is qualified by the closing section."
    },
    "applications/node--cross-term-registry-loading.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09. The 1.05M-row and 71-collision observations and deletion reconciliation were not reproduced; no consumer tree reopened."
    },
    "applications/node--office-vs-plain-membership.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Discriminator meanings match k=1301 per the prior record; the hand-kept role-window list remains a disclosed deviation; consumer not reopened."
    },
    "applications/node--mandate-vs-person-identity.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (0 of 193 floor, 10 moved, 0.741 date-window figure). The replay over public dumps and the private tree at 5f88b00/5af5c7f were not re-run; verified_on left at 2026-10-10."
    },
    "applications/node--membership-window-modeling.md": {
      "disposition": "reverify",
      "reason": "Fixture-only (n=5) A/B with a stated cost; no live dump measured. Private tree not reopened."
    },
    "applications/node--party-club-vs-electoral-list.md": {
      "disposition": "reverify",
      "reason": "Fixture A/B with the live independent count explicitly unmeasured. Private tree not reopened."
    },
    "applications/node--term-and-chamber-scoping.md": {
      "disposition": "reverify",
      "reason": "Table arithmetic checked (1,915 = 781 + 1,134; 58.7% missing). The dump replay and the branch fix were not re-run."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the three clarify items above. Applications untouched and keep `reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/parliamentary-data-modeling",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:f4afaad144597153",
  "disposition": "reverify",
  "coverage": "All 13 documents decided. The clarify items owed by the earlier 2026-10-31 record were applied and re-read; other documents are byte-unchanged and keep their dispositions. No private tree or runtime reopened; no verification date refreshed.",
  "counterexamples": [
    "A Popolo-shaped export keys each ballot to a person, so a mandate-keyed ingest has no mandate id to keep.",
    "A subcommittee two levels below the chamber falls out of a parent-only term read and is then counted as zero.",
    "A window counted from the mandate start over-counts a replacement's eligible roll calls when the oath comes later.",
    "A sitting member with no open club window is independent today, not a member of the club they last left.",
    "One human has multiple publisher person records (retained from 2026-09-09)."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1302",
      "result": "Re-read 2026-10-31. hl_poslanec.id_poslanec is 'Identifikátor poslance, viz poslanec:id_poslanec' (the mandate row). Codes: 'A' ano, 'B' or 'N' ne, 'C' zdržel se, 'F' nehlasoval, '@' nepřihlášen, 'M' omluven, 'W' hlasování před složením slibu, 'K' zdržel se/nehlasoval; 'Od účinnosti novely jednacího řádu 90/1995 Sb. se nerozlišuje zdržel se a nehlasoval'. Manual votes: 'R - ruční (nejsou známy hlasování jednotlivých poslanců)'; 'E' marks votes with data missing through a technical fault. zmatecne votes are those 'na jejich výsledek nebyl brán zřetel'; hl_check records challenges, where mode 1 is only a note for the transcript. Supports the vocabulary, merged-category ceiling, coverage and challenge-is-not-annulment claims."
    },
    {
      "url": "https://www.popoloproject.com/specs/vote.html",
      "result": "Read 2026-10-31. A vote's voter is 'The person or organization that is voting'. Popolo-shaped data therefore keys ballots to persons, not mandates, which refutes the 'most publishers' exports reference the mandate id' generalisation and supports 'follow each table's actual foreign key'."
    },
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1301",
      "result": "Not re-opened this run; the 2026-09-09 record checked the duplicate-person warning, discriminator, dates and sentinel. hl_poslanec (k=1302) links ballots to poslanec, the mandate table."
    }
  ],
  "documents": {
    "parliamentary-data-modeling.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'what ballots, absences and contact records reference in most publishers' exports' now reads 'In many publishers' exports the mandate id ... is what ballots ... reference; others key the voter as a person, so follow each table's actual foreign key'. The 2026-09-09 clarifies (person uniqueness, mandate evidence, snapshot reconciliation) are in the text."
    },
    "techniques/mandate-vs-person-identity.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'most publishers' event tables ... reference the mandate id' became 'many publishers' event tables ... while other schemas name the voter as a person'. The 2026-10-10 opportunity-set boundary checked: 0.807 x 1,595 / 1,738 = 0.741, matching the application."
    },
    "techniques/term-and-chamber-scoping.md": {
      "disposition": "keep",
      "reason": "The 2026-10-22 transitive-ancestry boundary is consistent with its application: 1,915 of 3,260 dropped rows is 58.7%, stated as 59%; 781 + 1,134 = 1,915. Continuing-institution and unknown-scope clarifies from 2026-09-09 are present."
    },
    "techniques/membership-window-modeling.md": {
      "disposition": "keep",
      "reason": "2026-09-09 clarifies landed: unknown end is a separate state, raw boundaries retained, corrections versus new stints, nesting only where the institution requires it."
    },
    "techniques/party-club-vs-electoral-list.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the opening named three affiliations and then said 'must keep both answers'; it now says 'must keep these answers apart'. Whip-inference, independence-coverage and electoral-system clarifies are present; the 2026-10-14 current-map decision rule is consistent with its application."
    },
    "techniques/office-vs-plain-membership.md": {
      "disposition": "keep",
      "reason": "Unknown discriminator stays unknown, projections are rebuilt, eligibility for headcounts and heuristic weights are declared: the 2026-09-09 clarifies are present."
    },
    "techniques/cross-term-registry-loading.md": {
      "disposition": "keep",
      "reason": "Eventless terms, key-changing corrections, conflicting duplicates and authoritative scope are present. The earlier 'keep only rows whose term id is present in this dump's own events' is qualified by the closing section."
    },
    "applications/node--cross-term-registry-loading.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09. The 1.05M-row and 71-collision observations and deletion reconciliation were not reproduced; no consumer tree reopened."
    },
    "applications/node--office-vs-plain-membership.md": {
      "disposition": "reverify",
      "reason": "Unchanged. Discriminator meanings match k=1301 per the prior record; the hand-kept role-window list remains a disclosed deviation; consumer not reopened."
    },
    "applications/node--mandate-vs-person-identity.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (0 of 193 floor, 10 moved, 0.741 date-window figure). The replay over public dumps and the private tree at 5f88b00/5af5c7f were not re-run; verified_on left at 2026-10-10."
    },
    "applications/node--membership-window-modeling.md": {
      "disposition": "reverify",
      "reason": "Fixture-only (n=5) A/B with a stated cost; no live dump measured. Private tree not reopened."
    },
    "applications/node--party-club-vs-electoral-list.md": {
      "disposition": "reverify",
      "reason": "Fixture A/B with the live independent count explicitly unmeasured. Private tree not reopened."
    },
    "applications/node--term-and-chamber-scoping.md": {
      "disposition": "reverify",
      "reason": "Table arithmetic checked (1,915 = 781 + 1,134; 58.7% missing). The dump replay and the branch fix were not re-run."
    }
  }
}
```
