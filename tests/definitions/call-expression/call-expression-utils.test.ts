import { ts } from '../../../deps.ts';
import { assertIsError, assertThrows, blocks } from '../../../test.deps.ts';
import { getNodesOfKind } from '../../test-utils.ts';
import { createSourceFile } from '../../test-utils.ts';
import { getCallExpressionField } from '../../../definitions/call-expression/call-expression.utils.ts';
import { AssertionError, assertTSMNodeKind } from '../../../utils/utils.assert.ts';

blocks.describe('Call Expression Utils', () => {
  blocks.describe('getCallExpressionField', () => {
    blocks.it('should throw an error if a field is not supported', () => {
      // Arrange
      const sourceFile = createSourceFile(
        'export function hello() { console.log("hello") }',
      );
      const [node] = getNodesOfKind(sourceFile, ts.SyntaxKind.CallExpression);
      assertTSMNodeKind(node, ts.SyntaxKind.CallExpression);

      // Act
      const result = assertThrows(() => getCallExpressionField(node, 'invalid'));

      // Assert
      assertIsError(
        result,
        AssertionError,
        'Unable to get field of name \'invalid\' from node of kind \'CallExpression\'',
      );
    });
  });
});
