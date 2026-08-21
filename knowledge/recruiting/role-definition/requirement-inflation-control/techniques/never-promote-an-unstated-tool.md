---
layer: technique
type: technique
subject: requirement-inflation-control
technique: never-promote-an-unstated-tool
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [a requirement list is drafted by a model from a brief or transcript, reviewing a generated job description for invented requirements, writing the prompt that generates requirements]
---

# Never promote an unstated tool

The grounding rule for any system — human or machine — that turns a short
brief into a requirement list: **every must-have must trace to something the
input actually states.** A named tool, product, platform, methodology or
process that appears nowhere in the source material may not appear in the
requirement list, however typical it is of the role.

This is the counter-move to the newest source of inflation. A language model
asked to draft requirements from a thin brief fills the gaps with the most
typical content for that title — which is the accumulated sediment of every
posting ever written for it, arriving instantly, in confident prose, with no
author to ask. Generated inflation is worse than the human kind for three
reasons: it is fluent enough to pass review, it is produced at a rate no
reviewer can audit line by line, and it carries no provenance, so the invented
line and the requestor's own dealbreaker look identical on the page.

## Why the tool name in particular

Of everything a drafting system invents, named tools do the most damage per
line.

- **They are maximally filterable.** A tool name is an exact string. It goes
  into a search query as a hard clause, into a screening rubric as a
  yes/no, and into a rejection as a reason — with no ambiguity to soften it.
  An invented soft skill produces a vague interview question; an invented tool
  name produces a closed gate.
- **They are near-perfect proxies for irrelevant things.** Tool familiarity
  tracks which employers someone worked for, which is to say company size,
  sector, and geography. Filtering on an unstated tool excludes on employment
  history while appearing to filter on skill.
- **They are the most learnable class of requirement there is.** Most tools in
  a category are learnable in days by someone with the underlying capability,
  which means the filter buys almost nothing even when the tool is real.
- **Nobody can tell they were invented.** A reviewer reading the output has no
  way to know the requestor never said it. That is precisely the failure
  [say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds)
  names: the artifact asserts something no participant asserted, and silence
  would have been the better output.

## The rule, stated for implementers

Where requirements are generated, the instruction is a hard constraint, not a
preference, and it needs all five clauses:

1. **Every must-have traces to a statement in the input.** If the input does
   not support it, it does not exist. Absence of information is not licence to
   supply the typical case.
2. **Illustration is allowed only in the nice-to-have list, and only marked as
   illustration.** Where naming an example genuinely helps a reader calibrate
   ("familiarity with a workflow-orchestration tool, e.g. one of the common
   schedulers"), it belongs among preferences, phrased explicitly as an
   example — never as a criterion, never on the must line. Marking it is what
   makes it an inference rather than a finding, per
   [inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference).
   An unmarked example is indistinguishable from a requirement to every
   downstream reader, and downstream readers are the ones who filter.
3. **Read seniority from the input's own signals, not from the requested
   target.** Asking a system for a senior specification produces senior-sounding
   requirements regardless of the work described — the target becomes the
   anchor, and the inflation is invisible because it is uniform across the
   whole list. Grade the level from scope, autonomy and blast radius as the
   input describes them, and where those contradict the requested level, say
   so as a finding rather than resolving it silently.
4. **A confirmed human grading passes through intact.** Where the input
   carries the requestor's own graded requirements — read back and affirmed in
   a session — they are the highest-authority signal available, and every one
   of them appears in the output at its stated grade. A generator may not
   quietly promote a stated preference into a must, nor demote a stated
   dealbreaker, because its own analysis of the work suggests otherwise. Where
   the analysis genuinely contradicts a stated grade, it emits the
   contradiction as a finding for a human to settle. This is the same rule as
   the grounding one, applied to grades rather than to items: the system may
   describe what it noticed; it may not restate what someone decided.
5. **Keep the generated must-have list short and decisive.** A generator with
   no length discipline produces a list at the length of its training
   distribution, which is long. Eight is a sane ceiling for a generated list;
   the count control and its ranking remedy belong to the cap technique.

## Reviewing generated requirements

The review pass is a two-column check, and it is fast:

- **For each must-have, name the input span it came from.** Not "is this
  plausible" — plausibility is the failure mode, since generated inflation is
  uniformly plausible. Anything that cannot be pointed at is cut, not
  softened. Cutting is safe; a genuine requirement the requestor cares about
  will come back on the read-back, and it will come back attributed.
- **Scan for proper nouns first.** Tools, products, methodologies, standards,
  named certifications and named employers. They are the highest-yield and the
  easiest to spot, and a scan restricted to them catches most of the damage in
  a fraction of the time.
- **Check the numbers.** Years figures, team sizes and volume thresholds are
  invented as freely as tool names and read as far more authoritative because
  they look measured. A number with no stated source is an invented
  requirement wearing a measurement's clothes.
- **Check for the mirror failure.** A requirement the input *did* state that
  the draft dropped or softened is the same class of error in the other
  direction, and it is the one a reviewer scanning for inventions will miss.

## Decision rules

- **Cut, do not demote, an untraceable must-have.** Moving it to nice-to-have
  keeps an invention in the artifact where it can be read back as if someone
  said it. Illustration is a deliberate authored choice, not a landfill for
  ungrounded lines.
- **The generator's own confidence is not evidence.** A drafting system
  reporting that a requirement is "clearly implied" has produced a statement
  about itself, not about the role. The trace to the input is the only
  admissible ground.
- **One grounding door.** Where several surfaces generate requirements — an
  intake agent, a description writer, a rubric builder — they must share the
  rule, and preferably the constraint text itself. A second generator without
  it re-admits everything the first one excluded, and nothing marks which
  surface produced which line.
- **Record which lines were generated.** A requirement drafted by a system and
  then affirmed by the requestor is theirs; one never affirmed is still the
  system's. Keeping that distinction is what lets a later reader answer who
  required this.

## When not to use it

- **When the input names the tool.** If the requestor said it, it is a stated
  requirement — ladder it and grade it like any other, but do not treat it as
  an invention.
- **On a genuinely tool-defined role.** Some work is the operation of one
  specific system, and the system's name is the job. The rule is about
  *unstated* tools; it never forbids a requirement the work actually has.
- **On the nice-to-have list as a whole.** Preferences may reasonably be
  richer than the input, because they filter nobody. The strictness is
  proportional to the filtering power of the line, and that is the whole
  design.
- **As a substitute for the read-back.** The strongest available check is
  still the requestor reading the list and being asked one open question about
  what is wrong or missing. Grounding rules make that check cheaper; they do
  not replace it.
