---
layer: application
type: application
subject: module-design
technique: state-carrier-decides-the-lane
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@2021
---

# The state carrier decides the lane, in cargo-make

Verified against `sagiegurari/cargo-make` at commit
`95dcc545db8cf08af6fbec524e200e7c80b06027`, package version 0.37.24. The tree
pins no toolchain, so the witness is the weakest one it actually carries:
`Cargo.toml:9`, `edition = "2021"`, with CI running the `stable`, `beta` and
`nightly` matrix at `.github/workflows/ci.yml:18`. Every line below was re-opened
on the date above.

cargo-make is a task runner: a flow of tasks, each of which may fork, and a
`run_task` form that takes a list of task names with `parallel = true`. It is the
cleanest instance of this technique the registry holds, because the sequential
lane and the parallel lane are twenty lines apart in one function and the
concession is written in a comment between them.

## The carrier, and the bound that refuses

Flow state is threaded through the entire runner as `Rc<RefCell<FlowState>>` —
32 occurrences across the non-test sources. `Rc` is `!Send` by construction, so
the value cannot cross a `thread::spawn` boundary. `FlowState` itself is four
lines, at `src/lib/types.rs:339-344`:

```rust
pub struct FlowState {
    /// timing info for summary
    pub time_summary: Vec<(String, u128)>,
    /// forced plugin name
    pub forced_plugin: Option<String>,
}
```

Two fields. Under this technique's classification, **neither is per-branch
state.** `time_summary` is an accumulator; `forced_plugin` is a latched decision.
The struct contains no field for which a copy is the right semantics.

## The concession, and the comment that records it

`src/lib/runner.rs:238-247` is the parallel arm of `run_task_flow`:

```rust
if parallel {
    let run_flow_info = flow_info.clone();
    // we do not support merging changes back to parent
    let cloned_flow_state = flow_state.borrow().clone();
    let cloned_cleanup_task = cleanup_task.clone();
    threads.push(thread::spawn(move || -> Result<(), CargoMakeError> {
        task_run_fn(
            &run_flow_info,
            Rc::new(RefCell::new(cloned_flow_state)),
            fork,
            &cloned_cleanup_task,
        )
    }));
} else {
    task_run_fn(&flow_info, flow_state.clone(), fork, &cleanup_task)?;
}
```

The shape is exactly the one the technique predicts: the state is borrowed,
deep-copied out of the `Rc`, moved into the closure, and **rebuilt as a fresh
`Rc<RefCell<_>>` inside the thread** so that everything downstream can keep the
signature it has. At `runner.rs:253-257` the threads are joined for their
`Result` only; the reconstructed `FlowState` is dropped with the closure. The
sequential arm on line 249 passes the real `Rc`.

The comment on line 240 is the apology the technique says to look for. It is
phrased as a product limitation — *we do not support* — and it sits immediately
after the line that made it true.

## What is actually lost, field by field

- **`time_summary`.** cargo-make's `--time-summary` output is built by pushing
  `(task_name, duration)` into this vector. A task that runs in a parallel
  `run_task` pushes into the copy, and the copy is discarded at the join.
  **Every parallel-forked task is therefore absent from the time summary**, and
  the summary prints without any indication that it is partial. This is the
  `count-carries-predicate` failure in its purest form: the number is real, and
  its predicate silently changed from "the flow" to "the flow minus the fast
  lane". The feature is a profiling aid, so the tasks most likely to be
  parallelised are the slow ones — the omission is biased toward exactly the
  entries a reader is looking for.
- **`forced_plugin`.** The plugin SDK commands `cm_plugin_force_plugin_set` and
  `cm_plugin_force_plugin_clear` (`src/lib/plugin/sdk/`) write this field. Set
  inside a parallel branch, it does not reach the parent; set in the parent
  before the fork, the branch sees the value as of the fork and no later change.

## The documentary tell, which confirms the concession was not designed

The README publishes a hazard list for the parallel form. `README.md:618-620`:

> Be aware that parallel invocation of tasks will cause issues if the following
> feature are used:
>
> * Setting the task's current working directory via **cwd** attribute will
>   result in all parallel tasks being affected.

One entry, and it is a **user-visible feature** whose hazard the author reasoned
about deliberately: `cwd` mutates process-global state, so it leaks *across*
branches. The two fields of the copied carrier — the timing summary and the
forced plugin — are hazards in the opposite direction, they do **not** leak, and
neither appears in the list.

That asymmetry is the technique's falsifiable prediction and the tree satisfies
it: the hazard the author designed for is documented, and the hazards that fell
out of an `!Send` bound are not, because the bound made the decision and nobody
formed the thought. No design document, changelog entry or test asserts the
isolation as a guarantee; the only record of it anywhere in the repository is
the one-line comment on `runner.rs:240`.

## What the tree could not have been built to prove, and proves anyway

`FlowState` has exactly two fields and both are in the "copy is wrong" classes.
Had the struct been a mixed bag, one could argue the copy was a considered
trade — right for most fields, lossy for one. It is not mixed. **There is no
field in `FlowState` for which the parallel lane's semantics are correct**, and
the lane still ships that way, because the copy was never evaluated per field —
it was evaluated as one `clone()` that made the code compile.

## What this realization cannot show

The registry has no measurement of how often the parallel form is used in the
wild, so the *impact* of the missing summary rows is unquantified here; the
defect is structural and read from the source, not from telemetry. The tree also
publishes no benchmark suite, so the cost of the alternative repairs (a channel
for `time_summary`, or a merge at the join) cannot be priced from the repository
itself.
