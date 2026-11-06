---
layer: application
type: application
subject: agent-runtime-assembly
technique: rewriting-under-a-foreign-gate
stack: rust
status: forged
verified_on: 2026-11-06
verified_against: rust@1.91
---

# A wrapper that reads its host's rules before it changes the command

The tree is rtk, an open-source command proxy installed as a pre-tool hook in
coding-agent hosts, where it prefixes the agent's shell commands with its own
name so their output can be compressed. First read at commit `f53e6033` and re-pinned at `1cf7bc70` on its
default branch, where every citation below was re-opened; every manifest declares `rust-version = "1.91"`. Its changelog
carries about 25 fixes in which a rewrite and a host's allow, deny or ask rules
interacted badly, which is the history this technique is written from. Nothing
here was run; every claim is read from the code and its tests.

## The order of the decision

The decision function states its gate order as load-bearing. A deny comes
first and suppresses the rewrite,
`src/hooks/decision.rs:160 "Deny wins outright."`, and the host's script then
passes the original command through so the host's own rule fires on the words
it was written for,
`hooks/claude/rtk-rewrite.sh:73 "Deny rule matched"`. Commands the permission
splitter cannot take apart are not rewritten at all,
`src/hooks/decision.rs:173 "Unattestable constructs are refused."`, and the
comment beneath it says why refusing beats forcing a prompt. The no-match
verdict may never become an approval, with the incident that taught it,
`src/hooks/decision.rs:185 "that would auto-approve every rewritable command on a"`;
the changelog records the same turn as a security fix,
`CHANGELOG.md:814 "default to ask when no permission rule matches"`. A script
handed to a nested shell caps at a prompt,
`src/hooks/permissions.rs:401 "RTK must never turn that into auto-approval."`.

The permission splitter is the strictest of three on purpose, and its doc
comment carries a table comparing it with the analytics and rewrite splitters,
`src/discover/lexer.rs:849 "deliberately the most paranoid of the three compound-command"`.

## Where the copy of the policy is thinner than the policy

The rules are read from four settings files. A file that exists and cannot be read now fails closed,
`src/hooks/permissions.rs:414 "or parsed may hold deny rules that can no longer be applied, so it fails"`,
and the source names what never reaches it,
`src/hooks/permissions.rs:133 "see, not all of Claude Code's: `--settings`, `--disallowedTools`, managed"`.
The managed tier is not among the four. For hosts whose rule format the tool
does not read, the copy is empty by design,
`src/hooks/permissions.rs:226 "Hosts with no RTK-side rule source."`, which
correctly yields no approval rather than a borrowed one - but a deny the host
enforces from an unread source is, after the rewrite re-keys the command, a
deny that no longer matches. The technique's rule is to withhold approval when
a source went unread. The tree now withholds approval when a file went unparsed, and cannot withhold it for a source that never reaches the hook.

The second reader the rewrite blinds is conceded in a comment on one host's
path, `src/hooks/hook_cmd.rs:1034 "obscure classifier signals"`: that host's
safe and dangerous command classifiers do not look through the wrapper, so a
wrapped mutating command loses its classification signal.

## A failed rewrite looks like no rewrite

The host-side script runs the rewriter with its errors discarded,
`hooks/claude/rtk-rewrite.sh:59 "rtk rewrite"`, and maps every exit code it
does not recognise to a silent pass-through. "The rewriter failed" and "there
was nothing to rewrite" therefore reach the operator identically - the sibling
technique's loudness rule, unmet at the one boundary where the rewriter cannot
report for itself.

## What this realization cannot do

It cannot see rules it did not read, and it cannot make the host's classifier
look through it. What it does hold - deny first, no approval from no-match,
no rewrite of what it cannot decompose - is enforced in one function every host
path calls, with the incidents that taught each rule written beside it.
