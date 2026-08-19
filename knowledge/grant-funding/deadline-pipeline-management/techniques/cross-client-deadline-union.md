---
layer: technique
type: technique
subject: deadline-pipeline-management
technique: cross-client-deadline-union
status: forged
laws: []
shared_with: []
use_when: [a consultant or fiscal sponsor manages deadlines across several client organizations, building a portfolio-wide deadline view over per-tenant data, tempted to write a cross-tenant query for a combined dashboard]
---

# Cross-client deadline union

A grants consultant, fiscal sponsor, or shared back-office runs the deadline
discipline across several client organizations at once — each of which is,
correctly, a strict isolation boundary in the underlying system. Without a
combined view, the practitioner's *real* pipeline (every deadline they are
personally on the hook for) exists nowhere: each org's radar shows a slice,
and the miss happens in the seams between slices. The union is that combined
view, built without ever weakening the tenant boundary.

## The security shape: N scoped reads, never one unscoped one

The defining rule: **the union is assembled from per-organization reads, each
scoped exactly as that organization's own view would be — there is no blanket
cross-tenant query to get wrong.**

1. Enumerate only the organizations the current user genuinely belongs to,
   from the membership record — never from a filter the client supplies.
2. For each membership, compute that organization's in-flight deadlines using
   the *same* scoped read path the single-org view uses.
3. Merge the results in memory, tagging each row with its owning organization.

Because step 2 reuses the existing per-tenant path, the union inherits every
access check that path already enforces, and an authorization bug would have
to exist in the single-org view to exist here. The alternative — a special
"all my orgs" query — creates a second authorization surface that must be
kept correct forever, and is the classic origin of cross-tenant reference
leaks. Membership-driven fan-out makes the boundary structural instead of
disciplinary.

## Assembly rules

- **Tag every row with its owner** — organization id, display name, and
  whether it is the currently-active context — because a portfolio row
  without a client label is an action item with no address. The tag is also
  what lets the surface visually separate "your current client" from "your
  other clients".
- **Sort the merged list soonest-first** (or by miss-risk where completion
  signals exist). The whole value of the union is that the top row is the
  practitioner's next real obligation regardless of which client owns it.
- **Hide the section for single-org users.** When the membership count is one
  the union degenerates to the ordinary radar; rendering a "portfolio" frame
  around it is noise. Return the count and let the surface gate on it.
- **Reuse already-loaded data for the active organization.** The host page
  has usually already read the active org's drafts; pass them in rather than
  re-reading, so the solo-user path costs zero extra reads and the multi-org
  path costs exactly one read per *additional* org.
- **Keep the merge pure.** Per-org deadline sets in, flat tagged list out —
  the fan-out (membership read, per-org reads) is the only effectful part,
  and the merge logic tests without any tenancy fixtures.

## Decision rules

- **Read-only overlay, always.** Acting on a row (editing a draft, marking
  submitted) routes back through the owning organization's context with its
  own authorization, never through the union.
- **Per-org failures degrade, not destroy.** One client org with a broken
  read should drop out of the union visibly (a "couldn't load" row for that
  client) rather than blanking the whole portfolio — the practitioner still
  needs the other clients' clocks.
- **Cap per-org reads explicitly** and treat cap-hits as loud events; a
  silently truncated client is a client whose soonest deadline may be the one
  truncated away.
- **Timezone frame is the practitioner's, uniformly.** Day counts across the
  portfolio are computed in one business timezone — the consultant's — even
  when clients sit elsewhere; a portfolio list whose rows count days in
  different frames cannot be sorted meaningfully. Closing *instants* still
  honor each funder's published time and zone.

## When not to use it

This is a practitioner-portfolio device, not an analytics one: do not grow it
into cross-client reporting (win rates, pipeline value) — aggregation across
tenants has its own governance and anonymity constraints and deserves its own
deliberate surface. And do not build the union for users who merely *could*
belong to several orgs but don't; ship it when multi-membership actually
exists, gated on the membership count, so the single-tenant product pays
nothing for it.
