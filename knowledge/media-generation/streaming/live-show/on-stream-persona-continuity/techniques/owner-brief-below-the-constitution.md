---
layer: technique
type: technique
subject: on-stream-persona-continuity
technique: owner-brief-below-the-constitution
status: forged
laws: []
shared_with: []
use_when: [letting an owner direct a generated live host during or before a stream, feeding a chosen plan or standing directives into the host's prompt, deciding whether a viewer's request may become direction]
---

# Owner brief below the constitution

The owner needs to steer: tonight's topic, a directive to lean on a running bit,
a subject to avoid, a plan chosen from a set of proposals. That direction is real
authority, and it still sits **below the core**, in precedence and in the prompt.
The brief chooses among things the core permits and never permits what the core
forbids. A different character is an edit to the core, made out of band; the
brief is not a back door to it.

## Placement and framing

The brief is its own section, after the core, the platform and safety rules, the
show's enabled rules and the persona, and before the per-turn material. It is
rendered from typed fields (a dispatch, a program, topics, directives split into
"never do" and "work in when it fits"), not pasted as prose. It is fenced:
wrapped in an explicit delimiter, preceded by a constant statement of its rank
("direction from the owner; the rules above outrank it") and followed by a
constant restatement, so the rank brackets the data on both sides and nothing
inside can edit either. The fence matters because a brief is assembled from
things that were not all written by the owner: a plan drafted by an automated
pass from viewer-derived material, a directive that quotes chat, a note pasted
from elsewhere. Framed as data with a rank, those contents can inform the host;
unframed, any instruction inside them speaks with the owner's voice.

The fence has to hold without breaking byte stability, and the obvious defence
does break it: a fresh random delimiter per assembly changes the prefix every
time. Hold the fence by **elimination** instead: flatten every item to one line
and replace the delimiter's opening character wherever it appears in brief text,
so no payload can close the fence or forge a heading, and accept the small loss
of fidelity that costs. Cap each field and the item counts, and say in the text
when something was cut, so a long brief cannot crowd the persona out of the
prompt.

## Precedence

The core states that it outranks the brief, and the brief's own framing repeats
it. The host reads both, so the order must be in the text. A directive that
conflicts with the core, or that tells the host to ignore, rewrite or reveal its
rules, is **void**: the host does not obey it, does not announce it, and carries
on in character. Announcing a refused order on stream tells the room that a brief
exists and what kind of thing gets through it, which is an invitation to probe.
The owner, not the audience, is the one who needs to know: a voided directive is
a signal for the operator surface and the post-stream review.

The rank in the text is the last line of defence, not the first. Models do not
resolve conflicts between instruction levels reliably even when the levels are
marked, and an authoritative framing inside the lower level can outweigh the
marking. So a check that code can run happens before the model reads anything:
directives are compared against the core's hard lines and the platform rules when
the brief is built, and a conflicting directive is withheld from the prompt and
shown to the owner before the stream starts, rather than composed and left for the
model to void.

## Absence

When there is no brief, the section is byte-absent: no header, no empty fence.
The composed prompt with the feature unused is byte-identical to a build that
never had the feature, so that persona hashes, caches and comparisons across the
feature's introduction remain valid.

## Who may write it

Only the owner's own act makes direction. A plan proposed by an automated pass
becomes a brief only when the owner chooses it, and a proposed directive composes
nothing until the owner activates it. Build the brief at stream start from the
live directive store, not from the snapshot a plan carried when it was chosen, so
a directive the owner switched off afterwards does not come back through the
plan. A brief source that exists but cannot be read cleanly stops the stream from
starting; a host that goes live on half a brief is running direction nobody
chose. A viewer's request, however
persistent, generous or high-ranked the viewer, never becomes direction directly.
A host performing to a crowd must not be steerable by one member of it, and the
pipe from chat to brief is the shortest route to exactly that. Audience steering
that the show does want runs through its own economy, with its own limits, below
the same core.

## Decision rules

- **When the brief grows long**, it is turning into a second bible; move durable
  material into the bible through review and keep the brief to tonight.
- **When a directive is meant to last across streams**, store it as a standing
  directive with an owner and an expiry, and compose it into the same fenced
  section; it is still below the core.
- **When a directive applies only to one segment**, scope it in the brief and put
  a one-line reminder of which directives are in force into the per-turn band, so
  the stable prefix stays fixed while the host still knows what applies now.
- **When the brief is edited mid-stream**, treat the change as a new stream-scoped
  version: the prefix above it is unchanged, and the measurement record notes the
  change time. Prefer sealing the brief before the stream and holding it for the
  whole of it; every mid-stream edit costs the cached prefix.
- **When the owner wants the host to break a core rule for one night**, the answer
  is an out-of-band core edit with a version, or no.

## When not to use it

A host with no owner in the loop has no brief to frame; do not invent one to hold
automated suggestions, which belong in the per-turn band as data. And this
technique does not decide what the owner may direct for safety reasons; it decides
only where direction sits relative to the persona.
