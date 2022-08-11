import { Definition } from '../../../definitions/definitions.ts';
import { ts, tsm } from '../../../deps.ts';
import {
  generateInstructions,
  processInstructions,
} from '../../../instructions/instructions.ts';
import { assertSnapshot, blocks } from '../../../test.deps.ts';
import { createTestName, TestDefinition } from '../../test-utils.ts';

blocks.describe('Function Declaration', () => {
  const definitions: TestDefinition<Definition>[] = [
    {
      name: createTestName('should process a Function Declaration'),
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
        'should process a Function Declaration',
        'with a object name definition',
      ),
      input: {
        kind: ts.SyntaxKind.SourceFile,
        statements: [
          {
            kind: ts.SyntaxKind.FunctionDeclaration,
            name: {
              kind: ts.SyntaxKind.Identifier,
              text: 'hello',
            },
            parameters: [],
            body: { kind: ts.SyntaxKind.Block, statements: [] },
            modifiers: [
              { kind: ts.SyntaxKind.ExportKeyword },
              { kind: ts.SyntaxKind.AsyncKeyword },
            ],
          },
        ],
      },
    },
  ];

  for (const definition of definitions) {
    blocks.it({
      name: definition.name,
      fn: async (t) => {
        // Arrange
        const project = new tsm.Project();
        const sourceFile = project.createSourceFile(
          `${crypto.randomUUID()}.ts`,
          definition.sourceFileContents,
        );
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
