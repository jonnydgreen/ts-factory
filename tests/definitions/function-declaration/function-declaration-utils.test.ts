import { ts } from '../../../deps.ts';
import { assertIsError, assertThrows, blocks } from '../../../test.deps.ts';
import { getNodesOfKind } from '../../test-utils.ts';
import { createSourceFile } from '../../test-utils.ts';
import { getFunctionDeclarationField } from '../../../definitions/function-declaration/function-declaration.utils.ts';
import { AssertionError, assertTSMNodeKind } from '../../../utils/utils.assert.ts';

blocks.describe('Function Declaration Utils', () => {
  blocks.describe('getFunctionDeclarationField', () => {
    blocks.it('should throw an error if a field is not supported', () => {
      // Arrange
      const sourceFile = createSourceFile('export function hello() {}');
      const [node] = getNodesOfKind(sourceFile, ts.SyntaxKind.FunctionDeclaration);
      assertTSMNodeKind(node, ts.SyntaxKind.FunctionDeclaration);

      // Act
      const result = assertThrows(() => getFunctionDeclarationField(node, 'invalid'));

      // Assert
      assertIsError(
        result,
        AssertionError,
        'Unable to get field of name \'invalid\' from node of kind \'FunctionDeclaration\'',
      );
    });
  });
});
