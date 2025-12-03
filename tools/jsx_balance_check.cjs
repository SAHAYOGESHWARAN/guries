const fs = require('fs');
const path = require('path');
const file = path.resolve(process.argv[2] || 'views/SubServiceMasterView.tsx');
const text = fs.readFileSync(file, 'utf8');
const lines = text.split('\n');
const stack = [];
const selfClosing = /<([A-Za-z][A-Za-z0-9_]*)[^>]*\/\s*>/g;
const openTag = /<([A-Za-z][A-Za-z0-9_]*)\b[^>]*>/g;
const closeTag = /<\/([A-Za-z][A-Za-z0-9_]*)>/g;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // find closing tags first
  let m;
  while ((m = closeTag.exec(line))) {
    const tag = m[1];
    if (stack.length === 0) {
      console.log(`Unmatched closing </${tag}> at line ${i+1}`);
    } else {
      const top = stack[stack.length-1];
      if (top === tag) stack.pop();
      else {
        // try to find matching tag in stack
        const idx = stack.lastIndexOf(tag);
        if (idx === -1) {
          console.log(`Closing </${tag}> at line ${i+1} does not match top <${top}>`);
        } else {
          console.log(`Warning: closing </${tag}> at line ${i+1} closes earlier <${tag}>; popping intermediate ${stack.length-1-idx} tags`);
          stack.splice(idx);
        }
      }
    }
  }
  // find self closing and remove them from open detection
  let openLine = line.replace(selfClosing, '');
  // find opening tags
  while ((m = openTag.exec(openLine))) {
    const tag = m[1];
    stack.push(tag);
  }
}
if (stack.length) {
  console.log('Unclosed tags at EOF:', stack.slice(-20));
} else {
  console.log('No unclosed tags detected');
}
