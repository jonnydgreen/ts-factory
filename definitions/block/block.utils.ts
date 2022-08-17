import { ts, tsm } from '../../deps.ts';
import { ItemOrArray } from '../../instructions/instructions.type.ts';
import { Maybe } from '../../types.ts';
import { assertNever, assertTSMNodeKind } from '../../utils/utils.assert.ts';
import { DefinitionFields } from '../definitions.ts';
import { BlockInput } from './block.type.ts';

export function getBlockField(
  node: tsm.Node,
  field: string,
): Maybe<ItemOrArray<tsm.Node>> {
  assertTSMNodeKind(node, ts.SyntaxKind.Block);
  const astField = field as DefinitionFields<Omit<BlockInput, 'multiline'>>;
  switch (astField) {
    case 'statements': {
      return node.getStatements();
    }
    default: {
      return assertNever(
        astField,
        `Unable to get field of name '${field}' from node of kind '${node.getKindName()}'`,
      );
    }
  }
}
