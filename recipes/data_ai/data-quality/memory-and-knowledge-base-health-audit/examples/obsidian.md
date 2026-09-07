# Obsidian as an audited vault (`knowledge_base`)

What was learned mapping this recipe onto an Obsidian vault specifically. Nothing here is
part of the recipe: swap the connector and this file stops applying while the recipe does
not change.

## What the mapping has to decide

**A vault keeps no usage record, so the strongest evidence this recipe asks for is simply
not available here.** There is no view count, no search log, no record of what somebody
looked for and did not find. That is worth stating rather than working around: on this layer
the audit degrades to structure and age, and the findings should say so, because a ranking
built on age presented as a health assessment is the failure the recipe names in its own
need statement.

**Modification time is unreliable in a way that is easy to miss.** A sync client, a git
checkout, a bulk plugin operation or a vault move rewrites file timestamps wholesale, so a
vault that was migrated last month can present as entirely fresh. Prefer a date the note
carries in its own frontmatter, and where a vault keeps none, report the age finding as
unverified rather than quietly using the filesystem's answer.

**Orphan detection is the one thing a vault does better than most corpora.** Unresolved
links, where a note links to something that does not exist, and notes with zero backlinks are
both cheap to compute and genuinely meaningful, because a vault is linked by hand and a note
nothing points at was usually left behind rather than deliberately standalone. These are the
findings to lead with here, since they are the ones the evidence actually supports.

**Ownership usually does not exist, and pretending otherwise produces noise.** A personal
vault has one author; a shared one has whatever git history records. The recipe's lost
ownership finding is real only where the vault is version controlled or the frontmatter
declares an owner. Where neither holds, skip the category and note it skipped rather than
attributing every note to whoever last touched the file.

**Attachments, daily notes and templates will dominate any count.** They are numerous,
structurally repetitive and almost never worth a finding, and a first pass that includes them
will hit the per category cap before reaching anything a person wants to see. Exclude them by
folder before scanning, and say in the pass what was excluded.

**A vault is the layer most likely to be absent.** This recipe audits several memory layers
and the vault is the optional one, which is why skipping it quietly and noting it, rather than
failing the pass, matters more here than anywhere else in the scope.

## What transfers to any audited layer

- Ask what evidence the layer can actually supply before ranking on it, and say plainly where
  a category degraded to age alone.
- A filesystem timestamp is a claim about the file, not about the content; prefer a date the
  content carries.
- Exclude the structurally repetitive parts before scanning, or they consume the cap that was
  protecting the reader.
