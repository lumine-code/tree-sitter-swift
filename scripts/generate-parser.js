const cp = require("node:child_process");
const path = require("node:path");

const cli = path.join(
  path.dirname(require.resolve("tree-sitter-cli/package.json")),
  process.platform === "win32" ? "tree-sitter.exe" : "tree-sitter"
);

cp.execFileSync(cli, ["generate"], {
  cwd: path.resolve(__dirname, ".."),
  stdio: "inherit",
  windowsHide: true,
});
