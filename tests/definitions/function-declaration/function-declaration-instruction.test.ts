import { Definition } from '../../../definitions/definitions.ts';
import { FunctionDeclarationInput } from '../../../definitions/function-declaration/function-declaration.type.ts';
import { ts, tsm } from '../../../deps.ts';
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
  TestDefinition,
  TestDefinitionFields,
} from '../../test-utils.ts';

blocks.describe('Function Declaration', () => {
  blocks.describe('definition', () => {
    const definitions: TestDefinition<Definition>[] = [
      {
        name: createTestName('should process a Function Declaration'),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [{
            kind: ts.SyntaxKind.FunctionDeclaration,
            name: 'hello',
            parameters: [],
            body: { kind: ts.SyntaxKind.Block, statements: [] },
          }],
        },
      },
      {
        name: createTestName(
          'should process a Function Declaration',
          'with a object name definition',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [{
            kind: ts.SyntaxKind.FunctionDeclaration,
            name: {
              kind: ts.SyntaxKind.Identifier,
              text: 'hello',
            },
            parameters: [],
            body: { kind: ts.SyntaxKind.Block, statements: [] },
          }],
        },
      },
      {
        name: createTestName(
          'should process a Function Declaration',
          'with modifiers',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [{
            kind: ts.SyntaxKind.FunctionDeclaration,
            name: 'hello',
            parameters: [],
            body: { kind: ts.SyntaxKind.Block, statements: [] },
            modifiers: [
              { kind: ts.SyntaxKind.ExportKeyword },
              { kind: ts.SyntaxKind.AsyncKeyword },
            ],
          }],
        },
      },
    ];
    for (const definition of definitions) {
      blocks.it({
        name: definition.name,
        fn: async (t) => {
          // Arrange
          const node = createSourceFile(definition.sourceFileContents);
          const instructions = generateInstructions(node, definition.input);

          // Act
          processInstructions(node, instructions);

          // Assert
          await assertSnapshot(t, node.getFullText());
        },
        ignore: definition.ignore,
        only: definition.only,
      });
    }
  });

  blocks.describe('fields', () => {
    const fieldDefinitions: TestDefinitionFields<FunctionDeclarationInput> = {
      type: [
        {
          name: createTestName('should SET the return type of a Function Declaration'),
          input: {
            kind: ts.SyntaxKind.FunctionDeclaration,
            parameters: [],
            type: {
              kind: ts.SyntaxKind.VoidKeyword,
            },
          },
          sourceFileContents: 'export function hello() {}',
        },
        {
          name: createTestName('should UNSET the return type of a Function Declaration'),
          input: {
            kind: ts.SyntaxKind.FunctionDeclaration,
            __instructions: {
              rules: [{
                instruction: InstructionType.UNSET,
                condition: '$exists(type)',
                field: 'type',
              }],
            },
            parameters: [],
          },
          sourceFileContents: 'export function hello(): void {}',
        },
      ],
      modifiers: [
        {
          name: createTestName('should ADD modifiers to the Function Declaration'),
          input: {
            kind: ts.SyntaxKind.FunctionDeclaration,
            parameters: [],
            modifiers: [
              { kind: ts.SyntaxKind.ExportKeyword },
              { kind: ts.SyntaxKind.AsyncKeyword },
            ],
          },
          sourceFileContents: 'function hello() {}',
        },
        {
          name: createTestName(
            'should ADD modifiers to the Function Declaration with existing modifiers',
          ),
          input: {
            kind: ts.SyntaxKind.FunctionDeclaration,
            parameters: [],
            modifiers: [
              { kind: ts.SyntaxKind.AsyncKeyword },
              { kind: ts.SyntaxKind.DefaultKeyword },
            ],
          },
          sourceFileContents: 'export async function hello() {}',
        },
        {
          name: createTestName(
            'should throw an error if an unsupported modifier is defined',
          ),
          input: {
            kind: ts.SyntaxKind.FunctionDeclaration,
            parameters: [],
            modifiers: [
              { kind: ts.SyntaxKind.ReadonlyKeyword },
            ],
          },
          sourceFileContents: 'function hello() {}',
          error: {
            prototype: TypeError,
            message: 'Unsupported Modifier kind ReadonlyKeyword',
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
                ts.SyntaxKind.FunctionDeclaration,
              );
              assertTSMNodeKind(node, ts.SyntaxKind.FunctionDeclaration);
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
                await assertSnapshot(t, node.getFullText());
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

// What do we want to test?
//  - Y - Adding a new Definition
//  - Y - Adding a new Definition with different options
//  - Manipulating fields on the definition

// TODO: move
function getNodesOfKind<
  TKind extends ts.SyntaxKind,
  TNode extends tsm.KindToNodeMappings[TKind],
>(currentNode: tsm.Node, kind: TKind): TNode[] {
  const nodes: TNode[] = [];
  if (currentNode.isKind(kind)) {
    nodes.push(currentNode as TNode);
  }

  currentNode.forEachChild((childNode) => {
    nodes.push(...getNodesOfKind(childNode, kind) as TNode[]);
  });
  return nodes;
}
