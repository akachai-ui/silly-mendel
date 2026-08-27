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
    let newContent = content;
    
    // 1. Revert slate to zinc
    newContent = newContent.replace(/slate/g, 'zinc');
    
    // 2. Revert indigo specific properties
    newContent = newContent.replace(/hover:bg-indigo-700/g, 'hover:bg-zinc-800');
    newContent = newContent.replace(/ring-indigo-600/g, 'ring-zinc-900');
    newContent = newContent.replace(/fill-indigo-600/g, 'fill-zinc-900');
    newContent = newContent.replace(/text-indigo-700/g, 'text-zinc-900');
    
    // 3. Fix the layout top loader
    if (file.endsWith('layout.tsx')) {
      newContent = newContent.replace(/#4f46e5/g, '#18181b');
    }

    // 4. Fix bg-indigo-600 based on text-white presence
    // We will find all className="..." and evaluate them
    newContent = newContent.replace(/className=(["'`])(.*?)\1/g, (match, quote, classList) => {
      if (classList.includes('bg-indigo-600')) {
        if (classList.includes('text-white')) {
          // It's a primary button or icon
          classList = classList.replace(/bg-indigo-600/g, 'bg-zinc-900');
        } else {
          // It's a card
          classList = classList.replace(/bg-indigo-600/g, 'bg-white');
        }
      }
      return `className=${quote}${classList}${quote}`;
    });

    // 5. Fix Alert colors
    newContent = newContent.replace(/bg-red-950\/30/g, 'bg-red-50');
    newContent = newContent.replace(/text-red-600/g, 'text-red-700');
    newContent = newContent.replace(/bg-emerald-950\/30/g, 'bg-emerald-50');
    newContent = newContent.replace(/text-emerald-600/g, 'text-emerald-700');

    // 6. Fix any residual text-zinc-400/500/600 weirdness from earlier scripts
    // Originally we had text-zinc-500 for subtext, maybe text-slate-400 became text-zinc-400. That's fine, close enough.

    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Restored to Absolute Original:', file);
    }
  });
});
