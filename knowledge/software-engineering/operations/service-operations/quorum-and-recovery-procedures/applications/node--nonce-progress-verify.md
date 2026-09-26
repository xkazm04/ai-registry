---
layer: application
type: application
subject: quorum-and-recovery-procedures
technique: nonce-progress-verify
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: code
ab_verdict: better
---

# Retiring a single operator's root secret: what `kp`'s rotation verified, and what it did not

kp's `KP_SECRET` is root material held by one operator. It encrypts every stored credential,
keys the session HMAC, and, on an install without a dedicated `KP_SKILL_PROFILE_KEY`, signs
every skill profile a third party checks at `/skill/<token>`. Its rotation has one
participant, so [nonce-progress-verify](../techniques/nonce-progress-verify.md)'s nonce and
k-of-t report are overhead, as the technique says. Its commit edge is not overhead: the old
material retires only after a verification. The question is what that verification covered.

## What it gets right

**Retirement is a separate, later step.** The runbook keeps the old secret decrypt-only
(`KP_SECRET_PREVIOUS`) until `scripts/secrets-rotate.mjs` has rewritten every ciphertext,
and the script says when unsetting is safe. A row neither secret opens blocks that verdict
and turns the exit code red. The script checks the target, the stored rows under the new
secret, rather than a proxy such as "the restart succeeded".

## The collapse, measured

The script checked only what it rewrote, which was ciphertext. Skill profiles are HMAC
*signatures* keyed by `KP_SKILL_PROFILE_LEGACY_KEY ?? KP_SECRET`
(`app/_lib/db/skill-profiles.ts`, `legacySkillProfileSecret`). The verifier never reads
`KP_SECRET_PREVIOUS`, and the script never looked at them. A harness drove kp's own modules
as a default install (no `KP_SKILL_PROFILE_KEY`, as `.env.example` ships). It minted 3
genuine profiles, followed the runbook, and ran the real script as a subprocess:

| arm | after step 1 | script says | after step 3 |
| --- | --- | --- | --- |
| as shipped | 3/3 "tampered" | exit 0, "You can now unset KP_SECRET_PREVIOUS" | 3/3 "tampered" |
| inventory added | 3/3 "tampered" | exit 1, names 3 profiles and the pin | 3/3 "verified" (the pin set) |

kp built a neutral "cannot verify" state precisely so that a configuration problem never
reads as fraud. A rotated secret is not "unconfigured", though: a key is present and
reproduces a different signature, so the verifier returns "mismatch". Under the shipped
runbook, a routine rotation showed every genuine credential to employers as forged, and the
procedure's own verification said it was done.

## The fix: verify everything the old material vouches for

The script now counts profiles still signed under the retiring secret and refuses to call
the rotation done until the pin is set (kp `525258aa`, `legacySignedSkillProfiles`, with a
unit test). The runbook's step 1 sets the pin, which also closes the window between the
restart and the script run that the "after step 1" column shows. Both arms still read
"tampered" there, because the harness skipped the new step 1. The pin keeps the retired
value alive as a verify-and-sign key for these profiles. That is why the message also asks
for `KP_SKILL_PROFILE_KEY`: new mints then move off the retired value.

## Not applicable

The nonce, the k-of-t report and the one-time pad all serve several holders; with one
operator there is nothing for them to protect. Share delivery and its encrypted fallback
have no counterpart, because the secret is typed into an environment file.
