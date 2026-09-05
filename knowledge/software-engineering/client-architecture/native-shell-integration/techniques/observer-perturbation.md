---
layer: technique
type: technique
subject: native-shell-integration
technique: observer-perturbation
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [a structural query over another application returns only a root element with nothing inside it, reading a foreign application works for some targets and returns an empty tree for a whole class of them, deciding whether the product's own surface is causing the defect it is trying to observe, an instrument shares screen space or a lock or a device with the thing it measures, a fullscreen surface changes the behaviour of the applications underneath it]
---

# Observer perturbation

An instrument that reads another application from the outside is **inside the
scene it measures**. Its surface is a real surface: it takes screen space, it is
composited, it is opaque or it is not, and the applications underneath are
entitled to notice and to react. Most of them do not react and the instrument's
presence is genuinely free. The ones that do react are, reliably, the ones the
product cannot get an answer out of — and the reaction happens in the target,
in code the product does not run, so it is invisible from the query site. The
symptom arrives as "the query is broken for these applications", which sends
people to debug the query.

This is a different failure from the query returning the product's own surface,
and the fix for that one does not touch this one. Excluding a surface from the
accessibility tree removes it from the **tree**; it does not remove it from the
**compositor**, and a target that reacts to being covered is reading the
compositor.

## The mechanism: applications optimize for not being seen

Modern applications spend real effort avoiding work nobody will see. A
browser-engine application — a document renderer wrapped in a native window —
watches whether anything opaque fully covers it, and on concluding it is
occluded it hibernates its renderer. The part that breaks a reader is not the
hibernation but what hibernation does to *structure*: the application's
accessibility provider is **reparented out of the window subtree the query
walks**, and what remains in that subtree is an inert composited placeholder.

So the query succeeds. It returns a root element, with nothing under it, and no
error, because from the host's point of view nothing failed — the product asked
what was inside a window and the honest answer, right now, is nothing
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)). The
product is reading a stand-in for the target rather than the target, which is
the exact condition under which a check over a proxy passes and means nothing
([gate-sees-target](../../../_laws.md#gate-sees-target)).

## The signature, and its four impostors

A root element with no children is the signature, and four unrelated causes
produce a result that looks identical at the call site. Separating them is the
first debugging step, not the last:

- The target genuinely exposes no structure — some owner-drawn applications
  expose one node and mean it.
- A grant the query depends on has not been given, and the host reports the
  refusal as an empty result rather than as an error.
- The target has not finished starting, and its provider is not attached yet.
- The target has hibernated **because the product covered it**.

Only the fourth is this technique's, and only the fourth changes when the
product changes. That is the discriminator, and it is why the experiment below
is worth building rather than reasoning about.

## The self-exclusion experiment

The general question is *does my own apparatus cause this?*, and it cannot be
answered by reading code, because both the cause and the effect live in another
process. It can only be answered by removing the apparatus's contact with the
subject **while holding the code path exactly fixed**.

The rig that does this for a screen-covering instrument: run the surface over a
*fraction* of the screen — a quarter is convenient — and apply a fixed transform
to the incoming pointer coordinates, doubling them, so the query is still issued
across the full coordinate space while the region it reads is never covered.
Same surface, same query, same interface, same coordinates on the wire; the only
thing that changed is whether the apparatus is touching the subject. If the
answers become correct, the surface was the cause, and the finding is not
arguable.

The property that makes the rig honest is the fixed code path. A rig that also
switches to a different query interface, a smaller target, or a debug build
answers a different question and will convince the room of something false.
State what varied and what did not, in one line, beside the rig.

Generalize past screens: this applies wherever the apparatus and the subject
share a resource — screen area, a lock, a device, a port, a graphics queue, a
CPU budget. Whenever a measurement is only wrong when the instrument is present,
build the variant of this rig that removes contact and preserves the path.

## Fix the perturbation, not the reaction

Once the cause is established there are two directions to fix it in, and only
one of them terminates.

**Rejected: defeat the detector.** Present the surface as not-quite-opaque — a
composition mode one step below full opacity — so the target's occlusion check
declines to fire. It works, immediately and convincingly, for the class of
target it was tested against. It is a fix aimed at one implementation of one
occlusion check: an owner-drawn native application deciding the same thing on
different evidence is unaffected, and the product now pays a composition mode on
every frame, forever, for a defence that covers one class. **A fix that names
the class of target it repairs is a fix that will be re-derived for the next
class.** There are as many occlusion heuristics as there are toolkits.

**Taken: stop perturbing.** There is one apparatus and an open-ended number of
reactions to it, so the fix belongs at the apparatus. In descending order of
preference: do not fully cover what the product intends to read; where the
surface must be fullscreen for the product's own reasons, make it genuinely
non-occluding rather than apparently so; where neither is available, read
through an interface the target's hibernation does not affect, and accept the
capability loss explicitly rather than shipping a query that is empty for a
population the product cannot enumerate.

## Decision rules

- Before debugging a query over a foreign application, ask what the product's
  own surface is doing to that application.
- A root element with no children is not an answer; separate the four causes
  before choosing a fix.
- Establish causation with a rig that removes the apparatus's contact and
  changes nothing else; write down what was held fixed.
- Fix at the perturbation. A fix at the target's reaction is scoped to one
  implementation of that reaction.
- Reject any workaround whose correctness argument names a particular class of
  target application.
- Where the perturbation cannot be removed, declare the resulting loss rather
  than returning an empty result that reads as data.

## When not to use this

- **The instrument places nothing over the target.** A reader that works from a
  background process with no surface has no perturbation to look for, and this
  is a search with no possible finding.
- **The target is one known application the product controls.** Ask it. Its own
  answer is cheaper and correct by construction.
- **The empty result reproduces with the product's surface destroyed.** Then the
  cause is one of the other three, and every hour spent here is spent on the
  wrong one — which is the whole reason the experiment comes before the fix.
