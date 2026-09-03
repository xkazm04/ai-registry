---
layer: technique
type: technique
subject: optional-dependency-degradation
technique: fallback-retirement-condition
status: forged
laws: [creation-names-reaper, gate-sees-target, count-carries-predicate, unknown-is-not-a-value]
shared_with: []
use_when: [a fallback written for a platform gap that the platform is expected to close, deciding whether to gate a substitute implementation on a capability check or always run it, a compatibility path nobody has measured since it was written, a workaround still shipping years after the capability it covered arrived, a pinned dependency carries workarounds and a fix for one of them has merged upstream, deciding whether an exact version pin is a workaround or a policy]
---

# Fallback retirement condition

The rest of this subject treats absence as a **stable fact about a
deployment**: this installation does not have an object store, and the
fallback that answers it is permanent for as long as that stays true. A second
kind of absence behaves nothing like it. The capability is missing *for now* —
a runtime older than the feature, a server-side capability mid-rollout, a
downstream service on a version that has not shipped the endpoint yet — and
the gap is expected to close on a schedule the application does not control
and cannot see.

For that kind, a fallback is a **bet that the frontier will move**, and it
inherits an obligation the ladder does not otherwise impose:
[creation-names-reaper](../../../../_laws.md#creation-names-reaper). Everything
created names what destroys it and when. Every fallback in
[per-variable-blast-radius](./per-variable-blast-radius.md) names its
*consequence*; a fallback covering a closing gap must also name its
**retirement condition**, or the codebase has acquired a permanent resident
that arrived describing itself as temporary.

## The capability check is the reaper

The retirement condition is not a calendar entry and not a task in a backlog.
Where the capability can be tested at run time, the check **is** the reaper,
and it makes retirement automatic:

> Run the substitute only when the check says the real capability is absent.
> Take the real one whenever it is there.

That single conditional does something no scheduled cleanup achieves: it
retires the fallback **per caller, on the caller's own timeline, with no
maintenance and no deploy** — including in a codebase nobody is maintaining
any more. Every runtime upgrade in the field silently moves another slice of
traffic onto the real implementation, and the fallback fades to a no-op long
before anyone gets around to deleting the code. Deletion is then a tidying
step over a path that already carries no traffic, rather than a migration.

The check must test the **capability**, not a proxy for it
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Branching on a
version string, a client identifier, or a build flag is the same error this
subject already names in
[probe-the-grant-not-the-config](./probe-the-grant-not-the-config.md), one
layer out: the proxy is true on the day it is written and drifts afterwards,
and it drifts in the direction that keeps the fallback alive on runtimes that
gained the capability years ago. Ask for the thing you are about to use.

## Removing the check makes the cost permanent

There is a standing argument for deleting the check and always running the
substitute. It is usually made on integrity grounds — a substitute that
occupies the same name as the real capability, and behaves even slightly
differently, becomes the behaviour callers actually depend on, and the
divergence is then hard to withdraw. The concern is real. The remedy inverts
the economics of the whole pattern.

A substitute is accepted because it is **temporary**: it is heavier, usually
slower, and it reliably handles fewer edge cases than the implementation it
stands in for — the one that got the accessibility pass, the localisation
pass, and the adversarial input review. Callers tolerate those costs because
every upgrade in the field moves more of them off it. **Remove the check and
none of that happens.** Every caller pays the substitute's weight forever, no
caller ever reaches the real implementation's correctness or performance even
once it is sitting right there, and a bounded, self-clearing cost has been
converted into a permanent tax to prevent a divergence that may never occur.

The trade is worth stating in the shape that makes it decidable, because it
generalises past this subject: **a cost that expires and a cost that does not
are different kinds of cost, and a mitigation that converts the first into the
second has to justify itself against the whole undiscounted total, not against
the risk it removes.**

## Suppressing the fallback does not remove the need

The other proposed remedy — do not ship the substitute at all — fails for a
reason worth recording, because it is the reason this technique sits in this
subject rather than in a style guide. The need that produced the fallback is a
caller who wants the real capability where it exists and something workable
where it does not. Refusing to supply one named, checked substitute does not
retire that need; it **disperses** it, into a conditional at every call site,
each written by a different author with a different idea of what the degraded
path should do.

That is strictly worse on the axis this subject cares about most. One
substitute behind [guarded-singleton-accessor](./guarded-singleton-accessor.md)
has one blast radius, one place to fix a bug, and one line in the
blast-radius document. Twenty ad-hoc conditionals have twenty, they are not
enumerable, and no upgrade retires any of them, because none of them was ever
written down as covering a gap. The question is never *whether* the gap gets
covered; it is whether it gets covered once, visibly, with a reaper, or
twenty times, invisibly, forever.

## Measure the path, or the reaper is unverified

A retirement condition that nobody reads is an intention. Emit which branch
was taken — real capability or substitute — and the fallback becomes
falsifiable in the way the rest of this subject demands of its degradation
claims. The share of traffic still taking the substitute is the retirement
condition expressed as a number, and it answers the only two questions that
matter: whether it is safe to delete the path yet, and whether the check is
even working. A fallback that was expected to be fading and is not has
usually failed at the previous section's rule — the branch is keyed to a
proxy that stopped tracking the capability, so it is answering a question
nobody asked.

Carry the predicate with the number
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): "4% of
sessions took the substitute" means nothing without the check that decided it,
and the two most interesting readings — a number that will not fall, and a
number that fell to zero — are both instructions rather than trivia. The first
says the check is wrong or the frontier stopped moving. The second says delete
the code.

