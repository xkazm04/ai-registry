---
layer: technique
type: technique
subject: quality-gates
technique: gate-liveness
status: forged
laws: [failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [deciding whether a clean exit means anything was checked, seeding a known violation to watch a new gate go red, a gate that has been green for a year]
---

# Gate liveness

The most expensive state a gate can occupy is not red, and not honestly
absent — it is **false green**: exiting clean because it checked nothing.
A dead gate is worse than no gate, because no gate leaves the team
appropriately nervous, while a dead one radiates confidence. Liveness is
the set of properties that make a gate's green mean what everyone assumes
it means, and none of them come free.

## Assert the instrument before the result

Every checker has an instrument — the file walk, the rule load, the parser,
the external tool — and a result. The standing rule
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)):
**instrument failures get their own exit path, distinct from both pass and
fail.** Concretely, a checker treats as fatal — not as zero findings:

- a walked population of zero, or wildly below the expected floor
  ("checked 0 files" is the signature of a moved directory or a broken
  glob, never of a clean codebase);
- a configuration or rule set that failed to load, leaving the checker
  running with an empty standard;
- a required external tool that is absent — the correct output is a loud
  "cannot check," visibly different from "checked, clean." A gate that
  skips silently when its scanner is not installed is reporting its own
  absence in the voice of success;
- inputs it could not parse, when the unparseable population is the very
  thing being judged.

The vocabulary matters: three outcomes (pass / fail / could-not-run), three
distinguishable outputs, ideally three exit codes. Any check that folds
could-not-run into pass has pre-committed to the worst failure mode.

### Reporting could-not-run and routing it are separate decisions

The sentence above fuses two things that come apart, and the seam is worth
opening because a checker that respects the three-outcome vocabulary can still
route could-not-run to the *pass* side and be right to.

What decides it is **what this gate's green authorizes.** A green that
authorizes shipping — merging, releasing, promoting, accepting a claim — is a
statement that a class of defect is absent, and a could-not-run routed to pass
is that statement made with no evidence. That is the case the rule above is
written for and it is the common one.

A different population exists: predicates whose green authorizes **skipping
optional work** rather than asserting correctness. *Is the installed helper
already new enough, so we can skip installing it.* *Is the cached artifact still
valid, so we can skip rebuilding it.* *Has this been checked recently enough, so
we can skip re-checking.* The cost matrix is inverted for these. A false green
means the work was skipped when it need not have been — the system continues
with the state it already had, which is the state it would have had if the
optimization did not exist. A false red means the expensive work runs
unconditionally, on every invocation, forever, which is not a safe default but a
permanent tax that the team removes by deleting the check.

For that population, could-not-run routes to pass, and three obligations come
with the routing:

- **It is still reported.** The three outputs remain three. A checker that
  cannot read the installed version says so, names which lookup failed, and then
  proceeds — the operator can see it, and
  [absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) is satisfied by
  the saying, not by the refusing.
- **The blast radius is written down.** State what a false green actually costs
  here, in the checker or beside it. If the answer is anything other than
  "redundant work was skipped", the predicate is not in this population and the
  ordinary rule applies.
- **It is not on the ladder.** A skip-authorizing predicate is not a gate in
  this subject's sense and does not appear in gate inventories, coverage counts
  or the ladder ([gate-laddering](./gate-laddering.md)). Counting it there is
  how a fleet reports N gates and holds N−3.

The two shapes coexist in one codebase and can look identical. The discriminating
question is one sentence, and it is about consequences rather than mechanism:

> **If this check is wrong in the green direction, does a defect escape, or does
> some work get skipped?**

Defect escapes: could-not-run is a fail. Work gets skipped: could-not-run is a
pass, reported, with its cost written down.

A useful corroboration is that mature tools apply *both* rules, in opposite
directions, within one process — refusing outright when a document declares it
needs a newer reader (a defect would escape: the tool would misinterpret a
document it does not understand), and proceeding when it cannot determine an
installed dependency's version (only redundant work is at stake). The asymmetry
is deliberate and it is the discriminator above, made twice.

## Assert the oracle, not only the instrument

The list above audits one population — the targets the checker walked. A
**score-shaped** gate has two: the targets, and the *oracle* that judges
them — the test set a mutation run executes, the suite a coverage report
collects from, the fixtures a conformance check replays. The second
population has a default scope of its own, and it is silently narrower than
the set of tests that actually protect the target whenever those tests live
somewhere the default does not look: in another package of the same
workspace, in an end-to-end suite under a different runner, or in a process
the instrumented one spawned. Every instrument assertion passes — files
walked, rules loaded, tool present, code as expected — and the number is
wrong in the *deficient* direction: a component whose real protection is a
workspace-level integration suite reports a single-digit mutation score
under package-scoped execution, and every mutant that suite would have
caught is filed as an escape. Nothing the checker printed was false. Its
oracle was.

Two rules, both cheap:

- **Declare the oracle's population beside the target's**, in the baseline's
  predicate ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
  which tests, from which units, under which runner. A score whose predicate
  names only what was judged and not what judged it is not comparable to the
  same score next week, and it cannot be reasoned about when it surprises.
  What a spawned process executes is *exercised but unmeasured*, and a
  report that can say so is worth more than one that reads it as zero.
- **A surprising number is tested against the smallest controlled
  experiment before it is believed.** The first hypothesis for a score that
  is implausibly low over a target known to be exercised is "the oracle was
  scoped," not "the target is untested" — the deficiency-direction twin of
  [excess-indicts-the-instrument](./excess-indicts-the-instrument.md). The
  experiment is one target under both scopes: the same component, its tests
  run package-scoped and then workspace-scoped, and the delta read directly.
  Twenty-one of twenty-one escaped mutants caught under the wider scope, in
  fourteen minutes, is the reading that turned a "6% tested" verdict into a
  configuration line — and the line then belongs in the committed config,
  with the experiment cited beside it, so the next reader does not pay for
  the same doubt.

