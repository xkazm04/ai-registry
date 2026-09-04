---
layer: application
type: application
subject: multi-provider-gateway-plane
technique: exclusive-authorship-of-a-measured-decision
stack: rust
status: forged
applied: code
ab_verdict: better
proof: structural-only
verified_on: 2026-09-04
verified_against: rust@1.80.0
---

# An audit flag that could not observe the substitution it reported

`xkazm04/personas` is a local-first desktop application that runs agent personas
over a wrapped CLI, and its own manifest says it exists partly to *"observe runs
— cost, health, traces — and tune routing from evidence."* That makes it the
right tree to test the technique's third rule against, because the rule is about
whether the evidence can distinguish the decided model from the served one.

It cannot, and the reason is the defect the technique describes in the abstract:
**the audit reads the coarsest axis of the decision on a plane whose
substitutions happen on a finer one.** The stack version is witnessed by the
workspace's own `rust-version = "1.80.0"` and `edition = "2021"`
(`src-tauri/Cargo.toml:114`), not by a dispatch's guess.

## The measurable, and the arm that ran

The number the technique says should move: **the share of runs in which a model
substitution occurred that the compliance record is able to flag.**

The application builds a failover chain (`src-tauri/src/engine/failover.rs:673`)
whose rungs are `claude-opus-4-8` → `claude-sonnet-4-6` →
`claude-haiku-4-5-20251001` (`CLAUDE_MODEL_CHAIN`, `failover.rs:639`), tried in
order by the runner's spawn loop until one succeeds. When rung 1 or 2 serves, a
different model answered than the persona configured.

The provider audit entry then recorded:

```rust
was_failover: active_engine_kind != primary_engine,
```

`EngineKind` has exactly one variant, `ClaudeCode`
(`src-tauri/core/src/engine_kind.rs:19`), and the crate asserts that
exhaustively at compile time via `assert_all_covered`. So the expression is
`ClaudeCode != ClaudeCode` — **a constant `false` computed at runtime**, on every
request, forever, while the model ladder underneath it is free to downgrade two
tiers.

Measured over the application's own recorded history — 6,163 rows in
`provider_audit_log` — arm A returns `was_failover = 0` on **6,163 of 6,163**,
`engine_kind` takes one value on all of them, and `model_used` is **NULL on all
of them**. Two of the record's three substantive fields are constants, and the
third is empty. The BYOM compliance trail cannot answer either "which model
served" or "was this a substitution".

Arm B is the chain-index predicate: false at rung 0, true at rungs 1 and 2. The
assertion is committed as a test
(`failover.rs::test_engine_kind_cannot_detect_a_model_downgrade`) that walks the
real chain and checks both predicates at every rung.

## Why the proof is `structural-only` rather than `ab-paired`

The change and its test **compile clean** under the project's own CI feature set
(`cargo test --workspace --features desktop`, the invocation
`.github/workflows/ci.yml:346` uses). The test could not be *executed*: the
`app_lib` test binary fails to launch on this machine with
`STATUS_ENTRYPOINT_NOT_FOUND` (0xc0000139), a native-dependency load failure.
That is pre-existing and binary-wide, not a consequence of this change — an
untouched neighbouring test in the same binary fails identically, while a sibling
workspace crate's tests build and pass in the same run.

So the behavioural arm was not runnable and the honest status is
`structural-only`. It is a strong one: the structural fact is a compile-time
certainty (one enum variant, asserted by the project itself) confirmed against
6,163 real rows, which is a firmer basis than a single executed comparison would
have been.

## The structural fact nobody designed

The stronger evidence is one the tree was not built to provide, and it goes
beyond the flag.

The application already computes both halves of the comparison the technique
asks for. `set_launch_model_info` stamps the model a run was actually spawned
with, extracted from the final argv — and the comment says *why*, in the
technique's own terms: *"so failover/resume paths are covered"*
(`src-tauri/src/engine/runner/mod.rs:2013`). Later, the CLI's own system-init
event reports the model that really answered, and `set_model_used_actual` records
it.

Both write **the same column**: `persona_executions.model_used`
(`src-tauri/db/src/repos/execution/executions.rs:838` and `:864`). The second
write destroys the first.

So the decided value and the served value are not merely uncompared — they are
**unstorable simultaneously**. The comparison the technique's third rule requires
is impossible in this schema, not because anyone rejected it but because the two
facts were treated as one field with a refinement, and the code comment at
`runner/mod.rs:2015` says so plainly: the later event *"overwrites `model_used`
with the CLI-reported actual model"*.

That is the technique's claim arriving as an accident of storage. Nothing in the
design was aimed at hiding a mismatch; a single column did it, and the flag that
should have caught it was reading an enum with one variant.

## What was changed, and what was not

Shipped (`code`): the runner now tracks which rung of the chain served
(`active_candidate_idx`) and the audit entry reports
`active_engine_kind != primary_engine || active_candidate_idx > 0`, so a
within-provider model downgrade is flagged as the substitution it is. Three
lines plus a comment naming why the engine-kind comparison cannot see it, and a
paired test over the real chain. Verdict **better**: the record moves from
structurally incapable of reporting a substitution to capable of it.

Deliberately not changed, and left as the technique's open half in this tree:
the single-column overwrite. Separating decided from served needs a migration and
a second column, which is larger than this landing and touches a schema several
other readers depend on. Until it exists, the flag says *that* a substitution
happened and the record still cannot say *from what, to what* — which is the
weaker half of the rule, and the honest way to describe the current state.

## What this realization cannot do

The application is single-provider today, so the technique's first rule — nothing
may answer in the selector's place — does not bind here the way it binds on a
hosted plane. A desktop application cannot return 503 to its user, and the
`when not to use it` clause covers exactly that case: the substitution is
allowed, provided it is visible. It is partly visible already (the run log
carries a `[FAILOVER] Trying …` line, `runner/mod.rs:1847`), and after this change
it is visible in the durable record too — but only as a boolean.

The mismatch check the technique's third rule really wants — comparing what was
decided against what the upstream says it served — remains unavailable, and it
is worth being precise about why: the wrapped CLI is the only witness of the
served model, so its report is trusted directly rather than verified. There is
no second observer, which means a mismatch between the wrapper's intent and the
CLI's behaviour is detectable only where the CLI chooses to report it.
