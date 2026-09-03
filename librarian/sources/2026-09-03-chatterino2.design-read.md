# /intake front half — `Chatterino/chatterino2` — design read

- **Run**: `intake-chatterino2`, front half (Phases 2b, 2d, 3, 4, Phase 5 promoting questions, Phase 7.6 peer check), intake skill **v2.3.2**.
- **Source**: `https://github.com/Chatterino/chatterino2`, cloned at `C:/t/intake-chatterino2`, pinned `fda51f0d3a4a5cd15f099b951b796e299d566e9e` (2026-09-01), project version `2.5.5` (`CMakeLists.txt:71`).
- **Date**: 2026-09-03. **Web fetches spent: 0.** Product names allowed in this file.
- **Worker**: a fork of the director's model (three Opus launches died on HTTP 529 before writing anything). Registry read-only; no git commands run; nothing written outside this file.
- **Board at start**: two siblings, both QUIET (`fleet-ship-0903`, `llmfit-0903`); neither holds a subject this read names.

---

## 1. Class and expected yield

**Class: `vendor repository` with the vendor slot held by a community project** — confirmed, with one correction to the routing table's expectation and one to the brief's.

The discriminating question for the row is *"a company's repo over a hosted engine?"* Two of its three properties hold exactly and one inverts, the same shape the kube-rs read found:

- **Holds — an open client over closed engines it does not own.** Chatterino ships no server. Everything under `src/providers/twitch/` is a rendering of Twitch's IRC, Helix, PubSub and EventSub contracts; `src/providers/{bttv,ffz,seventv}/` render three third-party emote services; `src/providers/recentmessages/` renders a fourth party's history archive; `src/providers/pronouns/` a fifth. The class's stated reliable-for — *"its docs' rules page and its client's types"* — is precisely where the yield sits: `lib/twitch-eventsub-ws/` is a generated typed payload layer over EventSub, and `src/providers/twitch/api/README.md` is a hand-maintained inventory of every upstream endpoint, the scope it needs, and the call sites that use it.
- **Holds — the README is an ad.** 249 words in-tree (499 rendered). Read last; contributed nothing but proper nouns.
- **Inverts — there is no vendor.** A decade-old community project with a maintainer roster, a contributor code guideline that explains C++ idioms to Java programmers, and an explicit **AI-contribution policy** in `CONTRIBUTING.md:12-24`. No marketing surface exists to distrust; the CHANGELOG's 18,514 words are one-line why-statements with PR numbers, not launch copy.

