---
layer: application
type: application
subject: companion-identity
technique: operator-profile-synthesis
stack: rust
status: forged
verified_on: 2026-08-23
---

# Behavioral profile synthesis in the Personas companion (Athena)

`src-tauri/src/companion/brain/profile_synthesis.rs` is a weekly pass that
proposes edits to the companion's evolving profile of its operator, derived from
what he *did* rather than what he said. Its module header states the whole
posture in five lines (`profile_synthesis.rs:1-16`): "a weekly, gated,
deterministic pass gathers BEHAVIORAL STATISTICS (numbers, never raw content)
… Athena proposes at most three evidence-cited `update_identity` diffs, which
land as a normal approval card (the user always reviews them). Most weeks the
expected output is zero diffs."

## Numbers, not content

`gather_digest` (`profile_synthesis.rs:127-219`) is five SQL aggregations and
nothing else:

1. proactive cards engaged vs dismissed per trigger kind over 30 days
   (`:133-158`) — notification taste;
2. refine-chip variants requested (`:162-171`) — verbosity taste;
3. guided walkthroughs completed vs abandoned (`:175-186`) — does guidance land;
4. chat turns and how many were voice (`:190-202`) — interaction shape;
5. approvals approved vs rejected per op action (`:206-216`) — which ops he
   trusts.

The result is a compact markdown digest of counts. No message body, no episode
text, and no fact content is read. The doc comment above it is explicit —
"NUMBERS ONLY, no raw user content" (`:124-126`) — and the digest test asserts
the shape of the rendered counts rather than any content
(`profile_synthesis.rs:412-432`).

## Off by default, and slow

The pass reads `companion_profile_synthesis` from settings and returns
immediately when it is not `"true"` (`profile_synthesis.rs:54-59`); the header
records the default as off (`:15-16`). Cadence is `INTERVAL_DAYS = 7`
(`:30`), checked against `companion_profile_synthesis_last` (`:61-68`), and the
"ran" stamp is written **before** the model call so a failure cannot re-fire on
every proactive tick that week (`:71-76`).

## Silence is the expected output

Three separate places produce nothing rather than something weak. An empty
digest short-circuits with "no behavioral signal yet — skipping"
(`profile_synthesis.rs:77-80`). An empty diff list logs "no diffs proposed (the
common case)" (`:90-93`). And the prompt itself sets the floor in words
(`:281-282`): "propose AT MOST 3 … or ZERO if nothing is clearly supported. Zero
is the normal, expected answer most weeks. … Never infer a preference from a
single data point; look for a clear, repeated pattern."

## Evidence citation, enforced by prompt and by convention

The prompt requires that "Every `new_text` bullet MUST end by citing the
statistic that motivated it, e.g. `prefers terse replies — asked 'shorter' 9× in
30d`" (`profile_synthesis.rs:286`), and the emitted JSON carries a per-diff
`rationale` naming which number drove it (`:297`).

## Section scoping is stated where the pass is defined

The prompt scopes the pass to the operator's half of the document —
"Do not touch the 'About me' sections — those are your self-model, not his
profile" (`profile_synthesis.rs:288`) — and requires each diff to target one
bullet under an **existing** heading path (`:284`). The document really does
carry both subjects: the identity fixture in the sibling module has
`# About Michal / ## Who he is`, `## How he works`, and `# About me / ## What
I've gotten wrong` (`brain/identity.rs:360`).

## Nothing lands without review

Proposals become a pending `companion_approval` row with action
`update_identity` (`profile_synthesis.rs:344-369`) and an approvals event so the
panel surfaces it promptly (`:111-122`). The same helper is reused by the "that's
wrong" correction loop, so an operator correction and a synthesised proposal
arrive through one door. The batch is capped at `MAX_DIFFS = 3`
(`:31-32`), structurally-invalid diffs are dropped before the card is built
(`:333-339`), and the executor re-validates anchors against the live document at
approval time (`:333-334`).

## Where it falls short of the standard

**The evidence floor is prompt-side only.** "Never infer a preference from a
single data point" (`profile_synthesis.rs:281`) is an instruction to the model,
not a check in the code: nothing counts observations per axis or rejects a diff
whose cited statistic is small. A model that proposes a trait from one dismissal
produces a structurally valid diff that reaches the approval card, and the human
is the only floor.

**The window is stated in the digest but not carried onto the claim.** Every
query is `-30 days` (`:137, :164, :176-180, :193, :253`) and the digest header
says so, but the bullet that lands in the profile carries only the statistic the
model chose to quote. A reader of the profile a year later sees "asked 'shorter'
9×" with no window attached unless the model happened to include it.

**There is no age-out.** A synthesised bullet, once approved, persists like any
other; nothing re-checks whether the statistic that justified it still holds.
