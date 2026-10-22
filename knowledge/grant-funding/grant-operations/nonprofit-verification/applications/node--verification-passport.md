---
layer: application
type: application
subject: nonprofit-verification
technique: verification-passport
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The verdict was right and the roster was quiet

Source tree: the fleet's grant-matching platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-22 at `e5414a7` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `72f7d57` and its ledger row is `a25216c`,
both on the project's `main`.

## What was already built

Most of the technique is already in the tree. The verdict has all three clauses: at least one
determinate pass, no determinate fail, and a name match that is not a mismatch. The name is
bound only against registry-canonical names, so a screening source that echoes back the claimed
name cannot confirm it. The trust score divides by determinate results only. The credential
expires 180 days after issue. It carries a spec version and a stub content signature, and
verifying it means recomputing that signature. There is one projection point into the onboarding
summary, and it also carries the legal-form reconciliation the technique's last decision rule
asks for.

So a seam that checked the verdict would have produced a bookmark. Instead the seam was chosen to
test the two claims the verdict cannot show: the passport lists *every declared source*, gaps
included, and the score travels with its denominator. If both had held, the technique would
describe the tree and nothing more. If either failed, the public credential would be found
attesting less than it appears to.

## The gap

The public passport page built its roster with the fan-out that runs only sources that have a
live adapter. Every declared source with no adapter was left out, not shown as pending. That
covers sources that are not built yet, screens switched off because their API keys are missing,
and registries the adapter table has never heard of. The adapter registry's own comment promised
a "coming soon" row per source, and the not-implemented adapter it builds for that purpose was
never reached on this path. The page shows its pending banner only when *nothing* ran. So a Czech
organisation whose one built registry confirmed it got a passport with one row and a trust score
of 100. Nothing told the reader that two of the three declared registries were never consulted.

The score had the matching flaw. It was printed as a bare number, and a run where nothing decided
(an outage, or a jurisdiction with no built adapters) printed 0, the same as an organisation that
every check had failed.

## What changed

The passport now uses a roster call that returns every declared source in declared order. Built
sources are run. Each one without a live adapter becomes an inconclusive not-implemented row,
labelled from the profile and marked "Not yet checked". The verdict and the score do not change,
because inconclusive rows are outside both. The score is printed as passes over decided checks
plus the declared count, for example "100 (1 of 1 decided · 3 declared)". When nothing decided it
reads "none (0 of 3 declared decided)", with no number. The built-only fan-out is still used by
onboarding, where "did anything run" is a real question.

## The paired proof

Arm A is the tree at `e5414a7`. Arm B is the change. The population is all four jurisdiction
profiles (Czech, US, British, and the supranational EU profile), 11 declared sources in total.
Each profile goes through both roster calls with a network that refuses every request, and then
through the project's real passport builder.

- **Target: declared sources missing from the passport roster.** A 8 of 11 (Czech 2, US 2 with
  the screening keys unset, British 3, EU 1). B 0 of 11.
- **Second target: rosters that print a bare 0 a reader cannot tell apart from all-fail.** A 4 of
  4, B 0 of 4.
- **Floor:** eligibility and the trust score are identical across arms for all four profiles. The
  type check and the linter are clean, and the suite passes 3,684 of 3,684. The new tests import
  the roster call and the score label, which do not exist on A.

## What this realization cannot do

The passport is still minted live on every page view. It is not persisted, so its expiry is never
actually tested: each reader sees a credential issued seconds earlier. The rule that an expired
passport counts as absent has no consumer here yet. The signature is still a truncated content
hash, labelled as a stub. It detects alteration but does not prove who issued it. A roster with a
passing source was covered only by unit test. The replay ran offline, so every row was
inconclusive, and the live verdict path was not exercised against a real registry.
