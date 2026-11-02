---
layer: technique
type: technique
subject: broadcast-software-control
technique: claim-only-what-you-created
status: forged
laws: [refusal-is-a-state]
shared_with: []
use_when: [a tool finds an object with its default name already in the broadcasting software, writing a cleanup or reset routine, deciding whether a tool may take over a pre-existing source or scene]
---

# Claim only what you created

A tool updates, moves or removes an object in the streamer's broadcasting software only when
its ledger shows the tool created that exact object, by identity. Everything else is the
streamer's, however familiar its name looks, and the tool's answer to a collision is a
refusal the streamer can see.

## Why adoption is the dangerous default

The convenient design, when the tool goes to create "the overlay" and finds one already
there, is to adopt it: reuse the source, rewrite its settings, carry on. It avoids a
duplicate and it handles the tool's own crashed session gracefully. It also means the tool
will, sooner or later, rewrite the address of a browser source the streamer built by hand,
reposition a scene they arranged, or delete their copy during cleanup - because a source
created by the streamer with the same name is indistinguishable, over the socket, from one a
previous run of the tool left behind.

The cost asymmetry decides it. A refused adoption costs the streamer one prompt: "an object
named this already exists; remove or rename it and try again". A wrong adoption costs a
piece of their channel, discovered on air.

## The procedure

1. **Before creating**, read the peer for any object of the intended name, in any kind the
   software lets collide with it.
2. **If one exists and its identity is in the ledger**, it is the tool's own; use it.
3. **If one exists and its identity is not in the ledger**, refuse to create, adopt or
   remove. Surface the refusal as a state - a named condition with the colliding name and
   what the streamer can do about it - not as a generic error and never as a silent success.
4. **If none exists**, create, and record the returned identity before doing anything else.

Cleanup follows the same rule from the other end: it iterates the *ledger*, not the
inventory, and removes only identities it finds there. A cleanup that walks the inventory
looking for "things that look like ours" is an adoption with a delete attached.

## A scene the tool did not create

Tools often need a scene to put their sources in. When the scene already exists - the
streamer made one with the expected name, or chose an existing scene in the tool's settings -
the tool may place its own sources inside it, because adding a placement is reversible, but
it does not take ownership of the scene. It records its placements; it never removes,
renames or reorders the scene, and its cleanup removes the placements and leaves the scene.
Only a scene whose creation the ledger records may be removed by the tool.

## Decision rules

- **When the streamer explicitly hands an object to the tool** ("use this source"), record
  that hand-over as a separate kind of entry - adopted by consent - and still never remove it
  on cleanup; restore what the tool changed if it can, and otherwise leave it.
- **When a refusal blocks a whole flow** (the tool cannot provision its overlay because the
  name is taken), offer a fresh name rather than an override switch. An "adopt anyway" button
  trains the streamer to click it.
- **When a leftover from the tool's own previous session is suspected**, say so, and let the
  streamer remove it; the tool does not decide that the leftover is its own on the strength of
  a name and a timestamp.

## When not to use it

A tool that the streamer runs inside a broadcasting-software instance the tool itself
launched and will discard - a test harness, a throwaway rendering instance - owns the whole
instance and may treat every object as its own. The rule binds wherever the instance is the
streamer's.