## The fallback is also the least-tested path, and for the same reason

The section above measures the fallback at run time. Its build-time sibling is
worth stating separately, because it is a *prediction* rather than an
observation: within any family of alternative paths, **the fallback is
systematically the one with the weakest tests**, and the mechanism is the same
one that makes it the least-travelled.

Testability seams get built where somebody had a reproducible failure. A primary
path fails on real machines, so its author eventually extracts the parsing from
the acquisition — passing in the root directory, the resolver, the command
output — so the failure can be reproduced as a fixture. The fallback has no such
history: it runs only where the primary is absent, nobody's development machine
is in that state, and no bug report ever arrives with an input somebody can
paste into a test. So the seam never gets built, and the code that most needs to
be exercisable without the environment is the code still reading the real
environment directly.

The signature is visible by inspection and cheap to check. In a family of host
or capability probes, look for the members whose logic takes its root, its path,
or its resolver as a **parameter**, with a thin public wrapper supplying the real
one. Those are the tested members. Any sibling that reaches for the live path
inline has no seam, and almost certainly no tests — and in the families this has
been measured in, the seamless sibling is reliably the fallback. One such family
carried an injectable root and three fixture cases on the primary vendor's
device-tree probe, and its sibling — the path taken *only* when the primary
vendor's own tool is unavailable — read the system path inline with no test at
all. That is the arrangement least able to survive the machines it exists for.

Two rules follow, and both are cheap:

- **Build the seam on the fallback first, not last.** It is the member you
  cannot exercise by running the program, so a fixture is the only instrument
  available for it. The primary at least fails in front of you.
- **Prefer a run-time environment check to a compile-time one in the fallback's
  own body.** A path excluded at compile time on every machine but its target is
  a path the test suite cannot even link, let alone run; the same guard written
  as a run-time condition keeps the body compiled and reachable everywhere, so a
  fixture can drive it from any platform. The guard still returns nothing off
  its target — it just does so where a test can watch.

This does not replace the traffic measurement; it precedes it. A fallback with
no fixture and no traffic is not a verified path, it is an assumption with a
branch in front of it.

## When the gap is in something you pin: the release is the reaper

