import { ts } from '../../../deps.ts';
import { assertIsError, assertThrows, blocks } from '../../../test.deps.ts';
import { getNodesOfKind } from '../../test-utils.ts';
import { createSourceFile } from '../../test-utils.ts';
import { getInterfaceDeclarationField } from '../../../definitions/interface-declaration/interface-declaration.utils.ts';
import { AssertionError, assertTSMNodeKind } from '../../../utils/utils.assert.ts';

blocks.describe('Interface Declaration Utils', () => {
  blocks.describe('getInterfaceDeclarationField', () => {
    blocks.it('should throw an error if a field is not supported', () => {
      // Arrange
      const sourceFile = createSourceFile('export interface Hello { foo: string }');
      const [node] = getNodesOfKind(sourceFile, ts.SyntaxKind.InterfaceDeclaration);
      assertTSMNodeKind(node, ts.SyntaxKind.InterfaceDeclaration);

      // Act
      const result = assertThrows(() => getInterfaceDeclarationField(node, 'invalid'));

      // Assert
      assertIsError(
        result,
        AssertionError,
        'Unable to get field of name \'invalid\' from node of kind \'InterfaceDeclaration\'',
      );
    });
  });
});
