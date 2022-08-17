import { ts } from '../deps.ts';
import { Instructions } from '../instructions/instructions.type.ts';
import { BlockInput } from './block/block.type.ts';
import { ExpressionStatementInput } from './expression-statement/expression-statement.type.ts';
import { FunctionDeclarationInput } from './function-declaration/function-declaration.type.ts';
import { IdentifierInput } from './identifier/identifier.type.ts';
import { InterfaceDeclarationInput } from './interface-declaration/interface-declaration.type.ts';
import { KeywordTypeNodeInput } from './keyword-type-node/keyword-type-node.type.ts';
import { ModifierInput } from './modifier/modifier.type.ts';
import { PropertySignatureInput } from './property-signature/property-signature.type.ts';
import { SourceFileInput } from './source-file/source-file.type.ts';
import { TokenInput } from './token/token.type.ts';
import { LeadingTriviaInput } from './trivia/trivia.type.ts';

export type DefinitionFields<T> = keyof Omit<T, keyof BaseDefinition<ts.Node>>;

export interface BaseDefinition<TNode extends ts.Node> {
  kind: TNode['kind'];
  __instructions?: Instructions;
  leadingTrivia?: LeadingTriviaInput;
}

// Definition
export type Definition =
  | SourceFileInput
  | StatementInput
  | ExpressionInput
  | TypeNodeInput
  | TypeElementInput
  | TokenInput
  | ModifierInput;

// Member Name
export type MemberNameInput = IdentifierInput;

// Property Name
export type PropertyNameInput = IdentifierInput;

// Type Element
export type TypeElementInput = PropertySignatureInput;

// Statement Inputs
export type StatementInput =
  | FunctionDeclarationInput
  | InterfaceDeclarationInput
  | BlockInput
  | ExpressionStatementInput;

// Expression Inputs
export type ExpressionInput = IdentifierInput;

// Type Node Inputs
export type TypeNodeInput = KeywordTypeNodeInput;

// Input
export type Input = SourceFileInput;
