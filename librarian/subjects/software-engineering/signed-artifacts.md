---
subject: signed-artifacts
domain: software-engineering
last_touched: 2026-09-04
dry_streak: 0
---

# signed-artifacts

First touch: 2026-09-04, an `/intake` run over an appliance firmware
(`github:jetkvm/kvm`, read as a system under the v2 design method).

## State

6 -> 7 techniques, 5 -> 6 applications. The new application is the first `go`
stack in the subject, which had been `react` and `rust` only.

Landed: **`bypass-is-a-versioned-policy`**. The subject's spine runs
produce → carry → verify → decide → commit, and every rung assumed the
verification happens. Nothing in it covered the case every signing project
actually reaches: **an artifact that must be installed unsigned**, because the
developer has no key, or the release candidate has not reached the signing
ceremony yet, or a support engineer needs a one-off on one unit.

The failure is not that a bypass exists — it is that it arrives as an ad-hoc
mechanism (an environment variable at the call site, a debug build flag, an early
return when the signature file is absent) and becomes a second validation door
nobody decided to build. The technique makes it one pure predicate over three
declared inputs — parsed version, explicitly-custom install, channel opt-in —
with deny as the default, in the shipping binary rather than a test helper.

The two branches carrying the risk, both from the source's own test table: a
version that does not parse **does not** bypass (the shortcut of treating a weird
version as a dev build hands the exemption to any malformed string), and a
prerelease bypasses only with the *installation's* opt-in, because being a
prerelease is a property of the artifact and being willing to run one is a
property of the device. Plus the carve-out: the component whose compromise is
unrecoverable — a system image under an application layer — is exempt from the
exemption and fails before any download is attempted.

## The coupling worth remembering

The exemption is not a concession; it is load-bearing for the source's own
release gate, which rehearses the OTA upgrade on real hardware from the published
stable release to the locally built (and therefore unsigned) candidate. Without a
first-class exemption that lane cannot exist; with an ad-hoc one it exercises a
code path production does not have. See the amendment landed the same run in
`release-pipeline/updater-chain`.

## Unapplied

No authorized fleet project verifies signatures on artifacts it installs, so the
technique has no seam anywhere and carries the return condition *when a project
grows one*. The `go--` application is written against the source tree itself
(Phase 7 v2).

## Leads

- The subject has nothing on **revocation of an exemption**. An exemption granted
  by version and opt-in is static: a prerelease that turns out to be harmful
  cannot be un-exempted from the feed's side, and the only lever is the device's
  own flag. Return when a second tree shows a mechanism for it.
