---
layer: golden-path
type: golden-path
subject: candidate-identity-and-staleness
status: forged
use_when: [deciding whether two candidate records are the same person, showing a stored assessment that may no longer be current, keying a cache or a saved analysis, re-running an analysis over a record a recruiter has edited, designing duplicate handling on re-application]
techniques:
  - content-addressed-document-identity
  - label-collision-detection
  - cross-role-footprint-linking
  - requirement-edited-since-scored
  - rebuild-overwrites-manual-edits-warning
  - retired-outranks-stale-status-precedence
---

# Candidate identity and staleness

Everything a hiring system knows about a person is held as a stored judgment
attached to a record. Two questions decide whether any of it is usable, and
they are different questions:

- **Identity** — is this record about the same person as that record?
- **Staleness** — does this judgment still describe that person?

Almost every serious failure in this area comes from answering one and
believing you have answered both. An assessment can be attached with total
confidence to exactly the right human being and still be worthless, because
the role it was scored against has been rewritten twice since. A perfectly
fresh reading, computed this morning, can be worthless because it was filed
against the wrong person. Keep them separate in your head, in your data model,
and in your interface, and most of this subject becomes mechanical.

The subject is the discipline of holding both answers explicitly: what
identity is keyed on, what identity is *not* keyed on, when a stored judgment
stops speaking for the present, what the system does about it, and what it is
forbidden to do about it.

## Identity is three questions wearing one word

"Same candidate" is used to mean three different things, and they have
different difficulties and different correct answers.

**Artifact identity** — is this the same document? This one is exactly
solvable. Hash the bytes of what was submitted and you have an identifier that
is stable, collision-free for practical purposes, and independent of what
anyone chose to call the file. Two submissions with the same content hash are
the same artifact, everywhere, forever, with no heuristics involved. See
[content-addressed-document-identity](techniques/content-addressed-document-identity.md).

**Application identity** — is this the same submission to the same opening?
Solvable, if the record carries a stable key: an account, a verified contact
address, an invitation token. Not solvable from display fields.

**Person identity** — is this the same human being? Never exactly solvable, in
any system, at any budget. People hold several addresses, change their names,
apply from a personal address and then a work one, transliterate differently
across systems. Person identity is a probabilistic join over the strongest
signals available, and it must be modelled, surfaced and defaulted as such.

The engineering mistake is to solve the easy question and let the answer
masquerade as the hard one. The human mistake is the reverse: to treat person
identity as obvious because a recruiter can see it is obvious for the record in
front of them, and to key the system on whatever field made it obvious.

## Nothing a human typed is an identity

The single most reliable source of identity bugs is a display label used as a
key. A file name, a display name, an uploaded title, a header line from the
document itself: all of these are chosen by a person, chosen for legibility,
and chosen without knowing they will be compared to other people's choices.

The concrete failure is mundane and extremely common. A large fraction of the
world names its application document with a generic word — the local word for
"CV", or "resume", or "application", or their own first name. So a system keyed
on that label will, within a few hundred applications, hold two entirely
different people under one identifier. Whichever record was written second
either overwrites the first, or is silently discarded as a duplicate, or —
worst — is *merged* with it, producing a composite person with one candidate's
employment history and another's education, scored as though they were real.
Nobody notices, because the composite is plausible: it is made of true facts,
just not about the same human.

