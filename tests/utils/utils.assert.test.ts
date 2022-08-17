import { ts } from '../../deps.ts';
import { assertIsError, assertThrows, blocks } from '../../test.deps.ts';
import {
  assertArray,
  assertDefined,
  AssertionError,
  assertNever,
  assertNotArray,
  assertTSMNodeKind,
  assertTSNodeKind,
  assertTSNodeType,
} from '../../utils/utils.assert.ts';
import { createSourceFile } from '../test-utils.ts';

blocks.describe('Assert Utils', () => {
  blocks.describe('assertNever', () => {
    [
      {
        test: 'should error if called',
        input: 'hello',
        message: 'Input hello not supported',
      },
    ].forEach((definition) => {
      blocks.it(definition.test, () => {
        // Act
        const result = assertThrows(() =>
          assertNever(definition.input as never, definition.message)
        );

        // Assert
        assertIsError(result, AssertionError, definition.message);
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

  blocks.describe('assertTSNodeKind', () => {
    [
      {
        test: 'should error if not defined',
        input: undefined,
        kind: ts.SyntaxKind.ArrowFunction,
        error: 'Node is not defined',
      },
      {
        test: 'should error if invalid kind',
        input: createSourceFile().compilerNode,
        kind: ts.SyntaxKind.ArrowFunction,
        error: 'Invalid Node of kind SourceFile; expected ArrowFunction',
      },
    ].forEach((definition) => {
      blocks.it(definition.test, () => {
        // Act
        const result = assertThrows(() =>
          assertTSNodeKind(definition.input, definition.kind)
        );

        // Assert
        assertIsError(result, AssertionError, definition.error);
      });
    });
  });

  blocks.describe('assertTSMNodeKind', () => {
    [
      {
        test: 'should error if not defined',
        input: undefined,
        kind: ts.SyntaxKind.ArrowFunction,
        error: 'Node is not defined',
      },
      {
        test: 'should error if invalid kind',
        input: createSourceFile(),
        kind: ts.SyntaxKind.BinaryExpression,
        error: 'Invalid Node of kind SourceFile; expected BinaryExpression',
      },
    ].forEach((definition) => {
      blocks.it(definition.test, () => {
        // Act
        const result = assertThrows(() =>
          assertTSMNodeKind(definition.input, definition.kind)
        );

        // Assert
        assertIsError(
          result,
          AssertionError,
          definition.error,
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
