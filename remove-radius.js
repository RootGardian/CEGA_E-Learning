const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      const regex = /borderRadius:\s*['"][^'"]+['"]/g;
      if (regex.test(content)) {
        content = content.replace(regex, "borderRadius: '0'");
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Removed border radius in', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'frontend/src'));
