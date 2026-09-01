---
layer: application
type: application
subject: machine-paced-delivery
technique: stake-before-merit
stack: process
status: forged
verified_on: 2026-08-31
applied: simulation
ab_verdict: better
proof: structural-only
---

# A contribution surface with every gate except the one about authorship

One project in this fleet is public and set up to receive contributions: a
1,198-word contribution guide, a code of conduct, a pull-request template,
issue templates, a code-owners file, a stated security-reporting path, and a
published maintainer response expectation of "a few days". It is a serious
outward surface, maintained by one person.

`verified_against` is omitted per the profile: the target of this application is
a contribution policy and its surrounding documents, which have no runtime and
no version to pin. What was read is a working tree at 8,294 commits, on
2026-08-31.

It contains no mention of AI, agents, models, or generated content of any kind.
Not a restriction, not a permission, not a disclosure rule — the category is
absent. Every commit in its history is the owner's own, so the surface has
never been tested; the policy gap is real and unexercised, which is the cheapest
moment to close it and the moment nobody ever does.

## Why the simulation is the honest mode here

There is no experiment available. The technique's subject is what an outside
contributor does in a review conversation, and this repository has had no
outside contributors, so there is no population to run either arm against.
Inventing contributors would produce an opinion with a table around it. What is
available instead is the tree, its history, and its own stated rules — and
those turn out to contain three real cases that discriminate between the two
policies, because the project has already legislated the underlying question
twice without noticing.

**Policy A** is the technique before the amendment: restrict unattended
submission, permit tool assistance, decline to care who wrote the text.
**Policy B** adds the channel split: the same permission for the change, and a
restriction on generated text in the review conversation, with disclosed
quotation and a translation carve-out.

### Case 1 — the translator-context rule the guide already carries

The contribution guide requires that a contributor adding a user-facing string
translate it into all thirteen other locales in the same commit, and — the
discriminating half — that they "put translator context (what the string
labels, space constraints) in the commit message", because the catalog format
carries no comments. Two pre-commit hooks enforce the translation. **Nothing
enforces the context, and nothing can**, because its value is entirely in
whether a person who understood the string wrote it.

Under policy A this rule has no support: authorship of the text is declared
irrelevant, so a generated paragraph of plausible translator context satisfies
the guide as written. Under policy B the rule is an instance of the standard
rather than an exception to it — a channel whose only instrument is the
reader's attention, and therefore one where authorship is the point. **The
project has already written the amendment's rule for one field and has no
principle that generalizes it.** Falsifier: if the guide anywhere stated why
that context must be human-written, policy B would be redundant here. It does
not; the requirement is stated and unargued.

### Case 2 — thirteen locales, and the contributor who does not speak them

The same rule is the amendment's carve-out under maximum pressure. This project
*requires* contributors to supply translations they are frequently unqualified
to write, in thirteen languages, and the only realistic way an individual
contributor complies is with machine translation. A policy phrased as a
restriction on generated text, without the carve-out, would forbid the exact
thing the contribution guide mandates.

Policy A avoids that collision by not having the rule at all. Policy B collides
and then resolves, which is the better outcome: the carve-out distinguishes the
generated *artifact* (the locale value — mandated, and judged by hooks that do
not care who produced it) from the generated *explanation* (the translator
context — the reviewer's only evidence that a person understood the string).
The two live in the same commit and get opposite treatment, and only the
amended policy can say why. Falsifier: if the split produced the same verdict
for both halves of that commit, the channel distinction would be doing no work.
It produces opposite verdicts.

### Case 3 — the machine-authored pull request that already exists

Pull request #16 on this repository is titled for its process: a dual-lens
refactor pass reporting 109 findings across 11 waves. #15 and #14 are the same
shape. These are real, they are machine-generated at scale, they were merged,
and they are entirely legitimate — the owner dispatched them, reviewed them,
and is accountable for them.

Both policies admit them, and that agreement matters: it is the check that
policy B has not become the anti-tooling position the technique warns about.
The policies diverge only on what happens if a submitter who is *not* the owner
opens that pull request and answers review questions with generated text.
Policy A has nothing to say — the diff is fine, the tooling is permitted, and
the stake question was settled at admission. Policy B names the failure: the
round trip is where stake is tested, and a fluent generated answer defeats the
test while satisfying its surface. Falsifier: if stake were verifiable at
admission alone, the review channel would carry no evidential load and the
amendment would be decoration. The technique's own argument is that admission
can only *ask*; the round trip is where it is answered.

## Verdict

`better`, on the strength of case 1: the project independently invented the
amendment's rule for one field, could not generalize it, and left it
unenforceable and unexplained beside two hooks that enforce the mechanical half
of the same commit. A standard that predicts a rule a practitioner already
wrote — and supplies the reason they did not — is doing more than describing.

The verdict is `structural-only` as proof, and the limitation is worth stating
plainly rather than softening: **no contributor has ever tested this surface**,
so nothing here measures behaviour. What it measures is coherence against a
real, unprompted artifact. A behavioural arm becomes available the first time an
outside pull request arrives, and that is the return condition.

## What this realization cannot do

It cannot say whether the policy would be obeyed, or whether a maintainer could
tell a generated reply from a human one — the amendment explicitly declines to
claim detection, and this application inherits that. It also cannot say whether
adding the policy would reduce arrival, which is the outcome the parent
technique actually cares about; measuring that needs a surface with traffic and
a before instant, and this one has neither.
