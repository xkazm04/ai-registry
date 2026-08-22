---
layer: technique
type: technique
subject: production-prompt-architecture
technique: domain-scoped-knowledge-injection
status: forged
laws: [unmeasured-is-not-a-pass, a-budget-shapes-the-output]
shared_with: []
use_when: [a prompt carries constraints that cannot apply to its task, deciding which pitfalls and canon a task prompt should receive, a scoping change made prompts shorter and you need to know if it helped]
---

# Domain-scoped knowledge injection

The prompt's constraints section is filled by routing a corpus of accumulated knowledge —
pitfalls, conventions, canon — to the task by declared scope. The corpus itself and how it
is grown are a separate concern; this technique is the routing, and the routing is where the
mistakes are.

## Three tiers, and the middle one is usually missing

1. **Universal items** carry no scope tag and are injected into every prompt regardless of
   routing. This tier is what makes scoping safe to attempt at all: the items that apply
   everywhere are structurally exempt from being routed away, so a routing bug degrades
   relevance rather than dropping the rules that always hold.
2. **Scoped items** carry domain tags and are injected when their tags intersect the task's
   declared domains.
3. **The fallback** applies when the task's scope is unknown: inject the **superset** for the
   task kind, never the empty set. Absent classification is not evidence of irrelevance —
   [`unmeasured is not a pass`](../../../_laws.md#unmeasured-is-not-a-pass) at authoring time.

The distinction between an **explicitly empty scope** and an **absent one** is load-bearing
and easy to collapse. A task mapped to no domains has been classified — someone decided it
needs only the universal tier. A task with no mapping has not been classified. The first
gets universals; the second gets everything. Represent them differently or the fallback
stops working.

## The double-sided test

A scoping change must make the prompt **shorter and more relevant**. Both halves are
measurements and both must be taken:

- *Shorter* is trivially observable: item count and length before and after.
- *More relevant* is the one that gets skipped. Take it as the share of injected items that
  could plausibly bear on the task, judged against a sample of real tasks — or, better, as
  the movement in output quality on a held set.

A change that only shortens is a regression dressed as an optimisation: it removed budget
spent on irrelevance and possibly also the one item that mattered, and nobody can tell which.
[`A budget shapes the output`](../../../_laws.md#a-budget-shapes-the-output) cuts both ways
here — a long diluted constraints list degrades the result, and so does a short one missing
the constraint that applied.

## Route as one bundle, not as separate parameters

The routing inputs — task kind, domain scope, known-asset scope, and anything else that
selects knowledge — are derived together in one place and passed as a single object. When
they are independent optional parameters, a new call site supplies two of three and silently
takes the fallback for the rest, forever. Deriving them together makes forgetting one
structurally impossible rather than merely discouraged.

## Measure the fallback rate

The conservative fallback is correct, and it *hides* that routing never happened. A whole
family of prompt builders can sit on the superset for a year: safe, diluted, nothing failing,
no signal. Count assembled prompts by tier taken. A non-trivial fallback rate on work that
should be classified is a routing gap, not a safety margin. This is the only way the gap ever
gets found, because the failure mode is quiet by construction.

## Decision rules

- **When a new task kind appears, classify it before shipping it.** The fallback exists for
  the unclassified case, not as the intended path.
- **When an item's relevance is arguable, tag it broadly rather than narrowly.** The cost of
  an extra item is budget; the cost of a missing one is a defect that ships.
- **When an item applies everywhere, leave it untagged** rather than tagging it with every
  domain. An enumeration of all domains goes stale when a domain is added; untagged does not.
- **When routing tables must be shared by two drive paths, they live in one table** that both
  read, edited in neither consumer.

## When not to use this

- **Small corpora.** Under roughly a few dozen items, the whole corpus fits the budget and
  routing adds a failure mode with nothing to gain.
- **When scope cannot be declared honestly.** Routing on a guessed classification is worse
  than the superset, because it produces a confidently wrong subset. Take the fallback and
  fix the classification.
- **For anything the producer must not miss.** Safety-critical or irreversible-action rules
  belong in the universal tier or in the task itself, never behind a routing decision.
