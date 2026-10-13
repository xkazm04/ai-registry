---
layer: application
type: application
subject: evidence-grounded-claims
technique: document-fact-extraction
stack: python
status: forged
verified_on: 2026-10-13
refresh_by: 2027-01-13
verified_against: python@3.12
applied: code
ab_verdict: better
proof: ab-paired
---

# A licence the document never states

Source tree: `kp`, the fleet's recruiting platform, public. This document covers its Python
analysis pipeline, read on 2026-10-13 at `54288e151` on `main`. The stack witness is the
continuous-integration pin, Python 3.12 (`.github/workflows/ci.yml`). The change is
`54288e151`, pushed to the project's `main` through its pre-push gate.

This is the technique's first application outside the grant-writing product. It is also the
first in another domain: the uploaded document is a CV rather than an annual return. The forces
are the same. The pipeline turns an uploaded first-party document into typed facts, and a
deterministic gate later trusts those facts without reading the document again.

## What the tree already did

Most of the technique was already code. The CV text enters the analysis prompt as delimited
untrusted data with forged delimiters defused, under a per-block character cap. The model is
told not to invent facts. A deterministic pre-pass runs over the same text first. Out-of-taxonomy
kinds are coerced at the parser rather than accepted:

- `pipeline/jobfit/gemini.py:761` "Do not invent facts that are not supported by the document or grounded sources"
- `pipeline/jobfit/pipeline.py:699` "kind=kind if kind in {"
- `pipeline/jobfit/pipeline.py:763` "credentials=_credentials_from_payload(payload.get("

Credentials are the highest-stakes kind the pipeline extracts. A deterministic gate raises a
warn for a regulated licence that the job requires and the candidate does not hold. The module
says why it exists: the model's narration alone meant
`pipeline/jobfit/credentials.py:7` "a single missed generation = a silent wrong hiring outcome with compliance exposure".

## The seam: the gate's held side read the model alone

The gate asked whether a held credential matched the licence's name cues, and the held list
was the model's typed output. That output comes from the same call that reads the job
description: `pipeline/jobfit/gemini.py:769` "Job description:". This is the technique's
"when not to use" case with one difference. Extraction is not pointed at a third-party
document. It reads the first-party document beside one.

**Chosen to falsify.** If the production model never imports a licence from the requirement
text, the check adds nothing, the arms tie, and the row reports a technique guarding a
failure that does not occur. A live probe ran the production analysis call 8 times: four
constructed CV and job pairs, two runs each, in blind mode so only text reached the model.

- In run 1 of the pair "ICU nurse" CV against "Active RN license required", the model listed
  `Registered Nurse (RN)` with issuer `State Board of Nursing`. The CV states neither. The
  gate read the licence as held and raised nothing. In the same response, the model's prose
  risk flag said the licence number and jurisdiction were "not provided in the CV text". The
  typed field and the narrative disagreed, and the trust ledger counts only the typed path.
- Run 2 of that pair listed nothing, and the gate correctly raised `credential_missing`.
- The broker and engineer pairs never imported the required licence. The engineer CV's own
  junior certificate came back correctly and did not match the required licence's cues.
- The control pair, a CV stating the licence and its number, listed it in both runs.

The finding held: the import happens, in 1 of 6 runs over unlicensed CVs.

## The change

`credential_checks` takes the CV's own text. When the model lists a required licence as held,
the text must also state it, as a name cue or the listed licence number verbatim. Otherwise the
gate raises a `credential_unstated` warn:

- `pipeline/jobfit/credentials.py:115` "def _stated_in(cv_text: str, name_res: tuple[re.Pattern[str], ...], held: list[Any]) -> bool:"
- `pipeline/jobfit/credentials.py:160` "elif cv.strip() and not _stated_in(cv, name_res, held):"
- `pipeline/jobfit/credentials.py:166` "code="

The text of record is the local extraction, which cannot invent a licence. The model's
transcript stands in only when the local extraction read nothing:

- `pipeline/jobfit/pipeline.py:495` "local_text = clean_text(pypdf_text)"
- `pipeline/jobfit/pipeline.py:499` "cv_text=local_text if local_text.strip() else raw_text,"

## Proof

Target: unlicensed candidates for a licence-gated job that pass the gate silently. Floor:
candidates whose CV states the licence get no new flag, and the rest of the gate is unchanged.

| | Arm A (list alone) | Arm B (list and text) |
| --- | --- | --- |
| Unlicensed runs passing silently | 1 of 6 | 0 of 6 |
| Stated-licence runs flagged | 0 of 2 | 0 of 2 |
| Other runs, finding codes | baseline | identical |

The replay fed the 8 recorded live outputs through both versions of the gate. The project's
Python suite ran 3,497 tests in arm B, with the same single pre-existing import error as arm A.
The 6 new tests fail on arm A. One existing wiring test changed its fixture: the CV for its
held-licence case said only "ICU nurse", which is exactly the shape the change flags. That
fixture now states the licence, and a new test keeps the old shape as the flagged case.

## What this realization cannot do

- **It catches imports, not lies.** A CV that repeats the job's words ("seeking a Registered
  Nurse position") satisfies the cue, so an imported licence beside it still passes. The
  check can only fail toward leniency. It never flags a licence the CV states.
- **For an image-only CV it checks the model against itself.** With no local text, the model's
  transcript is the only text available. A transcript that reads a licence into the document
  passes. The project's own review lens raised both limits at push time.
- **It covers required licences only.** A listed credential the job does not require is not
  checked, because nothing downstream acts on it as a gate.
- **n is small.** Eight calls on constructed CVs show that the import happens. They do not
  measure its rate on real traffic. The project's analyses store held no regulated-role CVs
  to replay.
