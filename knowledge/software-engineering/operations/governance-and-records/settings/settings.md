---
layer: golden-path
type: golden-path
subject: settings
status: forged
techniques:
  - key-registry
  - typed-accessors
  - read-batching
  - setting-kinds
  - inherited-default-override
  - settings-audit-and-history
  - save-experience
  - cross-source-precedence-chain
  - applied-defaults-ledger
  - config-backup-and-restore
  - author-declared-include-graph
  - in-place-document-patch
---

# Settings & preferences

A settings store is the application's memory of what the operator decided: a
key-value substrate that everything else reads. It is the highest fan-in state
in the system — rendering, scheduling, spending, safety, and sync all consult
it — and it is deceptively easy to build, because the naive version is four
functions (get, set, delete, list) over a table of strings. The naive version
also works, for months. Its failures arrive later, and they arrive silently,
because of the one property that makes a settings store unlike every other
store in the application:

**Reads never fail loudly.** A settings read that finds nothing returns a
default, by design — the application must boot on an empty store. That single
property, essential and non-negotiable, converts every mistake in the vicinity
into a plausible value. A typo'd key does not error; it returns the default. A
key that was renamed does not error; the old value sits orphaned while reads of
the new name return the default. A corrupted value does not error, if the
accessor swallows the parse failure; it returns the default. In every other
subsystem, a wrong name is a crash; here, a wrong name is a quietly different
application. **Misconfiguration is indistinguishable from configuration** —
unless the store is built, deliberately, to make them distinguishable. That is
what this subject is about.

Five commitments follow, one per failure mode of the naive store.

## The key space is a registry, not a convention

A store keyed by free strings has an unbounded key space, and an unbounded key
space accumulates exactly two kinds of garbage: **typos**, which read as
defaults forever (the write went to `notifcations_enabled`, the read asks for
`notifications_enabled`, both succeed, nobody is notified), and **orphans** —
keys whose reading code was deleted or renamed, whose stored values persist
indefinitely because nothing errors on an unread row.

The fix is structural, not disciplinary
([one-validation-door](../../../_laws.md#one-validation-door)): the set of legal
keys is a closed vocabulary with one authoritative definition
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)),
enforced at **both ends of the pipe** — callers reference named constants so a
typo is a compile-time error, and the store itself rejects writes of
unregistered keys so the constant layer cannot be bypassed by a caller that
skips it. A registry also makes the orphan problem *solvable*: diff the
registry against the stored rows and every stale key surfaces; without a
registry the question "which of these rows is dead?" has no computable answer.
The full discipline — registration, namespacing, rename migration, reaping —
is the [key-registry](./techniques/key-registry.md) technique.

## Every read is typed, and every default is a decision

The store holds serialized values; the *types* live at the read boundary. A
raw string handed to twelve call sites is twelve parses and twelve opinions
about what malformed means. The correct shape is one typed accessor per key —
parse, validate, clamp, default — so the store's stringly nature is a private
implementation detail behind a typed door.

The default deserves more respect than it usually gets. A default is not a
fallback of last resort; it is **the value most installations run with**,
because most users never open the settings surface. It is a product decision
with an owner and a rationale, and it deserves to be written where decisions
live — in code, reviewed, next to a sentence saying why — not discovered
empirically in production.

And the default has a **fail direction**. When the key is a preference, a
wrong default is a cosmetic annoyance. When the key is a safety ceiling, the
default is what the limit becomes when nothing was configured — and a spending
ceiling that defaults to *unlimited* fails open: the state "nobody set a
budget" silently becomes the state "there is no budget". The canonical
evidence is already registered on the neighbouring subject: the
[hitl-approval](../../../llm-agent/orchestration/hitl-approval/hitl-approval.md) audit found dollar ceilings
where zero-or-absent meant unlimited while the boolean switches around them
failed closed — two fail directions in one settings surface, and the dangerous
one on the dangerous key. Safety-relevant defaults fail *safe*: absent ceiling
means zero, not infinity. The full rule set is
[typed-accessors](./techniques/typed-accessors.md).

## Reads are batched

Because everything reads settings, settings reads happen at the worst moment:
startup, when dozens of components mount at once and each asks for its keys.
If each read is a round trip across a process or storage boundary, boot pays a
fan-out tax that grows with every feature — measurable, and entirely
self-inflicted, because the values are tiny and were all in one table the
whole time. The remedy is a bulk read that loads the space (or a namespace) in
one round trip into a cache, with invalidation on write so the cache never
silently diverges from the store
([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)).
The mechanics — bulk endpoints, single-flight, write-through, cross-window
staleness — are [read-batching](./techniques/read-batching.md).

## Writes are observable

