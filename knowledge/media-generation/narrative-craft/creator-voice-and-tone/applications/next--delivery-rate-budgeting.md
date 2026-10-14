---
layer: application
type: application
subject: creator-voice-and-tone
technique: delivery-rate-budgeting
stack: next
status: forged
applied: experiment
ab_verdict: better
verified_on: 2026-10-14
verified_against: next@16.3.3
---

# The clock the engine declares is not a measurement

*Verified against the Gravitone studio tree at commit `7edc04b` (parent `e55fd52`),
2026-10-14. The version is witnessed by the tree's own `package.json` pin.*

The technique says: rate times duration is a word budget, and after every render the
word count, the implied duration and the declared slot must be mutually consistent. The
studio composes candidate scripts from a model and holds each answer to a set of laws
before a person sees it: attribution, the connector law, the engine fit and the
project's clock. This application records what the clock law was actually measuring.

## The seam, chosen to falsify

The obvious expectation was that a studio with a "runtime inside the template band"
law already covered the arithmetic. It did not. The parser derives each render's
runtime by summing the seconds the **engine declared per beat**, then checks that sum
against the band. The same answer also carries a declared word budget and the spoken
text. The runtime check never read the text, and nothing compared the budget to the
words. The band was the engine agreeing with itself.

## The A/B

Same recorded answer, rescaled by repeating each beat's text, through the parser
before (A) and after (B) a rate rule: refuse when the words exceed the render's own
budget by more than ten percent, or when the implied rate is above 260 wpm (the top of
the measured band plus slack); advise, never refuse, below 100 wpm.

| Case (300 s slot, budget 950) | Words | Implied wpm | A | B |
|---|---|---|---|---|
| as recorded | 229 | 46 | accepted | accepted, advisory |
| 4x text | 916 | 183 | accepted | accepted |
| 5x text | 1,145 | 229 | accepted | refused (20% over its own budget) |
| 6x text | 1,374 | 275 | accepted | refused (over budget and over 260 wpm) |
| 6x text, budget raised to 1,400 | 1,374 | 275 | accepted | refused (275 wpm) |

Target moved: unspeakable and over-budget answers go from accepted to refused, with the
arithmetic named in the finding. Floor held: the in-band answer is untouched, and the
studio's compose probes, type check and lint ratchet stay green. The last row is the
one worth keeping: an engine that raises its own budget to match what it wrote defeats
the budget comparison, and only the absolute ceiling catches it.

## What the tree also showed

- The two hand-recorded answers that serve as the studio's fixtures are 46 and 26 wpm.
  They were written short and passed the clock law because their declared seconds were
  in band. A hard floor would have broken every fixture, so under-fill is an advisory
  finding only. The technique's failure direction agrees: surplus words elaborate,
  deficit words extract, so the refused side is the over-length side.
- The band is a presenter measurement. A fixed ceiling is a blunt instrument for a
  synthetic narrator whose rate is emergent; the per-render word budget is the
  instrument that follows the cast voice, which is why both checks run.

## Not measured

How often live model answers exceed their budget; whether the compose prompt should
state the budget up front rather than ask the model to declare one; a rendered-audio
audition, which is the technique's actual verdict for a synthetic voice.
