---
layer: technique
type: technique
subject: engine-pitfall-corpus
technique: incident-entry-shape
status: forged
laws: [structural-proof-is-never-sufficient, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [converting a root-caused incident into a reusable entry, auditing an existing knowledge file for entries that cannot be re-verified]
---

# Incident entry shape

The entry is the atom of the corpus. Its shape decides whether the corpus can be
routed, re-verified and retired — three properties that prose cannot have. Get the
shape right once and everything downstream is mechanical; get it wrong and no
amount of good writing rescues it.

## The five fields

| Field | Holds | Fails without it |
| --- | --- | --- |
| **identifier** | a stable, human-readable handle for this pitfall | entries cannot be cited in a review, a changelog or a duplicate check; the same trap gets written twice |
| **summary** | one line, phrased as the conclusion the reader should act on | every consumer must read every body |
| **detail** | the probe: what was tried, in what mode, on what version, what was observed, what was tried and failed, what works instead | the claim cannot be re-verified, so it can never be retired |
| **scope** | the domains this pitfall belongs to, plus the task kinds it can apply to | the router cannot select, so the corpus caps at one injection's worth |
| **provenance** | where the knowledge came from and at what strength | strong and weak entries become indistinguishable |

Two axes of scope, not one. **Task kind** (what sort of work is being done — a
scripted authoring pass, compiled source, a packaging step) is a hard filter: a
pitfall about a scripting-only import route is not merely irrelevant to a compiled
task, it is misleading. **Domain** (which subsystem the work touches) is a soft
filter and is governed by `domain-scoped-injection-with-a-safe-superset`.

## The summary is the conclusion

Write the summary as the sentence you would say to a colleague who is one keystroke
from the mistake. Rules:

- Lead with the action or the prohibition. "Do not gate plugin-mounted content on
  the existence check — it returns a false negative" beats "Notes on plugin content
  and the asset registry."
- Put the *observable symptom* in the summary when the symptom is what the reader
  will actually encounter, because that is the string they will recognise. A reader
  hunting a misleading "not found" needs the word "not found" in the line.
- Where the fix is one token, put the token in the summary. If a connection needs
  an empty name rather than the obvious one, say so in the line; making the reader
  open the body to learn a single value is a routing failure.
- Never write a summary that is a topic. A topic tells the reader that something
  exists here; a conclusion tells them what to do about it.

## The detail recounts the probe

The detail's job is to make the entry *auditable*. It must let a reader who
disbelieves it reproduce the finding in an afternoon. State:

1. **The mode.** What execution mode was in force — interactive, headless,
   restricted, offline. Most engine pitfalls are mode-specific and a detail that
   omits the mode overgeneralises.
2. **The version.** The exact release the observation was made against. Behaviour
   forks between minor releases: one release crashes where the next silently
   succeeds at nothing, and an entry that says only "does not work" cannot express
   that, so it will be wrong for one of the two.
3. **What was observed, verbatim where possible.** The literal message, the exact
   return value, the empty collection that came back. Verbatim text is searchable;
   a paraphrase is not.
4. **The failed attempts.** The workaround that looked obvious and did not work is
   as valuable as the one that did, because the next reader will try it first.
5. **The fix, with its preconditions.** "Call the scan for these mount points
   first, then load directly and test the returned object" is a procedure. "Be
   careful with plugin content" is not.
6. **The blast radius.** What is *unaffected*. An entry that does not say "content
   under the primary project root is unaffected" gets over-applied and starts
   costing more than it saves.

A detail may run long. Length is not the cost function here — the cost function is
whether the entry can be re-verified, and a five-line detail that names the mode,
the version and the observed string is worth more than a one-line assertion.

## The three-layer rule

When an incident took several passes to root-cause because each layer of blindness
hid the next, record all the layers, in order, in one entry. Splitting them into
separate entries loses the thing that was actually learned: that fixing layer one
produces a *convincing* but still-wrong result, and the reader must keep going.
The canonical shape is: the operation you performed had a side effect you did not
expect; correcting it exposed a second path that bypassed your correction
entirely; and only observation of the running system showed which of the two was
in force. Verification at the artifact layer would have passed at every stage.

An entry may also carry a *policy* rather than a trap — how generated code should
grade the severity of a failure it encounters. Grading severity by consequence
rather than by the level the system happened to emit is a review-doctrine concern
owned by a neighbouring subject; what belongs here is only that such policies take
the same five-field shape and the same provenance as any other entry.

## Decision rules

- **One incident, one entry — unless the layers hid each other.** Then one entry,
  layered.
- **A hypothesis is not an entry.** Only confirmed root causes are admitted; an
  unconfirmed cause is a note somewhere else. The corpus's authority is its whole
  value and it is spent by the first entry a reader disproves.
- **If you cannot state the mode and the version, you cannot write the entry yet.**
  Go back and probe.
- **If the entry has no scope you can name, it is universal** — and that is a real
  category, not a fallback. See the superset technique.

## When not to use this shape

Not for stable, documented behaviour of the system: that belongs in a reference,
and duplicating it here dilutes the corpus's signal. Not for project conventions
("we name things this way") — those are a style contract with a different
lifecycle. Not for a trap in your own code: fix that instead, because the corpus
is for behaviour you do not control.
