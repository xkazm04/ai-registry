# Port quality: the winner's code is evidence, not a base

`promotion.md` keeps a port faithful to how the winner **looks**. This file keeps it faithful to how
good software **is built and runs**. A promotion is done only when both contracts hold:

- **Fidelity**: `style-contract.py` reads 0 deviations on the owner's named roles, and every named
  interaction has been driven.
- **Quality and performance**: every gate below is green at zero on the new code, and every budget
  holds.

It is not done when the page looks right, and it is not done when the code compiles.

## Why this step exists (measured)

A contest seat is optimised for one thing: show the owner the design within a wall-clock ceiling.
Its code shows it. The winner of one product's foundry-redesign family was an approved multi-page
static prototype. It was read before the port and measured 2026-10-14:

- **The view layer.** All of it is string-built HTML: 433 `esc(` calls and `innerHTML` swaps.
  `.replace("<svg", ...)` is patched onto icon strings about 20 times.
- **Duplicated work.**
  - Two facet rails and two virtual lists, each with its own select/move logic and 110 ms
    debounce.
  - The slot status → state mapping five times, and the channel abbreviation map three times.
  - The kit page re-templated four components as string copies of the real ones, so they were
    guaranteed to drift.
  - 15 CSS rules defined in two sheets, disagreeing by a couple of pixels.
- **Tokens.** 57 tokens were declared, but the signal colours were re-typed as `rgba()` about 144
  times. The page sheets carried roughly 2,000 raw px values. Three of the declared type sizes were
  never used, three half-pixel sizes sat off the scale, and there were 22 unnamed z-indexes and
  15 breakpoints.
- **State.** No state machine was a table. One status was set in four places. One declared state
  was never set by anything.
- **Globals and keys.**
  - Six `window.*` globals; records aliased and mutated during render; scratch fields written onto
    shared objects.
  - One `keydown` dispatcher of about 60 lines per page. `K`, `J/L`, `]` and the number keys
    changed meaning from page to page.

The prototype was right to be like this; it is a prototype. **Copying it is how the product inherits
all of it.** The product it was promoted into already carried the result of earlier unexamined ports:

- 55 `lib → app` imports and 22 import cycles;
- 53 `as unknown as` casts;
- 30 `JSON.parse(...) as T` casts with no validator;
- 65 Error subclasses;
- a test lane where 177 of 284 probes asserted by reading source text.

None of that was a single decision. It accumulated port by port.

## The procedure

### Q0. Inventory the winner's code before writing a line

Run a read-only scout over the winner and write down, with `file:line`:

1. every visual component it draws, where it is defined and where it is used, **and every
   duplicate** (the same visual thing implemented twice). That list becomes the extraction
   checklist;
2. the token reality: the declared tokens, the literals outside them, and which repeated literals
   are unnamed tokens;
3. the record shapes and state machines, and where each transition happens;
4. the keyboard model, per page, with every key whose meaning changes between pages;
5. the URL and hash contracts each page accepts and emits;
6. the smells not to port: long functions, globals, mutation during render, duplicated helpers.

### Q1. Design the code before porting it

The structure is decided **before** the first component moves, with the owner where it is the
owner's call. Use `/spark` or an owner-gated wave. Consult the registry subjects that govern it:
`module-design`, `invariant-placement`, `quality-gates`, `metric-gates`, `test-harness`,
`design-tokens`, `codegen`, `error-handling`, `client-state`. Settle at least:

- **Boundaries** are enforced by the build, not by convention: packages with `exports` maps, or a
  boundary gate bound to merge. Dependencies point one way and there are zero cycles.
- **One door per boundary.** Every value that crosses a boundary (request bodies, stored rows,
  model output, CLI `--json`, persisted client state) is parsed by a schema at one place.
  `JSON.parse` lives only there.
- **One error taxonomy** of at most ~10 codes, each one a consumer branches on, with one envelope.
- **State machines as data.** One transition table per record family, imported by both server and
  client.
