function interpretNIGHTX(code) {
    const lines = code.trim().split("\n").map(line => line.trim());

    const requiredHeaders = [
        /^ntx\s+\w+/,
        /^prv_nightx\.snl>>>$/,
        /^snl_ntx\.just>>>$/,
        /^start_pr\s*x\.viiiA\s*$/
    ];

    // Check first 4 lines match required headers
    for (let i = 0; i < 4; i++) {
        if (!requiredHeaders[i].test(lines[i])) {
            return `Syntax Error: Line ${i + 1} doesn't match NIGHTX header format.`;
        }
    }

    let output = "";

    // Now interpret the rest of the code
    const body = lines.slice(4).join("\n");

    try {
        // Basic interpretation for data types and function
        const variableRegex = /^(int|str)\s+(\w+)\s*=\s*(.+);$/;
        const functionRegex = /^void\s+(\w+)(str|int)?\s*(\w*)?\s*{$/;
        const printRegex = /^print(.+);$/;

        const variables = {};
        const functions = {};

        const codeLines = body.split("\n").map(line => line.trim());

        let insideFunction = false;
        let currentFunction = null;
        let functionBody = [];

        for (let line of codeLines) {
            if (line === "") continue;

            if (!insideFunction && variableRegex.test(line)) {
                const [, type, name, valueRaw] = line.match(variableRegex);
                let value = valueRaw;
                if (type === "str") value = value.replace(/^"|"$/g, '');
                else if (type === "int") value = parseInt(value);
                variables[name] = value;

            } else if (!insideFunction && functionRegex.test(line)) {
                insideFunction = true;
                const [, name, paramType, paramName] = line.match(functionRegex);
                currentFunction = { name, paramType, paramName };
                functionBody = [];

            } else if (insideFunction && line === "}") {
                insideFunction = false;
                functions[currentFunction.name] = {
                    paramType: currentFunction.paramType,
                    paramName: currentFunction.paramName,
                    body: [...functionBody]
                };
                currentFunction = null;
                functionBody = [];

            } else if (insideFunction) {
                functionBody.push(line);

            } else if (line.includes("(") && line.includes(")")) {
                // Function call
                const match = line.match(/^(\w+)(.+)?;?$/);
                if (match) {
                    const [, fname, argRaw] = match;
                    const func = functions[fname];
                    if (!func) return `Runtime Error: Function '${fname}' not defined`;

                    const arg = argRaw?.trim().replace(/^"|"$/g, '');
                    const paramName = func.paramName;

                    for (let funcLine of func.body) {
                        const processed = funcLine.replace(new RegExp(paramName, 'g'), `"${arg}"`);
                        if (printRegex.test(processed)) {
                            const [, toPrint] = processed.match(printRegex);
                            const evalOutput = eval(toPrint.replace(/\+/g, '+'));
                            output += evalOutput + "\n";
                        }
                    }
                }
            } else {
                return `Syntax Error at line: "${line}"`;
            }
        }

        return output || "Program executed successfully (no output).";

    } catch (err) {
        return "Interpreter Error: " + err.message;
    }
}
