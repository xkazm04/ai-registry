---
layer: technique
type: technique
subject: quality-gates
technique: prose-rule-drift
status: forged
laws: [absent-guard-is-loud, gate-sees-target, silent-state-is-ungoverned]
shared_with: []
use_when: [a rule everyone agrees on has never had a check written for it, auditing which standards are actually mechanised, a documented invariant turns out to have been violated for months, deciding where to put enforcement for a rule about an action rather than an artifact, a convention that governs setup or provisioning rather than code, a file or page has a stated size cap and every edit to it obeys a per-edit cap, an accreting artifact is over its bound and no commit broke a rule, a rule is about intent and no parser can express it]
---

# Prose-rule drift

The rest of this subject engineers gates that exist. A gate can be
decorative ([severity-by-construction](./severity-by-construction.md)),
dead ([gate-liveness](./gate-liveness.md)), or unbound from the decision
it is supposed to govern
([enforcement-binding](./enforcement-binding.md)) — three failures whose
common observable is green. This technique is about the stage before all
of them, where the failure has no observable at all: **a rule that was
written down and never mechanised.**

That state is not weak enforcement. It is the absence of a compliance
signal. A dead gate at least reports something; an unbacked rule has no
colour to be. Nothing is green, because nothing runs.

## The tell is that the forbidden action works

The diagnostic is uncomfortable because it is the absence of a symptom.
When a rule has no mechanism behind it, the system's response to a
violation is byte-identical to its response to correct use: the command
succeeds, exits zero, prints what it always prints. There is no error to
search for, no red build to bisect, no log line to grep. The violation is
indistinguishable from compliance **at every surface anyone would think
to check**, which is why these are discovered by accident, usually years
late, usually by someone investigating something else.

So the correct prior for an unbacked rule is not that it might be
violated. It is that **it has been violated, continuously, since it was
written**, and the length of the violation is the age of the rule. A team
that finds one such rule should expect the count of past violations to be
bounded only by how often anyone had occasion to take the action.

## They hide in rules about actions, not artifacts

Most gates read the tree. That is what makes them cheap, and it is also
what decides which rules get mechanised: a rule about the *contents of the
repository* has an obvious place to live, and a rule about **an action
someone takes** does not.

The unbacked population therefore concentrates in a predictable region:

- **Prohibitions rather than requirements.** A requirement has a positive
  artifact to check for; a prohibition's compliant state is that nothing
  happened, and nothing happening leaves nothing to read.
- **Rules about setup, provisioning, initialisation and migration.** The
  governed action is rare, so violations are rare, so no one has ever seen
  one — which reads as evidence the rule is holding and is actually
  evidence that nobody is looking. Rarity is the mechanism, not the
  reassurance.
