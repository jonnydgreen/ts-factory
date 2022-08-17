import { ts } from '../../deps.ts';
import { BaseDefinition, PropertyNameInput, TypeNodeInput } from '../definitions.ts';
import { ModifierInput } from '../modifier/modifier.type.ts';
import { TokenInput } from '../token/token.type.ts';

/**
 * Reference:
 * @type {typeof ts.factory.createPropertySignature}
 */
/**
 * Creates a TypeScript Property Signature.
 *
 * @example
 * foo: string;
 */
export interface PropertySignatureInput extends BaseDefinition<ts.PropertySignature> {
  name: string | PropertyNameInput;
  modifiers?: ModifierInput[];
  questionToken?: TokenInput<ts.SyntaxKind.QuestionToken>;
  type?: TypeNodeInput;
}
