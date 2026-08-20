---
layer: application
type: application
subject: readiness-passports
technique: named-vs-capability-metadata
stack: process
status: forged
---

# The passport design document as the doctrine that licenses naming tools

Realized in the Ascent repo as `APP_READINESS_PASSPORT.md` (308 lines, v0.2.0)
plus its two companions `app-passport.schema.json` (the validatable contract)
and `app-passport.example.json` (the app's own filled passport). This is a
`process` realization: the artifact that makes the naming choice defensible is
a design document, not code.

## §1 states the inversion explicitly, against a named sibling

The document does not merely name tools — it opens by arguing why, against the
project's own existing standard. Ascent already ships a vendor-neutral agent
manifest spec (`docs/features/onboarding/ai-manifest-spec.md`) whose central
rule is "capabilities, not tools": declare `test → "npm test"`, never
`framework: vitest`. §1 concedes that rule is correct *for an agent* and then
states the cost: it makes the manifest useless for portfolio comparison,
because you cannot answer "which of my 20 apps have no error tracking?" from a
file that refuses to name tools.

The comparison table at `APP_READINESS_PASSPORT.md:26-33` is the technique's
"whose question is this field answering?" test made into a document artifact,
with one row per axis of difference:

| | agent manifest | passport |
|---|---|---|
| Audience | an agent, in-repo | a human comparing a portfolio |
| Stance | prescriptive: how to act & verify | descriptive: what this is & how ready |
| Tools | hidden | named |
| Scope | one repo, deep | one row in a fleet table, shallow |
| Lifespan of a value | stable (a capability endures) | snapshot (a stack as-of a date) |

Confirms the technique's core claim, and adds a practice worth copying: the
document names the sibling standard it inverts and asserts the two coexist,
with the passport *pointing at* the manifest via `links.manifest` rather than
duplicating it. Publishing the inversion beside the rule it inverts is what
stops the naming choice being read as sloppiness by the next maintainer.

## §3 confirms kind-as-grouping-axis and null-as-answer

Two modelling choices stated at `APP_READINESS_PASSPORT.md:180-186`:

1. **"The comparable axis on an integration is `kind`, not `name`."**
   `stack.integrations[]` carries `{ name, kind, direction, auth }` where
   `kind ∈ llm/vcs/auth/payments/email/storage/queue/analytics/…`. "How many
   apps have a payments integration?" sorts on the closed enum; the vendor is
   what you read after sorting. This is the source of the technique's
   grouping-axis rule — an upward lesson, since the first draft treated the
   name as the only comparison unit.
2. **"`null`/empty is a first-class answer."** `monitoring.errorTracking: null`
   and `persistence: []` (stateless) are facts to compare, not missing data,
   and §3 explicitly instructs not to omit them. Also an upward lesson: the
   distinction between *emitted null* and *omitted field* is what makes the
   portfolio query in §6 (`select(.stack.monitoring.errorTracking == null)`)
   sound at all.

## §5 keeps the shape-level discipline that naming does not excuse

Naming tools is a licence granted to the *descriptive skin only*. §5 keeps four
disciplines borrowed wholesale from the manifest spec: a stable id
(`passport: "app-passport"` as a constant, never a URL that can rot), semver
with additive-only minors, must-ignore-unknown (`additionalProperties: true`
throughout), and pointers-not-embeds so the heavy artifacts stay behind
`links`. §5.5 adds "ordinal-first": every *comparable* dimension is a short
ordinal enum, never free text — which is the technique's rule that the axes
stay capability-shaped while the skin is name-shaped, stated as a schema
constraint.

The schema file is what makes this enforceable rather than aspirational: any
passport, from any generator, can be validated against
`app-passport.schema.json` in CI.

## Where the realization falls short of the standard

- **No consumer-branching guard.** The technique's hard line is that nothing
  downstream may branch on a name. Nothing in the document or the schema
  enforces it; it holds today only because the scoring code
  (`src/lib/analyze/passport-score.ts:7-11`) reads ordinal enums exclusively.
  The standard wants that stated as a rule in §5, so the next contributor who
  wants a rung criterion keyed to a specific vendor has something to be
  refused by.
- **Detection strength is coarse.** `evidence.confidence` (0..1) is a
  whole-artifact figure, not a per-field one, so a name inferred from a
  dependency declaration and a name inferred from an observed command carry the
  same apparent authority. The technique asks for per-field detection strength
  where the schema can afford it.
- **`unknown` and `none` are not separated for named fields.** The schema's
  `null` means "absent"; a field the scan could not classify has no distinct
  encoding, which is exactly the conflation the technique forbids. The
  whole-artifact `evidence.notes[]` caveat carries the information instead,
  which does not survive a portfolio query.
