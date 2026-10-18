---
layer: technique
type: technique
subject: live-chat-moderation-and-anti-bait
technique: persistence-penalty
status: forged
laws: []
shared_with: []
use_when: [a viewer repeats the same bait many times, deciding how repeated attempts change a viewer's standing, a refusal that varies enough to be resampled]
---

# Persistence penalty

Repetition is a search strategy: a viewer who asks forty times is sampling the host's
refusal distribution for the one draw that cracks. The penalty removes both things the
search needs — variance in the answer and access to the host — on a schedule the host can
play as a bit.

## Two levers

**Remove the variance.** A refusal to the same bait class from the same viewer is
stable. The host's dismissal may rotate across the stream, but for one persistent viewer
it converges: the same short line, or acknowledgement without engagement, or nothing.
There is no fresh roll to win. This is also why the substitution path is deterministic:
re-asking a model for a new refusal on each attempt hands the room a new sample each
time.

**Remove the attention.** Each tagged attempt costs the author standing in the picker:
their next messages are picked less often, then only when the room is quiet, then not at
all for a cooling period. Attention is what the baiter came for; withholding it is the
penalty that works without moderator action and without drama.

## The procedure

1. **Count per author, per class, in a decaying window.** The unit is the pre-filter's
   tag. Counting is deterministic code keyed on verified identity, not the model's memory
   of who misbehaved.
2. **Escalate in steps.** A first attempt gets an in-voice dismissal. Repeats within the
   window drop the viewer's pick weight. Continued attempts suppress the viewer from the
   host's attention for a cooling period and raise the case to human moderators, who hold
   the timeout and the ban. The host never bans; it may mock the viewer's persistence
   once.
3. **Decay honestly.** Standing recovers with time and with ordinary participation, so a
   viewer who tested the line once is not muted for the stream. The show's own structure
   offers a natural boundary: suppression that lasts until the end of the current segment
   is long enough to end a campaign and short enough that the viewer returns to a fresh
   room. Thresholds — how many tags, in what window — are assumptions until a simulated
   audience with persistent baiters has tuned them. A penalty that never
   decays turns one bad joke into a permanent exile and teaches the room the host holds
   grudges against its own audience.
4. **Count coordination.** Several new or low-standing accounts sending the same tag
   class in a burst are one attempt with several hands. Penalise the burst — suppress the
   class for a window — rather than waiting for each account to reach its own threshold.

## Decision rules

- **When the repeated message is not bait** — a viewer repeating a question the host
  missed — it is not a tag and it is not penalised. Persistence only counts tagged
  attempts.
- **When a high-rank viewer persists**, rank slows nothing. Standing in the show buys
  attention for acceptable messages; it does not buy extra attempts at the red lines.
- **When the host plays the penalty on air**, it names the persistence, never the
  request. "Still trying" is a bit; repeating what they were trying is the clip.
- **When a first-time viewer's very first message is tagged**, apply the dismissal and
  the count, not the attention drop; first contact earns one mistake.

## When not to use it

The penalty manages a nuisance; it is not the defence. The pre-filter, the tag and the
output gate must already hold on the first attempt — a design that relies on the
penalty to stop the fortieth try has already lost on one of the first thirty-nine. And it
is not punishment for safety-relevant messages: a viewer whose repeated messages signal
distress is handled by safety, never down-weighted for persistence.
