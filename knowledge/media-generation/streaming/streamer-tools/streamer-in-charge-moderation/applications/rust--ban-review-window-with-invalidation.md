---
layer: application
type: application
subject: streamer-in-charge-moderation
technique: ban-review-window-with-invalidation
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97.1
---

# Rust: the Gatehouse ban queue in Castle Control

Castle Control (local checkout `CastleControl`, `main` @ 8ef2d8e) is a desktop toolkit a
human Twitch streamer runs beside OBS. Its `cc-gatehouse` crate screens every chat message
before any other module sees it, and its ban review is the realization of this technique:
a classifier or rule may *propose* a ban, a person confirms it inside 120 seconds, and the
confirm re-validates the proposal's premises at the moment of the click. The plan states
the stance in one line,
`docs/plan/03-implementation-plan.md:321 "**Safety does not live in the prompt.** It lives in a deterministic gate at the last door before any action."`,
and pins the queue's three properties,
`docs/plan/03-implementation-plan.md:332 "The ban queue.** It is durable and survives a restart. A person decides on the real message, never a summary. A timeout on the decision means hold, never proceed."`.

## Where a proposal is born

The final action gate in `lane.rs` turns an armed rule's ban into a proposal unless the
rule's own auto-ban grant allows it:
`crates/cc-gatehouse/src/lane.rs:273 "} else if action == Action::Ban && !self.auto_ban_allowed(&rule, &at)? {"`,
recording `DecisionKind::BanPending` with a `Hold` verdict at
`crates/cc-gatehouse/src/lane.rs:274 "decision.kind = DecisionKind::BanPending;"`. Shadow and
unconsented rules never reach this branch — they become `WouldAct` first
(`crates/cc-gatehouse/src/lane.rs:263 "if self.shadow_only"`), and a rule that changed
under the gate is an internal error, not a match
(`crates/cc-gatehouse/src/lane.rs:259 "if managed.rule != rule {"`). Messages from verified
moderators and the broadcaster take the `VerifiedAuthority` path and are never proposed
(`crates/cc-gatehouse/src/lane.rs:236 "} else if msg.privileged() {"`), and a viewer in care
is held on the care path before any rule is considered
(`crates/cc-gatehouse/src/lane.rs:231 "} else if care {"`).

## The window, and what expiry means

The constant and its meaning are stated together:
`crates/cc-gatehouse/src/review.rs:11 "/// No unattended expiry ever approves a ban. Expired reviews are held and must"`,
`crates/cc-gatehouse/src/review.rs:13 "pub const REVIEW_TIMEOUT_S: i64 = 120;"`. Expiry is not a
background job that writes a terminal state; it is enforced where the action is taken.
`ban_confirm` computes the proposal's age from its stored timestamp and folds every premise
into one boolean:

- age inside the window — `crates/cc-gatehouse/src/review.rs:80 "&& (0..REVIEW_TIMEOUT_S).contains(&age)"`;
- the rule now running equals the snapshot stored on the proposal and is still armed —
  `crates/cc-gatehouse/src/review.rs:76 "Some(&m.rule) == queued.rule_snapshot.as_ref() && m.rule.mode == RuleMode::Armed"`;
- the gate is available and the session is not shadow-only —
  `crates/cc-gatehouse/src/review.rs:78 "let allowed = self.gate_available"`;
- the target has not become privileged, rehearsal proposals stay in rehearsal, and the
  viewer is not in care —
  `crates/cc-gatehouse/src/review.rs:84 "&& !self.caring(&original.user_id)?;"`.

Any failed premise yields `Held` with reason `review_expired_or_withheld` and no action
intent (`crates/cc-gatehouse/src/review.rs:99 "review_expired_or_withheld"`). The
proposal is resolved exactly once: a second confirm finds a child record and returns
`Conflict` (`crates/cc-gatehouse/src/review.rs:26 "decision already resolved"`).
Undo and petition are new child records against a reversible decision, never edits
(`crates/cc-gatehouse/src/review.rs:129 "// Undo is a human reversal request, not a new punishment."`).

The session-wide shadow restriction that `shadow_only` reads is described where the live
pipeline wires it:
`crates/cc-core/LIVE-PIPELINE.md:92 "shadow restriction wins over saved armed rules **before** audit persistence:"`.

## The streamer's surface

The desktop card is in `apps/desktop/src/rooms/moderator/core-bans.tsx`. It shows the
stored line, the rule and the window
(`apps/desktop/src/rooms/moderator/core-bans.tsx:39 "<em>Confirm within {BAN_REVIEW_S} s</em>"`),
and reports expiry in words that say nobody was removed
(`apps/desktop/src/rooms/moderator/core-bans.tsx:49 "expired unreviewed; none was banned."`).
Arming in this surface is labelled by context: the button reads "Arm in rehearsal"
(`apps/desktop/src/rooms/moderator/core-bans.tsx:61 "aria-label={`${armed ? 'Back to watching' : 'Arm in rehearsal'}: ${rule.name}`}"`).

## Deviations from the technique

- **Fewer invalidations than the standard names.** The confirm does not check whether the
  message was since deleted, whether another moderator already actioned the account, or
  whether the platform connection can verify the target. The rule, care, privilege,
  session and age premises hold; the evidence- and target-changed premises do not exist yet.
- **No lighter action on the card.** The streamer can confirm the ban or dismiss it
  (`apps/desktop/src/rooms/moderator/core-bans.tsx:46 "onClick={() => { void port.dismissBan({ decision_id: item.decision_id }).then(port.refreshBans); }}>Dismiss</button>"`);
  there is no "delete only" or "short timeout" choice beside it.
- **Two copies of the window.** The interface keeps its own constant
  (`apps/desktop/src/gatehouse-core-bans.ts:4 "export const BAN_REVIEW_S = 120;"`) and
  filters "fresh" proposals by its own clock. The core re-checks, so the copy is a display,
  but a change to one constant would make the card lie about the other.
- **No live countdown.** The card states the window as static text rather than counting
  down from the proposal's time.
- **Rehearsal only.** On this commit the review runs against generated chat in the dress
  rehearsal; a confirmed ban is a simulated record and nothing reaches the platform
  (`apps/desktop/src/rooms/moderator/core-bans.tsx:52 "rehearsal store only, nothing sent to Twitch"`).
