---
layer: technique
type: technique
subject: chinese
technique: terminology-and-variants
status: forged
laws: [one-concept-one-rendering, the-authority-is-a-hypothesis]
shared_with: []
use_when: [scoping Simplified vs Traditional for a release, settling zh renderings for product concepts, auditing term drift across a zh catalog]
---

# Terminology and variants

Two forces make Chinese terminology harder than its grammar: the
Hans/Hant split is a *vocabulary* divergence wearing a script divergence's
clothes, and Mandarin's vast stock of near-synonyms means every English
product concept has three or four defensible renderings — so independent
translators **will** split terms, and the split is invisible to anyone
checking grammar. Both problems yield to the same discipline: one recorded
decision per concept per variant, then mechanical enforcement.

## ZH-VARIANT · Hans/Hant is a terminology split, not a conversion

**Trigger:** planning Traditional Chinese support, or evaluating a zh-Hant
catalog's provenance.
**Rule:** treat zh-Hans and zh-Hant as two locales with separate termbases,
not one locale with two fonts. Character conversion (简繁转换) handles only
glyph shapes; the technical vocabularies diverged decades ago, and the
divergence hits exactly the words a product uses most:

| Concept | Mainland (Hans) | Taiwan (Hant) |
|---|---|---|
| software | 软件 | 軟體 |
| network | 网络 | 網路 |
| server | 服务器 | 伺服器 |
| memory | 内存 | 記憶體 |
| default | 默认 | 預設 |
| print | 打印 | 列印 |
| video | 视频 | 影片 |
| mouse | 鼠标 | 滑鼠 |
| file | 文件 | 檔案 |
| quality | 质量 | 品質 |

A converted-not-translated Hant catalog is instantly recognizable to a Taiwan
user — mainland words in Traditional glyphs — and reads as carelessness, not
as a minor accent. Punctuation diverges with vocabulary: quote glyphs differ
by variant (see the typography rules), and Microsoft publishes *separate*
style guides for zh-CN and zh-TW precisely because the deltas are pervasive.
**Budget rule:** if the product cannot fund a real Hant termbase and review
pass, ship Hans only; a converted Hant locale costs trust rather than earning
reach.

## ZH-REGION-REGISTER · within Hant, Taiwan and Hong Kong are not one register

**Trigger:** a single zh-Hant catalog intended to serve both Taiwan and Hong
Kong.
**Rule:** Hong Kong usage differs from Taiwan in term choice and in
Cantonese-influenced register even in written Chinese. One zh-Hant catalog is
a legitimate cost decision, but it is a decision to *record* — pick the
dominant market's register (usually Taiwan's for zh-Hant) and state it, so a
Hong Kong reviewer's regional preferences are triaged against a ruling
instead of relitigating string by string.

## ZH-TERM-COLLISION · settle collision-prone renderings before translating

**Trigger:** a product concept whose natural Chinese rendering collides with
another concept's, or whose English word maps to several established Chinese
words.
**Rule:** the dangerous renderings are the ones where *both* options are
good Chinese, because no reviewer's grammar sense will catch the drift.
Recurring collision classes in software products:
- 代理 — "agent", but also proxy/reseller/agency in ordinary business
  Chinese; products with a distinct "agent" concept increasingly use 智能体
  to escape the collision.
- 角色 — "role", colliding between a persona/character sense and the
  access-control sense; a product with both concepts must give them
  different words.
- 凭据 / 凭证 — both "credential"; pick one by counting the catalog.
- 审核 / 审批 / 批准 — review vs approval-workflow vs the act of approving;
  one word per concept.
- 发布 / 部署 / 晋升 — release vs deploy vs promote; MT collapses these.
The mechanism: enumerate the product's concept nouns *before* bulk
translation, settle each rendering (and each near-miss it must NOT use), and
record it. In one real catalog the central product concept shipped under
four renderings (41/97/488/59 occurrences) because four sessions each chose
defensibly — the consolidation cost dwarfed what a one-hour upfront ruling
would have.
**POS split sub-rule:** one English word legitimately takes two renderings
when the *part of speech* differs — 监视器 (the monitor, a thing) vs 监控
(to monitor). That is not drift; record it as a pair.

## ZH-LOAN · the loanword line is drawn per term, not per vibe

**Trigger:** deciding whether a technical term stays English or translates.
**Rule:** acronyms and code-adjacent identifiers stay English (API, JSON,
SDK, OAuth, URL…); established domain words translate to their naturalized
renderings, never borrowed — 模型 (model), 令牌 (token), 缓存 (cache), 插件
(plugin), 日志 (log), 提示词 (prompt), 工作流 (workflow). Chinese users read
无令牌 as normal and "无 token" as unfinished. The borderline cases (newer
AI-era vocabulary, product-specific metaphors) get an explicit termbase row
each; "we'll decide per string" guarantees drift. A product name used *as a
name* stays Latin and unspaced-translated regardless of having a dictionary
meaning.

## When not to use this technique

Do not apply mainland terminology corrections to a Hant catalog or vice
versa — a "fix" across the variant line is itself the defect. And do not
consolidate senses a term legitimately splits by POS or by genuine concept
difference: the consolidation signal is mechanical, the ruling on each
candidate is judgment, and a scripted rewrite destroys correct distinctions.
