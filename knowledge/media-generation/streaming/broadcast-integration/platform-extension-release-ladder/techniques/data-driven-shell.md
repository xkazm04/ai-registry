---
layer: technique
type: technique
subject: platform-extension-release-ladder
technique: data-driven-shell
status: forged
laws: [edit-do-not-regenerate, typed-input-owns-its-channel]
shared_with: []
use_when: [deciding what an extension's design may change without a new platform review, designing the configuration document an extension shell renders, a requested change that would otherwise wait a review cycle]
---

# Data-driven shell

The reviewed code of a platform extension is a renderer, and everything a team expects to
change during a season is a document the renderer reads. Copy, colours, order, which
components appear, which feature is switched on for which channel: all of it is data. The
shell's repertoire — what it *can* draw and do — is fixed by the version the platform
reviewed; the document only chooses among that repertoire.

## Why the split is forced

A code change costs a review cycle measured in weeks, and a released version cannot be
patched. A team whose button label lives in the code will ship the wrong label for a
fortnight and learn to stop asking for label changes. A team whose label lives in a
document changes it in the time it takes to write the document. The split is not a
convenience; it decides whether the extension can be tuned at all after launch.

The same split protects review. A reviewer checked a specific set of behaviours. If every
later change is a choice inside that set, the reviewed promise stays true. That is the
law's shape, applied to a release: the reviewed artifact is edited in the small, through
its declared surface, and never silently replaced by something nobody checked.

## Procedure

1. **Write the repertoire first.** List the components the shell can render, the
   properties each one takes, and the features it can switch. Each is a typed field in the
   document schema with a closed set of values or a bounded range. Colour is a token from
   a palette or a validated colour value; copy is bounded text; order is a list of known
   component names.
2. **Version the document schema separately from the code.** The document carries its
   schema version. The shell knows which schema versions it reads. A document newer than
   the shell understands is rendered for the fields the shell knows; unknown fields are
   ignored, never interpreted.
3. **Validate on both sides.** The authoring tool validates before it writes, so a
   streamer is told at once that a value is out of range. The shell validates again on
   read, because storage is not a trust boundary and the document may have been written by
   an older tool.
4. **Ship a built-in default.** The bundle carries a complete design that renders with no
   document at all. A missing, unreadable or invalid document falls back to it, visibly
   whole, never to a half-styled page.
5. **Keep the document small.** Platform-hosted configuration storage holds a few
   kilobytes per segment and accepts a limited number of writes per minute. Design tokens
   and switches fit; images and long text do not. Large assets belong in the bundle, chosen
   by name from the document.
6. **Make every new feature switchable, default off.** A feature coded into the next
   version is shipped dark and turned on from the document when it is wanted, per channel
   if need be. The same switch is the kill switch for a released version, because there is
   no other way to turn off a defect without a new review.

## Decision rules

- **When a change is requested**, express it in the document if the schema can. If the
  schema cannot, the change is a new version — and the schema gains the field that would
  have made this change data, so the next one is.
- **When a document field would hold markup, script, an expression or a URL to load**,
  refuse the field. It is code with a review exemption, and the reviewer will rightly
  treat it as remote code.
- **When the streamer authors the document**, every field the streamer writes is bounded
  and validated before storage; a streamer is an author of data, not of behaviour.
- **When the document is the only control over a live defect**, the switch must already
  exist in the released version. Plan kill switches before submission, not after an
  incident.

## A design skips the platform's review, so it does not skip the team's

The split moves review, it does not remove it. A new design document reaches every viewer
of the channel the moment it is written, and no reviewer outside the team will read it.
So a design climbs its own ladder, shorter than the code's: it is drafted and previewed
locally, it runs on the test rungs for the allowlisted accounts, and it reaches the
audience only by a deliberate publish. Where the design shapes play — a board viewers
claim tiles on, a vote with several sides — it is also rehearsed before it reaches anyone:
a deterministic simulation plays rounds of it at the audience sizes the streamer expects,
with a seed that replays exactly, and reports in plain words whether the design runs
away to one side, stalls, or stays contested. A layout that only ever produces a
stalemate is a defect, and the rehearsal finds it with no viewer present.

The rungs above the current one are shown as lists of what they require, never as
buttons that promote. Publishing a design to an audience is a decision, and a control
that performs it in one click beside a preview turns a decision into a slip.

When the same renderer also draws the streamer's on-stream overlays, the design document
is one format for both hosts. The extension is then a second host for packages the
overlay already renders, and the rules about what a package may contain are shared
rather than restated.

## The document is not a language

The tempting expansion is a document that can compute: conditional visibility,
arithmetic on live values, a small template language. Each step looks harmless and each
moves behaviour out of the reviewed code. Draw the line at selection: the document
chooses among named components, named states and named tokens; the shell owns every
computation. When a design genuinely needs a new conditional, the shell gains a named
mode in the next version and the document selects it.

This is also why the document owns its channel. When the shell exposes a property as a
typed field — a colour token, a layout name — nothing else in the system restates that
property in passing. A second source for the same property, such as a hard-coded style
the document cannot reach, produces a design that matches neither.

## When not to use it

An extension with a single fixed purpose, no streamer customisation and no expected
change before its next planned version gains little from a document beyond the kill
switch. Keep the switch; skip the schema.
