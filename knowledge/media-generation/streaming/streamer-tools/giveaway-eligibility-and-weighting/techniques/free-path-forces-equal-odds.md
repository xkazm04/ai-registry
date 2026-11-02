---
layer: technique
type: technique
subject: giveaway-eligibility-and-weighting
technique: free-path-forces-equal-odds
status: forged
laws: []
shared_with: []
use_when: [a giveaway is gated to subscribers, paid tiers or a purchasable currency, a sponsor or viewer asks for bonus entries tied to spending, adding a free alternative way to enter a draw]
---

# Free path forces equal odds

Money must never buy odds. The rule is easy to state and easy to erode, because the
platform offers many things that are money in disguise — paid subscriptions, gifted
subscriptions, purchasable currency, cheers, loyalty points sold in bundles — and each
looks like a legitimate measure of support. The technique makes the rule structural: money
can at most gate **who may enter**, never **how much an entry weighs**, and the moment
entry is gated by anything of value, a free path exists and every entry weighs the same.

## The procedure

1. **Classify every eligibility input by its source.** For each attribute a draw can
   gate or weight on, record whether it can be obtained with money, directly or through a
   purchasable intermediary. When unsure, treat it as money.
2. **Never wire a money input to weight.** No configuration exposes a weight multiplier
   for subscription tier, donation size or cheer count. The absence is in the type, not in
   a validation the next feature can forget.
3. **A gated draw opens a free path.** When eligibility is gated by a money input, the
   draw offers a free way to enter — a chat command, a no-purchase entry — and states it
   in the rules shown on stream.
4. **A free path admits everyone.** The free path's entrants include viewers outside the
   gated pool — that is what makes it a path rather than a courtesy. A free path that lets
   non-members in at lower odds, or into a separate lesser draw, is a discounted ticket.
5. **A free path forces equal odds.** When a free path is open, every entry's weight is
   one. Activity weights are switched off, not tuned down, because a weight curve the paid
   path can feed faster (a subscriber who chats more because they have emotes) makes the
   free entrant's odds unequal in a way nobody can measure from the list.
6. **Never flatten silently.** A draw that combines a free path with a non-equal curve is
   either refused at configuration time or flattened in the mechanism itself — the one
   place every client goes through — with the flattening stated on the configuration
   screen ("the free path is on, so every entry has equal odds"). What is not acceptable is
   a curve the screen still shows as active while the draw runs flat, or the reverse.
7. **Derive the declaration from the mechanism.** The statements a policy check and the
   on-stream rules read — "subscribers only", "free entry at equal odds" — are computed from
   the entry pool and the free-path setting that actually run, not kept as separate flags.
   Two flags for one fact agree only as long as every client that writes them remembers to
   set both.

## Decision rules

- **When a sponsor asks for bonus entries per purchase**, the answer is no; offer a
  sponsor-branded free entry instead.
- **When a loyalty currency can be bought as well as earned**, it is money for this rule.
- **When the streamer wants both regulars' weights and a subscriber gate**, they choose:
  a subscriber-only perk draw with equal odds plus a free path, or an open draw weighted by
  activity. The tool presents the choice; it does not blend them.
- **When the copy describes the draw**, it says in plain words that money never adds
  weight, on the configuration screen and in the rules on stream.

## When not to use it

Whether a paid gate is lawful in a given place, and what the free path must look like to
satisfy a regulator, is legal design and belongs to the guardrails subject; this technique
guarantees only that the product cannot be configured into selling odds. A draw with no
gate of value needs no free path — everyone already enters free.
