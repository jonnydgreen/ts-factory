import { ts } from '../../deps.ts';
import { BaseDefinition } from '../definitions.ts';

/**
 * Reference:
 * @type {typeof ts.factory.createIdentifier}
 */
/**
 * Creates a TypeScript Identifier.
 *
 * @example
 * hello
 */
export interface IdentifierInput extends BaseDefinition<ts.Identifier> {
  text: string;
}
