---
layer: application
type: application
subject: business-profile-and-citations
technique: suspension-risk-checklist
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# The suspension alarm in a marketing workspace: a fail-attention status parser, an urgency score that ranks it first, and no NAP anywhere to check a citation against

The Czech-first adtech workspace (commit `2893314930546ed3a314a19a155bcf2f8841a0ea`,
2026-09-08; `package.json` engines `node: 24.x`) realises the checklist's fourth
procedure step - a profile status that is not an explicit affirmative is attention,
never healthy - as a pure parser in `src/lib/local-signals/import.ts`, and the
checklist's last decision rule - a disconnected or suspended profile outranks every
other problem - as a pure urgency score in `src/lib/locations/compute.ts`. The
structural fact the tree proves is that the alarm half of this subject can be made
mechanical. The structural fact it also proves is that the alarm is all the tree has:
it holds no name, address or phone for any location, so the checklist's first three
conditions and the whole citation technique have nothing in this tree to run against.

## Fail-attention, not fail-healthy

`parseGbpStatus` (`import.ts:510-522`) maps a free-text status cell from a pasted
profile export to one of `connected | attention | disconnected`. The doc comment at
lines 503-509 states the rule and the reason:

> FAIL-ATTENTION, not fail-healthy: a present-but-unrecognised status (e.g.
> "suspended", "pozastaveno", "pending verification") maps to `attention`, never the
> healthiest `connected` - this field feeds `needsAttention`/`attentionScore`, so an
> optimistic default would hide the worst-off profiles (a suspended GBP is the classic
> emergency) from the urgency queue. `connected` is reserved for explicit affirmatives.
> An EMPTY cell (no status column) stays `connected` - absence is not a problem signal.

The body is the rule as code. After diacritic folding and lower-casing, an empty
string returns `connected` (line 516); a disconnect pattern (`disconnect|odpoj|off|
inactive|neaktiv`) returns `disconnected` (line 517); an explicit attention pattern
returns `attention` (line 518); an explicit affirmative (`connect|pripoj|aktiv|verif|
overen|live|active|zdrav|healthy|funguj`, or the bare `ok`) returns `connected`
(lines 519-520); and the fall-through at line 521 returns `attention` with the comment
"present but unrecognised -> surface it, don't bury it". "Suspended" matches none of
the affirmative or disconnect patterns and lands in the fall-through, which is the
intended path: the parser does not need a word list of every failure state to route
every failure state to the queue.

Two details are upward lessons the technique took from this tree. First, the empty
cell: an export without a status column is not a fleet of suspended profiles, and
treating column absence as a problem would flood the queue and teach the operator to
ignore it - so absence stays unflagged while presence-unrecognised is flagged. The
technique's procedure step 4 carries that distinction verbatim. Second, the Czech and
English pattern lists side by side: a status readout arrives in the operator's own
language and an alarm that only reads one language is silently fail-healthy for the
other.

## The urgency score ranks a dead profile first

`needsAttention` (`compute.ts:69-71`) is the predicate: a location needs attention when
`r.gbp !== "connected" || r.flagged > 0 || r.mapRank > 10 || r.unanswered > 2`. Any
status the parser did not resolve to an explicit affirmative trips it.
`attentionScore` (`compute.ts:90-98`) is the ordering:

```
(r.gbp === "disconnected" ? 100 : r.gbp === "attention" ? 50 : 0) +
r.flagged * 20 + r.unanswered * 6 + (r.mapRank > 10 ? 15 : 0) + r.openTasks * 4
```

The doc comment at lines 87-89 states the intended order - "weights a disconnected
profile above a flagged item above an unanswered-review backlog" - and the constants
enforce it: a disconnected profile scores 100 before anything else is counted, an
attention-state profile (which is where a suspension lands) scores 50, one human flag
scores 20, and it takes nine unanswered reviews (54) to out-rank an attention state on
reviews alone. That is the technique's decision rule "a disconnected or suspended
profile outranks a flagged item, which outranks an unanswered backlog" with numbers
attached. The weights themselves are asserted, not calibrated - the workspace's own
scout lists every score weight in the tree as uncalibrated - and the technique carries
the ordering, not the constants.

Both functions are pure and documented as such (`import.ts` parses text; `compute.ts:68`
and `:89` say "Pure."), so the alarm is testable without the store, which is the
property that lets the fail-attention default be asserted rather than hoped for.

## What the tree cannot check: there is no NAP

The checklist's first three conditions - a stuffed name, a mail-drop address, a shared
address - and the citation technique in its entirety require the tree to hold the
business's name, address and phone. It holds none of them, and it says so as a design
decision rather than an omission. `src/lib/microsite/local-jsonld.ts:1-19` opens with
"ANTI-FABRICATION IS THE WHOLE POINT OF THIS MODULE": the LocalBusiness structured data
"invites `address`, `telephone`, `openingHoursSpecification`, `geo` and
`aggregateRating` - and this repo has NO NAP data model (no address field on `Project`,
no phone, no verified hours), so every one of those would have to be invented." The
emitted object (lines 64-72) carries `name`, `url`, `description`, `areaServed` and
`makesOffer` only; there is deliberately no `address` key, and
`test-unit/microsite-local-page.test.mjs:58-66` asserts the absence of `address`,
`telephone`, `openingHours`, `openingHoursSpecification` and the rest, "so re-adding
one is a red test, not a silent regression".

The local-page prompt is the same refusal at the generation layer.
`src/lib/ai/tools/local-page.ts:43-54` instructs the model, in Czech: never state an
address, phone, e-mail, opening hours or a named employee - "these data you do not have
and must not invent" - alongside the shared `antiFabrication` fragment
(`_fragments.ts:22`), prices only from the supplied data, reviews only verbatim.

So the tree's position on this subject is asymmetric and honest. It can raise the
alarm - a suspended profile reaches the top of the urgency queue from a pasted export -
but it cannot run the checklist's name or address conditions, cannot grade NAP
consistency, and cannot build or audit a citation, because it has chosen to store
nothing it would have to echo. The workspace's own scout records the gap in its
"worse than standard" list: "Local SEO has no NAP/citation layer, no geogrid, no profile
completeness, no review velocity alarm." The technique lands this as a deviation with
the standard intact: a tree that refuses to invent a NAP is right to refuse, and the
next step is a NAP master record the owner types once, from which structured data,
the profile and every citation are echoed - never a generated address.

## Where the tree falls short of the standard

- The status parser reads a pasted export; nothing in the tree reads the live profile,
  so a suspension that happens between imports is invisible until the next paste.
- `needsAttention` treats `mapRank > 10` as an attention condition alongside profile
  status, which mixes the visibility subject's concern into the suspension queue; the
  score keeps them apart by weight (15 versus 50), the predicate does not.
- No name verdict exists anywhere in the tree - there is no name field to grade.
