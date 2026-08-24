---
layer: application
type: application
subject: companion-identity
technique: anchored-identity-diffs
stack: rust
status: forged
verified_on: 2026-08-23
---

# Anchored identity diffs in the Personas companion (Athena)

Personas ships a desktop companion, Athena, whose evolving self lives in a
markdown file at `~/.personas/companion-brain/identity.md` and is read into
**every** system prompt (`docs/features/companion/README.md:542-546`). The engine
that changes it is `src-tauri/src/companion/brain/identity.rs`, and it is a
close realization of this technique.

## The closed grammar, in the type system

`DiffOp` (`identity.rs:24-31`) is exactly three variants — `AppendBullet`,
`ReplaceBullet`, `RemoveBullet` — and there is no fourth. The module header
(`identity.rs:1-12`) states the intent plainly: the constitution "lives
separately at `companion-brain/constitution.md` and is never modified by the
companion", while the identity layer "grows by **anchored diffs**, never a
whole-file rewrite … Targeted edits keep the rest of the profile intact and make
every change reviewable per-claim."

`IdentityDiff` (`identity.rs:46-57`) carries `section` (a `"# heading / ##
heading"` path), the op, `anchor_text`, and `new_text`. Per-op field
requirements are enforced at parse time (`identity.rs:99-110`): append demands
`new_text`, replace demands both, remove demands the anchor.

## Both caps are present, and both are justified in comments

- `MAX_BULLET_CHARS = 280` (`identity.rs:61`) — "keeps the profile skimmable and
  blocks a diff that tries to paste a wall of text", i.e. the anti-rewrite cap.
- `MAX_DIFFS_PER_OP = 5` (`identity.rs:64`) — "one approval card shouldn't carry
  an unreadable batch", i.e. the reviewer cap.

Over-length bullets are rejected during parse (`identity.rs:142-152`), which is
asserted by `parse_requires_fields_per_op` (`identity.rs:377-381`).

## Content anchors, with an explicit refusal to guess

`section_range` (`identity.rs:166-187`) resolves the heading path and returns
`None` when the section is absent; `apply_to` then fails with
`AppError::Validation("identity: section … does not exist")`
(`identity.rs:225-230`). The section skeleton is therefore human-authored and a
diff cannot invent one.

`find_bullet` (`identity.rs:195-220`) prefers exact trimmed equality, then falls
back to a prefix match **only** when the remainder looks like a stored
`(ep_xxxx)` provenance suffix, and **only when exactly one bullet matches that
way** — otherwise it returns `None` with the comment "Ambiguous — more than one
bullet shares this anchor as a prefix. Don't guess." (`identity.rs:209-212`).
That is the technique's ambiguity rule implemented rather than assumed. The
prefix tolerance itself is what lets a proposal cite a bullet without
reproducing the episode ids appended to it, and is covered by
`replace_matches_anchor_prefix` (`identity.rs:404-416`).

## Per-diff atomicity, with both lists returned

`apply_diffs_on_disk` (`identity.rs:316-353`) applies each diff independently,
collecting `applied` previews and `failed` reasons, and returns both alongside
the backup name. It errors — writing nothing — only when **no** diff applied
(`identity.rs:331-336`), which is exactly the "zero applied is a failure, not a
quiet no-op" rule. A timestamped backup is taken before the write
(`identity.rs:286-292, 338-345`), and `bump_updated` (`identity.rs:271-278`)
stamps the frontmatter.

## The enumerable writers

Three paths reach the file and the module names all of them. The diff door
above; `write_full` (`identity.rs:297-310`) for the intake interview's first
draft and for the user's own direct edit through the Brain Viewer — the header
calls the user "the editor of record" (`identity.rs:10-12`); and the portability
importer, which is documented as replacing `identity.md` through *the same*
timestamped backup path the diff op uses
(`docs/features/companion/README.md:536`).

The approval envelope is a pending `companion_approval` row of action
`update_identity` carrying the diffs plus a rationale
(`brain/profile_synthesis.rs:344-369`), surfaced as a card with a
human-readable before→after line per diff (`identity.rs:120-139`).

## Where it falls short of the standard

**The per-diff reason is parsed away.** The prompt requires every proposed diff
to carry a `rationale` field (`profile_synthesis.rs:297`) and the module's own
test fixture supplies one (`identity.rs:373`), but `IdentityDiff::from_json`
(`identity.rs:70-117`) never reads it. Only the batch-level rationale on the
approval row survives (`profile_synthesis.rs:352-355`). The per-claim
motivation is preserved only by convention — the prompt instructs the model to
end each bullet with the statistic that justified it
(`profile_synthesis.rs:286`) — so it lives inside the prose rather than as a
field anything can check.

**A stale anchor is not distinguished from a rejected one.** `apply_to` returns
`AppError::Validation` for "section does not exist" and for "bullet not found"
alike (`identity.rs:225-230, 247-252, 257-262`), so the caller cannot tell a
malformed proposal from one that raced a concurrent edit, and there is no
re-derivation path — the failure is reported to the human and the proposal is
dropped.
