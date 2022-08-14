import { ts } from '../../deps.ts';
import { CreateInput, MergeIntersections } from '../definitions.type.ts';

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
export type BlockInput = MergeIntersections<
  CreateInput<
    ts.Block,
    'statements'
  > & { multiline?: boolean }
>;