- **Branded ids**, minted at the door that creates them.
- **A test ladder, not one lane.** Unit and integration rungs carry the logic, with fixtures copied
  from a template, never rebuilt. A small live-browser lane carries the screens. A probe that greps
  source text is a last resort, never the default.
- **A styling form that keeps pixels.** If the winner is hand-written CSS, port it as co-located
  stylesheets over generated token variables (for example CSS Modules), not as the nearest utility
  classes. Approximation is how the fidelity contract fails.
- **Data access** that minimises client code. The app reads on the server and mutates through one
  door. Live state arrives as events, and client state holds only UI concerns (cursor, selection,
  drafts).

### Q2. Gates at zero before the first ported line, each proven alive

New code starts at **zero**, never at a baseline. A ratchet is for an old tree, not a new one. Each
gate is blocking, bound to the merge requirement, prints its denominator (walked / checked /
skipped), and exits 2 when it walked nothing. **Prove each gate red on a seeded violation before
trusting it green.** At minimum:

- **boundaries and cycles** (import direction, no reach into the old tree);
- **hygiene:** no `as unknown as`, no `any`, no `JSON.parse` outside the door, no raw `keydown`
  listener, no swallowed catch;
- **file size:** a hard cap (400 LOC worked). A larger file is split by what each part must know,
  not by when it runs;
- **tokens:** generated outputs match their source (drift), and no raw colour or px value appears
  in component styles (allow-list membership);
- the product's own **type floor** and **narration** gates, run against the new routes;
- **strict compiler settings** from the first commit (for TypeScript: `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `erasableSyntaxOnly`).

### Q3. Extract, never copy

- **Tokens are a derived artifact.** One source file, primitives → roles. A generator writes the
  CSS and its typed mirror, each with a header naming the regeneration command. Values stay
  **byte-equal** to what the winner renders: extraction changes names, never pixels. A repeated
  literal becomes a role only if it passes three admission tests: a recurring intent, a
  one-sentence definition, and not being a name-tagged raw value. Keep a list of every rejected
  candidate with its reason.
- **One component per visual thing.** Q0's duplicate list is the checklist. Two facet rails become
  one, and five status mappings become one table. The kit page renders the real components, never
  string copies of them.
- **One keymap registry** declares every binding per mode and runs a conflict report as a check.
  Keep the winner's bindings unless the owner rules otherwise; a key that means two things on two
  pages is reported to the owner, not silently "fixed".
- **One URL contract**, with one encoder.

### Q4. Performance is a contract too

The winner proved the design at prototype scale. The port is measured at product scale, with the
measurement written down:

- **Bundle budget per route** (first-load JS), gated by a deterministic byte count, never by
  timing.
- **Virtualise every list that can exceed one screen.** Prove it at 10× the prototype's volume:
  the prototype's 5,000 library items becomes a 50,000-item corpus with a stated p95 search budget.
- **No per-tick churn.** Rebuild DOM only when its inputs change; one prototype polish found
  outside labels rebuilt every second.
- **Event-driven invalidation** from the product's event stream. Polling is a slow backstop, not
  the design.
- **Media facts are computed at ingest** (decodability, poster, duration, brightness). One
  prototype hard-coded a list of near-black renders and probed every mp4 in the browser at boot.
- **Count, don't time.** DOM node counts, render passes and work counts are gates. Timings are
  reported, never gated.

### Q5. Characterise, cut over, delete

Before a ported surface replaces an old one, pin the old behaviour the new one must keep with
characterisation tests at the cheapest rung that sees it. Then cut over and **delete the old code in
the same change**. Each cutover needs a reachability instrument, because an old and a new module
running side by side keep each other's dead code "used".

## Exit, all four at once

1. `style-contract.py` reads 0 deviations on the named roles, and every named interaction has been
   driven (`promotion.md`).
2. Every Q2 gate is green at zero on the new code, and each was proven red once.
3. The Q4 budgets hold, with the measurement command named.
4. The old code the port replaced is gone, and nothing still reaches it.

Report all four with numbers. "It looks right" is not a promotion, and neither is "it compiles and
the tests pass".
