// Path
import { join, resolve } from 'https://deno.land/std@0.150.0/path/mod.ts';
export const Path = {
  join,
  resolve,
};

// TS
export { ts } from 'https://deno.land/x/ts_morph@15.1.0/mod.ts';
export * as tsm from 'https://deno.land/x/ts_morph@15.1.0/mod.ts';

// JSON Rules Engine
// @deno-types="https://cdn.skypack.dev/-/json-rules-engine@v6.1.2-qUYyH98jDjP6t3whI00q/dist=es2019,mode=raw/types/index.d.ts"
export * as JRE from 'https://cdn.skypack.dev/pin/json-rules-engine@v6.1.2-qUYyH98jDjP6t3whI00q/mode=imports/optimized/json-rules-engine.js';

export { default as jsonata } from 'https://esm.sh/v89/jsonata@1.8.6?target=deno';
