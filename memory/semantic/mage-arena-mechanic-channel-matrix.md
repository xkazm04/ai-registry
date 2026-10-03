---
kind: semantic
confidence: 0.6
namespace: mage-arena
source: decision-record
---

# Mage Arena: which channel has solved which mechanic

A living matrix for the channels described in [[mage-arena-channels-and-shared-canon]]. A cell says where a mechanic
stands in that channel and **what evidence proves it**. Before designing a mechanic in one channel, read its row: if
another channel already solved it, start from that answer and note only what the new channel changes (input, camera,
comfort). Confidence is 0.6 because most VR cells are plans, not results; raise a cell only with evidence.

Status words: **designed** (on paper) - **simulated** (a headless run supports it) - **played** (a person played it
and certified the feel) - **shipped**.

| Mechanic | Desktop / TV build | VR build | Transfers as |
|---|---|---|---|
| Tier clock (spell tiers unlock every 15 s; a perfect absorb advances it) | simulated: wave sims of the arena kernel | simulated: C++ port matches the desktop/TV kernel on 45 conformance vectors (mage-arena-vr T06/T07, commit c94281f); wrist-cuff HUD designed | rule + data, unchanged |
| Directional absorb with a 0.15 s perfect window | simulated | simulated: C++ port matches the desktop/TV kernel on 45 conformance vectors (mage-arena-vr T06/T07, commit c94281f); palm-ward detector timed from motion onset holds the 0.15 s window through 100 ms injected latency on synthetic clips (T04) - real hands in November | rule unchanged; the window is a per-channel tuning |
| Spell lines climbing tiers in place; Flow (rotate lines within 2 s) | simulated, numbers recalibrated (e.g. the Bolt's damage was cut after simulation) | simulated: C++ port matches the desktop/TV kernel on 45 conformance vectors (mage-arena-vr T06/T07, commit c94281f); drawn-sigil recognizer >= 91% on synthetic and mouse corpora (T03) | rule + data; selection input differs |
| Threat language (element colour = absorb, steel = dodge, black core = leave) | designed | designed: greybox must honour it | rule; colours restated per art style |
| Enemy roster and AI mage competence | simulated | simulated: C++ port matches the desktop/TV kernel on 45 conformance vectors (mage-arena-vr T06/T07, commit c94281f) (duels at competence 1 and 1.5, soldier and creature bouts) | data + AI rules |
| Fire school (Heat, fire spells) | NOT implemented: duels are water proxies; fire spells are data only | not implemented (data loaded only) | open: the rule-owning channel decides who implements it first |
| Moving and dodging | WASD, roll, sprint | blink between three pads within arm's reach (seated) | NOT shared: input and camera specific |
| Camera | oblique top-down, about 55 degrees | first person, seated | NOT shared |
| Camp, schools, LLM Director, season | designed (desktop/TV only) | cut for the competition slice | lore and names shared |
| Art direction | chosen for that channel | greybox, shortlist chosen later | NOT shared by default |

## How to update a row

Change the cell, cite the evidence by repo and file or test name (no machine paths), and if the mechanic changed in a
way the other channels should adopt, file it as a change request in the data-owning channel.
