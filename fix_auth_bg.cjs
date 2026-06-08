const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix Auth Root Cards dark background
content = content.replace(
  'max-w-md bg-white/95 border border-slate-200', 
  'max-w-md bg-white/95 dark:bg-slate-900 border border-slate-200'
);

content = content.replace(
  'bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-xl flex flex-col items-center justify-center relative dark:bg-slate-900 dark:border-slate-800',
  'bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-xl flex flex-col items-center justify-center relative dark:bg-slate-900 dark:border-slate-800'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed auth root bg');
