---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: semantic-hook-placement
status: forged
laws: [one-validation-door, gate-sees-target, identity-survives-reuse]
shared_with: []
use_when: [adding a hook that wraps model or tool calls, a contributed hook must sit at a particular depth in the chain, a receipt or audit ledger has gaps on refused calls, two hooks disagree about which one sees the other's result]
---

# Semantic hook placement

A runtime that wraps its model call and its tool call in hooks has, whether
it admits it or not, a composition order — and the order is not cosmetic.
Wrapping is nesting: the outermost hook sees the call before anyone else and
the result after everyone else, and any hook that can *answer* a call itself
— refuse it, serve it from a cache, block it pending proof — makes every hook
inside it invisible for that call. This technique is the discipline that
turns "the order the list happened to be written in" into a contract:
contributions declare where they sit by what they need to see, one point
composes the chain, and the invariants that make the order correct are
checked when the chain is built.

## Why an index is the wrong address

The naive extension surface is a list with insertion points: "put your hook
at position three." It works until the host inserts a hook at position two,
at which point every contribution's placement is silently off by one — and
nothing errors, because an index is always valid. This is the
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)
failure in its purest form: an index-based key breaks under exactly the
operation the list undergoes, and it breaks quietly.

There is a second, less obvious way the index fails. Runtimes that build
more than one agent shape — a lead agent and the delegates it spawns —
usually share a base builder and let each shape append after it. A
contribution injected into the shared base lands *before* every shape's own
hooks, which is the wrong depth for anything that needs to see a
shape-specific hook's output. Placement by index cannot even express "after
the lead's own gates"; placement by class can.

## Placement classes: declare what you need to see

A contribution declares a **placement class** — a name for the vantage point
it requires — and the composer resolves the class to a position. The classes
that recur across runtimes are few, and they are defined by the boundary
the hook needs to observe:

| class | sees | typical occupant |
| --- | --- | --- |
| **model, logical** | the conversation as the runtime reasons about it — after sanitization, before physical batching or retry | prompt caching policy, context compaction, provenance stamping |
| **model, physical** | the actual request and its retries — the wire the model vendor sees | retry-with-sanitized-input, token accounting, request-level tracing |
| **tool, visible** | the tool call as the model issued it and the result as the model will read it | authorization, freshness gates, argument gating, receipt stamping |
| **tool, raw** | the call after the visible layer has had its say, on its way to the executor | transport-level timeouts, executor selection |
| **standard** | no boundary requirement — a plain hook that runs in the ordinary position | most product features |

Within a class, a contribution also declares a stable **order key**, so two
contributions in one class compose deterministically. What it never declares
is a number relative to the host's list. The classes are the runtime's
vocabulary for depth; the host owns the mapping from vocabulary to position,
and can change the mapping without breaking any contributor.

The decision rule for a new hook: ask *what must this hook see, and what must
it not be able to hide from?* The first answer chooses the class; the second
is checked by the invariants below.

Two refinements keep the vocabulary honest. **A placement is a guarantee per
hook chain, not per list position.** A runtime usually has more than one
chain — the model-call chain and the tool-call chain at least — and a hook
participates only in the chains whose hooks it actually implements. Its
position means something on those chains and nothing on the others, so a
guarantee test asks "does this hook participate in the chain the class
describes", never "is it at the right index". And **a class is resolved
against the host's own hooks, through an anchor with a fallback chain**: the
class "outer of the retry layer" is resolved by finding the retry hook. When
the primary anchor hook is absent from a given chain — a leaner delegate
shape, say — the composer falls to a secondary anchor and *reports that it
did*, as a warning naming the contribution, because a class resolved through
a fallback is a weaker guarantee than the one documented and the contributor
should know. Anchors are a maintained table with a reason per entry; when the
host appends new hooks, each anchor is re-read against them, because "as
close to the raw call as possible" silently stops meaning what it says the
day two more wrappers land inside it.

## One final composition point

