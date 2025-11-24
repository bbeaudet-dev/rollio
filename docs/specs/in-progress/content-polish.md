# Content Polish Specification

## Overview

This specification covers updating and polishing existing content (dice sets, materials, charms, blessings, consumables, and scoring).

### Non-Functional Requirement

## User Stories

**As a player**, I want:

- Variety in dice sets to choose from
- Interesting and balanced charms/consumables
- All materials to have meaningful effects
- A complete set of content to explore
- More scoring combination options

**As a developer**, I want:

- Easy to add new content
- Clear patterns for content creation
- Balanced content for testing
- Complete content set

## Content Sections

### Materials

When considering ideas for materials, ask: "Does this ability correspond mainly to scoring, rolling, held in hand?"

#### Color Palette

**Current Materials:**

- **Plastic**: `#fff` bg, `#333` border, `#333` pips
- **Crystal**: `#f3e5f5` bg, `#9c27b0` border, `#6a1b9a` pips
- **Plant**: `#e8f5e9` bg, `#4caf50` border, `#654321` pips
- **Golden**: `#fffde7` bg, `#ffc107` border, `#f57f17` pips
- **Volcano**: `#ffebee` bg, `#f44336` border, `#c62828` pips
- **Mirror**: `#e3f2fd` bg, `#2196f3` border, `#1565c0` pips
- **Rainbow**: `#ff0000`, `#ffff00`, `#32cd32`, `#4169e1`, `#4b0082`, `#875fff`, `#ff69b4`
- **Ghost**: `#0a0a0f` bg, `#1a1a2e` border, `#f0fff0` pips (black with slight blue, white with slight green)
- **Lead**: `#4a4a4a` bg, `#5a5a6a` border (dark gray with blue tint), `#2a2a2a` pips

#### Plastic

✅ Effect: Basic, no special effects
✅ Code: N/A
✅ Strategy: N/A
✅ Synergy: add charm for "bonus if die has no special material"
✅ Design: standard die, white with black pips

#### Flower / Bloom

✅ Effect: score multiplier based on how many flower dice scored in current level/round
⚠️ Code: implemented for round, need to update to level and nerf the effect
✅ Strategy: maximize number of scored dice, and of same type
❌ Synergy: TBD
✅ Design: green border with pink/yellow/blue flower base colors

-Essentially the same as volcano if it's per round, look into changing to per level

#### Crystal

✅ Effect: 1.25x score multiplier per crystal die held in hand (not scored) - eq. to steel in Balatro
❌ Code: not implemented
✅ Strategy: score minimum number of dice per roll, maximize held in hand
✅ Synergy: could have a Mime (retrigger held in hand abilities); benefits from Lead dice that stay in hand after scoring
✅ Design: shining purple/magenta and beveled?, maybe add turquiose

---

#### Golden / Copper / Emerald

✅ Effect: gain money when banking scored golden die
❌ Code: not implemented
✅ Strategy: economy generation
✅ Synergy: charms the increase scoring based on money
⚠️ Design: gold and shimmering, or copper, or shining green beveled emerald

#### Volcano / Magma

✅ Effect: score multiplier based on hot dice counter
✅ Code: mostly implemented
✅ Strategy: increasing hot dice counter as quickly as possible, more "offensive" strategy
✅ Synergy: volcano amplifier charm for scoring; ghost die for getting quicker hot dice, but decrease scoring?; charm based on hot dice counter per level or total per game
⚠️ Design: magma, like an almost black base with deep oranges and reds crackling throughout it, or just stick with mainly red/fire

#### Rainbow

⚠️ Effect: probability for several unique effects to trigger, e.g. money, score addition, rerolls (eq. lucky in Balatro)
⚠️ Code: partial?
✅ Strategy: retrigger played dice, manipulate probabilities, reliance on luck
⚠️ Synergy: probability charm, retrigger charm, something to do with colors, pips?
✅ Design: shining rainbow

#### Mirror

