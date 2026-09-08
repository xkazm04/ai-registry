---
layer: technique
type: technique
subject: agent-instruction-files
technique: rewrite-behavior-pinning
status: forged
laws: [gate-sees-target, silent-state-is-ungoverned]
shared_with: []
use_when: [a bulk or machine-authored rewrite of an always-loaded instruction asset is proposed, a prompt or instruction file is being compressed for cost, an agent behaviour stopped happening and no error or failing test marks when, deciding what to assert before editing guidance whose origin nobody remembers, a compression loop has returned a shorter candidate file]
---

# Rewrite behaviour pinning

This subject's three maintenance instruments all run the same way. The
admission test ([line-earning](./line-earning.md)) asks whether *removing a
line* would change behaviour. The expiry trial
([substrate-coupled-expiry](./substrate-coupled-expiry.md)) withholds *a
line* and watches for the failure. The freshness audit
([instruction-freshness](./instruction-freshness.md)) walks *every line* and
resolves what it names. Each is per line, and each is run by an owner reading
a diff.

[sibling-floor-ownership](./sibling-floor-ownership.md) already found one
blind spot in that funnel and named it exactly: the funnel "is never run per
install, because an install produces no diff for anyone to read." That is the
case where the diff is **absent**.

There is a second, and it arrives from the opposite direction: the diff is
**total**. A file rewritten in bulk — by a compression loop, by a model asked
to shorten its own instructions, by a migration that reflows the whole
document — changes every line at once, and every instrument above quietly
stops working while continuing to report.

## Why the per-line instruments do not reach a rewrite

- **A rewrite rephrases; it does not remove.** `line-earning`'s second half
  needs a line whose removal to test and `substrate-coupled-expiry` needs a
  line to withhold. After a rewrite there is no such line: the content was
  restated, and the behaviour that vanished vanished from a *phrase* inside a
  restated sentence.
- **The origin story does not survive.** Both techniques fall back on the
  line's origin story as the honest measurement — the failure that minted it.
  Origin stories are per line and are held by people. A loop that rewrites the
  document inherits none of them, and the rewritten line is indistinguishable
  from a line that was always there.
