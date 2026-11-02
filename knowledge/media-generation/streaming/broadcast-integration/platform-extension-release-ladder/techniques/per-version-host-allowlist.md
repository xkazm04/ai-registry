---
layer: technique
type: technique
subject: platform-extension-release-ladder
technique: per-version-host-allowlist
status: forged
laws: []
shared_with: []
use_when: [choosing the backend address a platform extension will call, adding an outside service to an extension front end, preparing the address list for a version submission]
---

# Per-version host allowlist

Every outside address an extension's front end touches — the team's backend, an image
host, an audio file, any fetch or socket — is declared with the version, and only
declared addresses are reachable. The list is part of the version: it is reviewed with
the code, and changing it is a new version.

## Why

The platform fences the front end because it runs in every viewer's browser. An address
list lets the reviewer see where viewers' browsers will be sent and what the extension
could pull in, and it lets the platform enforce that boundary in the browser. For the
team it means something more practical: **the backend's address is frozen at
submission.** Moving the backend to a new host, adding a second region on a different
name, or bringing in a third-party service is a code change in all but name, and costs
the same review cycle.

## Procedure

1. **Choose the backend's public address before the first submission.** Put it on a name
   the team controls and will keep, so moving infrastructure behind it changes nothing
   the platform sees. A provider's default hostname that changes with the deployment is
   the wrong address.
2. **Use an identifiable host.** A shared public hosting domain where anyone can claim a
   subdomain is ambiguous to a reviewer; the address should be the team's own domain or
   carry an identifier unique to the team.
3. **Declare the minimum.** List the hosts the front end actually calls, per kind of
   request, and nothing speculative. Every entry is a question the reviewer may ask.
4. **Route third-party needs through the backend.** When the front end needs data from
   another service, the backend fetches it, reduces it to what the front end draws and
   serves it from the declared address. The list stays one host long, and the third
   party never sees viewers' browsers.
5. **Check the list against the built bundle.** Search the built output for every
   absolute address and every place one could be constructed. An address in the code
   and missing from the list fails on the hosted test rung; one in the list and absent
   from the code is a question nobody needs.
6. **Treat the list as part of release notes.** When a later version must add a host,
   batch it with other code changes, because it buys a review cycle whatever else rides
   along.

## Decision rules

- **When a new service is wanted on the front end**, proxy it through the declared
  backend unless the latency or volume makes that impossible; only then add a host, in
  the next version.
- **When the backend must move**, move it behind the existing name. If the name itself
  must change, plan a version that lists both names, release it, and only then retire
  the old one.
- **When the design document names an asset**, it names one in the bundle or on the
  declared backend, never a free URL; a document that can point anywhere has bypassed
  the list.

## When not to use it

A front end that talks to nothing but the platform's own services has an empty list, and
the technique reduces to keeping it empty: every addition is a version.
