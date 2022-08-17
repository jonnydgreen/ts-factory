import { ts } from '../../../deps.ts';
import { assertIsError, assertThrows, blocks } from '../../../test.deps.ts';
import { getNodesOfKind } from '../../test-utils.ts';
import { createSourceFile } from '../../test-utils.ts';
import { getExpressionStatementField } from '../../../definitions/expression-statement/expression-statement.utils.ts';
import { AssertionError, assertTSMNodeKind } from '../../../utils/utils.assert.ts';

blocks.describe('Expression Statement Utils', () => {
  blocks.describe('getExpressionStatementField', () => {
    blocks.it('should throw an error if a field is not supported', () => {
      // Arrange
      const sourceFile = createSourceFile(
        'export function hello() { console.log("hello") }',
      );
      const [node] = getNodesOfKind(sourceFile, ts.SyntaxKind.ExpressionStatement);
      assertTSMNodeKind(node, ts.SyntaxKind.ExpressionStatement);

      // Act
      const result = assertThrows(() => getExpressionStatementField(node, 'invalid'));

      // Assert
      assertIsError(
        result,
        AssertionError,
        'Unable to get field of name \'invalid\' from node of kind \'ExpressionStatement\'',
      );
    });
  });
});
