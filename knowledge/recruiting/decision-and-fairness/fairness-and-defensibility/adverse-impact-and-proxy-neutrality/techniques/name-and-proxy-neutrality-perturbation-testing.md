---
layer: technique
type: technique
subject: adverse-impact-and-proxy-neutrality
technique: name-and-proxy-neutrality-perturbation-testing
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, say-only-what-the-record-holds]
shared_with: []
use_when: [proving a scorer is invariant to a candidate's name, choosing a perturbation set for a labour market, deciding what a demographic-blind system may claim]
---

# Name and proxy neutrality perturbation testing

The one fairness test that needs no demographic data, no cohort, and no
population: hold a candidate's evidence fixed, change only the attribute under
test, and require the output to be **identical**. It is the fairness work that
is always available, it runs in continuous integration, and it produces a claim
that is falsifiable in a way a selection-rate ratio never is.

## The claim it makes, exactly

"For this scoring function at this version, over this perturbation set, the
full scored output is byte-identical." That is a statement about a function,
bound to the version that was tested and to the set that was perturbed. It is
not a statement that the process produces balanced outcomes, and any summary
that lets a reader hear the second is a false claim. When the model, the
prompt, the rubric or the post-processing changes, the claim expires with it.

## The perturbation set

The set is the whole test. A generic list borrowed from another market tests
axes that market does not have and misses the ones it does.

Build it from **the discrimination axes the specific labour market actually
carries**, which typically means:

- **Sex**, including the market's grammatical conventions — in languages where
  surnames take a gender-marking suffix, the suffixed and unsuffixed forms are
  a distinct axis on top of the given name and must both appear.
- **Ethnic and national-origin naming conventions** present in that labour
  market's real applicant flow — the region's own historical minorities, not
  an imported set.
- **Migration-background markers**: transliterated spellings, diacritics
  present and stripped, name orders that invert given and family name.
- **Proxies that are not names at all**, which is where most real leakage
  lives: postcode and address region, secondary school, first language, a
  military or national-service line, a gap in employment, a graduation year
  that discloses age, a professional body or a certification that tracks a
  national origin.

Every entry pairs with a base résumé that is held **byte-identical apart from
the perturbed token**. Perturbing two things at once produces a test that
cannot say which one moved the score. Intersectional pairs are worth adding as
their own cells, deliberately, not as an accident of an unfactored set.

## Exact equality, not a tolerance

**Any non-zero delta is the bug.** A half-point difference between two
identical résumés under different names is not within tolerance; it is the name
reaching the score, and the tolerance is the mechanism by which it keeps
reaching it. Compare the *full* scored response — every score, every band,
every flag, every rationale string — not just the headline number, because a
rationale that shifts wording while the number holds is the same leak one layer
down, and the wording is what a recruiter actually reads.

**One sanctioned display carrier.** A scored payload usually needs to echo the
person's name once, in a display label, so a human knows whose result they are
reading. Declare that one field, normalise it before comparison, and assert
that the name appears **nowhere else** in the payload — including inside
rationale prose, where it leaks most often. One carrier, declared in the test,
or none. A second carrier discovered later is a finding, not a fixture update.

Where a downstream reasoning layer legitimately needs the person's own words —
excerpts, links, quoted evidence — those fields are enumerated as an explicit
allowlist and the structural check runs over the **complement**: every field
that can reach the scorer, and nothing else. An allowlist that grows without a
reviewer is how the exception eats the rule; each entry states why that field
cannot reach a score.

## The four ways an equality suite passes while proving nothing

An assertion of identity is the easiest assertion in the world to satisfy
accidentally. Each of these has to be defended explicitly, in the suite itself.

1. **Vacuity.** If the fixture produces no matches — an empty job corpus, a
   filter that excludes everything, a payload that is `[]` on both sides — every
   perturbation is trivially identical and the suite is green theatre. Assert
   that the run actually produced scored output before comparing it.
2. **A missing-field baseline.** Comparing "a name" against "no name" tests a
   different hypothesis: a branch reading *is a label present* fires identically
   on both sides while a name-*value* dependence goes undetected. The baseline
   must itself be a plausible name, so the comparison is name against name.
3. **A dead probe.** A fixture that stops carrying the perturbed token — the
   name no longer reaches the field the test believed it reached — passes
   forever. Assert the positive too: the sanctioned carrier really does contain
   the name, and where the fixture places the name inside free text, that text
   really does still contain it.
4. **Behaviour without structure.** Byte-equality catches leakage that already
   moves a number. Add a **sentinel structural check**: score one candidate
   whose name is a distinctive nonsense token, serialise every field that can
   reach the scorer, and assert the token does not appear anywhere in it, case
   folded. This catches the refactor that folds a display label into a scored
   text feature *before* it produces a measurable delta — the cheapest possible
   moment.

Two further design notes earn their keep. The **most sensitive pair gets its
own named test** in addition to the loop, so a failure on the purest axis reads
as itself in the output rather than as one subtest among seven. And the suite
covers the name **as it appears in real evidence** — a real résumé contains the
person's name in body text, headers and project titles, so the name-in-text
variant must be byte-identical to the baseline too, not just the name-in-field
variant.

## Determinism is a prerequisite, and it is not free

A generative scorer may vary between two identical calls even at a fixed
sampling temperature. Testing perturbations against a non-deterministic
function measures noise and reports it as bias, or worse, passes because the
noise happened to cancel.

**Run a self-pair control first**: the same input twice, asserted identical. If
the control fails, the neutrality suite cannot run as an equality test, and the
fix is one of — pin the decoding to a genuinely deterministic path, hold only
the structured decision fields to equality while routing free text to a
separate distributional lane, or move the equality assertion to the
deterministic layers that surround the model (feature extraction, gating,
thresholding) and treat the model lane as a statistical test over many pairs
instead. What is not acceptable is quietly loosening the assertion into a
tolerance so the suite goes green.

## Decision rules

- **Run it in the gate that blocks a deploy**, not on a schedule. A neutrality
  claim tested weekly is untrue for up to a week at a time.
- **A failure names the token, not just the pair.** The report says which
  perturbation moved which field by how much. "Suite failed" sends an engineer
  to a diff; "the suffixed surname form lowered the communication band" sends
  them to the cause.
- **Extend the set when the market changes.** New sourcing region, new
  language, new role family — the set is a living artifact and its last review
  date belongs in the governance record.
- **Never fix a failure by removing the input.** Stripping names from the
  payload defeats that suite and leaves every proxy in place; redaction is a
  legitimate separate discipline with its own subject, and it is not a
  neutrality result.

## When not to use this

- **As a substitute for outcome analysis.** Invariance to the tested set says
  nothing about the postcode you did not test, and nothing at all about the
  selection rates a population actually experienced. A system that passes this
  suite and has never computed a selection-rate ratio has one fairness result,
  not two, and must say which one it has.
- **As a claim about the humans.** The suite tests a function. The recruiter
  reading its output is not covered, and the largest name effects in hiring
  have always been human ones.
