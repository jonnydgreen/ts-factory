import { Definition } from '../../definitions/definitions.ts';
import { ts, tsm } from '../../deps.ts';
import { generateInstructions } from '../../instructions/instructions.ts';
import { assertIsError, assertThrows, blocks } from '../../test.deps.ts';

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
});
