---
layer: technique
type: technique
subject: eligibility-analysis
technique: registration-and-validation-readiness
status: forged
laws: [hard-gates-precede-soft-scores, honest-null-over-forced-guess]
shared_with: []
use_when: [an eligible applicant missed a deadline waiting on a registry, deciding when to surface funder-system registration in a matching pipeline, an applicant on an exclusion list reached the drafting stage, modelling how long before a deadline an unregistered applicant can still realistically apply]
---

# Registration and validation readiness

Major public-funding regimes add a gate the four classic checks do not
cover: **the applicant must hold an active registration in the funder
system's central applicant register before it may submit at all.** This gate
is unlike the others in three ways that break naive modelling. It is
*administrative*, not substantive — a perfectly eligible organization fails
it by paperwork alone. It is *time-dependent with a long fuse* — first-time
registration takes weeks in practice, however fast the register's own
documentation claims, so the honest question is not "registered now?" but
"registerable before the close?". And it is *staged* — regimes typically
require only a lightweight identifier to apply, deferring full legal
validation (registry extracts, an appointed legal representative) until an
award is actually in prospect. The technique models registration readiness
as its own three-valued check with a lead-time clock, instead of folding it
into applicant type or ignoring it until submission day.

## Procedure

1. **Model the register per jurisdiction.** The jurisdiction model records
   whether a central register exists, what identifier it issues, what
   "active" means there, and a *realistic* first-time lead time — sourced
   from field practice, not the register's marketing figure, and revisited
   as dated data because registries re-platform and their queues move.
2. **Three-valued status, applicant-side.** Registered-and-active → pass.
   Registered-but-lapsed or not registered → **not fail**: the condition is
   curable, so the status is a *readiness warning* carrying the lead time
   ("registration typically takes N weeks; this closes in M"). Unknown
   registration state → unknown, with the exact question to check.
3. **Only exclusion hard-blocks.** Central registers double as the home of
   debarment and exclusion lists, and an applicant present on one is
   ineligible regardless of type, geography, capacity or clock. This is the
   single condition in this gate with gate-grade evidence and terminal
   force. Everything else the gate emits is schedule pressure, not
   prohibition.
4. **Stage the demands to match the regime.** Require at application time
   only what the regime requires (the identifier); surface full-validation
   requirements — legal-personality documents, the appointed representative
   — as *award-stage* readiness, triggered when a submission is live or
   likely. Front-loading full validation at onboarding stalls applicants on
   paperwork no funder will read unless they win.
5. **Compose with the deadline gate.** The actionable number is
   `days-until-close minus registration-lead-time`. When it goes negative
   for an unregistered applicant, say so plainly — "this deadline is likely
   out of reach without an existing registration" — while leaving the
   verdict to the human, because expedited paths and pre-existing partial
   registrations exist.

## Decision rules

- **When the applicant is unregistered, warn with the clock — do not fail,
  because** registration is curable and the same applicant is fully
  eligible for every later cutoff; a fail here converts a scheduling fact
  into a false prohibition.
- **When the register lists the applicant as excluded or debarred, hard-fail
  with the source named, because** exclusion is the register's one
  substantive verdict, and routing an excluded applicant into drafting
  wastes the work the eligibility layer exists to prevent.
- **When a regime validates only successful applicants, do not demand
  validation documents at matching time, because** the regime itself has
  decided that a self-declared identifier is enough to apply; mirroring the
  regime's own staging is what keeps onboarding proportionate.
- **When registration status is cached, expire it aggressively, because**
  active status lapses on the register's schedule, not the product's — an
  annual renewal missed by the applicant flips the answer without any
  profile edit, so this gate's cache lives shorter than the others'.

## When not to use

Private and philanthropic funders mostly run no central register — their
"registration" is at most an account on a submission portal, created in
minutes. Modelling a readiness gate there adds ceremony with no lead-time
reality behind it; a portal-account note in the submission checklist
suffices. The gate earns its place only where a register with real queues,
real validation, or a real exclusion list stands between the applicant and
the submit button.
