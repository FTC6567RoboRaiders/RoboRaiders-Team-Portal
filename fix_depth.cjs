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

  // Regex to find className strings
  content = content.replace(/(?:className=|className \+= |class |className \? |className: |className \? |`)(["'`])(.*?)\1/g, (match, quote, classes) => {
    
    // First, strip ALL existing dark:slate- and dark:white classes to start clean
    let newClasses = classes
      .replace(/dark:bg-slate-\d+(?:\/\d+)?/g, '')
      .replace(/dark:text-white/g, '')
      .replace(/dark:text-slate-\d+(?:\/\d+)?/g, '')
      .replace(/dark:border-slate-\d+(?:\/\d+)?/g, '')
      .replace(/dark:hover:bg-slate-\d+(?:\/\d+)?/g, '')
      .replace(/dark:hover:text-white/g, '')
      .replace(/dark:hover:text-slate-\d+(?:\/\d+)?/g, '');

    // Now, let's parse the classes to find the light variants and append dark variants.
    const classList = newClasses.split(/\s+/).filter(Boolean);
    const addedDarkClasses = [];

    // Backgrounds
    if (classList.includes('bg-white')) addedDarkClasses.push('dark:bg-slate-900');
    else if (classList.includes('bg-slate-50')) addedDarkClasses.push('dark:bg-slate-800');
    else if (classList.includes('bg-slate-100')) addedDarkClasses.push('dark:bg-slate-800');
    else if (classList.includes('bg-slate-150')) addedDarkClasses.push('dark:bg-slate-700');
    else if (classList.includes('bg-slate-200')) addedDarkClasses.push('dark:bg-slate-700');
    else if (classList.includes('bg-slate-250')) addedDarkClasses.push('dark:bg-slate-600');
    else if (classList.includes('bg-slate-800') || classList.includes('bg-slate-900')) addedDarkClasses.push('dark:bg-slate-200'); // Assuming inverted button

    // Text
    if (classList.includes('text-slate-900') || classList.includes('text-slate-950') || classList.includes('text-slate-850')) addedDarkClasses.push('dark:text-slate-50');
    else if (classList.includes('text-slate-800') || classList.includes('text-slate-750')) addedDarkClasses.push('dark:text-slate-100');
    else if (classList.includes('text-slate-700') || classList.includes('text-slate-650')) addedDarkClasses.push('dark:text-slate-300');
    else if (classList.includes('text-slate-600') || classList.includes('text-slate-550')) addedDarkClasses.push('dark:text-slate-300');
    else if (classList.includes('text-slate-500') || classList.includes('text-slate-450')) addedDarkClasses.push('dark:text-slate-400');
    else if (classList.includes('text-slate-400')) addedDarkClasses.push('dark:text-slate-500');

    // Borders
    if (classList.includes('border-slate-100')) addedDarkClasses.push('dark:border-slate-800');
    else if (classList.includes('border-slate-200')) addedDarkClasses.push('dark:border-slate-700');
    else if (classList.includes('border-slate-250')) addedDarkClasses.push('dark:border-slate-600');
    else if (classList.includes('border-slate-300')) addedDarkClasses.push('dark:border-slate-600');
    else if (classList.includes('border-slate-400')) addedDarkClasses.push('dark:border-slate-500');

    // Hover Backgrounds
    if (classList.includes('hover:bg-slate-50')) addedDarkClasses.push('dark:hover:bg-slate-800');
    else if (classList.includes('hover:bg-slate-100')) addedDarkClasses.push('dark:hover:bg-slate-700');
    else if (classList.includes('hover:bg-slate-200')) addedDarkClasses.push('dark:hover:bg-slate-600');
    else if (classList.includes('hover:bg-slate-300')) addedDarkClasses.push('dark:hover:bg-slate-500');

    // Hover Text
    if (classList.includes('hover:text-slate-900')) addedDarkClasses.push('dark:hover:text-white');
    else if (classList.includes('hover:text-slate-800')) addedDarkClasses.push('dark:hover:text-slate-100');

    // Reconstruct
    const finalClasses = [...classList, ...addedDarkClasses].join(' ').trim();
    
    // We only swap if there's an actual match and we extracted something, 
    // ensuring we don't accidentally remove things like dark:text-cyan-500 which is ignored here
    return match.replace(classes, finalClasses);
  });

  // Also replace some complex opacities manually if missing
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Restored depth based on light theme equivalents');
