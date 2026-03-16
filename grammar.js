// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
//
// tree-sitter-k9 — Tree-sitter grammar for the K9 format.
//
// K9 has two syntax variants:
//   1. Kennel level (.k9)     — YAML-like with key: value pairs, pedigree blocks
//   2. Yard/Hunt level (.k9.ncl) — Nickel syntax with let bindings, contracts,
//      type annotations, record literals, and recipe blocks
//
// Both variants share:
//   - Magic number: K9! (first line)
//   - Trust levels: kennel, yard, hunt (as enum tags 'Kennel, 'Yard, 'Hunt)
//   - Pedigree blocks: name, version, description, security_level
//
// This grammar handles the full K9 format including the Nickel-derived syntax.

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Precedence levels for expression parsing (higher = tighter binding).
const PREC = {
  OR: 1,
  AND: 2,
  COMPARE: 3,
  ADD: 4,
  CONCAT: 4,
  MUL: 5,
  MERGE: 6,
  PIPE: 0,
  APP: 7,
};

module.exports = grammar({
  name: "k9",

  extras: ($) => [/\s/, $.line_comment],

  word: ($) => $.identifier,

  conflicts: ($) => [],

  rules: {
    // ---------------------------------------------------------------------------
    // Top-level document: begins with the K9! magic number, followed by optional
    // comment headers, then the document body.
    // ---------------------------------------------------------------------------
    document: ($) =>
      seq(
        $.magic_number,
        optional($.header_block),
        choice(
          $.record_literal,      // Nickel-style (.k9.ncl)
          $.kennel_body,         // YAML-like (.k9)
        ),
      ),

    // ---------------------------------------------------------------------------
    // Magic number: K9! — mandatory first line identifying the file as K9 format.
    // ---------------------------------------------------------------------------
    magic_number: ($) => /K9!\n/,

    // ---------------------------------------------------------------------------
    // Header block: comment lines after the magic number, before document body.
    // Includes SPDX headers, security level annotations, and documentation.
    // ---------------------------------------------------------------------------
    header_block: ($) =>
      prec.right(repeat1($.header_comment)),

    header_comment: ($) => token(prec(2, /#[^\n]*\n/)),

    // =========================================================================
    // KENNEL-LEVEL SYNTAX (.k9) — YAML-like key-value format
    // =========================================================================

    // ---------------------------------------------------------------------------
    // Kennel body: flat or nested key-value pairs, pedigree blocks, and
    // list items in YAML-like syntax.
    // ---------------------------------------------------------------------------
    kennel_body: ($) =>
      repeat1($._kennel_entry),

    _kennel_entry: ($) =>
      choice(
        $.pedigree_block,
        $.kennel_pair,
        $.kennel_list_item,
      ),

    // ---------------------------------------------------------------------------
    // Pedigree block: structured metadata block declaring component identity.
    //   pedigree:
    //     name: my-component
    //     version: 1.0.0
    //     description: A brief description
    //     security_level: kennel
    // ---------------------------------------------------------------------------
    pedigree_block: ($) =>
      prec.right(seq(
        "pedigree",
        ":",
        /\n/,
        repeat1($.kennel_nested_pair),
      )),

    // ---------------------------------------------------------------------------
    // Kennel key-value pair: simple key: value at the top level.
    // ---------------------------------------------------------------------------
    kennel_pair: ($) =>
      seq(
        $.identifier,
        ":",
        /[ \t]+/,
        $.kennel_value,
        /\n/,
      ),

    // ---------------------------------------------------------------------------
    // Kennel nested pair: indented key: value within a block.
    // ---------------------------------------------------------------------------
    kennel_nested_pair: ($) =>
      seq(
        /[ \t]+/,
        $.identifier,
        ":",
        /[ \t]+/,
        $.kennel_value,
        /\n/,
      ),

    // ---------------------------------------------------------------------------
    // Kennel value: value types in YAML-like syntax.
    // ---------------------------------------------------------------------------
    kennel_value: ($) =>
      choice(
        $.string_literal,
        $.number_literal,
        $.boolean_literal,
        $.trust_level,
        $.kennel_unquoted,
      ),

    // ---------------------------------------------------------------------------
    // Kennel list item: YAML-style list entry.
    // ---------------------------------------------------------------------------
    kennel_list_item: ($) =>
      seq(
        optional(/[ \t]+/),
        "-",
        /[ \t]+/,
        $.kennel_value,
        /\n/,
      ),

    // ---------------------------------------------------------------------------
    // Kennel unquoted string: bare string value continuing to end of line.
    // ---------------------------------------------------------------------------
    kennel_unquoted: ($) => /[^\n#"'\[\]{}]+/,

    // =========================================================================
    // YARD/HUNT-LEVEL SYNTAX (.k9.ncl) — Nickel-derived format
    // =========================================================================

    // ---------------------------------------------------------------------------
    // Record literal: Nickel-style { key = value, ... } blocks.
    // The primary structural element of .k9.ncl files.
    // ---------------------------------------------------------------------------
    record_literal: ($) =>
      seq(
        "{",
        optional($.record_body),
        "}",
      ),

    record_body: ($) =>
      seq(
        $._record_entry,
        repeat(seq(optional(","), $._record_entry)),
        optional(","),
      ),

    _record_entry: ($) =>
      choice(
        $.record_field,
        $.let_binding,
      ),

    // ---------------------------------------------------------------------------
    // Record field: key = value assignment within a record.
    // Supports optional type contracts (| Type) and default values.
    //   name = "my-component",
    //   port | Num = 8080,
    //   target_dir | String | std.string.NonEmpty = "/tmp",
    // ---------------------------------------------------------------------------
    record_field: ($) =>
      seq(
        $.field_name,
        repeat($.type_contract),
        optional(seq("=", $._expression)),
      ),

    // ---------------------------------------------------------------------------
    // Field name: identifier or quoted string used as a record key.
    // ---------------------------------------------------------------------------
    field_name: ($) =>
      choice(
        $.identifier,
        $.string_literal,
      ),

    // ---------------------------------------------------------------------------
    // Type contract: Nickel type annotation using | operator.
    //   | String
    //   | Num
    //   | Bool
    //   | std.string.NonEmpty
    // ---------------------------------------------------------------------------
    type_contract: ($) =>
      seq("|", $.type_expression),

    // ---------------------------------------------------------------------------
    // Type expression: a type name, possibly qualified with module paths.
    // ---------------------------------------------------------------------------
    type_expression: ($) =>
      choice(
        $.builtin_type,
        $.qualified_identifier,
        $.identifier,
      ),

    // ---------------------------------------------------------------------------
    // Built-in types: Nickel primitive types.
    // ---------------------------------------------------------------------------
    builtin_type: ($) =>
      choice("String", "Num", "Bool", "Dyn"),

    // ---------------------------------------------------------------------------
    // Let binding: Nickel let expression for local definitions.
    //   let name = "value" in
    //   let config = { ... } in
    // ---------------------------------------------------------------------------
    let_binding: ($) =>
      seq(
        "let",
        $.identifier,
        optional($.type_contract),
        "=",
        $._expression,
        optional("in"),
      ),

    // ---------------------------------------------------------------------------
    // Expression: any value or computation in the Nickel dialect.
    // Uses explicit precedence levels to avoid ambiguity.
    // ---------------------------------------------------------------------------
    _expression: ($) =>
      choice(
        $._primary_expression,
        $.binary_expression,
        $.if_expression,
        $.function_expression,
        $.import_expression,
      ),

    // ---------------------------------------------------------------------------
    // Primary expression: atomic or grouped expressions.
    // ---------------------------------------------------------------------------
    _primary_expression: ($) =>
      choice(
        $.string_literal,
        $.number_literal,
        $.boolean_literal,
        $.null_literal,
        $.trust_level,
        $.enum_tag,
        $.identifier,
        $.qualified_identifier,
        $.record_literal,
        $.array_literal,
        $.multiline_string,
        $.parenthesized_expression,
      ),

    // ---------------------------------------------------------------------------
    // Parenthesized expression: (expr)
    // ---------------------------------------------------------------------------
    parenthesized_expression: ($) =>
      seq("(", $._expression, ")"),

    // ---------------------------------------------------------------------------
    // Binary expression: Nickel operators with explicit precedence.
    // ---------------------------------------------------------------------------
    binary_expression: ($) =>
      choice(
        prec.left(PREC.OR, seq($._expression, "||", $._expression)),
        prec.left(PREC.AND, seq($._expression, "&&", $._expression)),
        prec.left(PREC.COMPARE, seq($._expression, "==", $._expression)),
        prec.left(PREC.COMPARE, seq($._expression, "!=", $._expression)),
        prec.left(PREC.COMPARE, seq($._expression, "<", $._expression)),
        prec.left(PREC.COMPARE, seq($._expression, ">", $._expression)),
        prec.left(PREC.COMPARE, seq($._expression, "<=", $._expression)),
        prec.left(PREC.COMPARE, seq($._expression, ">=", $._expression)),
        prec.left(PREC.ADD, seq($._expression, "+", $._expression)),
        prec.left(PREC.ADD, seq($._expression, "-", $._expression)),
        prec.left(PREC.CONCAT, seq($._expression, "++", $._expression)),
        prec.left(PREC.MUL, seq($._expression, "*", $._expression)),
        prec.left(PREC.MUL, seq($._expression, "/", $._expression)),
        prec.left(PREC.MERGE, seq($._expression, "&", $._expression)),
        prec.left(PREC.PIPE, seq($._expression, "|>", $._expression)),
      ),

    // ---------------------------------------------------------------------------
    // If expression: Nickel conditional.
    //   if condition then expr1 else expr2
    // ---------------------------------------------------------------------------
    if_expression: ($) =>
      prec.right(seq(
        "if",
        $._expression,
        "then",
        $._expression,
        optional(seq("else", $._expression)),
      )),

    // ---------------------------------------------------------------------------
    // Function expression: Nickel lambda syntax.
    //   fun x => x + 1
    // ---------------------------------------------------------------------------
    function_expression: ($) =>
      prec.right(seq(
        "fun",
        repeat1($.identifier),
        "=>",
        $._expression,
      )),

    // ---------------------------------------------------------------------------
    // Import expression: Nickel import statement.
    //   import "path/to/file.ncl"
    // ---------------------------------------------------------------------------
    import_expression: ($) =>
      seq("import", $.string_literal),

    // ---------------------------------------------------------------------------
    // String literal: double or single-quoted strings with escape sequences.
    // ---------------------------------------------------------------------------
    string_literal: ($) =>
      choice(
        seq('"', optional($.string_content), '"'),
      ),

    string_content: ($) =>
      repeat1(
        choice(
          $.string_fragment,
          $.escape_sequence,
          $.string_interpolation,
        ),
      ),

    string_fragment: ($) => token.immediate(prec(1, /[^"\\%]+/)),
    escape_sequence: ($) => token.immediate(/\\[nrt\\'"0]/),

    // ---------------------------------------------------------------------------
    // String interpolation: %{expression} within double-quoted strings.
    //   "mkdir -p %{config.target_dir}"
    // ---------------------------------------------------------------------------
    string_interpolation: ($) =>
      seq(
        token.immediate("%{"),
        $._expression,
        "}",
      ),

    // ---------------------------------------------------------------------------
    // Multiline string: Nickel m%"..."% syntax for heredoc-like strings.
    //   m%"
    //     This is a multiline string.
    //   "%
    // ---------------------------------------------------------------------------
    multiline_string: ($) =>
      seq(
        'm%"',
        optional($.multiline_content),
        '"%',
      ),

    multiline_content: ($) => /[^"]+/,

    // ---------------------------------------------------------------------------
    // Number literal: integer or floating-point number.
    // ---------------------------------------------------------------------------
    number_literal: ($) => /\-?[0-9]+(\.[0-9]+)?/,

    // ---------------------------------------------------------------------------
    // Boolean literal: true or false.
    // ---------------------------------------------------------------------------
    boolean_literal: ($) => choice("true", "false"),

    // ---------------------------------------------------------------------------
    // Null literal: null value.
    // ---------------------------------------------------------------------------
    null_literal: ($) => "null",

    // ---------------------------------------------------------------------------
    // Trust level: K9 security tier enum tags.
    // Kennel = data-only, Yard = validated, Hunt = full execution.
    // Uses Nickel enum tag syntax: 'Name
    // ---------------------------------------------------------------------------
    trust_level: ($) =>
      token(prec(2, choice(
        "'Kennel",
        "'Yard",
        "'Hunt",
      ))),

    // ---------------------------------------------------------------------------
    // Enum tag: generic Nickel enum variant (beyond trust levels).
    // ---------------------------------------------------------------------------
    enum_tag: ($) => token(prec(1, /\'[A-Z][a-zA-Z0-9_]*/)),

    // ---------------------------------------------------------------------------
    // Array literal: Nickel array syntax.
    //   ["item1", "item2", "item3"]
    // ---------------------------------------------------------------------------
    array_literal: ($) =>
      seq(
        "[",
        optional(
          seq(
            $._expression,
            repeat(seq(",", $._expression)),
            optional(","),
          ),
        ),
        "]",
      ),

    // ---------------------------------------------------------------------------
    // Identifier: variable or field name.
    // ---------------------------------------------------------------------------
    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_\-]*/,

    // ---------------------------------------------------------------------------
    // Qualified identifier: dotted path for module access.
    //   std.string.NonEmpty
    //   config.target_dir
    // ---------------------------------------------------------------------------
    qualified_identifier: ($) =>
      prec.left(PREC.APP, seq(
        $.identifier,
        repeat1(seq(".", $.identifier)),
      )),

    // ---------------------------------------------------------------------------
    // Line comment: # to end of line.
    // ---------------------------------------------------------------------------
    line_comment: ($) => token(prec(-1, /#[^\n]*/)),
  },
});
