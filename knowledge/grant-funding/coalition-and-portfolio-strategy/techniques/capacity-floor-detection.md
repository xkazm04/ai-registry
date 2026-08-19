---
layer: technique
type: technique
subject: coalition-and-portfolio-strategy
technique: capacity-floor-detection
status: forged
laws: [hard-gates-precede-soft-scores, honest-null-over-forced-guess]
shared_with: []
use_when: [screening a grant whose minimum award dwarfs the applicant, deciding which eligibility fails can convert to coalition leads]
---

# Capacity floor detection

The concern: among all the ways a grant can fail an applicant, exactly one is
curable by partnership — the award floor exceeding the applicant's capacity to
absorb and administer the money. Detecting that case precisely, and separating it
from the fails that partnership cannot fix, is what makes a coalition pipeline
possible. Detect it too loosely and the system proposes coalitions for grants the
applicant could never touch for other reasons; detect it too tightly and the most
valuable opportunities dead-end as plain rejections.

## The capacity heuristic

The working proxy for "can this organization responsibly carry this award" is
annual revenue. A single award larger than the organization's entire annual
revenue is a likely capacity-strain mismatch: funders read it as delivery risk,
auditors read it as absorption risk, and the organization's own systems —
accounting, reporting, staffing — were sized for a different scale of money.

The rule: **when the award floor exceeds annual revenue, the capacity check fails
hard** — this is a deterministic gate, not a score input, because a beautifully
matched application the applicant cannot responsibly accept is worth nothing.
Below that line, capacity is a matter of degree: a useful secondary band is the
"sweet spot" where the award sits at roughly 5–40% of annual revenue — large
enough to matter, small enough to absorb. Awards outside the band but below the
hard line are flagged for judgment, not failed.

## Floor and ceiling are different objects

The published award range has two bounds with opposite unknowns, and collapsing
them is a known and expensive bug. A grant that publishes only a maximum has an
**unknown floor, which defaults to zero** — many funders with big ceilings happily
make small awards. A grant that publishes only a minimum has an unknown ceiling,
unbounded above. Treating a lone published figure as "the amount" makes a
high-ceiling/no-floor grant fail the capacity gate it should pass, and lets a
single-bound grant spoof the sweet-spot band. The decision rule: resolve floor as
`published minimum, else 0` and ceiling as `published maximum, else unbounded`,
and run the capacity gate against the floor only.

## When the input is missing, say so

If the applicant's revenue is unrecorded or zero, the capacity check returns
**unknown, with an instruction to supply the figure** — never a pass (which hides
a possibly fatal mismatch) and never a fail (which buries an opportunity on no
evidence). An unknown here routes a human to fill in one number; a guess in
either direction routes money-relevant decisions off an invented figure.

## The conversion: this fail is a lead

The load-bearing move of this technique is what happens *after* the fail. A
capacity fail is the only eligibility failure with a structural cure: combined
partner capacity can clear a floor no single member clears. So the fail verdict
carries a forward pointer — "reachable as a coalition with complementary
partners" — and feeds the coalition assembly pipeline with the one number it
needs: the floor that must be cleared.

The boundary of the conversion is strict. Fails that do **not** convert:

- **Applicant type** — a coalition of five organizations of the wrong legal form
  is still the wrong legal form.
- **Geography** — partners cannot move the applicant into the funder's region
  (though a partner *in* the region can sometimes lead — that is a different
  proposal, with a different lead, evaluated on its own).
- **Deadline** — no partnership recovers a closed window.
- **Mission fit** — a coalition assembled to manufacture fit reads as exactly
  that to a reviewer.

The decision rule: **propose a coalition only when the capacity gate is the sole
hard fail.** A grant failing capacity *and* geography is a rejection; surfacing
it as a coalition lead wastes assembly effort and teaches users to distrust the
coalition pipeline.

## When not to use

Do not apply the revenue heuristic to organizations whose capacity is structurally
decoupled from revenue — fiscally sponsored projects, organizations with large
pass-through budgets, or first-year entities with committed but unrealized
funding. For these, the revenue figure answers a question nobody asked; route to
human judgment instead of automating a wrong gate. And do not use the sweet-spot
band as a hard gate anywhere: it is a fit signal, and hardening it discards
viable positions at both ends.
