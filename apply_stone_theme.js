const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk('src', (err, results) => {
  if (err) throw err;
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    const replacements = [
      [/bg-zinc-950/g, 'bg-stone-50'],
      [/bg-zinc-900/g, 'bg-white'],
      [/border-zinc-800\/50/g, 'border-stone-200'],
      [/border-zinc-800/g, 'border-stone-300'],
      [/text-zinc-300/g, 'text-stone-600'],
      [/text-zinc-400/g, 'text-stone-500'],
      [/text-zinc-500/g, 'text-stone-400'],
      [/bg-black/g, 'bg-stone-900'],
      [/hover:bg-zinc-950/g, 'hover:bg-stone-800'],
      [/fill-yellow-500/g, 'fill-stone-900'],
      [/ring-yellow-500/g, 'ring-stone-900'],
      [/bg-zinc-800/g, 'bg-stone-100'],
      [/bg-zinc-700/g, 'bg-stone-200'],
      [/bg-red-950\/30/g, 'bg-red-50'],
      [/text-red-400/g, 'text-red-600'],
      [/border-red-900\/50/g, 'border-red-100'],
      [/bg-emerald-950\/30/g, 'bg-emerald-50'],
      [/text-emerald-400/g, 'text-emerald-600'],
      [/border-emerald-900\/50/g, 'border-emerald-100'],
      // The tricky one: text-yellow-500 was both text-zinc-900 and text-white
      [/text-yellow-500/g, 'text-stone-900']
    ];

    let newContent = content;
    replacements.forEach(([regex, replacement]) => {
      newContent = newContent.replace(regex, replacement);
    });

    // Fix button texts that became text-stone-900 instead of white
    newContent = newContent.replace(/bg-stone-900([^"'`]*?)text-stone-900/g, 'bg-stone-900$1text-white');
    newContent = newContent.replace(/text-stone-900([^"'`]*?)bg-stone-900/g, 'text-white$1bg-stone-900');

    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Updated:', file);
    }
  });
});
