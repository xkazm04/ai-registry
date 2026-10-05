---
layer: application
type: application
subject: untrusted-extension-host
technique: derived-capability-inventory
stack: claude-code
status: forged
verified_on: 2026-10-05
verified_against: claude-code@2.1.289
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A plugin validator that refuses what it cannot read

Claude Code's function-hook plugins ("mods") run their hooks module inside the
CLI. The version witness is `claude --version`, which printed `2.1.289 (Claude
Code)` on the day every result below was produced, and the authoring skill that
shipped with that build was read in the same session. A second-hand review
(`youtube:XaYubuLtW8M`) said `claude plugin validate` "lists every event that the
mod listens to, and every call it makes", and told viewers to check that list for
network calls before installing someone else's mod. The first half of that advice
is right, for reasons the review does not give. The second half asks the wrong
question.

## What the build says about itself

The authoring reference shipped with the build says the hooks module "runs in an
environment of its own, with no DOM and no Node: `$` reaches everything outside
it". It describes `claude plugin validate <path>` as reading "a plugin's manifest
and its hooks module's source" and reporting "what the module hooks and calls".
It presents that as an authoring check ("the quickest check that the engine sees
what you meant"), not as a security audit.

The build's API declaration describes two capabilities, and the difference
between them is the whole finding:

- `$.http.fetch` fetches "through the host (never the plugin's own network)",
  "unless the organization's web-fetch policy refuses it".
- `$.process.run` runs "a command on the host by its argument vector", "as the
  user the session runs as", and "Local execution, not a network path: what a
  command of its own reaches is its own, as for the Bash tool and a settings
  `command` hook."

## The probes: is the list total?

Thirteen scratch plugins were validated, each doing one network fetch or process
run in a different spelling. One literal module and one empty module served as
positive and negative controls.

| Spelling | `validate` |
| --- | --- |
| empty module (negative control) | passes, `calls: nothing on $` |
| `$.http.fetch(...)`, `$.process.run(...)` literally (positive control) | passes, lists both |
| hook parameter renamed (`eng.http.fetch`) | passes, still reported as `$.http.fetch` |
| `$` passed to a top-level function in the same file | passes, reported as `$.http.fetch (via go)` |
| `const h = $.http` | refused: "is used as a value (a noun of $ bound, passed or read)" |
| `$[n][m](...)` | refused: "a computed or optional member access on $" |
| `Reflect.get($, 'http')` | refused: "$ itself is passed as an argument" |
| `new Function(...)` handed `$` | refused: "$ is passed to "f", which is not a function declared at the top of this file" |
| `[$]` | refused: "$ itself is put in an array" |
| `{ ...$ }` | refused: "$ itself is spread" |
| `await import('node:child_process')` | refused: "a dynamic import()", in a hooks module and in a test file alike |
| `globalThis.fetch(...)` | passes, `calls: nothing on $` (see the next probe) |

Through the build's own test kit, the global object carried no `fetch`,
`XMLHttpRequest`, `WebSocket`, `require` or `process`. `new Function('return
1+1')` threw "Code generation from strings disallowed for this context". The
vendor says the kit runs tests "in an environment like the one a plugin's hooks
run in", so this measures the kit's environment and only by that statement the
live one. The `globalThis.fetch` row reports nothing because nothing is there to
call.

So all three conditions in the technique hold on this build: no ambient reach,
the interface spelled literally at every call site, and refusal by the same
reader the loader uses. The review's claim survived the seam picked to falsify
it.

## The real artifacts: read by the strongest grant

The three plugins this operator runs every day were validated as they stand:

- **a shell guard**: hooks `tool.call{tool=Bash}`; calls `$.fs.read`, `$.fs.stat`,
  `$.session.cwd`, `$.ui.status`
- **a cache clock**: calls clock, command, session usage and compaction, state and
  UI methods; no file, network or process call
- **a run-board band**: calls `$.fs.exists`, `$.fs.list`, `$.fs.read`,
  **`$.process.run`**, plus clock, command, state and UI methods; **no `$.http`**

The review's audit question ("if a mod you don't know is making network calls,
you want to know why") clears the third one. By the build's own description of
`$.process.run`, it is the only one of the three holding the session user's full
authority, and the organization's web-fetch policy does not bind it. Its single
spawn was `git rev-parse --git-common-dir`, which is harmless, but the inventory
cannot say so, because it does not carry argument vectors.

## The A/B

- **A**: the band as it stood, with the common git directory resolved by spawning
  `git rev-parse --git-common-dir`.
- **B**: the same directory resolved through `$.fs` alone. Walk up to `.git`; if
  it is a file, follow its `gitdir:` line, then that directory's `commondir`.
- **Target**: the strongest grant in the derived inventory. A listed
  `$.process.run`; B lists `$.fs.read, $.fs.stat (via gitCommonDir)` and no
  process call.
- **Floor**: the resolved directory must equal git's own answer. B's function
  body, run under Node with a `$` shim over the real filesystem, agreed with `git
  rev-parse` in **6 of 6** locations: a primary checkout, a subdirectory of it,
  two linked worktrees, a second repository, and a directory outside any
  repository, where both answered "none". The plugin's existing tests stayed
  green (2 of 2).

B was applied to the running plugin, and the live folder re-validated with no
process call.

## What this realization cannot do

- **The inventory carries no arguments.** `$.http.fetch` is listed without its
  hosts, and `$.process.run` without its argv. A reader still has to open the
  code to learn where a fetch goes. The inventory says which doors exist, not who
  walks through them.
- **The kit cannot measure a brokered rewrite's floor.** Under `claude plugin
  test` the `$` it hands a test has no filesystem (`$.fs` is undefined there).
  The floor above was measured outside the kit, over the same function body.
- **Nothing ranks the list.** `validate` prints the calls alphabetically, with
  `$.process.run` among clock and state methods. The ranking the technique asks
  for is still the reader's job on this build.
