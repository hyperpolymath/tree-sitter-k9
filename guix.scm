; SPDX-License-Identifier: PMPL-1.0-or-later
;; guix.scm — GNU Guix package definition for tree-sitter-k9
;; Usage: guix shell -f guix.scm

(use-modules (guix packages)
             (guix build-system gnu)
             (guix licenses))

(package
  (name "tree-sitter-k9")
  (version "0.1.0")
  (source #f)
  (build-system gnu-build-system)
  (synopsis "tree-sitter-k9")
  (description "tree-sitter-k9 — part of the hyperpolymath ecosystem.")
  (home-page "https://github.com/hyperpolymath/tree-sitter-k9")
  (license ((@@ (guix licenses) license) "PMPL-1.0-or-later"
             "https://github.com/hyperpolymath/palimpsest-license")))
