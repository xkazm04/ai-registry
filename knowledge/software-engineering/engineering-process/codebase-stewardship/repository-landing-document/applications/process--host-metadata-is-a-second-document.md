---
layer: application
type: application
subject: repository-landing-document
technique: host-metadata-is-a-second-document
stack: process
status: forged
verified_on: 2026-10-22
applied: experiment
ab_verdict: unmeasurable
---

# Auditing the host metadata of thirteen public repositories

The technique says the description, topics, homepage and social preview are a
second, hand-authored document that nothing regenerates from the README. This
application reads that second document for every public repository the owner
publishes (13 of 14; the fourteenth is private and was not cited), through the
host's own API on 2026-10-22, and sets five descriptions (the registry's and four others') beside the README's
opening paragraph in the checked-out tree; seven were not read and one had no description. No metadata was changed: the host
settings are a public outward-facing surface, not a file in a tree, so the run
read and did not write.

The seam was chosen to falsify the technique's premise that the blank is the
common state. If most repositories already carried all four fields, the rule
would describe a problem this fleet does not have.

## A: the metadata as found

| field | held | failed |
|---|---|---|
| description present | 12 of 13 | 1 blank |
| description agrees with the README's first paragraph | 4 of 5 compared | 1 drifted |
| at least one topic | 11 of 13 | 2 with zero |
| homepage, when set, reachable | 4 of 4 (HTTP 200) | none |
| homepage, when set, is not the repository's own URL | 4 of 4 | none |
| deliberate social preview | 0 of 13 | 13 on the default |

The two failures on the first four rows are different repositories and different
failure kinds:

- **A blank.** One repository, public, carries an empty description and zero
  topics: the freshly-created state, held for as long as the repository has
  existed. Its README opens with a precise one-paragraph statement, so the
  second document is missing text the first already contains.
- **A drift.** The registry's own repository describes itself as an *example*
  registry that a named consumer indexes, while its README now opens with the
  registry as the organisation's own owned, reviewed knowledge and states that
  the corpus is real content gated by CI. The description is the older sentence.
  It also carries zero topics. A stranger reading the host's search result gets
  the stale claim before the accurate one, which is the discounting the
  technique describes, and it applies to the repository that publishes the
  technique.

## What held, and what was close

- Every set homepage resolves. One points at the repository's own container
  package listing on the same host. That sits between two clauses of the
  technique (a package listing is allowed, the repository's own URL is not); it
  resolves because the listing is a different destination from the README's own
  link and the README links the image by registry path, not by that page. The
  technique held; the boundary is thin enough to note, not enough to amend.
- Topics were mostly stack words (`nextjs`, `typescript`, `tailwindcss`) beside
  one or two domain words. None restated the project's own name. One topic
  names a competitor, which is the vocabulary a reader would search by, so it
  passes the technique's test.
- The social preview row is the whole of the fleet's miss: 13 of 13 render the
  owner's avatar on every unfurl, and nothing in any tree records the explicit
  decision to accept the default that the technique allows. Whether any of the
  thirteen expects to be unfurled is not knowable from outside, so this row is
  recorded and not scored.

## B: what the technique would change

For the two failures: copy the README's first paragraph's shortest honest form
into the description, add topics from the stack and domain, and for the
social-preview row either upload an image or record the decision. This was not
run. The setting is a public repository edit, and the registry method's
standing authorization covers commits, not host settings.

## Verdict and what it cannot do

`unmeasurable`. The target (a stranger's click-through from a search result or a
topic page) has no instrument here: the host's traffic and referrer data are
the owner's to read and a before/after needs the change to have landed first.
The floor (README unchanged) is trivially held, since nothing was edited. Return
condition: when the two descriptions are rewritten, read the host's referrer
traffic for the 14 days either side of the change and compare unique visitors
arriving from search and topic pages.

This audit cannot say whether a stranger weighs the description at all, whether
13 samples from one owner generalise, or whether the social preview matters to
any of these projects. It measures that the second document is sometimes blank
and sometimes stale. The technique held; no amendment.
