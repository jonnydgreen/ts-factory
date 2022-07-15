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

export interface AddInstruction {
  type: InstructionType.ADD;
  nodeId: string;
  field: string;
  definition: Definition;
}

export interface SetInstruction {
  type: InstructionType.SET;
}

export interface InsertInstruction {
  type: InstructionType.INSERT;
}

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
      const node = getNodeById(sourceFile, instruction.nodeId);
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
    case InstructionType.SET:
    case InstructionType.REPLACE:
    case InstructionType.INSERT: {
      throw new Error(`Instruction type ${instruction.type} not supported.`);
    }
    default: {
      assertNever(instruction);
    }
  }
}
