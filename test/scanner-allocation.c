#include <stddef.h>
#include <stdlib.h>

static void *fail_calloc(size_t count, size_t size) {
    (void)count;
    (void)size;
    return NULL;
}

static void expected_allocation_failure(void) {
    exit(86);
}

#define calloc fail_calloc
#define abort expected_allocation_failure
#define __builtin_trap expected_allocation_failure
#include "../src/scanner.c"

static const char *directive_input;
static size_t directive_offset;

static void advance_directive(TSLexer *lexer, bool skip) {
    (void)skip;
    // A full directive at EOF must not leave its terminator as a candidate:
    // advancing again would let the scanner read beyond the directive string.
    if (directive_input[directive_offset] == '\0') {
        exit(87);
    }
    lexer->lookahead = directive_input[++directive_offset];
}

static void mark_directive_end(TSLexer *lexer) {
    (void)lexer;
}

static void check_directives_at_eof(void) {
    const char *inputs[] = {"if", "elseif", "else", "endif"};
    for (size_t index = 0; index < 4; index++) {
        directive_input = inputs[index];
        directive_offset = 0;
        TSLexer lexer = {0};
        lexer.lookahead = directive_input[0];
        lexer.advance = advance_directive;
        lexer.mark_end = mark_directive_end;
        if (find_possible_compiler_directive(&lexer) != DIRECTIVE_SYMBOLS[index]) {
            exit(88);
        }
    }
}

int main(void) {
    check_directives_at_eof();
    tree_sitter_swift_external_scanner_create();
    return 0;
}
