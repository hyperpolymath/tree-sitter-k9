; SPDX-License-Identifier: PMPL-1.0-or-later
; Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath)
;
; Syntax highlighting queries for K9 files.

; Comments
(line_comment) @comment
(header_comment) @comment

; Magic number
(magic_number) @keyword.directive

; Keywords
"let" @keyword
"in" @keyword
"if" @keyword.conditional
"then" @keyword.conditional
"else" @keyword.conditional
"fun" @keyword.function
"import" @keyword.import
"=>" @operator

; Trust levels (K9-specific)
(trust_level) @constant.builtin

; Enum tags
(enum_tag) @constant

; Pedigree block
(pedigree_block
  "pedigree" @keyword.type)

; Built-in types
(builtin_type) @type.builtin

; Type contracts
(type_contract
  "|" @operator)

; Record literals
(record_literal
  "{" @punctuation.bracket
  "}" @punctuation.bracket)

; Record fields
(record_field
  (field_name
    (identifier) @property))
(record_field
  (field_name
    (string_literal) @property))

; Let bindings
(let_binding
  (identifier) @variable.definition)

; Function parameters
(function_expression
  (identifier) @variable.parameter)

; Strings
(string_literal) @string
(string_fragment) @string
(multiline_string) @string
(escape_sequence) @string.escape

; String interpolation
(string_interpolation
  "%{" @punctuation.special
  "}" @punctuation.special)

; Numbers
(number_literal) @number

; Booleans
(boolean_literal) @constant.builtin

; Null
(null_literal) @constant.builtin

; Identifiers
(identifier) @variable
(qualified_identifier) @variable

; Kennel-level keys
(kennel_pair
  (identifier) @property)
(kennel_nested_pair
  (identifier) @property)

; Operators
"+" @operator
"-" @operator
"*" @operator
"/" @operator
"++" @operator
"==" @operator
"!=" @operator
"<" @operator
">" @operator
"<=" @operator
">=" @operator
"&&" @operator
"||" @operator
"&" @operator
"|>" @operator
"=" @operator

; Punctuation
":" @punctuation.delimiter
"," @punctuation.delimiter
"." @punctuation.delimiter

; Arrays
(array_literal
  "[" @punctuation.bracket
  "]" @punctuation.bracket)
