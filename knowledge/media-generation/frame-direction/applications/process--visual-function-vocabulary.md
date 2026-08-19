---
layer: application
type: application
subject: frame-direction
technique: visual-function-vocabulary
stack: process
status: forged
---

# Process: the direction prompts of a script→frames pipeline

How one production pipeline (repo `gravitone-gcloud`) realizes the function
vocabulary as a pair of prompt/design documents: `pipeline/DIRECTOR-DIMENSION.md`
(the vocabulary and the script-side contract) and `pipeline/FRAMES-SCENE-PROMPT.md`
(the frame-authoring brief handed to the directing model).

## The vocabulary, with its admission test

`DIRECTOR-DIMENSION.md:131-145` defines the seven functions — evidence,
comparison, mechanism, metaphor, reveal, state-change, texture — as a table
whose middle column is "the picture's job" and whose third column is
"removing it costs", i.e. every function is justified by the downstream
obligation it creates. The admission test is stated verbatim at :133-135:
*"does labelling a beat with this change what Step 2 must produce? A category
that does not change the downstream obligation is description, not design,
and has been cut."*

The doc also shows the test rejecting a candidate (:157-162): "absence" is
refused as a top-level function and kept as an `negates: true` modifier on
`evidence`, because absence is a rhetorical property, not a production
obligation. The one-function rule (:164-173) and texture's mandatory
sub-roles with the atmosphere budget (:174-190) follow, including the named
anti-shape: a generator that defaults unpicturable beats to
`texture/atmosphere` "produces a stock-footage video, and it will do so
silently."

## Derived mode from the function mix

`DIRECTOR-DIMENSION.md:231-269` computes image-led vs narration-led rather
than letting the writer set it: `load_bearing / total ≥ ~0.6 → image-led`,
with texture the only non-load-bearing function. The threshold is explicitly
marked **ASSUMED** and calibratable — an honest label the vocabulary makes
possible, since the ratio only exists because functions are machine-readable.
The per-beat `led:` override is defined as a *writing* instruction ("write
fewer words here and let the picture land"), not a mode change.

## The brief that consumes the vocabulary

`FRAMES-SCENE-PROMPT.md:8-31` is the downstream half: the directing model is
told "You are not illustrating sentences. You are deciding what a viewer
should be looking at while a sentence is spoken," and both attractor failures
are named — the template-per-rhetorical-role slide deck (with its
swappability tell) and literal noun illustration ("measured leaking text on 6
of 6 styles. Nouns are text magnets. Shapes are not."). The earning test
closes the brief: "If your subject would work equally well under a different
beat, it is wrong."

## The contract boundary

`DIRECTOR-DIMENSION.md:559-598` states the frames↔script contract the
vocabulary enables: Frames receives `function`, `subject`, `shows[]`,
`thread`+op, modifiers, `confidence`/`precision_note` per beat; decides still
counts, composition, style, model freely; and **may not** change a function
unilaterally, exceed a precision limit, silently downgrade an unresolved beat
to texture, break a thread, or add a metaphor the script did not spend
(:570-582) — the last because the analogy cap counts metaphor *visuals* and
"Frames cannot enforce a budget it cannot see" (:224-227). Frames owes back
resolutions/escalations for every unresolved beat and the actual still count
(:584-590), which is what makes it a contract rather than a handoff.

## Lessons this realization surfaced

Worked over a real 34-beat render (:283-299), the vocabulary fired in ways a
design-only doc would not predict: the one-function rule split the cut's most
important beat (b4 → b4a/b4b) and revealed that the strongest image in the
video is a *continuation* of an established picture, not a new one; and beat
b15's metaphor-shaped closing line was deliberately declined because the
analogy budget was spent — "Declining it is the discipline."
