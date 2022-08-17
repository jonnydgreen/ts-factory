import { ts, tsm } from '../deps.ts';
import { Maybe } from '../types.ts';
import { Instruction, InstructionType, ItemOrArray } from './instructions.type.ts';
import { Definition } from '../definitions/definitions.ts';
import { DefinitionFields } from '../definitions/definitions.ts';
import { getFunctionDeclarationField } from '../definitions/function-declaration/function-declaration.utils.ts';
import { getPropertySignatureField } from '../definitions/property-signature/property-signature.utils.ts';
import { getInterfaceDeclarationField } from '../definitions/interface-declaration/interface-declaration.utils.ts';
import { getSourceFileField } from '../definitions/source-file/source-file.utils.ts';
import { getBlockField } from '../definitions/block/block.utils.ts';
import { getExpressionStatementField } from '../definitions/expression-statement/expression-statement.utils.ts';
import { getCallExpressionField } from '../definitions/call-expression/call-expression.utils.ts';

export function getNodeField(
  node: tsm.Node,
  field: string,
): Maybe<ItemOrArray<tsm.Node>> {
  switch (node.getKind()) {
    case ts.SyntaxKind.FunctionDeclaration: {
      return getFunctionDeclarationField(node, field);
    }
    case ts.SyntaxKind.InterfaceDeclaration: {
      return getInterfaceDeclarationField(node, field);
    }
    case ts.SyntaxKind.PropertySignature: {
      return getPropertySignatureField(node, field);
    }
    case ts.SyntaxKind.SourceFile: {
      return getSourceFileField(node, field);
    }
    case ts.SyntaxKind.Block: {
      return getBlockField(node, field);
    }
    case ts.SyntaxKind.ExpressionStatement: {
      return getExpressionStatementField(node, field);
    }
    case ts.SyntaxKind.CallExpression: {
      return getCallExpressionField(node, field);
    }

    default: {
      // TODO: assertNever
      throw new TypeError(
        `Unable to get field of name '${field}' from node of kind '${node.getKindName()}'`,
      );
    }
  }
}

export function getNodeByPath(currentNode: tsm.Node, path = ''): tsm.Node {
  if (path === '') {
    return currentNode;
  }
  const [location, ...remainingPath] = path
    .replaceAll('[', '.')
    .replaceAll(']', '.')
    .replace(/\.+/g, '.')
    .split('.');
  const nextNodeOrNodes = getNodeField(currentNode, location);
  if (Array.isArray(nextNodeOrNodes)) {
    const index = Number(remainingPath?.[0]);
    if (!Number.isInteger(index)) {
      throw new TypeError(
        `Next node is an array of nodes but the following ID is not an array index '${remainingPath
          ?.[0]}'`,
      );
    }
    const nextNode = nextNodeOrNodes[index];
    if (typeof nextNode === 'undefined') {
      throw new TypeError(`Node not found at index '${index}'`);
    }
    const [, ...nextIdParts] = remainingPath;
    return getNodeByPath(nextNode, nextIdParts.join('.'));
  }

  if (typeof nextNodeOrNodes === 'undefined') {
    throw new TypeError(
      `Node not found at location '${location}' for Path '${path}'`,
    );
  }

  if (remainingPath.length === 0) {
    return nextNodeOrNodes as tsm.Node;
  } else {
    return getNodeByPath(nextNodeOrNodes as tsm.Node, remainingPath.join('.'));
  }
}

export function shouldBuildNodeFromDefinition<TNode extends ts.Node>(
  definition?: Definition,
): Maybe<TNode> {
  if (typeof definition === 'undefined') {
    return;
  }
  return buildNodeFromDefinition<TNode>(definition);
}

