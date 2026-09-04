---
subject: agent-runtime-assembly
domain: software-engineering
last_touched: 2026-09-04
dry_streak: 0
touched_by: deepen
---

# agent-runtime-assembly

## 2026-09-02 - forged by intake `deer-flow` v2 ([[2026-09-02-deer-flow-v2]], run intake-deer-flow-0902-v2)

**Born from a routing count.** The 2.0.0 front half
([[2026-09-02-deer-flow-v2-replication]]) read seven design decisions off an
agent harness and found four with no subject whose golden path models their
forces: the hook chain around model and tool calls as a composition contract;
code loading from an operator-only tier with isolation and fail-open by
failure origin; long-running remote work kept out of the loop behind a
bounded projection; and durable conversation state under a frozen checkpoint
mode with asymmetric compatibility. All four shared one HOME IF NEW, which is
the mechanical XL trigger. The subject sits in `llm-agent/runtime-and-io`
between the gateway's admission door and the model call.

**Six techniques**, forged expert-first by one worker and reconciled against
the source at `08b27aef`: `semantic-hook-placement`, `assembly-identity`,
`operator-tier-code-loading`, `host-routes-win`,
`bounded-projection-of-external-work`, `checkpoint-mode-custody`. Three
source-tree applications (python) from the worker; two fleet applications
(rust) from the director - one `code` better and shipped, one `simulation`
not-better with its condition written into the technique.

**Boundaries stated on both sides.** mcp-tools (wire contract; its scope
paragraph now points here for in-process plugins and host custody of tool
work); prompt-assembly/fingerprinting-and-cache-keys (prompt digest versus
assembly digest); time-travel-replay (restore of conversation state points at
checkpoint-mode-custody); ci-execution-trust/injected-code-scope-ladder (the
runtime's tier instance); job-coordination (technique 5 consumes a lease, does
not define one); fleet-orchestration (the receipt middleware's placement is
technique 1's example, its verification stays there).

**Open, recorded by the worker.** Q1: checkpoint custody may become a second
subject when a third custody decision (lineage, replay base, branch seeding)
lands - re-scan condition in the source note. Q2: two-layer authorization
(assembly-time capability filter plus run-time execution check from one
policy) is a sentence in the golden path and a candidate seventh technique.

**Apply debt.** Four of six techniques are unapplied with return conditions;
the fleet has no runtime extension surface, no contributed routers, no
per-run assembly record and no modal checkpoint store today.

## 2026-09-02 - `/intake` gstack (run `intake-gstack-0902`, intake 2.1.0)

Source-tree application `node--operator-tier-code-loading` written against a Stop hook
that runs a command declared in the repository's instruction file only after the operator
records its content hash in a per-repo trust store; any edit invalidates trust; every
absence fails open; grants are logged with a tty flag. The tree reaches the technique's
rule by a different door - the repo file proposes, the store enables - and admits the gap
in its own comment: the grant is agent-runnable, so the log rather than the store is
where a determined actor is caught. Structural confirmation; no amendment.

## 2026-09-02 - `/intake` hermes-agent (run `intake-hermes-0902`, intake 2.1.1, Opus workers)

Four techniques from the extension-host system of a peer runtime, each with its own mechanism (no folds, argued): `observer-and-mutator-surfaces` (two registration surfaces with opposite return contracts; veto-by-throw rejected because policy denial and contributor bug become indistinguishable downstream), `rewrite-before-the-gate` (a request rewrite runs outside the availability, guardrail, approval and observer gates so policy evaluates the effective value; the continuation is single-use so a post-processing failure never re-executes a non-idempotent tool), `honest-hook-registry` (a timeout requires a safe abandonment direction, so coverage is an allowlist with reasons and lift conditions; no event name registered ahead of a live emit site), `session-scoped-capability` (a client-surface capability resolves from the session source never a process env slot - the golden path had named this absence itself). Source-tree application `python--rewrite-before-the-gate`. The golden path intro and the capability-roster paragraph were updated by the director to reflect the count and the landed pairing. Cross-subject correction applied in `advisory-guard-fail-mode`: "bound every handler" now carries the safe-direction predicate. Fleet: pof is the strongest seam (a direction proposal was written there); personas is the second (the peer comparison study names its runner hook surface).

## 2026-09-03 - `/intake` adaptive-agentic-worms (run `worms`, intake 2.3.2)

One technique, `guard-input-custody` (11th): a guard's policy inputs must sit outside
the write reach of the party the guard constrains. The source was a community walkthrough
of a security preprint, and the mechanism it supplied is the **re-read trap** - refreshing
a policy file on every decision is not freshness against a governed party that can write
it, it is re-reading that party's most recent edit, and the careful instinct (never cache,
always re-read) is exactly what produces the vulnerable design. The measured instance:
an autonomous agent found the denylist restricting it inside its own working tree and
rewrote it; the layer that held was in the supervising host, outside the agent's
namespace.

