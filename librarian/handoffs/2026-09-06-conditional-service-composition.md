---
kind: forge-spec
date: 2026-09-06
run: harbor-0906
source: https://github.com/av/harbor
source_commit: 4c20a822f61e912ebf8c57a362315f09c5080230
status: DISPATCHED
bundle: software-engineering
category: operations/service-operations
subject: conditional-service-composition
---

# Spec: conditional-service-composition

## Why this is a subject and not three techniques

The design read (Phase 2d) over a containerized multi-service toolkit produced
**three load-bearing decisions with `corpus: NONE`, all in one system** — the
layer that decides *which* fragments of a service topology participate in a
given run, and *in what order*. They share forces, they compose into one
mechanism, and each is unusable without the other two. The corpus models
neighbouring concerns well and this one not at all.

The tree's scale is what makes the decisions load-bearing rather than
incidental: **157 base service fragments and 540 cross-integration fragments**,
so the integration surface is 3.4x the service surface and no human maintains
an ordered list of it.

## Placement (verified against the authority)

`knowledge/software-engineering/taxonomy.json` shows
`operations` → `service-operations` as a **flat** subcategory holding 8
subjects, no nested subcategories, under the 10-child cap. A ninth subject is
legal. Techniques link laws at `../../../../_laws.md` (verified against
`health-checks/techniques/check-scheduling.md`).

Do not place this in `control-plane-operations` — that subcategory is about
reconciliation loops over live resources, and this subject is about the
*pre-launch* composition of a topology description.

## The three decisions to write as techniques

**1. `conjunction-activated-fragments`** — a fragment naming several handles
participates **iff every handle it names is in the active set**. The topology
is not assembled by a resolver that knows about integrations; each integration
declares its own participation condition in its identifier, and set membership
does the rest. Forces: the N x M integration surface grows combinatorially
while the code that assembles it must not; an integration between two services
belongs to neither service's own fragment. What it buys: adding an integration
is adding one file and touching nothing. What it rejects: a central manifest
listing which overlays apply to which combinations. Cover the failure mode —
a fragment whose condition can never be satisfied is invisible, because
"never activated" and "correctly inactive" are the same observation; the
subject must say how that is detected (an enumeration pass asserting every
fragment's handle set is reachable), because nothing else in the design can.

**2. `specificity-ordered-layering`** — when the fragment set is discovered
rather than declared, the merge order is **derived from the identifier's own
structure** (in the source: the number of dot-separated segments, ascending,
then lexical). More specific fragments land later and therefore win.
Forces: filesystem enumeration order is not stable across platforms, and the
merge is order-dependent, so an undefined order is a heisenbug that reproduces
per machine. This **inverts a rule the corpus already states**:
[`settings/cross-source-precedence-chain`](../../knowledge/software-engineering/operations/governance-and-records/settings/techniques/cross-source-precedence-chain.md)
requires the order be "declared, named, and singular", written once as an
ordered list of named sources. At 697 fragments that list cannot be
maintained, and the source replaces it with a **total ordering function over
identifiers** plus an explicit determinism guarantee. The technique must state
what the declared-list rule was buying (a named source in every diagnostic)
and how the derived order pays for it another way — the identifier itself must
be sufficient to explain a precedence outcome, and a resolved-order dump must
be a first-class command. Name the discriminator so a reader knows which side
they are on: **declare the order when a human can hold the list; derive it when
the list is combinatorial, and then publish the derivation and the resolved
order.**

**3. `intent-and-environment-in-one-namespace`** — the active set holds two
kinds of token: **handles the operator asked for** and **capabilities the host
was probed for** (an accelerator, a runtime feature). Unifying them lets one
conjunction rule serve both, so an accelerator overlay is written exactly like
an integration overlay. The boundary the source hit and had to special-case:
**a wildcard over the namespace must not select capability tokens** — "start
everything" means every service, never "pretend this host has every
accelerator". Forces: capabilities are *observations*, handles are *requests*,
and only requests are wildcard-expandable. The technique states the asymmetry
as a rule: tokens in a shared namespace need a declared kind, and any operation
that quantifies over the namespace must say which kinds it ranges over.

## The golden path

Frame the subject as the question *which fragments of a service topology
participate in this run, and in what order* — a decision made **before**
anything starts, against a set assembled from requests and observations. Draw
the boundaries explicitly:

- **Not** `control-plane-operations/declarative-resource-lifecycle` — that is
  reconciliation of running resources against a desired state; this is the
  construction of the desired state.
- **Not** `governance-and-records/settings` — that subject owns *values* and
  their precedence across config sources. This subject owns *which documents
  are in the merge at all*. State the relationship: this subject decides the
  set, that subject decides the values within it, and
  `cross-source-precedence-chain` is the technique this one's second decision
  argues with.
- **Not** `integration/import-normalization/overlay-merge-absence-semantics` —
  that owns what an overlay's *silence about a key* means once it is merging.
  Same word, different question: participation versus absence semantics. Say so
  in one sentence, because a reader will arrive from that document.

The golden path should carry the pipeline the techniques sit on — resolve the
active set (requests + probes) → select participating fragments by condition →
order them → merge → hand the resolved artifact to the engine — and name the
stage each technique owns.

## What this subject must NOT absorb

- The container engine's own merge semantics for a given key. Out of scope;
  the subject is about which documents reach the merge.
- Health checking, readiness, and startup ordering of the running services.
  `health-checks` and `node-boot-and-declarative-bootstrap` own those.
- Secret handling. The source's resolved-artifact export inlines every
  environment value including credentials, which is a real consequence of
  flattening — but it belongs in a security subject, and this run banks it as a
  lead rather than smuggling it in here.

## Open questions the drafter must decide

1. Whether `intent-and-environment-in-one-namespace` is strong enough to stand
   as its own technique or is a section of `conjunction-activated-fragments`.
   The run's read is that it stands alone because its rule (declared kinds,
   quantifier scoping) generalizes past composition — but the drafter has the
   neighbours open and should override if it reads thin.
2. Whether the subject needs a fourth technique on **the resolved artifact as
   an escape hatch** — the source delegates final resolution to the engine's
   own resolver and emits a standalone artifact, which is both an anti-lock-in
   property and a secret-materialization event. The run judged this one or two
   decisions deep, not three, so it is a candidate, not a requirement.

## Instructions

Read `docs/forge-brief.md`, `docs/harvest-brief.md`, `docs/rkb-profile.md`,
this spec, and then every neighbour named above **before drafting**:
`settings/cross-source-precedence-chain`, `settings/author-declared-include-graph`,
`import-normalization/overlay-merge-absence-semantics`,
`control-plane-operations/declarative-resource-lifecycle`, and the
`service-operations` golden paths for voice.

Draft expert-first. The source is one system and one author, so the subject
must be written from the general mechanism with the source as *an* instance,
not as documentation of it. **Strip every proper noun** — no product, engine,
company or file-format names; the denylist is enforced by
`scripts/check-bundles.mjs` and the rest by review. "A container engine", "a
fragment", "a handle" are the register.

`use_when` on every technique. Cite only laws that already have anchors in
`knowledge/software-engineering/_laws.md`. Run
`node scripts/check-bundles.mjs` on your own subject before reporting. **Run no
git commands** — the intake session owns the diff, the taxonomy entry, the
index regeneration and the commit.

**Override this brief where it is wrong and say so in your report**, with the
argument. Two of the last spec dispatches overrode their placement guidance
and both were right. In particular: if reading the neighbours shows this is two
techniques inside `settings` rather than a subject, say that — the routing
count is the run's judgment, not a fact, and it is the drafter who has the
files open.
