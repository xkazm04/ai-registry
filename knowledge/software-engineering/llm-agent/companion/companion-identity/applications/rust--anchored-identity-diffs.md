---
layer: application
type: application
subject: companion-identity
technique: anchored-identity-diffs
stack: rust
status: forged
verified_on: 2026-09-23
verified_against: rust@1.96
---

# Anchored identity diffs in the Personas companion (Athena)

Personas ships a desktop companion, Athena, whose evolving self lives in a
markdown file at `~/.personas/companion-brain/identity.md` and is read into
**every** system prompt. The engine that changes it is
`src-tauri/src/companion/brain/identity.rs`, and its diff path is a close
realization of this technique. Its approval path is not, since 2026-08-10.

Re-read 2026-09-23 at personas `1b8161096`; the tree pins its toolchain in
`rust-toolchain.toml` (channel `1.96.1`, pinned since 2026-09-18) over a manifest
floor of `rust-version = "1.80.0"` (`src-tauri/Cargo.toml:218`). The witness is the
pinned toolchain.

## The closed grammar, in the type system

`DiffOp` (`identity.rs:25-32`) is exactly three variants — `AppendBullet`,
`ReplaceBullet`, `RemoveBullet` — and there is no fourth. The module header
(`identity.rs:1-12`) states the intent: the constitution "lives separately at
`companion-brain/constitution.md` and is never modified by the companion", while
the identity layer "grows by **anchored diffs**, never a whole-file rewrite". The
same header names the user's own BrainViewer edit as "the separate full-content
escape hatch — they are the editor of record".

`IdentityDiff` (`identity.rs:47-58`) carries `section` (a `"# heading / ##
heading"` path), the op, `anchor_text`, and `new_text`. Per-op field requirements
are enforced at parse time (`identity.rs:99-111`): append demands `new_text`,
replace demands both, remove demands the anchor.

## Both caps are present, and both are justified in comments

- `MAX_BULLET_CHARS = 280` (`identity.rs:62`) — "keeps the profile skimmable and
  blocks a diff that tries to paste a wall of text".
- `MAX_DIFFS_PER_OP = 5` (`identity.rs:65`) — "one approval card shouldn't carry
  an unreadable batch".

Over-length bullets are rejected in `require_new_text` (`identity.rs:143-152`),
asserted by `parse_requires_fields_per_op` (`identity.rs:366-383`).

## Content anchors, with an explicit refusal to guess

`section_range` (`identity.rs:167`) resolves the heading path; `apply_to`
(`identity.rs:225-230`) fails with "identity: section … does not exist" when it is
absent, so the section skeleton is human-authored and a diff cannot invent one.

`find_bullet` (`identity.rs:196-221`) prefers exact trimmed equality, then falls
back to a prefix match **only** when the remainder looks like a stored `(ep_xxxx)`
provenance suffix, and **only when exactly one bullet matches that way** —
otherwise it returns `None`: "Ambiguous — more than one bullet shares this anchor
as a prefix. Don't guess." (`identity.rs:211-213`). Covered by
`replace_matches_anchor_prefix` (`identity.rs:405-417`).

## Per-diff atomicity, with both lists returned

`apply_diffs_on_disk` (`identity.rs:317-354`) applies each diff independently,
collecting `applied` previews and `failed` reasons, and errors — writing nothing —
only when **no** diff applied (`identity.rs:331-336`). A timestamped backup name
(`make_backup_name`, `identity.rs:287-293`) is taken before the write and
`bump_updated` (`identity.rs:272`) stamps the frontmatter.

## The approval envelope, when a human resolves it

Synthesised proposals become a pending `companion_approval` row of action
`update_identity` carrying the raw diffs plus a batch rationale
(`insert_identity_approval`, `brain/profile_synthesis.rs:356-381`); chat-proposed
ones pass the dispatcher, which structurally validates a `diffs` batch before it
becomes a card (`companion/dispatcher/dispatch.rs:2354-2376`). The card shows a
before→after line per diff (`IdentityDiff::preview`, `identity.rs:120-140`).

## Where it falls short of the standard

**A whole-document form rides the same op, reachable after day one.**
`execute_update_identity` (`src-tauri/src/commands/companion/approvals/approval_exec_core.rs:145-212`)
has two modes: anchored `diffs`, and `content`, "a full identity.md replacement.
The intake interview's first-draft path (nothing exists yet to diff against)"
(`:145-151`), which calls `identity::write_full` (`:195-213`). Nothing checks that
precondition. The dispatcher's comment says it outright: "`content`-mode (intake
first draft) is unchecked" (`dispatch.rs:2354-2357`); the shipped constitution
teaches the `content` OP line to every chat turn (`templates/constitution.md:261`)
and tells the companion to use it on a later "update what you know about me" when
"it's still all placeholders" (`constitution.md:450-455`), a judgment
the model makes and the executor never re-checks. The technique's bootstrap rule
(a separate operation whose precondition is re-checked at write time) is the gap.

**Autonomous mode resolves it with no human.** Since 2026-08-10 the autopilot has
no per-action allowlist: "under autonomous mode EVERY proposed action now fires"
(`approval_autopilot.rs:11-24`), and the turn loop calls it for every new approval
(`companion/session/turn.rs:736-750`). Its defer arms cover browser writes,
`reconnect_credential`, `remote_instruct` and the fleet actions
(`approval_autopilot.rs:76-102`, `:129` onward); `update_identity` is not among them. So
under autonomous mode a chat-proposed identity change, in either mode, is applied
before the approvals event is emitted, and a turn that read a web page or a
connector result can rewrite the file read into every future prompt with no card
ever drawn. The law text still says the op is "always approval-gated, never
auto-fires" (`constitution.md:429-430`); the feature README records the change
("since 2026-08-10 autonomous mode fires it like everything else",
`docs/features/companion/README.md:599`). The companion's own law is therefore
wrong about its own gate. Profile-synthesis proposals are not affected: they are
inserted headlessly and never pass the turn loop's autopilot call.

**The failed list is not surfaced.** The executor traces `applied`/`skipped` at
debug level and returns "Updated what I know about you." regardless
(`approval_exec_core.rs:180-191`), so a half-applied batch reads as a whole one to
the person, and a stale anchor is indistinguishable from success unless *every*
diff failed.

**The per-diff reason stops at the approval row.** The prompt requires a per-diff
`rationale` (`profile_synthesis.rs:309`) and the raw diffs, rationale included,
travel in the approval row's params (`profile_synthesis.rs:362-367`), but
`IdentityDiff::from_json` (`identity.rs:71-118`) never reads it, so it reaches
neither the card's preview nor the document. The per-claim motivation survives only
by convention, as the statistic the prompt asks each bullet to end with
(`profile_synthesis.rs:298`).

**The diff path's backup is best-effort.** `apply_diffs_on_disk` ignores a failed
copy (`let _ = std::fs::copy(…)`, `identity.rs:340-345`) and writes anyway;
`write_full` propagates the same failure (`identity.rs:298-311`).

**A stale anchor is not distinguished from a rejected one.** `apply_to` returns
`AppError::Validation` for "section does not exist" and "bullet not found" alike
(`identity.rs:227-230, 248-252, 258-262`), with no re-derivation path.
