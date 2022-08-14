import { ts } from '../../deps.ts';
import { CreateInput, MergeIntersections } from '../definitions.type.ts';

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
export type PropertySignatureInput = MergeIntersections<
  CreateInput<
    ts.PropertySignature,
    'name',
    'modifiers' | 'questionToken' | 'type'
  >
>;
