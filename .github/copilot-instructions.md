# Tanamao Migration — Copilot Instructions

## Overview
- Purpose: scripts for migrating legacy Tanamao data into the modern CPS platform.
- Tech: Node.js + TypeScript, targeting MongoDB databases.
- Entry points: `src/company`, `src/user`, `src/products`, plus support scripts in project root.

## Coding Expectations
- Follow TypeScript strictness defined in `tsconfig.json`.
- Prefer async/await patterns; avoid mixing callbacks or raw `then` chains.
- Maintain existing logging format (emoji-prefixed messages) when extending scripts.
- Stick to ASCII characters unless a file already contains Unicode.
- Add lightweight comments only when logic is non-obvious.

## Formatting & Linting
- Use Prettier defaults (2-space indentation); align with existing file formatting.
- Do not introduce new dependencies without confirming necessity.

## Testing & Validation
- Use provided scripts (`test-company-migration.ts`, `validate-migration.ts`) as references for manual validation.
- Migration functions should return structured summaries (counts, errors) for downstream reporting.

## Data Handling
- Preserve original Mongo `_id` values when migrating documents unless explicitly remapping.
- Respect rate limits when calling external services (e.g., Nominatim); reuse existing throttling utilities.
- Do not remove or bypass safety checks that protect data integrity (e.g., existence checks, retries).

## Collaboration Notes
- Keep changes isolated per domain (company vs. user) to simplify review.
- When adding new migration steps, ensure they can resume safely if partially completed.
