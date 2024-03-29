import { BlockInput } from './block/block.type.ts';
import { FunctionDeclarationInput } from './function-declaration/function-declaration.type.ts';
import { IdentifierInput } from './identifier/identifier.type.ts';
import { InterfaceDeclarationInput } from './interface-declaration/interface-declaration.type.ts';
import { KeywordTypeNodeInput } from './keyword-type-node/keyword-type-node.type.ts';
import { ModifierInput } from './modifier/modifier.type.ts';
import { PropertySignatureInput } from './property-signature/property-signature.type.ts';
import { SourceFileInput } from './source-file/source-file.type.ts';
import { TokenInput } from './token/token.type.ts';

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
  | BlockInput;

// Expression Inputs
export type ExpressionInput = IdentifierInput;

// Type Node Inputs
export type TypeNodeInput = KeywordTypeNodeInput;

// Input
export type Input = SourceFileInput;
