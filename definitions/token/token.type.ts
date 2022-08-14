import { ts } from '../../deps.ts';
import { Instructions } from '../../instructions/instructions.type.ts';
import { LeadingTriviaInput } from '../trivia/trivia.type.ts';

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
export interface TokenInput {
  kind: TokenInputKind;
  __instructions?: Instructions;
  leadingTrivia?: LeadingTriviaInput;
}

export type TokenInputKind =
  | ts.SyntaxKind.SuperKeyword
  | ts.SyntaxKind.ThisKeyword
  | ts.SyntaxKind.NullKeyword
  | ts.SyntaxKind.TrueKeyword
  | ts.SyntaxKind.FalseKeyword
  | ts.PunctuationSyntaxKind
  | ts.SyntaxKind.Unknown
  | ts.SyntaxKind.EndOfFileToken;
