---
layer: technique
type: technique
subject: grounded-marketing-generation
technique: publishable-as-is-quality-gate
status: forged
laws: [a-gate-before-money-and-copy, never-invent-proof]
shared_with: []
use_when: [defining what a generated ad set or page or reply must satisfy before it ships, building the exit gate of a content command, deciding whether a self-scored quality number may decide publication]
---

# The publishable-as-is quality gate

The bar for generated marketing output is a single question: could the person who
asked for it upload it unchanged? Not "is it good", not "is it a nine", not "does it
read well" - would a senior practitioner on a good day have to touch it. The gate is
the list of things that would make them touch it, checked before anything is
registered, scheduled or handed to a publish step, and it is loop-shaped: the gate
decides when the work is done, the author fixes and re-runs until it passes, and a
failing output is never presented with an explanation attached.

## What the gate checks, by format

- **Ad copy.** Every asset within the platform's character limit (the platform
  rejects over-limit assets at upload); headlines covering several genuinely distinct
  angles (benefit, audience, call to action, trust, range) with no near-duplicates; at
  least one direct call to action; the brand in at least one headline when the brand
  was supplied; no unbacked superlative, discount or number; keywords that are not
  generic "{product} buy" filler.
- **A page.** Every placeholder frame resolved with a real image or removed; every
  template string gone; every internal link resolving; the page returning success;
  several proof touches, each traceable to what the owner supplied, counted before
  registering; the primary keyword not already taken by another page; layout that is
  not a wall (a maximum run of text-only blocks, a maximum paragraph length, something
  to look at within a bounded word count).
- **A customer reply.** The answer in the first sentence; no promise not in the
  sources; an empty risk list, or the reply waits for a person.
- **Everything.** The output is in the project's language; nothing the business did
  not supply appears as a claim.

## The three properties of a good gate

1. **Deterministic where it can be.** A checker that fails on a zeroed-out price, a
   placeholder phone pattern, an example e-mail domain, "lorem", "TODO", "Your City",
   a surviving frame label or a dead link catches the class of fabrication that is
   really a template leak, without a model and without judgement. Shape-based patterns
   ("catch the placeholder nobody listed") sit beside the literal list. A checker that
   fails a section for apologising that it has no proof ("no results here yet") pushes
   the author to show the best true material instead.
2. **Loop-shaped.** Run, fix every failure, run again, until pass. The only reasons to
   stop early are a value only the owner has, or a decision that is the owner's. A
   count of body sentences altered by a mechanical fix pass is reported after the pass,
   and zero is the expected answer.
3. **Honest about self-scoring.** A rule that says "nothing publishes below nine out of
   ten, rate it honestly, never inflate" and asks the same model that wrote the copy to
   award the score is the weakest gate this subject recognises. It has no line for
   fabrication, it is not invoked by anything, and the author grades itself. Keep it as
   a structured self-review whose *reasons* are read; never let the number decide
   publication, and never let it stand in for a checker or a human eye. A gate that
   exists only as a sentence in a rules file and is invoked by no command is not a gate.

## Decision rules

- When a check can be expressed as a pattern over the rendered page, it belongs in a
  checker, not in the prompt; the prompt still says it, because a rule the model knows
  saves a loop iteration.
- When an output fails the gate for a reason only the owner can resolve (no proof yet,
  no webhook), stop and ask; do not pass the gate by weakening the check and do not
  ship the failing state with a note.
- When a page ships before proof arrived, it carries a top-of-page marker the checker
  can see, and the publish step refuses it until the marker is gone.
- When the output is scheduled or handed to a channel, only the channel's confirmation
  may mark it published; a local claim of "published" without a channel link downgrades
  to "done", and a failed send returns to "scheduled"
  ([a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy)).
- When the gate passes, look anyway: screenshot at desktop and phone widths and read
  both. The gate is the floor; eyes are the bar.
- When a rejection comes back from a person - off brand, inaccurate, too long, wrong
  tone, risky claim - it is a typed reason that becomes an "avoid" constraint in the
  next prompt, and an edit that rewrote a quarter of the words or more becomes a style
  fact; the gate learns from what it let through.

## What is convention here

The angle-count minimum, the proof-touch minimum, the text-run and paragraph-length
caps, and the "nine out of ten" threshold are all practitioner convention; none is a
documented platform behaviour. The character limits are the platform's documented
contract and the one item on this list that is not negotiable.

## When not to use this

Do not run the publishable gate on an *intermediate* artefact - a brief, an outline, a
cluster map, a list of arm concepts - whose purpose is to be edited; those have their
own structural validators and the gate here would reject them for lacking what they
were never meant to carry. Do not use the gate as the repair mechanism: how a violation
is fixed is the clamp-versus-re-prompt decision, and the gate runs on the result. Do
not let the gate rewrite copy a person approved; an audit or fix pass changes the
mechanical layer only and routes content changes back to the drafting step where the
owner approves the draft.
