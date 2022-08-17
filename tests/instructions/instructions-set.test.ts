import { Definition, Input } from '../../definitions/definitions.ts';
import { ts } from '../../deps.ts';
import {
  generateInstructions,
  processInstructions,
} from '../../instructions/instructions.ts';
import { assertSnapshot, blocks } from '../../test.deps.ts';
import {
  createSourceFile,
  createTestName,
  sanitiseInstructions,
  TestDefinition,
} from '../test-utils.ts';

blocks.describe('Instructions', () => {
  blocks.describe(`Generate SET Instruction`, () => {
    const definitions: TestDefinition<Input>[] = [
      {
        name: createTestName(
          'should generate a SET Instruction if',
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
          'should generate a SET Instruction if',
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
          'should not generate a SET Instruction if',
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
          'should not generate a SET Instruction if',
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
      blocks.it({
        name: definition.name,
        fn: async (t) => {
          // Arrange
          const sourceFile = createSourceFile(definition.sourceFileContents);

          // Act
          const result = generateInstructions(sourceFile, definition.input);

          // Assert
          await assertSnapshot(t, sanitiseInstructions(result));
        },
        ignore: definition.ignore,
        only: definition.only,
      });
    }
  });

  blocks.describe(`Process SET Instruction`, () => {
    const definitions: TestDefinition<Definition>[] = [
      {
        name: createTestName(
          'should process a SET Instruction if',
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
    ];

    for (const definition of definitions) {
      blocks.it({
        name: definition.name,
        fn: async (t) => {
          // Arrange
          const sourceFile = createSourceFile(definition.sourceFileContents);
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
