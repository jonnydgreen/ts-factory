import { Definition } from '../definitions/definitions.ts';
import { ts, tsm } from '../deps.ts';
import { ItemOrArray } from '../instructions/instructions.type.ts';
import { GuardedType, Maybe } from '../types.ts';

export class AssertionError extends Error {
  override name = 'AssertionError';
  constructor(message: string) {
    super(message);
  }
}

export function assertNever(input: never): never {
  throw new AssertionError(`Input ${input} not supported`);
}

export function assertDefinitionKind(
  definition: Definition,
  kind: tsm.ts.SyntaxKind,
): asserts definition is Extract<Definition, { kind: typeof kind }> {
  if (definition.kind !== kind) {
    throw new AssertionError(
      `Definition of kind '${
        tsm.ts.SyntaxKind[definition.kind]
      }' does not match expected Node kind '${tsm.SyntaxKind[kind]}'`,
    );
  }
}

export function assertDefined<T>(input: Maybe<T>): asserts input is T {
  if (typeof input === 'undefined') {
    throw new AssertionError('Input is not defined');
  }
}

export function assertTSNodeType<
  TNode extends ts.Node,
  // deno-lint-ignore no-explicit-any
  TPredicate extends (node: any) => node is any,
>(
  node: Maybe<TNode>,
  predicate: TPredicate,
): asserts node is GuardedType<TPredicate> {
  if (typeof node === 'undefined') {
    throw new AssertionError(`Node is not defined`);
  }

  const kind = node.kind;
  if (!predicate(node)) {
    throw new AssertionError(`Invalid Node of kind ${ts.SyntaxKind[kind]}`);
  }
}

export function assertTSMNodeKind<TKind extends ts.SyntaxKind>(
  node: tsm.Node,
  kind: TKind,
): asserts node is tsm.KindToNodeMappings[TKind] {
  const nodeKind = node?.getKind();
  if (!node?.isKind?.(kind)) {
    throw new AssertionError(
      `Invalid Node of kind ${ts.SyntaxKind[nodeKind]}; expected ${ts.SyntaxKind[kind]}`,
    );
  }
}

export function isDefined<T>(
  nodeOrNodes: Maybe<ItemOrArray<T>>,
): nodeOrNodes is ItemOrArray<T> {
  if (!nodeOrNodes) {
    return false;
  }

  if (Array.isArray(nodeOrNodes) && nodeOrNodes.length === 0) {
    return false;
  }

  return true;
}

export function assertArray<T>(input: Maybe<T> | Maybe<T>[]): asserts input is T[] {
  if (!Array.isArray(input)) {
    throw new AssertionError(`Input is not of type array: ${typeof input}`);
  }
}

export function assertNotArray<T>(input: T | T[]): asserts input is T {
  if (Array.isArray(input)) {
    throw new AssertionError(`Input is of type array when it should not`);
  }
}
