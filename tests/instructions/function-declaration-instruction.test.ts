import { ts, tsm } from '../../deps.ts';
import { generateInstructions } from '../../instructions/instructions.ts';
import { InstructionType } from '../../instructions/instructions.type.ts';
import { asserts, blocks } from '../../test.deps.ts';
import { sanitiseInstructions, TestDefinition } from './instructions-tests.ts';

blocks.describe.ignore('Instructions', () => {
  blocks.describe(InstructionType[InstructionType.ADD], () => {
    blocks.describe(ts.SyntaxKind[ts.SyntaxKind.FunctionDeclaration], () => {
      const definitions: TestDefinition[] = [
        {
          name: 'should handle a basic function declaration',
          input: {
            kind: ts.SyntaxKind.SourceFile,
            statements: [
              {
                kind: ts.SyntaxKind.FunctionDeclaration,
                parameters: [],
              },
            ],
          },
        },
        {
          name: 'should handle a basic function declaration for an existing file',
          input: {
            kind: ts.SyntaxKind.SourceFile,
            statements: [
              {
                // TODO: is this too complex?
                __instructions: {
                  rules: [],
                },
                kind: ts.SyntaxKind.FunctionDeclaration,
                parameters: [],
              },
            ],
          },
        },
      ];

      for (const definition of definitions) {
        blocks.it(definition.name, async (t) => {
          // Arrange
          const project = new tsm.Project();
          const sourceFile = project.createSourceFile(`${crypto.randomUUID()}.ts`);

          // Act
          const result = generateInstructions(sourceFile, definition.input);

          // Assert
          await asserts.assertSnapshot(t, sanitiseInstructions(result));
        });
      }
    });
  });
});
