# Theming

An admin picks one site-wide color theme. Each user can separately switch light/dark/system mode.

## Where the code lives

| Path | Role |
|------|------|
| `themes/*.css` | 14 theme files, each with `:root`, `.dark`, and `@theme inline` blocks |
| `lib/theme/config.ts` | `AVAILABLE_THEMES` registry, `DEFAULT_THEME`, `isValidTheme` |
| `lib/theme/server.ts` | `getActiveTheme`, `setActiveTheme`, `getThemeCSS` (reads the file from disk) |
| `components/theme-styles.tsx` | Server component that inlines the active theme's CSS into `<head>` (in `app/layout.tsx`) |
| `components/admin/theme-manager.tsx` | Admin UI at `/admin/themes` |
| `server/api/routers/theme.ts` | `getAvailableThemes`, `getActiveTheme`, `getThemeCSS` (public), `setActiveTheme` (admin only) |
| `app/api/theme/route.ts` | `GET /api/theme` returns the active theme CSS (60s cache). Nothing in the app calls it. |
| `app/globals.css` | Maps theme variables to Tailwind tokens; defines no colors itself |

Available theme ids: `default`, `bubblegum`, `ocean`, `forest`, `claymorphism`, `elegant-luxury`, `neo-brutalism`, `supabase`, `vercel`, `vintage-paper`, `violet-bloom`, `claude`, `darkmatter`, `clean-slate`.

## How it works

- The active theme id is stored in `SystemSettings.theme` (single row, `id = 'system'`). Unknown or missing ids fall back to `default`.
- `ThemeStyles` reads the matching CSS file on each render and inlines it, so there is no flash of the wrong theme.
- `setActiveTheme` checks `isUserAdmin` (via `ADMIN_EMAILS`), validates the id against the registry, upserts `SystemSettings`, and writes an `AuditLog` entry with action `theme.change`. The admin UI then reloads the page.
- Light/dark mode is per user via `next-themes` (`class` attribute, storage key `theme-preference`) in `app/layout.tsx`.

## Add a theme

1. Create `themes/<id>.css`. The easiest route is to export from [tweakcn](https://tweakcn.com/editor/theme) and copy the structure of `themes/default.css`: a `:root` block, a `.dark` block, and the `@theme inline` block.
2. Define the variables the app uses in both `:root` and `.dark`: `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive` (each with `-foreground`), `--border`, `--input`, `--ring`, `--radius`, `--chart-1` to `--chart-5`, `--sidebar` and the `--sidebar-*` variants, plus `--font-sans`, `--font-serif`, `--font-mono` and the `--shadow-*` set.
3. Add an entry to `AVAILABLE_THEMES` in `lib/theme/config.ts`. The `id` must match the filename.
4. Pick it at `/admin/themes`.

## Gotchas

- The sidebar background variable is `--sidebar`, not `--sidebar-background`.
- Fonts are loaded from one hardcoded Google Fonts `<link>` in `app/layout.tsx`. A theme that uses a font not in that link needs the link updated.
- Theme files are read with `fs` from `process.cwd()/themes`, so the `themes/` directory must ship with the deployment.
- Switching themes takes effect on the next request. Adding a theme file or registry entry needs a redeploy.

## Related

[admin.md](./admin.md), [shadcn-components.md](./shadcn-components.md)
