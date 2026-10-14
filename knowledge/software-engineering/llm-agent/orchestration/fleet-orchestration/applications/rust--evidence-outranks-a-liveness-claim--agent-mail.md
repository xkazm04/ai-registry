---
layer: application
type: application
subject: fleet-orchestration
technique: evidence-outranks-a-liveness-claim
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@1.100
---

# Reclaiming a file lease only when the leased files have gone quiet (Rust)

Read in the Rust tree of a local mail-and-lease server for coding agents that
share one checkout (version 0.3.39, commit
`3821104cce477cefb1eccf5592b76da9c45b1582`). Its toolchain file pins a nightly
that it says provides 1.100
(`rust-toolchain.toml:2 "The pinned compiler provides Rust 1.100"`), also the
workspace minimum (`Cargo.toml:24 "rust-version"`). Citations were opened in a
clone on 2026-10-15 and verify with `check-anchors` against that commit.

**decision.** A lease lapses on its time to live. Before that, another agent may
force-release it only when every activity signal is stale: the holder's last
activity past an inactivity bound (30 minutes by default), and no mail, no
filesystem change on the leased paths and no git activity on them inside a grace
window (15 minutes) - or when the lease has already expired. The released holder
is told which signals were stale.

**forces.** Agents vanish and their leases would block honest ones; a quiet
agent may be mid-edit, and silence alone would hand its files to a second
writer.

**buys.** A lease on files that are still changing cannot be force-released.

**rejects.** Locks without expiry, and reclaim on silence alone.

## What the tree does that the technique asks for

- **Evidence the work wrote outranks the holder's silence.** Release needs all
  four signals stale
  (`crates/mcp-agent-mail-tools/src/reservations.rs:2920 "let all_signals_stale = agent_inactive && mail_stale"`),
  so one recent edit on a leased path refuses it
  (`crates/mcp-agent-mail-tools/src/reservations.rs:2924 "Reservation still shows recent activity; refusing forced release."`).
- **Entering a guarded section refreshes the report.** Every acting call,
  including the grant itself, touches the holder's activity time
  (`crates/mcp-agent-mail-tools/src/reservations.rs:1803 "crate::tool_util::touch_acting_agent(ctx, &pool, agent.id).await;"`).
- **The release is conditional.** It succeeds only if the lease is unchanged
  since the judgement
  (`crates/mcp-agent-mail-tools/src/reservations.rs:2935 "If another agent renewed the reservation while we were calculating"`).
- **The automated releaser is demoted.** The built-in coordinator withdraws a
  queued release when newer activity arrives
  (`CHANGELOG.md:199 "withdraws an automatic reservation release when the agent"`),
  and by default it only observes
  (`README.md:1255 "observe/decide, emit nothing durable"`).

## Where the tree departs

- **Unknown reads as stale.** When the workspace cannot be resolved, the
  activity probe returns its empty default
  (`crates/mcp-agent-mail-tools/src/resources.rs:4637 "let Some(workspace) = workspace else {"`),
  which the release counts as no recent filesystem or git activity. A missing
  holder row also counts as inactive
  (`crates/mcp-agent-mail-tools/src/reservations.rs:2866 "holder_last_active_ts.is_none_or"`).
  An instrument that could not look is read as one that saw nothing.
- **Expiry outranks evidence.** An expired lease is releasable whatever the
  files show (`crates/mcp-agent-mail-tools/src/reservations.rs:2921 "if !all_signals_stale && !is_expired {"`),
  and the guard stops honouring it. The technique grants expiry that authority
  only with a dedicated renewal loop and fenced writes. Here renewal is a manual
  tool call (`crates/mcp-agent-mail-tools/src/reservations.rs:2597 "Extend expiry for active file reservations held by an agent"`),
  the default lease is an hour, and nothing fences the holder's later writes, so
  the deadline is a self-report budget the technique says should not win.
- **New files carry no evidence.** A lease on paths that do not exist yet
  matches nothing, so only the holder's activity time and its mail protect it.
- **History.** The Python predecessor at commit 47b8122e ran the same
  four-signal test on every reserve call and released stale holders unasked,
  with a background sweeper on by default. The rewrite keeps the sweeper's two
  phases (`crates/mcp-agent-mail-server/src/cleanup.rs:5 "Phase 2: release stale reservations by inactivity heuristics"`)
  but ships it off (`crates/mcp-agent-mail-core/src/config.rs:1800 "file_reservations_cleanup_enabled: false,"`),
  so with the coordinator also off a crashed holder's lease returns, short of
  a peer's force-release, only by expiry (`README.md:1254 "reclaimed only by TTL expiry"`).

## What this realization cannot do

It cannot tell a holder that is thinking from one that is gone inside the
inactivity bound. It cannot stop a released or expired holder from continuing to
edit; a new holder's lease refuses its commit, and nothing tells it sooner.

## What the tree's shape says about the technique

The tree could not have been built to prove that evidence beats the budget: it
keeps no replay of false-dead releases. Its shape sharpens the technique in one
place: the filesystem and git signals are computed for the leased paths, not
for the agent, so the evidence is about the guarded object rather than about
the session in general. And it shows the three-valued rule broken in practice:
a probe with no target folds into stale, the unknown-as-dead path the technique
forbids.
