# AMBERHOLD — frozen design (all build sessions implement THIS document)

A beekeeper tower defense for make.fun best-game-01. Canvas 1280×800, plain
ES modules, no build step, no dependencies, no network. Fixed 60 Hz sim;
sim modules never touch the DOM. Everything deterministic from a seed
(mulberry32). Author: an AI agent for NozartXE.

## Fantasy and names (use exactly these)

- You are MIRA, keeper of the Amberhold, defending the GREAT HIVE from pest
  flows. Antagonist: VESPA, the Hornet Queen (boss, flow 9).
- Campaign: 9 FLOWS over 3 seasons — Spring (flows 1–3), Summer (4–6),
  Autumn (7–9). The SWARM GATE moves every flow: it opens on one meadow side
  (EAST / NORTH / WEST, seeded cycle), so last flow's layout leaks this flow.
- WIN: hold all 9 flows and stop Vespa. LOSE: the hive is drained to 0.
- Resources: NECTAR (build currency), HIVE 10/10 (honey drops), SCORE with a
  BUZZ chain multiplier (kills within the chain window raise the chain).
- Special: once per flow, SPACE releases the BEE SWARM (every pest on the
  field takes 25 damage). HUD shows SWARM READY / SWARM SPENT.
- Difficulties: GENTLE / KEEPER / STINGING. Endless: SWARM SEASON, unlocked
  by any win, entered from the results screen (C).

## The meadow grid

- Grid: 15 cols × 8 rows, cell 62 px, origin (176, 128) → board 930×496,
  board bottom y=624. Cell (c, r), centre = origin + (c*62+31, r*62+31).
- HIVE at (7, 4), occupies 1 cell, unbuildable, the pathing target.
- GATES (spawn cells): EAST (14, 3), NORTH (7, 0), WEST (0, 3). Unbuildable.
- ROCKS (fixed obstacles, unbuildable, block pathing): (4, 2), (10, 5),
  (5, 6).
- Pathing: BFS flow field from the hive over cells that are not rocks and
  not occupied by a WAX WALL or the hive itself; ground pests step to the
  neighbouring cell with the smallest distance. A placement that would
  leave any gate with no path to the hive is refused ("THE BEES MUST HAVE
  A PATH" — wax walls may narrow but never seal the meadow).
- WASPS fly: they ignore the field and move in a straight line to the hive.

## Stations (build bar keys 1–5; cost in nectar; sell refunds 70% invested)

1. POPPY TURRET (30) — fast pollen puffs. Range 2.2 cells, dmg 6, 3 shots/s.
2. CLOVER SPRINKLER (40) — dew that slows. Range 2.0, dmg 1, 2 ticks/s,
   applies SLOW 45% for 1.2 s.
3. HIVE CANNON (60) — homing bees. Range 3.0, dmg 16, 0.8 shots/s.
4. WAX WALL (25) — a golden block with 220 HP; blocks pathing; pests that
   cannot path around it chew it (10 dps) instead.
5. QUEEN'S BELL (80, unlocks at flow 4) — every 5 s rings: pests within
   2.8 cells take 10 dmg and are STUNNED 1.1 s.
Upgrades: Lv2 costs 60% of base, Lv3 costs 100% of base (rounded to 5).
Each level: damage ×1.6 then ×2.5 total, range +0.3 cells, wall HP ×1.8/×3.
Selected station panel shows name, level, damage, range, UPGRADE cost (U),
SELL value (X).

## Pests (Keeper stats; hp scales ×(1+0.12×(flow−1)))

- ANT — hp 18, speed 1.15 cells/s, reward 2 nectar, score 10, leak 1.
- MITE — hp 8, speed 1.9, reward 1, score 5, leak 1. Comes in bursts.
- WASP — hp 30, speed 0.85, FLYING, reward 4, score 25, leak 1.
- HORNBORER — hp 160, speed 0.5, ARMOUR: every hit loses 4 damage (min 1),
  reward 8, score 60, leak 2.
- VESPA, THE HORNET QUEEN — hp 2600, speed 0.35, flying, spawns a wasp
  every 6 s, at half health speeds ×1.4 (enrage), reward 150, score 1000,
  leak 5.

## Flows (Keeper composition; spawn one pest every 0.55 s in listed order
groups; difficulty scales counts and hp)

