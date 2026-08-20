---
layer: technique
type: technique
subject: public-verdict-badge
technique: neutral-state-vocabulary
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [a public artifact has no verdict to publish, distinguishing absent from private from failed, choosing colours for non-verdict states]
---

# Neutral state vocabulary

A verdict badge spends a surprising share of its life having nothing to say.
The subject was never assessed. The subject is not public. The assessment
errored. The aggregate would be a claim about nothing. These are not edge
cases to be papered over — on a crawler-facing public endpoint they are
usually the *majority* of responses. The technique is to give them a small,
closed, deliberately boring vocabulary that no viewer mistakes for either a
pass or a fail.

## One authority, not one per call site

The neutral states are a closed vocabulary, and like every closed vocabulary
they get exactly one definition that every renderer, every endpoint, and every
piece of documentation derives from
([one-authority-per-vocabulary](../../_laws.md#one-authority-per-vocabulary)).
The failure mode when they are hand-maintained per route is specific and
embarrassing: one endpoint says `unknown`, another says `not found`, a third
says `n/a`, and a viewer comparing two pages concludes the two mean different
things — which, having been written by different people on different days,
they might.

A workable set, and it should stay this small:

| State | Meaning | Rendered as |
|---|---|---|
| **unknown** | No verdict exists for this subject, or none may be shown to this viewer | neutral grey, plain word |
| **pending** | Assessment is queued or running; a verdict is expected | neutral grey, plain word |
| **unavailable** | The instrument failed; this is an incident, not a datum | neutral grey, plain word |
| **not applicable** | The claim is structurally undefined for this subject shape | neutral grey, plain word |

Four is plenty. Every additional state is another thing a viewer must learn to
read, and the viewer is spending under a second here.

## The visual register is the whole point

Neutral means neutral in the channel viewers actually read. Concretely:

- **A grey family, never a verdict hue.** Not amber (reads as a weak pass, or
  as a warning about the subject rather than about the measurement), not a
  desaturated green or red. Grey is the only hue that says "this is not a
  judgement".
- **Words, not numbers or symbols.** A dash, a `?`, or `0` all get read as
  values. `unknown` cannot be misread as a score.
- **The same treatment across all four states.** A neutral state that is
  visually distinctive is a neutral state that leaks — see below.
- **Contrast is computed, not assumed.** Whatever fill is chosen, the
  foreground is selected against it by a luminance rule so the text stays
  legible; a neutral state rendered as illegible mush is functionally a blank
  badge, which reads as a broken integration and gets removed.

## Absent and private must be indistinguishable

This is the rule that is most often got wrong, and it is a security property,
not an aesthetic one. If a public endpoint renders `private` for subjects that
exist but are not public, and `not found` for subjects that do not exist, then
the endpoint is an **existence oracle**: anyone can enumerate names and learn
which private subjects exist, at whatever rate they can issue requests. On a
badge endpoint this is unusually cheap to exploit, because the endpoint is
designed to be fetched anonymously, in volume, without a session.

So: a non-public subject and a nonexistent subject both render `unknown`, with
identical bytes, identical status, and — importantly — identical cache
directives. Distinguishing them in the cache lifetime leaks the same bit
through timing.

The authenticated surface is where the distinction belongs. A signed-in owner
looking at their own dashboard may absolutely be told "this is private, so the
public badge shows nothing"; that view has a viewer identity to check against.
The public artifact does not.

## Neutral is not empty success

A neutral state must be distinguishable *to your own systems* from a
successfully computed verdict, even though it renders as a plain grey word
([failure-not-empty-success](../../_laws.md#failure-not-empty-success)). Two
consequences:

- The response carries a machine-readable outcome — a header, a field in the
  structured variant of the endpoint, or a distinct code path — so monitoring
  can alarm on a spike in `unavailable` without scraping pixels. A silent
  rise in neutral responses is exactly what an outage looks like from the
  outside, and it is invisible if every response is a cheerful `200` with a
  grey image.
- `unavailable` is logged as an incident and `unknown` is not. Collapsing them
  in telemetry — because they look the same to the viewer — destroys the only
  signal that would have told you your assessment pipeline stopped.

## Procedure

1. **Enumerate outcomes at the endpoint**, not at the renderer: resolved,
   qualified, absent, not-permitted, pending, failed, structurally-undefined.
2. **Map each onto the closed vocabulary**, collapsing absent and
   not-permitted onto the same state, byte-for-byte.
3. **Render through the shared neutral renderer** — one function, taking the
   state, producing fill, foreground, and text. No route composes a neutral
   badge by hand.
4. **Attach the outcome to the response** in a machine-readable channel for
   monitoring, and to the log line for alarming.
5. **Hand the outcome to the cache policy** rather than a fixed lifetime; the
   four states have different truth half-lives and are branched separately.

## When not to use this

- **Not on authenticated surfaces.** Inside a signed-in view, refusing to
  distinguish private from absent is unhelpful evasion — there is a viewer
  identity, so use it.
- **Not as a substitute for a qualifier.** If a real verdict exists and is
  merely narrower than it looks, qualify it; rendering `unknown` over a
  perfectly good partial result is its own dishonesty, and it trains subjects
  to stop embedding the badge.
- **Not for expected-empty domains.** "This subject has no releases" is a
  measured zero and a legitimate verdict, not a neutral state. Reserve neutral
  for the absence of a *measurement*, never for a measurement of absence.
