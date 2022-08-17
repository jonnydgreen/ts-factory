import { ts, tsm } from '../../deps.ts';
import { ItemOrArray } from '../../instructions/instructions.type.ts';
import { Maybe } from '../../types.ts';
import { assertNever, assertTSMNodeKind } from '../../utils/utils.assert.ts';
import { DefinitionFields } from '../definitions.ts';
import { ExpressionStatementInput } from './expression-statement.type.ts';

export function getExpressionStatementField(
  node: tsm.Node,
  field: string,
): Maybe<ItemOrArray<tsm.Node>> {
  assertTSMNodeKind(node, ts.SyntaxKind.ExpressionStatement);
  const astField = field as DefinitionFields<
    Omit<ExpressionStatementInput, 'multiline'>
  >;
  switch (astField) {
    case 'expression': {
      return node.getExpression();
    }
    default: {
      return assertNever(
        astField,
        `Unable to get field of name '${field}' from node of kind '${node.getKindName()}'`,
      );
    }
  }
}
