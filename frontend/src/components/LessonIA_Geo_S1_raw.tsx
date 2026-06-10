<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>IA Appliquée aux Géosciences — Séance 1</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0B0F1A;
    --bg2: #111726;
    --bg3: #181F30;
    --card: #1A2236;
    --card2: #1E2840;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.13);
    --text: #E8EDF5;
    --muted: #7A8BA8;
    --muted2: #9BAFC8;
    --accent: #4F8EF7;
    --accent2: #2ECC9A;
    --accent3: #F5A623;
    --accent4: #E05C7B;
    --accent5: #A78BFA;
    --font-display: 'Space Grotesk', sans-serif;
    --font-body: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --radius: 10px;
    --radius-lg: 16px;
    --sidebar: 260px;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text);
    font-size: 15px;
    line-height: 1.7;
    display: flex;
    min-height: 100vh;
  }

  /* ─── SIDEBAR ─── */
  .sidebar {
    width: var(--sidebar);
    background: var(--bg2);
    border-right: 1px solid var(--border);
    position: fixed;
    top: 0; left: 0; bottom: 0;
    overflow-y: auto;
    z-index: 100;
    display: flex;
    flex-direction: column;
  }

  .sidebar-logo {
    padding: 24px 20px 16px;
    border-bottom: 1px solid var(--border);
  }

  .sidebar-logo .tag {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--accent2);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .sidebar-logo h1 {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.3;
  }

  .sidebar-progress {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
  }

  .progress-bar-wrap {
    background: var(--border);
    border-radius: 99px;
    height: 4px;
    margin-top: 8px;
  }

  .progress-bar-fill {
    height: 4px;
    border-radius: 99px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    width: 0%;
    transition: width 0.4s;
  }

  .progress-label {
    font-size: 11px;
    color: var(--muted);
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
  }

  .nav-section {
    padding: 16px 20px 6px;
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 20px;
    font-size: 13px;
    color: var(--muted2);
    cursor: pointer;
    border-left: 2px solid transparent;
    transition: all 0.15s;
    text-decoration: none;
  }

  .nav-item:hover { color: var(--text); background: rgba(255,255,255,0.03); }

  .nav-item.active {
    color: var(--accent);
    border-left-color: var(--accent);
    background: rgba(79,142,247,0.07);
  }

  .nav-item .dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--border2);
    flex-shrink: 0;
    transition: background 0.15s;
  }

  .nav-item.active .dot { background: var(--accent); }
  .nav-item.done .dot { background: var(--accent2); }
  .nav-item.done { color: var(--muted2); }

  /* ─── MAIN ─── */
  .main {
    margin-left: var(--sidebar);
    flex: 1;
    max-width: 820px;
    padding: 56px 48px 100px;
  }

  /* ─── SECTIONS ─── */
  .section { display: none; }
  .section.active { display: block; }

  /* ─── HERO ─── */
  .hero {
    margin-bottom: 48px;
  }

  .hero .eyebrow {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--accent2);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .hero h2 {
    font-family: var(--font-display);
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--text);
    margin-bottom: 14px;
  }

  .hero h2 span { color: var(--accent); }

  .hero .lead {
    font-size: 16px;
    color: var(--muted2);
    max-width: 580px;
    line-height: 1.8;
  }

  /* ─── OBJECTIVES GRID ─── */
  .objectives-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    margin: 32px 0;
  }

  .obj-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 18px 20px;
    transition: border-color 0.2s;
  }

  .obj-card:hover { border-color: var(--border2); }

  .obj-num {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--accent);
    margin-bottom: 8px;
  }

  .obj-card h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 6px;
    line-height: 1.4;
  }

  .obj-card p {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.6;
  }

  /* ─── CONTENT BLOCKS ─── */
  .section-heading {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .section-subheading {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 500;
    color: var(--text);
    margin: 32px 0 10px;
  }

  .prose {
    font-size: 15px;
    color: var(--muted2);
    line-height: 1.8;
    margin-bottom: 20px;
    max-width: 660px;
  }

  .prose strong { color: var(--text); font-weight: 500; }

  /* ─── KEY MESSAGE BOX ─── */
  .key-box {
    background: var(--card);
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    border-radius: var(--radius);
    padding: 18px 20px;
    margin: 24px 0;
  }

  .key-box.green { border-left-color: var(--accent2); }
  .key-box.amber { border-left-color: var(--accent3); }
  .key-box.pink { border-left-color: var(--accent4); }
  .key-box.purple { border-left-color: var(--accent5); }

  .key-box .kb-label {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .key-box p {
    font-size: 15px;
    color: var(--text);
    line-height: 1.7;
  }

  /* ─── 3-COL CARDS ─── */
  .tri-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    margin: 20px 0;
  }

  .tri-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 20px;
  }

  .tri-card .tc-icon {
    font-size: 22px;
    margin-bottom: 10px;
  }

  .tri-card h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 6px;
  }

  .tri-card p {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.6;
  }

  /* ─── VENN INTERACTIVE ─── */
  .venn-wrap {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px 24px;
    margin: 24px 0;
  }

  .venn-label {
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 16px;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .venn-diagram {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    position: relative;
    margin-bottom: 24px;
    height: 160px;
  }

  .venn-circle {
    position: absolute;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;
    border: 2px solid transparent;
  }

  .venn-circle:hover { opacity: 0.9; transform: scale(1.03); }
  .venn-circle.selected { border: 2px solid var(--text); }

  .vc-ia {
    width: 160px; height: 160px;
    background: rgba(79,142,247,0.12);
    left: 0;
    top: 0;
  }

  .vc-ml {
    width: 120px; height: 120px;
    background: rgba(46,204,154,0.15);
    left: 70px;
    top: 20px;
  }

  .vc-dl {
    width: 82px; height: 82px;
    background: rgba(167,139,250,0.2);
    left: 115px;
    top: 39px;
  }

  .venn-circle span {
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    pointer-events: none;
    text-align: center;
    line-height: 1.2;
    padding: 4px;
  }

  .venn-info {
    background: var(--bg3);
    border-radius: var(--radius);
    padding: 16px 18px;
    min-height: 80px;
    transition: all 0.2s;
  }

  .venn-info h4 { font-size: 14px; color: var(--text); margin-bottom: 6px; font-weight: 500; }
  .venn-info p { font-size: 13px; color: var(--muted2); line-height: 1.6; }

  /* ─── VOCAB TABLE ─── */
  .vocab-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 14px;
  }

  .vocab-table th {
    text-align: left;
    padding: 10px 16px;
    background: var(--bg3);
    color: var(--muted);
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid var(--border);
  }

  .vocab-table td {
    padding: 11px 16px;
    border-bottom: 1px solid var(--border);
    color: var(--text);
    vertical-align: top;
  }

  .vocab-table td:first-child {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--accent);
  }

  .vocab-table td:nth-child(2) { color: var(--accent2); }
  .vocab-table tr:hover td { background: rgba(255,255,255,0.02); }

  /* ─── TOOL SELECTOR ─── */
  .tool-selector { margin: 24px 0; }

  .ts-question {
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 14px;
  }

  .ts-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .ts-btn {
    padding: 8px 16px;
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    background: var(--card);
    color: var(--muted2);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
    font-family: var(--font-body);
  }

  .ts-btn:hover { border-color: var(--accent); color: var(--text); }
  .ts-btn.selected { border-color: var(--accent); background: rgba(79,142,247,0.1); color: var(--accent); }

  .ts-result {
    background: var(--card);
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent2);
    border-radius: var(--radius);
    padding: 16px 18px;
    display: none;
  }

  .ts-result.visible { display: block; }
  .ts-result .ts-tool { font-size: 16px; font-weight: 600; color: var(--accent2); margin-bottom: 4px; }
  .ts-result .ts-why { font-size: 13px; color: var(--muted2); }

  /* ─── QUIZ ─── */
  .quiz-wrap { margin: 24px 0; }

  .quiz-q {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 22px 24px;
    margin-bottom: 12px;
  }

  .quiz-q .q-text {
    font-size: 15px;
    color: var(--text);
    margin-bottom: 14px;
    font-weight: 500;
  }

  .quiz-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .quiz-opt {
    padding: 10px 14px;
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    font-size: 13px;
    color: var(--muted2);
    cursor: pointer;
    transition: all 0.15s;
    background: var(--bg3);
  }

  .quiz-opt:hover { border-color: var(--accent); color: var(--text); }
  .quiz-opt.correct { border-color: var(--accent2); background: rgba(46,204,154,0.1); color: var(--accent2); }
  .quiz-opt.wrong { border-color: var(--accent4); background: rgba(224,92,123,0.1); color: var(--accent4); }
  .quiz-opt.disabled { pointer-events: none; }

  .quiz-feedback {
    margin-top: 10px;
    font-size: 13px;
    color: var(--muted);
    display: none;
  }

  .quiz-feedback.visible { display: block; }

  /* ─── CODE BLOCK ─── */
  .code-block {
    background: #0D1117;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 22px;
    margin: 16px 0;
    overflow-x: auto;
  }

  .code-block pre {
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.7;
    color: #C9D1D9;
  }

  .code-block .c-green { color: #7EE787; }
  .code-block .c-blue { color: #79C0FF; }
  .code-block .c-orange { color: #FF9F43; }
  .code-block .c-pink { color: #FF7B72; }
  .code-block .c-yellow { color: #E3B341; }
  .code-block .c-gray { color: #8B949E; }

  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .code-lang {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .copy-btn {
    font-size: 11px;
    color: var(--muted);
    background: none;
    border: 1px solid var(--border2);
    border-radius: 6px;
    padding: 4px 10px;
    cursor: pointer;
    transition: all 0.15s;
    font-family: var(--font-body);
  }

  .copy-btn:hover { color: var(--text); border-color: var(--accent); }

  /* ─── WARNING BOX ─── */
  .warn-box {
    background: rgba(245,166,35,0.08);
    border: 1px solid rgba(245,166,35,0.25);
    border-radius: var(--radius);
    padding: 14px 18px;
    margin: 20px 0;
    font-size: 14px;
    color: #F5C842;
    line-height: 1.6;
  }

  .warn-box strong { color: var(--accent3); }

  /* ─── CASE STUDY ─── */
  .case-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 20px 0;
  }

  .case-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-top: 2px solid var(--accent2);
    border-radius: var(--radius-lg);
    padding: 20px;
  }

  .case-card .cc-tag {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--accent2);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .case-card h4 { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
  .case-card p { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* ─── COMPARISON TABLE ─── */
  .comp-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
  .comp-table th {
    padding: 12px 16px;
    text-align: left;
    background: var(--bg3);
    color: var(--muted);
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid var(--border);
  }
  .comp-table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    color: var(--text);
    vertical-align: top;
  }
  .comp-table td:first-child { color: var(--accent3); font-weight: 500; }
  .comp-table tr:hover td { background: rgba(255,255,255,0.02); }
  .tag-pill {
    display: inline-block;
    font-size: 11px;
    padding: 2px 10px;
    border-radius: 99px;
    background: rgba(79,142,247,0.12);
    color: var(--accent);
    font-family: var(--font-mono);
    margin-right: 4px;
  }

  /* ─── NAV BUTTONS ─── */
  .nav-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 56px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }

  .btn-nav {
    padding: 10px 22px;
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    font-family: var(--font-body);
    border: 1px solid var(--border2);
    background: var(--card);
    color: var(--text);
  }

  .btn-nav:hover { border-color: var(--accent); color: var(--accent); }
  .btn-nav.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
  .btn-nav.primary:hover { background: #3a7de8; border-color: #3a7de8; color: #fff; }
  .btn-nav:disabled { opacity: 0.3; cursor: not-allowed; }
  .btn-nav:disabled:hover { color: var(--text); border-color: var(--border2); }

  /* ─── DIVIDER ─── */
  .divider {
    height: 1px;
    background: var(--border);
    margin: 32px 0;
  }

  /* ─── APPLICATIONS GRID ─── */
  .app-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 10px;
    margin: 20px 0;
  }

  .app-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 18px 16px;
    transition: border-color 0.2s;
  }

  .app-card:hover { border-color: var(--border2); }
  .app-card .ac-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent2); margin-bottom: 12px; }
  .app-card h4 { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
  .app-card p { font-size: 12px; color: var(--muted); line-height: 1.5; }

  /* ─── LIMITS GRID ─── */
  .limit-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 20px 0;
  }

  .limit-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-left: 3px solid rgba(224,92,123,0.5);
    border-radius: var(--radius);
    padding: 14px 16px;
  }

  .limit-card h4 { font-size: 13px; font-weight: 600; color: var(--accent4); margin-bottom: 5px; }
  .limit-card p { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* ─── PYTHON COMPARE ─── */
  .py-compare {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 20px 0;
  }

  .py-col { border-radius: var(--radius-lg); padding: 20px; }
  .py-col.bad { background: rgba(224,92,123,0.07); border: 1px solid rgba(224,92,123,0.2); }
  .py-col.good { background: rgba(46,204,154,0.07); border: 1px solid rgba(46,204,154,0.2); }
  .py-col h4 { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
  .py-col.bad h4 { color: var(--accent4); }
  .py-col.good h4 { color: var(--accent2); }
  .py-col ul { list-style: none; }
  .py-col ul li { font-size: 13px; color: var(--muted2); line-height: 1.7; padding-left: 14px; position: relative; }
  .py-col ul li::before { content: "—"; position: absolute; left: 0; color: var(--muted); }

  /* ─── STEP FLOW ─── */
  .steps { margin: 24px 0; }

  .step {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
  }

  .step-num-col { display: flex; flex-direction: column; align-items: center; }

  .step-num {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: rgba(79,142,247,0.15);
    border: 1px solid rgba(79,142,247,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--accent);
    flex-shrink: 0;
  }

  .step-line {
    flex: 1;
    width: 1px;
    background: var(--border);
    margin: 4px 0;
  }

  .step-body { padding-top: 4px; flex: 1; }
  .step-body h4 { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 5px; }
  .step-body p { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* ─── SCROLLBAR ─── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 800px) {
    .sidebar { display: none; }
    .main { margin-left: 0; padding: 32px 20px 80px; }
    .quiz-options, .case-grid, .limit-grid, .py-compare { grid-template-columns: 1fr; }
    .hero h2 { font-size: 26px; }
  }
</style>
</head>
<body>


<aside className="sidebar">
  <div className="sidebar-logo">
    <div className="tag">Module 1 · Séance 1</div>
    <h1>IA Appliquée aux Géosciences</h1>
  </div>

  <div className="sidebar-progress">
    <div className="progress-bar-wrap">
      <div className="progress-bar-fill" id="progressBar"></div>
    </div>
    <div className="progress-label">
      <span id="progressText">0 / 5 complétés</span>
      <span id="progressPct">0%</span>
    </div>
  </div>

  <div className="nav-section">Contenu</div>

  <a className="nav-item active" data-section="s1" onclick="goTo('s1')">
    <span className="dot"></span> Introduction
  </a>
  <a className="nav-item" data-section="s2" onclick="goTo('s2')">
    <span className="dot"></span> Pourquoi l'IA ?
  </a>
  <a className="nav-item" data-section="s3" onclick="goTo('s3')">
    <span className="dot"></span> IA · ML · Deep Learning
  </a>
  <a className="nav-item" data-section="s4" onclick="goTo('s4')">
    <span className="dot"></span> IA vs Géostatistique
  </a>
  <a className="nav-item" data-section="s5" onclick="goTo('s5')">
    <span className="dot"></span> Boîte à outils
  </a>
  <a className="nav-item" data-section="s6" onclick="goTo('s6')">
    <span className="dot"></span> Python & TP
  </a>
  <a className="nav-item" data-section="s7" onclick="goTo('s7')">
    <span className="dot"></span> Quiz final
  </a>
</aside>


<main className="main">

  
  <section className="section active" id="s1">
    <div className="hero">
      <div className="eyebrow">Module 1 — Fondations &amp; Démystification</div>
      <h2>Introduction à <span>l'IA</span> en géosciences</h2>
      <p className="lead">
        Ce cours vous donne les bases conceptuelles et pratiques pour intégrer l'intelligence artificielle dans votre travail de géoscientifique — sans remplacer votre expertise, en la multipliant.
      </p>
    </div>

    <h3 className="section-subheading">Objectifs de la séance</h3>
    <div className="objectives-grid">
      <div className="obj-card">
        <div className="obj-num">01</div>
        <h4>Comprendre la valeur de l'IA</h4>
        <p>Découvrir pourquoi l'IA est devenue incontournable dans les géosciences modernes.</p>
      </div>
      <div className="obj-card">
        <div className="obj-num">02</div>
        <h4>Distinguer IA, ML et DL</h4>
        <p>Clarifier les concepts fondamentaux et leur hiérarchie.</p>
      </div>
      <div className="obj-card">
        <div className="obj-num">03</div>
        <h4>Choisir le bon outil</h4>
        <p>Positionner l'IA face aux méthodes géostatistiques traditionnelles.</p>
      </div>
      <div className="obj-card">
        <div className="obj-num">04</div>
        <h4>Identifier les problèmes</h4>
        <p>Formuler des questions géologiques sous forme de problèmes IA.</p>
      </div>
      <div className="obj-card">
        <div className="obj-num">05</div>
        <h4>Démarrer avec Python</h4>
        <p>Mettre en place un environnement de travail professionnel.</p>
      </div>
      <div className="obj-card">
        <div className="obj-num">06</div>
        <h4>Réaliser un audit de données</h4>
        <p>Effectuer un premier audit de données de forage en pratique.</p>
      </div>
    </div>

    <div className="key-box green">
      <div className="kb-label">Message fondateur</div>
      <p>L'IA n'est pas un remplacement du géologue. Elle agit comme un partenaire analytique, capable de traiter des volumes massifs de données pour révéler des tendances et des corrélations inaccessibles autrement.</p>
    </div>

    <div className="divider"></div>

    <h3 className="section-subheading">Prérequis</h3>
    <p className="prose">Pour suivre ce cours, vous avez besoin d'un <strong>compte Google actif</strong> et d'un navigateur web (Chrome recommandé). Tous les exercices pratiques s'exécutent sur <strong>Google Colab</strong> — aucune installation locale n'est requise.</p>

    <div className="key-box">
      <div className="kb-label">Accès Google Colab</div>
      <p>👉 <a href="https://colab.research.google.com" target="_blank" style="color: var(--accent);">https://colab.research.google.com</a></p>
    </div>

    <div className="nav-buttons">
      <button className="btn-nav" disabled>← Précédent</button>
      <button className="btn-nav primary" onclick="goTo('s2')">Suivant : Pourquoi l'IA ? →</button>
    </div>
  </section>

  
  <section className="section" id="s2">
    <div className="hero">
      <div className="eyebrow">Partie I</div>
      <h2>Pourquoi parler d'IA en géosciences ?</h2>
    </div>

    <h3 className="section-subheading">1.1 — L'ère du Big Data minier</h3>
    <p className="prose">Il y a vingt ans, la géologie s'appuyait principalement sur des cartes papier. Aujourd'hui, nous traitons des <strong>téraoctets de données</strong>. Cette évolution transforme radicalement notre approche.</p>

    <div className="tri-grid">
      <div className="tri-card">
        <div className="tc-icon">⛏</div>
        <h4>Forages</h4>
        <p>Des dizaines de milliers d'intervalles — logs, teneurs, lithologies.</p>
      </div>
      <div className="tri-card">
        <div className="tc-icon">🧪</div>
        <h4>Géochimie</h4>
        <p>20 à 50 éléments analysés par échantillon.</p>
      </div>
      <div className="tri-card">
        <div className="tc-icon">📡</div>
        <h4>Géophysique</h4>
        <p>Grilles raster haute résolution couvrant des milliers de km².</p>
      </div>
      <div className="tri-card">
        <div className="tc-icon">🛰</div>
        <h4>Imagerie</h4>
        <p>Satellites Sentinel, drones, Modèles Numériques de Terrain (MNT).</p>
      </div>
    </div>

    <div className="warn-box">
      <strong>Le défi :</strong> Ces volumes et cette diversité de données sont impossibles à traiter manuellement ou avec des outils comme Excel. L'échelle a changé — les méthodes traditionnelles sont insuffisantes.
    </div>

    <div className="divider"></div>

    <h3 className="section-subheading">1.2 — Les contraintes métiers réelles</h3>
    <p className="prose">En géosciences, les décisions sont prises sous des pressions intenses. L'IA offre des solutions concrètes face à trois défis majeurs.</p>

    <div className="tri-grid">
      <div className="tri-card">
        <div className="tc-icon">💰</div>
        <h4>Coût élevé des forages</h4>
        <p>Un forage mal placé représente une dépense colossale. L'IA améliore le ciblage des zones prometteuses.</p>
      </div>
      <div className="tri-card">
        <div className="tc-icon">🔍</div>
        <h4>Incertitude du sous-sol</h4>
        <p>Le sous-sol reste partiellement observable. L'IA aide à quantifier la probabilité de succès et transforme l'incertitude en risque gérable.</p>
      </div>
      <div className="tri-card">
        <div className="tc-icon">⏱</div>
        <h4>Pression des délais</h4>
        <p>Les investisseurs attendent des retours rapides. L'IA accélère les processus d'analyse et de décision sans sacrifier la qualité.</p>
      </div>
    </div>

    <div className="divider"></div>

    <h3 className="section-subheading">1.3 — Cas concrets : l'IA qui a trouvé des gisements</h3>
    <div className="case-grid">
      <div className="case-card">
        <div className="cc-tag">Cas réel · 2024</div>
        <h4>KoBold Metals — Zambie</h4>
        <p>L'entreprise a confirmé en 2024 la découverte du gisement de cuivre de Mingomba en réinterprétant des données historiques à l'aide de l'IA, démontrant la valeur de l'intégration multi-sources.</p>
      </div>
      <div className="case-card">
        <div className="cc-tag">Cas réel · Canada</div>
        <h4>GoldSpot Discoveries — Projet Queensway</h4>
        <p>L'approche de ciblage par IA a permis d'identifier des zones prioritaires. Un sondage a intercepté 19 m à 92,86 g/t d'or, validant la pertinence de l'approche prédictive.</p>
      </div>
    </div>

    <div className="divider"></div>

    <h3 className="section-subheading">1.4 — Applications concrètes</h3>
    <div className="app-grid">
      <div className="app-card">
        <div className="ac-dot"></div>
        <h4>Exploration minière</h4>
        <p>Détection automatique de cibles potentielles par analyse géophysique et géochimique.</p>
      </div>
      <div className="app-card">
        <div className="ac-dot" style="background: var(--accent);"></div>
        <h4>Cartographie géologique</h4>
        <p>Analyse automatisée d'images satellite multibandes par CNN pour cartographie rapide.</p>
      </div>
      <div className="app-card">
        <div className="ac-dot" style="background: var(--accent3);"></div>
        <h4>Modélisation géophysique</h4>
        <p>Inversion gravimétrique accélérée par réseaux neuronaux — de jours à minutes.</p>
      </div>
      <div className="app-card">
        <div className="ac-dot" style="background: var(--accent5);"></div>
        <h4>Surveillance environnementale</h4>
        <p>Détection précoce de risques géologiques (glissements, subsidences) par analyse prédictive.</p>
      </div>
    </div>

    <div className="divider"></div>

    <h3 className="section-subheading">1.5 — Limites de l'IA : ce qu'il ne faut pas oublier</h3>
    <div className="limit-grid">
      <div className="limit-card">
        <h4>Biais des données</h4>
        <p>Les modèles reflètent les biais présents dans les données d'entraînement et peuvent mener à des interprétations erronées.</p>
      </div>
      <div className="limit-card">
        <h4>Effet "boîte noire"</h4>
        <p>La complexité de certains modèles rend difficile la compréhension de leurs décisions internes.</p>
      </div>
      <div className="limit-card">
        <h4>Garbage In = Garbage Out</h4>
        <p>L'IA est aussi performante que les données sur lesquelles elle est formée. Des données mauvaises donnent de mauvais résultats.</p>
      </div>
      <div className="limit-card">
        <h4>L'expertise reste centrale</h4>
        <p>L'IA est un outil puissant, mais elle ne remplace pas l'interprétation critique du géologue sur le terrain.</p>
      </div>
    </div>

    <div className="nav-buttons">
      <button className="btn-nav" onclick="goTo('s1')">← Précédent</button>
      <button className="btn-nav primary" onclick="goTo('s3')">Suivant : IA · ML · DL →</button>
    </div>
  </section>

  
  <section className="section" id="s3">
    <div className="hero">
      <div className="eyebrow">Partie II</div>
      <h2>Démystification des concepts fondamentaux</h2>
    </div>

    <p className="prose">Les mots <strong>IA</strong>, <strong>Machine Learning</strong> et <strong>Deep Learning</strong> sont souvent utilisés de manière interchangeable — alors qu'ils désignent des réalités bien distinctes. Voici comment les distinguer.</p>

    <h3 className="section-subheading">2.1 — La hiérarchie : les poupées russes</h3>
    <p className="prose">Cliquez sur chaque cercle pour voir la définition et un exemple géoscientifique concret.</p>

    <div className="venn-wrap">
      <div className="venn-label">Diagramme interactif</div>
      <div style="position: relative; height: 170px; max-width: 340px; margin: 0 auto 20px;">
        <div className="venn-circle vc-ia" id="vc-ia" onclick="showVenn('ia')">
          <span style="position:absolute; left:14px; top:14px; font-size:11px; color: #79C0FF;">IA</span>
        </div>
        <div className="venn-circle vc-ml" id="vc-ml" onclick="showVenn('ml')">
          <span style="position:absolute; left:12px; top:10px; font-size:11px; color: #7EE787;">ML</span>
        </div>
        <div className="venn-circle vc-dl" id="vc-dl" onclick="showVenn('dl')">
          <span style="font-size:10px; color: #C9A0FF;">DL</span>
        </div>
      </div>
      <div className="venn-info" id="vennInfo">
        <h4>Sélectionnez un cercle</h4>
        <p>Cliquez sur IA, ML ou Deep Learning pour afficher sa définition et des exemples géoscientifiques.</p>
      </div>
    </div>

    <div className="divider"></div>

    <h3 className="section-subheading">2.2 — Machine Learning : ce qu'il fait en géosciences</h3>
    <p className="prose">Le ML est indispensable pour les <strong>données tabulaires</strong> (forages, géochimie, logs). Il capture des relations non-linéaires que les statistiques classiques ne voient pas.</p>

    <div className="tri-grid">
      <div className="tri-card">
        <h4>Prédiction de teneur</h4>
        <p>Estimer la concentration en Au à partir de données géochimiques et géophysiques.</p>
      </div>
      <div className="tri-card">
        <h4>Classification lithologique</h4>
        <p>Identifier automatiquement les types de roches à partir de logs de forage.</p>
      </div>
      <div className="tri-card">
        <h4>Détection d'anomalies</h4>
        <p>Repérer des signatures inhabituelles indiquant une minéralisation potentielle.</p>
      </div>
    </div>

    <div className="divider"></div>

    <h3 className="section-subheading">2.3 — Deep Learning : quand l'image est au cœur du problème</h3>
    <p className="prose">Le Deep Learning utilise des réseaux neuronaux profonds. Il excelle sur les <strong>données visuelles</strong> — à utiliser quand les images sont au cœur du problème.</p>

    <div className="tri-grid">
      <div className="tri-card">
        <h4>Images satellites</h4>
        <p>Cartographie des ressources, détection de changements, surveillance environnementale.</p>
      </div>
      <div className="tri-card">
        <h4>Photos de carottes</h4>
        <p>Identification automatisée des lithologies, textures et altérations.</p>
      </div>
      <div className="tri-card">
        <h4>Grilles géophysiques 3D</h4>
        <p>Interprétation de données sismiques et gravimétriques.</p>
      </div>
    </div>

    <div className="warn-box">
      <strong>Points d'attention :</strong> Le Deep Learning requiert d'énormes volumes de données annotées, une puissance GPU significative, et ses décisions sont moins interprétables (effet boîte noire plus prononcé).
    </div>

    <div className="divider"></div>

    <h3 className="section-subheading">2.4 — Comment fonctionne un modèle ? Y = f(X)</h3>
    <div className="steps">
      <div className="step">
        <div className="step-num-col">
          <div className="step-num">1</div>
          <div className="step-line"></div>
        </div>
        <div className="step-body">
          <h4>Entraînement</h4>
          <p>Le modèle apprend des patterns à partir d'un ensemble de données étiquetées. Il ajuste ses paramètres internes. En géosciences : le modèle apprend sur des sondages et échantillons déjà connus.</p>
        </div>
      </div>
      <div className="step">
        <div className="step-num-col">
          <div className="step-num">2</div>
          <div className="step-line"></div>
        </div>
        <div className="step-body">
          <h4>Validation</h4>
          <p>Évaluation des performances sur un ensemble de données indépendant. Permet d'éviter le <strong>sur-apprentissage (overfitting)</strong> — quand un modèle mémorise l'entraînement au lieu d'apprendre à généraliser.</p>
        </div>
      </div>
      <div className="step">
        <div className="step-num-col">
          <div className="step-num">3</div>
        </div>
        <div className="step-body">
          <h4>Prédiction</h4>
          <p>Application du modèle à de nouvelles données — zones non forées, échantillons non analysés. C'est l'objectif final : prédire l'inconnu.</p>
        </div>
      </div>
    </div>

    <div className="key-box amber">
      <div className="kb-label">Règle d'or</div>
      <p>Un bon modèle est celui qui prédit l'inconnu avec précision, et non celui qui se contente de reproduire le passé.</p>
    </div>

    <div className="divider"></div>

    <h3 className="section-subheading">2.5 — Vocabulaire essentiel : Data ↔ Géosciences</h3>
    <table className="vocab-table">
      <thead>
        <tr>
          <th>Terme Data Science</th>
          <th>Équivalent géoscientifique</th>
          <th>Exemple concret</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Instance / Observation</td>
          <td>Échantillon / intervalle</td>
          <td>Une ligne du fichier — un intervalle de forage, un point sol</td>
        </tr>
        <tr>
          <td>Feature</td>
          <td>Variable explicative (entrée)</td>
          <td>As, Sb, lithologie, X, Y, altitude, intensité magnétique</td>
        </tr>
        <tr>
          <td>Label / Target</td>
          <td>Objectif à prédire (sortie)</td>
          <td>Teneur Au manquante, lithologie, "minéralisé : oui/non"</td>
        </tr>
        <tr>
          <td>Training</td>
          <td>Calibrage du modèle</td>
          <td>Le modèle apprend sur des sondages/échantillons déjà connus</td>
        </tr>
        <tr>
          <td>Prediction / Inference</td>
          <td>Estimation / extrapolation</td>
          <td>Application dans des zones non forées ou non échantillonnées</td>
        </tr>
      </tbody>
    </table>

    <div className="nav-buttons">
      <button className="btn-nav" onclick="goTo('s2')">← Précédent</button>
      <button className="btn-nav primary" onclick="goTo('s4')">Suivant : IA vs Géostatistique →</button>
    </div>
  </section>

  
  <section className="section" id="s4">
    <div className="hero">
      <div className="eyebrow">Partie III</div>
      <h2>IA vs Géostatistique — choisir le bon outil</h2>
    </div>

    <div className="key-box green">
      <div className="kb-label">Message central</div>
      <p>L'IA ne remplace pas le Krigeage. Ce sont trois outils distincts pour trois usages différents : <strong>décrire</strong>, <strong>estimer avec incertitude spatiale</strong>, et <strong>prédire avec de multiples variables</strong>.</p>
    </div>

    <h3 className="section-subheading">3.1 — Les trois approches</h3>

    <table className="comp-table">
      <thead>
        <tr>
          <th>Méthode</th>
          <th>Ce qu'elle fait</th>
          <th>Quand l'utiliser</th>
          <th>Algorithmes typiques</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Statistique classique</td>
          <td>Décrire les données — moyenne, histogramme, corrélation.</td>
          <td>EDA, contrôle qualité, première exploration.</td>
          <td><span className="tag-pill">Python / pandas</span></td>
        </tr>
        <tr>
          <td>Géostatistique (Kriging)</td>
          <td>Estimer des valeurs avec <strong>continuité spatiale</strong>. Standard industrie.</td>
          <td>Modèles de blocs, certification ressources JORC.</td>
          <td><span className="tag-pill">Kriging</span> <span className="tag-pill">Variogramme</span></td>
        </tr>
        <tr>
          <td>IA / Machine Learning</td>
          <td>Prédire des phénomènes <strong>multivariés et non-linéaires</strong>.</td>
          <td>Ciblage exploratoire, classification automatique.</td>
          <td><span className="tag-pill">Random Forest</span> <span className="tag-pill">XGBoost</span></td>
        </tr>
      </tbody>
    </table>

    <div className="divider"></div>

    <h3 className="section-subheading">3.2 — Sélecteur interactif : quel outil pour mon problème ?</h3>
    <p className="prose">Sélectionnez votre situation pour voir l'outil recommandé.</p>

    <div className="tool-selector">
      <div className="ts-buttons" id="toolBtns">
        <button className="ts-btn" onclick="selectTool(this, 'geostat', 'Géostatistique (Kriging)', 'Vous avez besoin d\'une continuité spatiale et d\'une certification conforme aux standards JORC/NI 43-101. Le Kriging est le standard industriel pour les modèles de blocs.')">Estimer des ressources minières</button>
        <button className="ts-btn" onclick="selectTool(this, 'ml', 'IA / Machine Learning', 'Vous avez de multiples variables explicatives (géophysique, géochimie, structure) et souhaitez identifier des zones favorables à l\'exploration. Le ML est parfait pour détecter des patterns non-linéaires.')">Cibler des zones d'exploration</button>
        <button className="ts-btn" onclick="selectTool(this, 'dl', 'Deep Learning (CNN)', 'Vos données sont des images — satellite, carottes, photogéologie. Le Deep Learning excelle sur les données visuelles avec des réseaux de neurones convolutifs (CNN).')">Analyser des images de carottes</button>
        <button className="ts-btn" onclick="selectTool(this, 'stats', 'Statistique classique', 'C\'est la première étape incontournable : comprendre la distribution des données, détecter les valeurs aberrantes, vérifier la qualité avant toute modélisation.')">Vérifier la qualité des données</button>
        <button className="ts-btn" onclick="selectTool(this, 'ml', 'IA / Machine Learning', 'La classification lithologique à partir de logs de forage est un problème de classification supervisée — typiquement résolu avec Random Forest ou XGBoost sur des données tabulaires.')">Classifier des lithologies depuis des logs</button>
      </div>
      <div className="ts-result" id="toolResult">
        <div className="ts-tool" id="toolName"></div>
        <div className="ts-why" id="toolWhy"></div>
      </div>
    </div>

    <div className="nav-buttons">
      <button className="btn-nav" onclick="goTo('s3')">← Précédent</button>
      <button className="btn-nav primary" onclick="goTo('s5')">Suivant : Boîte à outils →</button>
    </div>
  </section>

  
  <section className="section" id="s5">
    <div className="hero">
      <div className="eyebrow">Partie IV</div>
      <h2>La boîte à outils — types de problèmes IA</h2>
    </div>

    <p className="prose">La première étape cruciale est de <strong>diagnostiquer le type de problème</strong> avant de penser au code ou aux algorithmes. Chaque question métier correspond à un type d'IA précis.</p>

    <div className="key-box purple">
      <div className="kb-label">Règle d'or</div>
      <p>Poser la bonne question = choisir le bon algorithme. Un problème mal formulé donne un modèle inutile même si le code est parfait.</p>
    </div>

    <h3 className="section-subheading">Les 5 familles de problèmes</h3>

    <table className="comp-table">
      <thead>
        <tr>
          <th>Question</th>
          <th>Type de problème</th>
          <th>Exemple géoscientifique</th>
          <th>Algorithmes typiques</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Combien ?</td>
          <td>Régression</td>
          <td>Estimer la teneur en Au à partir de la géochimie</td>
          <td><span className="tag-pill">Random Forest</span> <span className="tag-pill">XGBoost</span></td>
        </tr>
        <tr>
          <td>Quoi ?</td>
          <td>Classification</td>
          <td>Identifier la lithologie depuis des logs de forage</td>
          <td><span className="tag-pill">SVM</span> <span className="tag-pill">Random Forest</span></td>
        </tr>
        <tr>
          <td>Qui se ressemble ?</td>
          <td>Clustering</td>
          <td>Regrouper des familles géochimiques similaires</td>
          <td><span className="tag-pill">K-Means</span> <span className="tag-pill">DBSCAN</span></td>
        </tr>
        <tr>
          <td>Qui est l'intrus ?</td>
          <td>Détection d'anomalies</td>
          <td>Détecter une pépite ou une erreur de labo</td>
          <td><span className="tag-pill">Isolation Forest</span></td>
        </tr>
        <tr>
          <td>Que vois-tu ?</td>
          <td>Vision par ordinateur</td>
          <td>Analyser une image satellite ou une carotte</td>
          <td><span className="tag-pill">CNN</span> <span className="tag-pill">ResNet</span></td>
        </tr>
      </tbody>
    </table>

    <div className="divider"></div>

    <h3 className="section-subheading">Types de données géoscientifiques pour l'IA</h3>
    <div className="tri-grid">
      <div className="tri-card">
        <h4>📊 Données tabulaires</h4>
        <p>Lignes et colonnes — assays, collars, surveys, géochimie, logs de forage.<br /><strong style="color: var(--accent);">Modèles :</strong> Random Forest, XGBoost, KNN.</p>
      </div>
      <div className="tri-card">
        <h4>🗺 Données raster</h4>
        <p>Grilles de pixels — cartes magnétiques, imagerie satellite, photos de carottes.<br /><strong style="color: var(--accent);">Modèles :</strong> CNN (Deep Learning).</p>
      </div>
      <div className="tri-card">
        <h4>📍 Données vectorielles</h4>
        <p>Points, lignes, polygones — failles, contacts géologiques, périmètres de permis.<br /><strong style="color: var(--accent);">Traitement :</strong> Conversion en raster ou attributs tabulaires.</p>
      </div>
    </div>

    <div className="warn-box">
      <strong>Attention :</strong> Une erreur de formatage ou un géoréférencement (CRS) incorrect peut invalider l'ensemble d'un modèle, quelle que soit sa sophistication.
    </div>

    <div className="nav-buttons">
      <button className="btn-nav" onclick="goTo('s4')">← Précédent</button>
      <button className="btn-nav primary" onclick="goTo('s6')">Suivant : Python & TP →</button>
    </div>
  </section>

  
  <section className="section" id="s6">
    <div className="hero">
      <div className="eyebrow">Partie VI — Pratique</div>
      <h2>Python & Audit de données de forage</h2>
    </div>

    <h3 className="section-subheading">6.1 — Excel vs Python</h3>

    <div className="py-compare">
      <div className="py-col bad">
        <h4>❌ Limites d'Excel</h4>
        <ul>
          <li>Limite de 1 048 576 lignes</li>
          <li>Performances dégradées sur gros volumes</li>
          <li>Manipulations manuelles non traçables</li>
          <li>Résultats non auditables ni reproductibles</li>
          <li>Difficile à automatiser</li>
        </ul>
      </div>
      <div className="py-col good">
        <h4>✅ Pourquoi Python</h4>
        <ul>
          <li>Traçabilité : chaque étape est du code documenté</li>
          <li>Reproductibilité : résultats identiques à chaque exécution</li>
          <li>Auditabilité : la logique est vérifiable ligne par ligne</li>
          <li>Automatisation des tâches répétitives</li>
          <li>Standard de l'industrie IA/data science</li>
        </ul>
      </div>
    </div>

    <div className="key-box amber">
      <div className="kb-label">À retenir</div>
      <p><strong>Excel = Outil</strong> &nbsp;·&nbsp; <strong>Python = Méthode Scientifique</strong></p>
    </div>

    <div className="divider"></div>

    <h3 className="section-subheading">6.2 — Les 3 piliers Python pour les géosciences</h3>
    <div className="tri-grid">
      <div className="tri-card">
        <h4>🐼 Pandas</h4>
        <p>Gère les tableaux de données structurées (DataFrames). Idéal pour le nettoyage, la transformation et l'analyse de données tabulaires — logs, assays, géochimie.</p>
      </div>
      <div className="tri-card">
        <h4>🔢 NumPy</h4>
        <p>Calculs numériques et manipulation de tableaux multidimensionnels (arrays). Fondamental pour tous les algorithmes d'IA en arrière-plan.</p>
      </div>
      <div className="tri-card">
        <h4>📈 Matplotlib</h4>
        <p>Bibliothèque de base pour créer des visualisations — histogrammes, cartes de chaleur, nuages de points. Premier outil pour explorer vos données.</p>
      </div>
    </div>

    <div className="divider"></div>

    <h3 className="section-subheading">6.3 — TP : Audit d'un fichier de forage brut</h3>
    <p className="prose">Vous travaillez sur un fichier <code style="font-family: var(--font-mono); color: var(--accent); background: var(--bg3); padding: 2px 8px; border-radius: 4px;">sondages_bruts.csv</code> contenant des données de forage imparfaites. Votre mission : identifier les problèmes avant toute modélisation.</p>

    <h4 className="section-subheading" style="font-size: 15px; margin-top: 20px;">Étape 1 — Charger et inspecter les données</h4>
    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">Python</span>
        <button className="copy-btn" onclick="copyCode(this)">Copier</button>
      </div>
      <pre><span className="c-pink">import</span> pandas <span className="c-pink">as</span> pd
<span className="c-pink">import</span> numpy <span className="c-pink">as</span> np
<span className="c-pink">import</span> matplotlib.pyplot <span className="c-pink">as</span> plt

<span className="c-gray"># Charger le fichier</span>
df = pd.<span className="c-blue">read_csv</span>(<span className="c-green">'sondages_bruts.csv'</span>)

<span className="c-gray"># Vue d'ensemble : dimensions, types, valeurs manquantes</span>
<span className="c-blue">print</span>(df.<span className="c-blue">info</span>())
<span className="c-blue">print</span>(df.<span className="c-blue">head</span>())</pre>
    </div>

    <div className="key-box">
      <div className="kb-label">Ce que vous allez découvrir</div>
      <p>La colonne <code style="font-family: var(--font-mono); color: var(--accent);">GOLD_G_T</code> est de type <code style="font-family: var(--font-mono); color: var(--accent4);">object</code> au lieu de <code style="font-family: var(--font-mono); color: var(--accent2);">float64</code> — car elle contient des valeurs textuelles comme <code style="font-family: var(--font-mono);">&lt;0.01</code> et <code style="font-family: var(--font-mono);">NS</code> (Non Spécifié). C'est "le choc" typique d'un audit réel.</p>
    </div>

    <h4 className="section-subheading" style="font-size: 15px; margin-top: 24px;">Étape 2 — Contrôles QA/QC essentiels</h4>
    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">Python</span>
        <button className="copy-btn" onclick="copyCode(this)">Copier</button>
      </div>
      <pre><span className="c-gray"># 1. Valeurs manquantes par colonne</span>
<span className="c-blue">print</span>(<span className="c-green">"Valeurs manquantes :"</span>)
<span className="c-blue">print</span>(df.<span className="c-blue">isnull</span>().<span className="c-blue">sum</span>())

<span className="c-gray"># 2. Incohérences de profondeur (DEPTH_FROM >= DEPTH_TO)</span>
incoherences = df[df[<span className="c-green">'DEPTH_FROM'</span>] >= df[<span className="c-green">'DEPTH_TO'</span>]]
<span className="c-blue">print</span>(<span className="c-orange">f</span><span className="c-green">"\nIncohérences de profondeur : </span><span className="c-orange">{</span><span className="c-blue">len</span>(incoherences)<span className="c-orange">}</span><span className="c-green"> lignes"</span>)

<span className="c-gray"># 3. Doublons</span>
doublons = df.<span className="c-blue">duplicated</span>().<span className="c-blue">sum</span>()
<span className="c-blue">print</span>(<span className="c-orange">f</span><span className="c-green">"Doublons : </span><span className="c-orange">{</span>doublons<span className="c-orange">}</span><span className="c-green"> lignes"</span>)

<span className="c-gray"># 4. Valeurs uniques de ROCK_TYPE (vérifier orthographe)</span>
<span className="c-blue">print</span>(<span className="c-green">"\nTypes de roches :"</span>)
<span className="c-blue">print</span>(df[<span className="c-green">'ROCK_TYPE'</span>].<span className="c-blue">value_counts</span>())</pre>
    </div>

    <h4 className="section-subheading" style="font-size: 15px; margin-top: 24px;">Étape 3 — Conversion et visualisation</h4>
    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">Python</span>
        <button className="copy-btn" onclick="copyCode(this)">Copier</button>
      </div>
      <pre><span className="c-gray"># Forcer la conversion numérique (les erreurs deviennent NaN)</span>
df[<span className="c-green">'GOLD_G_T'</span>] = pd.<span className="c-blue">to_numeric</span>(df[<span className="c-green">'GOLD_G_T'</span>], errors=<span className="c-green">'coerce'</span>)

<span className="c-gray"># Supprimer les lignes sans teneur après conversion</span>
df_clean = df.<span className="c-blue">dropna</span>(subset=[<span className="c-green">'GOLD_G_T'</span>])

<span className="c-gray"># Histogramme de distribution</span>
plt.<span className="c-blue">figure</span>(figsize=(<span className="c-yellow">10</span>, <span className="c-yellow">6</span>))
df_clean[<span className="c-green">'GOLD_G_T'</span>].<span className="c-blue">hist</span>(bins=<span className="c-yellow">50</span>, color=<span className="c-green">'#4F8EF7'</span>)
plt.<span className="c-blue">title</span>(<span className="c-green">'Distribution de la teneur en or (g/t)'</span>)
plt.<span className="c-blue">xlabel</span>(<span className="c-green">'Teneur (g/t)'</span>)
plt.<span className="c-blue">ylabel</span>(<span className="c-green">'Fréquence'</span>)
plt.<span className="c-blue">show</span>()</pre>
    </div>

    <h4 className="section-subheading" style="font-size: 15px; margin-top: 24px;">Étape 4 — Export des livrables</h4>
    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">Python</span>
        <button className="copy-btn" onclick="copyCode(this)">Copier</button>
      </div>
      <pre><span className="c-gray"># Livrable 1 : données nettoyées</span>
df_clean.<span className="c-blue">to_csv</span>(<span className="c-green">'quick_clean.csv'</span>, index=<span className="c-pink">False</span>)

<span className="c-gray"># Livrable 2 : rapport d'erreurs pour investigation</span>
erreurs = df[df[<span className="c-green">'DEPTH_FROM'</span>] >= df[<span className="c-green">'DEPTH_TO'</span>]]
erreurs.<span className="c-blue">to_csv</span>(<span className="c-green">'rapport_erreurs_labo.csv'</span>, index=<span className="c-pink">False</span>)

<span className="c-blue">print</span>(<span className="c-green">"✅ Audit terminé. Deux fichiers exportés."</span>)
<span className="c-blue">print</span>(<span className="c-orange">f</span><span className="c-green">"   - quick_clean.csv : </span><span className="c-orange">{</span><span className="c-blue">len</span>(df_clean)<span className="c-orange">}</span><span className="c-green"> lignes valides"</span>)
<span className="c-blue">print</span>(<span className="c-orange">f</span><span className="c-green">"   - rapport_erreurs_labo.csv : </span><span className="c-orange">{</span><span className="c-blue">len</span>(erreurs)<span className="c-orange">}</span><span className="c-green"> erreurs à investiguer"</span>)</pre>
    </div>

    <div className="warn-box">
      <strong>À retenir :</strong> L'objectif final n'est pas le modèle, c'est la décision. Des données propres et bien comprises sont le préalable indispensable à tout projet d'IA fiable.
    </div>

    <div className="divider"></div>
    <h3 className="section-subheading">Responsabilité du géoscientifique</h3>
    <div className="limit-grid">
      <div className="limit-card" style="border-left-color: var(--accent2);">
        <h4 style="color: var(--accent2);">Audit des données</h4>
        <p>Vérifier la provenance, la qualité et la pertinence avant toute modélisation.</p>
      </div>
      <div className="limit-card" style="border-left-color: var(--accent2);">
        <h4 style="color: var(--accent2);">Validation terrain</h4>
        <p>Confronter les prédictions du modèle à la réalité du terrain.</p>
      </div>
      <div className="limit-card" style="border-left-color: var(--accent2);">
        <h4 style="color: var(--accent2);">Traçabilité</h4>
        <p>Documenter chaque étape, chaque décision, chaque version de données.</p>
      </div>
      <div className="limit-card" style="border-left-color: var(--accent2);">
        <h4 style="color: var(--accent2);">Décision finale</h4>
        <p>L'algorithme ne signe pas le rapport. La responsabilité reste humaine.</p>
      </div>
    </div>

    <div className="nav-buttons">
      <button className="btn-nav" onclick="goTo('s5')">← Précédent</button>
      <button className="btn-nav primary" onclick="goTo('s7')">Suivant : Quiz final →</button>
    </div>
  </section>

  
  <section className="section" id="s7">
    <div className="hero">
      <div className="eyebrow">Validation des acquis</div>
      <h2>Quiz final — Séance 1</h2>
      <p className="lead">5 questions pour valider vos acquis. Chaque question porte sur un module de la séance.</p>
    </div>

    <div className="quiz-wrap">

      
      <div className="quiz-q">
        <div className="q-text">1. Une équipe d'exploration veut identifier des zones favorables à la minéralisation en intégrant des données géophysiques, géochimiques et de forages. Quel outil choisir ?</div>
        <div className="quiz-options">
          <div className="quiz-opt" onclick="answer(this, false, 'Le Kriging est optimal pour l\'estimation spatiale de ressources déjà délimitées — pas pour la découverte de nouvelles cibles.')">Kriging (géostatistique)</div>
          <div className="quiz-opt" onclick="answer(this, true, 'Correct ! Le ML est idéal pour ce type de ciblage exploratoire multivarié et non-linéaire. C\'est exactement ce que font KoBold Metals et GoldSpot Discoveries.')">IA / Machine Learning</div>
          <div className="quiz-opt" onclick="answer(this, false, 'La statistique classique décrit les données mais ignore la dimension spatiale et les relations multivariées complexes.')">Statistique classique</div>
          <div className="quiz-opt" onclick="answer(this, false, 'Le Deep Learning est optimal pour les données visuelles (images satellite, carottes) — pas pour des données tabulaires géochimiques.')">Deep Learning (CNN)</div>
        </div>
        <div className="quiz-feedback" id="fb0"></div>
      </div>

      
      <div className="quiz-q">
        <div className="q-text">2. Un modèle d'IA obtient 99% de précision sur les données d'entraînement mais seulement 62% sur de nouveaux échantillons. De quoi souffre-t-il ?</div>
        <div className="quiz-options">
          <div className="quiz-opt" onclick="answer(this, false, 'Le sous-apprentissage se manifeste par de mauvaises performances sur les deux ensembles de données.')">Sous-apprentissage (underfitting)</div>
          <div className="quiz-opt" onclick="answer(this, true, 'Correct ! Haute performance sur l\'entraînement + mauvaise généralisation = sur-apprentissage (overfitting). Le modèle a mémorisé les données au lieu d\'apprendre les patterns généraux.')">Sur-apprentissage (overfitting)</div>
          <div className="quiz-opt" onclick="answer(this, false, 'L\'effet boîte noire décrit l\'opacité des décisions du modèle, pas la différence de performance entraînement/test.')">Effet boîte noire</div>
          <div className="quiz-opt" onclick="answer(this, false, 'Un biais de données est lié à la représentativité des données d\'entraînement, pas à cet écart de performance.')">Biais des données</div>
        </div>
        <div className="quiz-feedback" id="fb1"></div>
      </div>

      
      <div className="quiz-q">
        <div className="q-text">3. Vous avez des données géochimiques de 5 000 échantillons sans étiquettes de classe. Vous souhaitez découvrir des groupes naturels d'associations élémentaires. Quel type d'IA ?</div>
        <div className="quiz-options">
          <div className="quiz-opt" onclick="answer(this, false, 'La régression prédit une valeur continue (quantité), pas des groupes.')">Régression</div>
          <div className="quiz-opt" onclick="answer(this, false, 'La classification supervisée nécessite des étiquettes connues pour entraîner le modèle — ce que vous n\'avez pas ici.')">Classification supervisée</div>
          <div className="quiz-opt" onclick="answer(this, true, 'Correct ! Le clustering (K-Means, DBSCAN) est un apprentissage non-supervisé qui découvre des groupes similaires sans étiquettes préalables — idéal pour les familles géochimiques.')">Clustering (non-supervisé)</div>
          <div className="quiz-opt" onclick="answer(this, false, 'La détection d\'anomalies cherche des points inhabituels, pas des groupes cohérents.')">Détection d'anomalies</div>
        </div>
        <div className="quiz-feedback" id="fb2"></div>
      </div>

      
      <div className="quiz-q">
        <div className="q-text">4. Dans un fichier CSV de forage, la colonne GOLD_G_T est de type "object" alors qu'elle devrait être numérique. Quelle est la cause la plus probable ?</div>
        <div className="quiz-options">
          <div className="quiz-opt" onclick="answer(this, false, 'Une mauvaise connexion n\'affecte pas le type d\'une colonne dans un fichier CSV déjà enregistré.')">Problème de connexion réseau lors de l'import</div>
          <div className="quiz-opt" onclick="answer(this, true, 'Correct ! Des valeurs textuelles comme &lt;0.01 (sous le seuil de détection) ou NS (Non Spécifié) forcent pandas à typer toute la colonne en "object". C\'est un problème classique de données brutes de laboratoire.')">Présence de valeurs textuelles comme &lt;0.01 ou NS</div>
          <div className="quiz-opt" onclick="answer(this, false, 'Les valeurs manquantes (NaN) seules ne changent pas le type d\'une colonne numérique en object.')">Trop de valeurs manquantes (NaN)</div>
          <div className="quiz-opt" onclick="answer(this, false, 'Les doublons ne modifient pas le type d\'une colonne.')">Lignes dupliquées dans le fichier</div>
        </div>
        <div className="quiz-feedback" id="fb3"></div>
      </div>

      
      <div className="quiz-q">
        <div className="q-text">5. Un collègue vous dit : "Nous avons entraîné un modèle IA qui prédit les zones minéralisées avec 85% de précision — nous pouvons arrêter les forages de validation." Quelle est votre réponse ?</div>
        <div className="quiz-options">
          <div className="quiz-opt" onclick="answer(this, false, 'La certification JORC requiert une validation physique des ressources — un modèle IA seul ne suffit pas réglementairement, et ce n\'est pas la réponse complète.')">D'accord, 85% c'est suffisant pour la certification JORC</div>
          <div className="quiz-opt" onclick="answer(this, false, 'Refuser totalement serait une mauvaise compréhension — l\'IA peut fortement optimiser et réduire le nombre de forages nécessaires.')">Refuser — l'IA n'est pas fiable pour l'exploration</div>
          <div className="quiz-opt" onclick="answer(this, true, 'Correct ! L\'IA optimise le ciblage et réduit le nombre de forages nécessaires, mais ne les remplace pas. La validation terrain reste indispensable : l\'algorithme ne signe pas le rapport.')">L'IA optimise le ciblage mais la validation terrain reste indispensable</div>
          <div className="quiz-opt" onclick="answer(this, false, 'Remettre en question le modèle sans raison précise n\'est pas constructif — 85% peut être un excellent résultat selon le contexte.')">Refaire le modèle jusqu'à obtenir 100%</div>
        </div>
        <div className="quiz-feedback" id="fb4"></div>
      </div>

    </div>

    <div className="key-box green" id="finalMsg" style="display:none;">
      <div className="kb-label">Séance 1 complétée ✓</div>
      <p>Bravo ! Vous avez les bases pour aborder la séance suivante : nettoyage automatique des données, gestion des valeurs manquantes (NaN), et préparation des données pour les algorithmes d'IA.</p>
    </div>

    <div className="divider"></div>
    <h3 className="section-subheading">Ressources recommandées</h3>
    <div className="tri-grid">
      <div className="tri-card">
        <h4>NASA ARSET</h4>
        <p>Formation en télédétection appliquée. GitHub officiel avec notebooks géosciences.</p>
      </div>
      <div className="tri-card">
        <h4>SEG Publications</h4>
        <p>Society of Exploration Geophysicists — articles de référence IA en géophysique.</p>
      </div>
      <div className="tri-card">
        <h4>Scikit-learn</h4>
        <p>Bibliothèque Python open source pour le Machine Learning — documentation officielle.</p>
      </div>
      <div className="tri-card">
        <h4>USGS</h4>
        <p>Jeux de données géoscientifiques ouverts pour pratiquer.</p>
      </div>
    </div>

    <div className="nav-buttons">
      <button className="btn-nav" onclick="goTo('s6')">← Précédent</button>
      <button className="btn-nav primary" style="opacity:0.5; cursor:default;">Séance 2 (bientôt)</button>
    </div>
  </section>

</main>

<script>
  const SECTIONS = ['s1','s2','s3','s4','s5','s6','s7'];
  const completed = new Set();
  let current = 's1';

  function goTo(id) {
    completed.add(current);
    document.getElementById(current).classList.remove('active');
    document.getElementById(id).classList.add('active');
    current = id;
    window.scrollTo(0,0);
    updateNav();
    updateProgress();
  }

  function updateNav() {
    document.querySelectorAll('.nav-item').forEach(el => {
      const s = el.dataset.section;
      el.classList.remove('active','done');
      if (s === current) el.classList.add('active');
      else if (completed.has(s)) el.classList.add('done');
    });
  }

  function updateProgress() {
    const pct = Math.round((completed.size / (SECTIONS.length - 1)) * 100);
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressText').textContent = completed.size + ' / ' + (SECTIONS.length - 1) + ' complétés';
    document.getElementById('progressPct').textContent = pct + '%';
  }

  /* ── Venn ── */
  const vennData = {
    ia: {
      title: 'Intelligence Artificielle',
      text: 'Discipline informatique visant à reproduire les capacités cognitives humaines. Domaine englobant — tout ce qui simule de l\'intelligence entre ici. En géosciences : systèmes experts, optimisation, reconnaissance de formes.'
    },
    ml: {
      title: 'Machine Learning',
      text: 'Sous-domaine de l\'IA. Le modèle apprend automatiquement des patterns depuis les données, sans règles explicites programmées. En géosciences : prédiction de teneurs, classification lithologique, détection d\'anomalies géochimiques. Algorithmes : Random Forest, XGBoost, SVM.'
    },
    dl: {
      title: 'Deep Learning',
      text: 'Branche du ML utilisant des réseaux neuronaux profonds (10+ couches). Excelle sur les données visuelles volumineuses. En géosciences : analyse d\'images satellite, reconnaissance de patterns sur carottes, interprétation de données sismiques 3D. Nécessite GPU et grandes quantités de données.'
    }
  };

  function showVenn(type) {
    const d = vennData[type];
    document.getElementById('vennInfo').innerHTML =
      '<h4>' + d.title + '</h4><p>' + d.text + '</p>';
    ['ia','ml','dl'].forEach(t => document.getElementById('vc-' + t).classList.remove('selected'));
    document.getElementById('vc-' + type).classList.add('selected');
  }

  /* ── Tool selector ── */
  function selectTool(btn, tool, name, why) {
    document.querySelectorAll('.ts-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('toolName').textContent = '→ ' + name;
    document.getElementById('toolWhy').textContent = why;
    document.getElementById('toolResult').classList.add('visible');
  }

  /* ── Quiz ── */
  let answeredCount = 0;
  function answer(opt, correct, feedback) {
    const parent = opt.closest('.quiz-q');
    if (parent.querySelector('.correct, .wrong')) return;
    opt.classList.add(correct ? 'correct' : 'wrong');
    if (!correct) {
      [...parent.querySelectorAll('.quiz-opt')].find(o => {
        return o.getAttribute('onclick') && o.getAttribute('onclick').includes('true');
      })?.classList.add('correct');
    }
    parent.querySelectorAll('.quiz-opt').forEach(o => o.classList.add('disabled'));
    const fb = parent.querySelector('.quiz-feedback');
    fb.textContent = feedback;
    fb.classList.add('visible');
    if (correct) answeredCount++;
    if (parent.closest('.quiz-wrap').querySelectorAll('.correct').length === 5) {
      document.getElementById('finalMsg').style.display = 'block';
      completed.add('s7');
      updateProgress();
    }
  }

  /* ── Copy code ── */
  function copyCode(btn) {
    const pre = btn.closest('.code-block').querySelector('pre');
    navigator.clipboard.writeText(pre.innerText).then(() => {
      btn.textContent = 'Copié ✓';
      setTimeout(() => { btn.textContent = 'Copier'; }, 2000);
    });
  }

  updateProgress();
</script>
</body>
</html>
