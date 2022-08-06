import { ts, TSM as tsm } from '../deps.ts';
import { convertToNodeFn, getNodeById } from './get-node-by-id.ts';
import { Definition } from './types.ts';

const { SyntaxKind, factory } = ts;

export enum InstructionType {
  SET,
  ADD,
  INSERT,
  REPLACE,
}

/**
 * Add field to an array of fields on a parent node. E.g. statements
 *
 * Flow:
 *  - Get Node by ID
 *  - Infer the kind of the Node
 *  - Find the add operator associated with the defined node and field
 *  - Compile definition and apply to add operator
 *  - Move on to the next instruction
 */
export interface AddInstruction {
  type: InstructionType.ADD;
  field: string;
  nodeId?: string;
  definition: Definition;
}

/**
 * Set a field on a parent node. E.g. async keyword
 *
 * Flow:
 *  - Get Node by ID
 *  - Infer the kind of the Node
 *  - Find the set operator associated with the defined node and field
 *  - Compile definition and apply to set operator
 *  - Move on to the next instruction
 */
export interface SetInstruction {
  type: InstructionType.SET;
  nodeId: string;
  field: string;
  definition: Definition;
}

/**
 * Insert a field at a specific index within an array of fields on a parent node. E.g. statement at position 2
 *
 * Flow:
 *  - Get Node by ID
 *  - Infer the kind of the Node
 *  - Find the insert operator associated with the defined node and field
 *  - Ensure the array is of length at least the set position
 *  - Compile definition and apply to insert operator
 *  - Move on to the next instruction
 */
export interface InsertInstruction {
  type: InstructionType.INSERT;
}

/**
 * Replace a field at a specific index within an array of fields on a parent node. E.g. new statement at position 1
 *
 * Flow:
 *  - Get Node by ID
 *  - Infer the kind of the Node
 *  - Find the replace operator associated with the defined node and field
 *  - Ensure the array is of length at least the set position
 *  - Compile definition and apply to insert operator
 *  - Move on to the next instruction
 */
export interface ReplaceInstruction {
  type: InstructionType.REPLACE;
}

export type Instruction =
  | AddInstruction
  | SetInstruction
  | InsertInstruction
  | ReplaceInstruction;

export function assertNever(input: never): never {
  throw new Error(`Should never receive input '${input}'`);
}

export function shouldBuildNode(ast: any): any {
  if (typeof ast === 'undefined') {
    return;
  }
  return buildNode(ast);
}

factory.createCallExpression;

export function buildNode(ast: any): any {
  let node: ts.Node;
  switch (ast?.kind) {
    case SyntaxKind.ReturnStatement: {
      const expression = shouldBuildNode(ast.expression);
      node = factory.createReturnStatement(expression);
      break;
    }
    case SyntaxKind.CallExpression: {
      const expression = buildNode(ast.expression);
      node = factory.createCallExpression(
        expression,
        ast.typeArguments?.map(buildNode),
        ast.arguments?.map(buildNode),
      );
      break;
    }
    case SyntaxKind.PropertyAccessExpression: {
      const expression = buildNode(ast.expression);
      const name = buildNode(ast.name);
      node = factory.createPropertyAccessExpression(expression, name);
      break;
    }
    case SyntaxKind.Identifier: {
      node = factory.createIdentifier(ast.text);
      break;
    }
    case SyntaxKind.StringLiteral: {
      node = factory.createStringLiteral(ast.text);
      break;
    }
    case SyntaxKind.AnyKeyword:
    case SyntaxKind.BigIntKeyword:
    case SyntaxKind.BooleanKeyword:
    case SyntaxKind.IntrinsicKeyword:
    case SyntaxKind.NeverKeyword:
    case SyntaxKind.NumberKeyword:
    case SyntaxKind.ObjectKeyword:
    case SyntaxKind.StringKeyword:
    case SyntaxKind.SymbolKeyword:
    case SyntaxKind.UndefinedKeyword:
    case SyntaxKind.UnknownKeyword:
    case SyntaxKind.VoidKeyword: {
      node = factory.createKeywordTypeNode(ast.kind);
      break;
    }
    default: {
      throw new Error(
        `TS Node Kind not supported: '${ts.SyntaxKind[ast.kind]}'`,
      );
    }
  }

  if (ast.leadingTrivia) {
    ts.addSyntheticLeadingComment(
      node,
      ast.leadingTrivia.kind,
      ast.leadingTrivia.text,
      ast.leadingTrivia.hasTrailingNewLine,
    );
  }

  return node;
}

export function processInstruction(
  sourceFile: tsm.SourceFile,
  instruction: Instruction,
) {
  switch (instruction.type) {
    case InstructionType.ADD: {
      const node = getNodeById(sourceFile, instruction.nodeId ?? '');
      const fieldNodesToAdd = [buildNode(instruction.definition)];
      const functionName = convertToNodeFn('add', instruction.field);
      const addNodeFieldsFunction = (
        node[functionName as keyof typeof node] as (input: unknown[]) => void
      ).bind(node);
      addNodeFieldsFunction(
        fieldNodesToAdd.map((node) => tsm.printNode(node, { removeComments: false })),
      );
      break;
    }
    case InstructionType.SET: {
      const node = getNodeById(sourceFile, instruction.nodeId);
      const fieldNodeToSet = buildNode(instruction.definition);
      const functionName = convertToNodeFn('set', instruction.field);
      console.log({ functionName, node });
      const setNodeFieldFunction = (
        node[functionName as keyof typeof node] as (input: unknown) => void
      ).bind(node);
      setNodeFieldFunction(
        tsm.printNode(fieldNodeToSet, { removeComments: false }),
      );
      break;
    }
    case InstructionType.REPLACE:
    case InstructionType.INSERT: {
      throw new Error(`Instruction type ${instruction.type} not supported.`);
    }
    default: {
      assertNever(instruction);
    }
  }
}
