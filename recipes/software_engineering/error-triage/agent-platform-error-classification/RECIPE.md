---
name: agent-platform-error-classification
version: 0.2.0
status: seed
domain: software_engineering
path: software_engineering/error-triage
---

# Agent platform error classification

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A raw failure record tells nobody what to do with it. Forced into the nearest
familiar bucket it is worse than useless, because the bucket then carries a count that
somebody will act on. The two questions that actually change what happens next are
whether the failure will recur if the same work is tried again and whose change would
stop it, and a taxonomy that does not answer those produces categories nobody uses.

**Input.** One recorded failure with whatever context came with it, the run it belongs
to, and the library of classifications made for failures of this shape before.

**Core action.** Decide whether the failure is transient or will repeat on identical
input, decide whose change would prevent it, and name a remediation specific enough to
be picked up as work, or record honestly that the failure is of a kind not seen before.

**Output.** A classified record carrying a verdict a person could act on, and a growing
library whose uncategorised share is visible, because that share is what says whether
the taxonomy still fits.

## Activities

1. Read the failure with the context and the run it came from *(observe)*
2. Compare it against classifications made for failures of this shape *(observe)*
3. Decide whether it will repeat on identical input and whose change would stop it
*(decide)*
4. Name a remediation specific enough to be picked up, or none *(decide)*
5. Write the classification back where the next failure of its kind can read it
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every classified failure carries the two facts that decide the response: whether
retrying the same work would help, and who would have to change something for it to
stop.**

- A failure that would succeed on an unchanged retry is marked as such and is not
  proposed for a code change.
- A failure whose cause sits outside the operation, in a provider outage, a rate limit,
  an expired credential or a changed upstream contract, is named as such rather than
  given a local fix.
- A remediation names a change somebody could make, not an intention: an instruction to
  add a specific guard is a remediation, an instruction to improve error handling is
  not.
- Blast radius names what else was affected, including runs that failed because this one
  did, rather than being asserted as a level.

**A failure of a kind nobody has seen is recorded as uncategorised, and the count of
those is the measure of whether the taxonomy still fits.**

- An ambiguous failure is classified at the highest plausible severity with the
  ambiguity recorded, and the record keeps that first verdict when it is later revised.
- The uncategorised share of recent failures is reported, and a rising share is treated
  as evidence the categories need revising rather than as failures to force into
  existing ones.
- No category is invented to hold a single failure, and no failure is placed in a
  category whose defining question it does not answer.
- A verdict a person revises downward is kept in the library beside the first call
  rather than replacing it, because declaring the harder verdict on thin evidence is
  only worth what it costs while those revisions stay rare, and a failure shape revised
  down every time it appears has stopped being one the thin evidence should be called
  hard on.

**A failure of a shape already classified is classified faster and the same way, and
this is visible rather than assumed.**

- A repeat of a previously classified shape reaches the same category, and a divergence
  from the earlier verdict is recorded with what changed.
- The first runs state that the library is being established and that matches are
  unavailable, rather than reporting low confidence as though it were a property of the
  failures.

## Guidance

Two cuts do most of the work: will this recur on identical input, and whose change stops
it. Everything else is detail hung on those. Declare the harder verdict when the
evidence is thin and let it be revised, since under-calling a failure costs more than
over-calling one, but keep the first call in the record so nobody quietly rewrites
history. An honest uncategorised is a finding. A category that never sees a second
member was never a category.

## Where this is worth adopting

- An operation running enough automated work that failures arrive faster than anyone
  reads them, where the useful first cut is not what broke but whether anybody needs to
  do anything.
- A fleet where most failures are an expired credential or a provider having a bad hour,
  and the person reading the list has learned to assume that and now misses the one that
  is a real defect.
- A team that inherited a failure taxonomy from a template and has never checked whether
  it fits their failures, so most records land in a general bucket and the counts
  describe nothing.
- A cascade, where one agent failed and four downstream of it failed because of that,
  and four separate remediations get proposed for one cause.
- The weeks after adopting automation at all, when nobody yet knows which failure kinds
  this operation actually produces and the honest output of classification is a map of
  them.

## Connector types

None. This work needs no external connector: the tools the agent already has are enough.

## Recommended trigger

`event`. A classification exists only in response to one recorded failure, so this work
wakes per arrival. It is the second stage of a pipeline rather than something that
chooses its own moment, and classifying while the run context is still retrievable is
what makes the verdict groundable.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What the categories mean in this operation, because a taxonomy borrowed whole is a
  taxonomy nobody uses, and the fastest way to find the real one is to let the
  uncategorised pile name it.
- What counts as a remediation a person here could actually apply, since the same fix is
  a config change in one operation and a quarter of work in another.
- Which failures this operation has decided it will live with, so they are classified as
  accepted rather than re-proposed for remediation on every occurrence.
- How the platform reports a failure that was retried and then succeeded, because
  whether that is a failure at all is a policy decision and it changes every count
  downstream.

## Dependencies

None.
