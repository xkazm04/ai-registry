---
layer: technique
type: technique
subject: candidate-status-transparency
technique: terminal-state-copy-without-implying-merit
status: forged
laws: [say-only-what-the-record-holds, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [writing the copy a candidate sees when a requisition closes, distinguishing a considered decline from a process ending, reviewing terminal-state wording for unsupported claims]
---

# Terminal-state copy without implying merit

The concern: several different things end an application, and only one of them
is a judgment about the person. A considered decline is. A withdrawal is not.
A hire of someone else is not. And a **closed, filled, frozen or cancelled
requisition** is emphatically not — the person may have been next in line, or
may never have been read at all. Yet the easiest copy to write, and the copy
most systems ship, is the same sentence for all of them: *you have not been
selected*.

That sentence, applied to a requisition-level event, attributes to the
candidate an evaluation that never took place. It is an unrecorded adverse
claim about a person, in writing, from the party that decided — the precise
thing [say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds)
forbids. It is also, in a small but real number of cases, refutable: the
candidate learns from someone inside that the role was pulled for budget, and
now has a documented instance of your process telling them something untrue
about themselves.

## The procedure

1. **Separate the terminal *cause* from the terminal *state*.** The state the
   candidate sees is "this application is closed and you are not moving
   forward". The cause — declined on review, requisition cancelled, filled,
   withdrawn — decides which copy variant renders, and is not itself always
   disclosable.
2. **Write one variant per cause, and audit each for merit implication.** Read
   every sentence asking: does this assert anything about how good this person
   is, or how they compared? If the record does not hold that assertion, cut
   it.
3. **For a requisition ending, name the structural truth and stop.** The role
   is no longer being filled through this process; the application is closed;
   we are not moving forward with it. No comparative language ("a stronger
   match", "a closer fit"), and equally no consolation flattery ("your profile
   was impressive") — an unrecorded flattering claim is still an unrecorded
   claim, and it is read as either patronising or as evidence of a decision
   that was made on other grounds.
4. **Never present an automated outcome as a final adverse decision.** A
   terminal state visible to the candidate must correspond to an outcome a
   human ratified, per
   [no-adverse-outcome-is-solely-automated](../../_laws.md#no-adverse-outcome-is-solely-automated).
   A machine recommendation awaiting review is *in progress* on this surface,
   not *not selected*.
5. **Give the terminal state somewhere to go.** How long the application is
   retained, whether reapplying is meaningful and when, and how to reach a
   person. A terminal state that ends in a full stop reproduces the silence
   the whole subject exists to remove.
6. **Keep the surface consistent with what was sent.** If a decline message
   went out with a recorded reason, the status view must not contradict it or
   append a different one. The message sibling owns the letter; this owns the
   page; they must not tell two stories.

## Decision rules

- **When the cause is not disclosable, say the structural truth, not a
  plausible one.** "This role is no longer being filled" is true and sayable
  when the cause is an internal appointment. Inventing a candidate-side reason
  to avoid an awkward one is the failure.
- **When the same words could describe both a decline and a closure, rewrite
  them.** Shared copy across causes is how the merit implication leaks back in
  after the first careful pass.
- **When the candidate reached a late stage, the register changes but the rule
  does not.** More acknowledgement of their investment, same prohibition on
  claims nobody recorded. Stage-appropriate register belongs to the rejection
  sibling; borrow it, do not re-derive it.
- **When someone asks to add "we'll keep you in mind for future roles",
  check whether that is true.** If no rediscovery process exists, it is a
  promise of a channel that does not exist — the same honesty rule the
  communication sibling enforces on outbound channels.

## When NOT to use it

- **This is not the decline letter.** What a considered rejection says, with a
  reason drawn from the record and a feedback ceiling, is a sibling subject's
  material. Do not duplicate its reason-selection rules here; this technique
  governs only the terminal state as rendered on the candidate's own view.
- **Not for internal terminal states.** Recruiters need the real cause, plainly
  named, including the ones that cannot be told to the candidate.
- **Not a substitute for notifying.** A terminal state discovered by a
  candidate who happens to check the page is not communication. The outbound
  message is owed regardless; this surface is where they confirm it, not where
  they learn it.
