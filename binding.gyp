{
  "targets": [
    {
      "target_name": "tree_sitter_k9_binding",
      "dependencies": [
        "<!(node -p \"require('node-addon-api').targets\"):node_addon_api_except",
      ],
      "include_dirs": [
        "src",
      ],
      "sources": [
        "bindings/node/binding.cc",
        "src/parser.c",
      ],
      "cflags_c": [
        "-std=c11",
        "-fvisibility=hidden",
      ],
    }
  ]
}
