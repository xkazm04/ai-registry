---
layer: golden-path
type: golden-path
subject: portable-candidate-credentials
status: forged
use_when: [issuing a candidate a verifiable record of an assessment they earned, designing a credential a stranger can check without an account, deciding what a signature over a hiring result does and does not prove, writing the copy on a verification surface, deciding whether a credential is still meaningful]
techniques:
  - signed-artifact-over-a-canonical-form
  - freshness-is-separate-from-integrity
  - trust-state-resolution
  - substantive-versus-signed-but-empty
  - unverifiable-before-tampered-never-accuse
  - numbers-only-for-genuine-states
---

# Portable candidate credentials

Everything else a hiring process produces belongs to the employer. The scorecards, the
transcript, the sealed decision record, the notes, the ranking — all of it is written
about the candidate and held against the candidate's name, and none of it is theirs. A
portable credential is the exception and the only one: a verifiable record of an
assessment the person actually completed, issued to them, held by them, and presentable
by them to someone who has no relationship with you at all.

That inversion of ownership is not a feature detail: it changes the reader, and the reader
changes the design. An employer's audit record is read by a colleague, a compliance
reviewer or a regulator — people already inside your walls, who can be given an account
and can ask a follow-up question. A credential is read by a stranger the candidate chose:
another employer's recruiter, a client, a scholarship committee. They have no account, no
context, no way to phone you, no particular reason to trust you and no interest in your
internal process. They have one question — *is this real?* — and about eight seconds for
the answer.

Design for that stranger, holding a link a candidate sent them, on a phone, sceptical.

## The credential and the audit record are opposites, deliberately

They are constantly conflated because both are "a sealed record of a hiring outcome".
Hold them apart on five axes and the conflation dies.

- **Owner.** The audit record is the employer's; the credential is the person's.
- **Audience.** The audit record's reader is internal and adversarial toward *you*; the
  credential's reader is external and sceptical toward *the bearer*.
- **Purpose.** The audit record exists to reconstruct why a decision was made. The
  credential exists to attest that an assessment happened and what it produced. A
  credential that starts explaining the decision has drifted into the disclosure
  discipline, which owns what a candidate is told about their outcome.
- **Disclosure.** The audit record is retained whether or not anyone ever reads it and
  is disclosed under obligation. The credential is disclosed only when its holder
  chooses, to whoever they choose, and its existence must not leak who they showed it
  to.
- **Contents.** The audit record must carry the decisive inputs, the policy version and
  the actor. The credential must carry almost none of that — internal reasoning,
  comparative rank, interviewer identities and rejection rationale are the employer's
  context, and shipping them into a candidate-held artifact hands a stranger a dossier
  the candidate never agreed to publish.

The decision-audit discipline owns the employer's sealed records: the chain, the seal,
the actor attribution, what the chain proves. This subject borrows its integrity
vocabulary wholesale and owes it that debt explicitly — in particular the ladder from
integrity-evident to independently held, and the rule that you state the rung rather
than the aspiration. Do not restate that ladder here; cite it and stand on it.

## A signature attests integrity. Nothing else. This is the whole subject.

If a team learns one thing here, it is this. A valid signature proves the bytes you are
reading are the bytes that were signed, by a key you recognise — that the content has not
been altered since issuance, and that it came from the holder of the issuing key. It does
**not** prove the assessment was well designed, that the rubric measured anything, that
the score is comparable to another organisation's, that the person can still do the thing,
that the result is *current*, or — most subtly — that there is any substance inside the
envelope at all.

Every serious failure in this subject is a system quietly upgrading one of those into a
guarantee it does not have. The two that cost most are **currency** and **substance**, and
each takes its own technique because each is a distinct mechanism.

**Currency.** A signature is a statement about bytes at a moment; it has no opinion about
whether those bytes still describe the person. Showing a green check on a two-year-old
result is not a cryptographic failure at all — it is a modelling failure and a copy
failure. Worse is **supersession**: when the assessment methodology changes, an old
credential's signature still verifies while the meaning of its result has quietly retired.
A system that models freshness only as elapsed time never catches this, because
supersession is an event on your side, not a clock on theirs.

