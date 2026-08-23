---
layer: application
type: application
subject: portable-hiring-records
technique: versioned-record-envelope
stack: spec
status: forged
verified_on: 2026-08-23
source: W3C/vc-data-model@2.0
---

# The envelope as an interchange standard writes it

## The pin

World Wide Web Consortium, *Verifiable Credentials Data Model v2.0*, W3C Recommendation of 15 May 2025,
dated edition `https://www.w3.org/TR/2025/REC-vc-data-model-2.0-20250515/`, retrieved 2026-08-23;
section numbers are that edition's. The normative base context at `https://www.w3.org/ns/credentials/v2`,
fetched the same day, has SHA-256 `59955ced6697d61e03f2b2556febe5308ab16842846f5b586d7f1f7adec92734` —
byte-identical to the digest published in §B.1; the sentinel context at `.../credentials/undefined-terms/v2`,
same day, `82dab514ba44eb18f5d1b0f638c5e140c6a556fbfb5089601bdc0fa5eb8b2581`. A verifiable credential is
not a hiring record, but it is a record shape an integration exchanges, versioned and validated at the
boundary — which is this technique.

## The five envelope fields, against the standard

| technique field | what VCDM 2.0 holds |
| --- | --- |
| schema version | **Required and positional.** §4.3 makes `@context` mandatory and requires an ordered set whose *first* item is the base context URL. |
| producer | **Required as authority, not as build.** §4.7 requires `issuer`, a URL or an object with a URL `id`. Nothing names the emitting build. |
| produced at | **Not required.** §4.9 makes `validFrom` and `validUntil` optional and defines them as validity bounds, not production instants. |
| scope | Not at envelope level; nearest are `credentialSubject` (§4.8) and `credentialSchema` (§4.11). |
| counts | Not modelled. VCDM envelopes one credential; the multi-record analogue is a verifiable presentation (§4.13). |

The last two are bulk-export fields, and the technique already says the envelope collapses for a single
record over a live boundary — their absence is the spec's scope, not a gap.

## The decision rules, one by one

**Refuse a version you do not understand.** §4.3's first-item rule is an exact match, not a range check,
so an unrecognised envelope version is not a document to parse partially — it is not a conforming
document at all (§1.3 defines conformance as compliance with the relevant MUST clauses of §4, §5 and §6).
§7.1's verification algorithm makes the consequence concrete: a non-conforming result has its `document`
removed from the returned map and at least one `MALFORMED_VALUE_ERROR` (§7.2) added. Confirmed, and
sharper than the technique: the version is an ordered *vector*, not a scalar, because extension contexts
compose after the base one and §4.3 makes their order normative. §4.3 also creates no legacy lane — a
document with no `@context`, or a different first entry, is simply outside the specification, so
"unversioned" and "version one" cannot be confused by construction.

**Migrate forward through a named, declared step.** §5.11 imposes three MUSTs on anyone
documenting a transformation into the model: state whether it is one-way or round-trippable,
preserve the `@context` values across a round trip, and produce a conforming document (a
test suite is a SHOULD). The technique asks for a named function per version step; the
standard asks for something the technique does not — that the function's *direction* be
declared, because a one-way migration used as a round trip is how a re-import asserts what
the export never said.

**Never re-mean a field in place.** The base context sets JSON-LD `@protected` (§6.1), which the spec
relies on to keep its own terms from being overridden; §5.2 notes that a context redefining a term makes
a compliant processor error, and that the only route to new meaning is a new term. §5.10 pre-reserves two
extension points (`confidenceMethod`, `renderMethod`) as explicitly experimental, with implementers
warned their meanings may change. The technique's discipline is here as a *format property*, not a rule
someone must remember.

