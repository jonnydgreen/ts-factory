import { Definition } from '../../../definitions/definitions.ts';
import { TokenInputKind } from '../../../definitions/token/token.type.ts';
import { ts } from '../../../deps.ts';
import {
  createPath,
  generateInstructions,
  processInstructions,
} from '../../../instructions/instructions.ts';
import {
  Instruction,
  InstructionType,
} from '../../../instructions/instructions.type.ts';
import { buildNodeFromDefinition } from '../../../instructions/instructions.utils.ts';
import {
  assertIsError,
  assertSnapshot,
  assertThrows,
  blocks,
} from '../../../test.deps.ts';
import { assertTSMNodeKind } from '../../../utils/utils.assert.ts';
import { printNode } from '../../../utils/utils.node.ts';
import {
  createSourceFile,
  createTestName,
  getNodesOfKind,
  TestDefinition,
} from '../../test-utils.ts';

blocks.describe('Token', () => {
  blocks.describe('node', () => {
    const tokens: [TokenInputKind, ...string[]][] = [
      [ts.SyntaxKind.SuperKeyword],
      [ts.SyntaxKind.ThisKeyword],
      [ts.SyntaxKind.NullKeyword],
      [ts.SyntaxKind.TrueKeyword],
      [ts.SyntaxKind.FalseKeyword],
      [ts.SyntaxKind.OpenBraceToken, 'OpenBraceToken'],
      [ts.SyntaxKind.CloseBraceToken],
      [ts.SyntaxKind.OpenParenToken],
      [ts.SyntaxKind.CloseParenToken],
      [ts.SyntaxKind.OpenBracketToken],
      [ts.SyntaxKind.CloseBracketToken],
      [ts.SyntaxKind.DotToken],
      [ts.SyntaxKind.DotDotDotToken],
      [ts.SyntaxKind.SemicolonToken],
      [ts.SyntaxKind.CommaToken],
      [ts.SyntaxKind.QuestionDotToken],
      [ts.SyntaxKind.LessThanToken, 'LessThanToken'],
      [ts.SyntaxKind.LessThanSlashToken],
      [ts.SyntaxKind.GreaterThanToken],
      [ts.SyntaxKind.LessThanEqualsToken],
      [ts.SyntaxKind.GreaterThanEqualsToken],
      [ts.SyntaxKind.EqualsEqualsToken],
      [ts.SyntaxKind.ExclamationEqualsToken],
      [ts.SyntaxKind.EqualsEqualsEqualsToken],
      [ts.SyntaxKind.ExclamationEqualsEqualsToken],
      [ts.SyntaxKind.EqualsGreaterThanToken],
      [ts.SyntaxKind.PlusToken],
      [ts.SyntaxKind.MinusToken],
      [ts.SyntaxKind.AsteriskToken],
      [ts.SyntaxKind.AsteriskAsteriskToken],
      [ts.SyntaxKind.SlashToken],
      [ts.SyntaxKind.PercentToken],
      [ts.SyntaxKind.PlusPlusToken],
      [ts.SyntaxKind.MinusMinusToken],
      [ts.SyntaxKind.LessThanLessThanToken],
      [ts.SyntaxKind.GreaterThanGreaterThanToken],
      [ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken],
      [ts.SyntaxKind.AmpersandToken],
      [ts.SyntaxKind.BarToken],
      [ts.SyntaxKind.CaretToken],
      [ts.SyntaxKind.ExclamationToken],
      [ts.SyntaxKind.TildeToken],
      [ts.SyntaxKind.AmpersandAmpersandToken],
      [ts.SyntaxKind.BarBarToken],
      [ts.SyntaxKind.QuestionQuestionToken],
      [ts.SyntaxKind.QuestionToken],
      [ts.SyntaxKind.ColonToken],
      [ts.SyntaxKind.AtToken],
      [ts.SyntaxKind.BacktickToken],
      [ts.SyntaxKind.HashToken],
      [ts.SyntaxKind.EqualsToken, 'EqualsToken'],
      [ts.SyntaxKind.PlusEqualsToken, 'PlusEqualsToken'],
      [ts.SyntaxKind.MinusEqualsToken],
      [ts.SyntaxKind.AsteriskEqualsToken],
      [ts.SyntaxKind.AsteriskAsteriskEqualsToken],
      [ts.SyntaxKind.SlashEqualsToken],
      [ts.SyntaxKind.PercentEqualsToken],
      [ts.SyntaxKind.LessThanLessThanEqualsToken],
      [ts.SyntaxKind.GreaterThanGreaterThanEqualsToken],
      [ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken],
      [ts.SyntaxKind.AmpersandEqualsToken],
      [ts.SyntaxKind.BarEqualsToken],
      [ts.SyntaxKind.CaretEqualsToken],
      [ts.SyntaxKind.Unknown, 'Unknown'],
      [ts.SyntaxKind.EndOfFileToken],
    ];
    const definitions = tokens.map<TestDefinition<Definition>>(
      ([token, tokenNameOverride]) => ({
        name: createTestName(
          `should process a ${tokenNameOverride ?? ts.SyntaxKind[token]} Token`,
        ),
        input: {
          kind: token,
        },
      }),
    );

    for (const definition of definitions) {
      blocks.it({
        name: definition.name,
        fn: async (t) => {
          // Act
          const result = buildNodeFromDefinition(definition.input);

          // Assert
          await assertSnapshot(t, printNode(result));
        },
        ignore: definition.ignore,
        only: definition.only,
      });
    }
  });

  blocks.describe('definition', () => {
    const definitions: TestDefinition<Definition>[] = [
      {
        name: createTestName('should process a Token'),
        input: {
          kind: ts.SyntaxKind.FunctionDeclaration,
          name: 'hello',
          parameters: [],
          asteriskToken: { kind: ts.SyntaxKind.AsteriskToken },
        },
        sourceFileContents: `function hello () {}`,
      },
    ];

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
    blocks.it('should error if a Token node is processed', () => {
      // Arrange
      const sourceFile = createSourceFile('function* hello() {}');
      const [node] = getNodesOfKind(
        sourceFile,
        ts.SyntaxKind.AsteriskToken,
      );
      assertTSMNodeKind(node, ts.SyntaxKind.AsteriskToken);
      const instructions: Instruction[] = [{
        type: InstructionType.SET,
        definition: {
          kind: ts.SyntaxKind.AsteriskToken,
        },
        field: 'invalid',
        path: createPath(),
      }];

      // Act
      const result = assertThrows(() => processInstructions(node, instructions));

      // Assert
      assertIsError(
        result,
        TypeError,
        'Unable to Process Instruction: unsupported parent node of kind AsteriskToken',
      );
    });
  });
});
