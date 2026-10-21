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
