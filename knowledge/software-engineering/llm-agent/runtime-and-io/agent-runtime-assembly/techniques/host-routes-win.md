---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: host-routes-win
status: forged
stage: team
laws: [gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [a contribution wants to mount handlers on the host's service, deciding whether a contributed route shadows a host route, a route matcher guesses at path overlap, contributed routes fail only after the host is already serving]
---

# Host routes win

An extension surface has more than one seam. Hooks enter the chain; tools
enter the roster; and where the runtime is served, contributions want to
mount **routes** — handlers on paths of the host's own service. A route is
a claim on a path, and a path the contribution claims may already be the
host's: a health probe, an authentication callback, a webhook the host
exempts from its own login. A contributed handler that matches first on such
a path has replaced the host's behaviour on it, and if the path was
authentication-exempt, it has done so for any caller on the network. This
technique is the mount discipline that makes the seam safe: contributed
routes are built early, mounted last, rejected atomically when they provably
shadow the host, and admitted when the relationship cannot be proven —
rather than guessed.

## Build early, mount last

The two verbs are separate on purpose. A contributed router is **built** at
load time, alongside the rest of the extension's loading, so that a
construction failure — a malformed path, a handler that does not import —
surfaces where every other load failure surfaces and is attributed the same
way. Building late, at first request, converts a load error into a runtime
error on a caller's request, and the attribution is lost.

But it is **mounted** after every host route, so that the host's handlers
are matched first. In a router that resolves a request by first match in
mount order — one large family of routers, and the one the runtime this
technique was raised from uses — mount order is a security property:
whatever is mounted first owns every path it matches, including paths it
matches by accident through a wildcard or a parameter segment. The host's
routes are the ones whose behaviour the host's own gates assume, so the
host's routes go first, and there is no configuration that lets a
contribution jump the queue.

The rule is conditional on the router's matching discipline, and the
condition must be checked rather than assumed. A second family of routers
resolves by **specificity**: the pattern matching the narrowest set of
requests wins regardless of registration order, and two patterns that
overlap with neither more specific than the other are a registration-time
conflict the router refuses outright. Under that discipline mount order is
not a security property at all — a contributed `/auth/{id}` outranks the
host's `/auth/*` however late it was mounted — and "mount last" protects
nothing. What such a router gives instead is the shadow proof of the next
section, performed by the router itself: a provable overlap is a refused
registration, and a contribution whose pattern is *more specific* than a
host path is admitted as the winner, which is the shadow this technique
exists to prevent. So on a specificity router the host must run its own
shadow check before registration, against the reserved set below, and treat
"more specific than a host route" as a proven shadow rather than as a
legitimate win. Know which family the host's router is; the mount-last rule
and the register-time check are two implementations of one invariant — the
host's handler answers on every path the host's gates assume — and each
family needs the one that works there.

## Reject on a proven shadow, atomically

Mounting last makes the host win at request time; it does not tell anyone
that a contributed route is dead. A contribution that registers a handler on
a path the host already serves has a handler that will never run, and the
contributor will learn this from a support ticket. So the composer checks,
at mount time, whether **an existing route provably covers one of the
contribution's paths for the same method** — and when it does, the whole
contribution is rejected, atomically, with the covering route named.

Atomically matters. Mounting the non-shadowed half of a router and dropping
the rest produces a contribution that is partially present, which is harder
to diagnose than one that is absent with a reason. A router is one unit of
intent; it mounts whole or not at all.

"Provably" is the technique's centre, and it cuts both ways. Path patterns
compose: a parameter segment covers every literal at that position; a
wildcard covers everything below it; a literal covers only itself. The
relation *A covers B* is decidable for some pairs and not for others — two
routers with regular-expression constraints on their parameters, say, or a
converter the matcher resolves at request time. The rule for the undecidable
pairs is the one [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
demands: **an unprovable relationship is allowed, not guessed.** A matcher
that guessed "probably shadows" would reject legitimate contributions; one
that guessed "probably not" would let a contribution shadow an
authentication-exempt host path. Neither guess is a finding. The mount-last
rule already makes the host win at request time for the pairs the proof
cannot reach, so the cost of allowing the unprovable is a dead contributed
route, never a shadowed host route.

That argument has one exception, and the exception is where the technique
gets its teeth. The host keeps a **reserved list**: the paths its own gates
exempt — authentication-exempt callbacks, cross-site-protection exemptions,
health probes. Against a reserved path, the unprovable is *not* allowed: a
contributed pattern whose relationship to a reserved path cannot be proven
disjoint is rejected, because the cost of being wrong there is not a dead
contributed route but a handler on an unauthenticated path. Allow the
unprovable in general; fail closed on the reserved set. The two rules
together are the whole policy.

The proof also runs on the routes **as they will be compiled**, not as they
were declared. Including a router into the host recompiles its patterns
against the host's converter registry, so a preflight that inspects the
contributor's objects before inclusion is inspecting something the router
will not match on; the preflight projects the same registry the inclusion
will use.

## The predicate classifies the path the router actually matches on

The shadow check, and every security predicate that classifies a path — is
this one authentication-exempt, is this one internal-only — must run on the
path the router *will match on*, not on the string the contributor wrote.
Routers normalize: they strip or add trailing separators, they collapse
repeated separators, they lower-case or do not, they decode or do not. A
predicate that classifies the raw declared string and a router that matches
the normalized one disagree exactly on the inputs an attacker chooses.

Per [gate-sees-target](../../../../_laws.md#gate-sees-target), the fix is
to classify with the router's own normalization — by calling the router's
own path helper — rather than with a copy of it. The copy is the seductive
option: it avoids depending on a private import, and it is correct on the
day it is written. But a private import that disappears **fails loudly**, at
startup, with a name; a vendored copy that falls behind the router's
behaviour **diverges silently**, at a security boundary, on the one request
that exploits the difference. Between a loud failure and a silent divergence
at a security boundary, take the loud failure, and pin the dependency so the
failure is a deliberate upgrade event.

## What is refused outright

Some things a contribution may ask to mount are not routes, and the shadow
proof does not cover them: a **custom lifespan** that runs code around the
host's own startup and shutdown; a **mount** that places an entire
sub-application under a prefix, with its own middleware and its own matching;
a **long-lived socket route** whose upgrade handshake the host's
authentication layer does not see. Each of these can run code where the
host's gates have not run, and the honest answer is refusal with a named
reason until the host can authenticate them — not a mount with a warning.
The refusal is a statement about what the host can currently prove, and it
is lifted per capability when the proof exists, not per contributor who
asked nicely.

## Principal projection

A contributed handler runs with the request's principal, and the principal
it sees is a **projection** the host builds — the verified identity and the
attributes the host chose to expose — never the host's raw authentication
object. A contribution that could read the host's session object could read
every other tenant's; one that receives a projection reads what the host
decided a contribution may know. The projection is the same across every
contributed route, built by one function, so that "what does an extension
learn about the caller" is one answer, not one per handler.

## Decision rules

- Build contributed routers at load time, with load-time attribution of
  failures; mount them after every host route, with no override.
- Establish which matching discipline the host's router uses. Mount-last
  is the invariant's implementation on a first-match router only; on a
  specificity router, run the shadow check before registration and treat a
  contributed pattern more specific than a host route as a proven shadow.
- At mount, reject a contribution atomically when an existing route provably
  covers one of its paths for the same method; name the covering route.
- Allow the unprovable; never guess in either direction. On a first-match
  router, mount-last already makes the host win where the proof cannot
  reach — except against the host's reserved security paths, where the
  unprovable fails closed. On a specificity router there is no such
  backstop, so the reserved set is the minimum the proof must cover.
- Run the proof on the routes as they will be compiled into the host, with
  the host's own converter registry.
- Roll back one rejected router whole, without preventing later routers from
  mounting.
- Run every path-classifying predicate on the path the router will match
  on, using the router's own helper; do not vendor a copy of it. Pin the
  dependency so its disappearance is a loud upgrade event.
- Refuse lifespans, mounts and socket routes from contributions until the
  host can authenticate them; lift the refusal per capability, with the
  proof.
- Hand contributed handlers a principal projection built by one function,
  never the host's raw authentication object.

## When not to use it

A runtime that serves no contributed routes has no mount order to defend.
The technique starts to pay at *team* stage, the day a contribution first
asks for a path — and the check that pays first is the cheapest one: is the
path it asked for one the host already serves without authentication.
