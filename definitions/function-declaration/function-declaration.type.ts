import { ts } from '../../deps.ts';
import {
  BaseDefinition,
  MemberNameInput,
  StatementInput,
  TypeNodeInput,
} from '../definitions.ts';
import { ModifierInput } from '../modifier/modifier.type.ts';
import { TokenInput } from '../token/token.type.ts';

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
export interface FunctionDeclarationInput
  extends BaseDefinition<ts.FunctionDeclaration> {
  // TODO
  parameters: unknown[];
  name?: string | MemberNameInput;
  type?: TypeNodeInput;
  modifiers?: ModifierInput[];
  body?: StatementInput;
  // TODO: maybe have a punctuation token input type?
  asteriskToken?: TokenInput<ts.SyntaxKind.AsteriskToken>;
}
// TODO: populate the rest
// {
//   parameters: readonly ParameterDeclarationInput[];
//   decorators?: readonly DecoratorInput[];
//   typeParameters?: readonly TypeParameterDeclarationInput[];
// }
