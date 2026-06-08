const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const matchesBg = content.match(/dark:bg-slate-\d+/g) || [];
console.log('Background depth classes:', [...new Set(matchesBg)]);

const matchesText = content.match(/dark:text-slate-\d+|dark:text-white/g) || [];
console.log('Text depth classes:', [...new Set(matchesText)]);

const matchesBorder = content.match(/dark:border-slate-\d+/g) || [];
console.log('Border depth classes:', [...new Set(matchesBorder)]);
