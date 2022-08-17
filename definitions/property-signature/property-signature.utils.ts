import { ts, tsm } from '../../deps.ts';
import { Instruction, ItemOrArray } from '../../instructions/instructions.type.ts';
import { processFieldDefinition } from '../../instructions/instructions.utils.ts';
import { Maybe } from '../../types.ts';
import {
  assertNever,
  assertTSMNodeKind,
  assertTSNodeKind,
  assertTSNodeType,
} from '../../utils/utils.assert.ts';
import { printNode } from '../../utils/utils.node.ts';
import { DefinitionFields } from '../definitions.ts';
import { PropertySignatureInput } from './property-signature.type.ts';

export function processPropertySignature(
  parentNode: tsm.Node,
  instruction: Instruction,
  nodeToModify?: ts.Node,
): void {
  assertTSMNodeKind(parentNode, ts.SyntaxKind.PropertySignature);
  processFieldDefinition<PropertySignatureInput>(parentNode, instruction, {
    type: {
      SET: () => {
        assertTSNodeType(nodeToModify, ts.isTypeNode);
        parentNode.setType(printNode(nodeToModify));
      },
      UNSET: () => {
        parentNode.removeType();
      },
    },
    modifiers: {
      ADD: () => {
        assertTSNodeType(nodeToModify, ts.isModifier);
        const kind = nodeToModify.kind;
        switch (kind) {
          case ts.SyntaxKind.ReadonlyKeyword: {
            parentNode.setIsReadonly(true);
            break;
          }
          default: {
            throw new TypeError(
              `Unsupported Modifier kind ${ts.SyntaxKind[kind]} for Property Signature`,
            );
          }
        }
      },
    },
    questionToken: {
      SET: () => {
        assertTSNodeKind(nodeToModify, ts.SyntaxKind.QuestionToken);
        parentNode.setHasQuestionToken(true);
      },
      UNSET: () => {
        parentNode.setHasQuestionToken(false);
      },
    },
    // Cannot be mutated
    name: {},
  });
}

export function getPropertySignatureField(
  node: tsm.Node,
  field: string,
): Maybe<ItemOrArray<tsm.Node>> {
  assertTSMNodeKind(node, ts.SyntaxKind.PropertySignature);
  const astField = field as DefinitionFields<PropertySignatureInput>;
  switch (astField) {
    case 'name': {
      return node.getNameNode();
    }
    case 'type': {
      return node.getTypeNode();
    }
    case 'modifiers': {
      return node.getModifiers();
    }
    case 'questionToken': {
      return node.getQuestionTokenNode();
    }
    default: {
      return assertNever(
        astField,
        `Unable to get field of name '${field}' from node of kind '${node.getKindName()}'`,
      );
    }
  }
}
