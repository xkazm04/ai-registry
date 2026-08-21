---
layer: technique
type: technique
subject: candidate-consent-and-retention
technique: retention-ttl-and-derived-disclosure
status: forged
laws: [say-only-what-the-record-holds, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [setting a candidate retention window, writing a privacy disclosure, making retention configurable per deployment]
---

# Retention TTL and derived disclosure

## The concern

Two numbers exist in every candidate system: the one the code enforces and the
one the candidate was told. They are written at different times by different
people, they drift, and only one of them is a promise. This technique is about
making the enforced number a deliberate, justified default; making it
configurable in the direction that is safe; and **deriving** the disclosed
number from it so the two cannot disagree in the dangerous direction.

## The window: pick a number and record its rationale

A retention default is a market and legal judgment, not a preference. Write it
down next to the constant, because the next engineer to change it needs the
reasoning more than the value.

Two rationales cover almost every case:

- **Defence tail.** How long after an adverse decision could that decision be
  challenged, and how long would reopening the requisition be realistic? This
  is what justifies holding an unsuccessful applicant with no consent at all.
  Six to twelve months past decision is the commonly defensible band in most
  markets; the number tracks the local limitation period for employment
  claims, which is why the default belongs to the deployment and not to the
  vendor.
- **Pool freshness.** How long is it credible that this person still wants to
  be in your database? Twelve to twenty-four months from last meaningful
  contact, with a renewal prompt before expiry. Past two years of silence, the
  claim is not credible and will not be believed by anyone assessing it.

**Decision rule.** When the record is held on the necessity of the application
itself, the window is the defence tail and it starts at the decision. When it
is held on optional consent, the window is pool freshness and it starts at
last meaningful contact. If you cannot say which of the two a given record is
on, that record has no basis — treat it as expired, not as retained.

## Anchor the clock to last meaningful contact

Define "meaningful" as an act by the candidate or a two-sided interaction: a
new application, a reply, a renewed consent, an interview, an update to their
own profile. Explicitly exclude anything the system does unilaterally — a
bulk mail, a re-index, a data migration, an internal note. If a routine job
can refresh the clock across the database, the policy is unbounded and the
number in the constant is decorative.

Re-import deserves its own rule. A candidate re-imported from an external
source has not contacted you; the import is your act, not theirs. Carry the
original contact date forward, or the migration silently resurrects every
expired record in the estate.

## Per-deployment configurability, one-directional

Different jurisdictions and different customers need different windows, so
the TTL must be configurable. Configure it with a floor-shaped contract:

- A deployment may **shorten** the window freely.
- A deployment may **lengthen** it only alongside a matching change to what
  candidates are told — the disclosure is not a separate string somebody
  remembers to edit.
- The shipped default is the conservative end of the band, not the permissive
  one. Defaults are what most deployments run, and a default chosen for the
  most retention-hungry customer becomes the behaviour of everyone who never
  looked.

## Derive the disclosure, and round it up

The disclosed ceiling is computed from the configured TTL plus every real
extension the implementation can produce: grace periods, notice windows,
sweep intervals, the fact that a monthly job means a record can outlive its
TTL by up to a month. Sum them honestly, then **round up** to a unit a person
can hold in their head — whole months, or "up to two years".

The rounding direction is the entire point and it is not symmetric.
Over-disclosure ("up to 24 months" when deletion happens at 20) costs
nothing: no candidate is harmed by the organisation holding less than it
warned. Under-disclosure ("12 months" when the sweep interval means some
records live to 13) is a false statement about a specific person's data, made
in the one surface whose purpose is to be trusted. Where the two directions
have unequal cost and you are unsure,
[uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)
— which here means resolving toward the more generous disclosure and the
earlier deletion.

**Decision rule.** Never let a human type the disclosed number. Compute it in
one place from the same constants the enforcement reads, and render it. Two
independently maintained numbers will diverge; the only question is when, and
whether you find out from a review or from a complaint.

## Disclose contents from the record, not from the schema

The second half of disclosure is *what* is held. Derive that list from the
entry in front of you: this person has a source document, so list it; this
person has no interview record, so do not. A template that renders the
schema's full capability tells candidates you hold artifacts you never
created — the surface that exists to be honest, inventing a holding about a
named person. That is exactly what
[say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)
forbids, and it is a worse failure here than anywhere else in the system
because it is unforced.

## When not to use this

- **Do not apply a single TTL to records under an active legal hold or an
  open dispute.** Those exit the TTL regime entirely and enter the
  carve-out's enumeration; a sweep that deletes evidence in a live claim
  causes a much larger problem than it solves.
- **Do not use a TTL as the only control.** A window is a policy; enforcement
  is a separate technique, and a TTL with no read-time gate behind it is a
  comment.
- **Do not derive the disclosure from the TTL alone** if any code path can
  extend retention — a queued export, a cached derivative, a backup with its
  own lifecycle. Either include those in the derivation or bring them inside
  the same clock. An honest ceiling accounts for the slowest path, not the
  primary one.
