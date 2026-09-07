---
layer: application
type: application
subject: conformance-checking
technique: inline-predicate-rung-inference
stack: bash
verified_on: 2026-09-06
verified_against: bash@5
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Rung inference against a containerized-toolkit spec sheet

The stack version is witnessed by the CLI's own source: a single 13,081-line
shell script using bash 5 constructs (associative arrays, `${var,,}`), run
under `bash` on every distro row of the project's test matrix. The toolkit
release the tree carries is `0.5.6`, agreed by its `package.json` and
`pyproject.toml`.

## What the tree does

The project runs on an inline-predicate specification. A single sheet at the
repository root holds every claim about the system, and the process around it
is stated in the contributor guide as law: *"Every change starts with a fact.
Facts are the spec — they define what done means. Code that isn't described by
a fact is unverifiable and will be treated as incorrect."* Each entry is a
natural-language claim; most carry a `command:` line, a shell one-liner whose
exit status settles it. Claims with no command are rendered as `?` and the
guide requires each to be discharged by reading the code, explicitly warning
that *"reporting N manual without verifying each one is not acceptable"* —
which is the manual-remainder rule of the technique, already correct here.

The sheet is not a toy: **593 claims, 98 sections, ~30,000 words**, tracked
through a `@draft` → `@spec` → `@implemented` lifecycle.

## A and B

The paired arms are two classifiers over the same 543 commands, on the same
instrument, differing only in how the invoked binary is identified.

- **A — substring match.** Search the whole command string for a binary name
  from the execution set. This is the obvious implementation and the one a
  reader would write first.
- **B — head-of-segment match.** Split each command on `&&`, `||`, `;` and
  `|`; strip wrappers (`cd <dir>`, `env`, `sudo`); take the binary at the head
  of each remaining segment; rank the command at the highest rung any segment
  reaches.

The measurable named in advance: **the share of predicates at the execution
rung.**

| Arm | presence/text | shape | execution |
| --- | --- | --- | --- |
| A — substring | 54.7% | 0.6% | **40.0%** |
| B — head-of-segment | 62.8% | 16.0% | **20.8%** |

A overstated execution by **1.9x** in this tree, and its intermediate form —
before wrapper resolution — read 7.2%, so the error is not monotone and cannot
be corrected by a fudge factor. Both classifiers were asserted against one
hand-written command per rung before either number was quoted; A passes those
three assertions and is still wrong on the corpus, which is the point of the
technique's warning that a rung classifier inherits the bias of whoever writes
it.

Verdict **better**, on the measurable and on the same inputs. B is the arm
whose number can be quoted.

## The structural fact

Coverage is **91.6%** (543 of 593 claims carry a command) and the project's own
tooling reports it as a single tally. Under B, **57.5% of the entire
specification is proven by a text match on a file** — a `grep -q` for a literal
such as a pinned image version in the defaults file. Those render identically
to the executed fifth, because the format has one `command:` field and one
success symbol.

This is not a defect in the individual predicates. A claim that says the
defaults file *pins* a version is honestly a text check and should stay one.
The defect is that the sheet's headline number answers "has a command" while
being read as "is proven", and the two are roughly five times apart at the
execution rung.

The tree also supplies the fragility half of the technique for free, and it is
the negative evidence worth recording. Several text-rung predicates check for
an exact interpolated string — an environment assignment spelled one specific
way in one specific overlay file. That predicate goes red when the variable is
renamed and stays green if the overlay stops being applied at all, because
nothing in a `grep` observes whether the file participates in the merge. The
claims those predicates carry are about *behaviour under composition*, and they
are execution claims wearing a text check. They are the section a rung-raising
budget should buy first.

## What this realization cannot do

The classifier reads commands, not effects. A `python3 -c` that loads a config
and asserts a field is scored shape, and it may in fact be a stronger check
than a shallow execution command that starts a container and immediately
succeeds — the ladder ranks the *act of verification*, not the assertion's
strength, and this tree contains examples where the ranking and the strength
disagree. A team using the split as a work list should read the claim's verb
alongside its rung, not the rung alone.
