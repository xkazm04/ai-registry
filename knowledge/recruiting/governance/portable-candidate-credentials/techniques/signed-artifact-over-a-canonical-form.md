---
layer: technique
type: technique
subject: portable-candidate-credentials
technique: signed-artifact-over-a-canonical-form
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, say-only-what-the-record-holds]
use_when: [deciding what bytes a credential signature covers, versioning a credential format, debugging mass verification failure after a deploy]
---

# Sign an artifact over a canonical form

## The concern

A signature covers bytes. A credential is experienced as a page. Those are different
objects, and the entire integrity story of a portable credential rests on choosing the
right one to seal and never confusing them again.

The page is unstable by design: it is localised, re-laid-out, re-templated, re-branded,
regenerated on every request, and sometimes translated by a component that did not exist
when the credential was issued. Sealing it means the credential's validity is coupled to
your front-end release cadence — which produces the characteristic incident: a routine
deploy, and every credential ever issued fails verification within the hour, presenting
to the world as a mass forgery event.

The fix is structural. Seal a **canonical form** — a stated, versioned, deterministically
serialized set of claim fields — and treat every visible rendering as a derived view with
no authority of its own. This is the local reading of
[a verdict is bound to what it judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged):
the signature is bound to the exact claim payload, not to a presentation of it.

## Procedure

**1. Enumerate the claim fields, closed.** Subject identity as the credential expresses it
(a stable handle, not necessarily a name), the issuing organisation, the assessment
identity and its methodology version, the result, the moment of assessment, the moment of
issuance, the freshness policy, and the form version. Closed means: a field not on the
list is not in the seal, and adding one is a version bump, not a patch.

**2. Write the serialization rules down as a specification, not as code.** At minimum:
key ordering; how numbers are represented, including whether an integral value may carry
a fractional part; whitespace; how absent differs from empty differs from zero; text
normalisation and encoding; how nested structures and lists order. The specification
exists so a second implementation — a verifier you did not write — can reproduce the
bytes. If only your own serializer can produce them, you have not built a portable
credential; you have built a checksum.

**3. Sign the canonical bytes and store the digest with the form version and the key
generation beside it.** A signature without its form version is unverifiable the moment a
second version exists, because the verifier cannot know which rules to serialize under.
And **bind the key generation into the signed material itself**, not merely alongside it:
if the stored generation is only a lookup hint, an attacker who can write it can point a
credential at a retired or weaker key and have it verify. Bound in, swapping the
generation invalidates the signature.

**3b. Fingerprint the canonical form to detect divergence from the live record.** The
canonical form is not only a seal input; it is a cheap equality test. When a credential
already exists for an assessment and the assessment is re-scored, rebuild the form from
today's result *under the existing credential's issuance timestamp* — so only genuine
content can differ, never the clock — and compare canonical strings. Identical means
nothing changed and the existing credential stands. Different means the credential in the
candidate's hands no longer attests the current record, and the honest response is to
revoke and reissue rather than let the two silently disagree.

**4. Verify by re-deriving, never by comparing stored strings.** The verifier reads the
fields, re-serializes under the version the credential names, recomputes, compares.
Comparing a stored serialized blob to a stored digest verifies that two of your own
columns agree — a tautology that passes cheerfully over a payload someone edited through
both columns.

**5. Render only after resolution.** The presentation layer receives a resolved credential
plus its trust state, never raw payload fields. A template that can reach the payload
directly will eventually print an unverified number; a template that receives only what
resolution released cannot.

**6. Freeze old versions forever.** Every serialization version your product has ever
issued under stays implemented, tested and reachable. Retiring one retires the
verifiability of every credential sealed under it, which converts an honest historical
record into an unverifiable one — from the outside, indistinguishable from destroying
evidence.

## Decision rules

- **When a serialization detail is ambiguous, decide it explicitly and write it in the
  spec, even if the current serializer already happens to do the right thing.** Every
  mass-verification incident traces to a rule that was implied by an implementation
  rather than stated by a spec, and then changed by a dependency upgrade nobody read.
- **When you need to change how the form serializes, bump the version — always, with no
  exceptions for "cosmetic" changes.** There is no cosmetic change to a signed form.
  Sorting differently, trimming a string, omitting a null, or switching a number
  representation each invalidate the entire back catalogue.
- **When a credential's form version is one you do not recognise, that is unverifiable,
  not tampered.** An old client meeting a new credential, or a new client meeting a
  credential from a version you dropped, is your problem, not the bearer's.
- **When the same claim must appear in several languages, translate the rendering and
  never the form.** Localised strings inside the seal make the signature depend on a
  translation file, which is a rendering by another name.
- **When a field is genuinely optional, decide once whether it is absent or empty, and
  make the serializer incapable of producing the other.** Two representations of "no
  value" is a signature ambiguity waiting for a maintenance window.

## What the seal must not carry

The canonical form is a *claim*, not a dossier. Comparative rank against other
candidates, interviewer identities, internal notes, rejection reasoning and raw
transcripts do not belong in a payload the bearer may hand to a rival employer. Two
independent reasons: the artifact is theirs to disclose and they cannot meaningfully
consent to material they never saw; and per
[say only what the record holds](../../../_laws.md#say-only-what-the-record-holds), a
credential that ships internal reasoning invites the reader to treat that reasoning as
attested, when the signature attests only that it was in the envelope.

Where a credential must reference something bulky — a work sample, a recording, an
artifact the candidate produced — seal a stable reference and a digest of the referenced
object rather than the object. The reference stays checkable; the payload stays small
enough for a stranger's phone to verify without a round trip you might not be able to
serve.

## When not to use this

- **Not for the employer's own audit chain.** That record has a different owner, a
  different reader and different contents, and the audit discipline owns its sealing
  rules. Sharing a serializer between them is fine; sharing a *format* couples an
  internal schema to a public artifact and guarantees that an internal field addition
  becomes a public disclosure.
- **Not where there is nothing worth attesting.** A canonical form over a result that
  carries no substance is a sealed empty envelope — a different failure with its own
  treatment.
- **Not as a substitute for stating the integrity rung you are on.** A signature raises
  what you can claim; it does not exempt you from saying who holds the key, whether the
  holder is the same party that writes the records, and what that combination does and
  does not prevent.
