# ShadCN UI Components Guide

Managing and updating ShadCN UI components in your project.

## Quick Commands

```bash
# Add a new component
pnpm dlx shadcn@latest add button

# Add multiple components
pnpm dlx shadcn@latest add button card input

# Check for updates
pnpm dlx shadcn@latest diff

# Update a component (with overwrite)
pnpm dlx shadcn@latest add button --overwrite

# Browse available components
pnpm dlx shadcn@latest add
```

## Project Configuration

Your project uses the following ShadCN settings (from `components.json`):

- **Style**: `new-york`
- **TypeScript**: Enabled
- **Tailwind CSS**: Enabled
- **React Server Components**: Enabled
- **CSS Variables**: Enabled
- **Base Color**: `zinc`
- **Icon Library**: `lucide-react`

## Adding Components

### Interactive Mode

Browse and select components interactively:

```bash
pnpm dlx shadcn@latest add
```

### Specific Components

Add components by name:

```bash
# Single component
pnpm dlx shadcn@latest add dialog

# Multiple components
pnpm dlx shadcn@latest add form input textarea select

# Common component sets
pnpm dlx shadcn@latest add button card badge avatar    # UI basics
pnpm dlx shadcn@latest add form input select checkbox  # Forms
pnpm dlx shadcn@latest add dialog sheet popover        # Overlays
pnpm dlx shadcn@latest add table data-table            # Data display
```

## Updating Components

### Check for Updates

See what components have updates available:

```bash
# Check all components
pnpm dlx shadcn@latest diff

# Check specific component
pnpm dlx shadcn@latest diff button
```

### Update Components

Update an existing component:

```bash
# Review changes first
pnpm dlx shadcn@latest diff button

# Apply update
pnpm dlx shadcn@latest add button --overwrite
```

⚠️ **Warning**: If you've customized components, review changes carefully before overwriting.

### Batch Updates

Create a script for updating multiple components:

```bash
#!/bin/bash
# scripts/update-shadcn.sh

components=(
  "button"
  "card"
  "dialog"
  "form"
  # Add your components here
)

for component in "${components[@]}"; do
  echo "Updating $component..."
  pnpm dlx shadcn@latest add "$component" --overwrite
done
```

Make it executable:

```bash
chmod +x scripts/update-shadcn.sh
./scripts/update-shadcn.sh
```

## Package.json Scripts

Add convenience scripts to your `package.json`:

```json
{
  "scripts": {
    "ui:add": "pnpm dlx shadcn@latest add",
    "ui:diff": "pnpm dlx shadcn@latest diff",
    "ui:update": "pnpm dlx shadcn@latest add --overwrite"
  }
}
```

Usage:

```bash
pnpm ui:add button           # Add component
pnpm ui:diff                 # Check updates
pnpm ui:update button         # Update component
```

## Component Categories

### Forms
`form`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider`, `toggle`, `input-otp`

### Data Display
`table`, `data-table`, `card`, `badge`, `avatar`, `aspect-ratio`, `chart`

### Navigation
`navigation-menu`, `breadcrumb`, `pagination`, `tabs`, `sidebar`, `menubar`

### Feedback
`toast`, `sonner`, `alert`, `alert-dialog`, `progress`, `skeleton`

### Overlays
`dialog`, `sheet`, `drawer`, `popover`, `tooltip`, `hover-card`, `dropdown-menu`, `context-menu`

### Layout
`separator`, `scroll-area`, `resizable`, `collapsible`, `accordion`

## Best Practices

### 1. Version Control

Always commit before updating:

```bash
git add .
git commit -m "chore: before shadcn updates"
pnpm dlx shadcn@latest add button --overwrite
```

### 2. Custom Components

Instead of modifying base components, create wrappers:

```tsx
// components/custom/primary-button.tsx
import { Button, ButtonProps } from '@/components/ui/button'

export function PrimaryButton(props: ButtonProps) {
  return <Button variant="default" size="lg" {...props} />
}
```

### 3. Update Dependencies

After adding/updating components:

```bash
# Update Radix UI dependencies
pnpm update @radix-ui/react-*

# Update other related packages
pnpm update class-variance-authority clsx tailwind-merge
```

## Troubleshooting

### Component Not Found

Check available components:

```bash
pnpm dlx shadcn@latest add
```

### TypeScript Errors After Update

1. Update dependencies:
   ```bash
   pnpm update @radix-ui/react-*
   ```

2. Restart TypeScript server in your IDE

3. Clear Next.js cache:
   ```bash
   rm -rf .next
   pnpm dev
   ```

### Styling Issues

1. Check if CSS variables changed in `app/globals.css`
2. Verify Tailwind configuration
3. Clear browser cache
4. Compare with original component from [ui.shadcn.com](https://ui.shadcn.com)

### pnpm dlx Not Working

Alternative methods:

```bash
# Use pnpm exec
pnpm exec shadcn@latest add button

# Or use npx
npx shadcn@latest add button
```

## Customization

### Modifying Component Defaults

Create a custom configuration file:

```tsx
// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Custom default variants
export const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  // Add custom variants
}
```

### Global Component Styles

Modify in `app/globals.css`:

```css
@layer components {
  /* Override button styles globally */
  .ui-button {
    @apply rounded-lg font-semibold;
  }
}
```

## Resources

- [ShadCN UI Documentation](https://ui.shadcn.com)
- [Component Examples](https://ui.shadcn.com/examples)
- [Radix UI Primitives](https://www.radix-ui.com)
- [GitHub Repository](https://github.com/shadcn-ui/ui)