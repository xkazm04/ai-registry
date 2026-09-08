# Assay scorecard

One row per run, appended at Phase 11 lane 0, no exceptions. `dev` is the deviation rate:
the share of finding groups where the operator departed from the recommendation. **It
should fall as `taste.md` fills.** If it does not, the ledger is recording diary entries
rather than rules, and that is the finding.

| version | date | source | class | cand | new | enrich | example | lesson | lead | discard | accepted | dev | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

| 1.0.0 | 2026-09-07 | gbrain | skills library | 24 | 3 | 13 | 0 | 0 | 3 declined | 1 class (10) | 16 | 1/4 | rich |
| 1.1.0 | 2026-09-07 | spellbook | skills library | 62 | 3 of 4 | 22 | 2 | 0 | 1 accepted | the catalogue class (34 of 45) | 27 of 28 | 1/4 | rich |
| 2.0.0 | 2026-09-07 | agentic-awesome-skills | skills library (aggregated) | 30 | 1 | 0 of 3 tested | 0 | 0 | 1 accepted | 6 groups (~2,000) | 3 of 3 | 0/3 | thin, and measured |
| 2.1.0 | 2026-09-07 | awesome-agent-skills | **link index (route only)** | 6 | 0 (1 walked, dropped to lead) | 2 of 4 tested | 0 | 0 | 1 accepted | the template class (~137 of 145) | 3 of 3 | 0/3 | barren as a source, routed |

**Weakest stage after one run: `example`.** Zero landed. The source was a skills library
whose own integration folder turned out to be install configuration for its product, so
the one disposition that carries concrete connector knowledge was never exercised. The
next run should be a source with real connector documentation, or that path stays unproven.

**Deviation rate 1 of 4** is the baseline, not a result. It means something only against
the second run.

**`example` is no longer the weakest stage.** Two landed, and the prediction that a source
with real connector documentation would settle it was right about the source and wrong
about how to find the class in it. The name filter is inverted for this disposition; that
is now in `SKILL.md` (1.5.0).

**~~The new weakest stage is `lesson`: zero in two runs, and it cannot be otherwise while
every source is a skills library. The next source must not be a skills library, or the
stage stays unexercised for a third time.~~ CORRECTED the same day, before run 3 acted on
it.** `lesson` is not weak, it is **unreachable**, and no choice of source fixes it. The
lane's entry format is `## <version used> - <date> - <project>` and the version is *our
recipe's*. A lesson asserts that our recipe at that version ran in that project. Nothing
external can assert that. Lessons come from our own executions and from nowhere else, so
an empty `LESSONS.md` is an argument for running the recipes rather than for assaying
harder. `lesson` is now excluded from this scorecard's stage comparison; counting it as a
stage was the error.

**So the honest weakest stage after two runs is `example`, at 0 then 2**, and the thing to
watch is whether it holds on a source that is not a skills library.

**Deviation stayed at 1 of 4, and the raw number is misleading.** Read alone it says the
taste ledger is not working. What actually happened is the opposite: run 1's rule was
about leads, this run applied it by proposing exactly one lead carrying a concrete return
condition, and the operator accepted it, so **the ledger converted what would have been a
deviation into an acceptance**. The remaining deviation came from a class that had no rule
yet, new recipes, and now has one.

So the metric needs its denominator read: deviations should fall **within a class that has
a rule**, and a new class will keep producing them. Track it that way from run 3, and
treat a deviation in a class the ledger already covers as the real alarm.

**The reason this run cost more than gbrain and was worth it:** 62 candidates against 24,
five evaluators against a lighter pass, and two gate defects surfaced that had nothing to
do with the source. The source's own worst practices were the most transferable thing in
it, because each was a mirror: a self-contradicting doctrine, a uniqueness gate blind to
duplicated content, and a verification step only one machine can run.

## Validation, from 2.0.0

`VALIDATION.md` adds three protocols. From run 3 every row also carries the A/B verdict
distribution, because a run reporting only what it landed is reporting its intentions.

**First measurement, taken retroactively against six enrichments already shipped in
`98f0fcfd`.** Sampled deliberately toward the weak, since an instrument that confirms
everything has measured nothing.

| enrichment | confidence when shipped | A/B verdict |
|---|---|---|
| false-green aggregate exit code | high | **confirmed** |
| present / configured / observed-loaded classing | high | **confirmed** |
| zero competitors is a reading about demand | high | **confirmed** |
| blind comparison rather than a score | medium | **non-discriminating** |
| a stopping rule keyed on failed attempts | low | weakly discriminating: it changed the reasoning and the durable record, not the decision |
| an evidence-of-failure bar on a deviation | low | **non-discriminating** |

