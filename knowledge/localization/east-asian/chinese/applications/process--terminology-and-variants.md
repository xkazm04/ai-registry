---
layer: application
type: application
subject: chinese
technique: terminology-and-variants
stack: process
status: forged
verified_on: 2026-08-24
---

# Process — terminology and variants in a live 14-locale catalog

How the Personas product's Chinese style guide
(`C:\Users\kazda\kiro\personas\docs\i18n\style-zh.md`, companion to
`docs/i18n/glossary.md`) realizes ZH-TERM-COLLISION, ZH-LOAN, and the
counted-authority discipline against the ~11,500-key shipped catalog
`src/i18n/locales/zh.json` (2026-07-10 source audit).

## The collision that motivated ZH-TERM-COLLISION

The guide's "Pitfalls" §3 documents the central-noun drift live: `persona` /
`agent` shipped under **four** renderings depending on which translation
session produced the string — 人格 (41×), 智能体 (97×), 代理 (488×), 角色
(59×). Each choice was individually defensible, which is why grammar review
never caught it. The ruling: persona → 人格, agent → 智能体, always; 代理
banned (collides with proxy/reseller/agency), 角色 banned (collides with the
product's RBAC "role"). This is the technique's claim verified on a real
catalog: collision-prone renderings must be settled before bulk translation,
because 488 occurrences of the majority-wrong form is the price of settling
after.

## Counting before ruling (the authority-is-a-hypothesis law, worked)

Every judgment call in the guide cites shipped occurrence counts rather than
taste: 凭据 (214×) chosen over 凭证 (82×) with the two legacy sidebar labels
explicitly grandfathered; 自愈 over the once-occurring 自我修复; the lone
full-width ％ (1× vs 47 ASCII `%`) ruled a bug, not precedent. The process
shape: sweep the catalog, count both candidates, standardize the minority,
record the ruling in the style file so no later run re-litigates.

## POS-split and loanword rows

The termbase realizes the ZH-TERM-COLLISION POS sub-rule directly:
监视器 (noun, the Monitor page) vs 监控 (verb, to monitor) recorded as a
deliberate pair; 运行 (run, verb/button) vs 执行 (execution, the record)
kept apart against MT's tendency to collapse them. ZH-LOAN rows: 提示词
(prompt, 73×), 令牌 (token, 47×, both LLM and OAuth senses), plus the
proper-name exception — `Director` stays English, unborrowed, because it is
the meta-persona's name, not the job title 总监.

## What stays downstairs

The termbase rows themselves (人格, 连接器, 配方, 晋升…) are product
artifacts and do not ascend to the technique — the technique carries the
collision *classes* (代理, 角色, 凭据/凭证, 审核/批准) and the settle-first
mechanism; this file is where the product-specific table lives and is cited.
