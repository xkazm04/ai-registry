---
layer: technique
type: technique
subject: deterministic-prefix-caching
technique: capability-marker-boundary-scan
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [deciding which stages of a transform chain a cache may memoise, a stage must opt out of caching without owning a random generator, a cache that froze augmentation for one user's pipeline]
---

# Capability-marker boundary scan

The cacheable prefix of a transform chain ends at the first stage that might produce a
different output for the same input. The technique is to find that stage by walking the
chain in order and asking each stage whether it carries a **randomizable marker** — a
capability the stage declares about itself, checked by type membership, that means
"my output is not a pure function of my input". The first stage that carries it is the
seam; everything before it is the head and everything from it onward is the tail. The
scan returns an index, the cache stores the head's output, and every later pass applies
the chain starting at that index.

## Why a marker, and not a name, an index, or a flag

Three alternatives present themselves first and each fails in the same direction —
towards a cache that is right for most pipelines and silently wrong for one.

A **name convention** ("stages whose class name begins with a random prefix") is a
gate that observes a proxy. It passes exactly when an author names a random stage
something else — a stage that jitters intensities and is called a normaliser, a
wrapper that composes a random crop under a task-specific name — and the failure it
produces is a frozen augmentation reported as overfitting.

A **configured index** ("cache the first six") is right on the day it is written and
wrong the day a stage is inserted before it. The dataset has no way to notice; the
configuration is a number and numbers do not know what they count.

A **dataset-level flag** ("cache everything up to here" set by the caller) moves the
decision to the person least equipped to make it — the author of a training script
who did not write the transforms and does not know which of them draw from a random
source. The chain knows; the flag asks someone else.

A marker on the stage puts the declaration where the knowledge is. The author of a
random crop knows it is random and says so once, in the class; every dataset that ever
scans a chain containing it gets the right answer without a convention, a number or a
flag. The vocabulary of markers is one authority — the pipeline library's trait
definitions — and every consumer derives from it; a second hand-maintained list of
"stages known to be random" is the drift the law names.

## The marker is a capability, not an inheritance

The load-bearing subtlety is that the marker is checked as a trait the stage carries,
not as descent from the base class that holds a random generator. The two coincide for
most stages and diverge for the ones that matter:

- A stage that is nondeterministic for a reason other than a generator — it reads a
  clock, it consults an external table that changes, it calls into a service — has no
  generator to inherit and still must end the prefix. It declares the marker directly.
- A stage that must not be memoised for a reason unrelated to determinism — its output
  is too large to hold, or it is a diagnostic hook whose side effect is the point —
  declares the marker as an opt-out, and the scan honours it without needing to know
  why.
- A stage that inherits a generator but does not use it on this configuration is still
  random for the scan's purposes. The scan does not inspect state; it reads the
  declaration. An author who wants such a stage cached splits it into a deterministic
  class and a random one.

The rule is therefore **declared, not inferred**: the scan never inspects a stage's
fields for a generator, never reads a probability parameter to decide that a stage with
probability zero is deterministic, and never special-cases a stage by name. Each of
those inferences is a second authority on the vocabulary, and each is wrong the first
time a stage's internals change.

## Procedure

1. Walk the chain from the front. For each stage, test membership in the randomizable
   trait and test whether the stage implements the pipeline's transform interface at
   all (the second test is
   [unknown-callable-is-nondeterministic](./unknown-callable-is-nondeterministic.md)).
2. The first stage that fails either test is the seam. Record its index. If no stage
   fails, the whole chain is the head and the tail is empty — valid, and worth a notice,
   since it usually means an augmentation the author expected to be live is not in the
   chain.
3. Cache the result of applying stages `[0, seam)` to each record.
4. On each pass, copy the cached value if the tail may mutate in place, then apply
   stages `[seam, end)`.
5. Compute the seam once per chain, at dataset construction, not per record — the chain
   is fixed and the scan is a pure function of it. A chain that is replaced after
   construction recomputes the seam and invalidates the cache.

A composite stage — a nested chain inside the chain — is scanned by flattening: the
composite carries the marker if any of its members does, and the seam within it is
found by the same walk. A composite that hides a random member behind a deterministic
outer class is the name-convention failure in a different costume, and the flattening
is what defends against it.

## Decision rules

When the chain contains a stage the author believes is deterministic but that carries
the marker, keep the marker and split the stage; do not add an exception list to the
scan. When a stage is random only under some configuration, mark it random under all;
the cost is a shorter prefix on the deterministic configuration, and the alternative is
a scan that reads state. When the seam lands earlier than the author expected, the fix
is to reorder the chain — deterministic stages first — and the dataset's documentation
says so with an example, because the mechanism cannot reorder on the author's behalf
without changing what the chain computes.

## When not to use it

A chain whose stages are all deterministic gains nothing from the scan and everything
from a plain memoising dataset; the scan is still harmless and still finds no seam. A
chain whose first stage is random has an empty head, and a mechanism that caches an
empty head spends its fill time doing nothing — detect that at construction and say
so. And a pipeline that is not a linear chain — a graph with branches that rejoin — has
no single seam; the scan generalises to a cut through the graph, but the mechanism here
assumes a list, and a graph should not be flattened into one to fit it.
