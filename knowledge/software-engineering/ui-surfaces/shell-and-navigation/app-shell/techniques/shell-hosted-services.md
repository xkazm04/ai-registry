---
layer: technique
type: technique
subject: app-shell
technique: shell-hosted-services
status: forged
laws: [creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [deciding whether a candidate earns shell residency, everything works except the first second, a side effect stops when an unrelated page unmounts, a different user signs in over a lapsed session or switches team in the same tab]
---

# Shell-hosted services

The shell never unmounts, which makes it the product's service host: the one
place to mount machinery whose lifetime is the session, not a page — event
bridges, connection managers, notification outlets, command palettes, tour
engines, schedulers, telemetry flushers. This technique is the discipline of
hosting: what earns residency, how residents start, in what order, and how
they end.

## The admission test

Shell residency is expensive — every resident runs on every screen for the
whole session — so admission has a test, applied per candidate:

- **Session-lifetime state or side effects.** The candidate holds something
  that must survive navigation: an open connection, a subscription, a queue,
  a timer that must not reset when the user changes sections. Page-lifetime
  work dressed as a service ("mount it globally so we don't have to think
  about cleanup") fails the test — that is leak laundering, not hosting.
- **Cross-section reach.** Its effects are visible or needed from more than
  one section: toasts appear over everything, the palette opens anywhere,
  the connection feeds many pages. A service only one section consumes
  belongs to that section, warm-kept if need be.
- **Exactly one.** The candidate is a singleton by nature. If two instances
  could meaningfully coexist, it is a component, not a shell service.

The resident list is enumerable in one place — a single host region in the
shell where every service is mounted, visible in one reading. Services
scattered through the tree ("this panel also happens to start the sync
loop") make the session's machinery unknowable; the classic symptom is a
side effect that stops when an unrelated page unmounts, and nobody knows
why.

That one place must also sit *above the swap point*. A frame that survives
navigation and a host mounted inside the part of the frame that is rebuilt per
section are not the same guarantee: the second tears its residents down on every
move, and does it in silence — an open conversation, a running upload, a live
connection all reset with no error and no symptom except that the session never
seems to accumulate anything. A global surface that must outlive navigation is a
sibling of the swapping region, never a child of it, and anything that re-keys
that region per location is a teardown instruction whether or not it was written
as one.

## Two populations: workers and surfaces

Residents split by whether they paint:

- **Workers** — headless: bridges, pollers, flush loops, watchers. They
  mount invisibly, produce no layout, and communicate only through owned
  state and events.
- **Global surfaces** — visible on demand: the notification outlet, the
  command palette, dialogs hoisted to survive their opener, tour overlays.
  They mount permanently but render nothing until summoned, and they render
  at the shell's layer roots so their stacking is governed by the product's
  one layer policy, not by whichever page is up.

The split matters because their failure modes differ: a crashed worker must
not take the frame down with it, and a global surface must not be reachable
only from the page that happened to configure it.

## Start-up: order is declared, readiness is real

Services depend on each other — the event bridge before anything that
subscribes to it, identity/session before anything that acts on the user's
behalf, persisted-state hydration before services that read it. The
discipline:

- **Order is explicit.** The host mounts residents in a declared order that
  encodes the dependency story, readable in one place. Order-by-accident
  (whatever the tree happened to evaluate first) works until a refactor
  reorders siblings, and the resulting bugs — missed early events, reads of
  unhydrated state — are timing-shaped and unreproducible on demand.
- **Ready is a state, not a hope.** A service that consumers depend on
  exposes readiness; consumers that fire during start-up either wait on it
  or their inputs are buffered. The alternative is the silent first-event
  loss: everything works except whatever happened in the first second.
- **Start-up never blocks first paint.** Workers initialize behind the
  shell, not in front of it; a service that needs a slow resource acquires
  it after the frame is interactive.

## Shutdown and the reaper

"Never unmounts" is almost true, and *almost* is where the leaks live. The
session does end — sign-out, workspace or profile switch, app exit — and
some hosts also tear down on hot-replace during development. Every resident
names, at creation, what destroys it and when
([law: creation names its reaper](../../../../_laws.md#creation-names-reaper)):
subscriptions unsubscribed, timers cancelled, connections closed, queues
flushed or persisted. A service that cannot answer "who stops this?" is a
leak with scheduling.

Two ending classes, kept distinct:

- **Session end** (sign-out, switch): residents flush and reset *user-scoped*
  state completely — the next session must not inherit the previous user's
  queues, marks, or connections. Ordering reverses: consumers stop before
  the bridges they consume.
- **Process end** (quit): best-effort flush with a deadline; anything that
  must survive uses write-ahead persistence during normal operation rather
  than a heroic exit handler.

### Identity decides the class, and the reaper has two halves

**A session ends when the principal changes, not when a credential does.** A
token that lapses and is re-issued to the same person mid-work is not a
session end: the residents' state is still theirs, and the honest move is to
resume and re-read what the lapse left stale. The same in-place sign-in
completed by a *different* person, or landing in a different workspace, is a
session end, whatever the screen looked like. Classify on the identity the
fresh credential carries, compared with the one the residents were built for,
never on the event that prompted the sign-in. Identity here includes the
authority it holds: the same person returning with *narrower* rights (a role
lowered while the credential was lapsed) is a session end for whatever the
residents cached under the wider ones, even if nothing else needs resetting.

**Replacing the document is a legitimate reaper, and it reaps only memory.**
Where every identity-changing door (switch, sign-out, a re-sign-in by someone
else) ends in a full document replacement, the in-memory residents, their
timers and their in-flight requests all die with it, and nothing has to be
enumerated for them. That is a design, not an accident, once it is stated
beside the doors and every door honours it. It does nothing for state the
residents *persisted* to origin-scoped storage: that outlives the document,
and the next principal in the same browser reads it on the first paint. So a
persisted resident store carries the identity it belongs to in its key, or is
cleared on the way out, and a pre-identity key found on load is dropped rather
than adopted.

**An in-place reset must also discard answers already in flight.** A shell
that ends a session without replacing the document clears its stores, but a
read issued under the previous identity can still land after the clear and
write the previous principal's data back into the emptied state. Cancel or
fence in-flight work (an identity epoch the late answer is checked against)
before clearing, not after. This is why the replacement route is the simpler
correct one where a reload is affordable.

## Failure containment

A resident's crash is a degraded session, not a dead product:

- Each resident is isolated so its failure cannot unmount the frame or its
  sibling services.
- A dead worker is *known* dead: it reports its failure to the product's
  error channel and, where users depend on its effects, degrades visibly
  (a stale indicator, a reconnect affordance) — a silently absent service
  is indistinguishable from a healthy quiet one, which is the failure mode
  that costs the most to notice
  ([law: failure is not empty success](../../../../_laws.md#failure-not-empty-success)).
- Restartable residents restart with backoff; non-restartable ones say so.

## The prohibitions, collected

1. No service mounts outside the shell's one enumerable host region.
2. No page-lifetime work admitted as a shell resident.
3. No implicit start order — dependencies are declared where residents are
   mounted.
4. No consumer of a service fires before that service is ready, silently.
5. No resident without a named reaper for every ending class, and no
   persisted resident store without the identity it belongs to in its key.
6. No worker that dies silently; absence must be distinguishable from
   quiet health.
