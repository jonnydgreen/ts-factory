import { BlockInput } from './block/block.type.ts';
import { FunctionDeclarationInput } from './function-declaration/function-declaration.type.ts';
import { IdentifierInput } from './identifier/identifier.type.ts';
import { KeywordTypeNodeInput } from './keyword-type-node/keyword-type-node.type.ts';
import { ModifierInput } from './modifier/modifier.type.ts';
import { SourceFileInput } from './source-file/source-file.type.ts';

// Definition
export type Definition =
  | SourceFileInput
  | StatementInput
  | ExpressionInput
  | TypeNodeInput
  | ModifierInput;

// Member Name
export type MemberNameInput = IdentifierInput;

// Statement Inputs
export type StatementInput = FunctionDeclarationInput | BlockInput;

// Expression Inputs
export type ExpressionInput = IdentifierInput;

// Type Node Inputs
export type TypeNodeInput = KeywordTypeNodeInput;

// Input
export type Input = SourceFileInput;
