import { ts } from '../../deps.ts';
import { BaseDefinition } from '../definitions.ts';

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
export type ModifierInput = BaseDefinition<ts.Modifier>;
