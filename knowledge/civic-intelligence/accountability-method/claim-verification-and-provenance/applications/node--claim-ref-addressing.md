---
layer: application
type: application
subject: claim-verification-and-provenance
technique: claim-ref-addressing
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Node: a claim-address decoder that accepted addresses nobody issued

The politicas repo mints permanent citation links for graph claims in one
dependency-free module, `features/shared/provenance/claimRef.ts`: `h.<src>.<rel>.<dst>`
for an edge, `u.<id>` for a node, each segment a base64url of the identifier. The
header states the contract the technique asks for - the address is the claim, an
undecodable ref returns null and the page answers 404, never an empty frame - and the
decoder bounds input at 512 characters, rejects malformed alphabets and impossible
lengths, and returns null for empty segments. Every point the technique's "refusal,
never repair" section lists was already held.

## The seam chosen to falsify "the decoder is conformant"

The technique's last paragraph says to check canonical encoding. The decoder never did:
it validated the alphabet and the length class, then decoded. Two consequences, probed
on the unmodified code:

- `u.QR` decoded to the same node as `u.QQ`. Base64url discards the unused trailing
  bits of the last group, so up to three alias addresses exist per short segment. One
  claim, several addresses, and only one was ever issued.
- `u.wA` (a lone 0xC0 byte) decoded to a node whose id was the replacement character
  U+FFFD. A non-fatal UTF-8 decoder had repaired the input into a claim nobody made.

Both are the failure the technique names ("a surface that repairs addresses will
eventually confirm a claim the citer did not make"), arriving through the codec rather
than through fuzzy matching.

## The change and the measurement

`decodeClaimRef` now decodes loosely, re-encodes the result with `encodeClaimRef`, and
returns it only if the re-encoding equals the input. One comparison closes both holes
and any future one in the codec, because it asserts the property directly: the address
space is exactly the image of the encoder.

Arm A (old decoder): the new canonical-form test fails (alias and invalid-UTF-8
addresses decode). Arm B: the test passes, `u.QQ` still decodes, 3,822 existing tests
across `features/` and `lib/` stay green, typecheck clean, the repo's pre-push
typecheck and test gates green. Every address the site ever issued is the encoder's own
output, so no issued citation changes meaning. Not measured: how often a real
published link was hand-edited into an alias (none is known; the gate answered
"unknown" for those only by luck of the length class).

## Left alone

`features/graph/permalink.ts` carries its own copy of the same base64url decoder for
view citations (deliberately, per its header). Its address also ends in a content hash,
and its payload is re-validated by `parseViewState`, so an alias there still resolves
to a hash-checked view rather than to an unissued claim. It has the same
non-canonical-alias property and is noted rather than changed; the two copies are the
one-definition-one-import debt the header already admits.
