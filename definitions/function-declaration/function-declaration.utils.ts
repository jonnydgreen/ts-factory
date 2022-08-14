import { ts, tsm } from '../../deps.ts';
import { Instruction } from '../../instructions/instructions.type.ts';
import { processNodeFieldDefinition } from '../../instructions/instructions.utils.ts';
import { assertTSMNodeKind, assertTSNodeType } from '../../utils/utils.assert.ts';
import { printNode } from '../../utils/utils.node.ts';
import { FunctionDeclarationInput } from './function-declaration.type.ts';

export function processFunctionDeclaration(
  parentNode: tsm.Node,
  instruction: Instruction,
  nodeToModify?: ts.Node,
): void {
  assertTSMNodeKind(parentNode, ts.SyntaxKind.FunctionDeclaration);
  processNodeFieldDefinition<FunctionDeclarationInput>(parentNode, instruction, {
    modifiers: {
      ADD: () => {
        assertTSNodeType(nodeToModify, ts.isModifier);
        const kind = nodeToModify.kind;
        switch (kind) {
          case ts.SyntaxKind.ExportKeyword: {
            parentNode.setIsExported(true);
            break;
          }
          case ts.SyntaxKind.AsyncKeyword: {
            parentNode.setIsAsync(true);
            break;
          }
          case ts.SyntaxKind.DefaultKeyword: {
            parentNode.setIsDefaultExport(true);
            break;
          }
          default: {
            throw new TypeError(`Unsupported Modifier kind ${ts.SyntaxKind[kind]}`);
          }
        }
      },
    },
    // TODO
    body: {},
    parameters: {},
    type: {
      SET: () => {
        assertTSNodeType(nodeToModify, ts.isTypeNode);
        parentNode.setReturnType(printNode(nodeToModify));
      },
      UNSET: () => {
        parentNode.removeReturnType();
      },
    },
    // Cannot be mutated
    name: {},
  });
}
