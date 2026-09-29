---
layer: application
type: application
subject: sourcing-campaign-honesty
technique: stated-facts-only-gate
stack: process
status: forged
verified_on: 2026-09-29
applied: code
ab_verdict: better
---

# The fact set as a function (Python campaign pipeline)

Line numbers are `pipeline/jobfit/campaign.py` at kp `092f2e1e3` (local, unpushed
when written) unless a file is named. The 2026-08-20 citations had all moved.

`pipeline/jobfit/campaign.py` implements the gate as one small function whose
docstring is the contract: `_job_facts` (`:169-192`) — *"The ONLY facts the
copy may use. A DEFAULT_POLICY phantom (recorded in ``defaulted_fields``) or a
blank string is absent — never advertised."*

## The gate is an input; the boundary is a backstop

The control is that `_prompt` (`:237-262`) serializes **only** the `_job_facts`
dict into the model's context:

```python
f"JOB FACTS — the ONLY facts you may use (a null field is UNKNOWN; never guess it):\n"
f"{json.dumps(facts, ensure_ascii=False)}\n\n"
```

The `Job` object carries far more — pipeline state, requirement objects,
detected skills, the source — and none of it travels. The slot list is fixed
and short: title, seniority, company, location, workMode, languages, salary,
topSkills, and a 600-character description excerpt (`:180-191`). An angle that
would need a slot outside this dict cannot be written, because the material
was never supplied.

Note the null convention: absences are present-as-null with the meaning stated
in the prompt line above, not omitted keys. The registry treats the reason for
that (an omitted key reads as an oversight to repair) as a hypothesis; nothing
in this tree measures it either way.

