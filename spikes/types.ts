import { ts } from '../deps.ts';

// TODO: add docstring entries to all of the input types with examples and how they are planned to be used

// TODO: maybe moving different groups to different files to make it more manageable

// TODO: remove when done
const factory = ts.factory;

type MergeIntersections<I> = { [K in keyof I]: I[K] };

type NonFnKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];

type CreateInput<
  TNode extends ts.Node,
  TNodeKeys extends NonFnKeys<TNode>,
  TPartialNodeKeys extends NonFnKeys<TNode> = TNodeKeys,
> = MergeIntersections<
  & { kind: TNode['kind']; leadingTrivia?: LeadingTriviaInput }
  & {
    -readonly [K in TNodeKeys]: MapTSTypes<TNode[K]>;
  }
  & {
    -readonly [K in Exclude<TPartialNodeKeys, TNodeKeys>]?: MapTSTypes<
      TNode[K]
    >;
  }
>;

// deno-fmt-ignore
type MapTSTypes<T> = 
  T extends ts.SyntaxKind ? T :
  T extends ts.NodeArray<infer TNode> ? MapTSTypes<TNode>[] :
  T extends string ? string :
  T extends string | ts.MemberName ? string | MemberNameInput :
  T extends ts.TypeNode ? TypeNodeInput :
  T extends ts.Expression ? ExpressionInput :
  T extends ts.SyntaxKind ? ExpressionInput :
  unknown;

// Definition
export type Definition =
  | SourceFileInput
  | StatementInput
  | ExpressionInput;
// TODO: uncomment when actually populated
// | TypeNodeInput;

// Source File Input
export type Input = SourceFileInput;
export type SourceFileInput = CreateInput<
  ts.SourceFile,
  'statements'
>;

// Groups
export type MemberNameInput = IdentifierInput | PrivateIdentifierInput;

export interface TypeNodeInput {
  kind: ts.SyntaxKind;
}

// Statement Inputs
export type StatementInput = ExpressionStatementInput | ReturnStatementInput;

export type ReturnStatementInput = CreateInput<ts.ReturnStatement, 'expression'>;

export type ExpressionStatementInput = CreateInput<
  ts.ExpressionStatement,
  'expression'
>;

// Expression Inputs
export type ExpressionInput =
  | CallExpressionInput
  | PropertyAccessExpressionInput
  | StringLiteralInput
  | IdentifierInput
  | PrivateIdentifierInput;

export type CallExpressionInput = CreateInput<
  ts.CallExpression,
  'expression',
  'typeArguments' | 'arguments'
>;

export type StringLiteralInput = CreateInput<ts.StringLiteral, 'text'>;

export type IdentifierInput = CreateInput<ts.Identifier, 'text'>;

export type PrivateIdentifierInput = CreateInput<ts.PrivateIdentifier, 'text'>;

export type PropertyAccessExpressionInput = CreateInput<
  ts.PropertyAccessExpression,
  'expression' | 'name'
>;

// Trivia Inputs

export interface SingleLineCommentTriviaInput {
  kind: ts.SyntaxKind.SingleLineCommentTrivia;
  text: string;
}

export interface MultiLineCommentTriviaInput {
  kind: ts.SyntaxKind.MultiLineCommentTrivia;
  text: string;
}

export type LeadingTriviaInput =
  | SingleLineCommentTriviaInput
  | MultiLineCommentTriviaInput;

