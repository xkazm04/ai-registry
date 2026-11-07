---
layer: application
type: application
subject: error-handling
technique: consumer-decides-error-shape
stack: rust
status: forged
verified_on: 2026-11-06
verified_against: rust@1.99
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Rust: four trees, four readers of an error, and a quoted word that picks the guidance

The version is the compiler this probe ran on, rustc 1.99.1. Four trees by four authors were read at pinned commits and none was
run. `leodearden/reify` is AGPL-3.0 and `Phixsura/orthic-mono` is BSL-1.1, so those two get line references and our words.
`teamleaderleo/glaeda` and `vercel-labs/agent-browser` are Apache-2.0.

| Tree | Who reads | Whose text it quotes | Default |
| --- | --- | --- | --- |
| glaeda `1feddaa1` | an archive of public records | hostile | closed code and compile-time text, `src/disposable_clone_runtime.rs:182 "code: &'static str,"`, with the reason at `src/disposable_service_failure_receipt.rs:31 "Requiring `&'static str` preserves the existing disposable-service error boundary"` |
| orthic-mono `24665cd7` | a live caller fixing its request | mostly its own | a code and runtime text; a guide recommends context in messages (`docs/design/error-handling.md:274`), and a later review fixed a leak (`.code-reviews/2026-01-19_001/SUMMARY.md:68`) |
| reify `8d65e1b0` | an author reading a diagnostic | their own source | an optional typed code beside text (`crates/reify-core/src/diagnostics.rs:4953`) |
| agent-browser `71850a02` | a model, a wrapper, and the tool's own code | its selector and a hostile page | text with the next command, and a code derived from that text, `cli/src/native/actions.rs:15029 "if error.starts_with(super::browser::TAB_GONE_PREFIX) {"` |

The last row is the one that pays. The door's own comment says the code exists so scripts need not parse the message,
`cli/src/native/actions.rs:15027 "Machine-readable code for "the bound tab no longer exists" so scripts"`, and the code is read from
the message's prefix one line later.

## The rewriter, re-run

The tool's rewriter was copied unchanged into a scratch program outside its tree. It is already careful: a guard runs first for a
locator miss, because that message echoes the selector, `cli/src/native/browser.rs:239 "Classify a genuine locator miss first"`, and
patterns are ordered. Page text reaches it through a prefix, `cli/src/native/browser.rs:1574 "Evaluation error: {}"`.

| Message | Guidance |
| --- | --- |
| `Evaluation error: ReferenceError: interceptor is not defined` | Another element is covering the target |
| `Evaluation error: TypeError: setTimeout is not a constructor` | Operation timed out |
| navigation error for a URL with `timeout` in its path | Operation timed out |
| `No element found: role=button name="intercept"` | correct, the anchored guard caught it |
| a real interception message | correct, the control |

So a pattern set that is specific-before-general and keyed on class markers still misroutes once the message quotes foreign text. The
anchored guard is the one that held, which is the rule the amendment states. Whether a user reaches this path was read, not run.

## The seam, chosen to falsify

A connected project classifies failures by substring over a message that can carry a child process's stderr, per its own comment on
what lands inside its failure template. Its ladder's first tests include a bare status number. A clean outcome would have said the
risk is theoretical. Its source's ladder was transliterated by script into a scratch harness, and no product code ran.

| Input set | Arm A, as written | Arm B, status numbers anchored as tokens |
| --- | --- | --- |
| Floor: the file's own 42 parity fixtures | 42 of 42 | 42 of 42 |
| 5 messages with a number inside a longer token (a line, a file count, a model date) | 5 routed to a category, including rate limit and credential | 0 routed |
| 3 messages with a class word inside a test name | 3 routed | 3 routed |

The five target messages were written for this probe in the shape the template holds. They are not drawn from its data.

## Verdict

`better` on the stated target, with the floor held, for number tokens only. The three word cases did not move, and anchoring cannot move
them: the substring test still reads the quote. That needs the classification to happen before the quote is added, a larger change that
was not tried. Proposed to the project, nothing changed there, and which callers pass quoted stderr was not traced beyond that comment.

## What this realization cannot do

It says nothing of how often this misroutes in use, which needs the project's own failure history. And glaeda's price is unmeasured: its
tree records no diagnosis cost for the causes it discards.
