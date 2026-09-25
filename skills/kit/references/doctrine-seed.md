# Doctrine seed - the rules a kit campaign earned

Every builder brief carries this file's rules verbatim, plus the project's own doctrine and the
owner's quotes from `gates.md`. Each rule names the gate that earned it in the forging campaign, so a
reader can tell a measured lesson from a preference.

## Identity and taste

1. **The theme's primary tint and glow are identity, not decoration.** Offered colourless titles as a
   root-cause fix, the owner kept the tint; a module restyle that swapped a primary-glow status rail for
   a semantic status colour was judged a degradation, and the rework that restored the glow passed.
   Where an old colour was the theme's own hue, keep it as the primary role, glow included. Convert a
   colour only when it was a raw palette step with no theme link AND the meaning is a status or role.
2. **Unification fixes what is broken, not what reads well.** Raw sizes, raw palette steps, below-floor
   text, hand-rolled controls and undefined token names convert. A gradient surface, a tracked micro-head
   or a glow that carries a module's character stays, written over theme variables. **But protect theme identity, not every decoration:** the same owner approved
   uniform kit cards over bespoke illustrated tiles and per-item icons on a landing page, where the kit drew the
   quantities instead. Keep the tint and glow; let the kit replace one-off illustration.
3. **Remove redundancy instead of restyling it.** A label that repeats what position, colour or an icon
   already says goes ("Status labels are not necessary ... if we have kanban columns and left border
   colors indicating the status already").
4. **Light-theme parity is judged on its own.** Every colour through a theme variable; a light theme that
   looked unstyled before is a win the owner names.

## What a module is judged on

5. **The headline is what the surface visibly does, not its token count.** A careful token pass that
   cut a module's divergence score by 90% was judged "almost non-existent"; the defects the owner saw
   were layout and data fit (a table body stretched to the viewport with its pager far below the rows,
   wrapping time cells, one cell cramming title, badge and a repeated description). Fix those first, at
   the shared component when the defect lives there. The unit of work is the surface the user sees.
6. **Row rhythm is sacred.** Folding rows to save height was reverted ("inconsistent row height").
   Uniform row heights inside a grid beat density.
6a. **Cards in a row align.** Head at the top, figures pinned to the bottom edge, actions in a place that never
   displaces the figures; the owner spotted the one card whose figures floated mid-card at once.
7. **Hierarchy by weight, one emphasis per row.** "We need to work with typography weight ... so user
   knows what to focus on." One emphasised element per row; figures and meta at regular weight with
   tabular numerals; one muting level. Dense tool surfaces take a compact density tier (one step down)
   rather than the showcase floor ("Larger sizing of typography does not work well").
8a. **Cards are for a level where the count is small.** Shown a card grid, the owner's first question was scale:
   "projects will have hundreds of contexts. Large cards will be a trouble if we won't have one parent layer
   abstracting them into higher level overview". A surface that can hold many entities gets a parent layer first
   (groups summarised as compact rows or tiles with their members drawn as units), and cards or a table only one
   level down. Design every entity surface for its largest realistic count, not the fixture's.
8. **Draw quantities where a number alone is weak.** The owner chose the kit that draws every quantity
   as countable units coloured by who claims them over a quieter one that matched its source perfectly.

## How the work is done

9. **Build the shared layer first, gate it, then compose.** Local restyles lost three gates out of four;
   the first module built from a contest-chosen composition kit passed first time. A surface is composed
   from the kit; a local one-off that duplicates a kit part is a finding; a missing part is a kit batch.
10. **A surface only exists if it renders.** A dashboard was rebuilt in full before anyone noticed no
    file imported it. Trace the mount point from the router before choosing a module.
11. **Port from measurement, never from memory.** A contest winner rebuilt from the product's generic
    tokens passed every product gate and was judged "massively degraded": 69 computed-style deviations,
    including every property the owner chose it for. Hold a chosen design to a computed-style contract
    (roles -> captured values) until 0 deviations, in every theme; never widen a tolerance.
12. **Decide on the product, not the prototype.** When two finalists are close, port both onto one real
    page from the same data behind a dev-only switch; the owner chooses from that, not from the arena.
13. **The layer move trap.** Moving unlayered token CSS into a cascade layer makes every override that is
    dead today start applying (thousands of them). Delete the dead overrides first, prove pixel-identical,
    then move the layer.
14. **Font truth.** Check which fonts actually render (computed style / devtools): a stack may name fonts
    that are never loaded.
15. **Missing variables are the worst defects.** A palette that points at CSS variables no theme defines
    renders invisible; when a colour does not appear in the BEFORE shots, check the variable exists before
    calling it a style problem.
16. **Contrast is not distinctness.** A contrast gate grades a colour against a surface, never against
    another colour; two roles can both pass and be the same blue. Gate role-vs-status and role-vs-role
    distance (CIEDE2000 >= 10) in every theme, on the rendered colour.
17. **Warn-level lint enforces nothing for an agent.** Style rules that only warn are invisible to a
    headless session and to any gate without a warning cap. Enforce with ratchets that fail on a rise, an
    edit-time hook that prints findings on the lines just written, and a path-scoped rule file.