"What changed recently?" is the first question of every debugging session that
begins with "it worked yesterday" — and in a settings-driven application, the
honest answer is usually a setting. A store that cannot answer that question
turns every configuration change into an unfalsifiable suspect. So every write
is recorded: which key, old value, new value, when, from where, under which
category — and the record is *surfaced*, not merely stored: a history view
grouped by category, and recent-change markers on the settings surface itself,
so the drifted knob is visible at the scene. The ledger mechanics (append-only
discipline, retention, redaction) belong to
[audit-logging](../audit-logging/audit-logging.md); what this subject owns is
the settings-shaped surface on top —
[settings-audit-and-history](./techniques/settings-audit-and-history.md).

## One store, several contracts

"Settings" is one word for at least four kinds of key, and the kinds have
different rules:

| Kind | Example | Wrong-value blast radius | Fail direction of the default |
| --- | --- | --- | --- |
| **User preference** | theme, density, language | one annoyed user | any reasonable value |
| **Operational config** | endpoint, interval, concurrency | degraded or broken behavior | the conservative value |
| **Safety ceiling** | spend cap, rate cap, autonomy level | unbounded machine action | **closed — always** |
| **Feature flag** | staged rollout, experiment | inconsistent behavior | off |

Treating all four as one contract is how a spend cap ends up edited as
casually as a theme toggle. The kind is declared in the registry, and per-kind
rules follow — who may write it, how strictly it validates, how loudly it
audits, whether changing it demands confirmation or a gate. Ceilings in
particular are only *stored* here; their **enforcement semantics** — the gate
that consults them, what happens at the boundary — belong to
[hitl-approval](../../../llm-agent/orchestration/hitl-approval/hitl-approval.md). The taxonomy and per-kind
contract table is [setting-kinds](./techniques/setting-kinds.md).

## Some defaults are inherited, not declared

Every default discussed so far is a constant: a value written in code, reviewed,
identical on every installation. A minority of keys default instead to a **live
source the application does not own** — an environment-level appearance or
motion preference, a platform locale, an organisation policy a tenant inherits.
That difference is orthogonal to the four kinds above and it re-defines all
three store operations. Absent no longer means "substitute the constant", it
means *follow the source, continuously*; a write is not merely setting a value,
it is **detaching the key from its source**; and a delete re-attaches.

The consequence is that for these keys the stored row's *presence* carries
meaning independent of its content, and both naive policies destroy it in
opposite directions. Writing the user's target unconditionally pins a key that
was merely following, the moment their target happens to coincide with the
source — a silent one-way exit from inheritance. Clearing an override whenever
it comes to match the source destroys the opposite ability, and destroys it
worst for users whose environment switches on a schedule: they cannot pin
anything, because a background event they did not cause deletes the choice each
time the source swings through it. The resolution rule, the write-only-on-
divergence discipline, the evaluate-only-at-user-interaction constraint, and the
three cases where a visible third state is genuinely earned are
[inherited-default-override](./techniques/inherited-default-override.md).

## And some values arrive from one of several sources

An inherited default is one key following one source. A different shape
appears wherever a single build must run in more than one environment without
being told which: the *whole* configuration can arrive from any of several
independent sources — an explicitly named file, a path supplied by the
environment, an ambient identity the execution environment injects, a constant
compiled into the binary — and the process must resolve them in a **declared
precedence order** at boot. Each source may be partial, or present and
unreadable, and the order is the contract.

Two rules make the difference between a chain and a coincidence. A source that
is *absent* is skipped and the chain continues; a source that is *present and
malformed* stops it, because falling past a broken source is how a mistyped
line in the operator's own file becomes a process running happily against a
different target with nothing logged. And the resolution records **which
source answered** — the provenance is the only thing that makes "this value is
wrong on that host" a question with an answer rather than an excavation. The
ordering discipline, the composition choice (whole-object versus per-key
layering), the keep-every-failure rule when the whole chain comes up empty,
and the boundary against inherited defaults are
[cross-source-precedence-chain](./techniques/cross-source-precedence-chain.md).

## And sometimes the store is one document, not many rows

Everything above assumes the store's granularity is the key: a write touches
one row and leaves its neighbours alone by construction. Where the whole
space is instead a single stored document — one nested tree of named members,
loaded whole at startup and written whole on save — that guarantee is no
longer free, and the obvious implementation throws it away. Deserializing the
document into a fresh object graph and installing that graph in place of the
old one is one line of code that loses information twice.

It loses information in the document, because a settings document behaves
like a **user document rather than a payload**: it outlives the build reading
it, and every member the running schema does not recognize — written by a
newer build, or by the one the user rolled back from — is missing from the
new graph and therefore missing from the next save. Nothing errors; the
user's configuration for everything the *other* build owns is simply gone.
And it loses information in the process, because everything observing the
settings holds a reference to the object that was just replaced, so the
surface quietly stops moving after a reload.

