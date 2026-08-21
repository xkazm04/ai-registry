---
layer: technique
type: technique
subject: jurisdiction-modelling
technique: supranational-membership-inheritance
status: forged
laws: [never-fabricate-a-figure]
shared_with: []
use_when: [registering a multi-country funding body as a jurisdiction, member-state applicants cannot see a supranational corpus they are entitled to, a coverage count or market list includes a body no one can incorporate in]
---

# Supranational membership inheritance

A supranational funding body — a multi-country union or programme family with
its own calls, its own applicant categories, its own participant identifier —
is a jurisdiction an organization applies **through** but cannot be
incorporated **in**. The technique models it as a first-class profile at its
own level and gives member countries a declared membership relation through
which they inherit its funding corpus. One config line per member state turns
an already-ingested supranational corpus into dashboard coverage for every
member — potentially dozens of markets from one idle pipeline.

## The level distinction is the whole technique

Type the body with its own level — `supranational`, alongside country,
region, locality — and never as a country. Everything else follows from
consumers being able to discriminate:

- **Incorporation surfaces** (entity-type pickers phrased as "where are you
  registered", legal-form onboarding) exclude it, because no organization
  holds a registration there; organizations hold a *participant* identifier
  with it, which is a different fact.
- **Geographic claims** — coverage sentences, market counts, "we support N
  countries" — exclude it, because a member state already reaches the
  supranational corpus through membership, and counting both is
  double-counting the same coverage. A market count inflated this way is a
  fabricated figure wearing a config file.
- **Opportunity surfaces** include it: a pan-regional applicant must be able
  to select it in the market picker, its calls deserve their own explorer
  pages, and its corpus appears in every member state's matches.

Provide two list functions and force the choice at the call site: the full
market list (pickers, per-market pages, sitemaps) and the countries-only list
(any geographic claim). A single undifferentiated list guarantees that some
consumer eventually renders the body as a peer of a nation.

## Inheritance mechanics

1. **Declare membership on the member, not the body.** Each member profile
   carries `memberOf: [<body-id>]`. The body does not enumerate its members —
   membership changes are edits to the joining or leaving country's profile,
   which is also where a practitioner would look for them.
2. **Merge at resolution time.** The profile accessor unions the member's own
   funding-source keys with each membership's keys (the same way a region
   inherits its country's national sources). Consumers see one merged key
   set; nothing downstream knows inheritance happened.
3. **Keep the corpus single-homed.** The supranational calls are ingested
   once, under the body's source keys. Members inherit *access to* the
   corpus, never copies of it — copies fork deadlines and amendments across
   markets.
4. **The body remains directly onboardable.** A pan-regional organization
   (registered in some member state but operating union-wide) may choose the
   body as its market; the profile carries its applicant categories,
   participant identifier and document conventions like any other.

## Decision rules

- **When a member state joins the product, add `memberOf` in the same change
  that creates its profile, because** a member market shipped without
  inheritance shows a plausibly complete national dashboard that silently
  omits the largest funding corpus its organizations are entitled to — an
  omission no one reports because nothing looks broken.
- **When the supranational body's calls are already ingested for an explorer
  but belong to no jurisdiction, register the body's profile before adding
  more members, because** an unowned corpus surfaces in browse but never in
  matches, and every member wired first must be rewired after.
- **When a consumer needs "all places we operate", make it choose a list
  explicitly, because** the correct list differs by claim type and the
  default will be wrong for someone.
- **When tempted to model the body as a parent country of its members,
  don't, because** parent/region inheritance implies incorporation nesting
  (a region's organizations are the country's organizations), which is false
  here and poisons every level-based rule.

## When not to use

Do not reach for a supranational level for mere bilateral or portfolio
funders — a foreign foundation that funds across borders is a funding
*source*, not a jurisdiction; nothing about the applicant's legal existence
changes. The level is earned only when the body issues its own applicant
identity (a participant code, a validated legal-entity status) and runs its
own eligibility law. And where a federation's states are real incorporation
targets, that is the ordinary country/region axis, not this technique.
