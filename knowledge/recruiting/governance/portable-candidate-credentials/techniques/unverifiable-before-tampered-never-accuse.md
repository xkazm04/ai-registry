---
layer: technique
type: technique
subject: portable-candidate-credentials
technique: unverifiable-before-tampered-never-accuse
status: forged
laws: [uncertainty-resolves-toward-the-candidate, absence-of-evidence-is-not-evidence, say-only-what-the-record-holds]
use_when: [a signature check fails, writing failure copy for a verification surface, rotating or retiring a signing key, migrating a credential store]
---

# Unverifiable before tampered — never accuse

## The concern

A signature check comes back negative. There are two families of explanation.

**Something changed on your side.** A key was rotated and the retired one is no longer
loaded. A key was regenerated on redeploy because it lived in ephemeral configuration. A
serializer was upgraded by a dependency bump. A store was migrated and a field was
re-typed. A backup was restored from before a rotation. A credential arrived from a form
version this build no longer implements. Someone re-encoded a text column.

**Someone altered the credential.** A forgery, or an edited payload.

The second is the one the code was written to catch. The first is the one that actually
fires — several orders of magnitude more often, because forging a credential is hard,
targeted and rare, while operational change is routine, scheduled and continuous. A
verifier whose failure branch says *tampered* is therefore, on almost every real firing,
accusing an innocent bearer of forgery because of your own maintenance.

Consider who is standing there. The bearer is a job candidate, showing an artifact to
someone whose good opinion they need, and your screen has just called them a liar in
front of that person. There is no correcting it afterwards; the reader will not read your
follow-up email. This is the sharpest case of
[uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)
in the whole domain, because the cost of the wrong reading is borne entirely by the person
with the least power in the exchange and the least ability to explain.

The rule: **a negative check is unverifiable until you have positively excluded every
operational cause.** Only what survives that exclusion may be called tampering, and even
then the copy reports a fact rather than imputing an act.

## Procedure

**1. Separate "cannot check" from "checked and disagreed" in the verifier's structure,
not in its copy.** Before any digest comparison, establish that the check is *possible*:
the key generation named by the credential is loaded; the form version is implemented;
the signature material is present and well-formed; the envelope parses; the backing
register is reachable. Any of these missing resolves to unverifiable and the digest is
never compared. A verifier that compares first and interprets afterwards will always be
one refactor away from mislabelling.

**2. Carry a key generation on every credential and keep every retired key loadable
forever.** This single practice removes the largest cause of false accusation. Rotation
adds a key; it never removes one. Removing a retired key converts every credential sealed
under it into an unverifiable artifact — and if your failure branch is loud, into a
crowd of accused people, all at once, on the day of a routine change.

**2b. Give credentials their own dedicated signing key — never the platform's session or
authentication secret.** This is the single highest-yield structural fix in the technique,
and it is the mistake almost every implementation makes once. An authentication secret is
an operational credential: it is expected to rotate on a schedule, on an incident, and on
every fresh environment. Sign candidate-held credentials with it and the day security
rotates that secret is the day every credential in the world turns red. Worse, a second
deployment where that secret is simply unset brands the entire population as forged with
no rotation at all. Decouple them, keep the credential key on its own rotation policy, and
if you have already made this mistake, allow the old secret's value to be *pinned* under a
separate name so previously issued credentials survive the rotation that exposed it.

**3. Make key material durable and stated.** A signing key held only in ephemeral process
configuration regenerates on restart, and the whole back catalogue turns unverifiable
silently. Where the key genuinely cannot be persisted — an environment that will not give
you one — issue credentials as **unsigned** and say so, rather than signing with a key
that will not exist tomorrow. An honestly unsigned credential is a modest claim; a
credential signed by a vanished key is a landmine under the bearer's name.

**4. Write the copy from the system's side of the fault line.** Unverifiable reads: *we
cannot verify this credential right now — this may be an issuer configuration change.
Contact the issuing organisation.* It never reads "invalid", "failed", "not authentic",
"altered", or anything with a red triangle. The bearer is not the subject of the sentence.

**5. Reserve tampered for the narrow, fully-qualified case**, and even there prefer the
report over the charge: *the content does not match the signature recorded for it.* State
what disagreed. Do not name a culprit; you do not know one, and an edit could have
happened anywhere between your database and the reader's screen.

**6. Log the diagnostic cause for operators, and never show it to the bearer's audience.**
"Unknown key generation" is exactly what your on-call needs and exactly what a stranger
must not have to interpret. It is also your rotation alarm: a spike in unverifiable
resolutions concentrated on one key generation is an operational incident, not a fraud
wave, and the log is what tells you which.

**7. When unverifiable is caused by an outage, say "try again".** A transient failure
rendered as a verdict about a person is your downtime becoming their reputation. Per
[absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence),
an unfinished check is not a negative finding.

## Decision rules

- **When you cannot distinguish an operational cause from tampering, the state is
  unverifiable.** Always. The asymmetry of harm is not close: a false unverifiable costs a
  support conversation, a false tampered costs someone a job and you a defamation problem.
- **When a mass verification failure appears, assume your own change until proven
  otherwise, and have a switch that puts the whole surface into unverifiable-with-notice
  while you find out.** Coordinated forgery of thousands of credentials overnight is not a
  real threat model; a bad deploy is.
- **When a credential's backing record has been erased at the candidate's request, resolve
  to unverifiable with a neutral explanation — never to tampered, and never to a message
  that reveals an erasure occurred.** A "this record was deleted" banner tells a stranger
  something about the bearer that they chose to have removed. The consent-and-retention
  discipline owns what is erased; this rule owns only that the credential's failure mode
  must not become a disclosure.
- **When a form version is unrecognised, do not attempt a best-effort re-serialization to
  see whether it happens to match.** A best-effort match is a coincidence, and a
  best-effort mismatch is an accusation you have no basis for.
- **Never expose a raw boolean to a template.** A verifier that returns false and a
  template that renders false as "tampered" is how this rule gets violated by people who
  agree with it, and it is the single most common way the good version of this system
  regresses.

## Where else this applies

This is the most transferable idea in the subject and it is not really about credentials.
Any system that checks something a person is holding — a ticket, a receipt, a licence, a
signed export, a shared link — faces the same asymmetry: its own operational churn vastly
outnumbers genuine forgery, and its failure copy is read as a statement about the bearer's
honesty. The rule generalises unchanged. Exclude your own causes first; accuse nobody;
put the fault on the system until the system is provably innocent.

## When not to use this

- **Not where the bearer is the adversary by construction.** A high-assurance access
  control at a door, where the population presenting artifacts genuinely includes
  attackers and the cost of a false accept is severe, may reasonably fail loud and closed.
  A hiring credential is not that; almost every bearer is exactly who they say they are.
- **Not as a reason to hide a genuine tamper.** The narrow case is real, and when it is
  fully qualified it should be reported clearly and investigated. Softening it into
  permanent ambiguity is the opposite error.
- **Not a substitute for durable key custody.** Politeness in the failure branch does not
  fix a system that regenerates its keys weekly; per
  [say only what the record holds](../../../_laws.md#say-only-what-the-record-holds), a
  product whose credentials are usually unverifiable should say that, and then fix it.
