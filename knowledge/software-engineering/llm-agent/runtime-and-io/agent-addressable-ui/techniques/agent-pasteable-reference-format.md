---
layer: technique
type: technique
subject: agent-addressable-ui
technique: agent-pasteable-reference-format
status: forged
laws: [failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when: [designing what the operator actually copies, a copy silently failed and the agent edited the wrong file, deciding how much context a source reference carries]
---

# Agent-pasteable reference format

Everything upstream — the transform, the gate, the ancestor walk — terminates in
a person pressing a key and pasting into a conversation. The clipboard is the
transport, the coding agent is the consumer, and the shape of the text that
crosses is a first-class design decision. Get it wrong and the whole apparatus
produces something the person has to edit before it is usable, which is exactly
the manual translation step the subject exists to abolish.

## Design for the consumer that already exists

The consumer is a coding agent reading a chat message. It already parses one
reference shape without being told: a project-relative path followed by a line
number, in the conventional separator. Emit that, first, on its own, unwrapped
by prose it would have to strip. Every decoration around it is a token the agent
pays for and a chance for it to attach the wrong meaning.

Two qualifiers earn their place beside it:

- **a short anchor of the element's visible text**, trimmed, collapsed to one
  line, and hard-capped. It is not there to identify the file — the path does
  that — it is there so the agent can confirm it landed on the right thing when
  the line has drifted since the last build, and so the person reading their own
  paste can tell at a glance that they copied the element they meant.
- **the innermost location as a second line**, when the walk actually moved. Two
  rungs of the render path costs one extra line and answers the agent's most
  likely follow-up question before it asks.

A line number, never a range. Ranges are wrong more often than lines — the
transform knows where an expression starts, not where the meaningful unit ends —
and an agent widens from a line on its own with better judgment than the
transform has.

## What must not travel

The reference is about to enter a model's context and possibly a shared thread.
Visible text is already on the screen the person is looking at, so copying it
discloses nothing new. Attribute values, component state, form contents and data
identifiers are a different matter: they are not on screen, the person did not
choose to reveal them, and they are precisely the kind of thing that turns a
convenience feature into an incident. **The default reference carries a location
and an anchor, and nothing else.** If a richer dump is genuinely wanted, it is a
separate, explicitly-labelled gesture, and it is the operator's decision each
time rather than a setting they set once and forget.

Cap the anchor hard and strip newlines from it. An element can contain an entire
page of text, and a multi-line paste breaks the shape the agent was going to
recognize.

## One authority for the format

The reference shape has two ends: the overlay produces it, and whatever
instructs the agent — a project's agent guidance, a prompt template, a tool
description — tells the agent how to read it. Those are one vocabulary with two
consumers, and they drift the moment somebody "improves" the emitted format
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Write the format down once, in the place the agent's instructions are kept, and
have the overlay's emitter reference that decision rather than reinventing it.

## The clipboard degradation ladder

Writing to the clipboard is the least reliable operation in the entire loop, and
implementations routinely treat it as if it were infallible. The modern
asynchronous write is permission-gated, requires a secure context, requires the
document to be focused, and rejects in a set of perfectly ordinary situations: a
non-secure origin on a local network address, a background or unfocused window,
a browser that wants a user gesture the handler has already consumed, a policy
that denies the permission outright.

So the write is a ladder, and every rung is real:

1. **the asynchronous clipboard write.** The good path; use it first.
2. **the legacy synchronous copy command against a temporary off-document
   field.** Deprecated, widely still functional, and it works in several of the
   cases where the modern path rejects. Create the field, select, copy, and
   remove it on every exit path including the failure path.
3. **show the text, already selected, and ask the person to copy it.** Not a
   failure state — a rung. The person is sitting right there; handing them
   selected text costs them one keystroke and keeps the loop closed.

## Report which rung, always

The single most damaging failure in this subject is a copy that fails quietly.
The person presses the key, sees nothing, assumes it worked, pastes — and what
lands in the agent's context is whatever was in the clipboard before, which is
often a *different* source reference from ten minutes ago. The agent then edits
a real file, confidently, in the wrong place, and the person's trust in the
whole loop is spent debugging an edit nobody asked for.

Therefore: **every rung reports itself, and failure is spelled differently from
success**
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
A visible confirmation naming what was copied on the good path; a distinct,
visibly different state when the ladder fell to the manual rung; never a silent
no-op. Confirmation also has a second use — it shows the person the reference
text, which is the cheapest possible review of whether the resolution picked the
right element.

## When not to use this

If the agent is running in the same process as the interface and can be handed
the reference directly — a tool call, a local channel, an editor integration —
the clipboard is a downgrade and the ladder is unnecessary; pass structured data
instead and keep the format decision, which still applies. The ladder is for the
common case where the agent lives in another window and the only channel between
the two is the one the operating system already gives you.
