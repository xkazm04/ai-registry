---
layer: technique
type: technique
subject: agent-instruction-files
technique: write-back-sink-class
status: forged
laws: [count-carries-predicate, identity-survives-reuse]
shared_with: []
use_when: [an instruction file tells the agent to record something in a named file, deciding whether an agent-written log belongs in the shared artifact or stays per-checkout, two projects made opposite sharing decisions about the same agent log, a fleet metric computed from agent logs disagrees between installations, an instruction names several write destinations in one clause, a learning lane has run for months and nothing downstream changed]
---

# Write-back sink class

Every instrument in this subject reads the file *inbound*: what the lines
say, whether they earn their tokens, whether they have rotted, whether a
rewrite inverted them. But instruction files routinely carry an outbound
half — *"record mistakes in one file, missing capabilities in a second,
environment discoveries in a third"*, *"log consults here, leads there"* —
and nothing above audits it. The write-back sink is where the next
session's candidate lines are supposed to come from, and it is the one
part of the file that produces an artifact the author never reads.

The outbound half fails in a way the inbound half cannot, because the
instruction can be followed perfectly and still deliver nothing. A line
that says "append it to X" is a claim about X, and X has a **sharing
class** the line never states.

## Three states, and only one of them is a lane

For each destination the file names:

- **Absent.** The file does not exist. The instruction has never once been
  followed and nothing errored — there is no failing gate, because an
  append that never happened leaves no trace. This is the write-side twin
  of the phantom gate ("enforced by X" where X has never fired), and it is
  cheaper to detect: one existence check per named path.
- **Present but unshared.** The file exists and is outside the shared
  artifact. Every fresh checkout starts empty, so the lane accumulates
  only within one working copy and dies with it.
- **Present and shared.** The rows travel.

Only the third is a lane. The first two are journals, and an author who
believes a journal is a lane will write the next instruction assuming an
accumulation that does not exist.

The obvious correction — put every sink in the shared artifact — is wrong,
and the rest of this technique is why.

## The class is set by how the sink is aggregated, not by what it holds

A sink exists to be drained by something. **Ask how the collector
aggregates it**, and the sharing class follows mechanically:

- **Aggregated by count** — the collector sums rows into a per-subject or
  per-category number. A row that survives into a second checkout is
  counted there as a *second observation of the same event*. Such a sink
  **must not travel**. Its rows are an observation made by one installation,
  and a count that silently spans two is a count whose predicate no longer
  matches its label ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
- **Aggregated by identity** — the collector dedupes on a minted key
  (timestamp plus subject plus claim, a content hash, an id assigned at
  append). The same row arriving from two checkouts is *recognised*, not
  doubled ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
  Such a sink **may travel**, and usually should: an undrained row that
  exists on one machine is work owed that no other machine can see.

This is arithmetic rather than taste, which matters because the two sinks
usually sit in the same sentence and the question otherwise gets answered
by feel. The test is one question of the *collector*, not of the sink, and
the answer is visible in the collector's code: does it `+= 1`, or does it
check whether it has this row already?

## The one-clause trap

Sinks are introduced in pairs and triples — *"log consults here, leads
there"*, *"mistakes here, missing capabilities there, environment
discoveries in the third"* — because they are written down at the moment
the lane is designed, and at that moment they are one idea. They then
inherit **one** sharing decision, because whoever later edits the ignore
rules is looking at a list, not at a classification.

A measured instance. A fleet of thirteen repositories shares one contract
line naming two agent-written logs together, under the same append-only
rule. Their collectors differ: one sums rows into per-subject counts, the
other dedupes on a minted key. Across nine repositories that had both
files, the count-aggregated log was shared in two and local in seven; the
identity-aggregated log was shared in six and local in one. **Both
projects that got it wrong had written down a reason, and the two reasons
contradicted each other**:

- one repository's ignore file carried a dated owner decision — *track the
  whole directory, because the registry is consulted from more than one
  machine and a lane that exists only on the box that generated it cannot
  be read by the next one*;
- another's carried the opposite — *counts reach the aggregate lane; the
  log itself stays local*.

Neither is drift. Each reason is **correct about one of the two files and
false about the other**, and each project applied its reason to both. The
first is right about the identity-aggregated log — an undrained lead
stranded on one machine is exactly the loss it describes. The second is
right about the count-aggregated log — sharing it is how one installation's
observations get re-counted as another's. The contract never assigned a
class, so each project generalised from whichever sink it thought about
first, and the fleet split on both.

Where the same mechanism sat in a single public repository rather than a
fleet, all three of an instruction file's named sinks were unshared, and a
fourth sink elsewhere in the same tree wrote machine-readable findings to
an ignored directory whose only surviving summary was a hand-maintained
prose block carrying a months-old date. The prose block was the part
something read, so it was the part that lasted — which is the same
selection pressure stated from the other end.

## The audit

Three checks over the config corpus, none of which needs the agent to run:

1. **Enumerate the destinations.** Every path named on a line carrying a
   write verb, across the instruction file *and* the installed sibling
   floor ([sibling-floor-ownership](./sibling-floor-ownership.md)) — the
   siblings name more sinks than the repository's own file does.
2. **Classify each by its collector**, per the rule above. A sink with
   **no collector at all** is not a third class; it is an absent lane
   wearing a lane's clothes, and the instruction that feeds it is
   spending tokens on every session for nothing.
3. **Check the state against the class.** Count-aggregated and shared, or
   identity-aggregated and unshared, are the two defects. Both are a
   one-line fix to an ignore rule; neither produces a symptom the owning
   project can see, because the damage lands in a *different* installation.

Two failure signatures make this worth running before an audit finds it:
a fleet-wide metric that two installations report identically (one fleet
counted twice, not two installations agreeing), and a sink whose row count
has not moved in months while the instruction that feeds it is still in
every session's context.

## Unshared is often the correct answer

A sink is not improved by being shared. Where publication forbids the
content — a public repository whose own policy bars private names,
internal context and customer-derived data from anything committed — an
unshared sink is the only lawful destination, and the fix is not to commit
it.

The fix is to **say so in the line that names it**. An instruction that
reads "record it in X" implies accumulation; one that reads "record it in
X, which is per-checkout and is read by nothing else" does not, and the
next author will not build on a lane that isn't there. A per-checkout sink
with an honest label is a working design — the agent gets a sanctioned
place to put a discovery instead of editing the shared policy file
mid-run, which is the outcome this whole subject is protecting.

## What this cannot do

It cannot tell you whether the rows are any good. A sink can be correctly
classed, correctly shared and faithfully drained, and still be carrying
noise nobody acts on — that is the collector's problem, and the sink's
existence check says nothing about it. It also assumes the collector is
readable: where draining is done by a hosted service or a model rather
than by a script whose aggregation you can see, the class has to be
established by experiment (append the same row from two checkouts, read
the aggregate) rather than by inspection.
