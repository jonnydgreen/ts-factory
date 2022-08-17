import { Definition, Input } from '../../definitions/definitions.ts';
import { ts } from '../../deps.ts';
import {
  generateInstructions,
  processInstructions,
} from '../../instructions/instructions.ts';
import { InstructionType } from '../../instructions/instructions.type.ts';
import { assertIsError, assertSnapshot, assertThrows, blocks } from '../../test.deps.ts';
import {
  createSourceFile,
  createTestName,
  sanitiseInstructions,
  TestDefinition,
} from '../test-utils.ts';

blocks.describe('Instructions', () => {
  blocks.describe(`Generate UNSET Instruction`, () => {
    const definitions: TestDefinition<Input>[] = [
      {
        name: createTestName(
          'should generate an UNSET Instruction if',
          'the field is a node',
          'a rule evaluates to an UNSET Instruction',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'name.text="hello"',
                rules: [{
                  instruction: InstructionType.UNSET,
                  condition: '$exists(type)',
                  field: 'type',
                }],
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: {
                kind: ts.SyntaxKind.Identifier,
                text: 'foo',
              },
              parameters: [],
            },
          ],
        },
        sourceFileContents: `
          function hello(): void {}
        `,
      },
      {
        name: createTestName(
          'should not generate an UNSET Instruction if',
          'the field is a node',
          'the rule does not evaluate to an instruction',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                rules: [{
                  instruction: InstructionType.UNSET,
                  condition: 'name.text="does-not-exist"',
                  field: 'type',
                }],
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: {
                kind: ts.SyntaxKind.Identifier,
                text: 'foo',
              },
              parameters: [],
            },
          ],
        },
        sourceFileContents: `
          function hello(): void {}
        `,
      },
    ];

    for (const definition of definitions) {
      blocks.it(definition.name, async (t) => {
        // Arrange
        const sourceFile = createSourceFile(definition.sourceFileContents);

        if (definition.error) {
          // Act
          const result = assertThrows(() =>
            generateInstructions(sourceFile, definition.input)
          );

          // Assert
          assertIsError(result, definition.error.prototype, definition.error.message);
        } else {
          // Act
          const result = generateInstructions(sourceFile, definition.input);

          // Assert
          await assertSnapshot(t, sanitiseInstructions(result));
        }
      });
    }
  });

  blocks.describe(`Process UNSET Instruction`, () => {
    const definitions: TestDefinition<Definition>[] = [
      {
        name: createTestName(
          'should process an UNSET Instruction if',
          'the field is a node',
          'the field node exists',
          'no instructions are specified on the field definition',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'name.text="hello"',
                rules: [{
                  instruction: InstructionType.UNSET,
                  condition: '$exists(type)',
                  field: 'type',
                }],
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: {
                kind: ts.SyntaxKind.Identifier,
                text: 'foo',
              },
              parameters: [],
            },
          ],
        },
        sourceFileContents: `
          export function hello(): void {}
        `,
      },
    ];

    for (const definition of definitions) {
      blocks.it({
        name: definition.name,
        fn: async (t) => {
          // Arrange
          const sourceFile = createSourceFile(definition.sourceFileContents);
          sourceFile.formatText();
          const instructions = generateInstructions(sourceFile, definition.input);

          // Act
          processInstructions(sourceFile, instructions);

          // Assert
          await assertSnapshot(t, sourceFile.getFullText().trim());
        },
        ignore: definition.ignore,
        only: definition.only,
      });
    }
  });
});
