---
layer: golden-path
type: golden-path
subject: submission-filing
status: forged
use_when: [building an awaiting-submission queue or filing checklist, deciding when a submission counts as filed, aggregating org filing experience into funder guidance, designing status transitions around the submit moment]
techniques:
  - funder-portal-resolution
  - standard-materials-checklist
  - crowd-verified-filing-profiles
  - majority-rule-doc-consensus
  - proof-of-filing
---

# Submission filing

Between "the proposal is written" and "the funder has it" lies a stretch of
work that grant software habitually pretends does not exist: finding the right
portal, assembling the exact materials this funder demands, clearing the
portal's own validation, and coming away with evidence that the filing
happened. The naive reading treats filing as a status flip — a button labeled
"submitted" that the user clicks on the honor system. The principal reading
treats filing as a **verification problem**: the system's job is to get the
applicant to the right door with the right papers, and then to distinguish,
durably and provably, between *we believe we filed* and *we can prove we
filed*.

The distinction matters because everything downstream leans on it. Win-rate
analytics, deadline guarantees, success-fee billing, and award reporting all
take "submitted" as an input fact. If that fact is an unverified click, every
derived number inherits the softness — and the org discovers the difference at
the worst possible moment, when a funder says "we never received it" and the
system has nothing to say back.

## Three kinds of filing knowledge, three grades of trust

A filing surface draws on three distinct sources, and the cardinal sin of the
domain is presenting them at the same confidence:

1. **Deterministic knowledge** — what can be derived mechanically from
   structured data: a public opportunity page reconstructed from a stable
   identifier, a deadline copied from the ingested record. This is safe to
   present as fact, but only where the derivation actually holds; where it
   does not, the honest output is *nothing*, not a guessed link
   (funder-portal-resolution).
2. **Generic knowledge** — what is typically true of the funder class: the
   standard materials a nonprofit application demands almost everywhere. This
   is genuinely useful and genuinely not per-funder truth, and it must be
   labeled as the former without impersonating the latter
   (standard-materials-checklist).
3. **Experiential knowledge** — what organizations that actually filed with
   this funder report: the portal they really used, the documents really
   demanded, the time it really took. This is the highest-value knowledge in
   the system and also the least trustworthy per datum, because any single
   report can be wrong, idiosyncratic, or malicious. It earns authority only
   through aggregation with sample-size discipline
   (crowd-verified-filing-profiles, majority-rule-doc-consensus).

The filing surface composes them in strict preference order — experiential
when trusted, deterministic when derivable, generic as the floor — and each
row of the UI says which grade it is showing. A checklist captioned "typical
materials, confirm against the funder's guidelines" and a checklist captioned
"reported by seven organizations that filed here" are different claims, and
the user's verification effort should differ accordingly.

## The submit moment is a one-way door

Marking a submission filed is not an ordinary status edit. It is the moment a
draft stops being the org's private object and becomes a claim about the
outside world — *this left the building*. Model it that way:

- **The transition is irreversible by design.** From filed, only outcomes
  follow: awarded, declined. There is no path back to drafting, because the
  funder's copy cannot be un-sent, and because every metric keyed on
  submission counts would silently corrupt if filings could be retracted.
- **The one safe reversal is abandonment.** A draft set aside *before* any
  submission signal recorded nothing the outside world saw; reactivating it
  corrupts no metric. Grant work is cyclical — last year's abandoned draft is
  next year's head start — so this reversal should be easy, and it is the
  only one that should be.
