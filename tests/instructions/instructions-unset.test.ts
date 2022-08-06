import { ts, tsm } from '../../deps.ts';
import { generateInstructions } from '../../instructions/instructions.ts';
import { InstructionType } from '../../instructions/instructions.type.ts';
import { assertIsError, assertSnapshot, assertThrows, blocks } from '../../test.deps.ts';
import { createTestName, sanitiseInstructions, TestDefinition } from '../test-utils.ts';

blocks.describe('Instructions', () => {
  blocks.describe(`UNSET Instruction`, () => {
    const definitions: TestDefinition[] = [
      {
        name: createTestName(
          'should define an UNSET instruction if',
          'the field is a node',
          'a rule evaluates to an UNSET instruction',
          'a numerical index is defined for the UNSET position',
        ),
        input: {
          kind: ts.SyntaxKind.SourceFile,
          statements: [
            {
              __instructions: {
                id: 'name.text="hello"',
                rules: [{
                  instruction: InstructionType.UNSET,
                  condition: '$exists(type)',
                  field: 'type',
                }],
              },
              kind: ts.SyntaxKind.FunctionDeclaration,
              name: {
                kind: ts.SyntaxKind.Identifier,
                text: 'foo',
              },
              parameters: [],
            },
          ],
        },
        sourceFileContents: `
          function hello(): void {}
        `,
      },
      // TODO: uncomment
      // {
      //   name: createTestName(
      //     'should define an UNSET instruction if',
      //     'the field is an array of nodes',
      //     'a rule evaluates to an UNSET instruction',
      //     'a string index is evaluated to an integer for the UNSET position',
      //   ),
      //   input: {
      //     kind: ts.SyntaxKind.SourceFile,
      //     statements: [
      //       {
      //         __instructions: {
      //           rules: [{
      //             instruction: InstructionType.UNSET,
      //             condition: 'name.text="hello"',
      //             // TODO: maybe we can create a function for this
      //             index: '$ ~> $map(function($v, $i) { $v.name.text = \'hello\' ? $i })',
      //           }],
      //         },
      //         kind: ts.SyntaxKind.FunctionDeclaration,
      //         name: {
      //           kind: ts.SyntaxKind.Identifier,
      //           text: 'foo',
      //         },
      //         parameters: [],
      //       },
      //     ],
      //   },
      //   sourceFileContents: `
      //     function hello() {}
      //   `,
      // },
      // {
      //   name: createTestName(
      //     'should not define an UNSET instruction if',
      //     'the field is an array of nodes',
      //     'the rules does not evaluate to an instruction',
      //   ),
      //   input: {
      //     kind: ts.SyntaxKind.SourceFile,
      //     statements: [
      //       {
      //         __instructions: {
      //           rules: [{
      //             instruction: InstructionType.UNSET,
      //             condition: 'name.text="does-not-exist"',
      //             index: '$ ~> $map(function($v, $i) { $v.name.text = \'hello\' ? $i })',
      //           }],
      //         },
      //         kind: ts.SyntaxKind.FunctionDeclaration,
      //         name: {
      //           kind: ts.SyntaxKind.Identifier,
      //           text: 'foo',
      //         },
      //         parameters: [],
      //       },
      //     ],
      //   },
      //   sourceFileContents: `
      //     function hello() {}
      //   `,
      // },
      // {
      //   name: createTestName(
      //     'should throw an error if',
      //     'the field is an array of nodes',
      //     'a rule evaluates to an UNSET instruction',
      //     'a string index is evaluated to a non-integer',
      //   ),
      //   input: {
      //     kind: ts.SyntaxKind.SourceFile,
      //     statements: [
      //       {
      //         __instructions: {
      //           rules: [{
      //             instruction: InstructionType.UNSET,
      //             condition: 'name.text="hello"',
      //             index: 'name.text',
      //           }],
      //         },
      //         kind: ts.SyntaxKind.FunctionDeclaration,
      //         name: {
      //           kind: ts.SyntaxKind.Identifier,
      //           text: 'foo',
      //         },
      //         parameters: [],
      //       },
      //     ],
      //   },
      //   error: {
      //     prototype: TypeError,
      //     message:
      //       'Invalid index for UNSET, must be integer less than or equal to the array length (1); got NaN',
      //   },
      //   sourceFileContents: `
      //     function hello() {}
      //   `,
      // },
      // {
      //   name: createTestName(
      //     'should throw an error if',
      //     'the field is an array of nodes',
      //     'a rule evaluates to an UNSET instruction',
      //     'a string index is evaluated to an integer equal to the length of the array of nodes',
      //   ),
      //   input: {
      //     kind: ts.SyntaxKind.SourceFile,
      //     statements: [
      //       {
      //         __instructions: {
      //           rules: [{
      //             instruction: InstructionType.UNSET,
      //             condition: 'name.text="hello"',
      //             index: '$ ~> $map(function($v, $i) { $v.name.text = \'hello\' ? 1 })',
      //           }],
      //         },
      //         kind: ts.SyntaxKind.FunctionDeclaration,
      //         name: {
      //           kind: ts.SyntaxKind.Identifier,
      //           text: 'foo',
      //         },
      //         parameters: [],
      //       },
      //     ],
      //   },
      //   error: {
      //     prototype: TypeError,
      //     message:
      //       'Invalid index for UNSET; must be a valid array index integer; got 1',
      //   },
      //   sourceFileContents: `
      //     function hello() {}
      //   `,
      // },
      // {
      //   name: createTestName(
      //     'should throw an error if',
      //     'the field is an array of nodes',
      //     'a rule evaluates to an UNSET instruction',
      //     'a string index is evaluated to an integer greater than the length of the array of nodes',
      //   ),
      //   input: {
      //     kind: ts.SyntaxKind.SourceFile,
      //     statements: [
      //       {
      //         __instructions: {
      //           rules: [{
      //             instruction: InstructionType.UNSET,
      //             condition: 'name.text="hello"',
      //             index:
      //               '$ ~> $map(function($v, $i) { $v.name.text = \'hello\' ? $i + 6 })',
      //           }],
      //         },
      //         kind: ts.SyntaxKind.FunctionDeclaration,
      //         name: {
      //           kind: ts.SyntaxKind.Identifier,
      //           text: 'hello',
      //         },
      //         parameters: [],
      //       },
      //     ],
      //   },
      //   error: {
      //     prototype: TypeError,
      //     message:
      //       'Invalid index for UNSET, must be integer less than or equal to the array length (1); got 6',
      //   },
      //   sourceFileContents: `
      //     function hello() {}
      //   `,
      // },
    ];

    for (const definition of definitions) {
      blocks.it(definition.name, async (t) => {
        // Arrange
        const project = new tsm.Project();
        const sourceFile = project.createSourceFile(
          `${crypto.randomUUID()}.ts`,
          definition.sourceFileContents,
        );

        if (definition.error) {
          // Act
          const result = assertThrows(() =>
            generateInstructions(sourceFile, definition.input)
          );

          // Assert
          assertIsError(result, definition.error.prototype, definition.error.message);
        } else {
          // Act
          const result = generateInstructions(sourceFile, definition.input);

          // Assert
          await assertSnapshot(t, sanitiseInstructions(result));
        }
      });
    }
  });
});
