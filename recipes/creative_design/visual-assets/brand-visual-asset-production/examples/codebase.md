# The registered local codebase as the `development` connector

What was learned mapping this recipe onto a registered local project. Nothing here is part
of the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**This connector is the only place the render size lives.** The recipe insists that an
asset is judged at the size it will be seen at, and nothing except the code knows what that
size is: the container width, the aspect ratio the layout enforces, whether the image is
cropped, and what colour sits behind any text on top of it. Read the component that renders
the surface before composing the request, not after the asset comes back. An asset composed
against the brief but not against the layout arrives correct and unusable.

**Finding the surfaces that need work is a search problem with known shapes.** Placeholder
visuals leave the same traces in most projects: references to stock image hosts, filenames
carrying the word placeholder, unnamed default illustrations, and a surface whose image
element has no asset at all. Establish that list at adoption and let it grow. Without it the
seat can only respond to requests, which halves the recipe.

**`development` resolves to more than a local project.** At adoption this connector type
also offers hosted forge and error tracking connectors, which are not the same thing as a
checkout the agent can read component source from. Bind deliberately and verify that the
bound connector can actually read files, because the failure is silent: the recipe still
runs and simply never finds a surface.

**Delivery into a repository is a trust decision, not a file operation.** Writing an asset
into an assets folder and opening a change that references it from a component are
different levels of authority and should be settled once. A generated image committed
without a person seeing it renders in production, which is the one thing the recipe's last
activity exists to prevent.

## What transfers to any project connector

- The render size and the background behind the text come from the code, not the brief.
- Placeholder detection is a maintained list of search shapes, and it is what turns this
  from a request queue into a standing responsibility.
- Where a connector type resolves to several different kinds of thing, verify the bound one
  can do the specific job before trusting an empty result.
