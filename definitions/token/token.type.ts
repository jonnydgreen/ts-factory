import { ts } from '../../deps.ts';
import { BaseDefinition } from '../definitions.ts';

/**
 * Reference:
 * @type {typeof ts.factory.createToken}
 */
/**
 * Creates a TypeScript Token Node.
 *
 * @example
 * ? // Question Token
 */
export type TokenInput<TKind extends TokenInputKind = TokenInputKind> = BaseDefinition<
  ts.Token<TKind>
>;

export type TokenInputKind =
  | ts.SyntaxKind.SuperKeyword
  | ts.SyntaxKind.ThisKeyword
  | ts.SyntaxKind.NullKeyword
  | ts.SyntaxKind.TrueKeyword
  | ts.SyntaxKind.FalseKeyword
  | ts.PunctuationSyntaxKind
  | ts.SyntaxKind.Unknown
  | ts.SyntaxKind.EndOfFileToken;