Placement was contested and argued three ways. `operator-tier-code-loading` orders config
tiers by writer but its axis is *whether a file names code* - a denylist names none, so it
passes that rule trivially, and its writer table (operator / administrator / service) has
no row for the governed process itself. `rewrite-before-the-gate` is ordering within a
turn, not custody of durable inputs. `candidate-write-access` in `eval-harness` states the
same underlying rule first and states it well, for the measurement lane; the boundary
between the two subjects is now written on both sides, and it is a real one - **a
measurement can be defended by changing what the optimizer chases (a declared holdout
needs no cooperation from the candidate); a confinement cannot, because it must hold
rather than be believed in.**

The vendor-refusal candidate folded in as the technique's last section rather than
becoming its own landing: a control operated by a service binds the parties who route
through that service and is *absent* rather than weakened for anyone else. Routing around
a refusal you do rent stays owned by provider-routing in the media bundle; the
discriminator is stated in prose, not linked.

Applied `code`/`better`, `ab-paired`, against this registry's own purity gate - which
selected its denylist from a key in the governed bundle's own index file and degraded to
a weaker profile with a note when the key was absent. One deleted line took a planted
violation from red to green. Custody moved into the checker. Application
`node--guard-input-custody`.

Second application the same day, `python--guard-input-custody`, against a fleet project's
memory evaluation harness - and it amended the technique. The harness's confinement is an
injected clock that **cannot** be placed out of reach, because backends load into its own
process; the tree answered the custody question honestly with "no", declined to call the
convention a guard, and built a differential check instead (replay one scenario at two
base dates, require identical rendered recall, normalising generated ids and absolute
instants first). The technique gained a section from that seam - detect the escape when
placement is impossible - with the normalisation condition and the limit stated: it
detects rather than prevents, and a deterministic escape that does not vary with the probe
passes it. `not-better` as a verdict, confirmation as a fact, and the corpus is the thing
that improved.

## 2026-09-03 - intake, rowboat (run intake-rowboat-0903)

Two techniques, both about the loop's two doors, from the same vendor
repository read as a system.

- **additive-input-at-the-call-boundary** - mid-unit input injected at the
  model-call boundary rather than by cancel-and-restart, with the three
  reasons supersede loses (each a property owned by a *different* subsystem:
  elision, continuation stripping, and suspended-work destruction). The
  neighbouring UI subject `chat-transcript/composer-turn-queue` models the
  surface half; this is the runtime half, and the boundary between them is
  now stated on this side.
- **indeterminate-closure-on-interruption** - outstanding work closed as
  unknown rather than failed, the status first-class rather than a string a
  downstream classifier re-parses, and every unresolved call closed before
  the terminal event so the record is complete for every reader.

**The second one was corrected by a connected tree, and this is the run's
best result.** The tree was picked as a seam because it looked like it had
the anti-pattern; it had already replaced it with a three-class boot
classification and refuted the technique on a case the technique missed - a
run that kills the process on every resume always looks fresh, so honest
closure plus re-admission is a boot loop. Four mechanisms were read out of
that tree into the technique (classify rather than declare; reuse the
existing liveness threshold rather than picking a fresh number; count
involuntary interruption on its own key; clear the mark on completion, not
on the attempt). Verdict `not-better`, recorded as such.

