// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Grammar structure - grammar.js exists and is non-empty", async () => {
  const grammarPath = "./grammar.js";
  const stat = await Deno.stat(grammarPath);
  assert(stat.isFile, "grammar.js should be a file");
  assert(stat.size > 0, "grammar.js should be non-empty");
});

Deno.test("Grammar structure - grammar.js has module.exports", async () => {
  const content = await Deno.readTextFile("./grammar.js");
  assert(
    content.includes("module.exports = grammar"),
    "grammar.js should export a grammar object"
  );
});

Deno.test("Grammar structure - grammar has name property", async () => {
  const content = await Deno.readTextFile("./grammar.js");
  assert(content.includes('name: "k9"'), 'grammar should have name: "k9"');
});

Deno.test("Grammar structure - grammar defines expected node types", async () => {
  const content = await Deno.readTextFile("./grammar.js");
  const expectedRules = [
    "document",
    "magic_number",
    "kennel_body",
    "record_literal",
    "let_binding",
    "type_contract",
    "array_literal",
    "identifier",
  ];

  for (const rule of expectedRules) {
    assert(
      content.includes(`${rule}:`),
      `grammar should define rule: ${rule}`
    );
  }
});

Deno.test("Grammar structure - test/corpus/ directory exists", async () => {
  const corpusPath = "./test/corpus";
  const stat = await Deno.stat(corpusPath);
  assert(stat.isDirectory, "test/corpus should be a directory");
});

Deno.test("Grammar structure - corpus test files exist", async () => {
  const corpusPath = "./test/corpus";
  const files = [];
  for await (const entry of Deno.readDir(corpusPath)) {
    if (entry.isFile && entry.name.endsWith(".txt")) {
      files.push(entry.name);
    }
  }

  assertEquals(files.length > 0, true, "corpus directory should have test files");
  assertEquals(files.length >= 3, true, "corpus should have at least 3 test files");
});

Deno.test("Grammar structure - corpus files have valid tree-sitter format", async () => {
  const corpusPath = "./test/corpus";
  const files = [];
  for await (const entry of Deno.readDir(corpusPath)) {
    if (entry.isFile && entry.name.endsWith(".txt")) {
      files.push(entry.name);
    }
  }

  for (const file of files) {
    const content = await Deno.readTextFile(`${corpusPath}/${file}`);
    // Tree-sitter corpus format: test name, ==== separator, input, --- separator, expected output
    assert(
      content.includes("="),
      `corpus file ${file} should have separator markers (=)`
    );
    assert(
      content.includes("-"),
      `corpus file ${file} should have section divider (-)`
    );
  }
});

Deno.test("Grammar structure - SPDX headers in grammar.js", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");
  assert(
    grammarContent.includes("SPDX-License-Identifier: PMPL-1.0-or-later"),
    "grammar.js should have SPDX header"
  );
});

Deno.test("Grammar structure - K9 magic number syntax", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");
  assert(
    grammarContent.includes("magic_number"),
    "grammar should define magic_number rule for K9! syntax"
  );
  assert(
    grammarContent.includes("K9!"),
    "grammar should reference K9! magic number"
  );
});
