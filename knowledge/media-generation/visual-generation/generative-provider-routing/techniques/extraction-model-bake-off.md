---
layer: technique
type: technique
subject: generative-provider-routing
technique: extraction-model-bake-off
status: forged
laws: [unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
use_when: [choosing a model to label or extract structured fields at corpus scale, deciding whether a local model can replace a metered API for a bulk job, a frontier model is assumed best without measurement, comparing candidate vision or extraction models]
---

# Extraction-model bake-off

Routing a *generation* capability asks which vendor makes the better picture.
Routing an *extraction* capability — labelling, annotating, reading structure
out of assets — asks a harder question, because the output is not something a
human can eyeball at a glance and rank. Ten thousand annotations all look
equally plausible. The failure mode is therefore silent: a model that is
confidently, consistently wrong about one field poisons a corpus, and nothing
in the output announces it.

Extraction is also the capability where the local tier competes hardest. A
generation model may be years behind its hosted equivalent; an extraction
model only has to read what is already in front of it, and at bulk volumes the
metered tier is the one that has to justify itself. That makes the measurement
worth doing properly rather than assuming the frontier row wins.

## The procedure

**1. One schema, one prompt, every candidate.** Write the extraction contract
once and constrain every backend to it — a JSON-schema field locally, the
equivalent structured-output parameter on each API. If one candidate is asked
a friendlier question than another, the bake-off measures prompt luck. This is
the step people skip, and skipping it invalidates everything after it.

**2. Build a truth set you own.** Score against known answers, not against
another model's answers. The cheapest honest source of truth is *assets you
generated yourself*, where the brief specified the very properties being
extracted. Grade only the fields that are **also unambiguous in the artefact**:
a prompt is a request, not a label, and a generator that ignored an instruction
would otherwise be recorded as the model misreading it.

**3. Grade truth and agreement in separate columns.** Agreement with the
incumbent is a cheap proxy that says *where to look*. It is never the verdict —
see the decision rules below.

**4. Measure determinism as its own axis.** Run each candidate over the same
input several times at temperature zero and count how many closed-vocabulary
fields come back identical. This is not a tiebreaker; it is a first-class
criterion, and it is the one that most often reverses the ranking.

**5. Count structural faults as disqualifying.** Invalid output, missing
fields, values outside the controlled vocabulary, free text that ignores stated
limits. A candidate that fails here is unusable as a labeller however good its
judgement is, and structural faults are the cheapest thing in the whole
procedure to detect automatically.

**6. Report cost in the units of the job.** Seconds per item and resident
memory, not price per token. The question being answered is whether the corpus
is a weekend of local compute or a metered bill that scales with ambition.

## Decision rules

- **The reference model is not ground truth.** Score the incumbent against the
  same truth set as every challenger. Expect it to lose points — when it does,
  a bake-off that ranked by agreement-with-incumbent was ranking challengers by
  how well they *imitated a specific pattern of errors*.
- **Prefer reproducible-and-biased over accurate-and-noisy.** A systematic
  error is a correction you apply once to the whole corpus. Run-to-run drift is
  irreducible noise that no downstream pass can subtract. At corpus scale this
  routinely outranks a several-point accuracy gap.
- **Grade ordinals with partial credit.** On a graduated scale, adjacent is a
  near-miss and distant is an error. Flattening the two hides exactly the
  distinction that tells you whether a model understands the scale at all.
- **Structured-output enforcement is a property of the TIER, not the model.**
  The same weights can honour a schema strictly on one endpoint and ignore it
  entirely on another — including two endpoints run by the same vendor. Verify
  enforcement per endpoint, never inherit it from the model's name.
- **Leave genuinely contestable fields ungraded and route them to a human.**
  A truth set padded with judgement calls stops measuring truth. Surface those
  splits as adjudications; each ruling becomes truth for every later run.

## Failure modes

- **Ranking by agreement with the frontier row**, then discovering the frontier
  row was wrong — and that the "best" challenger was the best mimic.
- **Single-shot scoring**, which cannot see run-to-run drift at all and will
  hand the job to the least reproducible candidate.
- **A truth set built from prompts rather than artefacts**, which charges the
  extraction model for the generator's disobedience.
- **Upgrading the runtime mid-bake-off** and comparing across versions. If it
  cannot be avoided, re-run one settled candidate on the new version and show
  the graded fields did not move before pooling the results.
- **Assuming the hosted tier of an open-weights model behaves like the local
  one.** Same family, same tag, different contract.
- **Deleting the losing weights before the annotations are archived.** The
  evidence is the recorded output, not the model; archive first, then reclaim
  the disk freely.
