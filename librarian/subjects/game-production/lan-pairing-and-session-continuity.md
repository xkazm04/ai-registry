---
subject: lan-pairing-and-session-continuity
domain: game-production
last_touched: 2026-10-09
touched_by: deepen
dry_streak: 0
---

# lan-pairing-and-session-continuity

Forged 2026-10-01 in the couch-and-tv-play category (8270e5a4), from the Death Ride project.
It had six techniques and two applications filed under `node`, both of which read a Kotlin
television host.

## Touch log

### 2026-10-09 - `/deepen`, single subject (run dp-lps-1009)

Dispatched by Curator's projection of the attention scan on **single stack (node)**. The
finding was half a mislabel. Both applications read a Kotlin 2.0.21 host on Ktor 2.3.12 CIO
and were filed as `node` because it was "the nearest server stack". The run used these
lanes:
- a field lane on the firetv `deathride/main` tree at `10974fa3`;
- a fleet seam search, run per project with `git grep`, with the Death Ride tree as the
  known positive;
- a measurement lane: JDK 22 and Node 24 binds on Windows 11, and a Python bind in a Linux
  6.6 container, with a live listener as the control;
- a bytecode read of the Ktor 2.3.12 jars;
- a counter-evidence web lane;
- a training-data-only blind lane.

**Refiled and widened.**
- The two applications now sit under `kotlin` (verified_against kotlin@2.0.21) and were
  re-resolved at `d9990777`. The 2026-10-06 optimize wave had moved every cited line.
- One new `node` application (node@24) records two loopback hosts, kp's onboard wizard and
  personas' gate daemon. Both skip the probe, walk on `EADDRINUSE`, and advertise the bound
  port with a credential minted per process.
- Anchor census: 22/22, 23/24 (the remaining one is an unquoted range) and 9/9 held, by
  `check-anchors`. It self-asserts against a planted negative.
- Several quotes had held only because the checker truncates a quote at its first inner
  double quote, so `LinkTest.kt:53` was matching `{`. Those quotes were rewritten without
  inner quotes.

**Measured (one run per case).**
- The active closer keeps the wait state; the host's close at pause puts it on the
  listening port.
- On Linux a later bind is refused unless both the new socket and the accepting listener
  set reuse.
- Windows binds over a wait state either way, so a Windows development machine cannot
  reproduce the stick's preflight bug.
- Ktor 2.3.12 CIO leaves reuse at the platform default. Its `start()` rethrows a bind
  failure and also fails the parent context, which corrects the project's own account of
  incident one.

**Conditions, each reached by two lanes:**
- **Walk the port only when nothing a client keeps is tied to it.** The fleet field read
  plus the blind lane. A phone's seat lives in per-origin storage, so the host must resume
  on the same port.
- **Check the socket's declared page origin before admission.** The OWASP WebSocket cheat
  sheet plus the blind lane. The A/B ran in the project's own suite.
- **Admission placed last inside a deadline is not sound where a finished scope can still
  time out.** The kotlinx `withTimeout` KDoc plus the blind lane.
- **What a page keeps after a refusal depends on the cause.** The field read plus the blind
  lane's per-cause refusal advice, and a simulation conditioned this run's own first draft.

**Evidence corrections, against primary sources:**
- `randomUUID` is gated on its own, and `getRandomValues` is not gated.
- One engine still fires orientation events on http.
- Phones lack element fullscreen and orientation lock, and vibration is absent or inert.
- The local-network prompt covers sockets as of 2026. A host-served page is local to local
  and outside it.
- A Windows `SO_REUSEADDR` hijack needs the first listener's cooperation.
- "Many server stacks never rethrow from start" is version-bound.

**Verified and left untouched:**
- the token-first precedence and the generation guard;
- the session-before-secret order. The blind lane would put the secret first for
  rate-limit accounting; that is one lane, and the technique's reason (no oracle mid-race)
  stands;
- the hello deadline's value range (the source uses 10 s; the blind lane proposed about
  5 s);
- the loopback fallback (still at `RaceServer.kt:415`);
- localhost as a secure context;
- the active-closer rule.

**Declined:**
- **The PIN in the URL fragment instead of the query.** Only the blind lane reached it.
  The counter lane found the referrer leak narrow under the default policy, and the
  technique already strips the secret from history. Banked below.

## Impact

The subject joins **0 contexts** across the mapped projects. This was checked with a map
dry-run in a clean worktree of `46003d13`, then a per-project `git grep -c` of each
committed `.ai/registry-map.json`. The positive control was pof joining game-economy-tuning
21 times. No verdict went stale and no `/conform --stale` queue exists. firetv, the tree
the subject reads, is still unregistered at HEAD; its registration is in the shared tree as
a sibling's uncommitted change and was not touched. kp and personas carry the walk seam but
are not mapped to this subject. Return: re-run the map once the firetv registration lands.

## Applied

- **token-seat-reclaim-precedence (origin before admission)** - firetv - code - better.
  `db9c3792`, local on `deathride/main`.
- **bounded-hello-timeout (admission outside the deadline)** - firetv - code - unmeasurable.
  `d9990777`, local on `deathride/main`; a fix by construction.
- **port-preflight-with-reuseaddress (reuse on the real listener)** - firetv - simulation -
  not-better. All three targets' defaults already agree; the condition gained is "a guard,
  not a fix a test will show".
- **port-preflight-with-reuseaddress (walk only when nothing is tied to the port)** - kp,
  personas, firetv - simulation - unmeasurable. All three already comply.
- **listener-release-on-pause-rebind-on-resume (refusal keeps by cause)** - firetv -
  simulation - not-better. The flat rule fails one cause of three.

Both firetv commits are unpushed. `deathride/main` is not the firetv default branch, and
this run's authorization covers default branches only.

## Open leads (banked, convergence rule applies)

- **Carry the PIN in the URL fragment.** Blind lane only. Return: a second lane, or a host
  that logs request lines.
- **Name each refusal cause on the wire.** It is the technique's own rule, and Death Ride
  still sends one message. The listener-release simulation shows it gates the page's retry
  behaviour. Return: a project change that names the causes; then re-run the three cases.
- **The orientation-event gate is not uniform.** One engine fires them on http, read from
  its interface definition and a closed bug. Return: a device test of tilt steering on a
  plain page.
- **Client or access-point isolation, a VPN on the phone, and multi-interface address
  choice.** Blind lane only; Death Ride's chooser takes the first private address of any
  interface. Return: a field report of a failed pairing on a guest network.
- **Project leads in firetv, not registry content:**
  - the loopback fallback is drawn as a pairing code (`RaceServer.kt:415`);
  - the host counts no failed PIN attempts;
  - the PIN is never stripped from the address bar;
  - the Ktor CIO listener never sets `reuseAddress` explicitly.

## Saturation

Depth rung L3. This pass added measurements on two kernels with a control, an A/B in the
project's own suite, and a bytecode read of the shipped engine.

Last-pass yield:
- 1 new application;
- 2 refiled and re-resolved applications;
- 4 two-lane conditions;
- 6 evidence corrections;
- 0 techniques;
- 2 project commits.

Dry streak 0. Clocks: the applications derive their window from the stack, with no
override. The local-network-permission paragraph in capability-detect-insecure-origin moves
with browser releases and is the first claim to re-check, by 2027-01.
