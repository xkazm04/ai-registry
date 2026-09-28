---
layer: application
type: application
subject: candidate-identity-and-staleness
technique: shared-artifact-across-claimed-identities
stack: node
status: forged
verified_on: 2026-09-28
verified_against: node@24
applied: simulation
ab_verdict: better
---

# Three identity seams in a Next.js/SQLite hiring app, walked under both policies

The tree has no check for one artifact or one contact channel under several
claimed identities. It has three places where the question arises and is
answered implicitly. This application walks each of them under the tree's
current behaviour (A) and under the technique (B), read at HEAD `c39dc91a6` on
2026-09-28. No product code was changed.

## The sources behind the technique

- US FBI IC3 public service announcement I-012325-PSA, 2025-01-23,
  <https://www.ic3.gov/PSA/2025/PSA250123>. Checked verbatim against the page
  source: "Cross-check HR systems for other applicants with the same resume
  content and/or contact information", and operators "have reused phone
  numbers (particularly voice-over-IP numbers) and email addresses, on multiple
  resumes purportedly belonging to different applicants."
- SpyCloud, "How we identified fake North Korean IT workers", 2026-01-03,
  <https://spycloud.com/blog/how-we-identified-fake-north-korean-it-workers/>,
  independent of the government sources. It describes "side-by-side copies of a
  real developer's resume alongside a near-identical fraudulent version with a
  different name, contact details, and photo". The pattern is near-identical,
  which is why the technique states that a digest sees exact copies only.
- US Treasury/State/FBI advisory, 2022-05-16,
  <https://ofac.treasury.gov/system/files/126/20220516_dprk_it_worker_advisory.pdf>:
  "flag for additional review". This is review, not rejection, and the same
  government family as the PSA.
- Greenhouse, "Auto-merge",
  <https://support.greenhouse.io/hc/en-us/articles/208063316-Auto-merge>. A
  shipped default merges on a shared email even when the names do not match,
  choosing "the profile that has the most recent activity", and it excludes
  agency submissions because an agency address would fuse every candidate that
  agency sent. This is the composite-person failure as vendor behaviour, and
  the reason the technique forbids the merge.

All accessed 2026-09-28.

## Case 1: one address under two candidate ids (the stored data)

`candidateIdByContact` (`app/_lib/db/pipeline.ts:1741–1753`) resolves an email
to a candidate for the dev-case promote path. It is honest in the forward
direction: "UNIQUE or nothing. Two distinct candidate ids under one address is a
state we cannot resolve without guessing" (`:1734–1735`), and it returns `null`
when two ids share the address (`:1753`).

A read-only query over the tree's local seed store (`data/kp.sqlite`, 128
pipeline entries, 5 with a contact) found exactly **one** such address: two
candidate ids, the same display name, created twelve minutes apart, one at
Interview and one at Accepted.

- **A:** the function returns `null`, the caller mints a new identity, and the
  fact that two records share an address is discarded. Nobody is told.
- **B:** the address is counted against its distinct claimed identities. The
  names are equal, so this is a *fragmented record*: one person, two rows. That
  is a merge question for a human under the forward rules, not an identity
  question. B surfaces the pair and routes it correctly, and it does not raise
  an impersonation flag.

## Case 2: the recruiter's own upload tool (B abstains)

`collapsePopulation` (`app/_lib/candidate-population.ts:95`) folds analyses by
`cv_hash`, one row per digest, and the row takes the newest analysis's name
(`analysisRow`, `:160–176`). On this path the label is the upload's file name
(`app/api/analyze/route.ts:240`), and identical bytes extract the same name.

- **A:** folds and shows the newest label.
- **B:** the technique's first condition applies. No claimed identity is held
  outside the bytes, so a "different name" here is a rename, and B does not
  run. The only change B asks for is display-level: the fold keeps every label
  the group holds, so a rename cannot hide which files were folded.

The prediction is **zero** flags on this path. A check that fired here would be
producing noise.

## Case 3: the application door with a typed identity (B files the second person)

`applicantKey` (`app/_lib/applicant-key.ts:12`) keys an application on the
email, else on the typed name. `findApplicationByApplicant`
(`pipeline.ts:1838`) matches on the email, else on the name for no-email
applies, and an unproven match returns `duplicate` with nothing filed
(`app/_lib/application-filing.ts:219–222`). The two inputs walked through that
code are constructed:

- **(a)** two applicants for one job, no email, same typed name;
- **(b)** two candidates an agency submits for one job under the agency's own
  address.

- **A:** in both, the second person receives the duplicate answer, and their
  submission is not filed. In (b) the recovery links go to the address on file,
  which is the agency's.
- **B:** the second submission is filed as its own record. The pair is flagged
  for a person, with both claimed names, the shared name or channel, and the
  submission provenance. A name-only match is a label match, and an agency
  address is excluded from matching once the submitter is recorded as an agency.

Case 3's seam is also where the technique's signal would live. The inbound CV
intake (`app/_lib/cv-intake.ts:27`) reads the CV but stores no digest, so the
one door where a claimed identity sits outside the file cannot compare
artifacts.

## Verdict

**Better, by simulation.** In two of three cases B changes the outcome in the
standard's direction. Case 1 surfaces a fact A discards. Case 3 files a real
applicant whom A turns away. In case 2 B correctly abstains.

What would falsify it: an owner statement that no door files without an address
the applicant has confirmed. Case 3(a) would then be unreachable, and only the
agency case would remain.

Return condition for a code apply: the inbound intake storing a CV digest
beside the application's claimed name and contact, which is the pairing step 1
of the technique requires.
