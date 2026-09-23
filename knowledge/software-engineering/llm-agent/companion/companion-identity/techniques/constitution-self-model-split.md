---
layer: technique
type: technique
subject: companion-identity
technique: constitution-self-model-split
status: forged
laws: [one-authority-per-vocabulary, deletion-is-not-repair]
shared_with: []
use_when: [deciding what an agent may change about itself, writing a companion's identity documents, a rule keeps getting overwritten by the agent's own learning, upgrading a shipped constitution the person may have edited, the companion can change the code of the product that ships its law]
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

**Keep the product's grammar out of the person's law.** The action vocabulary,
the output format, the op catalog — whatever changes because the product shipped
a feature — is surface law, and it is assembled into the context from the
application's own package, never written into the person's file. This is the rule
that decides everything below. A baseline that carries the product's grammar
changes with every feature, so its "rare" upgrades become routine, each one
displaces whatever the person had written, and the old file *cannot* be kept
because the running binary needs the new grammar in it.

With the grammar out, the durable baseline is small and slow, and the upgrade
procedure is the one package managers settled on decades ago for files that both
a vendor and an owner edit:

- The baseline carries a **version stamp** recorded separately from the file,
  together with a **fingerprint of the text that was shipped**, so "has this
  installation seen the current law" and "has the person changed it since" are
  both answerable without diffing prose.
- On first run the baseline is **seeded only when absent**.
- On a version bump, **an untouched file is replaced silently** — its fingerprint
  still matches what was shipped, so there is nothing of the person's to lose.
- **A file the person has changed is not overwritten by default.** It stays live;
  the new baseline is placed beside it and the person is *told*, in the product,
  with the difference available — a notice they see, not a log line. Replacing
  their text with the prior version saved aside is the fallback for the case
  where the old file genuinely cannot work with the new build, and that case is
  the one the grammar rule above exists to design out.
- **No automatic merge.** A three-way merge of a law nobody reviews is worse than
  either whole text; the tools that offer merging offer it to a person, at a
  prompt.
- Any copy taken before a write **must succeed before the write happens**. A
  backup attempted and ignored on failure turns "recoverable" into "usually
  recoverable", which is not a property.

The cleaner shape removes the conflict instead of managing it: **layering.** The
shipped baseline is read from the package at assembly time, the person's file
holds only their own amendments, and the precedence between the two is stated in
the text. Upgrades then never touch the person's file at all — the same shape
that lets vendor defaults and local overrides coexist in operating-system
configuration, and the same one the memoryless mode already relies on when it
reads the shipped law from the package rather than the person's folder
([brain-adoption-consent](./brain-adoption-consent.md)).

Be honest about the residual cost: under replace-with-backup, an upgrade moves the
person's amendments out of the live document. The mitigation is that it is loud,
rare, versioned and recoverable — and each of those four is a claim to check
against the installation, not a description of the design. "Rare" is the one that
fails first, and it fails for the reason stated at the top of this section.

### The law's upstream is part of the law

"No path by which the companion can amend it" has to include the path that runs
through the product. A companion given a coding capability over the repository its
own application is built from — self-development, dogfooding, a debug mode that
lets it improve the app — can edit the shipped baseline and its version stamp, and
the next build's upgrade procedure then delivers that edit into the person's file
as law. The amendment took two approvals of ordinary-looking work, and neither
approval card said "constitution". So the source of the shipped baseline, its
stamp, and the code that seeds and upgrades it are **excluded from the companion's
writable paths**, or routed to a review the person performs as law review; the
same holds for the gate code itself. The test is the enumerable-writers test,
extended upstream: list every path that ends with different text in the person's
constitution, including the ones that pass through a build.

### When two applications ship law to one self

The same procedure has a multi-application form, and it is the one that breaks
first, because each product's seeding code was written as though it were alone on
the disk. When two surfaces share one brain root — one companion, one person, two
domains — **the self-model and the memory stay singular and the constitution may
not.** Each surface's law is the law of its own surface, and neither is entitled
to impose it on the other.

Three rules keep that from becoming a fight over one file. Seeding is
**seed-if-absent and never overwrite**, so a constitution already on disk — the
other application's, or the person's own amendments — survives a first run that
did not expect it, and re-running the seed is a no-op that reports the brain that
now stands. Each shipped baseline carries an **origin marker** alongside its
version stamp, so *whose law is this* is answerable by reading a few bytes rather
than by diffing prose against every product's template. And the marker's absence
is read as **provenance, not authorship**: a constitution without your marker is
one you did not write, which covers the other product's baseline and the person's
hand-edited file equally, and that is the same verdict either way for every
decision that consults it.

A surface that needs its own law *in addition to* the shared one appends it at
assembly time from its own package rather than writing it into the person's file.
Contracts belonging to a surface — its output format, its available actions, its
tone for that medium — are surface law and never durable law; writing them to
disk makes one product's rendering details binding on the other.

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
