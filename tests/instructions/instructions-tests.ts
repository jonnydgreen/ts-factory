import { Input } from '../../definitions/definitions.ts';
import { ts } from '../../deps.ts';
import { Instruction, InstructionType } from '../../instructions/instructions.type.ts';

export interface TestDefinition {
  name: string;
  input: Input;
  sourceFileContents?: string;
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
