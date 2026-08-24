# Lessons - leonardo

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-08-24 - ai-registry

- **Given a `## Project overlay` section (1.0.0 -> 1.1.0).** Unlike its lane siblings this body was already generic - it never aborted, never named a vault, ran anywhere an API key was set. What it lacked was a declared slot, and the consequence was quieter than a crash: one repo's brand direction ("neon android head", palette from that repo's stylesheet) sat inlined in the shared body, so every OTHER repo generated against a house style that was not its own, and the assets came back looking finished.
- **A missing overlay slot is a silent defect, not an absent feature.** The three skills re-seated beside this one failed loudly on the second machine - `exit 1` before phase 1. This one failed by producing plausible output. That is the worse failure, and it is invisible in a gate that only checks structure.
- **Brand direction now resolves through `.claude/leonardo/config.md`** with a real fallback: ask the user once, read the palette out of the repo's main stylesheet and say which file it came from, and offer to write the answer back into the overlay. Asking beats guessing, and writing the answer down beats asking twice.
- **Tool paths moved to `${CLAUDE_SKILL_DIR}/tools/`.** The body invoked its own scripts through `.claude/skills/leonardo/tools/`, which is true only for a copy installed at that exact path - not for a symlink into the lane, and not for a plugin install. The harness substitutes the variable wherever the skill actually lives.
