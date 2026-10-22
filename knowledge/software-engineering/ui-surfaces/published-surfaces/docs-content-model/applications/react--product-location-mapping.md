---
layer: application
type: application
subject: docs-content-model
technique: product-location-mapping
stack: react
status: forged
verified_on: 2026-10-22
verified_against: react@19
applied: code
ab_verdict: better
---

# Product-location mapping - a Next.js guide surface, as built here

The tree already types the coarse handle and mirrors the other side's
vocabulary. What it did not do was check the two representations of that
handle against each other, or against the files its header names.

## What the tree has

A closed `moduleId` on every topic record (109 topics, 12 modules), a mirror of
the desktop sidebar kept in the same file, and a header naming the desktop files
that are its source of truth. A test asserted that every topic is mapped, that
no key is an orphan and that each `moduleId` resolves. The breadcrumb is a
free-form array of labels; its first element repeats the module's label.

## What A and B were

A: the three existing assertions. B: two further assertions - the first
breadcrumb segment equals the label of the record's `moduleId`, and the segment
after the module (past one declared virtual segment) names a child of that
module in the mirror - plus two lines in the header.

## Reading

Target: seeded drift the suite catches, A 0 of 3, B 3 of 3. The three mutants:
a child label renamed in the mirror, a module label renamed, one breadcrumb's
first segment misspelled. Each passed the three original assertions, because
the coarse handle is stored twice (`moduleId` and the first label) and only the
id was ever checked. Floor: the guide unit tests stayed green (22 of 22),
lint and the type check clean, sources unchanged after each mutant.

The unmutated tree already held on both: 109 of 109 breadcrumbs start at their
module label, and 80 of 109 resolve their second segment to a mirror child. The
other 29 all name an "Editor" segment under Agents. That is not drift: the
desktop shows editor tabs as a tab strip, so the mirror's children are flat
`editor-*` ids. It is a fine-handle segment with nothing on the product side
for a type to bind to, which is the technique's own line, and it is now a single
commented exception in the test rather than 29 silent ones.

Seam chosen to falsify the claim that the typed coarse handle makes a rename a
type error. It held for the id and not for the label copy beside it. A second
finding came from reading the other side: the desktop's editor-tab vocabulary
is a typed union in a file the header did not name, and that union has eight
values where the mirror has seven (the assertions tab is absent). The header now
names that file. Whether the missing tab is shipped or developer-only was not
checked.

Ledger on this surface: none for this file. Not changed: the mirror is still
hand-kept and no check reads the desktop tree; the inbound direction (a help
affordance on a desktop panel) has no consumer, so the minted-id and
inbound-gating halves of the technique have nothing here to apply to. What this
realization cannot do: it proves the breadcrumb agrees with the mirror, not that
the mirror agrees with the desktop.
