# Reviewing a subject

Resolve the subject through its bundle index. Read the golden path and every owned
technique/application; the unit is complete only when each document has a decision.
Record the baseline revision, trigger, intended benefit, failure if ignored, boundary
and counterexamples. Check primary sources for unstable or disputed claims. Separate
reading a source from executing the referenced software. Unavailable evidence becomes
`reverify` work, never a refreshed `verified_on` date.

Use `keep`, `clarify`, `split`, `merge`, `deprecate`, or `reverify`. Write the decision
in the existing `librarian/subjects/<bundle>/<subject>.md` note. Preserve older entries
and explicitly retract an old inference when new evidence contradicts it. The
[agent-chaining note](../librarian/subjects/software-engineering/agent-chaining.md)
is the first worked architecture-review record.

The machine-readable decision is a JSON fence following
`<!-- architecture-review:v1 -->`. Its fields are `subject` (`bundle/slug`), `date`,
`baseline` (Git commit), current subject `digest`, overall `disposition`, `coverage`,
`counterexamples`, `sources`, and `documents`. The last field maps every relative
golden-path, technique and application filename to a disposition and reason.
Use `hashBundle(subjectDirectory).hash` from `scripts/lib/bundle-hash.mjs`; no manually
invented digest or runtime witness. The most recent record is the current decision;
older records remain history.

```sh
node scripts/review-coverage.mjs
node scripts/review-coverage.mjs --json
node scripts/review-coverage.mjs --require-complete
```

The default validates records and reports pending/stale coverage. The strict command
fails until every subject has a complete decision against current bytes. Changed
content makes an old record stale, without erasing it. A valid record does not prove
sound reasoning or source truth; those remain review responsibilities. A `reverify`
disposition completes the assessment while explicitly leaving its evidence unresolved.

Recipe review uses the same questions at the recipe/topic grain, followed by version
discipline and the existing assay/harvest evaluation where useful. A seed remains a
seed until actual use supports maturity changes. The architecture inventory is a
dated baseline; this live coverage report and the subject notes track execution.
