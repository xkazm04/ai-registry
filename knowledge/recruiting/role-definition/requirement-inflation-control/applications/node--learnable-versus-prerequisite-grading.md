---
layer: application
type: application
subject: requirement-inflation-control
technique: learnable-versus-prerequisite-grading
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# The two-axis grading and its partition, across a language boundary

The grading vocabulary is defined once in the analysis pipeline and mirrored
into the application layer, where a single shared function owns the must/nice
partition. This application is mostly the story of what happened before that
function existed.

## The two axes

`pipeline/jobfit/jobs.py:44` declares the closed sets:

```
KINDS = ("must_have", "nice_to_have")
HARDNESS = ("prerequisite", "learnable")
```

Two independent fields, exactly as the technique requires — a requirement can
be a must-have that is nonetheless learnable, which is the diagnostic item the
whole grading pass exists to surface. The extraction prompt at `jobs.py:489`
defines the second axis in time terms rather than importance terms:
`"prerequisite"` when a "candidate truly cannot do the job without it",
`"learnable"` if it "can reasonably be" acquired. `rolebrief.py:75` pins the
brief's own `BriefRequirement.kind`/`hardness` to the same vocabulary "so a
brief projects losslessly onto the matching engine", and
`app/features/library/jobs/JobsTypes.ts:1` restates both as literal unions with
the reason stated in the file's first comment: they "mirror the Python source
of truth (jobs.py KINDS/HARDNESS) so an off-taxonomy value is a compile-time
error here, not a silent miscategorisation." That is the vocabulary mirrored at
the boundary it crosses — the technique's first line of defence.

## The ratio as a trainability proxy

`jobs.py:298` computes `learnable_musts` and `compute_entry_profile` folds the
ratio into a graduate-friendliness score at `:312`:

```
if musts:
    score += 0.2 * (len(learnable_musts) / len(musts))
```

and renders it in the rationale at `:329` as "3/5 must-haves learnable". This
is the technique's ratio read from the far end: the same number that tells a
recruiter their role has been specified as a person tells a student which
postings are worth applying to. The score's constants are pinned by golden
tests, with the docstring at `:287` explaining why — "this score orders the
opportunities a zero-experience student is shown, so changing any constant
deliberately must update the doc and the golden tests."

`_reinterpret_must` at `jobs.py:261` is the tenure-conversion device made
mechanical: it strips year and seniority phrasing (`\d+\+? years?`, `senior`,
`expert`, `advanced`, `extensive`) and restates the remainder as "Demonstrated
foundation in X" — "so '3+ years of React' reads as a foundation a graduate can
demonstrate through projects rather than tenure". Note that it produces
`reinterpretedMusts` as a separate field on the entry profile rather than
overwriting the requirement, which is the right shape: the restatement is a
proposal shown alongside the original, not a rewrite of what the employer
stated.

## The partition, and the incident that produced it

`JobsTypes.ts:7` is the single source of truth for the must/nice partition,
and its comment records why it exists:

> "It previously lived in two places with OPPOSITE fallbacks — `jobMarkdown`
> split on `kind === "must_have"` (so anything else fell to nice) while
> `publish` split on `kind !== "nice_to_have"` (so anything else fell to must)
> — meaning any future or off-taxonomy `kind` landed in different buckets in
> the published posting vs. the sourcing must-haves."

Both call sites were individually defensible. Together they meant an
off-taxonomy grade was simultaneously a decorative preference in the published
advertisement and a hard sourcing filter in the search — with neither reader
able to see the other's reading, and the candidates excluded by the second
never appearing anywhere the first was inspected.

The canonical rule chosen is the fail-safe direction the technique requires:

> "a skill is a must-have ONLY when `kind === "must_have"`; everything else
> (including any off-taxonomy value) is a nice-to-have, so a malformed kind can
> never be silently promoted into a hard sourcing filter."

