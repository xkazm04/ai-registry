---
layer: technique
type: technique
subject: measurement-honesty
technique: instrument-exposure-control
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [a score is used to claim a capability, a measure has been published long enough to be optimised against, a number improved and the instrument did not change, deciding whether two readings taken years apart are comparable]
---

# Instrument exposure control

Every other technique in this subject checks a number against the system that
produced it. This one checks the number against the *history between the
instrument and its subject*, and that history is the one thing which cannot be
read from inside the number. A datum in state 7 — **compromised** — is
arithmetically perfect and substantively empty: the subject had seen the
instrument before it was measured, so the score reports recall of the
instrument rather than the capability it names.

The failure is not fraud and usually has no author. A measure gets published
so that people can act on it; publishing it puts it into the material its
future subjects learn from; and the more useful it is, the more thoroughly
that happens. **Exposure is the ordinary consequence of a measure being worth
using**, which is why the most cited, most carefully curated instrument in a
field is the one most likely to be compromised — the exact inversion of the
usual prior.

## The deprived-input control

The cheapest probe, and the one to run first: **re-run the instrument with the
input the task supposedly requires removed.** If the task is "locate the defect
given the report and the codebase", run it given the report alone. If it is
"answer from the retrieved document", run it with no document.

Whatever score survives that ablation is the **floor of what the instrument is
measuring by some other route**, and that route is not the capability named on
the label. A deprived score near chance is the result you want. A deprived
score that stays high has told you the ceiling is uninterpretable without
further work — one such probe recovered a majority of the full-input score
with no access to the artifact the task was about.

This is a negative control and it carries a negative control's authority: it
is cheap, it needs no ground truth about what the subject was exposed to, and
its failure mode is a *false sense of safety* rather than a false alarm. A
clean deprived-input result does not prove the instrument is uncompromised,
only that this particular shortcut is absent.

## Read the gap between paired populations, never the level

When there is no way to audit what the subject was exposed to — the normal
case — build a **twin population the subject cannot have been exposed to**,
match it on the difficulty proxies you can observe, and score both.

The reading is the **disparity, not either level**. A subject with the
capability performs comparably across comparable tasks; a subject recalling
the instrument peaks sharply on the circulated one and falls to the twin's
level everywhere else. The level alone cannot distinguish a capable subject
from an exposed one, and no amount of precision on the level fixes that.

Three obligations make the pairing honest, and skipping any one of them turns
the technique into a way of manufacturing whichever conclusion you wanted:

- **Publish the difficulty proxies you matched on** — size, length, age,
  whatever you had. A twin matched on nothing is not a twin.
- **Publish the confound you could not remove.** There is always at least one,
  and stating it is what separates a paired reading from a rhetorical one. A
  comparison whose two populations differ by an order of magnitude in input
  length has a stated weakness; the same comparison with the weakness unstated
  is an unfalsifiable claim.
- **Hold the harness fixed and vary only exposure.** If the twin is scored by
  a different procedure, the gap measures the procedure.

The strongest form of the pairing draws the twin from **the same sources at a
later date** rather than from different sources entirely. When freshly drawn
material from the identical origins scores at the level of wholly unrelated
material, while the long-published subset scores far above both, the
difference cannot be attributed to the origins — the only variable left is how
long the material has been available to be learned.

## Same harness, later reading, different instrument

The consequence for any before/after comparison: **two readings are comparable
only if the subject's exposure to the instrument was constant between them.**
Where the subject can learn the instrument, re-running the identical harness
does not give you the identical instrument. It gives you a later, more-exposed
one, and the difference renders as improvement.

This is the condition to check before pairing any two measurements separated
by enough time for the measure to have circulated, and it is invisible to
every other check in this subject, because the harness genuinely did not
change.

## One-directional drift indicts the instrument

[noise-band-and-hysteresis](./noise-band-and-hysteresis.md) characterises a
band from the movement of repeated measurements over an unchanged subject, and
treats a reading outside that band as real. That rule assumes the band's
movement is **symmetric jitter**. Exposure drift is not: it is monotone,
direction-consistent, and grows with each successive generation of subject.

So the band's verdict inverts here. A symmetric band classifies a monotone
climb as a genuine out-of-band improvement and announces it; hysteresis, whose
job is to resist leaving a classification, then holds the inflated reading in
place. **Movement outside the band in the direction the instrument decays
toward is evidence about the instrument, not about the subject**, and should
be read that way until a twin population says otherwise. The discriminator is
direction and monotonicity, not magnitude: jitter changes sign, decay does
not.

## Measure how often the input contains its own answer

Where the inputs are documents rather than tasks, exposure has a local form
worth counting directly: **the fraction of inputs that state their own
answer.** A defect report that names the file to change, a question whose
phrasing contains the retrieved passage, a case whose metadata encodes the
label.

Publish that rate, and publish a **second score computed only over the
uncontaminated remainder**. Both numbers, always — the pair is the finding, in
the same way state 6's pair is. A headline whose validity rests on the leaky
fraction is not a measurement, and a filtered score published alone invites
the opposite error, since the filter is itself a choice that needs its
predicate stated.

This is arithmetically identical to
[renormalize-over-present](./renormalize-over-present.md) and triggered by its
opposite. There, part of what you meant to measure is *absent*, and you divide
by the weight actually observed. Here nothing is absent — every input returned
data, and a fraction of it is **present and unusable**. The corrective move is
the same; the precondition is inverted, which is why the present-weight
technique never fires on this defect.

## What this technique cannot do

It cannot certify an instrument as uncompromised. Every probe here is one-way:
a positive result convicts, a negative result says only that this particular
shortcut was not the one in use. There is no self-check, and a system
reporting on its own validity is reporting on the one question it structurally
cannot answer — so the honest render for an instrument with no twin available
is **unmeasurable with a named mechanism**, not a clean bill.

It cannot tell you *which* member of a paired disparity is wrong, only that
the pair cannot both be right. That is state 6's shape, one level out.

And it prices nothing. Building a twin population is real work, and for a
measure nobody optimises against it is work with no return. The trigger is not
"a number exists"; it is **a number that something has had a reason to
optimise toward**, which is why publication, citation and age are the signals
that should schedule this check rather than suspicion.
