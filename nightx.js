function interpretNIGHTX(code) {
  const lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let output = "";
  let variables = {};
  let functions = {};
  let classes = {};
  let objects = {};
  let currentFunction = null;
  let inFunction = false;
  let inClass = false;
  let currentClass = null;

  const evaluate = expr => {
    try {
      for (let varName in variables) {
        expr = expr.replaceAll(varName, variables[varName]);
      }
      return eval(expr);
    } catch {
      return "Invalid expression: " + expr;
    }
  };

  // Validate the first 4 system lines
  const expectedFirstLines = [
    "using NIGHTX",
    "import SYSTEM",
    "define OS = MOBILE",
    "runtime START"
  ];

  for (let i = 0; i < 4; i++) {
    if (lines[i] !== expectedFirstLines[i]) {
      return `Syntax Error in system line ${i + 1}: expected '${expectedFirstLines[i]}'`;
    }
  }

  // Remove those 4 lines from execution
  const execLines = lines.slice(4);

  // First pass: collect functions and classes
  for (let i = 0; i < execLines.length; i++) {
    const line = execLines[i];

    // CLASS
    if (line.startsWith("ntx ")) {
      currentClass = line.split(" ")[1];
      classes[currentClass] = {};
      inClass = true;
      continue;
    }

    if (inClass && line.startsWith("void ")) {
      const methodName = line.split(" ")[1].split("(")[0];
      classes[currentClass][methodName] = [];
      inFunction = true;
      currentFunction = methodName;
      continue;
    }

    if (line === "}") {
      if (inFunction) {
        inFunction = false;
        currentFunction = null;
      } else if (inClass) {
        inClass = false;
        currentClass = null;
      }
      continue;
    }

    if (inFunction && inClass) {
      classes[currentClass][currentFunction].push(line);
    }

    // GLOBAL FUNCTION
    else if (line.startsWith("void ") && !inClass) {
      const fname = line.split(" ")[1].split("(")[0];
      currentFunction = fname;
      functions[fname] = [];
      inFunction = true;
    }

    else if (inFunction && !inClass) {
      functions[currentFunction].push(line);
    }
  }

  // Execute `main()` function
  if (!functions["main"]) return "Error: No 'main' function found!";

  const runBlock = (blockLines) => {
    for (let i = 0; i < blockLines.length; i++) {
      const line = blockLines[i];

      if (line.startsWith("print(")) {
        const inner = line.slice(6, -1);
        output += evaluate(inner) + "\n";
      }

      else if (line.match(/^(int|str|float|double|char|long)\s+/)) {
        const [type, rest] = line.split(" ", 2);
        const [name, value] = rest.split("=").map(x => x.trim());
        variables[name] = evaluate(value ?? "0");
      }

      else if (line.startsWith("if (")) {
        const condition = line.slice(3, -1);
        const trueBlock = [];
        i++;
        while (blockLines[i] !== "}") {
          trueBlock.push(blockLines[i]);
          i++;
        }
        if (evaluate(condition)) {
          runBlock(trueBlock);
        }
      }

      else if (line.startsWith("else if (")) {
        const condition = line.slice(8, -1);
        const trueBlock = [];
        i++;
        while (blockLines[i] !== "}") {
          trueBlock.push(blockLines[i]);
          i++;
        }
        if (evaluate(condition)) {
          runBlock(trueBlock);
        }
      }

      else if (line === "else") {
        const elseBlock = [];
        i++;
        while (blockLines[i] !== "}") {
          elseBlock.push(blockLines[i]);
          i++;
        }
        runBlock(elseBlock);
      }

      else if (line.startsWith("while (")) {
        const condition = line.slice(6, -1);
        const loopBlock = [];
        i++;
        while (blockLines[i] !== "}") {
          loopBlock.push(blockLines[i]);
          i++;
        }
        while (evaluate(condition)) {
          runBlock(loopBlock);
        }
      }

      // Object creation: ClassName obj
      else if (line.match(/^[A-Z][a-zA-Z0-9]*\s+[a-z][a-zA-Z0-9]*$/)) {
        const [className, objName] = line.split(" ");
        if (classes[className]) {
          objects[objName] = { class: className };
        } else {
          output += `Error: Unknown class '${className}'\n`;
        }
      }

      // Method call: obj.method()
      else if (line.includes(".")) {
        const [objName, methodCall] = line.split(".");
        const methodName = methodCall.replace("()", "");
        const obj = objects[objName];
        if (obj && classes[obj.class][methodName]) {
          runBlock(classes[obj.class][methodName]);
        } else {
          output += `Error: Unknown method '${methodName}' for object '${objName}'\n`;
        }
      }

      // Variable assignment
      else if (line.includes("=")) {
        const [name, val] = line.split("=").map(x => x.trim());
        variables[name] = evaluate(val);
      }

      // Function call
      else if (functions[line.replace("()", "")]) {
        runBlock(functions[line.replace("()", "")]);
      }
    }
  };

  runBlock(functions["main"]);
  return output;
}
