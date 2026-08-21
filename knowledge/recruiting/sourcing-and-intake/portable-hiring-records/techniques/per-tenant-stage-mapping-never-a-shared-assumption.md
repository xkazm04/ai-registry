---
layer: technique
type: technique
subject: portable-hiring-records
technique: per-tenant-stage-mapping-never-a-shared-assumption
status: forged
laws: [meaning-does-not-live-in-a-label, a-claim-carries-its-sample-and-its-basis]
use_when: [connecting a second organisation to an existing integration, translating an external funnel into your own pipeline roles, finding that an integration works for one customer and not another]
shared_with: []
---

# Per-tenant stage mapping, never a shared assumption

## The concern

Two organisations run on the same external system of record. Their stage lists
look superficially alike — a screen, some interviews, an offer. They are not
alike. One's "Screening" is an automated résumé filter; the other's is a
recruiter's twenty-minute call. One has four interview columns and treats the
third as the hiring-manager gate; the other has one and configures rounds
behind it. One added "Client Approval" because they staff for agencies; one
added "Pending Start" because their notice periods are long.

A stage list is not a standard with local variations. It is a private
vocabulary that happens to be typed into a field with a shared name. Any code
that reads a stage string and decides what it means has compiled *one
organisation's process* into a product that serves many — and it will work
beautifully for the customer it was written against, which is precisely why it
survives review.

The mapping from an external funnel to your pipeline roles is therefore
**configuration owned by each organisation**, held per counterparty
connection, editable by that organisation, and never a constant in the source
tree. This is the sharpest applied case of
[meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label):
the label is theirs, the role is yours, and only a per-organisation table can
join them.

## The procedure

**1. Fetch their vocabulary, do not assume it.** On connecting an
organisation, read the counterparty's actual stage list for that account. It
is the input to configuration, not something to be inferred from the first few
records that arrive.

**2. Present a mapping surface, one row per external stage.** Each row shows
their label verbatim and asks for one target: a role from your closed
vocabulary, or *unmapped*. The person doing this is an operator at that
organisation who knows what their own "Round 2" means. No algorithm knows
that.

**3. Offer suggestions, mark them as suggestions.** A default that pre-selects
a plausible role saves real time and is safe *only* if it is visibly a
proposal that a human confirms. A suggestion silently accepted is a shared
assumption with a friendlier interface.

**4. Store the mapping against the connection**, versioned, with an author and
a timestamp. When a pipeline state later looks wrong, the first question is
always "what did the mapping say at the time" — and a mapping with no history
cannot answer it.

**5. Map in one direction at a time, and state which.** Inbound (their stage →
your role) and outbound (your role → their stage) are different functions and
are usually not inverses: several of their stages may map to one role of
yours, so the reverse has to choose. Make the outbound choice explicit
configuration too, rather than deriving it by inverting a many-to-one table.

**5a. Validate the target against the destination axis, at both ends.** A
mapping row names a role on *this organisation's* board, so validate it when
the mapping is saved and again when it is applied. Validating only at save
time leaves a mapping that was legal in January pointing at a column the team
removed in March; validating only at apply time lets an impossible mapping be
stored and fail silently for every record afterwards. Where the connection is
not yet keyed to the organisation, the fallback axis is the shipped default —
which is a known limitation to record and close, not a design.

**6. Re-check on drift.** Counterparty stage lists change without notice.
Detect an inbound stage that is not in the stored mapping, treat it as
unmapped, and raise it as configuration work — never as an error the operator
cannot act on.

## The decision rules

- **When a stage is not in this organisation's mapping, it is unmapped.** Do
  not fall back to a global default table, and do not fall back to string
  similarity against your own role names. Both are the shared assumption
  wearing a fallback's clothes. What happens next is the
  unmapped-stage-stays-null technique's.
- **When two organisations' mappings would be identical, keep them separate
  anyway.** The identity is a coincidence of today's configuration. Factoring
  it into a shared constant is how the coupling gets reintroduced, and the
  next organisation inherits it.
- **When a mapping row changes, do not retroactively rewrite stored pipeline
  states.** Records were imported under the old mapping; that is a fact about
  the past. Re-derive forward from the next sync, and record that the mapping
  changed so a discontinuity in any funnel metric has a cause a reader can
  find. A rate computed across a mapping change
  [carries its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)
  or it is not a rate.
- **When an external stage has no honest target role, leave it unmapped rather
  than reaching for the escape hatch.** A stage mapped to a custom-role
  placeholder participates in ordering and nothing else; mapping something
  meaningful there because "it has to go somewhere" hides a real gap in your
  role vocabulary that was worth seeing.
- **Never key a rule, report or notification off the external label**, even
  where the mapping is complete. The label is display; the role is logic. The
  raw label rides along on the record so a human can debug the mapping, and it
  is read by no rule.

## The seam with stage modelling

The role vocabulary — which roles exist, which is entry, which are terminal,
where the screening gate sits — belongs to the pipeline-stage-modelling
discipline and is not restated here. What this technique adds is the outward-
facing half: a *foreign* vocabulary exists, it is per-organisation, and the
join between it and the role axis is data rather than code. If you find
yourself extending the role vocabulary to accommodate one counterparty's
funnel, you are solving a mapping problem in the wrong layer.

## When not to use it

- **A single-tenant deployment with one counterparty account** can hold the
  mapping as configuration rather than as per-organisation data — but keep it
  as *configuration*, loaded at runtime, not as a compiled table. The cost
  difference is nil and the second customer arrives sooner than you think.
- **Where the counterparty genuinely publishes a governed, closed stage
  taxonomy that every account must use**, mapping is once-per-integration
  rather than once-per-organisation. This is rare, and worth verifying against
  two real accounts before believing it.
- **Where you are the system of record** and the other side is consuming your
  stages, you do not need an inbound mapping — you need to publish your role
  vocabulary and let them map. Do not accept their stage strings into your
  pipeline state field.
