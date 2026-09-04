# Lessons - leonardo

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-08-24 - ai-registry

- **Given a `## Project overlay` section (1.0.0 -> 1.1.0).** Unlike its lane siblings this body was already generic - it never aborted, never named a vault, ran anywhere an API key was set. What it lacked was a declared slot, and the consequence was quieter than a crash: one repo's brand direction ("neon android head", palette from that repo's stylesheet) sat inlined in the shared body, so every OTHER repo generated against a house style that was not its own, and the assets came back looking finished.
- **A missing overlay slot is a silent defect, not an absent feature.** The three skills re-seated beside this one failed loudly on the second machine - `exit 1` before phase 1. This one failed by producing plausible output. That is the worse failure, and it is invisible in a gate that only checks structure.
- **Brand direction now resolves through `.claude/leonardo/config.md`** with a real fallback: ask the user once, read the palette out of the repo's main stylesheet and say which file it came from, and offer to write the answer back into the overlay. Asking beats guessing, and writing the answer down beats asking twice.
- **Tool paths moved to `${CLAUDE_SKILL_DIR}/tools/`.** The body invoked its own scripts through `.claude/skills/leonardo/tools/`, which is true only for a copy installed at that exact path - not for a symlink into the lane, and not for a plugin install. The harness substitutes the variable wherever the skill actually lives.

## 1.2.0 - 2026-09-04 - ai-registry

- **Eight tools, not one testable function among them.** Every file in `tools/` is a flat top-level script: it resolves `sharp` at module scope, or reads an API key and exits, or awaits a `fetch` before the last line. Importing any of them to check a helper runs the tool. The obstacle was never that the logic is hard to test - it was that the pure half had nowhere to live.
- **The fix is a split, not a mock.** `wrapText` and `svgEscape` moved out of `og-image.mjs` into `tools/og-text.mjs`: no imports at all, no side effects, loadable with nothing installed. `og-image.mjs` imports them back, so there is still one definition. A test tier that needs `npm install` to run is a test tier nobody runs, and mocking `sharp` to reach a string function would have been the more expensive way to test less.
- **The first run found a real defect.** `" a b ".split(/\s+/)` opens and closes with `""`, and the trailing empty word appended a space to the LAST wrapped line - a line one character over its own budget, rendering with a hanging space. A title pasted from anywhere carries that whitespace. `.filter(Boolean)` on the split; the assertion stayed as written.
- **What is worth pinning here is what renders wrong rather than what throws.** Neither function can fail loudly: a wrap that emits an empty first line pushes the whole title block down a full leading, and an escape applied in the wrong order prints `&amp;lt;` on the card. Both look like a design problem to whoever sees them next.
