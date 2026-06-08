const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const matches = content.match(/dark:bg-[a-zA-Z0-9-/]+/g) || [];
const unique = [...new Set(matches)];
console.log(unique);
