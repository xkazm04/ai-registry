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
