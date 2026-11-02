---
layer: technique
type: technique
subject: verifiable-giveaway-draws
technique: trust-anchor-outside-the-proof
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [writing the signature check in a draw verifier, deciding where the beacon's public key comes from, choosing what a verifier reports when it cannot authenticate the randomness]
---

# The trust anchor lives outside the proof

A draw record carries a beacon value and its signature. The signature is checked against
the beacon network's public key, and that key — with the chain identifier it belongs to —
must reach the verifier by a path that does not pass through the record or through the
server that produced it. If the key travels with the proof, the proof authenticates itself,
and anything authenticates itself.

## Why the obvious check is empty

The obvious verifier reads the record, fetches "chain info" from the same endpoint that
served the round, and checks the signature against the key it got. An impostor endpoint
that generated its own key pair passes that check every time. So does a tampered record
that carries a replacement key. What the verifier has established is internal
consistency: the signature matches a key. What the viewer wanted is authenticity: the
signature matches *the* key.

## Where the anchor comes from

The anchor is fixed before the draw and outside any party's live control:

- **Compiled into the verifier**, as constants: public key bytes and chain identifier.
  The verifier's source is published, so anyone can compare the constants against the
  beacon network's own published values.
- **Printed in the draw rules**, so a viewer with a different verifier can pin the same
  key.
- **Cross-checked at build time** against the network's published chain information, by a
  test that fails if they diverge, so a typo in a constant is a red build and not a draw
  that authenticates nothing. The cheapest form of that test is a handful of real past
  rounds kept as offline fixtures — fetched once, compared byte for byte across several
  independent mirrors of the beacon, dated — which the verifier must authenticate with
  its compiled anchor on every run. A wrong constant fails them; no network is needed.

The chain identifier is itself a digest over the chain's parameters (key, period, genesis,
scheme). Pinning it means a record claiming a different period or genesis time is
detected, not merely a record with a different key.

## What the verifier reports

The verifier has two independent questions and answers each separately:

1. **Does the derivation hold?** Given the frozen list, the beacon value and the
   algorithm version, do the published winners follow?
2. **Is the beacon value authentic?** Does its signature verify against the pinned key
   for the named round, and does the value equal the specified hash of the signature?

A record that passes the first and cannot be checked against the anchor — the round's
signature is missing, the record names an unknown chain, the verifier was built without
the anchor — reports **unverified** for the second, in words, with the reason. It never
reports an overall pass. This is the line where verifiers most often lie: the derivation
is green, the authentication is skipped because it was awkward, and the badge is green
because the only failing check was never run.

Distinguish the verdicts that matter:

- **verified** — derivation holds and the signature verifies against the pinned anchor;
- **derivation mismatch** — the winners do not follow; the record is wrong or tampered;
- **signature invalid** — authentication was attempted and failed;
- **not authenticated** — authentication was not possible; the record is consistent
  with itself and nothing more.

The last two are different and must read differently: "invalid" means somebody lied;
"not authenticated" means nobody has yet shown they did not.

Two more states keep the verdict honest. When an earlier check fails, later checks are
reported as **blocked**, not run and not passed — a verifier that goes on to show "winners
match" under a broken seal invites the reader to weigh a pass against a fail. And when the
verifier cannot run at all, it shows **no verdict**, never the last one it had: a result
from a previous file left on screen while a new one fails to load is a pass the new file
did not earn.

The source label is derived from the anchor too. Only a record whose chain identifier
equals the pinned public chain is described as a public beacon; a well-formed record on any
other chain — a simulated test chain, a private one — is named for what it is, even when
its signature verifies against that chain's own key.

## Decision rules

- When the network rotates its key or a draw uses a new chain, ship a new verifier
  version with the new anchor; never let a verifier learn anchors at run time from data
  it is verifying.
- When the verifier runs in a browser, the anchor ships in the page's own bundled code,
  not in a fetched configuration file.
- When a record names a chain the verifier does not know, say "unknown chain" by name;
  do not fall back to "any key the record offers".

## When not to use it

A verifier used only by the tool's own developers against fixtures it generated may skip
the anchor in a test mode — provided the mode cannot be selected by a record, and its
output says so on every line.
