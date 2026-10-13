---
layer: application
type: application
subject: roll-call-vote-analysis
technique: positional-vs-participation-bases
stack: node
status: forged
verified_on: 2026-10-13
verified_against: node@24
applied: code
ab_verdict: better
proof: structural-only
---

# Positional vs participation bases in a civic-graph pipeline (node)

The two bases are exported once beside the choice vocabulary in the shared
normalization module: `PRESENT_CHOICES` (yes, no, abstain, not-voting and the merged
post-1995 bucket) and `POSITIONAL_CHOICES` (yes, no). The party-line and rebellion
code imports the second. The seam hunt opened the contribution-score writers and found
the first restated three times.

## What the tree did

Three scripts that count a member's cast ballots for the participation rate each declared
a local set of the same five choices under the name `POSITION`. The name is the inverse
of the technique's vocabulary: the set is the participation base, and it includes
abstentions, so it is not the positional base. The values matched the shared constant
exactly, so nothing was wrong yet; the fork was the drift risk the technique names
("a metric that lists its qualifying choices inline has forked the definition").

## The change and its proof

The three scripts now import the shared constant. Target: inline restatements of the
participation base, 3 to 0. Floor: the old inline set and the imported set are identical
(5 of 5 members), the type check is clean on the three files, and 36 contribution and
shim tests stay green. The proof is structural: with identical sets no ballot is
counted differently, so there is no behavioural arm to run. The seam was chosen to
falsify the application's premise (that the bases were already single-sourced); the
first corroborating tree for this technique had them single-sourced in the line and
rebellion code only, and this one refutes that for the participation side.

## What the seam also showed (not changed)

- The published component for participation cites its source as positional votes while
  its numerator counts abstentions. Under this technique that is the wrong base name on
  published copy, and the right fix is a wording change, not a recomputation.
- The denominator is every counted roll call in the term for every member, although the
  input's own comment says it should be the roll calls the member's mandate could have
  voted in. The technique's eligibility rule (mandate dates) is not met by this metric,
  and a member seated mid-term is scored against votes before they sat. Changing it
  moves published scores, so it needs its own paired measurement first.

## What this cannot do

An import swap secures the definition against future drift only for code that imports
it; the labels and the denominator above are untouched, and no test pins the base a
metric names.
