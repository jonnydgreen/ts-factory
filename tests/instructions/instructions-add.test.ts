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
  blocks.describe(`Generate ADD Instruction`, () => {
    const definitions: TestDefinition<Input>[] = [
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
              name: 'hello',
              parameters: [],
              body: { kind: ts.SyntaxKind.Block, statements: [] },
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
              name: 'hello',
              parameters: [],
              body: { kind: ts.SyntaxKind.Block, statements: [] },
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
              name: 'hello',
              parameters: [],
              body: { kind: ts.SyntaxKind.Block, statements: [] },
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
              body: { kind: ts.SyntaxKind.Block, statements: [] },
            },
          ],
        },
        sourceFileContents: `
          export function foo() {}
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
              // TODO: uncomment
              // body: { kind: ts.SyntaxKind.Block, statements: [] },
            },
          ],
        },
        sourceFileContents: `
          function hello() {}
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
              // TODO: comment
              // body: { kind: ts.SyntaxKind.Block, statements: [] },
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

          // Act
          const instructions = generateInstructions(sourceFile, definition.input);

          // Assert
          await assertSnapshot(t, sanitiseInstructions(instructions));
        },
        ignore: definition.ignore,
        only: definition.only,
      });
    }
  });

  blocks.describe(`Process ADD Instruction`, () => {
    const definitions: TestDefinition<Definition>[] = [
      {
        name: createTestName(
          'should process an ADD Instruction if',
          'the field is an array of nodes',
          'the field nodes don\'t exist',
          'no instructions are specified on the field definition',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: 'hello',
              parameters: [],
              body: { kind: ts.SyntaxKind.Block, statements: [] },
            },
          ],
        },
      },
      {
        name: createTestName(
          'should process an ADD Instruction if',
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
                { kind: ts.SyntaxKind.DefaultKeyword },
              ],
              parameters: [],
              // TODO: uncomment
              // body: { kind: ts.SyntaxKind.Block, statements: [] },
            },
          ],
        },
        sourceFileContents: `
          function hello() {}
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
          await assertSnapshot(t, sourceFile.getFullText());
        },
        ignore: definition.ignore,
        only: definition.only,
      });
    }
  });
});
