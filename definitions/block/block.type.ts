import { ts } from '../../deps.ts';
import { BaseDefinition, StatementInput } from '../definitions.ts';

/**
 * Reference:
 * @type {typeof ts.factory.createBlock}
 */
/**
 * Creates a TypeScript Function Declaration.
 *
 * @example
 * export function hello(): void {}
 */
export interface BlockInput extends BaseDefinition<ts.Block> {
  statements: StatementInput[];
  multiline?: boolean;
}
