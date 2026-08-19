---
layer: technique
type: technique
subject: beneficial-ownership-resolution
technique: identifier-checksum-validation
status: forged
laws: [one-definition-one-import, disclose-never-repair]
shared_with: []
use_when:
  - extracting company identifiers from free text or scraped documents
  - accepting an identifier from any source you did not mint
---

# Identifier checksum validation

Most national company identifiers carry a check digit — typically a weighted
modulo scheme over the leading digits — so a candidate identifier can be
structurally verified before it is ever used as a join key. The technique is
simple to state and unusually easy to get subtly wrong: validate every
identifier at the boundary where it enters the system, using one canonical
implementation of the register's published algorithm, and treat validation
failure as "this token is not an identifier", never as "fix the digit".

## Why the boundary check earns its place

Identifiers arrive from three kinds of source: the register itself (clean),
structured secondary feeds (mostly clean), and free text — filings, judgment
documents, scraped tables — where digit runs of the right length appear
constantly and most of them are dates, file numbers, amounts, or case
citations. Without a checksum gate, a regex over free text mints join keys
from noise, and each fabricated key can pull an unrelated entity into a named
person's dossier. The checksum rejects roughly ten elevenths of random digit
strings of the right shape, which converts extraction from "regex plus hope"
into a defensible filter. It does not prove the entity exists or that the
identifier belongs in this context — those are separate, register-backed
checks — but it cheaply kills the largest class of garbage.

## The wrap cases are where implementations die

A weighted-modulo scheme has ordinary cases and wrap cases. In the common
modulo-11 family, the remainder maps to a check digit by subtraction — except
at the boundary values, where the naive result would be 10 or 11 and the
register's specification wraps them to specific single digits, and the two
wraps are usually *not* symmetric. This is the precise spot where a
from-memory rewrite fails: a real implementation once collapsed both wrap
remainders to the same check digit, which silently rejected about one in
eleven genuinely valid identifiers as false negatives — dropped join-key hits,
invisible in output because a rejected key just looks like "no match". The
test corpus at hand happened to contain no identifier landing on the broken
remainder, so the bug shipped and was caught only when a second, independent
re-derivation of the algorithm was run against the first.

Decision rules that follow from that incident:

- **When implementing a check-digit scheme, test every remainder class,
  not every sample you happen to have.** Construct at least one identifier
  per remainder value, including each wrap, because a natural sample can
  miss a class entirely and pass green.
- **When a checksum function already exists in the system, import it; never
  re-derive it locally.** Two implementations of the same modulus will drift
  at the wraps, and the drift is undetectable at review time because both
  look correct.
- **Prefer false negatives loudly counted over false negatives silently
  eaten.** Log and count every rejected candidate with its source context;
  a rejection rate that jumps is how you discover a broken validator or a
  source that changed format.

## Validation failure is a verdict about the token, not an invitation

A candidate that fails the checksum is discarded and the discard is recorded.
It is never "repaired" — no transposing digits to find a valid neighbor, no
padding, no stripping until something validates. A repaired identifier is a
fabricated identifier with extra confidence attached, which is strictly worse
than the raw garbage. The same rule covers format normalization: leading-zero
padding to the register's canonical width is legitimate *presentation*
normalization applied before the check; anything that changes which entity
the digits could denote is repair.

## Context guards on top of, not instead of, the checksum

Free-text corpora carry false-positive classes the checksum cannot see:
digit runs that are checksum-valid by chance but are citations into some
other numbering system (court reporters, statute collections, file numbers).
The cure is a context guard — inspect the text adjacent to the match for the
other system's marker tokens and exclude on sight. Two rules keep this
honest: the guard is *layered on top of* the shared extraction pattern, never
a forked copy of it (the base pattern stays imported and identical
everywhere); and each guard is anchored to the specific corpus that needed
it, with the misparse that motivated it recorded, so the guard is not
"cleverness" but a documented incident response.

## When not to use it

Do not use checksum validity as evidence of existence, liveness, or
relevance — a valid identifier may denote a dissolved entity, a different
register's namespace, or nothing at all. Do not apply it to identifier
schemes that carry no check digit (some registers' schemes are plain
sequences); for those, existence lookup against the register is the only
structural gate, and the extraction threshold from free text must be
correspondingly stricter. And do not let a passing checksum shortcut the
name-to-identifier discipline: a valid identifier attached to the wrong
entity is the most convincing kind of wrong.
