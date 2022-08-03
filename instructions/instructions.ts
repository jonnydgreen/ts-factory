import {
  Instruction,
  InstructionType,
  NodeID,
  OpaqueString,
  SetInstruction,
} from './instructions.type.ts';
import { Definition } from '../definitions/definitions.ts';
import { jsonata, ts, tsm } from '../deps.ts';
import { Maybe } from '../types.ts';
import { StringUtils } from '../utils/utils.string.ts';
import { FunctionDeclarationInput } from '../definitions/function-declaration/function-declaration.type.ts';

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
  index?: number,
): Instruction[] {
  return definitions.map(({ __instructions, ...definitionItem }) => {
    if (instructionType === InstructionType.INSERT) {
      return {
        type: instructionType,
        definition: definitionItem,
        field,
        nodeID,
        // TODO: make this better
        index: index as number,
      };
    }
    return {
      type: instructionType ?? InstructionType.ADD,
      definition: definitionItem,
      field,
      nodeID,
    };
  });
}

export function compileDefaultNodeInstructions(
  nodeID: NodeID,
  definition: Definition,
  field: string,
  instructionType?: InstructionType.SET,
): SetInstruction[] {
  // TODO: assert the correct instruction type somewhere
  // Don't want any casts if we can help it
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
  index?: number,
): Instruction[] {
  // If an array, we compile an ADD instruction for each definition.
  if (Array.isArray(definitionOrDefinitions)) {
    return compileDefaultNodeArrayInstructions(
      nodeID,
      definitionOrDefinitions,
      field,
      instructionType,
      index,
    );
  }
  // Otherwise, we use a set instruction using the defined values
  const { __instructions, ...definition } = definitionOrDefinitions;
  return compileDefaultNodeInstructions(
    nodeID,
    definition,
    field,
    instructionType as InstructionType.SET,
  );
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

export function isDefinition(definition: unknown): definition is Definition {
  return typeof definition === 'object' && definition !== null &&
    Number.isInteger((definition as Definition).kind);
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
          // TODO: assert here
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
            if (isDefinition(fieldDefinition)) {
              instructions.push(
                ...generateInstructions(nodes[foundNodeIndex], fieldDefinition, nodeId),
              );
            }
          }
          // If rules are defined, we process accordingly
          // At the moment, we do not process ID and rules at the same time
          // because the behaviour is not yet defined.
        }

        if (fieldDefinition.__instructions?.rules) {
          for (const rule of fieldDefinition.__instructions.rules) {
            const compiledQuery = jsonata(rule.condition);
            const nodes = (nodeValueOrValues as tsm.Node[]);
            const ruleMatch = nodes.some((node) =>
              !!compiledQuery.evaluate(node.compilerNode)
            );
            let index: Maybe<number>;
            if (typeof rule.index === 'string') {
              const result = Number(jsonata(rule.index).evaluate(nodes));
              if (!Number.isInteger(result) || result >= nodes.length) {
                throw new TypeError(
                  `Invalid result, must be integer within the array length: ${result}`,
                );
              }
              index = result;
            } else {
              index = rule.index;
            }
            // If a rule matches we process the results
            if (ruleMatch) {
              instructions.push(
                ...compileInstructions(
                  nodeID,
                  [fieldDefinition],
                  fieldName,
                  rule.instruction,
                  index,
                ),
              );
            }
          }
        }
      }
    } else {
      const fieldDefinition = fieldDefinitionOrDefinitions;
      if (fieldDefinition.__instructions?.id) {
        const compiledQuery = jsonata(fieldDefinition.__instructions.id);
        const foundNode = [nodeValueOrValues as tsm.Node].find((node) =>
          compiledQuery.evaluate(node.compilerNode)
        );
        if (!foundNode) {
          instructions.push(
            ...compileInstructions(nodeID, fieldDefinition, fieldName),
          );
        } else {
          const nodeId = createNodeID(nodeID, fieldName);
          if (isDefinition(fieldDefinition)) {
            instructions.push(
              ...generateInstructions(foundNode, fieldDefinition, nodeId),
            );
          }
        }
      }
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
