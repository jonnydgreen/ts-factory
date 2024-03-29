# Examples

## Table of Contents

- [No instruction SET](no-instruction-set)
- [No instruction ADD](no-instruction-add)

## No instruction SET

**AST:**

```jsonc
```

**Input:**

```jsonc
```

## No instruction ADD

**AST:**

```jsonc
```

**Input:**

```jsonc
```

## Generate ADD Instruction if function with name hello not present

**AST:**

```jsonc
{
  "kind": 305, // SourceFile
  "statements": [{
    "kind": 256, // FunctionDeclaration
    "name": {
      "kind": 79, // Identifier
      "text": "foo"
    },
    "modifiers": [
      { "kind": 93 } // ExportKeyword
    ],
    "body": { "statements": [] }
  }]
}
```

**Input:**

```jsonc
{
  "kind": 305, // SourceFile
  "statements": [{
    "kind": 256, // FunctionDeclaration
    "__instructions": {
      // Used to determine whether we should add/set
      // if the rule isn't matched
      "id": "name[escapedText='hello']"
    },
    "name": {
      "kind": 79, // Identifier
      "text": "hello"
    },
    "modifiers": [
      { "kind": 93 } // ExportKeyword
    ],
    "body": { "statements": [] }
  }]
}
```

## Generate REPLACE Instruction if rule condition for REPLACE matches

**AST:**

```jsonc
{
  "kind": 305, // SourceFile
  "statements": [{
    "kind": 256, // FunctionDeclaration
    "name": {
      "kind": 79, // Identifier
      "text": "foo"
    },
    "modifiers": [
      { "kind": 93 } // ExportKeyword
    ],
    "body": { "statements": [] }
  }]
}
```

**Input:**

```jsonc
{
  "kind": 305, // SourceFile
  "statements": [{
    "kind": 256, // FunctionDeclaration
    "__instructions": {
      // Used to determine whether we should add/set
      // if the rule isn't matched
      "id": "name[escapedText='hello']"
    },
    "name": {
      "kind": 79, // Identifier
      "text": "hello"
    },
    "modifiers": [
      { "kind": 93 } // ExportKeyword
    ],
    "body": { "statements": [] }
  }]
}
```
