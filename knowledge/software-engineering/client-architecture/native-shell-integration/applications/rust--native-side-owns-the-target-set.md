---
layer: application
type: application
subject: native-shell-integration
technique: native-side-owns-the-target-set
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@2021
---

# One command that owns its target set, four that do not, in LightC

Witness: the `light-c` desktop cleaner at commit
`15dc1af9cdc68c4d182f785b47df5a7f61e0c029`; version witness
`src-tauri/Cargo.toml` `edition = "2021"`. A Windows disk cleaner whose whole
job is deleting things the presentation layer selected, which makes every
delete command a boundary crossing. The tree contains the technique done well
once and the same decision made weaker four other ways, in one directory.

## The command that gets it right

`src-tauri/src/commands/delete.rs:94` "后端再次校验路径规则，避免前端被篡改后删除任意文件"
states the rule in the author's own words, and `src-tauri/src/commands/delete.rs:131`
"!deep_junk::is_deep_junk_path(path)" enforces it: every path is tested against
a positive category matcher before any is deleted, and a single miss refuses the
whole batch. The same command takes `scan_id` and category names, and
`src-tauri/src/scanner/deep_junk.rs:314` "pub fn get_paths_for_categories"
restores the full category from the native session rather than trusting the
page the user was looking at. Expiry is handled by the posture the technique
asks for: `src-tauri/src/commands/delete.rs:118` "degraded_warning = Some(error)" degrades to the
current-page list and returns the warning in the result.

## The four that take a bare path list

`src-tauri/src/commands/delete.rs:46` "pub async fn delete_files(request: DeleteRequest)" accepts
`Vec<String>` and passes it to the engine. Its gate is a deny-list:
`src-tauri/src/cleaner/delete_engine.rs:261`
"let path_str = path.to_string_lossy().to_lowercase();" lowercases the string
and runs `starts_with` over `PROTECTED_PATH_PREFIXES`, whose entries are all
backslash spellings. Read from the code, not executed (the crate builds for
Windows only): a forward-slash spelling of a protected location does not match
those prefixes, and neither does a path carrying dot segments. The sibling
function that decides ownership-taking (`src-tauri/src/cleaner/enhanced_delete.rs:951`
"path_string.replace('/'") does normalise separators, so the tree already
knows the rule and applies it to one check and not to the other.

## The layer that logs and proceeds

`src-tauri/src/cleaner/delete_engine.rs:147` "if !self.is_in_allowed_scope(file_path)" is the
second of the engine's stated safety layers. Its body is one line,
`src-tauri/src/cleaner/delete_engine.rs:148` "路径不在允许删除范围内", and it is a `warn!`; control
falls through to the delete. The allow-list is a complete function with its own
scope table, and it refuses nothing. This is rule three: the layer is counted in
the comment above it ("check 2") and contributes nothing to the outcome.

## The manifest and the shell string

`src-tauri/capabilities/default.json:8` "opener:default" sits among a
dozen window-control permissions: the file is a careful statement about window
size and dragging. The product's own surface is the `invoke_handler` list in
`src-tauri/src/lib.rs`, roughly a hundred commands, none declared in
`src-tauri/build.rs:2` "tauri_build::build()" (no per-command manifest), and
`src-tauri/tauri.conf.json:27` "csp" sets no content policy. Of those
commands, `src-tauri/src/commands/tools.rs:90`
"start" builds a quoted string from the
caller's path and hands it to `cmd`: rule five, from the argument the
presentation layer chose.

## What the tree can and cannot show

It shows the same author applying rule one and rule two to the newest and
highest-risk command and not retrofitting the older ones. It also shows the
cost model: the rule-one command needs a session store with a time limit, and
the author paid for that (an expiry error path, a degraded mode, a warning
field) because the page-at-a-time listing forced it. The older commands avoided
the cost by never needing the handle.

It cannot show exploitability. The presentation layer here renders local
bundled assets and no remote content, so the practical route to a hostile caller
is an injected script, which the code comment at `src-tauri/src/commands/delete.rs:94` treats as the
threat. No test in the tree exercises an alternate path spelling against the
protected list; the unit tests feed canonical backslash paths only
(`src-tauri/src/cleaner/delete_engine.rs:382` "test.dll"), so a normalisation gap would not fail any of them.
