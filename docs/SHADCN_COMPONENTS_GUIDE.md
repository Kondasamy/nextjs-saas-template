# ShadCN UI Components Management Guide

A comprehensive guide for updating existing ShadCN components and adding new components using `pnpm`.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Using pnpm with ShadCN CLI](#using-pnpm-with-shadcn-cli)
- [Adding New Components](#adding-new-components)
- [Updating Existing Components](#updating-existing-components)
- [Checking for Updates](#checking-for-updates)
- [Batch Operations](#batch-operations)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ installed
- `pnpm` package manager installed
- Project initialized with ShadCN UI (see `components.json`)

## Using pnpm with ShadCN CLI

ShadCN UI CLI can be run with `pnpm` using `pnpm dlx` (recommended) or `pnpm exec`:

### Recommended Method: `pnpm dlx`

```bash
pnpm dlx shadcn@latest [command]
```

This downloads and runs the latest version of the ShadCN CLI without installing it globally.

### Alternative Method: `pnpm exec`

```bash
pnpm exec shadcn@latest [command]
```

## Adding New Components

### Browse Available Components

To see all available components:

```bash
pnpm dlx shadcn@latest add
```

This will show an interactive list of all available components.

### Add a Specific Component

```bash
pnpm dlx shadcn@latest add [component-name]
```

**Examples:**

```bash
# Add a single component
pnpm dlx shadcn@latest add button

# Add multiple components at once
pnpm dlx shadcn@latest add button card input

# Add with specific path
pnpm dlx shadcn@latest add button --cwd ./components
```

### Popular Components to Add

```bash
# Form components
pnpm dlx shadcn@latest add form input textarea select checkbox radio-group

# Data display
pnpm dlx shadcn@latest add table data-table chart

# Navigation
pnpm dlx shadcn@latest add navigation-menu breadcrumb pagination

# Feedback
pnpm dlx shadcn@latest add toast sonner alert alert-dialog

# Overlays
pnpm dlx shadcn@latest add dialog sheet popover tooltip

# Layout
pnpm dlx shadcn@latest add separator divider resizable
```

## Updating Existing Components

### Check What's Changed

Before updating, check what has changed in a component:

```bash
pnpm dlx shadcn@latest diff [component-name]
```

**Example:**

```bash
pnpm dlx shadcn@latest diff button
```

### Update a Single Component

To update an existing component, re-add it with the `--overwrite` flag:

```bash
pnpm dlx shadcn@latest add [component-name] --overwrite
```

**Example:**

```bash
pnpm dlx shadcn@latest add button --overwrite
```

The CLI will show you a diff of the changes before overwriting. Review the changes carefully.

### Update All Components

There's no built-in command to update all components at once. You'll need to update them individually or use a batch script (see [Batch Operations](#batch-operations)).

## Checking for Updates

### Check All Components

To see what components have updates available:

```bash
pnpm dlx shadcn@latest diff
```

This will show differences for all components in your project.

### Check Specific Component

```bash
pnpm dlx shadcn@latest diff [component-name]
```

## Batch Operations

### Create a Batch Update Script

Create a script to update multiple components at once:

**Create `scripts/update-shadcn.sh`:**

```bash
#!/bin/bash

# List of all ShadCN components in your project
components=(
  "accordion"
  "alert"
  "alert-dialog"
  "aspect-ratio"
  "avatar"
  "badge"
  "breadcrumb"
  "button"
  "calendar"
  "card"
  "carousel"
  "chart"
  "checkbox"
  "code-block"
  "collapsible"
  "command"
  "context-menu"
  "dialog"
  "drawer"
  "dropdown-menu"
  "form"
  "hover-card"
  "input"
  "input-otp"
  "label"
  "markdown"
  "menubar"
  "navigation-menu"
  "pagination"
  "popover"
  "progress"
  "radio-group"
  "resizable"
  "scroll-area"
  "select"
  "separator"
  "sheet"
  "sidebar"
  "skeleton"
  "slider"
  "sonner"
  "switch"
  "table"
  "tabs"
  "textarea"
  "toggle"
  "toggle-group"
  "tooltip"
)

echo "Updating ShadCN components..."
echo "================================"

for component in "${components[@]}"; do
  if [ -f "components/ui/${component}.tsx" ]; then
    echo ""
    echo "Updating $component..."
    pnpm dlx shadcn@latest add "$component" --overwrite
  else
    echo "Skipping $component (not found)"
  fi
done

echo ""
echo "================================"
echo "Update complete!"
```

**Make it executable:**

```bash
chmod +x scripts/update-shadcn.sh
```

**Run the script:**

```bash
./scripts/update-shadcn.sh
```

### Add Multiple New Components

Create a script to add multiple new components:

**Create `scripts/add-shadcn.sh`:**

```bash
#!/bin/bash

# Components to add
components=(
  "data-table"
  "combobox"
  "date-picker"
)

echo "Adding ShadCN components..."
echo "================================"

for component in "${components[@]}"; do
  echo ""
  echo "Adding $component..."
  pnpm dlx shadcn@latest add "$component"
done

echo ""
echo "================================"
echo "Components added!"
```

## Best Practices

### 1. Version Control

Always commit your changes before updating components:

```bash
git add .
git commit -m "chore: commit before ShadCN component updates"
```

This allows you to easily revert if something breaks.

### 2. Review Diffs

Always review the diff before overwriting:

```bash
pnpm dlx shadcn@latest diff [component-name]
```

### 3. Test After Updates

After updating components, test your application:

```bash
pnpm dev
```

### 4. Update Dependencies

ShadCN components may require updated dependencies. After adding/updating components, check if you need to update:

```bash
pnpm update @radix-ui/react-*
```

### 5. Check Breaking Changes

Before major updates, check the ShadCN UI changelog:
- [ShadCN UI Releases](https://github.com/shadcn-ui/ui/releases)
- [ShadCN UI Documentation](https://ui.shadcn.com)

### 6. Custom Modifications

If you've customized a component, be careful when updating. Consider:

1. Creating a wrapper component instead of modifying the base component
2. Using CSS variables for styling instead of direct modifications
3. Documenting your customizations

## Package.json Scripts

Add convenient scripts to your `package.json`:

```json
{
  "scripts": {
    "shadcn:add": "pnpm dlx shadcn@latest add",
    "shadcn:diff": "pnpm dlx shadcn@latest diff",
    "shadcn:update": "pnpm dlx shadcn@latest add --overwrite",
    "shadcn:update-all": "./scripts/update-shadcn.sh"
  }
}
```

**Usage:**

```bash
# Add a component
pnpm shadcn:add button

# Check for updates
pnpm shadcn:diff

# Update a component
pnpm shadcn:update button

# Update all components
pnpm shadcn:update-all
```

## Current Project Configuration

Your project is configured with:

- **Style**: `new-york`
- **RSC**: Enabled (React Server Components)
- **TypeScript**: Enabled
- **CSS Variables**: Enabled
- **Base Color**: `zinc`
- **Icon Library**: `lucide`

These settings are automatically used when adding/updating components.

## Troubleshooting

### Issue: Component not found

**Solution:** Make sure you're using the correct component name. Check available components:

```bash
pnpm dlx shadcn@latest add
```

### Issue: Overwrite conflicts

**Solution:** Review the diff carefully:

```bash
pnpm dlx shadcn@latest diff [component-name]
```

If you have custom modifications, consider:
1. Backing up your customizations
2. Creating a wrapper component
3. Manually merging changes

### Issue: TypeScript errors after update

**Solution:** 
1. Check if dependencies need updating:
   ```bash
   pnpm update @radix-ui/react-*
   ```
2. Restart your TypeScript server
3. Clear `.next` cache:
   ```bash
   rm -rf .next
   ```

### Issue: Styling breaks after update

**Solution:**
1. Check if CSS variables changed
2. Review `app/globals.css` for any conflicts
3. Verify Tailwind configuration

### Issue: pnpm dlx not working

**Solution:** Use `pnpm exec` instead:

```bash
pnpm exec shadcn@latest add [component-name]
```

Or install globally (not recommended):

```bash
pnpm add -g shadcn
shadcn add [component-name]
```

## Quick Reference

### Common Commands

```bash
# Add a new component
pnpm dlx shadcn@latest add [component-name]

# Add multiple components
pnpm dlx shadcn@latest add button card input

# Check for updates
pnpm dlx shadcn@latest diff

# Check specific component
pnpm dlx shadcn@latest diff button

# Update a component
pnpm dlx shadcn@latest add button --overwrite

# Browse all components
pnpm dlx shadcn@latest add
```

### Component Categories

**Form Components:**
- `form`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider`

**Data Display:**
- `table`, `data-table`, `chart`, `card`, `badge`, `avatar`

**Navigation:**
- `navigation-menu`, `breadcrumb`, `pagination`, `tabs`, `sidebar`

**Feedback:**
- `toast`, `sonner`, `alert`, `alert-dialog`, `progress`

**Overlays:**
- `dialog`, `sheet`, `drawer`, `popover`, `tooltip`, `hover-card`

**Layout:**
- `separator`, `resizable`, `scroll-area`, `aspect-ratio`

## Additional Resources

- [ShadCN UI Documentation](https://ui.shadcn.com)
- [ShadCN UI GitHub](https://github.com/shadcn-ui/ui)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)

---

**Last Updated:** 2025
**Project:** Enterprise SaaS Template

