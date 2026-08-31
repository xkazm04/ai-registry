---
layer: technique
type: technique
subject: machine-authored-documentation
technique: packaged-surface-evaluation
status: forged
laws: [gate-sees-target, count-carries-predicate, one-authority-per-vocabulary]
shared_with: []
use_when: [benchmarking a generator that ships as an installable package, an evaluation ran inside the development repository, comparing two generator configurations, a benchmark score does not reproduce for users]
---

# Evaluate the surface people install, not the tree it was built in

A generator that ships as a package — an agent skill, a prompt bundle, a
template kit — exists as two artifacts. There is the development repository:
source, tests, benchmark cases, reference fixtures, design notes, the history
of every decision. And there is the extract users install: the instruction
file, the schemas, a handful of examples, the runtime. Evaluating the first and
shipping the second is
[gate-sees-target](../../../../_laws.md#gate-sees-target) at the widest scope
it reaches, and it is the default because the benchmark harness naturally lives
where the code lives.

The gap is not a matter of a few missing files. In the development tree the
model is working **inside the answer key**:

- The test suite enumerates the edge cases the generator handles, with the
  expected output beside each one.
- The benchmark fixtures show what a passing document looks like for this exact
  case, in this exact format.
- The design notes explain the intent the case is probing.
- The validator source states, in code, the precise condition the deterministic
  gate will apply — so a model that reads it can satisfy the check rather than
  the requirement.

Every one of those changes the measured number, and none of them will be
present when a user runs the same task. The result is not merely optimistic; it
is a measurement of a configuration that will never exist again.

## The two separations

**Separate the surface.** Generate candidates from the extracted package
produced by the commit under test, not from the repository root. This is the
same discipline the corpus applies to a vendored specification — the check
reads the actual shipped bytes — pointed at an evaluation instead of a drift
test. It also catches a defect class nothing else catches: content that exists
in the repository and does not survive packaging. A reference the instruction
file points at, a schema the packager's include list forgot, an example
directory excluded by a build script — each is invisible in every
repository-root run and fatal in every user's.

**Separate the harness.** Keep the cases, the prompts, the reference fixtures
and the verifier outside the model-visible working tree, and deliver the
selected prompt through an external runner. Two distinct things go wrong when
they sit inside it:

- *Evidence leakage.* The model reads the case file and learns the required
  keys, the accepted vocabulary, the exact relationships the grader will
  demand.
- *Exploration-cost distortion.* Even unread, benchmark internals change the
  tree the model is navigating — its file listings, its search results, its
  sense of what this project is. A model that spends its first three tool calls
  discovering a benchmark directory is not running the user's task.

The runner also owns what the harness must not: authentication, model
selection, timeouts, prompt delivery, and raw transcript retention. Keeping
provider code out of the generator's repository is a secondary benefit; the
primary one is that the harness stays deterministic and therefore
reimplementable by someone who does not trust yours.

## The fair-run protocol

Two configurations are comparable only when everything except the configuration
is pinned. State the list explicitly, because each unpinned item has been the
whole explanation for a difference somebody published:

- the same prompt, byte for byte;
- the same repository commit *and* the same package digest — the commit alone
  is insufficient, because packaging is a build step and can differ;
- the same schemas and instruction file;
- the same time limit and the same tool access;
- a clean candidate output path, so no prior run's artifact can be mistaken for
  this one's;
- the exact agent and model names recorded, not a family name.

**One complete invocation is attempt 1.** The candidate is frozen when the
invocation ends, and the freeze is what the number is measured over. Two
clauses draw that line where it is actually ambiguous:

- **In-invocation self-repair is inside the arm.** A generator that ships its
  own validator is *meant* to be used with it; a model that validates and
  repairs before handing over is exercising the product as designed, and
  forbidding that measures a configuration nobody ships. What is measured is
  the invocation's final output.
- **Out-of-invocation repair is a different arm.** A later correction may never
  replace attempt 1 — not the model's second try, and above all not a human's
  edit. Correction attempts are worth keeping for diagnosis and they belong in
  their own column with their own name.

The external harness independently re-validates the frozen file and is the
final authority. A generator that grades itself has produced a claim about its
own opinion.

## What the receipt must carry

The number travels, so it carries its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): the
package digest, the commit, the case set, the attempt index, the reviewer
identity where a human gate ran, and the verifier version. The last one is not
decoration — it is the field that makes
[rescored-baseline-uplift](./rescored-baseline-uplift.md) possible at all, and
a result set without it cannot be re-scored later because nobody can tell what
scored it the first time.

Two honesty clauses that cost nothing and are routinely dropped:

- **Reference fixtures are not evidence.** The checked-in examples that prove
  the suite and verifier are wired correctly will score beautifully, because
  they were authored to. Mark the manifest that holds them as
  integrity-purpose, and never publish their scores as model results.
- **No result is checked in before the runs and the reviews have actually
  happened.** A results file that exists before its evidence is a placeholder
  that will be read as a finding.

## Decision rules

- **When packaging is expensive, package anyway** — but cache it: the package
  digest is the identity, so an unchanged digest reuses the extract. The cost
  is per generator change, not per run.
- **When the generator has no packaged form** (it is a service, or a repository
  users clone whole), the surface separation is moot and the harness separation
  is not. Do the second half.
- **When a case must reference a fixture**, reference it by path from the
  harness side and never place it where the model can list it.
- **When latency is recorded, record it as operational context.** A slow
  correct document is correct. Time is not a usability gate unless the product
  contract says it is, and mixing it into a quality score makes both
  uninterpretable.

## When not to use this

Not for evaluating a generator you are actively debugging — during development
the answer key is the point, and the repository-root run is the fast loop. The
rule binds when a number is going to be *published* or used to decide a ship.
