
Dice:
- Should we add dice sizes? d4 d6 d8 d10 d12 d20

Materials:
- There might be too many materials? Or too many material-specific charms? The shop seems a bit saturated with charms that only pertain to one specific material. That would be like in Balatro having jokers related to having holographic cards or specific seals. Not sure what to do about this yet. 
    - Maybe do the 2-tiered system, or remove a couple, or remove charms, or even move some of the charms abilities to the materials themselves 
        - e.g. Lead could just be able to trigger hot dice in the first place? And therefore lead dice would never be "removed", but other dice could be added back
        - Golden could be merged with Rainbow tbh
        - volcano/flower/crystal are all kinda similar
        - Ghost could gain Body Double ability
- Need some other way to get materials (or like a new freebie, creates a die with a random material?)

Pip Effects:
- Generally feel a little inconsequential
- Wild, Two-Faced, and Blank are all kinda similar and are probably very game-breaking right now

Consumables:
- Pottery wheel (and maybe chisel) appear to be decreasing value of ALL sides? I used it on 2 standard dice and when I went to the Dice Set viewer, those 2 dice were 1 1 2 3 4 5 (I decreased the 6s to 5s)
- Welfare seems to only work on combinations that are higher than level 1
- Money consumables don't abide by $100 maximum
- Garage sale seems to be calculating value on buy value? Also, consider removing blessings from calculation
- Echo description still doesn't show last-used consumable
- Tuplets consumable not upgrading correctly
- Hospital is underpowered with new flop system, maybe obsolete
- Basically infinite shop vouchers once you have enough money and all blessings

Charms:
- Need overall redistribution of charm scoring, e.g. PTS, MLT, EXP, when, how much, rarity, etc.
- Some old charms need deleted/updated/reworked, like flop prevention, dice size, reroll
- Add a charm-duplicate charm like Invisible Joker (need some other way to copy charms without Frankenstein)
- Add retrigger charm (think Cryptid mod)
- Copying charms probably don't copy a lot of effects
- Duke of Dice doesn't work, needs refinement
- Refinery does not work
- Fix Russian roulette, 

Blessings:
- money per bank blessing is cumulative? So ends up being $7 per bank? Is that planned or a mistake? $7 is a lot
- Flop subversion blessing just kinda sucks, not updated with new systems
- Idea: +1 consumable slot also adds +1 consumable in shop; +1 charm slot also adds +1 charm in shop, final tier unlocks tier 3 blessings???? But it is itself a tier 3 blessing? TBD

Inventory:
- cannot scroll down to view charm descriptions in second row, snaps back up
- layout of charms/consumables/blessings/options is not great
- arrangment of charms as you add more slots, could be better
- Idea: move blessings to a blessings modal, or combine combinations/blessings/dice set all into one modal
    - Move consumables underneath options, have charms be main inventory component
- Moving charms during scoring breakdown is VERY buggy, seems to retrigger the entire scoring breakdown each move?
    - Disable selling and moving charms during breakdown
    - Disable selling consumables during breakdown
    - Enable charm/consumable selling after breakdown / before rolling again (currently cannot)
- Limit number of legendary charms in inventory?

Worlds, Levels, Bosses, Minibosses, etc.
- Rename worlds to visit and effects
- Rework effects, add effects, designate as miniboss/boss
- Idea: seasons? Winter reduces points, summer something with hot dice, fall something with certain combinations "falling" and unable to be used, spring could be something
- Better background effects, plus they are very laggy, kind of like dice difficulty effects

Combinations & Scoring:
- Combination upgrade system needs refining
    - Need to go through and set increments / bases that align with each combination
    - Need to tweak base combination points - straights are OP
    - Colors of levels still clash, especially level 1
    - MLT is too reliant on charms right now, can have tons of EXP but still 1x MLT
- Game gets very laggy when checking combinations for 10+ dice
- Add visual indicator of combination upgrade, i.e. not just in modal
- Sort out Tuplets formatting, I think it's getting messy

