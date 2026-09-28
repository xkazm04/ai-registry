---
layer: application
type: application
subject: usage-analytics
technique: event-taxonomy
stack: next
status: forged
applied: code
ab_verdict: better
verified_on: 2026-09-26
verified_against: next@16
---

# Event taxonomy: one door, and a vocabulary that lived in a comment

*Read from a hiring product's tree (kp) at `a7340185d`, fixed in `4a3ae0e38`,
2026-09-26.*

The [event-taxonomy](../techniques/event-taxonomy.md) technique asks for one
registry that the emit door validates against, with each event's payload fields
enumerated and closed. This tree had built the door carefully and left the
registry as prose.

## The door

`app/_lib/analytics/track.ts` is the only way product code sends a custom event to
the cookieless page-analytics vendor. It is careful where it matters most. On
candidate surfaces whose URL *is* a credential, it refuses to fire. One list of
tokenized path prefixes feeds both that refusal and the script tag's exclusion
globs, and a test pins the list against every `[token]` route in the app. It never
throws, never awaits, and is a silent no-op when the script is absent or blocked.

Its signature was open:

```ts
export function track(event: string, props?: TrackProps): void  // TrackProps = Record<string, string | number | boolean>
```

The vocabulary existed in two places. One was a doc comment in `plausible.tsx`
listing four "app-side events wired today". The other was a regex test asserting
that three of them appear in their components. Nine names were in use:
`landing_cta_click`, `landing_demo_click`, `workspace_entered`, `demo_started`,
`checkout_started`, `checkout_completed`, `analytics_section`, `analytics_export`
and `calibration_apply`. The comment listed four, and the landing events were
described as "the layout owner's side". So the list was already half the
vocabulary. That is the swamp's first stage, arriving on schedule.

## A and B

**B** makes the comment a type. `TrackEventProps` maps each of the nine names to
the props it may carry (`landing_cta_click: { placement: string; plan?: string }`,
`demo_started: undefined`, and so on). `track` becomes
`track<E extends TrackEvent>(event: E, props?: TrackEventProps[E])`. All nine call
sites typecheck unchanged, and none needed an edit.

The measurement is the typechecker itself. `track.test.ts` gains a type-level pin:
a misspelled name (`landing_cta_clik`) and an undeclared prop (an `email` on
`analytics_export`), each under `@ts-expect-error`. Under **A**, `tsc --noEmit`
reports 2 errors, both TS2578 "Unused '@ts-expect-error' directive". Both lines
compiled: a new dashboard row, and a contact address on the wire. Under **B** it
reports 0. The node test file passes 6/6 and eslint is clean. Verdict: **better**.

The same type is also the payload allowlist of
[privacy-scrubbing](../techniques/privacy-scrubbing.md). The vendor is sent only
declared keys, so the "no field nobody declared" rule is enforced where the event
is built, not reviewed afterwards.

## What this does not settle

- The props' *values* are still `string`. `placement` and `plan` are closed sets
  in practice, but not in the type, and the technique would declare them. That
  change reaches into the landing components' own types, so it was left as the
  next step.
- The names are object_action, but not all in the past tense the technique
  suggests (`landing_cta_click`, `calibration_apply`). Renaming a live event breaks
  its trend line at the rename. The technique's rule is that a new name retires
  the old one visibly, so this is a versioning decision for the product's owner,
  not a tidy-up.
- The tree has no consent switch. It relies on the vendor being cookieless, and
  the tightened consent rule in privacy-scrubbing says cookieless is not the test.
  Whether the vendor's configuration meets an audience-measurement exemption is a
  question about the deployment, and it was not answered here.
- A blocked vendor script is a silent no-op. That is correct for the user, but
  the operator cannot see how much traffic it removes (see
  [activation-and-funnel-honesty](../techniques/activation-and-funnel-honesty.md)'s
  standing caveats).
