# Charms, Consumables, and Blessings Status

## Charms

### Implemented and Registered

All charms in `CHARMS` data array that have corresponding classes in `logic/charms/` and are registered in `logic/charms/index.ts` are working.

### Unimplemented/Obsolete Charms

Based on comparison between `data/charms.ts` and `logic/charms/index.ts`:

**None found** - All charms in the data file appear to be registered. However, some may have incomplete implementations or bugs.

### Notes

- `pennyPincher` is commented out in `data/charms.ts` (line 621) - marked as "Implemented but then didn't make sense? Rounds without flopping is just banks"
- Some charms are marked as "legacy charm, might be duplicate" in the registration comments but are still registered

## Consumables

### ID Mapping Issue

The consumable IDs in `data/whims.ts` and `data/wishes.ts` don't directly match the case statements in `logic/consumableEffects.ts`. The mapping is done through `getConsumableEffectId` in `shop.ts`:

**Whims:**

- `liquidation` → `moneyDoubler` ✅
- `garagesale` → `addMoneyFromItems` ✅
- `youGetACharm` → `charmGiver` ✅
- `groceryList` → `createTwoConsumables` ✅
- `grabBag` → `createTwoHandUpgrades` ⚠️ **PLACEHOLDER - Not fully implemented** (hand upgrades system needed)
- `echo` → `createLastConsumable` ✅
- `chisel` → `chisel` ✅ (requires user input - die selection)
- `potteryWheel` → `potteryWheel` ✅ (requires user input - die selection)
- `hospital` → `forfeitRecovery` ✅

**Wishes:**

- `midasTouch` → `copyMaterial` ✅ (requires user input - two die selection)
- `freebie` → `addStandardDie` ✅
- `sacrifice` → `deleteDieAddCharmSlot` ✅
- `welfare` → `upgradeAllHands` ⚠️ **PLACEHOLDER - Not fully implemented** (hand upgrades system needed)
- `origin` → `createLegendaryCharm` ✅
- `distortion` → `createTwoRareCharms` ✅
- `frankenstein` → `deleteTwoCopyOneCharm` ✅

**Note:** There's also a `luckyToken` case in the code but no corresponding consumable in the data files.

### Unimplemented/Obsolete Consumables

- **`grabBag`** (createTwoHandUpgrades) - Placeholder implementation, hand upgrade system not implemented
- **`welfare`** (upgradeAllHands) - Placeholder implementation, hand upgrade system not implemented
- **`copyDieSide`** - Referenced in type definition but no implementation found (may be part of pip effects system)

### Consumable Issues

1. **Input-Required Consumables in Shop Context:**

   - `chisel`, `potteryWheel`, `midasTouch` require user input (die selection)
   - These may not work properly when used from shop if the input system expects a round state
   - Need to verify if the dice viewer modal works in shop context

2. **Last Consumable Tracking:**

   - `createLastConsumable` (echo) relies on `gameState.lastConsumableUsed`
   - This field may not be properly tracked when consumables are used
   - Check if `lastConsumableUsed` is set in `useConsumable` flow

3. **Consumable Removal:**
   - All consumables have 1 use and should be removed after use
   - Verify that consumables are actually being removed from inventory after use

## Blessings

All blessings appear to be implemented through the blessing effect system in `data/blessings.ts`. The effects are applied through:

- `applyBlessingEffects` in game logic
- Blessing effects are tracked in `GameState.blessings`
- Effects are applied during level initialization and shop discount calculation

### Blessing Effect Types (All Implemented):

- `baseLevelRerolls` ✅
- `baseLevelBanks` ✅
- `rerollOnBank` ✅
- `rerollOnFlop` ✅
- `rerollOnCombination` ✅
- `charmSlots` ✅
- `consumableSlots` ✅
- `shopDiscount` ✅
- `flopSubversion` ✅
- `moneyPerBank` ✅
- `moneyOnLevelEnd` ✅
- `moneyOnRerollUsed` ✅

## Summary

### Working:

- Most charms (all registered ones)
- Most consumables (except hand upgrade ones)
- All blessings

### Needs Attention:

1. **Hand Upgrade System** - Required for `grabBag` and `welfare` consumables
2. **Consumable Input System** - May need to work in shop context (currently expects round state)
3. **Last Consumable Tracking** - `createLastConsumable` needs proper tracking of last used consumable
4. **Consumable Removal** - Verify consumables are being removed after use
5. **Copy Die Side** - May need implementation if it's a separate feature from pip effects
