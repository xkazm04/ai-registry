---
layer: application
type: application
subject: mcp-tools
technique: fluent-syntax-bounded-grammar
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@2026.08.31
---

# Two dozen correction layers: the grammar that grew (cass, a counter-example)

The tree is cass (coding_agent_session_search), a Rust CLI and MCP server that agents
call to search local coding-agent transcripts. Read at commit `7fc01958d367`. The
stack version is the toolchain pin (nightly 2026-08-31, written as a dotted date); the crate version is `Cargo.toml:3 "version"` (0.10.0); the toolchain is a
dated nightly pinned in `rust-toolchain.toml` with no release number. Nothing was
executed; the normalization pipeline was read through its documented table and the
code at the cited lines, not traced end to end.

The technique's notation is a command string a tool parses itself. cass's notation is
its own argv, which an agent writes as fluently as any shell command. The shell
question does not arise (the agent's harness has already split the words), so steps 2
and 3 of the technique are out of scope. Step 4 is the whole story: which spellings
beyond the canonical grammar does the parser admit, and why. cass's answer is the
opposite of the technique's, and the tree records what it cost.

## The position, stated by the tree

The README says the CLI normalizes aggressively to maximize acceptance when intent is
clear (`README.md:949 "aggressively normalizes input to maximize acceptance when intent is clear"`),
and lists twenty-three numbered layers. They include case and dash repair, snake-case
flag recovery, alias tables for most subcommands, moving misplaced flags, converting
named options into positionals, folding unquoted words into one query, typo correction
within edit distance two for both flags and subcommands
(`README.md:996 "within Levenshtein distance 2 of a known flag are corrected"`),
turning bare key-value words after a query into filter flags
(`README.md:1011 "Bare option pairs"`), and promoting a search to a different command
when pack-only flags appear
(`README.md:968 "Bare robot queries with pack-only flags become answer packs"`;
`README.md:969 "Explicit robot search with pack-only flags becomes an answer pack"`;
`src/lib.rs:5246 "pack-only flags imply answer-pack intent"`). The admitted fragment is
not a list with an operational reason per entry; it is a table of observed agent
mistakes, which is exactly the justification the technique rejects ("agents keep
trying it" is a reason for a clear error).

## The cost, recorded in the tree's own scars

The technique predicts that a parser admitting constructs because they seemed harmless
becomes a thing that runs what nobody wrote. The tree has three instances on record:

- Typo correction mapped a valid subcommand with a bad flag to a different subcommand:
  a status call with a misspelled flag ran a different, real command and exited 0 with
  only a stderr note (`src/lib.rs:6571 "with exit 0 and only a stderr"`). The fix: a
  word that already names a subcommand is never corrected.
- An ordinary English word within edit distance two of a side-effecting command
  executed it: a query word triggered the upgrade release check
  (`src/lib.rs:6713 "silently EXECUTED the upgrade"`), and another hard-failed on the
  destructive command's required argument instead of searching.
- The fix for that was a list of commands reachable only by exact spelling
  (`src/lib.rs:6564 "const SIDE_EFFECT_EXACT_ONLY_COMMANDS"`). That is a denylist over
  the correction net, the precise shape the technique calls an absent guard with extra
  steps: it protects the two commands someone thought of after an incident, and the
  next side-effecting command added to the canonical list is inside the net until
  someone remembers to add it here.

Some admitted rewrites still change which command runs by design: search becomes pack
when a pack-only flag is present. Others change what a query means: bare key-value words
after a query become filters, so a search for a literal phrase that happens to read as
a filter pair is silently a different search.

## One field name, two coordinate spaces

The correction tables encode a distinction no agent can infer from the name.
Flag spellings of line number (`--line-number`, `--line_number`, `line=`) address a raw
file line (`README.md:1013 "a raw file line"`), while the pasted search-hit spelling
`line_number=` addresses a canonical message ordinal
(`README.md:1014 "pasted from a search hit becomes"`;
`README.md:980 "selects canonical message 42, not raw line 42"`). The project split these
spaces after agents opened the wrong content, and the fix lives partly inside the
normalizer, so the meaning of a token now depends on whether it was written as a flag
or as an assignment.

The agent skill shipped at the repository root still teaches the refuted form. It says
to follow a hit with its source path and line number
(`SKILL.md:42 "using its exact source_path and line_number"`) and shows the raw-line
flag carrying the hit's value (`SKILL.md:43 "cass view /path/to/session.jsonl -n 42 -C 3"`);
it never mentions the message-index flag, and it claims verification against an older
release (`SKILL.md:32 "verified on cass 0.8.0"`) than the crate it ships beside. The
agent guide does the same (`docs/ROBOT_MODE.md:22 "View source"`). The reference
document forbids exactly that use
(`docs/reference/message-addressing.md:61 "Do not pass"`;
`docs/reference/message-addressing.md:62 "search's"`). A permissive grammar multiplies
the forms documentation has to keep current, and here the artifacts written for agents
drifted while the reference was corrected.

## The mitigations, and their reach

Every correction prints a teaching note on stderr so stdout stays data, and search with
metadata enabled echoes the effective interpretation, including the corrections
(`README.md:1020 "The same notes appear in search output under"`). Both are real and
both are partial. Notes are capped at two per invocation and printed only when the
command succeeds (`README.md:1020 "at most two: the normalization note and the typo-recovery note"`).
The structured echo exists on search with metadata; a correction that turned a search
into a pack, or rewrote a follow-up read, is reported only on stderr, which a caller
that parses stdout and the exit status never sees. The technique's failure-not-empty-success concern is met where
the echo exists and is unmet elsewhere.

## Does the tree support or refute the technique?

It supports it. The tree's experience is the technique's prediction played out over
time: an admitted fragment justified by agent habit, three recorded incidents where
correction ran something nobody typed, a per-incident denylist as the repair, and
documentation drift across the multiplied forms. The tree offers no counter-evidence:
it records no measurement of how many round trips the corrections saved, so the benefit
it trades against these costs is asserted, not shown. What it adds is a boundary the
technique does not draw: where the notation is the tool's own argv rather than a string
handed to it, the shell-authority hazard disappears and the remaining hazard is semantic
(which command runs, which coordinate a token names), and that hazard grows with every
admitted spelling whether or not any of them is dangerous alone.

## What the realization cannot do

- State its own grammar. There is no list of admitted spellings with an operational
  reason beside each; the README table records observed mistakes and their rewrites.
- Report a correction to a caller that reads only stdout and exit status, outside
  search with metadata.
- Keep a token's meaning independent of how it was spelled.
