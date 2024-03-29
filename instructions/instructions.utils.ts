import { ts, tsm } from '../deps.ts';
import { Maybe } from '../types.ts';
import { Instruction, InstructionType, ItemOrArray } from './instructions.type.ts';
import { StringUtils } from '../utils/utils.string.ts';
import { FunctionDeclarationInput } from '../definitions/function-declaration/function-declaration.type.ts';
import { Definition } from '../definitions/definitions.ts';
import { Modifier } from 'https://deno.land/x/ts_morph@15.1.0/common/typescript.d.ts';
import { DefinitionFields } from '../definitions/definitions.type.ts';

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
        definition.modifiers?.map<Modifier>(buildNodeFromDefinition),
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
        definition.modifiers?.map<Modifier>(buildNodeFromDefinition),
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

export function processNodeFieldDefinition<T extends Definition>(
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
