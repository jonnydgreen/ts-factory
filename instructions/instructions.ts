import {
  Instruction,
  InstructionType,
  NodeID,
  OpaqueString,
} from './instructions.type.ts';
import { Definition } from '../definitions/definitions.ts';
import { jsonata, ts, tsm } from '../deps.ts';
import { Maybe } from '../types.ts';
import { StringUtils } from '../utils/utils.string.ts';
import { FunctionDeclarationInput } from '../definitions/function-declaration/function-declaration.type.ts';

export function astNodeToJSON<T>(node: tsm.Node): T {
  const cache: unknown[] = [];
  return JSON.parse(JSON.stringify(node.compilerNode, (key, value) => {
    // Discard the following.
    if (key === 'flags' || key === 'transformFlags' || key === 'modifierFlagsCache') {
      return;
    }

    if (typeof value === 'object' && value !== null) {
      // Duplicate reference found, discard key
      if (cache.includes(value)) return;

      cache.push(value);
    }
    return value;
  }));
}

export function getInstructionType(
  definition: Definition | Definition[],
): InstructionType {
  if (Array.isArray(definition)) {
    return InstructionType.ADD;
  }
  return InstructionType.SET;
}

export function assertDefinitionKind(
  definition: Definition,
  kind: tsm.ts.SyntaxKind,
): asserts definition is Extract<Definition, { kind: typeof kind }> {
  if (definition.kind !== kind) {
    throw new TypeError(
      `Definition of kind '${
        tsm.ts.SyntaxKind[definition.kind]
      }' does not match expected Node kind '${tsm.SyntaxKind[kind]}'`,
    );
  }
}

export function getDefinitionEntries(
  definition: Definition,
): [string, ItemOrArray<Definition>][] {
  const bannedKeys = ['kind', '__instructions'];
  return Object.entries(definition).filter(([key]) => !bannedKeys.includes(key));
}

export type ItemOrArray<TItem> = TItem | TItem[];

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
  }
}

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

export function compileDefaultNodeArrayInstructions(
  nodeID: NodeID,
  definitions: Definition[],
  field: string,
  instructionType?: InstructionType,
): Instruction[] {
  return definitions.map(({ __instructions, ...definitionItem }) => ({
    type: instructionType ?? InstructionType.ADD,
    definition: definitionItem,
    field,
    nodeID,
  }));
}

export function compileDefaultNodeInstructions(
  nodeID: NodeID,
  definition: Definition,
  field: string,
  instructionType?: InstructionType,
): Instruction[] {
  return [{
    type: instructionType ?? InstructionType.SET,
    definition,
    field,
    nodeID,
  }];
}

export function compileInstructions(
  nodeID: NodeID,
  definitionOrDefinitions: ItemOrArray<Definition>,
  field: string,
  instructionType?: InstructionType,
): Instruction[] {
  // If an array, we compile an ADD instruction for each definition.
  if (Array.isArray(definitionOrDefinitions)) {
    return compileDefaultNodeArrayInstructions(
      nodeID,
      definitionOrDefinitions,
      field,
      instructionType,
    );
  }
  // Otherwise, we use a set instruction using the defined values
  const { __instructions, ...definition } = definitionOrDefinitions;
  return compileDefaultNodeInstructions(nodeID, definition, field, instructionType);
}

export function isDefined<T>(nodeOrNodes: Maybe<ItemOrArray<T>>): boolean {
  if (!nodeOrNodes) {
    return false;
  }

  if (Array.isArray(nodeOrNodes) && nodeOrNodes.length === 0) {
    return false;
  }

  return true;
}

export function createOpaqueString<T extends OpaqueString<string>>(input: string): T {
  return input as T;
}

export function createNodeID(id = '', ...nextIDs: string[]): NodeID {
  let newId = id;
  for (const nextID of nextIDs) {
    if (Number.isInteger(Number(nextID))) {
      newId += `[${nextID}]`;
    } else {
      newId += `.${nextID}`;
    }
  }
  return createOpaqueString<NodeID>(newId.replace(/^\.+/, ''));
}

export function generateInstructions(
  node: tsm.Node,
  definition: Definition,
  nodeID: NodeID = createNodeID(),
): Instruction[] {
  assertDefinitionKind(definition, node.getKind());

  const instructions: Instruction[] = [];
  for (
    const [fieldName, fieldDefinitionOrDefinitions] of getDefinitionEntries(definition)
  ) {
    // Get the running node field
    const nodeValueOrValues = getFieldNodeByDefinitionKey(node, fieldName);

    // If no node or nodes found, we can immediately build an instruction
    if (!isDefined(nodeValueOrValues)) {
      instructions.push(
        ...compileInstructions(nodeID, fieldDefinitionOrDefinitions, fieldName),
      );
      continue;
    }

    // Otherwise, we have found a node

    // If the fieldDefinition is an array, we loop through these and process in turn
    if (Array.isArray(fieldDefinitionOrDefinitions)) {
      for (const fieldDefinition of fieldDefinitionOrDefinitions) {
        // If no instructions, we compile using the default instruction rules
        if (!fieldDefinition.__instructions) {
          instructions.push(
            ...compileDefaultNodeArrayInstructions(nodeID, [fieldDefinition], fieldName),
          );
          // TODO: we need to decide what to do after ^
        } else if (fieldDefinition.__instructions.id) {
          const compiledQuery = jsonata(fieldDefinition.__instructions.id);
          const nodes = (nodeValueOrValues as tsm.Node[]);
          const foundNodeIndex = nodes.findIndex((node) =>
            !!compiledQuery.evaluate(node.compilerNode)
          );
          if (foundNodeIndex === -1) {
            instructions.push(
              ...compileInstructions(nodeID, [fieldDefinition], fieldName),
            );
          } else {
            const nodeId = createNodeID(nodeID, fieldName, foundNodeIndex.toString());
            instructions.push(
              ...generateInstructions(nodes[foundNodeIndex], fieldDefinition, nodeId),
            );
          }
        }
      }
    } else {
      // If no instructions, we compile using the default instruction rules
      // const fieldDefinition = fieldDefinitionOrDefinitions;

      // if (fieldDefinition.__instructions.id) {
      //   const data = (nodeValueOrValues as tsm.Node[]).map((node) =>
      //     node.compilerNode
      //   );
      //   const result = jsonata(fieldDefinition.__instructions.id).evaluate(data);
      //   if (!result) {
      //     instructions.push(
      //       ...compileInstructions(nodeID, [fieldDefinition], fieldName),
      //     );
      //   }
      // }
    }
  }
  return instructions;
}

// export function findNode(
//   node: tsm.Node,
//   fieldName: string,
//   fieldDefinition: Definition,
// ): Maybe<tsm.Node | tsm.Node[]> {
//   if (!fieldDefinition.__instructions) {
//     const getFieldFn =
//       node[`get${StringUtils.upperFirst(fieldName)}` as keyof typeof node];
//     if (typeof getFieldFn === 'function') {
//       return (getFieldFn as () => Maybe<tsm.Node | tsm.Node[]>)();
//     }
//     return undefined;
//   }

//   return undefined;
// }
