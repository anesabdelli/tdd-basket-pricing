# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TDD-based e-commerce basket pricing system with multiple layers:
- **Backend**: Express API with business logic for basket management and price calculation with promotional codes
- **Frontend**: React + TypeScript app with Vite, TailwindCSS, and shadcn/ui components
- **Testing**: Comprehensive test suite using Vitest with unit, integration, and E2E tests

The main objective is to calculate the final price of a shopping basket after applying one or more promotional codes.

## Commands

### Backend Development
```bash
npm install                    # Install backend dependencies
npm test                       # Run unit tests (Vitest)
npm test -- <test-file-name>   # Run a single test file
npm run test:integration       # Run integration tests
npm run test:e2e               # Run end-to-end tests
npm run test:mutate            # Run mutation testing (Stryker)
npm run dev                    # Start the Express API server on port 3000
```

### Frontend Development
```bash
cd frontend
npm install              # Install frontend dependencies
npm run dev              # Start Vite dev server
npm run build            # Build for production (TypeScript + Vite)
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

## Architecture

### Backend Structure (`app/` and `api/`)
- **Use cases** (`app/`): Core business logic following clean architecture
  - `calcul-price.usecase.ts`: Calculates basket price with promotional codes (percentage discounts, fixed euro discounts, free products, product-specific discounts, Black Friday)
  - `save-basket.usecase.ts`: Saves basket after price calculation
  - `remove-basket.usecase.ts`: Removes basket by ID
- **Gateways/Interfaces**:
  - `reduction.gateway.ts`: Interface for fetching promotional codes
  - `id-generator.provider.ts`: Interface for generating IDs
- **API layer** (`api/`):
  - `routes.ts`: Express routes for basket management (GET/POST/DELETE `/baskets`)
  - `server.ts`: Express server setup
  - `infra/`: Infrastructure implementations (repositories, database adapters)

### Promotional Code System
Discount types are applied in a specific order:
1. Product-specific promotions (e.g., 10% on t-shirts only)
2. Fixed/percentage discounts
3. Black Friday discount (50% on entire basket, time-based, stackable)

Rules:
- Discounts never bring total below 0€ (Black Friday minimum is 1€)
- Can target specific product types (ProductsType enum: TSHIRT, PULL)
- May have minimum purchase thresholds

### Frontend Structure (`frontend/src/`)
- React application using Vite
- UI components from shadcn/ui (Radix UI + TailwindCSS)
- Uses axios for API communication with the backend

### Testing Strategy
- **Unit tests** (`test/*.test.ts`): Test individual use cases with stubs
  - `in-memory-basket.repository.ts`: In-memory implementation for testing
  - `stub-reduction-code.gateway.ts`: Stub for promotional codes
  - `product.builder.ts`: Test data builder
- **Integration tests** (`**/*.it-spec.ts`): Test database integration with Knex + PostgreSQL in Docker
- **E2E tests** (`**/*.e2e-spec.ts`): Full API testing
- **Path alias**: `@/*` maps to `app/*` (configured in tsconfig.json)

### Database & Integration Testing
- Uses Knex.js for database operations
- PostgreSQL with Testcontainers for integration/E2E tests
- Configuration in `setup-integration-tests/`:
  - `docker-compose-postgresql-test.yaml`: Test database setup
  - `knexfile.ts`: Knex configuration
  - `migrations/`: Database migrations

## Code Style
- Uses Biome for formatting and linting (tab indentation, double quotes)
- TypeScript strict mode enabled (except `noImplicitAny: false`)
- CommonJS module system for backend

## Environment Setup
- Backend may require environment variables (check `.env` files in root and frontend directories)
- Integration/E2E tests use Docker containers (PostgreSQL via Testcontainers) - Docker must be running
