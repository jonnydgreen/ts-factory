import { ts, tsm } from '../../deps.ts';
import { generateInstructions } from '../../instructions/instructions.ts';
import { InstructionType } from '../../instructions/instructions.type.ts';
import { assertIsError, assertSnapshot, assertThrows, blocks } from '../../test.deps.ts';
import { createTestName, sanitiseInstructions, TestDefinition } from '../test-utils.ts';

blocks.describe('Instructions', () => {
  blocks.describe(`INSERT Instruction`, () => {
    const definitions: TestDefinition[] = [
      {
        name: createTestName(
          'should define an INSERT instruction if',
          'the field is an array of nodes',
          'a rule evaluates to an INSERT instruction',
          'a numerical index is defined for the INSERT position',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                rules: [{
                  instruction: InstructionType.INSERT,
                  condition: 'name.text="hello"',
                  index: 0,
                }],
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: {
                kind: ts.SyntaxKind.Identifier,
                text: 'hello',
              },
              parameters: [],
            },
          ],
        },
        sourceFileContents: `
          function hello() {}
        `,
      },
      {
        name: createTestName(
          'should define an INSERT instruction if',
          'the field is an array of nodes',
          'a rule evaluates to an INSERT instruction',
          'a string index is evaluated to an integer for the INSERT position',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                rules: [{
                  instruction: InstructionType.INSERT,
                  condition: 'name.text="hello"',
                  index: '$ ~> $map(function($v, $i) { $v.name.text = \'hello\' ? $i })',
                }],
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: {
                kind: ts.SyntaxKind.Identifier,
                text: 'hello',
              },
              parameters: [],
            },
          ],
        },
        sourceFileContents: `
          function hello() {}
        `,
      },
      {
        name: createTestName(
          'should not define an INSERT instruction if',
          'the field is an array of nodes',
          'the rule does not evaluate to an instruction',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                rules: [{
                  instruction: InstructionType.INSERT,
                  condition: 'name.text="does-not-exist"',
                  index: '$ ~> $map(function($v, $i) { $v.name.text = \'hello\' ? $i })',
                }],
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: {
                kind: ts.SyntaxKind.Identifier,
                text: 'hello',
              },
              parameters: [],
            },
          ],
        },
        sourceFileContents: `
          function hello() {}
        `,
      },
      {
        name: createTestName(
          'should throw an error if',
          'the field is an array of nodes',
          'a rule evaluates to an INSERT instruction',
          'a string index is evaluated to a non-integer',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                rules: [{
                  instruction: InstructionType.INSERT,
                  condition: 'name.text="hello"',
                  index: 'name.text',
                }],
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: {
                kind: ts.SyntaxKind.Identifier,
                text: 'hello',
              },
              parameters: [],
            },
          ],
        },
        error: {
          prototype: TypeError,
          message:
            'Invalid index for INSERT, must be integer less than or equal to the array length (1); got NaN',
        },
        sourceFileContents: `
          function hello() {}
        `,
      },
      {
        name: createTestName(
          'should throw an error if',
          'the field is an array of nodes',
          'a rule evaluates to an INSERT instruction',
          'a string index is evaluated to an integer greater than the length of the array of nodes',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                rules: [{
                  instruction: InstructionType.INSERT,
                  condition: 'name.text="hello"',
                  index:
                    '$ ~> $map(function($v, $i) { $v.name.text = \'hello\' ? $i + 6 })',
                }],
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: {
                kind: ts.SyntaxKind.Identifier,
                text: 'hello',
              },
              parameters: [],
            },
          ],
        },
        error: {
          prototype: TypeError,
          message:
            'Invalid index for INSERT, must be integer less than or equal to the array length (1); got 6',
        },
        sourceFileContents: `
          function hello() {}
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
