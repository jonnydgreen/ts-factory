import { Definition } from '../../../definitions/definitions.ts';
import { InterfaceDeclarationInput } from '../../../definitions/interface-declaration/interface-declaration.type.ts';
import { ts } from '../../../deps.ts';
import {
  generateInstructions,
  processInstructions,
} from '../../../instructions/instructions.ts';
import {
  assertIsError,
  assertSnapshot,
  assertThrows,
  blocks,
} from '../../../test.deps.ts';
import { assertTSMNodeKind } from '../../../utils/utils.assert.ts';
import {
  createSourceFile,
  createTestName,
  getNodesOfKind,
  TestDefinition,
  TestDefinitionFields,
} from '../../test-utils.ts';

blocks.describe('Interface Declaration', () => {
  blocks.describe('definition', () => {
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

  blocks.describe('fields', () => {
    const fieldDefinitions: TestDefinitionFields<InterfaceDeclarationInput> = {
      members: [
        {
          name: createTestName('should ADD members to the Interface Declaration'),
          input: {
            kind: ts.SyntaxKind.InterfaceDeclaration,
            name: 'Hello',
            members: [
              {
                __instructions: { id: 'name.text="foo"' },
                kind: ts.SyntaxKind.PropertySignature,
                name: 'foo',
                type: { kind: ts.SyntaxKind.StringKeyword },
              },
              {
                __instructions: { id: 'name.text="bar"' },
                kind: ts.SyntaxKind.PropertySignature,
                name: 'bar',
                type: { kind: ts.SyntaxKind.StringKeyword },
                questionToken: { kind: ts.SyntaxKind.QuestionToken },
              },
            ],
          },
          sourceFileContents: `
          interface Hello {
            baz: number;
            foo: string;
          }`,
        },
      ],
      modifiers: [
        {
          name: createTestName(
            'should ADD export Modifier to the Interface Declaration',
          ),
          input: {
            kind: ts.SyntaxKind.InterfaceDeclaration,
            name: 'Hello',
            members: [],
            modifiers: [
              { kind: ts.SyntaxKind.ExportKeyword },
            ],
          },
          sourceFileContents: `
            interface Hello {
              foo: string;
            }`,
        },
        {
          name: createTestName(
            'should ADD declare Modifier to the Interface Declaration',
          ),
          input: {
            kind: ts.SyntaxKind.InterfaceDeclaration,
            name: 'Hello',
            members: [],
            modifiers: [
              { kind: ts.SyntaxKind.DeclareKeyword },
            ],
          },
          sourceFileContents: `
            interface Hello {
              foo: string;
            }`,
        },
        {
          name: createTestName(
            'should ADD Modifiers to the Interface Declaration with existing modifiers',
          ),
          input: {
            kind: ts.SyntaxKind.InterfaceDeclaration,
            name: 'Hello',
            members: [],
            modifiers: [
              { kind: ts.SyntaxKind.ExportKeyword },
            ],
          },
          sourceFileContents: `
            export interface Hello {
              readonly foo: string;
            }`,
        },
        {
          name: createTestName(
            'should throw an error if an unsupported Modifier is defined',
          ),
          input: {
            kind: ts.SyntaxKind.InterfaceDeclaration,
            name: 'Hello',
            members: [],
            modifiers: [
              { kind: ts.SyntaxKind.AsyncKeyword },
            ],
          },
          sourceFileContents: `
            interface Hello {
              foo: string;
            }`,
          error: {
            prototype: TypeError,
            message: 'Unsupported Modifier kind AsyncKeyword for Interface Declaration',
          },
        },
      ],
    };
    for (const [field, definitions] of Object.entries(fieldDefinitions)) {
      blocks.describe(field, () => {
        for (const definition of definitions) {
          blocks.it({
            name: definition.name,
            fn: async (t) => {
              // Arrange
              const sourceFile = createSourceFile(definition.sourceFileContents);
              const [node] = getNodesOfKind(
                sourceFile,
                ts.SyntaxKind.InterfaceDeclaration,
              );
              assertTSMNodeKind(node, ts.SyntaxKind.InterfaceDeclaration);
              const instructions = generateInstructions(node, definition.input);

              if (definition.error) {
                // Act
                const result = assertThrows(() =>
                  processInstructions(node, instructions)
                );

                // Assert
                assertIsError(
                  result,
                  definition.error.prototype,
                  definition.error.message,
                );
              } else {
                // Act
                processInstructions(node, instructions);

                // Assert
                // TODO: add a formatTS fn
                await assertSnapshot(t, node.getFullText().trim());
              }
            },
            ignore: definition.ignore,
            only: definition.only,
          });
        }
      });
    }
  });
});