Unrecognised falls to the non-filtering side. The function is also documented
as "tolerant of loosely-typed runtime data" — which is the honest admission
that the compile-time mirror at `:1` guards the code path and not the wire, so
the runtime fallback is genuinely load-bearing rather than defensive
decoration.

## The count control next door

`app/_lib/jd-lint.ts:82` sets `MANY_MUST_HAVES = 8`, applied at `:195` over
matches of `MUST_HAVE_RE` — an obligation-word regex covering both published
languages (`must`, `required`, `musí`, `nutn*`, `povinn*`). The comment at
`:70` states the reason as the popular premise: "a long list of them deters
under-represented applicants who self-select out unless they meet 100%." That
is the claim the subject now conditions: the 100 percent figure is an
unsourced anecdote and no test varies the count (see the golden path's cap
section). The threshold itself is unaffected, since eight is a convention the
subject never claimed was measured. Only the stated reason, and the catalog
copy that repeats it, are stale; the sibling advertising subject banks the copy
fix for the next pass over the four message catalogs.

This is the prose count, not the graded-item count, and the distinction
matters: it measures obligation language across the whole advertisement,
including obligations that leaked into responsibility and benefit sections,
which is what an applicant actually experiences. Since this application was
first written the lint takes `Math.max` of the prose count and a structured
`mustHaveCount` passed by callers that hold the graded list, so a generated
body with no marker words but a long graded list still warns; both counts run,
and one finding reports the higher. It sits beside the
inclusive-language patterns at `:14` — a neighbouring subject's control on the
same artifact, correctly kept as a separate finding kind.

## Deviations from the standard

- **The intake fast path collapses the two axes.** `intake.py:919-934` stamps
  `hardness="prerequisite"` on everything answered to the musts slot and
  `hardness="learnable"` on everything answered to the nices slot. On that
  path the learnable must-have — the most diagnostic item in the taxonomy —
  cannot be expressed, and any trainability ratio computed from a brief
  captured that way is a constant. The model-extraction path (`intake.py:143`
  asks for `prerequisite|learnable` explicitly) does grade both axes; the
  deterministic path derives one from the other and does not label the
  derivation as an assumption.
- **The parsed-ad path still fails toward the gate.** `jobs.py:242-246` fills a
  missing or off-taxonomy `kind` with `must_have` and a missing `hardness` with
  `prerequisite`, and a bare string item becomes a prerequisite must-have. For a
  posting the employer wrote, an unlabelled list item is plausibly meant as a
  requirement, so this is defensible for `kind`; for `hardness` it manufactures
  a claim about acquirability nobody made. The brief coercer took the other
  direction on 2026-09-29: `rolebrief.py:220` now falls an ungraded `hardness`
  to `learnable`, with a comment that the rubric blocks on `must_have` x
  `prerequisite` and that `kind` keeps its `must_have` fallback on purpose,
  since a must that is learnable "still ranks as a must without excluding
  anyone". That is the cell reading of the rule (the technique now states it),
  and it holds only while every consumer that gates does so on the cell. Not
  every consumer does: the publish route derives the sourcing must list from
  `kind` alone (`publish/route.ts:186`), and whether that list hard-filters
  was not traced here. Observed, not changed.
- **The two thresholds are not related to each other.** The conversational
  soft cap lives in the intake persona at `intake.py:86` ("when must-haves
  exceed six, ask the requestor to rank the top three"); the tooling threshold
  is `MANY_MUST_HAVES = 8` in the lint. Six-then-eight is the right shape —
  the machine should object above where the coach coaches — but nothing in
  either file says so, so the next person to tune one has no way to know the
  other exists.
- **No forced ranking anywhere in code.** The lint reports
  `{ kind: "manyMustHaves", count }` and stops. The technique's remedy at the
  cap is to ask for a top three, never to trim; a finding with no remedy
  attached is one step short, and the linter is the surface best placed to
  offer it.
