## Overview

Every 5 levels is a World (levels 1-5 is world 1, levels 6-10 is world 2)
Every 2nd and 4th level is a miniboss (level 2, 4, 7, 9, etc.)
Every 5th level is a boss (level 5, level 10, level 15)

### Bosses & Minibosses

Minibosses introduce medium-difficulty debuffs that require the player to overcome a challenge as they progress through the world
These only apply to the individual level that the miniboss is on

Bosses introduce larger debuffs that can significantly stump players and require more technique and strategy to overcome
Boss effects also only apply to the individual level that the boss is on

### Worlds

Worlds introduce both small debuffs and small benefits that are present throughout each level of that world (Inspired by the PARKS board game, which has different seasons, image in public/)
At the start of each world, i.e. when first starting a game (after selecting dice set and difficulty) or after completing the boss level of a previous world (and choosing "continue to next level" after that corresponding shop), a map of the game will come on screen, showing the player if they have a choice between which world they will visit next. This is inspired by FTL, where the full length of the game is shown on a map of the different sectors that the player can visit, included picture in public/. Sometimes they have a choice, and sometimes there is only one choice. 

Different categories of worlds like in FTL? Or just an assortment of different worlds to visit, like Balatro and PARKS?

To win the game, the player must work their way through 5 worlds, or 25 levels, in order to win the game 
I'd also like to work this into the difficulty levels, e.g. beginner difficulties have to reach level 15, intermediate 25, etc.

## Ideas

### Debuffs 

No 1s / 2s / 3s / 4s / 5s / 6s
No odd values, no even values
No straights / pyramids / pairs / singles / triplets / N-uplets / N of a kind
No repeat combinations
Only play 1 combination (per level? per roll?)
Level threshold increases with time
Level threshold increases with flops (amplification of the flop penalty effect)
Charm disabled
No consumable usage
Material effects
Dice sides become debuffed after use
5 random miniboss effects

### Seasonal

+1 / -1 / x2 / /2 rerolls
+1 / -1 / x2 / /2 banks
2x Straights (mountainous?)
2x N of a kind (plains?)
2x singles/pairs (city?)
2x pyramids (desert?)
x2 end of level $ bonus / banks remaining bonus

## Implementation

### Existing Logic & Systems

Some existing logic can be used or referenced when implementing these new features. For example, how will we actually enforce "straights are worth 0 points" during a particular level or world? Well, we can draw on how we are currently handling difficulties, since that involves certain combinations not being available at specific difficulties.

In general, these new systems will need quite tight integration with all existing systems though, including combination alteration, scoring benefits/debuffs, dice sides, materials, level thresholds, combination counters, rerolls and banks, dice values scored, plus handling and altering the shop and tally phases.

### Map Phase

In between the shop of level 5*N and the start of level 5*N+1 (e.g. in between level 5 shop and start of level 6), we will have a new phase where the player must select which world they would like to visit on the map. 

Similar to the map in Faster Than Light, the player will start on a gray dot, representing their starting point, and they will have a choice of 2-3 starting worlds. This will be dictated by an algorithm that we will create for this system. From there, the algorithm will generate a map for the whole game, branch and converging at each world to create a spider-web-looking map like in Faster Than Light. 

For some general guidelines on this algorithm, the starting point (World 0) should always be one gray dot. The next "column" on the map will be from 2-3 dots, different colors based on their effects. From there, the algorithm can branch or converge anywhere from 1 to 5 worlds for each "column". Although there can be up to 5 world choices per progression of worlds, the player will only ever have a maximum choice of 3, i.e. there could be one branch that has 3 choices after it, and another branch that has 3 choices, and they would share the middle one, for a total of 5 possible choices. However, which choices the player has are dictated by previous choices, i.e. previous branches. For the final boss, World 5, there should be anywhere from 1-3 options. 
