# Theme Management System Guide

## Overview

Your application now has a **TweakCN-style theming system** that allows admins to switch between different color themes dynamically. Themes are stored as CSS files and can be managed through the admin panel.

## What's Included

### 4 Pre-built Themes

1. **Default** - Neutral slate palette (original design)
2. **Bubblegum** - Playful pink and purple
3. **Ocean** - Calm blue and teal
4. **Forest** - Natural green and earth tones

### Admin Interface

Access the theme manager at:
```
http://localhost:3000/admin/themes
```

**Features:**
- Visual theme previews with color swatches
- One-click theme switching
- Real-time application updates
- Audit logging of theme changes

## How to Use

### Switching Themes (Admin Only)

1. Log in as an admin user
2. Navigate to **Admin → Themes** in the sidebar
3. Click on any theme card to preview colors
4. Click "Apply Theme" to activate it
5. The page will reload with the new theme applied

### Adding Custom Themes

#### Method 1: Using TweakCN (Recommended)

1. Visit [TweakCN Theme Editor](https://tweakcn.com/editor/theme)
2. Customize colors using the visual interface:
   - Primary, secondary, accent colors
   - Card and sidebar colors
   - Border radius and effects
3. Choose **OKLCH** color format (this project uses OKLCH)
4. Export the CSS
5. Save to `themes/your-theme-name.css`
6. Add theme definition (see below)

#### Method 2: Manual Creation

Create a new CSS file in the `themes/` directory:

```css
/* themes/sunset.css */

:root {
	--radius: 0.625rem;
	--card: oklch(1 0 0);
	--card-foreground: oklch(0.2 0.05 40);
	--primary: oklch(0.6 0.18 40);
	--primary-foreground: oklch(0.98 0 0);
	/* ... add all required CSS variables ... */
}

.dark {
	--background: oklch(0.18 0.02 40);
	--foreground: oklch(0.98 0 0);
	/* ... add dark mode overrides ... */
}
```

**Required CSS Variables:**
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`
- `--border`, `--input`, `--ring`
- `--chart-1` through `--chart-5`
- `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, etc.

### Registering Your Theme

After creating the CSS file, register it in `lib/theme/config.ts`:

```typescript
export const AVAILABLE_THEMES: ThemeDefinition[] = [
	// ... existing themes ...
	{
		id: 'sunset',
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

**Important:** The `id` must match your CSS filename (without `.css` extension).

### Restarting the Application

After adding a new theme:

```bash
# Stop the dev server (Ctrl+C)
pnpm dev
```

Your new theme will now appear in the admin panel!

## Technical Architecture

### Database Storage

The active theme is stored in the `SystemSettings` table:

```prisma
model SystemSettings {
	id        String   @id @default("system")
	theme     String   @default("default")
	updatedAt DateTime @updatedAt
	updatedBy String?
}
```

### Theme Loading Flow

1. **Server-Side Rendering**
   - `ThemeStyles` component (in `app/layout.tsx`)
   - Reads active theme from database
   - Injects CSS into `<head>`
   - Prevents flash of unstyled content (FOUC)

2. **Admin Panel**
   - Uses tRPC to fetch and update themes
   - Calls `theme.setActiveTheme()` mutation
   - Creates audit log entry
   - Reloads page to apply changes

3. **API Endpoint**
   - `/api/theme` serves active theme CSS
   - Includes cache headers (60s TTL)
   - Fallback to default theme on error

### Key Files

```
themes/                              # Theme CSS files
├── default.css
├── bubblegum.css
├── ocean.css
└── forest.css

lib/theme/
├── config.ts                        # Theme definitions
└── server.ts                        # Server-side utilities

server/api/routers/theme.ts          # tRPC router

components/
├── theme-styles.tsx                 # Server component (CSS injection)
└── admin/theme-manager.tsx          # Admin UI

app/
├── layout.tsx                       # Imports ThemeStyles
├── (admin)/admin/themes/page.tsx    # Admin theme page
└── api/theme/route.ts               # Theme API endpoint
```

## Color Format: OKLCH

This project uses **OKLCH** color space, which offers:

- **Perceptually uniform** - Equal changes in values result in equal perceptual changes
- **Wide gamut** - Access to more vivid colors
- **Better for gradients** - Smoother transitions
- **Accessibility** - Easier to maintain consistent contrast ratios

### OKLCH Syntax

```css
oklch(lightness chroma hue / alpha)
```

**Examples:**
```css
--primary: oklch(0.6 0.15 220);     /* Blue */
--primary: oklch(0.7 0.2 330);      /* Pink */
--border: oklch(1 0 0 / 10%);       /* White with 10% opacity */
```

**Parameters:**
- **Lightness (L)**: 0-1 (0 = black, 1 = white)
- **Chroma (C)**: 0-0.4+ (0 = gray, higher = more vivid)
- **Hue (H)**: 0-360 degrees (color wheel)

### Converting from Hex to OKLCH

Use tools like:
- [OKLCH Color Picker](https://oklch.com/)
- [TweakCN](https://tweakcn.com/) (built-in conversion)

## Audit Logging

All theme changes are logged in the `audit_logs` table:

```json
{
	"action": "theme.change",
	"resource": "system_settings",
	"resourceId": "system",
	"metadata": {
		"themeId": "bubblegum"
	}
}
```

View audit logs at `/admin/audit`.

## Security

- **Admin-only access**: Only users in `ADMIN_EMAILS` can change themes
- **Input validation**: Theme IDs are validated against allowed themes
- **Rate limiting**: Protected by application rate limiter
- **Audit trail**: All changes are logged with user info

## Troubleshooting

### Theme not appearing after creation

1. Check filename matches theme ID in `config.ts`
2. Ensure CSS file is in `themes/` directory
3. Restart dev server
4. Check browser console for errors

### Theme changes not applying

1. Clear browser cache
2. Check Network tab for `/api/theme` request
3. Verify theme CSS loads in page source
4. Check database: `SELECT * FROM system_settings`

### Colors look wrong

1. Verify OKLCH values are valid
2. Check both `:root` and `.dark` have all variables
3. Test in light and dark modes
4. Compare with working theme file

## Best Practices

### Theme Design

1. **Start with TweakCN** - Use the visual editor for consistency
2. **Test both modes** - Verify light and dark mode appearance
3. **Check contrast** - Ensure text is readable on all backgrounds
4. **Preview components** - Test on actual UI before deploying

### CSS Variables

1. **Keep structure consistent** - Follow existing theme format exactly
2. **Include all variables** - Missing variables cause fallback to defaults
3. **Use OKLCH** - Don't mix color formats
4. **Comment your themes** - Add description at the top of CSS file

### Performance

1. **Minimize CSS size** - Remove comments in production
2. **Cache themes** - The API route includes cache headers
3. **Avoid inline styles** - Use CSS variables consistently
4. **Test load time** - Large theme files impact page load

## Examples

### Creating a "Midnight" Theme

1. **Create CSS file** - `themes/midnight.css`:

```css
/* Midnight Theme - Deep blues with gold accents */

:root {
	--radius: 0.625rem;
	--background: oklch(1 0 0);
	--foreground: oklch(0.15 0.03 240);
	--primary: oklch(0.4 0.15 240);
	--primary-foreground: oklch(0.98 0 0);
	--accent: oklch(0.7 0.15 60);
	/* ... */
}

.dark {
	--background: oklch(0.1 0.03 240);
	--foreground: oklch(0.95 0 0);
	--primary: oklch(0.55 0.18 240);
	--accent: oklch(0.75 0.18 60);
	/* ... */
}
```

2. **Register theme** - `lib/theme/config.ts`:

```typescript
{
	id: 'midnight',
	name: 'Midnight',
	description: 'Deep blues with gold accents',
	previewColors: {
		primary: '#1e3a8a',
		secondary: '#f0f9ff',
		accent: '#fbbf24',
	},
}
```

3. **Restart and apply** - `pnpm dev` → Navigate to `/admin/themes`

## Support

For issues or questions:
- Check the console for error messages
- Review `CLAUDE.md` for architecture details
- Examine existing theme files for reference
- Test with the default theme to isolate issues

## Future Enhancements

Potential improvements:
- User-specific theme preferences
- Theme preview mode (test before applying)
- Theme scheduling (e.g., different themes for holidays)
- Real-time theme editing in admin panel
- Theme export/import functionality
- Community theme marketplace
