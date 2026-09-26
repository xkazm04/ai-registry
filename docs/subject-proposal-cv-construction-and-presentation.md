# Subject proposal: cv-content-construction + cv-presentation-and-parseability

**Status:** EXECUTED 2026-09-26 on branch `forge/cv-construction` (not merged - adopting
the branch is the owner's call). Forged at
`knowledge/recruiting/candidate-self-presentation/cv-content-construction/` and
`knowledge/recruiting/candidate-self-presentation/cv-presentation-and-parseability/`.
**Bundle:** `recruiting`
**Category:** NEW `candidate-self-presentation` (order 10). The bundle root goes from
nine category folders to ten - at the cap, legal, and the reason is argued below.
**Raised by:** a consumer (a job-seeker module that turns an imported CV into a designed
one-page document with a deterministic "better expressed" pass, a tailor-to-target-role
pass and a model polish dialog). Its operator judged the output "mediocre quality of
content and UI format" even in its boosted version, and there was no standard to hold it
to: the bundle carried only the READING side of a CV.
**Link depth:** from `<subject>/<subject>.md` the laws file is `../../_laws.md`; from
`techniques/` and `applications/` it is `../../../_laws.md` - the same depth as every
subject in `candidate-evidence`.

## Why a subject, and why two

The bundle holds nine subjects about a career document, every one of them from the
employer's chair: parse it, weigh its claims, screen it for manipulation, redact it,
read soft signals off it. None says what a *good* one is. That silence is not neutral:
a writing tool built without a standard reproduces the career-advice internet, which is
dominated by commercial surveys, recycled statistics whose primary source is lost, and
template vendors selling the thing they recommend.

It is two subjects, not one, because the two halves have different evidence classes,
different failure modes and different owners in any product that builds CVs:

- **`cv-content-construction`** - what the words claim. Evidence class: correspondence
  and field experiments, recruiter surveys, fabrication research, and the bundle's own
  laws (a CV rewrite is the place where "say only what the record holds" is most
  tempting to break, because the author *wants* the invention). Failure mode: a
  fluent document that says more than the person did, or says it in the same words as
  every other machine-polished document.
- **`cv-presentation-and-parseability`** - how the words are arranged, what machines
  make of the arrangement, and which personal data a market expects on the page.
  Evidence class: eye-tracking and reading studies, parser vendor documentation and
  round-trip tests, statutes and regulator guidance. Failure mode: a handsome document
  whose extracted text is scrambled, or a market-inappropriate one (a photo and a birth
  date where the reader's law makes them a liability).

Merging them would produce one subject with eleven techniques and two acceptance tests.

## Why a new category

- **Not `candidate-evidence`.** It already holds nine subjects; two more make eleven and
  force a subcategory ring over subjects that are all about *reading*. More importantly
  the actor differs: every subject there is the employer judging a document. These two
  are the candidate (or a tool acting for them) authoring one.
- **Not `candidate-experience`.** That category is how the process treats the person
  (communication integrity, status, rejection, degradation). Writing one's own CV is not
  something the process does to anybody.
- **A named seam for a supply-side cluster.** Cover letters, portfolio presentation,
  profile pages, the candidate's side of negotiation and interview preparation are the
  obvious next subjects. A category named for the actor keeps that seam visible - which
  is what `knowledge/README.md` says categories are for - before any split is argued.
  The split test (a different denylist, or a consumer misled by the rest) is NOT met:
  a writing tool must know how its output will be read, so the reading-side subjects are
  its most important neighbours.

Cost: the bundle root is now at ten category folders. The eleventh category needs a
restructure argument; this proposal spends the last slot deliberately.

## Techniques (slugs assigned up front)

`cv-content-construction`:

1. `accomplishment-statements-without-invention` - when a line states a duty, rewrite it
   as action + object + outcome using only facts the record holds; when no outcome or
   metric is recorded, use recorded scope (scale, frequency, audience) or ask the owner,
   and never estimate one.
2. `relevance-ordering-and-recency-compression` - order sections by what the target
   reader needs first; reverse-chronological entries; a bullet budget that shrinks with
   age and relevance; compress old roles into one line, never delete them.
3. `target-role-tailoring-without-stuffing` - align vocabulary to the target only where
   the record evidences the thing; surface unmet requirements to the owner as gaps
   rather than writing them in; repetition caps.
4. `career-change-framing` - a target line and a summary earn their place here; bridge
   with evidence (projects, study, transferable outcomes) in a hybrid layout that keeps
   the chronology; never a functional CV.
5. `evidenced-skills-over-self-ratings` - skills grouped and tied to where they were
   used; no bars, pips or percentages; language levels on a standard scale only when
   stated.
6. `machine-rewrite-fidelity-contract` - a model rewrite is a proposal diffed against
   the source, with no new entities, numbers, titles or dates; owner-accepted line by
   line; voice kept and cliché banned.

`cv-presentation-and-parseability`:

1. `scan-path-hierarchy` - the first third of page one carries identity, target and the
   most recent relevant role; each entry repeats one fixed pattern so the eye learns it.
2. `parse-safe-reading-order` - one linear reading order that survives text extraction;
   nothing load-bearing in headers, footers, text boxes, images or icons alone;
   conventional section headings; a second column only if its extracted order is
   verified.
3. `type-scale-density-and-page-budget` - a small type scale, one accent colour, a
   density floor and ceiling, and a page budget by seniority and market that the
   content fills rather than overflows or strands.
4. `market-conventions-and-personal-data` - per-market variants for photo, birth date,
   marital status, signature and length; minimisation is the default and inclusion is
   an owner opt-in where the market expects it.
5. `export-format-and-round-trip-verification` - a text-layer file with embedded fonts
   and a human-readable filename; verify every export by extracting it and diffing the
   text against the source model.

## Boundaries this proposal does NOT absorb

- How a CV is parsed, weighed, screened or redacted - the `candidate-evidence` and
  `fairness-and-defensibility` subjects. These subjects cite them in prose as the
  reader the writer is writing for.
- Whether machine drafting is an authenticity finding - settled in
  `cv-authenticity-screening` (it is not). What is owned here is the writer's side:
  what a rewrite may change and what it must not.
- Job advertisements - `inclusive-job-advertising` owns the employer's document.

## Primaries

The research record behind each technique is summarised in the subject's golden path and
in the librarian note; numbers are carried with their n and date in the upper layers
only where the claim is about the evidence itself, and every commercial survey is named
as commercial.