One inversion fixes both: the stored document is the source of truth, and the
runtime object is **patched** from it in place rather than rebuilt from it.
Unknown members are preserved by default and pruned only inside subtrees that
declare themselves lossy; a write replaces the one named subtree and leaves
its siblings — including the uninterpretable ones — alone. The mechanism also
has a ceiling that belongs in the same breath as its promise: it preserves
members, never comments or hand formatting, and preserving those is a
different and much larger commitment. It is
[in-place-document-patch](./techniques/in-place-document-patch.md), and it is
the one place where the next section's instinct must be held back — the
members a build cannot see are not that build's orphans.

## Stale keys are reaped

Every registered key names its lifecycle
([creation-names-reaper](../../../_laws.md#creation-names-reaper)): a rename ships a
migration that moves the stored value, or the user's choice silently reverts
to the default — a data-loss bug that no error will ever report; a retirement
deletes the registry entry *and* the stored rows, idempotently. The registry
is what makes reaping mechanical: orphan detection is a set difference, run as
a periodic check rather than an archaeology project. A store that only ever
grows is not accumulating configuration; it is accumulating doubt about which
rows still mean anything.

## The save experience

Settings surfaces have a UX contract of their own: writes should feel
immediate but must be honest. Debounced saves with visible confirmation;
failed writes that say so rather than pretending
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)); guards
on navigation away from unsaved explicit-save forms; search over a settings
surface that has outgrown scrolling. These are
[save-experience](./techniques/save-experience.md).

## Boundaries

- **Client-side persistence mechanics** — how UI state stores persist,
  version, and migrate their own slices — belong to
  [client-state](../../../client-architecture/client-state/techniques/persistence-and-migration.md).
  This subject owns the *application* settings store: the durable, backend-
  held key space. The practical rule: if the value must survive
  reinstallation or drive backend behavior, it is a setting; if it is
  view-state ergonomics (panel widths, collapsed sections), it is client
  state.
- **Appearance token systems** — what theme values *are* and how they cascade
  — belong to [design-tokens](../../../ui-surfaces/feedback-and-style/design-tokens/design-tokens.md). The setting
  stores *which* theme the user picked; the token system defines what that
  choice means.
- **Gating semantics of autonomy ceilings** — what enforces a ceiling and
  what happens at the boundary — belong to
  [hitl-approval](../../../llm-agent/orchestration/hitl-approval/hitl-approval.md). This subject owns the
  storage, typing, and fail direction of the ceiling *value*.
- **Ledger discipline** — append-only writes, retention, querying — belongs
  to [audit-logging](../audit-logging/audit-logging.md).
- **Secrets are not settings.** Credentials, tokens, and anything deserving
  encryption live in the [credential-vault](../../../security/identity-and-access/credential-vault/credential-vault.md);
  a settings store is plaintext by design and must refuse the temptation to
  hold "just one API key". If a value would be redacted in a log, it does not
  belong here.

## The techniques

- [key-registry](./techniques/key-registry.md) — the closed key space:
  constants, store-side allowlist, namespacing, rename migration, orphan
  detection.
- [typed-accessors](./techniques/typed-accessors.md) — one typed door per key:
  parse/validate/clamp on read, defaults as owned decisions, the
  fail-direction rule.
- [read-batching](./techniques/read-batching.md) — collapsing the boot fan-out:
  bulk reads, caching, invalidation on write.
- [setting-kinds](./techniques/setting-kinds.md) — preference / operational /
  ceiling / flag: one store, per-kind contracts.
- [inherited-default-override](./techniques/inherited-default-override.md) —
  keys whose default is a live upstream source: absent as a subscription,
  writing only on divergence, never re-evaluating except at user interaction,
  and when a third control state is earned.
- [settings-audit-and-history](./techniques/settings-audit-and-history.md) —
  category-tagged change records, history surfaces, recent-change visibility.
- [save-experience](./techniques/save-experience.md) — debounced honest saves,
  unsaved guards, settings search.
- [cross-source-precedence-chain](./techniques/cross-source-precedence-chain.md)
  — configuration resolved across several partial sources in a declared order:
  absent skips and malformed stops, provenance per resolved value, every
  failure kept when the chain comes up empty.
- [applied-defaults-ledger](./techniques/applied-defaults-ledger.md) — shipped
  defaults that are rows in a user-editable collection: a ledger of applied
  default names instead of a version chain, deletions durable, renames
  impossible without a tombstone.
- [config-backup-and-restore](./techniques/config-backup-and-restore.md) — an
  operator-owned file with no other copy: bounded rotation before every save,
  atomic write, and a restore surface at the point of load failure instead
  of a silent boot on defaults.
- [in-place-document-patch](./techniques/in-place-document-patch.md) — the
  store as one document that outlives the build reading it: patch the runtime
  object instead of replacing it, preserve members the schema does not name,
  prune only where a subtree opts in, and say plainly that comments and
  formatting are not preserved.
