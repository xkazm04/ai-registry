---
layer: technique
type: technique
subject: recruiting-cost-and-automation-economics
technique: an-organisation-owned-manual-baseline
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, every-decision-names-its-actor]
use_when: [choosing a manual-hours-per-hire figure, defending a saving to a customer's finance team, deciding whether a research average may be quoted at a specific team]
shared_with: []
---

# An organisation-owned manual baseline

The denominator of every "how much of the manual work did this replace"
claim is a figure for how much manual work there was. That figure must be
**settable by the organisation the claim is about**, seeded with a cited
research default, and displayed with a visible marker of which of the two is
currently in force.

The reason is not statistical, it is social. A published industry figure for
manual hours per hire is a mid-point across company sizes, industries,
seniority mixes and hiring models. A talent leader looking at their own
number knows their own split of sourcing, screening and coordination hours,
and knows within seconds whether the figure you quoted resembles it. When it
does not, they do not adjust it mentally — they discard the entire claim, and
with it the arithmetic that was fine. **Credibility on a money claim is spent
once**, and a wrong-looking baseline spends it before the reader has reached
the interesting part.

## Procedure

1. **Pick a research anchor and record it as a mid-point, not a fact.** Name
   the source, the year, and the population it was drawn from. Record it as a
   range if the source gives one, and keep the mid-point as the default value.
2. **Decompose it into the parts a team recognises.** Sourcing hours,
   screening hours, interviewing hours, coordination hours. A team cannot
   sensibly edit a single opaque total, but they can tell you that their
   sourcing is largely inbound and their screening is triple your default.
   Decomposition is what makes the setting usable rather than theatrical.
3. **Make it editable at the organisation level and record who changed it,
   when, and to what.** A baseline is a decision about what the organisation
   claims about itself; it
   [names its actor](../../../_laws.md#every-decision-names-its-actor) like any
   other decision that shapes an output.
4. **Mark the state of the figure wherever it is used.** "Industry default"
   versus "set by your team" is a one-word difference in the interface and a
   complete difference in how the resulting number is read.
5. **Never let an edit silently rewrite history.** Either recompute past
   periods and say so, or bind each period's ratio to the baseline in force at
   the time. Both are defensible; an unannounced restatement is not.
6. **Treat the first customer edit as success.** A baseline nobody has ever
   changed is more likely to be an unnoticed default than an agreed one.

## Decision rules

- When a team's edited baseline makes the product look worse, keep it. A
  configurable baseline that is only honoured when it flatters is a
  presentation control wearing a settings label, and the first person who
  notices will tell everyone.
- When no baseline has been set and the default is in force, the derived
  ratio still ships — but labelled as resting on an industry default, with
  the default's value legible next to it, not buried in documentation.
- When a baseline is described as override-able, verify the override reaches
  the published figure end to end: a stored value, a surface that sets it, a
  read path, and every call site passing it. A computation that *accepts* an
  override no caller supplies is measuring against a constant while claiming
  otherwise, and the claim is worse than the constant would have been alone.
- When the baseline is used in two places, it is read from one place. Two
  copies of an assumption diverge, and the divergence is invisible because
  both sides look internally consistent.
- When a baseline would have to differ by role family or seniority to be
  honest — an executive search and a high-volume operations hire do not share
  a manual-hours figure — either provide the segmentation or state that the
  ratio is organisation-blended and not comparable across role types.
- When someone proposes deriving the baseline from the product's own
  observed data, refuse. The system only observes the assisted world; a
  baseline inferred from it is the counterfactual assuming itself, and the
  ratio it produces will drift toward whatever the product happens to do
  most.
- When the claim leaves the product — a slide, an export, a renewal
  conversation — the baseline value and its provenance travel with it
  ([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## Why the default still matters

Making the baseline editable is not permission to ship a bad default. Most
organisations will never change it, so the default *is* the number for most
readers. Choose it as though it were the only value: cite it, keep it current
as research is republished, and prefer a widely recognised figure over a more
precise obscure one — a reader who recognises the source argues with the
model, and a reader who does not argues with your motives.

## When not to use this

Do not make a baseline editable where it is not an assumption. Invoiced
amounts, metered spend and recorded counts are facts about the record; giving
them a settings control invites a customer to improve their own results, and
converts a measurement into a preference.

Do not use an organisation-owned baseline as the basis for comparing one
organisation against another. Two teams that set their baselines differently
produce ratios that cannot be placed on the same axis; cross-organisation
comparison is a separate discipline with its own privacy constraints, and it
needs a common basis this technique deliberately does not provide.

Do not accept a baseline edit as a substitute for measurement where
measurement is possible. If a team can tell you what their screening actually
takes because they have timed it, that is evidence, and it should be recorded
as such rather than as a preference someone typed.
