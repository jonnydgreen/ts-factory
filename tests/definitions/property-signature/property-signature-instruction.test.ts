import { Definition } from '../../../definitions/definitions.ts';
import { PropertySignatureInput } from '../../../definitions/property-signature/property-signature.type.ts';
import { ts } from '../../../deps.ts';
import {
  generateInstructions,
  processInstructions,
} from '../../../instructions/instructions.ts';
import { InstructionType } from '../../../instructions/instructions.type.ts';
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

blocks.describe('Property Signature', () => {
  blocks.describe('definition', () => {
    const definitions: TestDefinition<Definition>[] = [
      {
        name: createTestName('should process a basic Property Signature'),
        input: {
          kind: ts.SyntaxKind.InterfaceDeclaration,
          name: 'Hello',
          members: [{
            kind: ts.SyntaxKind.PropertySignature,
            name: 'hello',
          }],
        },
        sourceFileContents: `interface Hello {}`,
      },
      {
        name: createTestName(
          'should process a Property Signature with an Identifier as the name',
        ),
        input: {
          kind: ts.SyntaxKind.InterfaceDeclaration,
          name: 'Hello',
          members: [{
            kind: ts.SyntaxKind.PropertySignature,
            name: { kind: ts.SyntaxKind.Identifier, text: 'hello' },
          }],
        },
        sourceFileContents: `interface Hello {}`,
      },
      {
        name: createTestName('should process a Property Signature with Modifiers'),
        input: {
          kind: ts.SyntaxKind.InterfaceDeclaration,
          name: 'Hello',
          members: [{
            kind: ts.SyntaxKind.PropertySignature,
            name: 'hello',
            modifiers: [{ kind: ts.SyntaxKind.ReadonlyKeyword }],
          }],
        },
        sourceFileContents: `interface Hello {}`,
      },
      {
        name: createTestName('should process a Property Signature with a Type'),
        input: {
          kind: ts.SyntaxKind.InterfaceDeclaration,
          name: 'Hello',
          members: [{
            kind: ts.SyntaxKind.PropertySignature,
            name: 'hello',
            type: { kind: ts.SyntaxKind.StringKeyword },
          }],
        },
        sourceFileContents: `interface Hello {}`,
      },
      {
        name: createTestName(
          'should process a Property Signature with a Question Token',
        ),
        input: {
          kind: ts.SyntaxKind.InterfaceDeclaration,
          name: 'Hello',
          members: [{
            kind: ts.SyntaxKind.PropertySignature,
            name: 'hello',
            type: { kind: ts.SyntaxKind.StringKeyword },
            questionToken: { kind: ts.SyntaxKind.QuestionToken },
          }],
        },
        sourceFileContents: `interface Hello {}`,
      },
    ];

    for (const definition of definitions) {
      blocks.it({
        name: definition.name,
        fn: async (t) => {
          // Arrange
          const sourceFile = createSourceFile(definition.sourceFileContents);
          const [node] = getNodesOfKind(sourceFile, ts.SyntaxKind.InterfaceDeclaration);
          assertTSMNodeKind(node, ts.SyntaxKind.InterfaceDeclaration);
          const instructions = generateInstructions(node, definition.input);

          // Act
          processInstructions(node, instructions);

          // Assert
          await assertSnapshot(t, node.getFullText().trim());
        },
        ignore: definition.ignore,
        only: definition.only,
      });
    }
  });

  blocks.describe('fields', () => {
    const fieldDefinitions: TestDefinitionFields<PropertySignatureInput> = {
      type: [
        {
          name: createTestName('should SET the Type of a Property Signature'),
          input: {
            kind: ts.SyntaxKind.PropertySignature,
            name: 'foo',
            type: {
              kind: ts.SyntaxKind.StringKeyword,
            },
          },
          sourceFileContents: `
            interface Hello {
              foo;
            }`,
        },
        {
          name: createTestName('should UNSET the Type of a Property Signature'),
          input: {
            kind: ts.SyntaxKind.PropertySignature,
            __instructions: {
              rules: [{
                instruction: InstructionType.UNSET,
                condition: '$exists(type)',
                field: 'type',
              }],
            },
            name: 'foo',
          },
          sourceFileContents: `
            interface Hello {
              foo: string;
            }`,
        },
      ],
      questionToken: [
        {
          name: createTestName('should SET the Question Token of a Property Signature'),
          input: {
            kind: ts.SyntaxKind.PropertySignature,
            name: 'foo',
            questionToken: { kind: ts.SyntaxKind.QuestionToken },
          },
          sourceFileContents: `
            interface Hello {
              foo: string;
            }`,
        },
        {
          name: createTestName(
            'should UNSET the Question Token of a Property Signature',
          ),
          input: {
            kind: ts.SyntaxKind.PropertySignature,
            __instructions: {
              rules: [{
                instruction: InstructionType.UNSET,
                condition: '$exists(questionToken)',
                field: 'questionToken',
              }],
            },
            name: 'foo',
          },
          sourceFileContents: `
            interface Hello {
              foo?: string;
            }`,
        },
      ],
      modifiers: [
        {
          name: createTestName('should ADD Modifiers to the Property Signature'),
          input: {
            kind: ts.SyntaxKind.PropertySignature,
            name: 'foo',
            modifiers: [
              { kind: ts.SyntaxKind.ReadonlyKeyword },
            ],
          },
          sourceFileContents: `
            interface Hello {
              foo: string;
            }`,
        },
        {
          name: createTestName(
            'should ADD Modifiers to the Property Signature with existing modifiers',
          ),
          input: {
            kind: ts.SyntaxKind.PropertySignature,
            name: 'foo',
            modifiers: [
              { kind: ts.SyntaxKind.ReadonlyKeyword },
            ],
          },
          sourceFileContents: `
            interface Hello {
              readonly foo: string;
            }`,
        },
        {
          name: createTestName(
            'should throw an error if an unsupported Modifier is defined',
          ),
          input: {
            kind: ts.SyntaxKind.PropertySignature,
            name: 'foo',
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
            message: 'Unsupported Modifier kind AsyncKeyword for Property Signature',
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
              const [node] = getNodesOfKind(sourceFile, ts.SyntaxKind.PropertySignature);
              assertTSMNodeKind(node, ts.SyntaxKind.PropertySignature);
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
