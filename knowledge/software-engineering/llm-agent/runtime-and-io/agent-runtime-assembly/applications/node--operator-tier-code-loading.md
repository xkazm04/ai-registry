---
layer: application
type: application
subject: agent-runtime-assembly
technique: operator-tier-code-loading
stack: node
status: forged
verified_on: 2026-09-04
proof: structural-only
---

# A repository file names a command, a hook runs it, and a trust store sits between

Re-read 2026-09-04 from a fresh clone at the pinned commit `0d1bd561`. The
gate itself is a bash script and every citation below resolves in it. The
runtime witness was withdrawn rather than bumped: the tree declares
`engines.bun >= 1.0.0` in its `package.json`, pins bun 1.3.13 in its
evaluation workflows, runs its own tests with bun, and carries no `.nvmrc`,
no node `engines` entry and no `setup-node` step anywhere. The `node@22`
previously recorded here had no witness in the tree, and the registry's
stack vocabulary has no entry for the runtime the tree actually pins, so
this document carries no `verified_against` until it does. The stack label
stays `node` because that is the ecosystem the document classifies under.

gstack's verify gate (`bin/gstack-verify-gate`) is a Stop hook: it blocks the
agent's turn from ending until the project's declared verification command
passes. The command is declared in the repository's own instruction file on
one line. This application records how the tree handles the tier problem the
technique names — a repository-writable file naming code that a hook will
execute with the process's privileges.

## The tier problem, in the script's own words

"Trust boundary: hooks bypass the permission system, so a declared command
NEVER runs until the user records it in the per-repo trust store." The store
maps the repository root (symlink-stable, `pwd -P`) to a SHA-256 of the
command, is written atomically at mode 0600, and **any edit to the declared
command invalidates trust** until the operator runs `--trust` again from
inside the repository. Absence fails open at every level: no instruction
file, no declaration, empty value, or an untrusted command all allow the
turn to end with a one-line reason. Every grant is appended to a 0600
forensic log with timestamp, root, hash, the command verbatim, and whether
a terminal was attached.

Read against the technique's table: the instruction file is
service-writable in the relevant sense — any contributor, and any agent,
can edit it — so under the technique it "may never name code". The tree
does not forbid the naming; it inserts an operator act between the naming
and the execution, keyed to the command's content, so the file can propose
and only the operator can enable. That is the technique's rule reached by a
different door: the startup tier here is the trust store, and the
repository file is demoted to a proposal.

## Where the tree admits the gap

The script's comment on the forensic log: "`--trust` stays agent-runnable
(guardrail posture: catch accidents, not determined actors — same as the
redaction guard), but a grant is never invisible." An agent that can run
shell commands can therefore grant trust to a command it just wrote into the
instruction file. The `tty` field in the grant log is the tell — a grant
with no terminal attached is a grant the operator did not type — and the
design accepts that the log, not the store, is where a determined actor is
caught. The technique would call this an intercepting hook with an
observational safeguard; the tree calls it a guardrail and says so.

## What the structure proves

Nobody designed the fail-open ladder as a statement about the technique, but
it is one: every absence resolves to *allow*, so the gate can only ever
refuse on a command the operator explicitly trusted, and a broken store
cannot lock an operator out of ending a turn. That is the technique's
"optional by default" load rule applied to a hook rather than an extension,
and it falls out of treating the store as the only source of *yes*.
