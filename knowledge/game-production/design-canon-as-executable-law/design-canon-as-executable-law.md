---
layer: golden-path
type: golden-path
subject: design-canon-as-executable-law
status: forged
use_when: [turning a written design bible into automated checks, a linter threshold disagrees with the design doc, deciding what a conformance check may conclude, authoring content that will be graded by a rule]
techniques:
  - canon-as-single-source-of-thresholds
  - parse-thresholds-from-prose
  - shape-check-vs-content-invariant
  - self-declared-budget-enforcement
  - archetype-aware-envelopes
  - flag-your-own-shipped-defaults
---

# Design canon as executable law

Every studio has a design bible. Almost none of them are enforced. The bible says elite
enemies pay out fifteen to twenty-five percent above a normal enemy of the same tier; a
spreadsheet says eighteen; a validation script says twenty; the shipped tuning table says
thirty-two, and nobody noticed for four months because the three sources never met. The
document was never wrong — it was never *consulted*.

The naive fix, "write a linter for the design rules", produces a second bible in a
programming language, drifting from the first at the rate the two are edited independently.
The correct fix is structurally different: **there is exactly one statement of each rule, it
is written for humans, and the checker reads its numbers out of that statement.** The prose
is the source, the check is a derivative; edit the prose and the check moves with it, and
when the check can no longer find its number it fails loudly rather than falling back to
what it remembers.

## The drift theorem

A rule written for humans and a threshold typed into a checker will diverge. Hiring more
careful people does not fix it; it is structural, on three legs. **The two artifacts have
different editors and different review cultures** — prose edited by whoever owns the
design, the threshold by whoever owns the pipeline, under code review, on a different
cadence; a change landing in prose on Tuesday and in the checker next sprint is nobody's
error. **Neither side can observe the divergence** — the document's reader believes the
number is enforced, the checker's reader believes it is the design, and no view shows both,
so the mismatch produces no symptom until content graded as passing contradicts the
document that passed it. **The failure is silent and the wrong direction is the cheap one**
— when they disagree the checker wins, because it blocks the merge, so the *unreviewed*
copy becomes operative law and the reviewed one becomes decoration. The countermeasure is
topology, not vigilance: collapse the two artifacts into one and make the derivative
relationship mechanical.

## A canon is a corpus, not a document

Stop treating the design bible as a document and start treating it as an addressable
corpus of small, individually citable rules. A document can only be read whole; a corpus
can be scoped, cited, parsed and diffed. The entry shape is worth stating exactly:

| Field | Carries | Why it is load-bearing |
| --- | --- | --- |
| **id** | a stable slug for this one rule | what a verdict, a review comment, or a failing check cites; must survive rewording of the body |
| **category** | which lane of the design it governs — economy, defence, progression, encounter, presentation | the unit of scoping: what gets shown to an author, what a checker subscribes to |
| **scope** | how far the rule reaches: the whole game, one system, one content class | prevents a local tuning decision from being read as universal law |
| **title** | one line, imperative, the rule as a human states it | what appears in a failure message |
| **body** | the rule in full prose, *including its numbers in their units* | the parseable source of every threshold derived from it |
| **refs** | pointers to the artifacts the rule governs or was derived from | makes the rule auditable backwards, and lets a change to a system find the rules that constrain it |

Three properties do the real work. The **body holds the numbers** — not a machine-readable
field duplicated beside the prose, because a duplicated number is the drift problem in
miniature, relocated inside one file. **Every rule is scoped**: an unscoped canon collapses
under its own weight around sixty rules, when everything applies to everything, authors
stop reading, and checkers subscribe to the whole corpus and produce noise. And **a rule
states its own sanctioned exceptions in its own body** — the mature form of an economy rule
is not "margin sits in this band" but "margin sits in this band *before* discounts; the
standing loyalty discount is applied after, and a post-discount margin below the band is
not a violation". Exceptions written into the rule are law; exceptions discovered later and
coded into the checker are drift wearing a helpful face. When someone asks the checker for
a special case, amend the rule body.

A corpus in the low tens of rules is a style guide. In the mid dozens it becomes a system:
enough coverage that scoping is mandatory, few enough that each rule can still be defended
by someone who wrote it.

## Two kinds of check, and the distinction is everything

