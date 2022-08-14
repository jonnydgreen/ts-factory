import { ts, tsm } from '../../deps.ts';
import { Instruction } from '../../instructions/instructions.type.ts';
import { processNodeFieldDefinition } from '../../instructions/instructions.utils.ts';
import { assertDefined, assertTSMNodeKind } from '../../utils/utils.assert.ts';
import { shouldPrintNode } from '../../utils/utils.node.ts';
import { SourceFileInput } from './source-file.type.ts';

export function processSourceFile(
  parentNode: tsm.Node,
  instruction: Instruction,
  nodeToModify?: ts.Node,
): void {
  assertTSMNodeKind(parentNode, ts.SyntaxKind.SourceFile);
  const rawNode = shouldPrintNode(nodeToModify);
  processNodeFieldDefinition<SourceFileInput>(parentNode, instruction, {
    statements: {
      ADD: () => {
        assertDefined(rawNode);
        parentNode.addStatements([rawNode]);
      },
    },
  });
}
