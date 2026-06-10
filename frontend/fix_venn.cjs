const fs = require('fs');

let file = 'C:/Users/alber/Documents/GitHub/CEGA_E_Learning/frontend/src/components/LessonIA_Geo_S1.tsx';
let content = fs.readFileSync(file, 'utf8');

let newVenn = `<div class="venn-wrap">
      <div class="venn-label">Diagramme interactif</div>
      <div style="position: relative; height: 170px; max-width: 340px; margin: 0 auto 20px;">
        <div class="venn-circle vc-ia" id="vc-ia" >
          <span style="position:absolute; left:14px; top:14px; font-size:11px; color: #79C0FF;">IA</span>
        </div>
        <div class="venn-circle vc-ml" id="vc-ml" >
          <span style="position:absolute; left:20px; top:20px; font-size:11px; color: #7EE787;">ML</span>
        </div>
        <div class="venn-circle vc-dl" id="vc-dl" >
          <span style="position:absolute; left:26px; top:30px; font-size:11px; color: #D2A8FF;">DL</span>
        </div>
      </div>
      <div class="venn-info" id="vennInfo">`;

content = content.replace(/<div class="venn-wrap">[\s\S]*?<div class="venn-info" id="vennInfo">/, newVenn);

fs.writeFileSync(file, content);
console.log('Venn fixed');
