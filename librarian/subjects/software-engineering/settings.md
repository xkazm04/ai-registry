---
subject: settings
domain: software-engineering
last_touched: 2026-09-04
dry_streak: 0
---

# settings

First touch by `/intake`: 2026-09-04, second pass over a self-hosted markdown
note service, from a row the first pass had left untriaged.

## State

10 → 11 techniques, +1 application (first `node` application on this subject).

Landed: **`presence-decides-precedence`** — precedence between two names for one
setting in a source the application can only read.

## Why it is a technique and not an amendment

`key-registry` already answers a rename, and answers it well: register the new
key, migrate the stored values once at upgrade, retire the old one. The answer
carries an unstated precondition — **the application can write to the store** —
which is always true inside a settings store and false for the large share of
configuration that arrives from an environment block, a mounted file, a command
line or an orchestrator manifest. No upgrade rewrites the operator's compose
file, so the migration step does not exist, both spellings stay live for a grace
period nobody in the process controls, and the only question left is precedence.

`key-registry`'s rule does not survive that, so by the v2 boundary-or-mechanism
test it is a mechanism, and mechanisms get techniques.

## The denial that located it

`cross-source-precedence-chain`'s *When not to use this* closes with: *order that
depends on the value is a policy engine, not a chain.* That is correct, and it
assumes value-dependence is a thing an author **chose**. The finding is the case
where nobody chose it — the author intended to test presence and wrote a test of
value, because `typed-accessors` had already substituted the default and
collapsed unset and set-to-the-default into the same bytes. The chain's rule
names the smell; the mechanism that prevents it is a read that can say "absent"
out loud.

This is the Phase 6 denial hunt working exactly as written: *where a subject
explicitly denies a symmetry, check whether it denied too much.*

## The second half nobody states

A deprecation notice attached to the branch where the old key **wins** is
invisible to the operator who has migrated and still carries a stale line — the
one population that needs to hear it. The notice belongs on the key's
*presence*, in two distinguishable messages, and the two counts are not
interchangeable when scheduling removal.

## The apply, which found a defect with a security half

`goat`, mode `code`, verdict `better`, `ab-paired`, shipped `323b1bd`.

An enrichment health probe resolved `TMDB_API_KEY || NEXT_PUBLIC_TMDB_API_KEY`
while the fetcher it reports on reads only the first, so a public-name-only
deployment got a green health endpoint over a path that threw on every call. The
dual read was 1 of 5 sibling probes in one file, and the file's own doc comment
and error string both already named one key.

The sharp edge: arm A did not merely *report* the public value usable, it
**spent** it in the outbound `api_key` parameter — so a bundle-named variable was
a working way to supply a secret, and the compatibility fallback is what kept it
alive. That makes a rename fallback a security decision whenever the two names
sit on opposite sides of the public/server split.

## Open ground

- No application yet from a tree that has the **single resolver** the technique
  asks for. `goat` was fixed at one call site because it has no configuration
  module at all; the technique's central prescription is therefore asserted and
  not witnessed.
- The two-message notice and the two-count removal rule are likewise unwitnessed.
  A tree that implements them would be the strongest possible application here.

Source note: [[2026-09-04-flatnotes]]
Remedies ranked in the amendment: bind the type to the key in the registry (closed key
space, no runtime tag needed), tag the record (open key space, catches *named*
disagreements only), or bind the type into the handle at build time.

Applied to a managed tree as code, `better`, committed. The store had already adopted the
technique well - closed key registry, write door enforced at the repository layer, blobs
validated against the consumer's exact type - and the gap was the one the amendment's audit
paragraph predicts: enforcement is **per key with nothing counting it**. 58 of 90 key
constants reachable inside the validator; within the store's own "limits" category, 3 of 4,
the fourth a spend ceiling whose sibling is enforced *and* carries six negative test cases.
Nobody decided that - the key was added after the validator's shape was set.

## 2026-09-02 - `/intake` create-better-t-stack (run `intake-cbts-0902`)

`inherited-default-override` gained two sections: "The third column: a default derived
from sibling keys" and "Provenance travels with the value, or validation blames the user
for a default". The source was a scaffolding CLI whose validator threads the set of
explicitly provided flags beside the assembled configuration, fires a cross-key rule only
when every key it names was provided, and re-derives the defaulted side otherwise; its
agent-facing surface removes every default and rejects a partial payload. The technique's
table had constant and environment sources for a default; a sibling key is the third and
commonest. Nearest prior art was a seam, not a hole - the technique already said presence
carries meaning independent of content for inherited defaults.

