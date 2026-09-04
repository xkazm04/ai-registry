---
layer: application
type: application
subject: prompt-assembly
technique: compression-hardens-deferred-decisions
stack: rust
verified_on: 2026-09-04
verified_against: rust@1.80
applied: simulation
ab_verdict: better
proof: structural-only
---

# A standing build prompt whose hard rules were measured asking the wrong questions (Rust)

`src-tauri/src/engine/build_session/session_prompt.rs` is an 836-line standing
layer — roughly 500 lines of framework text ahead of the per-call intent — that
governs how an interactive build interrogates a vague user request. It is the
richest instance of this technique's subject matter in any tree reachable from
here, and it is unusual in one respect that decides the whole application: **the
project already runs a behavioural bench over it.** `verified_against` names the
version the tree witnesses: `rust-version = "1.80.0"` in `src-tauri/Cargo.toml:115`.

## The tree refuted the obvious reading first

The expected finding was the technique's precondition — a large standing layer
with no behavioural tests, so a shrink could delete a behaviour unnoticed. That
reading is wrong. `docs/tests/clarify-bench/` is a ten-fixture behavioural
harness whose rubric asserts behaviours the prompt's own numbered rules define,
citing them by number (`judge-prompt.md:44` docks a run for asking serially,
"session_prompt Rule 25"; `README.md` names Rule 16's ask-machinery and Rule 26's
fast-path). A first pass that classified the rules by predicate and asked whether
any test file mentions their identifiers returned 100% in both arms — the
instrument could not discriminate, because vocabulary overlap is not a
behavioural assertion. The discriminating question is which rules the *rubric*
would fail on, and the answer is Rules 16, 25 and 26: the three with the hardest
categorical component in the file.

## What the tree's own measurement says

`docs/tests/clarify-bench/BASELINE.md` (2026-07-09, n=1 across 10 fixtures, four
independent judges) records the outcome of a rule set written almost entirely in
the categorical voice — `ALWAYS emit`, `MANDATORY`, `THIS IS A HARD CONTRACT`,
`EXACTLY ONE Phase-C clarifying round`, `AT MOST 4`:

> *It does ask a lot of questions. But it asks the **wrong** ones: it interrogates
> axes that have obvious safe defaults (memory, human-review, output format,
> storage) while staying silent on the load-bearing ambiguities.*

Mean weighted total **0.48**; high/extreme band **0.285**; `efficiency_round_cap`
scored **0 or 1 on all ten fixtures** — the round cap was never once honoured. The
fully-specified control drew **four** questions where the design's own fast-path
says zero. Three of the four hardest fixtures produced **zero capabilities**.

The failure has this technique's exact shape. Rule 16 enumerates the axes to ask
about and marks them `ALWAYS`; the enumeration is what the model followed, and the
enumeration is a template. What the rule replaced — a judgment about which axis is
actually unresolved on *this* intent — is the deferral. The carve-outs bolted on
afterwards (Rule 26's fast-path "overrides" Rule 16c's ALWAYS; Rule 22 has to
explain that Rule 5 is "a *default*… NOT licence") are the escalating-force
signature of a decision that was hardened once and keeps needing exceptions.

## The tree reached this technique's decision rule independently

`BASELINE.md`'s prescription, written seven weeks before this technique existed
and from a measurement rather than from an argument:

> *Select questions by information value, not by template.*

That is "prefer the rewrite that returns the decision to the model over the
rewrite that encodes it", in the tree's own words and with a number behind it.
An independent tree arriving at the technique's central rule from its own
regression is stronger corroboration than the account the technique was written
from, and it is the reason this application's verdict is `better` at simulation
mode rather than `unmeasurable`.

## A / B over three cases the tree already ran

Policy **A** is the shipped categorical enumeration. Policy **B** returns the
selection to the model — ask the axes this intent leaves genuinely unresolved,
default the rest. All three cases are recorded runs, not constructions.

- **`hn-digest-control`** (fully specified; design says ask zero). **A drew four**
  — format, memory, review, storage, every one an enumerated axis — for 399s and
  `efficiency_round_cap` at 0–1. B asks none of the four, because none is
  unresolved by the intent. *Predicted: cap dimension moves 0→3, total 0.71→~0.9.*
- **`standup-mostly-specified`** (only the repo and the channel missing). A spent
  three serial rounds on auto-post, format and memory and asked for **neither
  identifier**. B asks exactly the two identifiers. *Predicted: both
  `asked_before_assuming` and the cap improve; question count falls 3→2.*
- **`research-vague`** (names neither job, topic, cadence nor output). A asked the
  **same memory template question twice**, never asked topic, cadence or
  destination, and reached `draft_ready` with no `agent_ir` — an empty persona. B
  cannot ask a template question twice, because it has no template to walk.

**What would falsify this.** If B were adopted and `asked_before_assuming` or
`no_wrong_assumptions` fell while `efficiency_round_cap` rose, the delegation
traded one failure for the other and the hard enumeration was doing real work —
the categorical rules would then be the correct hardening of a deferral that the
model genuinely cannot make, and this technique's preference would be wrong for
this layer. The baseline's own warning that the simulated user "answered
verbosely… these are an *upper bound*" cuts the same way: a terse user makes
under-asking worse, which is B's exposure and not A's.

## What this realization cannot show

Nothing here was run. The bench needs the dev app on its automation bridge, the
CLI on PATH, and roughly 600–900s per fixture, so both arms are read from one
recorded baseline rather than executed side by side, and only A has ever been
measured. The instrument that would settle it exists and is named:
`python tools/test-mcp/run_clarify_bench.py --all`, comparing the
`efficiency_round_cap` and `asked_before_assuming` deltas across the ten fixtures.
Until that runs, this is a prediction with three real cases behind it, and the
one number it can honestly quote is A's.
