---
layer: application
type: application
subject: session-resume
technique: delta-briefings
stack: next
status: forged
verified_on: 2026-09-26
verified_against: next@16
applied: simulation
ab_verdict: better
---

# Delta briefings where there is no boot store: a server-load briefing, two server delta queries, and a count taken over a sample

The technique was written against a desktop app whose boot fills client stores, so
"zero fetches of its own" was a filter over data already in memory. An App Router
page has no boot in that sense. Each route loads its own data on the server or in
an effect. So the question for this stack is not "does the briefing fetch" but
"does what it counts cover the whole away interval". Four surfaces in three trees,
read 2026-09-26, answer it three ways.

## ascent's live ledger - derived from the page's one server load

`src/features/inflight/live/ledger/briefingModel.ts` names this technique in its
header and follows it closely:

- **Derived, not fetched.** `deriveBriefing` is pure over the one `loadLedger`
  server load that renders the page, so the card and the sections it links to are
  filters over the same rows and cannot disagree. On this stack the server load is
  the boot.
- **Could-not-derive is not quiet.** Any missing read returns `{ kind: "error" }`
  (`:72`), and the card says which read failed. No news returns `null` (`:185`), and
  `LedgerBriefing` renders nothing for it (`LedgerBriefing.tsx:18`).
- **A bounded page is declared on the pixel.** The chronicle loads one page of runs.
  If the page is full and its oldest run started *after* the anchor, the counts are
  lower bounds. They print "N+", and the tooltip says only the most recent N runs
  were read (`:84`). The proof that the bound is tight when it is not declared is
  in the code: runs are sequential per org, so once the oldest loaded run started
  before the anchor, no unread run can have finished after it.
- **Current state is worded as such.** Pending approvals and pauses still in force
  are lines marked `current: true` whose text says "now". Ranking puts what waits
  for the operator first, and the card caps at `BRIEFING_CAP = 5` with the rest as
  overflow.
- **First look is a disclosed window, not silence.** With no anchor, the window is
  the last 24 hours, and the card says "in the last 24 hours"
  (`FALLBACK_WINDOW_MS`, `:27,78`). The ledger is a page the operator navigated to,
  not an arrival card. The technique's first-run silence is written for the card
  that interrupts; a destination the reader opened may answer with a bounded,
  labelled window instead.

## ascent's Alerts chip - a server delta query with its own cap

The chip has no page load to derive from. It renders on every org page, and the
server evaluates "movement since your anchor" as two bounded reads with a
`cap + 1` probe (`src/lib/db/org-movement.ts:77,119`). The badge reads "9+" when
capped. Under the old wording this is "a briefing issuing its own request". Under
the conditioned one it is correct: the anchor is on the server, the interval is
unbounded, and the authority's own delta query is the only way to count it honestly.
In the popover the reader opened, no movement renders as "Nothing moved. You're up
to date." (`AlertsMovement.tsx:123`), and a first look is labelled "Since you joined"
(`:120`) against the join-date fallback. That is a caught-up confirmation on a pull
surface, which is where one belongs.

## politicas `/schranka` - its own fetch, deduplicated, over the whole window

The inbox page and the chrome badge each ask the server for news since the visit
threshold (`features/schranka/useNews.ts`). They share a 60-second module cache keyed
by the query (`:20,34`), so a page view costs one request, not two. The server
derives from the same memoized loaders its feeds use, so the badge, the page and
the RSS feed cannot report different news. There are two honest bounds:
- Per-entity rows are capped at `DELTA_ENTRIES_CAP = 25`, with the total counted
  before the cap and a link to the full record.
- A first visit gets a disclosed seven-day window (`FIRST_VISIT_DAYS = 7`,
  `deriveDeltas.ts:100`).

On the page, a followed entity with nothing new says so on its own line
(`SchrankaPage.tsx:169`). That is a zero on a destination, where the reader asked
about that entity. The badge is the push half, and it stays dark on zero. It also
stays dark on a failed fetch (`SchrankaBadge.tsx:22`), deliberately: the page is
where the error is told. So quiet and failed are the same at the badge and different
one click away.

## systedo-case - derived from a sample and shown as a total

`src/app/api/alerts/route.ts:28` computes `unread` by filtering the list
`listAlerts` returned. That list is the newest 20 (`src/lib/campaigns/alerts.ts:180`,
`limit = 20`), and the inbox renders "{n} unread" with no "+"
(`src/components/campaigns/AlertsInbox.tsx:188`). With more than 20 alerts outstanding,
the badge shows at most the unread among the newest 20 and presents it as the total.
This is the technique's bounded-sample failure, and it breaks under both wordings.
Recorded for the project, not fixed here. The fix is the one the chip uses (a
count query or a `limit + 1` probe) or "20+".

## The simulation, and what moved

The same four surfaces, judged under the old rule ("zero fetches of its own") and
under the conditioned one ("derive from what is loaded when it covers the whole away
interval; otherwise one delta query to the authority, bounded and disclosed"):

| surface | old wording | conditioned wording |
| --- | --- | --- |
| ascent ledger (server load) | conforms | conforms |
| ascent Alerts chip (server delta query) | deviation: own request | conforms: the anchor and the interval are the server's |
| politicas inbox (own deduplicated fetch) | deviation: own request | conforms: no boot store exists on the route |
| systedo-case unread (filter over newest 20) | conforms: no extra fetch | deviation: a sample shown as a total |

The decision moves in three of four, each in the direction the evidence supports.
The old wording would have told two correct designs to stop fetching and passed the
one that miscounts, because it measured requests rather than coverage. The
conditioned rule sends the fix to the right surface. Falsifier: a surface whose
loaded data covers the interval but which fetches anyway. None of the four does.
