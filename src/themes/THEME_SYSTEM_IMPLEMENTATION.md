# Theme Background Animation System - Implementation Summary

## Overview

The theme system now supports injecting custom HTML and CSS for background animations. This allows themes to define unique, animated backgrounds that are dynamically loaded and applied when the theme is selected.

## Architecture

### New Files Created

1. **`src/hooks/useThemeBackgroundAnimation.ts`**
   - React hook that manages injection and cleanup of theme background animations
   - Handles HTML element creation and CSS style injection
   - Automatically removes previous theme's background when theme changes

2. **`src/themes/Classic/config.ts`**
   - Theme configuration file that specifies `fromFiles: true`
   - Loads `background.html` and `background.css` from the theme directory
   - Exports `classicThemeConfig`

3. **`src/themes/Classic/background.html`**
   - HTML markup for the Classic theme's background elements
   - Contains divs for gradient and pattern layers

4. **`src/themes/Classic/background.css`**
   - CSS styles and keyframe animations for the Classic theme's background
   - Defines `.theme-bg-gradient` and `.theme-bg-pattern` styles

5. **`THEME_ANIMATION_GUIDE.md`**
   - Comprehensive documentation for theme developers
   - Shows both file-based and inline approaches
   - Includes examples, best practices, and guidelines

### Modified Files

1. **`src/types/index.ts`**
   - Updated `ThemeBackgroundAnimation` interface with optional `fromFiles` flag
   - Made `html` and `css` properties optional

2. **`src/utils/themeManager.ts`**
   - Enhanced `loadThemeConfig()` to detect and load `background.html` and `background.css` files
   - Uses Vite's `?raw` import query for loading raw file content
   - Caching system prevents repeated file loads

3. **`src/App.tsx`**
   - Added `useThemeBackgroundAnimation` hook
   - Loads theme config on app initialization
   - Applies theme background animation globally

4. **`src/components/Settings.tsx`**
   - Integrates `useThemeBackgroundAnimation` hook
   - Loads theme config when user selects a different theme
   - Updates background animation on theme preview/change

5. **`src/components/PreDraw.tsx`**
   - Removed hardcoded background animation (now provided by theme)
   - Cleaner component code, animation moved to theme layer

6. **`src/hooks/useThemeBackgroundAnimation.ts`**
   - Updated to handle optional html/css properties

## How It Works

### Two Approaches to Define Backgrounds

#### Approach 1: File-Based (Recommended)

Themes can define background animations in separate files:

```
src/themes/MyTheme/
├── config.ts          (specifies fromFiles: true)
├── background.html    (HTML markup)
├── background.css     (CSS styles)
└── theme.scss         (theme colors)
```

**config.ts:**

```typescript
interface ThemeConfig {
  name: string;
  displayName: string;
  description?: string;
  backgroundAnimation?: {
    fromFiles: true; // Signal to load from files
  };
}
```

#### Approach 2: Inline in Config

For simple themes, animations can be defined inline:

```typescript
interface ThemeConfig {
  name: string;
  displayName: string;
  description?: string;
  backgroundAnimation?: {
    html: string; // HTML markup inline
    css: string; // CSS styles inline
  };
}
```

### Injection Process

1. User loads app or changes theme
2. `loadThemeConfig()` dynamically imports the theme's `config.ts`
3. If `fromFiles: true`, loads `background.html?raw` and `background.css?raw` from theme directory
4. `useThemeBackgroundAnimation` hook receives the config with loaded content
5. Hook creates a container div and injects the HTML
6. Hook creates a `<style>` tag and injects the CSS
7. Background renders behind all content (z-index: -10, -9)
8. When theme changes, old background is removed and new one is injected

### Key Features

- **File-Based Organization**: Themes can split content across files for better organization
- **Dynamic Loading**: Files are loaded dynamically only when theme is selected
- **Caching**: Theme configs and loaded files are cached to avoid repeated imports
- **Cleanup**: Old background elements are properly removed before applying new ones
- **Z-Index Strategy**: Background uses negative z-indices to stay behind content
- **No Breaking Changes**: Existing theme system (SCSS, classes) continues to work
- **Flexibility**: Themes can use either file-based or inline approach

## Usage Examples

### File-Based: Simple Gradient Background

**background.html:**

