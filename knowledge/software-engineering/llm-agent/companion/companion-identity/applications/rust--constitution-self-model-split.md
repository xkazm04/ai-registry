---
layer: application
type: application
subject: companion-identity
technique: constitution-self-model-split
stack: rust
verified_on: 2026-09-23
verified_against: rust@1.96.1
applied: code
ab_verdict: better
proof: ab-paired
---

# One manifest, two authors: the split held by headings in the Personas app

`xkazm04/personas` gives each agent persona a core document,
`manifest.md`, which it describes as **one document with two authors**
(`docs/features/personas/03-trust-and-governance.md`, "The write-lane law").
Three law sections are operator-owned: Mandate, Boundaries and Operation
defaults. Two self-model sections are written by the agent: My work and My
self-reads. The engine is `src-tauri/src/engine/persona_brain/manifest.rs`.
The toolchain is pinned by the repository's `rust-toolchain.toml`
(`channel = "1.96.1"`). Read at tree `a8a833d9` on 2026-09-23; the file was
last changed in `dd91aec1`.

This is the single-file form of the technique, and it is worth checking
against the four conditions under which a single file still counts as two.

## The four conditions

- **Closed vocabulary, defined once: met.** `LAW_SECTIONS` (`manifest.rs:53`)
  and `SELF_SECTIONS` (`:55`) are fixed arrays. `is_law_section` (`:101`)
  and `is_self_section` (`:114`) compare the top-level heading of a diff's
  section path against them, case-insensitively.
- **Nothing mints a heading: met on both doors.** The operator's law door,
  `update_law` (`:427`), refuses a non-law heading, refuses content that
  would introduce a top-level heading ("that would mint a section", `:463`),
  and caps a section's size. The agent's diff grammar targets only existing
  sections, and it is the same anchored-diff engine the companion's own
  self-model uses.
- **Law refused at propose and at apply: met.** `law_diff_errors` builds a
  typed refusal per law-targeted diff. `propose_diffs` (`:540`) adds those
  errors to its validation before anything is filed (`:570`).
  `apply_approved` (`:637`) re-checks the same condition on the stored
  payload (`:670`), so a proposal planted around the propose door still
  cannot land. The test
  `diffs_aimed_at_law_sections_are_refused_at_both_doors` (`:923`) covers
  both halves. It files three law-targeted diffs, including a
  lowercase-heading variant, and each is refused at propose. It then plants
  a law-targeted proposal directly in the store and shows that apply
  refuses it.
- **Law edited directly, never approved: met for the persona's own
  agent.** `update_law` has no caller on the persona's diff path. Its callers
  are the operator's manifest command
  (`src-tauri/src/commands/core/persona_brain.rs:169`) and one more: the
  headless adoption door
  (`src-tauri/src/commands/infrastructure/app_master_adopt.rs`,
  `write_manifest_law`). That door renders all three law sections from the
  adopted role's templates. It runs on every adoption, including the
  re-adoption of an incumbent persona. **Deviation:** that is product-shipped
  law without the technique's seed-when-absent rule, so a re-adoption
  replaces an operator's hand edits to Mandate, Boundaries and Operation
  defaults. `update_law` copies the file to a timestamped backup before each
  write, with the copy's error discarded, and the mirror versions the
  change. The prior text is therefore usually recoverable, but nothing tells
  the operator it was replaced. No review ever
  carries law and learning together, but one automated writer does
  overwrite the operator's law.

## Where the propose door admitted what apply would refuse (at `a8a833d9`)

The law check is complete. The broader rule is that propose refuses
everything apply would refuse on static grounds, and this tree meets it only
for law. A diff whose heading is on **neither** list passes `propose_diffs`
and is refused at apply, because the section does not exist. The module
states this about itself in the comment on `is_self_section` (`:111-113`):
the growth doors drop an unknown heading, and "the propose door would let it
through to fail at apply, which burns a review round for nothing". The test
`apply_with_no_valid_diff_leaves_the_proposal_pending` (`:954`) depends on
that behaviour. It files a proposal for `No Such / Section` successfully and
then shows that apply fails and leaves the proposal pending.

The two internal writers (the growth pass and the sleep cycle) filter to
self sections before they propose. The operator-facing command
`propose_persona_manifest_diffs`
(`src-tauri/src/commands/core/persona_brain.rs:201-222`) does not. It passes
parsed diffs straight to `propose_diffs`, so a proposal naming a heading on
neither list reaches the review queue through that door.

## Applied: propose now refuses a heading on neither list (2026-09-23)

