# UI Images Directory

This directory contains image assets for the game UI, organized by type.

## Directory Structure

```
public/assets/images/
├── charms/          # Charm item images
├── blessings/        # Blessing item images
├── consumables/     # Consumable item images
└── dice/            # Dice face/material images
```

## Usage

Images in the `public/` directory can be referenced directly in React components:

```tsx
// Example: Using a charm image
<img src="/assets/images/charms/flop-shield.png" alt="Flop Shield" />

// Example: Using a blessing image
<img src="/assets/images/blessings/reroll-value-I.png" alt="Reroll Value I" />

// Example: Using a consumable image
<img src="/assets/images/consumables/money-doubler.png" alt="Money Doubler" />
```

## Image Naming Conventions

- **Charms**: Use the charm ID or a descriptive name (e.g., `flop-shield.png`, `score-multiplier.png`)
- **Blessings**: Use the blessing effect type and tier (e.g., `reroll-value-I.png`, `lives-value-II.png`)
- **Consumables**: Use the consumable ID or name (e.g., `money-doubler.png`, `extra-die.png`)
- **Dice**: Use material type (e.g., `plastic.png`, `crystal.png`, `wooden.png`)

## Image Specifications

- **Format**: PNG (with transparency) or SVG (preferred for scalability)
- **Size**: Recommended 64x64px to 128x128px for item images
- **Background**: Transparent
- **Style**: Consistent art style across all images
