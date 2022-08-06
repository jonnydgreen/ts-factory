import { ts, tsm } from '../../deps.ts';
import { generateInstructions } from '../../instructions/instructions.ts';
import { InstructionType } from '../../instructions/instructions.type.ts';
import { assertIsError, assertSnapshot, assertThrows, blocks } from '../../test.deps.ts';
import { createTestName, sanitiseInstructions, TestDefinition } from '../test-utils.ts';

blocks.describe('Instructions', () => {
  blocks.describe(`UNSET Instruction`, () => {
    const definitions: TestDefinition[] = [
      {
        name: createTestName(
          'should define an UNSET instruction if',
          'the field is a node',
          'a rule evaluates to an UNSET instruction',
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
          'should not define an UNSET instruction if',
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
        const project = new tsm.Project();
        const sourceFile = project.createSourceFile(
          `${crypto.randomUUID()}.ts`,
          definition.sourceFileContents,
        );

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
});
