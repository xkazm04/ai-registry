---
layer: technique
type: technique
subject: authorization
technique: machine-credential-consumption
status: forged
laws: [gate-sees-target, creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [designing how a server stores a machine's login secret, a use-limited credential must delete itself on its last use, a renewal must notice that the role behind it changed, a login endpoint must not leak which half of the credential was wrong, a child credential carries narrower network bounds than its role]
---

# Machine-credential consumption

A machine logs in with a credential it was handed once and presents many
times: a role identifier that names *which* policy set it is asking for, and
a secret that proves it was issued that identifier. Everything about how the
issuer treats that pair after issuance — how the secret is stored, how a
presentation is validated, how a use is counted, how a renewal is judged,
and what the caller learns when any of it fails — is this technique. It is
the server's side of a machine credential; how a client obtains one and
keeps it in custody is the credential vault's
[acquisition](../../credential-vault/techniques/acquisition.md), and the
rule for picking is which party holds the plaintext: the consumer holds it
and is governed there; the issuer never holds it after minting and is
governed here.

The naive reading treats a machine credential as a password with no human
attached — store a hash, compare, done. Every clause below is a place that
reading fails, and each failure is quiet: the store that leaks its own
index, the use counter that lets the last use succeed twice, the renewal
that outlives the role it was minted from, the error message that names the
half that was right.

## The secret is stored as a keyed hash and addressed by an accessor

The issuer never stores a secret in plaintext, and never stores a
*searchable* form of it either. A plain hash of the secret is a lookup
index anyone with a storage dump can attack offline against the whole
secret space; the stored form is therefore a **keyed hash** (an HMAC under
a per-role key) of the secret, and the storage address of the credential
record is that keyed hash — so the store holds nothing that can be verified
without the key, and the key lives in a different record than the entries it
indexes. Bound the input length before hashing, because a keyed hash over an
attacker-chosen multi-megabyte value is a denial-of-service primitive
inside the login path.

Because the keyed hash is the only address, the record needs a **second
name that can be spoken aloud**: an accessor, a random identifier minted at
issuance and stored beside the record, with a reverse index from accessor
to keyed hash. The accessor is what listing, lookup, and destruction take as
their argument, and it is never accepted at login — it names the credential
without being it. Everything an operator does to a credential after
issuance goes through the accessor; the secret itself is spoken exactly
once, by the machine that presents it. The rule: **when an operation must
name a credential without proving possession of it, take the accessor;
when it must prove possession, take the secret; never let one satisfy the
other.**

The reverse index is written **before** the credential record. A record
without an accessor is unreachable to every administrative path — it cannot
be listed, looked up, or destroyed except by guessing the secret — and a
credential no reaper can name is a credential that lives forever
([creation-names-reaper](../../../_laws.md#creation-names-reaper)). So the
ordering is a rule, and the login path enforces its contrapositive: a
presented secret whose record exists but whose accessor entry does not is
an **orphan**, and the login that discovers it deletes the record and
refuses, rather than honouring a credential nothing else can revoke.

## A use is counted under a write lock, and the last use both deletes and succeeds

A use-limited credential is a counter in storage, and the counter is
decremented on a path that is read-mostly: most logins only need to read
the record, check constraints, and mint. So the record is read under a
shared lock, and only the counted branch upgrades to an exclusive one. The
upgrade is not atomic — another login holding the same shared lock may have
already taken the write lock, decremented, and released — so the rule is
**re-read after the upgrade, and decide on the re-read**. A decision made
on the pre-upgrade copy is a decision on stale data, and the failure is
that two concurrent presentations of a single-use secret both see `1` and
both succeed.

The last use has a shape that the obvious implementation gets wrong. When
the re-read shows one use remaining, the credential is **deleted** (accessor
first, then record) **and the login succeeds**. Deleting before minting is
what makes the next presentation fail; succeeding is what makes the
credential usable at all — a single-use credential that fails on its only
use is a credential with zero uses. The naive reading either decrements to
zero and leaves the record (where zero means *unlimited* in any scheme that
uses zero as "no limit set", so the exhausted credential becomes
inexhaustible) or refuses the last use because "the count would hit zero".
State the two meanings of zero explicitly in the record's schema — *no
limit* and *exhausted* must not share a value — or delete on the last use so
the exhausted state never needs a value at all.

## A child credential's constraints are a subset of its role's, at issuance and at login

A role carries network constraints (source-address bounds for presenting
the secret; separate bounds for the token minted from it), and a credential
issued under the role may carry its own, narrower ones. **Narrower** is the
whole rule: a credential's bounds must be a subset of the role's, checked at
issuance so an operator cannot mint a credential that escapes its role, and
**checked again at login**, because the role's bounds can tighten after the
credential was issued and a subset relation proved last month is a claim
about last month ([gate-sees-target](../../../_laws.md#gate-sees-target):
the gate reads the role as it is, not the role as the credential remembers
it). The same subset rule governs any other bound a child may narrow — a
use count no higher than the role's, a lifetime no longer than the role's —
and the honest response to a request that exceeds the role is a refusal, not
a silent clamp, because a clamp teaches the requester that the wider value
was accepted.

Two orderings inside the login path matter. Source-address enforcement
reads the connection's remote address, and a request with **no connection
information** is an internal error, not a merits denial — a bound that
cannot be evaluated is a bound that refuses, and it refuses with a
distinguishable error so an operator can tell "your address is out of
range" from "the server could not see your address"
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
And the credential's own bounds and the role's bounds are both enforced,
each against the live address; the subset check makes the role's check
redundant only while the subset relation holds, and the point of re-checking
is that it may not.

## Renewal re-validates the issuer's side, not the presenter's

A renewal presents a token, not the original secret, so the issuer cannot
re-run login. What it can do — and must — is re-check everything on its own
side that the original decision depended on: **the role still exists**, and
**the policies the token carries are still the policies the role would
grant today**. A role deleted after login must not keep its tokens alive
through renewal; a role whose policy set changed must not renew a token
carrying the old set, because renewal would silently extend authority the
operator has already withdrawn. The refusal is the operator's signal that a
fresh login is required, which is the only path through which the new
policy set can be evaluated. Every renewal also re-reads the role's lifetime
settings and applies them, so tightening a role's token lifetime takes
effect at the next renewal rather than at the next login.

Where the login was a certificate presented over the transport, renewal has
a stronger check available and takes it: the token records the original
certificate's bytes, and renewal compares the certificate on the renewing
connection to them **in constant time**, byte for byte. A renewed
certificate — same subject, new serial — does not match and is refused. The
naive reading re-verifies the chain and trust constraints and calls it
done; that re-admits any certificate the trust store would accept, which
is exactly the population the original login was supposed to have narrowed
to one member.

## Every failure is one error, in one time

The login endpoint is an oracle if it distinguishes its failures, and the
distinguishable dimensions are the response and the time. One uniform
message covers an unknown role identifier, an unknown secret, a secret whose
record is orphaned, a wrong password, a certificate that matches no
configured entry: the message names neither half. The audit trail records
which — an operator needs to know that a machine is presenting a deleted
role — but the response does not.

Time is the harder half. A lookup that returns early when the identity is
absent is measurably faster than one that proceeds to a deliberately slow
hash comparison, and that difference enumerates identities across the
network. So **when the identity is absent, compute the comparison anyway
against a fake hash** of the same cost and shape, and only then return the
uniform error. The fake hash is generated once at startup with the
production cost parameters, so the timing envelope of "no such user" and
"wrong password" coincide. The rule generalizes: any branch that would skip
the expensive step on an absent identity is a timing signal, and the fix is
to take the expensive step regardless. For keyed-hash lookups the hash is
cheap and the lookup is the cost, so the equivalent discipline is that the
role's key is fetched and the hash computed before the record's existence is
known, not after.

One subtlety is worth its own sentence: **the error the caller sees and the
error the server counts are different values.** A lockout counter must
increment only for failures against an identity that exists — counting
failures against unknown identities is a storage-growth attack and a way
to lock out nobody — so the handler returns the uniform response to the
caller and a typed *invalid-credentials* signal to the core only when the
identity was real. The typed signal is what the lockout counts; the response
is what the caller reads; the two must never be derived from each other.

## Decision rules

- Store the keyed hash of the secret as the address, the accessor as the
  spoken name; login takes only the secret, administration takes only the
  accessor.
- Write the accessor index before the credential record; on login, an
  orphaned record is deleted and refused.
- Count a use under the write lock, on a re-read taken after the upgrade;
  on the last use, delete the credential and let the login succeed.
- A child's bounds are a subset of the role's — refused, not clamped, when
  they are not — proved at issuance and re-proved at login.
- A bound that cannot be evaluated refuses with an error distinguishable
  from a merits denial.
- Renewal re-reads the role: it must exist, its policies must match the
  token's, and a certificate login must present the original bytes.
- One message for every failure; the expensive comparison runs whether or
  not the identity exists; the lockout counter reads a typed signal that
  is not the caller-visible response.
