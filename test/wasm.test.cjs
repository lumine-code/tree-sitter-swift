const assert = require("node:assert/strict");
const cp = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { Parser, Language, Query } = require("web-tree-sitter");

const root = path.resolve(__dirname, "..");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "swift-parser-test-"));
const wasm = path.join(temporary, "swift.wasm");
const cli = path.join(
  path.dirname(require.resolve("tree-sitter-cli/package.json")),
  process.platform === "win32" ? "tree-sitter.exe" : "tree-sitter"
);

function run(file, args, options = {}) {
  const result = cp.spawnSync(file, args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    ...options,
  });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return result;
}

run(cli, ["build", "--wasm", "-o", wasm]);

test("builds a portable Wasm parser without process or stdio imports", async () => {
  const bytes = fs.readFileSync(wasm);
  const imports = WebAssembly.Module.imports(new WebAssembly.Module(bytes));
  for (const name of ["abort", "exit", "stderr", "fwrite", "fprintf"]) {
    assert.equal(
      imports.some((item) => item.name === name),
      false,
      name
    );
  }
  await Parser.init();
  const language = await Language.load(bytes);
  const parser = new Parser();
  parser.setLanguage(language);
  const tree = parser.parse(
    "func transfer(_ value: sending Object) -> sending Object { value }\n"
  );
  assert.equal(tree.rootNode.hasError, false, tree.rootNode.toString());
  tree.delete();
  const declaration = parser.parse("class Service { func run() {} }\n");
  for (const name of fs
    .readdirSync(path.join(root, "queries"))
    .filter((name) => name.endsWith(".scm"))) {
    const query = new Query(
      language,
      fs.readFileSync(path.join(root, "queries", name), "utf8")
    );
    const captures = query.captures(declaration.rootNode);
    if (name === "outline.scm")
      assert.ok(captures.some((capture) => capture.node.text === "run"));
    query.delete();
  }
  declaration.delete();
  for (const ending of ["\n", "\r\n"]) {
    const text = [
      "let pattern = #/",
      "    (?<prefix> [A-Z]+ )",
      "    /#",
      'let value = """',
      "  escaped\\",
      "  newline",
      '  """',
      "",
    ].join(ending);
    const multiline = parser.parse(text);
    assert.equal(
      multiline.rootNode.hasError,
      false,
      multiline.rootNode.toString()
    );
    multiline.delete();
  }
  parser.delete();
});

test("fails fast when scanner allocation fails in native and Wasm builds", () => {
  const source = path.join(root, "test", "scanner-allocation.c");
  const cc = process.env.CC || (process.platform === "win32" ? "gcc" : "cc");
  const hasCompiler = !cp.spawnSync(cc, ["--version"], { windowsHide: true })
    .error;
  for (const mode of ["native", "wasm"]) {
    const executable = path.join(
      temporary,
      `allocation-${mode}${process.platform === "win32" ? ".exe" : ""}`
    );
    if (hasCompiler) {
      run(cc, [
        "-std=c11",
        "-Isrc",
        ...(mode === "wasm" ? ["-D__wasm__"] : []),
        source,
        "-o",
        executable,
      ]);
    } else {
      assert.equal(process.platform, "win32", "A C compiler is required");
      const vswhere = path.join(
        process.env["ProgramFiles(x86)"],
        "Microsoft Visual Studio",
        "Installer",
        "vswhere.exe"
      );
      const installation = run(vswhere, [
        "-latest",
        "-products",
        "*",
        "-requires",
        "Microsoft.VisualStudio.Component.VC.Tools.x86.x64",
        "-property",
        "installationPath",
      ]).stdout.trim();
      assert.ok(installation, "Visual Studio C compiler is required");
      const setup = path.join(
        installation,
        "VC",
        "Auxiliary",
        "Build",
        "vcvars64.bat"
      );
      const object = path.join(temporary, `allocation-${mode}.obj`);
      run(process.env.ComSpec || "cmd.exe", [
        "/d",
        "/s",
        "/c",
        `call "${setup}" >nul && cl /nologo /std:c11 /Isrc ${mode === "wasm" ? "/D__wasm__ " : ""}"${source}" /Fe:"${executable}" /Fo:"${object}"`,
      ]);
    }
    const result = cp.spawnSync(executable, [], { windowsHide: true });
    assert.equal(result.error, undefined);
    assert.equal(
      result.status,
      86,
      `${mode} must terminate before returning a null scanner`
    );
  }
});
