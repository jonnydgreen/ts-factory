import { ts } from '../../deps.ts';
import { BaseDefinition, ExpressionInput } from '../definitions.ts';

/**
 * Reference:
 * @type {typeof ts.factory.createCallExpression}
 */
/**
 * Creates a TypeScript Call Expression.
 *
 * @example
 * console.log('hello')
 */
export interface CallExpressionInput extends BaseDefinition<ts.CallExpression> {
  expression: ExpressionInput;
  // TODO
  // typeArguments?: unknown[];
  // arguments?: unknown[];
}
