import { ts } from '../../../deps.ts';
import { assertIsError, assertThrows, blocks } from '../../../test.deps.ts';
import { getNodesOfKind } from '../../test-utils.ts';
import { createSourceFile } from '../../test-utils.ts';
import { getPropertySignatureField } from '../../../definitions/property-signature/property-signature.utils.ts';
import { AssertionError, assertTSMNodeKind } from '../../../utils/utils.assert.ts';

blocks.describe('Property Signature Utils', () => {
  blocks.describe('getPropertySignatureField', () => {
    blocks.it('should throw an error if a field is not supported', () => {
      // Arrange
      const sourceFile = createSourceFile('export interface Hello { foo: string }');
      const [node] = getNodesOfKind(sourceFile, ts.SyntaxKind.PropertySignature);
      assertTSMNodeKind(node, ts.SyntaxKind.PropertySignature);

      // Act
      const result = assertThrows(() => getPropertySignatureField(node, 'invalid'));

      // Assert
      assertIsError(
        result,
        AssertionError,
        'Unable to get field of name \'invalid\' from node of kind \'PropertySignature\'',
      );
    });
  });
});
