import { ts, tsm } from '../../deps.ts';
import { generateInstructions } from '../../instructions/instructions.ts';
import { assertSnapshot, blocks } from '../../test.deps.ts';
import { createTestName, sanitiseInstructions, TestDefinition } from '../test-utils.ts';

blocks.describe('Generate Instructions', () => {
  blocks.describe(`SET Instruction`, () => {
    const definitions: TestDefinition[] = [
      {
        name: createTestName(
          'should generate an SET instruction if',
          'the field is a node',
          'the field node doesn\'t exist',
          'no instructions are specified on the field definition',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'name.text="hello"',
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              parameters: [],
              type: {
                kind: ts.SyntaxKind.VoidKeyword,
              },
            },
          ],
        },
        sourceFileContents: `
          export function hello() {}
        `,
      },
      {
        name: createTestName(
          'should generate an SET instruction if',
          'the field is a node',
          'the field node is not found using the defined instruction ID',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'name.text="hello"',
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              parameters: [],
              type: {
                __instructions: {
                  id: 'kind=114',
                },
                kind: ts.SyntaxKind.VoidKeyword,
              },
            },
          ],
        },
        sourceFileContents: `
          export function hello(): string {}
        `,
      },
      {
        name: createTestName(
          'should not define an SET instruction if',
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
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              parameters: [],
              type: {
                kind: ts.SyntaxKind.VoidKeyword,
              },
            },
          ],
        },
        sourceFileContents: `
          export function hello(): void {}
        `,
      },
      {
        name: createTestName(
          'should not define an SET instruction if',
          'the field is a node',
          'the field node is found using the defined instruction ID',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'name.text="hello"',
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              parameters: [],
              type: {
                __instructions: {
                  id: 'kind=114',
                },
                kind: ts.SyntaxKind.VoidKeyword,
              },
            },
          ],
        },
        sourceFileContents: `
          export function hello(): void {}
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

        // Act
        const result = generateInstructions(sourceFile, definition.input);

        // Assert
        await assertSnapshot(t, sanitiseInstructions(result));
      });
    }
  });
});
