import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rename = promisify(fs.rename);

async function findJsFiles(dir) {
  const files = await readdir(dir);
  const jsFiles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await stat(filePath);

    if (stats.isDirectory()) {
      const subDirFiles = await findJsFiles(filePath);
      jsFiles.push(...subDirFiles);
    } else if (file.endsWith('.js')) {
      // Only include .js files that are likely React components
      const content = fs.readFileSync(filePath, 'utf8');
      // Check if file contains JSX syntax or imports React
      if (content.includes('import React') || content.includes('from "react"') || 
          content.includes('<') && content.includes('/>') ||
          content.includes('export default')) {
        jsFiles.push(filePath);
      }
    }
  }

  return jsFiles;
}

async function renameJsToJsx() {
  console.log('Finding JS files with JSX content...');
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  const jsFiles = await findJsFiles(componentsDir);

  console.log(`Found ${jsFiles.length} JS files to rename to JSX`);

  for (const jsFile of jsFiles) {
    const jsxFile = jsFile.replace('.js', '.jsx');
    
    try {
      // Check if the JSX file already exists
      if (fs.existsSync(jsxFile)) {
        console.log(`File ${jsxFile} already exists, removing original .js file`);
        fs.unlinkSync(jsFile);
      } else {
        console.log(`Renaming ${jsFile} to ${jsxFile}`);
        await rename(jsFile, jsxFile);
      }
    } catch (error) {
      console.error(`Error processing ${jsFile}:`, error);
    }
  }

  console.log('Done renaming files!');
}

renameJsToJsx().catch(console.error); 