A conformance run asks two categorically different questions, and the most common failure
in this discipline is answering the first and reporting it as the second. **Does the
artifact have the right shape?** — fields present, types right, enumerations valid,
identifiers matching their pattern, references resolvable. Cheap, total, binary, and nearly
worthless as evidence of design conformance: an artifact can be structurally perfect and
describe a weapon that outdamages every other weapon in the game by a factor of six. **Does
the artifact's content obey the design?** — is this number inside the band the canon
states, is this cooldown at least the stated floor, is this payout curve monotonic. That is
the expensive question, the one that requires the canon and that a shape check can never
approximate. Keep them as separate result classes with separate names, never let a green
shape result render as design conformance, and make every claim of conformance name the
rung it was proven at.

Both classes need a third outcome besides pass and fail. When the field a check reads is
absent, the honest result is **not measured**, carrying a reason that names the field it
wanted and the envelope it would have applied — that is what stops a half-authored artifact
from reading as compliant, and what makes a report a map of coverage rather than a
scoreboard. The same rule governs the whole run: a check whose input is not present
contributes nothing, not a pass, so each check declares the input facet it consumes and
does not fire when that facet is missing.

A third species sits between the two and is routinely confused with the second: the
**self-consistency check**, grading a value against a number the same artifact declares —
is the summed cost of these parts within the budget this artifact says it has, is this
ladder of detail levels strictly descending. These need no canon at all and catch a huge
fraction of real defects, because internal contradiction is what generated and hand-edited
content produce most. But a self-consistency pass is not a design pass: an artifact can be
perfectly self-consistent about being far too strong. Report the two separately or the
honest signal drowns.

## Envelopes vary by the kind of thing being graded

A single global band applied to everything is a canon that will be ignored, because it is
wrong for most of what it grades. A sustained damage-over-time effect and a crowd-control
effect are both "a status applied to a target", and one magnitude window for both is
nonsense: the first is judged on magnitude per tick against duration, the second on
duration alone — with a hard ceiling measured in seconds, a mandatory immunity window after
it expires, and a rule about what cancels it.

So the envelope is selected by the **kind** of the artifact, and the kind is declared by the
artifact, never inferred by the checker: a checker guessing "this is probably crowd
control" from a name will guess wrong on the one that matters. A declared kind that does
not match its content is itself a finding, and a useful one — mis-declared kind is how
content escapes the envelope that should have caught it. Each band states its unit and the
basis it was computed against, because a percentage without a reference case is not a
number; each band names the failure it exists to prevent, so the day someone wants to
exceed it there is a stated cost to argue against rather than a number to negotiate down;
and bands are graded against what actually shipped in comparable products, not against the
batch under review, because a group of uniformly overtuned artifacts must not normalize
each other into a pass.

Not every rule reduces to a band on a single value. Some state a *shape*: a progression cost
that "grows roughly geometrically", a detail ladder that descends, a payout monotonic in
difficulty. Grade those as shapes. A geometric curve has a near-constant consecutive ratio,
so the check is the dispersion of that ratio — a coefficient of variation under roughly
0.15 reads as geometric, where a polynomial curve sails past it with ratios that start high
and decay. Parsing the stated growth base out of the rule and comparing one sampled point
against it would pass the wrong curve at the level you sampled.

## What a finding must carry

A finding that says "value out of range" is nearly useless; the author has to reconstruct
which rule, what the allowance was, and how far off they landed. Every finding carries at
minimum the **stable id of the rule** it violated, the **name of what was measured**, the
**actual value**, the **allowed envelope rendered the way a human states it**, and a message
putting those in one sentence. Include the id, not only the title, so the finding links back
into the corpus.

Severity is derived, not assigned: it scales with the magnitude of the exceedance — past the
tolerance is a warning, past roughly twice the tolerance is critical — because that ordering
is what lets a large run be triaged without reading every line, and a fixed severity per
rule loses the distinction between one point over the line and a value in a different
universe. The blocking policy is stated separately from severity: which severities fail a
gate is a decision the gate owner makes once, in the open, not something each check decides.

## The rule must be visible where the number is authored

The corollary of "the law and the check share one source" is an authoring-time obligation:
**whoever authors a number can see the rule it will be graded by** — with double force when
the author is a model. A generation step asked for a payout figure with no canon in its
context produces a plausible figure, and a plausible figure fails a band about forty percent
of the time. The same step given the governing rules in its prompt lands inside the band,
because the band was part of the specification rather than a post-hoc filter.