**Where the operating documents live — the calibration for this run.** In-tree markdown is 32,550 words, of which the CHANGELOG is 18,514 and `docs/wip-plugins.md` (the plugin API reference) is 5,659; everything else is build instructions and four short module READMEs. Doc-comment words across `src/` and the eventsub library: **31,327** — roughly 2.2× the non-changelog markdown. This is the "repository with no rules page" branch of the class (source-classes § "The branch with no rules page", 2026-09-02): the density has moved into the code, and the ratio to expect is ~nine design findings from code for every one from prose. That held: **11 of the 13 design entries below anchor in code**, two in prose (the plugin sandbox rationale in `docs/wip-plugins.md` and the hotkey README's "renaming defaults is impossible").

**Correction to the brief:** the brief expected the eventsub AST tooling and the plugin API to be the richest surfaces. They are rich, but the densest first-party material in the tree is the **connection layer** (`src/providers/irc/IrcConnection2.cpp`, `src/providers/liveupdates/`, `src/providers/twitch/eventsub/Controller.hpp`) and the **failure-recovery periphery** (`src/singletons/CrashHandler.cpp`, `src/util/Backup.hpp`, `src/common/Args.cpp --safe-mode`) — code that carries a decade of paid-for failure modes as timers, guards and enums.

**Expected yield, said before the tables**: a mature desktop client of this class is *design-rich but subject-poor* — its decisions are boundary cases and mechanisms inside subjects the corpus already owns (the corpus is 177 subjects deep in software-engineering and has a chat transcript, a feed, a rate limiter, an extension host, a settings store, a crash-capture technique), so the prediction was 8-13 design entries, **no system clearing NONE ≥ 3**, one system landing as a technique triple in an existing home, several amendments, a strong craft inventory, and very few claims. Delivered: 13 design entries in 6 systems, whole-tree NONE = 8, no system at three, HOME-IF-NEW max = 2, one technique-triple system (C), 4 amendment candidates, 12 craft items, 6 claim candidates.

---

## 2. Sweep log (honest totals)

Swept in the Phase 2b yield-density order. Every anchor below was opened this run.

| # | Tier | What was actually opened | Size | Yield |
| --- | --- | --- | --- | --- |
| 1 | Operating documents | `docs/wip-plugins.md` (5,659 w — the permission model, the loaded stdlib subset, every documented "Limitations/known issues" block), `docs/test-and-benchmark.md`, `tests/README.md`, `docs/make-release.md` (checklist head), `CONTRIBUTING.md` (1,486 w), `src/controllers/hotkeys/README.md`, `src/providers/twitch/api/README.md`, `lib/twitch-eventsub-ws/src/payloads/README.md`, `lib/twitch-eventsub-ws/ast/README.md`, `lib/twitch-eventsub-ws/TODO.md`, `CHANGELOG.md` (Unversioned + 2.5.5 + 2.5.5-beta.1 only) | 14,036 w non-changelog | C1 rationale, D3 limitation, F1/F2, K1, K15, K16, K24 |
| 2 | The instrument and its rules | 14 workflows under `.github/workflows/` (jobs enumerated), `.clang-tidy` (the check set, incl. `chatterino-*` from a hash-pinned external module, `.CI/setup-clang-tidy.sh:35-38`), `lint.yml` (regenerates LuaLS meta then `git diff --exit-code`), `scripts/README.md`, `docs/plugin-info.schema.json`, `REUSE.toml` | 14 workflows, 6 configs | C4, F3, F4, F5 |
| 3 | The measurement | `benchmarks/src/` (9 files), `tests/src/` (67 files; failure-named tests listed in §7), `tests/snapshots/` (**214 JSON snapshots** in 4 categories), `tests/src/lib/Snapshot.hpp` (the approval-test library's own doc), `tests/src/IrcMessageHandler.cpp:56-63` (the `UPDATE_SNAPSHOTS` guard) | 214 snapshots | F1, F2 |
| 4 | Types and config | `src/messages/Message.hpp` (the immutable model, `frozen`, the `mutable flags` confession), `src/messages/layouts/MessageLayout.hpp`, `src/messages/LimitedQueue.hpp`, `src/common/Channel.{hpp,cpp}` (`fillInMissingMessages`, `RecursionGuard`), `src/widgets/helper/ChannelView.hpp:372-395` (the three-channel model), `src/controllers/plugins/{Plugin.hpp,Plugin.cpp,PluginController.cpp,SignalCallback.hpp,LuaAPI.cpp}` + `api/ConnectionHandle.hpp`, `src/controllers/filters/lang/{Types,Filter,FilterParser}.hpp`, `src/controllers/highlights/HighlightController.{hpp,cpp}`, `src/controllers/hotkeys/HotkeyController.cpp:300-336,591-616`, `src/singletons/Settings.cpp:81,175-226`, `src/util/Backup.hpp`, `src/singletons/CrashHandler.cpp:31-168`, `src/singletons/Updates.cpp`, `src/singletons/NativeMessaging.cpp`, `src/common/Args.cpp:157-275`, `src/util/{ExponentialBackoff,RatelimitBucket}.hpp`, `src/providers/irc/IrcConnection2.cpp:49-158`, `src/providers/twitch/TwitchIrcServer.{hpp,cpp}` (join bucket), `src/providers/liveupdates/{BasicPubSubManager,BasicPubSubClient}.hpp`, `src/common/websockets/WebSocketPool.hpp`, `src/providers/twitch/eventsub/{Controller.hpp,Controller.cpp}`, `src/providers/twitch/TwitchChannel.{hpp,cpp}:1456-1560` | ~140k lines of C++ in `src/`, ~40 files opened | A1-A4, B1-B5, C1-C3, D1-D3, E1-E3 |
| 5 | Tests | `tests/src/*.cpp` names (67 files), `tests/src/lib/Snapshot.hpp`, `tests/README.md` (the two stand-in upstream binaries and their pinned ports) | — | F1, F2, K8 |
| 6 | README last | `README.md` 249 w | — | zero findings; proper-noun index only |

**Not opened (honest):** `src/widgets/` (240 files — UI chrome, not design), `src/controllers/commands/` (the slash-command table), `src/providers/twitch/api/Helix.cpp` (the endpoint bodies), `lib/twitch-eventsub-ws/ast/generate.py` internals, `tools/crash-handler/` (empty in this checkout — a submodule not fetched at depth 1), the theme schema. A later pass over this repository should start there.

---

## 3. Design record (Phase 2d) — 13 entries in 6 systems

Every `corpus:` line was written after opening the named subject's golden path (and the technique named in parentheses), never from slug overlap. `NONE` names the nearest neighbour and why its golden path does not state these forces. `HOME IF NEW` is the subject a technique would be filed under.

### System A — the message pipeline (ingest → immutable model → per-view cached layout → paint)

**A1 — Messages are immutable after ingest; layout is a separate, per-view, two-level cache.**
- decision: A `Message` is built once by `MessageBuilder`, shared as `shared_ptr<const Message>`, and `frozen` the moment a channel accepts it; each `ChannelView` owns a `MessageLayout` per message that caches a laid-out element tree AND a rasterised pixmap, with two invalidation levels — `invalidateBuffer()` (repaint the pixmap, keep the layout) and `deleteCache()` (re-lay-out).
- forces: one message is shown in N splits at N widths; thousands of rows scroll at frame rate on the GUI thread; plugins (2.5.5-beta.1 "message introspection and manipulation") can now mutate messages, so the model needed a stated mutability rule.
- buys: paint cost bounded by visible rows × cheap blits; layout shared safely across views; a mutation contract a plugin can be told (`c2.Message.frozen`).
- rejects: a mutable message model; the one exception is confessed in the source — `mutable MessageFlags flags` with the comment *"This means that a message's flag can be updated without the renderer being made aware, which might be bad ... This might bring race conditions with it"* (`src/messages/Message.hpp:44-50`).
- where: `src/messages/Message.hpp:24-25,44-50,105-113`; `src/messages/layouts/MessageLayout.hpp:59-72,120-134`; `docs/wip-plugins.md` § "Message" ("frozen").
- stage: model → layout → paint; the decision is made at "channel accepts message" (freeze) and at "view lays out" (cache).
- corpus: **NONE**. Nearest `ui-surfaces/shell-and-navigation/chat-transcript` — its golden path states the *read-while-written* force and `transcript-scroll` mentions a layout cache in an application (`rust--transcript-scroll.md:36`), but no technique states the multi-view/width/paint-cost force or the immutable-model-plus-cached-layout mechanism; `feed` owns ordering and retention, not rendering. **HOME IF NEW: chat-transcript.**

**A2 — A view renders a *virtual* filtered channel, never the registry channel.**
- decision: `ChannelView` holds three channels: `underlyingChannel_` (the registry-known `TwitchChannel`), `channel_` (a plain `Channel` of the same type and name, *not known to any registry/server*, into which only messages passing the split's filter set are added), and `sourceChannel_` (for nested views such as user popups).
- forces: filters are per split, not per channel; the same channel is open in several splits with different filters; search popups and user cards nest views over a subset.
- buys: filter evaluation happens once at ingest into the virtual channel; the rendering path, scrollbar, selection and search never learn that filters exist.
- rejects: filtering at paint time (the doc comment's own framing: the virtual channel "contains messages visible on screen").
- where: `src/widgets/helper/ChannelView.hpp:372-395`.
- stage: ingest → view; the decision is made where a view attaches to a channel.
- corpus: **NONE**. Nearest `client-architecture/client-state` (`store-slicing` — derived slices) models derived state generally; `chat-transcript` and `feed` do not model a derived filtered stream beside the source stream. **HOME IF NEW: chat-transcript** (pairs with A1).

**A3 — Bounded queue with snapshot reads, and a depth-budgeted recursion guard on every mutation door.**
- decision: each channel holds a `LimitedQueue<MessagePtr>` (bounded, returns copies "so that references aren't invalidated"); readers take a snapshot; `addMessage`, `replaceMessage`, `fillInMissingMessages` enter through a `RecursionGuard` and bail when `canRecurse()` is false, because plugin callbacks (`on_message_appended`, `on_message_replaced`, `on_messages_cleared`) fire **synchronously** and may call back into the channel.
- forces: synchronous signals + third-party callbacks = re-entrancy by construction; the plugin doc says so three times ("this can lead to infinite recursion") and hands the plugin `ConnectionHandle:block()` to suppress its own echo.
- buys: no unbounded re-entry, no iterator invalidation under a callback.
- rejects: asynchronous (queued) plugin dispatch — the callbacks are documented as synchronous on purpose so a plugin can replace a message before it paints.
- where: `src/messages/LimitedQueue.hpp:68`; `src/common/Channel.cpp:239-250`; `src/common/Channel.hpp:161-168`; `docs/wip-plugins.md` § `Channel:on_message_appended`.
- stage: ingest; the decision is made at every mutation door.
- corpus: `client-architecture/realtime-events` (`subscription-lifecycle` — "the dispatcher snapshots under the lock and invokes after releasing it"; `feed-retention` — the horizon). **Models the forces.** Chatterino's addition is the boundary case: when dispatch is deliberately *synchronous* so a subscriber may mutate the source, the snapshot rule is not enough and a depth budget plus a subscriber-side mute are required. → amendment candidate on `subscription-lifecycle`.

**A4 — Reconnect backfill from a third-party archive, sized by elapsed time × assumed rate, merged by identity then by server time.**
- decision: on reconnect, `loadRecentMessagesReconnect` requests at most `min((secondsSinceDisconnect + 1) × 10, twitchMessageHistoryLimit)` messages from the recent-messages archive, then `fillInMissingMessages` freezes them, drops any whose id is already present, and inserts each before the first existing message with a later `serverReceivedTime` (or after the moving tail), firing one `filledInMessages` signal at the end.
- forces: IRC has no cursor and no replay; the archive is a third party with its own limit; the channel keeps appending live during the fetch (the tail pointer moves); system messages carry no id and must be skipped when deduping.
- buys: a bounded fetch proportional to the gap; no duplicates; no per-row repaint.
- rejects: refetching the whole window (the code comment on the limit: "calculate how many messages could have occurred while we were not connected ... assuming a maximum of 10 messages per second").
- where: `src/providers/twitch/TwitchChannel.cpp:1511-1560`; `src/common/Channel.cpp:239-330`.
- stage: transport → channel; made at reconnect.
- corpus: `ui-surfaces/data-display/feed` (`live-prepend` § "Reconnect and the seam" — cursor walk, dedupe by identity, failed catch-up stated, horizon exceeded → stated reset). **Models the forces and most of the mechanism.** The boundary Chatterino adds: *when the transport has no cursor*, the catch-up window is sized from elapsed time × the channel's assumed maximum rate, capped by the archive's limit — and the merge key is (id, then server time), not a tuple. → amendment candidate on `live-prepend`.

### System B — connections and live data (IRC, PubSub/EventSub, third-party live updates)

**B1 — Two IRC sockets: one reads, one writes.**
- decision: `TwitchIrcServer` opens `readConnection_` and `writeConnection_`; JOINs go out on the read socket through the join bucket, chat sends go out on the write socket; each has its own `connectionLost` handler and reconnect path.
- forces: Twitch rate-limits JOINs and sends per *connection*; a read socket flooded by a large channel must not delay the user's own sends; one socket's reconnect (with backfill) should not force the other's.
- buys: independent backoff and independent limits per direction.
- rejects: one socket (the CHANGELOG's history of "write connection reconnect requested" debug lines shows the split was kept through the EventSub migration).
- where: `src/providers/twitch/TwitchIrcServer.hpp:197-202`; `TwitchIrcServer.cpp:160-172`.
- stage: transport; made at connect.
- corpus: **NONE** at the mechanism. Nearest `backend-platform/resilience/rate-limiting` (`limiter-topology` — "two limiters on one resource through different doors") models limiter placement, not the decision to *split a duplex transport by direction so each side has its own limiter and its own failure lane*. **HOME IF NEW: client-architecture/realtime-events.** (Rationale is partly reconstructed from the provider's published per-connection limits — the tree states the mechanism, not the forces, so this entry is weaker than the others.)

**B2 — Egress token bucket for JOIN, provisioned *below* the published limit, refilling one token per cooldown.**
- decision: `RatelimitBucket(budget=18, cooldown=12500ms)` queues channel joins; each send consumes a token and arms a timer that returns one token after the cooldown and drains one more queued item. Twitch's published limit is 20 JOINs per 10 s.
- forces: the limiter is a local model of a remote authority; the model drifts; a refusal from the provider on JOIN is silent (the join just never happens).
- buys: never touching the ceiling; drain order preserved.
- rejects: continuous refill at the nominal rate.
- where: `src/providers/twitch/TwitchIrcServer.cpp:50-52,163-165`; `src/util/RatelimitBucket.hpp`.
- stage: transport egress.
- corpus: `backend-platform/resilience/rate-limiting` (golden path § "Egress (the citizen)": *"runs slightly conservative, treats the provider's actual refusals as corrections to the model"*; `algorithm-selection` — token bucket). **Catch.** Source-tree application only.

**B3 — Subscriptions are refcounted handles over a *packed pool* of capped connections, with an explicit per-subscription FSM.**
- decision: `BasicPubSubManager` keeps N clients each holding at most `maxSubscriptions` (100) topics, a `pendingSubscriptions_` queue, spawns a new client only when no open one has room, re-queues a closed client's topics, and backs off (`ExponentialBackoff<5>` from 1 s) when connects fail. The EventSub `Controller` goes further: each `SubscriptionRequest` has `refCount`, a `State ∈ {Unsubscribed, Failed, Subscribing, Retrying, Subscribed, Unsubscribing}`, its own `retryTimer` and a `500 ms → 16 s` backoff with jitter; callers hold a `SubscriptionHandle` whose destructor releases one reference; the provider's `session_reconnect` URL is honoured over a fresh connect.
- forces: the provider caps subscriptions per socket and connections per user; many UI parts subscribe to the same topic independently; the provider tells the client where to reconnect.
- buys: a subscription's lifetime is the union of its holders'; connection count is a function of demand; retries are per topic, not per socket.
- rejects: one socket per topic; refetch-on-reconnect (the pending queue re-subscribes instead).
- where: `src/providers/liveupdates/BasicPubSubManager.hpp:108-183,232-245,298-299`; `BasicPubSubClient.hpp:33-37,92-104`; `src/providers/twitch/eventsub/Controller.hpp:36-53,118-155`; `Controller.cpp:273-296,620-653`.
- stage: transport → event bus; made at subscribe.
- corpus: `client-architecture/realtime-events` (`subscription-lifecycle` — "one native listener per event name, in-process subscriber set, reaping when the last consumer leaves" = the refcount half). **Partial.** The golden path models the fan-out-inside/singleton-at-the-boundary force, not the *capacity-packed pool* (per-connection cap → N connections, pending queue, per-topic FSM with its own retry ladder). **HOME IF NEW: client-architecture/realtime-events** (technique; pairs with B1).

**B4 — Liveness is proven by traffic; PING is sent only when idle; a late tick is a clock jump, not a pulse.**
- decision: a 5 s timer: if any message arrived since the last tick, that *is* the heartbeat (no PING sent, `waitingForPong_` cleared) — unless the tick itself arrived more than 3× late (`elapsed ≥ 15 s`), in which case the heartbeat is **skipped** and logged as "late ping", because the host slept; if nothing arrived and a PONG is still outstanding, the socket is closed and `smartReconnect()` schedules one reconnect on a backoff ladder (a second request while one is queued is ignored).
- forces: a busy chat channel makes PINGs pure overhead; a sleeping laptop makes every timer late and every "since last tick" interval meaningless; reconnect requests arrive from several places.
- buys: zero PING cost under load; no false-alive after sleep; one pending reconnect.
- rejects: a fixed ping/pong cadence.
- where: `src/providers/irc/IrcConnection2.cpp:49-59,64-110,142-158`.
- stage: transport liveness.
- corpus: `llm-agent/runtime-and-io/subprocess-lifecycle` (`liveness-and-heartbeats` — "what counts as a heartbeat", "the watcher is also watched") models *activity counts as a pulse* for child processes; `backend-platform/work-execution/scheduling` (`missed-run-semantics` § "The clock-jump corollary") models the late-tick rule for schedulers; `stream-proxy-hop` (`reconnect-storm-hygiene`) models the single-pending-timer rule. **Models the forces across three subjects; no technique states them for a client socket.** → amendment candidate on `liveness-and-heartbeats` (the boundary: a *socket* watcher on a sleep-capable host; late tick ⇒ skip, and traffic ⇒ suppress the probe). The director may prefer a technique if the three-subject spread argues for one home.

**B5 — Emote sets are immutable maps swapped atomically per provider, patched by live updates.** *(folded into the craft inventory, §6 — it is a copy-on-write cache and the corpus's `client-fetch-cache` / `invalidation-strategy` model it.)*

### System C — the extension boundary (Lua plugins, in-process)

**C1 — Sandbox by *library subtraction* with a written reason per denial, one tier, in-process, on the GUI thread.**
- decision: `openLibrariesFor` loads `base, coroutine, table, string, math, utf8, package`; `os` is excluded (comment: "fs access, environ access, exit"); `debug` is excluded with a named reason ("registry access ... a living nightmare"); `io` is loaded into the registry and re-exposed through a permission-checking shim (`c2io`, `IOWrapper`); `loadfile`/`dofile` are set to nil; `package.path`/`cpath` are emptied and the three default searchers are removed and replaced by `searcherRelative`/`searcherAbsolute` that resolve `require` only inside the plugin's own directory; `load` is restricted in release builds. The doc opens with *"we cannot guarantee safety"*.
- forces: a single process holding the user's OAuth token and every channel's moderation power; Lua's stdlib grants filesystem, process and environment by default; no process isolation is available without rewriting the host.
- buys: a stated capability floor and an honest ceiling.
- rejects: process/isolate isolation (`assertInGuiThread()` in every callback path — plugins run on the GUI thread).
- where: `src/controllers/plugins/PluginController.cpp:146-215`; `src/controllers/plugins/LuaAPI.cpp:218-243`; `docs/wip-plugins.md:1-6,§ API`.
- stage: extension load.
- corpus: `security/untrusted-extension-host` (`two-tier-extension-format` — "split by execution location"; `pluggable-isolation-runner` — "every runner declares which ceilings it enforces"). **Models the forces exactly** (host process holds every credential). Chatterino is the *third* runner shape the subject does not list: a **language-level sandbox in the host process**, whose ceiling is capability subtraction plus a `require` resolver, and whose honest limit is stated in prose. → technique inside the subject (`capability-subtraction-sandbox`), not an amendment: it is a mechanism the subject lacks, not a boundary of one it has.

**C2 — Privileges are declared in the manifest, checked at the API door with a path/scheme predicate, and `--safe-mode` registers every plugin without running any.**
- decision: `info.json.permissions[]` is an enum (`FilesystemRead`, `FilesystemWrite`, `Network`); `hasFSPermissionFor` first checks the path is under the plugin's own `data/` (`QUrl::isParentOf`) and only then the declared permission; `hasHTTPPermissionFor` allows only `http`/`https`; per-plugin enablement is a settings set (`enabledPlugins`) plus a global `pluginsEnabled`; `--safe-mode` (Args) creates the `Plugin` record, opens no libraries, runs no file — *"This isn't done earlier to ensure the user can disable a misbehaving plugin."*
- forces: an operator must be able to reach the disable control even when a plugin breaks the UI on load; a permission that is not scoped to the plugin's own directory is a permission over the whole profile.
- buys: recoverability without editing JSON by hand; least privilege by construction.
- rejects: skipping registration in safe mode (which would hide the plugin from the settings page).
- where: `docs/plugin-info.schema.json:52-64`; `src/controllers/plugins/Plugin.cpp:111-141,172-177`; `PluginController.cpp:318-334,438-441`; `src/common/Args.cpp:157-160,273-275`.
- stage: extension load + every privileged call.
- corpus: `security/untrusted-extension-host` (`canonicalizable-privilege-declaration` — structured is the authority; `isolation-tier-independent-extension-api` — "degradation is by skipping, and skipping is announced"). **Models the forces.** The boundary Chatterino adds: an *operator-initiated* skip-all mode that still registers, so the disable control is reachable. → amendment on `isolation-tier-independent-extension-api` (or the second technique of a triple — see routing).

**C3 — Every callback is a protected call with a uniform non-fatal policy; a dead plugin's closures are abandoned, not run; the extension is handed the tool to mute its own echo.**
- decision: all Lua entry points go through `sol::protected_function` + `loggedVoidCall`/`tryCall` → the plugin's own log channel; a plugin whose main file errored keeps `error_` and every later callback lookup returns empty; `SignalCallback` holds a weak plugin ref and *abandons* the function reference in its destructor/assignment when the plugin is gone ("don't destruct the function in this case"); in-flight `HTTPRequest`s are owned by the plugin so reload frees them (the source calls this "a lifetime hack"); plugins get `ConnectionHandle:block()/unblock()` for the documented synchronous-callback recursion, and the host bounds depth with `RecursionGuard` (A3).
- forces: plugins are observers/augmenters, never gates — no callback may abort the host's operation; reload must be safe at any time; callbacks are synchronous by design (A3).
- buys: a plugin failure is a log line, never a host verdict; reload never runs a stale closure.
- rejects: per-registration fatality declarations (the subject's default).
- where: `src/controllers/plugins/SignalCallback.hpp`; `SolTypes.hpp:173-178`; `Plugin.hpp:89-101,118-121`; `PluginController.cpp:340-352`; `api/ConnectionHandle.hpp:23-37`.
- stage: every callback dispatch.
- corpus: `security/untrusted-extension-host` (`per-callback-failure-policy` — "each registration states whether its own failure is fatal"). **Models the forces.** Boundary: when the extension surface is observe/augment-only, a *uniform* non-fatal policy is correct and the host then owes the extension a re-entrancy control. → amendment on `per-callback-failure-policy`, or the third technique of the triple.

**C4 — The extension API is typed once in C++ headers and generated into both LuaLS meta and a TypeScript `.d.ts`; CI regenerates and diffs.** *(catch — `engineering-process/build-and-release/codegen` `commit-vs-derive-policy` + `drift-gating`; craft item K10 in §6.)*

### System D — user-authored rule engines (filters, highlights, hotkeys)

**D1 — Filters are a statically typed expression language: type synthesis at parse time against a declared field-type context; an ill-typed filter never reaches a message.**
- decision: `Tokenizer → FilterParser → Expression tree`; `Type ∈ {String, Int, Bool, Color, RegularExpression, List, StringList, MatchingSpecifier}`; parse produces a `PossibleType` that is either a `TypeClass` or `IllTyped{expr, message}` pointing at the offending node; `FilterParser::valid()` and `errors()` are surfaced in the settings UI; a `Filter` records its `returnType()` and must be `Bool`; evaluation takes a `ContextMap` (message fields) whose static twin is a `TypingContext`.
- forces: evaluated per message, per split, on the GUI thread (A2); authored by end users; a runtime type error on the hot path would drop messages silently.
- buys: one parse per filter; zero runtime type failures; author-time errors with a location.
- rejects: dynamic typing with per-evaluation coercion.
- where: `src/controllers/filters/lang/Types.hpp:19-55`; `FilterParser.hpp:21-40`; `Filter.hpp:32-47`; `src/controllers/filters/FilterRecord.hpp:33`.
- stage: rule authoring → rule evaluation.
- corpus: **NONE** at the mechanism. Nearest `ui-surfaces/data-display/search` (`query-parsing` — "one door, two grammars, failure is not an empty result") models user-text-to-engine-query; `backend-platform/platform-observability/alerting` (`rule-authoring-validation`) models validate-at-authoring for thresholds. Neither states *static typing of a user rule language against a declared context so the hot path cannot fail*. **HOME IF NEW: search** (`faceting-and-filters` is its neighbour) — the director should weigh `alerting` as the alternative home; the forces (hot path, end-user author) favour `search`.

**D2 — Highlight rules are compiled into one ordered check list, rebuilt in full whenever any contributing setting changes, evaluated first-match.** *(claim candidate K-D2 in §4, effort S — the mechanism is a special case of "derive the compiled table from its sources on every change, never patch it"; nearest `client-architecture/client-state` `invalidation-strategy`. Not a design entry: the forces are the settings store's, already modelled.)*

**D3 — Hotkeys are a named-action registry per widget category; shipped defaults are added idempotently through a persisted *ledger of default names*, so a user's deletion of a default survives upgrades and a new default ships without resurrecting old ones; renaming a default is documented as impossible.**
- decision: `HotkeyController::addDefaults(addedHotkeys)` calls `tryAddDefault(...)` per shipped binding; a default is added only if its **name** is not in `/hotkeys/addedDefaults`; `saveHotkeys` wipes `/hotkeys` and re-writes the ledger first; actions are strings bound per `HotkeyCategory` with argument vectors and a Qt shortcut context so a binding fires only in its widget class. The README: *"Renaming defaults is currently not possible. If you were to rename one, it would get recreated for everyone probably leading to broken shortcuts."*
- forces: user customisations and shipped defaults evolve independently; a version-numbered migration would have to know what the user did; a deleted default must stay deleted.
- buys: additive default evolution with zero migrations; deletions are durable.
- rejects: versioned migration chains (and, by its own admission, renames).
- where: `src/controllers/hotkeys/HotkeyController.cpp:300-336,591-606`; `src/controllers/hotkeys/README.md` § "Renaming defaults".
- stage: settings load → default reconciliation.
- corpus: **NONE** at the mechanism. Nearest `operations/governance-and-records/settings` (`inherited-default-override` — default from environment vs stored choice) and `client-architecture/client-state` (`persistence-and-migration` — "appending a step to a shipped migration chain"). Neither states the *applied-defaults ledger* (a tombstone set keyed by default name) as an alternative to a version chain, nor its cost (no renames). **HOME IF NEW: settings.**

### System E — operating the client (settings, crash, update)

**E1 — Settings load through a rotating backup set with a restore dialog; load errors are an enum; a malformed primary is a stop with a recovery surface, not a silent default.**
- decision: `SettingManager` keeps 9 backup slots, saves manually and only-if-changed; `backup::loadWithBackups` wraps the load, maps `LoadError` to a message, and if the load fails and backups exist, opens a restore dialog listing each backup with `BackupState ∈ {Ok, UnableToRead, BadContents}`, size and mtime (the same helper serves `window-layout.json`).
- forces: a desktop app whose settings hold accounts and hotkeys; no server copy; a crash mid-write or a disk error yields a file that parses as nothing.
- buys: recoverability without a support ticket; the operator chooses which snapshot.
- rejects: booting on defaults over a malformed file (the settings subject's own rule — "malformed is a stop" — and Chatterino adds the *surface*).
- where: `src/singletons/Settings.cpp:187-226`; `src/util/Backup.hpp:14-47`; CHANGELOG 2.5.5-beta.1 "#6662".
- stage: boot → settings load.
- corpus: **NONE** at the mechanism. Nearest `operations/governance-and-records/settings` (`cross-source-precedence-chain` § "Absent is a skip; malformed is a stop") states the stop; `client-architecture/client-state` (`persistence-and-migration` — "corrupt payload keeps the app from launching", "rehydration is an untrusted read") states the hazard; `backend-platform/data-layer/embedded-db` has journal modes. No technique states *rotating backups of an operator-owned config file plus a restore surface at boot*. **HOME IF NEW: settings** (pairs with D3).

**E2 — The crash-restart opt-in lives *outside* the settings store, in its own one-key file beside the crash dumps, so the handler can read it without loading what may have crashed.**
- decision: `chatterino-recovery.json` `{shouldRecover: bool}` in `crashdumpDirectory`; default `false` and written on first run; `canRestart` refuses in frameless-embed and browser-host modes and in debug builds; restart arguments are re-encoded with a `+`-joined, `++`-escaped string decoded on the handler side.
- forces: the settings file is the most likely thing to be mid-write at crash time; the crashpad handler is a separate process that must not link the app's settings library; some run modes must never auto-restart.
- buys: the handler's decision depends on one 30-byte file.
- rejects: a settings key.
- where: `src/singletons/CrashHandler.cpp:56-108,110-130,140-168`.
- stage: crash → restart decision.
- corpus: `backend-platform/resilience/error-handling` (`crash-capture` — "the handler runs inside a dying program", "the same startup crash ships every few seconds", "minimal and self-contained"). **Models the forces.** Boundary: *the restart policy's storage must not share fate with the store that may have crashed* — a one-line rule the technique does not carry. → amendment on `crash-capture`.

**E3 — Update channel is a setting (stable/beta); nightly refuses in-app update and routes to the download page; portable and installed modes use different payloads and different updater binaries; an unparsable version means "no update", not "update".** *(catch — `engineering-process/build-and-release/release-pipeline` `updater-chain` "the client's one-way door" and "the feed is generated from the artifacts"; source-tree application only. The nightly refusal — "can be installed in many different ways" — is the boundary the application should record.)*

### System F — engineering discipline

**F1 — Approval snapshots over the message-building pipeline, with a compile-time update switch that CI asserts is off.**
- decision: 214 JSON snapshots in `tests/snapshots/{IrcMessageHandler,EventSub,ImageUploader,PluginMessageCtor}/`, each carrying `input`, `params`, `settings` (merged over a base by `mergedSettings`) and `helixExpectations`; `constexpr bool UPDATE_SNAPSHOTS = false` at the top of the test file; *"In CI, all snapshots must be verified, thus the integrity tests checks for"* the flag; `tests/README.md` gives the four-step re-baseline ritual and ends with "take a look at the changes made to the snapshot json files to ensure that it looks correct".
- forces: the message builder is 2,992 lines whose output is a rich element tree — assertion-per-field tests would be unmaintainable; a re-baseline that ships silently is a test suite that tests nothing.
- buys: a diffable oracle per case; a re-baseline that is visible in review as a JSON diff.
- rejects: field assertions; an environment-variable update switch (which CI could inherit).
- where: `tests/src/lib/Snapshot.hpp:16-30`; `tests/src/IrcMessageHandler.cpp:56-63,464-468,563`; `tests/README.md` § "Modifying message building".
- stage: test authoring → CI.
- corpus: **NONE** at the mechanism. Nearest `engineering-process/build-and-release/test-harness` (12 techniques; none is approval/snapshot testing) and `engineering-process/standards-and-gates/quality-gates` (`oracle-frozen-during-repair` — "a fixer may not touch the oracle", a *repair-time* rule, not an authoring mechanism). **HOME IF NEW: test-harness.** Promoting question executed (§5).

**F2 — Tests run against released stand-in upstreams on pinned ports, and the generated EventSub layer has its own Python conformance job.** *(catch — `test-harness` `live-app-harness` + `fixture-economics`; craft K8.)*

**F3 — EventSub payload deserialisers are generated from annotated C++ structs by a libclang AST script into marker-delimited regions of hand-written files; CI diffs.** *(catch — `codegen` `commit-vs-derive-policy`, `drift-gating`, `generated-file-hygiene`; craft K10b.)*

**F4 — A project-specific clang-tidy module lives in a separate repo, is fetched by pinned hash in CI, and its findings are posted as PR review comments by a second workflow.** *(catch — `quality-gates` `enforcement-binding`; craft K9.)*

### Routing counts (v2.2, both clauses)

| System | entries | `corpus: NONE` | home-if-new (per NONE entry) | existing-home entries |
| --- | --- | --- | --- | --- |
| A message pipeline | 4 | **2** (A1, A2) | chat-transcript ×2 | realtime-events (A3), feed (A4) |
| B connections | 4 | **2** (B1, B3) | realtime-events ×2 | rate-limiting (B2), subprocess-lifecycle (B4) |
| C extension boundary | 3 | 0 | — | **untrusted-extension-host ×3** |
| D rule engines | 2 | **2** (D1, D3) | search ×1, settings ×1 | — |
| E operating | 3 | **1** (E1) | settings ×1 | error-handling (E2), release-pipeline (E3) |
| F discipline | 4 | **1** (F1) | test-harness ×1 | codegen (F3), quality-gates (F4), test-harness (F2) |
| **whole tree** | **20 (13 written + 7 folded)** | **8** | max per home **2** (chat-transcript, realtime-events, settings) | C at **3** in one existing home |

- **Clause 1 (NONE per system ≥ 3):** no system fires. Highest is 2 (A, B, D).
- **Clause 2 (HOME-IF-NEW shared by ≥ 3 across systems):** does not fire. `settings` reaches 2 only by crossing systems (D3 + E1); `chat-transcript` 2 (A1 + A2); `realtime-events` 2 (B1 + B3).
- **Existing-home triple:** **System C — three design entries whose home is `security/untrusted-extension-host`** → per v2.2, *a technique triple inside that subject* (the subject landed 2026-09-03 from the emdash run with 7 techniques and 3 node applications; `security` is at its ten-subject cap, so a new subject there is impossible in any case).

**Decision (recommendation to the director): stay in intake — no forge handoff.** Land as: one technique triple in `untrusted-extension-host` (C1 technique; C2 and C3 as techniques or as amendments to the two named neighbours — the director's call, argued in §5); technique pairs in `chat-transcript` (A1, A2), `realtime-events` (B3, and B1 if its forces survive corroboration), `settings` (D3, E1); singles in `search` (D1) and `test-harness` (F1); amendments for A3, A4, B4, E2; source-tree applications for every entry with an existing home (B2, E3, F2-F4 included). That is up to 9 techniques + 4 amendments + ~10 applications — larger than a video run, correct for a system-shaped repository that the corpus already surrounds.

---

## 4. Candidates (Phase 3)

### 4a. `design` candidates (strip test deferred to Phase 7; product names kept)

| # | System | Title | Decision (short) | Stage | Default shape | Eff |
| --- | --- | --- | --- | --- | --- | --- |
| D-A1 | A | Freeze the model, cache the layout per view | immutable message + two-level per-view layout/pixmap cache | model → paint | technique | M |
| D-A2 | A | Render a virtual filtered channel | three-channel view model; filter once at ingest into an unregistered twin | ingest → view | technique | M |
| D-A3 | A | Budget re-entry when dispatch is synchronous | snapshot reads + depth-budgeted recursion guard + subscriber-side mute | mutation doors | amendment | S |
| D-A4 | A | Size the cursorless catch-up from elapsed × rate | `min(elapsed×10, limit)`; merge by id then server time | reconnect | amendment | S |
| D-B1 | B | Split the duplex transport by direction | read socket / write socket, each with its own limiter and reconnect | connect | technique | M |
| D-B2 | B | Provision egress below the published ceiling | 18/12.5 s bucket vs 20/10 s limit; refill per used token | egress | application | S |
| D-B3 | B | Pack subscriptions into capped connections with a per-topic FSM | refcounted handles, pending queue, spawn-on-full, per-topic retry ladder, honour reconnect URL | subscribe | technique | M |
| D-B4 | B | Prove liveness by traffic; skip a late tick | PING only when idle; late tick ⇒ no heartbeat; one pending reconnect | liveness | amendment | S |
| D-C1 | C | Sandbox by library subtraction | stdlib subset with a reason per denial; io shim; `require` resolver scoped to the plugin dir; one in-process tier | load | technique | M |
| D-C2 | C | Register everything, run nothing, in safe mode | manifest enum + path/scheme predicate at the door; `--safe-mode` keeps the disable control reachable | load + call | amendment or technique | S–M |
| D-C3 | C | Uniform non-fatal callbacks that never run for a dead plugin | protected calls, abandoned closures, plugin-owned in-flight requests, `block()` for echo | dispatch | amendment or technique | S–M |
| D-D1 | D | Type the user's filter language at parse time | static type synthesis against a declared field context; ill-typed never evaluates | authoring → hot path | technique | M |
| D-D3 | D | Ship defaults through an applied-defaults ledger | tombstone set by default name instead of a version chain; renames impossible | settings load | technique | M |
| D-E1 | E | Rotate backups of operator-owned config and offer restore at boot | 9 slots, `LoadError` enum, restore dialog with per-backup state | boot | technique | M |
| D-E2 | E | Keep the restart flag outside the store that may have crashed | one-key JSON beside the dumps; refused in embed/host modes | crash | amendment | S |
| D-E3 | E | Route nightly to manual download; channel is a setting | semver compare; unparsable ⇒ no update | update | application | S |
| D-F1 | F | Approval snapshots with a compile-time update switch CI asserts off | 214 JSON oracles with params/settings/expectations | test authoring | technique | M |
| D-F3 | F | Generate deserialisers into marker regions from annotated structs | libclang AST → marker-delimited code; CI diff | build | application | S |
| D-F4 | F | Ship the custom linter as a hash-pinned external module with a review bot | separate repo, sha256 pin, PR comments | CI | application | S |

### 4b. Claim and craft candidates (strip test run at extraction)

| # | Title | Claim (source's terms) | Anchor | Strip | Lane | Shape | Eff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| K1 | Gate AI-assisted contributions on a human track record | AI use allowed only for contributors with prior substantial non-AI PRs; forbidden for PR/issue prose, docs, "good first issue for humans", icons; must be disclosed | `CONTRIBUTING.md:12-24` | *survives*: a maintainer policy that gates machine-assisted changes on the author's prior human record, reserves a labelled issue class for humans, forbids machine authorship of the prose reviewers rely on, and requires disclosure | P | practice / lead | M |
| K7 | Assert the snapshot-update switch is off, in a test | `UPDATE_SNAPSHOTS` is a `constexpr` and an integrity test fails CI if it is true | `tests/src/IrcMessageHandler.cpp:56-63` | *survives* (folded into D-F1) | K | technique | — |
| K8 | Release the upstream stand-ins as separate binaries on pinned ports | tests expect `httpbox` on 9051 and a PubSub server stand-in on 9050, or `docker compose up` | `tests/README.md` | *survives*: publish test doubles of third-party upstreams as versioned artifacts with fixed ports so local and CI runs share one contract | T | docs / practice | S |
| K9 | Pin the custom linter module by hash and post its findings as review comments | `chatterino-clang-tidy-module` fetched by sha256 in CI; `post-clang-tidy-review.yml` | `.CI/setup-clang-tidy.sh:35-38`; workflows | *survives* (folded into D-F4) | T | practice | S |
| K10 | Generate the embedded-scripting typings from the host's headers and diff them in CI | `make_luals_meta.py` reads `LuaAPI.hpp` doc comments → `docs/lua-meta/`; `lint.yml` regenerates and `git diff --exit-code` | `docs/wip-plugins.md` § LuaLS; `.github/workflows/lint.yml:26-31` | *survives*: the extension API's typings are derived from the host's declarations and drift-gated | T | practice | S |
| K15 | A request object that is never executed leaks its callbacks | "Do not create requests that you don't want to call `execute()` on. For the time being that leaks callback functions and all their upvalues" | `docs/wip-plugins.md` § HTTPRequest | *survives weakly*: document known lifetime hazards in the API reference next to the call, not in an issue tracker | T | docs | S |
| K16 | A plugin can trigger its own command and loop | `send_message(..., true)` executes commands, including the plugin's own | `docs/wip-plugins.md` § send_message | folded into D-C3 (re-entrancy) | — | — | — |
| K19 | The handle controls the lifetime, the pointer is weak | `WebSocketHandle` holds a weak pointer yet closing the handle closes the connection; `onClose` receives `self` as a `unique_ptr` | `src/common/websockets/WebSocketPool.hpp:20-71` | *survives*: hand a listener its own owning pointer at the terminal callback so destruction order is explicit | P | practice (C++ craft) | S |
| K20 | Backoff factor is fixed at 2 and the cap is a template parameter | "Yes, you can't specify the base 😎 deal with it"; `maxSteps` static | `src/util/ExponentialBackoff.hpp` | nothing beyond `backoff-design` ("factor of 2 is conventional and fine") | — | catch | — |
| K21 | Swap immutable emote maps atomically per provider | `Atomic<shared_ptr<const EmoteMap>>` × 4 providers per channel | `TwitchChannel.hpp:561-565` | copy-on-write cache — catch (`client-fetch-cache`) | — | catch | — |
| K22 | Debug-only thread-affinity guard objects | `ThreadGuard` asserts if the same object is touched from two threads; used on the view snapshot | `src/util/ThreadGuard.hpp:14`; `ChannelView.hpp:369` | *survives*: a zero-cost-in-release affinity assertion placed on the data, not the function | P | practice (C++ craft) | S |
| K24 | Keep a hand-written inventory of upstream endpoints → scopes → call sites, and check scopes at release | `api/README.md` per endpoint "Requires scope … Used in …"; release checklist: "Do the scopes … match the ones in the website repo?" | `src/providers/twitch/api/README.md`; `docs/make-release.md:5-6` | *survives*: an inventory coupling the third-party surface, its privileges and its consumers, re-checked as a release gate | K | technique or catch | S |
| K-D2 | Rebuild the compiled highlight table in full on any input change | "rebuilds are always full, so if something changes we throw away all checks and build them all up from scratch" | `HighlightController.hpp:44-49` | *survives*: derive a compiled rule table from its sources wholesale on any change; never patch it | K | amendment | S |

Dropped at extraction (no plausible attachment): F5 REUSE licensing gate (`supply-chain` covers SBOM/licence in spirit; no claim beyond "we run it"), E4 native-messaging browser host (an IPC contract specific to one browser API), the theme JSON schema, the emoji-data update script.

## 5. Prior art map (Phase 4) and triage table (Phase 5)

One `research-map` call over 34 concept terms (persisted output read in full), then every named home opened. Absences were established by uncapped `grep -rl` over the bundle (counts in the worker log: "backfill/gap" 74 files, none a client transport seam; "layout cache" 2 files, both applications; "snapshot test" 5 files, none a test-authoring technique; "hotkey|keyboard shortcut" 8 files, all accessibility/undo; "backup slot|corrupt settings" 2 files, both applications; "token bucket" 6 files, all rate-limiting/retry). No proper noun was used as a deciding query.

**Board re-read before naming homes:** unchanged — two QUIET siblings, no subject claims.

**Expected yield for the class (said before the table):** design-rich, subject-poor; techniques and amendments inside existing subjects; one technique triple; few claims. See §1.

Altitude vocabulary: `doctrine` / `technique` / `dated fact`. Own read: `real gap` / `partial` / `likely catch` / `thin`. A `design` row is never `likely catch` (the record already checked).

| # | Lane | Shape | Eff | Title | Prior art (subject · technique) | Impact | Altitude | Own read |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | D-A1 Freeze the model, cache the layout per view | chat-transcript · (none; `transcript-scroll` app mentions a layout cache) | new-technique | technique | **real gap** |
| 2 | K | technique | M | D-A2 Render a virtual filtered channel | chat-transcript · (none); client-state · store-slicing | new-technique | technique | **real gap** |
| 3 | K | amendment | S | D-A3 Budget re-entry under synchronous dispatch | realtime-events · subscription-lifecycle | corrects-claim (boundary) | technique | partial → **promoted** (§5a) |
| 4 | K | amendment | S | D-A4 Size cursorless catch-up from elapsed × rate | feed · live-prepend | corrects-claim (boundary) | technique | partial → **promoted** (§5a) |
| 5 | K | technique | M | D-B1 Split the duplex transport by direction | rate-limiting · limiter-topology; realtime-events | new-technique | technique | partial → **not promoted** (§5a) — lead |
| 6 | K | application | S | D-B2 Egress bucket below the ceiling | rate-limiting · algorithm-selection, golden path § egress | none (catch) | dated fact | likely catch → **source-tree application** |
| 7 | K | technique | M | D-B3 Capacity-packed subscription pool with per-topic FSM | realtime-events · subscription-lifecycle | new-technique | technique | **real gap** |
| 8 | K | amendment | S | D-B4 Liveness by traffic; skip a late tick | subprocess-lifecycle · liveness-and-heartbeats; scheduling · missed-run-semantics; stream-proxy-hop · reconnect-storm-hygiene | corrects-claim (boundary) | technique | partial → **promoted** (§5a) |
| 9 | K | technique | M | D-C1 Sandbox by library subtraction | untrusted-extension-host · two-tier-extension-format, pluggable-isolation-runner | new-technique | technique | **real gap** |
| 10 | K | amendment/technique | S–M | D-C2 Register everything, run nothing (safe mode) | untrusted-extension-host · isolation-tier-independent-extension-api, canonicalizable-privilege-declaration | corrects-claim (boundary) | technique | partial → **promoted** (§5a) |
| 11 | K | amendment/technique | S–M | D-C3 Uniform non-fatal callbacks; abandoned closures | untrusted-extension-host · per-callback-failure-policy | corrects-claim (boundary) | technique | partial → **promoted** (§5a) |
| 12 | K | technique | M | D-D1 Type the filter language at parse time | search · query-parsing; alerting · rule-authoring-validation | new-technique | technique | **real gap** |
| 13 | K | technique | M | D-D3 Applied-defaults ledger instead of a version chain | settings · inherited-default-override; client-state · persistence-and-migration | new-technique | technique | **real gap** |
| 14 | K | technique | M | D-E1 Rotating config backups with a restore surface | settings · cross-source-precedence-chain; client-state · persistence-and-migration | new-technique | technique | **real gap** |
| 15 | K | amendment | S | D-E2 Restart flag outside the store | error-handling · crash-capture | corrects-claim (boundary) | technique | partial → **promoted** (§5a) |
| 16 | K | application | S | D-E3 Nightly refuses in-app update | release-pipeline · updater-chain | none (catch) | dated fact | likely catch → **source-tree application** |
| 17 | K | technique | M | D-F1 Approval snapshots with a CI-asserted update switch | test-harness · (none); quality-gates · oracle-frozen-during-repair | new-technique | technique | partial → **promoted** (§5a) |
| 18 | K | application | S | D-F3 Marker-region codegen from annotated structs | codegen · generated-file-hygiene, drift-gating | none (catch) | dated fact | likely catch → source-tree application |
| 19 | K | application | S | D-F4 Hash-pinned external linter + review bot | quality-gates · enforcement-binding | none (catch) | dated fact | likely catch → source-tree application |
| 20 | P | practice/lead | M | K1 Gate AI contributions on a human track record | (none — `agent-instruction-files`, `concurrent-vcs` are not this) | none / new-law? | doctrine | **real gap** as a *lead* — one project's policy; needs a second sighting |
| 21 | T | practice | S | K8 Stand-in upstreams as released binaries on pinned ports | test-harness · fixture-economics, live-app-harness | none | technique | likely catch — untriaged |
| 22 | T | practice | S | K10 Derive extension typings from host declarations, drift-gate them | codegen · commit-vs-derive-policy | none | technique | likely catch — untriaged |
| 23 | T | docs | S | K15 Document lifetime hazards beside the call | docs-content-model | none | dated fact | thin — untriaged |
| 24 | P | practice | S | K19 Owning pointer handed to the terminal callback | (none — C++ craft) | none | technique | partial — craft lane, judgment gate |
| 25 | P | practice | S | K22 Data-placed debug thread-affinity guard | (none — C++ craft) | none | technique | partial — craft lane, judgment gate |
| 26 | K | technique/catch | S | K24 Endpoint → scope → call-site inventory, release-checked | docs-sync · coupled-surface-inventory | none | technique | likely catch → **not promoted** (§5a) — untriaged |
| 27 | K | amendment | S | K-D2 Rebuild the compiled rule table wholesale | client-state · invalidation-strategy | none | technique | likely catch — untriaged |

**Advancing (unattended rule: real-gap rows plus promoted partials):** 1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17 — fourteen rows; plus 6, 16, 18, 19 as source-tree applications (no verification budget; they are records). Row 20 advances as a lead. Ranked by registry impact for a director who must cut: **9 → 10 → 11** (the triple in a subject landed this week, in a category at its cap — cheapest to land, highest reuse), then **13 + 14** (the settings pair; the fleet's local-first desktop app is the seam), then **7** (realtime-events), then **1 + 2** (chat-transcript pair), **12**, **17**, then the four amendments.

### 5a. Promoting questions executed (every `partial` row, one file read each)

- **Row 3 (A3).** *Does `subscription-lifecycle` already say what to do when dispatch is deliberately synchronous and a subscriber may mutate the source?* Read `subscription-lifecycle.md` § "The second sharp edge: dispatch outside the registry's own lock": it prescribes snapshot-then-invoke and "a subscriber whose delivery can park detaches the hand-off" — asynchronous hand-off is its answer. It does not cover the case where synchrony is the *feature* (a plugin must replace a message before paint). **Promoted** — boundary case, amendment.
- **Row 4 (A4).** *Does `live-prepend` size the catch-up when there is no cursor?* Read § "Reconnect and the seam": "catch-up is a cursor walk … newer-than-(last delivered tuple)" and "a gap that exceeds the transport's replay horizon degrades to a stated reset". It assumes a cursor exists. Chatterino's transport has none; the window is derived from elapsed × assumed rate and capped by the *archive's* horizon. **Promoted** — boundary case, amendment (and the amendment should keep the technique's "failed catch-up is not an empty catch-up" rule, which Chatterino does *not* implement: a failed load clears the flag silently at `TwitchChannel.cpp:1552-1558` — a negative finding worth one sentence).
- **Row 5 (B1).** *Does the tree state the forces, or am I supplying them?* Re-read `TwitchIrcServer.hpp:195-202` and `.cpp:160-172`: the mechanism and the join bucket are there; the *why* is a link to the provider's rate-limit guide, not a sentence. The forces are reconstructed from training-data knowledge of that guide. **Not promoted** to a technique on one tree's evidence — filed as a **lead** with return condition "a second client of a per-connection-limited duplex protocol that splits by direction, or the provider's guide fetched and quoted" (one fetch would settle it; the director holds the budget).
- **Row 8 (B4).** *Does `liveness-and-heartbeats` treat inbound traffic as a pulse and a late watcher tick as suspect?* Read § "What counts as a heartbeat" (activity keyed by run identity — yes, traffic counts) and § "The watcher is also watched" (the watcher's own liveness — not the clock-jump case). `missed-run-semantics` § "The clock-jump corollary" has the late-tick rule for schedulers only. **Promoted** — boundary case spanning two subjects; amendment on `liveness-and-heartbeats` with a cross-reference *in prose* (no cross-bundle link needed; both are software-engineering).
- **Row 10 (C2).** *Does `isolation-tier-independent-extension-api` cover an operator-initiated skip-all that still registers?* Read § "Degradation is by skipping, and skipping is announced": its skip is *runner-unavailable* degradation, host-initiated. The safe-mode case — operator-initiated, all tiers, registration kept so the disable control is reachable — is absent. **Promoted** — amendment (or technique #2 of the triple).
- **Row 11 (C3).** *Does `per-callback-failure-policy` admit a uniform policy?* Read § "The declaration is per registration, and its default is correctness" and § "Refusal is a value, not an exception": per-registration is the rule; the uniform-non-fatal case for observe/augment-only surfaces, and the host's resulting duty to hand the extension a re-entrancy mute, are absent. **Promoted** — amendment (or technique #3).
- **Row 15 (E2).** *Does `crash-capture` say where the restart policy lives?* Read § "Cover every execution context" and § "Never crash in the handler": self-contained handler, yes; storage of the *restart decision* separate from the crashed store, no. **Promoted** — amendment.
- **Row 17 (F1).** *Does any test-harness or quality-gates technique model approval snapshots at authoring time?* `oracle-frozen-during-repair` use_when: "an agent is asked to make a failing check pass … a fixer may not touch the oracle" — repair-time only. The 12 `test-harness` techniques are partitioning, fixtures, lanes, flakes, live-app, negative controls. **Promoted** — technique in `test-harness` (the compile-time switch + integrity test is the mechanism the repair rule would need to be enforceable).
- **Row 26 (K24).** *Does `coupled-surface-inventory` already state a third-party-surface inventory checked at release?* use_when: "deciding which prose surfaces a feature change owes … choosing what change altitude dismisses each surface" — it is exactly a coupled-surfaces inventory; the release-checklist scope check is one row of it. **Not promoted** — likely catch; untriaged with anchors.
- **Row 27 (K-D2).** *Does `invalidation-strategy` cover wholesale rebuild of a derived table?* use_when: "choosing how cached state learns it is wrong, deciding to patch from an event or refetch instead" — the patch-vs-rebuild choice is its subject. **Not promoted** — likely catch; untriaged.

**Reconsider flags:** none. The source ledger has no prior desktop-client, IRC, Lua-sandbox or hotkey source; no prior decline matches any row.

---

## 6. Reusable-engineering inventory (the second sweep)

Lane letters: `S` scripts, `P` practices, `T` docs/tooling, `K` knowledge. Judgment-gated lanes need no corroboration.

| # | Item | Where | What it does that we do worse / lack | Proposed lane |
| --- | --- | --- | --- | --- |
| R1 | Approval-snapshot library with `input` / `params` / `settings` (merged over a base) / `expectations` per JSON file, category directories, and a compile-time update switch asserted off by an integrity test | `tests/src/lib/Snapshot.hpp`; `tests/src/IrcMessageHandler.cpp:56-63` | The fleet's snapshot tests (vitest) have no guard against a committed `-u`; the "expectations" slot records what the mocked upstream must have been asked | K (D-F1) + P (`snapshot-update-switch`) |
| R2 | Upstream stand-ins released as versioned binaries on pinned ports, with a `docker compose` alternative | `tests/README.md` | Our integration tests mock at the SDK boundary; a released stand-in makes local == CI | T (docs note under test-harness application) |
| R3 | Doc-comment DSL in C++ headers → LuaLS meta + TS `.d.ts`, drift-gated by regenerate-and-diff | `scripts/make_luals_meta.py`; `lint.yml:26-31`; `docs/lua-meta/` | Personas already drift-gates `commandNames.generated.ts`; the pattern of typing an *embedded scripting* surface from the host's declarations is new | P (K10) |
| R4 | libclang-driven codegen into `// … START` / `// … END` marker regions of otherwise hand-written files | `lib/twitch-eventsub-ws/ast/`, `payloads/README.md` | Mixed generated/hand-written files with marker regions instead of separate generated files — a `generated-file-hygiene` boundary case | K application (D-F3) |
| R5 | Custom clang-tidy module in its own repo, sha256-pinned in CI, findings posted as PR review comments | `.CI/setup-clang-tidy.sh:35-38`; `post-clang-tidy-review.yml` | Our eslint rules live in-repo (`personas/eslint-rules/`) — fine; the review-comment posting is the reusable half | K application (D-F4) |
| R6 | `RatelimitBucket` — a 40-line egress bucket with a queue and per-token refill timer | `src/util/RatelimitBucket.{hpp,cpp}` | Dependency-free; a `scripts/` port is pointless (Qt timers) but the *shape* is the citizen-egress reference | K application (D-B2) |
| R7 | `ExponentialBackoff<maxSteps>` — 30 lines, cap as a type parameter, `static_assert(maxSteps > 1)` | `src/util/ExponentialBackoff.hpp` | Nothing we lack; a clean exemplar for `backoff-design` | catch |
| R8 | `RecursionGuard` + `canRecurse()` on every mutation door | `src/common/Channel.cpp:246-250` | Our event buses dispatch async; if a sync hook surface ever lands (personas runner-extension-surface), this is the guard | K amendment (D-A3) |
| R9 | `SignalCallback` — weak owner ref + `abandon()` of the foreign closure when the owner is dead | `src/controllers/plugins/SignalCallback.hpp` | The "never destruct a foreign function ref after its VM is gone" rule, encoded in a copy-assignment operator | K (D-C3) + P craft |
| R10 | `WebSocketHandle` weak-pointer handle that still owns the lifetime; `onClose(unique_ptr<Listener> self)` | `src/common/websockets/WebSocketPool.hpp:20-71` | Explicit destruction-order hand-off at the terminal callback | P craft (K19) |
| R11 | `ThreadGuard` — debug-only affinity assertion object placed on the data | `src/util/ThreadGuard.hpp`; `ChannelView.hpp:369` | Zero release cost; catches cross-thread reads of a view snapshot | P craft (K22) |
| R12 | `backup::loadWithBackups` — a generic "load, else list backups with state, else dialog" helper reused for two files | `src/util/Backup.hpp` | Personas' `db/backup.rs` rotates but has no restore surface; the JSON settings/preferences files have neither | K (D-E1) → direction candidate for personas |
| R13 | Failure-named tests as a paid-for taxonomy | `tests/src/` — `ExponentialBackoff.BadMaxSteps`, `LinkParser.doesntParseInvalidIpv4Links`, `NetworkRequest.{FinallyCallbackOnError,FinallyCallbackOnTimeout,TimeoutNotTimingOut}`, `TwitchPubSubClient.ExceedTopicLimit`, `BasicPubSub.SubLimits`, `RatelimitBucket.BatchTwoParts`, `TwitchUserColor.ChannelChattersDataButBaseColorInvalid`, `TabHistory.RemoveDuplicatePages` | The connection-layer failure modes (topic limit exceeded, timeout-that-doesn't, finally-on-error) are each one test; they corroborate B3/B4 from the measurement tier | evidence for §3 |

## 7. Leads, catches, untriaged

### Leads (return conditions stated)

| Lead | Return condition |
| --- | --- |
| L1 — Split a per-connection-limited duplex transport by direction (D-B1) | a second client of such a protocol that does the same, or the provider's rate-limit guide fetched and its per-connection JOIN/PRIVMSG limits quoted (one fetch) |
| L2 — Gate AI-assisted contributions on the author's prior human record; reserve a labelled issue class for humans; forbid machine authorship of reviewer-facing prose; require disclosure (K1) | a second maintained OSS project publishing a comparable policy (convergence → `practices/` or a `knowledge-registry` technique); until then one project's governance choice |
| L3 — A failed cursorless catch-up should be *stated*, not silent (negative finding under D-A4: `TwitchChannel.cpp:1552-1558` clears the loading flag on error and shows nothing) | when the amendment lands, record this as the source-tree application's "what the realization cannot do"; return if upstream adds a "history may be incomplete" marker |
| L4 — `--safe-mode` as a generic desktop-app boot mode (skip extensions and automations, keep them listed) | a fleet desktop app grows an extension or automation surface that can break boot — personas' accepted `runner-extension-surface` (2026-09-03) is the first candidate; see §8 |
| L5 — The eventsub library's own TODO: "websocket connections need to die when user is changed" | a technique on *identity-scoped connection eviction* (nearest `client-state` `identity-scoped-eviction`) if a second tree shows the same bug class |

### Already covered (catches, with the file that covers them)

- D-B2 egress bucket below the ceiling → `rate-limiting.md` § "Egress (the citizen)", `algorithm-selection.md` (token bucket). Application only.
- D-E3 updater channels / nightly refusal → `release-pipeline/techniques/updater-chain.md` ("the client's one-way door"). Application only.
- D-F3 marker-region codegen → `codegen/techniques/{commit-vs-derive-policy,drift-gating,generated-file-hygiene}.md`. Application only.
- D-F4 external linter module + review bot → `quality-gates/techniques/enforcement-binding.md`. Application only.
- C4 / K10 typings generated from host declarations and diffed → `codegen/techniques/drift-gating.md` (the pattern); practice note optional.
- K20 backoff factor 2, cap → `retry-backoff/techniques/backoff-design.md`.
- K21 atomic immutable emote maps → `client-architecture/client-fetch-cache` / `client-state/techniques/invalidation-strategy.md`.
- F2 stand-in upstreams → `test-harness/techniques/{live-app-harness,fixture-economics}.md`.

### Untriaged (extracted, reached the table, not picked — unverified, never declined)

| Row | Anchor | Why it stopped |
| --- | --- | --- |
| K8 stand-ins as released binaries | `tests/README.md` | likely catch under fixture-economics; the "released as a versioned artifact" half is a docs note at most |
| K15 lifetime hazard documented beside the call | `docs/wip-plugins.md` § HTTPRequest | thin; docs-content-model territory |
| K19 owning pointer at the terminal callback | `WebSocketPool.hpp:65-71` | C++ craft; no fleet C++ tree to apply it to (pof is UE5 C++ — possible, unchecked) |
| K22 data-placed thread-affinity guard | `ThreadGuard.hpp` | C++ craft; same |
| K24 endpoint → scope → call-site inventory | `api/README.md`; `make-release.md:5-6` | likely catch under `docs-sync/coupled-surface-inventory` |
| K-D2 wholesale rebuild of the compiled highlight table | `HighlightController.hpp:44-49` | likely catch under `invalidation-strategy` |
| E4 native-messaging browser host (select/detach/sync actions, per-browser manifest registration) | `NativeMessaging.cpp:64-121,372-390` | an IPC contract (`client-architecture/ipc-contract`); not mapped this run |
| F5 REUSE/SPDX gate on every file | `REUSE.toml`; `reuse.yml` | no claim beyond its existence |

## 8. Phase 7.6 — peer check (seed only)

**Is any fleet project a peer?** Read every manifest `scope.does`. Chatterino is *a desktop chat client over hosted chat services*. No fleet project is that. The nearest is **personas** — "local-first desktop app … multi-locale desktop UI … one operator per install" (Tauri, Rust core + TS shell) — which shares Chatterino's **desktop-shell layer** (settings persistence and damage, crash and restart, update channel, keyboard shortcuts, an extension surface, live event streams from remote workers) but not its class (agent orchestration vs chat rendering). **Verdict: not a peer at the system level; a partial peer at the shell layer.** A full 25-45-point comparison study is *not* recommended; the shell-layer points below are enough for the director to decide between (a) a short study scoped to the shell layer or (b) direction proposals only. Recommendation: **(b)** — the fleet map already carries three accepted personas directions in exactly this layer (`restart-class-recovery`, `store-damage-policy`, `runner-extension-surface`, all accepted 2026-09-03), so the seam is live and a study would mostly restate them.

Seeded points (chatterino file:line · personas file:line · provisional verdict · reason):

| # | Area | Chatterino | personas | Verdict | Reason |
| --- | --- | --- | --- | --- | --- |
| 1 | Shortcut registry | `HotkeyController.cpp:300-336,591-606` — named actions per widget category, user-rebindable, applied-defaults ledger | `src/lib/keyboard/shortcutRegistry.ts:7` (registry drives the cheat sheet "so the documentation can never drift"), `AppKeyboardProvider.tsx:22-139` (priority/exclusive handler stack) | **keep ours** for the handler stack; **adapt** the defaults ledger *only if* rebinding is ever in scope | personas shortcuts are not user-rebindable; the ledger solves a problem it does not have yet |
| 2 | Config damage | `Backup.hpp` + `Settings.cpp:187-226` — 9 rotating slots, restore dialog with per-backup state | `src-tauri/db/src/backup.rs:27-48` — rotating DB snapshots before any connection opens, "never blocks boot"; no restore surface; JSON preference files have no backup at all | **adapt** (direction candidate) | `store-damage-policy` (accepted) covers the SQLite store; the operator-owned JSON settings and the *restore surface* are the gap |
| 3 | Crash-restart policy storage | `CrashHandler.cpp:56-108` — one-key file outside settings | `src-tauri/src/boot/recovery.rs`, `core/src/models/frontend_crash.rs` — recovery reads the DB | **adapt** as one rule inside the accepted `restart-class-recovery` | if the DB is what is damaged, the restart decision must not depend on it (D-E2) |
| 4 | Safe-mode boot | `Args.cpp:157-160,273-275`; `PluginController.cpp:323-329` | none found (`grep safe.?mode` over `src`, `src-tauri`: 0) | **adopt** (direction candidate, L4) | `runner-extension-surface` (accepted) creates the first thing that can break boot from operator-supplied code |
| 5 | Extension sandbox | `PluginController.cpp:146-215` — in-process language sandbox by subtraction | `src-tauri/src/engine/runner/` — operator-tier extension points around four stages (accepted direction) | **different forces** | personas extensions are operator-tier (`operator-tier-code-loading`); Chatterino's are third-party-tier; the subtraction sandbox is the wrong tool for the former |
| 6 | Updater | `Updates.cpp:34,120-146` — channel setting, nightly refuses, portable zip vs installer | `src-tauri/tauri.conf.json:61-70` — signed `latest.json` feed with pubkey | **keep ours** | a signed feed is the `updater-chain` rule; a beta-channel setting is a product question, not a gap |
| 7 | Liveness of a remote worker | `IrcConnection2.cpp:64-110` — traffic is the pulse, probe only when idle, late tick skipped | `src/features/agents/sub_deployment/hooks/useCloudHealthMonitor.ts`, `core/src/healing.rs`, `healthcheck_ledger.rs` — timer-driven probes | **adapt** | a laptop that slept will report the cloud worker dead on the first tick after wake unless the late-tick rule is applied (D-B4); cheap, measurable (false-dead count after sleep) |
| 8 | Catch-up after a dropped stream | `TwitchChannel.cpp:1511-1560` | cloud worker event stream — not located this run | **unknown** | needs the study or a targeted read; not seeded as a verdict |
| 9 | Approval snapshots | `Snapshot.hpp`; `UPDATE_SNAPSHOTS` guard | vitest snapshots (`vitest.*.config.ts`); no guard against a committed `-u` found | **adapt** | a CI assertion that no snapshot was updated in the same change as its code is the mechanism (D-F1); measurable: count of PRs that touch `__snapshots__` and source together |
| 10 | Generated typings drift | `lint.yml:26-31` | `scripts/run-codegen.mjs predev`; `neverTouch: [src/lib/bindings/, …commandNames.generated.ts]` | **keep ours** | same rule, already enforced |

### Direction candidates (for the director to rank; cap three per run; forces cited, not features)

1. **personas ← `settings` — operator-owned config file damage and restore.** Forces: local-first, one operator, no server copy, a JSON preferences/settings file written by the app on every change. `store-damage-policy` answers the SQLite half; the JSON half has neither rotation nor a restore surface (`grep '\.bak|backup' src/api`: draft/editor saves only). Measurable: a fault-injected truncated settings file boots to a restore choice instead of defaults. Falsifier: personas keeps *all* operator state in SQLite and the JSON files are derivable caches — then there is no direction. Size: S–M.
2. **personas ← `untrusted-extension-host` / `session-continuation` — a safe-mode boot that registers but does not run operator-supplied extensions and automations.** Forces: the accepted `runner-extension-surface` puts operator code in the execution path; the accepted `restart-class-recovery` restarts after a crash — a crash *caused by* an extension will loop unless the restart can skip extensions and still show the operator the disable control (Chatterino's exact reason at `PluginController.cpp:324-326`). Measurable: a deliberately throwing extension + crash-restart converges to a running UI with the extension listed and disabled. Falsifier: extensions run out-of-process and cannot take the shell down. Size: S.
3. **personas ← `subprocess-lifecycle` (`liveness-and-heartbeats`) — late-tick and traffic-as-pulse rules in the cloud health monitor.** Forces: a sleep-capable host polling a remote worker on a timer. Measurable: false-dead reports in the first minute after wake (before/after). Falsifier: the monitor already uses a monotonic clock and discards the first post-wake interval. Size: S.

**Directions not proposed:** personas shortcut rebinding with a defaults ledger (point 1 — scope admits the *feature* but not the *forces*: no rebinding surface exists); pof (UE5 C++ companion) for K19/K22 C++ craft — scope admits it, but craft is a practice lane, not a direction; kp/tracklight/pumper/politicas — server-side, none of the shell-layer forces apply; personas-web explicitly excludes the desktop app's concerns.

## 9. Where this read overrode the brief, with the argument

- **Class sub-shape.** The brief proposed "vendor repository, community-held". Confirmed, but the read routes it through the *no-rules-page* branch (2026-09-02) rather than the *rules-page* one: the operating documents are code, and the yield ratio came out 11:2 code:prose. A sweep that stopped at `docs/` would have found C1 and D3 and nothing else.
- **Brief's expected richest surfaces.** The brief pointed at the eventsub AST tooling and the plugin API. The plugin boundary did produce the technique triple, but the AST tooling is a catch (codegen owns it); the connection layer and the recovery periphery produced more design entries than either.
- **B1 demoted from technique to lead.** The brief listed "IRC read/write split" as a system-B decision. The tree carries the mechanism, not the forces; writing the forces would mean quoting a provider document nobody fetched. Filed as L1 with a one-fetch return condition rather than as a technique on reconstructed rationale.
- **No forge handoff, no XL spec.** Neither routing clause fires (max 2 per system, max 2 per home-if-new). The system that reaches three (C) does so *inside* an existing subject, which v2.2 routes to a technique triple, not a forge. Recommending against a study for personas (§8) for the same reason: the seam is already live under three accepted directions.
- **D-D1's home.** The brief did not name one. `search` is recommended over `alerting` because the forces are the hot path and the end-user author, both of which `search` states and `alerting` (threshold rules over telemetry) does not; the director should re-check `search`'s boundary statement before filing, since a chat filter is not a search query.

## 10. Director checklist

**Claim on the board now (Phase 6/7):**
`software-engineering/security/untrusted-extension-host` · `software-engineering/ui-surfaces/shell-and-navigation/chat-transcript` · `software-engineering/client-architecture/realtime-events` · `software-engineering/operations/governance-and-records/settings` · `software-engineering/ui-surfaces/data-display/search` · `software-engineering/engineering-process/build-and-release/test-harness` · `software-engineering/ui-surfaces/data-display/feed` · `software-engineering/llm-agent/runtime-and-io/subprocess-lifecycle` · `software-engineering/backend-platform/resilience/error-handling` (the last three for amendments only).

**Files a full landing would touch (shared spines in bold — take the `content` lock for each one-line edit):**
- new: `security/untrusted-extension-host/techniques/{capability-subtraction-sandbox,safe-mode-registration,uniform-non-fatal-callbacks}.md` (or the last two as amendments inside `isolation-tier-independent-extension-api.md` and `per-callback-failure-policy.md`); `…/applications/cpp--capability-subtraction-sandbox.md`
- new: `chat-transcript/techniques/{immutable-model-cached-layout,virtual-filtered-channel}.md` + `applications/cpp--…`
- new: `realtime-events/techniques/capacity-packed-subscription-pool.md` + `applications/cpp--…`
- new: `settings/techniques/{applied-defaults-ledger,config-backup-and-restore}.md` + `applications/cpp--…`
- new: `search/techniques/typed-filter-language.md` + `applications/cpp--…` (verify the boundary first)
- new: `test-harness/techniques/approval-snapshots-with-guarded-update.md` + `applications/cpp--…`
- amend: `realtime-events/techniques/subscription-lifecycle.md` (A3), `feed/techniques/live-prepend.md` (A4), `subprocess-lifecycle/techniques/liveness-and-heartbeats.md` (B4), `error-handling/techniques/crash-capture.md` (E2)
- applications only: `rate-limiting/applications/cpp--algorithm-selection.md` (B2), `release-pipeline/applications/cpp--updater-chain.md` (E3), `codegen/applications/cpp--generated-file-hygiene.md` (F3), `quality-gates/applications/cpp--enforcement-binding.md` (F4)
- **golden paths** whose `techniques:` list changes: `untrusted-extension-host.md`, `chat-transcript.md`, `realtime-events.md`, `settings.md`, `search.md`, `test-harness.md`
- `verified_against` witness for every `cpp--` application: `CMakeLists.txt:71` (`VERSION 2.5.5`), `CMakeLists.txt:30,100` (Qt 6 required, Qt 5 unsupported), `vcpkg.json:5` (builtin baseline `dd3097e3…`). Stack slug: `cpp` is new to the corpus (`c` exists once); the director should decide `cpp` vs `cpp-qt`.

**Fetches the picks need (director's budget of 3):** none for the fourteen advancing rows — every corroboration is corpus-internal or training-data convergence (Lua stdlib capabilities, approval-testing practice, token-bucket semantics). One optional fetch would promote L1 (Twitch's IRC rate-limit guide, per-connection JOIN and PRIVMSG limits) from lead to technique.

**Purity grep terms for Phase 7 review:** Twitch, Chatterino, Lua, sol2, Qt, IRC, Helix, EventSub, PubSub, BTTV, FFZ, 7TV, crashpad, clang-tidy, LuaLS, httpbox, pajlada, Communi.

**Scorecard depth cell (proposed):** `S0 / T up to 9 / A4 / Asrc up to 10 / task 0` · routing: per-system NONE A2 B2 C0 D2 E1 F1 (whole tree 8 of 20), HOME-IF-NEW max 2, existing-home triple C=3 · handoff: **none** (stay in intake) · directions: 3 candidates seeded for personas, 0 written by this worker (registry-only) · peer: partial (shell layer), study not recommended.
