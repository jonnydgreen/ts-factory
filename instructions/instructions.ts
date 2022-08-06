import {
  Instruction,
  InstructionType,
  OpaqueString,
  Path,
  SetInstruction,
  UnsetInstruction,
} from './instructions.type.ts';
import { Definition } from '../definitions/definitions.ts';
import { jsonata, ts, tsm } from '../deps.ts';
import { Maybe } from '../types.ts';
import { StringUtils } from '../utils/utils.string.ts';
import { FunctionDeclarationInput } from '../definitions/function-declaration/function-declaration.type.ts';
import { assertDefinitionKind, assertNever } from '../utils/utils.assert.ts';

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
    case 'modifiers': {
      return node.getModifiers();
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
  path: Path,
  definitions: Maybe<Definition>[],
  field: string,
  instructionType?: InstructionType,
  index?: number,
): Instruction[] {
  return definitions.map((definitionItem) => {
    switch (instructionType) {
      case InstructionType.INSERT:
      case InstructionType.REPLACE: {
        const { __instructions, ...definition } = definitionItem as Definition;
        return {
          type: instructionType,
          definition,
          field,
          path,
          // TODO: make this better
          index: index as number,
        };
      }
      case InstructionType.REMOVE: {
        return {
          type: instructionType,
          field,
          path,
          index: index as number,
        };
      }
      default: {
        const { __instructions, ...definition } = definitionItem as Definition;
        return {
          type: instructionType ?? InstructionType.ADD,
          definition,
          field,
          path,
        };
      }
    }
  });
}

export function compileDefaultNodeInstructions(
  path: Path,
  definitionWithInstructions: Maybe<Definition>,
  field: string,
  instructionType: InstructionType.SET | InstructionType.UNSET = InstructionType.SET,
): (SetInstruction | UnsetInstruction)[] {
  switch (instructionType) {
    case InstructionType.SET: {
      // TODO: check that definition is defined
      const { __instructions, ...definition } = definitionWithInstructions as Definition;
      return [{
        type: instructionType,
        definition,
        field,
        path,
      }];
    }
    case InstructionType.UNSET: {
      return [{
        type: instructionType,
        field,
        path,
      }];
    }
    default: {
      assertNever(instructionType);
    }
  }
  // TODO: assert the correct instruction type somewhere
}

export function compileInstructions(
  path: Path,
  definitionOrDefinitions: ItemOrArray<Maybe<Definition>>,
  field: string,
  instructionType?: InstructionType,
  index?: number,
): Instruction[] {
  // If an array, we compile an ADD instruction for each definition.
  if (Array.isArray(definitionOrDefinitions)) {
    return compileDefaultNodeArrayInstructions(
      path,
      // TODO: assert that is the case
      definitionOrDefinitions,
      field,
      instructionType,
      index,
    );
  }
  // Otherwise, we use a set instruction using the defined values
  return compileDefaultNodeInstructions(
    path,
    definitionOrDefinitions,
    field,
    instructionType as InstructionType.SET | InstructionType.UNSET,
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

export function createPath(id = '', ...nextIDs: string[]): Path {
  let newId = id;
  for (const nextID of nextIDs) {
    if (Number.isInteger(Number(nextID))) {
      newId += `[${nextID}]`;
    } else {
      newId += `.${nextID}`;
    }
  }
  return createOpaqueString<Path>(newId.replace(/^\.+/, ''));
}

export function isDefinition(definition: unknown): definition is Definition {
  return typeof definition === 'object' && definition !== null &&
    Number.isInteger((definition as Definition).kind);
}

export function generateInstructions(
  node: tsm.Node,
  definition: Definition,
  path: Path = createPath(),
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
        ...compileInstructions(path, fieldDefinitionOrDefinitions, fieldName),
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
            ...compileDefaultNodeArrayInstructions(path, [fieldDefinition], fieldName),
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
              ...compileInstructions(path, [fieldDefinition], fieldName),
            );
          } else {
            const nextPath = createPath(path, fieldName, foundNodeIndex.toString());
            if (isDefinition(fieldDefinition)) {
              instructions.push(
                ...generateInstructions(
                  nodes[foundNodeIndex],
                  fieldDefinition,
                  nextPath,
                ),
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
            const foundNodeIndex = nodes.findIndex((node) =>
              !!compiledQuery.evaluate(node.compilerNode)
            );
            let index: Maybe<number>;
            if (typeof rule.index === 'string') {
              // TODO: error for rule index defined with SET/ADD etc
              const result = Number(
                jsonata(rule.index).evaluate(nodes.map((node) => node.compilerNode)),
              );
              if (!Number.isInteger(result) || result > nodes.length) {
                throw new TypeError(
                  `Invalid index for ${rule.instruction}, must be integer less than or equal to the array length (${nodes.length}); got ${result}`,
                );
              } else if (
                result === nodes.length &&
                (rule.instruction === InstructionType.REPLACE ||
                  rule.instruction === InstructionType.REMOVE)
              ) {
                throw new TypeError(
                  `Invalid index for ${rule.instruction}; must be a valid array index integer; got ${result}`,
                );
              }

              index = result;
            } else if (rule.instruction === InstructionType.REMOVE) {
              index = rule.index ?? foundNodeIndex;
            } else {
              index = rule.index;
            }

            // If a rule matches we process the results
            if (foundNodeIndex !== -1) {
              const nextPath = createPath(path, fieldName, foundNodeIndex.toString());
              if (rule.instruction === InstructionType.UNSET) {
                instructions.push(
                  ...compileInstructions(
                    nextPath,
                    undefined,
                    rule.field as string,
                    rule.instruction,
                  ),
                );
              } else if (rule.instruction === InstructionType.REMOVE) {
                instructions.push(
                  ...compileInstructions(
                    nextPath,
                    [undefined],
                    rule.field as string,
                    rule.instruction,
                    index,
                  ),
                );
              } else {
                instructions.push(
                  ...compileInstructions(
                    path,
                    [fieldDefinition],
                    rule.field || fieldName,
                    rule.instruction,
                    index,
                  ),
                );
              }
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
            ...compileInstructions(path, fieldDefinition, fieldName),
          );
        } else {
          const nextPath = createPath(path, fieldName);
          if (isDefinition(fieldDefinition)) {
            instructions.push(
              ...generateInstructions(foundNode, fieldDefinition, nextPath),
            );
          }
        }
      }
    }
  }
  return instructions;
}
