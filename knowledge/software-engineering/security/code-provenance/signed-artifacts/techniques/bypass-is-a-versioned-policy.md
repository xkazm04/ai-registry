---
layer: technique
type: technique
subject: signed-artifacts
technique: bypass-is-a-versioned-policy
status: forged
laws: [absent-guard-is-loud, one-validation-door, unknown-is-not-a-value]
shared_with: []
use_when: [an unsigned build must be installable for testing, a debug flag has become the verification path, deciding what makes a prerelease exempt from the signature check]
---

# The bypass is a versioned policy, not a flag

Every project that signs its artifacts eventually needs to install one that is
not signed. Developers build locally and the signing key is not on their machine.
The release rehearsal installs a candidate that has not been signed yet, because
signing is a ceremony that happens later. A support engineer needs a one-off
build on a customer's unit. The need is real and refusing it does not make it go
away — it makes somebody add an escape hatch, and the escape hatch is where the
verification story dies.

The failure is not that a bypass exists. It is that the bypass arrives as an
*ad-hoc mechanism*: an environment variable read at the call site, a debug build
flag, a config key nobody enumerated, a branch in the verifier that returns early
when the signature file is absent. Each is invisible to review, none is tested,
and together they are a second validation door
([one-validation-door](../../../../_laws.md#one-validation-door)) that grew
without anyone deciding to build it.

> **Make the exemption a first-class production policy: one pure predicate, over
> declared inputs, with a fail-closed default and its own test table.**

## One predicate, over the inputs that justify the exemption

The bypass decision is a small total function, defined once, and the inputs are
exactly the facts that make an exemption legitimate:

- **the artifact's version**, parsed — because a prerelease and a stable release
  do not deserve the same treatment;
- **whether the install was explicitly requested as a custom build** — an operator
  naming a specific artifact is a different act from a device polling a feed;
- **whether the installing party opted into the exempt channel** — running the
  prerelease channel is a standing consent that a stable-channel device has not
  given.

Everything else — a debug build, an environment variable, the absence of a
signature file — is not an input. In particular, *the signature being missing is
never a reason to skip the check*: that is the exact shape of the
self-authorising artifact, where the thing being verified decides whether it gets
verified.

The predicate is production code in the shipping binary, not a test helper. It
has to be, because the release rehearsal exercises the real installer, and a
rehearsal that runs a different verification path than production has proved
nothing about production ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## The default is deny, including for inputs it does not understand

Two branches carry most of the risk and both must be written deliberately:

- **A version that does not parse does not bypass.** An unparseable version is
  the unknown lane
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)), and
  the unknown lane resolves to *verify*, not to *skip*. The tempting shortcut —
  treat a malformed version as a dev build, since dev builds have odd versions —
  hands the bypass to anyone who can supply a malformed string.
- **A prerelease without opt-in does not bypass.** Being a prerelease is a
  property of the artifact; being willing to run prereleases is a property of the
  installation. Only the conjunction exempts. Collapsing to the artifact's
  property alone means anyone who can name a `-dev` version to a stable device
  has defeated signing.

## The mandatory component has no bypass at all

Not every payload is equally exemptible. Where an update spans components with
different blast radii — an application layer and the system image beneath it, a
plugin and the runtime that loads it — the component whose compromise is
unrecoverable is exempt from the exemption: it requires a signature
unconditionally, and its absence is an error raised **before** any download is
attempted. Checking after the fetch wastes the transfer and, worse, invites a
later refactor to reorder the check behind it.

## The test table is the policy

Because the predicate is pure and its input space is small, the whole policy is
expressible as a table, and the table belongs in the suite rather than in a
comment. It must contain the affirmative cases and, more importantly, the
refusals — stable without custom, prerelease without opt-in, unparseable version,
mandatory component with no signature URL, an empty signature body served with a
200. Each of those is a way somebody will eventually try to install an unverified
artifact, and a row that asserts the refusal is the only thing standing between
the policy and a plausible-sounding widening of it.

The end-to-end lane owes a matching pair: a rehearsal that installs an exempt
artifact successfully, and a rehearsal that watches a non-exempt one get
**rejected** on a real target. A bypass tested only in its permissive direction
has been tested as a feature and not as a boundary.
