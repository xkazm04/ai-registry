---
layer: technique
type: technique
subject: agent-session-archive
technique: queryable-surface-redaction
status: forged
laws: []
shared_with: []
use_when: [deciding where secrets are removed in an archive of agent sessions, choosing which secret detectors run at ingest and which before sharing, a team declines to redact session content read into a prompt, deciding whether to keep tool inputs and outputs from transcripts]
---

# Queryable-surface redaction

Redact where archived content becomes **queryable and re-served**: the stored
rows, the search index, search output, context packs and exports. Do not
redact where it rests. Put only high-precision credential-shape rules on the
irreversible ingest stage, put the noisy, recall-oriented scanners on the
reversible pre-share stage, and declare the verbatim capture sensitive at rest.

## The force is amplification

Agent transcripts carry secrets as a matter of course: a key pasted into a
prompt, an environment dump in a tool result, a connection string in a failing
command's output. In the source file that secret sits in one place, read by
nobody. Once indexed, it is retrievable by any query that touches a nearby
word, served to every later caller, person or agent, copied into every pack
that includes the conversation, and carried into every export. The index is
what turns a secret that was written once into one that is read indefinitely.
That is why the control sits at the index and not at the file.

Where the secrets sit is measurable, and worth measuring before choosing a
design. One installation scanned 5,385 transcripts from two weeks (4.44 GB)
with 22 precise credential-shape patterns and a filter for placeholders: 66
transcripts (1.2%) held plausible live credentials, 72 distinct values, and
almost all of them sat in **tool inputs and outputs**: environment
assignments, private keys, source-host and payment tokens, connection
strings, signed tokens. Only four files had any credential in the text turns
a person or a model wrote. An archive that keeps tool records, verbatim or in
its index, keeps exactly the part of the transcript where the credentials are.

## The asymmetry inverts the outbound rule

Redaction at an outbound boundary, where data is about to leave for a service
somebody else operates, fails toward destroying data, because a forwarded
secret can never be recalled. In an archive the permanent mistake is on the
other side. Once upstream deletes the transcript, the normalized rows are the
record, and a value redacted at ingest is gone from every queryable surface
for good. A detector that fires on a commit hash, a content digest or a
generated identifier, all of which fill agent transcripts, destroys exactly the
strings people search an archive of coding sessions for.

So the stages are assigned by reversibility:

- **Ingest, irreversible: precision.** Known credential shapes with
  distinctive prefixes and fixed lengths, and a walk over structured metadata
  that redacts values by the semantics of their key: normalized spellings of a
  closed list of credential key names, matched exactly. Substring matching on
  key names catches ordinary words that happen to contain "key" or "token",
  and every such false positive deletes a field. No entropy heuristics here.
- **Pre-share, reversible: recall.** Entropy thresholds, allow and deny lists,
  and context rules run where content leaves the archive for another person,
  such as an export or a shared page. A false positive there costs a reviewer
  a look; a false negative is caught by the next rule. The two stages share
  their pattern definitions, so the ingest set is a strict subset of the
  pre-share set and never drifts from it.
- **At rest: declared, not redacted.** The verbatim capture keeps the secret,
  because a capture that is edited cannot re-derive anything. State this in
  the archive's privacy summary: the captures hold the same raw text as the
  harness's own files, on the same disk, and are protected by file access
  rather than by redaction. On the measured corpus this clause is not
  hypothetical: the captures hold every tool record, so they hold every
  credential in it.

## Exclusions hold at every stage or at none

An operator who excludes a project or a session expects it to be absent from
everything the archive serves. An exclusion honoured at capture and not at the
index leaves the session searchable while the run reports success; one honoured
at the index and not at capture leaves its bytes in the capture store. Enforce
exclusions at the single ingest chokepoint and again at the capture boundary,
and test both with one planted session.

## Caches inherit the pattern set

Redaction runs on every message, so it is cached, and the cache is a
derivation of the pattern set. Fold a fingerprint of the patterns into every
cache key and into the skip ledger that decides which sources are re-read. A
tightened or added pattern then invalidates prior results and re-derives
affected rows by construction, instead of leaving content redacted under the
old rules indefinitely. If redaction can be switched off, rows record which
mode produced them, so a later switch back on knows what to redo.

Performance is a real force at this stage and is worth measuring rather than
guessing: a combined first pass that lets clean text skip every replacement is
the large win, and a pattern construct that pushes the matcher onto its slow
path can cost an order of magnitude in throughput on real transcripts.

## Scope and custody decide whether this applies

Consent to read a session is not the discriminator. Two properties are:
**what the read extracts**, and **whether the result is stored and
re-served**. On the measured corpus above, a consumer that read only the last
eight text turns of each session, each cut at 500 characters, into a prompt
the consumer itself did not store exposed no credential in 5,383 windows, and
redacting before the cut changed nothing; declining to redact there was
right, and measurably so. The same consumer starts to matter the moment
either property moves: a longer cut exposed two credentials in four windows,
and including tool records would have reached all 66 files. So a team that
declines to redact states its extraction scope as the reason, and re-measures
when the scope widens. And the moment any read is stored, indexed or shared,
it is an archive, and this technique applies whatever was consented to. Content
composed from sessions, such as a lesson or a summary written by a model, is a
different problem again, because there is no string left to match; the
engineering neighbour that bounds reads rather than output owns it.

## The gap to close before trusting it

Redaction speed is easy to measure and usually is. Recall is the number that
matters and is usually never measured. Before trusting an ingest redactor,
build a labelled set from realistic transcripts: planted credentials in every
shape the rules claim, in message text, tool output and structured metadata,
plus a negative set dense with hashes and generated ids. Measure recall on the
first and the false-positive rate on the second, assert absence on the
serialized output of every queryable surface rather than on an in-memory
value, and re-run the set whenever a pattern changes.

## When not to use it

Data leaving the installation for a hosted service is the outbound
redaction neighbour's problem, with its inverted failure direction. An archive
that is never searched or shared, only replayed by its owner from the
captures, has no queryable surface to protect; it still owes the at-rest
declaration.
