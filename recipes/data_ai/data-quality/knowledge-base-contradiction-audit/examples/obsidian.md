# Obsidian as the `knowledge_base` connector

What was learned mapping this recipe onto an Obsidian vault specifically. Nothing here is
part of the recipe: swap the connector and this file stops applying while the recipe does
not change.

## What the mapping has to decide

**Filenames carry real subject information, and that is a genuine advantage here.** A vault
is filed by hand, so the note title is usually what the note is about rather than a headline.
That makes pairing by subject cheap, which matters because the pairwise body comparison is
what makes this audit expensive and the pairing step is what has to keep it small. Take the
advantage, and resist the obvious follow-on: comparing titles for string similarity is not
the same thing as pairing on subject, and it is how a rename or a naming convention change
turns into a wave of false pairs.

**Wikilinks are the currency signal this corpus actually has.** A vault carries almost none
of the evidence the recipe asks for, since there is no review date, no owner field and no
canonical marker unless somebody invented one in frontmatter. What it does carry is the link
graph: the note the rest of the vault links to is usually the one people treat as current,
and a note nothing links to is usually the one that was superseded and left behind. Report
inbound link counts on both sides of a pair and the human decision gets most of the way
there.

**Frontmatter is whatever this vault agreed to, so read it before assuming any field
exists.** Some vaults keep `updated`, some keep `reviewed`, some keep neither and rely on
the filesystem timestamp, which a sync client will rewrite for reasons unrelated to the
content. Establish at adoption which fields this vault actually maintains, and where the
answer is none, say so in the finding rather than falling back to the file's modification
time as if it meant something.

**Daily notes, templates and archive folders will dominate the pairs if you let them.** A
vault contains large numbers of notes that are structurally near-identical by design, and
they are the highest-similarity pairs in the corpus and the least interesting. Exclude the
folders that hold them before the comparison runs, not after, or the affordable share of the
corpus a pass covers gets spent entirely on them.

**A vault has no server, so the whole corpus is readable at once and that is a trap.** The
comparison is what costs, not the reading, and the absence of a rate limit removes the
natural pressure that would have made someone page the scan. Page it anyway.

## What transfers to any knowledge base

- Pairing on subject and comparing titles as strings are different operations; the second
  is cheap and produces the wrong pairs.
- When a corpus records nothing about currency, its usage or link graph is the next best
  evidence, and reporting the absence is better than substituting a modification date.
- Exclude the structurally repetitive parts of a corpus before comparing, or they consume
  the pass.
