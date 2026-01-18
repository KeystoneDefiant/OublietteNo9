# Theme Background Animation System

This system allows themes to define custom background animations that are injected and removed dynamically as the user changes themes.

## Theme Structure

Each theme should have:

- `theme.scss` - SCSS/CSS for theme colors and styles
- `config.ts` - Theme configuration
- `background.html` - (Optional) HTML markup for background elements
- `background.css` - (Optional) CSS styles for background animations

## Two Approaches to Define Backgrounds

### Approach 1: Using Separate Files (Recommended)

Create `background.html` and `background.css` files in your theme directory:

**src/themes/MyTheme/background.html:**

```html
<div class="my-theme-bg-main"></div>
<div class="my-theme-bg-accent"></div>
```

**src/themes/MyTheme/background.css:**

```css
.my-theme-bg-main {
  position: fixed;
  inset: 0;
  z-index: -10;
  background: linear-gradient(45deg, #1a1a2e, #16213e);
  background-size: 400% 400%;
  animation: myGradient 15s ease infinite;
}

.my-theme-bg-accent {
  position: absolute;
  inset: 0;
  z-index: -9;
  background:
    radial-gradient(circle at 20% 50%, rgba(255, 0, 0, 0.1), transparent),
    radial-gradient(circle at 80% 80%, rgba(0, 0, 255, 0.1), transparent);
  animation: myAccent 20s ease-in-out infinite;
}

@keyframes myGradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes myAccent {
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.3;
  }
}
```

**src/themes/MyTheme/config.ts:**

```typescript
import { ThemeConfig } from '../../types/index';

export const myThemeConfig: ThemeConfig = {
  name: 'MyTheme',
  displayName: 'My Custom Theme',
  description: 'A custom theme with unique animations',
  backgroundAnimation: {
    fromFiles: true, // Load from background.html and background.css
  },
};
```

### Approach 2: Inline in Config (for simple themes)

```typescript
import { ThemeConfig } from '../../types/index';

export const myThemeConfig: ThemeConfig = {
  name: 'MyTheme',
  displayName: 'My Custom Theme',
  description: 'A custom theme with unique animations',
  backgroundAnimation: {
    html: `<div class="my-theme-bg"></div>`,
    css: `
      .my-theme-bg {
        position: fixed;
        inset: 0;
        z-index: -10;
        background: linear-gradient(45deg, #1a1a2e, #16213e);
      }
    `,
  },
};
```

## ThemeConfig Interface

```typescript
interface ThemeConfig {
  name: string; // Internal name (used for identification)
  displayName: string; // Human-readable name shown in settings
  description?: string; // Optional description
  backgroundAnimation?: {
    fromFiles?: boolean; // Load HTML/CSS from background.html and background.css files
    html?: string; // HTML markup (if not using fromFiles)
    css?: string; // CSS styles (if not using fromFiles)
  };
}
```

## How It Works

1. **Initialization**: When the app loads, the theme manager loads the selected theme's config
2. **File Loading**: If `fromFiles: true`, the system loads `background.html` and `background.css` from the theme directory
3. **Injection**: The background animation HTML is injected into the DOM, and CSS is injected into `<head>`
4. **Application**: The background is positioned with `z-index: -10` and `-9` to appear behind all content
5. **Switching**: When the user changes themes, old background elements are removed and new ones are injected
6. **Cleanup**: Background elements are properly cleaned up on theme changes

## Z-Index Guidelines

When designing your background animations:

- Use `z-index: -10` (or lower) for the main background layer
- Use `z-index: -9` (or lower) for accent/pattern layers
- All content uses `z-index: 0` or positive values, so backgrounds stay behind

## Best Practices

1. **Use File-Based Approach**: Keep backgrounds in separate `background.html` and `background.css` files for better organization
2. **Performance**: Keep animations smooth by using CSS transforms and opacity rather than layout changes
3. **Accessibility**: Ensure background animations don't distract from content or interfere with readability
4. **Container Classes**: Use theme-specific class names (e.g., `my-theme-bg-`) to avoid conflicts
5. **Fixed Positioning**: Use `position: fixed` for full-screen backgrounds that should stay in place during scrolling
6. **Testing**: Test your animation across different screen sizes and devices

## Example: Starfield Animation with Files

**background.html:**

```html
<div class="space-stars"></div>
```

**background.css:**

```css
.space-stars {
  position: fixed;
  inset: 0;
  z-index: -10;
  background:
    radial-gradient(2px 2px at 20% 30%, white, rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 60% 70%, white, rgba(0, 0, 0, 0)),
    radial-gradient(1px 1px at 50% 50%, white, rgba(0, 0, 0, 0)),
    radial-gradient(1px 1px at 80% 10%, white, rgba(0, 0, 0, 0));
  background-repeat: repeat;
  background-size: 200px 200px;
  background-color: #000;
  animation: twinkle 5s ease-in-out infinite;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
```

**config.ts:**

```typescript
export const spaceThemeConfig: ThemeConfig = {
  name: 'Space',
  displayName: 'Space Theme',
  backgroundAnimation: {
    fromFiles: true,
  },
};
```

## Example: Inline Animation

```typescript
export const simpleThemeConfig: ThemeConfig = {
  name: 'Simple',
  displayName: 'Simple Theme',
  backgroundAnimation: {
    html: `<div class="space-stars"></div>`,
    css: `
      .space-stars {
        position: fixed;
        inset: 0;
        z-index: -10;
        background: 
          radial-gradient(2px 2px at 20% 30%, white, rgba(0,0,0,0)),
          radial-gradient(2px 2px at 60% 70%, white, rgba(0,0,0,0)),
          radial-gradient(1px 1px at 50% 50%, white, rgba(0,0,0,0)),
          radial-gradient(1px 1px at 80% 10%, white, rgba(0,0,0,0));
        background-repeat: repeat;
        background-size: 200px 200px;
        background-color: #000;
        animation: twinkle 5s ease-in-out infinite;
      }
      
      @keyframes twinkle {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
    `,
  },
};
```

## Registering Your Theme

1. Create theme directory: `src/themes/MyTheme/`
2. Create `theme.scss` with theme colors
3. Create `config.ts` with `ThemeConfig` export
4. Add theme name to `getAvailableThemes()` in `src/utils/themeManager.ts`

The theme system will automatically discover and load your theme configuration!
