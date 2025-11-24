# Theming System

Dynamic theme management system with admin controls and custom theme support.

## Quick Start

### Switch Themes (Admin Only)

1. Navigate to `/admin/themes`
2. Browse available themes
3. Click "Apply Theme" to activate
4. Page reloads with new theme

### Available Themes

- **Default** - Neutral slate palette
- **Bubblegum** - Pink and purple
- **Ocean** - Blue and teal
- **Forest** - Green earth tones

## Adding Custom Themes

### Method 1: Using TweakCN (Recommended)

1. Visit [TweakCN Theme Editor](https://tweakcn.com/editor/theme)
2. Customize colors visually
3. Export as **OKLCH** format (important!)
4. Save to `themes/your-theme.css`
5. Register in `lib/theme/config.ts`
6. Restart dev server

### Method 2: Manual Creation

#### 1. Create CSS File

```css
/* themes/sunset.css */

:root {
  --radius: 0.625rem;

  /* Light mode */
  --background: oklch(0.98 0 0);
  --foreground: oklch(0.2 0.02 40);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2 0.02 40);
  --primary: oklch(0.6 0.18 40);
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.96 0.01 40);
  --secondary-foreground: oklch(0.2 0.02 40);
  --muted: oklch(0.96 0.01 40);
  --muted-foreground: oklch(0.45 0.02 40);
  --accent: oklch(0.96 0.01 40);
  --accent-foreground: oklch(0.2 0.02 40);
  --destructive: oklch(0.5 0.3 25);
  --destructive-foreground: oklch(0.98 0 0);
  --border: oklch(0.9 0.01 40);
  --input: oklch(0.9 0.01 40);
  --ring: oklch(0.6 0.18 40);

  /* Charts */
  --chart-1: oklch(0.5 0.2 20);
  --chart-2: oklch(0.6 0.2 100);
  --chart-3: oklch(0.7 0.2 180);
  --chart-4: oklch(0.8 0.2 260);
  --chart-5: oklch(0.9 0.2 340);

  /* Sidebar */
  --sidebar-background: oklch(0.98 0 0);
  --sidebar-foreground: oklch(0.2 0.02 40);
  --sidebar-primary: oklch(0.6 0.18 40);
  --sidebar-primary-foreground: oklch(0.98 0 0);
  --sidebar-accent: oklch(0.96 0.01 40);
  --sidebar-accent-foreground: oklch(0.2 0.02 40);
  --sidebar-border: oklch(0.9 0.01 40);
  --sidebar-ring: oklch(0.6 0.18 40);
}

.dark {
  /* Dark mode overrides */
  --background: oklch(0.1 0.02 40);
  --foreground: oklch(0.98 0 0);
  --card: oklch(0.12 0.02 40);
  --card-foreground: oklch(0.98 0 0);
  /* ... rest of dark mode variables ... */
}
```

#### 2. Register Theme

```typescript
// lib/theme/config.ts
export const AVAILABLE_THEMES: ThemeDefinition[] = [
  // ... existing themes ...
  {
    id: 'sunset',  // Must match CSS filename
    name: 'Sunset',
    description: 'Warm orange and red tones',
    previewColors: {
      primary: '#ff6b35',
      secondary: '#fff4e6',
      accent: '#ff8c42',
    },
  },
]
```

#### 3. Restart Server

```bash
pnpm dev
```

## Required CSS Variables

Your theme must define all these variables for both light and dark modes:

### Core Colors
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`

### UI Elements
- `--border`
- `--input`
- `--ring`
- `--radius`

### Charts
- `--chart-1` through `--chart-5`

### Sidebar
- `--sidebar-background`, `--sidebar-foreground`
- `--sidebar-primary`, `--sidebar-primary-foreground`
- `--sidebar-accent`, `--sidebar-accent-foreground`
- `--sidebar-border`, `--sidebar-ring`

## OKLCH Color Format

This project uses OKLCH for better color management:

```css
oklch(lightness chroma hue / alpha)
```

- **Lightness**: 0-1 (0 = black, 1 = white)
- **Chroma**: 0-0.4+ (0 = gray, higher = vivid)
- **Hue**: 0-360° (color wheel)
- **Alpha**: Optional opacity (0-100%)

### Examples

```css
--primary: oklch(0.6 0.15 220);      /* Blue */
--primary: oklch(0.7 0.2 330);       /* Pink */
--border: oklch(0 0 0 / 10%);        /* Black 10% opacity */
```

### Color Tools

- [OKLCH Color Picker](https://oklch.com/)
- [TweakCN Editor](https://tweakcn.com/)
- [OKLCH Converter](https://colorjs.io/apps/convert/)

## Technical Architecture

### Database Storage

Active theme stored in `SystemSettings` table:

```prisma
model SystemSettings {
  id        String   @id @default("system")
  theme     String   @default("default")
  updatedAt DateTime @updatedAt
  updatedBy String?
}
```

### Loading Flow

1. **Server Rendering**: `ThemeStyles` component injects CSS
2. **Admin Update**: tRPC mutation updates database
3. **Page Reload**: New theme applied immediately
4. **API Endpoint**: `/api/theme` serves active theme CSS

### File Structure

```
themes/                     # Theme CSS files
├── default.css
├── bubblegum.css
├── ocean.css
└── forest.css

lib/theme/
├── config.ts              # Theme definitions
└── server.ts              # Server utilities

components/
├── theme-styles.tsx       # CSS injection
└── admin/theme-manager.tsx # Admin UI
```

## Best Practices

### Design Guidelines

1. **Test Both Modes** - Verify light and dark appearances
2. **Check Contrast** - Ensure WCAG AA compliance (4.5:1 ratio)
3. **Consistent Chroma** - Keep similar vibrancy across colors
4. **Preview Components** - Test on actual UI elements

### Performance Tips

1. **Minimize CSS** - Remove comments in production
2. **Use Variables** - Don't hardcode colors
3. **Cache Themes** - API includes 60s cache headers
4. **Optimize Size** - Keep theme files under 10KB

## Troubleshooting

### Theme Not Appearing

```bash
# Check theme file exists
ls themes/your-theme.css

# Verify registration
grep "your-theme" lib/theme/config.ts

# Restart server
pnpm dev
```

### Colors Look Wrong

1. Verify OKLCH values are valid
2. Check all variables are defined
3. Test in both light/dark modes
4. Use browser DevTools to inspect CSS variables

### Database Issues

```sql
-- Check active theme
SELECT theme FROM "SystemSettings";

-- Reset to default
UPDATE "SystemSettings" SET theme = 'default';
```

## Security

- **Admin Only**: Theme changes require admin access
- **Input Validation**: Theme IDs validated against whitelist
- **Audit Logging**: All changes tracked
- **Rate Limited**: Protected by application rate limiter

## Examples

### Corporate Theme

```css
/* themes/corporate.css */
:root {
  --primary: oklch(0.35 0.1 240);     /* Navy */
  --secondary: oklch(0.95 0 0);       /* Light gray */
  --accent: oklch(0.55 0.15 160);     /* Teal */
  /* Professional, conservative colors */
}
```

### High Contrast Theme

```css
/* themes/high-contrast.css */
:root {
  --background: oklch(1 0 0);         /* Pure white */
  --foreground: oklch(0 0 0);         /* Pure black */
  --primary: oklch(0.3 0.3 240);      /* Vivid blue */
  /* Maximum contrast for accessibility */
}
```

## Resources

- [TweakCN Theme Editor](https://tweakcn.com/)
- [OKLCH Color Space](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/quickref/#contrast-minimum)