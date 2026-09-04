---
layer: technique
type: technique
subject: agent-instruction-files
technique: substrate-coupled-expiry
status: forged
laws: [gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [a model or harness upgrade landed and the instruction file was not part of the change, deciding whether a rule that still reads correctly is still doing anything, an instruction file has accreted across several model generations, an agent has become cautious and the file is mostly old prohibitions, deciding what to remove from a file that passes every freshness check]
---

# Substrate-coupled expiry

[instruction-freshness](./instruction-freshness.md) couples the file to
change rather than to calendars, and its change list is entirely
repo-side: a stack major bump, a command rename, a directory
restructure, the deletion of anything the file names. Every trigger is an
event in the artifact the file *describes*.

The file has a second reader, and it moves too. When the model improves,
nothing in the repository changes — no path breaks, no count drifts, no
enforcement claim goes phantom — and a line can nonetheless become dead
weight. Freshness asks whether the line still describes the repo. Nothing
asks whether it still changes the agent. **A line can be perfectly
accurate and completely inert**, and that state is invisible to every
check the subject otherwise runs.

## The restraint expires first

Expiry is not uniform across the file, and knowing which half decays is
what makes the audit cheap. Instruction files accrete from irritation —
each rule minted the day an agent did something wrong
([restraint-amplifier-balance](./restraint-amplifier-balance.md)) — so
the file's prohibitions are a fossil record of one model generation's
specific failure modes. The model is replaced every few months. The cage
is not.

The vendor record is an existence proof for how large the residue gets.
A harness vendor reported removing **over 80% of its own coding agent's
system prompt** on a new model generation, with no measurable loss on its
internal coding evaluations (published 2026-08). Treat the fraction as a
demonstration and never as a target: those evaluations are not public,
and the result covers particular models in one harness. The *reason* is
the transferable part, and the example given was a guardrail — "default
to writing no comments. Never write multi-paragraph docstrings" — kept
because older models needed it and removed because newer ones "have
better judgement and can handle these decisions well without explicit
rules."

Which inverts the harm. An expired restraint does not merely charge the
dilution tax; it **suppresses behavior the current model would have got
right**. That is the loss `restraint-amplifier-balance` names, arriving
by a different route: not a file authored all-cage, but a file that
*became* all-cage because its restraints outlived the failures they
answered while its amplifiers quietly turned into the model's defaults.

## Expired lines contradict — they do not merely idle

The per-line cost is the smaller one. Lines admitted across several
generations were each written against a different reader, and they
disagree. Reading its own transcripts, the same vendor found "several
conflicting messages in a single request" — the example pair being "leave
documentation as appropriate" against "DO NOT add comments" — with the
clash spanning the system prompt, the installed capabilities and the
user's own request. Three authors, three vintages, one context window.

So expiry is not a property a line holds on its own. **Two lines can each
pass [line-earning](./line-earning.md) and still be a defect as a pair**,
and the pair is invisible to any audit that walks lines one at a time,
which is what the freshness checklist does. A contradiction is found by
reading the file as one document against one model, not by checking
entries.

## The instrument: withhold the line

`line-earning`'s second half asks whether removing a line would change
behavior, and then concedes the measurement — "the honest way to know is
the line's origin story." An origin story is evidence about the model that
failed. It is a proxy for the model reading the file now, and it diverges
exactly when the substrate has moved, which is the moment the question is
being asked
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

[capability-before-steering](./capability-before-steering.md) already
built the apparatus, at the opposite polarity: it isolates a capability
gap by checking whether a failure "persists at the top of a fresh, minimal
file," where dilution is near zero. Run the same rig with the rule
**absent** — give the current model the task the rule was minted for, with
the line withheld, and watch for the failure:

- **The failure appears.** The line is still load-bearing. Re-date it and
  keep it.
- **The failure does not appear.** The line is residue, and every session
  since the upgrade has been paying for it.

Scope the trial to what can plausibly expire. Unreachability does not: the
command with the non-obvious flag, the convention visible only across
fifty call sites, the rejected alternative, the gotcha recorded in no file
— no model improvement makes those derivable from the tree, because the
information was never in the tree. What expires is the **judgment-shaped**
rule: the prohibition, the style preference, the formatting instruction,
the coaxing written to compensate for a weakness. Sort on that axis and
the trial covers a handful of lines rather than a file.

## Archive, then delete

The obstacle to pruning is not doubt about which lines are dead — it is
that removal feels unrecoverable. Practitioners report keeping files they
already suspect are inert, because restoring them is unclear and a quality
regression is expensive to notice late. That fear is what converts a
maintenance question into an accretion policy.

The countermeasure is mechanical: remove in a single reviewable commit
that touches nothing else. A removal revertible in one command is a cheap
experiment; the same removal folded into a feature change is a decision
nobody will revisit. This is also why "delete the file every few months
and rebuild what you miss" is sound advice that almost nobody takes — it
is the right experiment, offered without the cheap undo that would make it
affordable.

## Stamp the substrate, and the trigger becomes mechanical

Couple to change, not to calendars — but the change list has a second
column. A model generation lands; the harness ships natively a capability
the file used to instruct around; a tool the file worked around becomes
standard. Each is datable, each invalidates lines, and none of them
produces a diff in the repository. Those are the triggers. The calendar is
the fallback for a team that does not track which model its agents run.

The durable form is the one this subject already uses for numbers: a
judgment-shaped rule carries the substrate it was minted against, the way
a count carries its predicate — "added 2026-03, after the agent repeatedly
did X." Then the upgrade *is* the audit trigger and the sort is a
comparison rather than a reading: every judgment rule older than the
current generation is a candidate, and everything else is untouched.
Without the stamp the file cannot distinguish a rule re-earned last month
from one never questioned since the day it was written, and it presents
both at identical confidence — decayed knowledge rendered as current fact
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

The same rot runs on the assembled side of the subject boundary, where the
reader is a program rather than the model and the audit is therefore a code
read rather than a withheld-line trial:
[consumer-coupled-decoration](../../prompt-assembly/techniques/consumer-coupled-decoration.md)
owns the per-item markup a producer keeps attaching to a payload after the peer
that consumed it changed method.
