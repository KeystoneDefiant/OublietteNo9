# To Do

## Fixes

- When the player has the extra draw feature, the hand should be redrawn, but held cards will not be included in the redraw. For instance, if the player holds an ace and redraws, the ace is held, the 4 other cards are discarded and 4 new cards are drawn to be held.

## Improvements

## Themes

- Remove all styling that is integrated to the game (such as bg-white classes) and move those into the themes. Use SCSS to import classes and apply them inside of the theme. The game elements themselves should not determine colors, but the theme should.
  - (In progress - themes now have ID targeting capability)

## Settings Screen
