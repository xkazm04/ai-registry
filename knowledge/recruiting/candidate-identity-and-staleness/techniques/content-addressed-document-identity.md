---
layer: technique
type: technique
subject: candidate-identity-and-staleness
technique: content-addressed-document-identity
status: forged
laws: [meaning-does-not-live-in-a-label, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [keying a store of candidate documents or analyses, deciding whether two uploads are the same artifact, designing a cache key for an expensive per-document analysis]
---

# Content-addressed document identity

The identity of a submitted document is the identity of its bytes. Compute a
cryptographic digest over the exact content received, and that digest is the
document's name inside your system: stable across re-uploads, independent of
what anyone called the file, independent of which opening it arrived against,
and identical for two people who submit the same artifact because it genuinely
is the same artifact.

This is the one identity question in the whole subject that has an exact
answer. Take it, and stop pretending the other two do.

## The procedure

1. **Hash what you received, before you touch it.** The digest is over the raw
   submitted bytes, taken at intake, before conversion, before text extraction,
   before normalisation. Anything you do to the document afterwards is a
   derivation, and derivations have their own identities.
2. **Store the digest as a first-class field**, not as a derived value
   recomputed on demand. It is the join key for everything downstream.
3. **Keep the display label separately, and mark it as display.** People need
   to recognise their own uploads and recruiters need to see what was sent. The
   label is rendered; it is never compared.
4. **Derive analysis keys from the digest, never from the label or the record
   identifier.** A stored analysis is about a document, and it should be
   findable from any record that holds that document.
5. **Re-uploads are recognised, not duplicated.** The same digest arriving
   again is the same artifact: record the new submission event, reuse the
   stored derivation, do not re-analyse and do not create a second document.

## What it gives you, exactly

- **Deduplication that is correct rather than probable.** Equal digest means
  equal content; there is no threshold and no false-positive rate to tune.
- **Free reuse of expensive work.** An extraction or an analysis performed once
  for a document is valid for every record referencing it, which is where the
  cost saving lives and, more importantly, where *consistency* lives: the same
  document cannot yield two different readings in two places.
- **A footprint.** Every record holding this digest is a place this artifact
  appears, which is the raw material for cross-role linking.
- **An honest binding for verdicts.** A judgment stamped with the digest of
  what it judged can never be silently re-pointed at different content —
  [a verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged).
  A replaced document produces a new digest and therefore visibly has no
  verdict, rather than inheriting the old one.

## What it does not give you

State these out loud, because content addressing feels more powerful than it
is and teams over-extend it.

- **It is not person identity.** Two digests can be the same person; one digest
  can be two people (a shared template, a family address book, an agency
  submitting a reformatted file). Never treat digest equality as proof of a
  human match; treat it as strong evidence to be combined with others.
- **It is not version identity.** A person who fixes a typo and re-uploads has
  produced a completely unrelated digest. Content addressing gives you exact
  equality and no similarity at all — there is no notion of "nearly the same
  document" in a hash. If you need document lineage, model it explicitly as a
  supersede link on the record.
- **It is not stability across your own processing.** If you re-encode,
  normalise line endings, or strip metadata before hashing, the digest changes
  with your pipeline version and every stored key silently orphans. Hash the
  original bytes and hash them once.
- **It does not survive anonymisation, and must not.** A digest is a strong
  re-identifier: it links an erased record back to a live one holding the same
  file. Anonymisation therefore destroys the digest along with everything else,
  and no lookup may resurrect the link.

## Decision rules

- Hash raw intake bytes; never hash extracted text as the primary identity, and
  never hash a rendered or converted form.
- Key stored analyses on the digest **composed with** the other things that
  changed the answer — the requirement version, the instrument version, the
  assessment mode, the output language. The digest alone identifies the
  document, not the judgment.
- Compose that key by committing each field's **length before its bytes**, in a
  fixed order. A key joined with separators is ambiguous whenever a field's
  content can contain the separator, and the resulting collision serves one
  person's analysis for another's.
- When the digest cannot be computed (a streaming intake, a broken upload),
  **fail the intake or mark the document unidentified** — never fall back to a
  label-derived key, which is the exact failure this technique removes, and
  never to a shared constant. The safe fallback is a unique key that misses.
- Truncating the digest for readability is fine for display and never for
  comparison.
- Treat digest collision as an operational impossibility but treat *content*
  collision as routine: identical templates, boilerplate cover letters and
  agency-reformatted files legitimately produce identical bytes, and the
  system's answer should be "one artifact, several submissions", not "one
  person".

## When not to use it

Do not content-address things people expect to edit in place. A live
recruiter-maintained profile, a notes field, a structured record under
continuous human revision — these have mutable identity by design, and giving
them content-derived keys means every keystroke creates a new object and breaks
every reference to the old one. Content addressing is for immutable submitted
artifacts.

Do not use it as the primary key for the *candidate* entity. The candidate
outlives any particular document, and a person whose only document is deleted
must not cease to exist.

And do not reach for it when the population is small enough that a proper
identifier already exists. If every submission arrives through an authenticated
account or a single-use invitation, that identifier is stronger, more
meaningful, and survives the person replacing their document. Content
addressing is the answer for artifacts arriving without a trustworthy
identifier attached — which, in practice, is most of them.
