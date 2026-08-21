---
layer: technique
type: technique
subject: wiring-contract-doctrine
technique: contract-injection-into-prompts
status: forged
laws: [law-and-check-share-one-source, a-budget-shapes-the-output]
shared_with: []
use_when: [a checker rejects most of what the generator produces, writing the authoring prompt for generated content, deciding where a production rule should live]
---

# Contract injection into prompts

State the wiring contract to the thing that authors the artifact, in the same
words the checker will grade it by, at the moment of authoring. A contract that
exists only in a checker teaches the generator nothing, and a generator that
learns nothing fails the same way on every artifact forever.

This is the half of the doctrine that is easiest to skip and produces the largest
change in outcomes, because it is the only intervention that acts on the
*distribution* of what gets produced rather than on the disposal of what already
was.

## The argument from arithmetic

Consider a generator with no wiring instruction. Its output's wiring quality is
whatever its priors suggest — usually absent, because in most code it has ever
seen, wiring lived in somebody else's file. The checker rejects at some high rate.
Each rejection costs a human intervention, and every intervention is the *same*
intervention, because nothing in the loop ever updates the thing producing the
defects. Throughput is bounded by human repair rate. Add generation capacity and
the queue grows; the bottleneck does not move.

Now state the contract at authoring time. The artifact arrives with a granting
path named, because the author was asked before finishing rather than judged
after. Rejections drop to the residue — the cases where the answer genuinely
required project knowledge the author did not have — and the checker becomes
sustainable in the role a gate can actually hold: catching the exceptions.

The general principle: **a filter cannot improve its input.** Anything you want in
the output distribution has to be stated to whatever produces it. The checker's
job is to catch what slipped, and a checker catching everything is a sign the
instruction is missing, not a sign the checker is working.

## The procedure

1. **Split the contract into one sub-prompt per field.** Four fields, four
   explicit demands, each phrased as a question with a required concrete answer.
   A single paragraph mentioning all four gets one hedged sentence in reply
   covering all four; four separate demands get four answers. This is the single
   highest-leverage detail in the technique.
2. **Make each sub-prompt name the shape of an acceptable answer**, not just the
   topic. Not "describe how it is granted" but "name the specific progression
   tier, loot table, or unlock that grants this, by its identifier". The author
   produces the shape it is shown.
3. **State the bar directly, in the imperative, including the refusal.** A line to
   the effect of *do not stop at "it compiles"* does real work: it names the exact
   failure mode the author is otherwise most likely to produce, and naming the
   failure suppresses it far more effectively than describing the success.
4. **Include the binary-content escape hatch.** Ask explicitly whether the artifact
   depends on content the author cannot produce — a mesh, a rig, a texture, an
   audio clip — and require it to be flagged. Without the hatch, an author asked
   for four complete answers will invent a plausible one rather than declare a
   blocker, because the prompt gave it no legal way to say "I cannot".
5. **Inject the same source text the checker reads.** Not a paraphrase. The prompt
   fragment and the checker's rule are one artifact rendered two ways; if a human
   can edit one without the other changing, they will, and the drift is
   undetectable from either side.
6. **Inject the artifact's own acceptance criteria alongside the contract** where
   they exist. The rule an artifact will be graded against belongs in front of
   whoever authors it — that is the same law at a different altitude, and it costs
   a few hundred tokens.
7. **Render the gaps as demands.** When a neighbouring artifact's contract is
   already partly authored, inject it *including its holes*, with each unanswered
   field rendered as an explicit instruction — "granted by: undeclared, name it" —
   rather than omitted. An omitted field reads as a field that does not exist; a
   field marked undeclared reads as a task.
8. **Cap the injected block and report what was elided.** Contracts accumulate,
   and an uncapped block eventually crowds out the actual work instruction on every
   prompt in the system. Set a character ceiling, keep whole contract blocks while
   they fit rather than truncating one mid-claim, and append a line stating how
   many were dropped. Silent truncation produces an author confidently satisfying a
   contract it only saw half of. Assert the ceiling in a test that runs against the
   live corpus, so a newly authored contract cannot quietly blow up every prompt.

## Decision rules

- **When rejection rates are high on a specific field, edit that field's
  sub-prompt.** Rejection statistics per field are a direct read on which
  instruction is underspecified. This is the feedback loop the checker-only
  architecture does not have.
- **When the contract text and the checker's rule must live in two places for
  technical reasons, derive one from the other at build time and fail loudly if
  the derivation breaks.** A silent fallback to a hardcoded copy is how the two
  come apart.
- **When the prompt is over budget, cut examples before cutting the contract.**
  The contract is a small, fixed cost that changes the shape of every output; a
  worked example is a large cost that changes one dimension. If you can afford
  only one half of this doctrine, keep the injection and drop the checker — a
  badly-answered contract is a human-fixable minute, while a rejection queue is a
  project.
- **Keep injection and grading in separate code paths, and say so.** The module
  that renders a contract into a prompt must not re-derive, re-validate or grade
  it; no verdict may move because a prompt was built. Fusing the two produces a
  system where changing the wording of an instruction silently changes what passes,
  and nobody can tell which of the two effects they intended.
- **Render the block from one source for every consumer.** A pipeline usually
  drives artifacts from several entry points — an interactive authoring surface, a
  batch recipe, a headless service. Each one building its own version of the
  contract block guarantees three subtly different bars, and the artifact's quality
  then depends on which door it came through.
- **A generic contract block with nothing concrete in it is noise; emit nothing
  instead.** When there are no per-artifact declarations and no known dependencies
  to name, boilerplate appended to every prompt trains readers — human and machine
  — to skip the section, which costs you the times it does have content. The
  instruction earns its place by carrying specifics.
- **Do not inject the contract as a post-hoc repair instruction.** "Now add the
  wiring section" produces a section written to satisfy the request, decoupled
  from the artifact it describes, and it is the reliable way to manufacture
  well-formed placeholders. Ask during authoring or not at all.

## The relationship to the checker

Injection and checking are not alternatives; they are two positions on one rule,
and the rule must be one source. The checker's remaining jobs after injection are
real and cannot be delegated to the author: verifying that named dependencies
resolve against other catalogs, rejecting placeholders adversarially, and refusing
to let the author's own claim of success stand as the verdict. What changes is the
*volume* it handles and therefore whether anyone still trusts it.

## When not to use it

- **Not where the contract's answers require knowledge the author cannot access.**
  If the granting mechanism lives in a system the authoring context has never
  been shown, injection produces confident fabrication. Either supply the
  vocabulary — the list of real progression tiers, the real catalog identifiers —
  alongside the contract, or accept a declared blocker as the correct answer.
- **Not as the prompt's opening section.** The contract is a constraint on the
  output, and constraints land better adjacent to the output specification than
  buried in the preamble. Where it sits in the overall section architecture is a
  separate concern with its own owner; this technique only insists that it be
  there at all.
- **Not on hand-authored content by experienced people.** They have the contract
  internalized, and the ceremony buys nothing. This is a technique for scale and
  for machine authors.
