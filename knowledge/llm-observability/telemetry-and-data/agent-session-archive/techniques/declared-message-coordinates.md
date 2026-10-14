---
layer: technique
type: technique
subject: agent-session-archive
technique: declared-message-coordinates
status: forged
laws: [never-present-absence-as-an-answer]
shared_with: []
use_when: [returning a citation into an archived session from search, an agent opened the wrong part of a transcript from a search hit, writing a lesson or memory that cites a transcript]
---

# Declared message coordinates

Cite an archived message in a **declared coordinate space**: the
conversation's identity plus the message's stored ordinal in the archive,
with the space named in the payload that carries it. Never cite it as a line
of the source file. A lookup by coordinate resolves to exactly one archived
message or fails; it never substitutes a neighbour, the newest matching row, a
local copy, a fresh parse of the live file, or a raw line.

## Two spaces that diverge on the first dropped record

A transcript on disk and the conversation in the archive are two different
sequences. Normalization drops metadata records, progress records, blank and
malformed lines and housekeeping entries; it folds one reply that spans
several records into one message; it may skip tool records or keep them as
separate messages depending on the reader's version. Stored ordinals can be
sparse after filtering. So message 42 in the archive and line 42 of the file
agree only on a transcript with nothing to drop, and the divergence grows with
every record normalization removed before that point.

The failure is predictable because the field that carries the ordinal is
usually named for lines. A consumer that receives a field called "line" from a
search hit opens the source file at that line, reads a different record, and
cites it. Nothing errors. The citation is plausible, specific and wrong, which
is the most expensive shape a citation can take, because a reader checks a
vague citation and trusts a precise one.

## Procedure

1. **Name the space in every payload.** A result that carries a position also
   carries which space it is in (archive message ordinal, or physical file
   line) and where the content came from (the archive, or the live file). The
   follow-up call takes the coordinate as given and the space as declared.
2. **Bind the identity, not just the position.** The follow-up names the
   origin, the conversation's identity and the ordinal together, and resolves
   them in one read transaction, so the identity and the message are observed
   at the same moment.
3. **Fail closed.** Ambiguous identity (two conversations sharing a source
   path), a missing message, a duplicate ordinal or an identity mismatch is an
   error with a reason. No fallback. A fallback that returns the nearest
   message turns a broken citation into a wrong one, and a wrong one is
   believed.
4. **Count context in messages.** "Three messages either side" walks the
   stored sequence; it is never arithmetic on ordinals, which may be sparse.
5. **Refuse oversize, never truncate.** A window that exceeds the payload
   budget is refused with a non-retryable error that says which limit was hit.
   A truncated message presented as complete is the same wrong citation by a
   different route.
6. **Keep physical-line addressing as its own mode.** Reading a source file
   by line is legitimate for a person debugging a parser. It is a separate,
   explicitly named mode that never falls back to archive content and never
   claims a conversation identity.

## When the meaning of a field changes, rename the field

The cheapest fix for a field that meant two things is to reinterpret it and
document the new meaning. That fix is invisible to every consumer that read
the old documentation, and for an archive served to agents the most-read
documentation is the instruction file loaded into every agent's context,
which is also the one least likely to be updated with the reference. A
renamed field breaks stale consumers loudly; a reinterpreted one lets them
keep producing wrong citations. Change the instruction file in the same change
as the payload.

## State the coordinate's lifetime

A coordinate is stable within one archive generation. A full rebuild that
reallocates conversation ids invalidates any coordinate bound to them. Either
bind the coordinate to the natural session key from
[root-relative-session-identity](./root-relative-session-identity.md), which
survives a rebuild, or stamp it with the archive generation and refuse lookups
across generations. A durable citation, the kind a lesson or a memory carries,
adds a short digest of the cited message's content, so a citation that later
resolves to different content says so instead of quietly pointing elsewhere.

## When not to use it

A one-shot read of a live transcript inside a single turn, where nothing
normalizes between reading and citing, can cite file lines; both sides are in
the same space. The technique is for anything that crosses the archive: search
hits, follow-up calls, and every citation meant to outlive the session that
made it.
