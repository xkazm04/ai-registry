---
layer: golden-path
type: golden-path
subject: remote-capability-probing
status: forged
use_when: [reading from a remote store nobody on your team administers, deciding whether a peer supports partial reads before the first real read, a fallback quietly downloaded a whole object instead of a fragment, adding an operator switch that turns a probe off, choosing how to buffer reads whose backing stores sit at very different distances]
techniques:
  - advertised-support-is-not-evidence
  - the-probe-that-is-also-the-first-read
  - assertion-permission-and-bypass-are-three-switches
  - degraded-rung-refusal-ceiling
  - buffer-by-access-latency-class
  - instrument-by-cause-not-by-hit-rate
---

# Remote capability probing

Some of the data a system reads lives somewhere it does not administer. The
address was typed by a user, pasted into a configuration file, or handed over by
a partner; behind it is a store operated by somebody else, sitting behind
whatever caching, signing and rewriting layers that somebody else chose. The
system has to read from it anyway, and before the first useful read it must
settle a question that has nothing to do with whether the store is up: **can
this peer serve me a fragment of an object, or only the whole thing?**

That question, and the small family of questions shaped like it, is what this
subject owns. A remote capability probe produces a **per-peer verdict about how
to talk to a peer** — which access protocol is available, what the smallest
useful request is, and therefore what the read path is allowed to assume. It is
not a verdict about liveness, it is not a verdict about your own credentials,
and it is not free. Every probe costs a round trip against a party who is not
paying for it, and the answer has a shelf life measured in the session rather
than in seconds.

The naive reading is that this is a lookup: ask the peer what it supports, cache
the answer, get on with it. It fails in three places at once. The peer's own
declaration is emitted by a layer that is frequently not the layer that would
serve the request. The cheap way to ask — a metadata-only request — is the
request most likely to be specially handled, and therefore the one most likely
to lie. And the fallback taken when the answer is *no* is not a slightly slower
version of the same read; it is a different economic activity, converting a
bounded fragment fetch into an unbounded whole-object transfer that the caller
never budgeted for.

## What this subject owns, and what the neighbours own

The closest neighbour is
[health-checks](../../../operations/service-operations/health-checks/health-checks.md),
and the boundary is the shape of the verdict rather than the shape of the probe.
That subject asks **does this dependency work, right now**, and everything it
prescribes follows from the present tense: the answer is re-asked on a cadence,
it ages out in seconds, it drives a light and a remediation, and it must change
nothing. This subject asks **how must I address this peer**, which is a
different verdict with a different clock: it is stable for as long as the peer's
configuration is, it is cached for a session and invalidated by a settings
change rather than by a timer, and nobody wants a dashboard light for it. A
peer that refuses fragments is entirely healthy. Where the two do meet — a probe
that observed a definitive refusal — the observation feeds that subject's health
record rather than being re-derived, and its probe discipline (deadlines,
identity, dedup, reaping what a timeout abandoned) is inherited here wholesale
and not restated.

[Optional dependency degradation](../optional-dependency-degradation/optional-dependency-degradation.md)
owns the case where the thing that might be missing is **yours**: a store you
provisioned, a credential you hold, a grant you can widen by editing a policy.
Its rule that a gate must test the grant rather than the configuration is the
same law applied one boundary in, and its refusal vocabulary is the one a
refusal here should borrow rather than invent. The discriminator is who can fix
a *no*: if the answer is an operator on your side changing a value or a
permission, that is the neighbour; if the answer is a stranger changing their
own infrastructure, or nobody at all, it is here. That difference is why this
subject never proposes hardening the peer and never treats a *no* as a defect —
it treats it as a fact about the world that the read path must be shaped around.

[Adaptive fidelity tiers](../../../ui-surfaces/feedback-and-style/adaptive-fidelity-tiers/adaptive-fidelity-tiers.md)
carries the same slogan — measure, do not trust the declaration — for the local
machine the process is already running on, where the probe is free, repeatable,
and can be re-run every few frames until it settles. Invert every one of those
properties and you have this subject: the probe costs a round trip against
somebody else's budget, it cannot be repeated to build a distribution, and the
consequence of getting it wrong is a transfer rather than a dropped frame. What
transfers between the two is the argument that declarations fail in both
directions; what does not transfer is any technique that assumes measurement is
cheap enough to keep taking.

Three further boundaries are stated once and not revisited. Deciding what ships
in the artifact at all is a build-time gate, and no measurement can conjure a
code path that was never compiled. Cache keying, admission and eviction policy
belong to
[client-fetch-cache](../../../client-architecture/client-fetch-cache/client-fetch-cache.md);
what this subject owns of that machinery is only the **instrument**, because a
byte counter that cannot say why a byte was fetched cannot evaluate a probe
ladder. And retrying a request that failed belongs to
[retry-backoff](../retry-backoff/retry-backoff.md): a probe that returns *no* did
not fail, it succeeded, and re-issuing it is the commonest way to spend three
round trips learning what one round trip already established.

