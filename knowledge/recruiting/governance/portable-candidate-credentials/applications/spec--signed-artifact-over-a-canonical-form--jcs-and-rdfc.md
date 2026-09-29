---
layer: application
type: application
subject: portable-candidate-credentials
technique: signed-artifact-over-a-canonical-form
stack: spec
status: forged
verified_on: 2026-09-29
source: rfc-editor/rfc8785 + W3C/rdf-canon@1.0
---

# Two published canonicalisations, and what each does when its output has to change

## The pin

RFC 8785, *JSON Canonicalization Scheme (JCS)*, section 3.2.2, and W3C *RDF Dataset
Canonicalization* (RDFC-1.0), both fetched as text and read on 2026-09-29. The technique tells
a team to write its own serialization rules and never change them under a version. These are
the two schemes a team is most likely to borrow instead, and they show how the same
discipline holds, or leans on someone else, when it is borrowed.

## What each says

- **JCS delegates its number stability to another standard, and says who decides if that
  moves.** Its number serialization follows ECMAScript's: "In the (unlikely) event that a
  future version of ECMAScript would invalidate any of the following serialization methods, it
  will be up to the developer community to either stick to this specification or create a new
  specification." A JCS-signed credential is therefore frozen only as long as nobody
  chooses otherwise.
- **RDFC changed its output once and renamed itself for it.** Of the step from the earlier
  URDNA2015 to RDFC-1.0: "The minor change is in the canonical n-quads form where some
  control characters were previously represented without escaping." The scheme that
  differs in any byte got a new name. The same document says an implementation that must
  reproduce output "is expected to unequivocally express or communicate the internal hash
  algorithm that was used", which is the digest half of a version.

## What transfers

- **The rule holds, and the standards are the evidence for it.** The only change either
  scheme has made or contemplated to its output is handled by a new name, never an edit under
  the old one. That is the contract the technique asks of a product: a new version string for
  any byte that could differ.
- **Borrowing does not remove the version.** A credential should name the canonicalisation
  scheme and the digest algorithm it was sealed under, because the scheme's own maintainers say
  the answer can change and give the credential's issuer no vote. The version is the place the
  dependency is pinned.
- **A lone surrogate is an error, not a normalisation.** JCS requires an implementation to
  terminate with an error on one; a product that silently repairs candidate-supplied text
  before signing has diverged from the scheme it claims to use.

## What was not evaluated

Neither scheme was run against a candidate-credential payload, and no interoperability test
between implementations was done. Whether a real ECMAScript change to number serialization is
pending was not checked.
