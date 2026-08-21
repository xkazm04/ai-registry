---
layer: technique
type: technique
subject: generative-artifact-gating
technique: cite-evidence-not-descriptions
status: forged
laws: [a-verdict-is-bound-to-its-content, one-authority-per-quantity]
use_when: [writing the corrective message a rejected step hands back, a fix prompt is inventing target values, feeding a rejection back into a generator]
---

# Cite evidence, not descriptions

## The concern

When a gate rejects, something has to say what to fix, and that something is usually a
sentence. The sentence is a paraphrase: a human or a critic looked at an artifact and
described what was wrong. Hand that paraphrase to a generator and it optimises against the
paraphrase — against a description of the defect, not the defect. Worse, paraphrases leak
target values. "Make the accent warmer" becomes a specific hue nobody decided, and the
correction becomes the source of a design decision that should have come from the rubric
or the author.

Two disciplines fix this: cite real evidence, and speak in terms of the deliverable class
without inventing the target.

## Rule one: only real served evidence may be cited

A citation in a corrective message names a **location that actually exists and can be
fetched and looked at** — the artifact under judgment, or a reference artifact genuinely
present in the system. Never a description standing in for one; never a token, swatch or
sample synthesised for the purpose of having something to point at.

The synthesised-sample failure is the common one, because it feels helpful: the correction
generates a small illustrative artifact showing the intended result and cites that. Now the
generator is matching an artifact that was itself produced by the process being corrected,
with none of the constraints of the real pipeline. A swatch is not evidence. The check is
mechanical — **every citation resolves to a fetchable location, or it is not emitted** —
and it belongs in the code that assembles the message, not in the reviewer's discipline.

Cite only the **selected** artifact, not the whole candidate set. The point of the citation
is what the reviewer was looking at when they rejected it; the other candidates are
alternatives they already declined, and including them dilutes the instruction.

Where the evidence genuinely does not exist, emit **no evidence section at all** — not an
empty one. A heading that says "current output" followed by nothing reads to the recipient
as "there is no output", when the truth is "nothing real was produced to point at", and
those route to opposite actions. A correction that invents a citation to avoid an empty
field is worse still: a fabrication with a location attached.

## Rule two: name the axis, not the value

Corrective language is written **per class of deliverable**, and it states what "fix this"
concretely means for that class without asserting the number to hit:

- Name the axis that failed — the dimension, the register, the property.
- Name the evidence — the cited location where the failure is visible.
- Name the class-appropriate remedy in kind — regenerate the source, re-shoot the framing,
  re-tune the parameter — without prescribing the setting.
- Leave the target to whoever owns it: the rubric, the canon, or the author.

This is why the copy is per-kind rather than generic. A generic "this does not meet the
bar" is unactionable; a specific "the value is wrong, use 0.4" is an unauthorised decision.
The correct middle is a sentence that tells the recipient exactly which property to work on
and where to look, and stops.

**Author the language at the largest unit that can be specific without inventing content** —
the deliverable class, not the individual step. The class *is* the contract: one class owes
a number inside a stated band, another owes a selected candidate, another owes a graph
whose every path terminates. Each of those supports a real, concrete instruction that names
no target value. Per-step language cannot: a shop with hundreds of steps that tries to
hand-author one message each will invent hundreds of targets no checker ever stated. In one
line, **nine authored class blocks covered roughly three hundred and forty steps**, and
every clause was composed from the step's own label, its class, the criterion the checker
named, and the checker's own stated reason. Allow a per-step override for the handful that
genuinely need one; make the class block the default that always exists.

The corollary is about defaults, and it is the failure this replaced. When the corrective
direction is an optional field an author may fill in, count how many authors filled it in:
in that line the answer was **zero of three hundred and forty-four**, and the fix action
was dispatching an *empty* instruction — a regeneration run with nothing asked of it.
**Guarantee the message is non-empty by construction**, deriving it when nothing was
authored, and never let an unauthored optional field degrade into silence.

One exception belongs in the rule: **a correctly deferred step gets no fix instruction.**
A deferral awaiting a generator run or a perceptual gate is not locally fixable, and
offering a fix action there sends someone to edit an artifact that is not the problem.
Explain the deferral; offer no button.

## Assembling a corrective message

1. Resolve the artifact that was judged and confirm it is fetchable. If not, the correction
   is a precondition failure, not a fix instruction.
2. Attach the verdict's rung and reason, bound to the fingerprint of what was judged, so a
   recipient can tell whether the correction still describes the current artifact.
3. Select the per-class corrective language for the deliverable kind.
4. Insert only citations that resolved in step one.
5. Emit no numeric target that did not come from a declared authority — the rubric, the
   budget, or the canon. If the message wants a number and cannot name its source, drop the
   number.

## When not to use it

- **Human-to-human review notes.** A lead telling an artist "the silhouette reads mushy" is
  fine; the recipient has judgment and context. The discipline is for messages that will be
  consumed by a generator, or by someone who cannot see the original.
- **Where the target genuinely is the correction.** When a declared authority owns the
  value — a budget, a canon entry, a rubric threshold — cite that authority and state the
  number. The rule forbids inventing values, not carrying authorised ones.
- **As a substitute for a verdict.** A well-cited corrective message still needs the
  verdict that produced it: what rung, what fingerprint, what standard. Instructions
  without a verdict are advice.
