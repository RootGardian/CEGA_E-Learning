const fs = require('fs');
try {
  let css = fs.readFileSync('C:/Users/alber/Documents/GitHub/CEGA_E_Learning/frontend/src/components/LessonIA.css', 'utf8');
  css = ':root { --lesson-accent: var(--accent-primary); }\n[data-theme="dark"] { --lesson-accent: #34D399; /* Bright Emerald Green for contrast */ }\n' + css.replace(/var\(--accent-primary\)/g, 'var(--lesson-accent)');
  fs.writeFileSync('C:/Users/alber/Documents/GitHub/CEGA_E_Learning/frontend/src/components/LessonIA.css', css);
  console.log('Colors fixed!');
} catch (e) {
  console.error(e);
}
