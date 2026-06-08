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

  // Remove the inverted header backgrounds
  content = content.replace(/dark:bg-slate-200/g, 'dark:bg-slate-950');
  
  // Also turn down the intensity of text colors in dark mode.
  // The user probably found dark:text-white or dark:text-slate-50 overpowering.
  content = content.replace(/dark:text-white/g, 'dark:text-slate-300')
                   .replace(/dark:text-slate-50/g, 'dark:text-slate-400')
                   .replace(/dark:text-slate-100/g, 'dark:text-slate-400');

  // Tone down some of the solid brand colors in dark mode inside borders or text
  content = content.replace(/dark:text-brand/g, 'dark:text-brand/80')
                   .replace(/dark:border-brand/g, 'dark:border-brand/50')
                   .replace(/dark:bg-brand/g, 'dark:bg-brand/60');
                   
  // Check if we need to tone down backgrounds specifically
  content = content.replace(/dark:bg-slate-700/g, 'dark:bg-slate-800')
                   .replace(/dark:bg-slate-600/g, 'dark:bg-slate-800');

  // Borders
  content = content.replace(/dark:border-slate-500/g, 'dark:border-slate-700')
                   .replace(/dark:border-slate-600/g, 'dark:border-slate-700')
                   .replace(/dark:border-slate-700/g, 'dark:border-slate-800');

  // Re-adjust some nested logic if needed
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed headers and toned down colors');
