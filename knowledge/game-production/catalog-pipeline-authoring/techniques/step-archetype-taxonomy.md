---
layer: technique
type: technique
subject: catalog-pipeline-authoring
technique: step-archetype-taxonomy
status: forged
laws: [one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [defining the step vocabulary a content system draws from, deciding whether to add or retire a step kind, a content class that does not fit the existing kinds]
---

# Step archetype taxonomy

Fix a small closed set of step kinds — call them archetypes — that every content class
composes its production line from. A class is then declared as an ordered list of
steps, each naming one archetype, and it inherits rendering, authoring, acceptance and
coverage from the vocabulary instead of implementing them.

The archetype is not a tag. It is the **deliverable contract**: it decides the shapes
the step is allowed to render, the domain context injected when the step is authored,
the corrective language offered when the step fails, and whether an automated author
may attempt the step at all. If you can change a step's archetype without changing any
of those, the taxonomy is decorative and is buying you nothing.

## Sizing the vocabulary

Nine kinds is a workable number; a dozen is the ceiling. The constraint is that an
operator and a reviewer must both hold the whole vocabulary in mind without a
reference card, because the value of the taxonomy is that a step's kind *communicates*.
A vocabulary large enough to need lookup has already lost the property it was bought
for.

A serviceable spine, by deliverable rather than by subject matter:

- a prose brief — the class's intent in words
- a structured record — a flat set of typed fields
- a rule set — enumerated rules or wired entries, one per row
- balance figures — numbers that must sit inside a stated band
- a candidate gallery — generated options from which one is selected
- a checklist — verifiable statements, each independently true or not
- a manifest — the concrete assets or entries this step commits to
- a graph — nodes and edges with reachability and terminal states
- a bespoke escape hatch — this class renders its own surface

Note what the axis is: **the shape of the deliverable, never the domain of the
content.** "Enemy stats" and "item stats" are the same archetype; a brief and a rule
set are different archetypes even though both are text. Slicing by domain produces one
archetype per class, which is the bespoke-tool world with extra ceremony.

## Procedure

1. **Enumerate every step in every existing content class** and write down, for each,
   what its deliverable actually is. Do this before proposing kinds. The vocabulary is
   read off the corpus; it is not designed for it.
2. **Cluster by deliverable shape** and name each cluster. A cluster of one is a
   candidate for merging into its nearest neighbour, not a new member.
3. **Give each member a corrective sentence** — the plain-language instruction the
   system offers when a step of this kind is not passing. If a member cannot be given
   a specific corrective sentence that invents no content, it is not a real member.
   This is the sharpest test in the whole procedure, and it is cheap to run.
4. **Declare which members an automated text author may produce end to end.** Only
   those whose deliverable is text. A generated image, a mesh, a package or a computed
   budget comes from a different engine, and routing it through a text author lets a
   claim of authorship be made where none was earned.
5. **Publish the vocabulary as the single authority** — one declaration that the
   renderer, the linter, the corrective-language table and the eligibility set all read.
   A vocabulary listed in two places drifts, and the drift is silent.

## Decision rules

- **Add a member only on evidence of three.** Three independent classes wanting the
  same shape is a missing member; one class wanting it is a class with an unusual need
  that should either use its nearest neighbour or stay outside the catalog.
- **Do not widen a member to admit a single step.** Widening trades a global property
  for a local convenience, and the cost lands on every future reader of the vocabulary.
- **Constrain the escape hatch to what it is actually used for.** If every step using
  the bespoke kind turns out to have the same shape, say so in the declaration. An
  escape hatch that silently accepts anything measures nothing; one pinned to its
  observed use forces the next genuinely different step to be a recorded decision.
- **Measure adoption per member, not just conformance.** A member declared but used by
  nobody, and a rendering capability shipped but declared by one step, are the same
  defect: a capability nothing guards. Count uses per member and per variant; a zero
  is either a member to retire or an adoption gap to close, and you cannot tell which
  without the count.
- **A member with no uses is not automatically a defect** — but the burden is on the
  declaration to say which of the two it is. Never mass-author placeholder uses to
  "adopt" a member; a fabricated use is worse than an honest zero, because it makes the
  count lie.

## Retiring a member

Retirement is where a taxonomy proves it is maintained rather than merely declared, and
the strongest evidence of a healthy vocabulary is a member that was removed with the
reasoning preserved.

Retire when the member's **signature cannot see the state it exists to describe.** The
canonical case: a per-step hook for corrective language that is handed only the
produced artifact and never the verdict that graded it. Such a hook structurally cannot
name the criterion that failed or the reason the checker gave, while a derived fallback
composed from the kind, the criterion and the checker's own reason always can. Authoring
against it therefore either makes the result strictly less honest than the fallback it
replaces, or duplicates the cause-derivation in a second place that will drift.

The discriminating question when retiring is about the signature, not the usage count.
A sibling field that is a **plain authored string** — a standing instruction a human
writes deliberately — survives the same audit, even at zero uses, because a person
writing a sentence is not required to reason about a verdict they cannot see. A
*callback* that must reason about state outside its arguments does not survive it, even
at zero uses, because every future author of it will be misled.

The retirement procedure: mark the member as retired in the declaration with the full
reasoning inline; add a check that fails any new use; keep the branch that reads it only
while a live consumer exists, and delete it the next time that file is opened. A retired
member with its post-mortem attached is the most useful documentation a vocabulary has —
it teaches the next person the shape of a bad member.

## When not to use this

Do not impose a closed vocabulary on fewer than about five content classes. Below that,
the invariants have not appeared yet and you would be designing the taxonomy rather than
deriving it — which produces exactly the loose-or-unaffordable rule this technique
exists to avoid. Build three or four classes bespoke, watch what they share, and
close the vocabulary when the sharing is visible.

Do not use it for a class whose production genuinely has no ordered spine — a research
spike, a one-off tuning pass, an investigation. A production line assumes there is a
line. Where there is not, the honest move is exclusion with a stated reason.
