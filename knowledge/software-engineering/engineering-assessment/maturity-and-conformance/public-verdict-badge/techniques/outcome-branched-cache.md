---
layer: technique
type: technique
subject: public-verdict-badge
technique: outcome-branched-cache
status: forged
laws: [failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [setting cache lifetime on a public artifact endpoint, a crawler-hammered path needs negative caching, a stale verdict appeared on someone else's page]
---

# Outcome-branched cache

A public badge endpoint cannot survive without aggressive caching: it sits on
pages that crawlers revisit constantly, and the overwhelming majority of those
fetches are for the same handful of hot subjects or for subjects that do not
exist. The naive response is one blanket lifetime chosen to survive the load.
That number is then, silently, a statement about truth: **a cache lifetime is
how long you are willing for this claim to remain true on someone else's page
after it has stopped being true on yours.** The four outcomes a badge endpoint
produces have completely different truth half-lives, so one number is
necessarily wrong for three of them.

## The four branches

**Resolved verdict — long.** The underlying assessment changes on the order of
hours or days. Serve it for hours; add a stale-while-revalidate window so the
refresh happens off the viewer's critical path. Staleness here costs little:
the previous verdict was true recently and is rarely dramatically wrong.

**Customized rendering of a resolved verdict — same lifetime, but private.**
The body now varies by caller parameters, and shared caches in front of an
image endpoint frequently key on the path alone. A shared entry would then
serve one embedder's chosen label and styling to every other embedder's
viewers. Mark customized responses as cacheable by the requesting client only.
This is the branch teams most often collapse into the resolved one, because
"it is the same verdict" — but the cacheability question is about the *bytes*,
not the verdict.

The consequence to carry forward: because customized responses are not
shared-cached, **every** customized request reaches your origin. That changes
the threat model of anything you do per-request on this path — rate limiting,
tallying, logging — and is the reason the reach tally is restricted to the
canonical, shared-cacheable request shape.

**Neutral, genuinely absent — short.** "Not assessed" becomes wrong the
instant someone runs the assessment, and the person it becomes wrong for is
the person who just did the work and immediately reloaded their page to admire
it. A long lifetime here punishes precisely your most engaged user and reads
to them as a broken product. Minutes, not hours.

**Transient failure — barely cached, and never negatively cached.** An
instrument that errored is not a fact about the subject. It gets a very short
lifetime or none, and it must never be written into whatever negative cache
protects the origin. The incident this prevents is severe and easy to cause: a
five-second dependency blip during a traffic spike writes "unknown" into the
negative cache for a popular subject, and every viewer of that page sees a
blank verdict for the full negative-cache window — long after the dependency
recovered. One transient error becomes a sustained public misstatement.

Throttling belongs in this branch too. When a caller is rate-limited, still
render a cheap neutral artifact rather than an error status with no body — a
broken image on a public page is a worse outcome than an honest "unavailable",
and it is the one the subject will notice and remove. Serve it with no
storage at all, plus a retry hint, so the throttle state cannot outlive the
throttle.

## Only a genuine miss may be negative-cached

This is the load-bearing rule, and it is
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) at the
cache layer. Negative caching is mandatory on a crawler-hammered path — without
it, every fetch for a nonexistent subject is a full lookup, and crawlers will
happily enumerate. But it is only safe when the code can *prove* the miss was
genuine.

The discipline:

- **The lookup returns a discriminated outcome**, not a nullable value. `found`
  / `absent` / `error` are three cases, and only `absent` is eligible for the
  negative cache. A lookup that returns `null` for both "no such subject" and
  "the store timed out" makes this rule unimplementable, which is why the
  outcome type comes first.
- **Errors propagate as errors** all the way to the cache-decision site. A
  `catch` that converts a failure into an empty result is the bug; it turns a
  transient into a durable one at the exact site where the distinction still
  existed.
- **The negative cache is bounded in size as well as in time.** An unbounded
  map keyed by caller-supplied subject names is a memory exhaustion vector
  handed out publicly, and a lifetime alone does not bound it: the common
  implementation expires entries lazily, *on read*, and a crawler walking
  endless unique nonexistent names never re-reads any of them. Every key is
  written once and swept never. A bounded structure with an eviction rule
  satisfies
  [creation-names-reaper](../../../../_laws.md#creation-names-reaper): the entry
  states what removes it — the lifetime, or the capacity bound, whichever
  comes first.
- **A successful assessment invalidates the negative entry.** If it cannot
  (because the writer is a different process), the negative lifetime must be
  short enough that nobody notices the difference. Say which of the two you
  chose; do not leave it implicit.

## Layers, and who obeys you

Distinguish the cache you *own* from the ones you merely *advise*:

- **Your in-process or shared cache** you control fully: you can invalidate it
  the moment an assessment completes.
- **Downstream proxies and browsers** obey the directives you emit and nothing
  else. There is no invalidation call. Whatever lifetime you emit is a promise
  you cannot retract, which is why the resolved branch's lifetime should be
  chosen as "how wrong may this be" rather than "how much load can I shed".
- **Aggressive image proxies** — common on the surfaces badges live on — may
  hold content longer than advised and may re-fetch on their own schedule.
  Assume the worst case is roughly your directive, and design the wording of
  the badge so that a somewhat stale verdict is not a scandal. This is another
  argument for coarse bands over precise numbers on the public artifact.

Validators help within the constraints of the medium: a strong entity tag over
the rendered bytes lets a proxy revalidate cheaply and lets you shorten
lifetimes without paying full render cost per fetch. Vary correctly on any
dimension that changes the bytes.

## Procedure

1. **Type the lookup outcome** as a discriminated union before touching cache
   policy; the branch is unimplementable otherwise.
2. **Write the four lifetimes in one place**, as named constants with a
   one-line rationale each. Scattered magic durations drift.
3. **Select policy from the outcome**, at the single point where the response
   is constructed, so no route can emit a lifetime by hand.
4. **Gate negative-cache writes on the `absent` case explicitly**, with a
   comment naming the incident it prevents. This is the line a future
   refactor is most likely to "simplify".
5. **Bound the negative cache** and name its eviction rule.
6. **Monitor the ratio of neutral responses.** A rising share of `unavailable`
   with a flat error rate means the failure branch is being cached somewhere
   it should not be.

## When not to use this

- **Not on private or authenticated badge surfaces**, which should not be
  shared-cached at all — mark them private and short, and skip the branching
  entirely.
- **Not where the verdict is genuinely real-time**, such as a live build state
  that changes every few minutes. There, the honest answer is a short uniform
  lifetime plus a validator, and accepting the origin load as the cost of the
  claim you chose to make.
