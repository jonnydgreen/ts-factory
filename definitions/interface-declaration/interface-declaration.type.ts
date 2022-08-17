import { ts } from '../../deps.ts';
import { BaseDefinition, TypeElementInput } from '../definitions.ts';
import { IdentifierInput } from '../identifier/identifier.type.ts';
import { ModifierInput } from '../modifier/modifier.type.ts';

/**
 * Reference:
 * @type {typeof ts.factory.createInterfaceDeclaration}
 */
/**
 * Creates a TypeScript Interface Declaration.
 *
 * @example
 * export interface Hello {
 *   foo: string;
 * }
 */
export interface InterfaceDeclarationInput
  extends BaseDefinition<ts.InterfaceDeclaration> {
  name: string | IdentifierInput;
  members: TypeElementInput[];
  modifiers?: ModifierInput[];
  // TODO:
  // decorators?: unknown[];
  // typeParameters?: unknown[];
  // heritageClauses?: unknown[];
}
