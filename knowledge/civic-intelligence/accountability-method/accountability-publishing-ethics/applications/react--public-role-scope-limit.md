---
layer: application
type: application
subject: accountability-publishing-ethics
technique: public-role-scope-limit
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19
applied: code
ab_verdict: better
---

# A persist-time gate that policed jargon and never policed private life

Politicas keeps the fact boundary in prose ("public-role facts only; private life
is out of scope, always") and enforces a different boundary in code: the effort
loop's gate hard-drops pipeline jargon from the three dossier fields that render
verbatim to readers. The seam hunt looked for where the stated boundary had no
enforcement, chosen to falsify "the fact boundary is enforced at ingestion".

## What A (as shipped) did

The gate read each proposal's public-render fields for raw identifiers, internal
case names and sample self-references, and nothing else. A kinship or family-reason
statement passed as silently as any other sentence. Read over every persisted
public-field string in the case-effort payloads (1089), the boundary had been
crossed at least six distinct times: a named spouse and the spouse's restaurant, a
transfer of ownership "to his wife", a sentence noting that the registry does not
state a marriage the prose then asserts from secondary sources, a relation
inferred only from a shared address ("probably father or relative"), and a
resignation attributed to family reasons.

## What B did

One advisory, not a drop: the gate warns, per field, when a public-render string
carries a person-relation term, and says what to do (confirm a registry nexus or
cut the private-life fact). It is deliberately not part of the render-time
withholding list. The technique's nexus rule is the reason: a spouse's firm cited
to its registry is in scope, and a term list cannot tell that from gossip, so
blanking on a keyword would hide cited registry facts.

## Reading

Target: flagged private-life statements in public-render prose, A 0 of 11 hit
instances, B 11 of 11, read row by row and all real kinship statements. Floor:
false positives over the 1089 strings, 0 after two terms were removed from the
first draft (a nursing profession and a corporate "parent company" both tripped a
naive list and were measured and cut); the public-copy tests, type-check, lint and
the project's pre-push suite stayed green.

Not closed, stated: the advisory is read by a reviewer, so it moves the decision
to a person rather than removing the fact, and the population-boundary half of the
technique (cover the whole role or none) has its own seam this run did not open.
The existing persisted strings are flagged, not rewritten.
