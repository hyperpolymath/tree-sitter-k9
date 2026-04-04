<!-- SPDX-License-Identifier: PMPL-1.0-or-later -->
<!-- Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk> -->
# TOPOLOGY.md — tree-sitter-k9

## Purpose

Tree-sitter grammar for K9 (Self-Validating Components) contractile files. Provides incremental, error-tolerant parsing for syntax highlighting and static analysis in editors (VS Code, Neovim, Helix, etc.) for `.k9` and `.k9.ncl` files.

## Module Map

```
tree-sitter-k9/
├── grammar.js       # Tree-sitter grammar definition
├── src/             # Generated C parser (from grammar.js)
├── bindings/        # Language bindings (Node, Python, etc.)
├── binding.gyp      # Node.js binding build config
└── deno.json        # Deno test config
```

## Data Flow

```
[grammar.js] ──► [tree-sitter generate] ──► [src/ C parser]
                                                   │
                                        [editor / tooling integration]
```
