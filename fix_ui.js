const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace font-mono with font-sans
  content = content.replace(/font-mono/g, 'font-sans tracking-wide');
  
  // Replace Informes blue theme
  // text-blue-300 -> text-primary-light
  content = content.replace(/text-blue-300/g, 'text-primary-light');
  content = content.replace(/text-blue-400/g, 'text-primary-main');
  content = content.replace(/bg-blue-900\/20/g, 'bg-primary-dark/20');
  content = content.replace(/bg-blue-900\/30/g, 'bg-primary-dark/30');
  content = content.replace(/border-blue-400/g, 'border-primary-light');
  content = content.replace(/border-blue-600\/20/g, 'border-primary-light/20');

  // Replace Tótem cyan
  content = content.replace(/focus:border-cyan-400\/70/g, 'focus:border-primary-light/70');
  content = content.replace(/text-cyan-300/g, 'text-primary-light');
  
  // Replace Teleradiologia indigo
  content = content.replace(/text-indigo-400/g, 'text-primary-light');
  content = content.replace(/text-indigo-300/g, 'text-primary-light');
  content = content.replace(/bg-indigo-500\/10/g, 'bg-primary-light/10');
  content = content.replace(/bg-indigo-900\/30/g, 'bg-primary-dark/30');
  content = content.replace(/border-indigo-500\/20/g, 'border-primary-light/20');
  content = content.replace(/border-indigo-600\/20/g, 'border-primary-light/20');

  // Replace Informes -> Diario weird colors (purple, etc)
  content = content.replace(/text-purple-300/g, 'text-primary-light');
  content = content.replace(/text-purple-400/g, 'text-primary-light');
  content = content.replace(/bg-purple-900\/30/g, 'bg-primary-dark/30');
  content = content.replace(/border-purple-600\/20/g, 'border-primary-light/20');
  
  content = content.replace(/text-teal-300/g, 'text-primary-light');
  content = content.replace(/text-teal-400/g, 'text-primary-light');
  content = content.replace(/bg-teal-900\/30/g, 'bg-primary-dark/30');
  content = content.replace(/border-teal-600\/20/g, 'border-primary-light/20');

  fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      replaceInFile(filePath);
    }
  }
}

walkDir('./src/RisWorklist');
console.log('Done replacing strings.');
