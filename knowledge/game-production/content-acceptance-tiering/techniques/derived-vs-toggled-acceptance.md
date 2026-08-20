---
layer: technique
type: technique
subject: content-acceptance-tiering
technique: derived-vs-toggled-acceptance
status: forged
laws: [no-gate-self-certifies, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a status field is editable by hand, adding a completion flag to a content record, a dashboard disagrees with the build]
---

# Derived versus toggled acceptance

An acceptance verdict is *derived* when a program computes it from artifact state on
every read, and *toggled* when a human or a producing process writes it into a field.
The two are indistinguishable on a dashboard and opposite in value. This technique is
the discipline of keeping every verdict on the derived side, and of handling the one
case that genuinely cannot be.

## The rule

**No verdict is stored. Verdicts are functions of state.** A content record holds facts
— which fields are populated, which references it declares, which choice was recorded,
which trace ids were produced by which run. It does not hold `approved`, `complete`,
`verified`, or `qa_passed`. Those are computed by reading the facts, every time they are
displayed, by code that did not author the facts.

The test for any field: **can its value be true while the artifact is broken?** If a
human can set it and then break the artifact, the answer is yes, and the field is a
liability. A derived verdict cannot drift from the artifact because it has no
independent existence to drift with.

## Why toggles rot, specifically

They do not rot through malice; they rot through three ordinary mechanisms.

- **Edit without re-review.** Someone fixes a typo in an accepted artifact. The toggle
  is still on. Nothing in the system knows the evidence is now about a previous version.
- **Optimistic setting.** A toggle set *while* the work is in progress, intending to
  finish before anyone looks. Nobody looks for six weeks. The toggle has been lying for
  six weeks and no mechanism will ever notice.
- **Unblocking.** A toggle flipped to clear a red board before a milestone, with every
  intention of flipping it back. It is never flipped back, because nothing red remains
  to remind anyone.

Each mechanism is invisible from the outside. That invisibility is the whole cost: a
toggled field's error rate is unknowable, so its information content collapses to zero
even though most of its values are correct.

## Recorded human selection is not a toggle

The exception people reach for — "but some judgments only a person can make" — is real
and is handled without a toggle. When a person must choose, **record the choice, not the
verdict**.

- Not `silhouette_approved: true`, but `chosen_variant: <the identifier of the variant
  they picked>`, with who picked it and when.
- Not `balance_signed_off: true`, but the curve they selected, stored as data.
- Not `art_ok: true`, but the specific capture they nominated as the reference.

The verdict is then *derived from the recorded choice*: this rung passes because a
selection exists, names a real variant, and was made after the artifact's last
structural change. Now the same three rot mechanisms are all caught — an edit
invalidates the selection's recency, an optimistic record is impossible because there is
nothing to record until a choice exists, and unblocking would require fabricating a
choice that names a real thing.

This is the correct treatment of the human-selection tier, and it is why that tier is
evidence rather than sentiment.

## Record who chose, or the tier measures nothing

The trap that catches teams who have done everything else right: the pipeline auto-picks
a candidate so that the artifact is never in a half-built state — a reasonable
engineering decision — and the selection rung, which asks only whether a selection
exists, is satisfied the instant anything is produced. The rung now passes universally
and has become a very expensive constant.

The fix is to make **selection provenance** a stored fact alongside the selection
itself, with four values and no defaults:

- **none** — nothing has been selected.
- **auto** — the pipeline picked, to keep the artifact whole.
- **human** — a person picked. Set only by the act of a person picking, including when
  they pick the machine's own candidate; that click is a real endorsement and must be
  recordable as one.
- **unrecorded** — the selection predates provenance tracking. This value is
  load-bearing: back-filling old records as *human* fabricates evidence, and back-filling
  them as *auto* condemns work that may have been chosen carefully. Unknown is the
  truthful answer and must be expressible.

Whether the rung *requires* human provenance to pass is a policy decision with real
costs — a hard requirement blocks unattended production entirely. What is not
negotiable is that the provenance is recorded and displayed wherever the rung's verdict
is displayed, so the claim being made is the claim that is true. A rung that passes on
an auto-pick while presenting itself as a human judgment is worse than no rung.

## Self-reports are inputs, never verdicts

A producing process — a generator, an import job, an authoring assistant — will happily
report that its own output is good. Record that report. Label it as self-reported. Never
let it render a rung green.

The construction: the producer writes a fact (*I emitted this artifact with these
fields, and my internal validation returned clean*), and the evaluator, a separate piece
of code reading the artifact from storage, decides what that is worth. Usually it is
worth something — a clean self-report plus an independent state read is stronger than a
state read alone — but its contribution is bounded and visible, and a producer that
starts lying degrades one input rather than turning the whole board green.

## Where storage is unavoidable

Behavioural and perceptual evidence cannot be re-derived on read: re-running the game to
paint a dashboard is not viable. That evidence is therefore stored, and storage
reintroduces the drift problem in its honest form.

Three requirements make stored evidence safe:

1. **Store the observation, derive the verdict.** Persist the trace, the counter, the
   capture — the raw thing the observer produced. The verdict is computed from it on
   read, so a change in what counts as passing re-grades history correctly rather than
   requiring a migration.
2. **Bind it to what it observed.** The stored observation names the artifact version it
   was taken from. When that version is superseded the observation does not vanish; it
   becomes evidence about a previous state, and must be displayed as such. (The full
   binding-and-standing discipline belongs to verdict integrity.)
3. **Age is part of the value.** A stored observation displayed without its age is a
   toggle with extra steps. Every surface that shows one shows when it was taken.

## When not to use this

Do not derive verdicts that require an expensive computation on every read of a
high-traffic surface. Derive them on write of the underlying facts and cache with the
facts' fingerprint as the cache key — that is still derivation, and the cache key is
what keeps it honest. What is forbidden is a stored verdict with no key back to the
state that produced it.

Do not force derivation onto genuinely subjective, genuinely unrepeatable judgments —
a creative director's call that a creature reads as menacing enough. Record it as a
selection with its author and date, let it expire on structural change, and be honest
that this rung's authority is a person rather than a program. That honesty is available
only because the tier axis distinguishes evidence kinds in the first place.
