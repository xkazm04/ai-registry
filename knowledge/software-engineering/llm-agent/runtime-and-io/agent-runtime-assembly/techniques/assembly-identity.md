---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: assembly-identity
status: forged
laws: [derivation-names-recomputation, gate-sees-target]
shared_with: []
use_when: [comparing two deployments of the same agent, an assembly digest changes on every redeploy, deciding what a hook must declare about itself, a release descriptor needs to say which agent it shipped]
---

# Assembly identity

Once the hook chain is a contract, the assembled runtime is something with an
identity: a particular set of hooks, in a particular order, each with
particular policy parameters, over a particular roster of tools and skills.
Two deployments either ran the same assembly or did not, and the question is
answerable only if the assembly carries a digest scoped to answer it. This
technique is that digest: what every hook must declare, what the digest
sorts and what it preserves, what it excludes, and how it differs from the
prompt's own fingerprint — which lives inside it.

## One question, and a scope that answers only it

A digest's meaning is its scope. The assembly identity exists to answer
exactly one question — **did this agent's assembly change?** — and every
inclusion decision is made against that sentence. Something whose change
should read as "a different agent" goes in; something whose change should
not — and the largest such thing is the host build — stays out.

The build is the trap. It is tempting to fold the runtime's version into the
identity, because a newer runtime *might* behave differently. But a digest
that includes the build moves on every redeploy, and once it moves on every
redeploy it can no longer distinguish "we changed the agent" from "we
shipped on Tuesday" — which is the only distinction anyone wanted from it.
The build is recorded *beside* the identity in the release descriptor, as its
own field, so the two questions stay separately answerable.

The identity is captured **at assembly, inside the factory that builds the
runtime**, and nowhere later — because the inputs that decided it are
unrecoverable afterwards. Which model was resolved from the requested name,
which tools survived the capability filter, which hooks were appended by
which builder: a descriptor assembled after the fact from the running object
reconstructs some of that and guesses the rest. One consequence is worth
stating: record what was *resolved*, not what was *requested*. The requested
model name is an input; the resolved model is the agent. Including the
request in the digest makes two identical agents differ by an alias.

## Every hook declares its own identity