- **An irreversible action earns a confirmation.** Not as ceremony: the
  confirm dialog is where the interface tells the truth ("this is one-way;
  only an outcome follows") and where the misclick dies. Copy that promises
  reversibility the transition guard does not offer is a bug of the honesty
  kind, worse than a crash.
- **The submit moment is also the harvest moment.** The instant an org marks
  a filing is the one instant it holds ground truth nobody else has — which
  portal, which documents, how long, what confirmation identifier the funder
  issued. Capture it there, in the same gesture, or lose it forever; no one
  returns a week later to backfill filing metadata.

## Filed is a claim; verifiable is a fact

Real submission systems issue evidence: a tracking or confirmation number, a
timestamped receipt, a validation email. Mature funders' portals stamp the
submission instant and use *that* clock — not the applicant's — to decide
on-time. A filing record therefore has two independent booleans, and the
system must never blur them:

- **filed** — the record reached a filed state. This is the user's claim.
- **verifiable** — the record carries funder-issued evidence: a confirmation
  number or an attached receipt. This is the world's countersignature.

`verifiable` is strictly `filed AND evidence present`; evidence without a
filed state proves nothing, and a filed state without evidence remains an
honor-system entry (proof-of-filing). Surfaces that make promises — deadline
guarantees, fee triggers, compliance reports — key on `verifiable`, never on
`filed` alone. And the two states must be visually and semantically distinct
everywhere, for the same reason a compliance report must not confuse "no
issues found" with "not checked."

Two portal realities sharpen the design. First, **submitted is not
accepted**: federal-style portals validate *after* submission, and a filing
can bounce days later for a malformed attachment or a mismatched registration
identifier. A confirmation number proves receipt of the package, not
acceptance of the application — track the post-submission validation state
where the funder exposes one. Second, **evidence can go missing at the exact
moment of success**: a connection dropped mid-submit can leave a filing
received by the portal but no confirmation delivered to the applicant. The
correct response to missing evidence is "check the portal's status page
before re-filing," never "assume it failed" — a blind resubmission risks a
duplicate, and a blind assumption of success risks a phantom filing.

## Time is part of the filing model

Filing knowledge includes temporal craft the checklist alone does not carry:

- **Registration precedes filing by weeks, not hours.** Government portals
  routinely require organizational registration chains that take multiple
  weeks end to end. A pipeline that surfaces the deadline without surfacing
  the registration lead time invites the classic disaster: eligible, written,
  and locked out.
- **The safe filing target is well before the cutoff.** Portals degrade under
  deadline-hour load; the experienced norm is to file with a buffer measured
  in days, not minutes, because the timestamp that decides on-time is the
  portal's own.
- **Effort estimates come from the crowd.** "How long does filing with this
  funder actually take" is experiential knowledge — report the median of
  contributed durations, suppressed below the sample-size floor, so the
  estimate is honest or absent.

## Failure modes this standard exists to prevent

- **The fabricated link** — a portal URL guessed from the funder's name,
  sending the applicant to the wrong door with hours left.
- **The impersonating checklist** — generic materials presented as this
  funder's requirements, so the applicant stops checking the one source that
  is authoritative.
- **The single-report oracle** — one org's filing experience republished as
  the canonical profile, outliers and all.
- **The honor-system metric** — win rates, guarantees and fees computed over
  "filed" clicks that no evidence backs.
- **The reversible submit** — a status model that lets filings un-happen,
  quietly corrupting every count derived from them.
- **The lost harvest** — filing ground truth that existed for one moment in
  the user's hands and was never asked for.
- **The trusting renderer** — crowd-contributed URLs and text flowing into
  links and prompts as if they were the system's own data.

## The techniques

- [funder-portal-resolution](./techniques/funder-portal-resolution.md) —
  deriving the filing destination deterministically where possible, returning
  an honest null where not, and letting verified experience override both.
- [standard-materials-checklist](./techniques/standard-materials-checklist.md) —
  the generic materials floor: useful, clearly captioned as typical rather
  than authoritative, and displaced by verified per-funder knowledge.
- [crowd-verified-filing-profiles](./techniques/crowd-verified-filing-profiles.md) —
  harvesting portal, documents, duration and evidence at the mark-filed
  moment and aggregating them per funder with confidence tiers by sample
  size.
- [majority-rule-doc-consensus](./techniques/majority-rule-doc-consensus.md) —
  admitting a document into the canonical per-funder list only on a strict
  majority of contributing filings, so one outlier cannot dictate the
  checklist.
- [proof-of-filing](./techniques/proof-of-filing.md) — the two-boolean model:
  filed as claim, verifiable as evidence-backed fact, and the downstream
  surfaces each is allowed to feed.
