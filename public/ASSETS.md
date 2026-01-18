# Assets and Images Integration Guide

## Overview

The `public/images/` directory contains all static image assets that are included in the final built package. These assets are automatically copied to the `dist/` folder during the build process.

## How to Use Images in Your Code

### 1. SVG Images (Recommended)

SVG images are preferred because they're scalable and have small file sizes.

#### Import as React Component

```tsx
import LogoSvg from '/public/images/logos/app-logo.svg';

export function MyComponent() {
  return <LogoSvg width={256} height={256} />;
}
```

#### Use as Image URL

```tsx
export function MyComponent() {
  return <img src="/images/logos/app-logo.svg" alt="Pokerthing Logo" />;
}
```

#### Use in CSS

```css
.logo-background {
  background-image: url('/images/logos/app-logo.svg');
  background-size: contain;
  background-repeat: no-repeat;
}
```

### 2. Raster Images (PNG, JPG)

For photographs or complex images with transparency.

```tsx
export function MyComponent() {
  return <img src="/images/backgrounds/poker-table.png" alt="Poker Table" loading="lazy" />;
}
```

### 3. Using Icons in Buttons

```tsx
import SettingsIcon from '/public/images/icons/settings.svg';

export function SettingsButton() {
  return (
    <button className="icon-button">
      <SettingsIcon />
      Settings
    </button>
  );
}
```

## Asset Organization

```
public/images/
├── logos/           → App branding (app-logo.svg, splash-screen.png)
├── icons/           → UI icons (settings.svg, play.svg, etc.)
├── cards/           → Card symbols (suit-hearts.svg, etc.)
├── backgrounds/     → Background textures and images
├── ui/              → Decorative UI elements
└── README.md        → This file
```

## Vite Public Assets Configuration

Vite automatically:

1. **Serves** images from `public/` during development
2. **Copies** images to `dist/` during build
3. **Preserves** directory structure in the build output
4. **Optimizes** where possible (minification for SVGs, etc.)

### Build Behavior

During `npm run build`:

- Files in `public/` are copied as-is to `dist/`
- URLs like `/images/logos/app-logo.svg` resolve to `dist/images/logos/app-logo.svg`
- No additional processing is needed

## Adding New Images

### Step 1: Choose the Right Format

- **SVG**: Icons, logos, vector graphics
- **PNG**: Images with transparency, complex graphics
- **JPG**: Photographs, complex imagery without transparency
- **WebP**: Modern format for best compression (provide PNG fallback)

### Step 2: Place in Correct Subdirectory

- Logos → `public/images/logos/`
- Icons → `public/images/icons/`
- Card graphics → `public/images/cards/`
- Backgrounds → `public/images/backgrounds/`
- UI decorations → `public/images/ui/`

### Step 3: Use Descriptive Names

```
✅ GOOD:
- play-button-icon.svg
- poker-table-background.png
- card-back-texture.png

❌ AVOID:
- icon1.svg
- img_123.png
- temp.png
```

### Step 4: Update Documentation

Add an entry to the appropriate section in `public/images/README.md`

## Performance Optimization

### 1. SVG Optimization

Use SVGO to optimize SVG files:

```bash
npm install -D svgo
svgo public/images/icons/my-icon.svg
```

### 2. PNG Compression

Use pngquant for PNG compression:

```bash
npm install -D pngquant-cli
pngquant public/images/backgrounds/texture.png --force
```

### 3. Lazy Loading

```tsx
<img src="/images/backgrounds/poker-table.png" alt="Poker Table" loading="lazy" />
```

### 4. Responsive Images

```tsx
<img
  src="/images/logos/app-logo.svg"
  srcSet="/images/logos/app-logo-small.svg 640w,
          /images/logos/app-logo.svg 1024w"
  sizes="(max-width: 640px) 100vw, 50vw"
  alt="Pokerthing Logo"
/>
```

## File Size Guidelines

Target file sizes to keep the bundle lightweight:

| Type       | Target Size |
| ---------- | ----------- |
| Logo       | < 50 KB     |
| Icon       | < 5 KB      |
| Background | < 200 KB    |
| Texture    | < 100 KB    |
| UI Element | < 10 KB     |

## Version Control

Images ARE tracked in git:

```bash
# All image files should be committed
git add public/images/
git commit -m "Add game logo and icons"
```

If using very large files (>10MB), consider adding to `.gitlfs`:

```
# .gitattributes
public/images/**/*.psd filter=lfs diff=lfs merge=lfs -text
```

## Common Patterns

### Logo in Main Menu

```tsx
// src/components/MainMenu.tsx
import Logo from '/public/images/logos/app-logo.svg';

export function MainMenu() {
  return (
    <div className="menu-container">
      <Logo className="logo" />
      <h1>Pokerthing</h1>
      {/* ... menu buttons ... */}
    </div>
  );
}
```

### Card Suit Icons

```tsx
// src/components/Card.tsx
import HeartsIcon from '/public/images/cards/suit-hearts.svg';
import DiamondsIcon from '/public/images/cards/suit-diamonds.svg';
import ClubsIcon from '/public/images/cards/suit-clubs.svg';
import SpadesIcon from '/public/images/cards/suit-spades.svg';

const suitIcons = {
  hearts: HeartsIcon,
  diamonds: DiamondsIcon,
  clubs: ClubsIcon,
  spades: SpadesIcon,
};
```

### Theme-Specific Backgrounds

```tsx
// Use CSS to apply different backgrounds based on theme
const backgroundMap = {
  classic: '/images/backgrounds/felt-green.png',
  neon: '/images/backgrounds/grid-pattern.png',
  bokeh: '/images/backgrounds/bokeh-blur.png',
};

export function GameTable({ theme }) {
  return (
    <div
      style={{
        backgroundImage: `url(${backgroundMap[theme]})`,
      }}
    >
      {/* ... game content ... */}
    </div>
  );
}
```

## Build Output

After running `npm run build`, images are available at:

```
dist/
├── images/
│   ├── logos/
│   │   └── app-logo.svg
│   ├── icons/
│   │   ├── play.svg
│   │   ├── settings.svg
│   │   └── ...
│   ├── cards/
│   │   └── ...
│   └── ...
├── assets/
│   └── index-*.js (main bundle)
└── index.html
```

## Troubleshooting

### Images Not Showing

1. Check path is correct: `/images/subdirectory/filename.ext`
2. Verify file exists in `public/images/`
3. Clear browser cache and rebuild: `npm run build`

### SVG Not Displaying Properly

1. Check SVG is valid (open in browser directly)
2. Ensure viewport and width/height are set
3. Use `<img>` tag instead of `<object>` for compatibility

### Build Includes Unwanted Files

Add to `.gitignore` in `public/images/`:

```
# Don't include source files
*.psd
*.ai
*.sketch
```

## Related Documentation

- [Vite Static Assets Docs](https://vitejs.dev/guide/assets.html)
- [SVG in Web](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [Image Optimization Guide](https://web.dev/image-optimization/)
- See `public/images/README.md` for asset inventory
