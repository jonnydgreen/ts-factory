import { ts } from '../../deps.ts';
import { CreateInput } from '../definitions.utils.ts';

/**
 * Reference:
 * @type {typeof ts.factory.createModifier}
 */
/**
 * Creates a TypeScript Modifier Node.
 *
 * @example
 * async
 */
export type ModifierInput = CreateInput<
  ts.Modifier,
  'kind'
>;
