---
layer: technique
type: technique
subject: catalog-pipeline-authoring
technique: direction-as-first-class-produce-input
status: forged
laws: [a-verdict-is-bound-to-its-content, unmeasured-is-not-a-pass, no-gate-self-certifies]
shared_with: []
use_when: [an operator types a steer into a generation box, making a regeneration reproducible, a produced artifact whose provenance stops at who clicked the button]
---

# Direction as a first-class produce input

The operator types what they want — colder palette, emphasise the ambush read, keep
the brief economy-facing — and clicks produce. In most systems that text is handed to
a prompt builder, shown in a disclosure, and then dropped. The artifact that comes back
records nothing about what was asked for.

Make the steer a real input: **passed to the author, stamped onto the artifact,
persisted with it, shown verbatim, and reused on regeneration.** The change is small in
code and large in what the system can afterwards say about itself.

## What the stamp contains

Two values under one namespaced key, so it can never collide with a step's own fields:

- **the steer verbatim** — exactly what the operator typed, including empty;
- **the composed instruction** — what the step's prompt builder made of it, or empty
  when the production was deterministic and no instruction drove it.

An empty composed instruction is a fact, not a gap: it honestly marks a production that
no authored prompt drove. Never synthesise a plausible instruction to fill the field —
a fabricated prompt in a provenance record is worse than an acknowledged absence,
because everything downstream will treat it as evidence.

## Procedure

1. **Give the producer an optional steer parameter.** Optional on both sides: a
   producer body may ignore it, and a caller with no steer — an offline linter, a
   headless recipe, demo seeding — calls it exactly as before. Optionality is what lets
   the plumbing land in one change instead of a rewrite of every producer.
2. **Stamp at the dispatch boundary, not inside producer bodies.** Wrap the producer's
   output once, at every dispatch site, so the stamp appears whether or not the body
   read the steer. Hand-rolled per-step direction fields defeat the whole point; there
   must be one key with one writer.
3. **Enumerate the dispatch sites and cover all of them.** Interactive surface,
   automated authoring route, headless batch. A stamp present on some paths is not a
   stamp — anything downstream must special-case its absence, and will eventually read
   absence as "no steer given".
4. **Show it verbatim** on the artifact's raw disclosure and on the persisted record.
   Verbatim, not summarised: the value of the stamp is that it is the operator's own
   words, which is precisely what a summary destroys.
5. **Reuse it on regeneration.** A retry with the same instruction must be expressible
   as such. Where a step fails and offers a one-click corrective run, the instruction
   that run dispatches is the next rung of the same ladder — see below.
6. **Preserve it through rewrites.** Any path that rewrites an artifact's data — a
   re-selection, a partial patch — must carry the stamp forward. Stripping it on rewrite
   is the most common way a fully-covered stamp develops holes.

## Making the mode legible at the point of produce

When a steer can drive either a cheap deterministic production or a real model call
that spends budget, the operator must be able to see which, **at the button**, not in a
settings panel. Render the mode next to the dispatch control and let the control itself
say when a click will spend. Two details matter:

- **Re-read the mode at click time**, not at render time, so a control can never act on
  a stale copy of a setting changed elsewhere on the surface.
- **Default to the cheap path.** An automated coverage walk must stay synchronous and
  offline; a live default silently makes every walk a spend and every failure a
  question about a remote service rather than about the system.

When a live production fails, surface the failure reason inline and offer a retry
*with the same instruction*. That is the payoff of the stamp being real: a retry that
cannot reproduce the request is not a retry.

## The corrective-instruction ladder

A failing step should offer a one-click corrective production, and what it dispatches
must never be empty. Build it as a ladder, most specific first:

1. a standing house instruction authored on the step, if one exists;
2. otherwise an instruction **derived** from the failure — composed from the step's own
   label, its kind's corrective sentence, the criterion that failed, and the checker's
   own reason.

The derived rung must always be non-empty, because the first rung is usually absent.
A corrective button that dispatches an empty steer is a production run with no
instruction at all — strictly worse than not offering the button.

The constraint on the derived rung is that it **invents no target value the checker did
not state.** It may name the criterion, the status and the reason; it may say "move the
metric this criterion names back inside its stated band"; it may not say what the band
is unless the checker said so. Composing corrective language per *kind* rather than per
step is what makes this possible: the kind is the largest unit that can carry a
specific instruction without inventing content, and a handful of authored blocks then
covers hundreds of steps. Hand-writing one per step would mean inventing target values
nothing declared.

## Decision rules

- **Read the steer where the step can honestly be steered; ignore it where it cannot.**
  A step producing a computed budget has nothing to steer. Ignoring it there is correct;
  the stamp still applies, so the record is uniform.
- **Stamp regardless of whether the body reads it.** Uniform provenance is the property
  being bought.
- **Empty is a value.** An empty steer means the operator dispatched the default, which
  is different from a steer that was given and dropped. Both must be distinguishable
  from a record that predates the stamp entirely.
- **The stamp is authoring provenance, not a verdict.** What was asked for says nothing
  about whether what came back is good; a self-reported instruction is an input to a
  judgment, never the judgment. Binding a verdict to the content it judged, detecting
  drift when the content later changes, and keeping revision history are the adjacent
  concern — the seam is that this technique owns the capture at authoring time.

## When not to use this

Where production is fully deterministic across the whole system and no steer is ever
offered, the stamp is ceremony. The moment one step accepts a steer, though, stamp
every step — a partial stamp is the failure mode, not a partial adoption.
