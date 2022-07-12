// Blocks
export * as blocks from 'https://deno.land/std@0.147.0/testing/bdd.ts';

// Asserts
import { assertSnapshot } from 'https://deno.land/std@0.147.0/testing/snapshot.ts';
import * as baseAsserts from 'https://deno.land/std@0.147.0/testing/asserts.ts';
export const asserts = {
  ...baseAsserts,
  assertSnapshot,
};
