---
layer: technique
type: technique
subject: subtext-and-voice-differentiation
technique: subtext-in-few-words
status: forged
laws: [a-budget-shapes-the-output]
shared_with: []
use_when: [a character states what they feel, a scene reads as explained, briefing a generator for an emotional exchange]
---

# Subtext in few words

The named concern: write lines whose meaning is larger than their words, so that the
listener completes the scene rather than receiving it. The surface of the line does one
thing — reports, asks, deflects, jokes — and the speaker is visibly doing another: hiding
fear, asking for help, refusing forgiveness, saying goodbye. The gap between the two is
where the player is engaged, and every word that closes the gap from the writer's side is a
word the player no longer has to supply.

## Subtext is a calculation, not a mood

The listener reconstructs the unsaid from three inputs: what the speaker wants, what
pressure they are under, and the line that conspicuously avoids naming either. Remove any
input and the calculation fails. With no known want, an oblique line is merely odd. With no
known pressure, it is merely polite. With a line that names the want, there is nothing to
calculate. So subtext is planned upstream of the line: the scene, or a scene before it, has
to plant the want and the pressure in plain view, and the line is then free to step around
them.

This is why the naive cure for on-the-nose writing — make it vaguer — fails. Vagueness
removes the third input's precision without supplying the first two, and the result is a
line the listener cannot complete. A subtextual line is usually more concrete than an
on-the-nose one, not less: it names an object, a task, a detail, and the meaning rides the
choice of that detail. A mother who cannot say she is afraid for her son checks his helmet
strap twice and tells him it is loose.

## The procedure

1. **Write the line underneath first.** For each beat, state in plain words what the
   speaker means and wants — "I think you will die out there and I can't stop you". This is
   a working note, never dialogue.
2. **Find the displacement.** Choose what the speaker talks about instead: a practical task,
   an object in reach, a third person, a question they already know the answer to, a joke,
   a change of subject. Choose it from the speaker's own world, because the displacement is
   also a voice marker.
3. **Write the surface line and cut.** Draft the displaced line, then remove every word
   that would let the listener stop calculating — the explanatory clause, the "because",
   the adverb of feeling, the follow-up that restates.
4. **Check the plant.** Confirm the want and the pressure were visible before this line,
   in an earlier line, an earlier scene or the situation itself. If they were not, the fix
   is upstream, not here.
5. **Read the pair.** Read the underneath and the surface side by side. If they say the
   same thing, the line has no subtext; if no reader could get from the surface to the
   underneath, it has no plant.

## The most common waste: saying it twice

The commonest on-the-nose line is not a confession; it is a doubled line, which says a thing
once as information and again as reaction — "we have to leave now; there's no more time".
The second half is the speaker's feeling about the first, stated, and it is the part that
goes. A useful edit pass reads each line asking which clause is the speaker commenting on
the other, and cuts that clause.

## In an interactive scene, the menu is part of the line

Where the player chooses replies, subtext is carried by structure as well as by words: which
replies are offered at all, which are missing, which loop back to the same question, which let
an impatient player skip ahead. A menu that offers no way to ask the obvious question says
that the player character would never ask it. A character who answers three different
approaches with the same deflection has said, without any line saying it, that the topic is
closed. Design the option set with the same underneath note as the lines, because a menu that
offers "Tell me how you feel" has written the on-the-nose line on the player's behalf.

## Few words is a budget, and the budget is the instruction

Short lines force subtext because they leave no room to explain. That makes the length
budget a craft tool rather than a layout constraint: a stated word ceiling per line tells a
writer, and especially a generator, what kind of line is wanted. A generator given generous
room spends it on explanation, because explanation is its most probable continuation; give
it a tight per-line budget and the explanation is the first thing that cannot fit. This is
[a budget shapes the output, it does not only cap it](../../../../_laws.md#a-budget-shapes-the-output)
at line scale, and it means the budget belongs in the brief rather than in an after-the-fact
trim, because a trimmed long line keeps its on-the-nose clause and loses its texture.

Silence is the limit case and is a legitimate line. A character who does not answer, in a
medium that can show them not answering, has said the most compressed thing available. Use
it where the unsaid is unmistakable, and never where the player cannot tell a silence from a
missing line.

## Decision rules

- **When a line contains the name of an emotion the speaker feels, rewrite it** unless the
  speaker's voice is defined by naming feelings — and then it is a voice choice, used
  sparingly, not a default.
- **When a line answers the question it was asked fully and directly, check whether the
  speaker had any reason not to.** If they did, the full answer is a missed beat.
- **When a reader cannot say what the speaker meant, add a plant upstream** rather than
  words to the line.
- **When a scene's climactic line is the longest line in it, suspect it.** The peak usually
  wants the fewest words.
- **When briefing a generator, give the underneath, the displacement and a word budget**,
  and forbid naming the feeling. Asking for "subtext" by name produces lines that announce
  their depth.

## When not to use this

Instructions the player must act on — where to go, what a control does, what a choice
costs — are not the place for subtext; an oblique objective is a usability defect, not
craft. Characters whose defining trait is bluntness should be on the nose most of the time,
and their rare evasion then becomes the loudest line in the game. And a story told to young
children may need the underneath said once, plainly, after the subtextual beat has had its
moment.

## Evidence status

The principle that dialogue carries an unspoken layer, and that stating it outright deflates
the scene, is long-standing dramatic and screenwriting doctrine from primary practitioner
sources and teaching texts, and a study of professional editors revising model prose found
unnecessary exposition among the faults common to every model tested. The rule that a
short line's subtext rides on one concrete detail is practitioner consensus, rated medium
by the research it was reconciled against. The claim that a menu's structure carries
subtext comes from a games writer's conference talk known only through a listener's notes,
which is a secondary source. The claim that a tight per-line budget pushes a generator away
from explanation rests on general observation of language-model behaviour and on the
bundle's budget law, not on a controlled measurement in this domain. Nothing here has been
tested on players in a shipped or played game; it is authored craft, not observed result.
