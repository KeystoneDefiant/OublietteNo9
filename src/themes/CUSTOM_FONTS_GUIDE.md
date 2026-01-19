# Custom Theme Fonts Implementation Guide

This document describes how Pokerthing themes use custom fonts to create unique visual identities.

## Overview

Each theme can import its own custom fonts via Google Fonts or @font-face declarations. This allows each theme to have a distinct typographic personality:

- **Classic**: Clean, professional fonts (Roboto, Lato)
- **Bokeh**: Elegant, soft fonts (Raleway, Open Sans)
- **Neon**: Geometric, technical fonts (Orbitron, Space Mono)

## Global Font Behavior

The global font fallback in `src/index.css` is overridden by theme-specific fonts declared in each theme's `theme.scss` file.

### Default Fallback (index.css)

```css
body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
    'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}
```

### Theme Override (theme.scss)

```scss
:root {
  --font-primary: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-secondary: 'Lato', sans-serif;
}
```

When a theme is active, its font variables override the global defaults.

## Current Theme Fonts

### Classic Theme

- **Primary Font**: Roboto (400, 500, 700 weights)
- **Secondary Font**: Lato (400, 700 weights)
- **Character**: Clean, professional, balanced
- **Use Case**: Standard poker aesthetic
- **Source**: Google Fonts

```scss
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Lato:wght@400;700&display=swap');

:root {
  --font-primary: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-secondary: 'Lato', sans-serif;
}
```

### Bokeh Theme

- **Primary Font**: Raleway (400, 500, 600, 700 weights)
- **Secondary Font**: Open Sans (400, 600 weights)
- **Character**: Elegant, soft, delicate
- **Use Case**: Dreamy, artistic aesthetic
- **Source**: Google Fonts

```scss
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&family=Open+Sans:wght@400;600&display=swap');

:root {
  --font-primary: 'Raleway', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-secondary: 'Open Sans', sans-serif;
}
```

### Neon Theme

- **Primary Font**: Orbitron (400, 700, 900 weights)
- **Secondary Font**: Space Mono (400, 700 weights)
- **Character**: Geometric, futuristic, technical
- **Use Case**: Cyberpunk aesthetic
- **Source**: Google Fonts

```scss
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap');

:root {
  --font-primary: 'Orbitron', -apple-system, BlinkMacSystemFont, monospace;
  --font-secondary: 'Space Mono', monospace;
}
```

## Using Theme Fonts in Components

### Apply to Text Elements

```scss
// Use primary font for headings
h1,
h2,
h3 {
  font-family: var(--font-primary);
}

// Use secondary font for body text
p,
span {
  font-family: var(--font-secondary);
}

// Use primary for UI labels
button,
label {
  font-family: var(--font-primary);
}
```

### Example Component Styling

```scss
.game-header {
  font-family: var(--font-primary);
  font-weight: 700;
  font-size: 2rem;
}

.card-value {
  font-family: var(--font-primary);
  font-weight: 500;
  font-size: 1.5rem;
}

.flavor-text {
  font-family: var(--font-secondary);
  font-weight: 400;
  font-size: 0.875rem;
}
```

## Creating a Custom Theme with Fonts

### Step 1: Choose Fonts

Select fonts that match your theme's personality:

