---
layer: golden-path
type: golden-path
subject: funder-format-blueprints
status: forged
use_when: [structuring an application for a specific funder family, building or auditing a drafting product's section model, a proposal reads well but cannot be submitted in the funder's form, deciding which application structure a newly ingested opportunity needs]
techniques:
  - supranational-award-criteria-sections
  - federal-rubric-sections
  - trust-and-lottery-sections
  - arts-panel-sections
  - movement-funder-sections
  - blueprint-routing-rules
---

# Funder-format blueprints

A funder-format blueprint is the ordered list of sections an application
actually needs for one funder family, with per-section guidance that mirrors
how that family's reviewers score. It is the structural half of proposal
craft: before a single sentence is drafted, the blueprint decides *what
sections exist, in what order, at what length, answering which rubric
criterion*. The prose half — evidence, register, narrative arc — lives in
its own subjects; this one holds the load-bearing truth that **the funder
sets the form**, and that form differs so much between funder families that
one generic template misfits all of them.

The naive reading is that a proposal is a proposal: write a narrative, a
budget, a logic model, and adapt the tone. That template is genuinely the
safe default for private foundations — but hand it to a supranational
research programme whose evaluators score three named award criteria, or a
federal reviewer working down a points rubric, and the applicant produces a
document that cannot be *submitted*, however well written. The failure is
structural, not stylistic: the portal's form has fields the template never
filled, and the reviewer's score sheet has criteria no section answers. A
drafting practice (or product) hardwired to one section set silently caps
which funders its users can approach.

## The organizing insight: sections mirror the score sheet

Every mature funder family publishes, explicitly or by strong convention,
the criteria its reviewers score. The blueprint's job is a one-to-one
mapping: **one section per scored criterion, in the reviewer's order, with
guidance written in the reviewer's own vocabulary.** A supranational
evaluator scores excellence, impact, and quality of implementation as three
independent criteria, each with its own threshold that a strong score
elsewhere cannot compensate — so the application carries exactly those three
sections, and each must stand alone. A federal reviewer allocates points
across need, approach, capacity, and evaluation, and every sub-criterion in
the notice reappears on the scoring sheet — so the application separates
those four dimensions instead of cramming them into one narrative blob. A
trustee reading a small charitable trust's two-page form wants the need,
what the money funds, and the difference it makes — three modest sections,
and anything longer works against the applicant. An arts panel scores the
work itself, its public, and its deliverability. A movement funder reads for
the injustice, the theory of change, the base, and how power gets measured.

The mapping cuts both ways. A section the rubric does not score is dead
weight the reviewer must skim past; a criterion no section answers is points
forfeited at the desk. When the funder publishes sub-questions under a
criterion, the section answers all of them, in order, in the funder's own
words — reviewers navigate by their score sheet, and a section that mirrors
it is a section they can score in one pass.

## The section as a contract: key, label, guidance, band

A blueprint section is more than a heading. Treated properly it is a small
contract with four parts:

- **A stable key** — the machine identity under which drafted content is
  stored, distinct from the label. Keys let different funder families share
  a criterion where they genuinely overlap (several families score a "need"
  and a "capacity" dimension under different labels), which in turn lets
  review tooling and quality gates cover new families automatically.
- **A display label in the funder's vocabulary** — the same underlying
  criterion is "Statement of need" to a federal reviewer, "The need" to a
  trustee; the label carries the family's register.
- **Per-section drafting guidance keyed to how this family scores** — not
  generic writing advice but the criterion decomposed: what the reviewer
  looks for, in what order, with the family's non-negotiables named
  (measurable objectives and dissemination for the supranational family;
  quantified evidence for the federal need section; a concrete reach figure
  for the arts audience section).
- **A word band** — a per-section minimum and maximum reflecting what a
  proportionate answer to *this* criterion looks like in *this* family. A
  generous generic window lets a bloated section pass unflagged; a tuned
  band catches "runs long" before a hard portal limit truncates it. The band
  used at review time must be the same one used at drafting time, or the
  two halves of the practice disagree about the same text.

Guidance never licenses invention. Where a criterion demands a figure the
applicant has not supplied — a baseline, a reach number, a match amount —
the section carries a bracketed placeholder for the writer, not a plausible
guess. A blueprint that pressures drafters toward specificity must pair
that pressure with an explicit escape valve, or it manufactures fabricated
statistics at scale.

## Routing: which blueprint does this opportunity get

The second half of the subject is deciding, per opportunity, which
blueprint applies — and doing it conservatively. The precedence that holds
up in practice: **a known funder portal wins outright** (the portal knows
its own form; no classifier should out-vote it); **then the opportunity's
genre** (a federal-style notice, an arts call, a movement funder — genre
implies form even when the portal is unknown); **then structural family
resemblance** (a regional government grant follows the federal shape); and
**the modest generic template as the default** for everything else. The
default must be exactly the previously trusted structure — routing an
opportunity to the wrong specialized form is worse than routing it to the
safe generic one, so uncertainty falls through to the default rather than
to the nearest exotic match
([blueprint-routing-rules](techniques/blueprint-routing-rules.md)).

Routing is also where the funder's *own stated requirements* enter. When
the call text has been parsed into explicit criteria and required elements,
those are threaded into drafting as delimited, untrusted grounding data the
writer must address item by item — the funder's list, not a paraphrase, and
never as instructions that could rewrite the task.

## Failure modes this standard exists to prevent

- **The universal template** — one section set for every funder; the
  applicant is structurally locked out of every portal whose form differs.
- **The crammed narrative** — four scored dimensions stuffed into one
  section because the template had nowhere else to put them; the reviewer
  hunts for each criterion and scores what they can find.
- **The eloquent miss** — beautiful prose that never answers a scored
  sub-question; points are lost at the desk, invisibly to the writer.
- **The register transplant** — supranational impact-pathway language in a
  small trust's form, or trustee modesty in a points-rubric competition;
  each family reads the other family's register as not understanding them.
- **The unbanded section** — no per-criterion length discipline, so one
  section swallows the word budget of three and a hard portal limit
  truncates mid-argument at submission.
- **The over-eager router** — a classifier that forces every opportunity
  into some specialized form; a wrong structure is harder to recover from
  than a generic one, because the writer builds on it.
- **The specific-sounding fabrication** — guidance demanding numbers
  without a placeholder discipline, converting rubric pressure into
  invented figures.

## The techniques

- [supranational-award-criteria-sections](techniques/supranational-award-criteria-sections.md) —
  the three-criterion form: excellence, impact, implementation, each
  independently thresholded, plus measurable objectives and dissemination.
- [federal-rubric-sections](techniques/federal-rubric-sections.md) — the
  points-rubric form: need, approach, capacity, evaluation as separate
  sections; evidence, not adjectives.
- [trust-and-lottery-sections](techniques/trust-and-lottery-sections.md) —
  the short charitable form: need, activities, the difference it will make;
  community voice and the modest register.
- [arts-panel-sections](techniques/arts-panel-sections.md) — the arts-panel
  form: artistic quality, public engagement, feasibility; ground the case
  in the work, not adjectives.
- [movement-funder-sections](techniques/movement-funder-sections.md) — the
  movement-funder form: problem, strategy and theory of change, base and
  coalition, power-building outcomes.
- [blueprint-routing-rules](techniques/blueprint-routing-rules.md) —
  portal-first precedence, genre second, structural resemblance third,
  the safe default last; requirements threading.
