import { Input } from '../definitions/definitions.ts';
import { ts } from '../deps.ts';
import { Instruction, InstructionType } from '../instructions/instructions.type.ts';

export interface TestDefinitionError {
  // TODO: ClassType
  // deno-lint-ignore no-explicit-any
  prototype: new (...args: any[]) => Error;
  message?: string;
}

export interface TestDefinition {
  name: string;
  input: Input;
  sourceFileContents?: string;
  error?: TestDefinitionError;
  // TODO: bindings
  // bindings?: TBindings;
}

export function sanitiseInstructions(instructions: Instruction[]): unknown[] {
  return instructions.map((instruction) => ({
    ...instruction,
    type: InstructionType[instruction.type],
    definition: JSON.parse(JSON.stringify(instruction.definition, (key, value) => {
      if (key === 'kind') {
        return ts.SyntaxKind[value];
      }
      return value;
    })),
  }));
}

export function createTestName(
  output: string,
  ...[initialCondition, ...conditions]: string[]
): string {
  let testName = output;
  if (initialCondition) {
    testName = [testName, initialCondition].join(' ');
  }

  if (conditions.length > 0) {
    const middleConditions = conditions.slice(0, conditions.length - 1);
    const finalCondition = conditions[conditions.length - 1];
    if (middleConditions.length > 0) {
      testName = [testName, ...middleConditions].join(', ');
    }
    testName = [testName, 'and', finalCondition].join(' ');
  }

  return testName;
}
