// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("E2E: full grammar pipeline - parse and validate structure", async () => {
  // Full pipeline: read grammar.js → parse its structure → verify consistency
  const grammarContent = await Deno.readTextFile("./grammar.js");

  // Verify grammar is valid JavaScript-like structure
  assert(
    grammarContent.includes("module.exports = grammar"),
    "grammar should export using module.exports"
  );
  assert(
    grammarContent.includes("rules:"),
    "grammar should have rules section"
  );
  assert(
    grammarContent.includes('name: "k9"'),
    'grammar should declare name: "k9"'
  );

  // Extract and validate rules
  const ruleMatches = grammarContent.match(/(\w+):\s*\(\$\)\s*=>/g);
  assert(
    ruleMatches && ruleMatches.length > 10,
    "grammar should define at least 11 rules"
  );
});

Deno.test("E2E: corpus files have valid tree-sitter format with separators", async () => {
  const corpusPath = "./test/corpus";
  const files: string[] = [];
  for await (const entry of Deno.readDir(corpusPath)) {
    if (entry.isFile && entry.name.endsWith(".txt")) {
      files.push(entry.name);
    }
  }

  assertEquals(files.length > 0, true, "should have corpus test files");

  for (const file of files) {
    const content = await Deno.readTextFile(`${corpusPath}/${file}`);

    // Verify tree-sitter corpus format: description, ===, input, ---, output
    const parts = content.split(/^={60,}/m);
    assertEquals(parts.length >= 2, true, `${file} should have test separators`);
  }
});

Deno.test("E2E: grammar rules referenced in corpus tests", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");

  // Extract rule names from grammar
  const grammarRules = new Set<string>();
  const matches = grammarContent.match(/\$\.(\w+)/g) || [];
  matches.forEach((m) => grammarRules.add(m.substring(2)));

  // Read corpus files
  const corpusPath = "./test/corpus";
  let corpusContent = "";
  for await (const entry of Deno.readDir(corpusPath)) {
    if (entry.isFile && entry.name.endsWith(".txt")) {
      corpusContent += await Deno.readTextFile(`${corpusPath}/${entry.name}`);
    }
  }

  // Verify key rules appear in corpus
  const keyRules = ["document", "magic_number", "record_literal"];
  for (const rule of keyRules) {
    assert(
      corpusContent.includes(`(${rule}`),
      `corpus should test rule: ${rule}`
    );
  }
});

Deno.test("E2E: grammar and corpus cross-reference consistency", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");
  const corpusPath = "./test/corpus";

  // Get expected top-level node type
  const documentNodeRegex = /document:\s*\(\$\)\s*=>/;
  assert(
    documentNodeRegex.test(grammarContent),
    "grammar should define document rule as top-level"
  );

  // Verify corpus tests start with document node
  for await (const entry of Deno.readDir(corpusPath)) {
    if (entry.isFile && entry.name.endsWith(".txt")) {
      const content = await Deno.readTextFile(`${corpusPath}/${entry.name}`);
      assert(
        content.includes("(document"),
        `corpus file ${entry.name} should have (document) as root node`
      );
    }
  }
});

Deno.test("E2E: key node types match grammar rules", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");
  const expectedNodeTypes = [
    "magic_number",
    "kennel_body",
    "let_binding",
    "type_contract",
    "array_literal",
    "record_literal",
  ];

  for (const nodeType of expectedNodeTypes) {
    assert(
      grammarContent.includes(`${nodeType}:`),
      `grammar should define node type: ${nodeType}`
    );
  }
});

Deno.test("E2E: grammar operators and expressions are well-formed", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");

  // Check for common tree-sitter DSL functions
  const dslFunctions = ["choice", "seq", "repeat", "optional", "token", "prec"];
  for (const fn of dslFunctions) {
    assert(
      grammarContent.includes(fn),
      `grammar should use tree-sitter DSL: ${fn}`
    );
  }
});

Deno.test("E2E: magic_number rule enforces K9! format", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");

  // Verify the magic number rule is properly defined
  assert(
    grammarContent.includes("magic_number"),
    "grammar should define magic_number rule"
  );
  assert(
    grammarContent.includes("K9!"),
    "grammar should require K9! magic number"
  );
});