The assembly cannot know what a hook does by looking at it from outside.
Probing a hook's private attributes — its threshold field, its template
string, its mode flag — works until the next refactor renames the field, at
which point the digest goes quietly constant while the behaviour keeps
changing. Per [gate-sees-target](../../../../_laws.md#gate-sees-target), a
digest computed over a proxy for the hook's behaviour passes exactly when the
proxy diverges from the behaviour.

So the rule is inverted: **every behaviour-affecting hook declares its policy
parameters**, through one method with one name, returning the values that
shape what it does. Thresholds and modes are declared as values. Long text —
an instruction template, a policy document the hook injects — is declared
as its digest, never embedded, so the identity stays small and does not
carry the text's content into every descriptor. A hook that affects
behaviour and declares nothing is a compose-time failure, not a hook with an
empty identity; the absence is the defect.

Probing is permitted only as a *marked fallback* for hooks the runtime did
not write and cannot amend — a third-party hook wrapped in isolation, say —
and the mark travels into the descriptor, so a reader knows which components'
identities are declared and which are inferred. The review rule that keeps
declarations true is small and non-negotiable: **adding a behaviour-affecting
field to a hook means adding it to that hook's declaration in the same
change.** A declaration that lags its hook by one release is a digest that
reads "unchanged" across the release that changed it.

Wrappers are transparent to identity. A runtime that isolates contributed
hooks wraps each in the same wrapper class, and a describer that looks at the
wrapper sees every contribution as the same object with no declaration —
collapsing every extension into one identical entry and hiding every policy
change inside them. The describer unwraps to the inner hook, reads its
declaration there, and records the contribution's *source* — which extension
supplied it — as part of the identity, so two deployments with the same hook
from different extensions are different agents.

## Sort what is order-insensitive; preserve what is not

The identity is a canonical serialization, and canonical means deciding, per
component, whether order carries meaning:

- **The tool roster and the skill set are sorted.** Two assemblies with the
  same tools registered in a different order are the same agent; a digest
  that distinguished them would fork on the iteration order of a map.
- **The hook chain is preserved in order.** The previous technique made the
  order a contract — it decides what wraps what — so two chains with the same
  hooks in a different order are *different agents*, and the digest must say
  so.
- **Each hook's declared parameters are serialized canonically** — keys
  sorted, values normalized — so a hook whose parameters are stored in an
  unordered structure does not produce a digest that varies by process.

The general rule: sort where the runtime's semantics are order-blind,
preserve where they are not, and never let the choice fall to whichever
collection type the implementation happened to use.

## The descriptor names its recomputation

The identity is a stored derived value, and per
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
it states how it is recomputed: which components are included, in what
serialization, under which digest procedure, and under which version of that
procedure. A descriptor that carries the digest and nothing else reproduces
the problem one level up — nobody can say whether two descriptors differ
because the assembly changed or because the digest procedure did. Version
the procedure; a procedure change invalidates every prior comparison, once,
explicitly.

The descriptor is also a document, not only a hash. Beside the digest it
carries the ordered hook list with each hook's declared identity, the sorted
rosters, and the prompt fingerprint — so that when two digests differ, the
reader can diff the descriptors and name the component that moved, instead
of learning only that *something* did.

## The boundary with the prompt fingerprint

prompt-assembly defines a fingerprint too, and the two are easy to conflate
because both are digests over "the configuration". They are not the same
instrument, and a runtime that merges them breaks both.

The **prompt fingerprint** digests the standing layers of the text the model
reads — template version, capability set as rendered, configuration that
alters the text — and exists to gate *session reuse*: a session opened under
one fingerprint and resumed under another is stale and must be rebuilt, not
continued. Its consumer is the resume path; its consequence is a rebuild.

The **assembly identity** digests the code around the call — the hook chain
in order, each hook's policy parameters, the tool and skill rosters — and
exists to compare *deployments and runs*. Its consumer is a release
descriptor, a run record, a diff between two environments; its consequence
is a human reading a difference.

The relationship is containment, not competition: the prompt fingerprint is
**one field inside the assembly descriptor**. A prompt change therefore
changes the assembly identity, as it should — the agent is different — while
an assembly change that leaves the prompt alone does not touch the session
gate, as it should not — the session's text is still the text that would be
built today. Keeping the two separate is what lets a hook be added without
invalidating every live session.

## Where the identity lands

The identity is stamped on the run record at assembly, before the first model
call, and carried into the release descriptor of any deployment. From there
it does the work it exists for: a behaviour shift is bisected to the
assembly identity that introduced it; two environments that "should be the
same" are compared by one value and, when they differ, by the descriptors
behind it; a delegate spawned by a lead records its own identity, so a fleet
can say which of its members ran which assembly.

## Decision rules

- Scope the digest to one question — did this agent's assembly change — and
  decide every inclusion against that sentence.
- Exclude the host build; record it beside the identity, never inside it.
- Capture the descriptor inside the factory, at assembly; record what was
  resolved, never what was requested.
- Require every behaviour-affecting hook to declare its policy parameters
  through one named method; hash long text; fail composition for a
  behaviour-affecting hook that declares nothing. A field that changes
  behaviour enters the declaration in the same change.
- Permit probing of undeclared hooks only as a marked fallback, with the
  mark carried into the descriptor.
- Unwrap isolation wrappers before describing a hook, and record the
  contribution's source as part of its identity.
- Sort the tool and skill rosters; preserve the hook order; serialize each
  hook's parameters canonically.
- Carry the components and the procedure version in the descriptor, so a
  differing digest can be explained by a diff.
- Keep the prompt fingerprint as one field inside the descriptor, and keep
  its consequence — rebuild the session — separate from this one's —
  compare the deployments.

## When not to use it

One deployment, one assembly, no delegates, no comparisons anyone has asked
for: the identity is a value nobody reads, and a hook-declaration
requirement nobody benefits from is friction. The technique starts to pay at
the second environment — staging beside production, or a delegate beside its
lead — when "are these the same agent" is asked for the first time and the
honest answer is otherwise a shrug.
