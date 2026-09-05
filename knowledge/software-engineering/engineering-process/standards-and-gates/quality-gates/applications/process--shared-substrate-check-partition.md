---
layer: application
type: application
subject: quality-gates
technique: shared-substrate-check-partition
stack: process
status: forged
verified_on: 2026-09-04
---

# Two LLM review checks over one diff, partitioned entirely in prose

Monty (`github.com/pydantic/monty`, commit
`fdd26283903f0559ee146ec48375867aadacf92b`) runs its pre-merge review through
Macroscope, an LLM code-review service configured from a `.macroscope/` directory
in the repository. A review process carries no version, so the witness for
everything below is that commit and the paths cited from it. Two checks run over
the same pull request: **Correctness**,
tuned by four files under `.macroscope/correctness/`, and **approvability**, which
decides auto-approval eligibility, tuned by `.macroscope/approvability.md`. Same
engine, same diff, two verdicts. Nothing but the words in those files separates
them, which makes the tree a clean instance of the technique.

## The negative scope, its owner, and the inherited premise

`.macroscope/approvability.md` spends its second section on the exclusion rather
than on its own subject:

> **Correctness is out of scope here.** Correctness (bugs, CPython divergence,
> sandbox and resource-limit escapes, panics, missing `limitations/` entries,
> missing tests, style, naming, comment verbosity, AI slop) is owned by the
> Macroscope **Correctness** check, tuned by the instructions in
> `.macroscope/correctness/`. Auto-approval already waits for that check and will
> not fire if Correctness fails.
>
> So these eligibility rules must **not** withhold auto-approval for a correctness
> reason. Do not hold a PR because "there might be a bug", "this looks complex",
> "the sandbox could escape", or "the tests could be stronger". **If the
> Correctness check passes, treat the code as correct and do not re-litigate it
> here.**

All three clauses the technique asks for are present and are separable: the owner
is named, the dependency is real ("auto-approval already waits for that check"),
and the premise is stated as an instruction to treat correctness as settled. The
enumeration in the first sentence is doing work the technique does not require but
should — it lists what the sibling owns, so the exclusion cannot be read narrowly
as "no bugs" and leave style or test coverage admissible.

## The inverted, bounded question

The file closes on the construction, and it is the crispest statement of it this
registry has found in a live tree:

> When in doubt, auto-approve. Withhold auto-approval only when the PR
> unambiguously and materially lands in one of the categories above. **The question
> is never "could a human add value here?" (a human always could); it is "is the
> non-correctness risk of this change high enough that it must not merge without a
> human deciding?".**

The parenthetical is the technique's argument, made by the practitioner: the
open form of the question has a trivial answer, so a gate built on it carries no
information. The bounded form is paired with six enumerated categories — `unsafe`
and the heap's safety invariants, the sandbox boundary, the wire protocol and the
host/child trust boundary, the snapshot/dump format, public API/ABI of the
published crates and bindings, and release/supply chain — each with a named file
or crate.

## The not-reasons list, and what it defends against

The file's seventh section is the clause the technique says is most often skipped:

> **Not reasons to withhold auto-approval.** Large diffs, many files, or a
> broadly-scoped but mechanical change. Refactors, renames, and moves that keep
> behaviour the same. New language features, builtins, or method implementations
> (new behaviour, not a contract change) — even large ones. New CPython-divergence
> `limitations/` entries and documentation. Bug fixes that do not touch the
> categories above. Test-only changes, playground probes, comments, and
> configuration. Dependency version bumps for dependencies we already use. **A
> general feeling that the change is important or that review would be "safer".**

Seven entries, each a false-positive class an unbounded judgment engine would
otherwise generalise into. The last is the technique's point stated as a rule:
the engine's own sense of importance is not evidence. The file also pre-empts the
cheapest evasion — *"A drive-by, comment-only, or cosmetic touch to one of these
areas is not enough: the change must materially alter behaviour in the category"* —
which stops the withhold list from matching on file path.

## One brief per concern, each with its own severity

