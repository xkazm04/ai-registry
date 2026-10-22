---
layer: application
type: application
subject: data-plane-transport-selection
technique: moved-payload-has-no-fallback
stack: next
status: forged
verified_on: 2026-10-22
verified_against: next@16
applied: simulation
ab_verdict: unmeasurable
---

# Next · Moved payload has no fallback, in a browser raster worker

The technique is written for a shared-memory pool, and the first application is a
Rust node runtime. This one is the same asymmetry in a browser: `postMessage` with a
transfer list **consumes** the buffer, and a plain `postMessage` **borrows** it by
copying. The tree is a Next 16 landing page whose paper-cut scene is painted by a
worker and handed back as transferred bitmaps. Read in the working tree at commit
`aa930680` (clean for the files cited); the Next version witness is `package.json`
(`"next": "16.3.3"`).

## Where the route is chosen: before any job is posted

The raster service is built around two paths and says so in its header,
`app/_landing/cosmos/engine/raster.ts:4 "paints on"`: "worker - ./raster.worker.ts paints on
OffscreenCanvas and transfers" and the main-thread path "the fallback when the worker
cannot start or says it cannot paint". Every route decision sits in `startWorker`,
before the first job exists:

- `app/_landing/cosmos/engine/raster.ts:88 "typeof OffscreenCanvas"`: `if (typeof Worker !== "function" || typeof OffscreenCanvas !== "function") return Promise.resolve(this.startMain());`
- `app/_landing/cosmos/engine/raster.ts:120 "return fallback()"`: `if (!m.ok || this.dead) return fallback();` after the worker's hello,
  which reports whether this browser can paint there at all.
- `app/_landing/cosmos/engine/raster.ts:95 "const fallback"`: a 4000 ms timer calls the same `fallback`, so a worker that never
  answers is also a route decision made before commit.

Nothing has been posted on any of these branches. `pump` only dequeues onto the worker
once `this.worker` is set, which happens at `app/_landing/cosmos/engine/raster.ts:123 "this.worker = w"`, after the hello is accepted.
This is the technique's first section in the positive form: the fallback exists, and it
sits strictly before the commit.

## Where the payload is consumed, and what happens after

The consuming send is `app/_landing/cosmos/engine/raster.worker.ts:82 "[bmp]"`:
`scope.postMessage({ t: "part", id, i, bmp }, [bmp]);` and the final batch at `:86`,
`scope.postMessage({ t: "done", id, out, ret }, out);`. After either call the worker no
longer holds the bitmaps. Three failure shapes were walked against the code:

1. **Worker dies after start.** `app/_landing/cosmos/engine/raster.ts:104 "w.onerror"` `w.onerror`, past the `settled` check,
   terminates the worker, flips `mode` to main, and calls `this.failAll()` (`:113`, body at
   `:227`), which resolves every in-flight job with `null`. The comment at `:107` is the
   sentence the technique asks for: "what was painting there is lost, what is still queued
   paints on the main thread". In-flight jobs are **not** re-run on the main thread; queued
   ones, which were never posted, are. The line between them is exactly the commit line.
2. **A layer fails after earlier layers were transferred.** The worker's catch
   (`app/_landing/cosmos/engine/raster.worker.ts:88 "fail"`) posts `{ t: "fail" }`; the host resolves the job `null`
   (`raster.ts` message handler, the `else p.res(null)` branch). Parts already delivered
   to the caller's `part` callback stay delivered, and the caller is told the job as a
   whole failed. No retry exists to fire.
3. **A result for a job nobody waits for.** If `live.get` finds nothing, the handler
   closes the bitmaps (`m.out?.forEach((b) => b.close())`, `m.bmp?.close()`). A consumed
   buffer with no owner is released, not leaked.

The return contract is the third section of the technique: `run` is documented as
resolving "with its surfaces, or null when it was dropped or failed", and the one
consumer read for this note that renders a result, `app/_landing/cosmos/engine/scene.ts:161 "cx.raster.run"`, treats `null` as
nothing to show (`if (!r || !r.urls[0]) return;`) rather than substituting a stand-in.

## Verdict

Mode `simulation`, verdict `unmeasurable`. The seam was chosen to falsify the technique:
a retry or main-thread re-run written after a transferred send would be the exact
anti-pattern, and the worker-death path is where such a patch would be added. It is not
there. Target: fallback-after-consume sites, 0 found. Floor: not declared (nothing was
changed). The finding held in the positive form, which is the stronger one for a reader
deciding whether to copy: the technique's ordering emerged here from the browser's own
contract, because a transferred `ImageBitmap` is detached on the sender and the author
had nothing to retry with.

What this realization cannot do: it counts nothing. The loss in case 1 is a `null`
return with no counter, so a rising rate of worker deaths would be invisible, and the
technique's "count these separately" half is not met. Nothing in the tree could be
read as a fault-injected run either.

Return condition: when a fault-injectable worker harness exists, a worker stub that dies
after N parts, asserting no re-run and a counted loss.

## Boundary

This is a second stack for the technique, not a second proof of the pool-exhaustion
half: a browser transfer has no pool to run dry, so "when the pool is dry, copy" has no
analogue here and is left to the Rust application.
