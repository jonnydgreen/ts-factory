import { ts } from '../../deps.ts';
import { CreateInput } from '../definitions.type.ts';

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
