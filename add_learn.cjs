const fs = require('fs');
const path = 'src/App.jsx';
let text = fs.readFileSync(path, 'utf8');
const search = '                          <Typography variant="body2" color="text.secondary">\n                            Més angle d\'atac (a) ? més càrrega, però també més drag induït (creix amb el quadrat de C<sub>L</sub>).\n                          </Typography>\n';
const addition = '                          <Typography variant="body2" color="text.secondary">\n                            <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>\n                            <sub>L0</sub>: valor base, pendent: variació de <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>\n                            <sub>L</sub> amb l\'angle,\n                            <Typography component="span" sx={{ fontStyle: "italic" }}>a</Typography>: angle d\'atac,\n                            <Typography component="span" sx={{ fontStyle: "italic" }}>C</Typography>\n                            <sub>D0</sub>: drag base i\n                            <Typography component="span" sx={{ fontStyle: "italic" }}>k</Typography>: factor d\'eficiència induïda.\n                          </Typography>\n';
if (!text.includes(search)) {
  console.error('search string not found');
  process.exit(1);
}
text = text.replace(search, search + addition);
fs.writeFileSync(path, text);
