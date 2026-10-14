---
layer: application
type: application
subject: ai-assistance-detection-and-fairness
technique: brief-paste-ratio-and-bulk-paste-tells
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: not-better
---

# Reading "unreviewed bulk" from an observed event stream

The technique says the behaviour of interest is *unreviewed* bulk, not bulk. A
hiring product that watches candidates in an in-product editor was the natural
place to test whether that distinction can be computed from what the product
already records. It records a paste event with the pasted character count, and
debounced edit events per file, and nothing else.

## What the tree does

Two halves, both present.

- **Brief paste ratio.** A Python module over the captured prompt channel
  computes 5-word shingle containment of the brief in each prompt, after
  whitespace and case normalisation only. This matches the technique. Two
  differences, recorded and not changed: the result is the best single prompt,
  not the union over all prompts, so a brief pasted in three messages scores
  about a third of what the same text pasted once scores; and shingles are
  matched as substrings, not on word boundaries. The ratio only adds an
  evidence line above 0.6 and never moves a score, which is the technique's
  clause 3 held.
- **Bulk-paste tell.** A TypeScript scorer takes one boolean, "any single paste
  of at least 600 characters", and subtracts 65 points for it, stated in the
  tree as decisive on its own. From a clean 100 that is 35, below the 40-point
  suspect line, and a suspect score holds the submission from auto-advance.

## The experiment (A vs B, product code unchanged)

A is the shipped predicate. B is the technique's predicate: the same bulk paste,
but only when no later edit event on that file exists. Because the editor emits
its own debounced edit event about 600 ms after every paste, "later" had to mean
later than the paste plus 1.5 s, or every paste would count as reviewed. Both
arms were run through the real scorer on four event streams.

| Stream | A | B |
| --- | --- | --- |
| own boilerplate pasted, then reworked over two minutes | 35 suspect | 100 authentic |
| 700-character dictated chunk, then edited | 35 suspect | 100 authentic |
| 2400-character paste, shipped | 35 suspect | 35 suspect |
| 2400-character paste, one later keystroke | 35 suspect | 100 authentic |

Target: false positives on reworked pastes fall from two of two to zero. Floor:
a ghost-written paste must still be held. The floor held for the naive ghost and
failed for the one that touches the file once. **Verdict: not-better, as a
predicate over existence of an edit.** The seam was chosen because it could
refute the technique's own distinction, and what it returned is a boundary: the
distinction is right and the available instrument cannot see it. An edit event
carries no magnitude, so "worked over" and "touched once" are the same record.

## Where it stands

Recorded as a known gap, not a defect to fix in the same pass. Two things are
needed before the technique's predicate is worth shipping: an edit event that
carries the changed-character count (it is content the candidate typed into the
product, inside clause 1 of the fairness contract), and a decision on clause 3,
because a single signal currently moves a score across the hold line by itself.
The review of that clause is a policy call for the product's owner.
