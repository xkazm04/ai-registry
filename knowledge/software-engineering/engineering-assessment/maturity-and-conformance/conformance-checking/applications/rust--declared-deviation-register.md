---
layer: application
type: application
subject: conformance-checking
technique: declared-deviation-register
stack: rust
status: forged
verified_on: 2026-08-31
verified_against: rust@1.80.0
applied: simulation
ab_verdict: better
proof: structural-only
---

# A protocol server that claims a standard and drops a clause (Rust, stdio transport)

Read-only against the tree at `e7fbae7bb`. The population is every site in the
Rust and TypeScript sources that makes a **behavioural** conformance claim to an
external specification — eight of them, once the ~200 incidental references to
timestamp and address-range formats are excluded, since citing a date format is
not a claim about behaviour.

**Sites carrying a declared deviation: 1 of 8. Sites reachable by enumeration
rather than by reading implementation code: 0 of 8.** There is no register in
this repository, in any form, in any surface.

## The one entry that exists, and the three fields it is missing

At `variableSanitizer.ts:25`, one line above the pattern it governs:

```
/** Email: basic RFC 5322 pattern -- intentionally simple to avoid ReDoS */
```

This is a real declared deviation and a good decision — the upstream grammar is
famously both too permissive and too intricate to match safely, and the compact
pattern is the right call. Graded against the technique's four fields it scores
**two**: the document is named, the motivation is named and is stated as a cost.
The clause is absent, so a reader holding the specification does not know which
production is being narrowed. The version is absent, which matters more than it
looks: the deviation is from a revision, and "we differ from the address
standard" is not a statement that can be re-checked when the standard revises.

It is also, as written, invisible. It is a doc comment on a constant in a
sanitizer module. Nobody auditing what this artifact does and does not implement
will find it, and nobody has to be careless to miss it.

## The structural fact: a claim with a clause silently missing

The strongest evidence here is the site that carries **no** marking at all.
`mcp_server/mod.rs` opens with a plain conformance claim:

> Implements JSON-RPC 2.0 with MCP protocol methods

The entry point is `handle_jsonrpc(line, pool, auth_token)`. It takes one line,
deserializes it, reads `.get("method")`, dispatches, and returns at most one
response. The driver at `mcp_bin.rs:107` is `for line in stdin.lock().lines()`.
Across both files there is no `as_array`, no `is_array`, no `Value::Array` — no
batch path of any kind.

Section 6 of the cited specification requires a server to accept an array of
request objects and answer with an array of responses. This server, handed one,
parses it successfully into an array value, finds no `method` member on it,
falls through to the default arm, and returns a single error response with a
null identifier. That is not the specified behaviour and it is not an
approximation of it.

The deviation is very probably correct. A line-delimited transport makes
batching awkward, the protocol layered on top has been moving away from it, and
no client in this deployment sends batches. **That is exactly why it needs an
entry.** As the tree stands, a maintainer reading `handle_jsonrpc` has no way to
tell whether batching is absent because somebody decided it should be or because
nobody got to it — and the two conclusions lead to opposite actions. The first
costs a sentence; the second costs an implementation of a clause the ecosystem
is retiring.

Nobody designed this. It fell out of a single-line stdio loop written to the
transport rather than to the document, and it is the kind of fact the technique
predicts: a conformance claim with no exception list is a claim nobody has
audited, and the audit finds something on the first look.

## Two more sites the register would have to classify — and one it must refuse

The population is small enough to walk, and walking it is where the technique's
boundary earns its place:

- `api_proxy.rs:582` validates header names against §3.2.6 token syntax and
  quotes the rule back to the user in the rejection message. This is
  conformance, cited at clause level, with the check and the citation adjacent.
  Not an entry; it is the good case, and the register's existence would not
  change it.
- `ipc_auth.rs:379` marks an operation that clears the login-flow nonce
  described by §10.12 of an authorization framework, with three lines arguing
  that the resulting behaviour is a denial of login and not a bypass. This
  reads like a deviation and is not one — the framework is silent on who may
  discard a pending nonce. It belongs in the register's **rejected candidates**,
  because the argument is good and will otherwise be reconstructed by the next
  person who reads that line.
- `gitlab/converter.rs:264` chooses a fence longer than the specification
  requires, and says so. Being stricter where the upstream permits latitude is
  a profile choice, and the technique excludes it explicitly. Admitting it would
  be the first step to a register that is a changelog.

Three of the eight sites, then, are near misses, and each one is a place where a
register without a stated boundary would have collected noise instead of signal.

## Verdict and mode

`simulation`, because the arms are policy arms rather than runnable ones: no
instrument in this tree can be pointed at "is this deviation declared", and
building one is not a measurement, it is the adoption. The three cases above are
real sites in a real tree, walked under both policies, and the prediction is
that the register changes the outcome at two of the eight and would have
prevented one specific future action — the reimplementation of a retired clause
by a maintainer with no way to read the decision.

**What would falsify it:** if the batch clause turns out to be handled somewhere
outside these two files, or if a downstream consumer's own documentation already
records the deviation, then the claim that it is unenumerable is wrong and the
entry buys nothing. Neither was found; the first was checked by exhausting the
array-handling vocabulary across both files, the second by searching the
repository's documentation tree for any conformance-exception surface, which
returned none.

`structural-only`: no behavioural arm was runnable, and the structural fact — a
claim, a missing clause, and no place where the difference is recorded — is what
carries the finding.