Until this pass nothing inspected what the model wrote. `coerce` now calls
`_boundary_violation` (`:216-234`, applied at `:352`), which drops a variant that
carries a digit run the fact set does not (`_numerals` compares digit runs with
separators stripped, `:212`, so "65 000" matches "65000"; the one constant it
allows is the "30" the prompt's own CTA dictates, `:94`), a quotation mark, a
first-person voice in the pack's language, or a phrase from the banned list. The
numeral test reads the facts as they were serialized for the prompt, so a
defaulted pay band, which `_job_facts` nulls, leaves no figure for the model to
recite: a model that writes the anchor band from its own prior is dropped, and a
test pins it.

## Why the instruction alone is not the control

The prompt tells the model to use only the facts, three times over (the system
prompt at `:104-106`, the null convention above, and the beat rules "If salary is
null, do NOT invent one" at `:254` and "No testimonials" at `:255`). The reason
it is reinforcement is measurable on a public benchmark, with its limits:

- **What was measured.** Vectara's hallucination leaderboard (README read raw
  from the repository on 2026-09-29, "Last updated on September 22, 2026"): over
  7,700 documents in a private set, each model told to summarise "using only the
  facts presented in the document", temperature 0, scored by their HHEM-2.3
  model. Rows read: claude-haiku-4-5 9.8%, claude-sonnet-4-6 10.6%,
  claude-opus-4-5 10.9%, claude-opus-4-7 12.0%, gpt-5.2-high 10.8%,
  gemini-3.1-pro-preview 10.4%; the best listed, antgroup/finix_s1_32b, 1.8%.
- **What it does not show.** The task is long-document summarization, not filling
  a short ad from a small closed fact set, and the rate is per summary, not per
  slot. It says the instruction-only condition leaves a non-trivial share, not
  what share this pipeline's copy carries. Nothing here measured that.

## Statedness is a per-field closure over the phantom set

The gate's core is four lines (`:172-176`):

```python
defaulted = set(job.defaulted_fields or [])

def stated(value: str, field: str) -> str | None:
    v = (value or "").strip()
    return v if v and field not in defaulted else None
```

`stated()` collapses the standard's three states into what the copy needs: a
value survives only if it is non-blank **and** the normalizer did not put it
there. `defaulted_fields` is produced upstream by `normalize_job`
(`pipeline/jobfit/jobs.py:357-366, :401`) against `DEFAULT_POLICY`
(`jobs.py:64-71`, four fields: company, location, work mode, seniority), whose own
comment states the concept in the same words the standard uses: *"Each is a
PHANTOM value the ad never actually stated, so a row that defaulted to
'Praha'/'medior' must not be read as one that really said it."*

The salary is handled separately (`campaign.py:189`) because its phantom is
computed rather than table-driven — a market-anchor band stamped when the ad
stated no pay:

```python
"salary": None if "salary_band" in defaulted else _salary_label(job, lang, market),
```

This is the standard's highest-yield rule realized in one conditional. Without
it, every posting with no stated pay would advertise a market-anchor number as
though the employer had offered it — a well-typed, plausible, entirely
unasserted figure. `_salary_label` (`:151-166`) deliberately leaves the
judgment to the caller: *"Statedness is `_job_facts`'s call — it drops the
label for an anchored band."* One decision, one place.

Since 2026-09-17 (`70342c7be`) the pack also carries `defaultedFields` (`:417`),
so a recruiter can tell "we assumed medior" from "no salary stated" — but see the
last deviation.

## The euphemism ban is one list, in the instruction and at the boundary

`BANNED_BOILERPLATE` (`:60-63`) is the single list. The prompt line is built
from it (`:257`), byte-identical to the literal it replaced, and the boundary
enforces it through pattern families ported from `app/_lib/jd-lint.ts`
(`_VAGUE_RES`, `:65-75`) for **all four** languages the pack supports.

That matters because the 2026-08-20 version of this page said the ban was
enumerated "in both languages the copy may be written in". The pack now writes
four (`_T`: en, cs, de, fr), and the *instruction's* list still names only
English and Czech phrases; a German or French draft could reach for its own
"wettbewerbsfähiges Gehalt" or "salaire compétitif" without touching a listed
phrase. The boundary now catches those two languages, the instruction still does
not name them.

## Measured

The same 14-variant fixture and the same before/after table as the testimonial
application (8 planted defects, 6 clean shapes): the label-only boundary passed
8 of 8 planted defects; the checked boundary passes 2 of 8 (the perk with no
numeral, and the band endpoint alone) and drops 0 of 6 clean ones. The numeral
class accounts for three of the six catches: an invented pay figure, an invented
benefit count and an invented year. The counts, the fixture's authorship bias and
the missing live-output measurement are recorded there.

## Deviations from the standard

- **No scope on the facts.** The dict carries values without which entity,
  site or as-of date they hold for, so the borrowed-claim failure is
  unguarded. In a single-market pilot the exposure is small; it grows the
  moment one company hires across sites.
- **`descriptionExcerpt` is free text in the fact set.** The standard says
  prose is not a fact source, and a 600-character excerpt of the requisition
  description is exactly that — it can carry hedges, aspirations and
  internal caveats into a fact-bounded prompt. It is also a hole in the new
  numeral check: any figure in the excerpt counts as stated, because the check
  reads the serialized facts. The slot remains where a residual invented-adjacent
  claim would most plausibly enter.
- **No shape on the facts.** A pay band travels as one label string, but nothing
  stops a `number` hook from quoting one end of it; the prompt asks for "pay or
  another concrete figure". kp's own test fixture, which approves a `number` hook
  of "95 000 CZK/month." for a 65 000–95 000 band, does exactly that and passes.
  The boundary cannot see it, because 95 000 is a stated figure.
- **Freshness is not modelled.** Facts are read live from the `Job` at
  generation time, which is the cheap version the standard endorses, but a
  stored pack (`PackRecord`) keeps rendering the facts as they were, and
  nothing re-checks it against a re-scoped requisition.
- **The assumed-fact chips have no surface.** `jobsCampaignDefaulted.ts` and its
  `jobs.campaign.defaulted` catalog strings still exist, and nothing but their
  own test imports them: the Campaign tab that painted them was deleted on
  2026-09-16. The producer (`defaultedFields` on the pack payload) holds; the
  recruiter-facing half of the assumed-versus-missing distinction does not.
