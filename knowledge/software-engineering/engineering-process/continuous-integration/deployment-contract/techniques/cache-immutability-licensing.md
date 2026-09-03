---
layer: technique
type: technique
subject: deployment-contract
technique: cache-immutability-licensing
status: forged
stage: solo
laws: [identity-survives-reuse, limits-are-derived]
shared_with: []
use_when: [setting cache lifetimes on a served build output, a client is running code from a previous deploy and cannot be reached, deciding whether an asset may be marked immutable, a toolchain emits assets without content hashes]
---

# Cache immutability licensing

Telling a client that a served asset never changes is read as a performance
setting — a dial between "fast" and "fresh" that a team turns up when pages
feel slow. It is not a dial. It is a **claim about naming**: that this address
will never designate different bytes, so there is nothing to check for. The
claim is either licensed by how the artifact is named or it is false, and when
it is false the consequence is not staleness that resolves on its own. It is a
population of clients executing a previous deploy's code with no channel left
to reach them.

## The licence is content-addressed naming, and nothing else

An asset whose filename or query carries a digest of its own contents has the
property the directive asserts: change the bytes and the name changes with
them, so the old address keeps designating exactly the bytes it always
designated. Identity travels with the content
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)) and
a client that never revalidates can never be wrong. Marking those assets
immutable is free correctness *and* the whole performance win, because the
next deploy's page references new names.

Where the same address serves new bytes after a rebuild — a toolchain that
emits fixed asset filenames, a hand-placed script, anything copied to a stable
path — the claim is a lie with an unusually long tail:

- A client that cached the response **will not ask again**. Immutability is
  specifically the instruction to skip revalidation, so there is no request to
  answer differently, no header to change, and no purge that reaches it. Server-
  side and edge caches can be cleared; the browser cache of a user who visited
  last month cannot.
- The stale asset does not fail loudly. It runs — against a page, an interface
  or a data shape from a different deploy. The failure surfaces as a version
  skew nobody can reproduce, on machines the team cannot enumerate.
- The remedy is a rename, which is the content-addressed naming the team
  declined to adopt, arriving later and under pressure.

So the posture where naming is not content-addressed is a **short expiry**: long
enough that a repeat visit within a session costs no transfer, short enough that
a bad deploy ages out on its own within a day. The number is derived from the
rebuild-and-deploy cadence and the longest skew the application tolerates, and
that derivation is written beside it
([limits-are-derived](../../../../_laws.md#limits-are-derived)); a lifetime
chosen by feel gets raised by feel, and this is the setting where raising it by
feel is unrecoverable.

## The asymmetry that decides every borderline case

The two errors are not comparable, which is what makes this a correctness
question rather than a tuning one:

- **Expiry too short**: repeated conditional requests. The cost is bandwidth and
  a little latency, paid continuously, visible in a graph, adjustable at any
  time.
- **Immutable when not licensed**: an unbounded number of clients pinned to old
  code, unreachable, for as long as their caches survive. The cost is paid once,
  is invisible until users report impossible symptoms, and cannot be adjusted
  afterwards.

An error with no recovery path loses to an error with a knob, every time. Which
is why the honest default for an unclassified asset is the short expiry, and
immutability is opted into per population once someone has checked the names.

## Procedure

1. **Classify the served tree by naming scheme, not by file type.** The
   question for each population is one sentence: *after a rebuild that changes
   this file's contents, does its address change?* Most trees hold at least two
   answers — a bundler's hashed output, and un-hashed assets copied in by a
   documentation generator, a plugin, or a hand-written include.
2. **Immutable only where the answer is yes.** Long lifetime plus the
   never-revalidate directive.
3. **Short expiry everywhere else**, with the reason recorded at the
   configuration site — that these assets are not content-addressed and the same
   address serves new bytes after a rebuild. Without that sentence the next
   reader sees an inconsistent configuration and normalizes it upward.
4. **The entry document is not an asset.** The document that references the
   hashed names must itself be revalidated on every request, or the client never
   learns the new names and the entire scheme buys nothing. This is the step
   most often skipped, because the entry document is cheap and looks harmless
   to cache.
5. **Earn the licence where it is worth it.** If an un-hashed population is
   large and hot, the fix is to make its names content-addressed — a build step
   or a version segment in the path — not to mark it immutable and hope.

## Decision rules

- **Immutability is licensed by naming, never chosen for speed.** No content
  address, no immutable directive.
- **The directive's claim is "this address never designates other bytes."**
  Assert it only where a rebuild proves it.
- **Un-hashed assets get a short expiry with its derivation written down.**
- **The document that names the assets is always revalidated.**
- **Prefer buying the licence over asserting it**: a naming change is a build
  concern with a fix; a wrong immutability is a client population with none.

## Where this is not a decision

Where the toolchain content-addresses the entire served tree, there is nothing
to weigh: everything but the entry document is immutable and the question never
arises. The technique exists for **mixed** trees, which is what most real
deployments produce once a second generator or a plugin contributes assets
alongside the bundler.

The scope boundary is worth keeping straight in both directions. What a client
holds in memory between two calls — freshness windows, revalidation policy,
deduplication — is a client-side design question and belongs to
[client-fetch-cache](../../../../client-architecture/client-fetch-cache/client-fetch-cache.md);
this technique is about what the *host* tells every client about a static build
output. And where the response is generated rather than built, its lifetime is
a statement about how long a claim stays true, which is a different calculation
entirely — see
[outcome-branched-cache@public-verdict-badge](../../../../engineering-assessment/maturity-and-conformance/public-verdict-badge/techniques/outcome-branched-cache.md).
