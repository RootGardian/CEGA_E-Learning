const fs = require('fs');

try {
  let raw = fs.readFileSync('C:/Users/alber/Downloads/cours_ia_geosciences_s1_1.html', 'utf8');
  
  // Extract content between <style> and </style>
  const styleStart = raw.indexOf('<style>');
  const styleEnd = raw.indexOf('</style>');
  
  if (styleStart === -1 || styleEnd === -1) throw new Error('Style not found');
  
  let css = raw.substring(styleStart + 7, styleEnd);
  
  // Remove :root declarations as we use the main app's root
  css = css.replace(/:root\s*{[^}]*}/g, '');
  
  // Replace variables with our app's theme variables
  // The original has:
  // --bg: #0B0F1A; --bg2: #111726; --card: #1A2236; 
  // --text: #E8EDF5; --muted: #7A8BA8;
  // --accent: #4F8EF7; (blue) -> we want --accent-primary (green)
  // --accent2: #2ECC9A; (teal) -> we want --accent-primary
  // --accent3: #F5A623; (yellow) -> we want warning color
  // --accent4: #E05C7B; (red/pink) -> we want error color
  
  css = css.replace(/var\(--bg\)/g, 'var(--bg-primary)');
  css = css.replace(/var\(--bg2\)/g, 'var(--bg-secondary)');
  css = css.replace(/var\(--bg3\)/g, 'var(--bg-secondary)');
  css = css.replace(/var\(--card\)/g, 'var(--bg-secondary)');
  css = css.replace(/var\(--card2\)/g, 'var(--bg-secondary)');
  css = css.replace(/var\(--border\)/g, 'var(--border-color)');
  css = css.replace(/var\(--border2\)/g, 'var(--border-color)');
  css = css.replace(/var\(--text\)/g, 'var(--text-primary)');
  css = css.replace(/var\(--muted\)/g, 'var(--text-secondary)');
  css = css.replace(/var\(--muted2\)/g, 'var(--text-secondary)');
  
  css = css.replace(/var\(--accent\)/g, 'var(--accent-primary)');
  css = css.replace(/var\(--accent2\)/g, 'var(--accent-primary)');
  css = css.replace(/var\(--accent3\)/g, '#F5A623'); // keep yellow for warnings
  css = css.replace(/var\(--accent4\)/g, 'var(--error)');
  css = css.replace(/var\(--accent5\)/g, 'var(--accent-primary)');
  
  // Remove html and body tags from CSS so it doesn't break the global app layout
  css = css.replace(/html\s*{[^}]*}/g, '');
  css = css.replace(/body\s*{[^}]*}/g, '');
  
  // Remove sidebar styles since we removed the sidebar
  css = css.replace(/\.sidebar\s*{[^}]*}/g, '');
  css = css.replace(/\.sidebar-logo\s*{[^}]*}/g, '');
  css = css.replace(/\.sidebar-logo[\s\S]*?\.nav-item\.done\s*{[^}]*}/g, '');
  
  // Remove .main margin-left
  css = css.replace(/\.main\s*{[^}]*}/g, '.main { flex: 1; max-width: 100%; padding: 0; }');
  
  // Add CSS for the tabs container we injected
  css += `
.lesson-tabs-container {
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
}

.lesson-tabs {
  display: flex;
  gap: 1rem;
  padding-bottom: 0.5rem;
  min-width: max-content;
}

.lesson-tab {
  background: transparent;
  border: none;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.lesson-tab:hover {
  color: var(--text-primary);
}

.lesson-tab.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

.interactive-lesson .section {
  display: block; /* Overrides the original HTML's display: none */
}

/* Fix some spacing since we removed sidebar */
.hero {
  margin-top: 1rem;
}
`;

  fs.writeFileSync('C:/Users/alber/Documents/GitHub/CEGA_E_Learning/frontend/src/components/LessonIA.css', css);
  console.log('CSS generated!');
} catch (e) {
  console.error(e);
}
