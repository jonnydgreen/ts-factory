export type Maybe<T> = T | undefined;

// Genuine any definition
// deno-lint-ignore no-explicit-any
export type GuardedType<T> = T extends (x: any) => x is infer U ? U : never;
