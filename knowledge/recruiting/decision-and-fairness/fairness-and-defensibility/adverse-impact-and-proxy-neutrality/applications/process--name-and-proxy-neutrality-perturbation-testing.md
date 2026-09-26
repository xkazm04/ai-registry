---
layer: application
type: application
subject: adverse-impact-and-proxy-neutrality
technique: name-and-proxy-neutrality-perturbation-testing
stack: process
status: forged
verified_on: 2026-09-26
applied: experiment
ab_verdict: better
---

# A name-neutrality registry over every candidate-typed scorer (Python)

The technique is realized in two layers. `pipeline/jobfit/tests/test_name_neutrality.py`
is the original suite. It is a unit test, run without an API key, which asserts
that a candidate's name cannot influence any score the deterministic matcher
produces. `pipeline/jobfit/eval/neutrality.py` is the registry that grew out of
it on 2026-09-23. It holds one perturbation set, and every function on the tree
that takes a candidate either proves invariance over that set or states why it
owes nothing. The registry's module docstring (`:1-30`) cites the technique by
name.

## Why a registry: the suite that covered the wrong function

The docstring records the gap. Name neutrality "used to be only as wide as the
engines someone remembered to perturb". Three hand-kept name lists were wired to
three different subsets of engines. "Twice a planted `-ová` penalty stayed green
because it lived in an engine no test perturbed", while about forty public
functions take a candidate: recruiter ranking, the fairness matrix, the keyless
screen that gates automated moves, rematch, winnability.

The fix has the three parts the technique now names:

- **The list is derived from the code.** `discover_candidate_scorers` (`:189`)
  walks the package's syntax trees. It returns every public top-level function
  with a parameter annotated as a candidate type, by annotation and not by name
  (`test_the_discoverer_reads_annotations_not_names`,
  `tests/test_neutrality_registry.py:83`). On 2026-09-26 it found 41 functions.
  38 of them are registered scorers with a runner and declared carrier paths.
  The other 3 are exemptions (`EXEMPT`, `:549`): the letter drafters that
  address the person by name after a decision was made, "gating nothing".
  `test_registry_is_complete` (`test_neutrality_registry.py:96`) asserts that the registered and exempt
  sets together equal the discovered set, and a new unregistered scorer fails by
  name (`test_neutrality_registry.py:102`).
- **One perturbation set, read by every suite.** `PERTURBATIONS` (`:77`) is the
  union of the three old lists. The suites import it rather than re-typing
  names, and `test_the_three_suites_read_the_one_set` (`test_neutrality_registry.py:175`) pins that.
- **The suite is proven able to fail.** `PlantedMutationTest` (`test_neutrality_registry.py:253`) wraps
  the ranking helper's scorer so that a surname ending in `-ová` loses four
  points. It asserts that the registry flags the ranking function on that axis,
  and that the unpatched tree is clean.

## The perturbation set is market-specific

The set carries one labour market's documented axes rather than a generic list:

- A male name, and a female name with the grammatically gender-marking `-ová`
  surname suffix.
- Vietnamese, Ukrainian and Arabic names.
- Two Roma-associated names, one male and one female.
- Four same-person gender pairs: the marked Czech form, its accent-stripped
  form (what a lossy PDF extract produces), a titled form, and an English
  control.
- Two gendered-prose pairs that put an honorific, a pronoun and a
  gender-inflected job title into the CV text itself.
- The transform's fallback label, "Candidate", because "no name must not be an
  advantage either".

`BASELINE_NAME = "Alex Smith"` (`:51`) is the name-shaped baseline, so that the
comparison is name against name rather than name against a missing field.

## Byte-identity, with declared carriers

For every scorer and every perturbation, the registry serializes the full
payload canonically (`canonical`, `:677`). It removes the name only from that
scorer's declared carrier paths (`redact`, `:623`) and requires byte-identity
with the baseline (`test_no_perturbation_moves_any_scorer`, `test_neutrality_registry.py:210`).
`neutrality_problems` (`:687`) also refuses a vacuous pass: the baseline payload
must carry the scorer's scored key (`:714`). A sentinel pass puts `SENTINEL`
(`:55`), a token no real name contains, into the name and fails on any path
outside the declared carriers where it turns up (`find_paths`, `:632`;
`test_the_name_reaches_only_declared_carriers`, `test_neutrality_registry.py:204`).

The original suite keeps its specific guards. It pops one sanctioned carrier
(`_score_payload`, `test_name_neutrality.py:101`), gives the gender-marked pair
its own named test (`:150`), runs a structural sentinel check over every field
except the display allowlist (`_scored_surface`, `:110`; allowlist at `:65`),
and runs a live-fixture check that the name really is still in the CV text
(`:184`), whose failure message is "the probe went dark".

## The measurement, reproduced

On 2026-09-26 the planted mutation was re-run by hand against the tree at
3aae8e801. The three pre-registry suites stayed green under it: `test_fairness`
(18 tests), `test_name_neutrality` (10) and `test_recruiter` (10). The registry
flagged two scorers, `recruiter.rank_candidates_for_job` and
`recruiter.rank_candidates_by_track`. On the clean tree it flagged none. Both
suites (36 tests) pass unpatched.

## Where it falls short of the standard

- **Only the deterministic half is covered.** Every LLM-capable callee runs
  with `provider=None`, its deterministic fallback (`:29`). "What an LLM does
  with a name is blind mode's job (redact.py), not this file's". Redaction is a
  different control. The standard asks for a distributional lane over the model
  path, and that lane does not exist.
- **One name stands for each group.** That is sound in the equality lane, where
  every name is its own case. It is not sound for a distributional lane, where
  one name's effect is not a group's.
- **The proxy half is only partly tested.** Gendered prose is perturbed now.
  Postcode, school, first language, employment gap and dialect are not, although
  those features reach the scorers.
