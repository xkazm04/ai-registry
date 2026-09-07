# Validation - how a finding earns its place

Loaded at Phase 5. Three protocols, each answering a different weakness that two runs
exposed.

| weakness | protocol | what it replaces |
|---|---|---|
| a source states a rule and never says what goes wrong | **derivation**, below | discarding the rule, or importing it as a platitude |
| a new recipe is the most expensive artifact and nothing downstream catches it | **simulation** | one evaluator's confidence rating |
| an enrichment might be padding and the swap test is a proxy for that, not a measurement | **the A/B** | the swap test alone |

The swap test stays. It is cheap, it runs on every finding, and it catches the obvious
template. These protocols run on the findings that survive it.

> **Where this came from, and it is worth the embarrassment.** spellbook's `skill-creator`
> states the rule outright: spawn the with-artifact and baseline runs in the same turn, and
> an assertion that passes with or without the artifact is non-discriminating. We read that,
> agreed with it, and folded it into an enrichment for a recipe about auditing somebody
> else's skill library. We did not apply it to ourselves. Two runs shipped 35 enrichments
> on a swap test and an opinion.

---

## 1. Derivation - supplying the layer the source omitted

**The problem.** 22 of 45 skills in one sweep contained not a single sentence stating a
failure mode. The class was named the catalogue: it tells you what to produce and never
what to distrust. Discarding all of it wastes real signal, because **somebody bothered to
write the rule down**, and that is evidence about what the field considers load-bearing
even when the reasoning is absent.

**So the source supplies the inventory and we supply the reasoning.** That is a legitimate
division of labour and an illegitimate one to hide.

### The three-part bar

A stated rule with no failure mode is promoted to a candidate only if you can write all
three. Any one missing and it is a discard.

1. **What goes wrong if the opposite is done**, concretely, in terms of an outcome somebody
   would notice. Not "it is bad practice".
2. **An observable violation.** Describe a case where you could point at the work and say
   this broke the rule. If you cannot construct one, the rule is too abstract to be craft.
3. **Why a competent practitioner would plausibly do the wrong thing.** This is the
   platitude filter and it is the one that does the work. "Do not write bugs" fails here:
   nobody sets out to. A rule survives only where the wrong move is attractive, cheaper,
   or the obvious reading.

Part 3 is also what makes the finding *ours* rather than the source's, because it is an
argument the source did not make.

### Provenance is not optional here

A derived failure mode is our claim wearing the source's inventory. The recipe's
`provenance.source_note` must say so, in words a later reader cannot mistake:

> the rule is stated in <source>; the failure mode and the reasoning for it are derived
> here and are not the source's

Never write a derived judgment as though the source argued it. A future re-assay, or a
disagreement, has to be able to tell which half came from where.

### The volume guard

A catalogue has hundreds of stated rules and this protocol can promote most of them. It
must not. Derive only where **the corpus has a recipe that would carry the result**, or
where the rules cluster into a kind of work we do not hold. A derived finding with no
home is a lead at best, and usually a discard.

---

## 2. Simulation - a new recipe is walked before it is written

**The problem.** A new recipe is the most expensive artifact this skill produces and the
only one nothing downstream catches. Two runs authored six of them on an evaluator's
confidence rating. The operator has already declined one on exactly that ground, and the
rule inferred in `taste.md` is that a new recipe needs high confidence.

**Simulation is how confidence gets earned instead of asserted.** It runs BEFORE the
decision screen, so what reaches the operator is a proposal that has been walked, and the
walk's failures are reported with it.

### The walk

Take two or three concrete scenarios from the recipe's own draft `use_cases` and run the
recipe against each **on paper**, in order, as a persona holding it would:

1. **Does the input exist?** Name where each piece of the declared `input` actually comes
   from in this scenario. An input that has no source is the most common way a proposed
   recipe is unrunnable, and it is invisible in the abstract.
2. **Do the activities reach the output?** Walk them in order. If step 4 needs something
   no earlier step produced, the activity list is wrong, not merely thin.
3. **Does each outcome discriminate?** For each `success_criteria` entry, construct a case
   that VIOLATES it. A criterion with no constructible violation is decoration. This is
   the same violability test as part 2 of derivation and it fails proposals often.
4. **Is there a scenario where the recipe as written gives the WRONG answer?** Look for it
   deliberately. This is the one that matters and the one a confident author skips.

### What the walk produces

A short block that travels with the proposal to the decision screen:

