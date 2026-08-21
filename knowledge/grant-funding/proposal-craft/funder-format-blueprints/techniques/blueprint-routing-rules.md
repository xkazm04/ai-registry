---
layer: technique
type: technique
subject: funder-format-blueprints
technique: blueprint-routing-rules
status: forged
laws: [the-funder-sets-the-form, honest-null-over-forced-guess, untrusted-text-is-data]
shared_with: []
use_when: [deciding which application structure a funding opportunity gets, wiring blueprint selection into a drafting pipeline, auditing why an opportunity received the wrong form]
---

# Blueprint routing rules

The concern: given an ingested funding opportunity, decide **which
funder-format blueprint structures its application** — automatically,
deterministically, and conservatively. Routing is the hinge between the
funder families and the drafting work: a correct route makes every
downstream section, guidance block, and word band right by construction; a
wrong route makes the writer build on the wrong skeleton, which is the most
expensive structural error to discover late.

## The precedence order

Route by the strongest available evidence, in this order, taking the first
match:

1. **A known funder portal or source wins outright.** When the opportunity
   was ingested from a source whose form is known — a supranational
   funding portal, a national government grants portal, a curated trust
   directory — that source's blueprint applies unconditionally. The portal
   *is* the form; no genre classifier, however confident, may out-vote it.
2. **Then genre.** When the source is generic but the opportunity's genre
   is classified — federal-style notice, arts call, advocacy funder — the
   genre's blueprint applies. Genre routing runs *after* source routing on
   purpose, and *before* the structural fallback below, so a regional
   government arts call still gets the arts form rather than the
   government one.
3. **Then structural family resemblance.** A sub-national government grant
   with no specialized genre follows the federal rubric shape — same
   reviewer culture, same dimensions — under its own identity, so the two
   can diverge later without a migration. Maintain the set of sources this
   applies to as data derived from the ingest registry, not a hand-copied
   list that drifts.
4. **The generic default for everything else.** A modest
   narrative/budget/outcomes form in the modest register — the structure
   that fits foundations and is survivable everywhere.

## Decision rules

- **Uncertainty falls to the default, never to the nearest exotic match.**
  A wrong specialized structure is worse than the generic one: the generic
  form is submittable almost anywhere in some fashion, while a
  supranational three-criterion document sent to a trustee is not. Genre
  detection therefore stays conservative — an ambiguous opportunity routes
  generic, mirroring the honest-null rule for classification generally.
- **The default must be the previously trusted structure, byte for byte.**
  When blueprint routing is introduced into an existing practice or
  product, the default blueprint reproduces the prior section set exactly,
  so every existing draft and habit is unaffected and the change is
  provably additive.
- **Routing is a pure function of (source, genre).** No network, no model
  call, no hidden state — the same opportunity always routes the same way,
  the decision is testable in isolation, and an audit of "why this form?"
  is a table lookup.
- **Shared section keys are the reuse mechanism.** Families that genuinely
  score the same underlying criterion under different labels share a
  storage key (several families carry a "need" and a "capacity"); review
  tooling, quality gates, and word bands keyed to sections then cover a
  new family the day it is added. Never share a key for surface
  resemblance alone — a shared key asserts the criteria are the same
  question.
- **Word bands travel with the route.** Each blueprint section carries its
  min/max band, and the *same* band must drive both generation-time gating
  and review-time warnings; two independently maintained band tables will
  disagree about the same text within a quarter.
- **Thread the call's own parsed requirements into the draft.** When the
  opportunity's text has been parsed into explicit criteria and required
  elements, render them into the drafting context as a delimited,
  sanitized, address-each list — the funder's literal items, capped in
  count and length, entering as untrusted grounding data that can never
  rewrite the task. Extracting requirements and then drafting without
  them is paying for intelligence and ignoring it.

## When not to use it

Routing automates the *family* decision, not the *form* decision for a
specific named competition. When the applicant holds the actual
application form or template for a specific call, that document overrides
every blueprint — mirror it verbatim. And routing should not be extended
with per-funder micro-blueprints for every foundation encountered;
blueprints earn their place per *family* (a scoring culture), not per
funder, or the routing table becomes its own unmaintainable form of drift.
