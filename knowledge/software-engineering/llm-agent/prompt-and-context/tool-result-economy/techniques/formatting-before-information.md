---
layer: technique
type: technique
subject: tool-result-economy
technique: formatting-before-information
status: forged
laws: [creation-names-reaper, count-carries-predicate]
shared_with: []
use_when: [a summarizer is proposed before anyone has looked at the packaging, auditing the prefixes and banners a harness adds to every tool result, a per-item affordance is emitted for a consumer nobody can name, ordering a list of proposed context reductions]
---

# Formatting before information

Two reductions can save the same number of bytes and cost completely different
amounts, and the difference is not a matter of degree. It is a boundary:

> **Exhaust every transform that removes no information before admitting any
> transform that does.**

This is an ordering, not a preference, and the reason is that the two kinds
have different cost structures rather than different sizes. Removing
information imposes four costs — the model must be told the material may be
missing, it may have to recover the material, it now has a decision to make
about whether to recover, and the content it reads has changed. Removing
packaging the producer never emitted imposes **none of those four**. Its
saving is therefore *unconditional*: an information-preserving removal cannot
cause a recovery, so it cannot be displaced back onto the completed task at
the rate the boundary technique describes. Nothing about it depends on the
workload, the task mix, or how often the removed part happened to matter.

The practical consequence is that a proposal to summarize tool output before
anyone has audited the packaging around it is out of order, and the audit is
usually cheaper and often larger.

## The vestigial affordance

The packaging worth hunting has a recognizable life cycle, and it is where
most of the free saving is found.

A per-item affordance is added because one consumer needed it. Time passes.
The consumer is replaced, or removed, or reworked so it no longer reads that
affordance. **The affordance keeps being emitted, on every item, forever**,
because nothing in a codebase re-checks that pairing when a consumer changes.
Its cost is **per emission** and its value was **per consumer**, and the two
are separated by enough distance — often a different module, often a different
team, always a different change — that no review ever sees both halves at
once. This is a creation with no reaper: the code that started emitting it
never named what would stop it
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)), and
after that nobody asked.

The field instance is exact and instructive. A file-reading tool prefixed
every line it returned with a line number, because the editing tool of the day
targeted its changes by line number. The editing tool was later replaced by
one that locates edits by matching surrounding code. The prefixes stayed — on
every line, of every file, in every read, for every task. Removing them cut
model-inference cost by roughly 5% in offline benchmarks and about 3% per user
per day online, with no measured regression in quality or in edit failure
rate. Those two numbers are different measurements of different populations
and both travel with their predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)); the
online figure is the one that reflects a real task mix, and the gap between
them is itself a workload-locality datum.

## The discriminator that keeps this a technique

The affordance was not waste in general, and a reader who takes "line numbers
are waste" away from the instance has taken the anecdote and left the
technique. Line numbers are genuinely useful in a diff, in a short snippet, in
an error report — anywhere the reference is short-lived and the consumer is
present. They were waste **here**: attached to every line of every full-file
read, while the workflow that consumed them no longer existed.

So the audit question is never "is this formatting useful?" — which is
unanswerable in the abstract and answers itself in the affirmative. It is:

> **Which consumer needed this, and does that consumer still exist?**

A question with two halves, both falsifiable. If nobody can name the consumer,
the affordance is unowned and comes out. If the consumer can be named and is
gone, it comes out. If the consumer exists but reads only a fraction of the
emissions, the affordance moves to that fraction — attached where it is read,
not on the general path.

## The sweep

The audit is a directed enumeration rather than a search, and it can be
completed in an afternoon. Take one representative result from each tool the
harness exposes and list **everything present that the producer did not
emit**:

- per-line and per-item prefixes — numbers, indices, markers, paths;
- banners and headers the harness wrote around the output;
- delimiters and fences, and repeated versions of the same fence;
- restated context: the path already named in the request, the command
  already visible in the call, the arguments echoed back;
- trailing instructions and reminders appended to every result;
- per-result metadata the model has never been observed to use.

For each line of the list, name the consumer. Then check whether the consumer
still exists. The output of the sweep is a set of removals whose savings are
unconditional and a much shorter set of affordances that survive with a named
reader — and that second list is worth writing down beside the emitting code,
because it is the reaper the original creation never named.

Two of these are worth calling out because they hide well. Restated context is
invisible in a single result and enormous in aggregate, since it scales with
turns rather than with content. And appended reminders read as instructions
rather than as packaging, so they get exempted by reflex — but a reminder
emitted on every result is standing instruction material paid for at
per-result rates, and it belongs in a standing layer or nowhere.

## Boundary: emitted formatting versus authored rules

Pruning rules from an instruction file is the same failure with an important
difference. That discipline governs **authored** lines and its pruning half
says the same thing — a rule whose failure mode no longer exists comes out the
day that is noticed, because residue is what the dilution tax is levied on.

The difference is where the two start. An authored rule **was admitted by
somebody, once**, against a test; pruning it is re-running a test that was
actually run, and the original decision is usually reconstructible. Emitted
formatting was never admitted by any test at all. It entered as an
implementation detail of a feature, on a code path whose review was about the
feature, and it has therefore never been on the agenda of any meeting. That is
why the sweep has to be deliberate: nothing in the normal flow of work will
ever surface it, and it does not decay, complain, or fail a build.

## Decision rules

- Order proposals by whether they remove information. Every
  information-preserving removal ships before any lossy one is discussed.
- Never let a summarizer proposal skip the packaging audit; the audit is
  cheaper, safer, and frequently larger than the summarizer.
- For each thing the harness adds to a result, name the consumer. Unnamed
  means removed.
- When a consumer exists but reads a fraction of the emissions, move the
  affordance to that fraction rather than keeping it on the general path.
- When the code starts emitting a per-item affordance, record what would stop
  it — the consumer, and the condition under which it would no longer be
  needed — beside the emitting code.
- Report the saving with its population. An offline benchmark figure and a
  per-user-per-day online figure are two numbers, not one, and only the second
  reflects a real task mix.
- Re-run the sweep whenever a consumer of tool output is replaced. That
  replacement is the exact moment an affordance becomes vestigial, and the
  only moment anyone will remember it existed.