1: 10 ANT · 2: 16 ANT, 4 MITE · 3: 14 ANT, 6 MITE, 2 WASP (NEW: WASP —
flying, ignores the paths) · 4: 20 ANT, 8 MITE, 4 WASP (QUEEN'S BELL
unlocked) · 5: 16 ANT, 10 MITE, 5 WASP, 2 HORNBORER (NEW: HORNBORER —
armoured) · 6: 24 ANT, 12 MITE, 6 WASP, 3 HORNBORER · 7: 28 ANT, 14 MITE,
8 WASP, 4 HORNBORER · 8: 34 ANT, 16 MITE, 10 WASP, 6 HORNBORER ·
9: 20 ANT, 10 MITE, 6 WASP, 3 HORNBORER, then VESPA last.
Difficulty: GENTLE hp ×0.8, counts ×0.85, start nectar 220, rewards ×1.15 ·
KEEPER hp ×1, counts ×1, start 180 · STINGING hp ×1.25, counts ×1.15,
start 150, rewards ×0.9. Flow-clear bonus: 20 + 2×flow nectar.
Gate order: cycle [EAST, NORTH, WEST] rotated by (seed % 3); flow f uses
cycle[(f−1) % 3].

## BUZZ chain and score

A kill within 2.5 s of the previous kill raises the chain (max ×8); the
chain resets when the window lapses. Kill score = base × chain. Floaters
show "+<score> BUZZ x<chain>" when chain ≥ 2 or score ≥ 50; leaks show
"−<n> HIVE" in red at the hive.

## The draft (after flows 2, 4, 6, 8 — four drafts per run)

Heading: "THE GATE MOVES <SIDE> — PICK 1" (the side the NEXT flow uses).
Three boon cards from the pool of 12, seeded by (runSeed, draftIndex),
no repeats of owned boons. Reroll: X, 15 nectar, once per draft.
Forecast strip: next gate, the incoming roster with counts and traits, and
the NEW-pest announcement when the next flow introduces one.
Pool (id, name, effect):
- pollen GOLDEN POLLEN — all damage +20%.
- wax THICK WAX — wax walls +150 HP.
- busy BUSY BEES — all stations attack 15% faster.
- deep DEEP NECTAR — +60 nectar now, flow bonus +10.
- charm CHAIN CHARM — chain window 4 s, max chain ×10.
- heart AMBER HEART — mend the hive +2 (max 10).
- reach LONG REACH — all ranges +0.4 cells.
- dew STICKY DEW — slows are 25% stronger (45% → 56%).
- jelly ROYAL JELLY — all score +25%.
- guard HIVE GUARD — the hive stings adjacent pests for 5 dmg/s.
- thrifty THRIFTY KEEPER — upgrades cost 25% less.
- splash POPPY SPLASH — poppy hits splash 40% damage to pests within
  0.7 cells of the target.

## Feats (6, persisted)

- hold HOLD THE MEADOW — win a run.
- vespa VESPA DOWN — stop Vespa.
- untouched UNTOUCHED — win with the hive at 10.
- buzz BUZZ ×8 — reach a ×8 chain.
- bloom FULL BLOOM — own 8 stations at once.
- rich RICH KEEPER — hold 250 nectar at once.

## Grades (results)

S ≥ 9000 · A ≥ 7000 · B ≥ 5000 · C ≥ 3000 · D < 3000. The results screen
lists every threshold with ✓ or ✗, the run's stat tiles (FLOWS HELD,
PESTS STOPPED, NECTAR EARNED, BEST CHAIN, TIME, LEAKS), run metadata
(difficulty, seed, delta vs best), LAST 3 RUNS from the save (losses in
red, "FELL AT FLOW n"), YOUR BOONS ("k picked from m offers"), the feats
row, a NEXT GOAL line, a per-flow leaks bar graph, and the buttons
"R — RUN AGAIN" (dominant), "C — SWARM SEASON" (only on a win),
"T — TITLE".

## Screens and HUD