- **The review degrades to a judgement about text.** A reviewer facing a diff
  where every line changed cannot ask "would removing this change behaviour?"
  of anything, so the question collapses to "does this say roughly the same
  thing?" That is a claim about prose, and the property at risk is behaviour
  ([gate-sees-target](../../../../_laws.md#gate-sees-target): the check reads
  the text as a proxy for the behaviour, and the proxy diverges most at
  exactly the moment the rewrite is largest).
- **The coverage contract stays green throughout.**
  [capability-coverage-contract](./capability-coverage-contract.md) asserts
  that everything the runtime offers is named. A rewrite that keeps every
  capability named and rewrites the guidance about *when to reach for it*
  passes that gate on every run.

## The failure signature is inversion, not absence

The intuition is that compression *drops* a behaviour. The measured failure
is stranger and harder to see: the behaviour becomes **unconditional in one
direction**.

Compression has a systematic bias, and it follows from what a compressor is
optimising. The tokens that carry the least information per token are the
hedges — *usually*, *consider*, *prefer*, *unless*, the worked exception, the
case distinction. Those tokens carry almost nothing about **what** to do and
almost everything about **how strongly**. A compressor reads them as filler
and deletes them first, and the residue of a compressed instruction is a bare
imperative. Advisory guidance becomes policy without anyone writing a policy.

One vendor's account of its own harness (measured 2026-09) is the clean
instance. Cautious guidance about running independent sub-agents in parallel
was rewritten by a self-compression loop into a hard scheduling rule, and
independent agents began running strictly sequentially. Nothing failed. No
tool errored, no task was wrong, no exit code moved — the system was merely
slower, which is
[silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)
in its purest form: the parallelism that did not happen never became an
artifact anything could read, and the regression surfaced only in a live
population.

The corrective is the part worth carrying, because it inverts the instinct.
The eventual fix was **shorter than the compressed version and less
restrictive than either it or the original**: an explicit allowlist and
denylist collapsed into one sentence that handed the choice back to the model.
Length and strictness are independent axes. A compression loop that cannot see
the second will trade it away for the first every time, and the repair for an
over-compressed instruction is frequently not restoration — it is a shorter
sentence with the modality put back.

## The instrument: pin before, not after

A **pin** is an assertion about what the system *does* under the current
instruction, written while that instruction still works, and run against the
candidate.

Three properties separate a pin from a test that only looks like one:

- **It asserts over behaviour, not over text.** A check that greps the
  candidate for a required phrase has re-implemented the per-line funnel and
  inherited its blind spot. The rewrite is allowed to say it differently; that
  is the entire point of the rewrite.
- **It pins the modality, not only the outcome.** Assert that the agent
  *may* take the permissive branch, not merely that it takes the obvious one.
  A suite that only checks the mandatory direction cannot see an advisory
  hardening into a mandate, which is the failure this technique exists for.
- **It is written by someone who remembers why the guidance is there.** The
  set of behaviours worth pinning is not derivable from the file — it is the
  set its readers depend on, and the file records the instruction rather than
  the dependency. This is why the pin must precede the rewrite: afterwards,
  the person reading the candidate has only the text.

**Write the pin before the retry, not after the fix.** In the measured case
the experiment was stopped and the regression evaluation for the exposed
behaviour was written *before the prompt was changed again*. That ordering is
what converts one incident into a standing constraint; a fix shipped without
its pin leaves the same rewrite free to make the same deletion next quarter.

## Offline pins do not close the gap, and saying so is part of the technique

The pin set is always a proper subset of the depended-on behaviours, because
the unpinned set is exactly the set nobody remembers is in the file — which is
the same set a rewrite deletes. In the measured case the targeted behavioural
tests **passed**, and the regression was found by the live experiment.

So the pins are a filter, not a gate, and a bulk rewrite of an always-loaded
asset ships the way an unproven change ships: staged, against the metric the
rewrite was for, with a rollback that is exercised rather than assumed. The
residual is found by the population or it is not found at all.

## What a rewrite actually endangers

Scope the pinning the way `substrate-coupled-expiry` scopes its trial, and it
covers a handful of behaviours rather than a document — because the two
techniques sort on the same axis for the same reason.

Unreachable material survives a rewrite intact: the command with the
non-obvious flag, the convention visible across fifty call sites, the rejected
alternative, the gotcha. A paraphrase of a fact is still the fact, and no
reflowing of the sentence around it changes what it says.

What a rewrite endangers is precisely what `substrate-coupled-expiry` says
expires first — the **judgement-shaped** rule: the hedge, the preference, the
conditional, the licensed exception. Those lines carry their content in their
*strength* rather than in their facts, and strength is the thing paraphrase
loses. The symmetry is worth stating plainly: the lines that go inert when the
model improves are the same lines that break when the file is rewritten, and
for the same underlying reason.

That also predicts which half of the file to pin first. A file that has been
kept in balance under
[restraint-amplifier-balance](./restraint-amplifier-balance.md) carries its
amplifiers as licences — *you may*, *surface it when you see it* — and a
licence is a hedge with a job. Amplifiers are the highest-value pins in the
document and the first casualties of a compressor, because a permission
compresses to nothing while a prohibition compresses to itself.

## The lexical pin fails, measured — and it is what everyone builds first

The cheap substitute for a behavioural pin is a **lexical** one: scan the diff
for hedges that disappeared. It is tempting because it needs no agent, no
harness and no eval — and it does not work, which is worth stating with a
number rather than as a caution, because the warning above does not stop
anyone from building it.

Measured 2026-09 over twelve always-loaded instruction assets in seven
repositories: 152 revisions, 35 of them bulk rewrites replacing at least a
quarter of the file. A hedge-lexicon detector — asserted first against three
known positives covering all three inversion shapes and four known negatives —
flagged **10 candidates and confirmed 0**. Every one was a pairing artifact of
a prose-to-table restructure or a re-wrapped line; the highest-scoring
candidate matched a sentence against its own continuation, and the phrase it
claimed was deleted is in the file today.

The reason is the one this technique already gives: a lexical check reads the
text as a proxy for the behaviour, which is the per-line funnel wearing a new
name. It also inherits a bias that runs the wrong way — on the three seeded
positives **the strongest inversions rewrote the most words**, so any
similarity floor tuned to suppress false pairs suppresses the true ones
first, and every threshold that made the detector quiet also made it blind;
whether that bias holds on inversions found in the wild is unmeasured, because
none were.

Two things follow for practice. A modality scan is a **drafting aid for the
author of the rewrite**, run on their own candidate before review, where a
10:0 false-positive rate costs a minute; it is not a gate, and installing it as
one buys an alert everybody learns to dismiss. And the same sweep is worth
running for its denominator rather than its hits: of those 35 bulk rewrites,
24 *grew* the file and none was undertaken to reduce its per-turn cost — so a
team asking whether it needs this technique should first check whether it has
ever compressed the asset at all.

## Decision rules

- **No pins, no bulk rewrite.** Reduce the file by per-line removal instead,
  in single reviewable commits, where the existing instruments work and are
  cheaper.
- **Price the rewrite per turn, not per file.** An always-loaded asset's
  saving recurs on every turn that loads it; the same vendor's account puts one
  tool's accumulated guidance at roughly 1,300 prompt tokens per turn, about
  1.8% of session prompt tokens and about 2.9% of normalised cost per active
  hour (measured 2026-09, one harness, one workload — the ratio is a property
  of that file's share of the floor, not a constant).
- **Treat a self-compression loop as an unreviewed author.** Its output is a
  candidate from a contributor with no origin stories and no stake in the
  behaviours, which is the review posture `sibling-floor-ownership` already
  applies to installed entries.
- **When guidance for one behaviour lives across several surfaces, pin the
  behaviour once and edit the surfaces together.** Guidance accretes across
  tool descriptions, schemas, sub-agent definitions and system instructions;
  a rewrite that reaches only one of them leaves a contradiction rather than a
  reduction, which `substrate-coupled-expiry` prices as worse than either.
- **When a regression is found, write its pin before rewriting again.**

## When not to use this

- **A hand edit of a few lines.** `line-earning` and the withheld-line trial
  already work there and cost less. The threshold is not line count but
  whether the diff decomposes into removals a reviewer can test one at a time.
- **A rewrite that only removes reachable material** — a generated overview,
  a restated README section. Nothing judgement-shaped is at risk, and the
  admission test alone is sufficient.
- **A prompt with a full behavioural eval suite already gating it.** There the
  suite *is* the pin set, maintained continuously; this technique is what a
  team does when the asset ships without one, which is the ordinary case for a
  repo-owned instruction file.
