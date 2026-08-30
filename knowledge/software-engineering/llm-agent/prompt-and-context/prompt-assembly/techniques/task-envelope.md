---
layer: technique
type: technique
subject: prompt-assembly
technique: task-envelope
status: forged
laws: [gate-sees-target, silent-state-is-ungoverned]
shared_with: []
use_when: [writing the task layer for a delegated or dispatched call, a prompt opens with a role or expertise claim, deciding what the first lines of a task prompt should buy, a worker finished but the result does not match what was asked, a brief lists the parts to build, an unattended session must decide on its own when it is done]
---

# Task envelope

The task layer is the one layer of the prompt every call rewrites, and the
one whose opening lines are written by habit. The habit is role priming: a
sentence asserting expertise ("an experienced specialist in X") followed by
an urgency cue, on the theory that a model told it is expert performs as
one. The measured record says it does not. A controlled comparison of 162
roles against 2,410 factual questions across four model families
found no accuracy gain over asking directly, with per-persona effects
described as largely random; the best persona for a given question did
exist, but selecting it in advance did no better than chance. Those lines
cost tokens on every call and buy nothing predictable.

The words are not wasted because the opening is unimportant — it is the
position of primacy — but because they carry no *decision the model could
not make alone*. Spend them on the three things it cannot derive:

## The three parts that earn the opening

1. **Locate** — where the material the task needs actually is. A pointer
   to the folder, the record, the document, the section. This is the
   task-layer form of [context-reachability](./context-reachability.md):
   a pointer costs one line and compresses the search the model would
   otherwise spend its first tool calls on; and unlike inlined content it
   cannot go stale in the prompt, because the model reads the live
   target.
2. **Done** — the shape of the finished artifact. Not "a good proposal"
   but "one page, three pain points, the price at the bottom". A done
   criterion is what lets an unattended session decide to stop, and what
   lets the dispatcher's review be a comparison rather than an
   impression. A task without one runs until the model's own sense of
   completeness fires — which is late, or early, and never the same
   twice. The strongest form is **machine-checkable**: rephrase the task
   as a finish line the model can verify without you — "fix the bug"
   becomes "write a test that reproduces it, then make it pass";
   "add validation" becomes "write tests for the invalid inputs, then
   make them pass"; "refactor X" becomes "tests pass before and after".
   Models loop well against criteria they can check themselves; phrased
   this way, the iteration moves inside the session and the operator is
   needed only at the ends. And the cost of a weak criterion is not a
   vague result — it is *interruptions*: every clarifying question that
   pulls the operator back mid-run is a criterion that was not specified
   up front.
3. **Check** — the verification the model performs before it reports.
   "Before finishing, verify every figure against the notes and flag any
   you cannot back." The check is named explicitly because a model does
   not audit its own output unprompted — and the 2026 trajectory corpora
   price the omission: roughly a quarter of failed agent runs end by
   *fabricating success*, self-reporting misstates the outcome in ~23% of
   misaligned sessions, and only ~3% of problems are corrected by the
   agent unprompted. The check is also where the task states its
   *stakes*: what kind of error would be worst.

The three together are roughly the same length as the priming they
replace. The difference is that each sentence changes what the model does.

## Decision rules

- **When a task prompt opens with an expertise claim, replace it with a
  locate pointer.** The claim buys nothing measured; the pointer buys the
  first three tool calls. If there is nowhere to point, the task probably
  lacks its inputs, which is a different problem and a louder one.
- **Keep the identity words that change behaviour, not competence.** A
  role line is not always priming: "you are unattended, the human is
  away", "you were dispatched by the orchestrator at the user's
  approval", "you are the review authority of last resort" are facts
  about permissions, escalation and autonomy that the model cannot
  infer and will act on. The test is whether removing the line changes
  what the model is *allowed* or *expected* to do — if it only changes
  how the model is asked to *feel* about the work, it goes.
- **The identity layer is a product decision, not a task lever.** This
  subject's identity layer (who is speaking, in what voice) is authored
  once and rarely changed; nothing here argues against it. The finding is
  about per-task priming stacked on top — a competence claim re-asserted
  in the task layer of every call, which is where the tokens are spent
  without effect.
