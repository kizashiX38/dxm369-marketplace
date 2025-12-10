# AGENTS.md

**Package manager:** pnpm (preferred) or npm

## Build/Lint/Test
- `pnpm dev` / `npm run dev` - Development server
- `pnpm build` / `npm run build` - Production build with type checking
- `pnpm build:strict` - Includes environment validation
- `pnpm lint` / `npm run lint` - ESLint with Next.js config
- No test framework; use `npm run build` for type checking

## Code Style
- **TypeScript**: Strict mode; explicit types
- **Imports**: Use `@/` alias; external imports first
- **Naming**: PascalCase components/types, camelCase functions/variables
- **Components**: Prefer server components; Tailwind CSS for styling
- **API Routes**: Must use `apiSafe()` wrapper; return `{ ok, data/error }`
- **Error Handling**: Never expose raw errors; use structured logging
- **Environment**: Use `src/lib/env.ts` helpers; never hardcode secrets

## Cursor Rules (.cursorrules)
- Create backups in `.cursor_backups/` before edits
- Glassmorphism design system (cyber-glass theme)
- Context-aware tracking via `buildAmazonProductUrl()`

## Project Constraints
- **DXM scoring**: Use algorithms in `src/lib/categories/` (never hardcode)
- **Amazon integration**: AWS Signature v4 with LRU caching