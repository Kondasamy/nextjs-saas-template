#!/bin/bash

# Components to add
# Edit this array to include the components you want to add
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

