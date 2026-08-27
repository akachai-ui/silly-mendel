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
    
    // Convert to Modern SaaS Standard (Slate + Indigo)
    let newContent = content;
    
    // 1. Change all neutral grays to 'slate' (cooler, more modern premium feel)
    newContent = newContent.replace(/zinc/g, 'slate');
    
    // 2. Change the solid black/dark accents to Indigo-600 (Primary Brand Color)
    newContent = newContent.replace(/bg-slate-900/g, 'bg-indigo-600');
    newContent = newContent.replace(/hover:bg-slate-800/g, 'hover:bg-indigo-700');
    newContent = newContent.replace(/ring-slate-900/g, 'ring-indigo-600');
    newContent = newContent.replace(/fill-slate-900/g, 'fill-indigo-600');
    
    // 3. For selected/active text states that used black, let's make them Indigo
    newContent = newContent.replace(/text-slate-900 scale-105/g, 'text-indigo-700 scale-105');

    // 4. Update the TopLoader color in layout.tsx if present
    if (file.endsWith('layout.tsx')) {
      newContent = newContent.replace(/#18181b/g, '#4f46e5'); // indigo-600 hex
    }

    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Updated to Standard Premium SaaS:', file);
    }
  });
});
