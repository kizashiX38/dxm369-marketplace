# GEMINI.md - AI Project Context

## Project Overview

This is a Next.js 14 project, "DXM369 Gear Nexus," designed as a curated discovery hub for hardware deals. It aggregates product listings from major marketplaces, with a primary focus on future integration with the Amazon Product Advertising API. The application is built with TypeScript and styled using Tailwind CSS, featuring a distinct dark, "cyberpunk" aesthetic.

The architecture is based on the Next.js App Router, with server-side components used for data fetching and rendering. The data layer is designed to be robust, with a fallback to static seed data if the live API is unavailable. A custom "DXM Score" is used to rate and rank deals based on a variety of factors.

## Building and Running

### Prerequisites

*   Node.js 18+
*   pnpm

### Key Commands

*   **Installation:**
    ```bash
    pnpm install
    ```
*   **Running the development server:**
    ```bash
    pnpm dev
    ```
*   **Creating a production build:**
    ```bash
    pnpm build
    ```
*   **Running the production server:**
    ```bash
    pnpm start
    ```
*   **Linting the code:**
    ```bash
    pnpm lint
    ```

## Development Conventions

*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript (strict mode enabled)
*   **Styling:** Tailwind CSS
*   **Package Manager:** pnpm
*   **Project Structure:**
    *   `src/app/`: Next.js App Router pages
    *   `src/components/`: React components
    *   `src/lib/`: Utilities, data fetching, and business logic
    *   `public/`: Static assets
*   **Data Fetching:** The `src/lib/dealRadar.ts` module is the central point for data fetching. It attempts to fetch live data from the Amazon PA-API and falls back to static seed data from `data/asin-seed.json` if the API is unavailable.
*   **Scoring:** A custom "DXM Score" is calculated for each deal using the logic in `src/lib/dxmScoring.ts` and category-specific scoring functions in `src/lib/categories/`.
*   **Styling:** The UI is built with Tailwind CSS, with a custom theme defined in `tailwind.config.ts`. The overall aesthetic is a dark, "cyberpunk" theme.
*   **SEO:** The project includes basic SEO features like a sitemap (`src/app/sitemap.ts`) and structured data in the root layout.
