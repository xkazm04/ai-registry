---
layer: application
type: application
subject: requisition-lifecycle-governance
technique: publish-means-two-different-things
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# "Source into Pipeline" and the disabled "Publish to job boards" in kp

Citations resolved on 2026-09-29 against kp at `006bf7a0a`. kp is a working example of
most of this technique and of one place it is short.

## What is done right

**The external act is shown as unavailable rather than absorbed.** The technique's rule
for a system with only one of the two operations built is to name the built one for
what it does and show the other as explicitly unavailable. kp does both. The go-live
control is labelled for its internal effect, "Source into Pipeline"
(`messages/en.json:5789`), and the JD page carries a real, disabled "Publish to job
boards" button (`app/jds/[slug]/page.tsx:280-290`) whose tooltip says the integration
is coming and that it *"distributes the JD to external job boards, which is distinct
from sourcing candidates into the Pipeline"* (`messages/en.json:9837`). The lifecycle
table in `docs/features/jobs/README.md` lists "Published to job boards" as its own
row, not yet shipped (`:93`).

**The stored value is left alone and its meaning is written down.** The publish route's
header (`app/api/jobs/[id]/publish/route.ts:27-33`) says: user-facing this is "Source
into Pipeline" (internal go-live), *not* external "Publish to job boards", and *"the
route name and the 'published' DB status are kept as a stable contract."* That is the
technique's decision rule about renaming labels and not contracts, applied and
documented at the definition of the value.

**Distribution is not treated as approval.** No path reaches the external act; the
button cannot be pressed.

## Where the repo is short of the standard

- **The status that means "internal go-live" also opens a public door.** Every apply
  surface gates on one function, `isJobOpenForApplications(status)`
  (`app/_lib/job-ingest.ts:242`), which is true for `published` and for a null status:
  `api/apply/[id]/route.ts:172`, `.../quick/route.ts:68`, `.../session/route.ts:51`,
  the inbound webhook (`api/channels/inbound/[token]/route.ts:98`) and the JD read that decides whether
  the page offers Apply (`api/jds/[slug]/route.ts:200`). The close confirmation says so in plain words, that the *"public apply
  link will stop accepting applications"* (`messages/en.json:5980`), and the JD page's
  disabled-state tooltip says candidates can apply "once the role is sourced into the
  Pipeline" (`:9835`). So a role taken live by "Source into Pipeline" is reachable by
  anyone holding its apply link — the *unlisted* value from the technique — while the
  control's name promises an internal effect. The copy that admits it sits on the
  close dialog and on a tooltip, not on the go-live control.
- **There is no internal-only value.** The technique's table has a row for "make
  visible internally" that reaches only colleagues. In kp, `published` is one status:
  internal work plus a live public apply link. A team that wants candidates sourced into
  the pipeline *without* opening the apply door cannot say so; the two are not
  separable without a schema change to the status.
- **The metered unit is the go-live, once per job ever** (`publish/route.ts:129-151`,
  `classifyPublish().billable`): a reopen does not charge again. That is a billing
  decision and is not evidence for or against the technique, but it means a reopen and a
  first go-live share one route and one status write, which is the same fact seen from
  the money side.
