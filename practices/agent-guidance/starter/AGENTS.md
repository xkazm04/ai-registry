# <repo name>: agent guidance

> Machine-readable context so any AI contribution lands consistent and on-spec.
> Replace every `<...>` and `TODO:` with this repo's specifics, then delete this quote block.
> A line you cannot verify by running something or opening a named file does not belong here.

<One paragraph: what this repo is, who uses it, and what it must never stop doing.>

## Commands

- Install: `<cmd>`
- Test: `<cmd>`        <!-- the one command that proves a change -->
- Lint: `<cmd>`
- Typecheck: `<cmd>`
- Build: `<cmd>`
- Run locally: `<cmd>`

TODO: delete any line above that has no real command in this repo. Do not invent one.

## Architecture map

- Entry points: `<path>` (<what happens there>)
- `<dir>/` - <what it owns>
- `<dir>/` - <what it owns>
- Data flow: <request -> ... -> response, in one line>

TODO: two levels deep is enough. Deeper listings go stale faster than they help.

## Verify after every change

1. `<test cmd>`
2. `<typecheck cmd>`
3. `<build cmd, if this repo has one>`

Do not report a change as done before all of the above pass. If a step is skipped, say which
one and why, in the same message that reports the change.

## Constraints (never break these)

- Do not hand-edit `<generated or vendored path>` - <why: it is rewritten by `<cmd>`>.
- Changes to `<public API / schema surface>` need <migration / version bump / review>, not an
  in-place edit.
- Secrets come from `<vault or env source>`. Never commit a credential, a token, or a `.env`.
- TODO: add the constraints whose violation would be expensive here, each with its reason.

## Tooling in use

TODO: list MCP servers, hooks, subagents, or scripts this repo expects, and what each is for.
Delete this section entirely if there are none.

## Conventions

- Commits: <format, e.g. conventional commits: feat/fix/chore(scope): summary>
- Tests live in `<location>` and are named `<pattern>`
- Errors are <handled/logged> by `<pattern or module>`
- TODO: add the conventions the code already keeps, not the ones you wish it kept.

## A good change looks like

- <link to a real commit or PR, or three lines describing one>
- Why it is a good example: <scope, tests included, commit message, size>