The two lanes above assume the code can either test its premise or stamp it. A
third kind of gap does neither cleanly. The capability is missing from **a
dependency the codebase pins** — a prerelease of an infrastructure library, a
wrapped binary, a platform SDK — and the defect is in how that dependency
behaves against a real deployment, not in anything a runtime check can ask
for. The workaround is a template that avoids the broken path, a pin held
below a regression, a build flag that disables a cache. None of them can find
out for themselves whether the gap is still there, and the dated stamp
undercounts in one specific way: the upstream publishes the *fix* long before
it publishes an *artifact containing the fix*, and the two events are
routinely confused.

So the rule for this lane is stated as evidence tiers, because that is where
its retirements go wrong:

1. **Released source** — the exact code a consumer installs — establishes what
   the gap is.
2. **A provider-free reproduction** proves the parts that need no credentials:
   serialization, dependency edges, generated files, type behaviour.
3. **A live reproduction** is required for anything the deployment target
   decides: uploads, routing, bindings, cleanup.
4. **A fix merged on upstream main is not evidence for removing anything.** It
   predicts a future release. Until the pin moves to a published artifact that
   contains it, the workaround's premise holds for every consumer, and a
   cleanup that removes it "because it is fixed" has shipped the defect back.
   Rendering *merged* as *fixed* is
   [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) at the
   dependency boundary.

The reaper for this lane is therefore three things at once: a published
artifact containing the fix, the pin moved to **exactly** that artifact, and
the case the workaround was minted for rerun against it. Two consequences are
less obvious than the rule.

**The accepted version can itself carry a regression.** A pin advanced on the
strength of a changelog — source-tier evidence — has landed inside a broken
window more than once in trees this corpus was measured against, and once in
the source that prompted this section: the release that closed one gap opened
another on the same surface. Every row in the workaround ledger therefore
re-runs on every pin move, not only the row the move was made for, and each
row's status says which tier established it (`source-inspected`,
`provider-free`, `live-reverified`) so a later reader knows what the closure
actually proved.

**Keep a ledger of disproved claims.** Static review of a pinned dependency
produces plausible defects at a steady rate — a directory read
non-recursively, a flag dropped during upload, a string in a bundle that
"proves" which endpoint is active — and most of them are wrong in a way only
a reproduction shows. A claim investigated and disproved is recorded with the
evidence that disproved it, beside the confirmed rows, so it is not re-derived
and re-filed by the next reviewer. This is the discipline a good defect record
already practices — it states what would have refuted its own conclusion —
applied to the claims that *were* refuted. Three sections, then, and they do
not merge: confirmed defects, each with its removal condition; limitations
observed but not source-confirmed; claims disproved.

**A policy is not a workaround, and the ledger must say which is which.** An
exact pin looks like a temporary measure taken around a defect, and in one
common case it is a permanent policy: a caret range over a prerelease admits
every prerelease with the same version tuple, and prerelease identifiers
order lexically, so a stray `-test` tag published once outranks every
`-beta.N` forever. The pin that guards against that has no removal condition
because its premise never expires. A cleanup pass that reaps it along with
the row above it has removed a policy, and the ledger's only defence is a
label on the row.

The lane also inherits the completeness problem
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) names.
Where the workaround *disables* something — a build cache whose scope misses
inputs outside its directory — one passing edit does not prove an
include-list covers every input, and the removal condition has to name the
class of inputs the replacement must be shown to see, not a sample of them.

## Where this does not reach

Some workarounds cannot test their own premise. The gap is a behaviour rather
than a feature, or the substrate that moved is a component whose capabilities
are not enumerable — a model generation, a downstream heuristic, an upstream
team's judgment. There the automatic reaper is unavailable and retirement
reverts to a dated audit: stamp the workaround with the substrate version it
was written against, and re-test on the next one.
[substrate-coupled-expiry](../../../../llm-agent/prompt-and-context/agent-instruction-files/techniques/substrate-coupled-expiry.md)
owns that lane and its instrument — withhold the workaround, run the case it
was minted for, keep it only if the failure reappears.

The boundary between the two is a single question, and it is worth asking
before writing either: **can this code find out for itself whether the gap is
still there?** If yes, the check is the reaper and the audit is unnecessary. If
no, the stamp is the reaper and the audit is the only instrument there is.
