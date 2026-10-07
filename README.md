# tree-sitter-swift

Parses Swift source code with Tree-sitter.

This fork maintains the parser used by the editor. Its grammar and corpus originate from alex-pinkus/tree-sitter-swift; the original copyright and license notices remain in the source.

## Features

- **Parsing**: Swift declarations, expressions, concurrency and Swift 6 syntax.
- **Portable output**: builds native parsers and WebAssembly without process or stdio imports.
- **Allocation failure**: stops safely before accessing a missing scanner state.

## Building

Use Node.js 24 or newer and a C compiler. Install dependencies with `npm ci --ignore-scripts`, then run `npm run build` and `npm test`. The tests run the native corpus, compile a portable WebAssembly parser, verify Swift 6 parsing and force scanner allocation failure in both compilation paths.

The editor's grammar workflow builds this repository through `lem grammar` and pins its immutable commit in the language package's descriptor.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