## An advertisement is a hint; a provoked response is evidence

Most access protocols worth probing have a blessed way to announce themselves —
a header, a capability field, a discovery document. It is the weakest signal
available, and the reason is structural rather than a matter of bad
implementations. The advertisement is emitted by whichever layer terminates the
connection, and in front of any store worth reading there are several: a caching
tier, a rewriting proxy, a signing gateway, an edge node serving from its own
copy. Each of them can pass through an advertisement it does not itself honour,
or strip one the origin would have honoured. The declaration and the behaviour
are produced by different components, which is exactly the condition under which
[a gate must see its target](../../../_laws.md#gate-sees-target).

So the rule is that a capability is accepted only on **a response you provoked**,
and the acceptance test names the exact observation: a status that could only be
produced by the capability actually running, plus the field that only that status
carries. "It did not fail" is not that observation. Neither is a success status
on a request that would have succeeded either way — a peer that ignores a
fragment request and returns the whole object returns a perfectly good response,
and a read path that checks only for success has just concluded that fragments
work on the strength of a whole-object transfer. The acceptance test, the
verdict's storage and its invalidation are
[advertised-support-is-not-evidence](./techniques/advertised-support-is-not-evidence.md).

## Make the probe pay for itself

The health discipline's rule is that a probe performs the **smallest real
interaction** and changes nothing, and that "smallest" excludes a representative
workload because measuring performance is a different job. That rule is correct
where probes are cheap and frequent. Here it needs an argument against it rather
than a restatement, because the scarce resource is not the peer's state — a read
has no state to disturb — it is the round trip.

When the probe cannot have side effects anyway, the cheapest probe is the one
whose successful response is **useful work**. Request the smallest genuine
fragment of the real object rather than asking a metadata-only question about it,
for two reasons that compound. The metadata verb is the one most often specially
handled — cached, rewritten, rejected by a signing policy that was only ever
tested against reads — so it is simultaneously the cheapest question and the one
whose answer least predicts the behaviour you care about. And a successful
fragment both proves the capability and returns bytes you keep, so the probe's
cost falls to zero on the path that matters. The rule, the ladder that follows
when the first rung is ambiguous, and the cases where the metadata question is
still the right one are
[the-probe-that-is-also-the-first-read](./techniques/the-probe-that-is-also-the-first-read.md).

## Three switches, not one

Every probe ladder acquires operator controls, and they are routinely collapsed
into a single flag because from a distance they all read as "about probing".
They are three different decisions with three different owners, three blast
radii and three failure signatures:

- an **assertion** — *I already know the answer for this peer; skip the probe.*
  An optimisation. Wrong, it costs a little correctness at the margin.
- a **permission** — *if probing says no, you may fall back to the expensive
  path.* A policy. Wrong, it costs money and latency.
- a **bypass** — *do not probe at all; go straight to the fallback.* An
  override. Wrong, it disables the capability the system exists to provide.

They are separate switches with separately stated defaults, and the default on
the third one is the whole reason to separate them. A bypass whose unset value
resolves to *on* silently retires the feature for every deployment that never
set it, and it does so without a single failing test, because the system still
returns correct answers — expensively. An optional guard is an absent guard, and
this is the same law pointed at a probe rather than a validator: the deployed
fleet converges on the default, so the default *is* the decision
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)). The three
meanings, the default discipline, and the enumerating test that catches the
missing one are
[assertion-permission-and-bypass-are-three-switches](./techniques/assertion-permission-and-bypass-are-three-switches.md).

## A rung that changes kind needs a ceiling

A fallback ladder is usually a ladder of *degree*: the same operation, a little
slower or a little less precise. This one is not. When the peer refuses
fragments, the substitute is a whole-object transfer, and for the objects this
subject exists to read — the ones large enough that fragment access was worth
probing for — that is not a degradation, it is a different order of magnitude
paid by a caller who asked for a few kilobytes.

