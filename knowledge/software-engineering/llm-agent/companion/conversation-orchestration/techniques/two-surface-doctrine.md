---
layer: technique
type: technique
subject: conversation-orchestration
technique: two-surface-doctrine
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [deciding whether content goes to the chat or the ambient presence, the ambient surface is turning into a small chat window, a decision needs an answer without leaving the work]
---

# One companion, two surfaces

A resident companion is visible in two places, and the mistake that defines this
technique is treating them as one experience at two sizes. They are two
experiences with one memory. The **conversation** is where complete information
lives: the whole answer, the reasoning, the structured rows, the history, the
record. The **ambient presence** — a small persistent element the user sees
while working somewhere else entirely — is where quick information and decisions
live: a sentence, a number, a choice.

Without a stated rule, the ambient surface drifts. Every individual request to
show a little more there is reasonable, and their sum is a small, bad chat
window competing with the good one. So the rule is stated, and it is a rule
about the user's posture rather than about content length.

## The routing rule

**If the user must read to proceed, it belongs in the conversation. If the user
must only choose, it belongs in the ambient surface.**

- Reading is anything with structure, comparison or nuance — an explanation, a
  list of findings, code, a table, anything the user will scroll. The ambient
  surface's job for it is to say *there is something to read* and open it.
- Choosing is anything answerable by pointing at one of a few things whose
  options are self-explanatory or can be made so in a clause each.
- A **status** — one number, one state, one short sentence — is ambient by
  default, the cheapest thing the surface can do and why it earns its space.

The corollaries are what actually keep it clean. The ambient surface **never
paginates**: content that needs a second screenful failed the rule on the first.
It **never scrolls its own history**: it shows the current thing, and history is
the conversation's. And it **never hosts a composer as its primary interaction**
— a text field there invites the user to start a conversation in the surface
that cannot hold one.

## There is no third surface

The doctrine is only enforceable if the count is exactly two. A companion that
*also* raises toasts, corner pop-ups and notice popovers has three or four
places to look and no rule for which, and the ambient surface's permanent cost
is then buying nothing — the user watches the corner anyway.

So adopting the doctrine means auditing what already exists and retiring it, and
the retirement is the useful exercise: for each removed surface, say where its
content went. Almost everything lands in one of two places. The *informational*
part becomes a **state change on the presence** — a pulse, a posture, a badge
carrying a count and no words. The *content* becomes a **durable entry in the
conversation** — a card, a row, a ledger of what the companion did without asking.
A transient pop-up is the combination that keeps neither: it interrupts like a
state change and disappears like a message that was never recorded.

## Neither surface may be the only door

Both surfaces are conditionally present: the ambient presence hides when the full
conversation is open, and the conversation is closed most of the time. A decision
routed to a surface that is not on screen is one the user cannot answer, and it
sits there being counted as ignored. So a pending decision renders in **whichever
surface is present**, from the same state, under exactly complementary conditions
— two renderings of one decision, never two decisions, and never a window where
neither renders.

## One state, two renderings

Both surfaces read the same conversation state and the same turn lifecycle. The
ambient presence is not fed by a parallel notification pipeline with its own
copy of what is happening; if it were, the two would disagree, and a companion
that says one thing in the corner and another in the window is not one
companion.

The same holds for the option vocabulary. A decision's options — their ids,
their labels, their order — have one authority
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and both surfaces derive their rendering from it. Two hand-maintained lists of
the same three choices is a race with a delay fuse: someone adds a fourth option
in one place, and the other surface silently offers a decision that is missing a
possibility.

## The ambient decision, and how it is answered

A decision that lands ambiently carries a short question, a small set of
**numbered options**, and nothing else. The interaction is built for a user
whose hands are on the keyboard and whose attention is on other work:

- **A leader key arms the surface**, and only then do digits mean options. A
  surface that listens for bare digits will eat them out of whatever the user
  was typing, which is the fastest way to get an ambient feature disabled.
  Arming is visible — the surface shows that it is now listening — and disarms
  on a timeout, on escape, on any key that is not an option, and when the
  decision itself goes away. Arm it only while a decision is actually pending,
  and register it with the application's keyboard authority rather than on the
  global event target: the digits are almost certainly claimed by some other
  surface too, and with both listening directly one press fires both.
- **Digits answer.** One keystroke after arming, and the decision is made.
- **A reserved option always means *explain this, and recommend one*.** Zero is
  the natural key for it. This is the load-bearing detail of the whole
  interaction: the honest response to a decision the user does not understand is
  neither a guess nor a dismissal, and without an explain door the user's only
  safe move is to ignore the surface. What that option produces is an
  explanation *and a recommendation* — a companion that lists considerations and
  declines to advise has answered a question nobody asked.
- **Every option is reachable by pointer and by tab**, with the keyboard path as
  an accelerator over an interaction that already works. A decision answerable
  only by a chord is a decision the user cannot answer on a touch device.
- **A failed action leaves the decision pending, and says so in place.** When
  the chosen option's work fails, the surface does not clear and does not hand
  the news to some other channel: the error renders where the user just
  clicked, and the same options become the retry. A decision that vanishes on
  failure has told the user it was answered.
- **Within the ambient surface, an answer outranks an announcement.** A
  passive notice yields entirely while a decision is pending — the surface is
  small, and something asking for an answer must not compete with something
  that is merely informing.
- **Dismissal is an outcome, not an absence.** A decision the user waved away is
  recorded as declined and does not silently re-fire; a decision that expired
  unanswered is recorded as expired. Rendering either as though it never
  happened loses the one signal that says the ambient channel is being ignored
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

Whether the companion is *allowed* to raise an unprompted decision at all — the
budget, the quiet hours, the deduplication, the learning from being ignored — is
the proactive-nudge subject's policy, and this surface is where that policy's
output is spent. Spending it well does not entitle the surface to spend more.

## Handoff between the surfaces

The two surfaces are joined by one gesture in each direction, and both preserve
context. Opening the conversation from an ambient item lands on the exchange
that item came from — not at the bottom of an unrelated thread. Returning to
work from the conversation leaves the ambient presence carrying whatever is
still live, so a running turn stays visible after the window closes; a turn that
becomes invisible the moment the user goes back to work has undone the whole
reason for a second surface.

## When not to use this

- **When there is only one place the companion appears.** A companion embedded
  in a single panel does not need a routing rule, and inventing an ambient
  surface to have one adds a permanent visual cost against no gain.
- **When the ambient surface cannot be dismissed by the user.** A permanent
  element the user cannot quiet is not ambient, it is an occupation, and it will
  be judged by its worst moment rather than its average one.