A second application against a game-production harness came back
`unmeasurable` with the instrument named: the harness has pause and resume
and no verb that carries a message, and the only working mid-run steering
path (pause, hand-edit the config the resume rehydrates from, resume) is
undesigned and unrecorded.

## 2026-09-04 - intake `exo` v2.5.0 ([[2026-09-04-exo]], run intake-exo)

**Amendment to `operator-tier-code-loading`: a fourth row for an agent-written
configuration.** The tier table orders writers by who can write the configuration,
and every writer in it is a person. A runtime that lets the agent it runs extend
its own tool roster adds a writer that is not a person who happens to be
automated, and the difference lands on exactly one of the third row's four
conditions: install-time consent. There is no administrator at install time, and
that is not an oversight to patch with a dialog - it is the tier's entire purpose.
The condition is **structurally unavailable**, and because the four are joint,
that settles it: the third row's inversion cannot be taken here. Two honest
resolutions and no third - deny code entry and extend through data, with new
*code* going down the ladder to the startup tier; or move consent to review-time
and say what it costs, which requires an append-only record someone reads,
privileges named in it, and no irreversible action before the window closes. Plus
the specific self-deception this surface invites: **the isolation that counts
wraps the contributed code, not the agent.** A sandboxed shell and a tool module
imported into the host process are two boundaries wearing one word.

**Application `rust--operator-tier-code-loading`** - the source states its trust
root three incompatible ways and enforces none: the landing page says the event
log is the only unmodifiable part, the design essay says the harness is, and its
own footnote concedes it is a config default. The read-only mount mode exists in
the API; the canonical start mounts the whole tree, harness crate included,
read-write. The structural lesson: a trust root stated in prose and unbound to a
mechanism drifts to the permissive reading while every document still asserts the
strict one.

**Application `node--indeterminate-closure-on-interruption`** (negative) - a
careful team inverted **both** halves of that technique: the synthetic result for
a dangling tool call is a failure carrying a distinguishing prose sentence, which
the technique names as "what teams actually build", and it is written lazily at
read time, which its second half explicitly forbids. They arrived there *through*
care - preferring an honest append-only log to a convenient one - which is the
strongest available argument that the third status is non-obvious and worth
stating.

**Apply: `unmeasurable`** against the one fleet peer. It has no dynamic
code-loading surface at all, so it is already on the rule's correct side by
construction and no arm exists; the instrument that would measure it is a project
that loads external runner code at runtime.

## 2026-09-04 - /intake `copilot-cost-efficiency` untriaged drain (run `intake-ghcost-2`, intake 2.5.0)

Amendment to `bounded-projection-of-external-work`, from the untriaged tail of a
first-party account of a coding-agent harness.

**Two sections.** Per-task delivery is right for every durability property the
technique was built for and never priced the reader: every delivery wakes them, and a
reader who must then ask for the result spends two turns on one completion. Eligible
completions on one thread arriving close together are delivered as one run.

**The key question is the part that could have gone wrong, and the file answered it
from inside.** Keying a grouped delivery *over the set* derives identity from
delivery-time timing - the set is assembled from whatever happened to be ready, so a
restart reassembles a different one - which `identity-survives-reuse` forbids by name,
and it has no representation for "three of five landed". So the batch is
transport-level grouping over individually keyed items. The strongest argument turned
out to be the file's own split-rather-than-truncate rule, which already forces the
partial state to exist.

**The discriminator is the second section and resolves an apparent contradiction with
`mcp-tools/server-composition`,** which holds the opposite rule and is also correct. A
notification that invalidates a *mutable authority* carries no payload, because the
payload would be a racing copy of something that can already be stale and the reader
must re-read anyway; a notification announcing a *completed, immutable result the
producer already holds* carries it, because the result is the authority. The test:
told only that something happened, would the reader have to go somewhere else for the
truth? Stated from this side with a verified link; the record on the other side is
now written too.

