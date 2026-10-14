---
layer: application
type: application
subject: agent-runtime-assembly
technique: rewriting-under-a-foreign-gate
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.91
---

# A wrapper that reads its host's rules before it changes the command

The tree is rtk, an open-source command proxy installed as a pre-tool hook in
coding-agent hosts, where it prefixes the agent's shell commands with its own
name so their output can be compressed. Read at commit `f53e6033` on its
default branch; every manifest declares `rust-version = "1.91"`. Its changelog
carries about 25 fixes in which a rewrite and a host's allow, deny or ask rules
interacted badly, which is the history this technique is written from. Nothing
here was run; every claim is read from the code and its tests.

## The order of the decision

The decision function states its gate order as load-bearing. A deny comes
first and suppresses the rewrite,
`src/hooks/decision.rs:124 "Deny wins outright."`, and the host's script then
passes the original command through so the host's own rule fires on the words
it was written for,
`hooks/claude/rtk-rewrite.sh:73 "Deny rule matched"`. Commands the permission
splitter cannot take apart are not rewritten at all,
`src/hooks/decision.rs:127 "Unattestable constructs are refused."`, and the
comment beneath it says why refusing beats forcing a prompt. The no-match
verdict may never become an approval, with the incident that taught it,
`src/hooks/decision.rs:139 "that would auto-approve every rewritable command on a"`;
the changelog records the same turn as a security fix,
`CHANGELOG.md:814 "default to ask when no permission rule matches"`. A script
handed to a nested shell caps at a prompt,
`src/hooks/permissions.rs:241 "RTK must never turn that into auto-approval."`.

The permission splitter is the strictest of three on purpose, and its doc
comment carries a table comparing it with the analytics and rewrite splitters,
`src/discover/lexer.rs:662 "deliberately the most paranoid of the three compound-command"`.

## Where the copy of the policy is thinner than the policy

The rules are read from four settings files, and the loader's own contract
says what happens to the rest,
`src/hooks/permissions.rs:253 "Missing files and malformed JSON are silently skipped."`.
The managed tier is not among the four. For hosts whose rule format the tool
does not read, the copy is empty by design,
`src/hooks/permissions.rs:86 "Hosts with no RTK-side rule source."`, which
correctly yields no approval rather than a borrowed one - but a deny the host
enforces from an unread source is, after the rewrite re-keys the command, a
deny that no longer matches. The technique's rule is to withhold approval when
a source went unread; this tree withholds it only when no source was read.

The second reader the rewrite blinds is conceded in a comment on one host's
path, `src/hooks/hook_cmd.rs:997 "obscure classifier signals"`: that host's
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
