import { ts, tsm } from '../../deps.ts';
import { generateInstructions } from '../../instructions/instructions.ts';
import { InstructionType } from '../../instructions/instructions.type.ts';
import { assertIsError, assertSnapshot, assertThrows, blocks } from '../../test.deps.ts';
import { createTestName, sanitiseInstructions, TestDefinition } from '../test-utils.ts';

blocks.describe('Instructions', () => {
  blocks.describe(`Generate REMOVE Instruction`, () => {
    const definitions: TestDefinition[] = [
      {
        name: createTestName(
          'should generate a REMOVE Instruction if',
          'the field is an array of nodes',
          'a rule evaluates to an REMOVE Instruction',
          'no index is defined for the REMOVE position',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'name.text="hello"',
                rules: [{
                  instruction: InstructionType.REMOVE,
                  condition: 'modifiers.kind=93',
                  field: 'modifiers',
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
          export function hello() {}
        `,
      },
      {
        name: createTestName(
          'should generate a REMOVE Instruction if',
          'the field is an array of nodes',
          'a rule evaluates to an REMOVE Instruction',
          'a numerical index is defined for the REMOVE position',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'name.text="hello"',
                rules: [{
                  instruction: InstructionType.REMOVE,
                  condition: '$exists(modifiers[kind=93])',
                  field: 'modifiers',
                  index: 1,
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
          export async function hello() {}
        `,
      },
      {
        name: createTestName(
          'should generate a REMOVE Instruction if',
          'the field is an array of nodes',
          'a rule evaluates to an REMOVE Instruction',
          'a string index is evaluated to an integer for the REMOVE position',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'name.text="hello"',
                rules: [{
                  instruction: InstructionType.REMOVE,
                  condition: '$exists(modifiers[kind=93])',
                  field: 'modifiers',
                  index:
                    '$ ~> $map(function($v, $i) { $exists($v.modifiers[kind = 93]) ? $i })',
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
          export function hello() {}
        `,
      },
      {
        name: createTestName(
          'should throw an error if',
          'the field is an array of nodes',
          'a rule evaluates to an REMOVE Instruction',
          'a string index is evaluated to an non-integer for the REMOVE position',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'name.text="hello"',
                rules: [{
                  instruction: InstructionType.REMOVE,
                  condition: '$exists(modifiers[kind=93])',
                  index: '"hello"',
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
        error: {
          prototype: TypeError,
          message:
            'Invalid index for REMOVE, must be integer less than or equal to the array length (1); got NaN',
        },
        sourceFileContents: `
          export function hello() {}
        `,
      },
      {
        name: createTestName(
          'should throw an error if',
          'the field is an array of nodes',
          'a rule evaluates to an REMOVE Instruction',
          'a string index is evaluated to an integer equal to the length of the array of nodes',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'name.text="hello"',
                rules: [{
                  instruction: InstructionType.REMOVE,
                  condition: '$exists(modifiers[kind=93])',
                  index: '1',
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
        error: {
          prototype: TypeError,
          message:
            'Invalid index for REMOVE; must be a valid array index integer; got 1',
        },
        sourceFileContents: `
          export function hello() {}
        `,
      },
      {
        name: createTestName(
          'should throw an error if',
          'the field is an array of nodes',
          'a rule evaluates to an REMOVE Instruction',
          'a string index is evaluated to an integer greater than the length of the array of nodes',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'name.text="hello"',
                rules: [{
                  instruction: InstructionType.REMOVE,
                  condition: '$exists(modifiers[kind=93])',
                  index: '6',
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
        error: {
          prototype: TypeError,
          message:
            'Invalid index for REMOVE, must be integer less than or equal to the array length (1); got 6',
        },
        sourceFileContents: `
          export function hello() {}
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
