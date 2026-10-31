---
layer: application
type: application
subject: kept-alive-screen-host
technique: sliced-screen-stream
stack: next
status: forged
verified_on: 2026-10-31
verified_against: next@16
---

# One NDJSON request per screen, and the line that ends every wait

Citations are against the public tree
[xkazm04/afterlife](https://github.com/xkazm04/afterlife) at `009c7893`
(`main`), read on the `verified_on` date. The lockfile range is `next` ^16.4.3
with `react` 19.2.4. The product is an agentic DevSecOps console: a dozen dense
screens (fleet, vitals, a review desk, a theater) under one client host
mounted by the app layout. This application records the wire contract and the
client fold that keep its dashes honest, plus the frame-first and hydration
rules from the same subject, because the three are one design in this tree.

## The contract is written down once

`docs/features/screen-host.md:41` "`GET /api/screen/<key>?<query>` answers
`application/x-ndjson`, never cached." The doc gives one line per slice and
then a reserved `_end` terminator (`:46-50`). `:52` "`status` is `ok` (with
`data`), `notFound`, `redirect` (with `to`, an in-app href) or `error` (with a
fixed `reason`)." `:53` "An absent value is an omitted key, never null or 0."
`:59-60` "Every declared slice the stream never answered becomes an error on
the client (`not served`), so a dash never waits forever." The doc puts the
client declaration and the server loader in two files per module, and `:86`
records that a test holds them to the same names in the same order for every
ready screen.

## The server: every slice at once, plain JSON enforced

`src/app/features/screens/stream.ts:1-5` states the writer's rules: every
slice starts at once in declared order, so a sync core is the first line; a
throw becomes a fixed reason with the message only in the server log; and
`:4` "Data that JSON would change (a Set, Map, Date, function, non-finite
number) is refused the same way." `unserialisable` (`:12-30`) walks the value
and returns the first offending path; `lineOf` (`:32-42`) turns that into an
`unreadable` error line and logs the path. The terminator is written only
after every slice has settled, `:85-88` `void Promise.all(runs).then(() => {`,
and the request's abort closes the stream (`:71`). A whole-screen loopback
refusal is one `_end` error line (`:72-75`), which the client fans out to
every slice with the same reason.

## The client: one pure fold per line

`src/components/shell/host/model/entry.ts:60` `applyLine` is the whole client
rule, and it is pure. On the terminator, `:63` `return { entry:
failUnread(done, declared, line.status === 'error' ? (line.reason ??
'unreadable') : 'not served'), effect: null };`, which is the technique's
*not served* rule in one line. A failed re-read never blanks a read slice:
`:69` `if (prev?.state === 'ok') return { entry: e, effect: null };`. An
identical answer keeps the old object, `:73` `const same = prev?.state ===
'ok' && e.texts[line.slice] === text;`, so a quiet revalidate that brings the
same text neither re-renders nor reseeds. `carry` (`:30-40`) implements the
partial read for a parameter change: the param's slices start unread, and
`only` asks for those plus any slice not yet read `ok`.

## Frame first, and the gate that keeps it

The doc's opening paragraph is the subject in one sentence: `:4-5` "the
screen's real frame (Window chrome, toolbar, panes) paints in the same frame
as the click: no skeleton, no loading bar, no Suspense fallback shape." The
playbook's step 3 is the data-optional rule: `:143` "Every unread value is
`<Unread/>`, never 0 and never blank. Never draw an amber count you have not
read." The pitfall the scouts ranked first is the seeded-once hook:
`:166-167` "`useState(props.x)` or `useReducer(r, init(props))` ignores the
data that arrives later. This is the main regression class." The gate is
`src/app/noSkeleton.test.ts:5-8`, with an allowlist of named still frames at
`:10` and a non-vacuity check at `:50-54`.

## Hydration agreement in the same tree

`src/app/features/guide/hooks/useDemo.ts:14` `const hydrated =
useSyncExternalStore(never, () => true, () => false);` is the hydrated flag,
and `:15` gates the branch as "hydrated and the condition". The host hides the
route's own page only after installing itself, and says why at
`src/components/shell/host/ScreenHost.tsx:99-101`: "on the server and in
hydration it renders as it is (on a claimed route a thin shell drawing
nothing), since a hidden <Activity> is skipped on the server". The server
passes its clock, in `src/app/features/needs-you/README.md:11-12`: the
decided list is "passed by `loadNeedsYouView` with `now`, the time the view
was read, so every age agrees between the server HTML and the hydrated page".

## Measured, and what was not

`docs/features/screen-host.md:202-205` records the dev-server measurement
that the frame is in the DOM at the first animation frame after the click,
with the core line arriving about 20 ms before a 780 KB estate line. The same
paragraph states that a production build was not measured.

## Deviation

The fold treats an empty object as unread for one query-scoped key (`:212-213`,
"answers `{}` for the scope it does not draw; the Frame treats `{}` as
unread"). That is an in-band sentinel in `data` where the protocol has
omitted keys and statuses for exactly this. A slice that genuinely answers
`{}` for the drawn scope would then render as a dash forever. The standard
stays: a scope that is not drawn should be a status or an omitted slice, not a
value.
