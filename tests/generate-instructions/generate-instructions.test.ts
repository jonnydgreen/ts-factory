import { Definition } from '../../definitions/definitions.ts';
import { ts, tsm } from '../../deps.ts';
import {
  compileDefaultNodeInstructions,
  createPath,
  generateInstructions,
} from '../../instructions/instructions.ts';
import { InstructionType } from '../../instructions/instructions.type.ts';
import { assertIsError, assertThrows, blocks } from '../../test.deps.ts';

blocks.describe('Generate Instructions', () => {
  blocks.describe('generateInstructions', () => {
    blocks.it(
      'should throw an error if the definition kind does not match the node kind',
      () => {
        // Arrange
        const definition: Definition = {
          kind: ts.SyntaxKind.SourceFile,
          statements: [],
        };
        const project = new tsm.Project();
        const sourceFile = project.createSourceFile(
          `${crypto.randomUUID()}.ts`,
          'function hello() {}',
        );
        const [statement] = sourceFile.getStatements();

        // Act
        const result = assertThrows(() => generateInstructions(statement, definition));

        // Assert
        assertIsError(
          result,
          TypeError,
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
        const project = new tsm.Project();
        const sourceFile = project.createSourceFile(
          `${crypto.randomUUID()}.ts`,
          'function hello() {}',
        );

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

  blocks.describe('compileDefaultNodeInstructions', () => {
    blocks.it('should error if invalid instruction type is pass', () => {
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
      assertIsError(result, TypeError, 'Input invalid-instruction-type not supported');
    });
  });
});
