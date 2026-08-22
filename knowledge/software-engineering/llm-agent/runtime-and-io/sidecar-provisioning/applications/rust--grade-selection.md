---
layer: application
type: application
subject: sidecar-provisioning
technique: grade-selection
stack: rust
verified_on: 2026-08-21
verified_against: rust@1.80
---

# Grade selection in the Personas speech stack

The Voice tab provisions two independent families, and they are the two
shapes the technique describes. The **model** family is a curated catalog of
six whisper.cpp `ggml` weights (`src-tauri/src/companion/stt/catalog.rs:39-81`);
the **engine** family is the whisper.cpp binary, which upstream publishes as
a plain build and several accelerated ones. One is chosen by the user from a
picker, the other by the application on the user's behalf — and comparing
them is the clearest available lesson in what the technique asks for.

## The engine grade: chosen, justified, recorded

The installer pins one asset and says why, in the file, at the constant
(`stt/installer.rs:35-38`):

> **Plain CPU, not BLAS/cuBLAS, on purpose**: the accelerated variants are
> faster but expect extra runtime DLLs to be present, and an engine that
> fails to *start* is worse than one that transcribes slowly.

That is the technique's central instruction executed correctly. The product
did not enumerate the grades and hand the user a capacity-planning problem;
it selected, on a stated criterion, and left the override intact — the
resolver prefers whatever is already in the bin dir, so a user who wants the
fast build drops it in and is obeyed. The pin is to a tag rather than
`latest` (`:44-49`), so the grade cannot change under the button.

The one thing the engine axis does not do is *report* the grade it chose. A
machine running the plain build and a machine running an accelerated one are
the same **available** verdict, and the difference shows up only as speed the
user has no name for.

## The model grade: an honest picker, and a static recommendation

`WhisperModelEntry` (`catalog.rs:22-35`) carries the two things a grade row
needs to be legible — `approx_size_mb` and a one-line accuracy/speed
`description` — and the list is ordered "fastest → most accurate"
(`:37-38`), which is the grade axis stated as an ordering. Three doors reject
anything off the list: transcription (`whisper.rs:119-122`), download, and
delete all resolve through `find_model_by_id` (`catalog.rs:86-88`). The
catalog is an allowlist, which is source-pinning's discipline applied to the
grade axis, and it is why an unknown grade cannot enter through a filename.

The module doc also records the *reason* for the family's shape (`:8-12`):
`tiny` is "the 'it just needs to run on a potato' floor", `small` is "the
accuracy ceiling we're willing to ship by default", and medium and large are
excluded as "1.5 GB+ and too slow on CPU for a snappy turn". That is a
deliberate, argued ceiling on the family — a decision the technique wants
made and made in writing.

Where the shape stops short of the standard is instructive, because each gap
is the technique's obligations read in reverse.

**Grade is minted as identity.** Each row is its own `model_id` —
`tiny.en`, `base.en`, `small.en` and their multilingual siblings
(`catalog.rs:41,48,55,62,69,76`) — so the capability has no id of its own,
and `find_model_by_id` resolves *a file*, never *speech recognition, at
grade G*. Two consequences follow directly from
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse): the
sentence "this machine is running speech recognition at a reduced grade" has
no subject to attach to, and two installations' stored `model_id` values
cannot be compared as grades without a table that does not exist. The two
axes are also crossed into the id rather than kept apart — language coverage
is a capability question and capacity is a grade question, and `small.en`
answers both at once.

**The ceiling is disclosed, not derived.** `approx_size_mb` is documented as
approximate, with the real size arriving from `Content-Length` in the
progress events (`:31-34`) — that is, after the choice is committed. Nothing
in the path compares any figure to the host, so "Recommended default for
English" (`:52`) is a static string in a table rather than an answer about
this machine. The technique asks for a derived ceiling with headroom and a
named recomputation trigger; here the recommendation cannot go stale because
it was never computed.

Size *is* reasoned about, but for the transfer rather than for residency:
the download timeout comment sizes itself against the 466 MB models
(`downloader.rs:29-31`). That is the distinction the technique draws between
the artifact fitting and the work fitting, visible in one file.

**The output does not carry its grade.** `transcribe` takes a `model_id` and
returns text (`whisper.rs:119-129`); nothing binds the grade to the
transcript. A transcript produced on `tiny.en` and one produced on `small.en`
are indistinguishable downstream, which makes any later quality question
unanswerable and any re-judging of stored results impossible.

## What the missing half looks like in this stack

The Rust shape is small and mostly subtractive from what already exists:

- Split the crossed id. A `Capability` (speech recognition) with a
  `Grade` — an ordered enum over the capacity rows — and coverage as a
  separate field, rather than six flat string ids. `WHISPER_MODELS` becomes
  the mapping from (grade, coverage) to artifact, which is what it already
  is in spirit.
- `recommended_grade(host) -> Grade`, deriving from available memory with
  headroom rather than reading a `description` string, and invalidated on
  the same events the capability verdict already invalidates on — completed
  provisioning, eviction, settings change, explicit re-check.
- Widen the verdict. The status the Voice tab renders reports *available at
  grade G, recommended H*, so the support question "why is it worse on my
  laptop" resolves in one look. The engine axis wants the same widening,
  since its grade is currently invisible by construction.
- Stamp the grade on the result. One field on the transcript record, written
  where `transcribe` already knows the `model_id`.

None of it changes the download door, the allowlist, or the resolution
ladder — the parts this stack already does well.
