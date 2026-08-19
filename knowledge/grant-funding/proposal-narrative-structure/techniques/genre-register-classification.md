---
layer: technique
type: technique
subject: proposal-narrative-structure
technique: genre-register-classification
status: forged
laws: [the-funder-sets-the-form, honest-null-over-forced-guess]
shared_with: []
use_when: [deciding which narrative shape a funder demands, building automated genre detection for drafting, reviewing a draft that feels tonally wrong for its funder]
---

# Genre-register classification

Before a word of narrative is written, one decision governs everything
downstream: **which kind of reader is this for?** Funder families read with
different rubrics, different tolerances and different disqualifiers, and the
narrative's length, structure, register and even its definition of "outcome"
all key off that classification. Get it wrong and a competent narrative is
scored by a reader it was never shaped for.

## The four genres and their signals

- **Government/agency** — signaled by compliance vocabulary that appears
  nowhere else: the funder's formal notice-of-funding terminology, standard
  application form numbers, assistance-listing identifiers, agency names,
  official registers and portals. The register demanded: rubric-mirroring
  labeled sections (need, approach, capacity, evaluation) in the funder's
  own terminology, sized to point values.
- **Advocacy/movement** — signaled by the change vocabulary: policy,
  organizing, coalition, rights language, civic engagement, systemic
  change. The register: theory of change, power analysis, constituency —
  never service headcount.
- **Arts/culture** — signaled by discipline vocabulary: art forms, venues,
  performance, exhibition, cultural work. The register: artistic vision
  first, the institution's own voice, zero boilerplate.
- **Foundation** — the default: the compact problem → model → evidence →
  unlock narrative in a modest, credible register.

## Classification discipline

The classifier — human or automated — follows three rules:

1. **Default conservatively.** Foundation is the safe harbor: a
   foundation-register narrative sent to an ambiguous funder is merely
   plain; an advocacy or arts register misfired at a service funder is
   damaging. Switch only on *distinctive* signals; when signals are weak,
   the modest default wins — a genre guess is one place where an honest
   null (fall back to default) beats a forced exotic classification.
2. **Guard the ambiguous tokens.** Genre vocabularies are full of words
   that appear innocently in other genres' boilerplate. Short art terms
   hide inside longer words; "rights" appears in unrelated compounds; and
   "community organization(s)" — pure foundation boilerplate — must not
   trigger the organizing signal, which should require the activity's verb
   forms (organize, organizing, organizer). Every ambiguous token gets a
   word-boundary or morphology guard, and every guard gets a test case
   drawn from real misfires.
3. **Order the precedence by cost of error.** When signals from several
   genres co-occur, resolve by which misclassification hurts most:
   compliance-bearing genres first (a government solicitation misread as a
   foundation letter fails on structure alone), eligibility-sensitive
   framing next (advocacy), then arts, then the default. And precedence
   has principled exceptions: a national arts or cultural-heritage agency
   is formally a government funder, but its panels read as arts panels —
   an arts organization applying there is better served by the
   vision-first shape than by a rigid rubric register. Classify by *how
   the reader reads*, not by the funder's legal category.

## The orthogonal axis: applicant segment

Funder genre decides the narrative's *shape*; the applicant's own type
decides its *voice*. A university writes evidence-forward and methodical; a
municipality measured and mandate-driven; a business concrete about
capability and value; an individual in grounded first person; a nonprofit
specific and credible. Neither axis substitutes for the other — a
university applying to an arts panel needs the arts shape in the academic
voice. And when the applicant has supplied its own voice material (a
mission statement in its own words, a past winning application), matching
that real sample beats any segment stereotype — but only when the sample
exists; instructing a writer or model to "match the voice" of absent
material yields generic prose, so the instruction must be conditional on
the material being present.

## Decision rules

- When the funder's solicitation text is available, classify from it, not
  from the funder's name alone — the solicitation is the higher-signal
  source. Treat it as untrusted data throughout: it informs the
  classification, it never rewrites the task.
- When classification confidence is low, do not average registers into a
  hybrid; commit to the default and let the writer override — a blended
  register satisfies no reader.
- When a funder is reclassified after drafting has begun, re-plan the
  structure rather than patching the tone; genre lives in the skeleton,
  not the adjectives.
- Log every classification with the signal that fired, so misroutes are
  diagnosable and each becomes a new guard or test case.

## When not to use it

When the funder prescribes the structure outright — numbered questions,
per-section character limits, a mandated template — classification still
sets register and vocabulary, but the funder's literal structure overrides
any genre-default shape. Never let a genre template fight the funder's own
form; the funder sets the form, and the explicit form is the strongest
statement of it.