// TODO: any
export function buildNodeFromDefinition<TReturn extends ts.Node>(
  definition: Definition,
): TReturn {
  let node: ts.Node;

  switch (definition.kind) {
    // TODO: uncomment
    // case ts.SyntaxKind.ReturnStatement: {
    //   const expression = shouldBuildNode(definition.expression);
    //   node = ts.factory.createReturnStatement(expression);
    //   break;
    // }
    // case ts.SyntaxKind.CallExpression: {
    //   const expression = buildNode(definition.expression);
    //   node = ts.factory.createCallExpression(
    //     expression,
    //     definition.typeArguments?.map(buildNode),
    //     definition.arguments?.map(buildNode),
    //   );
    //   break;
    // }
    // case ts.SyntaxKind.PropertyAccessExpression: {
    //   const expression = buildNode(definition.expression);
    //   const name = buildNode(definition.name);
    //   node = ts.factory.createPropertyAccessExpression(expression, name);
    //   break;
    // }
    case ts.SyntaxKind.InterfaceDeclaration: {
      node = ts.factory.createInterfaceDeclaration(
        undefined, // TODO
        definition.modifiers?.map<ts.Modifier>(buildNodeFromDefinition),
        typeof definition.name === 'string'
          ? definition.name
          : buildNodeFromDefinition<ts.Identifier>(definition.name),
        undefined, // TODO
        undefined, // TODO
        definition.members.map<ts.TypeElement>(buildNodeFromDefinition),
      );
      break;
    }
    case ts.SyntaxKind.PropertySignature: {
      node = ts.factory.createPropertySignature(
        definition.modifiers?.map<ts.Modifier>(buildNodeFromDefinition),
        typeof definition.name === 'string'
          ? definition.name
          : buildNodeFromDefinition<ts.Identifier>(definition.name),
        shouldBuildNodeFromDefinition<ts.QuestionToken>(definition.questionToken),
        shouldBuildNodeFromDefinition(definition.type),
      );
      break;
    }
    case ts.SyntaxKind.Identifier: {
      node = ts.factory.createIdentifier(definition.text);
      break;
    }
    // Modifier
    case ts.SyntaxKind.ReadonlyKeyword:
    case ts.SyntaxKind.AsyncKeyword:
    case ts.SyntaxKind.ExportKeyword: {
      node = ts.factory.createModifier(definition.kind);
      break;
    }
    case ts.SyntaxKind.Block: {
      node = ts.factory.createBlock(
        definition.statements.map<ts.Statement>(buildNodeFromDefinition),
        definition.multiline,
      );
      break;
    }
    case ts.SyntaxKind.FunctionDeclaration: {
      node = ts.factory.createFunctionDeclaration(
        // TODO
        undefined,
        definition.modifiers?.map<ts.Modifier>(buildNodeFromDefinition),
        // TODO
        undefined,
        typeof definition.name === 'string'
          ? definition.name
          : shouldBuildNodeFromDefinition<ts.Identifier>(definition.name),
        // TODO
        undefined,
        // TODO
        [],
        shouldBuildNodeFromDefinition<ts.TypeNode>(definition.type),
        shouldBuildNodeFromDefinition<ts.Block>(definition.body),
      );
      break;
    }
    default: {
      if (
        definition.kind >= ts.SyntaxKind.FirstToken &&
        definition.kind <= ts.SyntaxKind.LastToken
      ) {
        node = ts.factory.createToken(definition.kind as number);
      } else {
        // TODO: assert never
        throw new TypeError(
          `TS Node Kind not supported: '${definition.kind}|${
            ts.SyntaxKind[definition.kind]
          }'`,
        );
      }
    }
  }

  // TODO: uncomment
  // if (definition.leadingTrivia) {
  //   ts.addSyntheticLeadingComment(
  //     node,
  //     definition.leadingTrivia.kind,
  //     definition.leadingTrivia.text,
  //     definition.leadingTrivia.hasTrailingNewLine,
  //   );
  // }

  return node as TReturn;
}

export type ProcessNodeFieldInput<T extends Definition> = Record<
  DefinitionFields<T>,
  Partial<
    Record<
      InstructionType,
      () => void
    >
  >
>;

export function processFieldDefinition<T extends Definition>(
  parentNode: tsm.Node,
  instruction: Instruction,
  input: ProcessNodeFieldInput<T>,
) {
  const field = instruction.field as DefinitionFields<T>;
  const modificationFunction: Maybe<() => void> = input?.[field]?.[instruction.type];
  if (typeof modificationFunction !== 'function') {
    throw new TypeError(
      `${
        InstructionType[instruction.type]
      } Instruction not supported for ${parentNode.getKindName()}.${instruction.field}`,
    );
  }
  modificationFunction();
}
