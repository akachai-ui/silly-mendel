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
    
    // Reverse mapping from stone back to original zinc
    const replacements = [
      [/border-stone-200/g, 'border-zinc-100'],
      [/border-stone-300/g, 'border-zinc-200'],
      [/stone/g, 'zinc'] // Bulk change the rest: bg-stone-50 -> bg-zinc-50, etc.
    ];

    let newContent = content;
    replacements.forEach(([regex, replacement]) => {
      newContent = newContent.replace(regex, replacement);
    });

    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Updated:', file);
    }
  });
});
