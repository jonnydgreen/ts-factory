import {
  Instruction,
  InstructionRule,
  InstructionType,
  ItemOrArray,
  OpaqueString,
  Path,
  SetInstruction,
  UnsetInstruction,
} from './instructions.type.ts';
import { Definition } from '../definitions/definitions.ts';
import { jsonata, ts, tsm } from '../deps.ts';
import { Maybe } from '../types.ts';
import {
  assertArray,
  assertDefinitionKind,
  assertNever,
  assertNotArray,
  isDefined,
} from '../utils/utils.assert.ts';
import {
  getNodeByPath,
  getNodeField,
  shouldBuildNodeFromDefinition,
} from './instructions.utils.ts';
import { processFunctionDeclaration } from '../definitions/function-declaration/function-declaration.utils.ts';
import { processSourceFile } from '../definitions/source-file/source-file.utils.ts';
import { processPropertySignature } from '../definitions/property-signature/property-signature.utils.ts';
import { processInterfaceDeclaration } from '../definitions/interface-declaration/interface-declaration.utils.ts';

export function getDefinitionEntries(
  definition: Definition,
): [string, ItemOrArray<Definition>][] {
  const bannedKeys = ['kind', '__instructions'];
  return Object.entries(definition).filter(([key]) => !bannedKeys.includes(key));
}