The founding measurement is again where this costs the most, for the same
reason the excess case does: a score frozen as a baseline under a narrow
oracle enforces a floor made of a scoping error, and the ratchet's contract
is to never question it again.

## Portability: a gate must run where it claims to run

A gate that works only on its author's machine gates only its author. The
classic killers:

- **Path assumptions** — resolving the project root from the current
  working directory instead of from the checker's own location, so the
  check walks an empty tree when invoked from anywhere else;
- **Tool presence** — depending on a binary that one machine happens to
  have on its path;
- **Platform drift** — path separators, line endings, case sensitivity,
  shell dialects.

The test is not code review; it is running the gate from every context
that will invoke it — each rung, each platform, a fresh clone. And note
the interaction with instrument assertion: a *non-portable* checker
without instrument assertions is precisely how false green is
manufactured at scale — on the foreign machine it finds zero files and
reports success. The two properties back each other up; a portability bug
under an instrument assertion is a loud error, under none it is a
permanent silent pass.

### Portability bugs have a direction, and one direction is invisible

Not all platform drift costs the same. What matters is **which side is more
permissive**. When the strict platform is the one the author works on, the
gate fails in front of the person who can fix it — annoying, self-correcting.
When the *permissive* platform is the author's, the gate passes locally and
fails only where nobody is watching, and the author's own run becomes evidence
of nothing.

Case-insensitive name resolution is the everyday instance: a reference whose
capitalisation does not match the stored name resolves on a permissive
filesystem and fails on a strict one. If integration runs on the strict side —
as it usually does — a developer can run the gate, watch it pass, and ship a
reference that cannot resolve anywhere else. The gate was not weak; it was
answering a different question than the one it appeared to answer.

The fix is to make the check mean the same thing everywhere rather than to
remember the difference: resolve against what the store actually holds, not
against what the platform is willing to match. A gate that consults the
authoritative listing is portable by construction, and it can also say
*mismatch* rather than *absent* — which matters, because "it is not there"
sends someone hunting for something deleted when the thing is present under
another name, and on their own machine the gate will look like it lied.

## Chain ordering: one broken step can blind the rest

Gate suites commonly run as an abort-on-first-failure chain. Two
consequences deserve design attention:

- **A step that cannot run somewhere aborts everything after it, there.**
  If step three of nine has a portability bug, machines where it breaks
  never execute steps four through nine — and the failure message points
  at the broken step, not at the six checks that silently never ran. Order
  chains so environment-fragile steps run late, or better, make each step
  liveness-clean before it enters the chain; and when diagnosing "the
  suite fails on machine X," always ask what the abort *prevented* from
  running.
- **Abort-on-first hides breadth.** For feedback rungs, prefer
  run-everything-report-all so one finding does not mask five; reserve
  abort-on-first for cases where later steps are meaningless after an
  earlier failure.

## The invocation channel can swallow the verdict

A checker's exit code only matters if the thing invoking it reads it.
Between a healthy checker and an obedient pipeline sit invocation layers
that routinely eat the verdict:

- **Pipes.** Feeding a checker's output through a pager or filter replaces
  the observed exit status with the last command's — a red run pushed
  through a pipe has been watched turning green this way, once is enough.
  Run gates directly, or under strict pipe-failure semantics.
- **Wrappers and task runners** that catch the child's failure, print it,
  and exit clean — turning refusal into narration.
- **Announced skips.** A gate whose dependency is absent and says so
  loudly, then exits clean, is honest output and zero enforcement. The
  pattern is defensible exactly when a binding upstream backstop runs the
  same check unconditionally; without the backstop, the control is opt-in
  on every machine that never installed the tool, and the announcement is
  the gate's obituary read aloud at each commit.

## Prove it red: the seeded-failure test

A gate's operation is verified the same way any code is — by observing it
fail on input built to fail:

- **At birth:** before a new gate is trusted, feed it a known violation
  and watch it go red through the *real* invocation path — the actual hook,
  the actual pipeline step — not just the checker run by hand. This
  catches the wiring class of death: checker fine, trigger never fires,
  every result it ever reported was a report nobody requested
  ([gate-sees-target](../../../../_laws.md#gate-sees-target) applied to the
  trigger: the gate must see the *events* it gates, not just the files).
- **Continuously, where stakes justify it:** keep known-bad fixtures in
  the gate's own test suite. And treat fixture quality as load-bearing —
  a rule's test fixtures that never contain the pattern the rule exists
  to catch certify nothing, while looking exactly like coverage.
- **On any dispute:** when someone says "but the gate passed," the first
  diagnostic is a seeded failure, because "the gate has never fired" and
  "the gate cannot fire" are indistinguishable from the outside.

A useful standing metric: **time since last red**, per gate. A gate that
has been green for a year is either guarding an extinct defect class
(candidate for retirement), or dead (candidate for a seeded-failure probe).
Green forever is not a trophy; it is a question.

## Liveness of the trigger, not just the checker

The checker and its trigger fail independently. Hooks can be uninstalled;
conditional pipeline steps can have conditions that never match; a
transcript- or event-walking trigger can terminate early on a malformed
assumption and observe nothing while the checker behind it stands ready
and idle. Liveness auditing therefore covers the full path: does the
trigger fire on real events, does it hand the checker the real target, and
does the checker's verdict reach an exit code someone obeys. Any link in
that chain can be dead while every other link is healthy — and the
observable, in every case, is green.
