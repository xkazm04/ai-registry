---
layer: technique
type: technique
subject: tenant-scoped-agent-runtime
technique: fail-direction-follows-deployment-mode
status: forged
stage: multi-service
laws: [absent-guard-is-loud, unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [a credential resolver must decide what to do when the active scope has no such name, adding tenant isolation to a runtime that single-tenant deployments already ship, background work authenticates with a placeholder while interactive work succeeds, deciding whether a scope is an overlay or a boundary]
---

# Fail direction follows deployment mode

Once every credential read passes through one resolver that consults the
active tenant scope, the resolver needs a rule for two cases: the scope is
installed but does not carry this name, and no scope is installed at all.
The tempting answer is a single rule — always fall through to the process,
or never — and both single rules are wrong, in opposite deployments. This
technique states the correct rule: **the fail direction is a function of
whether isolation is required, and the deployment says whether it is.**

## The two positions

**Isolation off.** One configuration is served, and the process environment
holds that configuration's credentials — injected by a service manager, by
a secret-manager wrapper that execs the process with values in place, or by
a plain shell export. Here the scope is an **overlay**: a name found in the
scope wins, and a name absent from it falls through to the process, because
there is no second tenant whose value could be borrowed. There is nothing
to leak from, so the strict rule buys nothing and costs everything.

**Isolation on.** Several configurations share the process, and the process
environment may hold any of their values. Here the scope is
**authoritative**: a name absent from it resolves to the declared default
and the resolver does *not* consult the process, because the process is
exactly where the wrong tenant's value lives. An absent name is a genuine
absence and must render as one
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)): the
correct output is the caller's declared default, never a plausible value
that happens to be lying around.

And the third case, which is the one that earns the technique: **isolation
on, and no scope installed at all.** That is not an absence; it is a
**missing guard**, and it must be loud
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The
resolver raises, with a message naming the credential, saying that this call
path must run inside a scope, and pointing at the design note. An unmigrated
or newly added call site then fails at its own line, in its own stack, on
its first execution — instead of silently reading whatever the process holds
and authenticating as somebody else.

## The measured failure that produced the split

The split is not symmetry for its own sake. Applying the authoritative rule
unconditionally — scope wins, no fallback, in every deployment — breaks
single-tenant installations, and it breaks them in a shape that takes a long
time to diagnose.

The reason is that a scope gets installed on more paths than the ones that
need isolation. A scheduled-job runner installs a per-job scope around
*every* run, as a matter of uniformity, long before anyone turns isolation
on. Under the unconditional rule, that scope stops being an overlay and
becomes a blindfold: credentials that exist only in the process environment
vanish inside the block. Interactive turns, which run outside that block,
keep resolving fine. The observable result is that **every scheduled run
authenticates with a placeholder and is rejected upstream, while every
interactive turn succeeds** — two lanes of the same system disagreeing about
whether the credentials are configured. Nothing in the failure points at
scoping, because the credential is present, spelled correctly, and works
when a human tries it.

That signature is worth recognising on sight: *background fails
authentication, foreground does not* is a scope that swallowed the process
environment in a deployment that had nothing to hide from.

## The allowlist is tight, and widening it is never the fix

Not every name a process reads is a tenant credential. Some genuinely
describe the **process**: its launch root, its interpreter and locale
settings, its proxy configuration, the listener's host and port, routing
stamps injected by the deployment. Those must keep reading the process
environment under every mode, because routing them through the strict path
would make correct deployments crash on startup.

So the resolver's order is: **global names read the process; otherwise the
scope; otherwise the mode decides.** The allowlist that defines "global" is
where this technique goes wrong in practice, and three rules keep it honest.

**Membership is by exact name or declared prefix, and the list is short.**
When in doubt, a name is a tenant secret. The bias is deliberate: a
misfiled credential leaks across tenants, while a misfiled process setting
raises an error somebody fixes in a minute.

**Adjacent names split.** The sharpest test of the list is a family whose
members are not all the same kind. A listener's host, port and enablement
are deployment configuration; the listener's *key* is a credential, and it
stays tenant-scoped even though it shares the family's prefix. A relay's
endpoint and routing stamps are deployment configuration; the relay's
shared secret and delivery key are authentication material and stay
scoped. The list therefore carries the exception in writing next to the
family, because the next author to add a sibling name will otherwise add it
to the wrong side by pattern-matching on the prefix.

**A name that must resolve identically everywhere is a global by that
fact.** Where two subsystems read the same name and a scope-dependent split
would leave the system half-configured — an adapter registered but the
platform absent from configuration, or the reverse — the name belongs on the
global side, and the reason is written at the site.

The discipline that holds all three together: **when a credential read
fails closed, the fix is to wrap the call path in a scope, never to add the
name to the allowlist.** Widening the allowlist converts a loud, located
failure into a silent cross-tenant read. It is the removal of the artifact
that exposed the defect, with the additional harm that the guard still
looks intact: the list is shorter than the leak it now permits, and nothing
in the system records that a boundary moved.

## The failure must not be swallowed on the way out

One more rule, because the fail-closed exception is only useful if somebody
sees it. A caller that wraps the credential read in a broad exception
handler and degrades to a fallback turns the loud failure back into a quiet
one — and the degradation is often invisible, because the fallback produces
plausible output. This is exactly
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
at the call site: a subsystem that ran without its credential and a
subsystem that had nothing to do must be distinguishable in what they
report. Where a fallback is legitimate, it records that it fired and why.

## Decision rules

- Derive the fail direction from the deployment mode, held as a
  process-level flag set once at startup. It describes the deployment, not
  the unit of work, so it is not itself a scoped value.
- Isolation off: the scope is an overlay; a miss falls through to the
  process.
- Isolation on, scope installed: the scope is authoritative; a miss returns
  the caller's default and never consults the process.
- Isolation on, no scope: raise, naming the credential and the call path
  that must be wrapped.
- Keep a tight allowlist of names that describe the process rather than a
  tenant; match by exact name or declared prefix; split adjacent names when
  one of them is credential material, and write the exception beside the
  family.
- Fix an unscoped read by wrapping the call path. Never by widening the
  allowlist.
- Do not let a broad exception handler downgrade the fail-closed signal into
  a silent fallback; a fallback that fires says so.

## When not to use it

A runtime that will never serve more than one configuration needs only the
overlay half, and the mode flag is dead weight. A runtime whose credentials
are *only* ever read through a brokering door that already takes the tenant
as an argument does not need the mode split either — the tenant is a
parameter, not an ambient fact, and the whole question dissolves. This
technique is for the common middle case: a large existing surface of
name-based credential reads that must acquire tenant awareness without
being rewritten call site by call site.
