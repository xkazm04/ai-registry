---
layer: technique
type: technique
subject: demo-data-plane
technique: mixed-plane-coexistence
status: forged
laws: [count-carries-predicate, one-authority-per-vocabulary]
shared_with: []
use_when: [demo rows shown beside a person's real ones, a live screen still draws parts of the demo catalogue, seeded items leaking into a real tenant's counts]
---

# Mixed-plane coexistence

The subject's default shape is one plane per session: the viewer is in the demo
or in their own data, and the marker in the chrome says which. Products grow out
of that shape. A person onboards their first real project while the demo estate
is still useful as a reference; a live screen draws real data for most of its
parts and the demo catalogue for the parts the real source cannot supply yet; a
seed catalogue's items sit in the same store as the tenant's own. Now one screen
holds both planes, the session marker is true of neither half, and
[the honesty contract](./fake-surface-honesty-contract.md)'s clauses have to be
satisfied row by row and part by part. This technique states how.

[one-interface-many-planes](./one-interface-many-planes.md) already moves
provenance onto the value once a result can mix planes. This technique is what
the surfaces and the sources do with that field.

## Every demo row says so, three ways

When demo rows sit beside real ones, disclosure moves to three levels at once,
because each covers a different reader:

- **The row carries a chip** ("demo") — the only disclosure that survives a
  cropped screenshot of one row, and the one a person scanning a table meets.
- **The data label names the mix** — wherever the product names its data source
  (a status line, a subtitle), it says what is there: "two real projects ·
  eight demo", "live data · some parts still demo, marked". The label never
  claims "real data" for a screen that holds demo rows, and never claims "demo"
  while the source has not answered — unknown is a dash.
- **A strip on the screen says it plainly** — one line under the toolbar,
  "demo data, illustrative: an invented estate, not your projects", shown
  whenever a demo figure could sit beside a real one, with the way to the
  person's own data and the setting that turns the demo off.

## Demo rows do nothing real

A demo row shows; it never **acts as if it were measured**. It does not collect,
refresh or re-measure, and the controls that would do so are absent from it
rather than disabled (clause five of the contract) — there is nothing the product
could measure a demo row against, and a re-measure button on one invites the
person to believe a figure was checked. Where the demo row's figures are
generated, the row says "generated, never collected", not merely "demo".

A real item wins its identity: when a person's own item and a demo item share a
key (a slug, a name), the demo one is not shown.

## The source owns the predicate

The rule that keeps seeded items out of a tenant's numbers is a **predicate**,
and it lives in **the data source**, not in each screen. The source knows which
ids it seeded; every count it returns and every list it serves in the live plane
excludes them, so the navigation badge, the dashboard tile and the list screen
cannot disagree about how many items are the tenant's
([_laws: count-carries-predicate_](../../../_laws.md#count-carries-predicate)).
A predicate exported for each loader to remember is the same rule copied N times,
and the copy the next loader forgets is the one that shows a real tenant five
decisions that are not theirs
([_laws: one-authority-per-vocabulary_](../../../_laws.md#one-authority-per-vocabulary)).

## The live source declares what is still illustrative

When a live plane still serves some parts from the demo catalogue — narrative,
history, a section the real source cannot express yet — it **declares those
parts** in a closed list on the source itself, and every surface that draws one
marks it. The demo source declares nothing, because everything it serves is the
demo and the session marker already says so. The declaration is the honest form
of "some of this is still made up": machine-readable, so a surface cannot forget
to mark it, and shrinkable, so each part leaves the list the day the real source
derives it.

## A saved list is the person's own

A list a person builds — saved projects, pinned items, an onboarding roster —
shows **only what they saved**. The demo estate is never written into it and never
listed in it as if they had saved it, whatever mode the server runs in. A fresh
machine's saved list is empty, and empty is the honest answer.

## What this technique refuses

- A demo row without its own marker, relying on a banner.
- A data label that names one plane for a screen holding both.
- Collect, refresh or re-measure controls on a demo row.
- A seeded-item predicate applied by loaders instead of by the source.
- Illustrative parts of a live plane that are marked by convention, not declared.
- Demo items in a list presented as the person's own.

## When not to use it

A product that never mixes — the demo is a separate session, every result one
plane — needs only the session marker and the contract. And a mix that is
temporary by construction (a setting that shows demo rows only while nothing real
exists) still owes the row chip and the strip for as long as both can be on
screen; the moment the setting forces demo beside real indefinitely, every clause
here is permanent.
