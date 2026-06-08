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

  // Fix tailwind classes
  content = content.replace(/dark:text-slate-455/g, 'dark:text-slate-400')
                   .replace(/dark:bg-slate-805/g, 'dark:bg-slate-800')
                   .replace(/dark:bg-slate-855/g, 'dark:bg-slate-800')
                   .replace(/dark:bg-slate-755/g, 'dark:bg-slate-700')
                   .replace(/dark:bg-[a-zA-Z]+-955/g, 'dark:bg-slate-900'); // Some weird -955 matches

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed broken tailwind classes');
