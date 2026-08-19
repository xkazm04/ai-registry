---
layer: technique
type: technique
subject: grant-matching
technique: explainable-match-reasons
status: forged
laws: [never-fabricate-a-figure, provenance-per-field]
shared_with: []
use_when: [building the "why this matched" surface next to a ranked list, auditing whether match explanations are faithful to the ranker]
---

# Explainable match reasons

The concern: a ranked shortlist without reasons is an oracle, and organizations
do not stake application effort on oracles. But the obvious fix — ask a model,
or a separate template, to "explain the match" — produces explanations that are
*plausible* rather than *faithful*: they assert alignment the ranker never
measured. Users assume explanations describe the actual decision; the
recommender-explainability literature calls the property at stake *fidelity*
(agreement between the ranker and the explainer) and consistently finds that
post-hoc free-form explanations fail it. The technique: **derive every reason
mechanically from the score components that actually earned credit, and never
emit a reason a component did not pay for.**

## Procedure

1. **Explain from components, not from inputs.** The explanation function
   takes the scored components (plus the raw records only to recover
   evidence), and emits one short reason per component that earned credit.
   Structure each reason as a typed record — a `kind` naming the component
   and a human label — not free prose, so the UI and any audit can map
   reason → component 1:1.
2. **Cite concrete evidence inside the label.** "Matches your focus: youth,
   after-school, tutoring" beats "strong mission alignment" — the former is
   checkable by the reader in ten seconds. Recover the evidence with the
   *same matching rule the score used*: the matched-keyword list for the
   mission reason, the specific place name for the geography reason. Cap
   cited evidence (top 2-3 items) — evidence is proof, not inventory.
3. **Grade the reason's strength to the credit earned.** Full geographic
   credit says "serves your area (their city)"; partial credit says "open
   nationwide"; zero credit says nothing. A tiered component gets tiered
   language, never the strongest phrasing for the weakest tier.
4. **Silence is the honest output for an empty component.** No hedged filler
   ("may align with your mission"), no negation padding. Absent reasons *are*
   the signal that a match is thin — a two-reason row should look weaker than
   a four-reason row.
5. **Keep the explainer pure and colocated with the scorer.** Same module,
   same constants, ideally tests that assert reasons appear iff the component
   scored. Distance between scorer and explainer is where drift breeds: a
   scoring tweak that forgets the explainer produces reasons for credit that
   no longer exists.

## Decision rules

- **When the score cannot say which evidence earned the credit** (a scalar
  came back without provenance), recompute the evidence from the inputs with
  the identical rule — or drop the reason. Never narrate a number.
- **When a model lane also produces "why match / why not" prose,** label the
  lanes distinctly and keep the deterministic reasons visible alongside — the
  model's reasons are qualitative judgment, the component reasons are the
  audit trail; conflating them launders opinion into evidence.
- **When a reason would require information the score ignored** (funder
  history, past success), either promote that signal into a scored component
  first or leave it out of the reasons. The rule is directional: signals flow
  into the score, then out into reasons — never around the score.
- **When localizing or rewording labels,** treat the `kind` as the stable
  contract and the label as presentation; audits key on kinds.

## When NOT to use it

- For the model lane's qualitative narrative — that lane is *supposed* to add
  judgment beyond the components, and forcing it into component-shaped
  reasons wastes it. Present it as analysis, separately labeled.
- When the ranker is genuinely opaque (learned embeddings, no decomposition):
  do not fake component reasons on top; either surface honest proxy evidence
  clearly labeled as such ("similar to funders that supported you"), or
  invest in a decomposable baseline ranker whose reasons are real.
- For internal debugging output — dump the full components there; the
  evidence-capped, tiered-language discipline is for user-facing surfaces.
