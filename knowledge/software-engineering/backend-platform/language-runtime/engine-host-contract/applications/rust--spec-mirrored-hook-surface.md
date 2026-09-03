---
layer: application
type: application
subject: engine-host-contract
technique: spec-mirrored-hook-surface
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# A spec-mirrored hook surface, as Boa realises it

Boa (`boa-dev/boa`, commit `665f03924a54e5162be227e7e909612e36f6e35a`, workspace
version 0.22.0 at `Cargo.toml:29`, toolchain witness `rust-version = "1.91.0"` at
`Cargo.toml:30`) customises its engine through a `HostHooks` trait whose methods mirror
the ECMA-262 host-hooks summary, and through two further traits — `ModuleLoader` and
`JobExecutor` — that mirror the module-loading and job-enqueueing hooks. This
application walks the three surfaces against the technique's rules and records where
the tree taught the draft something and where it falls short of it.

## One trait, obligations on each method, the spec's default in each body

`core/engine/src/context/hooks.rs:11-14` opens the trait doc with the rule itself:
"Every hook contains on its `Requirements` section the spec requirements that the hook
must abide to for spec compliance", and `hooks.rs:59` links the summary table the trait
mirrors. Each method then has the shape the technique asks for. `make_job_callback`
(`hooks.rs:61-73`): spec link, `# Requirements`, the default body annotated with the
spec's step numbers. `promise_rejection_tracker` (`hooks.rs:98-113`): requirement "must
complete normally", with the note that the return type already ensures it — an
obligation discharged by the type, said so. `has_source_text_available`
(`hooks.rs:135-146`): "must be deterministic with respect to its parameters", default
`true`. `ensure_can_add_private_element` (`hooks.rs:148-165`) carries the *who may
override* restriction verbatim: "should only be overridden by ECMAScript hosts that are
web browsers". `max_buffer_size` (`hooks.rs:208-225`) quotes the specification's
recommendation for the 1.5 GiB default beside the number. `DefaultHooks` at
`hooks.rs:228-232` is an empty `impl HostHooks for DefaultHooks {}`, which is the proof
that every method has a body.

## One method per decision, naming every operation it covers

The tree argued against the draft's "one method per specification hook" and won, in two
places. `ModuleLoader::init_import_meta` at `core/engine/src/module/loader/mod.rs:179-198`
says it "unifies both APIs into a single hook" — `HostGetImportMetaProperties` and
`HostFinalizeImportMeta`, one decision the spec spreads over two operations.
`JobExecutor::enqueue_job` at `core/engine/src/job.rs:795-802` "combines all the
host-defined job enqueueing operations into a single method", with the `Job` enum
(`job.rs:709-731`) as the closed variant type. `load_imported_module` at
`loader/mod.rs:149-177` does the same for `HostLoadImportedModule` plus
`FinishLoadingImportedModule`, saying at `mod.rs:151-153` that returning from the async
method replaces the finish call. The technique's rule was rewritten to "one override per
host decision" on this evidence.

## The engine names the obligations it discharges itself

`job.rs:579-589`, on `PromiseJob`, lists the spec's three requirements for
`HostEnqueuePromiseJob` and then: "Of all the requirements, Boa guarantees the first
two by its internal implementation of `NativeJob`, meaning implementations of
`JobExecutor` must only guarantee that jobs are run in the same order as they're
enqueued." The implementor's residual obligation is one sentence. `job.rs:687-706` does
the same at the `Job` level, and admits at `job.rs:702-703` where the engine is "a
little bit flexible" on one requirement — a declared deviation, in the doc, where the
implementor will read it.

## Migration by deprecation in place

`hooks.rs:185-198`: `utc_now` is `#[deprecated(since = "0.21.0", note = "Use
`context.clock().now().millis_since_epoch()` instead")]` and keeps a working body. The
wall-clock reader moved to the `Clock` trait at `core/engine/src/context/time.rs:146-159`
and the old hook stayed as a signpost. This is where the technique's migration rule came
from.

## Where the tree falls short

Two engine-added hooks on the same trait carry no `# Requirements` section:
`local_timezone_offset_seconds` at `hooks.rs:200-206` and `max_buffer_size` at
`hooks.rs:208-225` (the latter quotes a recommendation but states no obligation on an
override — nothing says whether the value may change between two calls on one
allocation, though the doc at `hooks.rs:211-212` implies it may). `create_global_object`
and `create_global_this` (`hooks.rs:167-183`) cite the spec step they implement but
state no requirement either. The technique's rule — engine-added hooks by the same
documentation shape, obligations first — is the standard; these four are recorded as a
deviation from it, not a reason to lower it.

## Confirmed against the technique

One method per spec hook, named after it: confirmed for the eight spec-named methods on
`HostHooks`. Requirements on the override point: confirmed for the spec-named methods,
deviation for the four engine-added ones. Spec default as the body, empty default
implementor: confirmed at `hooks.rs:228-232`. One method per decision naming all its
operations: upward lesson, three sites. Engine states which obligations it discharges:
upward lesson, `job.rs:588-589`. Deprecate-in-place migration: upward lesson,
`hooks.rs:191-194`.
