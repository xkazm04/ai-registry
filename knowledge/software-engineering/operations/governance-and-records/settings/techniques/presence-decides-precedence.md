---
layer: technique
type: technique
subject: settings
technique: presence-decides-precedence
status: forged
laws: [unknown-is-not-a-value, gate-sees-target, creation-names-reaper]
shared_with: []
use_when: [renaming a key in a source the application can only read, two names addressing one setting during a grace period, a deprecated key still winning over the current one, deciding whether a fallback read tests presence or value, a deprecation warning that only fires for operators who already migrated]
---

# Presence decides precedence

[key-registry](./key-registry.md) answers a rename with a migration: register
the new key, move the stored values from old to new once at upgrade, retire the
old key. That answer has a precondition it does not state, because within a
settings store it is always true — **the application can write to the store.**

A large share of configuration arrives from somewhere it cannot. An environment
block, a mounted config file, a command line, an orchestrator's manifest: the
operator owns those, the application reads them, and there is no upgrade step in
which the process rewrites the operator's compose file. For that source, the
middle step of a rename does not exist. Both names must be live at once for a
grace period whose length the application does not control, and the only
question left is which one wins.

> **Decide it on presence, never on value.** "Did the operator set the new
> name?" is a question about the key. "Is the new name's value still the
> default?" is a question about the answer, and the two stop being the same
> question the moment the default is also a legal value an operator might mean.

## The ordinary accessor cannot answer this

[typed-accessors](./typed-accessors.md) reads a raw value and substitutes the
declared constant when it is absent, and that is correct — it is what lets the
application boot on an empty store. It also **destroys the only signal this
decision needs.** After the substitution, unset and set-to-the-default are the
same bytes, and no amount of care at the call site recovers the difference.

So the precedence read is a different read. The resolver asks the source whether
the key is *there*, and only then asks what it says:

- **New name present** → it wins, whatever it says. Emit the deprecation notice
  if the old name is also present, because that is the operator who has migrated
  and still has a stale line to delete.
- **New name absent, old name present** → the old name supplies the value, and
  the deprecation notice fires here too, naming the replacement.
- **Neither present** → the declared default, reached as a decision rather than
  as a fall-through.

The failure this replaces is one line long and reads as obviously correct:

```
value = read(new_name, default=D)
if value == D:
    value = read(old_name, default=D)
```

It tests the value because the value is what the accessor returned. Under it, an
operator who has done exactly what the deprecation notice asked — set the new
name, to `D`, deliberately — is silently overridden by whatever the old name
still says, and **the deprecated key beats the current one**. The precedence the
documentation promises is inverted for precisely the operators who complied with
it. This is [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
at the configuration boundary, and
[gate-sees-target](../../../../_laws.md#gate-sees-target) at the same time: the
branch reads a defaulted value as a proxy for a presence it never asked about.

**A boolean default makes it worst.** Where the default is `false`, the value
the collapse hides is the single most likely thing an operator explicitly
writes, so the defect fires on the common case rather than an edge of it. Where
the default is a sentinel nobody would type — an empty string, a null, a
number outside the legal range — the collapse is still there and merely harder
to reach, which is worse for diagnosis rather than better for correctness.

## The notice fires for the wrong population

There is a second defect in the same shape, and it survives even after the
precedence is fixed, so it is worth stating separately: **a deprecation notice
attached to the branch where the old name wins is a notice the migrating
operator never sees.**

The operator who has set the new name has, by construction, taken the other
branch. Their old line sits in the manifest unread and unmentioned, and it will
still be there at removal time — when it becomes either a silent no-op or, on a
strict loader, a boot failure attributable to nothing they did recently. The
population that needs to hear about a deprecated key is *everyone who still has
it*, not everyone still relying on it.

So the notice is attached to the **key's presence**, not to its victory. Two
distinguishable messages, because the two audiences need different sentences:
one says *this name is deprecated and is supplying your value — set the new
name*; the other says *this name is deprecated and is being ignored because the
new name is set — delete it*.

## The grace period names its own end

A dual-name read is a fallback, and it owes a reaper
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)) — but not
the automatic kind. Nothing in the process can observe the frontier moving,
because the frontier is other people's deployment files, so the retirement
condition is a **release**, not a check: the old name is read for N releases and
removed in a named one, and the notice says which one from the day it is
introduced. A deprecation that names no removal point is the permanent resident
[deprecation-by-version-arithmetic](../../../../engineering-process/build-and-release/release-pipeline/techniques/deprecation-by-version-arithmetic.md)
describes, arriving through configuration instead of through an API.

The one instrument available is the notice itself. Count how often each of the
two messages is emitted, and the pair answers the only question removal needs:
the first message going to zero means nobody is still *relying* on the old
name; the second going to zero means nobody still *has* it. Removing on the
first alone breaks the manifests the second was counting
([count-carries-predicate](../../../../_laws.md#count-carries-predicate) — the
two counts are not interchangeable and a single "deprecated key seen" number is
neither).

## Where this sits beside the chain

[cross-source-precedence-chain](./cross-source-precedence-chain.md) resolves one
key across several sources and closes with a refusal: *order that depends on the
value is a policy engine, not a chain.* That refusal is right, and it assumes
value-dependence is something an author chose. **This technique is the case
where nobody chose it.** The author intended presence and wrote value, because
the accessor in front of them returned a value and no presence, and the two
coincided on the day the code was written. The chain's rule names the smell; the
mechanism that prevents it is a read that can say "absent" out loud.

The two compose cleanly and should not be merged. The chain decides *which
source* answers; this decides *which name within a source* answers. A
deployment can need both — a config file and an environment block, each of which
may carry either spelling — and then the presence question is asked per source
as the chain walks it, rather than once against a value the chain already
flattened.

## Failure modes

- **The value-tested fallback** — `if the new key still reads as the default,
  consult the old one`, which hands the deprecated name a win over an operator
  who explicitly set the current one.
- **The boolean default** that makes the above fire on the most common explicit
  value rather than an obscure one.
- **The notice on the losing branch**, invisible to every operator who migrated
  and still has the old line to delete.
- **One "deprecated key seen" counter** standing in for two different questions,
  so removal is scheduled off the wrong one.
- **The rename that assumes a writable store** — a migration step planned for a
  source the application can only read, which quietly becomes no migration at
  all and no dual read either, so the old name simply stops working on upgrade.
- **The grace period with no named release**, which is how a two-name read
  becomes permanent and how the next author learns that both spellings are
  supported forever.
