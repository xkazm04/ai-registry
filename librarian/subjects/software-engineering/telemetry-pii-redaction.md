---
subject: telemetry-pii-redaction
domain: software-engineering
last_touched: 2026-08-27
dry_streak: 0
---

# telemetry-pii-redaction

First touch: [[2026-08-22-4]] — the 2026-08-22 harvest wave. Class: NEW.

## State

6 techniques, 2 react applications. Web-hardened before drafting. Golden path 286 lines. The technique layer was read in full by the director at review; it is the wave's quality reference.

## Open leads (banked, with return conditions)

- **guard-failure-is-not-consent** (proposed law, not added). When a control cannot complete, the safe direction denies rather than forwards. THREE sightings, two of them in EXISTING subjects outside this wave (`audit-logging`/write-path-sanitization, `data-retention`/destructive-override-floor). The strongest law proposal of the wave on external evidence. Return next sweep with a cross-domain check against `llm-observability`.
- Cross-subject finding: `one-authority-per-vocabulary` has no stated answer for a vocabulary that CANNOT be shared — here a denylist mirrored into a second-language runtime. The worker wrote a local reconciliation rule; the law may want the general statement.

---

## Touch 2 — 2026-08-27, `/intake` from [[../../sources/2026-08-27-openwiki-self-correcting-memory]]. Class: EXTENDS.

6 -> 7 techniques. Golden path gains one section before "Where this subject
stops". Applications unchanged at 2.

## Why the home was contested, and the argument that settled it

The candidate — *an input exclusion is not an output guarantee* — mapped to no
subject cleanly. `prompt-safety` frames every technique around hostile spans
attacking the model, which this is not. `prompt-assembly` owns what goes *into*
a prompt, and disclaims safety explicitly. `retrieval` has scope leakage but in
the vector sense. Four candidate homes, none obviously right, which the method
says is the signature of an interesting finding rather than a bad one.

What settled it: **every existing technique in this subject rests on an
assumption the finding breaks.** Keyed drops, pattern passes, caps and absence
assertions all require the sensitive value to *pass through* the pipeline as a
value. A composed artifact — a generated report, a written summary — never
contains one: the fact is reconstructed from other material, so there is nothing
for a scrubber to match and nothing for `redaction-invariants-as-tests` to assert
the absence of. The subject's stated job is *where the control must sit*, and the
finding answers exactly that for a new emitter class. That is the test the method
prescribes — whose stated job does this answer — and it beat slug proximity.

## What landed

**`exclusion-bounds-reads-not-output`** — the two guarantees an exclusion list
is read as making (*this material was not read* is what it delivers; *this
material is not described* is what the reader assumes), and why the second needs
a control at the publish boundary. `gate-sees-target` in pure form: the control
is applied to inputs, the artifact is what anyone cares about, and the gate never
observes the artifact at all. The absence assertion cannot carry it, because an
absence assertion needs a value to assert the absence of — so a suite that pins
known secrets and passes reports something far narrower than its summary line
implies. The replacement is a classifier or a reviewer, which makes it a sampling
control with a false-negative rate rather than a proof, far more expensive per
artifact, and dependent on the exclusion list as its *input* — the two are a pair
rather than alternatives, and an exclusion list with no publish-side check is a
half-built control that looks finished.

## Honest limits

- No realization. Both applications here are telemetry scrubbers with values in
  hand; nothing in reach exercises a composed-artifact emitter. The technique
  rests on the source's own stated limitation plus redaction-versus-inference
  convergence, not on a tree anybody opened.
- The scope sentence was written carefully because the subject's opening frames
  itself around a record changing custodian. A generated artifact that ships is
  argued to be the same crossing; a reviewer who disagrees would move this to a
  future agent-scoping subject, and that would be a defensible call.
