---
layer: technique
type: technique
subject: ci-execution-trust
technique: per-call-write-token-handout
status: forged
stage: team
laws: [one-validation-door, absent-guard-is-loud]
shared_with: []
use_when: [automated authors can push changes that include the pipeline definition, a write token sits in a project or group variable that change pipelines can read, one process makes several kinds of write with several tokens, deciding where comment, label, merge and record-keeping writes run]
---

# Write tokens live in one project and are handed out per call

[measure-apply-split](./measure-apply-split.md) separates the job that runs a change's code from
the job that writes the result. That holds while the change cannot edit the pipeline the two
jobs belong to. Once it can — an automated author pushing branches, a contributor whose
proposal carries the definition — the applying job is just another job in a pipeline the change
shapes. The change can add a step to it, add a job beside it that runs in the same stage, or
print the environment of any job that has the token. A write token stored as a variable of a
project whose change pipelines can read it is readable by every job those pipelines run,
including the author's own tests and any definition the author edits on a branch.

The split has to cross a boundary the change cannot edit. The rule: **one separate project holds
every write token and makes every write; no pipeline of a target project carries a write token;
and inside the writer, each call is handed only the one token it writes with.**

## The writer project

Target pipelines produce evidence and report-only output with the platform's short-lived job
identity and nothing else. The writer runs on its own schedule, reads each target through the
platform's API, re-derives whatever it needs from raw evidence, and writes. Its properties are
the substance:

- **It runs only its own definition, from its own protected branch,** and never checks out,
  includes or executes a target's code or pipeline definition. Targets are data to it.
- **Its tokens are project-level variables of the writer only,** protected to the protected
  branch and masked. Never group or instance level: every target in the group inherits those,
  which puts the token back in the place this technique removed it from.
- **It takes no value from outside its own repository** — no run-level variables (set the
  project's minimum role for them to "no one"), no trigger payload, no webhook body. A schedule
  with no variables is the baseline; anything that wakes it sooner carries nothing it reads.
- **What it runs is pinned.** The checker it invokes is fetched at a reference and verified to
  resolve to a recorded commit, the job image is pinned by digest, and the definition and the
  pin file change only through a reviewed merge with code owners on both.
- **It runs on runners no target uses.** On a shared runner a target's test job can read a
  concurrent writer job's environment or files, and the separation is gone below the platform's
  view.
- **No automated author is a member of it,** or of anything whose content it runs or reads as
  policy.

## Per-call handout inside the writer

The writer itself spawns many children: one posts a note, one applies labels and merges, one
appends to a ledger, one commits a policy change, one dispatches a review. Give all of them the
writer's full environment and every child holds every token — a defect in the note poster can
commit policy. The handout:

1. **The orchestrator strips every write token from the environment it passes to any child,**
   under every name a token can arrive as, including legacy names kept for migration.
2. **Each call that writes adds back exactly the token for its write,** explicitly at the call
   site. Reading uses a separate read-capable token, never a write token by default.
3. **A child told which token to write with refuses to start if that token is unset,** before it
   reads anything. The fallback is the failure: a child that silently falls back to "whatever
   token is in the environment" is how the read token ends up writing the ledger.
4. **Distinct tokens for distinct write targets,** each scoped to the one project it writes, so a
   leaked ledger token cannot merge, and a leaked note token cannot rewrite policy.

The handout is [one-validation-door](../../../../_laws.md#one-validation-door) applied to
credentials: the writes are enumerable because each one names its token at one call site, and a
new write that forgets to name one has no token rather than all of them.

## Missing tokens are loud, and degrade to reporting

When a write token is not configured, the writer still runs and reports what it would have
written — and says, in its log, which token is missing and that nothing was written. Per
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud), a writer that quietly does
nothing looks identical to one that found nothing to do.

## Moving tokens out of a target

Moving a token into the writer is not finished when the variable is deleted from the target.
Every token that was ever stored where a change pipeline could read it is revoked and reissued,
because any job of any pipeline in that window could have read it, and no log proves none did.

## Decision rules

- When a change can edit the pipeline, the applying job leaves that pipeline for a separate
  writer project.
- Target pipelines carry no write token of any kind; their only identity is the job's own.
- Writer tokens are project-level, protected and masked on the writer only.
- The writer runs only its own reviewed definition, takes no external values, pins what it runs,
  and uses runners no target shares.
- Children inherit no write token; each writing call is handed its one token; a named token that
  is unset is a refusal, not a fallback.
- One token per write target. Missing token: report-only, said out loud.
- A token that was readable from a change pipeline is rotated, not just moved.

## When not to use it

A repository whose changes come only from people who could already deploy it, and whose
pipeline writes nothing back, does not need a writer project; a credential-free verification
lane and an ordinary protected deploy job are enough. The writer project is bought the day an
automated author or an outside contributor can push a definition into a pipeline that would
otherwise hold a write token.
