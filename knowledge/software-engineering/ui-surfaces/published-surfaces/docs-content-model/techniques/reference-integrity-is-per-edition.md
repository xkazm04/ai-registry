---
layer: technique
type: technique
subject: docs-content-model
technique: reference-integrity-is-per-edition
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [one source document is cut into several audience editions, a link check runs over the source and every edition ships unchecked, an edition drops the section that defines a term the kept text uses, deciding what a per-span inclusion marker owes the references around it]
---

# Reference integrity is per edition

A source cut into audience editions by per-span inclusion markers has one more
property than a source with one reader: **a target can exist and be missing at
the same time.** A definition inside a span the edition drops is present in the
source and absent from what that edition's reader was given. A link check over
the source asks the question its author can answer cheaply, *does this resolve
somewhere*, and the reader needs a different one, *does this resolve here*
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## The whole-source check is blind by construction

Measured by replaying one living specification's source with its developer
edition's drops applied: of 28,513 references in the kept text that resolve
against a definition somewhere in the source, **2,827 point at a definition that
edition removed**, across 710 distinct terms. A check over the source reports
none of them, and it cannot be tuned to, because every one of them is correct
in the source. Only a check that applies the drops first can see them. A planted
reference into a dropped span moved the edition count by exactly one and the
whole-source count by none.

The failure is quiet in a specific way. On three published pages of that
edition, 39 of 40 mentions of those dropped terms render as bare unlinked text.
Nothing 404s and no build needs to fail for this to ship: the reader only loses
the definition, where a broken link would at least have been visible
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## A substitute definition is load-bearing, and it is the thing to test

The usual repair is a marker on a mention in the kept text saying *for this
edition, this is the definition*, so references have somewhere to land when the
real definition is cut. In the same source that mechanism carries 1,460
references over 516 terms. Removing the markers raised the edition's dangling
count from 2,827 to 4,887, the held references plus the markers themselves
turning into references.

So a substitute is not documentation polish. It is a declared redirect the
projection depends on, and it deserves what any declared dependency gets: the
edition check fails when a substitute names a term that no longer exists, and
when a dropped definition has references left in the kept text and no substitute.

## Procedure

1. **Apply each edition's drops, then resolve.** Run the reference check once per
   edition over the projected text, not once over the source. The source-level
   pass still catches typos; it is not a substitute for this one.
2. **Report the three outcomes separately:** resolves in the edition, resolves
   only through a substitute, resolves only outside the edition. The last is the
   finding.
3. **Decide per finding, deliberately.** Keep the term and add a substitute, cut
   the reference, or link out to the fuller edition on purpose. Each is honest.
   The dishonest fourth is the default: text that was a link and silently is not.
4. **Build every edition the project still claims to publish, or delete it.**
   A derived view that stops building is neither removed nor fixed, and the
   changes made while it was down never considered it. The specification measured
   here records exactly that in its own contributing guide, and asks for help
   finding the damage. A view is either in the gate
   or not a view the project ships. This half is reported from that record and
   was not measured.

## When not to use this

- **One edition, one reader.** With no drops the source and the output have the
  same targets, and the source-level check is the whole job.
- **Editions differ only in presentation.** Theme, layout or page-splitting cuts
  no targets. Multi-page splitting does move anchors, and that belongs to the
  catalog's own reference invariants.
- **The edition links out on purpose.** A reference that deliberately goes to the
  fuller edition resolves, and is not a finding, as long as the choice is
  declared in the source rather than inherited from the renderer.