The Correctness side is four files, not one, each scoped by a glob in its own
frontmatter (`include: ["crates/**/*.rs"]`, with `crates/monty-bench/**` and
`crates/fuzz/**` excluded from three of them): `cpython-parity.md`,
`drop-discipline.md`, `resource-limits.md`, `sandbox-and-panics.md`. Each opens
with a model of the defect, then a flag list, then a do-not-flag list, then a
severity calibration — and the severities are genuinely different per file rather
than inherited from a shared rubric:

- `drop-discipline.md`: *"Rate a missed release (a real leak on some path) high;
  rate a guard-style preference low."*
- `sandbox-and-panics.md`: *"Calibrate severity by blast radius, not by the bug in
  isolation. The same panic is contained in a pool worker — the child dies, the
  parent replaces it and raises — so rank it lower; but in host or parent code
  ... it takes down the caller, so rank it high."*
- `resource-limits.md`: *"A resource-limit escape rates high."*

The do-not-flag lists are the tuning surface the technique describes, and they are
specific enough to be gradeable: *"Do not flag a single straight-line path with no
branch between acquiring and releasing"*; *"Do not flag an allocation whose actual
size is itself directly preflighted or is a small bounded result; a bounded native
loop that leans on the hard-limit backstop instead of a per-iteration memory poll
(that is the intended pattern)."*

`resource-limits.md` also states the error preference in the instrument, which is
the second gradeability property:

> When unsure whether a charge is redundant, **prefer silence: a missed nit costs
> nothing, a false "unbounded allocation" trains the team to ignore the check.**

That is `false-positive-economics`'s death spiral, written into the detector by the
people who would have suffered it.

## The evidence boundary is stated on both sides

The clearest instance of the technique's last section. Two checks share the
CPython-divergence concern and differ in what they can observe.
`.macroscope/correctness/cpython-parity.md` — a diff reader — ends:

> This is diff-level review only — the executable run-both-and-diff check against
> CPython is the `review-usability` skill and is out of scope here; **do not claim
> a divergence you cannot see in the change.**

And `.agents/skills/review-usability/SKILL.md` is the counterpart that *can* run
both, writing probes into `playground/` and diffing `uv run` against `cargo run`.
Both briefs rank the same way — *"Prioritise **silent divergence** — same code,
different result — over a clean `AttributeError`"* — so the partition is by
reachable evidence, not by what matters.

## What this realization does not do, and the structural gap

The partition is **entirely advisory**. Every clause above is prose read by a
model; nothing in the repository fails when the approvability check withholds for
a correctness reason, and there is no record of how often it does. The technique's
claim that the not-reasons list is a tuning surface is therefore unfalsifiable
here — the tree shows a well-constructed brief, not a measured one. No
auto-approval rate, precision figure, or escalation count is published in the
repository, so this application establishes the construction and not its yield.

One structural fact the tree did not set out to prove, and the coverage line falls
in an unobvious place. `.macroscope/ignore.md` copies Macroscope's ~150 default
ignore patterns verbatim, with the reason stated — *"A custom ignore file REPLACES
Macroscope's built-in defaults, so this copies their default 'base' patterns
verbatim to preserve them"* — and those defaults include `**/.agents/skills/**` and
`**/.claude/skills/**` (lines 25-26). No pattern matches `.macroscope/`.

So the repository reviews the briefs that tune its **automated** check and does not
review the skills that brief its **interactive** one. The four correctness files
and `approvability.md` go through the same gate as the crates; `review-general`,
`review-usability`, `review-verbosity` and the rest do not, and neither does
`docs-parity-reviewer` under `.agents/agents/`. The split is inherited from a
vendor default rather than chosen — the file's own comment shows the authors
reasoning carefully about which defaults to keep, and they deliberately dropped the
*test-file* patterns so test code stays reviewed, while the skills patterns came
along with the block. Whether that is right is a real question: the skills are
prose that steers a reviewer, they are the tuning surface this technique cares
about, and a change to one of them alters what every subsequent review sees with
nothing checking the edit.
