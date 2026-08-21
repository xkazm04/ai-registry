---
layer: technique
type: technique
subject: short-form-narrative-structure
technique: nested-open-loops
status: forged
laws: []
shared_with: []
use_when: [auditing mid-video retention, planning act transitions, verifying every opened question gets paid]
---

# Nested open loops

The retention architecture that follows from treating curiosity gaps as
debts: **one large loop opened by the hook** (the video's promise), **one
medium loop per act**, and **micro-loops inside scenes** — a forward
reference, a deferred definition, a "which turns out to matter later". Loops
close in reverse order of opening, and the big one closes last. The
invariant this maintains is simple and is the entire point: **at every
second of runtime, the viewer holds at least one open loop.** The moment no
loop is live, the piece is finished whether or not the footage is.

The quiet killer this architecture defends against is not boredom but
*disorientation*. A viewer who no longer knows where they are in the
explanation — which question is being answered, why this material is here —
experiences it as boredom and leaves, but the cause is navigational.
Explicit signposting ("that is the theory — but in practice…", "which
brings us to the third question") costs two seconds and buys the entire
next act. Strong studios state this as a standing design goal: the viewer
always knows where they are.

## Procedure

1. **Map the loops before prose.** The hook's promise is loop zero; each
   question-stack entry is a medium loop; then walk the beat list and mark
   every micro-loop a beat opens (a teased mechanism, a named-but-deferred
   term, a "we'll see why that backfires").
2. **Check the ledger: every open must have a close, and every close an
   open.** An unpaid loop is a cheated viewer — they feel it even when they
   cannot name it. A close with no open (explaining something never asked)
   is a beat with no owner question; cut it or open its loop earlier.
3. **Check the nesting order.** Loops close innermost-first. A medium loop
   that closes after the hook's loop means the video kept talking past its
   own ending — the most common structural cause of a weak final minute.
4. **Check for dead air.** Find any span where all loops are momentarily
   closed — typically right after an act's answer lands, before the next
   question opens. Repair by opening the next loop *inside* the close of
   the previous one: the answer to act one should itself raise act two's
   question.
5. **Place the signposts.** At every act boundary, one explicit line that
   closes the finished loop and names the next. In short form this is four
   words; it is never zero.

## Decision rules

- **When runtime shrinks, cut loop count, not loop discipline.** A
  sixty-second piece may carry only the hook loop plus two or three
  micro-loops — but each still opens explicitly and pays explicitly.
- **Reopening beats withholding.** If the piece must answer its headline
  question early (and in explanatory work it usually should), immediately
  reopen the gap one level deeper — "but you were probably hoping for a
  better answer than that" is a legitimate, measured pattern. The loop
  ledger stays balanced; the loop just moves down a level.
- **A loop opened for retention but never structurally needed is bait.**
  If the close could be deleted without the argument losing a step, the
  open was manipulation, and audiences price it into the creator's next
  video. Every loop must be a question the *argument* needs answered.
- **When retention data shows a mid-video cliff, look for the loop gap
  before blaming the content.** The material at the cliff is usually fine;
  the loop that should have carried the viewer across it was never opened.

## When not to use it

- **Below ~40 seconds**, where hook and payoff are adjacent and there is no
  middle to architect; nesting machinery adds signposting the format cannot
  afford.
- **Ambient or mood-first content** that holds attention through texture
  rather than inquiry — loop discipline applied there produces a narrated
  anxiety the format does not want.
- **As a substitute for causal beat linking.** Loops keep the viewer
  oriented across acts; they do not repair an "and then" chain inside one.
  A perfectly signposted wiki timeline is still a wiki timeline.
