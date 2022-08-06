import { assertIsError, assertThrows, blocks } from '../../test.deps.ts';
import { assertNever } from '../../utils/utils.assert.ts';

blocks.describe('Assert Utils', () => {
  blocks.describe('assertNever', () => {
    [
      {
        test: 'should error if called',
        input: 'hello',
        error: {},
      },
    ].forEach((definition) => {
      blocks.it(definition.test, () => {
        // Act
        const result = assertThrows(() => assertNever(definition.input as never));

        // Assert
        assertIsError(result, TypeError, 'Input hello not supported');
      });
    });
  });
});
