---
layer: technique
type: technique
subject: audit-logging
technique: write-path-sanitization
status: forged
laws: [one-validation-door]
shared_with: []
use_when: [deciding what the free-form audit field may hold, a credential surfaced in stored audit records, erasure obligations against an append-only ledger, the ledger records whole requests it did not shape, a small request produces an expensive audit record]
---

# Write-path sanitization

The audit ledger is the worst place in the system for a secret to land,
because everything that makes the ledger good at its job makes it good at
preserving a leak: it is durable by contract, retained on a horizon
measured in months, copied into backups and exports, and read by a wider
audience than the operation it records. A secret in a diagnostic log is an
incident; a secret in the audit ledger is an incident **with a retention
policy**. This technique is the discipline that keeps values out: scrub
at the moment of insert, inside the chokepoint, where no caller can
forget.

## Before insert, never after

The scrub happens on the write path — inside the ledger's one door (see
[write-chokepoint](./write-chokepoint.md)), after the record is assembled
and before it touches storage. The alternative, scrubbing stored rows
after a leak is noticed, fails three ways at once:

- the append-only contract (rightly) resists in-place edits, so the
  scrub either breaks the trail's integrity claim or doesn't run;
- the interval between insert and scrub is an exposure window during
  which backups, replicas, and exports took copies the scrub will never
  reach;
- discovery is the bottleneck — after-the-fact scrubbing only fires for
  leaks someone noticed, and the ones nobody noticed are retained to
  horizon.

Sanitization-at-insert converts "we clean up leaks" into "leaks do not
enter," which is the only version an auditor — or a breach investigator —
credits.

## References, not values

The strongest scrub is structural: the record's schema carries
**identifiers only** — actor identifiers, credential identifiers, subject
identifiers, action names, outcome codes — and has no field where a
secret value *could* go. A contributor cannot leak through a field that
does not exist. Confirmation-by-identity extends to display: the trail
says "authenticated as X using credential Y," never any portion of the
credential itself; every partial echo (prefixes, masked middles) is a
partial leak and trains readers to expect secret material on audit
surfaces.

## When the value must be carried: a keyed hash, and a declared exemption list

