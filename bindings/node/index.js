// SPDX-License-Identifier: MPL-2.0
// Copyright (c) Jonathan D.A. Jewell <j.d.a.jewell@open.ac.uk>
//
// Node.js binding for tree-sitter-k9.

const root = require("path").join(__dirname, "..", "..");

module.exports =
  typeof process !== "undefined" &&
  typeof process.versions !== "undefined" &&
  typeof process.versions.node !== "undefined"
    ? require("node-gyp-build")(root)
    : null;

try {
  module.exports.nodeTypeInfo = require("../../src/node-types.json");
} catch (_) {}
