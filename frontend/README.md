# React + TypeScript + Vite + shadcn/ui

This is a template for a new Vite project with React, TypeScript, and shadcn/ui.

## Design system gallery

Run `npm install` once, then `npm run dev` from this directory and open the local
URL printed by Vite. The home page shows every installed UI component, its
variants and common states, plus color, typography, and radius tokens.

Use the theme selector to compare light and dark mode. The button playground
lets you change the variant, size, label, and disabled state and see matching JSX.
Playground changes are previews; edit the source to keep a variation:

- `src/components/ui/`: shared component styles and variants.
- `src/index.css`: theme tokens, typography, and corner radius.
- `src/pages/design-system.tsx`: gallery examples and playground controls.

Run `npm run build` to check TypeScript and build the frontend.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `src/components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```
