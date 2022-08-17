import { ts, tsm } from '../../deps.ts';
import { ItemOrArray } from '../../instructions/instructions.type.ts';
import { Maybe } from '../../types.ts';
import { assertNever, assertTSMNodeKind } from '../../utils/utils.assert.ts';
import { DefinitionFields } from '../definitions.ts';
import { CallExpressionInput } from './call-expression.type.ts';

export function getCallExpressionField(
  node: tsm.Node,
  field: string,
): Maybe<ItemOrArray<tsm.Node>> {
  assertTSMNodeKind(node, ts.SyntaxKind.CallExpression);
  const astField = field as DefinitionFields<
    Omit<CallExpressionInput, 'multiline'>
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
