import { assertEquals, blocks } from '../../test.deps.ts';
import { StringUtils } from '../../utils/utils.string.ts';

blocks.describe('StringUtils', () => {
  blocks.describe('upperFirst', () => {
    [
      {
        test: 'should upper case the first letter of an input string',
        input: 'hello',
        expected: 'Hello',
      },
      {
        test: 'should handle a single character string',
        input: 'h',
        expected: 'H',
      },
      {
        test: 'should handle empty strings',
        input: '',
        expected: '',
      },
    ].forEach((definition) => {
      blocks.it(definition.test, () => {
        assertEquals(
          StringUtils.upperFirst(definition.input),
          definition.expected,
        );
      });
    });
  });
});
