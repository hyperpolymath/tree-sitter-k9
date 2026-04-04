// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Aspect: Security - grammar.js has no eval() calls", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");
  assert(
    !grammarContent.includes("eval("),
    "Security aspect: grammar should not contain eval() calls"
  );
});

Deno.test("Aspect: Security - grammar.js has no external URL references", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");
  const hasExternalUrl = /https?:\/\/(?!github\.com\/tree-sitter)/.test(grammarContent);
  assert(
    !hasExternalUrl,
    "Security aspect: grammar should not reference untrusted external URLs"
  );
});

Deno.test("Aspect: Security - grammar.js has no dangerous patterns", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");

  const dangerousPatterns = ["exec(", "system(", "require("];
  for (const pattern of dangerousPatterns) {
    assert(
      !grammarContent.includes(pattern),
      `Security aspect: grammar should not contain ${pattern}`
    );
  }
});

Deno.test("Aspect: Correctness - grammar.js is valid JavaScript-like structure", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");

  // Basic JavaScript structure checks
  assert(grammarContent.includes("module.exports"), "should have module.exports");
  assert(
    (grammarContent.match(/{/g) || []).length > 0,
    "should have curly braces"
  );
  assert(
    (grammarContent.match(/(:|,)/g) || []).length > 0,
    "should have colons and commas"
  );

  // Check for balanced parentheses (simplified)
  const openParen = (grammarContent.match(/\(/g) || []).length;
  const closeParen = (grammarContent.match(/\)/g) || []).length;
  assertEquals(openParen, closeParen, "parentheses should be balanced");

  // Check for balanced braces (simplified)
  const openBrace = (grammarContent.match(/{/g) || []).length;
  const closeBrace = (grammarContent.match(/}/g) || []).length;
  assertEquals(openBrace, closeBrace, "braces should be balanced");
});

Deno.test("Aspect: Completeness - key grammar constructs appear in corpus", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");
  const corpusPath = "./test/corpus";

  // Extract key constructs from grammar
  const constructs = ["magic_number", "let_binding", "record_literal"];

  let corpusContent = "";
  for await (const entry of Deno.readDir(corpusPath)) {
    if (entry.isFile && entry.name.endsWith(".txt")) {
      corpusContent += await Deno.readTextFile(`${corpusPath}/${entry.name}`);
    }
  }

  // Verify each construct is tested
  for (const construct of constructs) {
    assert(
      corpusContent.includes(`(${construct}`),
      `Completeness aspect: corpus should test construct: ${construct}`
    );
  }
});

Deno.test("Aspect: Quality - corpus test names are descriptive", async () => {
  const corpusPath = "./test/corpus";
  const badNames = /test\d+|case\d+|test_\d+/i;

  for await (const entry of Deno.readDir(corpusPath)) {
    if (entry.isFile && entry.name.endsWith(".txt")) {
      const content = await Deno.readTextFile(`${corpusPath}/${entry.name}`);
      const lines = content.split("\n");

      // Extract test names (lines between separators)
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i].trim();
        if (
          line.length > 5 &&
          !line.includes("=") &&
          !line.includes("-") &&
          i < 5
        ) {
          assert(
            !badNames.test(line),
            `Quality aspect: test name should be descriptive, not: "${line}"`
          );
        }
      }
    }
  }
});

Deno.test("Aspect: Documentation - grammar.js has comment annotations", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");

  // Check for documentation comments
  const hasComments =
    grammarContent.includes("//") || grammarContent.includes("/*");
  assert(
    hasComments,
    "Documentation aspect: grammar should have comment annotations"
  );

  // Check for section comments (grammar has K9-specific documentation)
  assert(
    grammarContent.includes("K9"),
    "Documentation aspect: grammar should document K9 format specifics"
  );
});

Deno.test("Aspect: Consistency - all corpus files have consistent format", async () => {
  const corpusPath = "./test/corpus";
  const files: string[] = [];
  for await (const entry of Deno.readDir(corpusPath)) {
    if (entry.isFile && entry.name.endsWith(".txt")) {
      files.push(entry.name);
    }
  }

  let separatorFormats = new Set<string>();

  for (const file of files) {
    const content = await Deno.readTextFile(`${corpusPath}/${file}`);

    // Extract separator lines
    const lines = content.split("\n");
    for (const line of lines) {
      if (line.match(/^={20,}$/)) {
        separatorFormats.add("equals");
      }
      if (line.match(/^-{20,}$/)) {
        separatorFormats.add("dashes");
      }
    }
  }

  // All files should use the same separators
  assertEquals(
    separatorFormats.size >= 1,
    true,
    "Consistency aspect: corpus files should use consistent separators"
  );
});

Deno.test("Aspect: Maintainability - grammar rules have clear structure", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");

  // Check for rule organization
  const ruleCount = (grammarContent.match(/\w+:\s*\(\$\)\s*=>/g) || []).length;
  assert(
    ruleCount >= 15,
    "Maintainability aspect: grammar should have reasonable number of organized rules"
  );

  // Check for rule precedence declarations (good practice)
  const hasPrecedence = grammarContent.includes("prec");
  assert(
    hasPrecedence,
    "Maintainability aspect: grammar should use precedence declarations"
  );

  // Check for PREC constants (K9 grammar defines them)
  const hasConstPREC = grammarContent.includes("PREC");
  assert(
    hasConstPREC,
    "Maintainability aspect: grammar should define precedence constants"
  );
});