Phase 7.5 (`personas` + `pumper` structural, simulation, `better` on 1 of 3, 2 equal):
every cross-key rule in the server's validator is guarded by a boolean whose default is
off, so no derived value can ever be the trigger - the trees practise the rule where it
costs nothing. The one live case is a resume path that replays a constant where the
first run derived a value. Not shipped: crosses a provider-trait signature.

## 2026-09-03 - `/intake` kube-rs (run `intake-kube-0903`, intake 2.3.1, Opus workers)

New technique `cross-source-precedence-chain` (slug kept over `config-resolution-chain`: cross-source is the discriminator against `inherited-default-override`, which is one key and one live source, and against `key-registry`, which is vocabulary not resolution): several partial, independently unreadable sources resolve one key space at boot, and an unreadable named source is a failure, never a fall-through to the next. Golden path gains the section "And some values arrive from one of several sources". Application `rust--cross-source-precedence-chain` against a control-plane client library@1.89, witnessed at `kube-client/src/config/mod.rs:212`.

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

Technique pair from the source's settings periphery: `applied-defaults-ledger` (record
which named default sets were applied, never the values, so a user's edit is never
overwritten and no version chain is needed) and `config-backup-and-restore` (rotating
backups before each save plus a restore surface the product exposes). Applied against the
fleet's local-first desktop app: the ledger came back **not-better** on every structural
case because that tree's migrations are idempotent replays, and the technique gained a
boundary section saying so; backup-and-restore came back better by simulation and produced
the run's one direction proposal (the tree rotates three sets and admits in a comment that
it has no restore path). Two `cpp--` and two `rust--` applications.

## 2026-09-04 - [[2026-09-04-cargo-make]] (intake, run cargomake-0904)

Gained `author-declared-include-graph` + `rust--author-declared-include-graph` (external tree; **unapplied** in the fleet).

**The seam this fills:** `cross-source-precedence-chain` resolves across sources *the platform declared* - finite, named in the resolver, known before boot. A configuration file allowed to name what it inherits from breaks all three assumptions at once: the resolver cannot enumerate the sources, the graph can cycle, and the sources sit in directories the resolver did not choose. The two techniques compose in one direction only - the platform's chain selects the entry document, the author's graph expands from it - and a design letting the author's graph reorder the platform's chain has given a config file authority over which config file is authoritative.

**Strongest evidence in the new technique is negative.** The external tree carries entry-origin provenance *inside* the entry's own key-value payload, which is the free channel, and now maintains a literal length-2-and-contains-exactly-these-two-keys sentinel test at two independent inheritance sites to undo it. `inherited-default-override` already said provenance travels *beside* the values, for a different provenance question; this is what the inside-the-values shortcut costs, measured in a competent tree.

**Return condition for the fleet:** when a managed project grows an extends-shaped configuration format. None has one today.

## 2026-09-04 - /intake `Everywhere` (run `everywhere-build`)

One technique, **`in-place-document-patch`**, and the placement check that
preceded it is the more useful record.

The mechanism: the stored document is the source of truth and the runtime
object is **patched from it in place**, never deserialized into a fresh graph
that replaces the old one. Two forces, and both are about things a replacement
silently destroys - members written by a version this build does not know
(so a round trip through an older build deletes the newer build's
configuration), and the object identity that observers hold (collections keep
their instance and synchronize items rather than being rebuilt). Preservation
is the default; pruning is opt-in per subtree and never the default for a
user-edited section. The honest ceiling is stated: a structural document model
preserves unknown *members*, not comments, duplicate properties or formatting -
that is a text-span editor and a much larger commitment.

**All eleven neighbours were read before writing** (the subject grew by one
mid-run; a sibling landed `author-declared-include-graph` the same morning).
The two that decided it:

- `key-registry` prescribes the **opposite** for its own regime - stored keys
  minus registered keys are orphans, reap them - and the tension is real rather
  than a duplication. The discriminator now stated in prose: the orphan set
  difference is over keys *this build registered*, never over every member of
  the document. "The members a build cannot see are not that build's orphans."
- `read-batching` also prescribes the opposite ("drop the whole map, re-bulk-read"
  over clever per-key patching), and is correct there. The discriminator is
  **identity**: nothing holds a reference to a cache behind a typed door, and
  the presentation layer holds one to the settings graph. That is the strongest
  evidence the subject did not already model this.

`config-backup-and-restore` already owned the atomic-write half and
`save-experience` the debounce; both cited, neither restated. Only two
document-substrate details were added - serialize to memory before touching the
file, and the debounce must flush at exit.

**Flagged, not fixed:** `author-declared-include-graph` is in this golden path's
`techniques:` frontmatter with no prose section and no closing bullet. The gate
cannot catch that (it checks frontmatter against files only), and the owning
session may still be mid-write.

Unapplied: return condition in `applied.md`.
