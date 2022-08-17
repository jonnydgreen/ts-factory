import { ts } from '../../deps.ts';
import { BaseDefinition } from '../definitions.ts';

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
export type KeywordTypeNodeInput = BaseDefinition<ts.KeywordTypeNode>;