The first gap was closed in commit `10d56124`. A new
`unknown_section_errors` builds a typed `{diffs, self_section}` refusal for
each diff whose top-level heading is on neither list. `propose_diffs` adds it
beside the law check, and `apply_approved` re-checks it on the stored payload.
The test `diffs_under_a_heading_on_neither_list_are_refused_at_both_doors`
covers both doors. The older test that filed `No Such / Section` now files
`My work / No such subsection`. That is a self heading with a `##` the live
file lacks, which is the one refusal that legitimately waits for apply.

The seam was chosen to falsify the rule. The rule assumes apply is *certain*
to refuse a heading on neither list. If a live file could carry such a
heading, apply could land it, and the refusal would not be static. The tree
has a way for that to happen: a pre-rebase `identity.md` is carried into
`manifest.md` verbatim on migration. So one case gives a persona a legacy
file with a `# Notes` heading.

**Caught.** At HEAD that diff **landed**. The premise was false here: apply
was not certain to refuse it. The ground that makes the refusal static is the
closed vocabulary, not apply's behaviour. A heading on neither list belongs to
nobody whether or not the file happens to contain it. The fix therefore does
more than save a review round. It closes a write path from the agent's door
into a heading no author owns. The tree still disagrees with itself here:
`view()` partitions every non-law heading into `self_sections`, so the editor
shows `Notes` as self while both doors now refuse to write under it.

**What the fix does not do.** A path with a self heading and no `##` part
(`My work`) is still filed and always refused at apply, because the section
matcher only resolves `<h1> / <h2>` paths. That is a static ground too. It was
left alone because the growth and sleep doors send whole batches, and one such
diff would then cost every sibling diff in the batch.

## Proof

- **Status:** `ab-paired`, mode `code`. Ten cases went through the command's
  own path, `IdentityDiff::from_json` then `propose_diffs`. Each case that was
  filed went straight to `apply_approved`. Both arms used the same inputs, and
  the instrument is the ignored test `propose_door_outcome_table`.
- **Target:** proposals filed that can never land on static grounds. A: 3 of
  3 unknown-heading cases were filed, then refused at apply. B: 0; all 3 were
  refused at propose.
- **Floor** (tolerance 0): valid self diffs land (2/2 in both arms).
  Live-document refusals, an unknown `##` or a missing anchor, are still filed
  and refused at apply (2/2 in both arms). The law control is refused at
  propose in both arms.
- **Falsifier:** a `# Notes` heading present on disk. It landed in A and was
  refused at propose in B.
- **Gates:** the app's `persona_brain` and `twin_style` unit tests passed 53
  of 53. Clippy (`--features desktop --lib --tests`) reported 73 warnings
  elsewhere and none in this file. `rustfmt --check` was clean.

## Verdict

Against the agent, this is a clean single-file realization. The law boundary
holds at both doors, it is tested at both, and no door can move it. The
propose door now also refuses a heading on neither list. That was the general
form of the propose rule, and the only gap measured here. One gap remains. The
adoption door re-renders shipped law over the operator's edits instead of
seeding it only when absent.

## The same tree, a second realization: the companion's shipped constitution

The persona manifest above is the single-file form. The app's companion (Athena) holds the other
form, two files with separate writers, and its evidence was gathered independently on this
machine the same day. It is kept here rather than in a second file because the rkb profile's
witness segment names a project, and both realizations live in one project. This half was
applied as an `experiment` with verdict `better`; the frontmatter above records the manifest's
paired code proof.

Personas seeds its companion's law, `~/.personas/companion-brain/constitution.md`,
from a template compiled into the binary, and the running prompt reads the law from
that file rather than from the package (`src-tauri/src/companion/prompt/build.rs:102,
123-125`). The partition itself holds: identity and constitution are separate files
with separate writers (`companion/brain/identity.rs:1-12`), and the Brain Viewer
gates its edit affordance to the identity kind
(`src/features/plugins/companion/BrainViewer.tsx:676, 784`), so the app offers no
in-product editor for the law. The upgrade path is where the standard is
missed, and it is missed for the reason the technique now leads with.

Re-read 2026-09-23 at personas `1b8161096`; toolchain pinned in
`rust-toolchain.toml` (channel `1.96.1`), manifest floor `rust-version = "1.80.0"`
(`src-tauri/Cargo.toml:218`).

### The baseline is the grammar

The template is 1,911 lines and carries 103 `OP:` lines — the companion's whole
action vocabulary lives in the law file (`templates/constitution.md`, e.g.
`:257-265`). A build-time test fails when an op is wired end to end but "named
nowhere in `constitution.md`" (`every_catalog_op_is_taught_by_the_constitution`,
`companion/dispatcher/catalog.rs:860`), which makes the coupling mandatory: every
new feature is a constitution edit. `CONSTITUTION_VERSION` stands at **66**
(`companion/templates/mod.rs:571`), with a changelog comment per bump from v37
onward (`mod.rs:299-570`); git shows 78 commits to the template since
2026-05-01 and 26 since 2026-08-01, the latest on 2026-09-21.