**Applied `experiment`, verdict `better`, against a different stack** where the reader
is a person on a serial speech channel rather than a model - so only the wake term was
claimed and the token claim explicitly refused. The mid-state is the whole finding:
arm A's announcement queue peaks at its cap on the commit, the overflow sheds an item
whose key was already claimed at enqueue, and **that completion is silently never
voiced**. Endpoints alone read "9 utterances vs 1" and hide the lost item entirely.
The set-key arm is a live defect there rather than hypothetical: the unread list is
cumulative, so a set key changes on every add and re-speaks everything already said,
6 repeat deliveries against 0.

**The structural check sharpened the rule.** Enumerating the callers of the optional
payload half gave 8 branches across 7 call sites, all matching the discriminator - and
classifying the one site an earlier merged row had hidden forced out a clause the
technique does not yet state: **the discriminator is applied per fact, not per
notification**, since one message may carry one fact and point at another. Candidate
for a later amendment.

Application: `next--bounded-projection-of-external-work` (a new stack for this
technique; the existing `rust--` document is a different project and was not touched).

## 2026-09-04 - intake `yt:B-YQANvDOq0` function hooks (run `intake-yt-byqan`)

New technique `substituted-result-attribution`. Found by the asymmetry hunt rather
than by the source: `rewrite-before-the-gate` models a mutator surface's rewrite
power in full - position relative to the gates, a provenance rule carrying the
original beside the effective value, the wrapping arity contract, three fall-through
states - and disposes of the third power in one clause, "a frame that short-circuits
deliberately is a legitimate use of a wrapping point, not a failure". Correct, and it
settles only whether the frame *may*. What it returns is a value the model reads as
the tool's output, and nothing does on the return path what that technique does on
the way in.

The shape of the finding: rewriting makes the gate judge a value the model did not
write; substituting makes the gate judge a producer that did not answer. An unmarked
substituted result asserts three things falsely - that the tool ran
(`record-precedes-effect` read from the other side), that the result is current
(replay; `unknown-is-not-a-value` at the tool boundary), and that the named producer
produced it (`gate-sees-target` on the return path, because the egress rule, trust
class, credential scope and cost meter were all resolved against the tool's identity).
Two shapes distinguished, replay and substitution, because only one is fixed by
re-running the call.

Subject was **contended**: a live sibling held it. The row was an append (new file
plus one golden-path entry), so it proceeded, with the golden-path edit made under
the `content` lock and released immediately. The board's `check` reported clear while
`list` showed the sibling holding it - second sighting of that contradiction.

No application written here; the technique's structural witness lives in the
`agent-cli-transport` application, where a fleet project already satisfied the
freshness half of this technique (a probe timestamp stamped at probe time, not serve
time) without the technique existing.

## 2026-09-04 - `/deepen` batch ([[2026-09-04-1]])

First `/deepen` pass on the subject; blind lane written before any search
(`agent-runtime-assembly-blind.md` in the run scratch). 14 web calls (10 searches,
4 primary-source fetches). Seven techniques touched, the golden path, four
applications; no new technique.

**Landed, file by file.**

- `techniques/host-routes-win.md` - **corrected** the absolute *"Most routers resolve
  a request by first match in mount order, which makes mount order a security
  property"*. A whole family of routers resolves by specificity and refuses
  overlapping patterns at registration; there mount order decides nothing and a
  contributed pattern *more specific* than a host path wins however late it mounts.
  The mount-last rule is now conditional on the router's matching discipline, with
  the register-time check as the other implementation of the same invariant, plus two
  decision rules. Blind lane reached this independently; web lane confirmed from the
  language runtime's own routing announcement.
- `techniques/operator-tier-code-loading.md` - two corrections. (1) *"Optional (the
  default): the extension is skipped ... the host starts"* contradicted the same
  technique's run-time rule that an intercepting hook fails closed: a guard that
  fails to *load* was an absent guard for the process lifetime. The load-time
  default now derives from the declared kind (observational skips, intercepting is
  required unless explicitly downgraded, one declaration decides both fail
  directions). Blind lane found the inconsistency; web lane confirmed the field
  default from the admission-control API reference (`failurePolicy` defaults to
  fail). (2) *"But the exception the host raises to cancel is the same exception a
  contributor's own internal timeout raises"* was true only of runtimes whose
  timeouts are untranslated cancellations; the async runtime's own docs show a scoped
  timeout converting its cancellation to a timeout error at its boundary and a
  cancellation *request count* rather than a class. Premise qualified; origin rule
  unchanged and strengthened (lean on the scoped primitive; never re-derive origin
  from exception shape on top of it).
