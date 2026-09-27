---
layer: technique
type: technique
subject: model-and-effort-selection
technique: pin-the-resolved-configuration
status: draft
laws: [the-harness-is-a-suspect-in-every-red, measure-the-tree-not-the-summary]
shared_with: []
use_when: [dispatching an unattended run whose model or effort a policy chose, resuming retrying or waking a run that was spawned with a chosen configuration, auditing why a run cost or behaved differently from its siblings, recording what a run actually executed on]
---

# Pin the resolved configuration

The concern: a policy chooses a model and an effort for a task, and the run executes on
something else. Nothing fails. The configuration a run gets is **resolved at launch**, from
a chain the policy does not own: an explicit flag, an environment variable, a saved user
setting, the harness's default for that model, the provider's default for that model. Any
link the dispatcher leaves empty falls through to the next one, and the lower links move
on their own. **Every path that launches a run passes both values explicitly, and every run
records what was asked for and what was served.**

## Why the lower links cannot be trusted

Each of these has been documented by a vendor, or measured on this fleet:

- **Defaults differ by model within one family, and change between releases.** A request
  that omits effort runs at the model's own default. One vendor's newest flagship
  defaults a level lower than its predecessor, so the same unpinned request silently
  spends less.
- **Aliases re-point.** A short model name resolves to whatever the harness version maps
  it to, and one harness re-pointed its flagship alias three times in a year.
- **Saved settings stop applying.** One harness documents that an effort saved in the
  user's settings is not applied to models released after a cut-off, which start at
  their own default.
- **Helpers move.** A built-in helper agent that always ran on the small model began
  inheriting the main conversation's model in one release.
- **Continuation re-resolves.** A resumed or woken session is a new launch. Measured on
  one harness: resume restored the conversation's model but not its effort. The woken
  turn ran at the operator's settings level, and rewrote the whole cached conversation to
  do it.
- **An implicit default flipped.** A fleet lane that pins effort records why: one harness
  release changed the implicit default from medium to high with no notice.

A run that relies on any of these links is a run whose configuration is a property of the
machine and the date, not of the policy. That makes its result impossible to attribute:
the grid that chose the tier measured one configuration and the fleet is running another.

## The procedure

1. **Enumerate every launch path**, not just the main one: fresh dispatch, retry, requeue,
   resume after sleep, re-attach after a crash, fallback to another engine, and every
   subagent or helper the run spawns. The unpinned path is almost always a secondary one
   that someone added later, and it usually still carries only the session id.
2. **Pass model and effort explicitly on each path**, taken from the same resolver the
   fresh path uses. Do not re-derive them separately per path, so that two paths cannot
   disagree. Where the harness accepts separate settings for plan mode or for spawned
   helpers, set those too. They do not follow the parent.
3. **Use full model identifiers where the harness accepts them.** An alias is a pointer
   the harness can move. Where the policy deliberately wants "the current flagship", it
   uses the alias and records the resolved identifier every time.
4. **Record both sides per run.** Record the requested pair as it was passed. Record the
   served model from the run's own stream: most harnesses announce it at session start,
   and it may differ from the request. Effort usually has no echo, so the requested value
   is the only record, which is why it must be written at dispatch and survive every
   continuation.
5. **Record "not passed" as a value.** A lane that deliberately leaves effort to the
   harness writes that down. A null that means "rode the default" and a null that means
   "lost on resume" are indistinguishable later.
6. **Re-derive a measured default when the model, the harness version or a resolution
   rule changes.** A tier measured under one resolution chain is not evidence about
   another. The same triggers govern claims about the models themselves; see
   [capability-claims-expire](../../engine-behaviour-profiles/techniques/capability-claims-expire.md).

## Decision rules

- **A launch path that passes only an id is a defect**, even when today's harness happens
  to restore the rest. The restoration is harness behaviour nobody pinned.
- **Changing effort inside one conversation is not free.** Where the provider keys its
  cache on effort, a continuation at a different level rewrites the cached prefix. Choose
  the level per run and keep it for the run.
- **The same resolver serves every path.** Where a fleet has fixed a lost pin in one lane,
  search every other lane for the same shape before closing it. The fix rarely travels on
  its own.
- **An unexplained cost or behaviour change between sibling runs is checked against the
  recorded configuration first.** Only after that is it attributed to the model.

## What this technique does not decide

It does not choose the configuration. That is
[cheapest-sufficient-tier](cheapest-sufficient-tier.md) and
[task-shape-tier-policy](task-shape-tier-policy.md). It makes sure the configuration they
chose is the one that ran, and that the record can prove it.
