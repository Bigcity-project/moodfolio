# Moodfolio Frontend

Next.js 14 frontend for the Moodfolio investment decision support system.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Production server |
| `pnpm lint` | ESLint check |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS, Framer Motion
- **Charts:** Recharts
- **Components:** Radix UI primitives
- **Testing:** Playwright, Vitest

## API Types

Generate TypeScript types from OpenAPI:

```bash
cd ../scripts && ./generate-client.sh
```

Types output to `src/types/api-types.ts`