References-not-values assumes the ledger knows the shape of what it
records. A ledger that sits at a request seam and records *whatever
passed through it* — every field of every request and response, because
the shape of the traffic is itself the evidence — cannot allowlist keys
it has never seen, and cannot leave values out without losing the one
thing a reader needs: whether the value in this request is the same
value as in that one. The rule for that ledger: **every field value is
replaced by a keyed hash under a salt held per sink, keys are kept in
the clear, and the set of fields recorded raw is a declared list, never
a judgment made per record.** A keyed hash with a per-sink salt keeps
correlation (the same secret hashes to the same token within one sink)
while denying recovery (a rainbow of likely values does not work
without the salt, and a leaked sink's hashes do not match another
sink's). The key stays because the key is the schema, and a trail whose
keys are hashed cannot be filtered at all.

The exemption list is where the discipline holds or fails. Timestamps
are exempt because a hashed time answers no question. Beyond that, a
field is left raw only by being **named in a declared list that a reader
can inspect** — a request or response key the operator has decided is
not secret — because the alternative, a per-record guess about which
values look sensitive, is the denylist failure from the section below
wearing a cleverer coat: it enumerates yesterday's secret shapes and
passes tomorrow's in the clear. Two more rules follow from what a
request seam actually carries. **A list-shaped response is elided to its
count before hashing**: the reader learns that a listing of N entries was
returned, not N hashes of entry names, because hashed names are
correlatable against a guessable key space and a large listing makes the
record's cost proportional to the size of what was listed. And **the record is
normalised to a shape the walker fully understands before the walk**: a
raw response body, or any field typed as bytes rather than as a string,
is the value a string-hashing walker does not recognise and therefore
steps over, which is how a secret passes through a sanitizer that is
hashing every string it can see. Convert such fields to a single opaque
string and hash them whole, or drop them with a marker — either is
honest, because a hash of an entire body attests to nothing a reader
would query by — but never let the walker decide by type what it will
touch. Each of those two rules has an advisory behind it, and each was
found the same way: a reviewer read the ledger and found the secret it
was meant to attest to, sitting in a field the walker had stepped over.

A ledger that hashes gains one property worth building on deliberately:
each sink can expose its own hash function as a read endpoint, so a
reader who *holds* a value can compute its token and find every record
that carried it — correlation on demand, with no value ever stored. The
same endpoint is the tamper-check against the operator: a sink quietly
switched to raw output produces records the endpoint cannot reproduce,
and a consumer comparing the two notices.

The naive reading hashes "the sensitive fields" and leaves the rest in
the clear, and its failure is exactly the leak the ledger existed to
prevent, now durable and exported. The test from the last section
applies with one extension: plant a secret in every field, in nested
positions, in a list, and in a byte-typed field, and assert that the
stored form contains none of them and that the declared exemptions are
the only raw values present.

## The free-form field is the breach

Most real ledgers keep one flexible field — "details," "payload,"
"context" — because domains legitimately differ in what a record must
carry. That field is where every leak arrives, because it is the one
place the schema doesn't constrain. Three controls, applied together
inside the door:

1. **Allowlist, not denylist, where shape is known.** When the payload's
   legitimate keys are knowable, copy exactly those keys and drop
   everything else. A denylist enumerates yesterday's leaks; an allowlist
   enumerates today's needs, and fails closed for the field added next
   quarter.
2. **Pattern scrubbing where shape is open.** Where genuinely arbitrary
   content must pass (an error message, a request summary), run it
   through the secret-pattern scrubber — known credential formats, bearer
   markers, key-shaped strings — accepting that pattern scrubbing is a
   safety net with holes, which is why it is the second control and not
   the first.
3. **Size caps.** A payload cap (and a per-string cap inside it) bounds
   both the blast radius of whatever the first two controls missed and
   the storage economics of the ledger. Oversize input is truncated with
   an explicit marker — a record that says "truncated" is honest; one
   silently cut is a puzzle for the next investigator.

The same three controls govern **personal data**, which shares the
secret's problem shape (retention turns presence into liability) with an
extra twist: erasure obligations can attach to it, and an append-only
ledger cannot erase. The resolution is the same as for secrets — keep it
out at the door; record identifiers that point at the mutable primary
store rather than copying attributes into the immutable one.

## The budget is on shape, and it runs before the parse

A size cap bounds bytes. It does not bound what the ledger pays, because
the cost of sanitizing, hashing and serializing a record scales with the
**number of things in it** — objects, strings, nesting — and a body of
modest byte size can carry a hundred thousand tiny strings. Where the
ledger records a request body it did not shape, the rule is: **bound the
count of objects and strings in the body before decoding it, and refuse
a body over the budget as a malformed request, never as an audit
failure.** Counting is a linear pass over the raw bytes that costs a
fraction of decoding; a budget applied after the parse has already paid
for the parse, and a budget applied only in the ledger has let the
handler pay for it too. The number is a stated property of the seam,
derived from the memory the ledger may spend per record, not chosen for
comfort — and it sits above any legitimate request the product makes, so
that a real client never meets it and only a hostile one does.

The naive reading is that a byte cap is enough, and its failure is the
body that is cheap to send and expensive to audit: a hostile client
finds the one endpoint where a small request becomes a large record and
holds the ledger — and, on a fail-closed ledger, the whole service —
under it. A second, quieter failure lives next door. The body is read
more than once on its way through a seam: once to count, once to audit,
once to handle, and a stream consumed by the first reader is empty for
the second. So the body is **made seekable once, at entry, and reset at
every boundary that re-reads it**; a boundary that forgets the reset
records an empty request and serves a real one, which is a hole the
counter never sees because no write failed.

## Scrub failures fail closed, and are visible

When the sanitizer itself errors — a payload that won't parse, a scrubber
exception — the door does not shrug the record through unscrubbed. It
writes the record with the payload replaced by a sanitization-failure
marker, and counts the event on the same surface that counts failed
writes (see
[best-effort-with-accounting](./best-effort-with-accounting.md)). Losing
one record's detail is a cost; archiving an unknown payload because the
scrubber crashed is the exact failure the technique exists to prevent.

## Test the door with hostile records

Sanitization is one of the few audit properties that unit-tests
completely, because the door is one function
([one-validation-door](../../../../_laws.md#one-validation-door) pays off in
the test suite too): feed records carrying planted secrets in every field
and nested position, assert the stored form contains none of them.
This suite is cheap, it pins the allowlist and the patterns against
regression, and its existence is itself evidence — "here is the test
that proves secrets don't enter" is an answer auditors accept.
