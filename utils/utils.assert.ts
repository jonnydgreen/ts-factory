import { Definition } from '../definitions/definitions.ts';
import { tsm } from '../deps.ts';

export function assertNever(input: never): never {
  throw new TypeError(`Input ${input} not supported`);
}

export function assertDefinitionKind(
  definition: Definition,
  kind: tsm.ts.SyntaxKind,
): asserts definition is Extract<Definition, { kind: typeof kind }> {
  if (definition.kind !== kind) {
    throw new TypeError(
      `Definition of kind '${
        tsm.ts.SyntaxKind[definition.kind]
      }' does not match expected Node kind '${tsm.SyntaxKind[kind]}'`,
    );
  }
}
