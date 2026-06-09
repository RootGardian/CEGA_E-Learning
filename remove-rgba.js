const fs = require('fs');
const file = 'c:/Users/alber/Documents/GitHub/CEGA_E_Learning/frontend/src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/backgroundColor:\s*'rgba\([^)]+\)'/g, "backgroundColor: 'transparent', border: '1px solid var(--border-color)'");

fs.writeFileSync(file, content);
console.log('Replaced rgba backgrounds in Dashboard');
