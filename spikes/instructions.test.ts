import { ts, TSM as tsm } from '../deps.ts';
import { asserts, blocks } from '../test.deps.ts';
import { Instruction, InstructionType, processInstruction } from './instructions.ts';

const { SyntaxKind, factory } = ts;

function printNodes(node: tsm.Node): void {
  if (
    node.isKind(SyntaxKind.FunctionDeclaration) ||
    node.isKind(SyntaxKind.CallExpression)
  ) {
    console.log('=== KIND ===', SyntaxKind[node.compilerNode.kind]);
    console.log(node.compilerNode);
    console.log('======');
  }

  node.forEachChild(printNodes);
}

/**
 * @type {typeof factory.createAdd}
 * @example
 * createAdd(left: ts.Expression, right: ts.Expression): ts.BinaryExpression
 */
export function test(): void {}

blocks.describe('Instructions', () => {
  blocks.describe(`${InstructionType[InstructionType.ADD]} Instruction`, () => {
    blocks.it.ignore(
      'add a statement to a source file that doesn\'t exist',
      async (t) => {
        // Arrange
        const p = new tsm.Project({
          manipulationSettings: {
            indentationText: tsm.IndentationText.TwoSpaces,
          },
        });
        const sourceFile = p.createSourceFile(
          `does-not-exist-${crypto.randomUUID()}.ts`,
        );

        const instructions: Instruction[] = [
          {
            type: InstructionType.ADD,
            field: 'statements',
            definition: {
              kind: SyntaxKind.CallExpression,
              expression: {
                kind: SyntaxKind.PropertyAccessExpression,
                expression: {
                  kind: SyntaxKind.Identifier,
                  text: 'console',
                },
                name: {
                  kind: SyntaxKind.Identifier,
                  text: 'log',
                },
              },
              arguments: [
                {
                  kind: SyntaxKind.StringLiteral,
                  text: 'Hello',
                },
              ],
              leadingTrivia: {
                kind: SyntaxKind.SingleLineCommentTrivia,
                text: ' Hello',
              },
            },
          },
          {
            type: InstructionType.ADD,
            field: 'statements',
            definition: {
              kind: SyntaxKind.CallExpression,
              expression: {
                kind: SyntaxKind.PropertyAccessExpression,
                expression: {
                  kind: SyntaxKind.Identifier,
                  text: 'console',
                },
                name: {
                  kind: SyntaxKind.Identifier,
                  text: 'log',
                },
              },
              arguments: [
                {
                  kind: SyntaxKind.StringLiteral,
                  text: 'There',
                },
              ],
              leadingTrivia: {
                kind: SyntaxKind.SingleLineCommentTrivia,
                text: ' There',
              },
            },
          },
        ];

        // Act
        for (const instruction of instructions) {
          processInstruction(sourceFile, instruction);
        }

        // Assert
        await asserts.assertSnapshot(t, sourceFile.getFullText());
      },
    );

    blocks.it.ignore('add a statement to a source file that exists', async (t) => {
      // Arrange
      const p = new tsm.Project({
        manipulationSettings: {
          indentationText: tsm.IndentationText.TwoSpaces,
        },
      });
      const sourceFile = p.addSourceFileAtPath('spikes/instructions.example.ts');

      const instructions: Instruction[] = [
        {
          type: InstructionType.ADD,
          field: 'statements',
          definition: {
            kind: SyntaxKind.CallExpression,
            expression: {
              kind: SyntaxKind.PropertyAccessExpression,
              expression: {
                kind: SyntaxKind.Identifier,
                text: 'console',
              },
              name: {
                kind: SyntaxKind.Identifier,
                text: 'log',
              },
            },
            arguments: [
              {
                kind: SyntaxKind.StringLiteral,
                text: 'Extra',
              },
            ],
            leadingTrivia: {
              kind: SyntaxKind.SingleLineCommentTrivia,
              text: ' Extra',
            },
          },
        },
        {
          type: InstructionType.ADD,
          field: 'statements',
          definition: {
            kind: SyntaxKind.CallExpression,
            expression: {
              kind: SyntaxKind.PropertyAccessExpression,
              expression: {
                kind: SyntaxKind.Identifier,
                text: 'console',
              },
              name: {
                kind: SyntaxKind.Identifier,
                text: 'log',
              },
            },
            arguments: [
              {
                kind: SyntaxKind.StringLiteral,
                text: 'Log',
              },
            ],
            leadingTrivia: {
              kind: SyntaxKind.SingleLineCommentTrivia,
              text: ' Log',
            },
          },
        },
      ];

      // Act
      for (const instruction of instructions) {
        processInstruction(sourceFile, instruction);
      }

      // Assert
      await asserts.assertSnapshot(t, sourceFile.getFullText());
    });

    blocks.it.ignore('should add a statement to an existing block', async (t) => {
      // Arrange
      const p = new tsm.Project({
        manipulationSettings: {
          indentationText: tsm.IndentationText.TwoSpaces,
        },
      });
      const sourceFile = p.addSourceFileAtPath(
        'spikes/instructions.example.ts',
      );

      const instructions: Instruction[] = [
        {
          type: InstructionType.ADD,
          nodeId: 'statements.0.body',
          field: 'statements',
          definition: {
            kind: SyntaxKind.ReturnStatement,
            expression: {
              kind: SyntaxKind.CallExpression,
              expression: {
                kind: SyntaxKind.Identifier,
                text: 'getData',
              },
            },
            leadingTrivia: {
              kind: SyntaxKind.SingleLineCommentTrivia,
              text: ' Return data',
            },
          },
        },
      ];

      // Act
      for (const instruction of instructions) {
        processInstruction(sourceFile, instruction);
      }

      // Assert
      await asserts.assertSnapshot(t, sourceFile.getFullText());
    });
  });

  blocks.describe(`${InstructionType[InstructionType.SET]} Instruction`, () => {
    blocks.it.ignore(
      'set a particular field on an existing node',
      async (t) => {
        // Arrange
        const p = new tsm.Project({
          manipulationSettings: {
            indentationText: tsm.IndentationText.TwoSpaces,
          },
        });
        const sourceFile = p.addSourceFileAtPath('spikes/instructions.example.ts');
        const instructions: Instruction[] = [
          // TODO: need multiple sets
          {
            type: InstructionType.SET,
            nodeId: 'statements.0',
            field: 'returnType',
            definition: {
              kind: SyntaxKind.StringKeyword,
            },
          },
        ];

        // Act
        for (const instruction of instructions) {
          processInstruction(sourceFile, instruction);
        }

        // Assert
        await asserts.assertSnapshot(t, sourceFile.getFullText());
      },
    );
  });
});
