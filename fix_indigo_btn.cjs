const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'dark:text-brand/80-hover font-black',
  'dark:text-brand/80 dark:hover:text-brand font-black'
);
content = content.replace(
  'className="w-full bg-indigo-50/50 hover:bg-indigo-50 text-brand dark:text-brand/80 dark:hover:text-brand font-black text-xs py-2.5 px-4 rounded-lg uppercase tracking-wider transition-all border border-dashed border-brand/40 hover:border-brand flex items-center justify-center gap-2 cursor-pointer shadow-xs"',
  'className="w-full bg-indigo-50/50 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-brand dark:text-brand/80 dark:hover:text-brand font-black text-xs py-2.5 px-4 rounded-lg uppercase tracking-wider transition-all border border-dashed border-brand/40 hover:border-brand flex items-center justify-center gap-2 cursor-pointer shadow-xs"'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed btn class');