**Substance.** A signature over an empty payload verifies flawlessly and proves nothing —
the failure that looks most like success. A degraded pipeline returns nothing, the
envelope is assembled anyway and sealed correctly, and the surface shows a green check
over a hollow record. Structural emptiness must be its own resolved state: never a pass,
and never an error either, because nothing broke.

## Sign a canonical form, never a rendering

The artifact the bearer sees is a page: formatted, localised, regenerated by a template
redeployed twice since issuance. None of that can be the signed thing. Signatures are over
bytes, and a rendering's bytes change for reasons that have nothing to do with the claim.

So the signed object is a **canonical form**: a stated, versioned, deterministically
serialized set of fields, with explicit rules for ordering, number formatting, whitespace,
absent-versus-empty and text normalisation. Everything the reader sees is *derived from*
that form and none of it is authoritative.

The rule that saves teams years: **the canonical form is a published contract with a
version, and its serialization rules may never change under an existing version.** A
"harmless" change — sorting differently, dropping a null, upgrading a serializer —
invalidates every credential ever issued at once, and the symptom arrives as mass
verification failure that looks exactly like an attack. Version the form, keep old
versions verifiable forever, and let a credential name the version it was sealed under.
This is signed-artifact-over-a-canonical-form.

## Resolving trust is a closed vocabulary, and its order is a moral choice

A verifier asks one question and must get exactly one answer from a small, closed set.
Open-ended status strings are how a verification surface ends up with eleven meanings
for "hmm". A workable set distinguishes: **verified**, **revoked**, **unverifiable**,
**tampered**, **structurally empty**, **stale** and **superseded**. Six or seven states,
resolved in a stated order, each with its own copy — that is trust-state resolution, and
the order matters more than the set.

**Revoked** earns its place because it is the one state the issuer asserts deliberately,
and it is not a failure: the ordinary cause is *reissue*. When an assessment is re-scored —
a rubric correction, a re-run, an appeal upheld — the old credential no longer attests the
current result, and leaving it live lets the artifact in the candidate's hands silently
disagree with the record. Revoke and mint afresh. The guard that matters: never revoke
into nothing. If the re-evaluation produced no substance, the old credential stays intact —
withdrawing a genuine artifact with nothing to replace it takes something real from the
person for the sake of internal tidiness.

The ordering rule that transfers furthest out of this domain: **unverifiable must be
checked and reported before tampered.** When a signature does not check out, there are
two candidate explanations. One is that someone altered the record. The other is that
*you* changed something — rotated a key and did not keep the old one readable, migrated
the store, upgraded a serializer, redeployed with a different secret, restored a backup
from before a rotation. In the real distribution of causes, your own operational change
is overwhelmingly more likely than a forgery, because forging a credential is hard,
targeted and rare, while key rotation is routine and happens on a calendar.

So a system that shows "TAMPERED" on a failed check is, in most real firings, accusing an
innocent person of forgery over your own maintenance window. That is not a UX blemish: the
bearer is a candidate showing an artifact to someone they want to work for, and your
screen has just called them a liar in front of them. Distinguish the causes — unknown or
retired key, unrecognised form version, absent signature material, malformed envelope —
and resolve all of them to **unverifiable**, with copy that puts the fault on the system.
Reserve tampered for the narrow case where key, version and material are all known and
well-formed and the digest still disagrees, and even then report the fact rather than
impute the act. This is
unverifiable-before-tampered-never-accuse, and it is the most portable idea in the
subject: any system that verifies anything held by a person should adopt it verbatim.

## Numbers are earned by the state, not by the payload

A credential that cannot be verified does not get to show a score. It is violated
constantly and never maliciously, because the number is right there in the payload and
the template already has a slot for it.

A number renders as fact regardless of the badge beside it. A reader shown "78" under a
grey "could not verify" chip walks away remembering 78 — the chip loses to the digit every
time. Presenting a figure the system cannot stand behind converts an honest uncertainty
into an unearned claim, and the beneficiary is whoever supplied the unverifiable artifact.

