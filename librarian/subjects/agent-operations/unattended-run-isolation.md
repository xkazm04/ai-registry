---
domain: agent-operations
subject: unattended-run-isolation
last_touched: 2026-09-29
touched_by: deepen, intake
dry_streak: 0
---

# unattended-run-isolation

Subject note. Part of [[index]]; graded against [[standard]].

First touch by `/deepen`: a single-subject run, dispatched by the Curator lane on the scan
finding "3 techniques (design floor is 4)". Registry HEAD at dispatch was d93fbd78.

- The primary checkout's main was behind origin, so the run worked from origin/main in a
  detached worktree.
- Two sibling runs landed in the same bundle mid-run, deterministic-run-verification and
  engine-behaviour-profiles. The content commit was rebased over them and the generated
  files rebuilt.
- An older worktree of an earlier attempt on this subject was found clean and unlanded,
  and was left in place.

## 2026-09-27 - arrangement is not enforcement, a remote is not the credential, an empty directory cuts no user layer

**Depth rung:**
- L2 primary for the flips.
- L3 empirical for hermetic-inherited-configuration, measured on a fleet benchmark's calls.
- L3 empirical for the no-remote probe, run on the fleet machine.

Sources. Every quote was read verbatim in fetched page text, and the load-bearing ones were
re-grepped by the Director:
- The agent runner's sandboxing documentation:
  - "Effective sandboxing requires both filesystem and network isolation."
  - "Native Windows is not supported."
  - "Read, Edit, and Write use the permission system directly rather than running through
    the sandbox."
  - A worktree run may write the main repository's shared metadata, except `hooks/` and
    `config`.
  - A fail-if-unavailable setting.
- The vendor's engineering post on the sandbox: credentials "are never inside the sandbox";
  "reduces permission prompts by 84%". The figure is about prompts, not security, and was
  not used as a security number.
- The runner's headless documentation: without its bare mode, a `-p` session runs a
  project's hooks and connects its tool servers "even in a folder you've never trusted".
  The bare mode reads no OAuth or keychain credentials.
- A second vendor's sandbox documentation: network off by default, a native Windows
  sandbox, and a worktree's resolved git directory protected read-only.
- git's own documentation:
  - worktree: "the repository `config` file is shared across all worktrees"; all `refs/`
    are shared except bisect, worktree and rewritten.
  - clone: with `--shared`, the "cloned repository will become corrupt" if the source prunes.
  - gitcredentials: path is not matched by default.
  - push: a destination can be a URL.
- A code host's security lab on persisted checkout credentials; the checkout action's
  changelog.
- The Nx supply-chain advisory and postmortem, and an MCP prompt-injection write-up:
  publishing through an API token with no git remote.
- A package installer's caching page: "If the build is successful, this wheel is added to
  the cache and used in subsequent installs." A package manager's cache page: integrity
  verified on insertion and extraction.
- Simon Willison's lethal trifecta post.
- The devcontainer reference and its firewall script (`iptables -P OUTPUT DROP`, with a
  self-verification against an outside host).

**Lanes:** three.
- A blind training-data lane.
- A web counter-evidence lane.
- A primary-source practice lane.

**Convergence:**
- **os-enforced-run-boundary** was the blind lane's first choice and the practice lane's
  first choice. The counter-evidence lane reached it independently: vendors require
  filesystem and network enforcement together.
- **hermetic-inherited-configuration** was the runner-up on the blind and practice lanes,
  then measured in the fleet. Two lanes plus an empirical case earned it technique placement.

**Landed (0ea31221):**
- **New technique, os-enforced-run-boundary.**
  - Writes are confined and egress is denied by the operating system, together or not at all.
  - Credentials stay outside the boundary, behind a proxy.
  - The run refuses to start unconfined.
  - A known-bad and a known-good probe run before the queue.
  - A section on what the boundary does not cover: runner file tools, shared repository
    references under worktrees, remaining egress, mounts.
- **New technique, hermetic-inherited-configuration.**
  - The environment is built by allowlist, and inherited version-control path variables
    are dropped.
  - Configuration layers are cut by name.
  - One argv builder.
  - The isolation profile goes in every cache key.
  - What loaded is read from the runner's init record, against a control.
- **Flipped, golden path, the repository.** Removing the remote stops an accident, not a
  publish. The guarantee is no write credential and no egress.
- **Flipped, golden path, credentials.** They live in files, keyrings, helpers and
  sockets. Strip by allowlist, deny credential-file reads, and proxy what is needed.
- **Widened, golden path.**
  - Inherited configuration now covers the repository's own headless hooks, version
    control's global and system configuration, and exported variables.
  - A new section, "Arrangement is not enforcement", with the platform condition.
  - The testing section gains a known-bad probe, a known-good probe, and a read of what
    loaded.
- **Corrected, disposable-run-environments.**
  - A linked worktree shares configuration, refs, stash and hooks.
  - A borrowing clone can be corrupted by the source pruning.
  - A kept incident environment is made self-contained first.
