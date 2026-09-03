---
layer: application
type: application
subject: session-continuation
technique: continuation-as-state
stack: process
status: forged
verified_on: 2026-09-02
---

# Process — a stop-event hook that re-reads a mode file, with a two-hour lease and an approval that is explicitly not a stop

The realization is the `persistent-mode` hook in oh-my-claudecode (commit
`e9e8fa3847ce0b3529b84d895e841988c7308f3d`), a plugin for the Claude Code harness. The
hook runs on the harness's `Stop` event and is what keeps the plugin's execution modes
(`ralph`, `autopilot`, `ultrawork`, `team`, `pipeline`) working past the model's own
decision to end its turn. It is worth writing down because it is a clean instance of
the continuation fact living in state rather than prompt, and because its own issue
history supplies the lease, the worker suppression and the cancel race exactly as the
technique states them.

## The record, and the boundary that reads it

`docs/HOOKS.md:261-272` documents the hook: event `Stop`; behaviour "Checks
`.omc/state/` for active mode state files. If any mode ... is active, injects a
reinforcement message to prevent Claude from stopping" (`:266`). The note at `:272`
draws the line the technique draws — the modes are skills invoked via the keyword
detector, and "the persistent-mode hook is what enforces their continuation by
blocking the Stop event". The instruction text ("The boulder never stops", `:267`)
is the courtesy channel; the state file is the carrier. The `ralph` skill reads the
same relationship from the model's side: `skills/ralph/SKILL.md:285` tells the agent
that receiving the reinforcement "means the iteration continues".

The re-entry marker is honoured. `src/hooks/persistent-mode/stop-hook-blocking.test.ts:985-1021`
pins three behaviours for every mode: when the harness's `stop_hook_active` input is
`true`, the hook "returns continue without decision:block"; when it is `false` or
absent, the normal block is preserved. The host harness sets that flag on a stop that
is itself the product of a previous block, and the hook declines to block twice in one
cycle.

## The lease

`docs/HOOKS.md:268`: "States older than 2 hours are treated as inactive to prevent
stale state from blocking new sessions." The constant is
`src/hooks/persistent-mode/index.ts:108` (`STALE_STATE_THRESHOLD_MS = 2 * 60 * 60 * 1000`),
and `isStaleState` at `:375-394` implements the freshness rule the technique states:
the most recent of `last_checked_at`, `updated_at` and `started_at` is taken (`:381-387`),
and a record with no parseable timestamp is stale (`:389-391`) — the unknown age
resolves in the direction that frees the operator. The comment at `:371-372` gives the
reason in the tree's own words: "Stale files are ignored so they cannot falsely block
new sessions."

The reinforcement cap is a second bound, visible through its failure.
`docs/cancel-skill-active-state-gap.md:13-16` reproduces a guard that cancel did not
clear and shows it refusing "1/5 → 2/5 → ... until limit or 15-min TTL"; `:41` cites
the protection registry's `medium` class as "5 reinforcements, 15-min stale TTL". The
cap bounded the damage of the missing teardown entry to five refusals — which is why
the technique asks for both bounds.

## Worker suppression, and the mode kept off auto-detection

The arming channel is the keyword detector on the prompt-submit event
(`docs/HOOKS.md:392-399`). `:404` is the suppression rule: "**Team worker protection**:
Disabled when the `OMC_TEAM_WORKER` environment variable is set (prevents infinite
spawning)" — the worker is recognised by a marker the spawner sets, not by reading the
prompt. `:510-512` is the one mode deliberately kept off auto-detection: "`team` is not
auto-detected. It must be invoked explicitly via the `/team` slash command to prevent
infinite spawning." That is the technique's rule that a mode whose first act is to
spawn requires an explicit command.

## Approval is not a yield state

Both citations are in the `ralph` skill, and both are emphatic because the failure
they name was observed. `skills/ralph/SKILL.md:155`: "**On APPROVAL: immediately
proceed to Step 7.5 in the same turn. Do NOT pause to report the verdict to the user
... Treating an approved verdict as a reporting checkpoint is a polite-stop
anti-pattern.**" And `:288`, in the stop-conditions block: "**Do NOT stop after Step
7 approval.** ... Step 7 is a checkpoint inside the loop, not a reporting moment ...
the only reporting moments in Ralph are Step 8 (successful cancel) or Step 9
(rejection)." The enumerated yield states are exactly the technique's two: a clean
terminal exit (Step 8) and a rejection (Step 9). `:283-284` add the operator's explicit
stop and a fundamental blocker requiring human input, both of which are rejections in
the technique's sense.

The handoff between modes shows the same rule from the planning side.
`skills/plan/SKILL.md:88` instructs the planner, on approval, to write its own mode
inactive with a narrow write and *not* to issue the global clear, "because `state_clear`
writes a 30-second cancel signal that disables stop-hook enforcement for ALL modes,
leaving the newly launched execution mode unprotected" — approval is a transition into
execution, and the execution mode must arrive armed.

## The cancel race

`src/hooks/persistent-mode/__tests__/cancel-race.test.ts:33` is the guard for issue
#921. With a `ralph` record at its final iteration (`:8-31`), the hook is invoked with
the explicit cancel command as the prompt (`:34-47`) and must return `shouldBlock:
false`, mode `none`, and — the load-bearing assertions at `:52-57` — must not have
extended `max_iterations` or written a linked `ultrawork` record. The second case
(`:63-80`) drives the same expectation from a `cancel-signal-state.json` with a
thirty-second `expires_at`: the tombstone ordered-teardown describes, with the expiry
the technique's upward lesson names. Cancel wins the re-arm race on both channels.

## Deviations and notes

- The hook recognises the cancel command by matching the incoming prompt
  (`cancel-race.test.ts:34-36`) as well as by the signal file. The technique keeps the
  file as the authority and the prompt as a courtesy; the tree tests both, which is the
  right test, but the documentation at `docs/HOOKS.md:270` names only the command.
- The `HOOKS.md:266` mode list and the `state_clear` mode enum in
  `docs/cancel-skill-active-state-gap.md:29-32` are two hand-maintained copies of one
  vocabulary, and the gap document is the record of them drifting. That is the
  ordered-teardown failure, recorded here because the record was found while
  verifying this technique's citations.
