package tree_sitter_swift_test

import (
	"testing"

	tree_sitter_swift "github.com/alex-pinkus/tree-sitter-swift/bindings/go"
	tree_sitter "github.com/tree-sitter/go-tree-sitter"
)

func TestCanParseBasicFile(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_swift.Language())
	if language == nil {
		t.Fatal("Error loading Swift grammar")
	}
	parser := tree_sitter.NewParser()
	defer parser.Close()
	if err := parser.SetLanguage(language); err != nil {
		t.Fatalf("Error loading Swift parser: %v", err)
	}
	tree := parser.Parse([]byte("_ = \"Hello!\"\n"), nil)
	if tree == nil {
		t.Fatal("Unable to parse Swift source")
	}
	defer tree.Close()
	root := tree.RootNode()
	if root.HasError() {
		t.Fatalf("Swift source contains a parse error: %s", root.ToSexp())
	}
	want := "(source_file (assignment target: (directly_assignable_expression (simple_identifier)) result: (line_string_literal text: (line_str_text))))"
	if got := root.ToSexp(); got != want {
		t.Fatalf("Unexpected Swift parse tree:\n got: %s\nwant: %s", got, want)
	}
}