```
simulation: 3 scenarios walked
  scenario 2 exposed: `input` assumes access to install history, which the second
    use case does not have. Narrowed the input and added a personalization need.
  no scenario produced a wrong answer.
  outcome 2 criterion 3 had no constructible violation. Rewritten.
```

**A proposal that survives the walk unchanged is suspicious, not strong.** Both new
recipes that were walked informally in run 2 were narrowed by it. If nothing changed,
say so and say what you looked for, so the operator can see whether the walk was real.

---

## 3. The A/B - an enrichment must change what the work does

**The problem.** The swap test asks whether a sentence could move to another recipe. That
catches the template. It does not catch the enrichment that is unique to this recipe and
still changes nothing, because the recipe already reaches the same answer without it.

**The A/B measures that directly.** It is the only protocol here that produces evidence
rather than an argument.

### The fixture

One concrete scenario the recipe would face, constructed so a recipe WITHOUT the
enrichment plausibly gets it wrong. Fixtures live in the vault at
`Assay/fixtures/<recipe-slug>.md` and accumulate: run 3 reuses run 2's fixtures for the
same recipe, which is what makes the second A/B against a recipe nearly free.

> **Why the vault and not the lane.** A fixture is the assay's measuring instrument, not
> the recipe's craft, and no consumer of a recipe needs it. The lane's file set is a
> contract with a gate behind it and is not mine to extend unilaterally. Promoting
> fixtures into `recipes/<slug>/fixtures/` is a live option and an operator decision.

A fixture is prose, not data. It states the situation, the material available, and
nothing about what the right answer is.

### The protocol, and every step of it exists to stop a rubber stamp

1. **Write the discriminating question first**, before either run, and **do not quote the
   enrichment's wording in it.** If the question reuses the sentence's vocabulary, the
   enriched arm matches on words rather than on behaviour and the A/B confirms itself.

   **One claim per question.** A question with two halves is answered on the half both
   arms satisfy, and the half that actually separates them goes unmeasured. This happened
   on the protocol's first run: a question asked both whether an output made an
   unsupported claim and whether it classified the remainder, both arms passed the first,
   the comparator answered on it, and the classification difference, which was the whole
   point, was never scored. An enrichment carrying two claims needs two questions and two
   comparisons, or it needs splitting into two enrichments.
2. **Two judges, blind.** Judge A gets the recipe as it stands. Judge B gets the recipe
   with the enrichment. **Neither is told an enrichment exists, that there is another arm,
   or what is being tested.** Each is asked only to do what the recipe says, against the
   fixture, and produce the recipe's declared output.
3. **A third agent compares** the two outputs against the discriminating question, without
   being told which arm is which. Fix which output is shown first **before reading any
   judge output**, and record the key, so position cannot be chosen after the fact.

4. **One recipe per judge context, and NEVER two arms of the same recipe.** Batching is
   tempting because judges are the expensive part, and it is safe only across *different*
   recipes. The first run of this protocol batched six tests to one judge, two of which
   were the same recipe with different sentences removed. The judge saw one copy carrying
   the criterion and one without it, and the vocabulary leaked into the arm that was
   supposed to lack it: the deprived arm produced the enrichment's exact three-part
   scheme. Both those tests were void and had to be re-run in isolation. **If two findings
   land on one recipe, their A/Bs cannot share a judge.**

### The four outcomes, and three of them are not a pass

| A (base) | B (enriched) | verdict | what to do |
|---|---|---|---|
| no | yes | **CONFIRMED** | land it |
| yes | yes | **NON-DISCRIMINATING** | the recipe already does this. Drop, or narrow to the part the base missed |
| no | no | **INEFFECTIVE** | the sentence does not change behaviour. Rewrite once, then drop |
| yes | no | **REGRESSION** | drop, and record it. An addition can crowd out attention |

**INEFFECTIVE and REGRESSION are the outcomes nobody predicts, and they are the reason
this protocol is worth its cost.** A sentence can be true, unswappable, well argued, and
inert.

### Cost, and what to spend it on

Three agent runs per enrichment, batchable several to an agent. That is real but bounded.
Where a run produces more enrichments than the budget covers, spend it in this order:

1. every enrichment the executor or evaluator flagged as weak, low confidence, or a close
   call. **The weak ones first, deliberately** - if the A/B confirms everything including
   those, the instrument is a rubber stamp and that is the finding.
2. every enrichment landing on a recipe that already carries three or more, where
   crowding-out is most likely.
3. a random sample of the confident ones as a control.

Report the distribution of the four verdicts every run. **A run where everything is
CONFIRMED has not validated anything; it has measured its own optimism.**