The rule is that a rung whose cost model differs in kind from the rung above it
declares a **size above which it is a refusal rather than a degradation**, and
the ceiling is derived from something measured — the caller's own patience
budget, the memory the process can hold at once — rather than chosen by feel
([limits-are-derived](../../../_laws.md#limits-are-derived)). Above the ceiling
the read refuses, in the shape the refusal vocabulary next door already defines,
and the refusal says which capability the peer lacks so the operator knows the
fix is at the other end. The retirement half of this — when a fallback for a
gap that is expected to close may be deleted — is owned by
[fallback-retirement-condition](../optional-dependency-degradation/techniques/fallback-retirement-condition.md)
and is not restated here; what is different is that this gap is not expected to
close, so the instrument is a ceiling rather than a reaper. The derivation, the
announcement and the refusal shape are
[degraded-rung-refusal-ceiling](./techniques/degraded-rung-refusal-ceiling.md).

## Why the buffering and the byte counters live here too

The probe answers a question about distance, and the answer is worthless if
nothing downstream reads it. Two techniques in this subject are the consumers of
the verdict, and they belong beside the probes rather than in a subject of their
own because they are the only things that make the verdict actionable and the
only things that make it falsifiable.

A file-shaped abstraction over heterogeneous backing stores hides exactly the
fact the probe went to the trouble of establishing: how far away the bytes are.
Under that abstraction a single uniform buffering layer is simultaneously pure
overhead for the store that is already at memory speed — a copy, a latch and an
eviction decision imposed on data that was one dereference away — and wholly
insufficient for the store that is several round trips away. So the probe's
verdict is not merely a boolean about fragments; it is an **access-latency
class** assigned per backing store at open time, and every layer above reads the
class rather than re-deriving it. Buffer explicitly for every expensive class,
and offer a direct bypass for the class that is already resident, set per file
at open and never as a global mode:
[buffer-by-access-latency-class](./techniques/buffer-by-access-latency-class.md).

The second consumer is the instrument. A buffer or cache reported as hits versus
misses averages together three populations with opposite remedies: bytes fetched
because a caller demanded them cold, bytes fetched speculatively that nobody ever
read, and bytes served from what was already resident. A hit rate that improves
because readahead grew more aggressive and a hit rate that improves because the
working set got smaller are the same number, and only one of them is good news.
Partitioning every byte counter by **why the fetch happened** is what turns the
probe ladder from an assertion into a measurement — it is the only way to see
that a peer silently landed on the expensive rung, because on that rung the cold
byte count stops tracking the bytes the caller asked for and starts tracking the
size of the objects:
[instrument-by-cause-not-by-hit-rate](./techniques/instrument-by-cause-not-by-hit-rate.md).

## What this subject refuses

- **A capability accepted on a declaration.** The layer that announces support
  and the layer that would honour it are usually not the same layer.
- **A capability accepted on a bare success.** A peer that ignored the request
  and served the whole object also answered successfully.
- **A probe re-issued because it said no.** A refusal is a completed
  measurement, not a transient failure, and retrying it spends the round trips
  the probe existed to save.
- **A metadata-only probe chosen because it is cheaper.** It is cheaper and it
  is the request most likely to be handled by something other than the read
  path.
- **One switch covering assertion, permission and bypass.** Three owners, three
  blast radii, one flag, and the operator who wanted the first gets the third.
- **A bypass that defaults to on.** It retires the feature silently, on every
  deployment nobody configured, while every test still passes.
- **A fallback rung with no ceiling.** A whole-object transfer standing in for a
  fragment read is a refusal wearing the costume of a degradation.
- **A uniform buffer over stores at different distances.** It is a tax on the
  near tier and a fiction for the far one.
- **A hit rate as the instrument for a probe ladder.** It averages speculative
  waste and cold demand into a number that recommends nothing.
- **A per-peer verdict with no invalidation.** A stored derivation names how it
  is recomputed, and a capability verdict that survives a settings change is a
  configuration nobody can apply.

## The techniques

- [advertised-support-is-not-evidence](./techniques/advertised-support-is-not-evidence.md)
  — why the blessed advertisement is the weakest signal, the exact observation
  that constitutes acceptance, and the verdict's per-peer scope, storage and
  invalidation.
- [the-probe-that-is-also-the-first-read](./techniques/the-probe-that-is-also-the-first-read.md)
  — preferring a smallest-genuine-fragment probe over a metadata question, the
  argument against the general smallest-interaction rule, and the disambiguating
  second rung.
- [assertion-permission-and-bypass-are-three-switches](./techniques/assertion-permission-and-bypass-are-three-switches.md)
  — the three independent controls, their defaults, and the enumerating test
  that must name every serialized switch or it certifies nothing.
- [degraded-rung-refusal-ceiling](./techniques/degraded-rung-refusal-ceiling.md)
  — deriving the size above which the expensive rung refuses instead of
  degrading, and announcing the transition where a caller can see it.
- [buffer-by-access-latency-class](./techniques/buffer-by-access-latency-class.md)
  — classifying each backing store at open, buffering explicitly for expensive
  classes, and the per-file direct bypass for the resident one.
- [instrument-by-cause-not-by-hit-rate](./techniques/instrument-by-cause-not-by-hit-rate.md)
  — partitioning byte counters by cause, the resolution trade that keeps the
  histogram bounded, and the readings that are instructions rather than trivia.
