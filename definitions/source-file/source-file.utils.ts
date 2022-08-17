import { ts, tsm } from '../../deps.ts';
import { Instruction, ItemOrArray } from '../../instructions/instructions.type.ts';
import { processFieldDefinition } from '../../instructions/instructions.utils.ts';
import { Maybe } from '../../types.ts';
import {
  assertDefined,
  assertNever,
  assertTSMNodeKind,
} from '../../utils/utils.assert.ts';
import { shouldPrintNode } from '../../utils/utils.node.ts';
import { DefinitionFields } from '../definitions.ts';
import { SourceFileInput } from './source-file.type.ts';

export function processSourceFile(
  parentNode: tsm.Node,
  instruction: Instruction,
  nodeToModify?: ts.Node,
): void {
  assertTSMNodeKind(parentNode, ts.SyntaxKind.SourceFile);
  const rawNode = shouldPrintNode(nodeToModify);
  processFieldDefinition<SourceFileInput>(parentNode, instruction, {
    statements: {
      ADD: () => {
        assertDefined(rawNode);
        parentNode.addStatements([rawNode]);
      },
    },
  });
}

export function getSourceFileField(
  node: tsm.Node,
  field: string,
): Maybe<ItemOrArray<tsm.Node>> {
  assertTSMNodeKind(node, ts.SyntaxKind.SourceFile);
  const astField = field as DefinitionFields<SourceFileInput>;
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
