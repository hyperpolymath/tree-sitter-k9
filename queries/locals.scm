; SPDX-License-Identifier: MPL-2.0
; Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath)
;
; Locals queries for K9 files.
; Defines scoping for let bindings, record blocks, and function parameters.

(record_literal) @local.scope

(let_binding
  (identifier) @local.definition)

(function_expression
  (identifier) @local.definition)

(record_field
  (field_name) @local.definition)
