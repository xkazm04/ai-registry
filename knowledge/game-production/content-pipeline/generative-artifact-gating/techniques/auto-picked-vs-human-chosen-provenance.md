---
layer: technique
type: technique
subject: generative-artifact-gating
technique: auto-picked-vs-human-chosen-provenance
status: forged
laws: [unmeasured-is-not-a-pass, no-gate-self-certifies]
use_when: [recording how a generated candidate was chosen, measuring how much of a line a human actually reviewed, migrating a pipeline that lacked a provenance field]
---

# Auto-picked vs human-chosen provenance

## The concern

Somebody, or something, decided which candidate advances. A pipeline that does not record
*which* cannot answer the question a producer asks most often near a milestone: how much of
this content has a human ever actually looked at? A boolean cannot answer it either,
because a boolean has nowhere to put "we do not know", and the unknown cases are precisely
the ones that matter.

## The vocabulary

Four values. Not three, not a flag.

| Value | Means | Reached by |
| --- | --- | --- |
| **none** | nothing is selected | the initial state of every slot |
| **auto** | the system chose — first candidate, highest score, a rule, a default | any non-human selection path |
| **human** | a person examined the candidates and performed an explicit act of selection | an explicit choose action |
| **unrecorded** | a selection exists but how it was made is unknown | migration from a pipeline without the field; a lost or corrupted record |

`unrecorded` is the value people try to delete, and it is the load-bearing one. It is the
difference between "nobody reviewed this" and "we cannot say whether anybody reviewed
this", and defaulting it to `auto` — or worse, to `human` — during a migration silently
manufactures a review history that never existed. An unmeasured thing gets a label, never a
plausible value.

## The rules

- **An auto-pick is never back-filled as a human choice.** Opening the step, viewing the
  candidates, scrolling past them, or accepting the surface's default focus does not
  promote provenance. Looking is not choosing.
- **Promotion happens only on an explicit act of selection**, and only in the direction
  `auto → human` or `none → human`. There is no path that turns `human` back into `auto`;
  if the system later re-picks, that is a new selection and it is `auto`.
- **Clicking the candidate the machine already picked counts as human.** It is an explicit
  confirmation of that candidate over its siblings, and refusing to record it would push
  reviewers into picking a different candidate just to make the record show a review.
- **Re-generation resets provenance to `none`.** New candidates were never reviewed. A
  provenance that survives the replacement of the thing it describes is a lie about a set
  that no longer exists.
- **The gate reads provenance but does not fail on it.** Provenance is not quality — an
  auto-picked candidate may be excellent. It is a *reporting* dimension and a *routing*
  one: it tells a producer which slots to queue for review, and it qualifies any claim of
  human sign-off. Hardening the gate to demand a human click would break every unattended
  path that has to traverse the line end to end; the goal is not to force the click, it is
  to stop the machine's pick being cited as a person's.
- **Surface it where the artifact is reviewed, not only in a report.** A visible marker on
  the step — reading *auto* until someone actually picks — is what stops the claim being
  made casually, and it costs nothing.
- **Report the four values as four numbers, never as a review percentage.** Collapsing
  `unrecorded` into either bucket to get a single figure destroys the only honest thing the
  field says.

## Where it changes a decision

Provenance is the difference between two identically green boards. A milestone where 90%
of slots are `human` and one where 90% are `auto` have the same assets and completely
different risk: in the second, no one has seen the work, and the first defect a reviewer
finds is likely to be systematic across every slot the same rule picked. Route review
capacity by provenance — `unrecorded` first, because it may hide anything, then `auto` in
the order the pipeline will spend on them next.

Under automation the rule hardens. An unattended process that selects candidates reports
what it verified and what it merely asserted as two different numbers; its selections are
`auto` without exception, and no downstream summary may present them as reviewed. A
producer's claim about its own output is an input to a verdict, never the verdict.

## When not to use it

- **Where there is no choice to make.** A step with a single output has no selection and
  therefore no provenance. Recording `auto` for it inflates the auto count with slots that
  were never choosable and corrupts the routing signal.
- **As an approval record.** Provenance says a person picked this candidate over its
  siblings. It does not say a person judged it acceptable against a standard — sign-off is
  a separate record with a separate authority, and conflating them lets a casual click
  masquerade as approval.
- **As an identity log.** *Which* person chose is a different field with different
  retention and privacy properties. This vocabulary deliberately records the *kind* of
  actor, not the actor.
