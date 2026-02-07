## Iteration 1 - 2026-02-07

Task: clera-4w2 - Define project scope and create initial issues
Status: CLOSED

Explored full codebase. Project is a matchmaking system (apples<->oranges) with:
- Supabase edge functions (Deno) for fruit generation (steps 1-2 done, steps 3-5 TODO)
- Next.js 16 frontend with Zustand store (scaffold only, dashboard placeholder)
- Seed data: 40 fruits in data/raw_apples_and_oranges.json
- SurrealDB required but not yet set up

Created 6 issues in priority order:
1. clera-5a1 (P1): Set up SurrealDB + load seed data — hard req
2. clera-5a5 (P1): Conversation visualization UI — hard req
3. clera-5a2 (P2): Store generated fruits in SurrealDB from edge fns
4. clera-5a3 (P2): Matching algorithm (score + rank)
5. clera-5a4 (P2): LLM match communication — hard req
6. clera-5a6 (P3): Metrics/analytics dashboard

Hard requirements from README: SurrealDB storage, conversation visualization, LLM match results.

Files changed: .beads/issues.jsonl, progess.txt
Blockers: bd CLI not available in env; wrote issues directly to JSONL.

## Iteration 2 - 2026-02-07

Task: clera-5a1 - Set up SurrealDB and load seed data
Status: CLOSED

Added SurrealDB v2 via docker-compose.yml on port 8000 (root/root creds, file-backed storage).
Created shared SurrealDB HTTP client (`supabase/functions/_shared/surrealdb.ts`) with:
- Schema init (SCHEMAFULL table, type index, flexible attributes/preferences fields)
- insertFruit, getFruitsByType, getAllFruits, getFruitCount operations
- All config via env vars with localhost defaults
Created seed script (`scripts/seed-surrealdb.ts`) — Deno script that:
- Reads data/raw_apples_and_oranges.json (40 fruits)
- Sets up schema, clears existing data (idempotent), batch inserts all fruits
- Verifies counts by type after seeding
Added npm scripts: surrealdb:start, surrealdb:stop, surrealdb:seed.
Added .env.example with SurrealDB connection defaults.

Key decisions:
- Used SurrealDB HTTP API (not WebSocket/SDK) for simplicity in Deno edge fns
- Single `fruit` table with type field + index (not separate apple/orange tables) — simpler queries for cross-type matching
- SCHEMAFULL with FLEXIBLE object fields — schema enforced for top-level, flexible for nested attributes/preferences
- File-backed persistence in Docker volume (not in-memory) so data survives restarts

Files changed: docker-compose.yml (new), supabase/functions/_shared/surrealdb.ts (new), scripts/seed-surrealdb.ts (new), .env.example (new), package.json, supabase/config.toml
Blockers: Docker daemon not running in agent env, no Deno runtime — couldn't test seed script execution. Code is ready for user to run.