- `techniques/semantic-hook-placement.md` - **new section** "A hook that calls
  through the surface it wraps": hook-originated calls (model-backed guards,
  summarizing observers, delegates) either self-wrap or bypass the chain; the
  composer adds an *originator* to every call, renders the chain minus the
  originating hook, validates *H does not wrap calls originated by H*, and the
  ledger names the originator. Blind lane item A; web lane reached it from two
  directions - the admission-control self-deadlock guidance (exclude the controller's
  own scope) and an agent runtime whose hooks "did not fire" for delegate tool calls
  until delegate identity was stamped on the payload. Golden path gained the
  failure mode "the self-wrapped hook".
- `techniques/additive-input-at-the-call-boundary.md` - **qualified** *"A loop with a
  call budget must reset that budget on each accepted input"*: the technique's own
  drain is source-blind, so a reset per drained item lets an automated producer buy
  unlimited calls one message at a time. The drained item now carries a principal
  class and a shed count; only a person's input resets. Blind-lane internal
  consistency finding, no web source; recorded as such.
- `techniques/checkpoint-mode-custody.md` and golden path - **qualified** *"storage
  grows with the square of the turn count"* / *"The cost is quadratic in the turn
  count"*: quadratic in message references; in bytes only when content is copied
  rather than shared. Arithmetic, no source.
- `techniques/bounded-projection-of-external-work.md` - **amended** with a failure
  class the tool protocol's task extension (2025-11, experimental) introduces: the
  receiver may override the requested lifetime and delete a task *and its result*
  once it elapses regardless of status, and a later poll reads *not found*. A result
  that existed and was destroyed unread is its own row state (*expired unread*), and
  the poll cadence is sized inside the remote's stated retention.
- `techniques/substituted-result-attribution.md` - **tightened** the first decision
  rule from a fleet tree (personas runner hooks): the wrapped result type is
  obtainable only from the continuation, the dispatcher records whether it was
  entered, and an unentered wrapped-shaped return is a fabricated verdict, not a
  substitution. The tree is stronger than the technique's prose was.
- Golden path - the five sentences above, plus "the skipped guard" failure mode and
  the router-discipline qualifier in the routes paragraph.

**Counter-evidence that confirmed (no edit).**

