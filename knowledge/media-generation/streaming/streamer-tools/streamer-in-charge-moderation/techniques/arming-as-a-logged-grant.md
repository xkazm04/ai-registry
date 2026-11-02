---
layer: technique
type: technique
subject: streamer-in-charge-moderation
technique: arming-as-a-logged-grant
status: forged
laws: [edit-do-not-regenerate]
shared_with: []
use_when: [moving an automated moderation rule from shadow to enforcing, designing what happens to an enforcing rule when it is edited, answering afterwards who allowed a rule to act]
---

# Arming as a logged grant

Arming a rule — letting it act on viewers instead of recording what it would do — is a
grant of power from the streamer to the machine, and it is recorded like one: an explicit
act, by an identified person, over one exact version of one rule, written to an
append-only log before the rule acts for the first time.

## Why a switch is not enough

A toggle in a settings page records the current state and nothing else. When a viewer
asks next week why they were timed out, "the rule was on" does not answer the questions
that matter: who turned it on, when, after seeing what, and was the rule that fired the
rule they approved. The last question is the one that bites. Rules are edited constantly
— a word added, a threshold lowered — and a toggle that survives an edit has silently
extended the streamer's approval to text they never read.

## The procedure

1. **Arm by explicit act, with a reason.** Arming is a distinct action in the tool, never
   a side effect of saving, importing, or restoring a profile, and it is refused without
   a non-empty acknowledgement. The reason is worth more when the streamer writes it than
   when the interface fills it in: a canned sentence proves a click, not a judgement. The
   default state of every rule on every load path is not armed.
2. **Write the grant before the power.** The log entry — rule identity, rule version
   (a content hash of the pattern, scope and action), who armed it, when, from which
   surface, the reason, and the shadow record size at the time — is appended to the
   decision log *before* the configuration that arms the rule is written. A crash between
   the two leaves a logged intent and an unarmed rule, which grants nothing.
3. **Verify the grant against the log, not the configuration.** The enforcing path treats
   a rule as armed only when its stored consent names a log entry that exists, and when
   the running rule equals the version that consent covered. A configuration file edited
   by hand to say "armed" has no entry behind it and acts on nobody.
4. **Bind the grant to the version.** An edit produces a new version; the consent does
   not carry across. Either refuse to save an edited rule except in shadow, or save it
   disarmed — both are honest; the refusal has the advantage that nobody discovers the
   disarm by the rule's silence.
5. **Disarm is logged too.** Disarming, expiry and automatic disarm on edit are entries
   in the same log, so the history reads as a sequence of grants and withdrawals.
6. **Keep the arming context narrow.** Where the tool distinguishes contexts — a
   rehearsal against simulated chat versus the live channel — an arm in one is not an arm
   in the other. A rule armed during a rehearsal has been trusted with simulated people.

## Decision rules

- **When a profile or backup is restored**, every rule comes back disarmed with its
  history. Restoring a grant without its granter present is not a grant.
- **When a moderator, not the streamer, arms a rule**, the grant records the moderator,
  and the streamer's view shows who holds which grants. Whether moderators may arm at all
  is the streamer's setting, not the tool's assumption.
- **When a rule's action is changed** (hold to timeout, timeout to ban), treat it as a new
  rule, not an edit: the shadow record of the old action says nothing about the new one.
- **When nobody can say who armed a rule**, it is disarmed. Unattributed power is not
  power the streamer gave.
- **When a rule encodes a safety outcome** — a disclosure must reach the streamer, never a
  timeout — it is not armable or disarmable at all. Its detector is owned by code and only
  its delivery is configurable; a toggle on it would turn a rail into a preference.

## When not to use it

A personal tool used by one streamer alone, with no moderators, no appeals and no
history requirement, can collapse the log to a timestamp per rule — but the
version binding stays, because the edit problem exists with one user as much as with
twenty.
