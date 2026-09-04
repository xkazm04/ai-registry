---
layer: technique
type: technique
subject: mcp-tools
technique: caller-differentiated-capability
status: forged
laws: [absent-guard-is-loud, gate-sees-target, one-validation-door]
shared_with: []
use_when: [one engine serves both a human command line and an agent tool, deciding which options an agent surface may not have, an invariant held by review rather than by construction, a passthrough tool inherits every flag of the thing it wraps]
---

# Caller-differentiated capability

[catalog-projection-modes](./catalog-projection-modes.md) publishes the same
command tree at several resolutions and insists that **nothing downstream of
the projection knows which one is running** — identical handlers, identical
schemas, identical authorization. That is the right rule for its problem,
which is catalog size under a host's tool budget. This technique is the case
where the difference is deliberate and downstream: one engine, two callers,
and **an option set for the agent that is a strict subset of the option set
for the human**.

The two are not variants of one taste. A person at a terminal is already
inside the trust boundary — they chose the directory, they can read the files
anyway, and a flag that lets them escape a root escapes nothing they did not
already have. A model calling the same engine over a tool protocol is *at*
the boundary, and the golden path's framing applies without dilution: the
schema is a contract the server enforces, not documentation for well-behaved
callers.

## Subtract the options that break the invariant, not the ones that look risky

The design move is to name the invariant the agent surface must hold, then
remove exactly the inputs that can violate it — and to hold it **by
subtraction rather than by validation**. A capability the schema does not
accept cannot be smuggled through a check somebody forgets to run
([one-validation-door](../../../../_laws.md#one-validation-door), read as: the
narrowest door is the one that admits nothing to validate).

A worked example from a search tool that wraps a well-known file-search
binary and exposes it both as a CLI and as an agent tool. The invariant is
*every path this touches resolves inside the declared root*. Three subtractions
follow from it, and only from it:

- **Symlink following.** The CLI offers it; the agent tool rejects it by name.
  A followed symlink is the one input that makes root containment
  unenforceable at parse time, because the escape happens in the filesystem
  after every string check has passed.
- **Path arguments generally.** Search paths, ignore files, and pattern files
  are each resolved through their existing ancestors and asserted to be
  inside the canonical root, so the check sees the real target rather than the
  spelling ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
- **Output-format options.** Roughly two dozen flags that would replace the
  wrapper's result contract with the wrapped binary's are refused, because the
  agent-facing result format is the product boundary and a caller that can
  rewrite it can reshape what the model reads as evidence.

Note what is *not* subtracted: matching, context, encoding, glob, type and
regex-engine options all pass through. The agent keeps the whole expressive
surface and loses only the three families that touch the invariant. A
subtraction chosen by feel would have cut the powerful-looking options and
kept the dangerous one.

## The asymmetry is a published fact, not a silent narrowing

An agent that asks for a subtracted option must be told, by name, that this
surface does not have it — `option "--follow" is not supported by the MCP
tool`, naming the surface as well as the option. Two failure modes are
avoided at once. A tool that silently ignores an unsupported flag returns
results that answer a different question than the one the model asked, and
the model has no way to know. A tool that refuses without naming the surface
reads as a bug in the wrapper, and the model retries.

The corollary is that the difference belongs in the documentation for both
surfaces, on both sides — the CLI guide saying which of its flags the agent
tool does not carry, the tool contract saying it is a subset and of what.
An asymmetry discoverable only by hitting the error is an
[absent guard](../../../../_laws.md#absent-guard-is-loud) in its
documentation form: it protects the run that trips it and nothing that plans
around it.

## The refusals are a channel, and they must not collapse either

Naming the surface in the refusal is the first half. A connected runtime that
ships this design supplied the second, and it is the case the rule above does
not reach: when the narrowed surface refuses, **the reasons it refuses for
must stay distinguishable from each other**, not merely from success.

That runtime grants its subprocess exactly one tool and gates every call on a
per-job token. A presented token resolves to one of four verdicts — none
presented, never minted, minted but past its deadline, valid — and the three
refusals carry three different sentences. The reason is not politeness to the
model. Two of those refusals mean opposite things to an operator reading a
log: *expired* says a run ended and a straggler called late, *unknown* says
the caller is not the process at all. A surface that collapsed both into
"denied" would make a leaked credential indistinguishable from an ordinary
race, and the collapse would be invisible precisely because both cases
already look like a correctly working guard.

So the subtraction has a matching obligation on the way out. Enumerate the
refusal reasons as a closed set, keep the ones an operator would act on
differently apart, and let the tool report each as its own error rather than
as one denial — the [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
discipline applied to a boundary's negative answers. The model only needs to
know it may not; the operator needs to know which "may not" happened.

## When the subset should be a different tool instead

Subsetting is right when the two callers want the same operation under
different authority. It is the wrong shape when the *operation* differs — when
the agent's version would need different arguments, a different result, or a
different mental model. Then publish a separate tool with its own name and
schema, because a shared name across genuinely different behaviour is the
identity defect [tool-identity-vs-tool-name](./tool-identity-vs-tool-name.md)
describes, arriving through the back door.

The discriminating question: *if the invariant were not a concern, would the
two surfaces be the same call?* Yes means subtract. No means split.

## What this cannot do

The subtraction bounds what the agent can *ask for*; it says nothing about
what the results contain. A tool that cannot escape its root still returns
whatever is inside that root, including content written by somebody else, and
that remains [untrusted-result-handling](./untrusted-result-handling.md)'s
problem. Nor does a smaller option set reduce the surface's blast radius on
the write side — this technique is about containment of reads and of the
result contract; destructive operations belong off the agent catalog
entirely rather than in a narrowed form of themselves.
