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
import { InterfaceDeclarationInput } from './interface-declaration.type.ts';

export function getInterfaceDeclarationField(
  node: tsm.Node,
  field: string,
): Maybe<ItemOrArray<tsm.Node>> {
  assertTSMNodeKind(node, ts.SyntaxKind.InterfaceDeclaration);
  const astField = field as DefinitionFields<InterfaceDeclarationInput>;
  switch (astField) {
    case 'name': {
      return node.getNameNode();
    }
    case 'members': {
      return node.getMembers();
    }
    case 'modifiers': {
      return node.getModifiers();
    }
    // TODO
    // case 'heritageClauses': {
    //   return node.getHeritageClauses();
    // }
    // case 'typeParameters': {
    //   return node.getTypeParameters();
    // }
    // case 'decorators': {
    //   return node.getChildrenOfKind(ts.SyntaxKind.Decorator);
    // }
    default: {
      return assertNever(
        astField,
        `Unable to get field of name '${field}' from node of kind '${node.getKindName()}'`,
      );
    }
  }
}

export function processInterfaceDeclaration(
  parentNode: tsm.Node,
  instruction: Instruction,
  nodeToModify?: ts.Node,
): void {
  assertTSMNodeKind(parentNode, ts.SyntaxKind.InterfaceDeclaration);
  processFieldDefinition<InterfaceDeclarationInput>(parentNode, instruction, {
    members: {
      ADD: () => {
        assertTSNodeType(nodeToModify, ts.isTypeElement);
        parentNode.addMember(printNode(nodeToModify));
      },
    },
    modifiers: {
      ADD: () => {
        assertTSNodeType(nodeToModify, ts.isModifier);
        const kind = nodeToModify.kind;
        switch (kind) {
          case ts.SyntaxKind.ExportKeyword: {
            parentNode.setIsExported(true);
            break;
          }
          case ts.SyntaxKind.DeclareKeyword: {
            parentNode.setHasDeclareKeyword(true);
            break;
          }
          // TODO: handle default keyword - seems like an issue in the downstream dep
          // case ts.SyntaxKind.DefaultKeyword: {
          //   parentNode.setIsDefaultExport(true);
          //   break;
          // }
          default: {
            throw new TypeError(
              `Unsupported Modifier kind ${
                ts.SyntaxKind[kind]
              } for Interface Declaration`,
            );
          }
        }
      },
    },
    // Cannot be mutated
    name: {},
    // TODO
    // decorators: {},
    // heritageClauses: {},
    // typeParameters: {},
  });
}
