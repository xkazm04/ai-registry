---
layer: application
type: application
subject: channel-native-social-and-repurposing
technique: hook-value-cta-triad
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: better
---

# Hook, value, call to action - two post generators, one of them silent on the triad

Verified against the Czech-first marketing workspace at commit
`7baeb12a81598f68ebbafb6fe1323dd40fd867dd` (2026-10-14). The workspace has two
generators that write social posts for the same networks, and they disagree about the
technique.

## The disagreement

The social drafting tool's system instruction states the triad as a requirement ("every
post has a hook, a concrete value and a clear call to action"). The repurposing tool,
which turns one article into the professional, visual and microblog variants, gave the
model a register per network and nothing about the three parts or the closing ask. Its
deterministic fallback, by contrast, always ends in exactly one ask and, for the visual
network, says where the link lives instead of pasting one. So the floor the model could
fall back to was better specified than the model.

## The experiment

Two Czech articles (storing nuts, choosing winter tyres) x two arms x two repetitions,
the professional and visual variants each, through a Sonnet-class model with the tool's
own system instruction (A) and the same instruction plus two rules (B): the three parts
in order with figures taken only from the article, and the visual network names where
the link is and pastes no address. One reader scored 16 posts per arm.

| Measure | A (no triad) | B (triad stated) |
| --- | --- | --- |
| posts with exactly one ask | 0 of 8 | 7 of 8 |
| hook is a claim or question, not a topic | 8 of 8 | 8 of 8 |
| figure or mark not in the article | 1 | 0 |
| visual post names where the link is (floor) | 4 of 4 | 4 of 4 |
| address pasted into a visual post (floor) | 0 | 0 |

Every A post closed with the article link and then a second ask (a question to the
audience, or "save this"). The hook was already good in both arms: the model does not
need to be told to open strongly, it needs to be told to stop asking twice. The
link-location rule moved nothing on this model; the instruction survives as a pin
against a weaker serving model, not as a measured gain.

## Structural facts the tree proves

1. A triad stated in one generator does not reach a sibling that writes the same posts;
   the rule has to be present in each instruction that produces a post.
2. The cheapest place to pin an instruction is the prompt-contract test: the tool's
   instruction constant is exported and a unit test asserts the three phrases, so a
   later edit cannot silently drop them.
3. The workspace's golden-contract ledger makes the instruction change an accepted,
   reasoned event rather than a silent re-bake.

## Limits

- The serving model in production differs from the model the arms ran on, n is eight
  posts per arm, and the reader was not blind.
- The experiment scored the closing ask, not the readers' response. Nothing here shows
  the single-ask posts earn more.
