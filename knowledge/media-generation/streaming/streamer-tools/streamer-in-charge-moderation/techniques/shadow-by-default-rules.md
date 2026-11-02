---
layer: technique
type: technique
subject: streamer-in-charge-moderation
technique: shadow-by-default-rules
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [a streamer writes or imports a new automated chat rule, deciding what a rule does before anyone has seen it fire, showing a streamer whether a rule is ready to enforce]
---

# Shadow by default

Every automated moderation rule is created in shadow. A shadow rule runs on the real
chat, records every message it would have acted on and the action it would have taken,
and acts on nobody. It leaves shadow only when the streamer arms it, and only a rule with
a shadow record can be armed with any knowledge of what arming means.

## Why a rule must watch first

A rule is a guess about a community the author knows only partly. The failures are
regular and predictable: a blocked word that is a regular's nickname or a game term, a
link rule that matches the streamer's own sponsor, a repetition rule that fires on every
chant the streamer asked for, a new-account rule that catches the whole of a friendly
raid. None of these show up in a settings form. They show up on the first busy evening,
and an enforcing rule shows them by removing people. A shadow rule shows them as a list.

The same reasoning applies to rules that did not come from the streamer: a shared block
list, a template pack, an imported preset from another channel. They were tuned on
somebody else's chat. They start in shadow too.

## The procedure

1. **Create in shadow, always.** There is no "create and enable" path. The rule's state
   is shadow from its first save, whatever the form looked like.
2. **Record would-have actions, not just matches.** Each shadow hit stores the message as
   captured, the account, the rule and its version, and the action the rule *would* have
   taken. "Matched 40 times" is not reviewable; forty rows with the message beside each
   are.
3. **Holding still wins where it already applied.** Shadowing a rule never weakens a
   protection that was already in force: a message another armed rule, the care rail, an
   unavailable classifier or the platform's own screen held stays held. Shadow removes the
   rule's *action*, never the pipeline's caution.
4. **Present the record as a decision aid.** Show the streamer the hits grouped by what
   they would have done, with the false-positive candidates easy to spot (regulars,
   moderators, the streamer's own links), and the count of messages the rule saw in total
   so a quiet rule is distinguishable from a rule that has not yet run.
5. **Re-enter shadow on edit.** A changed pattern is a new hypothesis. The edited rule
   returns to shadow and its old record is kept, labelled as belonging to the old version.
   A save path that would store a changed rule in an armed state is refused outright:
   saving a rule is never arming consent.
6. **Let a session be forced into shadow.** Provide a session-wide restriction that turns
   every armed rule's hits into would-have records for the life of the process, applied
   before anything is persisted and impossible to lift mid-session. Use it whenever the
   tool first meets a live channel or the operator is unsure what is armed. It overrides
   the saved configuration without rewriting it, so ending the session restores exactly
   what the streamer armed — no more — and the restriction leaves no trace to be mistaken
   for a disarm.

## Decision rules

- **When a rule has seen no traffic**, its readiness is *unmeasured*, not clean. Do not
  present "no false positives" for a rule that has never fired; present "not yet
  exercised".
- **When the streamer wants a rule armed immediately** during an incident, arm it through
  the logged grant with its empty record visible, and prefer a room intent (slow mode,
  followers-only) for the incident itself — it addresses nobody and is trivially undone.
- **When shadow hits reveal a regular**, offer an exemption rather than a pattern edit
  where the rule is otherwise right; exemptions are narrower and easier to audit.
- **When a rule's would-have action is only to hold a message for review**, the shadow
  period may be short, because the armed rule's error is itself reviewed by a person.
  Rules whose action lands on an account need the longer look.

## When not to use it

Shadow is for rules that act. A rule whose only effect is to highlight a message to the
streamer — a colour, a flag in the tool, no platform action — has no armed state worth
guarding and can run live from creation. And the platform's own built-in screens are
not the tool's to shadow: they are configured on the platform and the tool reports their
state rather than duplicating it.