- **Rules whose violation happens somewhere the gate cannot see.** An
  action taken on a machine, in an environment, or against a store whose
  output never reaches the reviewed tree is invisible to every check that
  reads the tree — [gate-sees-target](../../../../_laws.md#gate-sees-target)
  in its most literal form. The rule can be perfectly written, universally
  agreed, and enforced nowhere, because the only place it could be
  enforced is the one place nobody put a gate.

The compound case is the expensive one, and it has a signature: a
prohibition, on a rare initialising action, taken on a peripheral machine.
Every property that makes it unlikely to be violated also makes the
violation unobservable, and the two are the same property seen twice.

## Enforce at the action, not at the review

The remedy is not a better-written rule, and documenting it harder is the
reflex worth naming as a failure. If a rule has survived years as prose,
its problem was never that people had not read it.

**The check belongs in the tool that performs the governed action**, at
the moment it is performed, refusing there. A rule about initialising a
store is enforced by the initialiser; a rule about which host may hold
authority is enforced when authority is claimed, not when a reviewer might
notice. This is the same move
[blocking-by-input-determinism](./blocking-by-input-determinism.md) makes
from the other side: put the refusal where the deciding input actually is.
For an action-shaped rule that input is the invocation, and it exists
nowhere else.

Where the action genuinely cannot refuse — a third-party tool, a manual
step — the fallback is a consistency check that runs later and **fails
closed on the state the violation leaves behind**, converting an
unobservable action into an observable artifact. That is strictly worse
than refusing (the violation still happens, and the window between the
action and the next check is unbounded) and strictly better than prose.
Say which of the two a rule has; a system that has the second should not
be described as if it had the first.

## The audit

Enumerating the unbacked rules is cheap, and no tool does it, because the
thing being looked for is an absence. Walk the standing documents, and for
each rule they state, ask one question:

> If someone did this right now, what fails, and where?

Three answers, and only one of them is enforcement:

- **A named check, in a named place, refuses.** Backed. Verify it the way
  [gate-liveness](./gate-liveness.md) says — seed the violation and watch
  it go red, because "has never fired" and "cannot fire" look identical.
- **A person would notice in review.** Unbacked. Human attention is a
  sampling process with an unmeasured rate, and rules of this shape
  concentrate in actions reviewers do not see.
- **Nothing.** Unbacked and undetectable. This is the row that should be
  read as a claim about the past: it says the rule's compliance history
  is unknown, not that it is clean.

The audit's output is not a fix list. It is the honest inventory of which
standards are mechanisms and which are aspirations — the distinction this
subject opens with, applied to a team's own documents rather than to its
pipeline.

## An instrument nobody invokes is still prose

The audit's three answers imply a binary — a check exists, or it does not.
Applying it turns up a third state that reads as backed and behaves as
unbacked: **the checker was written, and nothing runs it.**

This is not the same failure as any of its neighbours, and the distinction
decides the fix. [gate-liveness](./gate-liveness.md) is a gate that runs and
checks nothing; [enforcement-binding](./enforcement-binding.md) is a gate
that runs, sees correctly, and whose verdict is not joined to the decision.
Here the checker is correct, alive when invoked, and would fail loudly on
the violation — but no hook, no pipeline step and no aggregate command names
it, so it has never run outside the session that wrote it. Every property
that makes it look like enforcement is real, and the rule it backs has
exactly the compliance signal it had as prose: none.

It is also the most likely state for a rule that someone *tried* to
mechanise, which is what makes it worth its own row. The effort of writing
the checker is what retires the rule from everybody's attention. The
standing document is updated to say the check exists — often with the exact
invocation — and the sentence is true; the reader's inference that something
runs it is the part that is false.

So the audit question has to name the caller, not the capability:

> Not "is there a check?" — **"what invokes it, on what event?"**

A rule whose answer is a command a human would have to remember to type has
the same standing as a rule whose answer is "a person would notice in
review," and for the same reason: both are enforced by attention, and
attention is a sampling process with an unmeasured rate. That answer belongs
in the unbacked column, and writing it there is the only way the checker
ever acquires a caller.

The tell in the tree is cheap: **grep the checker's own filename across the
hooks, the pipeline definitions and the task runner's scripts.** No match
means the check is documentation with an exit code. The measured instance
worth carrying is that this state is not rare and not small — one such
checker, existing and invoked by nothing, was holding a rule that had
accumulated violations across the majority of the repositories it governed,
none of them reported anywhere, and running it by hand produced the entire
backlog in one command.

## An artifact rule enforced at the edit reads as compliance

The section above says action-shaped rules go unbacked because the gate
has nowhere to read. The converse trap is quieter, because it produces a
compliance signal — a true one — for the wrong rule. A standing document
states a bound on an **artifact** (a file stays under N lines; a page is
split past N; a ledger holds at most N entries) and, beside it, a bound on
each **edit** (append at most two lines; touch at most eight files; patch
with a short cite). The edit rule is the one that gets checked, because an
edit is what a reviewer, a hook or a commit diff can see. Every edit passes.
The artifact drifts past its bound anyway, because a bound on the step is
not a bound on the sum, and nothing ever reads the sum.

The failure has a signature that distinguishes it from an ordinary unbacked
rule: **the violation is composed entirely of compliant actions.** There is
no edit to point at, no author who broke a rule, and no commit whose diff
would have been refused. A per-edit check is the wrong quantifier for a
growth invariant — it answers "was this step small?" when the rule asked
"is the whole thing still bounded?" — and its steady green is what retires
the artifact rule from everyone's attention. The prior from the section
above applies with one refinement: the violation began at the commit where
the sum first crossed the bound, and every compliant edit since has extended
it by exactly its own permitted size.

Two measured instances, from opposite ends of the scale. A machine-maintained
knowledge wiki whose schema capped each ingest at eight touched files and a
"short cite", and each page at roughly two hundred lines, ran some four
thousand compliant ingests and carried its largest page at over thirteen
times the page cap, while the lint pass that alone could have read the sum
never ran. A shared session-memory file in a connected project capped each
append at two lines and the file at two hundred: twenty-six consecutive
commits after the file crossed the line all obeyed the append cap, none
read the length, and the file sat over its bound for thirteen days.

The remedy is the one this technique already prescribes, applied to the
right quantifier: **the check reads the artifact, not the edit**, and it
runs where the artifact is produced — at the end of the tool that appends,
or as the fail-closed consistency check when appends are made by hand. It
carries the rule's own stated remedy adjacent to the red, because the
document that stated the bound usually stated what to do at it (prune the
oldest entries of one kind, split the page) and that sentence was as
unmechanised as the bound. Keep the per-edit check if it earns its place,
but never let it stand in for the artifact check: the audit question for a
rule about size is not "what refuses a large edit?" but **"what reads the
file's length, and on what event?"**

## The tier no checker can reach: a reader holding the rulebook

Everything above works with two states — a rule is mechanised, or it was
written down and never mechanised — and the audit's three answers sort
every rule into one of them. Applied to a codebase where most changes are
machine-authored, the sorting turns up a rule that belongs in neither
column: one that **no checker could express**, enforced instead by a
reviewing model that has been handed the rulebook and told that rulebook
violations are first-class findings, at the same severity as a logic bug.

This is a real enforcement tier and it deserves its own row, because
grading it as unbacked understates it and grading it as backed overstates
it by more.

### The discriminator is artifact versus intent

The tier is legitimate for exactly one population and is an excuse
everywhere else, and the line is sharp:

- **Rules about artifacts a parser can see** are mechanised, full stop.
  Import forms, file placement, a required field in a manifest, a forbidden
  call, a naming shape. If a rule can be written as a pattern over the
  tree, routing it to a reviewer instead is a choice to have an unmeasured
  sampling rate where a deterministic one was available. "The model checks
  it" is the modern form of "a person would notice in review," and the
  audit puts both in the same column.
- **Rules about intent** cannot be mechanised, and pretending otherwise
  produces a checker that is wrong in both directions. What a comment is
  *addressed to* — a future reader of the code, or the person reviewing
  this change — is not a property of its text; the same sentence is
  compliant in one file and a violation in another. Whether a test *can
  fail on a real regression* is a claim about the relationship between an
  assertion and the behaviour it purports to cover, which no pattern
  reaches: a test that asserts a constant back at itself, or that mocks the
  unit it is testing, is syntactically indistinguishable from a good one.
  Whether a change is *in scope* for what it claims to do requires reading
  the claim. For rules of this shape the honest enforcement point is a
  reader with the rulebook, and saying so is more accurate than leaving
  them in the unbacked column with a shrug.

### The cost, stated precisely

The tier buys coverage of rules that would otherwise have none. It pays
for it in the property every other tier in this subject depends on:

- **The compliance signal becomes probabilistic.** The same change reviewed
  twice can produce two different finding sets. There is no input that
  reliably makes it fire, which is this subject's own definition of a gate
  failing to be one.
- **It is not bisectable.** A checker's verdict is a function of the tree,
  so a violation can be walked back to the commit that introduced it. This
  tier's verdict is a function of the tree *and* the reviewer's context, so
  there is no history to bisect and no way to answer "when did we start
  violating this" — the question the unbacked column exists to raise.
- **It cannot be audited the way a checker can.** Seeding the violation and
  watching it go red, which
  [gate-liveness](./gate-liveness.md) prescribes for every backed rule,
  gives one sample here rather than a proof. Repeated sampling estimates a
  rate; it never establishes the guarantee a deterministic check gives for
  free.

So the row in the audit reads *enforced probabilistically, not auditable* —
not *backed*. A team that writes it as backed has quietly upgraded a
sampling process into a guarantee, which is the same error as counting a
review-only rule as enforced.

### The rulebook and the brief drift apart, silently

The tier's load-bearing precondition is that the rulebook is **a single
file the reviewer is actually given**, cited rather than restated. The
failure mode is the restatement, and it is easy to miss because both
documents stay individually true.

The measured instance: a project's rulebook enumerates four kinds of
invalid test — a test that pins a constant back at itself, one that asserts
the implementation detail just written, one that mocks the unit under test,
and one that exercises only third-party code — while the reviewer's brief,
written separately and listing examples for emphasis, names two of them.
Nothing in either document is wrong. But the emphasis is what the reviewer
weights, and the two unnamed kinds are enforced at whatever rate the model
happens to apply a rule it was given and not reminded of. Nobody edited a
rule; the two files simply moved at different times, and the tier degraded
by two rules out of four with no diff to point at.

The remedy is structural, not disciplinary: the reviewer's brief **names
the rulebook and does not paraphrase it**. Where the brief must give an
example for calibration, the example is marked as illustrative and the
enumeration lives in one place
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
applied to a rule set rather than a status enum). A brief that lists a
subset of a rulebook has forked it, and the fork is invisible from either
side.

The audit question for this tier is therefore not "does a reviewer check
it?" but:

> **What document is the reviewer given, and is the rule in that document
> or in a summary of it?**