1. **Research Fonts**
   - Google Fonts (https://fonts.google.com)
   - Browse by category: serif, sans-serif, monospace, handwriting
   - Test different weights (400, 500, 600, 700)

2. **Consider Readability**
   - Ensure fonts are legible at game sizes
   - Avoid overly decorative fonts for body text
   - Test in different colors and backgrounds

3. **Choose 2-3 Fonts Maximum**
   - Primary font for headings
   - Secondary font for body text
   - Optional specialty font for accents

### Step 2: Get Font Import Code

For Google Fonts:

1. Visit https://fonts.google.com
2. Select fonts and weights you want
3. Copy the @import URL

Example:

```scss
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Open+Sans:wght@400;600&display=swap');
```

### Step 3: Add to Theme SCSS

```scss
/* MyCustomTheme Theme */

/* Font Declarations for MyCustomTheme */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Open+Sans:wght@400;600&display=swap');

:root {
  /* Font Family - MyCustomTheme uses Playfair Display and Open Sans */
  --font-primary: 'Playfair Display', -apple-system, BlinkMacSystemFont, serif;
  --font-secondary: 'Open Sans', sans-serif;

  /* Rest of color and styling variables */
  /* ... */
}
```

### Step 4: Use in CSS

Apply fonts to components via CSS variables:

```scss
body.theme-mycustomtheme {
  h1,
  h2,
  h3 {
    font-family: var(--font-primary);
  }

  p,
  span,
  label {
    font-family: var(--font-secondary);
  }
}
```

## Font Loading Performance

### Google Fonts Optimization

The `display=swap` parameter ensures optimal performance:

```scss
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
```

- `display=swap`: Shows system font immediately, swaps to custom font when loaded
- Prevents "flash of unstyled text" (FOUT)
- Provides instant readability while fonts load

### Limiting Font Weights

Only import weights you actually use:

```scss
/* Good: Only import weights used */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

/* Bad: Imports many unnecessary weights */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;200;300;400;500;600;700;800;900&display=swap');
```

### Font Fallback Chains

Always provide fallbacks for system fonts:

```scss
:root {
  /* Good: Has fallback chain */
  --font-primary: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Bad: No fallback */
  --font-primary: 'CustomFont';
}
```

## Advanced: Self-Hosted Fonts

For fonts not available via Google Fonts, use @font-face:

```scss
@font-face {
  font-family: 'MyCustomFont';
  src:
    url('/fonts/my-custom-font.woff2') format('woff2'),
    url('/fonts/my-custom-font.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

:root {
  --font-primary: 'MyCustomFont', sans-serif;
}
```

### File Organization for Self-Hosted Fonts

```
src/themes/MyTheme/
├── theme.scss
├── config.ts
├── fonts/
│   ├── my-custom-font.woff2
│   ├── my-custom-font.woff
│   └── my-custom-font-bold.woff2
└── ...
```

## Font Selection Best Practices

### For Headings/Titles

- **Serif Fonts**: Elegant, classic (Playfair Display, Merriweather)
- **Sans-Serif**: Modern, clean (Montserrat, Poppins, Raleway)
- **Monospace**: Technical, futuristic (Roboto Mono, IBM Plex Mono)
- **Weight**: 600-900 for impact

### For Body Text

- **Sans-Serif**: Highly readable (Open Sans, Lato, Inter)
- **Weight**: 400-500 for optimal readability
- **Size**: 14-16px for screens

### For UI Controls

- **Sans-Serif**: Clear and functional (Roboto, Lato, Proxima Nova)
- **Weight**: 500-600 for clarity
- **Size**: 14-16px

### Pairing Fonts

Good combinations:

- **Serif + Sans-serif**: Playfair Display + Open Sans
- **Sans-serif + Monospace**: Lato + Space Mono
- **Sans-serif + Sans-serif**: Roboto + Lato (different feel)

Poor combinations:

- Multiple decorative fonts
- Serif + Serif (too similar)
- More than 3 fonts (visually chaotic)

## Testing Font Rendering

### Chrome DevTools

1. Open DevTools (F12)
2. Select element with text
3. Check "Computed" tab
4. Look for "font-family" property
5. Verify correct font is applied

### Testing Across Themes

1. Launch game
2. Switch themes in Settings
3. Verify fonts change immediately
4. Check readability in all colors
5. Verify no FOUT (flash of unstyled text)

## Font Resources

### Google Fonts

- **URL**: https://fonts.google.com
- **Categories**: Serif, Sans-serif, Monospace, Handwriting
- **Filter**: By popularity, language, width, thickness, slant
- **Recommended**: Typeface families with 4+ weights

### Font Pairing Inspiration

- https://www.fontpair.co/
- https://www.goodfontflow.com/
- Google Fonts Collections

### Font Selection Tools

- Font Squirrel (woff/woff2 conversion)
- FontForge (font editing)
- Transfonter (font format conversion)

## Troubleshooting

### Font not applying

1. Verify @import URL is correct
2. Check CSS variable is spelled correctly
3. Verify theme is active (check body class)
4. Clear browser cache (Ctrl+Shift+R)

### FOUT (Flash of Unstyled Text)

1. Use `display=swap` in Google Fonts URL
2. Ensure system font fallback is available
3. Not an error - expected behavior with web fonts

### Performance Issues

1. Reduce number of font weights imported
2. Use Google Fonts over custom fonts
3. Check font file sizes (WOFF2 is smallest)
4. Use `font-display: swap` for faster rendering

### Font looks wrong in theme

1. Verify correct font selected in Google Fonts
2. Check font weights match CSS font-weight values
3. Test font in different colors (may have contrast issues)
4. Consider different font if aesthetics don't match theme

## File Locations

| Component       | Location                        |
| --------------- | ------------------------------- |
| Classic fonts   | `src/themes/Classic/theme.scss` |
| Bokeh fonts     | `src/themes/Bokeh/theme.scss`   |
| Neon fonts      | `src/themes/Neon/theme.scss`    |
| Global defaults | `src/index.css`                 |
| CSS variables   | Theme `:root` in theme.scss     |

## Related Documentation

- **Theme System**: [Theme System Implementation Guide](./THEME_SYSTEM_IMPLEMENTATION.md)
- **Animations**: [Theme Animation Guide](./THEME_ANIMATION_GUIDE.md)
- **Google Fonts**: https://fonts.google.com
- **Web Typography**: https://fonts.adobe.com/blog/

## Summary

Each Pokerthing theme now includes:

- ✅ Custom font imports from Google Fonts
- ✅ Primary and secondary font variables
- ✅ Theme-specific font families matching theme personality
- ✅ Graceful fallback to system fonts
- ✅ Optimized loading with display=swap
- ✅ Performance-focused font weight selection
