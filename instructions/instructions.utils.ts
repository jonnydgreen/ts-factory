import { ts, tsm } from '../deps.ts';
import { Maybe } from '../types.ts';
import { ItemOrArray } from './instructions.type.ts';
import { StringUtils } from '../utils/utils.string.ts';
import { FunctionDeclarationInput } from '../definitions/function-declaration/function-declaration.type.ts';
import { Definition } from '../definitions/definitions.ts';

export function getFunctionDeclarationNodeByDefinitionKey(
  node: tsm.FunctionDeclaration,
  fieldName: string,
): Maybe<ItemOrArray<tsm.Node>> {
  switch (fieldName as keyof FunctionDeclarationInput) {
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
  }
}

// TODO: consider a new name for this
export function getFieldNodeByDefinitionKey(
  node: tsm.Node,
  fieldName: string,
): Maybe<ItemOrArray<tsm.Node>> {
  switch (node.getKind()) {
    case ts.SyntaxKind.FunctionDeclaration: {
      return getFunctionDeclarationNodeByDefinitionKey(
        node as tsm.FunctionDeclaration,
        fieldName,
      );
    }
  }
  // TODO: we should probably be less clever here
  // and provide a mapping for each Syntax Kind
  const getFunctionName = `get${StringUtils.upperFirst(fieldName)}` as keyof tsm.Node;
  const getFunction = node[getFunctionName] as () => Maybe<ItemOrArray<tsm.Node>>;
  if (typeof getFunction !== 'function') {
    throw new TypeError(
      `Unable to get field of name '${fieldName}' from node of kind '${node.getKindName()}'`,
    );
  }
  return getFunction.call(node);
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
  const nextNodeOrNodes = getFieldNodeByDefinitionKey(currentNode, location);
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

  console.log(currentNode.getKindName(), location);

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
    // case ts.SyntaxKind.StringLiteral: {
    //   node = ts.factory.createStringLiteral(definition.text);
    //   break;
    // }
    case ts.SyntaxKind.Identifier: {
      node = ts.factory.createIdentifier(definition.text);
      break;
    }
    // Modifier
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
        undefined,
        definition.modifiers?.map<ts.Modifier>(buildNodeFromDefinition),
        undefined,
        typeof definition.name === 'string'
          ? definition.name
          : shouldBuildNodeFromDefinition<ts.Identifier>(definition.name),
        undefined,
        definition.parameters as ts.ParameterDeclaration[],
        shouldBuildNodeFromDefinition<ts.TypeNode>(definition.type),
        shouldBuildNodeFromDefinition<ts.Block>(definition.body),
      );
      break;
    }
    default: {
      throw new TypeError(
        `TS Node Kind not supported: '${definition.kind}|${
          ts.SyntaxKind[definition.kind]
        }'`,
      );
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

export function processFunctionDeclarationFieldNode(
  parentNode: tsm.FunctionDeclaration,
  field: string,
  nodeToAdd: ts.Node,
): void {
  switch (field as keyof FunctionDeclarationInput) {
    case 'modifiers': {
      const kind = (nodeToAdd as ts.Modifier).kind;
      switch (kind) {
        case ts.SyntaxKind.ExportKeyword: {
          parentNode.setIsExported(true);
          break;
        }
      }
      // TODO: assertNever
      break;
    }
      // // TODO: assertNever
      // default: {
      // }
  }
}

export function defaultAddNodeToField(
  parentNode: tsm.Node,
  field: string,
  rawNode: string,
): void {
  const addFunctionName = `add${StringUtils.upperFirst(field)}` as keyof tsm.Node;
  const addFunction = parentNode[addFunctionName] as (input: string[]) => unknown;
  if (typeof addFunction !== 'function') {
    throw new TypeError(
      `Unable to add node to field of name '${field}' for node of kind '${parentNode.getKindName()}'`,
    );
  }
  addFunction.call(parentNode, [rawNode]);
}

export function addNodeToField(
  parentNode: tsm.Node,
  field: string,
  nodeToAdd: ts.Node,
): void {
  const rawNode = tsm.printNode(nodeToAdd, { removeComments: false });

  switch (parentNode.getKind()) {
    case ts.SyntaxKind.FunctionDeclaration: {
      return processFunctionDeclarationFieldNode(
        parentNode as tsm.FunctionDeclaration,
        field,
        nodeToAdd,
      );
    }

    default: {
      defaultAddNodeToField(parentNode, field, rawNode);
    }
  }
}