```html
<div class="simple-bg"></div>
```

**background.css:**

```css
.simple-bg {
  position: fixed;
  inset: 0;
  z-index: -10;
  background: linear-gradient(to bottom, #000, #333);
}
```

**config.ts:**

```typescript
export const simpleThemeConfig: ThemeConfig = {
  name: 'Simple',
  displayName: 'Simple',
  backgroundAnimation: {
    fromFiles: true,
  },
};
```

### Inline: Animated Gradient

```typescript
export const animatedThemeConfig: ThemeConfig = {
  name: 'Animated',
  displayName: 'Animated',
  backgroundAnimation: {
    html: '<div class="simple-bg"></div>',
    css: `
      .simple-bg {
        position: fixed;
        inset: 0;
        z-index: -10;
        background: linear-gradient(to bottom, #000, #333);
      }
    `,
  },
};
```

### Animated Gradient

```typescript
backgroundAnimation: {
  html: '<div class="animated-bg"></div>',
  css: `
    .animated-bg {
      position: fixed;
      inset: 0;
      z-index: -10;
      background: linear-gradient(45deg, red, blue, red);
      background-size: 200% 200%;
      animation: gradientShift 5s ease infinite;
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      100% { background-position: 100% 50%; }
    }
  `,
},
```

## Integration Points

### For App Initialization

The App component now:

1. Calls `initializeTheme()` on mount
2. Loads the initial theme config (with file loading if needed)
3. Applies theme background animation via `useThemeBackgroundAnimation` hook

### For Theme Switching

The Settings component now:

1. Detects theme selection changes
2. Loads the selected theme's config (dynamically fetching files if `fromFiles: true`)
3. Uses `useThemeBackgroundAnimation` to update background
4. Saves preference and applies globally

## File Structure

```
src/themes/Classic/
├── config.ts           (contains classicThemeConfig with fromFiles: true)
├── background.html     (HTML markup for background)
├── background.css      (CSS styles and animations)
└── theme.scss          (theme colors and general styles)
```

The Settings component now:

1. Detects theme selection changes
2. Loads the selected theme's config
3. Uses `useThemeBackgroundAnimation` to update background
4. Saves preference and applies globally

## Best Practices for Theme Developers

1. **Use meaningful class names** with theme prefix (e.g., `my-theme-bg-`)
2. **Keep animations efficient** - use CSS transforms and opacity over layout changes
3. **Test on various devices** - ensure animations perform well
4. **Document your theme** - include description in ThemeConfig
5. **Use consistent z-indices** - follow the -10, -9, -8 pattern
6. **Avoid blocking interactions** - use `pointer-events: none` if needed
7. **Consider accessibility** - high-contrast animations may distract users

## Future Enhancements

Possible improvements to the theme system:

1. **Theme Discovery**: Automatically scan themes directory and register themes
2. **Theme Variants**: Support theme variants with different animation speeds
3. **User Customization**: Allow users to customize animation colors/speeds
4. **Animation Presets**: Gallery of pre-made backgrounds users can select
5. **Remote Themes**: Support loading themes from external sources

## Testing

The system has been tested for:

- ✓ Theme config loading and caching
- ✓ HTML/CSS injection and cleanup
- ✓ Theme switching in Settings
- ✓ App initialization with default theme
- ✓ Build compilation with dynamic imports
- ✓ No memory leaks on theme changes

## Files Location

```
src/
├── hooks/
│   └── useThemeBackgroundAnimation.ts    (NEW)
├── themes/
│   ├── Classic/
│   │   ├── config.ts                     (NEW)
│   │   └── theme.scss                    (existing)
│   └── Neon/
│       └── config.example.ts             (NEW example)
├── types/
│   └── index.ts                          (MODIFIED)
├── utils/
│   └── themeManager.ts                   (MODIFIED)
├── components/
│   ├── PreDraw.tsx                       (MODIFIED)
│   └── Settings.tsx                      (MODIFIED)
├── App.tsx                               (MODIFIED)
└── THEME_ANIMATION_GUIDE.md              (NEW documentation)
```

## Backward Compatibility

The system maintains full backward compatibility:

- Existing theme SCSS files continue to work
- Theme selection mechanism unchanged
- No changes to API or component interfaces
- Optional `backgroundAnimation` in config means themes without animations still work
