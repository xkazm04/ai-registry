---
layer: technique
type: technique
subject: data-retention
technique: confirm-by-echo
status: forged
laws: [gate-sees-target, one-validation-door]
shared_with: []
use_when: [gating an irreversible destructive action, designing a delete-everything confirmation, reviewing a dangerous operator workflow]
---

# Confirm by echo

Requiring the operator to **type the exact name of the thing being
destroyed** before an irreversible operation proceeds, and comparing that
echoed value server-side against the record the operation will act on.

## Why the echo, and not a dialog

A yes/no confirmation measures willingness to proceed. It does not measure
what the operator believes they are proceeding *against*, and that belief is
where the destructive errors actually come from. The dominant class of
operator destruction incident is not "meant not to delete"; it is **acted on
the wrong target** — the wrong tenant, the wrong workspace, the wrong
environment, the correct button on a stale tab opened yesterday. A dialog
is a reflex that experienced operators have trained themselves to clear; it
adds friction proportional to nothing.

Typing the target's name is the only cheap confirmation that scales with
*specificity*. It cannot be satisfied without reading the name, and reading
the name is exactly the step that would have caught the wrong-target error.
It also degrades gracefully into ceremony: the effort is proportional to how
distinctive the name is, and the operator who has to type it slows down for
long enough to think.

## The comparison rules

Three rules, each of which has been violated in a real system:

- **Compare on the server, against the record the operation will act on.**
  A comparison against a name the client also supplied gates nothing — the
  caller supplies both sides and always matches. The echo is only a gate
  when the authoritative value is loaded from the store by the same
  identifier the deletion will use
  ([gate-sees-target](../../_laws.md#gate-sees-target)).
- **Compare with the identifier's own equality rule, and say so.** Trim
  surrounding whitespace, then match the way the system itself matches that
  identifier: exactly, for a case-sensitive name; case-insensitively, for an
  identifier the product treats as case-insensitive everywhere else. Any
  looser comparison destroys the property — fuzzy matching tolerates the
  operator who half-remembers the name, which is the operator the echo
  exists to stop. Any *stricter* comparison than the identifier's own rule
  is a false rejection that trains people to paste blindly. State the rule
  in the prompt, and render the exact expected string somewhere
  copyable-but-not-prefilled.
- **Echo the target at the scope being destroyed.** When one operation
  supports a wide and a narrow scope, the expected phrase differs per scope
  — the whole tenant's name for the tenant-wide act, the specific item's
  full name for the narrow one. This makes a scope mistake unsatisfiable
  rather than merely unlikely: a payload that meant the narrow scope cannot
  accidentally authorise the wide one, because it does not contain the
  right string.
- **Never prefill the field, and never accept a value the client rendered
  from its own state.** A prefilled echo is a dialog with extra steps.

Where the target's name is not unique or not stable, echo a value that is —
a slug, a short identifier — and display both. Echoing an ambiguous name is
worse than no echo, because it manufactures confidence.

## Echo is one rung of a ladder

The echo proves comprehension. It does not prove authority, and it does not
prove the request came from where it appears to. Compose it into an
ordered ladder at the one door the destructive operation passes through
([one-validation-door](../../_laws.md#one-validation-door)):

1. **Request origin.** Reject cross-origin or otherwise unattributable
   invocations before anything else. Cheapest check, absolute answer, and it
   closes the case where a page the operator never visited triggers the
   action with their live session.
2. **The echo.** Comprehension of the specific target.
3. **Authorisation.** Irreversible destruction is the narrowest permission
   the product has — typically a single owner-level role, never inherited
   from general administrative rights, and checked against the target, not
   against the actor's role in some other scope.

Order matters for cost and for information leakage: checks that need no
store read run first; the check that reveals whether the actor *could* have
done it runs last. Every rung returns a distinguishable reason so a failed
attempt is diagnosable, and every failed attempt is recorded — an echo that
failed twice before succeeding is exactly the near-miss an operations review
wants to see.

## Pair it with the preview

The echo asks "do you know what you are deleting?" and the operator can only
honestly answer if they have been shown. Present the
[dry-run-preview](dry-run-preview.md) — what will be destroyed, what will
survive — on the same screen as the echo field, computed by the same code
that will execute. Echo without preview gates comprehension of the *name*
while leaving the *consequences* unstated, which is the liability-transfer
version of confirmation.

After execution, report what was actually destroyed. The operator who typed
the name is the one person entitled to a receipt.

## When not to use this

- **Reversible operations.** Archive, soft-hide, and anything with a restore
  path should be cheap; spending echo ceremony on them trains operators to
  type names without reading, which spends the mechanism's entire value.
- **Unattended paths.** A scheduled purge has no operator to echo; its
  equivalent guard is fail-closed authentication on the entry point plus the
  configuration floor, not a confirmation token stuffed into a job payload.
  That machine credential deserves the same care the echo gets: presented in
  a header rather than a query string — query strings are captured by access
  logs, proxy logs, browser history and referrer headers, and a secret that
  authorises a delete-everything run must not be readable from any of them —
  compared in constant time, and single-sourced so the several scheduled
  entry points cannot drift into weaker checks. A shared helper that is
  *laxer* than the hand-rolled check it replaces is a silent downgrade of
  every route that adopts it; the canonical gate must be the strictest one.
- **High-frequency destruction.** If the operation runs dozens of times a
  day, echo becomes muscle memory and stops measuring anything — the right
  answer there is to make the operation reversible or scope-limited, not to
  keep escalating the confirmation.
- **Where the name is not distinctive.** Echoing "default" or "workspace"
  across an org with twenty such names is theatre; fix the identifier first.