export function compileDefaultNodeArrayInstructions(
  path: Path,
  definitions: Definition[],
  field: string,
  instructionType?: InstructionType,
  index?: number,
): Instruction[] {
  return definitions.map((definitionItem) => {
    switch (instructionType) {
      case InstructionType.INSERT:
      case InstructionType.REPLACE: {
        const { __instructions, ...definition } = definitionItem;
        return {
          type: instructionType,
          definition,
          field,
          path,
          // TODO: remove cast
          index: index as number,
        };
      }
      case InstructionType.REMOVE: {
        return {
          type: instructionType,
          field,
          path,
          // TODO: remove cast
          index: index as number,
        };
      }
      default: {
        const { __instructions, ...definition } = definitionItem;
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
      assertNever(
        instructionType,
        `Unable to compile default node instructions: unsupported instruction type ${instructionType}`,
      );
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
    assertArray(definitionOrDefinitions);
    return compileDefaultNodeArrayInstructions(
      path,
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

// TODO: move
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

export function shouldGetRuleIndex(
  rule: InstructionRule,
  nodes: tsm.Node[],
  nodeIndex: number,
): Maybe<number> {
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

    return result;
  }

  if (rule.instruction === InstructionType.REMOVE) {
    return rule.index ?? nodeIndex;
  }

  return rule.index;
}

export function shouldGenerateInstructionsFromRules(
  definition: Definition,
  nodeOrNodes: tsm.Node | tsm.Node[],
  context: Context,
): Instruction[] {
  if (
    !definition.__instructions?.rules ||
    definition.__instructions.rules.length === 0
  ) {
    return [];
  }

  const { path, field } = context;
  const instructions: Instruction[] = [];
  if (definition.__instructions?.rules) {
    for (const rule of definition.__instructions.rules) {
      let nextPath: Maybe<Path>;
      let index: Maybe<number>;
      const compiledQuery = jsonata(rule.condition);
      if (Array.isArray(nodeOrNodes)) {
        const nodes = nodeOrNodes;
        const foundNodeIndex = nodes.findIndex((node) =>
          !!compiledQuery.evaluate(node.compilerNode)
        );

        // If a rule matches we process the results
        if (field && foundNodeIndex !== -1) {
          index = shouldGetRuleIndex(rule, nodes, foundNodeIndex);
          nextPath = createPath(path, field, foundNodeIndex.toString());
        }
      } else {
        const node = nodeOrNodes;
        if (compiledQuery.evaluate(node.compilerNode) === true) {
          nextPath = path;
        }
      }

      // TODO some horrible casts here
      if (typeof nextPath === 'string') {
        if (rule.instruction === InstructionType.UNSET) {
          instructions.push(
            ...compileInstructions(
              nextPath,
              undefined,
              // TODO: remove cast
              rule.field as string,
              rule.instruction,
            ),
          );
        } else if (rule.instruction === InstructionType.REMOVE) {
          instructions.push(
            ...compileInstructions(
              nextPath,
              [undefined],
              // TODO: remove cast
              rule.field as string,
              rule.instruction,
              index,
            ),
          );
        } else {
          instructions.push(
            ...compileInstructions(
              path,
              [definition],
              // TODO: remove cast
              rule.field || field as string,
              rule.instruction,
              index,
            ),
          );
        }
      }
    }
  }

  return instructions;
}

export interface Context {
  path: Path;
  field?: string;
}

export function createContext(options?: Partial<Context>): Context {
  return {
    path: options?.path ?? createPath(),
    field: options?.field,
  };
}

export function generateInstructions(
  node: tsm.Node,
  definition: Definition,
  context = createContext(),
): Instruction[] {
  assertDefinitionKind(definition, node.getKind());

  const instructions: Instruction[] = [];
  const { path, field } = context;

  // If we have no field defined, we are at the root definition
  if (!field) {
    instructions.push(...shouldGenerateInstructionsFromRules(definition, node, context));
  }

  for (const [field, fieldDefinitions] of getDefinitionEntries(definition)) {
    // Get the running node field
    const nodes = getNodeField(node, field);

    // If no node or nodes found, we can immediately build an instruction
    if (!isDefined(nodes)) {
      instructions.push(...compileInstructions(path, fieldDefinitions, field));
      // There is nothing else to do, so we continue
      continue;
    }

    // === Otherwise, we have found a node for the field ===

    // If the fieldDefinition is an array, we loop through these and process in turn
    if (Array.isArray(fieldDefinitions)) {
      assertArray(nodes);
      for (const fieldDefinition of fieldDefinitions) {
        // If no instructions, we compile using the default instruction rules as normal
        if (!fieldDefinition.__instructions) {
          instructions.push(
            ...compileDefaultNodeArrayInstructions(path, [fieldDefinition], field),
          );
        }

        // If we have an ID field, let's try and get the node
        if (fieldDefinition.__instructions?.id) {
          const compiledQuery = jsonata(fieldDefinition.__instructions.id);
          const foundNodeIndex = nodes.findIndex((node) =>
            !!compiledQuery.evaluate(node.compilerNode)
          );
          if (foundNodeIndex === -1) {
            instructions.push(
              ...compileInstructions(path, [fieldDefinition], field),
            );
          } else {
            const nextPath = createPath(path, field, foundNodeIndex.toString());
            if (isDefinition(fieldDefinition)) {
              instructions.push(
                ...generateInstructions(
                  nodes[foundNodeIndex],
                  fieldDefinition,
                  createContext({ path: nextPath, field }),
                ),
              );
            }
          }
        }

        // If we have defined rules, process them
        instructions.push(
          ...shouldGenerateInstructionsFromRules(
            fieldDefinition,
            nodes,
            createContext({ path, field }),
          ),
        );
        // if (fieldDefinition.__instructions?.rules) {
        //   for (const rule of fieldDefinition.__instructions.rules) {
        //     const compiledQuery = jsonata(rule.condition);
        //     const nodes = (nodes as tsm.Node[]);
        //     const foundNodeIndex = nodes.findIndex((node) =>
        //       !!compiledQuery.evaluate(node.compilerNode)
        //     );
        //     const index = shouldGetRuleIndex(rule, nodes, foundNodeIndex);

        //     // If a rule matches we process the results
        //     if (foundNodeIndex !== -1) {
        //       const nextPath = createPath(path, fieldName, foundNodeIndex.toString());
        //       if (rule.instruction === InstructionType.UNSET) {
        //         instructions.push(
        //           ...compileInstructions(
        //             nextPath,
        //             undefined,
        //             rule.field as string,
        //             rule.instruction,
        //           ),
        //         );
        //       } else if (rule.instruction === InstructionType.REMOVE) {
        //         instructions.push(
        //           ...compileInstructions(
        //             nextPath,
        //             [undefined],
        //             rule.field as string,
        //             rule.instruction,
        //             index,
        //           ),
        //         );
        //       } else {
        //         instructions.push(
        //           ...compileInstructions(
        //             path,
        //             [fieldDefinition],
        //             rule.field || fieldName,
        //             rule.instruction,
        //             index,
        //           ),
        //         );
        //       }
        //     }
        //   }
        // }
      }
    } else {
      assertNotArray(nodes);
      const node = nodes;
      const fieldDefinition = fieldDefinitions;
      if (fieldDefinition.__instructions?.id) {
        const compiledQuery = jsonata(fieldDefinition.__instructions.id);
        const foundNode = [node].find((node) =>
          compiledQuery.evaluate(node.compilerNode)
        );
        if (!foundNode) {
          instructions.push(
            ...compileInstructions(path, fieldDefinition, field),
          );
        } else {
          const nextPath = createPath(path, field);
          if (isDefinition(fieldDefinition)) {
            instructions.push(
              ...generateInstructions(
                foundNode,
                fieldDefinition,
                createContext({ path: nextPath, field }),
              ),
            );
          }
        }
      }
    }
  }
  return instructions;
}

export function processInstruction(
  currentNode: tsm.Node,
  instruction: Instruction,
): void {
  const parentNode = getNodeByPath(currentNode, instruction.path);
  let definition: Maybe<Definition>;
  if (
    instruction.type === InstructionType.REMOVE ||
    instruction.type === InstructionType.UNSET
  ) {
    definition = undefined;
  } else {
    definition = instruction.definition;
  }

  const nodeToModify = shouldBuildNodeFromDefinition(definition);
  switch (parentNode.getKind()) {
    case ts.SyntaxKind.SourceFile: {
      return processSourceFile(parentNode, instruction, nodeToModify);
    }
    case ts.SyntaxKind.FunctionDeclaration: {
      return processFunctionDeclaration(parentNode, instruction, nodeToModify);
    }
    case ts.SyntaxKind.InterfaceDeclaration: {
      return processInterfaceDeclaration(parentNode, instruction, nodeToModify);
    }
    case ts.SyntaxKind.PropertySignature: {
      return processPropertySignature(parentNode, instruction, nodeToModify);
    }
    default: {
      // TODO: assertNever
      throw new TypeError(
        `Unable to Process Instruction: unsupported parent node of kind ${parentNode.getKindName()}`,
      );
    }
  }
}

export function processInstructions(
  currentNode: tsm.Node,
  instructions: Instruction[],
): void {
  for (const instruction of instructions) {
    processInstruction(currentNode, instruction);
  }
}
