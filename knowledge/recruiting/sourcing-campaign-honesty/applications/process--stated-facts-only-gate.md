---
layer: application
type: application
subject: sourcing-campaign-honesty
technique: stated-facts-only-gate
stack: process
status: forged
---

# The fact set as a function (Python campaign pipeline)

`pipeline/jobfit/campaign.py` implements the gate as one small function whose
docstring is the contract: `_job_facts` (`:121-146`) — *"The ONLY facts the
copy may use. A DEFAULT_POLICY phantom (recorded in ``defaulted_fields``) or a
blank string is absent — never advertised."*

## The gate is an input, not a check

Nothing in the module inspects the generated copy for invented claims. The
entire control is that `_prompt` (`:164-191`) serializes **only** the
`_job_facts` dict into the model's context:

```python
f"JOB FACTS — the ONLY facts you may use (a null field is UNKNOWN; never guess it):\n"
f"{json.dumps(facts, ensure_ascii=False)}\n\n"
```

The `Job` object carries far more — pipeline state, requirement objects,
detected skills, the source — and none of it travels. The slot list is fixed
and short: title, seniority, company, location, workMode, languages, salary,
topSkills, and a 600-character description excerpt (`:132-145`). An angle that
would need a slot outside this dict cannot be written, because the material
was never supplied.

Note the null convention: absences are present-as-null with the meaning stated
in the prompt line above, not omitted keys. That is the difference between the
model reading a gap as "unknown" and reading it as "you forgot this".

## Statedness is a per-field closure over the phantom set

The gate's core is four lines (`:124-128`):

```python
defaulted = set(job.defaulted_fields or [])

def stated(value: str, field: str) -> str | None:
    v = (value or "").strip()
    return v if v and field not in defaulted else None
```

`stated()` collapses the standard's three states into what the copy needs: a
value survives only if it is non-blank **and** the normalizer did not put it
there. `defaulted_fields` is produced upstream by `normalize_job`
(`pipeline/jobfit/jobs.py:305-312, :393`) against `DEFAULT_POLICY`
(`jobs.py:58-65`), whose own comment states the concept in the same words the
standard uses: *"Each is a PHANTOM value the ad never actually stated, so a row
that defaulted to 'Praha'/'medior' must not be read as one that really said
it."*

The salary is handled separately (`campaign.py:139-141`) because its phantom is
computed rather than table-driven — a market-anchor band stamped when the ad
stated no pay (`jobs.py:66-70`):

```python
"salary": None if "salary_band" in defaulted else _salary_label(job, lang, market),
```

This is the standard's highest-yield rule realized in one conditional. Without
it, every posting with no stated pay would advertise a market-anchor number as
though the employer had offered it — a well-typed, plausible, entirely
unasserted figure. `_salary_label` (`:104-119`) deliberately leaves the
judgment to the caller: *"Statedness is `_job_facts`'s call — it drops the
label for an anchored band."* One decision, one place.

## Reinforcement in the instruction, per language

The gate is the control; the prompt repeats it as reinforcement in three
places — the system prompt (`:53-61`) *"use ONLY the supplied job facts —
never invent pay, benefits, testimonials, or team details"*, the beat rules
*"If salary is null, do NOT invent one"* and *"proof: concrete facts only …
No testimonials"* (`:180-182`).

The euphemism ban (`:183-184`) is the part worth copying, because it is
enumerated in **both** languages the copy may be written in:

```
- Ban boilerplate in every language: 'competitive salary', 'join our team', 'dynamic
  environment', 'fast-paced', 'konkurenceschopný plat', 'dynamické prostředí', 'mladý kolektiv'.
```

A ban listed only in English would leave a Czech draft free to reach for the
identical euphemism in Czech without touching a listed phrase — the gate stops
invented *values*, but only the enumerated ban stops the genre's filler, and
filler is language-specific. This is the same phrase family the human-authored
posting lint blocks, on the other side of the seam.

## Deviations from the standard

- **No scope on the facts.** The dict carries values without which entity,
  site or as-of date they hold for, so the borrowed-claim failure is
  unguarded. In a single-market pilot the exposure is small; it grows the
  moment one company hires across sites.
- **`descriptionExcerpt` is free text in the fact set.** The standard says
  prose is not a fact source, and a 600-character excerpt of the requisition
  description is exactly that — it can carry hedges, aspirations and internal
  caveats into a fact-bounded prompt. It is the one slot in `_job_facts` that
  is not a resolved, stated value, and it is where a residual invented-adjacent
  claim would most plausibly enter.
- **Freshness is not modelled.** Facts are read live from the `Job` at
  generation time, which is the cheap version the standard endorses, but a
  stored pack (`PackRecord`) keeps rendering the facts as they were, and
  nothing re-checks it against a re-scoped requisition.
