import { ts, tsm } from '../../deps.ts';
import { generateInstructions } from '../../instructions/instructions.ts';
import { assertSnapshot, blocks } from '../../test.deps.ts';
import { createTestName, sanitiseInstructions, TestDefinition } from '../test-utils.ts';

blocks.describe('Instructions', () => {
  blocks.describe(`Generate ADD Instruction`, () => {
    const definitions: TestDefinition[] = [
      {
        name: createTestName(
          'should generate an ADD Instruction if',
          'the field is an array of nodes',
          'the field nodes don\'t exist',
          'no instructions are specified on the field definition',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              kind: ts.SyntaxKind.FunctionDeclaration,
              parameters: [],
            },
          ],
        },
      },
      {
        name: createTestName(
          'should generate an ADD Instruction if',
          'the field is an array of nodes',
          'the field nodes don\'t exist',
          'instructions are specified on the field definition',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'some-instruction',
                rules: [],
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              parameters: [],
            },
          ],
        },
      },
      {
        name: createTestName(
          'should generate an ADD Instruction if',
          'the field is an array of nodes',
          'the field nodes exist',
          'no instructions are specified on the field definition',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              kind: ts.SyntaxKind.FunctionDeclaration,
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
          'should generate an ADD Instruction if',
          'the field is an array of nodes',
          'the field node is not found using the defined instruction ID',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                // Looks like there is an AST
                id: 'name.escapedText="hello"',
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: {
                kind: ts.SyntaxKind.Identifier,
                // TODO: can we use bindings here?
                text: 'hello',
              },
              parameters: [],
            },
          ],
        },
        sourceFileContents: `
          export function foo() {}
        `,
      },
      {
        name: createTestName(
          'should not generate an ADD Instruction if',
          'the field is an array of nodes',
          'the field node is found using the defined instruction ID',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                // TODO: Looks like there is an AST we can use instead
                id: 'name.text="hello"',
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: {
                kind: ts.SyntaxKind.Identifier,
                // TODO: can we use bindings here when we compile a template?
                text: 'hello',
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
          'should generate an ADD Instruction if',
          'the field is an array of nodes',
          'the field is a nested definition',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'name.text="hello"',
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: {
                kind: ts.SyntaxKind.Identifier,
                // TODO: can we use bindings here when we compile a template?
                text: 'hello',
              },
              modifiers: [
                { kind: ts.SyntaxKind.ExportKeyword },
                { kind: ts.SyntaxKind.AsyncKeyword },
              ],
              parameters: [],
            },
          ],
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

        // Act
        const result = generateInstructions(sourceFile, definition.input);

        // Assert
        await assertSnapshot(t, sanitiseInstructions(result));
      });
    }
  });
});