### The upgrade replaces whatever the person wrote

`ensure_initialized` (`companion/disk.rs:41-114`) seeds when absent (`:74-86`), and
otherwise, whenever the stored stamp is below the embedded one, copies the file to
`constitution.bak-<ts>.md` and overwrites it with the template, "only run upgrade
once per version bump regardless of what edits the user has made" (`:87-107`).
There is no fingerprint of the shipped text, so an untouched file and an amended
one are treated alike. The backup's result is discarded (`let _ = fs::copy(…)`,
`disk.rs:93`) and the overwrite runs anyway. The only record of an upgrade is a
`tracing::info!` (`disk.rs:100-106`); nothing in the frontend mentions a
constitution backup or upgrade. The feature README corrected its own earlier claim
that an upgraded install keeps its file (`docs/features/companion/README.md:825`)
and notes that "the `.bak-` files are never reaped (31 had accumulated before
anyone counted)" (`README.md:827`).

Against the technique's four mitigations: versioned, yes; recoverable, usually (the
backup is best-effort); loud, no (a log line); rare, no (66 versions). Each bump
sets the person's amendments aside, and because the grammar lives in the same file,
keeping the old file would leave the companion unable to emit the new ops, so a
keep-mine option would not work in this design. That is the case the layering rule
exists for: the op catalog would be assembled from the package, and the person's
file would hold only law.

### An amendment path through the build

Dev mode (debug builds, a header toggle) lets the companion propose `dev_improve`:
a coding CLI session "at the app's own source checkout" (`companion/dev_mode.rs:1-15`,
`repo_root` at `:20-30`). Frontend-flagged work runs in the main checkout, backend
work in a worktree applied later by `dev_merge`
(`commands/companion/approvals/approval_exec_dev.rs:855-914`), and the session runs
with `--dangerously-skip-permissions` inside a registered project (`:916-920`). The
task prompt (`dev_mode.rs:991` onward) scopes the change by instruction only;
nothing excludes `src-tauri/src/companion/templates/constitution.md`, the
`CONSTITUTION_VERSION` constant, or `disk.rs` from what the session may edit. A
template edit plus a version bump, merged and rebuilt, is delivered into the
person's `constitution.md` by the upgrade path above.

Both ops are declared approval-gated (`dispatcher/catalog.rs:177-178, 651-652`),
and the executor's comment says "Always click-approved (double policy: not on
AUTOAPPROVE_ALLOWLIST, and gated on dev mode + debug build here)"
(`approval_exec_dev.rs:861-862`). The allowlist was removed on 2026-08-10: under
autonomous mode every proposed action fires except the listed defer arms
(`approval_autopilot.rs:11-24, 76-102`), and neither `dev_improve` nor `dev_merge`
has one. The gate the comment describes exists only in manual mode.

### Where it falls short of the standard

- **Grammar in the law file**: this is the root. Every feature is a law bump, so
  the upgrade can never be rare. Seam to test the layering rule: assemble the op
  catalog from the package at prompt build time
  (`prompt/build.rs:123-125`) and leave `constitution.md` as law only.
- **No fingerprint rung**: an untouched file cannot be told from an amended one, so
  every install takes the backup-and-replace path.
- **A backup that may not exist** (`disk.rs:93`) and **a notice nobody sees**
  (`disk.rs:100-106`).
- **The upstream is writable by the companion** under dev mode, and under autonomous
  mode without a click; the code's own comments still describe a click gate.

### Applied 2026-09-23 - the upgrade ladder over git history and the install, read-only

57 constitution version bumps in 143 days. By a lexical test (an op line or a catalog op
name) 21 are grammar-only, 32 mixed and 4 law-only; reading the 4 by hand, 3 are feature
procedures, so at most 1 of 57 changed durable law. 20 template commits changed the text
without a bump and 17 of them changed op lines - grammar that reaches an existing install
only at the next bump, and would ship with the binary under layering. Person's file
rewritten per bump: 57 as built, at most 1 with the grammar out.

The floor refuted the landing's worst case *on this install*: 39 of 39 backups are
byte-identical to a shipped text, so no amendment was ever displaced - nothing had been
written, and the product has no in-product editor for the law. A fingerprint of the
shipped text would have made all 39 upgrades silent; 3 of them re-fired over text that was
already current (the stamp lives in the app database, the file in the home folder -
mechanism inferred). The backup's result is discarded; the failure path was never
observed. Both dev-mode ops fire under autonomy, so the law's source is writable without a
click. `better`. Return: rerun when an in-product law editor ships or any install shows
an amended file.