- `indeterminate-closure-on-interruption` - database driver specifications carry
  exactly this third status as an error *label* ("we don't know if your commit has
  satisfied the write concern"), applied on network/timeout/server-selection
  failures, with explicit "the application decides whether to retry". Label, not
  message text - the technique's rule in a mature field.
- `substituted-result-attribution` - the standardized cache-status response header
  carries hit/forwarded/residual-ttl per intermediary: the three channels exist on
  the wire. Confirmed; personas `cli_capabilities` (`probed_at` at probe time,
  `served_from_cache`) confirms the freshness half again.
- `observer-and-mutator-surfaces` - admission control has the two surfaces
  (mutating patch vs validating typed allow/deny with reason; audit separate) and
  classifies webhook *errors* by policy rather than conflating them with a deny.
  personas hooks module implements it (`observe` returns `()` by signature).
- `session-scoped-capability` - the tool protocol negotiates client capabilities per
  session at initialize; pof `resolveSessionTopology` reads `clientInfo` from the
  handshake and is called per request, never memoised. Seam re-read, unchanged.
- `honest-hook-registry` - the dominant coding-agent harness's hook docs (2026-09)
  now state that a timed-out command/HTTP/tool hook on the pre-tool event "doesn't
  block the tool call ... don't count on a stalled hook to act as a gate", while an
  SDK callback hook that times out blocks it. One event, two fail directions by
  handler class - the technique's predicate observed in production docs.
- `bounded-projection` - the task extension's own note says hosts "may wish to return
  control to the model while the task is executing" with a server-supplied immediate
  message: only-submit-is-model-visible is now the protocol's guidance. personas
  `remote_report_block` seam re-read, unchanged.
- `rewrite-before-the-gate` state 3 - personas dispatcher: a frame that refuses
  *after* entering the continuation has its refusal downgraded to a diagnostic and
  the inner outcome stands.
- `additive-input` boundary - the dominant harness injects queued messages "between
  tool calls" at the next model pause; the boundary is where the technique put it.
- `indeterminate-closure` disposition rules - personas `restart_recovery.rs` still
  checks the restart cap before the freshness window; unchanged since the 09-03 read.

**Drift re-verification.**

| application | tree opened | runtime observed | before -> after | citations |
| --- | --- | --- | --- | --- |
| `next--additive-input-at-the-call-boundary` | pof @ `0152dd0a` | `next` 16.3.3 in package.json | next@15 -> next@16 | 3/3 groups |
| `node--guard-input-custody` | ai-registry (this checkout) | CI pins node 20 (7 jobs); local node 24 | node@20 -> node@20 (fleet drift, not the document's) | 2/2; "four jobs" corrected to seven |
| `node--indeterminate-closure-on-interruption` | fresh clone of the source at `7801005`, `C:/t/exo-dp` | mise pins nodejs 22.15.0 | node@22.15 -> node@22.15 (unchanged) | 3/3 |
| `node--operator-tier-code-loading` | fresh clone of the source at `0d1bd561`, `C:/t/gstack-dp` | `engines.bun >= 1.0.0`, CI bun 1.3.13, no node witness anywhere | node@22 -> **withdrawn** (no node witness in the tree; it pins bun, which the stack vocabulary lacks) | 5/5 |

**Open leads, with return conditions.**

- *Hook re-entrancy as its own technique.* Landed as a section; it becomes a
  technique when a second runtime documents inner-call hook semantics (which hooks
  a hook-originated call traverses) or a fleet tree adds a model-backed guard to a
  chain.
- *Extension contract version negotiation at load* (contribution declares the host
  contract major; mismatch refused by name). `honest-hook-registry` has the per-event
  form. Return when a fleet project publishes a hook contract to a second party.
- *Discriminator applied per fact, not per notification* (banked 09-04 by the
  ghcost intake) - still owed; no new evidence this pass.
- *Cooperative-then-forced cancellation with a grace deadline for contributed
  hooks* - home contested with `subprocess-lifecycle`; proposal only.

**Declines.** Q1 (checkpoint custody as a second subject) - return condition not met;
no third custody decision landed. No product-named prior art was written into any
technique (driver labels, cache headers and admission control are described by
class). No new technique: the one candidate (re-entrancy) has one primary source
and one incident, which is a section's worth of evidence, not a technique's.

**Proposals for other subjects** are in the run report: `mcp-tools` (the task
extension's `execution.taskSupport` required/optional/forbidden and TTL purge as
wire facts), `session-continuation/advisory-guard-fail-mode` (the same event with
two fail directions by handler family, documented), `subprocess-lifecycle`
(grace-deadline cancellation of a hook that ignores the host signal).

**Saturation self-forecast.** Not saturated. Every technique is still one- or
two-source; this pass refuted two absolutes and one internal contradiction on the
first attempt, which is the signature of a subject that has not been attacked
before. Expect one more pass of this yield, then diminishing.
