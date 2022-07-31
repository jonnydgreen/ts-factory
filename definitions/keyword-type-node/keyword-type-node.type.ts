import { ts } from '../../deps.ts';
import { CreateInput } from '../definitions.utils.ts';

/**
 * Reference:
 * @type {typeof ts.factory.createKeywordTypeNode}
 */
/**
 * Creates a TypeScript Keyword Type Node.
 *
 * @example
 * void
 */
export type KeywordTypeNodeInput = CreateInput<
  ts.KeywordTypeNode,
  'kind'
>;
