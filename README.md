# tree-sitter-swift

Parses Swift source code with Tree-sitter.

Fork of [alex-pinkus/tree-sitter-swift](https://github.com/alex-pinkus/tree-sitter-swift).

This fork maintains the parser used by the editor. Its grammar and corpus originate from alex-pinkus/tree-sitter-swift; the original copyright and license notices remain in the source.

## Features

- **Parsing**: Swift declarations, expressions, concurrency and Swift 6 syntax.
- **Portable output**: builds native parsers and portable WebAssembly.
- **Allocation failure**: stops safely before accessing a missing scanner state.

## Building

Use Node.js 24 or newer and a C compiler. Install dependencies with `npm ci --ignore-scripts`, then run `npm run build` and `npm test`. The tests run the native corpus, compile a portable WebAssembly parser, verify Swift 6 parsing and force scanner allocation failure in both compilation paths.

The Rust and Go bindings are tested on Windows, macOS and Linux with `cargo test` and `go test ./bindings/go`. The generated parser uses Tree-sitter ABI 15. The Go SDK is pinned to upstream commit c9492002f76ed75037e3fe6d3bbabb54ed3e1ff5, which supports that ABI: the latest live release, v0.24.0, supports ABI 14, while the v0.25.0 tag [disappeared upstream](https://github.com/tree-sitter/go-tree-sitter/issues/50). The Go dependency tracks an unreleased upstream revision.

The editor's grammar workflow builds this repository through `lem grammar` and pins its immutable commit in the language package's descriptor.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
