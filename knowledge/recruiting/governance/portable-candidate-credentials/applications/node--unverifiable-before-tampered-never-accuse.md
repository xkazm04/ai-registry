---
layer: application
type: application
subject: portable-candidate-credentials
technique: unverifiable-before-tampered-never-accuse
stack: node
status: forged
verified_on: 2026-08-20
---

# Tri-state signature checking in the Durable Skill Profile store

`app/_lib/db/skill-profiles.ts` is where this technique is realized, and its header
comment (lines 20–50) is a first-hand account of the failure it exists to prevent:

> `bug-ui-scan-2026-07-09 #1: KP_SECRET rotation/absence brands every genuine credential
> "TAMPERED"`

The original implementation signed a candidate's public credential with `KP_SECRET` — the
platform's session/provider secret — via `signProfile` in `app/_lib/skill-profile.ts:173`,
which reads `process.env.KP_SECRET` through `signingKey()` at line 162. `KP_SECRET` is a
routinely rotated auth credential. Every rotation, and every second environment where it
was unset, recomputed every signature to a mismatch, and the public page rendered a red
"TAMPERED" badge to whichever employer the candidate had just shared the link with.

## The three fixes, in the order they matter

**1. A dedicated credential key** (`skill-profiles.ts:57–72`). `activeSkillProfileKey()`
resolves `KP_SKILL_PROFILE_KEY` with an id from `KP_SKILL_PROFILE_KEY_ID` (default `"k1"`),
entirely decoupled from `KP_SECRET`. Rotating the auth secret no longer touches
credentials. `skillProfileKeyById()` at line 68 resolves a *retired* id to
`KP_SKILL_PROFILE_KEY_<id>`, which is what makes rotation non-destructive: each row stores
the `key_id` it was signed under (`skill-profiles.ts:296`, insert), and verify resolves the
key by that stored id, so outstanding `/skill/[token]` links keep verifying under the
retired key while new mints sign under the new one.

**2. The key id is bound into the MAC**, not merely stored beside it (`skillProfileMac`,
line 83). A stored id cannot be swapped to point at a weaker or retired key without
invalidating the signature — the same construction the decision chain uses in
`decisionContentMac` (`app/_lib/decision-hash.ts`).

**3. Verification is tri-state, and the states are structurally separate.**
`checkSkillProfileSignature` (line 104) returns `"ok" | "mismatch" | "unconfigured"`:

```
const secret = skillProfileKeyById(keyId);
if (!secret) return "unconfigured";
return timingSafeHexEqual(skillProfileMac(dsp, keyId, secret), signature) ? "ok" : "mismatch";
```

The absence of key material returns **before any comparison happens**. That is the
technique's step 1 realized in five lines: "cannot check" is established before "checked
and disagreed" can be reached, so a config problem can never fall through into a fraud
verdict. `verifySkillProfileToken` (line 317) then projects it onto the verdict:

```
const verifiable = sig !== "unconfigured";
const signatureOk = sig === "ok";
```

and `app/skill/[token]/page.tsx:32–36` states the rule in the copy layer's own words —
"unverifiable comes BEFORE tampered … that is OUR configuration problem, not evidence the
bearer forged anything."

## The legacy-pinning detail worth copying

Rows written before the fix carry `key_id = ""` and are verified by
`legacySkillProfileSecret()` (line 77), which reads `KP_SKILL_PROFILE_LEGACY_KEY` if set,
else `KP_SECRET`. That fallback exists so an operator who must rotate the leaked auth
secret can *pin* its old value under the legacy name and keep pre-fix credentials
verifying. This is the technique's step 2 applied retroactively — retired key material
stays readable forever, rather than converting a verifiable period into an unverifiable
one on the day of a routine rotation.

## Deviations from the standard

- **The scheme is symmetric.** `skillProfileMac` is an HMAC, so verification is
  issuer-hosted by construction; the module header calls this the "FICO lookup" trust
  model and notes asymmetric offline verification as a follow-up. The standard's honesty
  requirement holds: a hosted lookup is not third-party verification, and the public page
  should say so rather than implying a stranger checked anything themselves.
- **Dev/open mode still mints under the legacy auth secret** when no dedicated key is
  configured (`signNewSkillProfile`, line 118). The standard prefers issuing an honestly
  **unsigned** credential over signing with a key that may not survive the week; the
  mitigation here is that minting throws outright when no key material exists at all
  (line 123), so an unverifiable-by-construction credential is never handed out silently.
- **Copy is per-state but the diagnostic cause is not surfaced to operators as a metric.**
  The standard asks for a spike in `unconfigured` results, concentrated on one key
  generation, to raise an operational alarm — that is the difference between detecting
  your own bad deploy in minutes and hearing about it from a candidate.
