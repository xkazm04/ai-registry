---
layer: technique
type: technique
subject: on-stream-overlay-delivery
technique: no-source-url-without-a-valid-read
status: forged
laws: [refusal-is-a-state, unmeasured-is-not-pass]
shared_with: []
use_when: [showing the streamer an address to paste into the broadcasting software, provisioning a browser source automatically, an overlay that loaded blank on stream]
---

# No source URL without a valid read

The tool hands out an overlay address — to display, to copy, or to a component that
creates the browser source — only after it has successfully read the state that address
will show. If the read fails, there is no address, and the streamer is told why.

## The blank-source trap

Handing out an address is easy and always succeeds: it is a string. That is the problem.
A tool that builds the URL from a template will give the streamer an address for a vote
that has no configured window, a draw whose record cannot be read, an overlay whose store
is locked by another process. The streamer pastes it, sees a transparent source — which
is exactly what a working overlay looks like when idle — and goes live. The first time
anyone learns the overlay cannot show anything is the moment it was supposed to.

So the address is treated as a result, not a constant. Producing it means proving the
overlay can be fed: the read that the page's first snapshot will come from has just
succeeded, and the state it returned is one the page knows how to draw.

## Procedure

1. **Read the overlay's backing state** with the same code path the feed will use, not a
   cheaper existence check. A record that exists but fails to parse is a failed read.
2. **Validate what was read** against what the overlay requires: a vote has a defined
   window and options within limits, a draw has a record in a drawable phase, a design
   package resolves.
3. **On success, return the address** together with the snapshot it would show now, so
   the streamer's surface can preview it. The address is built from the tool's own
   overlay origin, never from a template that would accept any local address: an address
   on the loopback interface proves nothing about isolation, and a component that will
   place the source checks that the address names the owned origin and the current
   verified package before it acts.
4. **On failure, return a refusal with a reason** the streamer can act on: "this vote has
   no window yet", "the giveaway store could not be read". A refusal is a state the
   interface renders, not an exception swallowed into an empty field.
5. **Do the same before automatic provisioning.** A component that creates the browser
   source in the broadcasting software asks for the address through this path and does
   not create a source when refused.

The same rule holds on the overlay origin itself. The page route performs the read when
it is loaded and answers "unavailable" when the read fails, rather than serving an empty
shell that waits forever for a stream; the browser source then shows nothing, and the
page's retry brings it back when the state can be read.

## Decision rules

- **When the overlay's parameters are fixed at provisioning** — a vote window's length,
  a set of options — fix them from the read, so the address and the state it shows cannot
  disagree later.
- **When the read succeeds but the state is legitimately idle** (no vote running yet), the
  address is valid; idle is a drawable state. What is refused is a state the overlay cannot
  draw, not one with nothing to draw.
- **When an address was issued and the backing state later becomes unreadable or
  unverified**, the server ends that overlay's stream so the page clears under the
  disconnect rule, and the tool flags the overlay on the streamer's surface. It does not
  keep the stream open on the last good state, and it does not silently revoke the
  address; when the state is valid again, the same address works.
- **When an auxiliary read fails after the main one succeeded** (a provenance lookup, a
  design lookup), decide in advance which way it fails. A failed provenance read must
  never let a rehearsal number go out unlabelled; a failed decoration read may fall back to
  the plain look.

## When not to use it

A purely static overlay with no backing state — a fixed frame — has nothing to read, and
its address can be issued freely. Do not invent a read to satisfy the rule.
