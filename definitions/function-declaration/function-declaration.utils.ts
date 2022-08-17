import { ts, tsm } from '../../deps.ts';
import { Instruction, ItemOrArray } from '../../instructions/instructions.type.ts';
import { processFieldDefinition } from '../../instructions/instructions.utils.ts';
import { Maybe } from '../../types.ts';
import {
  assertNever,
  assertTSMNodeKind,
  assertTSNodeType,
} from '../../utils/utils.assert.ts';
import { printNode } from '../../utils/utils.node.ts';
import { DefinitionFields } from '../definitions.ts';
import { FunctionDeclarationInput } from './function-declaration.type.ts';

export function getFunctionDeclarationField(
  node: tsm.Node,
  field: string,
): Maybe<ItemOrArray<tsm.Node>> {
  assertTSMNodeKind(node, ts.SyntaxKind.FunctionDeclaration);
  const astField = field as DefinitionFields<FunctionDeclarationInput>;
  switch (astField) {
    case 'name': {
      return node.getNameNode();
    }
    case 'type': {
      return node.getReturnTypeNode();
    }
    case 'parameters': {
      return node.getParameters();
    }
    case 'modifiers': {
      return node.getModifiers();
    }
    case 'body': {
      return node.getBody();
    }
    case 'asteriskToken': {
      return node.getAsteriskToken();
    }
    default: {
      return assertNever(
        astField,
        `Unable to get field of name '${field}' from node of kind '${node.getKindName()}'`,
      );
    }
  }
}

export function processFunctionDeclaration(
  parentNode: tsm.Node,
  instruction: Instruction,
  nodeToModify?: ts.Node,
): void {
  assertTSMNodeKind(parentNode, ts.SyntaxKind.FunctionDeclaration);
  processFieldDefinition<FunctionDeclarationInput>(parentNode, instruction, {
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
            throw new TypeError(
              `Unsupported Modifier kind ${
                ts.SyntaxKind[kind]
              } for Function Declaration`,
            );
          }
        }
      },
    },
    asteriskToken: {
      SET: () => {
        assertTSNodeType(nodeToModify, ts.isAsteriskToken);
        parentNode.setIsGenerator(true);
      },
      UNSET: () => {
        parentNode.setIsGenerator(false);
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
