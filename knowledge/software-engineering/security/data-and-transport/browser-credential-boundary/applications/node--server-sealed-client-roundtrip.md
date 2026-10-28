---
layer: application
type: application
subject: browser-credential-boundary
technique: server-sealed-client-roundtrip
stack: node
status: forged
verified_on: 2026-10-27
---

# Sealed probe results in a setup checklist (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893 (the same
tree as the hackathon mirror on GitLab). A project-setup wizard streams one probe per request
(does this repository have a pipeline file, a test command, a token that works) and the final
Save comes back with every result. The save writes only the configuration lines an `ok` probe
confirmed, so a forged `ok` would write configuration nothing checked.

## The seal

`src/server/discover/probes/seal.ts:1-4` states the whole contract: "the server seals each
result it produced (an HMAC under a key that lives only in this process) and the save keeps
only results whose seal holds: a client cannot hand in an `ok` no probe returned. A server
restart voids the seals, and the wizard then probes again." Each of the technique's details is
present:

- **Canonical encoding.** `src/server/discover/probes/seal.ts:13` "Stable JSON: keys sorted at
  every level", and the test `src/server/discover/probes/probes.test.ts:69` verifies a result
  whose `data` keys arrive in the other order.
- **Context binding.** `src/server/discover/probes/seal.ts:20` feeds `rootKey(root)` into the
  HMAC before the result, and `src/server/discover/probes/probes.test.ts:71` refuses the same
  seal for another root — a pass on one repository does not verify for another.
- **Format check, then constant time.** `src/server/discover/probes/seal.ts:31` requires 64 hex
  characters before `timingSafeEqual` at `:33`.
- **One key per process, not per bundle.** `src/server/discover/probes/seal.ts:9` "Next may
  load this module once per route bundle, and the probe and save routes must share one key", so
  the key lives on `globalThis`. That is the upward lesson the technique's lifetime section took:
  without it the producing and consuming routes would never agree, and the failure would look
  like every client forging.

## Drop, count, say so

`src/app/api/onboard/save/route.ts:18` keeps `body.results.filter(... verifySeal(s, root))`,
and the answer carries `unsealed: body.results.length - sealed.length`
(`src/app/api/onboard/save/route.ts:20`), so the wizard can re-probe what a restart voided
instead of reporting a save that quietly lost its evidence. The probe route returns
`{ result, seal: sealOf(result, root) }` (`src/app/api/onboard/probe/route.ts:19`).

## Deviations recorded

- No expiry or nonce: within one process lifetime a sealed result replays indefinitely. For a
  single-person local tool whose probes are idempotent reads, the restart bound is the
  technique's accepted case; a multi-instance deployment would need the expiry the technique
  names.
- Both routes also sit behind the loopback gate (`src/app/api/onboard/save/route.ts:10`
  "await refuse(req)"), so the seal defends against a forged body from a local page, not
  against a remote caller — the two techniques compose rather than overlap.
