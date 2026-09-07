---
name: source-grounded-error-root-cause-analysis
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/error-triage
---

# Source-grounded error root cause analysis

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A root cause report written from the stack trace alone restates what the
reader already has, so the person triaging still has to open the code. The reports that
read as confident are usually the ones that were not grounded at all: nothing in a trace
tells you whether the source you are reading is the source that ran, and a report built
on the wrong revision is worse than no report because it survives being questioned.

**Input.** One qualified issue with its latest event, the full stack trace, the release
the failure occurred in, and the source of the codebases in scope as it stood at that
release rather than as it stands now.

**Core action.** Line the trace up with the code that actually ran, read backwards from
the frame that threw to the point where the bad state was created, and decide which of
several plausible causes the evidence supports, including deciding that the failure is
not fixable in this codebase at all.

**Output.** One report per issue naming the condition that made the failure happen and
where that condition originates, resolutions ranked by cost, and every limitation stated
plainly: an unmatched revision, a trace that could not be symbolicated, a cause the
evidence does not reach.

## Activities

1. Take the qualified issue with its latest event, trace and release *(observe)*
2. Line the trace up with the source as it stood in the release that failed *(observe)*
3. Read the code at the failing frame and the callers that reach it *(observe)*
4. Decide which cause the evidence supports, or that it supports none *(decide)*
5. Rank resolutions by cost, and say when none of them belong to this codebase
*(decide)*
6. File the report and record the verdict that comes back on it *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A triager reading the report learns where the bad state came from, which is the thing
the stack trace does not contain.**

- The report names the condition that had to hold for the failure to happen, and the
  code path that creates it, not only the line that threw.
- Where the issue is tied to a release, the report says whether the failing code changed
  in it and what changed, or says the failure predates the release it was first seen in.
- Resolutions are ranked with a stated cost for each, and an issue whose fix belongs to
  a dependency, a caller outside the scoped codebases, or the client rather than the
  server is reported as such instead of given a local fix.

**A report that could not be grounded is recognisably different from one that was,
before somebody acts on it.**

- The revision the source was read at is stated, and a mismatch with the failing release
  is stated as a limitation rather than glossed.
- A trace that is minified, truncated, or has no frames inside the scoped codebases
  produces an explicit statement that source grounding was not possible, and never a
  location invented to fill the field.
- An issue the evidence does not resolve is returned as unresolved with what would
  resolve it, rather than given the most plausible of several unsupported causes.

**What the triager decided about a report is known to the work that produced it.**

- Every report carries a recorded verdict, including a report judged unhelpful, and the
  verdict is durable rather than a conversation.
- Reports whose grounding failed for the same reason more than once surface that reason
  as something to fix in the pipeline rather than repeating it per issue.

## Guidance

The whole value is in reading backwards. The frame that threw is where the failure
surfaced; the cause is upstream, at whatever created the state the frame could not
handle. Ground it or say you could not: the source at HEAD is not the source that ran,
and a report that quietly conflates them is confident and wrong. Deciding that nothing
in this codebase can fix it is a real verdict and often the correct one. Never invent a
location to fill a field.

## Where this is worth adopting

- A team small enough that nobody owns triage, where an issue sits for a week because
  opening it means loading a service nobody has worked on since it was written.
- A frontend where deployed code is minified, and the honest first finding is that no
  source-grounded answer is available until the build starts uploading its maps, which
  is a fix worth making once rather than a limitation worth restating on every issue.
- An error that crosses services, where the frame that threw is in one repository and
  the caller that passed the bad value is in another, so a reader with one repository
  open reaches a plausible wrong answer.
- The morning after a release, when the useful question is whether a new failure came
  from what shipped or was always there and is only now being reached.
- A backlog where a large share of issues turn out not to be bugs at all, and the
  expensive part is discovering that one at a time rather than having each report say so
  on its face.

## Connector types

`monitoring`, `source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[codebases](examples/codebases.md) for `source_control`, [sentry](examples/sentry.md)
for `monitoring`.

## Recommended trigger

`event`. A qualified issue arriving from the filter is a real event and the analysis
exists only in response to it, so this work wakes on arrival rather than sweeping for
issues itself. It also means the analysis runs while the release that failed is still
the release deployed, which is what makes the grounding checkable.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which codebases a trace can legitimately land in, because a search across everything
  returns coincidental matches and a coincidental match is exactly what makes a grounded
  report untrustworthy.
- How the deployed artifact is tied back to a revision, since without that link the
  analysis can read code but cannot claim it is the code that ran.
- Whether the deployed code is minified or otherwise unmappable, which decides whether
  source grounding is possible at all rather than merely harder.
- What shape of report the triager actually reads, because depth past that is cost with
  no reader, and where the report has to land to be picked up as work.

## Dependencies

None.