This is [meaning does not live in a
label](../_laws.md#meaning-does-not-live-in-a-label) in its most literal form.
The label is not a weak identifier; it is not an identifier at all. It may be
*displayed*, because humans need to recognise their own uploads. It must never
be *compared*. And a system that has already been keyed on labels needs a
detector, not just a fix, because the composites it created are already in the
data and will not announce themselves. See
[label-collision-detection](techniques/label-collision-detection.md).

## Identity linking earns its keep in the footprint

Content addressing pays for itself the moment it lets you ask a question no
label-keyed store can answer: *where else does this document appear?* One
person applies to four openings; a sourcer imports the same file into another
pool; a recruiter re-uploads a document a colleague already analysed. These
collapse into one footprint, and the footprint turns a per-role record into a
picture of a relationship — how many roles this person has been considered for,
what was concluded each time, whether the organisation has been repeatedly
interested and repeatedly silent.

That footprint has a cost paid deliberately. Linking across openings crosses
boundaries other parts of the process maintain on purpose: a blind screen, a
separate legal entity, a candidate who applied twice expecting independent
consideration. The rule is that a footprint is *visible to the people entitled
to see all of it*, and that crossing a redaction boundary is a decision with a
name on it, never a side effect of a join. See
[cross-role-footprint-linking](techniques/cross-role-footprint-linking.md).

## An assessment goes stale for three reasons, and only one is yours

This distinction is the most useful thing in the subject, because the three
causes have different detection methods, different remedies, and very different
politics.

**The person changed.** They shipped a year of work, finished a degree,
switched fields. Your record is accurate about a person who no longer exists in
that form. You cannot detect this — nothing in your system observes it — so it
is handled by an age horizon and by re-reading the current document, never by a
freshness flag. Treat elapsed time as a prompt to re-ask, not as a verdict.

**The requirement changed.** The opening was rewritten: a must-have added,
seniority raised, a language dropped. The score computed before that edit was
computed against a brief that no longer exists. This one you *can* detect
exactly, by comparing when the score was computed against when the requisition
was last edited, and it is the most commonly missed. The important subtlety:
the candidate did not change at all. Nothing about them is less true. The
verdict is stale, the evidence is not. See
[requirement-edited-since-scored](techniques/requirement-edited-since-scored.md).

**The instrument changed.** You re-tuned the weights, upgraded the extraction
model, revised the rubric, changed the prompt. Old outputs and new outputs are
no longer commensurable, and a cohort holding both vintages is ranked partly by
processing date. This is the only one of the three entirely under your control,
which means it is the only one you are fully accountable for — and the only one
where you know the exact moment the boundary was crossed, because you caused
it. Version the instrument, stamp the version onto every output, and refuse to
compare across a boundary. [A verdict is bound to what it
judged](../_laws.md#a-verdict-is-bound-to-what-it-judged) covers the rubric half
of this; the weighting half belongs to the neighbouring practice of evidence
provenance weighting, which owns re-baselining, and this subject does not
re-teach it.

Naming which of the three has occurred is not pedantry — it determines what the
recruiter should do. Person-drift means *ask them*. Requirement-drift means
*re-score* — cheap, mechanical, no candidate contact needed. Instrument-drift
means *re-score everyone or compare nobody*.

## Staleness informs; it never blocks

The strongest rule in the subject, and the one that gets argued about: a stale
assessment is shown, labelled, and left usable. It does not disappear, it does
not grey out the action, it does not gate the advance.

The reasoning is asymmetric in exactly the way this domain always is. A stale
score that is displayed with its age is a recruiter reading slightly old
information — recoverable, and they can see the risk. A stale score that blocks
means a candidate sits unreviewed because an internal timestamp moved, which is
[a candidate's process never stalls on your
constraints](../_laws.md#a-candidates-process-never-stalls-on-your-constraints).
The requirement moved; the person did nothing. Charging them for your edit is
indefensible, and it is exactly the failure mode where a recruiter under time
pressure quietly stops using the tool.

So staleness is a *badge*, and the badge does three jobs: it says the judgment
is old, it says *why* it is old (which of the three causes), and it offers the
remedy — a re-run, one click, with the outcome of the re-run clearly not
predetermined. What a badge may never do is imply a conclusion about the
person. "Scored before the requirements were last edited" is a fact about your
record. "May no longer be a fit" is a claim about a human that nothing in the
record supports — [say only what the record
holds](../_laws.md#say-only-what-the-record-holds).

## A stale thing and a dead thing are not the same thing

Records carry many status-ish facts at once: this analysis is superseded by a
newer one, this document was replaced, this requisition is on hold, this
candidate withdrew, this record was retired, this person's data was anonymised.
Render them naively and they fight — a badge row showing "stale" next to
"withdrawn" invites a recruiter to conclude that a re-run will fix it.

The resolution is a strict precedence, decided once and applied everywhere:
**terminal states outrank advisory ones.** Retired, withdrawn, erased,
anonymised, do-not-approach — these are facts that end the record's usefulness,
and they must be the state the reader sees. Staleness is advisory: it modifies
a live record and is meaningless on a dead one. A retired record that is *also*
stale is retired; the staleness is not worth a pixel, because there is no
remedy behind it. See
[retired-outranks-stale-status-precedence](techniques/retired-outranks-stale-status-precedence.md).

The extreme case belongs to a neighbour and is worth naming precisely.
Anonymisation is a **terminal identity state**: the deliberate destruction of
the link between a record and a human. It is not a status among statuses and it
is never something an identity join may reason around — a footprint that
reassembles an anonymised person from their other records has reconstructed
exactly what the erasure was performed to remove. The lawful basis, the clocks,
and what survives an erasure are owned by the consent-and-retention discipline;
what this subject owes it is one hard rule — **no identity linkage crosses an
anonymisation boundary, in any direction, for any purpose.**

## A recomputation is a destructive act on someone else's work

Re-running an analysis feels like a refresh. It is not. Between the original
run and the re-run, humans have been working on that record: a recruiter
corrected a mangled job title, removed a hallucinated employer, added a note
that the "gap" was parental leave, fixed a mis-parsed date.

A rebuild that regenerates from the source document discards all of it, and
what makes this genuinely dangerous is that the destroyed content was the
*most* reliable content in the record — a human's correction of a machine's
error, replaced by the machine's error. The recruiter frequently does not
notice for weeks, and when they do, they stop trusting corrections generally,
which is much more expensive than the original mistake.

Three rules, in order of preference. **Preserve where the shape allows it** —
an edit flagged as human-authored survives a machine regeneration by default.
**Warn before**, naming what will be overwritten rather than warning
generically. **Never silently**: if the system cannot tell which fields a human
touched, that is a modelling gap to fix, not a licence to overwrite. See
[rebuild-overwrites-manual-edits-warning](techniques/rebuild-overwrites-manual-edits-warning.md).

This is also where [every decision names its
actor](../_laws.md#every-decision-names-its-actor) becomes load-bearing rather
than ceremonial: you cannot protect human edits from machine regeneration
unless the record knows which fields a human authored.

## Cache keys are identity claims, and a wrong one is a fairness bug

Any expensive analysis gets cached, and a cache key is a formal assertion:
*everything that could change this answer is in this key.* Get it wrong and the
system serves one person's judgment for another's question. In hiring that is
not a performance bug, it is a wrong statement about a human being.

The key must compose every input that changes the meaning of the output: the
content of the document, the identity and version of the requirement it is
scored against, the version of the instrument, the language the output is
written in, and — the one teams miss — the *mode* of the assessment. A blind,
redacted reading of a document and a non-blind reading of the same document are
two different judgments produced for two different purposes, and a key that
omits the mode will serve the non-blind answer into the blind surface. The
redaction then exists in the interface and nowhere else, which is worse than
not having it, because everyone believes it worked.

Three disciplines keep this honest.

**Compose keys in one place**, so a new call site cannot omit a component, and
so the producer and the consumer of a cached answer cannot derive different
strings for the same request.

**Frame the fields.** A key built by concatenating values with separators is
ambiguous: content that happens to contain the separator shifts bytes across a
field boundary, and two genuinely different inputs hash to one key — which in
this domain means serving one candidate's analysis for another's. Commit each
field's length before its bytes, fix the field order, and the input-to-key
mapping becomes unambiguous. This is a real defect, not a theoretical one, and
it is invisible until the day it is not.

**When an identity component cannot be read, do not key on a default.** The
correct fallback is a *guaranteed-unique* key — miss the cache, do the work
again — never a shared constant. A shared fallback key is a machine for handing
one person's judgment to another, and it fires precisely on the records whose
identity was already weakest.

The general engineering of caches — stores, eviction, invalidation, tenancy,
key namespacing — is the province of general software practice, and the
operator-side concerns around model calls belong to language-model
observability. What this subject owns is the hiring judgment inside the key:
which differences are *material* to a statement about a person.

One materiality question is explicitly a neighbour's. When the unit of
assessment is a *set* of candidates rather than one, the composition of the set
is part of the identity of the answer: adding one person to a shortlist makes
every comparative statement a different statement, so the key carries a
fingerprint of the pool and a changed pool is a materially different decision
rather than a cache miss to be optimised away. That belongs to comparative
shortlist evaluation; this subject cites the boundary and stops there.

## Re-application merges, it does not drop

When a known person applies again, three behaviours are available and only one
is correct. Rejecting the submission as a duplicate tells a candidate their
application failed, and keeps their newer, better document out of the process.
Creating a second unlinked record fragments the footprint and splits consent
state across records. The correct behaviour is to merge onto the existing
identity while keeping both submissions: the person remains one person, the new
document is added rather than substituted, the new application has its own
state, and nothing the candidate previously provided is destroyed.

The mechanics of reconciling two documents into one career reading — which
employment entries are the same job, how to combine overlapping histories —
belong to the CV-parsing-and-career-reading discipline, which owns
merge-on-re-application. What this subject owns is the identity decision that
precedes it: *which existing record, if any, is this*.

When that answer is uncertain, the direction is fixed. For anything that could
produce an adverse outcome — suppressing a "duplicate", merging two records —
keep both, link nothing, flag for a human
([uncertainty resolves toward the
candidate](../_laws.md#uncertainty-resolves-toward-the-candidate)). A wrong
merge is close to unrecoverable: once two people's evidence is commingled,
nobody can say which claim came from whom.

Two more seams, stated once. Evidence provenance weighting owns what a claim is
worth and owns re-baselining a weighting scheme; this subject owns only the
fact that an instrument change makes old and new outputs incommensurable, and
the version stamp that lets anyone tell. Silver-medalist rediscovery owns
re-surfacing a person the organisation already assessed, and explicitly defers
here on whether the old assessment still describes them.

## Failure modes this standard exists to prevent

- **The label key** — two people collapsed into one record because they named
  their upload the same generic word.
- **The confident wrong attach** — a fresh, correct analysis filed against the
  wrong person, which no freshness indicator will ever catch.
- **The blocking badge** — a candidate unreviewable because an internal
  timestamp moved, charged for an edit they did not make.
- **The concluding badge** — a staleness label phrased as a claim about the
  person rather than about the record.
- **The silent rebuild** — a recruiter's corrections overwritten by the
  machine's original errors, discovered weeks later.
- **The mode-blind cache** — a non-blind assessment served into a blind
  surface because the mode was not in the key.
- **The ambiguous key** — an unframed, delimiter-joined cache key colliding
  across field boundaries, serving one candidate's analysis for another's.
- **The stale-over-terminal render** — a retired or anonymised record shown
  with a re-run affordance, offering a remedy that must not exist.
- **The reconstructing footprint** — an identity join that reassembles a person
  the organisation was required to forget.

## The techniques

- [content-addressed-document-identity](techniques/content-addressed-document-identity.md)
  — hashing content to get an exact artifact identity, and what it does not give you.
- [label-collision-detection](techniques/label-collision-detection.md) — finding
  and unpicking the records a label-keyed store has already merged.
- [cross-role-footprint-linking](techniques/cross-role-footprint-linking.md) —
  assembling one person's history across openings, and the boundaries it may not cross.
- [requirement-edited-since-scored](techniques/requirement-edited-since-scored.md)
  — the exactly-detectable staleness cause, and why it informs rather than blocks.
- [rebuild-overwrites-manual-edits-warning](techniques/rebuild-overwrites-manual-edits-warning.md)
  — protecting human corrections from machine regeneration.
- [retired-outranks-stale-status-precedence](techniques/retired-outranks-stale-status-precedence.md)
  — one precedence order for terminal and advisory states.
