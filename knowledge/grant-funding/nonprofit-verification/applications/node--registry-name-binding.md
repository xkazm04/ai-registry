---
layer: application
type: application
subject: nonprofit-verification
technique: registry-name-binding
stack: node
status: forged
verified_on: 2026-08-19
---

# Node: binding the claimed name to the registry's canonical name

`src/features/org-verification/name-match.ts` in the grant-writing-nonprofits
repo is the impersonation guard as a pure module — no I/O, "safe on client or
server" (`name-match.ts:1-7`). The header comment states the threat model the
technique exists for (`name-match.ts:9-12`): the registry "confirms an *id*
is real, but a user types the *name* freely. Without binding the two, a bad
actor can pair a valid IČO belonging to one real nonprofit with any name they
like and mint a green 'verified' passport impersonating it" — recorded there
as an actual audit finding (C8).

## The three-stage match

`nameMatches()` (`name-match.ts:54-75`) implements the escalation exactly:

1. `normalizeOrgName()` (`name-match.ts:30-39`) — NFD-decompose and strip
   combining diacritics, lowercase, fold punctuation to spaces, collapse
   whitespace. Both empty ⇒ `false` at `name-match.ts:61` — the "empty never
   matches" rule, with the docstring noting "we cannot confirm a binding
   from nothing".
2. Exact equality, then containment in either direction
   (`name-match.ts:62-65`) — accepting "Nadace X" vs "X" style short forms.
3. Token-set overlap over meaningful tokens with `threshold = 0.6`
   (`name-match.ts:67-74`), dividing overlap by
   `Math.max(setA.size, setB.size)` — the larger set, so a one-token claim
   cannot "fully overlap" a long registry name.

The stop-set (`LEGAL_FORM_TOKENS`, `name-match.ts:17-27`) is the
per-jurisdiction, per-language vocabulary the technique calls for: Czech
legal-form suffixes in ASCII-folded form (`zs`, `ops`, `spolek`, `nadace`,
`sro`…) alongside English ones (`inc`, `llc`, `foundation`, `charity`…) plus
articles — the words that "carry no identity signal", per the comment at
`name-match.ts:14-16`.

## Mismatch vetoes at the aggregate

The binding's authority lives in `passport.ts`. The registry-returned name is
bound at `passport.ts:90-99` (first source returning a name is
authoritative), the result is the three-valued `NameMatch`
(`passport.ts:27` — verified / mismatch / unconfirmed, with the type comment
declaring "a 'mismatch' must never read as grant-eligible"), and the verdict
at `passport.ts:110` enforces the veto:
`grantEligible = passes > 0 && fails === 0 && nameMatch !== "mismatch"` —
a mismatch blocks even when every registry check passed. The passport also
carries `registryName` as the authoritative display identity over the
user-typed `legalName` (`passport.ts:32-35`), and the UI summary's headline
for the mismatch case reads as a question to the user, not an accusation:
"Registry name doesn't match the name you entered"
(`passport.ts:195-196`).

The sibling reconciliation — registry legal-form code vs self-declared
entity type — follows the same three-valued shape (`LegalFormMatch`,
`passport.ts:139`, computed at `passport.ts:184-189`), surfacing
disagreement as `mismatch` rather than silently preferring either source.
