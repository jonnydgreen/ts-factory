import { FunctionDeclarationInput } from './function-declaration/function-declaration.type.ts';
import { IdentifierInput } from './identifier/identifier.type.ts';
import { SourceFileInput } from './source-file/source-file.type.ts';

// Definition
export type Definition = SourceFileInput | StatementInput | ExpressionInput;

// Member Name
export type MemberNameInput = IdentifierInput;

// Statement Inputs
export type StatementInput = FunctionDeclarationInput;

// Expression Inputs
export type ExpressionInput = IdentifierInput;

// Input
export type Input = SourceFileInput;
