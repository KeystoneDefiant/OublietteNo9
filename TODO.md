# To Do

## Fixes

- Shop is showing all options, but should only be showing the number of options stated in the game mode. Verify weighting is also displayed.
- Shop is not calculating Parallel Hands Bundle correctly. It is currently set to 1000, where a single additional hand is also 1000. Verify these are being calculated correctly.
- The user can gain more dead cards than allowed in the config. Verify this logic.
- If the player has multiple re-draws, the player is not presented with new cards. When the redraw occurs, held cards should remain, and any cards not held should be removed and new cards should be drawn to the hand maximum.

## Improvements

- Screen transitions do not seem to be integrated. Please verify, and add a basic crossfade animation to all themes as a starting point. HIGH PRIORITY.

## Shop

## Parallel Hands Animation Screen

- Slow down the Parallel Hands animation and give vertical room to each hand being animated.
- At 50% of the animation, have the hand element pulse and scale up slightly and back down, while showing the hand's type and payout.

## Themes

- Integrate audio hooks

## Maintenance

- Review all files and resolve any linting errors
- Test the build
- Review all files and resolve any linting errors again
