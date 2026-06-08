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

  // Fix the bad replacements
  content = content.replace(/dark:text-slate-4000/g, 'dark:text-slate-500');

  // Also replace some overly bright brand text colors.
  // We did `dark:text-brand` -> `dark:text-brand/80`.
  // Wait, did we do anything else bad?
  // `replace(/dark:text-slate-100/g, 'dark:text-slate-400')` - if we had `dark:text-slate-1000` (which doesn't exist) it would be bad, but it does not.
  
  // `replace(/dark:border-slate-500/g, 'dark:border-slate-700')` -> any 5000? No, there is no 5000.
  // Let me just restore dark:text-slate-4000 back to 500
  // And did I replace dark:border-slate-50 with 400? I didn't replace border-slate-50.

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed broken text class names');
