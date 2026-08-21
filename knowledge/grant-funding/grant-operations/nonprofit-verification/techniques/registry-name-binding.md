---
layer: technique
type: technique
subject: nonprofit-verification
technique: registry-name-binding
status: forged
laws: [provenance-per-field, never-fabricate-a-figure]
shared_with: []
use_when: [a verification flow accepts a free-typed organization name alongside a registry identifier, designing the impersonation guard for a verified badge or credential, tuning name normalization and match thresholds across languages and legal forms]
---

# Registry name binding

A registry lookup confirms that an *identifier* is real. The user supplies a
*name* — free-typed, unvalidated, theirs to invent. Unless the two are bound,
the verification has a hole exactly the size of its own badge: a bad actor
pairs a valid identifier belonging to one real nonprofit with any name they
like, and the pipeline mints a verified credential impersonating a
legitimate organization. Every individual check passes; the composite claim
is a forgery. The technique is the binding: fetch the registry's canonical
name for the identifier, match the claimed name against it, and give the
match result veto power over the verdict.

## The match, in three escalating stages

Registry names and user-typed names legitimately differ — case, diacritics,
punctuation, word order fragments, and above all the legal-form furniture
("Foundation X", "X, Inc.", "X Charitable Trust" are one organization).
Normalize first: lowercase, strip diacritics (decompose, drop combining
marks), fold punctuation to spaces, collapse whitespace. Then match in
order, cheapest and strictest first:

1. **Exact equality** of the normalized strings.
2. **Containment** — one normalized name contains the other. This accepts
   the short form against the registered long form in either direction.
3. **Token-set overlap over meaningful tokens.** Tokenize both names, drop
   a curated stop-set of legal-form and filler words — the jurisdiction's
   entity-type suffixes and their abbreviations, plus generic organization
   words (foundation, fund, association, institute, charity) and articles —
   and accept when the overlap ratio over the *larger* remaining set clears
   a threshold around 0.6. Dividing by the larger set matters: dividing by
   the smaller lets a one-token claimed name "fully overlap" any registry
   name sharing that token.

Two absolute rules frame the stages. **Empty never matches**: if either
side normalizes to nothing, the answer is no-match — a binding cannot be
confirmed from silence, and defaulting blank-vs-anything to true quietly
disables the entire guard. And the stop-set must be maintained *per
jurisdiction and language*: legal-form vocabulary is jurisdictional
knowledge, and a stop-set that misses a local suffix fails honest local
names while one that greedily eats real words ("trust" in an organization
actually named Trust) collapses distinct identities.

## The result is three-valued, and mismatch vetoes

The binding yields **verified** (a source returned a canonical name and it
matches), **mismatch** (a source returned a name and it does not match), or
**unconfirmed** (no source returned any name to bind against — common when
only name-less sources ran). The aggregate verdict treats these
differently: unconfirmed degrades the credential's strength but does not
block, while **mismatch blocks even when every registry check passed** —
it is the one signal whose entire purpose is to override otherwise-clean
results, because it is the signature of impersonation. Render the
registry's canonical name as the authoritative identity everywhere the
verified state shows; the user's typed string is a claim, and displaying
the claim under a verified badge is exactly the confusion the technique
exists to prevent.

## Decision rules

- **When several sources return names, bind against an authoritative
  registry name and treat agreement among the rest as corroboration,
  because** sources mirror each other with lag and letting the loosest
  mirror win reopens the hole.
- **When the match fails, show both names and ask, not accuse, because**
  the overwhelmingly common cause is a typo or an old name after a legal
  rename — the block is real, the tone is "confirm your registered name".
- **When tuning the threshold, tune against real false-negative pairs
  (renames, abbreviations, bilingual registrations) rather than loosening
  for convenience, because** every loosening admits more impersonation
  space, and containment already handles the honest short-form cases.
- **When the matcher needs I/O to run, it is in the wrong layer:** keep it
  a pure function over two strings **because** purity is what makes it
  exhaustively testable against adversarial pairs and reusable on both
  client and server.

## When not to use

Name binding is a guard against *misattribution*, not a search technique —
never use the fuzzy matcher to *find* an organization by name and then
treat the found identifier as verified, because that inverts the trust
direction (the identifier must come from the user and be bound to the name,
not discovered from it). For pure name-based screens with the opposite
polarity — sanctions lists, where a fuzzy *hit* is the alarm — the matching
mathematics may look similar but the thresholds, the stop-sets, and the
error costs are inverted; do not share a tuned matcher between the two
jobs.
