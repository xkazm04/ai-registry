---
layer: application
type: application
subject: adverse-impact-and-proxy-neutrality
technique: name-and-proxy-neutrality-perturbation-testing
stack: process
status: forged
verified_on: 2026-08-20
---

# A name-neutrality suite over a deterministic scoring engine (Python)

`pipeline/jobfit/tests/test_name_neutrality.py` is the technique realized end to
end: a unit test, run without an API key, that asserts a candidate's name cannot
influence any score the deterministic matcher produces. Its module docstring
(`:1-27`) states the claim in the standard's own shape — what is under test, why
the name specifically, and what the claim does *not* cover.

## The mechanism it pins

The docstring names the exact path that makes the test necessary: the profile's
`display_name` survives the transform as `MatchCandidate.label` (unlike
`education_detail`, which is dropped before matching), so the name is *present*
in the object the scorer receives. The invariant is therefore not "the name is
absent" but "the name is display-only": `match()` may echo it in the
`candidate.label` block, "but no score, tier, breakdown, confidence band,
ranking, or KO decision may differ between two candidates who differ ONLY in
name".

## The perturbation set is market-specific, one axis per entry

`NAME_VARIANTS` (`:51-59`) has seven entries chosen for one labour market's
documented discrimination axes rather than a generic list: a male and a female
name where the female form carries the grammatically gender-marking `-ová`
surname suffix — the purest available gender proxy in that language — plus
Vietnamese, Ukrainian, Arabic, and two Roma-associated names (one male, one
female, chosen for the given names and surnames the market actually associates).
The comment above the dict records which part of each entry is the proxy, so a
later maintainer cannot flatten the set by accident.

`BASELINE_NAME = "Alex Smith"` (`:45`) is the standard's name-shaped baseline,
with the reasoning written out: a placeholder rather than `None` "so the
comparison is name-vs-name, not name-vs-missing-field", because a hypothetical
"any label present" branch "would fire identically on both sides and only a
name-VALUE dependence can produce a diff".

## Byte-identity, with one sanctioned carrier

`_score_payload` (`:103-110`) serializes the full `MatchResponse` with
`sort_keys=True` and pops exactly one field — `candidate.label` — returning the
bytes and the popped label. `test_name_never_moves_any_score` (`:138`) subtests
every variant against the baseline bytes and *also* asserts the popped label
still equals the name, so the carrier is proven live rather than assumed. The
failure message names the harm rather than the assertion: "a gender/ethnic proxy
reached the deterministic scoring path".

`test_gendered_surname_pair_scores_identically` (`:152`) spells the most
sensitive pair out as its own named test, exactly as the standard asks.

## The three anti-vacuity guards

- **Non-empty run.** `test_corpus_is_nonempty` (`:132`) asserts the job corpus
  loaded and that the baseline payload actually contains matches, with the
  reason stated: "A 0-job corpus would make every payload trivially identical
  (green theater); the neutrality claim is only evidence if real matches ran."
- **Structural token absence.** `test_name_absent_from_every_scored_field`
  (`:160`) scores a candidate named with a sentinel token, serializes every
  `MatchCandidate` field *except* the display allowlist via `_scored_surface`
  (`:112-118`), and asserts the token appears nowhere in it, case folded — "to
  catch a future refactor that folds the label into a scored text feature even
  before it produces a measurable delta". It then asserts the carrier does hold
  the sentinel, so the probe cannot go dark.
- **Live fixture.** `test_name_in_cv_text_reaches_only_display_fields` (`:186`)
  asserts the name really is still in the highlights, with the failure message
  "the fixture stopped putting the name into the CV text — the probe went dark".

## The name where it really lives: free text

`test_name_in_cv_text_does_not_move_scores` (`:172`) rebuilds the profile with
`name_in_cv_text=True`, which threads the name into an evidence title and an
evidence body ("Built by {name} as a bachelor thesis") — where a real résumé
carries it — and asserts the payload is still byte-identical to the baseline.
This is the variant most name-swap suites omit and the one that catches
free-text feature extraction.

## The allowlist and its stated justification

`_DISPLAY_ONLY_FIELDS = {"label", "experience_highlights", "work_links"}`
(`:67`) is the explicit complement the structural check runs against, and each
entry carries its reason inline: the sanctioned carrier, CV excerpts for the
reasoning layer, and URLs for the reasoning layer. "Everything else feeds (or
may feed) `score_job`/`ko_filter` and must be name-free."

## Where it falls short of the standard

The suite covers the deterministic engine only; the docstring is explicit that
the generative reasoning layer, which *does* see the label, is "covered by the
blind-mode / redaction path, not here". Redaction is a different control, and
the standard's requirement — an equality lane where the model is deterministic
or a distributional lane where it is not — is unmet for that layer. The
perturbation set is also names-only: no postcode, school, first-language or
employment-gap axis is perturbed, so the proxy half of the technique is
untested even though those features reach the scorer.
