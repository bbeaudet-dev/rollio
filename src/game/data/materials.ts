import { DiceMaterial, DiceMaterialType } from '../types';

export const MATERIALS: DiceMaterial[] = [
  {
    id: 'plastic',
    name: 'Plastic',
    description: 'A basic plastic die with no special effects',
    abbreviation: 'pl',
    color: 'white'
  },
  {
    id: 'crystal',
    name: 'Crystal',
    description: '1.5x roll score per crystal die already scored this round',
    abbreviation: 'cr',
    color: 'purple'
  },
  {
    id: 'wooden',
    name: 'Wooden',
    description: '1.25x roll score per wooden die in the set',
    abbreviation: 'wd',
    color: 'gold'
  },
  {
    id: 'golden',
    name: 'Golden',
    description: '2.0x roll score when all golden dice are scored together',
    abbreviation: 'gl',
    color: 'yellow'
  },
  {
    id: 'volcano',
    name: 'Volcano',
    description: 'Provides bonus multipliers based on hot dice counter',
    abbreviation: 'vl',
    color: 'fireRed'
  },
  {
    id: 'mirror',
    name: 'Mirror',
    description: 'Acts as a Wild die that can be any value when scored',
    abbreviation: 'mr',
    color: 'royalBlue'
  },
  // For future use
  {
    id: 'rainbow',
    name: 'Rainbow',
    description: 'Lucky die with possible special effects',
    abbreviation: 'rb',
    color: 'rainbow' // Special case for multi-color
  },

]; 

/* 
Steel / Lead / Obsidian
Heavy, stays in hand after scoring!! 
Could be an interesting trade off, basically nullifies hot dice, but impossible to flop?

I think crystal is cool honestly, it's like building up resonance, bouncing soundwaves and light beams off of the crystals
But I think it's broken, so we should decrease the multiplier

Volcano is cool, maybe go with a different name eventually
Opposite of steel, since volcano wants hot dice, i.e. to get rid of dice asap

Mirror I don't really like, and I'm not sure how we would implement "wild" 
Nevermind, actually it could be sick. "Mirror die always copies the value of a random die in hand"
Code would be tough. What happens if the die it copies is a mirror? Does it move to a new die, or does it copy what that mirror die copies? Initially I think move to new die. What happens if you have all mirror die? Pick a random value?
Actually that gave me an interesting idea: what if ALL the mirror dice in hand copy the value of a random die in hand, or a random value if all mirror?

Golden I think has an incorrect description? 
I think money dice is kinda boring but we should probably keep it
Especially if we're going leprechaun/gold themed, money strategies are important
We can always do something different for money, like emerald, or copper, or even like a cauldron

Hmmm I actually do think Fairy Dust is interesting, at least the reroll-focus. It's almost like antimatter? Like when it gets scored it's "leaving something behind", like a substance that allows you to change the substance of something else. Fairy dust is cool, but I think I want to make it more "material" based, like ethereal dice or something. Can you generate some more ideas for this one.

Also, talking about the fairy die just gave me a super interesting idea: what about a ghost die! Ghost die do not need to be scored in order to get hot dice. so if I have 3 normal dice and 1 ghost die, and I roll 5556, with the 6 being the ghost die, I can score the 555 and it will give me hot dice, since the only remaining die was a ghost! I think a better way to be specfiic about the effect is to say "triggers hot dice counter if only ghost dice (or no dice) remain in hand after scoring". 

Emerald is actually really cool too, it's definitely thematic, and I can't really think of anything else that's green at the moment. What are common thematic elements of emeralds? What qualitites do they possess? How can we tie this in to some kind of effect for them? 

Moonstone is interesting too, but it feels underpowered. Some kind of "duality based" material is cool though. 
*/  