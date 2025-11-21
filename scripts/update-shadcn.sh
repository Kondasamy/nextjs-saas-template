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

