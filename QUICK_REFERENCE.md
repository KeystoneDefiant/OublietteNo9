# Quick Reference - Static Images

## Quick Start

### Add a New Image

1. Place file in appropriate folder under `public/images/`
2. Use in code: `<img src="/images/folder/filename.svg" />`
3. Done! Automatically included in build

### Access Images in Code

```tsx
// SVG Icon
<img src="/images/icons/play.svg" alt="Play" />

// Logo
<img src="/images/logos/app-logo.svg" alt="Pokerthing" width="256" />

// Card Suit
<img src="/images/cards/suit-hearts.svg" alt="Hearts" />

// CSS Background
<div style={{ backgroundImage: 'url(/images/backgrounds/felt.png)' }} />
```

## Folder Organization

| Folder         | Use For                | Examples                           |
| -------------- | ---------------------- | ---------------------------------- |
| `logos/`       | App branding           | app-logo.svg, splash-screen.png    |
| `icons/`       | UI buttons & controls  | play.svg, settings.svg, close.svg  |
| `cards/`       | Poker card elements    | suit-hearts.svg, suit-diamonds.svg |
| `backgrounds/` | Background images      | felt-texture.png, grid-pattern.png |
| `ui/`          | Decorative UI elements | borders, corners, shadows          |

## Current Assets

### Logos (1)

- `app-logo.svg` - Pokerthing logo with card symbols

### Icons (8)

- `play.svg` - Play button
- `settings.svg` - Settings gear
- `close.svg` - Close button
- `chevron-up.svg` - Up arrow
- `chevron-down.svg` - Down arrow
- `coin.svg` - Currency icon
- `heart.svg` - Hearts icon
- `shop.svg` - Shopping cart

### Card Suits (4)

- `suit-hearts.svg` - Hearts (red)
- `suit-diamonds.svg` - Diamonds (cyan)
- `suit-clubs.svg` - Clubs (green)
- `suit-spades.svg` - Spades (purple)

## Best Practices

✅ Use SVG for icons and logos (smaller, scalable)
✅ Use PNG for complex images or photos
✅ Use descriptive filenames: `play-button-icon.svg`
✅ Keep files optimized and under 200 KB each
✅ Use `/images/` paths in all URL references
✅ Add lazy loading for large background images

❌ Don't import images directly in component files
❌ Don't use relative paths from components
❌ Don't store unoptimized raw files
❌ Don't commit files > 10MB without git-lfs

## File Sizes

Target < 200 KB per image:

- Icons: < 5 KB ✓
- Logos: < 50 KB ✓
- Backgrounds: < 200 KB ✓
- Textures: < 100 KB ✓

## Adding a New Icon

```bash
# 1. Create SVG file in icons folder
# 2. Use neon colors and glow effects for consistency
# 3. Test in browser
# 4. Run build
npm run build

# 5. Icon automatically appears in dist/images/icons/
# 6. Use in code
<img src="/images/icons/my-new-icon.svg" />
```

## Paths for All Assets

```
App Logo:         /images/logos/app-logo.svg
Play Icon:        /images/icons/play.svg
Settings Icon:    /images/icons/settings.svg
Close Icon:       /images/icons/close.svg
Chevron Up:       /images/icons/chevron-up.svg
Chevron Down:     /images/icons/chevron-down.svg
Coin Icon:        /images/icons/coin.svg
Heart Icon:       /images/icons/heart.svg
Shop Icon:        /images/icons/shop.svg

Hearts Suit:      /images/cards/suit-hearts.svg
Diamonds Suit:    /images/cards/suit-diamonds.svg
Clubs Suit:       /images/cards/suit-clubs.svg
Spades Suit:      /images/cards/suit-spades.svg
```

## Troubleshooting

**Images not showing?**

- Check path starts with `/images/`
- Verify file exists in `public/images/`
- Clear browser cache
- Run `npm run build` and check `dist/images/`

**SVG looks distorted?**

- Ensure viewBox is set correctly
- Use fixed width/height in HTML
- Check SVG is valid XML

**Bundle too large?**

- Compress PNG files with pngquant
- Optimize SVGs with SVGO
- Use WebP with PNG fallback

## Documentation

- **ASSETS.md** - Complete integration guide
- **public/images/README.md** - Asset inventory
- **QUICK_REFERENCE.md** - This file

See documentation for detailed guides and examples.
