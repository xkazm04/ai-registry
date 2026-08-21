---
okf_version: "0.1"
okf_bundle_name: recruiting
okf_bundle_title: Recruiting
profile: rkb/0.1
purity: recruiting
---

# Recruiting

The craft of hiring people with machine assistance, and of staying defensible while
doing it: defining what a role actually requires, reading a career off a document,
deciding what a claim about a person is worth, eliciting evidence through interviews
and work samples, comparing candidates without manufacturing a winner, automating
some of it without automating the part that must stay human, treating candidates as
people throughout, and measuring the whole process honestly enough that the numbers
survive being questioned.

Recruiting is a consequential, regulated, adversarial domain. Consequential because
a rejection is an outcome in someone's life. Regulated because employment decisions
sit under anti-discrimination law, data-protection law, and — where automated systems
touch them — a rising body of AI-specific obligation. Adversarial because a résumé is
a document written to persuade, and because the tools that read it can now also write
it. Every subject here carries that weight; the fairness, consent and explainability
material is domain craft, not a compliance appendix bolted to the side.

One bundle on purpose. Role definition, candidate evidence, assessment, decision,
pipeline operations and measurement look separable, but they share one denylist —
applicant-tracking vendors, HR products, model vendors — and one epistemic spine: a
claim about a person is worth exactly the evidence behind it, and the honest handling
of *missing* evidence is what separates a defensible hiring process from a plausible
one. The split test lives in `knowledge/README.md`; no category has earned it yet.
Categories keep the seam visible until one does.

## Boundary contract with `llm-observability`

The `llm-observability` bundle owns the **operator side of production model traffic**:
provider routing, telemetry, price books, cost attribution, spend metering, caching,
session and stream plumbing, and LLM-as-judge scaffolding as a general practice. This
bundle owns the **hiring-craft half**: what a prompt about a person may and may not
conclude, which verdict vocabularies are closed and why rejection is never a routable
automated outcome, what a degraded model run means for the candidate whose application
is in flight, and what a rubric for human potential must contain. Where a concern
touches the seam, the golden path names the neighbour in prose; cross-bundle links are
forbidden by the profile, deliberately.

## Boundary contract with `software-engineering`

Authentication, tenancy, data access, queueing, delivery retries, injection defence and
UI systems belong to `software-engineering` and are not duplicated here. What this
bundle keeps from those surfaces is the part that is a *hiring* judgment wearing
engineering clothes: which data is sensitive because it binds a person's identity to a
hiring outcome, why a talent org's role ladder is shaped the way it is, and why an
export, a public feed or a shared benchmark must degrade a person to initials or an
aggregate before it leaves the building.

The upper two layers are transplant-clean per the `recruiting` purity profile: a talent
team in another country, on another stack, hiring for other roles, must be able to adopt
a golden path unchanged. Applications are the opposite by design — they cite real code
and name their stack in the filename.

Cross-cutting invariants live in [`_laws.md`](./_laws.md); techniques cite them by
anchor. Subjects are grouped — and located — by [`taxonomy.json`](./taxonomy.json).

Format: [RKB profile v0.1](../../docs/rkb-profile.md), an OKF profile.
Evidence: consumer-local by design — see the profile, §5.
