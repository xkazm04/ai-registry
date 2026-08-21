---
layer: technique
type: technique
subject: requisition-lifecycle-governance
technique: publish-means-two-different-things
status: forged
laws: [every-decision-names-its-actor, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [designing the control that opens a role, a publish action does something the user did not expect, deciding what pushing a role to external boards requires]
---

# "Publish" means two different things

In every hiring organisation the word *publish* carries two operations that
share nothing but the word:

- **Make visible.** Move the role out of draft so that the recruiting team,
  the hiring manager's colleagues and internal applicants can see and work it.
- **Distribute.** Push the advertisement outward — to job boards, aggregators,
  syndication feeds, an external careers surface, a partner network.

They are not two intensities of one act. They differ on every axis that matters
to the person pressing the button:

| | Make visible | Distribute |
|---|---|---|
| Audience | inside the organisation | the open market |
| Cost | none | often per-post, per-board |
| Reversible | immediately and completely | withdrawn from your systems, cached and re-scraped elsewhere |
| Commits you publicly | no | yes — the stated range, the location, the requirements |
| Right approver | the role's owner | whoever owns spend and external voice |

A single control that performs both will perform the wrong one for roughly half
of the people who press it, and both halves of the error are costly. Someone
who wanted the team to review a draft has bought external advertising for an
unfinished role — with an unpolished description, possibly a wrong band, now
mirrored on sites that will not remove it on request. Someone who believed they
had advertised the role waits weeks for external applicants who were never
shown it, and concludes the market is dead.

The word itself is the trap. *Publish* is a label doing work that only a
specification can do —
[meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label).

## The procedure

1. **Name each action by its effect on the outside world, not by its position
   in a workflow.** "Open the role" and "advertise externally" are legible;
   "publish" and "publish everywhere" are not, and neither are "step 2" and
   "step 3".
2. **Order them.** Distribution is the second step and presupposes the first: a
   role that is not open internally must not be advertised externally, because
   the applications it generates have nowhere legitimate to land.
3. **Gate them differently.** Internal visibility carries the lifecycle
   preconditions — approval, brief substance. Distribution adds the ones that
   only matter once strangers read it: the advertisement's language and its
   minimum substance (a sibling owns the lint), the honesty of the stated
   range, jurisdictional disclosure obligations (another sibling owns those).
4. **Make each destination its own recorded act.** Distribution is rarely one
   thing; it is a set of channels with different costs and different removal
   latencies. Record which channels a role went to and when, because taking it
   down later requires exactly that list, and so does explaining where a
   candidate saw it.
5. **Attribute both.** Who opened it and who advertised it are different
   questions with potentially different answers —
   [every decision names its actor](../../_laws.md#every-decision-names-its-actor).

## Decision rules

- **When a control performs an irreversible external act, it must say so at the
  moment of pressing**, in terms of consequence rather than of mechanism: what
  goes where, what it costs, what withdrawing it will and will not undo.
- **When a role is edited after distribution, treat propagation as explicit.**
  Edits do not silently reach every board, and a system that pretends they do
  is worse than one that admits they do not — the stale external copy is the
  version most candidates will read.
- **When a role closes, withdrawal is part of closing**, and it is best-effort
  by nature: your own surfaces come down immediately, third-party mirrors come
  down eventually or never. Say which is which rather than implying the
  advertisement is gone.
- **When internal and external audiences need different text**, that is a
  rendering question, not a second requisition. One record, two renderings; a
  second requisition splits the pipeline and the metrics.
- **When only one of the two operations is implemented, name it for what it
  does.** A control labelled *publish* that only makes a role internally
  visible teaches every user a wrong model, and they will act on that model the
  day external distribution ships. If the second operation is planned but not
  built, show it as explicitly unavailable rather than letting the first
  quietly absorb its meaning.
- **When disambiguating an existing system, rename the labels and leave the
  internal contract alone.** The stored value, the endpoint name and whatever
  automation keys off them are a contract with the matching engine, the test
  harness and every integration; renaming them to match the new vocabulary is a
  migration with no user-visible benefit, and it is how a clarification turns
  into an outage. Write down the translation instead — *this stored value means
  internally live, never externally advertised* — next to the definition of the
  value itself, because the next reader will otherwise re-derive the wrong
  meaning from the name.
- **Never let distribution imply approval.** Advertising a role is downstream of
  the go-live gate, never a way around it.

## When not to use this

- **Where there is genuinely one audience** — an internal-mobility-only
  programme, or a fully public-by-default organisation with no internal stage —
  the split is ceremony. Keep the vocabulary honest anyway: call the single act
  what it does.
- **Where external posting is handled entirely by another team or system**,
  this subject's job ends at recording that the role is eligible for
  distribution and which channels were used. Do not model a channel you do not
  control as if you could revoke it.
- **As a general workflow pattern.** The lesson generalises — a verb that
  covers two acts with different reversibility should be split — but the
  specific gating here is about the moment a hiring decision becomes public,
  and does not transplant to other approval flows unchanged.
