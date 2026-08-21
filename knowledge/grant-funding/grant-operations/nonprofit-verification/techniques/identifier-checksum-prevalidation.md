---
layer: technique
type: technique
subject: nonprofit-verification
technique: identifier-checksum-prevalidation
status: forged
laws: [honest-null-over-forced-guess]
shared_with: []
use_when: [accepting a free-typed organization identifier before a registry lookup, a mistyped id was reported as "organization does not exist", adding a new jurisdiction whose identifier carries a check digit]
---

# Identifier checksum prevalidation

Most national organization identifiers are not arbitrary strings: they carry
an algorithmic check digit — a weighted modular sum over the other digits,
published in the issuing authority's spec — designed to catch transposition
and single-digit typos. (The cross-jurisdiction legal-entity identifier
standard does the same with two verification characters.) The technique is
to validate that structure *before any network call*, and to treat a
checksum failure as its own outcome class, distinct from "no such
organization".

## Why the distinction is worth a whole outcome

A mistyped identifier and a nonexistent organization demand opposite repairs.
"This identifier is not structurally valid — re-check the number" sends the
user back to their paperwork. "No organization with this identifier is
registered" sends them to question their own legitimacy, or worse, sends a
reviewer to record a determinate fail against a real charity that fat-fingered
one digit. The checksum *proves* the first case without consulting anyone:
no valid identifier can fail its own check digit, so the string cannot name
any organization, existing or not. That proof is cheap, offline, and
deterministic — the best kind of gate.

Prevalidation also protects the pipeline itself: it keeps garbage out of
registry query logs and caches (a cache keyed on invalid ids fills with
permanent misses), avoids spending rate-limited upstream calls on strings
that cannot resolve, and gives the input form instant, keystroke-time
feedback instead of a network round trip.

## Procedure

1. **Normalize first.** Strip whitespace and formatting punctuation, apply
   the jurisdiction's canonical padding (identifiers that are numerically
   equal but string-unequal — leading zeros dropped by a spreadsheet — are
   the classic false "nonexistent"). All later stages, including cache keys
   and the credential's subject id, use the normalized form.
2. **Check the shape** — length and character class per the jurisdiction's
   spec.
3. **Run the check digit exactly as the issuing authority publishes it.**
   Implement from the spec, not from folklore: algorithms differ per
   jurisdiction in weight order, in modulus, in where the check digit sits
   (some trail, some *lead*), and in how boundary remainders map. Encode
   each jurisdiction's algorithm behind one shared "is this id valid here"
   entry point owned by the jurisdiction model, so adapters ask rather than
   reimplement.
4. **On failure, return an `invalid` status classified as inconclusive** —
   never a fail — with a detail sentence naming the expected format. The
   network is never touched.
5. **Test against the authority's published examples plus known-good real
   identifiers,** and test the near-misses: one digit off, two digits
   swapped. A checksum implementation that accepts a transposition is worse
   than none, because it converts a catchable typo into a confident
   registry miss.

## Decision rules

- **When the jurisdiction's identifier has no check digit, prevalidate
  shape only and say so in the adapter's comments, because** a fabricated
  "checksum" invents rejections the authority never specified.
- **When the checksum fails, do not "helpfully" search the registry by name
  instead, because** silently switching lookup keys returns a plausible
  different organization and re-opens the impersonation hole the name
  binding closed.
- **When a batch import hits checksum failures, quarantine those rows for
  human correction rather than dropping or best-guessing them, because**
  an honest "these 14 ids look mistyped" beats fourteen silent absences.
- **When the same identifier arrives repeatedly in different formatting,
  suspect the normalizer before the registry, because** most "flaky
  verification" reports trace to string-unequal equal ids.

## When not to use

Checksum validity is a statement about the *string*, never about the
*organization* — a structurally valid identifier can belong to nothing, to
a dissolved entity, or to somebody else entirely, so prevalidation must
never upgrade any downstream outcome; it only prevents one class of wasted,
misleading lookup. Skip the technique entirely for identifiers you did not
receive as free text (ids read back from your own store, already normalized
and previously verified) — re-validating them on every read is noise, and a
failure there signals data corruption, which deserves an alarm rather than
a polite form message.
