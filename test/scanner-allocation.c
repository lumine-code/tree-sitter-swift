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

int main(void) {
    tree_sitter_swift_external_scanner_create();
    return 0;
}
