// SPDX-License-Identifier: PMPL-1.0-or-later
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>

Deno.bench("read grammar.js", async () => {
  await Deno.readTextFile("grammar.js");
});

Deno.bench("read all corpus files sequentially", async () => {
  const entries: string[] = [];
  for await (const e of Deno.readDir("test/corpus")) {
    entries.push(e.name);
  }

  for (const file of entries) {
    if (file.endsWith(".txt")) {
      await Deno.readTextFile(`test/corpus/${file}`);
    }
  }
});

Deno.bench("list corpus directory entries", async () => {
  const entries = [];
  for await (const e of Deno.readDir("test/corpus")) {
    entries.push(e.name);
  }
});

Deno.bench("parse grammar structure", async () => {
  const content = await Deno.readTextFile("grammar.js");
  // Simulate parsing: extract rule definitions
  const matches = content.match(/(\w+):\s*\(\$\)\s*=>/g);
  if (!matches) {
    throw new Error("grammar parsing failed");
  }
});
