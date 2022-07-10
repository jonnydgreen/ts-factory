import { ts } from '../deps.ts';

// Get keys matching a certain type
export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

export interface BaseTSNode {
  // TODO: maybe make this mandatory
  id?: number;
}

export type TSNodeAST<TNode extends ts.Node = ts.Node> =
  // Fine to ignore any because we are looking for any in this case
  // deno-lint-ignore no-explicit-any
  & Partial<Omit<TNode, KeysMatching<TNode, (...args: any[]) => any>>>
  & BaseTSNode;

export type TSNode<TNode extends ts.Node = ts.Node> = TNode & BaseTSNode;
