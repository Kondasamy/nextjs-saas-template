# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
pnpm dev         # Start development server at http://localhost:3000
pnpm build       # Build for production (TypeScript errors ignored in build)
pnpm start       # Start production server
pnpm lint        # Run Oxlint to check for linting issues
pnpm lint:fix    # Run Oxlint with auto-fix
pnpm format      # Format code, sort imports, and remove unused imports with Biome
pnpm pre-commit  # Run formatting and linting (used by Husky pre-commit hook)
```

**Package Manager**: This project uses `pnpm`. Do not use `npm` or `yarn`.

## Code Quality Tools

The project uses two modern linting/formatting tools:

- **Biome** (`biome.json`): Handles formatting, import organization, and unused import removal
  - Configured for: tab indentation (width 2), single quotes, no semicolons, ES5 trailing commas
  - Line width: 80 characters
  - Automatically organizes imports with `pnpm format`

- **Oxlint** (`.oxlintrc.json`): Fast Rust-based linter
  - Allows `@typescript-eslint/no-explicit-any`
  - Ignores build artifacts and lock files

**Git Hooks**: Husky pre-commit hook runs `pnpm format && pnpm lint:fix` automatically before each commit.

## Architecture Overview

This is a **Next.js 15 App Router** SaaS template with a content-driven architecture.

### Content Management Pattern

Content is managed through **TypeScript data files** rather than a CMS:

- **Features**: `app/features/data.ts` exports `THINGS[]` array of type `Thing`
  - Each feature has: `uid`, `title`, `description`, `link`, `url`, `cover`, `github`, etc.
  - Dynamic routes: `app/features/[slug]/page.tsx` renders individual features

- **Documentation**: `app/docs/data.ts` exports `tutorials[]` and `videoTutorials[]`
  - Types: `Tutorial` and `VideoTutorial` with social links support
  - Combined export: `TUTORIALS = [...tutorials, ...videoTutorials]`

- **Blog**: `app/blog/data.ts` for blog posts
  - Supports both data file entries and MDX files at `app/blog/[slug]/page.mdx`

**Important**: When adding new content, update the respective data files. The slug in URLs should match the `link` property in the data objects.

### Layout Architecture

**Root Layout** (`app/layout.tsx`):
- Wraps entire app with `SidebarProvider` → `AppSidebar` → `SidebarInset` structure
- `ThemeProvider` from next-themes enables dark/light mode (default: dark)
- Global components: `PageHeader` and `Toaster` (Sonner)
- Fonts: Geist and Geist Mono via next/font

**Sidebar Navigation** (`components/app-sidebar.tsx`):
- Client component using `usePathname()` for active state
- Navigation data defined inline (not from data files)
- Main nav: Dashboard, Features, Documentation, Blog
- Uses constants from `lib/constants.ts`: `NAME`, `EMAIL_URL`, `IMAGE_URL`

### Customization Entry Points

1. **Branding**: `lib/constants.ts` - Update company name, URLs, contact info
2. **SEO Metadata**: `app/layout.tsx` - Site title, description, OpenGraph, Twitter cards
3. **Theme Colors**: `app/globals.css` - CSS variables for theming
4. **Navigation**: `components/app-sidebar.tsx` - Sidebar menu structure

### TypeScript Configuration

- Path alias: `@/*` maps to root directory
- `typescript.ignoreBuildErrors: true` in `next.config.mjs` (allows builds with type errors)
- Strict mode enabled in `tsconfig.json`

### MDX Support

- Configured via `@next/mdx` in `next.config.mjs`
- `mdx-components.tsx` defines custom MDX components
- Page extensions: `['js', 'jsx', 'ts', 'tsx', 'md', 'mdx']`

### Motion Primitives

10 custom animation components in `components/motion-primitives/`:
- animated-background, magnetic, morphing-dialog, progressive-blur, scroll-progress
- spotlight, text-effect, text-loop, text-morph, tilt

These are reusable motion components built with Framer Motion for enhanced UI interactions.

## Tech Stack Notes

- **Next.js 15.1.1** with React 19 (App Router only, no Pages Router)
- **Tailwind CSS 4** (note: v4 uses different configuration than v3)
- **shadcn/ui**: 50+ Radix UI components in `components/ui/`
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Code Highlighting**: Shiki
- **Markdown**: react-markdown + remark-gfm
- **Animations**: Motion library (Framer Motion fork)
- **Toast**: Sonner
- **Analytics**: Vercel Analytics integration

## Image Configuration

`next.config.mjs` allows remote images from:
- placehold.co (placeholder images)
- api.dicebear.com (avatar generation)
- github.com
- *.googleapis.com
- imagedelivery.net
- raw.githubusercontent.com

SVG images are allowed with CSP restrictions.
