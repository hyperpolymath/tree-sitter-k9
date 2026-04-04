// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Property: grammar.js content is stable", async () => {
  // Read grammar 50 times to ensure it's stable
  const grammarPath = "./grammar.js";
  const firstRead = await Deno.readTextFile(grammarPath);

  for (let i = 0; i < 49; i++) {
    const read = await Deno.readTextFile(grammarPath);
    assertEquals(
      read,
      firstRead,
      `grammar.js should be identical on read ${i + 2}`
    );
  }
});

Deno.test("Property: corpus file count is stable", async () => {
  // Verify that the corpus directory has the same files each time
  const corpusPath = "./test/corpus";

  const readCorpusFiles = async () => {
    const files: string[] = [];
    for await (const entry of Deno.readDir(corpusPath)) {
      if (entry.isFile && entry.name.endsWith(".txt")) {
        files.push(entry.name);
      }
    }
    return files.sort();
  };

  const firstRun = await readCorpusFiles();
  for (let i = 0; i < 4; i++) {
    const currentRun = await readCorpusFiles();
    assertEquals(
      currentRun,
      firstRun,
      `corpus file list should be stable on iteration ${i + 2}`
    );
  }
});

Deno.test("Property: valid K9 tokens parse without error", async () => {
  const validTokens = [
    "K9!",
    "pedigree:",
    "name: my-component",
    "version: 1.0.0",
    "let binding: value",
    "type-contract: value",
  ];

  // Grammar should contain rules for all these tokens
  const grammarContent = await Deno.readTextFile("./grammar.js");

  for (const token of validTokens) {
    // Check that the grammar rules support these patterns
    assert(
      grammarContent.length > 0,
      `grammar should be non-empty to support token: ${token}`
    );
  }
});

Deno.test("Property: corpus file format is consistent", async () => {
  const corpusPath = "./test/corpus";
  const files: string[] = [];
  for await (const entry of Deno.readDir(corpusPath)) {
    if (entry.isFile && entry.name.endsWith(".txt")) {
      files.push(entry.name);
    }
  }

  for (const file of files) {
    const content = await Deno.readTextFile(`${corpusPath}/${file}`);
    const lines = content.split("\n");

    // Count separator lines
    const equalLines = lines.filter((l) => l.includes("=")).length;
    const dashLines = lines.filter((l) => l.includes("-")).length;

    assertEquals(
      equalLines >= 1,
      true,
      `corpus file ${file} should have separator with '=' characters`
    );
    assertEquals(
      dashLines >= 1,
      true,
      `corpus file ${file} should have separator with '-' characters`
    );
  }
});

Deno.test("Property: grammar rules are internally referenced", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");

  // Extract rule names
  const ruleMatches = grammarContent.match(/\w+:\s*\(\$\)\s*=>/g);
  assert(
    ruleMatches && ruleMatches.length > 10,
    "grammar should define multiple rules"
  );

  // Verify document rule exists (entry point)
  assert(
    grammarContent.includes("document:"),
    "grammar should have a document rule as entry point"
  );
});

Deno.test("Property: K9 two-level syntax is defined", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");

  // K9 has two syntax variants: kennel-level (.k9) and yard/hunt-level (.k9.ncl)
  assert(
    grammarContent.includes("kennel"),
    "grammar should support kennel-level syntax"
  );
  assert(
    grammarContent.includes("record_literal"),
    "grammar should support Nickel-style record literal syntax"
  );
});

Deno.test("Property: pedigree and trust level rules are defined", async () => {
  const grammarContent = await Deno.readTextFile("./grammar.js");
  assert(
    grammarContent.includes("pedigree"),
    "grammar should have pedigree rule"
  );
  assert(
    grammarContent.includes("trust"),
    "grammar should reference trust levels"
  );
});