**Mark the unknown as unknown.** The sharpest confirmation in the document, and not where the hint
expected it. §5.2's Semantic Interoperability subsection carries a MUST: a conforming document using
terms its contexts do not define must append `https://www.w3.org/ns/credentials/undefined-terms/v2` as
the **last** value of `@context`. The fetched sentinel is five lines and does one thing — sets `@vocab`
to a namespace whose final path segment is literally `undefined-term`. An unrecognised member is
therefore neither refused nor guessed nor dropped: it is admitted, and the envelope must *declare that it
carries unrecognised members*. The same subsection advises against `@vocab` in production, and §6.1 gives
the reason in a clause — any `@vocab` disables undefined-term error reporting. This is the technique's
"mark it explicitly unknown, never a plausible default", raised to vocabulary level.

**Keep derived state from re-entering as input.** §5.12 encapsulates each credential in its
own graph so data from two is not co-mingled, and warns against merging similar-looking
objects carrying no global `id` — the technique's re-imported verdict, one layer down.

## Findings

1. **Open-world, but not silently so.** The hint proposed the technique assumes closed-world
   validation where VCDM is open-world. §5.2 does name the open world assumption in those
   words — but the closed-world half is normative in two places the hint did not name:
   §5.2's sentinel-context MUST, which forces an open document to declare its openness, and
   §4.11's `credentialSchema`, whose value must carry a `type` and a URL `id` and exists to
   bind a record to a published schema. The technique's rule survives intact.
2. **The producer field splits under a standard that signs its records.** VCDM requires the
   issuing authority and does not model the emitting build; the technique's reason for
   `producer` — routing a malformed file back to the code that made it — is an operational
   need a signature does not serve.
3. **A required production timestamp is a real difference.** Scoped negative claim: §4.2's
   property list, §4.9, §5.8 and the §E revision history define no mandatory production
   instant, and §E records only that `validFrom` was made optional, with no stated reason.
   §A.5 still carries the heading *Issuance Date* while discussing `validFrom`, and the base
   context defines no `issuanceDate` term — 1.1's property is gone from the term set, not
   deprecated in place. Spec's scope (a signature carries its own creation time); a hiring
   integration keeping archives has the technique's need and not the standard's.
4. **Refusal is normative only for the first entry.** Scoped negative claim: §4.3, §5.2,
   §6.1, §6.3 and §7.1 state no clause requiring a verifier to refuse a document carrying a
   *later* context URL it does not recognise. §4.3 puts that obligation on the application
   developer; §6.3, marked non-normative, describes the profile that accepts only context
   values known ahead of time and checks them against known-good hashes. §B.4 says what the
   gap costs: a term outside the resolved context can lead to claims being dropped, or to
   errors, and both paths exist in deployed implementations. The technique's blanket refusal
   is stricter than the standard's conformance language, and is right to be.

## Executed evidence

Two runs, kept in `oss-mastery/worker-portable-hiring-records/`. Of the two options this is the
worked-procedure one, plus the one command the specification prescribes itself; no runnable official W3C
document validator ships with the Recommendation — the implementation report linked from its header
points at a suite that drives implementations under test.

**1. The standard's own prescribed command.** §B.1 publishes the base context's SHA-256 and
the shell pipeline to confirm it; run verbatim on 2026-08-23 it returned the published
value, matched.

**2. A worked clause procedure over seven fixtures.** One minimal conformant credential and six variants,
each checked against the enumerated MUSTs of §4.3, §4.4, §4.5, §4.7, §4.8, §4.9 and §5.2, with the
defined-term set read out of the digest-matched context file rather than typed by hand. The minimal
fixture passes. A first `@context` entry that is not the base URL fails §4.3; a missing
`credentialSubject` fails §4.8; `validFrom` as a JSON number fails §4.9; a hiring term (`pipelineStage`)
with no sentinel context fails §5.2; the same document with the sentinel appended passes. A 1.1-shaped
document carrying the 2018 context and `issuanceDate` fails at §4.3 and never reaches the rest — the
refusal above, executed.

Three limits, stated: the checker is mine, encoding the spec's clauses, not a publisher artifact; it
flattens JSON-LD term scoping into one set, which changes no verdict here but would matter for a term
defined only inside a nested scope; and securing (§1.3, §4.12) is out of band, so every fixture is at
most a conforming *credential*, never a conforming *document*.