Scoping makes this affordable. A step that only arranges structure needs no canon; a step
authoring content graded by a content invariant gets the rules that will grade it, selected
by category and by the class of artifact being authored. That mapping is itself a small
piece of canon, written down explicitly rather than assembled ad hoc at each call site, and
shared by every surface that assembles a prompt — an interactive authoring tool and a
headless batch runner that each build their own scope will grade identically and author
differently. Make the lookup fail toward *more* canon: an artifact class the mapping does
not know gets the whole corpus, not an empty slice. The cost of the safe direction is
context; the cost of the unsafe one is a new content type authored with no rules in front of
it and graded by rules it never saw. For steps authoring the numbers the canon most
constrains, hand over the whole corpus rather than a filtered slice — filtering is an
optimization and it can be wrong, and a rule silently out of scope is indistinguishable, in
the output, from a rule that does not exist.

## Point the linter at your own shipped defaults first

The practice that separates a conformance system anyone trusts from one that is theatre:
**the first thing you run a new conformance check against is your own project's shipped
default configuration — and you publish what it finds, including the failures.** Nobody
believes a linter grades anything real until it has condemned something its authors care
about, and a checker written only against other people's content passes on its own material
by construction — its authors calibrated the thresholds until the material in front of them
went green. That calibration is invisible, and it is the ordinary way these systems become
useless: the band gets widened, once, quietly, to admit the case in the room.

When the default economy configuration you ship violates the balance law you wrote, there
are exactly three honest moves, and each improves the system:

1. **Fix the default.** The best outcome, and the one the exercise was for.
2. **Amend the canon**, on the record, with the reasoning for why the band was wrong — a
   design decision made deliberately instead of a threshold widened silently.
3. **Keep both and document the violation in the header of the checker itself**, as a known
   deviation with a stated reason. A stated, located, dated deviation is a debt with a name;
   a passing test over a widened band is a lie with none.

The fourth move — adjusting the threshold until the default passes — is always available,
always cheap, and the end of the system's usefulness. The guard against it is that the
deviation is written down where a maintainer cannot avoid reading it, and that the party who
produced the artifact is not the party whose claim of conformance counts.

## Failure modes of the naive reading

- **The parallel bible.** A checker that restates the design in code. Diverges within one
  quarter; the code copy becomes operative law; the document becomes onboarding material
  nobody trusts.
- **The silent fallback.** A parser that cannot find its number and quietly uses a default —
  worse than a hardcoded threshold, because it *looks* derived. A parse failure must throw
  at load, loudly, naming the rule it could not read. A canon edit that breaks the parse is
  a build break, and that is the intended cost of the coupling.
- **Two parsers over one source.** The second team that needs a threshold writes its own
  extraction against the same rule body with its own pattern. The source is single and the
  *reading* of it is not, so the two diverge in robustness and eventually in result — one
  tolerates the unit symbol, the other does not. One quantity, one authority: the parse
  layer is a module everything else imports, not a technique everyone repeats.
- **Shape results reported as conformance.** The dashboard is green, every field is present,
  and no number has been compared to any rule.
- **One envelope for every kind.** Bands wide enough to admit every archetype admit
  everything, and a check that never fires is indistinguishable from no check.
- **Inferred kind.** The checker guesses what it is grading, and guesses generously.
- **Unmeasured rendered as passing.** A rule with no check must render as *not enforced*,
  not as a green cell. A canon with sixty rules and eleven checks is a good system honestly
  described, and a bad one described dishonestly.
- **Grading on the batch.** Comparing an artifact to its siblings rather than to the stated
  band. A uniformly overtuned batch passes itself.
- **A canon nobody can cite.** Rules without stable identifiers cannot be referenced by a
  failure message, so failures say "value out of range" and the author goes hunting for
  which rule and why.

## The order of adoption

Each step is cheap only because the previous one landed.

1. **Make the corpus addressable.** Ids, categories, scopes, bodies with their numbers in
   units. No checks yet. This alone stops the "which document is current" problem.
2. **Write one check that parses its threshold from a body.** One. Prove the pipe works,
   prove the parse failure is loud, and prove a canon edit moves the check.
3. **Separate shape from content in the result model** before adding more checks, or you
   will spend the rest of the project untangling one verdict class into two.
4. **Add self-consistency laws next** — cheap, no canon needed, findings almost always real.
5. **Then archetype envelopes**, one archetype at a time, each with a declared kind.
6. **Run the whole thing against your own shipped defaults, and publish the findings.** This
   is where the system either earns trust or is revealed as calibrated to pass.
7. **Wire the canon into authoring** — the scoped rules in front of whoever writes the
   number — last, because until the checks exist there is nothing to be graded by.
