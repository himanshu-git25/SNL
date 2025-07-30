// Reference to editor and output area
const editor = document.getElementById('editor');
const output = document.getElementById('output');

// Run NIGHTX code
function runCode() {
  const code = editor.value;
  try {
    const result = interpretNIGHTX(code);
    output.textContent = result || "[No Output]";
    showToast("✅ Code executed!");
  } catch (e) {
    output.textContent = "Error: " + e.message;
    showToast("❌ Runtime Error", true);
  }
}

// Save code as .nx file
function downloadCode() {
  const blob = new Blob([editor.value], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = 'program.nx';
  link.href = URL.createObjectURL(blob);
  link.click();
  showToast("💾 File saved");
}

// Upload .nx file into editor
function uploadCode(event) {
  const file = event.target.files[0];
  if (!file || !file.name.endsWith('.nx')) {
    showToast("⚠️ Invalid file. Only .nx supported", true);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    editor.value = reader.result;
    showToast("📂 Code loaded from file");
  };
  reader.readAsText(file);
}

// Clear editor
function clearEditor() {
  if (confirm("Clear all code?")) {
    editor.value = "";
    output.textContent = "";
    showToast("🧹 Cleared editor");
  }
}

// Auto Save every 5 seconds
setInterval(() => {
  localStorage.setItem("nightx_code", editor.value);
}, 5000);

// Load saved session
window.addEventListener('load', () => {
  const saved = localStorage.getItem("nightx_code");
  if (saved) {
    editor.value = saved;
    showToast("💡 Restored previous session");
  }
});

// Show toast notification
function showToast(msg, isError = false) {
  let toast = document.createElement("div");
  toast.textContent = msg;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.padding = "12px 20px";
  toast.style.background = isError ? "#ff4c4c" : "#00ffc8";
  toast.style.color = "#000";
  toast.style.fontWeight = "bold";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  toast.style.zIndex = 9999;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
function runCode() {
    const code = document.getElementById("editor").value;
    const output = document.getElementById("output");

    try {
        // Convert NIGHTX syntax to JavaScript
        let translated = translateNIGHTX(code);
        output.innerText = eval(translated);
    } catch (e) {
        output.innerText = "Error: " + e.message;
    }
}

function translateNIGHTX(code) {
    let lines = code.split("\n");

    let jsCode = "";

    for (let line of lines) {
        line = line.trim();

        if (line.startsWith("start_pr")) {
            jsCode += "function main() {\n";
        } else if (line.startsWith("int ")) {
            line = line.replace("int", "let");
            jsCode += line + "\n";
        } else if (line.startsWith("str ")) {
            line = line.replace("str", "let");
            jsCode += line + "\n";
        } else if (line.startsWith("void ")) {
            line = line.replace("void", "function");
            jsCode += line + "\n";
        } else if (line.includes("print(")) {
            line = line.replace("print", "console.log");
            jsCode += line + "\n";
        } else if (line === "}") {
            jsCode += "}\n";
        } else {
            jsCode += line + "\n";
        }
    }

    jsCode += "\nmain();";

    return jsCode;
}