Canvas draws: play, draft, results, pause veil. DOM overlays (ui/menus.js
+ style.css) draw: title, how-to, options, field guide (almanac).
Title (over a live demo run on the canvas): wordmark AMBERHOLD filling the
frame width; scope strip "5 stations - 4 pests + the Queen - 9 flows -
12 boons - 3 difficulties"; a six-row icon rules digest with explicit
WIN and LOSE rows; PLAY + BEST + FEATS n/6; three difficulty buttons;
the SWARM SEASON line; HOW TO PLAY / OPTIONS / FIELD GUIDE buttons;
controls footer.
Play HUD (all on canvas): top-left plaque "WIN: HOLD 9 FLOWS" /
"LOSE: HIVE DRAINED"; event banner centre-top; SCORE + BEST top-right
with pause / fast-forward / mute squares; second row: HIVE honey drops
(10, empty ones hollow, red pulse when a leak just happened), NECTAR,
BUZZ xN with its window bar, GATE plaque ("GATE: NORTH — NEXT: WEST"),
the 9-pip flow track with a skull at pip 9 and season names; INCOMING
roster line naming every pest kind in the current flow with counts and
traits; build bar (5 station cards: key, glyph, name, cost; locked bell
shows "FLOW 4"); selected-station panel; START FLOW button in build
phase ("SPACE — SEND FLOW n"), during a flow it shows pests remaining
and SWARM READY / SWARM SPENT; a three-line event log; a controls line
along the bottom.
Draft (canvas): the heading, three large roundel cards (key 1/2/3,
glyph, name, effect line, synergy line), the forecast strip, owned-boons
strip, "X — REROLL 15" and the nectar count.
Pause (Esc/P): veil with resume / restart / title / options.
Options: MUSIC, SOUND, MUTE rows with sliders/keys.

## Audio (WebAudio, all synthesised, no samples)

SFX: place knock, poppy pop, bee launch buzz, hit tick, chew crunch,
bell ring, draft chime, leak sting + thud, win arpeggio, lose descent,
click. Music: a generative pentatonic pluck pattern (triangle osc +
short envelope) over a soft drone; one extra layer per season; separate
music / sfx gains; M mutes.

## Files (every file opens with ONE line of plain English naming its job,
starting with "// " — the dossier outline shows first declarations, so
the comment and the first export names must read as a feature list)

Root: main.ts (kit plumbing: copy game/ + screenshots/ to the output dir
and write dossier.json with buildDossier from vendor/makefun-game.ts,
caps text 163840, screenshots max 4 × 262144), serve.ts (static dev
server for game/ on :8080), game/package.json {"type":"module"}.
game/index.html — doctype, head, the reviewer HTML comment (scope strip,
pitch, win/lose, controls, tech + verification summary), canvas #board
1280×800, the DOM overlay sections (title / howto / options / guide),
script module src/main.js.
game/style.css — overlay styling: cream panels, amber trim, condensed
display type via system fonts only (no webfonts, no network).
Sim (DOM-free): src/config.js (every number above + NAMES + waves +
boons + feats data), src/rng.js (mulberry32), src/grid.js (geometry +
occupancy), src/pathing.js (BFS flow field), src/gate.js (gate cycle),
src/waves.js (spawn lists), src/enemies.js, src/towers.js, src/combat.js
(damage/chain/score/floaters), src/draft.js, src/announce.js (event log +
banner), src/feats.js, src/save.js (localStorage amberhold-save-v1),
src/almanac.js (field-guide rows built from config), src/sim.js (run
state + fixed-step update + screens state machine data).
Render: src/render/layout.js (stage geometry), src/render/board.js (the
meadow diorama: walls, gates, rocks, hive, grass, flowers),
src/render/pests.js, src/render/stations.js, src/render/glyphs.js (boon +
station pictograms), src/render/fx.js (projectiles, particles, floaters,
bees), src/render/scene.js (one frame), src/render/hud.js,
src/render/banner.js, src/render/results.js, src/render/howto.js
(how-to pictures), src/render/ruleicons.js, src/render/fit.js (text
fitting helper).
Shell: src/ui/menus.js (DOM overlays), src/titledemo.js (demo run behind
the title), src/audio.js, src/input.js (DOM events → intent queue),
src/main.js (boot + 60 Hz loop + screen routing).
Staging: src/plan.js (the keeper's rehearsal plan: a fixed build order +
draft picks the staging bot follows), src/testhook.js (only active with
?test=1 or ?shot= in the URL: exposes window.__amberhold with
startRun(seed, difficulty), runBotTo(flow, tick), playScriptedRun(kind),
state snapshot, and sets window.__SHOT_READY when a staged scene is
frozen).

## Verification gates (every session keeps these green)

- The sim runs headless in Node (tools/balance.mjs): the plan wins on
  KEEPER for seed 7 with the hive ≥ 3, wins at least 6 of seeds 1–8, a
  no-build run loses by flow 4, an idle-after-flow-1 run loses.
- Deterministic: same seed + same plan → identical final state hash.
- The browser game boots with zero console errors; a full run can be
  played to the results screen and restarted with R.
