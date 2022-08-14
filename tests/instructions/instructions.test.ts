import { Definition } from '../../definitions/definitions.ts';
import { ts } from '../../deps.ts';
import {
  compileDefaultNodeInstructions,
  createPath,
  generateInstructions,
  processInstruction,
} from '../../instructions/instructions.ts';
import { Instruction, InstructionType } from '../../instructions/instructions.type.ts';
import { assertIsError, assertThrows, blocks } from '../../test.deps.ts';
import { AssertionError } from '../../utils/utils.assert.ts';
import { createSourceFile } from '../test-utils.ts';

blocks.describe('Instructions', () => {
  blocks.describe('generateInstructions', () => {
    blocks.it(
      'should throw an error if the definition kind does not match the node kind',
      () => {
        // Arrange
        const definition: Definition = {
          kind: ts.SyntaxKind.SourceFile,
          statements: [],
        };
        const sourceFile = createSourceFile('function hello() {}');
        const [statement] = sourceFile.getStatements();

        // Act
        const result = assertThrows(() => generateInstructions(statement, definition));

        // Assert
        assertIsError(
          result,
          AssertionError,
          'Definition of kind \'SourceFile\' does not match expected Node kind \'FunctionDeclaration\'',
        );
      },
    );

    blocks.it(
      'should throw an error if the definition contains an invalid field that we do not support',
      () => {
        // Arrange
        const definition: Definition = {
          kind: ts.SyntaxKind.SourceFile,
          statements: [],
          invalid: [{ kind: ts.SyntaxKind.AbstractKeyword }],
        } as unknown as Definition;
        const sourceFile = createSourceFile('function hello() {}');

        // Act
        const result = assertThrows(() => generateInstructions(sourceFile, definition));

        // Assert
        assertIsError(
          result,
          TypeError,
          'Unable to get field of name \'invalid\' from node of kind \'SourceFile\'',
        );
      },
    );
  });

  blocks.describe('processInstruction', () => {
    blocks.it('should error if invalid instruction type is passed', () => {
      // Arrange
      const sourceFile = createSourceFile();
      sourceFile.getKind = () => 98765;
      sourceFile.getKindName = () => 'InvalidKind';
      const instruction: Instruction = {
        type: InstructionType.ADD,
        path: createPath(),
        field: 'statements',
        definition: {
          kind: ts.SyntaxKind.FunctionDeclaration,
          name: 'hello',
          parameters: [],
        },
      };

      // Act
      const error = assertThrows(() => processInstruction(sourceFile, instruction));

      // Assert
      assertIsError(
        error,
        TypeError,
        'Unable to Process Instruction: unsupported parent node of kind InvalidKind',
      );
    });
  });

  blocks.describe('compileDefaultNodeInstructions', () => {
    blocks.it('should error if invalid instruction type is passed', () => {
      // Act
      const result = assertThrows(() =>
        compileDefaultNodeInstructions(
          createPath('path'),
          undefined,
          'field',
          'invalid-instruction-type' as InstructionType.SET,
        )
      );

      // Assert
      assertIsError(
        result,
        AssertionError,
        'Input invalid-instruction-type not supported',
      );
    });
  });
});
