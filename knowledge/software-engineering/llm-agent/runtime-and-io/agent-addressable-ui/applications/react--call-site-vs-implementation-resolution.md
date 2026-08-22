---
layer: application
type: application
subject: agent-addressable-ui
technique: call-site-vs-implementation-resolution
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# `pickDefaultIndex` — eight path segments between a primitive and the file you meant

The resolution half of personas-web's DevInspector is 76 lines of pure functions
in `src/app/_dev-inspector/devLocate.ts`, driven by `DevInspector.tsx` and
rendered by `devInspectorUi.tsx`. It never touches a fiber: the whole answer
comes from `[data-loc]` attributes and `Element.closest`, which is what makes it
survive `react@19` having removed the debug metadata the previous generation of
these tools walked.

The intent is stated at `devLocate.ts:21-24`:

> Path segments that mark reusable "library" internals. When resolving the
> default copy target we skip these and land on the call site (the feature/page
> file that *used* the shared component). Alt+right-click still reaches them.

## What the technique prescribes and what exists

| technique element | realization |
|---|---|
| outward walk, not a lookup | `buildChain` seeds with `start?.closest("[data-loc]")` then climbs `el.parentElement?.closest("[data-loc]")`, so unstamped intermediates are skipped rather than terminating the walk (`devLocate.ts:51-59`) |
| ordered innermost → outermost | the returned `LocEntry[]` is documented and used as such (`:50`, `:60`) |
| segment classification | `LIBRARY_SEGMENTS` = `/lib/ /hooks/ /stores/ /shared/ /ui/ /utils/ /i18n/ /_dev-inspector/` (`:26-35`) |
| segments, not substrings | `isLibraryPath` prepends a slash — ``const p = `/${path}` `` — so each pattern is delimiter-bounded on both sides and cannot match mid-segment (`:37-40`) |
| default = innermost product rung | `chain.findIndex((c) => !isLibraryPath(c.path))` (`:69`) |
| deduplicate identical rungs | `dedupeChain` collapses consecutive entries sharing a `path:line` (`:73-76`), applied before display (`DevInspector.tsx:205`) |
| both answers reachable | secondary click copies the resolved call site, `Alt` + secondary click copies index 0 — `const pick = e.altKey ? chain[0] : (chain[di] ?? chain[0])` (`DevInspector.tsx:168`) |
| chain reachable rung by rung | every crumb row is a `<button>` whose click copies that rung (`devInspectorUi.tsx:98-100`, wired at `:171-179`) |
| the walk made visible | two differently-styled outlines — a dashed secondary box on the pointed element, a solid filled box on the resolved target — and the pointer box renders only when `hover.defaultIndex !== 0` (`DevInspector.tsx:209-212`, `devInspectorUi.tsx:29-55`) |
| classification made visible | `CrumbRow` dims library rungs and marks the default with a caret (`devInspectorUi.tsx:96`, `:107`, `:115`, `:117`) |
| tool excludes itself | `/_dev-inspector/` is a library segment (`devLocate.ts:34`), and events whose target is inside `[data-devinspector]` are ignored on both move and context-menu (`DevInspector.tsx:140-141`, `:144`, `:162`) |
| the mapping is always on screen | `right-click: call site · Alt+right-click: this element · click a row · Esc: exit` sits permanently in the HUD footer (`devInspectorUi.tsx:183-185`) |

## What holds

- **The default really is the frequency argument.** With eight segments covering
  the shared layers of this tree, a click on any composed control resolves past
  the primitive to the feature file, and the `Alt` variant costs one key when the
  primitive is genuinely the target.
- **The two-outline display is the trust mechanism.** Because the pointer box is
  drawn only when the resolution moved (`DevInspector.tsx:209`), its presence *is*
  the statement "I climbed", and its absence is the statement "you are already on
  the call site". No text needed.
- **Dimming library rungs turns the segment list into a visible decision.** A
  wrong entry in `LIBRARY_SEGMENTS` announces itself the first time somebody
  hovers, because the row that should be bright is grey.
- **Self-exclusion is done twice** — by path classification and by event
  filtering — which is the right amount for a tool that renders on top of
  everything at `zIndex: 2147483646` (`devInspectorUi.tsx:16`).
- **The chain is offered rung by rung rather than as a blob**, so the person
  picks the level rather than pasting three lines and asking the agent to choose.

## Deviations (reported, standard kept)

- **Exhaustion is silent.** `pickDefaultIndex` returns `0` when every rung is
  library code (`:70`), which is the innermost element presented exactly like a
  found call site — same caret, same outline, same copy. The standard requires
  the resolver to say that no product call site was found, because the operator
  cannot otherwise distinguish "this is the call site" from "there wasn't one";
  the caret on a dimmed row is a hint, not a statement. Returning the *outermost*
  rung in that case would also be more useful than the innermost, since it is the
  nearest thing to a boundary.
- **The idle prompt and the empty result render the same.** With mapping on and
  no chain, the HUD shows `Hover a component…` (`devInspectorUi.tsx:180-182`) —
  which is what an operator who *is* hovering an unstamped element sees. Idle and
  resolved-to-nothing are two states sharing one rendering, which is the exact
  conflation the degradation technique exists to prevent, reintroduced one level
  down.
- **The copied reference carries no anchor.** `parseLoc` builds `loc` as
  `path:line` and nothing more (`devLocate.ts:47`); the element's visible text is
  displayed in the label chip but never travels. After any edit above that line,
  the agent has a number and no way to re-anchor, and the failure is a confident
  edit at the wrong offset.
- **Portalled content is not detected.** `buildChain` follows `parentElement`
  through the DOM, so anything rendered through `createPortal` — which this
  overlay itself uses (`DevInspector.tsx:193`, `:207`) — resolves up through its
  host rather than its composition. Dialogs and popovers therefore report a
  plausible, wrong ancestry.
- **The chain has no whole-copy gesture.** Per-rung copy covers the common case,
  but a change that genuinely spans layers still has to be assembled by hand from
  three separate copies.
