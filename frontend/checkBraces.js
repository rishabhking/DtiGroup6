const fs = require('fs');

const filePath = 'src/pages/Duel.js';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let braceCount = 0;
let inComponent = false;
let componentStartLine = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  // Check if this is the start of the Duel component
  if (line.includes('const Duel = () => {')) {
    inComponent = true;
    componentStartLine = lineNum;
    console.log(`Component starts at line ${lineNum}`);
  }
  
  if (inComponent) {
    // Count braces in this line
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    
    braceCount += openBraces - closeBraces;
    
    if (openBraces > 0 || closeBraces > 0) {
      console.log(`Line ${lineNum}: ${line.trim()} | Braces: +${openBraces} -${closeBraces} | Total: ${braceCount}`);
    }
    
    // If we're back to 0 braces, the component has ended
    if (braceCount === 0 && lineNum > componentStartLine) {
      console.log(`Component ends at line ${lineNum}`);
      break;
    }
  }
}

console.log(`Final brace count: ${braceCount}`);
