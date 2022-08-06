import { ts } from '../../deps.ts';
import { CreateInput } from '../definitions.type.ts';

/**
 * Reference:
 * @type {typeof ts.factory.createFunctionDeclaration}
 */
/**
 * Creates a TypeScript Function Declaration.
 *
 * @example
 * export function hello(): void {}
 */
export type FunctionDeclarationInput = CreateInput<
  ts.FunctionDeclaration,
  'parameters',
  'name' | 'type' | 'modifiers'
>;
// TODO: populate the rest
// {
//   parameters: readonly ParameterDeclarationInput[];
//   decorators?: readonly DecoratorInput[];
//   modifiers?: readonly ModifierInput[];
//   asteriskToken?: AsteriskTokenInput;
//   name?: string | IdentifierInput;
//   typeParameters?: readonly TypeParameterDeclarationInput[];
//   type?: TypeNodeInput;
//   body?: BlockInput;
// }
