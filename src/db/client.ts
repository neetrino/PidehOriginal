import 'server-only';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { requireDatabaseUrl } from '@/config/env';
import * as schema from '@/db/schema';

const TRANSIENT_FETCH_ATTEMPTS = 2;
const RETRY_DELAY_MS = 300;

neonConfig.fetchFunction = fetchDatabase;

export type Database = NeonHttpDatabase<typeof schema>;

let cachedDb: Database | undefined;

/** Shared Drizzle client for server-side queries. */
export function getDb(): Database {
  if (!cachedDb) {
    const sql = neon(requireDatabaseUrl(), {
      fetchOptions: { cache: 'no-store' },
    });
    cachedDb = drizzle(sql, { schema });
  }

  return cachedDb;
}

/**
 * Neon HTTP calls go through Next's fetch. A cold database or a dropped
 * socket throws `TypeError: fetch failed` and would otherwise crash the page.
 */
async function fetchDatabase(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < TRANSIENT_FETCH_ATTEMPTS; attempt += 1) {
    try {
      return await fetch(input, { ...init, cache: 'no-store' });
    } catch (error) {
      lastError = error;
      if (!isTransientFetchError(error) || attempt === TRANSIENT_FETCH_ATTEMPTS - 1) {
        throw error;
      }
      await delay(RETRY_DELAY_MS);
    }
  }

  throw lastError;
}

function isTransientFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = `${error.name} ${error.message}`.toLowerCase();
  return message.includes('fetch failed') || message.includes('timeout') || message.includes('econnreset');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
