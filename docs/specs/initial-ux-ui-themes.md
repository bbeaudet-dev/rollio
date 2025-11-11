# Theming and Cohesion Specification

## Overview

This spec aims to standardize and unify the thematic elements of Rollio, ensuring a cohesive, playful, and luck/fortune-driven experience across all game systems. It covers naming conventions, item roles, descriptions, and the integration of theme into UI, dialogue, and future visual design. The goal is to make the game world feel consistent, whimsical, and engaging, with clear connections between mechanics and theme.

## Requirements

- All game elements (charms, consumables/baubles, materials/essences/cores, dice sets, etc.) should have names, effects, and descriptions that fit the playful, luck/fortune, leprechaun-inspired theme.
- Consistent terminology across code, UI, and documentation.
- Dialogue, prompts, and UI elements (CLI and web) should reinforce the theme and tone.
- Future visual and color theming should align with the established motifs.

## User Stories / Scenarios

- As a player, I want the names and descriptions of items (charms, trinkets/baubles, essences/cores) to feel magical, lucky, and cohesive.
- As a developer, I want a clear reference for naming and theming decisions to ensure consistency.
- As a player, I want the UI and dialogue to reinforce the playful, mischievous tone of the game.

## Data Structures / Types

- Naming conventions for:
  - Charms (passive bonuses, e.g., "Lucky Clover", "Flop Shield")
  - Trinkets/Baubles (one-time use items, e.g., "Rabbit's Foot", "Money Doubler")
  - Essences/Cores (dice materials, e.g., "Crystal Essence", "Wooden Core")
- Descriptions and effects for each item type.
- Dialogue templates for CLI and web.

## API / Function Signatures

- Functions for generating themed item names and descriptions.
- UI components for displaying themed items and dialogue.

## Edge Cases & Error Handling

- Avoiding theme clashes or anachronisms in item names.
- Handling legacy references to old names (e.g., "consumable" → "bauble").

## Out of Scope

- Detailed visual design (to be covered in a future spec).
- Finalized color palette and mascot artwork.

## Open Questions

- Should "charms" be passive (held for ongoing effects) and "trinkets/baubles" be one-time use, or vice versa? (e.g., is a "Rabbit's Foot" a charm or a trinket?)
- Should we use "essence" or "core" for dice materials, or another term?
- How should dialogue and prompts differ between CLI and web for maximum thematic impact?
- What are the best ways to reinforce theme in future UI/UX and visual design?

## Implementation Phases

1. **Naming Audit & Refactor**
   - Inventory all current item names and types.
   - Propose and implement new names/descriptions for consistency.
   - Refactor code, UI, and docs to use new terms (e.g., "consumable" → "bauble").
2. **Dialogue & Prompt Theming**
   - Update CLI and web prompts to reinforce theme.
   - Add playful, luck/fortune-inspired dialogue.
3. **Visual & UI Theming (Future)**
   - Propose color palettes, mascot art, and UI motifs.
   - Implement in web and CLI as appropriate.

## References

- [Game Themes, Tone, and Symbolic Elements](../design/themes.md)
- [Enhanced Rollio Game Specification](farkle-enhanced-rules.md)
- [Spec Template](spec-template.md)
- [Current Charms, Consumables, and Materials](../../src/game/content/)
