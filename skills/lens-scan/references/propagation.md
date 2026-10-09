# Baseline upgrade and propagation

Read from `SKILL.md` phase 6. The point: when one feature shows a better way to do
something, the company's standard should move, and every similar site should then be
measured against the new standard - not re-discovered one scan at a time.

## 1. The baseline-upgrade item (propose phase)

A finding qualifies when it generalizes inside this product: the same shape exists, or
will exist, in other features, and a rule stated as "when X, do Y, because Z" would
have prevented the defect everywhere. Propose it as:

- `--kind baseline-upgrade`, `--standard house:<subject>/<line-id>` (the line it adds
  or changes), `--lens` the lens that found it, `--feature` the feature it was found in;
- `metric` and `expected_delta` when the upgrade itself moves a number on that feature
  (often it does not; the children carry the numbers);
- a body in the five sections, where **Description** quotes the exact house-standard
  edit (the new or changed line, with its id and the frontmatter change if it
  `overrides` or `extends` a technique) and **Flow** ends with the **site signature**:

```markdown
### Site signature
- subject: <registry subject slug>
- grep: <a pattern that matches the old shape, and the file glob it runs over>
- structure: <optional: kind = ui, capability in [...], or tags containing ...>
```

A good signature is narrow enough that most of its hits are real sites, and is stated
so another run reproduces the same hit list. Over-broad (`useState`) or
name-dependent (`ProductTable`) patterns are not signatures.

The upgrade is a human decision like any other: it waits in the review UI. Once it is
approved, phase 5 lands the edit to `.ai/house/standards/<subject>.md` (and only that
edit) and records `done` with the commit sha.

## 2. The propagation run

`run-start --phase propagate`, scoped to one landed upgrade. A propagation run for an
upgrade that is not `done` is refused by the method (the house rule it would judge
against does not exist yet).

**Find the sites**, as the union of:

1. **Subject reach** - every feature whose contexts the registry map joins to the
   upgrade's subject (`.ai/registry-map.json`, the context's `subjects[]`), excluding
   pairs the map marks `not-applicable`.
2. **Signature hits** - the signature's grep over the features' files, and its
   structure query over the app-structure.

A feature in (1) with no signature hit is judged once against the new line and gets a
`coverage` row (`conformant` or `not-applicable`), not a proposal. A hit outside (1)
is a site too; say in the report that the registry map did not reach it.

**Emit one child per site**: `--kind propagation --parent <upgrade id>`, the site's
feature, `--standard` the upgraded house line, the metric the site's change moves and
its expected delta, measured Before from the store (measure it now if the store has no
value). The child is judged against the **upgraded house rule**, not the registry
technique it overrides.

**Prefer extraction at three.** When three or more sites share the shape, the first
child is the extraction of one shared component or function (its feature is where it
will live; its body lists every site), and each site's child depends on it and says so
in its Flow. Fewer than three: inline fixes per site.

Before emitting, read `proposals --kind propagation` for the parent: one child per
site, ever. A re-run after new code arrived adds children only for new sites.

## 3. Executing children

Children are ordinary approved items in phase 5: re-measure before, build, re-measure
after, gates, `after_value` and `result_sha`. A child whose site turns out not to match
the signature is recorded `failed` with the reason, and the signature is corrected in
the next upgrade rather than silently widened during execution.

## 4. Closing the loop

When every child of an upgrade is `done`, `failed` or `declined`, the report states
the upgrade's reach: sites found, landed, failed, declined, and the summed metric delta
across landed children. When the rule held across unrelated features, consider a
registry lead (scan-sweep §6, write side): a house rule that transplants is knowledge
the registry does not have yet.
