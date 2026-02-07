/**
 * SurrealDB Client for Edge Functions
 *
 * Uses SurrealDB's HTTP API to store and query fruits.
 */

import type { Fruit, FruitType } from "./generateFruit.ts";

// ============================================================================
// Configuration
// ============================================================================

const SURREAL_URL = Deno.env.get("SURREALDB_URL") ?? "http://localhost:8000";
const SURREAL_USER = Deno.env.get("SURREALDB_USER") ?? "root";
const SURREAL_PASS = Deno.env.get("SURREALDB_PASS") ?? "root";
const SURREAL_NS = Deno.env.get("SURREALDB_NS") ?? "clera";
const SURREAL_DB = Deno.env.get("SURREALDB_DB") ?? "matchmaking";

// ============================================================================
// Types
// ============================================================================

export interface StoredFruit extends Fruit {
  id: string;
  createdAt: string;
}

interface SurrealResponse<T = unknown> {
  result: T;
  status: string;
  time: string;
}

// ============================================================================
// HTTP Client
// ============================================================================

async function query<T = unknown>(sql: string): Promise<T[]> {
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
    throw new Error(`SurrealDB query failed (${response.status}): ${text}`);
  }

  const results: SurrealResponse<T[]>[] = await response.json();

  for (const r of results) {
    if (r.status === "ERR") {
      throw new Error(`SurrealDB error: ${JSON.stringify(r.result)}`);
    }
  }

  // Return result from the last statement
  const last = results[results.length - 1];
  return last?.result ?? [];
}

// ============================================================================
// Schema Setup
// ============================================================================

export async function initSchema(): Promise<void> {
  await query(`
    DEFINE TABLE IF NOT EXISTS fruit SCHEMAFULL;
    DEFINE FIELD IF NOT EXISTS type ON fruit TYPE string ASSERT $value IN ["apple", "orange"];
    DEFINE FIELD IF NOT EXISTS attributes ON fruit FLEXIBLE TYPE object;
    DEFINE FIELD IF NOT EXISTS preferences ON fruit FLEXIBLE TYPE object;
    DEFINE FIELD IF NOT EXISTS createdAt ON fruit TYPE datetime DEFAULT time::now();
    DEFINE INDEX IF NOT EXISTS idx_fruit_type ON fruit FIELDS type;
  `);
}

// ============================================================================
// CRUD Operations
// ============================================================================

function escapeString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export async function insertFruit(fruit: Fruit): Promise<StoredFruit> {
  const content = JSON.stringify({
    type: fruit.type,
    attributes: fruit.attributes,
    preferences: fruit.preferences,
  });
  const results = await query<StoredFruit>(
    `CREATE fruit CONTENT ${content} RETURN *;`,
  );
  return results[0];
}

export async function getFruitsByType(type: FruitType): Promise<StoredFruit[]> {
  return await query<StoredFruit>(
    `SELECT * FROM fruit WHERE type = '${escapeString(type)}' ORDER BY createdAt DESC;`,
  );
}

export async function getAllFruits(): Promise<StoredFruit[]> {
  return await query<StoredFruit>(`SELECT * FROM fruit ORDER BY createdAt DESC;`);
}

export async function getFruitCount(): Promise<{ apples: number; oranges: number }> {
  const apples = await query<{ count: number }>(
    `SELECT count() AS count FROM fruit WHERE type = 'apple' GROUP ALL;`,
  );
  const oranges = await query<{ count: number }>(
    `SELECT count() AS count FROM fruit WHERE type = 'orange' GROUP ALL;`,
  );
  return {
    apples: apples[0]?.count ?? 0,
    oranges: oranges[0]?.count ?? 0,
  };
}
