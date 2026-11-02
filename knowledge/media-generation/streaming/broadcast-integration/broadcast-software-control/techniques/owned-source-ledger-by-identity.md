---
layer: technique
type: technique
subject: broadcast-software-control
technique: owned-source-ledger-by-identity
status: forged
laws: []
shared_with: []
use_when: [recording which sources and scenes a tool created in the broadcasting software, deciding what key a tool's cleanup is addressed by, a source was renamed or duplicated by the streamer]
---

# Owned-source ledger by identity

A tool that creates objects in the streamer's broadcasting software keeps a durable record of
exactly those objects, keyed by the identity the software assigned when it created them. The
ledger answers one question - "did I create this?" - and every later update, claim and
removal is addressed through it.

## What goes in an entry

Each entry records what is needed to find the object again and to prove it is the same one:

- **The input identity**: the opaque unique identifier the software returned for the source.
  This is the key. It survives renames and is never reused for a different object within the
  software's lifetime.
- **Every placement identity**: for each scene the tool placed the source in, the scene's
  identity and the numeric item identifier of the placement. Item identifiers are scoped to
  their scene - the same number in another scene is another object - so a placement is
  always the pair, never the number alone.
- **The scene identity**, when the tool created the scene itself, recorded the same way.
- **The kind and the name at creation**, for display and for diagnosing drift, never for
  lookup.
- **The connection it was created on**: which endpoint and which scene collection. A
  ledger entry from one collection says nothing about another, and a streamer who switches
  collections has switched to a different set of objects.

The entry is written from the creation response, before the tool does anything else with
the object. An object created but not yet recorded is an orphan the tool will later be
unable to claim, and a crash between the two is the usual way orphans are born; write the
intent first (an entry marked pending with the name and kind) and complete it with the
identity when the response arrives, so a crash leaves a trace the next session can resolve
by reading the peer.

## Decision rules

- **When a lookup could go by name or by identity, go by identity.** Names are a display
  label the streamer edits; two objects of different kinds may share one; a tool's own
  default name may already be in use. A request addressed by name acts on whatever answers to
  that name now.
- **When the name the peer reports differs from the ledger's**, the streamer renamed it.
  Keep the identity, update nothing about ownership, and let the display follow the peer.
- **When the ledger holds an identity the peer does not**, the object is gone - the streamer
  deleted it, or a collection switch took it away. Mark the entry absent; do not recreate it
  silently, because the streamer may have deleted it on purpose.
- **When a pending entry has no identity after a restart**, read the peer for an object of
  that name and kind created in the window. If exactly one exists and nothing else claims it,
  it is a candidate, still subject to the claim rule; if none or several, the pending entry is
  closed as unresolved and surfaced, never guessed.
- **Prefix the names of created objects** with a marker the streamer will recognise, as a
  courtesy for the human looking at their source list. Never read the prefix back as proof of
  ownership; a streamer can type it, and a copied scene carries it into objects the tool never
  created.

## Where the ledger lives

Locally, beside the tool's other per-machine state, scoped per endpoint and per scene
collection. It is written atomically - to a temporary file, flushed to disk, then renamed
over the old one - after every change, so a crash leaves either the old ledger or the new
one and never half of each. On load it is validated strictly: a malformed entry, a duplicate
identity or an unknown field is a refusal to start cleanup, not something to repair by
guessing, because a guessed ledger grants deletion authority nobody recorded. It holds no
secret: no password, no credential label, no session token, no overlay address. It does not live inside the broadcasting software's own objects (a private
settings field, a hidden tag) unless the software documents that field as preserved: such
markers are lost on duplicate, export and re-import in ways the tool cannot observe, and a
duplicated source carrying the tool's marker is precisely the impostor the ledger exists to
reject.

## When not to use it

A tool that only reads - shows the current scene, mirrors the source list - creates nothing
and needs no ledger. A one-shot script that the streamer runs by hand to build a scene
collection, and then never runs again, may skip it; the moment the tool will come back later
to update or remove what it made, the ledger is the only safe address it has.
