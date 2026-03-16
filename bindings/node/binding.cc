// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath)
//
// Node.js native binding for tree-sitter-k9.

#include <napi.h>

typedef struct TSLanguage TSLanguage;

extern "C" TSLanguage *tree_sitter_k9();

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports["name"] = Napi::String::New(env, "k9");
  auto language = Napi::External<TSLanguage>::New(env, tree_sitter_k9());
  exports["language"] = language;
  return exports;
}

NODE_API_MODULE(tree_sitter_k9_binding, Init)
