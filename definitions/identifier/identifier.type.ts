import { ts } from '../../deps.ts';
import { CreateInput } from '../definitions.utils.ts';

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
