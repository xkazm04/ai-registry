---
subject: accessibility
domain: software-engineering
last_touched: 2026-09-01
dry_streak: 0
---

# accessibility

First touch: 2026-08-28, a `/deepen` loop round on the software-engineering
domain. Selected as round 1 because it topped the librarian worklist on two
independent signals: the highest consumer-deviation count in the fleet (7,
against 4 consults) and single-stack (`react`) with no librarian sweep ever.

## State

6 -> 7 techniques, 2 applications (both `react`, both from the same tree,
`verified_on: 2026-08-18`). Single-stack debt NOT retired — see the leads.

Landed:

- `assistive-tech-divergence` (new technique) — the delivery layer is a grid
  of independently built reader/browser pairs that disagree about the same
  markup, because the standards specify what a role or a live region *means*
  far more precisely than the timing and eventing an assistive technology must
  observe to notice one. Holds four things the subject had nowhere: the written
  pairing list (untested is not working), the design preference for mechanisms
  no implementation has to interpret, the failure ranking that tie-breaks a
  genuine disagreement (silence worst, wrong announcement next, verbosity is
  the price you pay), and the rule that a pairing workaround is load-bearing
  code that must carry its pairing and its date or a cleanup pass deletes it.
- `a11y-verification` amendment — the automated-audit detection ceiling.
- `accessibility.md` — matching correction plus a new golden-path section for
  the technique.
- `live-region-architecture` amendment — its existing "on most platform/reader
  combinations" hedge now says why the qualifier is load-bearing and points at
  the new technique.

## The correction worth remembering

The subject asserted, in two places, that rule engines "detect roughly a third
of the defects a human audit finds" — a bare number with no denominator, stated
inside the very paragraph that invokes `count-carries-predicate`. The
circulating figures disagree by more than a factor of two and all of them are
honest, because they count different populations:

| Figure | Denominator |
| --- | --- |
| ~a third (the classic number) | WCAG success criteria a rule engine can decide at all |
| 57.4% | defect *volume* in real first-pass audits — one vendor's study over 2,000+ audits, 13,000+ pages, ~300,000 issues, which explicitly *shifted* the denominator away from criteria |
| ~80% | the above plus items merely flagged for human review (vendor marketing) |

Volume runs higher than criteria because the mechanically detectable failures
are also by far the most numerous. The vendor's own channels conflate the two —
its engine repository states "57% of WCAG issues", read by at least one filed
issue as a criteria figure. The amendment does not swap one number for another:
it makes the denominator the doctrine, and names which denominator answers which
question (criteria coverage bounds what the gate can structurally never see;
volume estimates how much cheap remediation is on the table).

## Counter-evidence that confirmed (no edit — first-class results)

- **`live-region-architecture` platform semantics #3** — "an unchanged string is
  not a mutation" — holds, and the corpus's keyed-remount defeat is *stronger*
  than the workaround the field publishes. The common fix (clear the region,
  write again after a tick) is documented failing on one major pairing; forcing
  a fresh node makes the mutation structural and unambiguous to all of them.
  The corpus reached the better mechanism and did not know it was the better one.
- **The "decaying claim" doctrine** in the golden path is measured, not
  rhetorical: the February 2026 pass over the top million home pages found 95.9%
  with detectable WCAG 2 failures (up from 94.8%), 56.1 detected errors per page
  (up 10.1% year over year), against a 22.5% one-year rise in elements per page.
  Drift is winning at population scale. Left out of the corpus deliberately — a
  survey-of-the-web statistic is not craft, and the skill's rule is that measured
  numbers live with their n in applications, never laundered upstairs.

## Open leads (banked, with return conditions)

- **Single-stack debt stands.** Both applications are `react` from one tree.
  The natural second stack for this subject is not another web framework but a
  *terminal or native* surface, where the same contracts (name, keyboard path,
  announcement) exist with none of the browser's free machinery — the corpus
  has precedent for that lane paying well. Return condition: an external-
  reconcile wave with a non-web accessible-UI tree pinned.
- **Route-change focus and announcement is genuinely absent** from the subject
  (grep: zero hits for route change, navigation announcement, page title
  management). It is the one app-wide keyboard/announcement contract with no
  home here, and its mechanics may belong to a shell/navigation neighbour rather
  than to this subject. Not minted: the technique budget for the round was spent
  on divergence, which had lane convergence behind it and this does not yet.
  Return condition: any run that opens `shell-and-navigation`, which can settle
  the boundary from both sides.
- **The published standards carry no version anywhere in the subject.** As of
  2026-08-28 the operative recommendation is WCAG 2.2 (October 2023); WCAG 3.0
  is a working draft (a March 2026 draft renamed its outcomes to 174
  "requirements") with a candidate recommendation targeted no earlier than Q4
  2027. The golden path's undated "the published standards are the floor" is
  therefore *correct as written* and needs no clock — deliberately left alone.
  Return condition: WCAG 3.0 reaching candidate recommendation, which would
  make the conformance-model change real rather than prospective.

## Declines

- **Accessibility statements / conformance reports as a required artifact.**
  Real, and in some jurisdictions now legally required. Declined for this
  subject: the golden path opens by rejecting the compliance framing as one of
  two framings that fail reliably, and that is a considered position rather than
  an oversight. A legal-obligations topic is a different subject, not a section
  here. Do not re-propose as a technique of `accessibility`.
- **Naming reader and browser products in the new technique.** The divergence
  evidence is entirely concrete — specific pairings disagreeing on specific
  grades of pre-populated live region — and none of it could go upstairs. The
  `software` purity denylist does not currently list assistive-technology
  product names, but the corpus has zero of them in upper layers today and the
  denylist is documented as a floor rather than the whole rule. Written
  structurally instead; the concrete pairings live in this note.

## 2026-09-01 - external reconcile, single-stack debt CLOSED ([[2026-09-01-1]])

The open lead's return condition arrived: a non-web accessible-UI tree, pinned.
Counterpart `AccessKit/accesskit` @ `00b517c`, crate 0.25.0 (class A, rust), the
cross-platform accessibility infrastructure with a schema, a consumer tree and five
platform adapters. Landed `applications/rust--name-and-description-wiring.md` (130
lines) on the technique that had zero applications. Fate **confirmed** for the contract,
with the hint's specifics split: schema and adapters as predicted; the consumer's name
computation runs the top two precedence tiers *backwards* from the browser algorithm
(direct label wins, relation only when absent; content-as-name is a per-role opt-in for
eight roles); and `described_by` is declared as the describing relation and resolved by
nobody - grep over consumer and all adapters is empty, and one mobile adapter has no
description channel at all. Executed: 206/206 consumer tests; a scratch harness proving
direct-label-beats-relation and description-relation-never-resolved.

Technique-edit candidates, banked at one sighting: the precedence paragraph is the
*browser's* algorithm, not the domain's; the "classic defect" direction is
platform-dependent (name the failure - two sources, one silently wins - without fixing
which); the description chain is a web mechanism, the invariant is what travels.

Proposals placed in the run note: `assistive-tech-divergence` (zero applications) has a
source-measured candidate on this same pin - five adapters diverging on the description
channel and on live-region delivery; `live-region-architecture` gains "a nameless live
region is silent" (every announcing adapter refuses without a computed name; `live()`
inherits from the parent).

Leads: `role_description`/`state_description` (return: a wave binding
`primitive-level-a11y` here); the text-run model has no home in this subject.