// ----------------------
// TODO: Types to support
// ----------------------
// Unknown
// EndOfFileToken
// SingleLineCommentTrivia
// MultiLineCommentTrivia
// NewLineTrivia
// WhitespaceTrivia
// ShebangTrivia
// ConflictMarkerTrivia
// NumericLiteral
// BigIntLiteral
// StringLiteral
// JsxText
// JsxTextAllWhiteSpaces
// RegularExpressionLiteral
// NoSubstitutionTemplateLiteral
// TemplateHead
// TemplateMiddle
// TemplateTail
// OpenBraceToken
// CloseBraceToken
// OpenParenToken
// CloseParenToken
// OpenBracketToken
// CloseBracketToken
// DotToken
// DotDotDotToken
// SemicolonToken
// CommaToken
// QuestionDotToken
// LessThanToken
// LessThanSlashToken
// GreaterThanToken
// LessThanEqualsToken
// GreaterThanEqualsToken
// EqualsEqualsToken
// ExclamationEqualsToken
// EqualsEqualsEqualsToken
// ExclamationEqualsEqualsToken
// EqualsGreaterThanToken
// PlusToken
// MinusToken
// AsteriskToken
// AsteriskAsteriskToken
// SlashToken
// PercentToken
// PlusPlusToken
// MinusMinusToken
// LessThanLessThanToken
// GreaterThanGreaterThanToken
// GreaterThanGreaterThanGreaterThanToken
// AmpersandToken
// BarToken
// CaretToken
// ExclamationToken
// TildeToken
// AmpersandAmpersandToken
// BarBarToken
// QuestionToken
// ColonToken
// AtToken
// QuestionQuestionToken
// EqualsToken
// PlusEqualsToken
// MinusEqualsToken
// AsteriskEqualsToken
// AsteriskAsteriskEqualsToken
// SlashEqualsToken
// PercentEqualsToken
// LessThanLessThanEqualsToken
// GreaterThanGreaterThanEqualsToken
// GreaterThanGreaterThanGreaterThanEqualsToken
// AmpersandEqualsToken
// BarEqualsToken
// BarBarEqualsToken
// AmpersandAmpersandEqualsToken
// QuestionQuestionEqualsToken
// CaretEqualsToken
// Identifier
// PrivateIdentifier
// BreakKeyword
// CaseKeyword
// CatchKeyword
// ClassKeyword
// ConstKeyword
// ContinueKeyword
// DebuggerKeyword
// DefaultKeyword
// DeleteKeyword
// DoKeyword
// ElseKeyword
// EnumKeyword
// ExportKeyword
// ExtendsKeyword
// FalseKeyword
// FinallyKeyword
// ForKeyword
// FunctionKeyword
// IfKeyword
// ImportKeyword
// InKeyword
// InstanceOfKeyword
// NewKeyword
// NullKeyword
// ReturnKeyword
// SuperKeyword
// SwitchKeyword
// ThisKeyword
// ThrowKeyword
// TrueKeyword
// TryKeyword
// TypeOfKeyword
// VarKeyword
// VoidKeyword
// WhileKeyword
// WithKeyword
// ImplementsKeyword
// InterfaceKeyword
// LetKeyword
// PackageKeyword
// PrivateKeyword
// ProtectedKeyword
// PublicKeyword
// StaticKeyword
// YieldKeyword
// AbstractKeyword
// AsKeyword
// AssertsKeyword
// AssertKeyword
// AnyKeyword
// AsyncKeyword
// AwaitKeyword
// BooleanKeyword
// ConstructorKeyword
// DeclareKeyword
// GetKeyword
// InferKeyword
// IntrinsicKeyword
// IsKeyword
// KeyOfKeyword
// ModuleKeyword
// NamespaceKeyword
// NeverKeyword
// OutKeyword
// ReadonlyKeyword
// RequireKeyword
// NumberKeyword
// ObjectKeyword
// SetKeyword
// StringKeyword
// SymbolKeyword
// TypeKeyword
// UndefinedKeyword
// UniqueKeyword
// UnknownKeyword
// FromKeyword
// GlobalKeyword
// BigIntKeyword
// OverrideKeyword
// OfKeyword
// QualifiedName
// ComputedPropertyName
// TypeParameter
// Parameter
// Decorator
// PropertySignature
// PropertyDeclaration
// MethodSignature
// MethodDeclaration
// ClassStaticBlockDeclaration
// Constructor
// GetAccessor
// SetAccessor
// CallSignature
// ConstructSignature
// IndexSignature
// TypePredicate
// TypeReference
// FunctionType
// ConstructorType
// TypeQuery
// TypeLiteral
// ArrayType
// TupleType
// OptionalType
// RestType
// UnionType
// IntersectionType
// ConditionalType
// InferType
// ParenthesizedType
// ThisType
// TypeOperator
// IndexedAccessType
// MappedType
// LiteralType
// NamedTupleMember
// TemplateLiteralType
// TemplateLiteralTypeSpan
// ImportType
// ObjectBindingPattern
// ArrayBindingPattern
// BindingElement
// ArrayLiteralExpression
// ObjectLiteralExpression
// PropertyAccessExpression
// ElementAccessExpression
// NewExpression
// TaggedTemplateExpression
// TypeAssertionExpression
// ParenthesizedExpression
// FunctionExpression
// ArrowFunction
// DeleteExpression
// TypeOfExpression
// VoidExpression
// AwaitExpression
// PrefixUnaryExpression
// PostfixUnaryExpression
// BinaryExpression
// ConditionalExpression
// TemplateExpression
// YieldExpression
// SpreadElement
// ClassExpression
// OmittedExpression
// ExpressionWithTypeArguments
// AsExpression
// NonNullExpression
// MetaProperty
// SyntheticExpression
// TemplateSpan
// SemicolonClassElement
// Block
// EmptyStatement
// VariableStatement
// ExpressionStatement
// IfStatement
// DoStatement
// WhileStatement
// ForStatement
// ForInStatement
// ForOfStatement
// ContinueStatement
// BreakStatement
// ReturnStatement
// WithStatement
// SwitchStatement
// LabeledStatement
// ThrowStatement
// TryStatement
// DebuggerStatement
// VariableDeclaration
// VariableDeclarationList
// FunctionDeclaration
// ClassDeclaration
// InterfaceDeclaration
// TypeAliasDeclaration
// EnumDeclaration
// ModuleDeclaration
// ModuleBlock
// CaseBlock
// NamespaceExportDeclaration
// ImportEqualsDeclaration
// ImportDeclaration
// ImportClause
// NamespaceImport
// NamedImports
// ImportSpecifier
// ExportAssignment
// ExportDeclaration
// NamedExports
// NamespaceExport
// ExportSpecifier
// MissingDeclaration
// ExternalModuleReference
// JsxElement
// JsxSelfClosingElement
// JsxOpeningElement
// JsxClosingElement
// JsxFragment
// JsxOpeningFragment
// JsxClosingFragment
// JsxAttribute
// JsxAttributes
// JsxSpreadAttribute
// JsxExpression
// CaseClause
// DefaultClause
// HeritageClause
// CatchClause
// AssertClause
// AssertEntry
// ImportTypeAssertionContainer
// PropertyAssignment
// ShorthandPropertyAssignment
// SpreadAssignment
// EnumMember
// UnparsedPrologue
// UnparsedPrepend
// UnparsedText
// UnparsedInternalText
// UnparsedSyntheticReference
// Bundle
// UnparsedSource
// InputFiles
// JSDocTypeExpression
// JSDocNameReference
// JSDocMemberName
// JSDocAllType
// JSDocUnknownType
// JSDocNullableType
// JSDocNonNullableType
// JSDocOptionalType
// JSDocFunctionType
// JSDocVariadicType
// JSDocNamepathType
// JSDocText
// JSDocTypeLiteral
// JSDocSignature
// JSDocLink
// JSDocLinkCode
// JSDocLinkPlain
// JSDocTag
// JSDocAugmentsTag
// JSDocImplementsTag
// JSDocAuthorTag
// JSDocDeprecatedTag
// JSDocClassTag
// JSDocPublicTag
// JSDocPrivateTag
// JSDocProtectedTag
// JSDocReadonlyTag
// JSDocOverrideTag
// JSDocCallbackTag
// JSDocEnumTag
// JSDocParameterTag
// JSDocReturnTag
// JSDocThisTag
// JSDocTypeTag
// JSDocTemplateTag
// JSDocTypedefTag
// JSDocSeeTag
// JSDocPropertyTag
// SyntaxList
// NotEmittedStatement
// PartiallyEmittedExpression
// CommaListExpression
// MergeDeclarationMarker
// EndOfDeclarationMarker
// SyntheticReferenceExpression
// Count
// FirstAssignment
// LastAssignment
// FirstCompoundAssignment
// LastCompoundAssignment
// FirstReservedWord
// LastReservedWord
// FirstKeyword
// LastKeyword
// FirstFutureReservedWord
// LastFutureReservedWord
// FirstTypeNode
// LastTypeNode
// FirstPunctuation
// LastPunctuation
// FirstToken
// LastToken
// FirstTriviaToken
// LastTriviaToken
// FirstLiteralToken
// LastLiteralToken
// FirstTemplateToken
// LastTemplateToken
// FirstBinaryOperator
// LastBinaryOperator
// FirstStatement
// LastStatement
// FirstNode
// FirstJSDocNode
// LastJSDocNode
// FirstJSDocTagNode
// LastJSDocTagNode
// JSDoc
