---
subject: streamer-in-charge-moderation
domain: media-generation
last_touched: 2026-11-03
dry_streak: 0
---

# streamer-in-charge-moderation

First note. The subject was harvested on 2026-11-02 (326b3b04e) from one Castle Control
tree. A Curator dispatch ranked it on "single stack (rust)".

## State

6 techniques, 4 applications: 2 `rust` (Castle Control 8ef2d8e) and 2 `typescript`
(Castle Control origin/main 0b1c6b7). The stack finding is answered from the same tree.
The TypeScript side is the contract door, the ban card and the headless MCP package. It
is not only a renderer: it decides what an agent can reach and what a card can confirm.

## 2026-11-03 - deepen (sicm-deepen-1103)

Landed in 5ed3e12da (catalog fc9bad104). Lanes:
- **Field, Castle Control at origin/main 0b1c6b7** (git-archive export). The files read
  were gatehouse-core-bans.ts, gatehouse-core.ts, rooms/moderator/core-bans.tsx,
  moderation-lifecycle.ts, moderation-model.ts, the contract's gatehouse tests and the
  generated schema, headless tools.ts with its tests, the core's review.rs and
  store.rs, and cc-core gatehouse/reads.rs. 25/25 anchors held.
- **Field, fleet seam search** (per project, with Castle Control's `cc-twitch` as the
  known positive): searched for Helix ban and timeout calls outside markdown. gravitone
  had none. **overlord has a chat moderator** (`crates/shadowrunr-daemon/src/moderator`,
  read at 9a8a94c). It is the lane Castle Control's gatehouse was adapted from, it acts
  through Helix when armed, and no fleet map joins it to this subject.
- **Counter-evidence, platform**: suspected-evader detection, restricted-message
  visibility, the emergency mode's term bulk-ban, and held-message expiry. The platform
  help centre renders client-side and returned nothing to a fetch. The claims rest on
  several outlets quoting the 2021 and 2022 launch posts verbatim.
- No blind training-data lane ran. Neither landing is a new technique. Both are
  conditions on existing decision rules, and the platform claims are vendor facts that
  training memory cannot settle.
- `check-currency --volatile --subject`: one fact per layer ("two minutes" / "120
  seconds", the review window). That is the tree's own constant, not a platform
  setting. Untouched.

What moved:
- **Condition (arming-as-a-logged-grant): an AI agent never arms.** Agents may draft
  and test in shadow. Arming, confirm, resolve and grant end stay off the agent's tool
  surface, pinned by a partition test. Castle Control realizes it
  (`packages/headless/src/tools.ts` ARMED, `tools.test.ts:30`), and goes further: it
  also denies rule writes. overlord is the counter-instance. Its guide sets
  `mcp_allow_writes = true` and lists "Arm the moderator." as a prompt
  (`docs/guide/moderator.md:47`, `:309`), a written list is hot-applied on the next
  message (`:293`), and the mode persists across restarts (`:326`). Cross-linked to
  agent-host-experience's depth handoff.
- **Condition (shadow-by-default-rules): an incident arm ends with the incident.** The
  rule returns to shadow when the grant or session that justified it ends. The source
  is the platform's own emergency mode, whose auto-ban terms "reset after every Shield
  Mode session" (quoted in Dexerto's and Yahoo's launch coverage, 2022).
- **Golden path refinement.** The platform's own automatic removal is shaped as a lease
  over streamer-written terms inside an emergency mode, cleared per session. That
  agrees with the grant technique's "deterministic patterns only".
- **Confirmed untouched.** The platform says its evader classifier is not accurate
  enough to ban alone ("no machine learning will ever be 100% accurate ... That's why
  Suspicious User Detection doesn't automatically ban", attributed to Kotaku, PC Gamer
  and Malay Mail, 2021). Restricted accounts' messages show only to the streamer and
  moderators. Both came from search-result summaries that agreed across two queries. The
  articles were not fetched verbatim, and the platform's own page did not render. The
  bulk-ban-and-reset claim was read from a fetch of Dexerto.
- **New applications.** `typescript--decide-on-the-stored-original` records the
  contract door (it refuses a pending ban without text, or with a `summary`), the
  id-only confirm, and text taken from the recorded line. Its deviations: the core-backed
  card keeps Confirm live when the line is missing, while the fixture preview refuses; no
  RPC exposes the core's own `pending_bans()`; and zero-width characters stay invisible
  on the card while the matcher strips them. `typescript--arming-as-a-logged-grant`
  records the nonblank consent at the contract and the headless partition. Its
  deviation is a canned arm reason.
- **Applied, simulation, better (1 row)** for the agent rule: B is better on 2 of 3, with
  1 tie. **Unapplied (1 row)** for the incident rule: no fleet tree arms for an incident.
  Trees not edited.
- **Not re-researched this pass**: ban-review-window-with-invalidation,
  scoped-expiring-auto-action-grant and room-intents-cannot-name-a-person. They are one
  day old, drawn from a tree read at harvest, and the platform pass agreed with them.

## Impact

No pairs: the subject joins no fleet project's map (0 occurrences in all 12 maps;
live-chat-moderation-and-anti-bait in gravitone and overlord is the positive control).
The landing moved the media-generation digest in overlord, gravitone and systedo-case.
Their maps were regenerated and committed locally (overlord b67a74d, gravitone e1a39c55,
systedo-case 2435a045) and not pushed, because each branch already carries other
sessions' unpushed commits. The other nine maps also regenerated. Their diffs are
software-engineering digest moves from other sessions, and they were left uncommitted.

## Banked

- **overlord's moderator is an unjoined seam, and the subject's largest demand.** It
  arms globally rather than per rule, an armed pattern hit times out or bans with no
  review window, the mode persists, and an agent can arm and rewrite rules. Return: run
  `/conform` on overlord against this subject once its map joins it. That needs a scope
  or context that names the moderator lane. The registry side owes nothing until then.
- **A `code` row for the agent rule.** Return when overlord's moderator gains per-rule
  arming. The first change is to drop `moderator_mode_set` from its MCP write set.
- **The card's confirm-without-original.** It is cheap to fix in Castle Control: adopt
  the preview's `original_unavailable` refusal on the core-backed card, or expose
  `pending_bans()` over RPC. Return when the owner works the moderator room. That tree is
  outside the fleet.
- **Held-message expiry on the platform.** A third-party client (2026-11-02) reports that
  a held message is dropped after five minutes with no event. The platform docs say
  nothing either way. That is not needed by the subject, which governs the tool's own
  queue. Return if a technique ever leans on the platform's hold length.
- **"Automatic ban on suspicious accounts" as a platform option.** One outlet (PC Gamer,
  2021) said it exists, and it was not corroborated. If true, it would be a platform
  being bolder than its own stated accuracy. Return with a rendered copy of the
  suspicious-user help page.
