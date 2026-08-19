---
layer: technique
type: technique
subject: nonprofit-verification
technique: determinate-vs-inconclusive-outcomes
status: forged
laws: [honest-null-over-forced-guess, hard-gates-precede-soft-scores]
shared_with: []
use_when: [deciding whether a registry's negative answer should block an applicant, mapping a source's status vocabulary onto a shared verdict model, a legitimate organization was failed by a check that could not actually disqualify it]
---

# Determinate vs inconclusive outcomes

Every verification source ultimately reports one of three outcomes — pass,
fail, inconclusive — and the technique is the classification discipline that
decides which raw source status maps to which. The distinction that does the
work is not pass-versus-fail; it is **determinate versus inconclusive**:
did this source produce *evidence that decides*, or did it merely produce
an answer?

- **Determinate pass** — affirmative confirmation of good standing: an
  active registration, recognized exempt status of the right kind, a clean
  sanctions screen.
- **Determinate fail** — evidence that disqualifies: no entity behind the
  identifier, a dissolved entity, the wrong kind of exempt status for
  charitable funding, a sanctions-list hit.
- **Inconclusive** — everything else. Two families live here, and conflating
  them with fail is the defect this technique exists to prevent:
  1. *The check could not decide* — network failure, unparseable or partial
     response, source unconfigured, adapter declared but not built,
     identifier structurally invalid.
  2. *The check decided, but the negative is not a disqualifier* — the
     record it looked for is one a legitimate applicant can lack.

## The polarity question, asked per source

For each source, answer once, in writing, in the adapter: **would every
legitimate applicant have this record?** Only if yes may absence fail.

- The national register of legal entities: yes — every real organization is
  in it, so "no such identifier" and "dissolved" are determinate fails.
- The tax authority's exempt-organization list: yes for the status it
  certifies — "not found" and "found but the wrong exemption class for
  charitable funding" are determinate fails.
- The annual-filing index: **no** — a newly recognized charity has no
  filing on record because none is due yet. "Recognized but no filing" is
  inconclusive. Only "no such organization at all" fails.
- The federal-contractor registration: **no** — it exists only for entities
  receiving government awards, so a foundation-funded organization's absence
  is the normal state. "Not registered" is inconclusive; only an active
  registration signals anything, and what it signals is a pass.
- The sanctions screen: inverted polarity — presence is the disqualifier.
  "Clear" passes; a potential match is a determinate fail that routes to
  manual review (names collide; the block is real, the accusation is not
  yet).

Get one polarity wrong and the pipeline develops a demographic: the
annual-filing collapse fails every young charity, the contractor-roster
collapse fails every organization that never took government money. Both
are structural discrimination against legitimate applicants, produced by a
one-line mapping.

## Decision rules

- **When a source errors, times out, or returns garbage, classify
  inconclusive — never fail, and never cache the outcome as if decided,
  because** a transient infrastructure failure stored as a verdict serves a
  false disqualification for the cache lifetime.
- **When in doubt between fail and inconclusive, choose inconclusive and
  surface the open question, because** an inconclusive routes a human to
  look while a wrong fail silently ends a legitimate application; the error
  costs are not symmetric.
- **When aggregating, let inconclusives neither help nor block: the verdict
  reads only determinate outcomes** (at least one pass, zero fails) **and
  any confidence score divides by decided checks only, because** counting
  inconclusives in the denominator converts pipeline weather into apparent
  applicant risk.
- **When a source's positive is merely a bonus signal (federal-award
  readiness), it may pass but its negative must be structurally unable to
  block — enforce this in the adapter's mapping, not in downstream
  special-casing, because** the aggregator must stay source-agnostic.
- **When rendering, give inconclusive its own visual state and its own
  sentence stating what is missing and why it does not block, because** a
  user shown "failed: no filing on record" repairs the wrong thing, and a
  reviewer shown three greens over a five-source roster needs to see the
  two greys.

## When not to use

Do not import the three-valued model where a check is genuinely binary and
total — an integrity signature over a credential either verifies or it does
not, and inventing an inconclusive there launders broken signatures into
"try again". And do not let inconclusive become a dumping ground that hides
adapter bugs: an inconclusive rate that climbs is an operational alarm
(upstream drift, expired credentials, a broken parser), so count and watch
it — the state is honest precisely because something is supposed to happen
when it accumulates.
