---
layer: application
type: application
subject: application-intake-and-conversion
technique: speed-to-lead-acknowledgement
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
---

# One ack seam, two timings (Node route handlers)

Every intake door files through `app/_lib/application-filing.ts`. Every first
acknowledgement and every newly-reachable re-ack goes through one seam in it,
`sendAck` (`:201-216`, "so the first ack and the newly-reachable re-ack cannot
drift"), whose body is `dispatchApplicationReceived`
(`app/_lib/comms-dispatch.ts:407`). The seam is right. When it fires differs
by door.

## What matches the technique

- **Off the response path.** The conversational door hands the dispatch to
  `afterResponse` (`app/api/apply/[id]/route.ts:397`), and so does the quick
  form (`quick/route.ts:147`). The comment beside the quick form's call says
  why: speed-to-lead "is about the LEAD landing fast, not about the applicant
  watching an SMTP round-trip". `afterResponse` (`app/_lib/after-response.ts:32`)
  logs a failing task and never breaks the response.
- **Best-effort with respect to the record.** A delivery failure is logged and
  never undoes a filing. Link minting inside the seam is caught, and the
  status token is best-effort: "null simply omits the status line, never
  blocks the intake" (`app/_lib/lead-intake.ts:56-61`).
- **Absolute links with the locale pinned.** The enrichment link is built as
  `${base}/apply/${job.id}?lang=${applicantLocale}` (`quick/route.ts:123-124`),
  and the status link carries `?lang=` on every door. The quick route's own
  comment names the failure this prevents: "a bare link dropped a Czech lead
  onto an English status page".
- **The tiny intake declares its thinness.** A quick or webhook lead files as
  an intake-degraded stub. The stub names the gates the source never asked,
  takes the unclassified archetype rather than a guess, and lands at the
  board's entry column (`application-filing.ts:276-299`).

## Deviations

- **The conversational ack waits on the parse.** For a door with no stub, the
  core runs `built = await build(...)` (the profile build) before the entry is
  created and before `sendAck` (`application-filing.ts:281`, then `:286`,
  `:321`). The dispatch is deferred, but its trigger is not. The first message
  follows the slowest step in the filing, which is the coupling the technique
  opens against. Only the stub doors (quick form, webhooks) acknowledge on
  landing.
- **The copy claims a timeline and a reviewer.** The ack body
  (`messages/en.json:560-561`) says "It's in our queue and will be reviewed
  shortly". The on-screen accepted message (`:2331`) says "A recruiter will
  review your profile and reach out about next steps shortly". Neither is
  something the record holds at send time.
- **The copy is someone else's.** The ack body opens "Thanks for submitting
  your work", because it shares keys with a different submission type.
- **The enrichment token does not expire.** It is scoped to one entry and
  checked against the job. But it is fill-only by design: "the link already
  emailed to the candidate must stay valid across repeat applications"
  (`app/_lib/db/pipeline.ts:1948-1949`). The technique asks for a scoped *and
  expiring* credential. The tree chose durability, and the choice is stated.
- **No time-to-ack metric.** The tree records `acknowledgement_sent` only when
  delivery succeeds (`comms-dispatch.ts:426`), and a process-local failure
  count for deferred tasks. Nothing measures submission-to-emit, the number
  the technique puts on the dashboard. That is also why the parse coupling
  above cannot be priced from the tree.
