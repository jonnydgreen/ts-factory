import { ts } from '../../deps.ts';
import { BaseDefinition, ExpressionInput } from '../definitions.ts';

/**
 * Reference:
 * @type {typeof ts.factory.createExpressionStatement}
 */
/**
 * Creates a TypeScript Expression Statement.
 *
 * @example
 * console.log('hello')
 */
export interface ExpressionStatementInput
  extends BaseDefinition<ts.ExpressionStatement> {
  expression: ExpressionInput;
}
