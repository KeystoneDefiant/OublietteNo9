# To Do

## Fixes

- Move the screen element tsx files to a new directory called "screens", leaving smaller components in the components directory.

- Create a new component from the header in the GameTable.tsx file that contains the credits, round number, and efficiency and import that into GameTable, PreDraw and Results screens

- During the Parallel Hands Results animation, fade the elements in while scrolling the content of the div to the right

## Improvements

- in the round summary, show 2 new lines under Total Payout - one called "Round Cost" which shows the total bet amount for the hand, and a "Profit" line, that subtracts the bet cost from the payout. If the number is negative, show the number in red, and if postive, show it in green

- In the preDraw screen, show large up and down arrows to the left and right of the bet amount and number of hands inputs to allow mobile users to change the count without direct input. Add another button to the right called "Max" that applies the maximum hands or the maximum bet the player can bet

## Themes

- Expand on the Neon theme, making it feel like a cyberpunk casino.
- Remove all styling that is integrated to the game (such as bg-white classes) and move those into the themes. Use SCSS to import classes and apply them inside of the theme. The game elements themselves should not determine colors, but the theme should.
- Go through all game elements, apply IDs to the each main container so they can be targeted by CSS selectors.

## Settings Screen
