// app.js
// Full NIGHTX Compiler in JavaScript

// Get DOM elements
const editor = document.getElementById("editor");
const output = document.getElementById("output");

// Store current file name
let currentFileName = "untitled.snl";

// Compiler Function
function compileCode() {
  const code = editor.value;
  output.innerText = "Compiling...\n";
  try {
    const compiledOutput = interpretNIGHTX(code);
    output.innerText = compiledOutput;
  } catch (e) {
    output.innerText = `Compilation Error:\n${e.message}`;
  }
}

// Interpreter Function — Simulates Compilation
function interpretNIGHTX(code) {
  let lines = code.split(/\r?\n/);
  let result = "";
  let variables = {};

  if (!lines[0].startsWith("ntx ")) throw new Error("Missing first syntax line: ntx Heyy");
  if (!lines[1].startsWith("prv_nightx")) throw new Error("Missing file signature line: prv_nightx.snl>>>");
  if (!lines[2].startsWith("snl_ntx.just>>")) throw new Error("Missing core kernel loader line: snl_ntx.just>>");
  if (!lines[3].startsWith("start_pr(")) throw new Error("Missing main function declaration");

  let insideBlock = false;

  for (let line of lines) {
    line = line.trim();

    if (line.startsWith("int ") || line.startsWith("float ") || line.startsWith("double ") || line.startsWith("long ")) {
      let [type, rest] = line.split(" ");
      let [name, value] = rest.split("=").map(s => s.trim().replace(/;/g, ""));
      variables[name] = parseFloat(value);
    }

    else if (line.startsWith("str ")) {
      let [_, rest] = line.split(" ", 2);
      let [name, value] = rest.split("=").map(s => s.trim().replace(/;/g, ""));
      variables[name] = value.replace(/\"/g, "");
    }

    else if (line.startsWith("print(")) {
      let inner = line.slice(6, -2);
      inner = inner.replace(/\+/g, "");
      if (variables[inner.trim()] !== undefined) {
        result += `${variables[inner.trim()]}\n`;
      } else {
        result += inner.trim().replace(/\"/g, "") + "\n";
      }
    }

    else if (line.startsWith("void ")) {
      // Ignore functions for now, but in real compiler you'd store them
      continue;
    }

    else if (line.startsWith("if (")) {
      const condition = line.slice(4, -2);
      if (!eval(condition)) {
        result += `Condition failed: ${condition}\n`;
      }
    }

    else if (line.startsWith("while (")) {
      result += `Loop detected (simulated).\n`;
    }

    else if (line === "{") {
      insideBlock = true;
    }

    else if (line === "}") {
      insideBlock = false;
    }
  }

  result += "\nCompiled successfully!";
  return result;
}

// File Operations
function newFile() {
  editor.value = "ntx Heyy\nprv_nightx.snl>>>\nsnl_ntx.just>>\nstart_pr( x.viii[A] )\n{\n\n}";
  output.innerText = "New file created.";
}

function openFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".snl";
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      editor.value = reader.result;
      currentFileName = file.name;
    };
    reader.readAsText(file);
  };
  input.click();
}

function saveFile() {
  const blob = new Blob([editor.value], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = currentFileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadCode() {
  const blob = new Blob([editor.value], { type: "text/plain" });
  const link = document.createElement("a");
  link.download = "nightx_code.snl";
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
          }
