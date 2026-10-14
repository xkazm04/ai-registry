---
layer: application
type: application
subject: grant-source-landscape
technique: open-call-vs-awarded-history
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Node: a state-portal adapter that cannot ingest award history (grant-writing-nonprofits)

The ingest layer already knew the distinction in prose: the state-portal
adapter's header records a dated survey finding that open-data portals
overwhelmingly publish past disbursements, and only one dataset in the survey
carried a real application-window column. The knowledge lived in a comment,
not in the code path. The generic Socrata factory accepted any config, and the
close-date field map was optional.

## The seam, chosen to falsify "history is already kept out"

Downstream, a null close date counts as open (rolling or no posted deadline is
kept; only a parseable past date is excluded). So a config that maps no
window column turns every award-history row into an applicable-looking
opportunity: the masquerade problem, reproduced by a missing optional field.

- **A (before):** a config without a close-date column fetches and emits
  null-close rows that the open filter keeps.
- **B (after):** the factory refuses such a config before any network call,
  naming the reason, unless the config declares `rollingCalls` (the technique's
  forecast and rolling-call boundary: absence of a column is allowed only when
  declared, never by default).

## Verdict

Target: window-less config fetch, refused before network in B and not in A
(the test fails on the old code). Floor: the verified live feed and the
unverified template config unchanged, 207 ingest tests green, type check and
lint clean. The technique held; no amendment. The existing `reverify` note
about rolling calls is what shaped the opt-in rather than a hard ban.
