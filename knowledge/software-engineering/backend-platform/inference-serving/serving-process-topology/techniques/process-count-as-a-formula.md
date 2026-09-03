---
layer: technique
type: technique
subject: serving-process-topology
technique: process-count-as-a-formula
status: forged
laws: [limits-are-derived, count-carries-predicate]
shared_with: []
use_when: [documenting how many processes a deployment will run, an operator asks how much memory and how many cores to provision, adding a knob that multiplies the process count, writing a capacity-planning section]
---

# Process count as a formula

A deployment of a decomposed serving system does not run "a few processes". It
runs a number that is a product and a sum over knobs the operator sets
independently, and that number decides whether the host has enough memory, enough
cores, enough file descriptors, and enough shared-memory segments.

The technique is one sentence and the rest is how to keep it honest: **publish
the arithmetic, not a recommendation.**

## Why a recommendation fails where a formula does not

A table of recommended shapes answers the shapes it lists. Every operator whose
deployment is not on the list — which is most of them, because the knobs are
independent and their product is large — has to reconstruct the arithmetic
themselves, from source, once, privately. They will get it wrong in the direction
that is hardest to see: they will forget a term that is zero in the common case
and non-zero in theirs, and discover it as an out-of-memory event under load
rather than as a provisioning number.

"Tune to taste" is worse, and it is dishonest in a particular way. The system's
authors know the arithmetic — it is in the code that spawns the processes. Not
writing it down does not make the deployment flexible; it transfers a solved
derivation to somebody with less information.

A count that travels — into a runbook, a capacity spreadsheet, a support
answer — carries what it counts and how it was computed
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)), and a
limit is derived from a measured property or from another limit, with the
derivation written beside the number
([limits-are-derived](../../../../_laws.md#limits-are-derived)). A process count
is both at once.

## The procedure

**1. Enumerate the process kinds, not the processes.** Each kind gets a name, a
one-line job, and the knob that determines how many of it exist. Typical kinds in
this topology: front-end or API workers; one loop-owning engine per replica;
per-replica execution workers; and coordinators that exist only under particular
shapes.

**2. Give each kind its term.** A term is `count = <expression over named knobs>`,
where every knob is one the operator actually sets. If a term needs a value the
operator cannot see, that is a finding: either surface the value or the term is
wrong.

**3. State each term's condition.** The terms that break capacity planning are
the conditional ones — the coordinator that appears only above a replica count of
one, the sidecar that exists only when a feature is enabled. Write the condition
in the formula, not in a footnote below it. A term that is usually zero is
exactly the term an operator will omit.

**4. Sum, and label what the sum is.** `total = A + B + C (+1 when D)`. Say in
the same breath whether the total counts the parent that is already running, and
whether it counts short-lived helpers. A total that silently excludes the process
reading the document is a reliable off-by-one in every downstream estimate.

**5. Work at least two examples, end to end, with real numbers.** Not one. One
example is indistinguishable from a special case, and the reader cannot tell
which parts of it were arithmetic and which were the example's own shape. Two
examples that differ in *which knobs are non-default* let a reader check their
understanding of the terms against the totals. Choose the second so that a
conditional term is active in it and inactive in the first.

**6. Convert to what the operator is actually buying.** A process count is an
intermediate value. The question underneath it is memory, cores, and the
per-process limits of the host. Publish at least the per-kind resident cost — a
measured range is fine, an unbacked number is not — so the count multiplies into
something a provisioning decision can use.

## What each term must satisfy

- **Derived, not chosen.** Every term traces to a knob or to another term. A
  constant in the formula with no derivation beside it is the failure this
  technique exists to prevent, in its most convincing disguise: it looks like
  arithmetic and it is a guess.
- **Computed, not merely written.** The formula in the document and the code that
  spawns the processes must not be two hand-maintained copies of one rule. They
  drift the moment someone adds a kind, and they drift silently, because nothing
  compares them. Where it is reachable, have the runtime *report* the count it
  will use before it spawns, so a reader can check the document against the
  system in one command. Failing that, a test that asserts the spawned count
  against the published formula for a handful of configurations keeps the two
  honest.
- **Named in the operator's vocabulary.** Terms named after internal classes are
  unusable. Use the flag or setting name the operator typed.

## Extend the same discipline to the derived limits

Once the count exists, the numbers that hang off it are the next thing an
operator gets wrong, and they deserve the same treatment:

- **Shared-memory and descriptor budgets**, which are per-process and multiply.
- **Per-process pinned or reserved memory**, which usually dominates the host's
  memory and is not visible in ordinary process accounting.
- **Concurrency permits**, where a shared pool divided by a process count is the
  correct derivation and a per-process constant is the common error — the same
  configuration then behaves differently at two deployment widths for reasons
  nobody can locate.

Each one written as `limit = <derivation>`, beside the number.

## When the formula changes

Adding a process kind is a documentation change with the same weight as an API
change, because the totals every operator computed are now wrong and nothing
tells them. Treat it accordingly: the term, its condition, and both worked
examples get updated in the same change that spawns the new kind. A release note
that says "improved parallel execution" and silently adds a per-replica process
is how a fleet discovers its provisioning is wrong at the worst moment.

## When not to use this

- **One process kind, one instance.** A formula for `1` is noise; state the
  number.
- **The runtime elastically decides.** Where process count is genuinely dynamic —
  an autoscaler, a pool that grows under load — the publishable object is the
  *bound* and its inputs, not a static count. The technique still applies to the
  bound.
- **The knobs are not independent.** If two knobs cannot vary freely, publishing
  their product overstates the space and invites configurations that do not work.
  Publish the valid combinations first, then the arithmetic within them.
