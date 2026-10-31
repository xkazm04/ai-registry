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

### 2026-09-23 - `/conform --stale` on personas (4 pairs re-judged at revision 13)

3 deviation, 1 conformant. Two old not-applicables fell because their contexts grew: an
unset spend ceiling defaults to "no ceiling" and fails open for unattended dispatch, and a
custom-theme draft is lost with no unsaved guard. Proposals from the judge, unplaced: (1)
`inherited-default-override` needs a line for OR-composition - an app toggle that can force
the inherited value on but never pin it off is an additive input, and "the control shows
the resolved value" reads ambiguously there; (2) `save-experience` should say whether
per-row explicit commits beside instant toggles count as one save model or the mixed model
it rules out. **Coverage:** a settings-shaped surface over credential management is better
governed by credential-vault or audit subjects; an appearance mirror file with a hand-synced
key literal belongs to no context; the backend fail-open lives in a context not paired here.

## 2026-10-31 - architecture review (first record)

First architecture-review decision for this subject. All 26 documents read in
full: the golden path, 13 techniques and 12 applications. Pinned external
witnesses were re-opened at their recorded commits (kube-rs `7a4641d`,
Chatterino 2 `fda51f0`, cargo-make `95dcc54`), plus one filesystem primary
source for the atomic-write claim. Three findings change text. (1) The kube-rs
application's "malformed stops" heading holds only inside the file rung.
`Config::infer` falls back to the in-cluster identity on **any** kubeconfig
error, malformed included, and logs that at trace level. In a pod that has a
broken `KUBECONFIG` mounted, the tree has the exact silent fall-through the
technique names. (2) The Chatterino hotkey application's line ranges overlap
and are wrong, and the tree does remove retired defaults automatically when
they are unedited. (3) Temp-file-plus-rename is atomic against a process crash.
Without a flush before the rename it is not atomic against power loss. The
2026-09-04 flag (`author-declared-include-graph` listed in the golden path's
frontmatter, with no prose and no closing bullet) still holds and is owed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/settings",
  "date": "2026-10-31",
  "baseline": "0f30830bc",
  "digest": "sha256-b2:85c48ec5bdb5581f",
  "disposition": "clarify",
  "coverage": "All 26 documents read in full. External witnesses re-opened at their pinned commits: kube-rs (config mod.rs, file_config.rs, file_loader.rs, incluster_config.rs, Cargo.toml), Chatterino 2 (Settings.cpp, HotkeyController.cpp, hotkeys README, Backup.cpp/.hpp, RestoreBackupsDialog.cpp, CMakeLists.txt, CHANGELOG.md) and cargo-make (descriptor mod.rs, Cargo.toml). Private-tree applications were not re-executed; the key-registry and read-batching citations were spot-checked by grep only. Not evaluated: any A/B arm, Chatterino's vendored settings library (an unfetched submodule) and every private witness behind a structural-only verdict.",
  "counterexamples": [
    "A process that resolves its configuration with kube-rs Config::infer inside a pod that has a malformed KUBECONFIG mounted runs against the in-cluster identity. The only record of the broken file is a trace-level line, so 'malformed stops' does not hold across rungs in that tree.",
    "A save written as temp file plus rename, with no fsync before the rename, can leave a zero-length primary after a power loss on a delayed-allocation filesystem. Killing the process mid-save never shows this, so the technique's kill test passes while the guarantee fails.",
    "Chatterino deletes a retired shipped default binding automatically when every field still matches what shipped. That retirement is not a user act, and it destroys no user edit, so the applied-defaults-ledger boundary that a retired default is 'then a deliberate user act' is stricter than a competent tree needs.",
    "An unknown root name in an author-declared include that warns and falls back to the local directory reads correctly in the authoring repository and wrongly in every adopting one (cargo-make, confirmed at 95dcc54)."
  ],
  "sources": [
    {
      "url": "https://github.com/kube-rs/kube/blob/7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e/kube-client/src/config/mod.rs",
      "result": "infer() at :212 matches the quote. On any Err from from_kubeconfig it emits tracing::trace!(\"no local config found, falling back to local in-cluster config\") and calls Self::incluster(), so a malformed kubeconfig falls through to the next rung. KubeconfigError spans :35-95 with fifteen variants, not fourteen; :97-111 is LoadDataError. The root_cert_file doc says it is re-read '~60 s' only 'when set and the rustls-tls feature is enabled'. The apply_debug_overrides comment ('Log these overrides loudly...') is confirmed at :362."
    },
    {
      "url": "https://github.com/kube-rs/kube/blob/7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e/kube-client/src/config/file_config.rs",
      "result": "read() :509, from_env() :522 returning Result<Option<Self>> and merge() :554 with the quoted first-file-wins rule and the KindMismatch/ApiVersionMismatch refusals are all confirmed."
    },
    {
      "url": "https://github.com/kube-rs/kube/blob/7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e/kube-client/src/config/incluster_config.rs",
      "result": "The 'client-go requires that both environment variables are set' comment is at :50 (cited as :49). The proxy chain at file_loader.rs:132-140 is confirmed."
    },
    {
      "url": "https://github.com/Chatterino/chatterino2/blob/fda51f0d3a4a5cd15f099b951b796e299d566e9e/src/controllers/hotkeys/HotkeyController.cpp",
      "result": "loadHotkeys :239-299, saveHotkeys :301-331 and tryAddDefault :591-606 are confirmed. addDefaults ends at :556, not :589. resetToDefaults is :558-573: it clears the ledger, empties the list, then calls saveHotkeys() and loadHotkeys(); it does not call addDefaults directly. clearRemovedDefaults (:575-589, called by the constructor at :83 after loading) uses tryRemoveDefault (:608-619) to remove a retired default only while every field still matches the shipped binding. warnForRemovedHotkeyActions (:621-633) collects bindings that name a removed action."
    },
    {
      "url": "https://github.com/Chatterino/chatterino2/blob/fda51f0d3a4a5cd15f099b951b796e299d566e9e/src/singletons/Settings.cpp",
      "result": "loadWithBackups at :187, setBackupSlots(9), the SaveManually|OnlySaveIfChanged save method and the empty Settings::migrate are confirmed. Backup.cpp's loop, the regex for .bkp-N and the SavingFromTemporaryFileFailed 'not enabled' comment are confirmed. CMakeLists.txt :71 VERSION 2.5.5 and :281 CMAKE_CXX_STANDARD 23 are confirmed. CHANGELOG :36 entry is confirmed. The hotkeys README 'Renaming defaults is currently not possible' quote is confirmed."
    },
    {
      "url": "https://github.com/sagiegurari/cargo-make/blob/95dcc54/src/lib/descriptor/mod.rs",
      "result": "The relative-root enumeration git/crate/workspace/makefile, the default 'makefile' and the warn 'Unknown relative-to value: {}, defaulting to makefile' are confirmed. Cargo.toml version 0.37.24 is confirmed."
    },
    {
      "url": "https://raw.githubusercontent.com/torvalds/linux/master/Documentation/admin-guide/ext4.rst",
      "result": "auto_da_alloc: 'Many broken applications don't use fsync() when replacing existing files via patterns such as fd = open(\"foo.new\")/write(fd,..)/close(fd)/rename(\"foo.new\", \"foo\")'. The heuristic exists to avoid 'the \"zero-length\" problem that can happen when a system crashes before the delayed allocation blocks are forced to disk.' So rename atomicity depends on a flush, and the ext4 mitigation is a per-filesystem heuristic, not a contract."
    },
    {
      "url": "https://lwn.net/Articles/322823/",
      "result": "'ext4 and data loss' (2009) documents the zero-length-file reports and the rename/truncate heuristics queued for 2.6.30. It corroborates the ext4 doc."
    }
  ],
  "documents": {
    "settings.md": {
      "disposition": "clarify",
      "reason": "The frontmatter lists author-declared-include-graph, but there is no prose section and no closing bullet for it. This was flagged 2026-09-04 and is still owed. Add a short paragraph after the cross-source section (an author-authored graph; composes one way only) and a bullet in the closing list. Also restore the blank line before the in-place document heading."
    },
    "techniques/key-registry.md": {
      "disposition": "keep",
      "reason": "Both ends of the pipe, governed prefix families and quarantine-then-reap are sound. Its orphan set difference is correctly scoped by in-place-document-patch's boundary, which says it applies to keys this build registered."
    },
    "techniques/typed-accessors.md": {
      "disposition": "keep",
      "reason": "The decode-success-is-not-a-check section and its three remedies are correct, and the fail-direction rule is consistent with hitl-approval's evidence. The generic claims about permissive decoders are standard behaviour."
    },
    "techniques/read-batching.md": {
      "disposition": "keep",
      "reason": "The coalesce-versus-cache trade, key-only broadcast and coarse invalidation are sound, and the boundary against in-place patching is drawn on identity in the sibling technique."
    },
    "techniques/setting-kinds.md": {
      "disposition": "clarify",
      "reason": "'The kinds diverge on five axes; the table is the contract' points at a table that does not exist. The five axes are the bullet list that follows, and the only table is the four-column taxonomy. Say the axes are the contract."
    },
    "techniques/inherited-default-override.md": {
      "disposition": "keep",
      "reason": "The divergence write rule, the interaction-only re-evaluation and the derived-default column with travelling provenance are internally consistent and witnessed by two applications. The 2026-09-23 conform proposal about OR-composed toggles stays a lead, not a defect."
    },
    "techniques/settings-audit-and-history.md": {
      "disposition": "keep",
      "reason": "The record fields, structural redaction, per-key exclusion of bookkeeping and best-effort audit priority are sound and defer ledger mechanics to audit-logging correctly."
    },
    "techniques/save-experience.md": {
      "disposition": "keep",
      "reason": "Sound. The 2026-09-23 open question (per-row explicit commits beside instant toggles) is a refinement lead, not an error in the current text."
    },
    "techniques/cross-source-precedence-chain.md": {
      "disposition": "keep",
      "reason": "Absent-skips/malformed-stops, provenance and keep-every-failure are sound. The kube-rs re-check strengthens the technique, because the witness violates malformed-stops across rungs in exactly the way the technique's failure paragraph describes."
    },
    "techniques/presence-decides-precedence.md": {
      "disposition": "keep",
      "reason": "Presence-over-value precedence, the notice attached to presence with two messages and the release-named reaper are coherent and carry one ab-paired witness."
    },
    "techniques/applied-defaults-ledger.md": {
      "disposition": "clarify",
      "reason": "The 'ledger says nothing about removals' boundary says retiring a default is a warning, then a deliberate user act. The witness tree removes a retired default automatically when it still matches the shipped binding in every field, which destroys no edit, and warns only for the rest. State whether exact-match removal of an unedited retired default is admitted. Owed: this is a design judgment, not a verified error."
    },
    "techniques/config-backup-and-restore.md": {
      "disposition": "clarify",
      "reason": "'Temporary file plus rename means the primary is always either the old complete content or the new complete content' holds against a process crash. Against power loss it holds only if the temporary file is flushed before the rename, and the directory after it where the rename must be durable (ext4 auto_da_alloc docs). The 'kill the process' fault case cannot detect the missing flush. Add the flush and say the kill test covers process death only."
    },
    "techniques/author-declared-include-graph.md": {
      "disposition": "keep",
      "reason": "Per-link declared roots, refusal of unknown root names, out-of-band origin and cycle-by-path are sound. The cargo-make warn-and-default behaviour is re-confirmed at the pin."
    },
    "techniques/in-place-document-patch.md": {
      "disposition": "keep",
      "reason": "Patch-not-replace, opt-in pruning, subtree writes and the members-not-text ceiling are sound, and the boundaries against key-registry, read-batching, the ledger and the chain are drawn correctly."
    },
    "applications/rust--key-registry.md": {
      "disposition": "keep",
      "reason": "Spot-check: the AUTONOMOUS_DELIBERATION scar comment, validate_key/ALLOWED_PREFIXES/deprecated_replacement and repo-layer enforcement are still present. The '~1,570 lines' figure is dated to its verified_on and has since grown; that is not an error. verified_on is not moved, because not every citation was re-checked."
    },
    "applications/rust--typed-accessors.md": {
      "disposition": "keep",
      "reason": "The predicate for the 58/90 count is stated, and the A/B is precise about what the fix buys (an honest error, not a new safety property). The private tree was not re-run."
    },
    "applications/next--inherited-default-override.md": {
      "disposition": "keep",
      "reason": "An ab-paired, scoped claim with the deferred-resolution seam recorded honestly. The private tree was not re-run."
    },
    "applications/rust--inherited-default-override.md": {
      "disposition": "keep",
      "reason": "Labelled simulation/structural-only, with a falsifier stated for the one non-equal case."
    },
    "applications/react--read-batching.md": {
      "disposition": "keep",
      "reason": "Spot-check: queueMicrotask coalescer, the 'distinct ticks' comment, GET_BATCH_MAX_KEYS = 256 and the key-only SETTINGS_CHANGED_EVENT are still present."
    },
    "applications/node--presence-decides-precedence.md": {
      "disposition": "keep",
      "reason": "An ab-paired, scoped claim that names what it does not do (no single resolver, no notice)."
    },
    "applications/rust--cross-source-precedence-chain.md": {
      "disposition": "clarify",
      "reason": "Re-checked at 7a4641d. (1) KubeconfigError has fifteen variants at mod.rs:35-95, not fourteen at :33-111. (2) The 'Absent skips, malformed stops' section is true within the file rung only: infer() falls back to in-cluster on any kubeconfig Err, malformed included, at trace level. This is the tree's most serious shortfall against the technique and is missing from 'Where the tree falls short'. (3) The 60-second CA re-read applies only with the rustls-tls feature. (4) The client-go comment is at incluster_config.rs:50, not :49."
    },
    "applications/rust--author-declared-include-graph.md": {
      "disposition": "keep",
      "reason": "Warn-and-default on an unknown relative value is re-confirmed at 95dcc54 with the quoted message. The sentinel-test claim was not re-opened and keeps its original date."
    },
    "applications/cpp--config-backup-and-restore.md": {
      "disposition": "keep",
      "reason": "Re-checked: nine slots, SaveManually|OnlySaveIfChanged, the loadWithBackups loop with its silent no-backup branch, the three dialog buttons, the damaged-backups line and the CHANGELOG entry all hold at fda51f0. Its existing caution that atomicity is unconfirmed is consistent with the technique clarify."
    },
    "applications/cpp--applied-defaults-ledger.md": {
      "disposition": "clarify",
      "reason": "Re-checked at fda51f0. addDefaults is :333-556 and resetToDefaults is :558-573. Reset saves, then reloads through loadHotkeys, rather than calling addDefaults itself. The 'instead of tombstones' paragraph omits that clearRemovedDefaults/tryRemoveDefault removes an unedited retired default automatically, and that the warning is only for bindings naming a removed action."
    },
    "applications/rust--config-backup-and-restore.md": {
      "disposition": "keep",
      "reason": "Labelled simulation/structural-only, with each case falsifiable. The stop-rotation-on-damage rule it proposes for the technique remains an open lead."
    },
    "applications/rust--applied-defaults-ledger.md": {
      "disposition": "keep",
      "reason": "The not-better verdict is scoped correctly and already produced the technique's replay boundary."
    }
  }
}
```

## 2026-10-31 - architecture review (after apply)

Five documents were edited, and the edits cover six of the seven clarify items above. The one still owed is `techniques/applied-defaults-ledger.md`. The Chatterino witness removes an unedited retired default automatically. Whether the technique's 'retiring is a deliberate user act' boundary should admit that exact-match removal is a design judgment, not a verified error, so it keeps `clarify` and is left for the owning lane.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/settings",
  "date": "2026-10-31",
  "baseline": "0f30830bc",
  "digest": "sha256-b2:9f9fd7fc5bbba23a",
  "disposition": "clarify",
  "coverage": "Second record, same day, against the digest after Phase B. The first record's sources and reading carry over unchanged. Six clarify items were applied and one is still owed. Two applications had every citation re-checked at their pinned commits, and their verified_on moved to 2026-10-31. No other verification date changed.",
  "counterexamples": [
    "A process that resolves its configuration with kube-rs Config::infer inside a pod that has a malformed KUBECONFIG mounted runs against the in-cluster identity. The only record of the broken file is a trace-level line, so 'malformed stops' does not hold across rungs in that tree.",
    "A save written as temp file plus rename, with no fsync before the rename, can leave a zero-length primary after a power loss on a delayed-allocation filesystem. Killing the process mid-save never shows this, so the technique's kill test passes while the guarantee fails.",
    "Chatterino deletes a retired shipped default binding automatically when every field still matches what shipped. That retirement is not a user act, and it destroys no user edit, so the applied-defaults-ledger boundary that a retired default is 'then a deliberate user act' is stricter than a competent tree needs.",
    "An unknown root name in an author-declared include that warns and falls back to the local directory reads correctly in the authoring repository and wrongly in every adopting one (cargo-make, confirmed at 95dcc54)."
  ],
  "sources": [
    {
      "url": "https://github.com/kube-rs/kube/blob/7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e/kube-client/src/config/mod.rs",
      "result": "infer() at :212 matches the quote. On any Err from from_kubeconfig it emits tracing::trace!(\"no local config found, falling back to local in-cluster config\") and calls Self::incluster(), so a malformed kubeconfig falls through to the next rung. KubeconfigError spans :35-95 with fifteen variants, not fourteen; :97-111 is LoadDataError. The root_cert_file doc says it is re-read '~60 s' only 'when set and the rustls-tls feature is enabled'. The apply_debug_overrides comment ('Log these overrides loudly...') is confirmed at :362."
    },
    {
      "url": "https://github.com/kube-rs/kube/blob/7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e/kube-client/src/config/file_config.rs",
      "result": "read() :509, from_env() :522 returning Result<Option<Self>> and merge() :554 with the quoted first-file-wins rule and the KindMismatch/ApiVersionMismatch refusals are all confirmed."
    },
    {
      "url": "https://github.com/kube-rs/kube/blob/7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e/kube-client/src/config/incluster_config.rs",
      "result": "The 'client-go requires that both environment variables are set' comment is at :50 (cited as :49). The proxy chain at file_loader.rs:132-140 is confirmed."
    },
    {
      "url": "https://github.com/Chatterino/chatterino2/blob/fda51f0d3a4a5cd15f099b951b796e299d566e9e/src/controllers/hotkeys/HotkeyController.cpp",
      "result": "loadHotkeys :239-299, saveHotkeys :301-331 and tryAddDefault :591-606 are confirmed. addDefaults ends at :556, not :589. resetToDefaults is :558-573: it clears the ledger, empties the list, then calls saveHotkeys() and loadHotkeys(); it does not call addDefaults directly. clearRemovedDefaults (:575-589, called by the constructor at :83 after loading) uses tryRemoveDefault (:608-619) to remove a retired default only while every field still matches the shipped binding. warnForRemovedHotkeyActions (:621-633) collects bindings that name a removed action."
    },
    {
      "url": "https://github.com/Chatterino/chatterino2/blob/fda51f0d3a4a5cd15f099b951b796e299d566e9e/src/singletons/Settings.cpp",
      "result": "loadWithBackups at :187, setBackupSlots(9), the SaveManually|OnlySaveIfChanged save method and the empty Settings::migrate are confirmed. Backup.cpp's loop, the regex for .bkp-N and the SavingFromTemporaryFileFailed 'not enabled' comment are confirmed. CMakeLists.txt :71 VERSION 2.5.5 and :281 CMAKE_CXX_STANDARD 23 are confirmed. CHANGELOG :36 entry is confirmed. The hotkeys README 'Renaming defaults is currently not possible' quote is confirmed."
    },
    {
      "url": "https://github.com/sagiegurari/cargo-make/blob/95dcc54/src/lib/descriptor/mod.rs",
      "result": "The relative-root enumeration git/crate/workspace/makefile, the default 'makefile' and the warn 'Unknown relative-to value: {}, defaulting to makefile' are confirmed. Cargo.toml version 0.37.24 is confirmed."
    },
    {
      "url": "https://raw.githubusercontent.com/torvalds/linux/master/Documentation/admin-guide/ext4.rst",
      "result": "auto_da_alloc: 'Many broken applications don't use fsync() when replacing existing files via patterns such as fd = open(\"foo.new\")/write(fd,..)/close(fd)/rename(\"foo.new\", \"foo\")'. The heuristic exists to avoid 'the \"zero-length\" problem that can happen when a system crashes before the delayed allocation blocks are forced to disk.' So rename atomicity depends on a flush, and the ext4 mitigation is a per-filesystem heuristic, not a contract."
    },
    {
      "url": "https://lwn.net/Articles/322823/",
      "result": "'ext4 and data loss' (2009) documents the zero-length-file reports and the rename/truncate heuristics queued for 2.6.30. It corroborates the ext4 doc."
    }
  ],
  "documents": {
    "settings.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added a prose paragraph for author-declared-include-graph after the cross-source section (an authored graph, roots declared per link, unknown names refused, origin out of band, composes one way only) and a bullet in the closing list; restored the missing blank line before the in-place document heading."
    },
    "techniques/key-registry.md": {
      "disposition": "keep",
      "reason": "Both ends of the pipe, governed prefix families and quarantine-then-reap are sound. Its orphan set difference is correctly scoped by in-place-document-patch's boundary, which says it applies to keys this build registered."
    },
    "techniques/typed-accessors.md": {
      "disposition": "keep",
      "reason": "The decode-success-is-not-a-check section and its three remedies are correct, and the fail-direction rule is consistent with hitl-approval's evidence. The generic claims about permissive decoders are standard behaviour."
    },
    "techniques/read-batching.md": {
      "disposition": "keep",
      "reason": "The coalesce-versus-cache trade, key-only broadcast and coarse invalidation are sound, and the boundary against in-place patching is drawn on identity in the sibling technique."
    },
    "techniques/setting-kinds.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'the table is the contract' -> 'these five are the contract', pointing at the five-axis list rather than a table that does not exist."
    },
    "techniques/inherited-default-override.md": {
      "disposition": "keep",
      "reason": "The divergence write rule, the interaction-only re-evaluation and the derived-default column with travelling provenance are internally consistent and witnessed by two applications. The 2026-09-23 conform proposal about OR-composed toggles stays a lead, not a defect."
    },
    "techniques/settings-audit-and-history.md": {
      "disposition": "keep",
      "reason": "The record fields, structural redaction, per-key exclusion of bookkeeping and best-effort audit priority are sound and defer ledger mechanics to audit-logging correctly."
    },
    "techniques/save-experience.md": {
      "disposition": "keep",
      "reason": "Sound. The 2026-09-23 open question (per-row explicit commits beside instant toggles) is a refinement lead, not an error in the current text."
    },
    "techniques/cross-source-precedence-chain.md": {
      "disposition": "keep",
      "reason": "Absent-skips/malformed-stops, provenance and keep-every-failure are sound. The kube-rs re-check strengthens the technique, because the witness violates malformed-stops across rungs in exactly the way the technique's failure paragraph describes."
    },
    "techniques/presence-decides-precedence.md": {
      "disposition": "keep",
      "reason": "Presence-over-value precedence, the notice attached to presence with two messages and the release-named reaper are coherent and carry one ab-paired witness."
    },
    "techniques/applied-defaults-ledger.md": {
      "disposition": "clarify",
      "reason": "The 'ledger says nothing about removals' boundary says retiring a default is a warning, then a deliberate user act. The witness tree removes a retired default automatically when it still matches the shipped binding in every field, which destroys no edit, and warns only for the rest. State whether exact-match removal of an unedited retired default is admitted. Owed: this is a design judgment, not a verified error."
    },
    "techniques/config-backup-and-restore.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the atomic-write bullet now says rename atomicity holds against a crashed process, and against power loss only with a flush of the temp file before the rename (and of the directory after it). The kill-the-process fault case now says it exercises process death only."
    },
    "techniques/author-declared-include-graph.md": {
      "disposition": "keep",
      "reason": "Per-link declared roots, refusal of unknown root names, out-of-band origin and cycle-by-path are sound. The cargo-make warn-and-default behaviour is re-confirmed at the pin."
    },
    "techniques/in-place-document-patch.md": {
      "disposition": "keep",
      "reason": "Patch-not-replace, opt-in pruning, subtree writes and the members-not-text ceiling are sound, and the boundaries against key-registry, read-batching, the ledger and the chain are drawn correctly."
    },
    "applications/rust--key-registry.md": {
      "disposition": "keep",
      "reason": "Spot-check: the AUTONOMOUS_DELIBERATION scar comment, validate_key/ALLOWED_PREFIXES/deprecated_replacement and repo-layer enforcement are still present. The '~1,570 lines' figure is dated to its verified_on and has since grown; that is not an error. verified_on is not moved, because not every citation was re-checked."
    },
    "applications/rust--typed-accessors.md": {
      "disposition": "keep",
      "reason": "The predicate for the 58/90 count is stated, and the A/B is precise about what the fix buys (an honest error, not a new safety property). The private tree was not re-run."
    },
    "applications/next--inherited-default-override.md": {
      "disposition": "keep",
      "reason": "An ab-paired, scoped claim with the deferred-resolution seam recorded honestly. The private tree was not re-run."
    },
    "applications/rust--inherited-default-override.md": {
      "disposition": "keep",
      "reason": "Labelled simulation/structural-only, with a falsifier stated for the one non-equal case."
    },
    "applications/react--read-batching.md": {
      "disposition": "keep",
      "reason": "Spot-check: queueMicrotask coalescer, the 'distinct ticks' comment, GET_BATCH_MAX_KEYS = 256 and the key-only SETTINGS_CHANGED_EVENT are still present."
    },
    "applications/node--presence-decides-precedence.md": {
      "disposition": "keep",
      "reason": "An ab-paired, scoped claim that names what it does not do (no single resolver, no notice)."
    },
    "applications/rust--cross-source-precedence-chain.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: fourteen -> fifteen KubeconfigError variants at mod.rs:33-95; a note that malformed-stops ends at the rung boundary; a first shortfall bullet on infer() falling through to in-cluster on any kubeconfig error (mod.rs:214-224); the CA re-read scoped to the rustls-tls feature; incluster_config.rs:49 -> :50; verified_on 2026-10-31 after every citation was re-checked at 7a4641d."
    },
    "applications/rust--author-declared-include-graph.md": {
      "disposition": "keep",
      "reason": "Warn-and-default on an unknown relative value is re-confirmed at 95dcc54 with the quoted message. The sentinel-test claim was not re-opened and keeps its original date."
    },
    "applications/cpp--config-backup-and-restore.md": {
      "disposition": "keep",
      "reason": "Re-checked: nine slots, SaveManually|OnlySaveIfChanged, the loadWithBackups loop with its silent no-backup branch, the three dialog buttons, the damaged-backups line and the CHANGELOG entry all hold at fda51f0. Its existing caution that atomicity is unconfirmed is consistent with the technique clarify."
    },
    "applications/cpp--applied-defaults-ledger.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: addDefaults :333-589 -> :333-556; resetToDefaults :558-589 -> :558-573, described as save-then-reload; the tombstone paragraph rewritten to record clearRemovedDefaults/tryRemoveDefault removing an unedited retired default automatically, with warnForRemovedHotkeyActions (:621-633) for removed actions only; verified_on 2026-10-31 after every citation was re-checked at fda51f0."
    },
    "applications/rust--config-backup-and-restore.md": {
      "disposition": "keep",
      "reason": "Labelled simulation/structural-only, with each case falsifiable. The stop-rotation-on-damage rule it proposes for the technique remains an open lead."
    },
    "applications/rust--applied-defaults-ledger.md": {
      "disposition": "keep",
      "reason": "The not-better verdict is scoped correctly and already produced the technique's replay boundary."
    }
  }
}
```
