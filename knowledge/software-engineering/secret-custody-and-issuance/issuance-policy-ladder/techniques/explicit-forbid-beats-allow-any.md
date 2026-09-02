---
layer: technique
type: technique
subject: issuance-policy-ladder
technique: explicit-forbid-beats-allow-any
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [a role carries both an allow-any flag and a forbid list, deciding what an empty allowlist admits, a required extension is missing from the request, composing name matching rules]
---

# Explicit forbid beats allow-any

A role that has grown for a few years carries statements of several
polarities: lists of what is allowed, lists of what is forbidden, flags that
say "any", and fields that say "required". The requester's artifact is the
composition of all of them, and the composition order is the policy. This
technique fixes the order.

## The rule

**When a role carries an explicit forbid - a name pattern, a usage, an
extension, a claim value - and also an allow-any flag or a permissive
wildcard on the same axis, the forbid wins, because the operator who wrote a
specific exclusion beside a general permission meant the exclusion, and a
composition that lets the general flag override it has silently deleted the
one statement that was written on purpose.** The evaluation order is
therefore: required parts first (fail fast if the request lacks one that
cannot be supplied), then forbids (refuse on match), then allows (refuse on
no match), then defaults. Allow-any is an allow that matches everything; it
sits in the third step and cannot reach back into the second.

The naive reading evaluates in the order the fields appear in the schema, or
short-circuits on the first permissive flag it meets, on the reasoning that
"allow any" is the widest statement and so the last word. The failure mode is
a forbid that stops working the day someone adds the flag - and adding the
flag is the routine way to unblock a requester, so the forbid stops working
on an ordinary afternoon with no review.

## A forbid is a third state, not a false

The precedence rule presumes the schema can tell "the operator forbade this"
from "the operator never said". A boolean field whose zero value is false
cannot: every role that predates the field, and every role whose author did
not think about it, reads as an explicit forbid, and the precedence rule
then overrides allow-any on roles that never chose. So a forbid that is meant
to beat allow-any is stored as a **tri-state** - unset, permitted, forbidden -
and only the third state carries precedence. The unset state resolves to the
field's documented default at evaluation, which is where a schema migration
lives: a role written before the field existed is upgraded to the value the
old behaviour implied, once, and stored, rather than being reinterpreted on
every read. The naive boolean makes the safe direction (forbid) the silent
default, which sounds right and is not: the operator who added allow-any to
unblock a requester is now overridden by a forbid nobody wrote, cannot see
why, and removes the forbid mechanism to make the role work.

## Empty means all only where it says so

An allowlist that is empty admits nothing - that is the rule from the
previous technique - and there are exactly two exceptions, both of which must
be spelled out in the schema beside the field. The first is an axis where the
artifact *must* carry a value and the role has no opinion: a role that binds
principals but does not restrict key usages may declare, adjacent to the
usages field, that an empty list defers to the issuer's default set. The
second is an axis whose values are validated by a stronger mechanism
downstream: a role may leave the audience list empty when the login layer
proves audience by a signature the role cannot forge. In both cases the
schema says "empty means all" in the field's own definition and nowhere
else, so a reader of any role record knows which empties are wide without
consulting the code ([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary):
the meaning of empty is defined once, at the field, not re-derived by each
handler that reads it).

Where the schema is silent, empty is nothing. A handler that "helpfully"
treats an empty forbid list as no forbids is correct; a handler that treats an
empty allow list as no restriction has invented the exception. And two
adjacent fields of the same shape must not take opposite empties: a role
whose allowed-options list reads empty as "any" beside an allowed-extensions
list that reads empty as "none" is documented correctly at both fields and
still misread by every operator who learned one and assumed the other. When
history has left such a pair, the fix is a wildcard entry for "any" on both
so the empty case can be retired, not a longer description.

## Required parts fail fast

A role may require parts of the artifact that the request cannot supply: an
extension the requester's tooling does not know how to emit, a claim the
identity provider does not issue, a key type the requester's key is not. The
rule is that a required part missing from the request fails before any
allow or forbid is evaluated, with an error naming the part - not after a
successful name match, and never by silently issuing without the part. The
failure names the requirement because the requester's fix is on the
requester's side and the error is the only channel that reaches them; a
generic refusal after twenty milliseconds of matching sends them to the wrong
half of the system.

Two subtleties. A required part that the *role* supplies (a fixed audience,
an added extension) is a shaping directive, not a requirement on the
request, and it is applied in the defaults step; the fail-fast rule is only
for parts the request must bring. And a required part whose value the role
also constrains - "the request must carry claim C and it must equal V" -
fails fast on absence and refuses in the forbid or allow step on mismatch,
which are two different errors a requester can act on differently.

## Name matching is a composition too

The allowlist for names is where most of the polarity lives, because names
are matched by rule and not by equality: bare domain, subdomains, wildcards,
globs, and each is a separate permission. The composition rule is the same:
each matching mode is a flag that widens what an entry admits, and a forbid
pattern is checked against the *requested* name before any widening is
applied. A wildcard name in the request is a special case of a name and is
governed by its own flag, because a role that allows subdomains of a zone has
not thereby allowed a wildcard for that zone; the two admit different
artifacts with different blast radii.

The check evaluates against the role as stored at issue time, not against a
copy captured when the request was parsed
([gate-sees-target](../../../_laws.md#gate-sees-target)). Roles narrow; a
check that read the role once and cached it passes exactly when the role has
been tightened.

## When not to apply it

Do not apply the polarity order to a program role. A program returns a
finished artifact or a refusal, and the composition of its own allow and
forbid logic is the author's; the issuer applies protocol checks to what
comes back and does not re-run the static composition over it.
