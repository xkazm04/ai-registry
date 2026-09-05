# Subject proposal — `companion-identity`

**Status:** **EXECUTED** - on disk since 2026-08-23 at `knowledge/software-engineering/llm-agent/companion/companion-identity/` (in the bundle index). The line below is the status as it stood until 2026-09-05, kept in place: run `intake-utopia-0905` found five of seventeen proposal status lines lagging the disk and moved them in one change, per the practice rule that the change closing a gap moves its label.
**Status as originally written (stale until 2026-09-05):** dispatched, class `NEW`. This is a forge input, not knowledge.
**Bundle:** `software-engineering`
**Category / subcategory:** `llm-agent` / `companion` (already in `taxonomy.json`)
**Siblings written in parallel:** `companion-runtime`, `conversation-orchestration`
**Engine:** `domain-knowledge-forge` — [`harvest-brief.md`](harvest-brief.md) is the contract.

---

## The gap, measured

The bundle carries 137 subject slugs across 27 categories/subcategories. Nothing owns
the identity of a long-lived personal companion as a design object. Verified four ways
before drafting:

1. **Slug scan.** No subject slug matches `constitution|identity|self|persona|profile|brain|portab`
   except `companion-identity` itself. The nearest slugs by name — `agent-memory`,
   `settings`, `entity-lifecycle`, `versioning-snapshots` — are about a pipeline, a
   preference store, a state machine and a snapshot store respectively.
2. **`grep -ril "self-model"`** over the whole bundle returns exactly **two** files, both
   inside `agent-memory` (`agent-memory.md`, `techniques/memory-governance.md`), and in
   both the term appears only as the *name of a write lane* — "changes to the agent's
   self-model are human-gated, always". Neither says what a self-model is, what it
   contains, who else may write to it, or what a legal change to one looks like.
3. **`grep -ril "operator profile" / "behavioral profile" / "capability inventory" /
   "disk as truth"`** returns **nothing** anywhere in the bundle.
4. **`grep -ril constitution`** returns seven files, all incidental: a replication
   document using the word in its ordinary sense, and six sites where a "constitution"
   is one *layer of an assembled prompt* — that is `prompt-assembly`'s composition
   concern, not a document with an author, an amendment procedure, and a companion
   forbidden from writing it.

## What each adjacent subject does NOT own

| Subject | Owns | Does not own |
| --- | --- | --- |
| `agent-memory` | The whole memory pipeline: working state, episodic capture, consolidation, decay, recall budget, and the governance lanes deciding which writes need a human. | What the self-model *is* as a document; how a legal change to it is expressed; the substrate the memory sits on; what the companion may believe about its person and how that belief is synthesised; whether there is one mind or several. |
| `proactive-nudges` | Machine-initiated contact: evaluators, attention budgets, quiet windows, dedup, efficacy. | Who the initiating self is. It rations a voice; it does not constitute one. |
| `chat-transcript` | The transcript as a rendered document: turns, structured rows, scroll, metadata. | Anything durable. The transcript is a render of one channel; identity survives every channel. |
| `markdown-vault` | Files-as-records under shared custody: frontmatter schema, link graph, integrity lint, mirror indexes. | The *identity* semantics of one specific store — which file is law and which is evolving self, which one the resident may edit, and what an export of "the whole mind" means. |
| `people-analytics-ethics` | What an organisation may say about an employee in a report: naming floors, suppression, aggregate/individual split. | The one-person case, where the measured person is also the sole audience and the reader is a machine that will act on the conclusion for years. |
| `prompt-assembly` | How layers are composed into a context window, budgeted and ordered. | Where a layer's content comes from, who is allowed to change it, and by what procedure. |
| `companion-runtime` (sibling) | The metered model seam, host seam traits, headless turn API, op envelopes and the action catalog, background cycles. | The content those cycles read and write, and the rules governing changes to it. |
| `conversation-orchestration` (sibling) | Everything a conversation does: beats, narration, recall strip, quick replies, walkthroughs, avatar. | Anything that must be true when no conversation is open. |

## The boundary this subject draws

`agent-memory` is the only genuine risk of overlap, and the seam is clean: that subject
owns the **machinery of remembering**, this one owns the **thing remembered about
itself**. `memory-governance` closes a door — self-model writes are human-gated — and
says nothing about what stands behind it. This subject is what stands behind it: a
constitution that is law and never self-written, a self-model that evolves only through
anchored, human-approved diffs, a substrate whose truth is on disk and whose database is
an index, an operator model with an evidence bar and an off switch, one mind addressable
through many mouths, and a portable identity that outlives the application it was born
in.

If a reader is asking "how do I score, decay or recall a memory", they are in
`agent-memory`. If they are asking "what is this companion, who is allowed to change
that, and where does it live when the app is closed", they are here.

## Proposed techniques

`constitution-self-model-split` · `anchored-identity-diffs` · `disk-truth-db-index` ·
`operator-profile-synthesis` · `one-mind-many-mouths` · `capability-exercise-ledger`.
Portability is folded into `disk-truth-db-index` rather than given a seventh slot: an
identity is portable exactly to the degree that its truth is already a folder of files,
so export/import is a property of the substrate choice and not a separate discipline.
