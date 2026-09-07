# GitLab as the `source_control` connector

What was learned mapping this recipe onto GitLab specifically. Nothing here is part of the
recipe: bind a different host and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Merged results pipelines are exactly what this recipe asks for, and they are a setting
somebody has to have turned on.** With them enabled the pipeline runs against the change
already merged into its target, which is the difference between testing what was written and
testing what will land. Read the project setting rather than assuming it: where it is off, the
pipeline everybody is looking at is a branch pipeline and the verdict on it is weaker than it
appears.

**Merge trains go one step further and change who owns the verdict.** A train tests each change
against the changes queued ahead of it, so a change that was green alone can be removed from
the train later. When a train is in use, this work's verdict is a pre-check and the train is
the gate; claiming otherwise sets up an approval that the train can still reject.

**A pipeline can be green because it skipped nearly everything.** Rules and `only` or `except`
conditions decide which jobs run for a given change, so a change touching only documentation
may produce a green pipeline that ran three jobs. The verdict has to say which jobs ran, not
that the pipeline succeeded, or "green" carries a claim about coverage the run never made.

**Allowed to fail is invisible in the overall status.** A job marked as allowed to fail leaves
the pipeline green while showing a warning most readers do not notice. Enumerate the jobs and
their results rather than reading the summary, otherwise a genuinely failing check is
reported as a pass.

**Approvals and pipeline status are separate gates and both can block.** A change can be green
and unmergeable because an approval rule is unsatisfied, which is a waiting reason rather than
a test failure and should be reported as such.

## What transfers to any hosted repository connector

- Establish whether the pipeline ran against the branch or against the merge result.
- Where the host tests against a queue, this verdict is a pre-check and should say so.
- Enumerate the jobs that ran; a summary status hides both skips and tolerated failures.
- Separate "needs more work" from "waiting on an approval nobody can give".