✅ Effect: all rolled mirror dice copy a random value of a non-mirror die (or random value)
❌ Code: will be tough
✅ Strategy: maximize same values on dice
⚠️ Synergy: can structure dice set to focus on a specific value, different values work with different charms/strategies
⚠️ Design: combination of Balatro's steel and glass, could implement some kind of reflection effect of the dice value

- If a mirror die copies another mirror die, move to a new die (don't recursively copy), or else only search for non-mirror dice somehow, and if false, pick random value
- Can you reroll mirror dice? I mean I guess you could, but you'd have to reroll all of them? What happens if they try to reroll just one? Does it do nothing, or change all of them?
- Need to handle mirror dice during combination checking

#### Ghost

✅ Effect: Ghost dice don't need to be scored to trigger hot dice / Triggers hot dice counter if only ghost dice (or no dice) remain in hand after scoring / Unscored ghost dice do not prevent hot dice
❌ Code: will also be tough
⚠️✅ Strategy: stack hot dice with easier combinations
⚠️ Synergy: charm bonus if <2 dice scored
⚠️ Design: negative-themed, maybe just reversed plastic black with white pips? Or slightly green/phantom tint?

- When scoring dice, if after removing scored dice, only ghost dice (or no dice) remain, trigger hot dice
- Example: Roll 5556 (6 is ghost), score 555 → only ghost die remains → hot dice triggered
- This creates interesting strategic decisions: do you score everything including ghosts, or leave ghosts for hot dice?

#### Lead

✅ Effect: lead dice remain in hand after being scored
❌ Code: will be tough
✅ Strategy: maximize score in current round, nullifies hot dice, harder to flop, more "defensive" strategy
⚠️ Synergy: low hanging fruit (more scoring combos)
⚠️ Design: dark gray with slight blue tint

- Consider, does there need to be SOME way to remove it or get hot dice? Or are you completely forfeiting hot dice? Is this enough of a benefit?
- Wait wait wait, it's not impossible to flop... If I have lead dice, and I'm out of rerolls and no scoring dice, I can still flop... It's just harder to flop because you're not removing as many dice as you keep rolling
- Or you could consider, if I score all of my dice, including lead, should it still give me hot dice and reset my hand? This would make it maybe slightly harder(?) to get hot dice, because imagine I have 5 lead dice, then I need to find a combo that uses all of them. And if I had all lead dice, then the odds of flopping go wayyyyy down, especially if I add in the lower combinations like single pair. Then again, if I institute the limited number of banks, is this strategy still indestructible? Could be. I mean if I got ALL lead dice, which first of all will probably be reasonably difficult, then basically I can continue rolling and racking up my ROUND score basically forever, since the odds that I ever flop are
- Opposite of volcano (volcano wants hot dice, heavy materials prevent it)
- Maybe there is a CHANCE it doesn't get removed instead of 100%? Or a chance to BREAK?

#### Template

❌⚠️✅ Effect:
❌⚠️✅ Code:
❌⚠️✅ Strategy:
❌⚠️✅ Synergy:

#### Fairy Dust / Spectral (Reroll-based)

Material that "leave something behind" when scored - a substance that allows you to change the substance of something else, i.e. rerolls
+1 reroll when scoring spectral die
Pink, cyan

**Alternatives:** Stardust, Pixie

#### Angel / Healing (Lives/Flop-based)

25% Flop prevention when in dice set (if it's held in hand or scored, it's too much thinking, just give them the buff? Or then they forget about the significance of it?)
25% for bank to not take a life/bank/hand
Probability manipulation?
All of these?
Orangey/yellow, glowing, halo

**Alternatives:** Light

#### Moonstone / Lunar (Polarity/Value-based)

Scoring bonus if odd/even, single dice or all dice
Changes requirement each level/round
very light green, phantom

---

### Charms

When considering ideas for charms, ask: "Does this ability correspond to resource management and engine building?"

add:

- Mime, retrigger held in hand abilities
- Hanging chad, retrigger scored dice
- retrigger charms

Maybe build in abilities for lower scoring combos here? Or see difficulties, or blessings

---

### Consumables

When considering ideas for consumables, ask: "Does this ability correspond to a repeatable single-use event?"

- increasing hand size, not so much
- changing a dice material, yes

Common

- Create a random Charm
- Create 2 random consumables
- Create the last consumable used
- Apply consumable creation pip effect to the face-up side of a selected die
- Apply hand upgrade pip effect to the face-up side of a selected die
- Apply money pip effect to the face-up side of a selected die
- Apply two-faced pip effect to the face-up side of a selected die
- Apply wild pip effect to the face-up side of a selected die
- Apply blank pip effect to the face-up side of a selected die
- Add $$ corresponding to the value of your consumables, charms, and blessings
- Double money, up to $xx
- Copy a selected side of a selected die to a selected side of another selected die (copies pips and pip effect)
  e.g. a consumable 5 on ghost die copied to a side of a lead die will copy the 5 and the consumable effect, not the material. Can choose 2 sides of the same die.
- Chisel: Increase the values of 2 selected sides by 1 (cannot be same die)
- Pottery Wheel: Decrease the values of 2 selected sides by 1 (cannot be same die, or same side)
- Create 2 hand upgrades

Rare

- Copy the material of a selected die to another selected die
- Chance/guarantee to add a standard die to your set/hand
- Deletes a random/selected die, adds a charm slot
- Upgrade all hands by 3
- Create a Legendary charm
- Create 2 Rare charms
- Delete 2 random charms, then copy 1 random remaining charm

---

### Blessings

When considering ideas for blessings, ask: "Does this ability correspond to a one-time non-repeatable action?"

- +1 base rerolls / +2 / +3
- +1 reroll when flopping / +1 reroll when banking / +$3 for each reroll used
- +1 base banks/lives / +1 / +1
- +1 charm slot / +1 consumable slot / +1 charm slot
- blank / +1 blank die / +1 copied die
- Reroll boss / x / select boss
- Flop prevention chance
- Money: +$1 for unused lives, increased interest
- Shop discounts
- Added shop slots
- Shop rerolling
- Frequency of charm/consumable/hand upgrade cards in shop
- Dice purchaseable in shop
- Go back levels

Avoid

- advanced combinations unlocked, MAYBE tier 1?

#### Shop-Related Blessings (Requires Shop Improvements)

- **Extra Shop Slots** (Tier 1/2/3): Increase the number of charm/consumable slots in the shop by 1/2/3
  - Similar to Balatro's "Extra Hand" blessing that increases shop slots
  - Tier 1: +1 charm slot, Tier 2: +1 consumable slot, Tier 3: +1 blessing slot
- **Booster Pack** (Tier 1/2/3): Add an extra booster pack to each shop
  - Tier 1: 1 extra booster pack per shop
  - Tier 2: 2 extra booster packs per shop
  - Tier 3: 3 extra booster packs per shop
- **Blessing Access** (Tier 1): Any tier blessing can show up in the shop regardless of unlock status
  - Alternatively, this could be a charm instead of a blessing
  - Allows access to higher-tier blessings earlier in the game

**Implementation Requirements:**

- These blessings require the following shop improvements to be implemented first:
  1. Shop reroll system (pay money to reroll shop inventory)
  2. Items going away when purchased (not auto-refilling slots)
  3. Booster pack system (packs that contain random items)

---

### Dice Sets

When considering ideas for dice sets, ask: "Does this ability correspond to a game-wide benefit present from the beginning, which can interact with more transient abilities?"

How many dice sets?

- Balatro has 15 decks
- I think I could aim for like 18? (6x3)
  - especially if I designate different groups like beginner, intermediate, advanced, chaos?
  - or maybe I just keep the sets simple and build complexity into the challenge runs

What can we change:

- Starting money
- Number of dice
- Rerolls
- Lives/banks
- Charm slots
- Consumable slots
- Materials of dice
- Starting blessings / consumables / charms
- Level thresholds
- Valid scoring combinations
- Game rules (Balatro Challenges)

#### Basic (+$5)

Dice: 6 standard plastic dice
Money: $10
Charm Slots: 4
Consumable Slots: 2
Blessings/Charms/Consumables: N/A
Rerolls: 3
Lives/Banks: 4
Other: N/A
Unlock: N/A

#### Hoarder / Collector (+2 dice, -1 charm/consumable slots, -1 reroll)

Dice: 8 standard plastic dice(number, materials, sizes)
Money: $5
Charm Slots: 3
Consumable Slots: 1
Blessings/Charms/Consumables: N/A
Rerolls: 2
Lives/Banks: 4
Other: N/A
Unlock: Increase hand size to 8

#### Low Baller (dice values 1/2/3, no rerolls)

Dice: 5 plastic dice, values 1,1,2,2,3,3 / OR 4-sided dice?
Money: $5
Charm Slots: 4
Consumable Slots: 2
Blessings/Charms/Consumables: N/A
Rerolls: 0
Lives/Banks: 4
Other: N/A
Unlock: Use 0 rerolls for 3 consecutive levels

#### Material Sets

Dice: 6 standard [material] dice
Money: $5
Charm Slots: 4
Consumable Slots: 2
Blessings/Charms/Consumables: N/A (or material-specific charms)
Rerolls: 3
Lives/Banks: 4
Other: N/A
Unlock: Have a set of exclusively [material] dice

#### Template

Dice: (number, materials, sizes)
Money: $5
Charm Slots: 4
Consumable Slots: 2
Blessings/Charms/Consumables: N/A
Rerolls: 3
Lives/Banks: 4
Other: Level Thresholds, Combinations, Game Rules
Unlock:

---

### Pip Effects

Effects

- Money
- Create Random Consumable
- Upgrade Scored Hand(s)
- Two-Faced
- Wild
- Blank (^1.1 score?)

What makes consumables balanced in Balatro is that you have 52 cards, each with a value and a suit, to fix, and you can add enhancements, editions, and seals.
That's 52 _ (1 suit + 1 value + 1 enhancement + 1 edition + 1 seal) = 260 elements to change
Whereas right now, all I have is my 6 dice and their materials
So, if we allowed players to manipulate values, well that's 6 _ (6 + 1) = 42 elements.
And if each side had a "pip effect", then we would have 6 \* (6 + 6 + 1) = 78 elements.

What could the pip effects be?

- Money - +$1 when scored, icon is a coin with $ in the middle
- Multiplier - x2 score
- Playable as single, if I apply to a 4, I can play it as a single (similar to wild, effect might be useless if you apply to a 1 or 5)
- Like theoretically it could be any of the dice materials, like ghost, steel, mirror, etc., but I don't think it needs to. Like the materials need to be more universal or far-reaching, whereas dice sides are just a chance for some smaller effects to happen sometimes. Like materials are almost more akin to seals, side values are akin to card values, and then pip effects are more like enhancements. But I've already kinda used my enhancement ideas on the materials.
  I could just reverse it lol, so pip effects when scored are money, create consumable, two-faced, hand upgrade
  Oof, two-faced would be so fucking hard to implement
  I'm actually leaning towards adding wild too

See Shop section for applying these consumables

### Customization / Visualization

We should have a "View Dice Set" menu/modal like there is a "View Deck" mode in Balatro.
Opening this allows you to see the dice in your set, their materials, all side values, pip effects, etc.

---

### Scoring

#### Combination Categories & Unlocking

See game difficulty for more
Categorize combos:

Beginner (available at lower difficulties)

- single1, single5
- pair, twoPair
- 3oaK?, smallStraight?, fullHouse?

Intermediate (always available, basically matching Farkle)

- 4oaK, 5oaK
- mediumStraight(6)
- threePairs
- twoTriplets
- smallPyramid(321)

Advanced (must be unlocked, like 5oaK in Balatro; basically includes combos that involve increasing hand size)

- largeStraight(7+)
- biggerPyramids(1234, 12345, 123456)
- biggerHouses() - wait is this just the same as a pyramid but without the 1? Because in order to maintain the 2/3 disparity, we have to rule out triplets, quads, etc. So what are we left with? 234? 2345? I think we can eliminate this.
- fourPairs+
- threeTriplets+
- twoQuadruplets+
- xYlets where x>1 and Y>single, e.g. "sevenSextuplets" - goal is to write algorithm instead of manually setting a limit on combos

Ability (separate from being unlocked, must have corresponding item)

- single3 - low hanging fruit

**Current Combinations**:

- God's Straight (1-10, requires 10 dice)
- Straight (any 6 consecutive numbers)
- Four Pairs (requires 8 dice)
- Three Pairs (requires 6 dice)
- Triple Triplets (requires 9 dice)
- Two Triplets (requires 6 dice)
- Seven of a Kind
- Six of a Kind
- Five of a Kind
- Four of a Kind
- Three of a Kind
- Single One
- Single Five

**Proposed New Combinations**:

1. **Small Straight** (4-5 consecutive numbers)
2. **Big Straight** (6 consecutive numbers)
3. **Two Pair**
4. **Single Pair**
5. **Full House / bigger houses** (3 of a kind + pair)
6. **Pyramid** (444 55 6 pattern - three of one, two of another, one of another)
7. **Big Pyramid** (larger pyramid pattern)

**Implementation Notes**:

- Need algorithm that checks for X length straight, X pairs, X triplets, X quadruplets, X Y-lets, pyramid patterns
- Should integrate with existing partitioning system
- Need to update `findAllPossibleCombinations()` and `hasAnyScoringCombination()`

#### Combination Probabilities & Points

**Note**: See `probability-engine.md` for the complete Probability Engine specification.

**Total Outcomes:** 6^6 = 46,656

| Combination        | Ways   | Ways/Total    | Probability | Percentage | Proposed Points |
| ------------------ | ------ | ------------- | ----------- | ---------- | --------------- |
| One Pair           | 45,936 | 45,936/46,656 | 0.9846      | 98.46%     | 10              |
| Single Five        | 31,031 | 31,031/46,656 | 0.6651      | 66.51%     | 50              |
| Single One         | 31,031 | 31,031/46,656 | 0.6651      | 66.51%     | 100             |
| Small Straight (4) | 17,640 | 17,640/46,656 | 0.3781      | 37.81%     | 300             |
| Two Pairs          | 20,100 | 20,100/46,656 | 0.4308      | 43.08%     | 150             |
| Three of a Kind    | 17,136 | 17,136/46,656 | 0.3673      | 36.73%     | 400\*           |
| Small Straight (5) | 5,040  | 5,040/46,656  | 0.1080      | 10.80%     | 500             |
| Four of a Kind     | 3,426  | 3,426/46,656  | 0.0734      | 7.34%      | 1,000\*         |
| Full House         | 2,100  | 2,100/46,656  | 0.0450      | 4.50%      | 1,000           |
| Three Pairs        | 1,800  | 1,800/46,656  | 0.0386      | 3.86%      | 1,200           |
| Straight (1-6)     | 720    | 720/46,656    | 0.0154      | 1.54%      | 2,000           |
| Two Triplets       | 300    | 300/46,656    | 0.0064      | 0.643%     | 2,500           |
| Five of a Kind     | 186    | 186/46,656    | 0.0040      | 0.399%     | 2,500\*         |
| Pyramid (122333)   | 60     | 60/46,656     | 0.0013      | 0.129%     | 3,000           |
| Six of a Kind      | 6      | 6/46,656      | 0.0001      | 0.0129%    | 4,000\*         |

\* Point values vary by face value:

- Three of a Kind: 100 × face value (1s = 1,000)
- Four of a Kind: 250 × face value
- Five of a Kind: 500 × face value
- Six of a Kind: 1,000 × face value

**Note:** These categories are non-exclusive - a single roll can satisfy multiple patterns simultaneously (e.g., 333444 counts as three of a kind, two triplets, two pairs, one pair, and full house).

#### Combination Upgrades

Per hand, or maybe categorize like in Cryptid?

Fits in with hand upgrade pip effect
Actually yeah I'm thinking that the pip effect will upgrade the played combination(s), while the ones that show up in the shop will be grouped

#### Scoring Calculation & Interaction

Balatro

- Held in hand
  - Suit, Value, Number/Face, Material
- Scored
  - Suit, Value, Number/Face, Material, contains combo, is combo, first/last
- Discarded
  - Suit, Value, Number/Face, Material, Poker hand, number of cards, first/last
    Yeah there's too much to classify it all perfectly
    Because then there's also like per-card scored vs. per-hand scored, etc.

Rollio

- Game actions:
  - Played this round
  - Played this level
  - Played this game
  - Rerolled
  - Rerolls used
  - Lives left
  - Lives lost
  - Unscored / held in hand
  - Scored
  - Banked
  - Contains combo
  - Is combo
  - Number of dice scored
  - Number of dice in set
  - Number of dice in hand
- Content
  - Charms
  - Consumables
  - Blessings
  - Materials
  - Dice Sets
  - Combinations
  - Levels / bosses

This is where game design gets interesting. It's almost like making a circle of points and creating a web between them. If I have dice and materials, what are the links between them? Then if I add charms, how do charms interact with both dice and materials, and how do dice react to the relationship between materials and charms? It becomes exponentially more complex.
Do I just create a "complete web"? Do I create a line between every possible relationship? E.g. a dice set for every configurable quality? A material for every strategy?
No, that's not quite what you want. What you want is emergent complexity.
Design a simple system and let complexity grow out of it. This is the way

---

### Shop

#### Current Shop System

The shop currently:

- Generates 3 random charms (excluding owned ones)
- Generates 3 random consumables (10% wishes, 90% whims, excluding owned ones)
- Generates 1 random blessing (tier-based unlock system)
- Items are auto-refilled when purchased (slots don't empty)
- No shop reroll functionality
- No booster pack system

#### Shop Improvements Needed

**1. Shop Reroll System**

- Allow players to pay money (e.g., $2-5) to reroll the entire shop inventory
- Reroll should generate new random items (charms, consumables, blessings)
- Cost could scale with level or be fixed
- Could be a blessing that reduces reroll cost or allows free rerolls

**2. Items Going Away When Purchased**

- Currently, when an item is purchased, the slot auto-refills with a new item
- Change behavior so purchased items leave empty slots
- Empty slots remain empty until next shop visit or reroll
- This makes shop decisions more meaningful and allows for "saving" money for better items

**3. Booster Pack System**

- Booster packs contain random items (charms, consumables, or mixed)
- Packs can be purchased from the shop
- Opening a pack reveals items that can be immediately used or added to inventory
- Different pack types:
  - **Charm Pack**: Contains 1-2 random charms
  - **Consumable Pack**: Contains 2-3 random consumables (whims/wishes mix)
  - **Mixed Pack**: Contains 1 charm and 1-2 consumables
  - **Blessing Pack**: Contains 1 random blessing (tier-appropriate)
- Pack prices should be cheaper than buying individual items but with less control

**4. Shop Slot Management**

- Support variable number of slots per category (charms, consumables, blessings)
- Blessings can modify slot counts
- UI needs to handle empty slots gracefully

#### Using Consumables

There is a difference between a consumable pack and having it in your inventory.
Ok so when you open a pack in Balatro, you get a random subset of cards that you can use the tarots on immediately. Or, if you have one in your inventory, you can wait to select the card you want.
Similarly, opening a pack in Rollio brings up ALL of your dice, but you may only apply the items to the single side shown on each of the dice. OR, if you have the item in your inventory, you can wait to roll the value that you want and then apply the consumable then! This would happen when selecting dice to score, you would just select a die and use the consumable.

---

### Level Design

Every 5 levels is a World
Levels 1-5 is always the same "Base" world
The third level of each world is a miniboss, i.e. on every 3 and 8 level
The final level of each world is the main boss, i.e. on every 5 and 0 level

---

### Challenges

When considering ideas for challenges, ask: "Does this set of constraints/abilities create a unique game scenario? Can this scenario be replicated in the vanilla game with ease?"

I thought this might coincide with dice sets, since if an idea doesn't work perfectly for a dice set, it could always become a Challenge, especially when it comes to starting with charms/consumables/blessings or changing major game rules

Technically Jokerless is just charmSlots = 0
money earned cannot exceed number of dice, etc.

---

### Game Difficulty

#### Names / Themes

Coins: Silver, Gold, Copper
Gems: Ruby, Sapphire, Emerald, Diamond

#### Plastic

All scoring combinations available
No restrictions / debuffs on rerolls, banks, etc. (maybe even added rerolls, banks, etc.)
Standard level progression / point thresholds

#### Copper

Beginner scoring combinations not available

#### Silver

Higher level threshold scaling

#### Gold

Level completion bonus is only for miniboss and boss levels

#### Diamond

-1 banks/rerolls/charmslot/consumableslot



#### Available Scoring Combinations

Honestly I think this might be the best place to handle which scoring combinations are available.
Like on easy mode, which is where all new players would start, you'd have pair, two pair, small straight, single5/1, etc.
Then when they move up a difficulty and see "no beginner combos", their brain will understand, "ohhh wow I need to play those higher combos now". But if they start out not understanding why they can't play a two pair, they will just be confused and annoyed.
See Scoring section for more details

#### Charm Modifiers

Rental, Temporary, Eternal
Materials from Cryptid? Astral, bugged, etc.

---

### Banks vs Lives System

Players can get infinite points by never flopping. There's no real constraint on how many rounds they can play, so we should replace the Lives system with a limited number of Banks. However, if they are only limited by number of banks, then players could continue flopping indefinitely until the "perfect round" comes up, so we should keep some kind of constraint where "3 consecutive flops" ends the game.

Instead of having 3 lives that get decremented on flops, players have a limited number of banks (e.g., 3-5 banks per level). Each time a player banks points, they consume one bank. This incentivizes players to go for higher scoring per bank (since banks are limited). Higher scoring attempts = more risk of flops

Instead of "3 flops in a row = -1000 points", change to "3 flops in a row = game over"?
This creates a strategic tension:
  - Players can use flops strategically to extend their chances at getting a good hand
  - But they can't flop forever - only 2 flops before game over

---

## Charm Implementation Tracking Systems

The following charms require new tracking systems to be fully implemented. These systems should be added to support the charm functionality:

### Round-Scoped Tracking (Instance Variables - Reset Each Round)

- **Perfectionist** - Already implemented with instance variable `consecutiveAllDiceScored`

### Persistent Tracking (GameState/RoundState - Persists Across Saves)

#### Round Completion Tracking

- **PennyPincher** (Common) - Needs to track rounds completed without flopping
  - Track in `RoundState` or `GameState.history`
  - Increment counter when round ends without flop
  - Reset when flop occurs

#### Level Completion Tracking

- **OneSongGlory** (Common) - Needs to track level completion with bank count
  - Track banks used when completing level
  - Check if only 1 bank was used for the entire level

#### World Completion Tracking

- **DigitalNomad** (Common) - Needs to track world completion (every 5 levels)
  - Track when level 5, 10, 15, etc. are completed
  - Trigger bonus when world is completed

#### Reroll Granting System

- **SecondChance** (Common) - Needs reroll granting system
  - Grant +1 reroll per level at level initialization
  - Should be handled in `calculateRerollsForLevel` (already has charmManager support)

#### Consumable Use Tracking

- **WhimWhisperer** (Uncommon) - Needs consumable use tracking
  - Track when whims are used
  - 25% chance to not consume when used
- **WhimWisher** (Rare) - Needs consumable use tracking
  - Track when whims are used
  - 10% chance to create random wish when whim is used

#### Dice Removal Modification System

- **LeadTitan** (Rare) - Needs dice removal modification system
  - If at least one Lead die is scored, all scored dice remain in hand
  - Modify `removeDiceFromHand` logic to check for this charm

#### Hot Dice Trigger Tracking

- **BodyDouble** (Rare) - Needs hot dice trigger tracking with ghost dice
  - Track when hot dice is triggered with unscored Ghost die remaining
  - Increment hot dice counter by +1 when condition is met

#### Material Effect Guarantee Systems

- **Inheritance** (Rare) - Needs rainbow effect guarantee system
  - Guarantee one Rainbow effect triggers per Rainbow die scored
  - Modify rainbow material effect application logic
- **Resonance** (Rare) - Needs crystal bounce effect system
  - 1 in 3 chance for crystal dice to bounce off each other
  - Repeat effect until failure
  - Modify crystal material effect application logic

#### Counter Systems

- **Bloom** (Rare) - Needs flower counter system
  - Track flower counter in `RoundState` or `LevelState`
  - Each flower die scored adds 3 to counter
  - Counter persists across rounds/levels as needed

#### Charm Position Tracking

- **Paranoia** (Rare) - Needs charm position tracking
  - Track position of charms in charm array
  - Copy effect of charm to left/right, alternating each roll
- **MustBeThisTallToRide** (Rare) - Needs charm position tracking
  - Track position of charms in charm array
  - Copy effect of charm above/below if level >= 10

#### Dice Set Size Tracking

- **QueensGambit** (Rare) - Needs dice set size tracking and dice removal tracking
  - Track original dice set size
  - Track current dice set size (after removals)
  - Calculate multiplier based on difference

### Implementation Notes

- **Hybrid Approach**: Use instance variables for round-scoped tracking (like Perfectionist), and GameState/RoundState for persistent tracking
- **Charm Access**: Charms should access tracking data via context objects (CharmScoringContext, CharmBankContext, etc.)
- **State Management**: When adding new tracking fields, ensure they're properly serialized/deserialized for save/load functionality
- **Initialization**: New tracking fields should be initialized in factory functions (`createInitialGameState`, `createInitialLevelState`, etc.)

---

## TO-DO LIST

[X][X][X][X][ ] Charms
[X][X][X][X][ ] Materials
[X][X][ ][ ][ ] Consumables
[X][X][ ][ ][ ] Blessings
[X][X][X][ ][ ] Pip Effects
[X][X][X][X][ ] Combinations
[X][X][X][X][X] Lives vs. Banks

Rename "Material" to "Essence"
add Angelic (rerolls/flops/banks) and Lunar (points, polarity) essences (is this too many?)

New charms for angelic - increase odds, 
New charms for lunar - more points, different triggers

Rename hoarder charm to frequentFlyer or Regular, something with like someone who comes to the bank often
New charm for multiplier based on dice set size (do we have this already?)

Could use more dice sets, but not sure how to balance
Different Essences would make for the coolest looking sets, but might be overpowered. Balatro has no decks focused on enhancements/seals, only values, discards, hands, scoring, starting items/blessings, special abilities like double Tags

Add achievements

Move to new Spec:
- "View Dice Set" modal
- Challenges, difficulties, levels, worlds


new charm/consumable: turns your negative points positive
    
new charm - save 50% of points lost when flopping
new charm - gain some other bonus that scales with flop penalty
Rework sandbagger

Rework difficulties?
We have a d6 now?
But don't want to flood the game with sooooo many difficulties.

Wasnt there a consumable to change the material of a selected die? Not implemented

Some kind of assassin charm based on reroll ranger 2 picture
Charm: against the grain: provides bonus when playing straights, pyramids, n=3 pairs? with a mirror die

CAstle Crashers inspiration
On level up, add points to differnet combinations!!!