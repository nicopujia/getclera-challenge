#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env
/**
 * Seed SurrealDB with fruit data from data/raw_apples_and_oranges.json.
 *
 * Usage:
 *   deno run --allow-net --allow-read --allow-env scripts/seed-surrealdb.ts
 *
 * Environment variables (all optional, defaults shown):
 *   SURREALDB_URL=http://localhost:8000
 *   SURREALDB_USER=root
 *   SURREALDB_PASS=root
 *   SURREALDB_NS=clera
 *   SURREALDB_DB=matchmaking
 */

const SURREAL_URL = Deno.env.get("SURREALDB_URL") ?? "http://localhost:8000";
const SURREAL_USER = Deno.env.get("SURREALDB_USER") ?? "root";
const SURREAL_PASS = Deno.env.get("SURREALDB_PASS") ?? "root";
const SURREAL_NS = Deno.env.get("SURREALDB_NS") ?? "clera";
const SURREAL_DB = Deno.env.get("SURREALDB_DB") ?? "matchmaking";

interface SurrealResponse {
  result: unknown;
  status: string;
  time: string;
}

async function query(sql: string): Promise<SurrealResponse[]> {
  const response = await fetch(`${SURREAL_URL}/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "Accept": "application/json",
      "Authorization": `Basic ${btoa(`${SURREAL_USER}:${SURREAL_PASS}`)}`,
      "Surreal-NS": SURREAL_NS,
      "Surreal-DB": SURREAL_DB,
    },
    body: sql,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SurrealDB request failed (${response.status}): ${text}`);
  }

  return await response.json();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Connecting to SurrealDB at ${SURREAL_URL}...`);

  // 1. Set up schema
  console.log("Setting up schema...");
  const schemaResults = await query(`
    DEFINE TABLE IF NOT EXISTS fruit SCHEMAFULL;
    DEFINE FIELD IF NOT EXISTS type ON fruit TYPE string ASSERT $value IN ["apple", "orange"];
    DEFINE FIELD IF NOT EXISTS attributes ON fruit FLEXIBLE TYPE object;
    DEFINE FIELD IF NOT EXISTS preferences ON fruit FLEXIBLE TYPE object;
    DEFINE FIELD IF NOT EXISTS createdAt ON fruit TYPE datetime DEFAULT time::now();
    DEFINE INDEX IF NOT EXISTS idx_fruit_type ON fruit FIELDS type;
  `);

  for (const r of schemaResults) {
    if (r.status === "ERR") {
      console.error("Schema error:", r.result);
      Deno.exit(1);
    }
  }
  console.log("Schema ready.");

  // 2. Clear existing fruit data (idempotent re-seed)
  console.log("Clearing existing fruit data...");
  await query("DELETE fruit;");

  // 3. Read seed data
  const scriptDir = new URL(".", import.meta.url).pathname;
  const dataPath = `${scriptDir}../data/raw_apples_and_oranges.json`;
  const raw = await Deno.readTextFile(dataPath);
  const fruits: Array<{ type: string; attributes: Record<string, unknown>; preferences: Record<string, unknown> }> = JSON.parse(raw);

  console.log(`Found ${fruits.length} fruits to seed.`);

  // 4. Insert all fruits in a single batch query
  const statements = fruits.map(
    (f) => `CREATE fruit CONTENT ${JSON.stringify(f)};`,
  );
  const batchResults = await query(statements.join("\n"));

  let inserted = 0;
  let errors = 0;
  for (const r of batchResults) {
    if (r.status === "ERR") {
      console.error("Insert error:", r.result);
      errors++;
    } else {
      inserted++;
    }
  }

  console.log(`Seeded ${inserted} fruits (${errors} errors).`);

  // 5. Verify
  const countResults = await query(
    "SELECT count() AS count, type FROM fruit GROUP BY type;",
  );
  const last = countResults[countResults.length - 1];
  if (last.status === "OK" && Array.isArray(last.result)) {
    console.log("Verification:");
    for (const row of last.result as Array<{ type: string; count: number }>) {
      console.log(`  ${row.type}s: ${row.count}`);
    }
  }

  console.log("Done!");
}

main();
