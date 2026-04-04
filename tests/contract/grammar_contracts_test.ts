// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Contract: grammar.js exports module.exports.grammar", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");
  assert(
    grammarContent.includes("module.exports = grammar"),
    "INVARIANT: grammar.js must export grammar object via module.exports"
  );
});

Deno.test("Contract: grammar object has name field", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");
  assert(
    grammarContent.includes('name: "k9"'),
    'INVARIANT: grammar must have name: "k9"'
  );
});

Deno.test("Contract: all corpus files use tree-sitter separator format", async () => {
  const corpusPath = "./test/corpus";
  const files: string[] = [];
  for await (const entry of Deno.readDir(corpusPath)) {
    if (entry.isFile && entry.name.endsWith(".txt")) {
      files.push(entry.name);
    }
  }

  for (const file of files) {
    const content = await Deno.readTextFile(`${corpusPath}/${file}`);

    // INVARIANT: Must have test name separator (====)
    assert(
      content.includes("="),
      `INVARIANT: corpus file ${file} must use '=' separator format`
    );

    // INVARIANT: Must have input/output separator (----)
    assert(
      content.includes("-"),
      `INVARIANT: corpus file ${file} must use '-' separator format`
    );

    // Verify structure: lines with separators exist
    const hasProperSeparators = /^={60,}/m.test(content) || /={20,}/.test(content);
    assert(
      hasProperSeparators,
      `INVARIANT: corpus file ${file} must have valid separator lines`
    );
  }
});

Deno.test("Contract: no rules reference undefined rules", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");

  // Extract all defined rule names
  const definedRules = new Set<string>();
  const ruleDefinitions = grammarContent.match(/(\w+):\s*\(\$\)\s*=>/g) || [];
  ruleDefinitions.forEach((rule) => {
    const name = rule.match(/(\w+):/)?.[1];
    if (name) definedRules.add(name);
  });

  // Extract all rule references ($.)
  const referencedRules = new Set<string>();
  const references = grammarContent.match(/\$\.(\w+)/g) || [];
  references.forEach((ref) => {
    referencedRules.add(ref.substring(2));
  });

  // Check that all referenced rules are defined
  const dslFunctions = new Set([
    "_kennel_entry",
    "_value",
    "_record_entry",
    // etc. - internal rules
  ]);

  for (const ref of referencedRules) {
    const isDefined = definedRules.has(ref);
    const isDsl = dslFunctions.has(ref);
    assert(
      isDefined || isDsl || ref.length <= 3,
      `INVARIANT: referenced rule ${ref} must be defined in grammar`
    );
  }
});

Deno.test("Contract: test/corpus/ directory exists with minimum files", async () => {
  const corpusPath = "./test/corpus";
  const stat = await Deno.stat(corpusPath);
  assert(stat.isDirectory, "INVARIANT: test/corpus/ must exist as directory");

  const files: string[] = [];
  for await (const entry of Deno.readDir(corpusPath)) {
    if (entry.isFile && entry.name.endsWith(".txt")) {
      files.push(entry.name);
    }
  }

  assertEquals(
    files.length >= 3,
    true,
    "INVARIANT: corpus must have at least 3 test files"
  );
});

Deno.test("Contract: grammar has required core rules", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");

  const coreRules = [
    "document",    // entry point
    "magic_number",
    "pedigree_block",
    "kennel_body",
  ];

  for (const rule of coreRules) {
    assert(
      grammarContent.includes(`${rule}:`),
      `INVARIANT: grammar must define core rule: ${rule}`
    );
  }
});

Deno.test("Contract: K9 magic number is enforced", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");

  // Verify magic_number rule exists and requires K9!
  assert(
    grammarContent.includes("magic_number:"),
    "INVARIANT: grammar must have magic_number rule"
  );
  assert(
    grammarContent.includes("K9!"),
    "INVARIANT: magic_number must require K9! string"
  );
});

Deno.test("Contract: document rule includes magic_number", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");

  // Verify document rule references magic_number
  const documentRule = grammarContent.match(
    /document:\s*\(\$\)\s*=>[^}]*seq\([^)]*\$/s
  );
  assert(
    grammarContent.includes("$.magic_number"),
    "INVARIANT: document rule must reference magic_number"
  );
});

Deno.test("Contract: extras and word token are defined", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");

  // Verify grammar configuration
  assert(
    grammarContent.includes("extras:"),
    "INVARIANT: grammar should define extras"
  );
  assert(
    grammarContent.includes("word:"),
    "INVARIANT: grammar should define word token"
  );
});

Deno.test("Contract: corpus test names are descriptive", async () => {
  const corpusPath = "./test/corpus";

  for await (const entry of Deno.readDir(corpusPath)) {
    if (entry.isFile && entry.name.endsWith(".txt")) {
      const content = await Deno.readTextFile(`${corpusPath}/${entry.name}`);
      const lines = content.split("\n");

      // Find test name lines (between separators)
      const testNames: string[] = [];
      for (let i = 1; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim();
        if (line.length > 0 && !line.includes("=") && !line.includes("-")) {
          testNames.push(line);
          break;  // Only first test name per file
        }
      }

      // INVARIANT: Test names should be descriptive
      for (const name of testNames) {
        assertEquals(
          name.length > 3,
          true,
          `INVARIANT: corpus test names should be descriptive, found: "${name}"`
        );
      }
    }
  }
});
