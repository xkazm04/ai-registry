---
layer: technique
type: technique
subject: issuance-policy-ladder
technique: bounds-as-modes
status: forged
laws: [one-authority-per-vocabulary, verdict-survives-boundary]
shared_with: []
use_when: [a request asks for a validity longer than the role allows, deciding whether to truncate or refuse at the issuing key's own expiry, three handlers each compute a lifetime cap, a bound must be a fixed timestamp rather than a duration]
---

# Bounds as modes

A bound on an issued artifact - its lifetime above all, but also its key
size, its renewal ceiling, the count of uses a login may make - is decided by
several parties who never meet: the requester, the role, the mount or tenant
the role lives in, the system, and the issuing key with an expiry of its own.
The naive design gives each party a number and takes the minimum. This
technique replaces the number with a mode and the minimum with a ladder
stated once.

## Four modes, not one number

**When a role states a bound, it states one of four modes - permit the
request's value, limit the request to a ceiling, forbid the request from
setting the bound at all and use the role's value, or pin the bound to an
absolute timestamp - because these are four different contracts with the
requester, and a single number expresses only the second.** Permit is the
mode for a bound the issuer does not care about and the requester knows best.
Limited is the common case: the request may ask, the role caps. Forbid is
the mode for a bound that the requester must not influence - a login whose
session length is a compliance decision, a certificate class whose lifetime
is fixed by a profile - and a request that carries a value under forbid is
refused, not silently capped, because a requester that sends a value is
expecting it to matter and a silent cap teaches it nothing. Timestamp is the
mode for a bound that is a *date* and not a *duration*: everything issued
under this role expires at the end of the quarter, or at the decommissioning
of the issuer, regardless of when it was requested. A duration cannot express
that, and operators who need it and lack the mode build it by editing the
role's duration every morning.

The naive reading with a single number collapses forbid into limited (the
request's value is capped, and the requester never learns it was ignored) and
cannot express timestamp at all.

## The ladder is stated once

**When more than one party bounds the same quantity, write the composition
in one place - request, then role, then mount or tenant, then system, then
the issuing key's own limit - and route every issuing path through that one
function, because a ladder that lives in three handlers is three ladders,
and the one that was patched last quarter is the one the next incident finds
unpatched** ([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
The composition is: the request proposes a value or is silent; the role
applies its mode (permit passes the value, limited caps it, forbid replaces
it, timestamp overrides it); the mount and system caps apply as limits; then
the issuing key's own limit applies. A silent request takes the role's
default, which is the role's value under forbid and the role's stated
default under limited; there is no path on which a silent request receives
the system maximum.

## Limited mode and the explicit ask

Under limited mode a request may exceed the ceiling in two ways that the
naive minimum treats alike: the requester asked for a value above it, or the
requester asked for nothing and the role's or system's default landed above
it. **When the value came from a default, clamp it silently, because no
party chose it; when the requester chose it, refuse and name the ceiling, or
at the least clamp with a warning that names the ceiling in the response,
because a requester that asked for a year and silently received a week has
been told nothing and will discover the gap as an outage.** Refusal is the
standard; clamp-with-warning is the tolerable variant for requesters that
cannot act on a refusal; silent clamping of an explicit ask is the failure.
The distinction requires the handler to know whether the field was *present*
in the request, which is a property the parsing layer must preserve - a
schema that folds "absent" into "zero" has lost it before the ladder runs.

## The issuer's own limit: permit, truncate or error, declared

The last rung is different in kind. The issuing key expires on a date, and
an artifact that outlives its issuer is a real object in the world whose
verifiers will treat it inconsistently: some chains fail at the issuer's
expiry, some do not, and the certificate profile standard (RFC 5280) requires
only that the issuer maintain revocation status through the artifact's
expiry, not that the artifact end first. So there are three defensible
behaviours at this rung and one indefensible one. **Truncate** clamps the
artifact to the issuer's expiry and issues, which is right when the
artifact's holder will renew on schedule anyway and a shorter lifetime costs
one early renewal - and it must still refuse when the issuer's expiry is
already past, because a clamp to the past is an artifact born dead. **Error**
refuses and names the issuer's expiry, which is right when a truncated
lifetime would be a surprise the holder cannot act on - an automated fleet
that provisions once and never renews. **Permit** issues past the issuer's
expiry deliberately, which is right only when the issuer is being renewed in
place under the same key and the chain will be re-issued before the old
issuer certificate lapses, and it is a declared choice on the issuer, never
the absence of one. The indefensible behaviour is any of the three
undeclared: to issue past the issuer's expiry because nobody checked, or to
truncate without saying so.

**Declare the choice per issuer, once, and surface it in the response.** A
truncated artifact returns with a warning naming the rung that truncated it;
a refused request returns with the rung that refused. The verdict travels
with the artifact ([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)):
a requester that receives a shorter lifetime and no reason will file it as a
bug in the role, and a requester that receives a refusal saying "issuer
expires on date D" will rotate the issuer.

## Bounds that are not lifetimes

The same four modes apply to every other bound with a parties-who-never-meet
shape. Key size: permit lets the request's key through, limited enforces a
floor, forbid means the issuer generates the key, and timestamp does not
apply. Use count on a login: permit, limited, forbid all apply. The value of
naming the modes is that a reader of any bound field knows the four possible
contracts without reading the handler, and a new bound added next year gets
the same vocabulary instead of inventing a fifth.

## When not to apply it

A bound with exactly one party - a system constant with no request field and
no role field - is a number, and dressing it as a mode adds a vocabulary
nobody consumes. The technique pays for itself at the second party.
