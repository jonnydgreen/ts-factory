import { Definition } from '../../../definitions/definitions.ts';
import { ts, tsm } from '../../../deps.ts';
import {
  generateInstructions,
  processInstructions,
} from '../../../instructions/instructions.ts';
import { assertSnapshot, blocks } from '../../../test.deps.ts';
import { createTestName, TestDefinition } from '../../test-utils.ts';

blocks.describe('Interface Declaration', () => {
  const definitions: TestDefinition<Definition>[] = [
    {
      name: createTestName('should process an empty Interface Declaration'),
      input: {
        kind: ts.SyntaxKind.SourceFile,
        statements: [
          {
            kind: ts.SyntaxKind.InterfaceDeclaration,
            name: 'Hello',
            members: [],
          },
        ],
      },
    },
    {
      name: createTestName(
        'should process an Interface Declaration with an Identifier as the name',
      ),
      input: {
        kind: ts.SyntaxKind.SourceFile,
        statements: [
          {
            kind: ts.SyntaxKind.InterfaceDeclaration,
            name: { kind: ts.SyntaxKind.Identifier, text: 'Hello' },
            members: [],
          },
        ],
      },
    },
    {
      name: createTestName('should process an Interface Declaration with modifiers'),
      input: {
        kind: ts.SyntaxKind.SourceFile,
        statements: [
          {
            kind: ts.SyntaxKind.InterfaceDeclaration,
            name: 'Hello',
            modifiers: [{ kind: ts.SyntaxKind.ExportKeyword }],
            members: [],
          },
        ],
      },
    },
    {
      name: createTestName('should process an Interface Declaration with members'),
      input: {
        kind: ts.SyntaxKind.SourceFile,
        statements: [
          {
            kind: ts.SyntaxKind.InterfaceDeclaration,
            name: 'Hello',
            modifiers: [{ kind: ts.SyntaxKind.ExportKeyword }],
            members: [
              {
                kind: ts.SyntaxKind.PropertySignature,
                name: 'foo',
                type: { kind: ts.SyntaxKind.StringKeyword },
              },
              {
                kind: ts.SyntaxKind.PropertySignature,
                name: 'bar',
                type: { kind: ts.SyntaxKind.StringKeyword },
                questionToken: { kind: ts.SyntaxKind.QuestionToken },
              },
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
