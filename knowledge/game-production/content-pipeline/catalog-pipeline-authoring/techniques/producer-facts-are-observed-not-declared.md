---
layer: technique
type: technique
subject: catalog-pipeline-authoring
technique: producer-facts-are-observed-not-declared
status: forged
laws: [declaring-an-input-is-not-consuming-it, no-gate-self-certifies, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a field on a step declares what its own producer's code does, accepting a provenance stamp from a caller you do not control, planning a labelling campaign across hundreds of steps, offering an action whose effect depends on a producer body]
---

# A producer fact is observed, never declared

A catalog of a few hundred steps needs to answer three questions about its
producers, and it needs to answer them the same way for every step. Does this
producer actually consume the operator's steer? Which engine made this artifact?
Which engine makes each of these hundreds of steps?

Each question has a cheap answer and a true answer. The cheap answer is a field
somebody authored. The true answer comes from the party that can *observe* the
thing the field claims — the body itself, the dispatcher that ran the engine, or
a reading of the code with the evidence quoted beside it. The cheap answer is
indistinguishable from the true one at the moment it is written, and diverges
from it silently afterwards, at a rate proportional to how many of them there
are.

The rule: **for every fact a system records about a producer, name the party
that can observe it, and let only that party write the field.** Where no party
can observe it, record the stated absence and withhold whatever the field was
going to drive. This is the producing half of [declaring an input is not
consuming it](../../../_laws.md#declaring-an-input-is-not-consuming-it): that law
asks whether anything *reads* a declared input; this technique asks whether
anything *checked* a declared fact.

## Three shapes, one rule

### 1. A capability the code can be asked about — probe the code

"This producer reads the direction" is a claim about a function body, and a
function body is present, in memory, at the moment the claim matters. Probe it.
Read the signature; read whether the parameter exists at all.

The alternative — a boolean on every spec — is not merely more work. It is a
claim about the body maintained *beside* the body, and the two edits are
separable. Across hundreds of specs the flag becomes a description of what the
producers used to do. The probe cannot rot, because it is a reading of the thing
itself.

A probe has blind spots, and the blind spots are what people reach for the flag
to cover: a body whose signature hides the parameter behind a rest form, a
default, or an ambient arguments object, and the mirror case of a body that
names the parameter and never uses it. Keep the flag — as an **override for the
probe's blind spot only**, authored with the reason, and counted. An override
that is a claim nothing can check is exactly the thing this technique is about,
so its population is ratcheted like any other exception list: enumerated,
counted, shrink-only, never authored to silence a warning.

The payoff is arithmetic. A probe costs one function and covers every spec that
exists and every spec that will exist. A flag costs one authoring decision per
spec, forever, and buys a field that is wrong wherever somebody forgot.

### 2. An attestation about work that happened elsewhere — only the party that ran it may write it

"An image model produced this artifact" is not a claim about the caller. It is a
claim that a remote, paid engine ran. A caller asserting it is asserting
something it cannot observe, and a field a caller can write is a field a caller
can fabricate — the self-certifying hole from
[no gate self-certifies](../../../_laws.md#no-gate-self-certifies), reopened one
field over, in a system that already closed it for verdicts.

Split the space by what the caller can honestly assert **about itself**:

- **A caller may declare that its own deterministic code produced the artifact.**
  This costs nothing to fake because it asserts no external work; the claim and
  the claimant are the same thing.
- **A caller may not declare that any remote engine ran.** Only the server that
  dispatched it may stamp that, from the same resolved object it handed to the
  dispatcher — not from a re-derivation, which can name a model that was never
  served.
- **A claim the recorder itself already recorded for that exact row is kept.**
  Systems legitimately round-trip: a surface receives a server-stamped result and
  posts it back. Sanitising that would destroy real provenance to defend against
  a claim nobody made. A *different* claim never launders through a prior record.
- **Anything else is recorded as not-recorded** — an explicit absence, not a
  rejection of the artifact and not a producer named "unknown".

Where the unprovable claim is explicit, refuse it loudly, naming the field. Where
it is smuggled — nested inside a payload the schema does not police
field-by-field — downgrade it rather than rejecting the submission. Both answers
are honest; they differ only in blast radius, and rejecting a whole artifact
because a nested record carried a hopeful field punishes every legitimate
caller.

### 3. A fact nothing present can observe — measure the guesser before funding the campaign

Some producer facts have no observer: the code is ambiguous, the run predates
any stamp, the evidence is a person's memory. Systems fill that with a
heuristic, and the heuristic's output gets displayed beside facts that were
actually observed.

The instinct is to fund an authoring campaign: sit down and label all of them.
Before spending it, measure two things over the whole corpus:

- **How many displayed cells does the heuristic actually decide?** Not how many
  it could answer — how many it *wins*, after every stronger fact on the same
  cell has had its turn. A heuristic behind an audit fact and an authored value
  may be deciding almost nothing.
- **Where a stronger fact exists on the same cell, how often does the heuristic
  agree with it?** This is the only honest estimate of what it is doing on the
  cells where nothing checks it.

The two numbers answer different questions and both are needed. A heuristic that
decides six cells out of several hundred has a blast radius of six, and a
campaign across all of them is unwarranted whatever its agreement rate. A
heuristic that decides many cells and agrees rarely is not authoring debt; it is
a defect, and the fix is to delete or narrow it, not to out-author it.

Check the fall-through value first, because it often settles the question: a
guesser whose unknown case returns an explicit *unaudited* has never displayed a
wrong name, however wrong its reasoning would have been.

Then author **only where each item's own code reads unambiguously**, with the
evidence quoted beside the field, and let the rest stay unauthored and visibly
so. Where an authored value contradicts a prior audit fact, record the
disagreement with its evidence rather than resolving it silently — a corrected
audit and a disputed one are different states, and a reviewer needs to see
which.

## Withhold the action the derivation cannot support

These facts are not ornaments; they drive what the interface offers. A step
failing its acceptance is offered a corrective re-run, and the banner previews
the carefully derived instruction that run will carry. If the producer's body
cannot read that instruction, the button re-writes byte-identical data and the
verdict cannot move — forever — while the interface previews the instruction
verbatim, as if it were about to be acted on.

So the derived fact gates the affordance:

1. **Classify the effect of the offered action** from the observed facts, as a
   pure function: would this be a genuine first production, a re-roll over a
   real candidate set, a live dispatch — or a provable no-op?
2. **Withhold the control only for the provable no-op.** Not for the uncertain
   case; the cases that do work must be pinned by test so the withholding cannot
   creep.
3. **Replace it with what *would* change the step**, stated concretely: the
   setting to turn on, or the fact that this producer must be authored to read
   its instruction. Keep showing the derived instruction — as an input someone
   can carry elsewhere, not as an imminent action.
4. **Ratchet the blind population** so the count of producers that cannot
   consume the instruction can only fall.

An offered fix that provably cannot move the verdict is the interface lying at
the point where the operator trusts it most, and it is the direct consequence of
a declared capability nobody checked.

## Decision rules

- **A flag on hundreds of items is a claim about a body that rots out of step
  with it.** Derive by default; author only where derivation is provably wrong,
  and count the overrides.
- **A probe with an enumerable blind spot beats a declaration with none.** The
  probe's failure modes are listable and therefore ratchetable; the
  declaration's drift is neither.
- **Refuse where the claim is explicit; downgrade where it is smuggled.**
- **Not recorded is not a producer named unknown.** Every surface that renders
  the absence must render it as an absence, or the stated absence becomes a
  vendor.
- **Never backfill an unobservable fact.** Rows produced before the stamp
  existed genuinely have no recorded producer. Filling them with a plausible
  value fabricates precisely the evidence the stamp was added to supply.
- **A provenance stamp must not be able to move a verdict.** Pin it outside
  whatever the acceptance hash reads, and assert that stamping or changing it
  leaves the content hash byte-identical. A stamp that counts as a content
  change makes every provenance improvement a drift event.
- **Measure before you author, and let the measurement be allowed to close the
  campaign.** Finding that the work is not worth doing is the campaign
  succeeding, and it is the cheapest outcome available.

## When NOT to use this

- **When the fact is inherently the producer's own** — a timing, an internal
  counter, a token count. Take it, store it as self-reported, and never let it
  stand where an observed fact is expected.
- **When there is no trust boundary and no scale.** A dozen specs whose bodies a
  reviewer reads in one sitting do not need a probe; the review is the
  observation. The threshold is the point at which nobody reads them all any
  more, which arrives sooner than anyone plans for.
- **When the observation would cost more than the field is worth.** Some facts
  are only observable by running the producer. Then the honest record is the
  stated absence, not a cheaper guess wearing the observed field's name.