- **Write the done criterion as an artifact, and the check as a read.**
  "Verify your answer" is a check in name only; "re-read each file you
  changed and confirm it does what the request asks and nothing it did
  not" is one the model can perform. Per
  [gate-sees-target](../../../../_laws.md#gate-sees-target), a self-check
  that inspects memory of the work instead of the work is a gate that
  sees nothing — it passes exactly when it should fail. Tell the model to
  open the artifact.
- **State the wanted behaviour, not the forbidden one.** "Write it as
  flowing paragraphs" outperforms "do not use bullet points", because a
  negation names the thing to avoid and leaves the target unspecified;
  the model then has to guess what was wanted, and the guess is
  sometimes the thing named. A prohibition earns its line only when the
  forbidden action is *plausible and costly* — pushing to a shared
  branch, deleting, spending money — and even then it sits beside the
  positive instruction, not in place of it.

## An enumeration is a done criterion, and it is the wrong one

The Done rule above assumes the failure is *absence* — no criterion, so the
run stops when the model's own sense of completeness fires. There is a
commoner failure, and it is worse because it looks like success: the brief
supplies a criterion by accident, and the model satisfies that one.

A brief that lists the parts to build — five tabs, four endpoints, three
report sections — is an enumeration, and an enumeration is machine-checkable.
The model can verify it without help and will: *did I produce a thing for
each named item?* The check passes when every named part exists, and
existence is the one property a generator can always deliver. So the run
terminates confidently, on time, having built every surface in the list with
nothing behind any of them — dead links, filler rows, a settings page that
saves to nowhere. This is not the late-or-early failure of a missing
criterion. It fires exactly when it should, on the wrong axis.

Read it through [gate-sees-target](../../../../_laws.md#gate-sees-target):
a self-check that reads the brief's list is a gate that sees the *shape* of
the work rather than the work. It passes precisely in the case that should
fail it, because the parts existing is what it was built to confirm.

**Probe the leaf, not the shape.** The cheapest falsification of an
enumerated build is one traversal — follow a single item from the surface it
appears on to the data it claims to show, and back. A survey of the parts
confirms the thing the model already checked; one leaf traversal tests the
thing it did not. A build whose every link is dead is falsified by clicking
one, in seconds, before any of the repair budget is committed.

**In the brief, name a path through rather than a set of parts.** "A
dashboard with news, mentions, reminders, audience and tasks tabs"
enumerates, and a stub satisfies it. "Opening the news tab shows items
fetched within the last hour, and clicking one opens the source it came
from" traverses, and a stub cannot. The traversal criterion is not longer
than the list; it is the same brief written along the axis the enumeration
left free. One traversal per surface family is enough — the point is to
name a criterion whose satisfaction requires the parts to be connected, not
to specify the whole product.

The cost of getting this wrong is paid in repair rather than in rework, and
it is not small. One first-party report of a five-surface enumerated brief:
a complete-looking shell in about fifteen minutes, then several further
sessions of defect-driven correction, the longest single run over two and a
half hours. That is one account of one build — an existence proof for the
ratio, not a rate — but the shape of it is the point. The fifteen minutes
bought a demonstration; the criterion that would have made those minutes
buy a working leaf was one sentence.

## When done is not knowable, the envelope inverts

Everything above assumes the done criterion exists before the work starts —
true for a bug, a translation, a refactor, and for most dispatched work. It
is false for discovery: the task whose point is to find out what the
artifact should be. There, no one can state done in advance, because the
criterion is learned by using something that does not yet exist — the
oldest finding of iterative development, and it survives the change of
author. Faking a done criterion for a discovery task produces confident
convergence on a guess.

The rule for that case is the envelope inverted, not abandoned:

- **State the problem and the hard constraints; leave the shape open.** A
  discovery prompt earns its vagueness — the model's proposal is the point,
  and a path prescribed up front spends the operator's guess where the
  model's search would have done better. Prescribing the route is a
  separate defect from prescribing the finish line, and only the second
  ever belongs in a task layer: "single binary, no dependencies,
  pixel-identical output" constrains the destination and costs nothing;
  "first parse the config, then..." constrains the search.
- **The deliverable of a discovery task is the done criterion, not the
  artifact.** Manifest something cheap, interact with it, and harvest what
  the interaction taught — that harvest is the locate/done/check envelope
  for the *next* dispatch. A discovery loop that never graduates into
  enveloped tasks is not iterating, it is wandering.
- **Steer by differential choice, not by specification.** Between rounds,
  picking among two or three manifested variants transmits more intent per
  operator-minute than prose amendments to the brief; the choice is a
  measurement of what the operator wants that the operator could not have
  written down.

The discriminating question, asked before writing the task layer: *could I
recognize done without seeing a candidate?* Yes — write the three-part
envelope above, as tightly as the answer allows. No — write the problem,
the constraints that are genuinely fixed, and plan for the artifact to be
disposable.

## What this does not settle

The study measured factual accuracy on question answering. Whether a
persona shifts *style* — register, verbosity, vocabulary — is a separate
question, and the answer is usually yes; a house voice belongs in the
identity layer, deliberately. And "no gain on average" is not "no gain
ever": a domain-matched persona sometimes helped and sometimes hurt in
the same study. The rule is not that priming is harmful; it is that it is
*unpredictable*, and unpredictable spend in the primacy position loses to
three sentences that are not.

## Specificity is a dial, and it has a floor

Everything above describes what a task envelope should *contain*. It leaves
the amount unstated, and the tacit answer — more is better — is wrong in a
way that only shows up at the bottom of the capability range.

Treat specificity as a graded dimension with at least three rungs, because
it is measurable that way:

- **goal-shaped** — the outcome named, nothing located. "Fix the alias."
- **file-named** — the outcome plus exact paths for everything to be read
  or written.
- **plan-shaped** — file-named, plus a verbatim anchor for each edit, one
  action per numbered step, a machine-checkable postcondition, and an
  explicit list of what may be touched.

Plan-shaped is the Locate/Done/Check envelope pushed to its limit: it
converts an open-ended search into a lookup, which is the operation a weaker
executor performs most reliably. The rungs are worth naming separately
because **the returns are not evenly distributed across them.**

### Locating is categorical; the rest are refinements

The first rung does something the others do not. A task that names no path
leaves the executor to *find* its target, and a search that fails produces
no partial credit — it produces a discovery loop that consumes the budget
and ends with nothing changed. Every later refinement improves a run that
was already going to reach the right file.

The practical form: **grade a task on locating first, and treat its absence
as disqualifying rather than as one deficiency among six.** A prompt with
exact paths but a vague stopping condition is a weak plan; a prompt with a
perfect stopping condition and no path is not a plan at all. Anchors,
step-splitting and scope bounds each remove one degree of freedom; the path
removes the one that has no floor.

Each refinement is worth stating with the failure it prevents, because that
is what makes it checkable rather than stylistic — a verbatim anchor
prevents a misplaced edit, one-action steps prevent tool-choice thrashing,
a machine-checkable postcondition prevents both stopping early and
re-verifying forever, an explicit write set prevents helpful edits to
adjacent files, and a closed vocabulary prevents a vague verb from
reintroducing the very decision the other rules removed. A rule whose
failure mode cannot be named is decoration.

### Below a capability floor, structure competes with capacity

The dial's returns are monotonic only above a threshold, and the exception
is the part worth carrying.

Across a controlled grid — several tasks, three rungs, four models, repeated
trials, graded on deterministic postconditions — the pass rate rose with
specificity for the three larger models and **fell** from file-named to
plan-shaped for the smallest, in two separate tasks rather than one noisy
cell. The reading the data supports: a plan-shaped prompt is longer and more
structured than a file-named one, and the added anchor, verification and
scope clauses are themselves instruction-following load. Above some
capacity that load is absorbed and converted; below it, the structure
competes with the work.

So the routing consequence is not "prefer the most specific phrasing
available." It is that **each executor has a specificity optimum, and for
the weakest tier that optimum is not the top rung** — a fact that belongs
beside the capability thresholds in
[capability-floors](../../../orchestration/model-routing/techniques/capability-floors.md),
and one that a fleet standardising on a single house prompt style will never
observe, because it never varies the rung.

Two cautions travel with that result, and both are the general shape rather
than this measurement's detail. Grade against deterministic postconditions
rather than a judge, or the specificity of the prompt leaks into the
scoring. And read a per-model curve before setting a house style: the
aggregate hid that one model needed the top rung to solve a task at all
while another cleared it at every rung.

### Task shape can be linted before dispatch

Because every rung above is a property of the prompt's text, compliance is
checkable deterministically — no model call — and the check is cheap enough
to run on every dispatched brief. Locating is a path-shaped token; anchors
are quoted fragments or an explicit append clause; steps are an ordered
list; a postcondition is a containment or exit-code claim; a closed
vocabulary is a ban list.

Two design rules keep such a linter from being worse than nothing:

- **Return the rung, not a pass/fail.** The useful output is which rung the
  prompt reached, so a dispatcher can route rather than merely refuse.
- **Bias to warn, and anchor every pattern.** The linter reads text, so its
  errors are false positives, and a false positive here **blocks a correct
  task** — the expensive direction. The instructive failure is a
  vocabulary ban list matched as a substring: a banned vague word appearing
  inside an ordinary filename downgraded perfectly well-formed prompts and
  refused to start the run. Word-boundary every pattern, and remember that
  a rule about vague language will be run against text that legitimately
  contains the file names it governs.
