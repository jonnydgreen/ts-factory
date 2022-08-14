import { Definition } from '../../definitions/definitions.ts';
import { SourceFileInput } from '../../definitions/source-file/source-file.type.ts';
import { ts } from '../../deps.ts';
import { createPath } from '../../instructions/instructions.ts';
import { Instruction, InstructionType } from '../../instructions/instructions.type.ts';
import {
  buildNodeFromDefinition,
  getNodeByPath,
  processNodeFieldDefinition,
} from '../../instructions/instructions.utils.ts';
import { assertEquals, assertIsError, assertThrows, blocks } from '../../test.deps.ts';
import { createSourceFile } from '../test-utils.ts';

blocks.describe('Instructions Utils', () => {
  blocks.describe('getNodeByPath', () => {
    blocks.it(
      'should find a node at the defined path',
      () => {
        // Arrange
        const sourceFile = createSourceFile('export function hello() {}');
        const path = 'statements[0].name';

        // Act
        const result = getNodeByPath(sourceFile, path);

        // Assert
        assertEquals(result.getKindName(), 'Identifier');
      },
    );

    blocks.it(
      'should find a node at the defined nested path',
      () => {
        // Arrange
        const sourceFile = createSourceFile(`export function hello() {
            console.info("hello");
          }`);
        const path = 'statements[0].body.statements[0].expression.expression';

        // Act
        const result = getNodeByPath(sourceFile, path);

        // Assert
        assertEquals(result.getKindName(), 'PropertyAccessExpression');
      },
    );

    blocks.it(
      'should throw an error if a path entry does not exist',
      () => {
        // Arrange
        const sourceFile = createSourceFile('export function hello() {}');
        const path = 'statements[0].type';

        // Act
        const error = assertThrows(() => getNodeByPath(sourceFile, path));

        // Assert
        assertIsError(
          error,
          TypeError,
          'Node not found at location \'type\' for Path \'type\'',
        );
      },
    );

    blocks.it(
      'should throw an error if a path entry for an array node is not a number',
      () => {
        // Arrange
        const sourceFile = createSourceFile('export function hello() {}');
        const path = 'statements[hello]';

        // Act
        const error = assertThrows(() => getNodeByPath(sourceFile, path));

        // Assert
        assertIsError(
          error,
          TypeError,
          'Next node is an array of nodes but the following ID is not an array index \'hello\'',
        );
      },
    );

    blocks.it(
      'should throw an error if a path entry for an array node is not an index of the array',
      () => {
        // Arrange
        const sourceFile = createSourceFile('export function hello() {}');
        const path = 'statements[1]';

        // Act
        const error = assertThrows(() => getNodeByPath(sourceFile, path));

        // Assert
        assertIsError(
          error,
          TypeError,
          'Node not found at index \'1\'',
        );
      },
    );
  });

  blocks.describe('buildNodeFromDefinition', () => {
    blocks.it(
      'should throw an error if the definition kind is not supported',
      () => {
        // Arrange
        const definition: Definition = {
          kind: 987 as unknown as ts.SyntaxKind.Identifier,
          text: 'some-text',
        };

        // Act
        const result = assertThrows(() => buildNodeFromDefinition(definition));

        // Assert
        assertIsError(
          result,
          TypeError,
          'TS Node Kind not supported: \'987|undefined\'',
        );
      },
    );
  });

  blocks.describe('processNodeFieldDefinition', () => {
    blocks.it(
      'should throw an error if the definition kind is not supported',
      () => {
        // Arrange
        const instruction: Instruction = {
          type: InstructionType.SET,
          field: 'statements',
          path: createPath(),
          definition: { kind: ts.SyntaxKind.FunctionDeclaration, parameters: [] },
        };
        const sourceFile = createSourceFile();

        // Act
        const result = assertThrows(() =>
          processNodeFieldDefinition<SourceFileInput>(sourceFile, instruction, {
            statements: {
              ADD: () => {},
            },
          })
        );

        // Assert
        assertIsError(
          result,
          TypeError,
          'SET Instruction not supported for SourceFile.statements',
        );
      },
    );
  });
});
