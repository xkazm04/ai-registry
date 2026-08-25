---
layer: technique
type: technique
subject: agent-cli-transport
technique: permission-stance-enforcement
status: forged
laws: [gate-sees-target, one-validation-door, absent-guard-is-loud]
shared_with: []
use_when: [a repository scan must be provably unable to write, configuring an unattended editing agent session, an approval mode was silently downgraded by the tool]
---

# Permission stance enforcement

The transport contract's `mode` is a promise to the operator: `generate`
touches nothing, `readonly-scan` reads a workspace it provably cannot
write, `edit` changes files inside a declared boundary. This technique owns
making each promise real — because the child is an *agent* with a tool-use
loop, and "we asked it nicely in the prompt" is not an enforcement
mechanism. The moment a scanning feature is pointed at a repository the
operator owns, a scan that *could* write is an editing tool wearing a
scanner's label.

## Read-only is three layers, worn together

For `readonly-scan`, the standard posture is **belt, braces, and a refusal
to undress** — three independent mechanisms, all applied, none trusted
alone:

1. **The session-level read-only mode.** Most tools ship a planning or
   read-only session mode that refuses edits wholesale. It is the broadest
   layer and the first flag on the invocation.
2. **A scoped tool allowlist.** The session is granted only reading,
   searching, and history-inspection tools. Shell grants are **scoped to
   named read-only subcommands** — a bare shell grant is a write grant with
   extra steps, since an unqualified shell can delete, redirect, and
   commit. Variadic list flags are passed as one joined argument, so the
   list cannot swallow the flag that follows it.
3. **A write-tool denylist, where deny beats allow.** Even if a future
   edit widens the allowlist, the deny layer still refuses every editing
   and file-writing tool. The adapter *validates* requested allowlists
   against this denylist and **raises on conflict** rather than quietly
   granting — asking for a write tool on a scan is a caller bug, not a
   preference.

The composed stance lives behind one constructor
([one-validation-door](../../../../_laws.md#one-validation-door)): a caller
gets a scan-bound transport from a factory that applies all three layers,
never by assembling flags itself. And the adapter validates the mode value
against the tool's known mode vocabulary before spawning — an unknown mode
becomes an argument error inside the child, which the caller would misread
as a model failure.

## Enforcement class is a fact you record, not a hope

Not all read-only promises are equal, and the adapter states which class
backs its stance:

- **Operating-system enforcement**: the tool runs its work under a real
  sandbox — kernel-level filesystem and process restriction. The promise
  holds even against the tool's own bugs. Currently the exception, not the
  rule.
- **Application-level policy**: the tool's own permission engine refuses
  write actions. Strong in practice — the engine is the product's core —
  but a policy, not a wall.
- **Synthesized stance**: the tool has no read-only mode at all, and the
  adapter composes one from the tool's default propose-don't-apply behavior
  plus deny rules in a configuration file the adapter itself writes. The
  weakest class: it depends on defaults staying default and on the config
  file being read. It is still worth doing — but it is **labeled** as
  synthesized wherever the stance is displayed or logged, because an
  operator deciding whether to point the scanner at a production checkout
  deserves the honest class.

Which class each tool provides is a
[dated-capability-matrix](./dated-capability-matrix.md) row.

## Silent downgrades are hard failures

Some tools *override* a requested stance under conditions of their own — a
workspace-trust gate that quietly resets the approval mode to its default
when the directory is untrusted, announcing the downgrade only as a log
line. For a read-only run, a downgrade notice is not a warning: the
enforcement the caller asked for is **not in force**. The adapter treats a
detected stance override as a hard failure of the run
([gate-sees-target](../../../../_laws.md#gate-sees-target) — the gate you
configured is not the gate that ran), and it pre-empts the known triggers
(trust flags passed explicitly) rather than discovering them per machine.

## The edit stance: auto-accept, never bypass

`edit` mode is not the absence of enforcement. The unattended editing
session runs with **edit-acceptance enabled, never with the tool's
full-bypass flag**: file edits and the pre-approved tool set proceed
without prompting (headless runs have no one to ask), while actions the
tool itself classifies as dangerous still refuse. The flags are the second
belt; the first is **containment** — the session works in an isolated
worktree or checkout whose blast radius is bounded, per the neighboring
subject's ownership rules. And because an auto-editing agent is a real
capability, it sits behind an **explicit operator opt-in that defaults to
off everywhere** ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)
— here the guard is the default; its *removal* must be the loud, deliberate
act).
