---
layer: application
type: application
subject: business-profile-and-citations
technique: city-in-query-never-in-name
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@2026.10.14
applied: simulation
ab_verdict: unmeasurable
---

# The two roles of the city in a dashboard that measures local demand but never writes a profile

A Czech marketing dashboard for local and service businesses (commit
`479d9db1`, 2026-10-14) was read for where the city appears as a measuring term and where
it could appear in a name field. The structural finding is the useful one: the tree
holds the measuring role in full and holds no code that authors a profile name field at
all, so the naming half of the technique has no seam here yet.

## What A and B were

A is the tree as it stands. B is the same tree under the technique. No product change
was made: three real cases were walked under both policies, and the prediction is
labelled as reasoning, not measurement.

## The three cases

1. **Seeded service names.** The starter catalog's service rows are named without a
   city ("Montáž klimatizací" and its siblings); cities live in a separate locality
   list and a per-service area list. Policy A and policy B agree. Falsifier: any seeded
   or AI-extracted service name that contains a locality name.
2. **The coverage matrix.** Each row is a service crossed with a locality, labelled
   from the two fields at read time, and the gap list handed to the diagnosis prompt
   uses that composed label. This is the measuring role (service plus city, to read
   local volume) and it is correct, because the label never leaves the app and is never
   written to a profile. The risk the technique names is the label being copied into a
   name field; no code path does so. Falsifier: an export or publish step that writes a
   composed label out.
3. **The onboarding scan's offering field.** A model extracts "what the business sells"
   from a homepage as free text, and a homepage title often reads "[service] [city] -
   best, 24/7". The prompt gives no rule, so the extracted offering can carry the city
   and a modifier. It is free text feeding keywords and a summary, not a name field, so
   no harm follows today; it becomes a seam the day offerings seed profile service
   names. Falsifier: run the scan on a title with a city and a modifier and see whether
   the offering string keeps both.

## Verdict

`unmeasurable`. The technique held: nothing contradicted it, and no seam owns the
naming decision (the profile import path is read-only, and the diagnosis only recommends
connecting a profile). The instrument that would make it measurable is a profile-write
or export feature plus a scan fixture set with city-and-modifier titles. Return
condition: when a project grows a step that writes service or product names to a
business profile. No floor was declared because nothing changed.
