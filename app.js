document.getElementById('file-input').addEventListener('change', handleFileSelect);
document.getElementById('install-btn').addEventListener('click', installApp);

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const code = e.target.result;
    const output = interpretNightx(code);
    document.getElementById('output').textContent = output;
  };
  reader.readAsText(file);
}

function interpretNightx(code) {
  let output = '';
  const lines = code.split('\n');

  for (let line of lines) {
    line = line.trim();

    if (line.startsWith('print(')) {
      const text = line.match(/print"(.*)"/);
      if (text) output += text[1] + '\n';
    } else if (line.includes('str') && line.includes('=')) {
      const [, variable, value] = line.match(/str\s+(\w+)\s*=\s*"(.*)";?/) || [];
      if (variable && value) {
        output += `[String: ${variable} = ${value}]\n`;
      }
    } else if (line.includes('int') && line.includes('=')) {
      const [, variable, value] = line.match(/int\s+(\w+)\s*=\s*(\d+);?/) || [];
      if (variable && value) {
        output += `[Integer: ${variable} = ${value}]\n`;
      }
    } else if (line.includes('void') && line.includes('(')) {
      const [, funcName] = line.match(/void\s+(\w+)/) || [];
      if (funcName) {
        output += `[Function: ${funcName} declared]\n`;
      }
    } else if (line.startsWith('ntx')) {
      output += '[NTX Class Declaration Found]\n';
    } else if (line.startsWith('start_pr')) {
      output += '[Program Entry Point Found]\n';
    }
  }

  return output || 'No valid NIGHTX instructions found.';
}

function installApp() {
  if (window.deferredPrompt) {
    window.deferredPrompt.prompt();
    window.deferredPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('App installed');
      }
      window.deferredPrompt = null;
    });
  }
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  window.deferredPrompt = e;
  document.getElementById('install-btn').style.display = 'inline-block';
});
