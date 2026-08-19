---
layer: technique
type: technique
subject: organizational-grant-readiness
technique: applicant-evidence-corpus
status: forged
laws: [untrusted-text-is-data, never-fabricate-a-figure]
shared_with: []
use_when: [letting applicants supply websites or documents as extra context for matching and drafting, bounding and sanitizing user-supplied material before it reaches a prompt, deciding whether to store uploaded files or extracted text]
---

# Applicant evidence corpus

The technique gives matching and drafting layers more to reason about than a
keyword line, by letting the organization supply its own materials — its
website, an about document, a capabilities statement — as a curated corpus of
**sanitized plain text with provenance**, never as stored files. The design
choice that everything else follows from: original bytes are converted to
text at the ingest boundary and then discarded. No binary blobs in storage
means no file-serving surface, no malware-scanning obligation, no
decompression bombs at rest, and material that is already in the cheapest
form a model consumes.

## Procedure

1. **Ingest through two doors, both funneling to text.** A URL is fetched
   and reduced to readable text; an uploaded document is decoded by
   extension — chosen from a short allowlist, never from the client-declared
   media type, which is trivially spoofable — and reduced the same way. Both
   doors emit the same record: kind, display label, source location (for
   URLs), the sanitized text, and its length.
2. **Bound every axis, at the boundary, before storage.** Raw upload size is
   rejected early, before extraction spends anything. Extracted text is
   truncated per item; the organization's combined corpus is capped in total
   characters and in item count. Archive-based formats get a per-entry
   inflation ceiling — the decompression-bomb guard — and URL fetches get a
   streamed byte cap, a timeout, and a bounded redirect budget with every
   hop re-validated against the private-address guard. Each limit defends a
   specific exhaustion or intrusion path; none is negotiable from the
   client.
3. **Treat the fetch path as an attack surface.** The URL door is a server
   making requests chosen by a user: block private and internal address
   ranges, re-check after every redirect, and never surface raw fetch
   errors that would let the feature be used as a port scanner.
4. **Assemble prompt context as a bounded, delimited, untrusted block.**
   At use time, concatenate items — most recent first — into a single blob
   capped well below the storage cap, with each item's provenance header.
   Inject it into prompts explicitly framed as untrusted data: nothing
   inside it may change the task, the score, or the output format. The
   corpus grounds claims about the organization; it holds no authority over
   the pipeline reading it.
5. **Key derived computations on the corpus.** Any cached analysis that
   read the evidence must include it (or a digest of it) in its cache key,
   so adding or removing material recomputes rather than serving
   conclusions grounded in evidence that is gone.

## The revealed-interest loop

Evidence the organization *does* is as telling as evidence it writes. The
funding opportunities it actually pursues encode its real interests, and
mining them — tokenize pursued-opportunity titles, drop domain boilerplate
("program", "fund", "initiative") and terms already in the profile, rank by
recurrence across drafts rather than raw frequency — yields candidate
mission keywords the profile's authors never thought to type. Two rules
keep the loop honest: candidates enter through an accept/reject rail, never
as silent profile edits, because the profile is the organization's claim
about itself; and recurrence across independent pursuits outranks repetition
within one, because one verbose title is not a pattern.

## Decision rules

- **When tempted to keep original files "in case we need them", keep only
  text and the source URL, because** the source remains re-fetchable, and
  every stored blob is a standing liability that the text is not.
- **When an item exceeds its truncation cap, truncate and record the fact
  visibly, because** silent truncation makes the model's ignorance of a
  document's second half look like the document's fault.
- **When the corpus exceeds the prompt budget, drop whole items from the
  old end rather than shaving all items thinner, because** a coherent
  recent document grounds better than fragments of everything.
- **When a figure in the corpus contradicts a profile field, the profile
  wins in generated output, because** the profile is confirmed and sourced;
  the corpus is context. Surface the contradiction to the applicant rather
  than letting a model pick.

## When not to use

Do not route materials that must be submitted verbatim (audited financial
statements, signed governance documents) through this pipeline — those are
attachments, where preserving original bytes is the entire requirement, and
they carry their own handling regime. And do not let the corpus substitute
for the structured profile: prose about the organization cannot pass an
eligibility gate, and a system that extracts registry facts from uploaded
prose has reinvented autofill without its provenance discipline.