Shop:
- "Next Level Preview" does not show actual level info. Also changes everytime a consumable/item is used?
- 1 blessing per shop is too much, player ends up having all blessings by world ~3
- Add "Buy & Use" button to consumables in shop (can be done when consumable slots are full)
- Add current level/world to shop display

Scoring Breakdown / Preview:
- Start to remove steps that do nothing (e.g. charms that don't or can't activate, ghost material, etc.)
- Start to remove text-based steps
- Improve highlighting and visuals during each scoring step
- Add cumulative charm incrementing steps
- Consistent formatting
    - Rework consumable/charm/blessing formatting system
    - Number formatting applying to bars but not to scoring preview / breakdown (decimals and commas)
- No lunar sound/step during scoring?

Setting Modal: 
- default speed is Normal, but clicking the right arrow brings user to "Very Slow" instead of "Fast"

Tally modal
- Add Vouchers gained to Tally modal
- Tally modal does not show correct $ per bank 

Board:
- Something weird happening. Used alchemist, got Lead, used again and got Volcano. Selected all dice, scored all dice, all dice had highlight and were faded except for first ghost die, which was not faded but was highlighted, and all dice were removed after scoring breakdown except this die, so hot dice was not triggered, but I was prompted to roll 9 dice? But this ghost die is #10. Rolling the dice brought up all 10, with the ghost die selected already, and it still showed "Roll 9 dice" instead of score. Clicking select all does work, and deselect works except for the #10 ghost die still being selected. Trying to deselect the ghost die actually selects ALL of the dice EXCEPT one of the OTHER ghost die. Select all from there DOES select that one ghost die. (SEE SCREEN RECORDING) This was realy fucked up. Can't tell if it's originating from Lead, Alchemist/Midas Touch, Freebie, Sacrifice, or something else entirely. I got 2 lunar dice, then they completely disappeared. At one point there were 12 dice on the board when I had 9? Bro...
- Scoring breakdown, MLT sometimes seems to increase/decrease even though it should only be increasing, only seems to happen on faster speeds like Very Fast, because slower speeds don't show this

Profile & Stats:
- Add "Highest Hot Dice" to stats
- Fix high score tracking
- Test consumable/charm tracking

Save/Load, Difficulties, & Game End:
- World Map softlocks game when saving/reloading
- There is a shop after level 25, and then clicking continue brings up a new(?) level with the You Win modal
- In-Progress game in profile not working correctly. I just won a game and it still showed as "In-Progress on world 3 level 13", even though I just beat level 25 and won! "Win" did NOT show up either, still have 0 wins, and did not unlock the next difficulty
- Autosave is only at certain times, not synced up with consumable/charm usage, combination tracking, etc. Overall, probably a mess
- Continue to next level taking a long time? Can click multiple times and it will start the level multiple times, even if you start playing the level.
    - Generally think I need to create more Loading states when buttons are clicked / actions started
    - Also happening with world selection

Sound & Music:
- Remove delay of sounds playing
- Add better music lol
    - Shop music, collection/calculator music, world map music?
- Some kind of music selector where you can deselect songs you don't like, play songs you like, etc.
- Sounds for Settings/Dice Viewer/Combination modals, closing window, changing settings, clicking X
    - Probably similar for Dice config screen
- Sounds for:
    - using consumable? I think there are some that have it?
    - Move charm in inventory
    - Confirm tally / go to shop / exit shop
    - Select world
    - Some breakdown steps

Images:
- Probably a more space efficient way to have all these images stored and loaded

UI/UX:
- Generally terrible UI on mobile
- Continue standardizing buttons and styles
- Create a fun menu design, like the falling dice
- 3D dice?

Debug:
- Generally add a lot more logging for debugging
- Add backend health somewhere

Brand:
- Rollio logo?
- Standardize fonts, colors, etc. 
- How do you publish a web game like this? What would it take to publish on Steam (for free?)
    - Copyright concerns?