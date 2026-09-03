---
layer: golden-path
type: golden-path
subject: decentralized-artifact-distribution
status: forged
use_when: [building a registry that lists third-party plugins, themes or models nobody vetted centrally, deciding who is allowed to say an artifact is safe and how that statement reaches a consumer, an approval survived an edit it should not have survived, a trust signal's source went down and everything it approved stayed listed]
techniques:
  - origin-signed-record-with-index-as-cache
  - verdict-bound-to-the-exact-revision
  - split-admit-state-and-redact-authority
  - fail-closed-trust-dependency
  - signal-that-only-subtracts
  - publisher-declared-verification-floor
---

# Decentralized artifact distribution

This subject owns the distribution of third-party artifacts — plugins, themes,
extensions, models, templates — across a trust boundary between strangers,
under one hard condition: **no single party is trusted to say what is listed,
what is safe, or who published it.** There is a catalogue, and people browse
it, and things get installed from it; what there is not is an operator whose
word settles any of those three questions. The subject begins when a publisher
you have never met announces an artifact, and it ends the moment the bytes are
admitted onto the consumer's machine.

That ending is exact and worth stating first. What happens *after* admission —
isolating the artifact, enforcing what it may call at run time, deciding what a
failing hook does to the host — is the sibling subject
[untrusted-extension-host](../../extension-trust/untrusted-extension-host/untrusted-extension-host.md)
and appears nowhere below; a system can get every rule in this document right
and still be destroyed by running the admitted bytes with the host's own
privileges.

## The one question

A reader arriving with a registry problem needs one discriminator, and this is it:

> **Is the party you fetch from the party you trust?**

If yes, you are in [supply-chain](../supply-chain/supply-chain.md). The registry
is authoritative, the resolved graph it produces is the thing to gate, and every
technique is a *standing consumer policy* at a crossing: advisory denial,
licence allowlists, lockfile freshness, permission manifests, the review posture
for an automated update. The registry might be wrong, but it is not *modelled*
as an adversary — it is modelled as the source of truth whose output you filter.

If no — if the thing serving you the catalogue is an index that could be hostile,
partitioned, or simply one of several — you are here. The fetch is a **cache
lookup** and the trust is anchored somewhere the index does not control. Every
hard problem below follows from that separation: who may make a statement about
an artifact, how that statement travels, what binds it to the exact bytes it
judged, and what a consumer does when the party who was supposed to make the
statement cannot be reached.

The two subjects compose. A consumer that has decided an artifact is admissible
by this subject's rules still applies its own standing policy before installing
it, and neither substitutes for the other.

## Where the neighbours start

Three more boundaries, each close enough to draft a technique onto by mistake.

[Signed artifacts & provenance](../signed-artifacts/signed-artifacts.md) owns
integrity, provenance and admissibility for a file *meant to be carried* between
two processes: what exactly a signature covers, how identity is derived from a
key rather than claimed beside it, the three-state verdict, key custody and its
lifecycle. All of that is this subject's **integrity primitive** and none of it
is restated here. The seam is that the neighbour answers *are these the bytes
that identity produced*, and this subject answers *who is allowed to say things
about those bytes, how their statements are distributed, and what a consumer
does when the sayer is unreachable*. When your question is about a signature,
read there; when it is about an assertion made by a third party who is not the
publisher and not you, read here.

[Release pipeline](../../../engineering-process/build-and-release/release-pipeline/release-pipeline.md)
owns publication inside one organization's own machinery — the version as a
single fact, the changelog, the staged pipeline, the updater channel and its
[release-verification](../../../engineering-process/build-and-release/release-pipeline/techniques/release-verification.md).
Everything there assumes the publisher and the distributor share an employer.
This subject owns the case where they share nothing, and where the distributor's
incentive to check the publisher's work is exactly as strong as the consumer
forces it to be.

[Optional dependency degradation](../../../backend-platform/resilience/optional-dependency-degradation/optional-dependency-degradation.md)
owns what a host does when something it called misbehaves, and its
[refusal-is-not-failure](../../../backend-platform/resilience/optional-dependency-degradation/techniques/refusal-is-not-failure.md)
is cited rather than repeated. The distinction that keeps
[fail-closed-trust-dependency](./techniques/fail-closed-trust-dependency.md)
here rather than there is adversarial: in a resilience subject, degrading open
is a *correctness* choice with an availability argument behind it. Here it is an
**attack primitive** — an adversary who can make a trust signal's source
unreachable has bought the removal of every refusal that source was issuing,
which means the cheapest way to publish something that would be rejected is to
knock over the party that would reject it.

## The four naive readings

A team that has built a centralized registry before arrives with four beliefs,
each of which is load-bearing and wrong here.

**"The database is the truth."** In a centralized registry it is; the operator's
row *is* the listing, and repairing a listing means editing the row. Here the row
is a derived artifact and the truth lives in the publisher's own store. The
inversion is not a purity argument — it is what makes a hostile or compromised
index survivable, and it costs the operator the ability to fix anything by hand.
[origin-signed-record-with-index-as-cache](./techniques/origin-signed-record-with-index-as-cache.md).

**"Approval is a property of the package."** It is a property of a *revision*,
and the difference is the entire attack. A verdict attached to a name is
transferable to content the verdict never saw: get approved, then edit.
[verdict-bound-to-the-exact-revision](./techniques/verdict-bound-to-the-exact-revision.md).

**"Moderator is a role."** It is three separate grants wearing one word, and
conflating them makes the most common real policy inexpressible — an operator
who wants to honour one party's takedowns without honouring its approvals has
nothing to configure.
[split-admit-state-and-redact-authority](./techniques/split-admit-state-and-redact-authority.md).

**"If the checker is down, show what we had."** That is the takedown-evasion
primitive above, written as a kindness.
[fail-closed-trust-dependency](./techniques/fail-closed-trust-dependency.md).

## Statements, and who may make them

Once the operator is not the authority, the system's real content is a
**graph of statements about revisions**, made by parties the consumer has
separately decided to listen to. Three properties of that graph decide almost
everything else.

**A statement names its subject by content, not by name.** A name is a mutable
pointer the subject controls; a content identifier is not. This is the same
discipline the artifact-signing neighbour applies to a single file, extended to
every third-party assertion *about* that file, and it produces a property worth
saying out loud: **approval expires on edit, with no action by the approver.**
The publisher revising their listing drops out of the approved projection
automatically, because the statement in hand no longer describes the revision in
hand. The mirror rule applies on the consumer's side, where the window between
"the user saw this and consented" and "the bytes were fetched" is a
time-of-check/time-of-use gap that becomes an explicit drift error rather than a
silent substitution.

**Different statements deserve different instruments.** "This listing text is not
a scam" and "these bytes are the bytes the publisher signed" are claims of
different kinds, made by different parties, with different blast radii when the
maker is compromised. Giving them one instrument means a compromised
content-assessment service can admit an artifact, which is a strictly worse
system than one where it can only ever *block*. Asymmetric power is the design,
not a limitation: the soft signal subtracts and structurally cannot add.
[signal-that-only-subtracts](./techniques/signal-that-only-subtracts.md).

**Statements arrive over a live subscription, and subscriptions die.** Every
statement in this graph reaches the index over a connection that is nobody's
priority to keep alive. The health of that connection is therefore an input to
admission and not an operational detail, and the number that decides "unhealthy"
is derived from the source's own reconnect budget rather than picked round
([limits-are-derived](../../../_laws.md#limits-are-derived)).

## The distributor may withhold; it may never forge

This is the strongest single rule in the subject, and the one that pays for the
architecture. A distributor sits between a publisher and a consumer and can
always **withhold** — drop a listing, delay it, rank it last, refuse to serve it
at all. No design prevents that, and no design should pretend to: withholding is
the operator's legitimate power and also its legitimate liability. What the
design must prevent is **forgery**: the distributor showing a consumer a record
the publisher never signed, or a version of a record the publisher revised away.

The test is mechanical and belongs in the test suite of any system claiming this
property: *point a client at a hostile index and confirm it cannot be shown a
record the publisher did not sign.* A system that passes has a real trust model.
A system that cannot state the test does not, whatever its architecture diagram
says.

Two consequences of the rule are costs, and honest systems state them in the same
breath as the benefit, because they are the same property read from the other
side:

- **The operator can no longer fix a listing.** A typo, a mis-set field, a
  category error — the repair path runs through the publisher, and support
  tickets that used to be a database edit become correspondence.
- **A publisher who loses the key loses the name.** There is no operator who can
  reassign it, because an operator who could reassign it could also forge under
  it.

## The floor is declared by the party being checked

The last inversion is the least obvious. Whether an artifact must carry build
provenance — or a bill of materials, or a reproducibility attestation — is
naturally implemented as a registry-wide switch, and that implementation makes
downgrade attacks invisible: strip the evidence, and there is nothing left that
says evidence was expected. Move the requirement into the **publisher's own
signed metadata** and stripping the evidence leaves a signed statement behind
saying it was required, which converts a silent omission into a detectable
contradiction. The same shape governs the publishing side, where the narrow
pre-declared tuple — this repository, this workflow, this collection, this one
action — is what limits a compromised build system to releases that were already
going to be allowed.
[publisher-declared-verification-floor](./techniques/publisher-declared-verification-floor.md)
owns both halves, and carries the finding that keeps it honest: an opt-in floor
whose shipped default is permissive describes the examples and not the
installations ([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)).

## The failure this subject exists to prevent

Every failure above has the same signature, and naming it is worth more than any
individual rule: **a decision that looks like it was made by an authority, and
was actually made by whoever was cheapest to compromise.** A record served by an
index nobody re-verified. An approval that survived the edit that invalidated it.
A takedown honoured from a party the operator only meant to accept approvals
from. A listing that stayed visible because the service that would have pulled it
was unreachable. A green badge backed by a record type no consumer reads.

In each, the machinery is present, the screens look right, and the property the
machinery advertises is absent. That is why the acceptance tests for this subject
are all of the same form — not "does the happy path work" but **"what can a
hostile or absent participant cause a consumer to see?"** — and why a design
review here should spend its time on the second question.

## What the system owes the operator

- **Per-listing, why it is visible or not.** Which sources' positive statements
  were required, which arrived, which are missing, and against which revision.
  A boolean visibility flag with no predicate supports no incident review
  ([count-carries-predicate](../../../_laws.md#count-carries-predicate)).
- **The identity of the policy that produced the decision.** A version and a hash
  of the effective trust policy, recorded with the decision, so a listing that
  changed state overnight can be attributed to a policy change rather than
  guessed at ([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)).
- **Health per statement source, separately from admission.** "Is this source
  reachable" and "is this source trusted" are two facts; a dashboard that shows
  only their conjunction cannot answer why a population of listings vanished.
- **The count of records the index dropped because verification failed**, with
  the reason class. A steady trickle is normal; a step change is either an
  attack or a broken verifier, and the two are distinguishable only if the
  reasons are separated ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
- **The set of grants each configured party holds**, rendered as three
  independent answers rather than one role name.

## Order of adoption

For a team that today has a centralized registry table and wants this property,
the build order that pays at each step:

1. **Content-address the listing.** Give every listing revision a content
   identifier and record it with every decision. Nothing else in this subject is
   expressible until statements can name a revision.
2. **Re-verify at the index.** Fetch the publisher's signed record and verify it
   before serving, so the index is demonstrably a cache. This is the step that
   changes the trust model; everything before it is bookkeeping.
3. **Pin consent to the displayed revision** and re-check at commit. Cheap, and
   it closes the substitution window before any third-party statement exists.
4. **Split the moderator grants** into admission, state and redaction, even if
   one party initially holds all three. Splitting later means re-deriving every
   operator's intent from a boolean.
5. **Add required positive sources, and fail closed on their health** — in that
   order, because a required source with no health rule is a new outage surface
   with no compensating security benefit.
6. **Declare the verification floor in publisher metadata**, last, because it is
   the step whose value depends on all the others being real.

Teams stop after step 2 and ship the architecture diagram. Steps 3 to 5 are
where the property actually arrives, and step 1 without step 2 is the worst
resting place: content identifiers everywhere, and an index that is still the
only thing anyone believes.

## The techniques

- [origin-signed-record-with-index-as-cache](./techniques/origin-signed-record-with-index-as-cache.md)
  — the publisher's store as the authority, re-verification before serving, the
  hostile-index test, and the operator powers the inversion costs.
- [verdict-bound-to-the-exact-revision](./techniques/verdict-bound-to-the-exact-revision.md)
  — statements that name a content identifier, approval that expires on edit
  without moderator action, and consent pinned to the revision that was shown.
- [split-admit-state-and-redact-authority](./techniques/split-admit-state-and-redact-authority.md)
  — three grants behind one word, the policies a single trusted flag cannot
  express, and the collision rule when two terminal states are live at once.
- [fail-closed-trust-dependency](./techniques/fail-closed-trust-dependency.md)
  — demotion of an unhealthy required source, the timeout derived from its own
  reconnect budget, and why a policy that fails to parse denies everything.
- [signal-that-only-subtracts](./techniques/signal-that-only-subtracts.md)
  — separating the display-safety claim from the artifact-integrity claim, the
  automated path that may recommend but never admit, and marking a deliberately
  unreachable branch so it is not read as a bug.
- [publisher-declared-verification-floor](./techniques/publisher-declared-verification-floor.md)
  — the requirement declared in signed metadata so a downgrade contradicts it,
  publishing under a short-lived attested identity scoped to one collection and
  one action, and the permissive default that makes the whole apparatus opt-in.
</content>
</invoke>