So numeric detail — scores, bands, percentiles, sub-dimension breakdowns — renders only
in genuine states, and every other state renders the state and nothing else. This is
numbers-only-for-genuine-states, and it is the local reading of
[say only what the record holds](../_laws.md#say-only-what-the-record-holds). Note that
"genuine" is not the same as "verified": a credential can be genuine but stale, and the
right treatment of a stale genuine credential is to show its numbers *with the date and
the staleness stated*, not to hide them — hiding real results from their owner is its own
dishonesty. What must never render is a number whose provenance the system cannot
establish.

## What a portable credential can and cannot do for a person

Be blunt about this in your own product, because candidates will otherwise infer more
than it delivers.

**It can** prove that a named organisation, on a stated date, ran a stated assessment
with that person and recorded a stated result; that the record has not been altered
since; and that the person holds it and can show it without asking anyone's permission.
For an assessment based on observed work — a live exercise, a work sample, an interview
with recorded evidence — that is a genuinely useful thing to hand someone, and the
evidence-provenance discipline owns how much such an observation is worth as evidence in
the first place. Take its ladder as given; a credential can never be stronger evidence
than the observation it seals.

**It cannot** verify itself, if you chose a symmetric scheme. A shared-secret signature can
only be checked by the party holding the secret — you. The stranger is not verifying
anything; they are asking your hosted surface whether you stand behind an artifact and
taking your word for the answer. That is a legitimate model and the one most products
build, but it makes the credential portable the way a reference-check phone number is
portable: the person carries it anywhere, and the answer still comes from you. Only an
asymmetric signature over a published key lets a third party check offline, without your
servers and without your cooperation — including after you cease to exist, which is
exactly when a candidate most needs the artifact to still mean something. Know which one
you shipped and say so.

**It cannot** make a claim comparable. A credential issued by the organisation that ran
the assessment is only as trustworthy as that organisation's rubric, and the receiving
stranger has no way to inspect that rubric or calibrate it against their own. Without a
shared standard behind it — an agreed instrument, an external validator, a published
scoring methodology — portability moves a claim; it does not verify one. A signature
makes the claim *tamper-evident*, not *true*. Saying otherwise is the credential version
of the overstatement the audit discipline warns about, and it fails the same way: the
first sophisticated reader who notices stops believing everything else on the page.

It also cannot survive erasure cleanly. When a candidate exercises their right to have
the underlying record scrubbed, a credential already in the wild does not disappear — the
consent-and-retention discipline owns what is destroyed and what may be kept, and this
subject owns only the consequence: a credential whose backing record is gone must resolve
to an honest, non-accusatory state rather than continuing to verify against a record that
no longer exists or failing in a way that implies forgery. Decide that behaviour when you
design the credential, not when the first erasure request arrives.

## The honest case for issuing one anyway

Given all of that, why issue credentials at all? Not because they solve comparability.
Because of something plainer.

A candidate can spend four months in a process — application, screen, take-home, panel,
final — and walk out with nothing. No artifact, no record, no proof it happened. The work
they did belongs entirely to a company that decided not to hire them, and if they are
asked next month what they have been doing, they have a story and no evidence. That is
the ordinary condition of being a candidate, and hiring teams underrate it because they
never see the exit.

A portable credential changes that one thing: the person leaves holding something. It may
not be comparable, it may not open a door on its own, and a sceptical recruiter may shrug
at it — but it is a real record of real work, in their hands, that they can show without
asking permission. Most processes give a rejected candidate a template email. A verifiable
artifact instead is a small, honest correction to a lopsided exchange, and it is a
sufficient reason on its own.

Issue it for that. Design it for the sceptical stranger. Never let it claim more than a
signature can carry.

## Failure modes to design against

Four that the techniques below do not cover, because they are surface decisions rather
than verification logic.

- **A badge that names its verdict instead of its check.** "Verified" reads as "this
  person is good". Name what was checked, not how you feel about it.
- **Internal context on a public surface.** Rank, competitor comparison, interviewer
  names, rejection reasoning — none of it belongs on an artifact the bearer may hand to a
  rival employer.
- **A weak share link.** The credential's public address is its only access control, so it
  must be an unguessable value from a strong random source, distinct from any internal
  identifier. Reusing a short, ordered, internal record id makes the whole population of
  candidates' credentials enumerable by anyone who increments a number.
- **A verification page that reports back who checked it.** The credential is the
  candidate's; turning it into a beacon that tells you which companies they are talking to
  betrays the ownership the artifact claims.