- **Conditioned, no-links-into-live-trees.**
  - The cache exception now requires verification on read, read-only by mount, no built
    artefacts, and no hard links into projects.
  - A recursive delete can follow a junction into its target. This is the fleet's own
    2026-09-15 hazard.
- **Pointer, confine-configured-output-paths.** An enforced boundary turns an escape into a
  refused write, and the rewrite is still owed.
- **Verified and left untouched:**
  - "Never let two runs share a working tree".
  - "A shared build-output directory is never acceptable". The installer's wheel cache
    supports it.
  - "Isolation is a claim to be tested".
  - The landing-gate section.

**Applied:**
- **hermetic-inherited-configuration: `better`, code, in personas' memory-year harness.**
  - A "no tools" call from an empty directory loaded 25 tools, 30 skills, 1 plugin and 3
    user hooks, whose prompt-submit hook posted each prompt to a local app.
  - That came to 23,296 input tokens, against 497 isolated.
  - Fixed in ef9aead69, pushed: an isolation profile, the profile in the cache key, and a
    check with the unflagged call as its positive control.
  - A FINDINGS entry says what the earlier ladders' numbers still mean.
- **os-enforced-run-boundary: `better`, simulation.**
  - Four fleet incidents were walked through both policies. The arranged policy prevented
    0 of 4. The enforced policy refuses three at the first write, and the fourth's
    configuration and identity writes.
  - Condition gained: shared references cross a worktree sandbox.
  - Code mode waits for a fleet runner in a container, VM, Linux subsystem or separate
    account.
- **Golden-path flip: `better`, experiment.**
  - A repository with no remote listed a private forge repository through the system
    credential helper (exit 0).
  - Helper reset: 128. Public control: 0.
  - Read access only; no push was tried.

Impact: none. No fleet map pairs a context with this subject (0 of 12 maps; a known-positive
subject was found in every map), so no verdict went stale.

**Banked leads:**
- **Weak audit by modification time.** Extractors and preserving copies keep old times.
  Content hashes or filesystem auditing are stronger. One lane only. Return when a fleet
  audit misses a rewrite it should have seen.
- **Per-run scoped, short-lived forge credentials.** App installation tokens and
  fine-grained tokens. One lane only. Return when a fleet runner needs to push from inside
  a run.
- **Other fleet test suites that create repositories.** The hook-exported path leak was
  fixed in two repositories, and the rest were never examined. Return with a fleet sweep
  for fixture git under hooks.
- **Point HOME at the run.** A home-relative destination then confines itself. One lane only.

**Declined:**
- The 84% figure as a security measure. It measures permission prompts.
- A benchmark harness's per-instance containers as egress precedent. They run on the
  default network, so they are cited for disposability only.
- `GIT_CONFIG_NOGLOBAL`, which this run's own lane brief proposed. It does not exist in
  git's documentation. The blind lane's `GIT_CONFIG_GLOBAL` and `GIT_CONFIG_NOSYSTEM` do.

Yield: high. dry_streak 0. Scan points 9 -> 5. The finding that ranked it is cleared;
"single stack" and "never swept" remain.

Source classes, this run. Kept:
- vendors' own sandbox and CLI documentation, read raw;
- a tool's own manual for its semantics (git);
- security advisories and postmortems from the affected maintainers.

Declined as sole support: fetch-tool summaries, and figures quoted outside what they measure.

## 2026-09-28 - fourth send, declined (run `dp-uri-0928b`)

Declined, no pass. The Curator lane sent the finding "3 techniques (design floor is 4)" again,
from dispatch HEAD bd295204, which is 237 commits behind origin/main (2d4a24be). At origin the
subject has had five techniques since `dp-uri-0927` (0ea31221). The two sends between,
`dp-uri-0927b` and `dp-uri-0928`, recorded `idled` and added no note. No commit since the first
touch's ledger commit (86b4c0e2) changes the subject folder or this note. `check-currency`
reports 0 expired and 0 at-risk, with no row for this subject. The run records `declined`, not
`idled`: the subject has had one pass, not two dry ones. dry_streak is unchanged; the banked
leads were not re-checked. The fix belongs in the dispatcher: read origin, and read
`librarian/runs/*/result.json` for the subject before sending.

## 2026-09-29 - intake PilotDeck ([[2026-09-29-pilotdeck-agent-os]], run `in-pd-0929`)

Landed `diff-from-the-recorded-base`: the read-back that stages the worktree and diffs against its own
head loses everything the agent committed; a copy-of-a-directory has no base at all; a dirty-tree
checkpoint commits untracked local files onto the operator's branch; and the landing is a model turn
whose success is the absence of an error event. Source tree executed (`node--diff-from-the-recorded-base`);
a fleet dispatcher fixed and paired (`node--diff-from-the-recorded-base--pof`, code, better). Contrast
application `node--os-enforced-run-boundary`: a deny list over command patterns against seventeen
commands, eleven of which walk past it (some are other commands that publish or reconfigure), including any command with a line break in it.
