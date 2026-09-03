---
layer: technique
type: technique
subject: quality-gates
technique: chokepoint-tag-registry
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [proving statically that no call escaped a declared wrapper, a new capability shipped unassignable in a policy table, a registry row whose call site was deleted]
---

# Chokepoint tag registry

Every subsystem worth wrapping — an expensive external capability, an
externally-billed one, an untrusted one — eventually acquires a wrapper and
a sentence in the contributor guide saying all calls go through it. That
sentence is a convention, and conventions decay in one direction: a new call
site appears beside the wrapper rather than through it, and nothing
observes the difference.

The cheap proof is a **static three-way bijection**, checkable in
milliseconds with no credentials and no network:

1. **Every call site of the wrapper carries an inline identifier** — a
   structured comment adjacent to the call, in the source, where the diff
   that adds the call also adds the tag.
2. **Every identifier resolves to a row in a registry** that owns something
   the identifier is *for* — a test fixture, a contract, an entitlement.
3. **Every registry row resolves back to a live call site.**

Each direction catches a drift a reviewer reliably misses. Direction 1
catches the untagged new call site. Direction 2 catches the typo'd
identifier that points at no row, which is the worst of the three because
it looks tagged. Direction 3 catches the row whose call site was deleted —
a fixture that still passes, testing nothing, and quietly padding the
coverage number.

## The bijection is not the whole invariant

The three counts can all reconcile while the property they are supposed to
prove is false, because they only ever look at calls that *went through the
wrapper*. A call made directly against the underlying capability is not an
untagged call site — it is not a call site at all, and the bijection is
blind to it by construction
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

So the bijection is completed by a **negative-space check**: the underlying
vendor client, subprocess spawn, or protocol handle is forbidden to appear
anywhere in the tree *except* the wrapper's own provider modules. Stated as
a rule, that is one line per provider — "this constructor may only be
constructed here", "this module may only be imported there". Stated as an
effect, it is what turns "we route through the wrapper" from a habit into
an invariant, because now there are exactly two ways to spend the
capability and both are gated.

The two halves answer different questions and both are needed: the
bijection asks *is every wrapped call accounted for*, the negative space
asks *is every call wrapped*.

The same construction generalizes to addressing rather than calling — see
[identity-bearing-keys](../../../../security/identity-and-access/authorization/techniques/identity-bearing-keys.md),
where the negative-space check is "the key format appears nowhere but the
composer".

## Extend the bijection to every table that must stay in step

Once the call-site set is enumerable and identified, it becomes the
authority any *other* per-operation table must reconcile against
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
a per-operation policy table, a per-operation entitlement or override
matrix, a per-operation cost row, a per-operation model or tier assignment.
Each gets the same two directions — every identifier has a row, every row
has an identifier — and a whole class of bug disappears: **the new
capability that ships silently unassignable**, working perfectly for
everyone except the customers whose configuration cannot name it.

Two refinements make that extension survivable:

- **A documented exclusions map, not a shortened list.** Some operations
  legitimately have no row (a capability whose provider is fixed, an
  internal call not offered as a product surface). The exclusion is an
  entry with a reason, and it is itself checked in both directions: an
  exclusion for an identifier that no longer exists is stale, and an
  identifier that is *both* excluded and offered is a contradiction. An
  exclusion list without those two checks becomes the place people put
  things they have not done.
- **The reconciliation asserts its instrument.** The second table is often
  read by parsing a source module rather than importing it. A parse that
  yields zero rows must be reported as *could not read the table*, never as
  *the table is empty and therefore consistent* — the empty read is the one
  input that makes every direction of the bijection trivially pass
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
  The same floor belongs on the source walk itself: zero files walked is a
  broken walk.

## Rung placement

The whole point of the construction is that it is static, so it belongs on
the **cheapest rung that can refuse** — the commit hook — and, identically,
on the merge pipeline as the binding rung
([gate-laddering](./gate-laddering.md)). Both invoke the same script; the
remote run confirms what already ran rather than discovering it.

This is also where the expensive sibling gets separated out. A wrapper
around a paid capability invites a second, much richer gate: actually
invoking the capability and checking what comes back. That gate is
valuable, and it is not this one. Keeping a per-call live proving run on
the commit path prices every commit at the cost of the slowest provider,
and the observed end state is that people stop committing small changes.
The static bijection stays on the commit rung; live proving moves to an
on-demand command with a named invocation. Recording *when and why* the
demotion happened, at the top of the gate script, is what keeps the next
contributor from reading the absence as an oversight and re-adding it.

## Two honest limits, which belong in every adoption

**A registry that copies production configuration buys isolation at the
price of a second drift axis.** The natural registry holds each operation's
fixture — a prompt, a request shape, an expected contract — as its own
copy, so the tests run without booting the application and without the
production module's dependencies. That is a real benefit and it creates a
real hazard: the copy and the original are now two authorities over one
vocabulary, and a change to the original is invisible to the registry. The
copy is only defensible when it is *itself* gated — a committed fingerprint
of the production artifact that the check compares against, so a deliberate
change is a diff a reviewer accepts and an accidental one is a red build.
A registry that copies without a fingerprint gate has moved the drift, not
removed it.

**A negative-space check implemented as a source pattern match is defeated
by any indirect form of the same access.** A dynamic import, an alias, a
re-export, a computed module name — each spells the forbidden access in a
way the pattern does not see. This is not a fixable weakness of the
technique; it is the boundary of what a source scan can claim. So the check
is honestly described as a **ratchet against accident, not a control
against intent**, and a design that needs the stronger property has to buy
it somewhere the source is not the authority — a linker boundary, a package
boundary, a capability-restricted runtime.

Both limits share a shape worth naming: the gate's claim must be exactly as
strong as its instrument, and an adoption that inherits the mechanism
without inheriting the two disclaimers will be cited as proof of something
it never checked.

## Decision rules

- Tag at the call site, inline and adjacent, so the tag and the call are
  the same diff.
- Check all three directions; the row-with-no-call-site direction is the
  one teams omit and the one that hides dead fixtures.
- Pair the bijection with a negative-space confinement rule, or the gate
  only measures the calls that already complied.
- Reconcile every other per-operation table against the same identifier set,
  with a reasoned exclusions map checked in both directions.
- Assert the instrument: zero call sites, zero source files, or an
  unreadable table are failures, not clean runs.
- Keep the static bijection on the commit rung and the live proving run
  on-demand; write down when the demotion happened and why.
- State both limits — the copied-fixture drift axis and the pattern-match
  evasion — wherever the gate's result is quoted.
