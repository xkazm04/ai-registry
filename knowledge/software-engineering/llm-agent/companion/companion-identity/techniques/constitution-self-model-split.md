---
layer: technique
type: technique
subject: companion-identity
technique: constitution-self-model-split
status: forged
laws: [one-authority-per-vocabulary, deletion-is-not-repair]
shared_with: []
use_when: [deciding what an agent may change about itself, writing a companion's identity documents, a rule keeps getting overwritten by the agent's own learning]
---

# The constitution / self-model split

A companion needs a part of itself that never moves and a part that does. This
technique is the partition: two documents, two authors, one test for deciding
which document a given line belongs in.

## The two documents

The **constitution** is law. It states the companion's purpose, the boundaries
it does not cross, the standing obligations it owes its person, what it must
refuse, and how it behaves when instructions conflict. It is authored by the
human and by nobody else. The running system exposes no path by which the
companion can amend it, propose an amendment, or annotate it — not a review
lane, not a proposal queue, nothing. Changing it is an out-of-band act: the
person opens the document and edits it.

The **self-model** is the accumulated self. Preferences discovered about the
person and about the work, the texture of the relationship, standing context
that would otherwise be re-explained weekly, and the companion's own reads on
what it is good and bad at. It is authored by the companion under supervision,
through the diff door and nothing else
([anchored-identity-diffs](./anchored-identity-diffs.md)). It is *expected* to
look materially different after a year; a self-model that has not changed is a
symptom, not a success.

Both are loaded into every context the companion reasons in, and both are read
by the same reader — which is exactly why the reader cannot be trusted to
maintain the distinction on its own. The distinction has to be structural: two
files, two write paths, one of which does not exist.

## Why one blended document fails

The single-document design is the default because it is obviously simpler, and
it fails at the moment it starts working. Once a companion may edit *any* of the
document, it may edit *all* of it, and every safeguard degrades into a request
that the model behave. Three specific failures follow:

- **Amendment by accretion.** No individual edit proposes changing the law. The
  self-model gains a line about being more autonomous, then a line about the
  person preferring fewer confirmations, then a line summarising both — and the
  constitutional clause requiring confirmation is now outnumbered by prose in
  the same document that says otherwise. Nothing was overwritten and the rule is
  gone.
- **The lane-shopping rephrase.** A self-model proposal wearing preference
  clothes ("the person seems to want me to act without checking") is a
  constitutional amendment written in the mood of an observation. With one
  document there is no lane to shop between and therefore no check to fail.
- **Review collapse.** A person reviewing changes to a document that contains
  both law and learning reviews the learning, because that is what is usually
  changing. The constitutional edit rides in the same diff, in the same register,
  at the same time of day.

The split is not a filing convenience. It is what makes the human-gated write
lane implementable at all.

## The test: is being wrong about this recoverable?

When a candidate line could plausibly live in either document, decide by asking
whether an error in it is repaired by the system's ordinary operation.

A wrong self-model entry is recoverable. It shapes some interactions, the person
notices, a correction supersedes it, and the damage was a few awkward exchanges.
A wrong constitutional clause is not, because it governed every decision made
under it — including the decisions about which self-model diffs to propose and
which to approve. Its errors are laundered through everything downstream, so by
the time it is noticed there is no clean layer to restore.

The rule that follows: **when the classification is ambiguous, the constitution
wins.** Over-constraining costs a companion that asks before acting; under-
constraining costs a companion that acted. Those are not symmetric.

Two corollaries fall out of the same test:

- **Anything about safety, refusal, or the treatment of the person is
  constitutional by definition**, regardless of how observational its phrasing.
- **Anything whose truth is a fact about the world or the person** — a schedule,
  a preference, a working habit — belongs in the self-model, even when it feels
  weighty, because a wrong fact is corrected and a wrong rule is obeyed.

## One authority, and no restatements

The two documents must never state the same rule. A constitutional clause
paraphrased into the self-model — usually with the good intention of keeping it
salient — creates a second copy that the companion may edit, and the copies
drift precisely when somebody tightens the original and finds only one of them
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
The self-model may *reference* the constitution and must not restate it. When a
proposed self-model line reads like a rule, that is the signal it is a
constitutional edit and belongs out of band.

The same law governs the runtime: the constitution has exactly one location, and
the assembled context reads it from there rather than from a cached transcription
made when the companion booted. A companion still enforcing yesterday's law is
enforcing a copy.

## When the law ships with the product

A companion that arrives configured has a baseline constitution somebody else
wrote, and that baseline will need to change as the product changes. This is the
one legitimate case where law is authored outside the relationship, and it needs
a procedure or it becomes a silent overwrite of the person's own amendments.

Four rules make it survivable. The baseline carries a **version stamp**, recorded
separately from the file, so "has this installation seen the current law" is
answerable without diffing prose. On first run the baseline is **seeded only when
absent**. An upgrade happens **once per version bump**, is gated on the stamp, and
**preserves the prior text** beside the new one under a timestamped name rather
than attempting a merge — a three-way merge of a law nobody can review is worse
than a replacement the person can undo. Between bumps the person's edits are left
entirely alone, because the file is theirs.

Be honest about the cost: an upgrade moves the person's amendments out of the
live document. That is a real loss, and the mitigation is that it is loud, rare,
versioned and recoverable — not that it does not happen.

## Law that does not fit in the context it governs

A long-lived constitution grows, and past a certain size it no longer fits in the
context window of every call it governs. The pressure to load "the important
parts" then becomes irresistible, so state the rule in advance: **partial loading
of the law is permitted and must be disclosed.** A companion reasoning under a
truncated constitution says so, in that session, because one that silently drops
half its law is not operating under a smaller constitution — it is operating
under an unknown one, and neither party can tell which clauses were in force.
Structuring the document so its headings survive truncation is the cheap
mitigation; treating the size as a symptom and pruning is the real one.

## Amendment, and what happens to what it governed

Constitutional amendment is deliberately unautomated, but it is not
unprocedural. Three disciplines keep it honest:

- **The document carries its own history**, so "when did this become a rule, and
  why" is answerable. A law with no origin gets treated as an accident by the
  next person who reads it, including the future version of the person who wrote
  it.
- **Amendment is additive or replacing, never a rewrite.** The reason is the same
  one that governs self-model edits, and the stakes are higher.
- **Removing a clause is not repairing what it was blocking.** When a
  constitutional rule turns out to be producing bad behaviour, the response is to
  state the rule correctly, not to delete it and rely on the model's judgement in
  the gap. Deleting the clause removes the visible constraint and leaves the
  situation it existed for entirely unhandled
  ([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)).

## When not to use this

Two documents are overhead for an agent with no continuity — a stateless
assistant whose "identity" is a paragraph nobody proposes to change has nothing
to partition, and splitting its prompt into a law file and a self file buys it
nothing but two files. The split starts paying at the moment something in the
system can write to the agent's own description. Before that point, the honest
design is one authored document and no write path at all — which is the split
with an empty second half, and converts cleanly when the write path arrives.
