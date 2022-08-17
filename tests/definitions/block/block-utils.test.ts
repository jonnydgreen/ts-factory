import { ts } from '../../../deps.ts';
import { assertIsError, assertThrows, blocks } from '../../../test.deps.ts';
import { getNodesOfKind } from '../../test-utils.ts';
import { createSourceFile } from '../../test-utils.ts';
import { getBlockField } from '../../../definitions/block/block.utils.ts';
import { AssertionError, assertTSMNodeKind } from '../../../utils/utils.assert.ts';

blocks.describe('Block Utils', () => {
  blocks.describe('getBlockField', () => {
    blocks.it('should throw an error if a field is not supported', () => {
      // Arrange
      const sourceFile = createSourceFile(
        'export function hello() { console.log("hello") }',
      );
      const [node] = getNodesOfKind(sourceFile, ts.SyntaxKind.Block);
      assertTSMNodeKind(node, ts.SyntaxKind.Block);

      // Act
      const result = assertThrows(() => getBlockField(node, 'invalid'));

      // Assert
      assertIsError(
        result,
        AssertionError,
        'Unable to get field of name \'invalid\' from node of kind \'Block\'',
      );
    });
  });
});
