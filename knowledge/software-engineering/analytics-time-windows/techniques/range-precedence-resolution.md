---
layer: technique
type: technique
subject: analytics-time-windows
technique: range-precedence-resolution
status: forged
laws: [one-authority-per-vocabulary, one-validation-door]
shared_with: []
use_when: [more than one source can name the reporting range, adding a saved period preference, debugging why two pages show different periods]
---

# Range precedence resolution

In a mature product, several sources can name the reporting range: an explicit
parameter on the request, a stored per-user or per-tenant preference, an
organizational default, a system fallback. Two or more are frequently present
at once. This technique makes the resolution order **written, single-sited,
and self-reporting**.

The order chosen matters far less than the fact that there is one. What kills
a product is not "stored beats explicit" — it is that the effective order is
whatever each call site's argument defaulting happened to produce, so the same
account sees a quarter on one page and thirty days on another, and neither
page can explain why.

## Procedure

1. **Write the precedence as an ordered list in one place**, in prose next to
   the resolver. The usual order, and a good default: an explicit request
   parameter beats a stored preference, which beats an organizational default,
   which beats the system fallback. Explicit-wins is the order users expect
   because it is the only one under which a control they just operated has an
   effect.
2. **Implement it in one resolver — the
   [single door](../../_laws.md#one-validation-door) every window passes
   through.** The resolver takes the raw inputs (request parameters, the
   loaded preference record, the defaults) and returns a window value. No
   caller re-derives; no caller applies a fallback of its own.
3. **Validate inside the door.** Unparseable values, inverted ranges, ranges
   exceeding a retention or policy maximum, ranges predating the data — all
   are handled at the resolver, which clamps or rejects. A resolver that
   returns an unclamped range has moved validation back out to the call sites
   it was built to remove.
4. **Return the provenance with the range.** The output says which source won
   and whether a clamp fired. A surface that cannot state why it is showing
   ninety days is a surface nobody can debug; the provenance is also what a
   "you are viewing your saved default" affordance renders from.
5. **Return the effective window, and require downstream to use it.** Every
   denominator, axis label and comparison uses what was resolved, never what
   was requested. A per-day average over the *requested* span is wrong exactly
   when a clamp fired — which is when the user is least likely to notice.
6. **Persist a preference only on an explicit act.** Writing the resolved
   range back as the stored preference on every read makes an incidental
   parameter sticky, and the user's saved default silently becomes whatever
   link they last clicked.

## Decision rules

- **When a custom range arrives reversed, swap the bounds rather than yielding
  an empty result.** A range with `start > end` matches nothing downstream —
  blank trend, blank forecast — while a baseline read predicated on "before
  start" still returns rows, producing an incoherent surface that shows a
  "current" state predating its own window. Swapping keeps both dates the user
  supplied and presents a coherent period; echo the swapped values back so the
  inputs repopulate with what was actually used.
- **When a resolved range's parameters are not implied by its name, echo them
  in the human label.** Preset periods carry their bounds in their names; a
  custom range does not, and a shared link, a restored preference, or a
  silent bound swap will otherwise render a generic "custom range" heading
  above numbers whose period the reader cannot see. The title is derived from
  the resolved bounds, not from the request.
- **Every surface scoped to the period resolves through the same function.**
  The characteristic incident is partial adoption: one tab reads the full
  chain including the stored preference while its sibling tabs call the raw
  parser, so a period chosen on one tab silently resets on every navigation.
  The chain is not useful until it is universal; a single non-participating
  call site reintroduces the whole defect.
- **When an explicit parameter is present but invalid, do not fall through
  silently.** Falling back to the default renders a period the user did not
  ask for with no signal. Clamp with disclosed provenance, or reject —
  choosing per surface, but never inventing.
- **When a preference is stored per tenant and per user, decide which is
  narrower and say so.** The narrower scope usually wins (user over tenant),
  but a compliance-shaped default may need to be a ceiling the user cannot
  widen past — a ceiling is not a precedence level, it is a clamp, and it is
  applied after resolution.
- **When the resolved range feeds a cache, the cache key is the resolved
  window, never the request parameters.** Two different requests that resolve
  to the same window should hit the same entry; two identical-looking requests
  that resolve differently must not.
- **When the range names a period rather than a span** ("this quarter" rather
  than "90 days"), resolve it to concrete boundaries at the door using
  [calendar arithmetic](calendar-arithmetic.md), and pass the boundaries down.
  Passing the *word* down means every consumer re-resolves it, possibly at a
  different instant, and a request spanning midnight resolves two ways in one
  call stack.
- **When a new surface needs a range the resolver does not offer**, extend the
  resolver's vocabulary rather than parsing locally. The closed set of period
  names is itself a vocabulary with
  [one authority](../../_laws.md#one-authority-per-vocabulary); a locally
  parsed "last 45 days" is a second one.

## What the window value carries

Resolution produces a value, not a pair of arguments. It carries: start, end
(exclusive), the zone it was snapped in, the grain if one was chosen, the
period name if it had one, the provenance, and whether it was clamped. Passing
`days: number` down instead is the defect this technique exists to prevent —
it invites each layer to re-derive boundaries, at its own instant, in its own
zone.

## When not to use it

- **Single-source ranges need no resolver.** A fixed internal report that
  always covers last month should compute last month and stop; adding a
  precedence chain with one link is ceremony.
- **Machine-triggered evaluations** — an alert rule with its own configured
  window, a job with a fixed lookback — carry their window in their
  configuration; they read the shared constructors and the shared zone, but
  they do not consult a user preference chain.

## Smells

- Range parsing at more than one call site.
- A default range literal appearing in several modules.
- A response that echoes the requested range rather than the served one.
- A saved period preference that changes without the user visiting a settings
  surface.
- Two pages of the same product showing different default periods, and no one
  able to say which is correct.
