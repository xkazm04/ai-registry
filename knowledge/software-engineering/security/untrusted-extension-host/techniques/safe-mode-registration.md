---
layer: technique
type: technique
subject: untrusted-extension-host
technique: safe-mode-registration
status: forged
laws: [failure-not-empty-success, count-carries-predicate, absent-guard-is-loud]
shared_with: []
use_when: [an installed extension breaks the host before the operator can reach the control that disables it, designing the boot mode an operator uses to recover from a bad extension, deciding what an extension management screen must still show when nothing is running, the host has a way to hide its own settings entry and an extension can reach it]
---

# Safe-mode registration

An extension that breaks the host at load time creates a lockout: the control
that disables it lives inside the host, and the host does not come up far
enough to show it. The operator's remaining options are to edit the settings
store by hand, delete the extension's files, or reinstall, and every one of
those is a support incident that the design chose. This technique owns the
boot mode that prevents it: **an operator-initiated start in which the host
registers every extension and runs none of them**, so the manifest, the
per-extension disable control and the diagnostics are all reachable while no
foreign code has executed.

## Register everything, run nothing

The two halves are load-bearing and hosts routinely implement one. **Register**
means the host still discovers each extension, parses its manifest, creates
its record in the extension table and reports it on every surface that lists
extensions - name, version, declared grants, enabled state, last error. It
does not mean opening a runtime for it, binding its library, or executing its
entry file. The order inside the load path is the whole mechanism: the record
is created and the change notification fires *before* the safe-mode check,
and the check returns before anything that would run code.

A host that skips registration in safe mode - starts clean, loads nothing,
shows an empty extension list - has removed the lockout and replaced it with a
different one: the operator can see that the host works without extensions and
cannot see which extension to disable, because the list that would name it is
the list that was skipped. The failure is the same shape as the loud-skip rule
elsewhere in this subject: an empty list in safe mode is empty success
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)),
and the number it shows carries no predicate
([count-carries-predicate](../../../_laws.md#count-carries-predicate)) - "0
extensions" when the truth is "7 installed, 0 running, by the operator's
request".

## The controls that stay live, and the ones that are muted

In safe mode, a control is live if its effect is a **persisted decision** and
muted if its effect is to **run code now**. The per-extension enable toggle is
live: flipping it writes the settings store, and the next normal start honours
it. Uninstall is live for the same reason. Reload is muted, because reloading
means running the entry file, which is the thing safe mode exists to not do.
The global "extensions enabled" switch is muted too, not because it is
dangerous but because it would lie: toggling it in safe mode changes nothing
about the current session, and a control that appears to act and does not is
worse than one that is visibly disabled with a sentence saying why.

The sentence matters. Every muted control sits beside a label saying the host
is in safe mode, extensions are registered but not running, and the operator
can still enable and disable them. And the state is carried on the host's
outermost surface - the window title, the health output, the startup log - so
that a screenshot or a support transcript shows it without anyone asking.

## The entry to the settings cannot be hideable in safe mode

Hosts that let the operator hide the settings entry from the main interface,
for a cleaner screen, have built a second lockout, and an extension that can
write settings can spring it: hide the entry, break the load, and the operator
can neither reach the disable control nor the control that unhides it. Safe
mode overrides the hide preference unconditionally. This is the same argument
the subject makes about opt-in guards
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)) read from the
other side: a recovery path that depends on a preference being set correctly
is a recovery path that was configured away on the installation that needs it.

## Safe mode is per-invocation, and it is not a setting

Two properties that hosts get wrong by putting the flag in the wrong place.
The flag lives on the **launch surface** - a command-line switch, a launcher
option, a held key at start - and never in the settings store, for two reasons
that compound. The settings store is the thing that may be corrupt; a recovery
flag that has to be read from it recovers nothing. And a persisted flag is a
flag the operator forgets, so the host runs without extensions for a month and
nobody knows why. Safe mode applies to the invocation that asked for it and to
no other; the normal start is the default, and it is one restart away.

## Distinct from host-initiated degradation

The subject already has a skip. In
[isolation-tier-independent-extension-api](./isolation-tier-independent-extension-api.md),
a host whose isolation runner is unavailable skips the sandboxed tier and says
so, per extension, with a reason naming the missing runner. That skip is
**host-initiated**, **per-tier**, and its reason is a fact about the
deployment. Safe mode is **operator-initiated**, covers **every tier** - the
host tier most of all, since host-tier code is the code most able to break the
host - and its reason is a decision, not a fault. The two coexist and neither
subsumes the other: a host in safe mode with no runner reports both states,
and a reader who sees only one of them has been told half of why nothing is
running. What they share is the registration half: in both, the extension
record exists, the list is complete, and the not-running state is a labeled
state on every surface rather than an absence. And safe mode is not a variant
of the per-extension disable toggle - disable is persisted and per-extension;
safe mode is the transient, global mode in which disable becomes reachable.

## How to test for the property

Install an extension whose entry file raises at load, and one whose entry file
hides the settings entry and never returns. Start in safe mode. Assert that
the extension list names both, that no load-time side effect happened for
either, that the settings entry is visible, that the disable toggle for the
first writes the store, and that a subsequent normal start honours it and
does not carry the flag. A host whose safe mode is tested only by hand is a
host whose recovery path breaks in the release nobody used it in.

## Decision rules

- On a safe-mode start, discover, parse and register every extension; create
  no runtime and run no entry file for any of them.
- Keep every control whose effect is a persisted decision live; mute every
  control whose effect is to run code, with a visible sentence saying why.
- Force the settings entry visible in safe mode regardless of any preference
  that hides it.
- Carry the safe-mode state on the outermost surface: title, health, startup
  log.
- Take the flag from the launch surface, apply it to one invocation, and never
  persist it.
- Report safe mode and runner-unavailable as two states, not one.

## When not to use it

A host whose extensions are re-specified on every start from a configuration
the operator edits directly has no lockout to escape, because the fix is the
same edit that installed the extension. A server-side host with an
out-of-band administrative channel that does not depend on the host process
coming up has its recovery path already. The technique pays wherever the only
way to reach the disable control is through the process the extension can
break.
