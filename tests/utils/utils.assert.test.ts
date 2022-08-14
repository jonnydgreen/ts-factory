import { ts } from '../../deps.ts';
import { assertIsError, assertThrows, blocks } from '../../test.deps.ts';
import {
  assertArray,
  assertDefined,
  AssertionError,
  assertNever,
  assertNotArray,
  assertTSMNodeKind,
  assertTSNodeType,
} from '../../utils/utils.assert.ts';
import { createSourceFile } from '../test-utils.ts';

blocks.describe('Assert Utils', () => {
  blocks.describe('assertNever', () => {
    [
      {
        test: 'should error if called',
        input: 'hello',
        error: 'Input hello not supported',
      },
    ].forEach((definition) => {
      blocks.it(definition.test, () => {
        // Act
        const result = assertThrows(() => assertNever(definition.input as never));

        // Assert
        assertIsError(result, AssertionError, definition.error);
      });
    });
  });

  blocks.describe('assertDefined', () => {
    [
      {
        test: 'should error if not defined',
        input: undefined,
        error: 'Input is not defined',
      },
    ].forEach((definition) => {
      blocks.it(definition.test, () => {
        // Act
        const result = assertThrows(() => assertDefined(definition.input as never));

        // Assert
        assertIsError(result, AssertionError, definition.error);
      });
    });
  });

  blocks.describe('assertTSNodeType', () => {
    [
      {
        test: 'should error if not defined',
        input: undefined,
        predicate: ts.isArrowFunction,
        error: 'Node is not defined',
      },
      {
        test: 'should error if invalid kind',
        input: createSourceFile().compilerNode,
        predicate: ts.isArrowFunction,
        error: 'Invalid Node of kind SourceFile',
      },
    ].forEach((definition) => {
      blocks.it(definition.test, () => {
        // Act
        const result = assertThrows(() =>
          assertTSNodeType(definition.input, definition.predicate)
        );

        // Assert
        assertIsError(result, AssertionError, definition.error);
      });
    });
  });

  blocks.describe('assertTSMNodeKind', () => {
    [
      {
        test: 'should error if invalid kind',
        input: undefined,
        kind: ts.SyntaxKind.BinaryExpression,
      },
    ].forEach((definition) => {
      blocks.it(definition.test, () => {
        const sourceFile = createSourceFile();

        // Act
        const result = assertThrows(() =>
          assertTSMNodeKind(sourceFile, definition.kind)
        );

        // Assert
        assertIsError(
          result,
          AssertionError,
          'Invalid Node of kind SourceFile; expected BinaryExpression',
        );
      });
    });
  });

  blocks.describe('assertArray', () => {
    [
      {
        test: 'should error if not an array',
        input: 'hello',
      },
    ].forEach((definition) => {
      blocks.it(definition.test, () => {
        // Act
        const result = assertThrows(() => assertArray(definition.input));

        // Assert
        assertIsError(
          result,
          AssertionError,
          'Input is not of type array: string',
        );
      });
    });
  });

  blocks.describe('assertNotArray', () => {
    [
      {
        test: 'should error if a array',
        input: ['hello'],
      },
    ].forEach((definition) => {
      blocks.it(definition.test, () => {
        // Act
        const result = assertThrows(() => assertNotArray(definition.input));

        // Assert
        assertIsError(
          result,
          AssertionError,
          'Input is of type array when it should not',
        );
      });
    });
  });
});
