---
layer: technique
type: technique
subject: optional-dependency-degradation
technique: misconfiguration-never-reaches-a-fallback
status: forged
laws:
  - absent-guard-is-loud
  - unknown-is-not-a-value
  - failure-not-empty-success
shared_with: []
applied: code
ab_verdict: better
use_when: [a configuration reader filters out values it does not recognise, a list of provider or arm identifiers is read from the environment or a roster file, a constructor accepts arbitrary keyword options, a degraded answer is good enough that nobody would notice it replaced the real one, writing a stand-in for a dependency a test build does not link, a typo in a setting changed which backend served and nothing logged it]
---

# Misconfiguration never reaches a fallback

The subject's asymmetry branches on presence: absent degrades, malformed fails
fast. That rule has a blind spot that lives *before* the branch. Presence is
judged by the code that reads, and the code that reads can only see names it
recognises. A value set under a name it does not know, or an identifier it
does not know inside a value it does, is present to the operator and absent
to the reader, so it takes the absent branch and the fallback runs. Every step
is the documented behaviour; the deployment is misconfigured and will stay
that way, because the fallback is a working mode and a working mode is never
investigated.

The rule: **a fallback is entered only from the cause it was built for.** A
configuration mistake the process could have detected must refuse at the
point it became detectable, naming what it saw, even when a fallback is
available that would have produced a good answer. The better the fallback,
the more this matters: a poor degraded answer gets reported, a good one masks
the misconfiguration indefinitely.

## Three doors a misconfiguration walks through

**An unrecognised name is dropped.** The commonest spelling is a filter:
identifiers are read from a list, anything not in the registered set is
discarded "so a stale value cannot wedge the app", and whatever survives is
used. A preferred engine misspelled by one letter becomes no preference, and
the resolver serves the first allowed engine; in the measured case that was
the paid remote engine where the operator had asked for a local one, and no
fallback event fired, because the preference was already empty before the
resolver could see what had been asked. The same shape one layer down is a
constructor with a catch-all keyword parameter: a persistence option under a
wrong key is accepted, ignored, and the store runs in memory while presenting
as persistent. And one layer up, a declarative roster that binds entries to a
catalog by identifier and silently drops the ones it cannot bind: an entry
that became inert shifted a fifth of one traffic cluster onto the most
expensive tier and roughly four fifths of that cluster's spend with it,
without a single error. **Unknown is not absent**
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)):
reject the unrecognised name with the variable, the token and the registered
set, and validate a roster as data at boot so an invalid entry stops the
process instead of shaping its traffic.

**A runtime fallback is reachable from a configuration failure.** A component
built to survive a transient failure of its dependency (the model call timed
out, so answer extractively from what was gathered) is wired so the same
branch runs when the dependency was never configured. Both conditions produce
"no model answer", and one line of code serves both. They are different
causes: the transient one is worth absorbing, the permanent one is worth
telling the operator about, and absorbing it guarantees they never hear. So
the configuration check runs *before* the fallback branch and refuses on its
own, and the fallback is reachable only from a call that was attempted and
failed. This does not contradict "absent degrades": that rule is for a
dependency the deployment declares it does not have, with a named fallback
and a stated consequence. A fallback that exists to paper over a failed call
has neither.

**A stand-in returns a plausible default.** A stub that exists to satisfy a
link or an import, and that returns zero, an empty list or success when
called, turns a wrong dependency graph into a passing test. The stand-in
aborts when it is reached and names what it stands for, so the failure says
which dependency the build was supposed to include. A silent form is
legitimate for one shape only: registration-style calls whose result cannot
affect what is being tested. The split is decided once, where the stub is
defined, not per call site. This is the test-harness spelling of the
subject's refusal of a no-op client returned in place of a throw.

## Where rejecting the unknown is wrong

A reader of a *document other people write and version* must ignore what it
does not recognise, or every addition to the format becomes a breaking change
([must-ignore-unknown](../../../../engineering-process/standards-and-gates/repo-manifest-standard/techniques/must-ignore-unknown.md)).
The discriminator is who can fix the value and when. Operator configuration
for this deployment is written by the person who will read the refusal, read
at the process that will act on it, and fixed by editing one line: reject.
An interchange document is written by a different version of a different
program: ignore, and let a declared version field carry the strictness.

Retirement is the other honest objection, and it has a narrow answer. When a
registered identifier is retired, map the old name to its successor by name,
or refuse with a message that says it was retired. Do not widen the filter
into "drop anything unknown" to cover the one retired name, because the
filter cannot tell the retired name from a typo. Check before arguing
retirement: in the measured case no identifier had ever been retired and the
only writer emitted registered identifiers, so the drop was protecting
nobody.

## Decision rules

- **A fallback names its cause, and its branch tests for that cause.** A
  degraded answer reached from a configuration mistake is a mask, however
  good the answer.
- **An unrecognised name inside a present value is malformed, never absent.**
  Refuse with the variable, the offending token and the accepted set;
  unset and empty still take the default.
- **Refuse at the earliest point the mistake is detectable**, which for a
  lazily built client is its first construction: that refuses the feature,
  not the application, and keeps the blast radius where the subject wants it.
- **No catch-all option bag on a constructor that configures durability,
  identity or cost.** An unknown keyword there is an error.
- **Validate a roster as data before it can route anything**, and stop on an
  entry that does not bind; never let binding drop it.
- **A stub aborts and names what it replaces;** silence is for registration
  calls whose result the test cannot observe, chosen at the definition.
- **Retire an identifier by name.** A general drop-unknown filter is not a
  retirement policy.
- **Test the typo, not just the absence.** The test that sets a near-miss
  identifier and asserts a refusal naming the variable is the one that fails
  against the drop; a test that sets nothing passes against both.
