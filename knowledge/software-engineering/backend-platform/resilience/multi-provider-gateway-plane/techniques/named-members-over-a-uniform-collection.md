---
layer: technique
type: technique
subject: multi-provider-gateway-plane
technique: named-members-over-a-uniform-collection
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [deciding whether a set of upstream adapters should be held as a list behind their interface, one slow upstream probe is serializing a startup path, an enrichment source's failure took down the whole aggregate, two upstreams' results need different matching rules downstream]
---

# Named members over a uniform collection

An interface implemented by every upstream adapter invites one obvious next
move: hold them in a collection of that interface and iterate. It is the shape
every design discussion arrives at, it is usually right for the **request path**
— where the whole point is that a candidate is interchangeable — and it is
usually wrong for the **inventory path**, where the plane assembles its own
picture of what its upstreams have.

The distinction is not stylistic. It is about whether the members are still
interchangeable *after* their results come back.

## The question that decides it

> **Do the members' outputs get consumed identically, and does the failure of
> any one member cost the same as the failure of any other?**

Two yeses mean a uniform collection is correct and the interface should carry
the dispatch. A single no means the collection is erasing exactly the
distinction the code downstream depends on, and the aggregate should name its
members individually.

In practice, on the inventory path, both answers are usually no:

- **Match semantics differ per member.** One upstream's identifiers are matched
  by substring because they arrive as free-form ids; another's are matched by
  equality because they were derived from filenames the plane itself resolved.
  Collapse them into one set and the substring rule leaks onto the values that
  needed equality, or the reverse — and the resulting defect is a
  false positive in somebody's inventory, which is the expensive direction (see
  [join-breadth-follows-the-wrong-match-cost](./join-breadth-follows-the-wrong-match-cost.md)).
- **Failure policy differs per member.** Some members are load-bearing: if the
  primary inventory source cannot be reached, the aggregate is wrong and should
  say so. Others are **enrichment** — a supplementary scan that adds detail — and
  their failure should degrade to "no extra detail", never take the aggregate
  down with it. A uniform collection has one error path, so it has one policy,
  so one of those two members is being handled wrong.

## The shape that keeps the interface and drops the dispatch

The resolution is not to delete the interface. Keep it: it is a **uniformity
contract** that forces every adapter to answer the same four or five questions,
and it is what makes a new adapter a small, reviewable addition. What changes is
that the *aggregate* does not consume it polymorphically.

The aggregate is a record with one named field per member — and, where the
counts matter, one count per member beside its set. Reading that type tells a
maintainer exactly which upstreams contribute to the picture, which is a thing a
collection cannot express. The fan-out that fills it names each member
explicitly, which is where the per-member policy becomes writable:

- each member's probe runs concurrently, because the aggregate's latency is
  otherwise the **sum** of every timeout rather than the longest one, and an
  offline upstream pays its full timeout;
- each member's result is unwrapped at the join site with the policy that member
  deserves — a load-bearing member propagates its failure, an enrichment member
  collapses to empty ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success));
- the asymmetry is visible in the diff, one line per member, which is what makes
  it reviewable rather than a convention somebody has to already know.

## The concurrency substrate is chosen by the interface's most constrained consumer

The fan-out has to be concurrent, and the obvious way to get concurrency in a
modern stack is to make the adapter interface asynchronous and await the members
together. Before doing that, look at who else holds the interface, because that
decision does not stay inside the fan-out.

An asynchronous interface is viral in two directions at once. It propagates
*outward* to every caller — including ones with nothing to do with concurrency,
such as a synchronous event loop that must return promptly to redraw, or a
one-shot command path that has exactly one thing to do — and it propagates
*inward* as a runtime dependency that now sits under the whole program. It can
also cost the interface its object safety, which is the property that let the
adapters be held uniformly in the first place, so the change made to enable one
pattern quietly forecloses another.

The rule that falls out is worth stating plainly: **the substrate is chosen by
the most constrained consumer of the interface, not by the convenience of the
site that needs the concurrency.** Where the constrained consumer is a
synchronous loop and the work is a bounded fan-out of blocking calls — a handful
of members, each with a timeout, once per refresh — scoped threads over blocking
calls deliver the same latency win with none of the propagation: the members run
concurrently, the interface stays synchronous and object-safe, the joins are
where the per-member policy is written, and no runtime enters the dependency
tree. That last point compounds with a dependency policy naming **one** blocking
client for every outbound call in the program; adopting an asynchronous stack
for this one fan-out imports a second client alongside it.

The trade reverses as the numbers do. Unbounded fan-out, thousands of
concurrent waits, or long-lived streams are what threads are bad at, and there
the asynchronous substrate earns its propagation. The mistake is not picking
either one — it is picking without naming which consumer is doing the
constraining.

## Say why each member's policy is what it is

The cost of this shape is that a reader sees several near-identical lines and
one that differs, with nothing explaining the difference. That is the failure
mode to design against, and a one-line comment at the differing join is the whole
fix: *this source is enrichment rather than a load-bearing member — if its scan
dies, report no extra detail rather than taking the analysis down.*

Without it the odd line reads as an oversight and gets "tidied" into consistency
by the next maintainer, which silently promotes an enrichment source into a
dependency the aggregate now fails on.

## Where the uniform collection is still right

Do not read this as a rule against polymorphism. On the **request path**, the
candidates in a strategy tree genuinely are interchangeable at the point of
dispatch — that is what a fallback list means — and the tree's node types
already carry the per-candidate policy that this technique is recovering by hand
([strategy-tree-with-inherited-policy](./strategy-tree-with-inherited-policy.md)).
Uniform there, named here. The two paths have different requirements because
they are answering different questions: *which one of you can serve this
request*, versus *what does each of you have*.

## What this owes the operator

- **Per-member counts, not just a merged set.** "Fourteen models installed" over
  a union of six sources supports no claim about any of them
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)); the
  operator's actual question is which upstream contributed what.
- **A member that failed reported as failed**, distinctly from a member that
  answered and had nothing. An enrichment member that collapses to empty must
  still be counted as having collapsed, or a permanently broken scan looks
  exactly like a machine with nothing to scan.
