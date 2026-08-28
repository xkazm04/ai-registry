---
layer: technique
type: technique
subject: mcp-tools
technique: egress-argument-gating
status: forged
laws: [gate-sees-target, unknown-is-not-a-value, one-validation-door]
shared_with: []
use_when: [gating outbound tool calls over a third-party argument schema, an allow-list passed a share nobody on it can read, deciding whether to allow-list argument keys or scan every value]
---

# Egress argument gating

[authentication-and-scoping](./authentication-and-scoping.md) models the
inbound question in full — who is calling, and what may they reach.
[untrusted-result-handling](./untrusted-result-handling.md) names the
outbound one in a sentence: constrain which tools can move data out. That
sentence is a policy, and between it and a working gate sits a problem the
inbound side never has. **The host must decide whether a call hands a
resource to someone outside the sanctioned set, from the call's arguments
alone, over a schema the host does not own.**

The tool server is third-party and versioned on its own clock. Its argument
names change between releases; new grant-shaped fields appear in features
the host has never seen. So the host cannot enumerate the fields that carry
recipients — which is precisely what a naive gate assumes it can do, by
reading the two or three field names it knows about and passing everything
else.

## Two scans, each blind where the other sees

A gate over an unownable schema needs both of these, and neither is
sufficient alone:

- **Value-shaped.** Walk every string value in the argument tree, match
  identifier-shaped tokens — an address, a principal reference — and
  require each one to resolve to the allow-list. Refuse on anything that
  does not. This is what survives unknown field names, which is the entire
  point: the gate never asks what a field is called, only what it contains
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) —
  an unrecognized token is not an absent one).
- **Key-shaped.** A value scan sees only strings, and the most dangerous
  capabilities are not strings. A share-with-everyone toggle modelled as a
  boolean, an integer, or a bare enum carries no identifier for the value
  scan to find, so it passes a scan that is working exactly as designed.
  The second pass matches argument *keys* against a set of known
  grant-widening flags and applies a truthiness test that does not care
  about the value's type. Match keys exactly, never by substring, or
  benign metadata — a domain field, a published timestamp, a public
  identifier — trips the gate and the team turns it off.

Their failure modes are complementary and that is why both are required:
the value scan fails open on a non-string capability, the key scan fails
open on a key name nobody has seen yet. **Write the residual hole down** —
a novel key name carrying a non-string value survives both — because a
gate whose limits are unstated is read as total by everyone downstream of
it, and the next person to add a tool needs to know which half they are
extending.

## Enumerable arguments invert the strategy

The two scans above are what you do when you cannot list the keys. When you
can — a stable tool whose argument surface the host actually knows — invert
it and **allow-list the keys**, refusing any call that carries one not on
the list. The inversion matters because an unknown key is exactly where a
recipient gets smuggled: a raw message blob, a custom header collection, an
additional-parts array, any field whose contents the gate would have to
parse a second format to see.

Both strategies belong in one gateway, chosen per tool family, and the
discriminator is a single question worth stating in the code beside the
choice: *can I enumerate every key this call may legitimately carry?* Yes
gives a key allow-list, whose failure mode is a rejected legitimate call —
loud, and fixed by adding a key after confirming it cannot carry an
address. No gives a value scan, whose failure mode is a permitted
illegitimate one. Prefer the loud failure wherever the schema lets you.

## An allow-list of principals cannot express a population

This is the boundary of the whole model, and it is invisible until someone
tests it. A recipient allow-list answers one question: *is this person
permitted?* Some grants have no person in them. Sharing to anyone with a
link, or to an entire domain, addresses a set whose membership is neither
enumerable nor stable — there is no principal for the gate to look up, so
a roster check finds nothing to reject and returns *allowed*. The widest
possible grant passes the gate that exists to prevent it, and passes it
cleanly, because the check was well formed and the question was wrong.

The fix is not a better lookup. **Population-scoped grants are refused
categorically, by a separate rule that runs before the allow-list is
consulted** — never as a case inside it. Any gate protecting an operation
that *can* address a population needs this second rule, and the test for
whether an operation can is not what it is called but whether any of its
arguments accept an audience rather than an addressee. Normalize the
audience values before comparing them, too: the same scope arrives spelled
three ways across versions and casings, and a gate that matches one
spelling is a gate that matches none.

## Gate the direction, not the operation

Access-granting calls are usually reversible, and only one direction is
dangerous. A gate that refuses the whole operation blocks the remediation
as firmly as the breach — revoking a share, turning link access off, and
narrowing a permission are the calls an operator makes *after* something
went wrong, and they must stay available. So the flag test distinguishes
truthy from the values that mean off, restricted, or none, and refuses only
the widening direction. The same reading applies to the roster check: adding
an unknown recipient is refused; removing any recipient is not the gate's
business.

## One allow-list, many gates

Derive the sanctioned set once from its authority and have every gate read
it live ([one-validation-door](../../../../_laws.md#one-validation-door)).
Three gates over three tool families — mail, calendar, file sharing — each
maintaining a private copy will drift, and the drift is undetectable from
the outside until the loosest copy is the one on the path that gets called.
Reading live matters as much as sharing: membership changes at runtime, and
a set snapshotted at boot keeps admitting someone the authority removed an
hour ago.

None of this replaces the server-side entitlement check
([gate-sees-target](../../../../_laws.md#gate-sees-target)). A host-side
argument gate reads the call; only the server behind the tool can read the
resource and the caller's actual right to it. The argument gate exists
because the host is the only party that knows the *sanctioned set* — the
server has no idea which recipients this deployment considers legitimate —
and both checks are load-bearing for different halves of the same question.