**The verdicts rank exactly with the confidence assigned before any of it ran.** That is the
strongest single result available here: it says the A/B is measuring something real, and it
says the confidence ratings were already carrying information. It does not make the ratings
sufficient, because a rating cannot tell you which specific sentence falls on which side.

Two of the six are inert as shipped and are candidates for removal. Both were flagged by
their own authors, one in the words "the one I would drop first". The swap test passed both.

## After three runs

**Deviation rate: 1/4, 1/4, 0/3.** It fell, and the two standing rules in `taste.md` were
both live in run 3: the lead carried a concrete return condition, and no medium-confidence
new recipe was proposed. That is the ledger doing the job it was built for, on a sample of
three, which is worth exactly what a sample of three is worth.

**The stage the funnel now loses most at is `enrich`.** Runs 1 and 2 landed 35 between
them on a swap test and an opinion. Run 3 tested three and landed none, and two of the
three base arms outperformed their enriched twins. The loss has moved: it is no longer
candidates failing cross-check, it is enrichments failing to change behaviour. Whether
that is a property of a mature corpus or of this run's fixtures is the open question in
the followup table, and it should be settled before another run spends its budget here.

**`example` is still unproven at zero across three runs.** Run 3 hunted it deliberately
with the inverted name filter and returned a clean negative: the source's connector
skills are one template with the vendor name swapped. Three sources, no examples. The
disposition has still never been exercised, and the next source chosen should be one with
real connector documentation or it stays unproven indefinitely.

**Run 4 partly answers run 3's open question: `enrich` is not dead, and the fixtures were
half the problem.** Run 3 tested three enrichments and landed none, and asked whether that
was a mature corpus or its own fixtures. Run 4 tested four and landed two, which rules out
"the corpus generalizes past every external sentence". It also reproduced the fixture
defect independently: two of four fixtures inventoried the evidence the enrichment was
about and both returned NON-DISCRIMINATING, while a third carried the same defect and
CONFIRMED anyway. That third case is the control, and it points one way - **the defect
manufactures false ties, not false confirmations.** So every CONFIRMED across runs 3 and 4
stands, and every inert verdict taken on an inventorying fixture is provisional. Fix
VALIDATION.md section 3 before spending another A/B budget.

**Confidence did not predict the verdicts, and this is now measured rather than suspected.**
Run 4 ranked its four enrichments before testing. The one rated strongest -
a clean failure mode that passed the three-part derivation bar - came back
NON-DISCRIMINATING with both arms reaching the same refusal independently. The weakest,
which was expected to be already-held, CONFIRMED. Ordering by author confidence is not a
way to spend a partial A/B budget; VALIDATION.md already says spend it on the weak ones
first, and run 4 is the evidence for why.

**`dev` has been 0 for two consecutive runs.** The taste ledger is doing its job: both of
run 4's recommendations that could have deviated (a medium-confidence new recipe, and a
lead) were pre-resolved by rules already written down, and the run proposed what the
operator would have chosen. The rule against medium-confidence new recipes fired for the
first time on a live proposal and demoted it before the screen.

**`example` is now unproven at zero across four runs.** Run 4 hunted it with the inverted
name filter across two 70-skill libraries and returned another clean negative: PM
libraries carry no connector knowledge at all. It also established why the obvious route
will not fix this - the corpus already holds 139 example files covering exactly the
vendors an aggregated index features. The disposition needs a source with connector
documentation the corpus has no example for, or it should be retired as unreachable.

| 2.1.0 | 2026-09-08 | kp-jd-candidates | **candidate index (JD-derived)** | 147 | 20 | 0 (none proposed) | 0 | 0 | 0 | 127 (7 groups) | 20 of 20 | n/a, gate substituted | rich, and a new source class |

**Run 5 was the first source that was not somebody's writing.** It was a machine-mined
candidate index over 50 real job postings: an address plus verbatim evidence per row, with
no craft attached and no opinion to import. That inverts the usual failure. A skills
library tries to author the lane; a candidate index cannot, because it holds no judgment
at all, so every `need`, `core_action` and failure mode had to be supplied here. The
run's whole cost moved from cross-checking to authoring.

**It also explains the enrichment drought.** Zero enrichments were proposed and that was
not caution: a source with no judgment in it cannot sharpen one, by construction. Only
`new-recipe` and `discard` are reachable from this class, and a future run against a
candidate index should expect exactly those two and budget accordingly.

**The discard classes were where the reading happened.** 127 of 147, and the two largest
were the same shape twice: work executed in person on physical objects, which no
connector-bound agent can hold, and a second posting describing a craft already authored
from the first. Both are properties of job postings rather than of this source, so both
will recur at the same size on the next JD-derived index.
