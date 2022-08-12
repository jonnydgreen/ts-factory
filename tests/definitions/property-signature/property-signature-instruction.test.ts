import { Definition } from '../../../definitions/definitions.ts';
import { ts, tsm } from '../../../deps.ts';
import { buildNodeFromDefinition } from '../../../instructions/instructions.utils.ts';
import { assertSnapshot, blocks } from '../../../test.deps.ts';
import { createTestName, TestDefinition } from '../../test-utils.ts';

blocks.describe('Property Signature', () => {
  const definitions: TestDefinition<Definition>[] = [
    {
      name: createTestName('should process a basic Property Signature'),
      input: {
        kind: ts.SyntaxKind.PropertySignature,
        name: 'hello',
      },
    },
    {
      name: createTestName(
        'should process a Property Signature with an identifier as the name',
      ),
      input: {
        kind: ts.SyntaxKind.PropertySignature,
        name: { kind: ts.SyntaxKind.Identifier, text: 'hello' },
      },
    },
    {
      name: createTestName('should process a Property Signature with modifiers'),
      input: {
        kind: ts.SyntaxKind.PropertySignature,
        name: 'hello',
        modifiers: [{ kind: ts.SyntaxKind.ReadonlyKeyword }],
      },
    },
    {
      name: createTestName('should process a Property Signature with a type'),
      input: {
        kind: ts.SyntaxKind.PropertySignature,
        name: 'hello',
        type: { kind: ts.SyntaxKind.StringKeyword },
      },
    },
    {
      name: createTestName('should process a Property Signature with a question token'),
      input: {
        kind: ts.SyntaxKind.PropertySignature,
        name: 'hello',
        type: { kind: ts.SyntaxKind.StringKeyword },
        questionToken: { kind: ts.SyntaxKind.QuestionToken },
      },
    },
  ];

  for (const definition of definitions) {
    blocks.it({
      name: definition.name,
      fn: async (t) => {
        // Act
        const node = buildNodeFromDefinition(definition.input);

        // Assert
        await assertSnapshot(t, tsm.printNode(node));
      },
      ignore: definition.ignore,
      only: definition.only,
    });
  }
});
