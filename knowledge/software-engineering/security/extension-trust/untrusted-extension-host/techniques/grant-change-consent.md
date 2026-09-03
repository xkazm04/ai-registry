---
layer: technique
type: technique
subject: untrusted-extension-host
technique: grant-change-consent
status: forged
laws: [gate-sees-target, absent-guard-is-loud, one-validation-door]
shared_with: []
use_when: [an installed extension ships an update with a changed privilege declaration, deciding whether a grant change needs a human to re-consent, an escalation check exists in the codebase but the update path does not call it]
---

# Grant-change consent

Consent is granted once, at install, against a specific declaration. Then the
extension updates. Something has to decide whether the new declaration is
inside what the administrator agreed to, and that decision is the single most
skipped step in extension hosting — because at update time there is a running
system, an administrator who wants a bug fixed, and a comparison that looks
like a set difference and is not one. This technique owns the comparison, the
gate it drives, and the wiring rule without which both are decoration.

## Escalation polarity is per change kind

The comparison that fails is `new − old`: anything in the new declaration that
was not in the old one is an escalation, and everything else is fine. It is
wrong because **removals are not uniformly narrowing**. Work through the kinds:

- **A category or an operation appears.** Widening. The extension can now do a
  thing it could not do.
- **A category or an operation disappears.** Narrowing. The extension gave
  something up.
- **A constraint appears** where there was none — a host list added to an
  unrestricted network grant, a collection list added to a blanket content
  grant. **Narrowing**, and often dramatically so — *but only for constraint
  keys whose semantics the comparator actually knows.* The constraint object is
  open by design, and the polarity of a key the host does not interpret is not
  computable: a new key could restrict, or could be the extension declaring a
  parameter for a capability the host will honour later. So the rule is
  two-level: a **known** constraint key gets its known polarity; an
  **unrecognized** one is treated as widening and shown to the administrator.
  Defaulting the unknown to narrowing is how a comparator quietly stops
  covering the field that was added last.
- **A constraint disappears.** **Widening**, and this is the dangerous one: by
  the set-difference reading, a declaration that dropped its host list is
  strictly smaller than the one before it, and the update sails through as a
  reduction in privilege while actually granting the whole network.
- **A constraint's contents change** — one host swapped for another, one
  collection for another. Neither purely: the entries removed are narrowing and
  the entries added are widening, and a swap is an escalation with respect to
  every added entry even though the list's size did not move. A comparison
  that hashes the list, or counts it, or compares it as an opaque value, sees
  no change worth stopping for.

So the comparison is **structural and recursive**, walking category, operation
and each constraint field with a polarity rule per kind, and its verdict is a
typed one: *narrowed*, *unchanged*, *widened, here, in these specific ways*.
Reducing that to a boolean loses the part the consent dialog needs, which is
the list of things to show the administrator.

The general rule behind all of this: **a comparison must read the structure
that carries the meaning.** A diff over the flattened token set is a diff over
a proxy, and it passes exactly when the proxy diverges from the target
([gate-sees-target](../../../../_laws.md#gate-sees-target)) — which is precisely
when a constraint changed, because flattening is where constraints go to die.

## The gate the comparison drives

A verdict of *narrowed* or *unchanged* updates the extension without asking
anyone. A verdict of *widened* **stops the update** and requires a human to
consent again, and the three properties of that gate are what make it worth
having:

- **It stops rather than warns.** A warning on an update screen is an
  acknowledged banner; the update proceeds either way, and after the third one
  nobody reads it. The extension stays at its old version until someone
  approves the new grant.
- **It shows the delta, not the declaration.** The administrator already
  consented to the old set. The screen that helps them is the one naming the
  four things that are new, in the same language the install dialog used, and
  nothing else. A re-consent screen that re-renders the whole grant is a screen
  that gets approved without being read.
- **It is the same door as install.** One consent path, one renderer, one
  record ([one-validation-door](../../../../_laws.md#one-validation-door)).
  Install is the case where the old declaration is empty; it is not a separate
  flow with its own copy of the language.

Automatic updates and this gate are compatible and their interaction must be
designed rather than discovered: an extension with automatic updates enabled
updates automatically **while the verdict is narrowed or unchanged**, and holds
at its current version with a pending-consent state the moment a widening
arrives. What it must never do is auto-approve because auto-update was on. The
administrator consented to receiving fixes, not to receiving privileges.

Record what was consented to as the hash of the canonical declaration, and
compare against the recorded value rather than against whatever is currently
installed on disk. The installed copy is a mutable artifact; the consent record
is the fact.

## The instrument must be on the path the operator actually uses

This is the failure that makes the rest of the technique worthless, and it is
common enough to be the default outcome. A codebase grows a correct,
fine-grained escalation comparator — structural, recursive, polarity-aware,
tested. And the update path does not call it. The update path calls a flat set
difference written eighteen months earlier, in a different file, by someone
solving a different problem, and that is what runs when an administrator
presses the button.

The comparator is then *present* and the guard is *absent*
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)), and the
presence is actively harmful: it satisfies the reviewer who greps for one, it
satisfies the security questionnaire, and it makes the next person assume the
problem is solved. The most valuable thing a review of this area can produce is
not a better comparator; it is the call graph from the operator's update button
to whatever comparison actually executes.

Three rules keep the wiring honest:

- **One comparator, reachable from one place.** If two comparisons of grants
  exist in the system, delete one. An unused one is not harmless.
- **The test asserts through the operator's entry point**, not against the
  comparator directly. A unit test of the comparator proves the comparator; the
  test that matters drives an update through the same call the interface makes
  and asserts it was refused.
- **Every field of the declaration is in the comparison, and the test proves
  it.** A declaration with three top-level parts, of which the comparison walks
  two, has a third that can change freely — and the part left out is
  systematically the one added last, which is the one nobody has an intuition
  about yet. Enumerate the declaration's fields from its schema rather than
  by hand, so a new field fails the comparison loudly instead of being
  silently exempt.

The mechanical test for the whole technique: install an extension declaring one
permitted outbound host, publish an update that changes it to a different host,
and drive the update through the interface. If it completes, the guard is
absent regardless of what the codebase contains.

## Decision rules

- Compare declarations structurally and recursively, with a polarity rule per
  change kind; never with a set difference over flattened tokens.
- Treat a disappearing constraint as widening; treat an appearing constraint as
  narrowing only when the comparator knows the key's semantics, and as widening
  otherwise; treat a changed constraint list entry-wise, so a swap escalates.
- Return a typed verdict carrying the specific widenings, not a boolean.
- Stop the update on a widening; show the delta; use the same consent door and
  record as install.
- Let automatic updates run through narrowing and unchanged verdicts, and hold
  at pending-consent on a widening. Never auto-approve.
- Compare against the hash recorded at consent, not against the installed copy.
- Enumerate the declaration's fields from its schema so a new field is included
  by construction; test the gate through the operator's own entry point.

## When not to use it

A host that never updates an installed extension in place — every version is a
new installation with its own consent — has no diff to compute, and should
prefer that model while it can afford it, because it replaces a comparison with
an absence. The technique becomes necessary the moment an update can change a
declaration without a fresh install, which is the moment automatic updates
appear.
