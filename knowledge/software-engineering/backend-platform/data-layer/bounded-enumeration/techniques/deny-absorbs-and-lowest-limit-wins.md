---
layer: technique
type: technique
subject: bounded-enumeration
technique: deny-absorbs-and-lowest-limit-wins
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [merging several policies that each state a list capability or a page ceiling, adding a recursive listing to a system that already has a flat one, a caller with two policies receives the larger of two limits, defining what an explicit deny does to a numeric limit]
---

# Deny absorbs, and the lowest limit wins

A caller rarely holds one policy. They hold the policies of their role,
their group, their tenant, the mount they are addressing, and the
combination has to resolve to one answer for one request. For boolean
capabilities the corpus already has the rule: intersection, and an explicit
deny that empties the set. Enumeration adds a numeric capability — the
page ceiling — and the naive merge for numbers is the wrong one in every
direction a designer might pick. This technique states the merge for the
enumeration-shaped capabilities and names the one verb that must never be
folded into another.

## Deny absorbs the whole set

When several policies apply to a path and any one of them states an
explicit deny, the caller's capability set on that path is empty. Not
"empty except for what a more specific policy granted"; empty. The list
capability, the scan capability, the pagination ceiling and every other
property of the path go with it, because a deny is a statement that this
caller must not touch this path, and a ceiling on an operation the caller
may not perform is not a number, it is a contradiction. A merge that keeps
the ceiling after the deny — because the merge was written per field and
the field's merge is "take the smallest" — produces a policy object that
says "denied, limit 50", and the next reader of that object, a dashboard or
a debugging operator or a later code path that checks the limit before the
capability, will act on the number. The rule is structural: deny short-
circuits the merge before any field is combined.

## The ceiling resolves to the minimum

Where no policy denies and several state a pagination ceiling, the
effective ceiling is the smallest one present. This is intersection
expressed in integers: a ceiling is the set of page sizes at or below it,
and the intersection of two such sets is the smaller ceiling. Every other
merge is a widening. Taking the largest ceiling lets the most permissive
policy override the most careful one, so a tenant-wide default of fifty is
defeated by any role that says five hundred. Taking the most specific
policy's ceiling — the one whose path pattern matches most narrowly — is
the rule the corpus uses for *quotas*, and it is right there because a quota
is an allocation, not a permission; a permission narrows, and a narrower
path pattern is not evidence that its author intended to widen. Taking the
last-loaded policy's ceiling makes the answer depend on load order, which
is the failure [one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
describes for a vocabulary maintained in two places: the effective limit
is defined by whichever copy was read last.

A ceiling stated on one policy and absent from another is not a tie. Absent
means "this policy does not speak to the ceiling", and the minimum is taken
over the policies that do; a merge that treats absence as zero produces
"unlimited" or "nothing" depending on what zero means locally, and both are
wrong. Where every applicable policy is silent, the path's ceiling is the
operator's default, which is the number page-size-from-memory-budget
derived.

## The merge is evaluated at the gate, on the request

The ceiling that applies is computed at the moment the request is
authorized, from the policies that apply then, and the same computation
answers the `max` literal (see required-limit-breaks-unaware-clients): the
server substitutes the merged minimum. A ceiling copied into a session at
login and consulted on every later list request is a check against a stale
copy, and it passes precisely after an operator tightened the policy, which
is the moment the ceiling existed for
([gate-sees-target](../../../../_laws.md#gate-sees-target)). The
authorization result that carries the verdict for the path carries the
merged ceiling beside it, as a typed value the handler reads, so that
"denied", "allowed with ceiling N" and "allowed, unbounded" are three
distinguishable outcomes and not one boolean and a side channel.

## Recursion is a verb, not a flag

A flat list returns the direct children of a prefix. A recursive listing
returns every key under it, at every depth, and the cost class is
different in kind: the flat list is bounded by the page; the recursive
listing is bounded by the page *per level* and unbounded in levels unless
it, too, pages across the whole subtree in a single key order. The naive
design adds a flag to the list verb — `recursive`, `deep`, `tree` — and
inherits the list capability for it. That is a widening: every policy that
granted "list this prefix" now grants "enumerate this subtree", a grant its
author never reviewed, and a caller with the flat capability on a shallow
prefix can walk a deep one. The rule: recursion is a separate verb with a
separate capability in the registry, which a policy grants or denies
independently, whose ceiling is merged by the same minimum rule, and which
the operator can leave ungranted on every path where the subtree is large.
The flat verb never accepts a flag that changes its cost class, because a
capability's meaning must not depend on a parameter the policy language
cannot see.

The same rule governs any other flag that removes a bound: "consistent",
"all", "include-hidden". Each is a different operation with a different
cost, and a different operation gets a different word in the vocabulary,
which the scope registry owns and this technique populates.

## Decision rules

When merging policies that state a page ceiling, take the minimum over the
policies that state one, because a ceiling is a permission and permissions
intersect.

When any applicable policy explicitly denies the path, empty the whole
capability set including the ceiling, because a limit on a forbidden
operation is a number someone will eventually act on.

When a policy is silent on the ceiling, exclude it from the minimum rather
than reading its silence as zero, because absent is not a value.

When adding a recursive or otherwise unbounded listing, mint a separate
verb with its own capability, because a flag on the flat verb widens every
grant of the flat verb without review.

When carrying the merged ceiling to the handler, carry it as a typed field
of the authorization result computed on this request, because a copy
cached at login is stale exactly after the operator tightened it.
