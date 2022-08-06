import { ts } from '../../deps.ts';
import { CreateInput } from '../definitions.type.ts';

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
export type IdentifierInput = CreateInput<
  ts.Identifier,
  'text'
>;
