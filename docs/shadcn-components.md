# shadcn/ui Components

UI primitives copied into the repo with the shadcn CLI. They are source files you own, not a dependency.

## Where the code lives

- `components/ui/` holds the components (accordion through tooltip, plus the non-standard `code-block`, `markdown`, and `date-range-picker`).
- `components.json` is the CLI config: style `new-york`, RSC on, base color `zinc`, CSS variables on, icons `lucide`, Tailwind CSS in `app/globals.css`, aliases `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.
- `lib/utils.ts` exports `cn()`.
- Colors come from the active theme, not from `components.json`. See [theming.md](./theming.md).

## Commands

```bash
pnpm shadcn:add dialog sheet     # add components
pnpm shadcn:diff                 # show upstream changes vs local files
pnpm shadcn:update button        # re-add with --overwrite
pnpm shadcn:update-all           # scripts/update-shadcn.sh: overwrite every listed component that exists locally
```

`scripts/add-shadcn.sh` adds a fixed list (`data-table`, `combobox`, `date-picker`); edit the array before running it. It has no package.json alias.

## Updating safely

1. Commit first. Overwrite replaces the whole file, including local edits.
2. Run `pnpm shadcn:diff` and review.
3. Update, then `git diff components/ui` and restore any customizations you want to keep.
4. Run `pnpm typecheck` and `pnpm lint`.

When a component needs project-specific behavior, wrap it in a component outside `components/ui/` instead of editing it, so updates stay clean.

## Gotchas

- `scripts/update-shadcn.sh` has a hardcoded list. Add new components to it, or `update-all` will skip them.
- `code-block` and `markdown` are listed in that script but are not part of the default shadcn registry, so `update-all` may fail on them or replace them with something else. Review the diff after running it.
- New components may add Radix or other packages to `package.json`; commit the lockfile change.
