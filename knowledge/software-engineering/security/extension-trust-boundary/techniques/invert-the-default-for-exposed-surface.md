---
layer: technique
type: technique
subject: extension-trust-boundary
technique: invert-the-default-for-exposed-surface
status: forged
laws: [absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [one discovery mechanism serves several extension kinds, choosing whether an unset allowlist means all or none, an extension group can publish externally reachable surface, auditing what an untouched deployment loads]
---

# Invert the default for the group that is exposure

One discovery mechanism usually serves every kind of extension a host accepts:
one advertisement table, one lookup, one loading path, with a group name to say
which kind. The uniformity is real and it is only a property of the
*mechanism*. The defaults belong somewhere else.

> Assign the default to the **group**, by its blast radius. A single default
> applied across groups of unequal exposure is a bug that looks like
> consistency, and it is defended with the word "consistent" for as long as it
> survives.

## Classify each group before you set anything

For each group the mechanism serves, answer one question: **what becomes
possible the instant a member loads, before anything asks for it by name?**

| class | what loading does | default |
|---|---|---|
| Inert contribution | Adds a name to an in-process registry. Nothing runs until something looks the name up. | Load all discovered; an allowlist narrows. |
| Behavioural override | Replaces or wraps host behaviour on a path that already runs. | Load all, but log every override at startup. |
| Exposed surface | Attaches externally reachable handlers, listeners or endpoints. **Loading is publication.** | Load nothing unless an operator names it. |
| Privileged capture | Obtains credentials, keys, or a hook on data in transit. | Load nothing unless an operator names it. |

The line that matters runs between the first two rows and the last two. An
inert contribution's worst outcome is a wrong answer inside a process, and
reaching it requires the ability to run code in that process already. An
exposed-surface member's worst outcome is reachable by a stranger who knows the
address of the service and nothing else. That is not a difference of degree.

## Rules for spelling the defaults

**Unset must not mean "everything" for an exposed group.** An operator who has
never heard of the group has not requested it, and rendering that absence as a
request is the classic conversion of *unknown* into a definite value
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)). For the
exposed group, unset resolves to the empty set and the code path is the same as
an explicitly empty allowlist.

**Unset and empty may legitimately differ for the inert groups.** There, unset
means "no narrowing requested, load what is installed" and an explicit empty
list means "load none". Two states, two meanings, and the option's
documentation states both — because a reader who learned the exposed group's
rule will otherwise assume the inert groups share it, and the reverse.

**Write the asymmetry where the option is configured**, not only where it was
decided. A design record explaining why one group inverts is read once by four
people; the option's own description is read by everyone who ever configures
the service. An inverted default that is only justified elsewhere gets
"harmonised" by a later contributor who is trying to be helpful.

**Installing is not enabling.** Presence on the machine makes a member
discoverable; naming it makes it run. Keeping the two separate is what lets an
operator answer "what is installed here" and "what is live here" as different
questions — and it is what makes an accidental install of an exposed-surface
member a non-event instead of an incident.

**Put the inverted default at the call site, not inside the shared loader.**
The discovery function stays one function with one behaviour — narrow by
allowlist if one is given. The inversion is a guard in front of it: when the
operator has named nothing, the exposed group's loader **does not call
discovery at all** and returns empty. A default threaded into the shared loader
as a strictness flag is a parameter every future caller can pass wrongly; a
guard at the one call site that owns the exposed group cannot be passed at all.

**Unset and empty-string are different values, and the parser decides which
one you got.** Where the allowlist arrives as an environment variable, an empty
value very often parses to a list containing one empty name rather than to
absent. Under the permissive groups those two spellings then mean opposite
things — load everything versus load nothing — and the difference is invisible
in a deployment manifest. Pin the behaviour with a test named after the
spelling, and state it where the variable is documented.

**One identifier, and say which one it is.** An extension typically has two
names: the one under which it is advertised for discovery, and one it carries
on itself for logs and display. The allowlist matches exactly one of them.
Which one is not guessable, the failure mode is a silently unloaded extension,
and the fix is a sentence in the option's documentation naming the identifier
that counts.

**The enabled set is announced at startup.** Every member that loaded, named,
with its group; and for the exposed group, what it attached. The guard here is
the operator's attention, and an attention-guard that produces no artifact is
absent ([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)). The
announcement is also the only thing that makes a surprise visible in a
deployment nobody is watching, which is all of them.

**Announce the discovered-but-not-enabled set too, for the inverted group.**
When members are installed and the operator has named none, say so at warning
level and list them. This is the one moment where the inversion could look like
a malfunction — the operator installed something and it did not run — and one
line naming the members and the option that would enable them converts a
confusing silence into an instruction. It also tells an operator who did *not*
install them that something on the machine did.

**Allowlisting one group does not constrain another.** When a capability ships
as two registrations under two groups, the strict default applies to one of
them and the permissive default to the other; naming the exposed half enables
it and leaves its partner loading because it is installed. Say this at the
point of enablement. An operator's mental model is "I allowlisted the
extension", and the mechanism's model is "you named one entry point of two".

**The allowlist is not an access control.** It bounds what loads. A named
member has, from that moment, everything the host process has. Say this next to
the option, because a mechanism that looks like a permission list will be
reasoned about as one, and the reasoning error is always in the unsafe
direction: "it is allowlisted, so it is constrained".

## Decision rules

- If loading a member makes anything reachable from outside the process
  boundary, invert: nothing loads unless named. No exceptions for "internal
  only" networks.
- If a group's members are all shipped by the host itself, they are not
  extensions and do not belong in the discovery mechanism at all — moving them
  out is usually the real fix when a group's default feels ambiguous.
- If one group's members can be either inert or exposed depending on what the
  author wrote, split the group. A group whose blast radius is decided by its
  members cannot carry a default at all.
- If you are tempted to add a knob that turns the inversion off wholesale
  ("load all exposed members"), do not. It is a single flag that converts an
  audited surface into an unaudited one, and it will be set in an environment
  file three years from now by someone debugging something unrelated.

## When not to use this

- **A single-group mechanism.** With one kind of extension there is one blast
  radius and one default; the classification is ceremony.
- **A host with no externally reachable surface at all** — a library, a batch
  tool. Inverting there costs operators a configuration step and buys nothing,
  and an unjustified inversion teaches readers to route around inversions.
- **Where the operator has no way to name members.** An inverted default with
  no usable allowlist mechanism is not a safe default, it is a disabled
  feature; ship the naming mechanism in the same change or ship neither.
