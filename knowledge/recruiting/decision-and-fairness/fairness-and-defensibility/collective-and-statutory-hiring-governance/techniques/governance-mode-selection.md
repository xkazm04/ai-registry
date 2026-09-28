---
layer: technique
type: technique
subject: collective-and-statutory-hiring-governance
technique: governance-mode-selection
status: forged
laws: [every-decision-names-its-actor, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [adding committee or public-sector hiring to a tool built for one decider, deciding what a comparison surface may emit, modelling who is entitled to decide a hire]
---

# Governance mode selection

The governance mode is the answer to one question — *who is entitled to decide
this hire?* — expressed as a closed vocabulary that the rest of the system
branches on. It is chosen once per hiring process, before any evaluation runs,
and it determines the **output kind** of everything the machine produces for that
process.

Getting this right early is cheap and getting it right late is not, because a
system that has no mode has one anyway: the implicit single-decider mode baked
into every code path.

## The vocabulary

Three values, and resist a fourth:

- **single-decider** — one accountable hiring authority owns the outcome. The
  machine may synthesise a recommended lead and seal it as *the recommendation*.
  A human still actions it; nothing adverse is ever automated.
- **collective** — a committee, panel or board deliberates and records a
  recommendation that travels onward. The machine is advisory only.
- **eligibility-list** — the outcome is bounded by a register's statutory order
  (a score order, quality categories, or a top-N window, each with preference
  applied by the examining office) and chosen within it by an appointing
  authority. The machine never produces a competing order. Before certification
  it produces a fit ranking with the statutory step named and left undone;
  after certification it annotates the certificate's own order.

Each value carries an epistemology, not a preference, and the definition belongs
next to the value in code rather than in a design document — the comment
explaining *why* a committee mode cannot seal is the first thing a future
refactor deletes if it is not there.

## Procedure

1. **Ask the three questions in order.** Who is entitled to decide; what artifact
   is the decision; what may the machine therefore emit. The third is derived
   from the first two. If a team answers the third first, they are designing a
   feature, not a governance model.
2. **Bind the mode to the hiring process, not to the run.** A search is
   collective from the day it is chartered. The mode is an attribute of the
   posting or the requisition, inherited by every comparison, export and
   notification under it, including unattended ones.
3. **Default to the most constrained mode you can justify**, not the most
   convenient. Where a tenant is known to be public-sector, academic, or covered
   by a co-determination agreement, the safe default is not single-decider.
4. **Write the sealing predicate as an allowlist.** *Only* the single-decider
   mode may auto-seal a pick as the decision. Every other value, including an
   unrecognised one, falls to advisory. A denylist ("not collective, not
   eligibility-list") admits every mode invented after it was written.
5. **Make the mode readable by every consumer that renders a verdict.** The
   sealing path, the summary generator, the export, the candidate notification
   and the audit record read the same field. Any consumer that infers governance
   from copy, layout or the presence of a crown will drift.
6. **Record the mode in the sealed artifact**, so a later reader can reconstruct
   which rules were in force — the record must say who was entitled to decide,
   not merely what was concluded
   ([every decision names its actor](../../../../_laws.md#every-decision-names-its-actor)).

## Decision rules

- When the mode is unknown, unset, or an unrecognised value, treat it as the most
  constrained mode available and emit advisory output. Never fall back to the
  permissive default; an unknown governance regime is precisely the case where a
  sealed winner does the most damage.
- When one process legitimately has two layers — a committee recommends, a single
  authority appoints — model it as the *more constrained* mode for the artifact
  the machine produces. The machine serves the committee stage; the appointing
  authority's decision is not a machine artifact at all.
- When a mode change is requested mid-process, it is a governance event with an
  actor and a timestamp, not an edit. Prior artifacts stay as they were, marked
  with the mode under which they were produced.
- When a tenant asks for "committee mode but let it pick anyway," refuse the
  configuration rather than adding a flag. A per-tenant override of a legitimacy
  rule is a legitimacy rule with a switch on it.

## Anti-patterns

**A mode field nothing reads.** The single most common outcome: the value is
captured at intake, shown on a settings page, and no branch depends on it. Test
this directly — flip the mode and assert the produced artifact *kind* changes,
not just its heading. Meaning does not live in a label
([meaning does not live in a label](../../../../_laws.md#meaning-does-not-live-in-a-label)).

**Mode as a permission.** Governance mode is not access control. It does not say
who may open the screen; it says what the machine may claim. Systems that collapse
the two end up letting an administrator "unlock" a sealed pick in a process where
no pick was ever legitimate.

**A fourth mode per customer.** Every additional value multiplies the branches
that must be audited and dilutes the meaning of the three that matter. Real
variation — how many committee members, what the vote threshold is, when the list
expires, which certification regime a register runs under (a score-ordered
certificate, quality categories, a top-N window) — is *configuration inside a
mode*, not a new mode.

**A consent gate mistaken for a mode, or for nothing.** Some regimes give a body
that does *not* decide a veto over each individual hire. An employee
representative body may be entitled to the application papers before every hire,
may refuse consent only on enumerated grounds and in writing within a fixed
period, is deemed to consent if it stays silent, and can be overridden only by a
court. That is not a fourth answer to "who decides": the decider is unchanged,
and the mode is whatever it was. It is an **overlay** on any mode, with states
of its own: requested, refused with reasons, consented, consented by lapse of
time, and substituted by a court. Two things follow for the machine. What the
body receives is evidence in the sense of the committee packet, the same
material the decider saw. And a hire that departs from a consented selection
guideline is a refusal ground, so if the tool's logic *is* such a guideline, a
departure from its ordering must be visible to the decider before it is
submitted, not discovered by the body.

## When not to use it

Do not introduce modes into a tool that only ever serves a single accountable
decider and has no path to committee or public-sector use. A vocabulary with one
inhabited value teaches nothing and rots. The moment a second shape appears,
introduce all three at once — a two-value split between "normal" and "special"
is the version that fails, because the two genuinely different constrained modes
get merged and the eligibility-list semantics disappear into the committee case.
