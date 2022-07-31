import { ts, tsm } from '../../deps.ts';
import { generateInstructions } from '../../instructions/instructions.ts';
import { InstructionType } from '../../instructions/instructions.type.ts';
import { asserts, blocks } from '../../test.deps.ts';
import { sanitiseInstructions, TestDefinition } from './instructions-tests.ts';

function createTestName(
  output: string,
  ...[initialCondition, ...conditions]: string[]
): string {
  let testName = output;
  if (initialCondition) {
    testName = [testName, initialCondition].join(' ');
  }

  if (conditions.length > 0) {
    const middleConditions = conditions.slice(0, conditions.length - 1);
    const finalCondition = conditions[conditions.length - 1];
    if (middleConditions.length > 0) {
      testName = [testName, ...middleConditions].join(', ');
    }
    testName = [testName, 'and', finalCondition].join(' ');
  }

  return testName;
}

blocks.describe('Instructions', () => {
  blocks.describe(`${InstructionType[InstructionType.ADD]} Instruction`, () => {
    const definitions: TestDefinition[] = [
      {
        name: createTestName(
          'should define an ADD instruction if',
          'the field is an array of nodes',
          'the field nodes don\'t exist',
          'no instructions are specified on the field definition',
        ),
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
        name: createTestName(
          'should define an ADD instruction if',
          'the field is an array of nodes',
          'the field nodes don\'t exist',
          'instructions are specified on the field definition',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'some-instruction',
                rules: [],
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              parameters: [],
            },
          ],
        },
      },
      {
        name: createTestName(
          'should define an ADD instruction if',
          'the field is an array of nodes',
          'the field nodes exist',
          'no instructions are specified on the field definition',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              kind: ts.SyntaxKind.FunctionDeclaration,
              parameters: [],
            },
          ],
        },
        sourceFileContents: `
          export function hello() {}
        `,
      },
      {
        name: createTestName(
          'should define an ADD instruction if',
          'the field is an array of nodes',
          'the field node is not found using the defined instruction ID',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                // Looks like there is an AST
                id: 'name.escapedText="hello"',
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: {
                kind: ts.SyntaxKind.Identifier,
                // TODO: can we use bindings here?
                text: 'hello',
              },
              parameters: [],
            },
          ],
        },
        sourceFileContents: `
          export function foo() {}
        `,
      },
      {
        name: createTestName(
          'should not define an ADD instruction if',
          'the field is an array of nodes',
          'the field node is found using the defined instruction ID',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                // TODO: Looks like there is an AST we can use instead
                id: 'name.text="hello"',
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: {
                kind: ts.SyntaxKind.Identifier,
                // TODO: can we use bindings here when we compile a template?
                text: 'hello',
              },
              parameters: [],
            },
          ],
        },
        sourceFileContents: `
          export function hello() {}
        `,
      },
    ];

    for (const definition of definitions) {
      blocks.it(definition.name, async (t) => {
        // Arrange
        const project = new tsm.Project();
        const sourceFile = project.createSourceFile(
          `${crypto.randomUUID()}.ts`,
          definition.sourceFileContents,
        );

        // Act
        const result = generateInstructions(sourceFile, definition.input);

        // Assert
        await asserts.assertSnapshot(t, sanitiseInstructions(result));
      });
    }
  });
});
