const fs = require('fs');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // We want to improve contrast heavily, especially text.
  content = content.replace(/dark:bg-slate-950\/(\d+)/g, 'dark:bg-slate-900/$1'); // preserve opacity
  content = content.replace(/dark:bg-slate-950/g, 'dark:bg-slate-900') // main backgrounds lighter
                   .replace(/dark:bg-slate-955/g, 'dark:bg-slate-900')
                   .replace(/dark:bg-slate-905\/(\d+)/g, 'dark:bg-slate-800/$1')
                   .replace(/dark:bg-slate-905/g, 'dark:bg-slate-800')
                   .replace(/dark:bg-slate-900\/(\d+)/g, 'dark:bg-slate-800/$1')
                   .replace(/dark:bg-slate-900/g, 'dark:bg-slate-800')
                   .replace(/dark:bg-slate-850\/(\d+)/g, 'dark:bg-slate-700/$1')
                   .replace(/dark:bg-slate-850/g, 'dark:bg-slate-700')
                   .replace(/dark:bg-slate-800\/(\d+)/g, 'dark:bg-slate-700/$1')
                   .replace(/dark:bg-slate-800/g, 'dark:bg-slate-700');

  // Text: make text brighter and more readable
  content = content.replace(/dark:text-slate-600/g, 'dark:text-slate-300')
                   .replace(/dark:text-slate-650/g, 'dark:text-slate-300')
                   .replace(/dark:text-slate-550/g, 'dark:text-slate-200')
                   .replace(/dark:text-slate-505/g, 'dark:text-slate-300')
                   .replace(/dark:text-slate-500/g, 'dark:text-slate-300')
                   .replace(/dark:text-slate-450/g, 'dark:text-slate-200')
                   .replace(/dark:text-slate-400/g, 'dark:text-slate-200')
                   .replace(/dark:text-slate-350/g, 'dark:text-slate-100')
                   .replace(/dark:text-slate-300/g, 'dark:text-slate-100')
                   .replace(/dark:text-slate-200/g, 'dark:text-slate-50')
                   .replace(/dark:text-slate-100/g, 'dark:text-white');
  
  // Borders: make borders subtle but visible
  content = content.replace(/dark:border-slate-900\/(\d+)/g, 'dark:border-slate-700/$1')
                   .replace(/dark:border-slate-900/g, 'dark:border-slate-700')
                   .replace(/dark:border-slate-850\/(\d+)/g, 'dark:border-slate-600/$1')
                   .replace(/dark:border-slate-850/g, 'dark:border-slate-600')
                   .replace(/dark:border-slate-800\/(\d+)/g, 'dark:border-slate-600/$1')
                   .replace(/dark:border-slate-800/g, 'dark:border-slate-600')
                   .replace(/dark:border-slate-750\/(\d+)/g, 'dark:border-slate-500/$1')
                   .replace(/dark:border-slate-750/g, 'dark:border-slate-500')
                   .replace(/dark:border-slate-700\/(\d+)/g, 'dark:border-slate-600/$1')
                   .replace(/dark:border-slate-700/g, 'dark:border-slate-600');

  // Neutralize hover backgrounds
  content = content.replace(/dark:hover:bg-slate-900/g, 'dark:hover:bg-slate-700')
                   .replace(/dark:hover:bg-slate-800/g, 'dark:hover:bg-slate-600')
                   .replace(/dark:hover:bg-slate-750/g, 'dark:hover:bg-slate-600')
                   .replace(/dark:hover:bg-slate-700/g, 'dark:hover:bg-slate-500');

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Replacements complete');
