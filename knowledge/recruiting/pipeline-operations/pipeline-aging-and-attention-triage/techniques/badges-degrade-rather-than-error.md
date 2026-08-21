---
layer: technique
type: technique
subject: pipeline-aging-and-attention-triage
technique: badges-degrade-rather-than-error
status: forged
laws: [absence-of-evidence-is-not-evidence, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [an aging badge cannot be computed, a list fails to render because of a decoration, deciding what an uncomputable badge shows]
---

# Badges degrade rather than error

An aging badge is a decoration on a list that must render regardless. Its
computation depends on things that are all individually allowed to be missing:
a stage-role mapping, a last-movement timestamp, a policy row for that role, a
board configuration. The discipline is therefore stated as a hierarchy of
allowed outcomes:

**Render the badge if you can. Render nothing if you cannot. Never render a
wrong badge, and never take the list down.**

## Three failure postures, only one acceptable

Given an uncomputable badge, an implementation does one of three things:

- **Fail the surface.** The list errors, or shows an empty state, because a
  decoration threw. This breaks a working pipeline view over an ornament, and
  it violates the spirit of
  [a candidate's process never stalls on your constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)
  in its operational form: the recruiter cannot see the queue, so the people in
  it wait longer, because of an internal defect that had nothing to do with
  them.
- **Substitute a default.** Zero days, "fresh", the global threshold, a green
  dot. This is the worst outcome, and it is the popular one, because it looks
  like graceful handling. It is not: it renders an unknown in the visual
  grammar reserved for a measured value.
  [Absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)
  — a missing timestamp is not a recent one, and a stage with no policy row is
  not a healthy stage. The substituted default always flatters the team, never
  the candidate, which is how it survives review.
- **Omit the badge.** The row renders, the badge is absent, and absence
  honestly means "not computed here". This is the correct answer.

## Absent is not the same as fresh

The design must make these two visually distinct, or the correct implementation
becomes indistinguishable from the flattering one. A row with no badge and a row
with a "0 days" badge should not look alike. If the surface uses a colour dot
per state, the uncomputable state gets no dot rather than a neutral one — a
neutral dot is a claim.

Where the omission is *systematic* rather than incidental — an entire board with
no stage-role mapping, a whole policy table missing — the surface should say so
once, at the surface level, rather than silently showing a badge-free board that
reads as a calm one. One quiet line ("aging is not configured for this board")
converts an invisible degradation into a fixable one.

## The coercion that looks like degradation

The most common way this technique is *almost* implemented is a coercion: a
missing timestamp becomes zero days, and zero days is below every threshold, so
nothing fires. In effect the entry degrades to silence, which is the prescribed
posture — and this is exactly what makes it dangerous, because the mechanism
is wrong even where the outcome happens to be right.

Two things are wrong with it. The unmeasured entry is now indistinguishable
from a genuinely fresh one, both in the interface and to any later code reading
the same derived value. And the coercion has no direction: the same reflex
applied to a *score* rather than a duration turns an unscored candidate into a
zero-scoring one, which is a rejection nobody computed. Teams routinely get
this right for scores — carefully preserving "unscored" as its own state — and
then coerce a duration on the next line of the same function, because the
duration's failure is quiet.

The rule is the same for both: **represent the unavailable value as its own
state and decide what to do with it explicitly.** For an aging badge that
decision is "render nothing"; the point is that it is a decision, written down,
rather than an arithmetic accident that happens to land somewhere harmless.

## Best-effort by construction

Structure the computation so degradation is the default path rather than an
exception handler:

- Resolve inputs independently, and let each resolve to a distinct
  *unavailable* value rather than to a substituted one.
- Have the badge function return an explicit "no badge" result, not a
  throwable and not an empty object that downstream code coerces.
- Keep the computation off the critical path of the list: whatever the badge
  needs, the list has already rendered without it.
- Never let a badge computation write anything. A best-effort read that
  persists a derived value is no longer best-effort; a partial failure now
  leaves a wrong number behind for everybody.

## Log the silence

The failure of this technique is not that badges disappear; it is that nobody
notices they disappeared. A surface that degrades silently and permanently has
converted an alerting system into a decorative one, with no signal at any point.
So the uncomputable path is *observable*: count it, name the reason (no role,
no timestamp, no policy), and make the count visible to whoever maintains the
workspace. "Badges degrade" is a promise about the user's experience, not a
licence to swallow the cause.

## Decision rules

- When any input to a badge is unavailable, omit the badge; do not substitute.
- When a badge is omitted, make its absence visually distinct from every
  computed state.
- When omission is systematic for a whole board or workspace, surface a single
  configuration notice rather than a field of silent gaps.
- When a badge computation fails, the row and the list render anyway.
- Record why each omission happened, at a level somebody reviews.

## When not to use this

Degrade-to-silence is right for *advisory* signals. It is wrong for signals that
gate an action or carry a safety meaning: a compliance hold, a consent
expiry, a do-not-contact marker. When the marker's whole purpose is to stop
somebody doing something, an uncomputable state must fail closed and block, not
disappear —
[uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)
governs those, and their absence is never permitted to read as permission.
Aging badges are advisory. Know which kind you are building before choosing a
posture.