Every chain the runtime builds — for the lead agent, for each delegate, for
an internal system run — is rendered by one function from an ordered
declaration. That function is the
[one-validation-door](../../../../_laws.md#one-validation-door) of the chain:
it is the only place the whole chain is visible, and so the only place an
invariant about the whole chain can be checked. A runtime with two composers
— one for the lead, one for delegates, each with its own ordering table —
has two truths about what wraps what, and they drift the first time someone
adds a hook to one and not the other.

The composer also has a structural discipline of its own. The placement
tables it consults are often defined in a module that the hook
implementations themselves import, which closes a cycle if the tables import
the hooks. The rule is to **resolve classes at composition time, by calling
into the declaration, and never to fake a resolved value at import time** —
a lazily populated stand-in that pretends to be the resolved table is the
kind of object that is correct in tests and wrong in the one process that
imported things in a different order.

## The invariants, and the one that names itself

Ordering invariants are stated as relations between hooks — *A wraps B*,
with a sentence of reason — never as absolute positions, and the composer
validates every relation against the rendered chain, contributed hooks
already merged in, before the chain is used. A violated invariant is a
compose-time failure that names the two hooks, the reason, and the
contribution responsible; a relation whose hooks are absent from this chain
is skipped rather than failed, because an invariant is a claim about hooks
that are present. The check earns its severity: unlike a missing
observation, a broken wrapping order produces wrong behaviour with no error
anywhere, so it is the one hard failure the extension surface should have.
The invariants a production runtime carries are specific, and each one is
the memory of a defect:

- **The outermost tool wrapper is the one whose omission would gap a
  ledger.** A receipt stamper, an audit journal, an execution ledger — any
  hook whose job is to record that a call happened — must sit outside every
  hook that can answer a call itself. Inside an authorizer, it never sees the
  refused calls; inside a freshness gate, it never sees the blocked writes;
  inside a cache, it never sees the hits. Those are precisely the calls a
  verifier reading the ledger most wants, and the ledger's silence on them
  is indistinguishable from "nothing happened". This is
  [gate-sees-target](../../../../_laws.md#gate-sees-target) applied to the
  ledger: a record that observes a proxy — the calls that got past the
  gates — passes exactly when the gates did something.
- **A gate that refuses sits outside the accountant that counts.** A
  blocked write must not cost a progress slot, a step budget, or a retry
  allowance; if the accountant wraps the gate, every refusal is billed as an
  attempt.
- **Input sanitization is the outermost model wrapper.** Retries happen
  inside the physical model layer; if sanitization sits inside retry, the
  first attempt is clean and the retry sends the original.
- **Provenance is stamped where it is known.** A hook that injects a
  message stamps its provenance at injection, at whatever depth that is,
  because by the time the call reaches the model boundary an injected
  message is indistinguishable from any other.

The list grows by incident, and each addition is a relation with a sentence
of reason attached. What does not grow is the set of hooks that are exempt
from the check.

## A hook that calls through the surface it wraps

Some hooks are not passive. A model-backed guard asks a model whether a
command looks safe; a summarizing observer calls the model to compress what
it saw; a policy hook reads a file through the tool executor; a delegate
spawned by a hook runs a whole inner loop. Each of those is a hook
*originating* a call on the very surface the chain wraps, and the chain now
has a question its placement vocabulary does not answer: **does the inner
call traverse the chain, and if so, which hooks see it?**

Both wrong answers are common and each fails silently. If the inner call
traverses the full chain, the originating hook wraps its own call: a gate
that evaluates its own model request can refuse it, wait on it, or loop on
it, and a ledger stamps the inner call as if the model had issued it — the
receipt says the agent ran a tool the agent never asked for. The
infrastructure version of this is an admission control that intercepts the
resources its own process needs, so an upgrade of the controller is blocked
by the controller it replaces; the fix there is to exclude the controller's
own scope from its own matching, and the rule transfers unchanged. If the
inner call bypasses the chain entirely, the hook has been handed an
unwrapped path to the model and the executor — no sanitizer, no authorizer,
no receipt — and a contributed hook can now do through its inner call what
the chain exists to forbid on the outer one.

The composer's answer is a third placement fact beside class and order key:
every call carries an **originator**, and the chain is rendered per
originator. A hook-originated call traverses every hook whose class needs
to see it, *minus the originating hook and the hooks inside it*, so nothing
wraps itself; and the ledger records the originator, so a receipt for an
inner call names the hook (or the delegate) that issued it rather than the
model. The exclusion is a relation the composer can validate like any
other: *H does not wrap calls originated by H*. Where a delegate is a full
inner unit rather than a single call, the runtime already builds the
delegate's own chain, and the same rule says what that chain must carry —
the delegate's identity as originator — so that a ledger reader can tell a
delegate's tool calls from the lead's. A runtime that reported hooks as
"not firing" for delegate tool calls, and later fixed it by stamping the
delegate's identity on every hook payload, walked exactly this path.

## What the composer refuses

A contribution whose class the composer does not know is refused at compose
time, not defaulted to *standard* — a hook that asked for the tool-visible
boundary and silently landed in the ordinary position is an authorization
gate that authorizes nothing. A contribution that declares two classes is
refused; if it needs two vantage points it is two hooks. And a contribution
that names a *position* — "before the host's freshness gate" — is refused
in favour of the class that position belongs to, because a name coupling to
one host hook breaks when that hook is renamed or split.

## Decision rules

- Place every hook by a declared class and a stable order key within it;
  never by a list index or by the name of a neighbouring hook.
- Render every chain the runtime builds through one composition function;
  a second composer is a second truth.
- State ordering invariants as wrapping relations between named hooks, and
  validate them at compose time; a violation names both hooks and fails the
  build of the chain.
- Place any hook that records what ran outside every hook that can answer a
  call itself. If the ledger has gaps on refused calls, the stamper is
  inside a gate.
- Place refusing gates outside counting accountants, and sanitization
  outside retry.
- Resolve placement tables at composition time by calling the declaration;
  never stand in for a deferred import with an object that pretends to be
  resolved.
- Refuse an unknown class, a double class, and a positional name; do not
  default any of them.
- Stamp every call with its originator. Render the chain for a
  hook-originated call without the originating hook and the hooks inside
  it, validate *H does not wrap calls originated by H* as an invariant, and
  make the ledger name the originator rather than the model.

## When not to use it

A runtime with one hook and no extension surface has no ordering problem to
validate; the invariants are trivially true and the class vocabulary is
ceremony. The technique starts to pay at the second party — the moment
someone who did not write the host's list needs to add a hook to it — and
pays again at the second agent shape, when the lead and its delegates stop
sharing one chain. Below that, keep the list, but keep the sentence: write
down why the receipt stamper is first.
